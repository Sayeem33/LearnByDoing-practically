'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import Card from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Zap, Battery } from 'lucide-react';
import { WorkbenchPersistenceProps } from '@/components/workbench/persistence';

// Helper function to draw rounded rectangle
function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const CAPTURE_INTERVAL = 100;

// Electrolysis state
interface ElectrolysisState {
  voltage: number;
  current: number;
  h2Volume: number; // mL
  o2Volume: number; // mL
  time: number;
  bubbles: { x: number; y: number; r: number; speed: number; electrode: 'cathode' | 'anode' }[];
}

export default function ElectrolysisWorkbench({
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
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // User adjustable parameters
  const [voltage, setVoltage] = useState(initialSnapshot?.voltage || 6); // Volts
  const [electrolyteConc, setElectrolyteConc] = useState(initialSnapshot?.electrolyteConc || 0.5); // Molarity

  // Electrolysis state
  const [state, setState] = useState<ElectrolysisState>(() => initialSnapshot?.state || {
    voltage: 6,
    current: 0,
    h2Volume: 0,
    o2Volume: 0,
    time: 0,
    bubbles: [],
  });
  const skipInitialSetupRef = useRef(Boolean(initialSnapshot));

  // Calculate current based on voltage and concentration (simplified)
  const calculateCurrent = useCallback((v: number, conc: number) => {
    // Minimum voltage for water electrolysis is ~1.23V
    if (v < 1.5) return 0;
    return (v - 1.23) * conc * 0.8; // Simplified Ohm's law
  }, []);

  // Initialize state
  const initializeState = useCallback(() => {
    setState({
      voltage,
      current: 0,
      h2Volume: 0,
      o2Volume: 0,
      time: 0,
      bubbles: [],
    });
  }, [voltage]);

  // Initialize on mount and parameter changes (when not running)
  useEffect(() => {
    if (skipInitialSetupRef.current) {
      skipInitialSetupRef.current = false;
      return;
    }

    if (!running) {
      initializeState();
    }
  }, [voltage, electrolyteConc, running, initializeState]);

  useEffect(() => {
    onSnapshotChange?.({
      time,
      voltage,
      electrolyteConc,
      state,
      dataPoints,
    });
  }, [onSnapshotChange, time, voltage, electrolyteConc, state, dataPoints]);

  // Simulation loop
  useEffect(() => {
    if (!running) return;

    const simulate = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const dt = Math.min((timestamp - lastUpdateRef.current) / 1000, 0.1);
      lastUpdateRef.current = timestamp;

      setState(prev => {
        const current = calculateCurrent(voltage, electrolyteConc);
        
        // Faraday's law: Volume of gas = (I * t * Vm) / (n * F)
        // Simplified: rate proportional to current
        const h2Rate = current * 0.5 * dt; // mL/s (H2 produced at double rate)
        const o2Rate = current * 0.25 * dt; // mL/s
        
        const newH2 = Math.min(prev.h2Volume + h2Rate, 100);
        const newO2 = Math.min(prev.o2Volume + o2Rate, 50);

        // Generate bubbles
        let newBubbles = [...prev.bubbles];
        
        if (current > 0 && Math.random() < current * 0.3) {
          // Cathode bubble (H2)
          newBubbles.push({
            x: 280 + Math.random() * 20,
            y: 350,
            r: 2 + Math.random() * 4,
            speed: 1 + Math.random() * 2,
            electrode: 'cathode',
          });
        }
        
        if (current > 0 && Math.random() < current * 0.15) {
          // Anode bubble (O2)
          newBubbles.push({
            x: 500 + Math.random() * 20,
            y: 350,
            r: 2 + Math.random() * 3,
            speed: 0.8 + Math.random() * 1.5,
            electrode: 'anode',
          });
        }

        // Move bubbles up
        newBubbles = newBubbles
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > 100);

        return {
          ...prev,
          current,
          h2Volume: newH2,
          o2Volume: newO2,
          time: prev.time + dt,
          bubbles: newBubbles,
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
  }, [running, voltage, electrolyteConc, calculateCurrent]);

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drawAnimationRef: number;

    const draw = () => {
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f0f9ff');
      gradient.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw title
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Electrolysis of Water', CANVAS_WIDTH / 2, 30);
      ctx.font = '12px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('2H₂O → 2H₂ + O₂', CANVAS_WIDTH / 2, 50);

      // Draw electrolysis cell (beaker)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
      drawRoundRect(ctx, 200, 150, 400, 300, 10);
      ctx.fill();
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw water level
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.fillRect(203, 180, 394, 267);

      // Draw electrodes
      // Cathode (-)
      ctx.fillStyle = '#374151';
      ctx.fillRect(275, 120, 30, 280);
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('−', 290, 110);
      ctx.fillText('Cathode', 290, 430);

      // Anode (+)
      ctx.fillStyle = '#374151';
      ctx.fillRect(495, 120, 30, 280);
      ctx.fillStyle = '#1f2937';
      ctx.fillText('+', 510, 110);
      ctx.fillText('Anode', 510, 430);

      // Draw collection tubes
      // H2 tube (left)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, 260, 80, 60, 150, 5);
      ctx.fill();
      ctx.stroke();
      
      // H2 gas level
      const h2Height = (state.h2Volume / 100) * 140;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.fillRect(262, 228 - h2Height, 56, h2Height);

      // O2 tube (right)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      drawRoundRect(ctx, 480, 80, 60, 150, 5);
      ctx.fill();
      ctx.stroke();
      
      // O2 gas level
      const o2Height = (state.o2Volume / 50) * 140;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(482, 228 - o2Height, 56, o2Height);

      // Labels
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('H₂', 290, 70);
      ctx.fillText('O₂', 510, 70);

      // Volume labels
      ctx.font = '11px Arial';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(`${state.h2Volume.toFixed(1)} mL`, 290, 245);
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`${state.o2Volume.toFixed(1)} mL`, 510, 245);

      // Draw bubbles
      state.bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
        ctx.fillStyle = bubble.electrode === 'cathode' 
          ? 'rgba(59, 130, 246, 0.6)' 
          : 'rgba(239, 68, 68, 0.6)';
        ctx.fill();
      });

      // Draw wires
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(510, 120);
      ctx.lineTo(510, 80);
      ctx.lineTo(650, 80);
      ctx.lineTo(650, 200);
      ctx.stroke();

      ctx.strokeStyle = '#1f2937';
      ctx.beginPath();
      ctx.moveTo(290, 120);
      ctx.lineTo(290, 80);
      ctx.lineTo(150, 80);
      ctx.lineTo(150, 200);
      ctx.stroke();

      // Draw battery/power source
      ctx.fillStyle = '#fbbf24';
      drawRoundRect(ctx, 120, 200, 60, 120, 8);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Battery details
      ctx.fillStyle = '#78350f';
      ctx.fillRect(140, 190, 20, 10);
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`${voltage}V`, 150, 270);
      ctx.font = '10px Arial';
      ctx.fillText('DC', 150, 285);

      // Current indicator
      if (state.current > 0) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(150, 310, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1f2937';
        ctx.font = '11px Arial';
        ctx.fillText(`${state.current.toFixed(2)} A`, 150, 335);
      }

      // Info panel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      drawRoundRect(ctx, CANVAS_WIDTH - 180, 10, 170, 130, 8);
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('📊 Electrolysis Data', CANVAS_WIDTH - 170, 30);
      ctx.font = '11px Arial';
      ctx.fillText(`Voltage: ${voltage} V`, CANVAS_WIDTH - 170, 50);
      ctx.fillText(`Current: ${state.current.toFixed(2)} A`, CANVAS_WIDTH - 170, 68);
      ctx.fillText(`H₂ Volume: ${state.h2Volume.toFixed(1)} mL`, CANVAS_WIDTH - 170, 86);
      ctx.fillText(`O₂ Volume: ${state.o2Volume.toFixed(1)} mL`, CANVAS_WIDTH - 170, 104);
      ctx.fillText(`Ratio H₂:O₂ = ${state.o2Volume > 0 ? (state.h2Volume / state.o2Volume).toFixed(1) : '—'}:1`, CANVAS_WIDTH - 170, 122);

      // Equation display
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      drawRoundRect(ctx, 10, CANVAS_HEIGHT - 70, 180, 60, 8);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#166534';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Half Reactions:', 20, CANVAS_HEIGHT - 50);
      ctx.font = '10px Arial';
      ctx.fillText('Cathode: 2H₂O + 2e⁻ → H₂ + 2OH⁻', 20, CANVAS_HEIGHT - 35);
      ctx.fillText('Anode: 2OH⁻ → H₂O + ½O₂ + 2e⁻', 20, CANVAS_HEIGHT - 20);

      drawAnimationRef = requestAnimationFrame(draw);
    };

    drawAnimationRef = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(drawAnimationRef);
    };
  }, [state, voltage]);

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
        voltage: voltage,
        current: parseFloat(state.current.toFixed(3)),
        h2Volume: parseFloat(state.h2Volume.toFixed(2)),
        o2Volume: parseFloat(state.o2Volume.toFixed(2)),
        ratio: state.o2Volume > 0 ? parseFloat((state.h2Volume / state.o2Volume).toFixed(2)) : 0,
      });
    }
  }, [running, state, voltage, capture]);

  const handleStart = () => {
    startTimeRef.current = Date.now() - time * 1000;
    lastUpdateRef.current = 0;
    lastCapturedTime.current = -1;
    setRunning(true);
    startCapture();

    capture({
      time: parseFloat(time.toFixed(2)),
      voltage: voltage,
      current: state.current,
      h2Volume: state.h2Volume,
      o2Volume: state.o2Volume,
      ratio: state.o2Volume > 0 ? state.h2Volume / state.o2Volume : 0,
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
    lastCapturedTime.current = -1;
    initializeState();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Zap className="text-yellow-500" size={24} />
              Electrolysis of Water
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {!running ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  <Play size={18} /> Start
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
              <ExportBtn data={dataPoints} experimentName="electrolysis" />
            </div>

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-2 border-gray-200 rounded-lg w-full"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            <p className="text-sm text-gray-600 mt-3 text-center">
              ⚡ Water is split into hydrogen and oxygen gases. Notice the 2:1 volume ratio!
            </p>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          {/* Parameters */}
          <Card>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              <Battery className="text-amber-500" size={20} />
              Parameters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voltage: <span className="font-bold text-amber-600">{voltage} V</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.5}
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">Min ~1.23V needed for electrolysis</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Electrolyte Concentration: <span className="font-bold text-blue-600">{electrolyteConc} M</span>
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.1}
                  value={electrolyteConc}
                  onChange={(e) => setElectrolyteConc(Number(e.target.value))}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">NaOH concentration affects conductivity</p>
              </div>
            </div>
          </Card>

          {/* Results */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📊 Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <span className="text-gray-700">Time</span>
                <span className="font-mono font-bold">{time.toFixed(1)} s</span>
              </div>
              <div className="flex justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <span className="text-gray-700">H₂ Volume</span>
                <span className="font-mono font-bold text-blue-700">{state.h2Volume.toFixed(1)} mL</span>
              </div>
              <div className="flex justify-between p-2 bg-red-50 rounded border border-red-200">
                <span className="text-gray-700">O₂ Volume</span>
                <span className="font-mono font-bold text-red-700">{state.o2Volume.toFixed(1)} mL</span>
              </div>
              <div className="flex justify-between p-2 bg-green-50 rounded border border-green-200">
                <span className="text-gray-700">H₂:O₂ Ratio</span>
                <span className="font-mono font-bold text-green-700">
                  {state.o2Volume > 0.1 ? `${(state.h2Volume / state.o2Volume).toFixed(1)}:1` : '—'}
                </span>
              </div>
            </div>
          </Card>

          {/* Theory */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📐 Theory</h3>
            <div className="space-y-2 text-xs">
              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                <div className="font-semibold text-gray-900">Overall Reaction</div>
                <div className="font-mono text-blue-800">2H₂O → 2H₂ + O₂</div>
              </div>
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <div className="font-semibold text-gray-900">Faraday's Law</div>
                <div className="font-mono text-green-800">m = (M × I × t) / (n × F)</div>
              </div>
              <div className="bg-purple-50 p-2 rounded border border-purple-200">
                <div className="font-semibold text-gray-900">Expected Ratio</div>
                <div className="font-mono text-purple-800">H₂ : O₂ = 2 : 1</div>
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
            yKey: 'h2Volume',
            xLabel: 'Time (s)',
            yLabel: 'H₂ Volume (mL)',
            title: '📈 Hydrogen Volume vs Time',
            color: '#3b82f6',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'o2Volume',
            xLabel: 'Time (s)',
            yLabel: 'O₂ Volume (mL)',
            title: '📈 Oxygen Volume vs Time',
            color: '#ef4444',
          }}
        />
      </div>
    </div>
  );
}
