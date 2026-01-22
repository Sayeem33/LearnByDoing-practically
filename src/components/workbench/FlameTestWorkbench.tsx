'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import Card from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Flame, FlaskConical } from 'lucide-react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const CAPTURE_INTERVAL = 100;

// Metal ions and their flame colors
const METALS: Record<string, { 
  name: string; 
  symbol: string;
  color: string; 
  wavelength: number;
  gradient: string[];
  description: string;
}> = {
  lithium: { 
    name: 'Lithium', 
    symbol: 'Li⁺',
    color: '#dc2626', 
    wavelength: 671,
    gradient: ['#ff6b6b', '#dc2626', '#991b1b'],
    description: 'Crimson red flame'
  },
  sodium: { 
    name: 'Sodium', 
    symbol: 'Na⁺',
    color: '#f59e0b', 
    wavelength: 589,
    gradient: ['#fef3c7', '#f59e0b', '#d97706'],
    description: 'Intense yellow flame'
  },
  potassium: { 
    name: 'Potassium', 
    symbol: 'K⁺',
    color: '#a855f7', 
    wavelength: 766,
    gradient: ['#e9d5ff', '#a855f7', '#7c3aed'],
    description: 'Lilac/violet flame'
  },
  calcium: { 
    name: 'Calcium', 
    symbol: 'Ca²⁺',
    color: '#f97316', 
    wavelength: 622,
    gradient: ['#fed7aa', '#f97316', '#ea580c'],
    description: 'Orange-red flame'
  },
  copper: { 
    name: 'Copper', 
    symbol: 'Cu²⁺',
    color: '#22c55e', 
    wavelength: 515,
    gradient: ['#bbf7d0', '#22c55e', '#16a34a'],
    description: 'Blue-green flame'
  },
  barium: { 
    name: 'Barium', 
    symbol: 'Ba²⁺',
    color: '#84cc16', 
    wavelength: 554,
    gradient: ['#ecfccb', '#84cc16', '#65a30d'],
    description: 'Apple green flame'
  },
  strontium: { 
    name: 'Strontium', 
    symbol: 'Sr²⁺',
    color: '#ef4444', 
    wavelength: 650,
    gradient: ['#fecaca', '#ef4444', '#b91c1c'],
    description: 'Red flame'
  },
};

