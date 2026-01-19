'use client';

import React, { useEffect, useRef, useState } from 'react';
import PhysicsEngine from '@/engine/PhysicsEngine';
import FreeFallEngine from '@/engine/physics/freeFallEngine';
import { useDataStream } from '@/hooks/useDataStream';
import LiveChart from '@/components/analysis/LiveChart';
import VelocityGraph from '@/components/analysis/VelocityGraph';
import PositionGraph from '@/components/analysis/PositionGraph';
import ExportBtn from '@/components/analysis/ExportBtn';
import Card from '@/components/ui/Card';
import { Play, Pause, RotateCcw } from 'lucide-react';

const FREEFALL_CAPTURE_INTERVAL = 50; // ms

export default function FreeFallWorkbench() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [physics] = useState(() => new PhysicsEngine());
  const [engine] = useState(() => new FreeFallEngine(physics));
  const { dataPoints, capture, startCapture, stopCapture, exportCSV, clearData } =
    useDataStream({ captureInterval: FREEFALL_CAPTURE_INTERVAL });

  const [running, setRunning] = useState(false);
  const [height, setHeight] = useState(100);
  const animationRef = useRef<number | null>(null);

  // Initialize and draw loop
  useEffect(() => {
    // Spawn initial ball
    engine.spawnBall(400, height, 20, { color: '#ef4444' });

    const drawLoop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current) {
        animationRef.current = requestAnimationFrame(drawLoop);
        return;
      }

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasRef.current.height);
      gradient.addColorStop(0, '#f0f9ff');
      gradient.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw grid
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvasRef.current.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasRef.current.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvasRef.current.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasRef.current.width, y);
        ctx.stroke();
      }

      // Draw ground
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, canvasRef.current.height - 40, canvasRef.current.width, 40);
      ctx.fillStyle = '#059669';
      ctx.font = '12px Arial';
      ctx.fillText('Ground', 10, canvasRef.current.height - 20);

      // Draw initial height indicator
      if (!running) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(canvasRef.current.width, height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`h = ${height}px`, 10, height - 5);
      }

      // Draw all objects
      const objs = physics.getAllObjectsData();
      objs.forEach((o) => {
        if (o.type === 'ball') {
          // Draw shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.beginPath();
          ctx.arc(o.position.x, canvasRef.current!.height - 35, 20, 0, Math.PI * 2);
          ctx.fill();

          // Draw ball with gradient
          const ballGradient = ctx.createRadialGradient(o.position.x - 5, o.position.y - 5, 0, o.position.x, o.position.y, 20);
          ballGradient.addColorStop(0, '#ff6b6b');
          ballGradient.addColorStop(1, '#ef4444');
          ctx.fillStyle = ballGradient;
          ctx.beginPath();
          ctx.arc(o.position.x, o.position.y, 20, 0, Math.PI * 2);
          ctx.fill();

          // Draw ball outline
          ctx.strokeStyle = '#991b1b';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw velocity vector
          const speedScale = 0.3;
          const vx = o.velocity.x * speedScale;
          const vy = o.velocity.y * speedScale;
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(o.position.x, o.position.y);
          ctx.lineTo(o.position.x + vx, o.position.y + vy);
          ctx.stroke();
          
          // Arrow head
          const angle = Math.atan2(vy, vx);
          ctx.beginPath();
          ctx.moveTo(o.position.x + vx, o.position.y + vy);
          ctx.lineTo(o.position.x + vx - 8 * Math.cos(angle - Math.PI / 6), o.position.y + vy - 8 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(o.position.x + vx - 8 * Math.cos(angle + Math.PI / 6), o.position.y + vy - 8 * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fillStyle = '#3b82f6';
          ctx.fill();

          // Display velocity and position info
          const speed = Math.sqrt(o.velocity.x ** 2 + o.velocity.y ** 2);
          ctx.fillStyle = '#1f2937';
          ctx.font = '12px monospace';
          ctx.fillText(`v: ${(speed * 0.016).toFixed(1)} m/s`, o.position.x + 30, o.position.y - 30);
          ctx.fillText(`y: ${(o.position.y).toFixed(0)}px`, o.position.x + 30, o.position.y - 15);
        }
      });

      // Capture ball telemetry if running
      if (running) {
        const ball = engine.getBallData();
        if (ball) {
          const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
          capture({
            time: Date.now() / 1000,
            x: ball.position.x,
            y: ball.position.y,
            vx: ball.velocity.x,
            vy: ball.velocity.y,
            speed: speed * 0.016, // Convert pixels to m/s
            velocity: ball.velocity.y * 0.016,
            position: ball.position.y * 0.001,
          });
        }
      }

      animationRef.current = requestAnimationFrame(drawLoop);
    };

    animationRef.current = requestAnimationFrame(drawLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      physics.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    physics.start();
    startCapture();
    setRunning(true);
  };

  const handleStop = () => {
    physics.stop();
    stopCapture();
    setRunning(false);
  };

  const handleReset = () => {
    physics.reset();
    engine.spawnBall(400, height, 20, { color: '#ef4444' });
    clearData();
    setRunning(false);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = Number(e.target.value);
    setHeight(h);
    if (!running) {
      engine.spawnBall(400, h, 20, { color: '#ef4444' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900">🎯 Free Fall Simulation</h3>
            
            <div className="flex gap-2 mb-4">
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
              <ExportBtn 
                data={dataPoints}
                experimentName="freefall"
              />
            </div>

            <canvas 
              ref={canvasRef} 
              width={800} 
              height={500}
              className="border-2 border-gray-200 rounded-lg w-full bg-sky-50"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900">⚙️ Controls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Height: <span className="font-bold text-blue-600">{height}px</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={400}
                  value={height}
                  onChange={handleHeightChange}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-2">Adjust height before starting</p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">📐 Theory</h4>
                <div className="space-y-1 text-sm text-gray-700 font-mono">
                  <div>d = ½gt²</div>
                  <div>v = gt</div>
                  <div>g = 9.8 m/s²</div>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">💡 Tips</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Set height before running</li>
                  <li>• Watch the velocity vector grow</li>
                  <li>• Export data for analysis</li>
                </ul>
              </div>
            </div>
          </Card>

          {dataPoints.length > 0 && (
            <Card>
              <h3 className="font-bold text-sm text-gray-900 mb-3">📊 Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Points:</span>
                  <span className="font-semibold">{dataPoints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Velocity:</span>
                  <span className="font-semibold">{Math.max(...dataPoints.map(d => d.speed || 0)).toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{dataPoints.length > 0 ? (dataPoints[dataPoints.length - 1].time || 0).toFixed(2) : '0'} s</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'speed',
            xLabel: 'Time (s)',
            yLabel: 'Velocity (m/s)',
            title: '📈 Velocity vs Time',
            color: '#3b82f6',
          }}
        />
        <PositionGraph data={dataPoints.map((d) => ({ time: d.time, y: d.y || 0 }))} />
      </div>
    </div>
  );
}
