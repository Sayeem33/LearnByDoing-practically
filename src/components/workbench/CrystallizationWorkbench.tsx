'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import Card from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Snowflake, Thermometer } from 'lucide-react';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const CAPTURE_INTERVAL = 100;

// Crystal types
const CRYSTAL_TYPES: Record<string, {
  name: string;
  formula: string;
  color: string;
  shape: 'cubic' | 'hexagonal' | 'needle' | 'rhombic';
  growthRate: number;
  saturationTemp: number;
}> = {
  nacl: {
    name: 'Sodium Chloride',
    formula: 'NaCl',
    color: '#ffffff',
    shape: 'cubic',
    growthRate: 1.0,
    saturationTemp: 60,
  },
  cuso4: {
    name: 'Copper Sulfate',
    formula: 'CuSO₄·5H₂O',
    color: '#3b82f6',
    shape: 'rhombic',
    growthRate: 1.2,
    saturationTemp: 55,
  },
  alum: {
    name: 'Potassium Alum',
    formula: 'KAl(SO₄)₂·12H₂O',
    color: '#f0f0f0',
    shape: 'hexagonal',
    growthRate: 0.8,
    saturationTemp: 50,
  },
  sugar: {
    name: 'Sugar (Sucrose)',
    formula: 'C₁₂H₂₂O₁₁',
    color: '#fef3c7',
    shape: 'needle',
    growthRate: 0.6,
    saturationTemp: 65,
  },
};

interface Crystal {
  x: number;
  y: number;
  size: number;
  rotation: number;
  growthRate: number;
  opacity: number;
}

interface CrystallizationState {
  temperature: number;
  saturation: number;
  crystalCount: number;
  totalMass: number;
  time: number;
}

