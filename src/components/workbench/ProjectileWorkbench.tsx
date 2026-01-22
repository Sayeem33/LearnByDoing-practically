'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import LiveChart from '@/components/analysis/LiveChart';
import ExportBtn from '@/components/analysis/ExportBtn';
import Card from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Target, Crosshair } from 'lucide-react';

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
const SCALE = 10; // pixels per meter (lower scale for longer range)

// Canvas dimensions
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 500;
const GROUND_Y = CANVAS_HEIGHT - 50;
const CANNON_X = 80;
const CANNON_Y = GROUND_Y - 30;

const CAPTURE_INTERVAL = 50;

// Projectile state interface
interface ProjectileState {
  x: number; // meters
  y: number; // meters (from ground)
  vx: number; // m/s
  vy: number; // m/s
  launched: boolean;
  landed: boolean;
}

export default function ProjectileWorkbench() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { dataPoints, capture, clearData, startCapture, stopCapture } = useDataStream({ captureInterval: CAPTURE_INTERVAL });

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // User adjustable parameters
  const [angle, setAngle] = useState(45); // degrees
  const [speed, setSpeed] = useState(25); // m/s
  const [initialHeight, setInitialHeight] = useState(2); // meters

  // Projectile state
  const [projectile, setProjectile] = useState<ProjectileState>({
    x: 0,
    y: 2,
    vx: 0,
    vy: 0,
    launched: false,
    landed: false,
  });

  // Trajectory path for drawing
  const [trajectory, setTrajectory] = useState<{ x: number; y: number }[]>([]);

  // Dragging cannon angle
  const [draggingAngle, setDraggingAngle] = useState(false);

  // Measured values
  const [measuredRange, setMeasuredRange] = useState<number | null>(null);
  const [measuredMaxHeight, setMeasuredMaxHeight] = useState<number | null>(null);
  const [measuredTimeOfFlight, setMeasuredTimeOfFlight] = useState<number | null>(null);
  const maxHeightRef = useRef<number>(0);

  // Analytical calculations
  const analyticalRange = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    const v0x = speed * Math.cos(rad);
    const v0y = speed * Math.sin(rad);
    // Time to hit ground from height h: -h = v0y*t - 0.5*g*t²
    // 0.5*g*t² - v0y*t - h = 0
    // t = (v0y + sqrt(v0y² + 2*g*h)) / g
    const discriminant = v0y * v0y + 2 * GRAVITY * initialHeight;
    const t = (v0y + Math.sqrt(discriminant)) / GRAVITY;
    return v0x * t;
  }, [angle, speed, initialHeight]);

  const analyticalMaxHeight = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    const v0y = speed * Math.sin(rad);
    // Max height = h0 + v0y²/(2g)
    return initialHeight + (v0y * v0y) / (2 * GRAVITY);
  }, [angle, speed, initialHeight]);

  const analyticalTimeOfFlight = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    const v0y = speed * Math.sin(rad);
    const discriminant = v0y * v0y + 2 * GRAVITY * initialHeight;
    return (v0y + Math.sqrt(discriminant)) / GRAVITY;
  }, [angle, speed, initialHeight]);

  // Initialize projectile
  const initializeProjectile = useCallback(() => {
    setProjectile({
      x: 0,
      y: initialHeight,
      vx: 0,
      vy: 0,
      launched: false,
      landed: false,
    });
    setTrajectory([]);
    setMeasuredRange(null);
    setMeasuredMaxHeight(null);
    setMeasuredTimeOfFlight(null);
    maxHeightRef.current = initialHeight;
  }, [initialHeight]);

  // Initialize on mount and parameter changes (when not running)
  useEffect(() => {
    if (!running) {
      initializeProjectile();
    }
  }, [angle, speed, initialHeight, running, initializeProjectile]);

  // Physics simulation
  useEffect(() => {
    if (!running || projectile.landed) return;

    const simulate = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const dt = Math.min((timestamp - lastUpdateRef.current) / 1000, 0.05);
      lastUpdateRef.current = timestamp;

      setProjectile(prev => {
        if (prev.landed) return prev;

        // Apply gravity to vy
        const newVy = prev.vy - GRAVITY * dt;
        const newX = prev.x + prev.vx * dt;
        const newY = prev.y + prev.vy * dt - 0.5 * GRAVITY * dt * dt;

        // Track max height
        if (newY > maxHeightRef.current) {
          maxHeightRef.current = newY;
        }

        // Check if landed
        if (newY <= 0) {
          const elapsed = (timestamp - startTimeRef.current) / 1000;
          setMeasuredRange(newX);
          setMeasuredMaxHeight(maxHeightRef.current);
          setMeasuredTimeOfFlight(elapsed);
          setRunning(false);
          stopCapture();
          return { ...prev, x: newX, y: 0, vx: prev.vx, vy: 0, landed: true };
        }

        // Add to trajectory
        setTrajectory(traj => [...traj, { x: newX, y: newY }]);

        return { ...prev, x: newX, y: newY, vx: prev.vx, vy: newVy };
      });

      if (!projectile.landed) {
        animationRef.current = requestAnimationFrame(simulate);
      }
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running, projectile.landed, stopCapture]);

  // Drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let drawAnimationRef: number;

    const draw = () => {
      // Clear canvas with sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87ceeb');
      gradient.addColorStop(0.7, '#e0f2fe');
      gradient.addColorStop(1, '#a7f3d0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GROUND_Y);
        ctx.stroke();
      }
      for (let y = 0; y < GROUND_Y; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw ground
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
      
      // Grass texture
      ctx.strokeStyle = '#4d7c0f';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y);
        ctx.lineTo(x + 5, GROUND_Y - 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 7, GROUND_Y);
        ctx.lineTo(x + 10, GROUND_Y - 6);
        ctx.stroke();
      }

      // Draw distance markers
      ctx.fillStyle = '#374151';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      for (let d = 0; d <= 80; d += 10) {
        const markerX = CANNON_X + d * SCALE;
        if (markerX < canvas.width - 30) {
          ctx.fillStyle = '#f5f5f4';
          ctx.fillRect(markerX - 1, GROUND_Y - 5, 2, 10);
          ctx.fillStyle = '#374151';
          ctx.fillText(`${d}m`, markerX, GROUND_Y + 20);
        }
      }

      // Draw height markers
      ctx.textAlign = 'right';
      for (let h = 0; h <= 40; h += 10) {
        const markerY = GROUND_Y - h * SCALE;
        if (markerY > 20) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(5, markerY - 1, 25, 2);
          ctx.fillStyle = '#374151';
          ctx.fillText(`${h}m`, 45, markerY + 4);
        }
      }

      // Draw theoretical trajectory (dashed)
      if (!projectile.launched || trajectory.length < 2) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();

        const rad = (angle * Math.PI) / 180;
        const v0x = speed * Math.cos(rad);
        const v0y = speed * Math.sin(rad);

        let firstPoint = true;
        for (let t = 0; t <= analyticalTimeOfFlight + 0.5; t += 0.05) {
          const x = v0x * t;
          const y = initialHeight + v0y * t - 0.5 * GRAVITY * t * t;
          if (y < 0) break;

          const canvasX = CANNON_X + x * SCALE;
          const canvasY = GROUND_Y - y * SCALE;

          if (firstPoint) {
            ctx.moveTo(canvasX, canvasY);
            firstPoint = false;
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw actual trajectory
      if (trajectory.length > 1) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        trajectory.forEach((pt, i) => {
          const canvasX = CANNON_X + pt.x * SCALE;
          const canvasY = GROUND_Y - pt.y * SCALE;
          if (i === 0) {
            ctx.moveTo(canvasX, canvasY);
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        });
        ctx.stroke();
      }

      // Draw cannon base
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(CANNON_X - 30, GROUND_Y - 20, 60, 20);
      
      // Cannon wheels
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(CANNON_X - 15, GROUND_Y - 5, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(CANNON_X + 15, GROUND_Y - 5, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.arc(CANNON_X - 15, GROUND_Y - 5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(CANNON_X + 15, GROUND_Y - 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw cannon barrel
      const cannonLength = 50;
      const rad = (angle * Math.PI) / 180;
      const barrelEndX = CANNON_X + cannonLength * Math.cos(rad);
      const barrelEndY = CANNON_Y - cannonLength * Math.sin(rad);

      ctx.save();
      ctx.translate(CANNON_X, CANNON_Y);
      ctx.rotate(-rad);

      // Barrel
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(0, -8, cannonLength, 16);
      ctx.fillStyle = '#374151';
      ctx.fillRect(cannonLength - 10, -10, 10, 20);

      // Barrel details
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(10, -6, 5, 12);
      ctx.fillRect(25, -6, 5, 12);

      ctx.restore();

      // Draw angle indicator arc
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(CANNON_X, CANNON_Y, 30, 0, -rad, true);
      ctx.stroke();

      // Angle label
      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${angle}°`, CANNON_X + 35, CANNON_Y - 5);

      // Draw projectile
      if (projectile.launched) {
        const projCanvasX = CANNON_X + projectile.x * SCALE;
        const projCanvasY = GROUND_Y - projectile.y * SCALE;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(projCanvasX, GROUND_Y - 3, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Projectile
        const projGradient = ctx.createRadialGradient(
          projCanvasX - 3, projCanvasY - 3, 0,
          projCanvasX, projCanvasY, 12
        );
        projGradient.addColorStop(0, '#fca5a5');
        projGradient.addColorStop(1, '#ef4444');
        ctx.fillStyle = projGradient;
        ctx.beginPath();
        ctx.arc(projCanvasX, projCanvasY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Velocity vector
        if (!projectile.landed && (Math.abs(projectile.vx) > 0.1 || Math.abs(projectile.vy) > 0.1)) {
          const vScale = 3;
          const vxPx = projectile.vx * vScale;
          const vyPx = -projectile.vy * vScale;

          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(projCanvasX, projCanvasY);
          ctx.lineTo(projCanvasX + vxPx, projCanvasY + vyPx);
          ctx.stroke();

          // Arrow head
          const vAngle = Math.atan2(vyPx, vxPx);
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.moveTo(projCanvasX + vxPx, projCanvasY + vyPx);
          ctx.lineTo(projCanvasX + vxPx - 8 * Math.cos(vAngle - 0.4), projCanvasY + vyPx - 8 * Math.sin(vAngle - 0.4));
          ctx.lineTo(projCanvasX + vxPx - 8 * Math.cos(vAngle + 0.4), projCanvasY + vyPx - 8 * Math.sin(vAngle + 0.4));
          ctx.closePath();
          ctx.fill();
        }
      }

      // Draw landing marker if landed
      if (projectile.landed && measuredRange !== null) {
        const landX = CANNON_X + measuredRange * SCALE;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(landX - 15, GROUND_Y - 15);
        ctx.lineTo(landX + 15, GROUND_Y + 15);
        ctx.moveTo(landX + 15, GROUND_Y - 15);
        ctx.lineTo(landX - 15, GROUND_Y + 15);
        ctx.stroke();

        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${measuredRange.toFixed(1)} m`, landX, GROUND_Y - 25);
      }

      // Draw max height marker
      if (measuredMaxHeight !== null && measuredMaxHeight > initialHeight + 0.5) {
        const maxHeightY = GROUND_Y - measuredMaxHeight * SCALE;
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(50, maxHeightY);
        ctx.lineTo(canvas.width - 50, maxHeightY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#7c3aed';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Max: ${measuredMaxHeight.toFixed(1)} m`, canvas.width - 60, maxHeightY - 5);
      }

      // Draw info panel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      drawRoundRect(ctx, canvas.width - 200, 10, 190, 100, 8);
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('📊 Live Data', canvas.width - 190, 30);
      ctx.font = '11px Arial';
      ctx.fillText(`Position: (${projectile.x.toFixed(1)}, ${projectile.y.toFixed(1)}) m`, canvas.width - 190, 48);
      ctx.fillText(`Velocity: (${projectile.vx.toFixed(1)}, ${projectile.vy.toFixed(1)}) m/s`, canvas.width - 190, 64);
      const currentSpeed = Math.sqrt(projectile.vx ** 2 + projectile.vy ** 2);
      ctx.fillText(`Speed: ${currentSpeed.toFixed(1)} m/s`, canvas.width - 190, 80);
      ctx.fillText(`Height: ${projectile.y.toFixed(1)} m`, canvas.width - 190, 96);

      // Drag instruction when not running
      if (!running && !projectile.launched) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 Drag cannon barrel to adjust angle, then click Launch!', canvas.width / 2, 30);
      }

      drawAnimationRef = requestAnimationFrame(draw);
    };

    drawAnimationRef = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(drawAnimationRef);
    };
  }, [projectile, trajectory, angle, speed, initialHeight, analyticalTimeOfFlight, measuredRange, measuredMaxHeight, running]);

  // Data capture
  const lastCapturedTime = useRef<number>(-1);

  useEffect(() => {
    if (!running || projectile.landed) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    if (elapsed - lastCapturedTime.current >= CAPTURE_INTERVAL / 1000) {
      lastCapturedTime.current = elapsed;
      setTime(elapsed);

      const currentSpeed = Math.sqrt(projectile.vx ** 2 + projectile.vy ** 2);

      capture({
        time: parseFloat(elapsed.toFixed(2)),
        x: parseFloat(projectile.x.toFixed(2)),
        y: parseFloat(projectile.y.toFixed(2)),
        vx: parseFloat(projectile.vx.toFixed(2)),
        vy: parseFloat(projectile.vy.toFixed(2)),
        speed: parseFloat(currentSpeed.toFixed(2)),
      });
    }
  }, [running, projectile, capture]);

  // Mouse handlers for dragging cannon angle
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (running || projectile.launched) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking near cannon
    const dx = x - CANNON_X;
    const dy = CANNON_Y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 80) {
      setDraggingAngle(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingAngle || running) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const dx = x - CANNON_X;
    const dy = CANNON_Y - y;
    let newAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Clamp angle between 5 and 85 degrees
    newAngle = Math.max(5, Math.min(85, newAngle));
    setAngle(Math.round(newAngle));
  };

  const handleMouseUp = () => {
    setDraggingAngle(false);
  };

  const handleLaunch = () => {
    const rad = (angle * Math.PI) / 180;
    const v0x = speed * Math.cos(rad);
    const v0y = speed * Math.sin(rad);

    setProjectile({
      x: 0,
      y: initialHeight,
      vx: v0x,
      vy: v0y,
      launched: true,
      landed: false,
    });

    setTrajectory([{ x: 0, y: initialHeight }]);
    maxHeightRef.current = initialHeight;

    startTimeRef.current = Date.now();
    lastUpdateRef.current = 0;
    lastCapturedTime.current = -1;
    setRunning(true);
    startCapture();

    // Capture initial state
    capture({
      time: 0,
      x: 0,
      y: initialHeight,
      vx: parseFloat(v0x.toFixed(2)),
      vy: parseFloat(v0y.toFixed(2)),
      speed: speed,
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
    initializeProjectile();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Target className="text-red-500" size={24} />
              Projectile Motion Simulation
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {!projectile.launched ? (
                <button
                  onClick={handleLaunch}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  <Play size={18} /> Launch
                </button>
              ) : !projectile.landed ? (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                >
                  <Pause size={18} /> Stop
                </button>
              ) : null}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
              >
                <RotateCcw size={18} /> Reset
              </button>
              <ExportBtn data={dataPoints} experimentName="projectile" />
            </div>

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="border-2 border-gray-200 rounded-lg w-full cursor-crosshair"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            <p className="text-sm text-gray-600 mt-3 text-center">
              🎯 Drag near the cannon to adjust launch angle. Blue dashed line shows predicted trajectory.
            </p>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          {/* Launch Parameters */}
          <Card>
            <h3 className="font-bold text-lg mb-3 text-gray-900 flex items-center gap-2">
              <Crosshair className="text-amber-500" size={20} />
              Launch Parameters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Launch Angle: <span className="font-bold text-amber-600">{angle}°</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={85}
                  step={1}
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  disabled={running || projectile.launched}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">45° gives maximum range on flat ground</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Speed: <span className="font-bold text-blue-600">{speed} m/s</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={1}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  disabled={running || projectile.launched}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Height: <span className="font-bold text-purple-600">{initialHeight} m</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={0.5}
                  value={initialHeight}
                  onChange={(e) => setInitialHeight(Number(e.target.value))}
                  disabled={running || projectile.launched}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          </Card>

          {/* Velocity Components */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📐 Velocity Components</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <span className="text-gray-700">v₀ₓ (horizontal)</span>
                <span className="font-mono font-bold text-blue-700">
                  {(speed * Math.cos((angle * Math.PI) / 180)).toFixed(2)} m/s
                </span>
              </div>
              <div className="flex justify-between p-2 bg-green-50 rounded border border-green-200">
                <span className="text-gray-700">v₀ᵧ (vertical)</span>
                <span className="font-mono font-bold text-green-700">
                  {(speed * Math.sin((angle * Math.PI) / 180)).toFixed(2)} m/s
                </span>
              </div>
            </div>
          </Card>

          {/* Predictions vs Measurements */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📊 Predicted vs Measured</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-1 text-xs font-semibold text-gray-600 pb-1 border-b">
                <span>Quantity</span>
                <span className="text-center">Predicted</span>
                <span className="text-center">Measured</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <span className="text-gray-700">Range</span>
                <span className="text-center font-mono text-blue-600">{analyticalRange.toFixed(1)} m</span>
                <span className="text-center font-mono text-green-600">
                  {measuredRange !== null ? `${measuredRange.toFixed(1)} m` : '—'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <span className="text-gray-700">Max Height</span>
                <span className="text-center font-mono text-blue-600">{analyticalMaxHeight.toFixed(1)} m</span>
                <span className="text-center font-mono text-green-600">
                  {measuredMaxHeight !== null ? `${measuredMaxHeight.toFixed(1)} m` : '—'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <span className="text-gray-700">Time of Flight</span>
                <span className="text-center font-mono text-blue-600">{analyticalTimeOfFlight.toFixed(2)} s</span>
                <span className="text-center font-mono text-green-600">
                  {measuredTimeOfFlight !== null ? `${measuredTimeOfFlight.toFixed(2)} s` : '—'}
                </span>
              </div>
            </div>
          </Card>

          {/* Current State */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">⏱️ Current State</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <span className="text-gray-700">Time</span>
                <span className="font-mono font-bold">{time.toFixed(2)} s</span>
              </div>
              <div className="flex justify-between p-2 bg-amber-50 rounded border border-amber-200">
                <span className="text-gray-700">Height</span>
                <span className="font-mono font-bold text-amber-700">{projectile.y.toFixed(1)} m</span>
              </div>
              <div className="flex justify-between p-2 bg-red-50 rounded border border-red-200">
                <span className="text-gray-700">Distance</span>
                <span className="font-mono font-bold text-red-700">{projectile.x.toFixed(1)} m</span>
              </div>
            </div>
          </Card>

          {/* Theory */}
          <Card>
            <h3 className="font-bold text-sm text-gray-900 mb-3">📐 Formulas</h3>
            <div className="space-y-2 text-xs">
              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                <div className="font-semibold text-gray-900">Position</div>
                <div className="font-mono text-blue-800">x = v₀ₓt</div>
                <div className="font-mono text-blue-800">y = h₀ + v₀ᵧt - ½gt²</div>
              </div>
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <div className="font-semibold text-gray-900">Range (h₀=0)</div>
                <div className="font-mono text-green-800">R = v₀²sin(2θ)/g</div>
              </div>
              <div className="bg-purple-50 p-2 rounded border border-purple-200">
                <div className="font-semibold text-gray-900">Max Height</div>
                <div className="font-mono text-purple-800">H = h₀ + v₀ᵧ²/(2g)</div>
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
            yKey: 'y',
            xLabel: 'Time (s)',
            yLabel: 'Height (m)',
            title: '📈 Height vs Time',
            color: '#8b5cf6',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'x',
            xLabel: 'Time (s)',
            yLabel: 'Horizontal Distance (m)',
            title: '📈 Distance vs Time',
            color: '#ef4444',
          }}
        />
      </div>

      {/* Velocity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'time',
            yKey: 'vy',
            xLabel: 'Time (s)',
            yLabel: 'Vertical Velocity (m/s)',
            title: '📈 Vertical Velocity vs Time',
            color: '#22c55e',
          }}
        />
        <LiveChart
          data={dataPoints}
          config={{
            xKey: 'x',
            yKey: 'y',
            xLabel: 'Horizontal Distance (m)',
            yLabel: 'Height (m)',
            title: '📈 Trajectory (y vs x)',
            color: '#3b82f6',
          }}
        />
      </div>
    </div>
  );
}