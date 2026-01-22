'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import Card from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Circle, Zap } from 'lucide-react';

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

// Ball object interface
interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  label: string;
}

// Collision state
interface CollisionState {
  balls: Ball[];
  isCollided: boolean;
  collisionTime: number | null;
  initialMomentum: { px: number; py: number };
  currentMomentum: { px: number; py: number };
  initialKE: number;
  currentKE: number;
  coefficientOfRestitution: number;
}

const CAPTURE_INTERVAL = 50;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_Y = CANVAS_HEIGHT - 50;

export default function CollisionWorkbench() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData, startCapture, stopCapture } = useDataStream({ captureInterval: CAPTURE_INTERVAL });

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Ball parameters (user adjustable)
  const [massA, setMassA] = useState(2);
  const [massB, setMassB] = useState(2);
  const [velocityA, setVelocityA] = useState(5);
  const [velocityB, setVelocityB] = useState(-3);
  const [restitution, setRestitution] = useState(1.0); // 1 = perfectly elastic

  // Collision state
  const [collision, setCollision] = useState<CollisionState>({
    balls: [
      { id: 'A', x: 150, y: GROUND_Y - 30, vx: 5, vy: 0, radius: 30, mass: 2, color: '#ef4444', label: 'A' },
      { id: 'B', x: 650, y: GROUND_Y - 30, vx: -3, vy: 0, radius: 30, mass: 2, color: '#3b82f6', label: 'B' },
    ],
    isCollided: false,
    collisionTime: null,
    initialMomentum: { px: 0, py: 0 },
    currentMomentum: { px: 0, py: 0 },
    initialKE: 0,
    currentKE: 0,
    coefficientOfRestitution: 1.0,
  });

  // Drag state
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Calculate momentum
  const calculateMomentum = useCallback((balls: Ball[]) => {
    let px = 0, py = 0;
    balls.forEach(ball => {
      px += ball.mass * ball.vx;
      py += ball.mass * ball.vy;
    });
    return { px, py };
  }, []);

  // Calculate kinetic energy
  const calculateKE = useCallback((balls: Ball[]) => {
    let ke = 0;
    balls.forEach(ball => {
      const speed2 = ball.vx * ball.vx + ball.vy * ball.vy;
      ke += 0.5 * ball.mass * speed2;
    });
    return ke;
  }, []);

  // Initialize balls with current parameters
  const initializeBalls = useCallback(() => {
    const radiusA = 20 + massA * 3;
    const radiusB = 20 + massB * 3;
    
    const balls: Ball[] = [
      { id: 'A', x: 150, y: GROUND_Y - radiusA, vx: velocityA, vy: 0, radius: radiusA, mass: massA, color: '#ef4444', label: 'A' },
      { id: 'B', x: 650, y: GROUND_Y - radiusB, vx: velocityB, vy: 0, radius: radiusB, mass: massB, color: '#3b82f6', label: 'B' },
    ];

    const initialMomentum = calculateMomentum(balls);
    const initialKE = calculateKE(balls);

    setCollision({
      balls,
      isCollided: false,
      collisionTime: null,
      initialMomentum,
      currentMomentum: initialMomentum,
      initialKE,
      currentKE: initialKE,
      coefficientOfRestitution: restitution,
    });
  }, [massA, massB, velocityA, velocityB, restitution, calculateMomentum, calculateKE]);

  // Initialize on mount and when parameters change (if not running)
  useEffect(() => {
    if (!running) {
      initializeBalls();
    }
  }, [massA, massB, velocityA, velocityB, restitution, running, initializeBalls]);

  // Elastic collision physics
  const handleCollision = useCallback((ballA: Ball, ballB: Ball, e: number): [Ball, Ball] => {
    const m1 = ballA.mass;
    const m2 = ballB.mass;
    const v1 = ballA.vx;
    const v2 = ballB.vx;

    // 1D elastic collision formulas with coefficient of restitution
    const newV1 = ((m1 - e * m2) * v1 + (1 + e) * m2 * v2) / (m1 + m2);
    const newV2 = ((m2 - e * m1) * v2 + (1 + e) * m1 * v1) / (m1 + m2);

    return [
      { ...ballA, vx: newV1 },
      { ...ballB, vx: newV2 },
    ];
  }, []);

  // Physics simulation loop
  useEffect(() => {
    if (!running) return;

    const simulate = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const dt = Math.min((timestamp - lastUpdateRef.current) / 1000, 0.05);
      lastUpdateRef.current = timestamp;

      setCollision(prev => {
        let balls = prev.balls.map(ball => ({
          ...ball,
          x: ball.x + ball.vx * dt * 50,
        }));

        let isCollided = prev.isCollided;
        let collisionTime = prev.collisionTime;

        const ballA = balls.find(b => b.id === 'A')!;
        const ballB = balls.find(b => b.id === 'B')!;
        
        const dx = ballB.x - ballA.x;
        const distance = Math.abs(dx);
        const minDist = ballA.radius + ballB.radius;

        if (!prev.isCollided && distance <= minDist) {
          const [newA, newB] = handleCollision(ballA, ballB, restitution);
          balls = balls.map(b => {
            if (b.id === 'A') return newA;
            if (b.id === 'B') return newB;
            return b;
          });
          isCollided = true;
          collisionTime = (Date.now() - startTimeRef.current) / 1000;

          const overlap = minDist - distance;
          if (dx > 0) {
            balls = balls.map(b => {
              if (b.id === 'A') return { ...b, x: b.x - overlap / 2 };
              if (b.id === 'B') return { ...b, x: b.x + overlap / 2 };
              return b;
            });
          }
        }

        // Wall collisions
        balls = balls.map(ball => {
          let newBall = { ...ball };
          if (ball.x - ball.radius < 0) {
            newBall.x = ball.radius;
            newBall.vx = Math.abs(ball.vx) * restitution;
          }
          if (ball.x + ball.radius > CANVAS_WIDTH) {
            newBall.x = CANVAS_WIDTH - ball.radius;
            newBall.vx = -Math.abs(ball.vx) * restitution;
          }
          return newBall;
        });

        const currentMomentum = calculateMomentum(balls);
        const currentKE = calculateKE(balls);

        return {
          ...prev,
          balls,
          isCollided,
          collisionTime,
          currentMomentum,
          currentKE,
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
  }, [running, restitution, handleCollision, calculateMomentum, calculateKE]);

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drawAnimationRef: number;

    const draw = () => {
      // Clear canvas
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

      // Draw ground
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, GROUND_Y, canvas.width, 5);

      // Draw walls
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, 0, 10, GROUND_Y);
      ctx.fillRect(canvas.width - 10, 0, 10, GROUND_Y);

      // Draw center line
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, GROUND_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw balls
      collision.balls.forEach(ball => {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.ellipse(ball.x, GROUND_Y - 5, ball.radius * 0.8, ball.radius * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ball
        const ballGradient = ctx.createRadialGradient(
          ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0,
          ball.x, ball.y, ball.radius
        );
        ballGradient.addColorStop(0, ball.color === '#ef4444' ? '#ff8a8a' : '#60a5fa');
        ballGradient.addColorStop(1, ball.color);
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ball outline
        ctx.strokeStyle = ball.color === '#ef4444' ? '#991b1b' : '#1e40af';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ball label
        ctx.fillStyle = 'white';
        ctx.font = `bold ${ball.radius * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.label, ball.x, ball.y);

        // Velocity vector
        if (Math.abs(ball.vx) > 0.1) {
          const arrowLength = Math.min(Math.abs(ball.vx) * 10, 80);
          const arrowX = ball.x + (ball.vx > 0 ? ball.radius + 5 : -ball.radius - 5);
          const arrowEndX = arrowX + (ball.vx > 0 ? arrowLength : -arrowLength);

          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(arrowX, ball.y);
          ctx.lineTo(arrowEndX, ball.y);
          ctx.stroke();

          // Arrow head
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          if (ball.vx > 0) {
            ctx.moveTo(arrowEndX, ball.y);
            ctx.lineTo(arrowEndX - 10, ball.y - 6);
            ctx.lineTo(arrowEndX - 10, ball.y + 6);
          } else {
            ctx.moveTo(arrowEndX, ball.y);
            ctx.lineTo(arrowEndX + 10, ball.y - 6);
            ctx.lineTo(arrowEndX + 10, ball.y + 6);
          }
          ctx.closePath();
          ctx.fill();

          // Velocity label
          ctx.fillStyle = '#166534';
          ctx.font = '12px Arial';
          ctx.fillText(`v=${ball.vx.toFixed(1)} m/s`, ball.x, ball.y - ball.radius - 15);
        }

        // Mass label
        ctx.fillStyle = '#374151';
        ctx.font = '11px Arial';
        ctx.fillText(`m=${ball.mass.toFixed(1)} kg`, ball.x, ball.y + ball.radius + 20);
      });

      // Draw collision indicator
      if (collision.isCollided) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, GROUND_Y / 2, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#166534';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💥 Collision!', CANVAS_WIDTH / 2, GROUND_Y / 2);
      }

      // Momentum indicator
      const pxDiff = Math.abs(collision.currentMomentum.px - collision.initialMomentum.px);
      const momentumConserved = pxDiff < 0.1;

      ctx.fillStyle = momentumConserved ? '#dcfce7' : '#fef2f2';
      drawRoundRect(ctx, 10, 10, 200, 60, 8);
      ctx.fill();
      ctx.strokeStyle = momentumConserved ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Momentum Conservation', 20, 30);
      ctx.font = '11px Arial';
      ctx.fillText(`Initial: ${collision.initialMomentum.px.toFixed(2)} kg·m/s`, 20, 48);
      ctx.fillText(`Current: ${collision.currentMomentum.px.toFixed(2)} kg·m/s`, 20, 62);

      // Energy indicator
      const keRatio = collision.initialKE > 0 ? collision.currentKE / collision.initialKE : 1;
      const isElastic = Math.abs(keRatio - 1) < 0.05;

      ctx.fillStyle = isElastic ? '#dbeafe' : '#fef3c7';
      drawRoundRect(ctx, CANVAS_WIDTH - 210, 10, 200, 60, 8);
      ctx.fill();
      ctx.strokeStyle = isElastic ? '#3b82f6' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Kinetic Energy', CANVAS_WIDTH - 200, 30);
      ctx.font = '11px Arial';
      ctx.fillText(`Initial: ${collision.initialKE.toFixed(2)} J`, CANVAS_WIDTH - 200, 48);
      ctx.fillText(`Current: ${collision.currentKE.toFixed(2)} J (${(keRatio * 100).toFixed(0)}%)`, CANVAS_WIDTH - 200, 62);

      drawAnimationRef = requestAnimationFrame(draw);
    };

    drawAnimationRef = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(drawAnimationRef);
    };
  }, [collision]);

  // Data capture
  const lastCapturedTime = useRef<number>(-1);

  useEffect(() => {
    if (!running) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    
    if (elapsed - lastCapturedTime.current >= CAPTURE_INTERVAL / 1000) {
      lastCapturedTime.current = elapsed;
      setTime(elapsed);

      const ballA = collision.balls.find(b => b.id === 'A');
      const ballB = collision.balls.find(b => b.id === 'B');

      capture({
        time: parseFloat(elapsed.toFixed(2)),
        momentumX: parseFloat(collision.currentMomentum.px.toFixed(3)),
        kineticEnergy: parseFloat(collision.currentKE.toFixed(3)),
        velocityA: ballA ? parseFloat(ballA.vx.toFixed(3)) : 0,
        velocityB: ballB ? parseFloat(ballB.vx.toFixed(3)) : 0,
        positionA: ballA ? parseFloat(ballA.x.toFixed(1)) : 0,
        positionB: ballB ? parseFloat(ballB.x.toFixed(1)) : 0,
      });
    }
  }, [running, collision, capture]);

  // Mouse handlers for dragging balls
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (running) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (const ball of collision.balls) {
      const dx = x - ball.x;
      const dy = y - ball.y;
      if (dx * dx + dy * dy <= ball.radius * ball.radius) {
        setDragging(ball.id);
        setDragOffset({ x: dx, y: dy });
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || running) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX - dragOffset.x;

    setCollision(prev => ({
      ...prev,
      balls: prev.balls.map(ball => {
        if (ball.id === dragging) {
          const newX = Math.max(ball.radius + 10, Math.min(CANVAS_WIDTH - ball.radius - 10, x));
          return { ...ball, x: newX };
        }
        return ball;
      }),
    }));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleStart = () => {
    startTimeRef.current = Date.now();
    lastUpdateRef.current = 0;
    lastCapturedTime.current = -1;
    setRunning(true);
    startCapture();

    const ballA = collision.balls.find(b => b.id === 'A');
    const ballB = collision.balls.find(b => b.id === 'B');
    capture({
      time: 0,
      momentumX: collision.initialMomentum.px,
      kineticEnergy: collision.initialKE,
      velocityA: ballA?.vx || 0,
      velocityB: ballB?.vx || 0,
      positionA: ballA?.x || 0,
      positionB: ballB?.x || 0,
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
    initializeBalls();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Zap className="text-amber-500" size={24} />
              Elastic Collision Simulation
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
              <ExportBtn data={dataPoints} experimentName="collision" />
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
              🎱 Drag balls to reposition before starting. Adjust mass & velocity on the right.
            </p>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          {/* Ball A Controls */}
          <Card>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              <Circle className="text-red-500" size={20} fill="#ef4444" />
              Ball A (Red)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mass: <span className="font-bold text-red-600">{massA.toFixed(1)} kg</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={massA}
                  onChange={(e) => setMassA(Number(e.target.value))}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Velocity: <span className="font-bold text-red-600">{velocityA.toFixed(1)} m/s</span>
                </label>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={0.5}
                  value={velocityA}
                  onChange={(e) => setVelocityA(Number(e.target.value))}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            </div>
          </Card>

          {/* Ball B Controls */}
          <Card>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              <Circle className="text-blue-500" size={20} fill="#3b82f6" />
              Ball B (Blue)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mass: <span className="font-bold text-blue-600">{massB.toFixed(1)} kg</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={massB}
                  onChange={(e) => setMassB(Number(e.target.value))}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Velocity: <span className="font-bold text-blue-600">{velocityB.toFixed(1)} m/s</span>
                </label>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={0.5}
                  value={velocityB}
                  onChange={(e) => setVelocityB(Number(e.target.value))}
                  disabled={running}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Collision Type */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">⚙️ Collision Type</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restitution (e): <span className="font-bold text-purple-600">{restitution.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={restitution}
                onChange={(e) => setRestitution(Number(e.target.value))}
                disabled={running}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Inelastic (0)</span>
                <span>Elastic (1)</span>
              </div>
            </div>
          </Card>

          {/* Results */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📊 Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-green-50 rounded border border-green-200">
                <span className="text-gray-700">Momentum</span>
                <span className="font-mono font-bold text-green-700">{collision.currentMomentum.px.toFixed(2)} kg·m/s</span>
              </div>
              <div className="flex justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <span className="text-gray-700">Kinetic Energy</span>
                <span className="font-mono font-bold text-blue-700">{collision.currentKE.toFixed(2)} J</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <span className="text-gray-700">Time</span>
                <span className="font-mono font-bold">{time.toFixed(2)} s</span>
              </div>
              {collision.isCollided && collision.collisionTime && (
                <div className="flex justify-between p-2 bg-amber-50 rounded border border-amber-200">
                  <span className="text-gray-700">Collision at</span>
                  <span className="font-mono font-bold text-amber-700">{collision.collisionTime.toFixed(2)} s</span>
                </div>
              )}
            </div>
          </Card>

          {/* Theory */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📐 Formulas</h3>
            <div className="space-y-2 text-xs">
              <div className="bg-purple-50 p-2 rounded border border-purple-200">
                <div className="font-semibold text-gray-900">Momentum</div>
                <div className="font-mono text-purple-800">p = mv (conserved)</div>
              </div>
              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                <div className="font-semibold text-gray-900">Kinetic Energy</div>
                <div className="font-mono text-blue-800">KE = ½mv²</div>
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
            yKey: 'momentumX',
            xLabel: 'Time (s)',
            yLabel: 'Momentum (kg·m/s)',
            title: '📈 Momentum vs Time',
            color: '#22c55e',
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
            color: '#3b82f6',
          }}
        />
      </div>

      {/* Velocity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'velocityA',
            xLabel: 'Time (s)',
            yLabel: 'Velocity A (m/s)',
            title: '📈 Ball A Velocity vs Time',
            color: '#ef4444',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'velocityB',
            xLabel: 'Time (s)',
            yLabel: 'Velocity B (m/s)',
            title: '📈 Ball B Velocity vs Time',
            color: '#3b82f6',
          }}
        />
      </div>
    </div>
  );
}