export default function CrystallizationWorkbench({
  initialSnapshot,
  onSnapshotChange,
}: WorkbenchPersistenceProps<any>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData, startCapture, stopCapture } = useDataStream({
    captureInterval: CAPTURE_INTERVAL,
    initialDataPoints: initialSnapshot?.dataPoints || [],
  });

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(initialSnapshot?.time || 0);
  const [crystalType, setCrystalType] = useState<string>(initialSnapshot?.crystalType || 'cuso4');
  const [coolingRate, setCoolingRate] = useState(initialSnapshot?.coolingRate || 0.5); // °C per second
  const [initialConcentration, setInitialConcentration] = useState(initialSnapshot?.initialConcentration || 1.5); // Supersaturation ratio

  const [state, setState] = useState<CrystallizationState>(() => initialSnapshot?.state || {
    temperature: 80,
    saturation: 150,
    crystalCount: 0,
    totalMass: 0,
    time: 0,
  });

  const [crystals, setCrystals] = useState<Crystal[]>(() => initialSnapshot?.crystals || []);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const skipInitialSetupRef = useRef(Boolean(initialSnapshot));

  // Draw crystal shape
  const drawCrystal = useCallback((
    ctx: CanvasRenderingContext2D,
    crystal: Crystal,
    type: typeof CRYSTAL_TYPES[string]
  ) => {
    ctx.save();
    ctx.translate(crystal.x, crystal.y);
    ctx.rotate(crystal.rotation);
    ctx.globalAlpha = crystal.opacity;

    const s = crystal.size;
    ctx.fillStyle = type.color;
    ctx.strokeStyle = type.color === '#ffffff' ? '#d1d5db' : type.color;
    ctx.lineWidth = 1;

    switch (type.shape) {
      case 'cubic':
        // Draw cube-like crystal
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.6);
        ctx.lineTo(0, -s);
        ctx.lineTo(s, -s * 0.6);
        ctx.lineTo(s, s * 0.4);
        ctx.lineTo(0, s);
        ctx.lineTo(-s, s * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Add 3D effect
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(0, 0);
        ctx.moveTo(-s, -s * 0.6);
        ctx.lineTo(0, 0);
        ctx.moveTo(s, -s * 0.6);
        ctx.lineTo(0, 0);
        ctx.stroke();
        break;

      case 'hexagonal':
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = Math.cos(angle) * s;
          const y = Math.sin(angle) * s;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Center lines
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const angle = (i * Math.PI) / 3;
          ctx.moveTo(Math.cos(angle) * s, Math.sin(angle) * s);
          ctx.lineTo(Math.cos(angle + Math.PI) * s, Math.sin(angle + Math.PI) * s);
        }
        ctx.stroke();
        break;

      case 'needle':
        ctx.beginPath();
        ctx.moveTo(0, -s * 2);
        ctx.lineTo(s * 0.3, 0);
        ctx.lineTo(0, s * 2);
        ctx.lineTo(-s * 0.3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'rhombic':
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.8, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.8, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Internal lines
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(0, s);
        ctx.moveTo(-s * 0.8, 0);
        ctx.lineTo(s * 0.8, 0);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }, []);

  // Initialize state
  const initializeState = useCallback(() => {
    setState({
      temperature: 80,
      saturation: initialConcentration * 100,
      crystalCount: 0,
      totalMass: 0,
      time: 0,
    });
    setCrystals([]);
  }, [initialConcentration]);

  // Initialize on mount
  useEffect(() => {
    if (skipInitialSetupRef.current) {
      skipInitialSetupRef.current = false;
      return;
    }

    if (!running) {
      initializeState();
    }
  }, [running, crystalType, initialConcentration, initializeState]);

  useEffect(() => {
    onSnapshotChange?.({
      time,
      crystalType,
      coolingRate,
      initialConcentration,
      state,
      crystals,
      dataPoints,
    });
  }, [onSnapshotChange, time, crystalType, coolingRate, initialConcentration, state, crystals, dataPoints]);

  // Simulation loop
  useEffect(() => {
    if (!running) return;

    const crystalTypeData = CRYSTAL_TYPES[crystalType];

    const simulate = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const dt = Math.min((timestamp - lastUpdateRef.current) / 1000, 0.1);
      lastUpdateRef.current = timestamp;

      setState(prev => {
        // Cool down
        const newTemp = Math.max(20, prev.temperature - coolingRate * dt);
        
        // Calculate supersaturation
        const solubility = crystalTypeData.saturationTemp + (newTemp - 20) * 0.8;
        const currentSaturation = Math.max(0, prev.saturation);
        const supersaturation = currentSaturation / solubility;

        // Nucleation probability increases with supersaturation
        let newCrystals = [...crystals];
        let newMass = prev.totalMass;

        // Nucleation (new crystal formation)
        if (supersaturation > 1.05 && newTemp < 60 && Math.random() < (supersaturation - 1) * 0.1 * dt) {
          const beakerLeft = 250;
          const beakerRight = 550;
          const beakerBottom = 400;
          const waterTop = 180;

          newCrystals.push({
            x: beakerLeft + 20 + Math.random() * (beakerRight - beakerLeft - 40),
            y: waterTop + 50 + Math.random() * (beakerBottom - waterTop - 80),
            size: 3,
            rotation: Math.random() * Math.PI * 2,
            growthRate: crystalTypeData.growthRate * (0.8 + Math.random() * 0.4),
            opacity: 0.5 + Math.random() * 0.5,
          });
        }

        // Crystal growth
        if (supersaturation > 1 && newCrystals.length > 0) {
          const growthAmount = (supersaturation - 1) * 0.5 * dt * crystalTypeData.growthRate;
          newCrystals = newCrystals.map(c => ({
            ...c,
            size: Math.min(c.size + c.growthRate * growthAmount, 25),
            opacity: Math.min(1, c.opacity + 0.05 * dt),
          }));
          
          // Mass increases as crystals grow
          newMass = newCrystals.reduce((sum, c) => sum + c.size * c.size * 0.01, 0);
        }

        // Saturation decreases as crystals grow
        const saturationDecrease = newCrystals.length > 0 ? 
          newCrystals.reduce((sum, c) => sum + c.size * 0.01, 0) * dt : 0;
        const newSaturation = Math.max(0, currentSaturation - saturationDecrease);

        setCrystals(newCrystals);

        return {
          temperature: newTemp,
          saturation: newSaturation,
          crystalCount: newCrystals.length,
          totalMass: newMass,
          time: prev.time + dt,
        };
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running, crystalType, coolingRate, crystals]);

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drawAnimationRef: number;
    const crystalTypeData = CRYSTAL_TYPES[crystalType];

    const draw = () => {
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Crystal Growth - Controlled Crystallization', CANVAS_WIDTH / 2, 30);
      ctx.font = '12px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(`${crystalTypeData.name} (${crystalTypeData.formula})`, CANVAS_WIDTH / 2, 50);

      // Draw beaker
      ctx.fillStyle = 'rgba(147, 197, 253, 0.3)';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;

      // Beaker shape
      ctx.beginPath();
      ctx.moveTo(250, 120);
      ctx.lineTo(240, 400);
      ctx.lineTo(560, 400);
      ctx.lineTo(550, 120);
      ctx.closePath();
      ctx.stroke();

      // Solution
      const solutionOpacity = Math.min(0.6, state.saturation / 100 * 0.4);
      ctx.fillStyle = crystalTypeData.color === '#ffffff' 
        ? `rgba(200, 200, 200, ${solutionOpacity})`
        : crystalTypeData.color.replace(')', `, ${solutionOpacity})`).replace('rgb', 'rgba');
      
      ctx.beginPath();
      ctx.moveTo(243, 180);
      ctx.lineTo(240, 397);
      ctx.lineTo(560, 397);
      ctx.lineTo(557, 180);
      ctx.closePath();
      ctx.fill();

      // Draw crystals
      crystals.forEach(crystal => {
        drawCrystal(ctx, crystal, crystalTypeData);
      });

      // Seed crystal at bottom (if nucleation started)
      if (crystals.length > 0) {
        ctx.fillStyle = crystalTypeData.color;
        ctx.beginPath();
        ctx.arc(400, 390, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Thermometer
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      
      // Bulb
      ctx.beginPath();
      ctx.arc(620, 380, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Mercury in bulb
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(620, 380, 10, 0, Math.PI * 2);
      ctx.fill();

      // Tube
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(615, 150, 10, 230);
      ctx.strokeRect(615, 150, 10, 230);

      // Mercury level
      const mercuryHeight = ((state.temperature - 20) / 80) * 200;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(617, 380 - mercuryHeight, 6, mercuryHeight);

      // Temperature labels
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('100°C', 635, 155);
      ctx.fillText('60°C', 635, 230);
      ctx.fillText('20°C', 635, 380);

      // Current temperature
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`${state.temperature.toFixed(1)}°C`, 600, 420);

      // Cooling indicator
      if (running && state.temperature > 25) {
        ctx.fillStyle = '#60a5fa';
        ctx.font = '12px Arial';
        ctx.fillText('↓ Cooling', 595, 440);
      }

      // Info panel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(20, 80, 200, 180, 10);
      ctx.fill();
      ctx.strokeStyle = crystalTypeData.color === '#ffffff' ? '#6b7280' : crystalTypeData.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('📊 Crystallization Data', 35, 105);
      
      ctx.font = '11px Arial';
      ctx.fillText(`Temperature: ${state.temperature.toFixed(1)}°C`, 35, 130);
      ctx.fillText(`Saturation: ${state.saturation.toFixed(1)}%`, 35, 150);
      ctx.fillText(`Crystal Count: ${state.crystalCount}`, 35, 170);
      ctx.fillText(`Total Mass: ${state.totalMass.toFixed(2)} g`, 35, 190);
      ctx.fillText(`Time: ${state.time.toFixed(1)} s`, 35, 210);
      
      // Supersaturation indicator
      const solubility = crystalTypeData.saturationTemp + (state.temperature - 20) * 0.8;
      const supersaturation = state.saturation / solubility;
      ctx.fillStyle = supersaturation > 1 ? '#22c55e' : '#6b7280';
      ctx.fillText(`Supersaturation: ${supersaturation.toFixed(2)}x`, 35, 240);

      // Crystal shape reference
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.roundRect(20, CANVAS_HEIGHT - 90, 150, 80, 8);
      ctx.fill();
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 11px Arial';
      ctx.fillText('Crystal Structure:', 30, CANVAS_HEIGHT - 70);
      ctx.font = '10px Arial';
      ctx.fillText(`Shape: ${crystalTypeData.shape}`, 30, CANVAS_HEIGHT - 52);
      
      // Draw shape preview
      drawCrystal(ctx, { x: 130, y: CANVAS_HEIGHT - 40, size: 15, rotation: 0, growthRate: 1, opacity: 1 }, crystalTypeData);

      drawAnimationRef = requestAnimationFrame(draw);
    };

    drawAnimationRef = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(drawAnimationRef);
    };
  }, [crystals, state, crystalType, drawCrystal]);

  // Data capture
  const lastCapturedTime = useRef<number>(-1);

  useEffect(() => {
    if (!running) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    if (elapsed - lastCapturedTime.current >= CAPTURE_INTERVAL / 1000) {
      lastCapturedTime.current = elapsed;
      setTime(elapsed);

      capture({
        time: parseFloat(elapsed.toFixed(2)),
        temperature: parseFloat(state.temperature.toFixed(1)),
        saturation: parseFloat(state.saturation.toFixed(1)),
        crystalCount: state.crystalCount,
        totalMass: parseFloat(state.totalMass.toFixed(3)),
      });
    }
  }, [running, state, capture]);

  const handleStart = () => {
    startTimeRef.current = Date.now() - time * 1000;
    lastUpdateRef.current = 0;
    lastCapturedTime.current = -1;
    setRunning(true);
    startCapture();

    capture({
      time: parseFloat(time.toFixed(2)),
      temperature: state.temperature,
      saturation: state.saturation,
      crystalCount: state.crystalCount,
      totalMass: state.totalMass,
    });
  };

  const handleStop = () => {
    setRunning(false);
    stopCapture();
  };

  const handleReset = () => {
    setRunning(false);
    setTime(0);
    clearData();
    initializeState();
    lastCapturedTime.current = -1;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Snowflake className="text-blue-500" size={24} />
              Crystallization Experiment
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {!running ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  <Play size={18} /> Start Cooling
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                >
                  <Pause size={18} /> Stop
                </button>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
              >
                <RotateCcw size={18} /> Reset
              </button>
              <ExportBtn data={dataPoints} experimentName="crystallization" />
            </div>

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-2 border-gray-200 rounded-lg w-full"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            <p className="text-sm text-gray-600 mt-3 text-center">
              ❄️ Watch crystals form as the supersaturated solution cools down slowly
            </p>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          {/* Compound Selection */}
          <Card>
            <h3 className="font-bold text-lg mb-3 text-gray-900">🧪 Select Compound</h3>

            <div className="space-y-2">
              {Object.entries(CRYSTAL_TYPES).map(([key, compound]) => (
                <button
                  key={key}
                  onClick={() => !running && setCrystalType(key)}
                  disabled={running}
                  className={`w-full p-3 rounded-lg border-2 transition text-left ${
                    crystalType === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: compound.color }}
                    />
                    <div>
                      <div className="font-medium text-sm">{compound.name}</div>
                      <div className="text-xs text-gray-500">{compound.formula}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Parameters */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Thermometer size={16} className="text-red-500" />
              Parameters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cooling Rate: <span className="font-bold text-blue-600">{coolingRate} °C/s</span>
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.1}
                  value={coolingRate}
                  onChange={(e) => setCoolingRate(Number(e.target.value))}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Slower cooling = larger crystals</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Concentration: <span className="font-bold text-purple-600">{initialConcentration}x</span>
                </label>
                <input
                  type="range"
                  min={1.1}
                  max={2}
                  step={0.1}
                  value={initialConcentration}
                  onChange={(e) => setInitialConcentration(Number(e.target.value))}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Supersaturation ratio</p>
              </div>
            </div>
          </Card>

          {/* Theory */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📐 Theory</h3>
            <div className="space-y-2 text-xs">
              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                <div className="font-semibold text-gray-900">Supersaturation</div>
                <div className="text-gray-600">Solution holds more solute than equilibrium allows</div>
              </div>
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <div className="font-semibold text-gray-900">Nucleation</div>
                <div className="text-gray-600">Tiny crystal seeds form when supersaturation &gt; 1</div>
              </div>
              <div className="bg-purple-50 p-2 rounded border border-purple-200">
                <div className="font-semibold text-gray-900">Crystal Growth</div>
                <div className="text-gray-600">Molecules add to seed crystals in ordered patterns</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'temperature',
            xLabel: 'Time (s)',
            yLabel: 'Temperature (°C)',
            title: '📈 Temperature vs Time (Cooling Curve)',
            color: '#ef4444',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'crystalCount',
            xLabel: 'Time (s)',
            yLabel: 'Crystal Count',
            title: '📈 Crystal Formation',
            color: '#3b82f6',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'temperature',
            yKey: 'saturation',
            xLabel: 'Temperature (°C)',
            yLabel: 'Saturation (%)',
            title: '📈 Solubility Curve',
            color: '#8b5cf6',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'totalMass',
            xLabel: 'Time (s)',
            yLabel: 'Crystal Mass (g)',
            title: '📈 Total Crystal Mass',
            color: '#22c55e',
          }}
        />
      </div>
    </div>
  );
}