interface FlameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export default function FlameTestWorkbench() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData, startCapture, stopCapture } = useDataStream({ captureInterval: CAPTURE_INTERVAL });

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedMetal, setSelectedMetal] = useState<string>('sodium');
  const [intensity, setIntensity] = useState(1);
  const [particles, setParticles] = useState<FlameParticle[]>([]);
  const [testHistory, setTestHistory] = useState<string[]>([]);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Generate flame particles
  const generateParticles = useCallback((count: number, metal: typeof METALS[string]) => {
    const newParticles: FlameParticle[] = [];
    const baseX = CANVAS_WIDTH / 2;
    const baseY = 380;

    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: baseX + (Math.random() - 0.5) * 40,
        y: baseY,
        vx: (Math.random() - 0.5) * 2,
        vy: -3 - Math.random() * 5,
        life: 1,
        maxLife: 40 + Math.random() * 40,
        size: 3 + Math.random() * 8,
      });
    }
    return newParticles;
  }, []);

  // Simulation loop
  useEffect(() => {
    if (!running) return;

    const simulate = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const dt = Math.min((timestamp - lastUpdateRef.current) / 1000, 0.1);
      lastUpdateRef.current = timestamp;

      const metal = METALS[selectedMetal];

      setParticles(prev => {
        let updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy - 0.05, // Slight upward acceleration
          vx: p.vx + (Math.random() - 0.5) * 0.3,
          life: p.life - 1 / p.maxLife,
          size: p.size * 0.995,
        })).filter(p => p.life > 0 && p.y > 100);

        // Add new particles
        if (Math.random() < 0.6 * intensity) {
          updated = [...updated, ...generateParticles(3, metal)];
        }

        return updated;
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running, selectedMetal, intensity, generateParticles]);

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drawAnimationRef: number;

    const draw = () => {
      // Background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#1f2937');
      bgGradient.addColorStop(1, '#111827');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Flame Test - Metal Ion Identification', CANVAS_WIDTH / 2, 30);

      const metal = METALS[selectedMetal];

      // Draw Bunsen burner
      // Base
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(CANVAS_WIDTH / 2 - 40, 420, 80, 30);
      
      // Barrel
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(CANVAS_WIDTH / 2 - 20, 380, 40, 40);
      
      // Air hole
      ctx.fillStyle = '#374151';
      ctx.fillRect(CANVAS_WIDTH / 2 - 8, 400, 16, 10);

      // Draw flame
      if (running) {
        // Flame glow
        const glowGradient = ctx.createRadialGradient(
          CANVAS_WIDTH / 2, 300, 0,
          CANVAS_WIDTH / 2, 300, 150
        );
        glowGradient.addColorStop(0, `${metal.color}40`);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(CANVAS_WIDTH / 2 - 150, 150, 300, 250);

        // Draw particles
        particles.forEach(p => {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          gradient.addColorStop(0, `${metal.gradient[0]}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(0.5, `${metal.gradient[1]}${Math.floor(p.life * 200).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, `${metal.gradient[2]}00`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        });

        // Inner flame core
        const coreGradient = ctx.createLinearGradient(
          CANVAS_WIDTH / 2, 380,
          CANVAS_WIDTH / 2, 280
        );
        coreGradient.addColorStop(0, '#60a5fa');
        coreGradient.addColorStop(0.3, metal.gradient[0]);
        coreGradient.addColorStop(1, `${metal.color}00`);
        
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2 - 15, 380);
        ctx.quadraticCurveTo(CANVAS_WIDTH / 2 - 25, 320, CANVAS_WIDTH / 2, 260);
        ctx.quadraticCurveTo(CANVAS_WIDTH / 2 + 25, 320, CANVAS_WIDTH / 2 + 15, 380);
        ctx.fillStyle = coreGradient;
        ctx.fill();
      }

      // Wire loop with sample
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2 + 100, 350);
      ctx.lineTo(CANVAS_WIDTH / 2 + 20, 350);
      ctx.stroke();

      // Loop
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, 350, 20, 0, Math.PI * 2);
      ctx.stroke();

      // Handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(CANVAS_WIDTH / 2 + 100, 340, 60, 20);

      // Sample on loop
      ctx.fillStyle = running ? metal.color : '#e5e7eb';
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, 350, 8, 0, Math.PI * 2);
      ctx.fill();

      // Metal info panel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(20, 60, 200, 160, 10);
      ctx.fill();
      ctx.strokeStyle = metal.color;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`🧪 ${metal.name}`, 35, 85);
      ctx.font = '12px Arial';
      ctx.fillText(`Ion: ${metal.symbol}`, 35, 105);
      ctx.fillText(`Wavelength: ${metal.wavelength} nm`, 35, 125);
      ctx.fillText(metal.description, 35, 145);
      
      // Color swatch
      ctx.fillStyle = metal.color;
      ctx.fillRect(35, 160, 60, 20);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.strokeRect(35, 160, 60, 20);

      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Arial';
      ctx.fillText('Characteristic color', 35, 200);

      // Wavelength scale
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH - 220, 60, 200, 80, 10);
      ctx.fill();
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Spectrum bar
      const spectrumGradient = ctx.createLinearGradient(CANVAS_WIDTH - 200, 0, CANVAS_WIDTH - 40, 0);
      spectrumGradient.addColorStop(0, '#7c3aed'); // Violet ~400nm
      spectrumGradient.addColorStop(0.17, '#3b82f6'); // Blue ~470nm
      spectrumGradient.addColorStop(0.33, '#22c55e'); // Green ~520nm
      spectrumGradient.addColorStop(0.5, '#eab308'); // Yellow ~570nm
      spectrumGradient.addColorStop(0.67, '#f97316'); // Orange ~600nm
      spectrumGradient.addColorStop(0.83, '#ef4444'); // Red ~650nm
      spectrumGradient.addColorStop(1, '#991b1b'); // Deep red ~700nm
      
      ctx.fillStyle = spectrumGradient;
      ctx.fillRect(CANVAS_WIDTH - 200, 90, 160, 20);

      // Wavelength indicator
      const normalizedWavelength = (metal.wavelength - 400) / (700 - 400);
      const indicatorX = CANVAS_WIDTH - 200 + normalizedWavelength * 160;
      
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.moveTo(indicatorX, 85);
      ctx.lineTo(indicatorX - 5, 75);
      ctx.lineTo(indicatorX + 5, 75);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Visible Spectrum', CANVAS_WIDTH - 120, 80);
      ctx.font = '9px Arial';
      ctx.fillText('400nm', CANVAS_WIDTH - 200, 125);
      ctx.fillText('700nm', CANVAS_WIDTH - 40, 125);

      // Instructions
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.roundRect(CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT - 60, 300, 50, 8);
      ctx.fill();

      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Select a metal compound and click Start to observe', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
      ctx.fillText('the characteristic flame color', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 22);

      drawAnimationRef = requestAnimationFrame(draw);
    };

    drawAnimationRef = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(drawAnimationRef);
    };
  }, [particles, selectedMetal, running]);

  // Data capture
  const lastCapturedTime = useRef<number>(-1);

  useEffect(() => {
    if (!running) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    if (elapsed - lastCapturedTime.current >= CAPTURE_INTERVAL / 1000) {
      lastCapturedTime.current = elapsed;
      setTime(elapsed);

      const metal = METALS[selectedMetal];
      capture({
        time: parseFloat(elapsed.toFixed(2)),
        metal: metal.name,
        wavelength: metal.wavelength,
        intensity: parseFloat((intensity * 100).toFixed(1)),
        particleCount: particles.length,
      });
    }
  }, [running, selectedMetal, intensity, particles, capture]);

  const handleStart = () => {
    startTimeRef.current = Date.now();
    lastUpdateRef.current = 0;
    lastCapturedTime.current = -1;
    setRunning(true);
    startCapture();

    if (!testHistory.includes(selectedMetal)) {
      setTestHistory(prev => [...prev, selectedMetal]);
    }

    const metal = METALS[selectedMetal];
    capture({
      time: 0,
      metal: metal.name,
      wavelength: metal.wavelength,
      intensity: parseFloat((intensity * 100).toFixed(1)),
      particleCount: 0,
    });
  };

  const handleStop = () => {
    setRunning(false);
    stopCapture();
    setParticles([]);
  };

  const handleReset = () => {
    setRunning(false);
    setTime(0);
    clearData();
    setParticles([]);
    setTestHistory([]);
    lastCapturedTime.current = -1;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Flame className="text-orange-500" size={24} />
              Flame Test Experiment
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {!running ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  <Play size={18} /> Start Test
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
              <ExportBtn data={dataPoints} experimentName="flame-test" />
            </div>

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-2 border-gray-700 rounded-lg w-full bg-gray-900"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            <p className="text-sm text-gray-600 mt-3 text-center">
              🔥 Different metal ions produce characteristic flame colors due to electron excitation
            </p>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          {/* Metal Selection */}
          <Card>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              <FlaskConical className="text-blue-500" size={20} />
              Select Metal Compound
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(METALS).map(([key, metal]) => (
                <button
                  key={key}
                  onClick={() => !running && setSelectedMetal(key)}
                  disabled={running}
                  className={`p-2 rounded-lg border-2 transition text-left ${
                    selectedMetal === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: metal.color }}
                    />
                    <span className="font-medium text-xs">{metal.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{metal.symbol}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Intensity Control */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">🔥 Flame Intensity</h3>
            <input
              type="range"
              min={0.3}
              max={1.5}
              step={0.1}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </Card>

          {/* Test History */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📝 Tested Metals</h3>
            {testHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No metals tested yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {testHistory.map(key => {
                  const metal = METALS[key];
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${metal.color}20`, color: metal.color }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: metal.color }}
                      />
                      {metal.name}
                    </span>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {testHistory.length} / {Object.keys(METALS).length} metals identified
            </p>
          </Card>

          {/* Theory */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📚 Theory</h3>
            <div className="text-xs space-y-2">
              <p className="text-gray-600">
                When metal compounds are heated, electrons absorb energy and jump to higher energy levels.
              </p>
              <p className="text-gray-600">
                As electrons return to ground state, they emit light at specific wavelengths characteristic of the metal ion.
              </p>
              <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                <span className="font-semibold">E = hf = hc/λ</span>
                <p className="text-gray-600 mt-1">Energy released determines wavelength (color) of light</p>
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
            yKey: 'wavelength',
            xLabel: 'Time (s)',
            yLabel: 'Wavelength (nm)',
            title: '📊 Emission Wavelength',
            color: METALS[selectedMetal]?.color || '#3b82f6',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'particleCount',
            xLabel: 'Time (s)',
            yLabel: 'Particle Count',
            title: '📊 Flame Intensity',
            color: '#f97316',
          }}
        />
      </div>
    </div>
  );
}
