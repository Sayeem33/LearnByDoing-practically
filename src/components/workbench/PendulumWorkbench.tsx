'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import Card from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Timer, Ruler } from 'lucide-react';

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

// Physics constants
const GRAVITY = 9.81; // m/s²
const SCALE = 100; // pixels per meter

// Pendulum state interface
interface PendulumState {
  angle: number; // radians from vertical
  angularVelocity: number; // rad/s
  length: number; // meters
  mass: number; // kg
  damping: number; // damping coefficient
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PIVOT_X = CANVAS_WIDTH / 2;
const PIVOT_Y = 80;
const CAPTURE_INTERVAL = 50;

export default function PendulumWorkbench() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData, startCapture, stopCapture } = useDataStream({ captureInterval: CAPTURE_INTERVAL });

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // User adjustable parameters
  const [length, setLength] = useState(2.0); // meters
  const [mass, setMass] = useState(1.0); // kg
  const [initialAngle, setInitialAngle] = useState(30); // degrees
  const [damping, setDamping] = useState(0.01); // damping coefficient

  // Pendulum state
  const [pendulum, setPendulum] = useState<PendulumState>({
    angle: (30 * Math.PI) / 180,
    angularVelocity: 0,
    length: 2.0,
    mass: 1.0,
    damping: 0.01,
  });

  // Dragging state
  const [dragging, setDragging] = useState(false);
  const [isDraggingBob, setIsDraggingBob] = useState(false);

  // Period measurement
  const [measuredPeriod, setMeasuredPeriod] = useState<number | null>(null);
  const lastCrossTimeRef = useRef<number | null>(null);
  const crossDirectionRef = useRef<number>(0);

  // Calculate theoretical period using small angle approximation
  const theoreticalPeriod = useCallback((L: number) => {
    return 2 * Math.PI * Math.sqrt(L / GRAVITY);
  }, []);

  // Calculate energies
  const calculateEnergies = useCallback((state: PendulumState) => {
    // Height of bob from lowest point (when angle = 0)
    const h = state.length * (1 - Math.cos(state.angle));
    const v = state.length * state.angularVelocity;

    const pe = state.mass * GRAVITY * h;
    const ke = 0.5 * state.mass * v * v;
    const total = pe + ke;

    return { pe, ke, total };
  }, []);

  // Initialize pendulum state
  const initializePendulum = useCallback(() => {
    const angleRad = (initialAngle * Math.PI) / 180;
    setPendulum({
      angle: angleRad,
      angularVelocity: 0,
      length,
      mass,
      damping,
    });
    setMeasuredPeriod(null);
    lastCrossTimeRef.current = null;
    crossDirectionRef.current = 0;
  }, [length, mass, initialAngle, damping]);

  // Initialize on mount and parameter changes (when not running)
  useEffect(() => {
    if (!running) {
      initializePendulum();
    }
  }, [length, mass, initialAngle, damping, running, initializePendulum]);

  // Physics simulation using RK4 integration
  const simulateStep = useCallback((state: PendulumState, dt: number): PendulumState => {
    // Angular acceleration: α = -(g/L)sin(θ) - damping * ω
    const angularAcceleration = (angle: number, omega: number) => {
      return -(GRAVITY / state.length) * Math.sin(angle) - state.damping * omega;
    };

    // RK4 integration for better accuracy
    const k1_v = angularAcceleration(state.angle, state.angularVelocity);
    const k1_x = state.angularVelocity;

    const k2_v = angularAcceleration(state.angle + 0.5 * dt * k1_x, state.angularVelocity + 0.5 * dt * k1_v);
    const k2_x = state.angularVelocity + 0.5 * dt * k1_v;

    const k3_v = angularAcceleration(state.angle + 0.5 * dt * k2_x, state.angularVelocity + 0.5 * dt * k2_v);
    const k3_x = state.angularVelocity + 0.5 * dt * k2_v;

    const k4_v = angularAcceleration(state.angle + dt * k3_x, state.angularVelocity + dt * k3_v);
    const k4_x = state.angularVelocity + dt * k3_v;

    const newAngle = state.angle + (dt / 6) * (k1_x + 2 * k2_x + 2 * k3_x + k4_x);
    const newOmega = state.angularVelocity + (dt / 6) * (k1_v + 2 * k2_v + 2 * k3_v + k4_v);

    return {
      ...state,
      angle: newAngle,
      angularVelocity: newOmega,
    };
  }, []);

  // Physics simulation loop
  useEffect(() => {
    if (!running) return;

    const simulate = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const dt = Math.min((timestamp - lastUpdateRef.current) / 1000, 0.05);
      lastUpdateRef.current = timestamp;

      setPendulum(prev => {
        const newState = simulateStep(prev, dt);

        // Measure period when crossing equilibrium
        const elapsed = (timestamp - startTimeRef.current) / 1000;
        if (prev.angle * newState.angle < 0 && newState.angularVelocity < 0) {
          // Crossed from positive to negative angle (going left)
          if (lastCrossTimeRef.current !== null) {
            const period = elapsed - lastCrossTimeRef.current;
            if (period > 0.1) { // Avoid noise
              setMeasuredPeriod(period);
            }
          }
          lastCrossTimeRef.current = elapsed;
        }

        return newState;
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running, simulateStep]);

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drawAnimationRef: number;

    const draw = () => {
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f0f9ff');
      gradient.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw support structure
      ctx.fillStyle = '#475569';
      ctx.fillRect(PIVOT_X - 100, 0, 200, 20);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(PIVOT_X - 80, 20, 160, 10);

      // Calculate bob position
      const lengthPx = pendulum.length * SCALE;
      const bobX = PIVOT_X + lengthPx * Math.sin(pendulum.angle);
      const bobY = PIVOT_Y + lengthPx * Math.cos(pendulum.angle);
      const bobRadius = 15 + pendulum.mass * 5;

      // Draw motion arc (trace path)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(PIVOT_X, PIVOT_Y, lengthPx, Math.PI / 2 - 0.8, Math.PI / 2 + 0.8);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw equilibrium line
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(PIVOT_X, PIVOT_Y);
      ctx.lineTo(PIVOT_X, PIVOT_Y + lengthPx + 50);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw string
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(PIVOT_X, PIVOT_Y);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Draw pivot
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(PIVOT_X, PIVOT_Y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.arc(PIVOT_X, PIVOT_Y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw bob shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.ellipse(bobX, CANVAS_HEIGHT - 30, bobRadius * 0.8, bobRadius * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw bob
      const bobGradient = ctx.createRadialGradient(
        bobX - bobRadius * 0.3, bobY - bobRadius * 0.3, 0,
        bobX, bobY, bobRadius
      );
      bobGradient.addColorStop(0, '#fca5a5');
      bobGradient.addColorStop(1, '#ef4444');
      ctx.fillStyle = bobGradient;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bob outline
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw velocity vector
      if (Math.abs(pendulum.angularVelocity) > 0.01) {
        const v = pendulum.length * pendulum.angularVelocity;
        const vScale = 20;
        const vx = v * Math.cos(pendulum.angle) * vScale;
        const vy = -v * Math.sin(pendulum.angle) * vScale;

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bobX, bobY);
        ctx.lineTo(bobX + vx, bobY + vy);
        ctx.stroke();

        // Arrow head
        const arrowAngle = Math.atan2(vy, vx);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(bobX + vx, bobY + vy);
        ctx.lineTo(bobX + vx - 10 * Math.cos(arrowAngle - 0.4), bobY + vy - 10 * Math.sin(arrowAngle - 0.4));
        ctx.lineTo(bobX + vx - 10 * Math.cos(arrowAngle + 0.4), bobY + vy - 10 * Math.sin(arrowAngle + 0.4));
        ctx.closePath();
        ctx.fill();
      }

      // Draw angle arc
      if (Math.abs(pendulum.angle) > 0.05) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (pendulum.angle > 0) {
          ctx.arc(PIVOT_X, PIVOT_Y, 40, Math.PI / 2, Math.PI / 2 - pendulum.angle, true);
        } else {
          ctx.arc(PIVOT_X, PIVOT_Y, 40, Math.PI / 2, Math.PI / 2 - pendulum.angle);
        }
        ctx.stroke();

        // Angle label
        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        const angleDeg = (pendulum.angle * 180) / Math.PI;
        ctx.fillText(`${angleDeg.toFixed(1)}°`, PIVOT_X + 60 * Math.sin(pendulum.angle / 2), PIVOT_Y + 50);
      }

      // Draw info panel
      const energies = calculateEnergies(pendulum);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      drawRoundRect(ctx, 10, 10, 180, 110, 8);
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('📊 Live Data', 20, 30);
      ctx.font = '11px Arial';
      ctx.fillText(`Angle: ${((pendulum.angle * 180) / Math.PI).toFixed(1)}°`, 20, 50);
      ctx.fillText(`Angular Vel: ${pendulum.angularVelocity.toFixed(2)} rad/s`, 20, 65);
      ctx.fillText(`PE: ${energies.pe.toFixed(2)} J`, 20, 85);
      ctx.fillText(`KE: ${energies.ke.toFixed(2)} J`, 100, 85);
      ctx.fillText(`Total: ${energies.total.toFixed(2)} J`, 20, 105);

      // Draw length indicator
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(PIVOT_X + 30, PIVOT_Y);
      ctx.lineTo(PIVOT_X + 30, PIVOT_Y + lengthPx);
      ctx.stroke();
      ctx.setLineDash([]);

      // Length arrow heads
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.moveTo(PIVOT_X + 30, PIVOT_Y);
      ctx.lineTo(PIVOT_X + 25, PIVOT_Y + 10);
      ctx.lineTo(PIVOT_X + 35, PIVOT_Y + 10);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(PIVOT_X + 30, PIVOT_Y + lengthPx);
      ctx.lineTo(PIVOT_X + 25, PIVOT_Y + lengthPx - 10);
      ctx.lineTo(PIVOT_X + 35, PIVOT_Y + lengthPx - 10);
      ctx.closePath();
      ctx.fill();

      ctx.font = '11px Arial';
      ctx.fillStyle = '#7c3aed';
      ctx.textAlign = 'left';
      ctx.fillText(`L = ${pendulum.length.toFixed(2)} m`, PIVOT_X + 40, PIVOT_Y + lengthPx / 2);

      // Drag instruction when not running
      if (!running) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 Drag the bob to set initial angle', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
      }

      drawAnimationRef = requestAnimationFrame(draw);
    };

    drawAnimationRef = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(drawAnimationRef);
    };
  }, [pendulum, running, calculateEnergies]);

  // Data capture
  const lastCapturedTime = useRef<number>(-1);

  useEffect(() => {
    if (!running) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    if (elapsed - lastCapturedTime.current >= CAPTURE_INTERVAL / 1000) {
      lastCapturedTime.current = elapsed;
      setTime(elapsed);

      const energies = calculateEnergies(pendulum);
      const angleDeg = (pendulum.angle * 180) / Math.PI;

      capture({
        time: parseFloat(elapsed.toFixed(2)),
        angle: parseFloat(angleDeg.toFixed(2)),
        angularVelocity: parseFloat(pendulum.angularVelocity.toFixed(3)),
        potentialEnergy: parseFloat(energies.pe.toFixed(3)),
        kineticEnergy: parseFloat(energies.ke.toFixed(3)),
        totalEnergy: parseFloat(energies.total.toFixed(3)),
      });
    }
  }, [running, pendulum, capture, calculateEnergies]);

  // Mouse handlers for dragging bob
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (running) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Calculate bob position
    const lengthPx = pendulum.length * SCALE;
    const bobX = PIVOT_X + lengthPx * Math.sin(pendulum.angle);
    const bobY = PIVOT_Y + lengthPx * Math.cos(pendulum.angle);
    const bobRadius = 15 + pendulum.mass * 5;

    const dx = x - bobX;
    const dy = y - bobY;
    if (dx * dx + dy * dy <= bobRadius * bobRadius * 1.5) {
      setDragging(true);
      setIsDraggingBob(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || running) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Calculate new angle from mouse position
    const dx = x - PIVOT_X;
    const dy = y - PIVOT_Y;
    let newAngle = Math.atan2(dx, dy);

    // Limit angle to reasonable range (-80° to 80°)
    const maxAngle = (80 * Math.PI) / 180;
    newAngle = Math.max(-maxAngle, Math.min(maxAngle, newAngle));

    setPendulum(prev => ({
      ...prev,
      angle: newAngle,
      angularVelocity: 0,
    }));

    // Update initial angle slider to match
    setInitialAngle(Math.round((newAngle * 180) / Math.PI));
  };

  const handleMouseUp = () => {
    setDragging(false);
    setIsDraggingBob(false);
  };

  const handleStart = () => {
    startTimeRef.current = Date.now();
    lastUpdateRef.current = 0;
    lastCapturedTime.current = -1;
    lastCrossTimeRef.current = null;
    setMeasuredPeriod(null);
    setRunning(true);
    startCapture();

    // Capture initial state
    const energies = calculateEnergies(pendulum);
    capture({
      time: 0,
      angle: parseFloat(((pendulum.angle * 180) / Math.PI).toFixed(2)),
      angularVelocity: 0,
      potentialEnergy: parseFloat(energies.pe.toFixed(3)),
      kineticEnergy: 0,
      totalEnergy: parseFloat(energies.total.toFixed(3)),
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
    initializePendulum();
  };

  const thPeriod = theoreticalPeriod(length);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Timer className="text-blue-500" size={24} />
              Simple Pendulum Simulation
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
              <ExportBtn data={dataPoints} experimentName="pendulum" />
            </div>

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="border-2 border-gray-200 rounded-lg w-full cursor-grab active:cursor-grabbing"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            <p className="text-sm text-gray-600 mt-3 text-center">
              🎯 Drag the bob to set the initial angle before starting. Watch energy conservation!
            </p>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          {/* Parameters */}
          <Card>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              <Ruler className="text-purple-500" size={20} />
              Parameters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length: <span className="font-bold text-purple-600">{length.toFixed(2)} m</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={4}
                  step={0.1}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mass: <span className="font-bold text-red-600">{mass.toFixed(1)} kg</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={mass}
                  onChange={(e) => setMass(Number(e.target.value))}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">Mass affects energy, not period!</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Angle: <span className="font-bold text-amber-600">{initialAngle}°</span>
                </label>
                <input
                  type="range"
                  min={-80}
                  max={80}
                  step={1}
                  value={initialAngle}
                  onChange={(e) => {
                    const angle = Number(e.target.value);
                    setInitialAngle(angle);
                    if (!running) {
                      setPendulum(prev => ({
                        ...prev,
                        angle: (angle * Math.PI) / 180,
                        angularVelocity: 0,
                      }));
                    }
                  }}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Damping: <span className="font-bold text-gray-600">{damping.toFixed(3)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={0.2}
                  step={0.005}
                  value={damping}
                  onChange={(e) => setDamping(Number(e.target.value))}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">0 = no friction, higher = more damping</p>
              </div>
            </div>
          </Card>

          {/* Period Measurement */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">⏱️ Period Measurement</h3>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <span className="text-gray-700">Theoretical</span>
                <span className="font-mono font-bold text-blue-700">{thPeriod.toFixed(3)} s</span>
              </div>
              <div className="flex justify-between p-2 bg-green-50 rounded border border-green-200">
                <span className="text-gray-700">Measured</span>
                <span className="font-mono font-bold text-green-700">
                  {measuredPeriod ? `${measuredPeriod.toFixed(3)} s` : '—'}
                </span>
              </div>
              {measuredPeriod && (
                <div className="flex justify-between p-2 bg-purple-50 rounded border border-purple-200">
                  <span className="text-gray-700">Error</span>
                  <span className="font-mono font-bold text-purple-700">
                    {(((measuredPeriod - thPeriod) / thPeriod) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500">
                T = 2π√(L/g) — valid for small angles
              </p>
            </div>
          </Card>

          {/* Results */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📊 Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <span className="text-gray-700">Time</span>
                <span className="font-mono font-bold">{time.toFixed(2)} s</span>
              </div>
              <div className="flex justify-between p-2 bg-amber-50 rounded border border-amber-200">
                <span className="text-gray-700">Current Angle</span>
                <span className="font-mono font-bold text-amber-700">
                  {((pendulum.angle * 180) / Math.PI).toFixed(1)}°
                </span>
              </div>
              <div className="flex justify-between p-2 bg-green-50 rounded border border-green-200">
                <span className="text-gray-700">Angular Velocity</span>
                <span className="font-mono font-bold text-green-700">
                  {pendulum.angularVelocity.toFixed(2)} rad/s
                </span>
              </div>
            </div>
          </Card>

          {/* Theory */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📐 Formulas</h3>
            <div className="space-y-2 text-xs">
              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                <div className="font-semibold text-gray-900">Period</div>
                <div className="font-mono text-blue-800">T = 2π√(L/g)</div>
              </div>
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <div className="font-semibold text-gray-900">Potential Energy</div>
                <div className="font-mono text-green-800">PE = mgh = mgL(1-cos θ)</div>
              </div>
              <div className="bg-red-50 p-2 rounded border border-red-200">
                <div className="font-semibold text-gray-900">Kinetic Energy</div>
                <div className="font-mono text-red-800">KE = ½mv² = ½mL²ω²</div>
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
            yKey: 'angle',
            xLabel: 'Time (s)',
            yLabel: 'Angle (°)',
            title: '📈 Angle vs Time',
            color: '#f59e0b',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'angularVelocity',
            xLabel: 'Time (s)',
            yLabel: 'Angular Velocity (rad/s)',
            title: '📈 Angular Velocity vs Time',
            color: '#22c55e',
          }}
        />
      </div>

      {/* Energy Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'potentialEnergy',
            xLabel: 'Time (s)',
            yLabel: 'Potential Energy (J)',
            title: '📈 Potential Energy vs Time',
            color: '#3b82f6',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'kineticEnergy',
            xLabel: 'Time (s)',
            yLabel: 'Kinetic Energy (J)',
            title: '📈 Kinetic Energy vs Time',
            color: '#ef4444',
          }}
        />
      </div>
    </div>
  );
}