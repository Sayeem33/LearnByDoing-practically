import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { CANVAS, PHYSICS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface PhysicsLayerProps {
  engine: Matter.Engine | null;
  isRunning: boolean;
  onUpdate?: (data: any) => void;
  className?: string;
}

/**
 * PhysicsLayer - Renders Matter.js physics using canvas
 * Uses useRef for high-performance updates (CO1 - State Synchronization)
 */
const PhysicsLayer: React.FC<PhysicsLayerProps> = ({
  engine,
  isRunning,
  onUpdate,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useEffect(() => {
    if (!engine || !canvasRef.current) return;

    // Create renderer
    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: CANVAS.WIDTH,
        height: CANVAS.HEIGHT,
        wireframes: false,
        background: CANVAS.BACKGROUND_COLOR,
        pixelRatio: window.devicePixelRatio || 1,
      },
    });

    renderRef.current = render;

    // Start rendering
    Matter.Render.run(render);

    // Cleanup
    return () => {
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        renderRef.current.canvas.remove();
        renderRef.current = null;
      }
    };
  }, [engine]);

  // Control runner based on isRunning state
  useEffect(() => {
    if (!engine) return;

    if (isRunning) {
      if (!runnerRef.current) {
        runnerRef.current = Matter.Runner.create();
        Matter.Runner.run(runnerRef.current, engine);
      }
    } else {
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
        runnerRef.current = null;
      }
    }

    return () => {
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
        runnerRef.current = null;
      }
    };
  }, [engine, isRunning]);

  // Data collection loop
  useEffect(() => {
    if (!engine || !isRunning || !onUpdate) return;

    let lastTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      // Collect data from all bodies
      const bodies = engine.world.bodies.filter((b) => !b.isStatic);
      
      if (bodies.length > 0) {
        const data = bodies.map((body) => ({
          id: body.id,
          position: body.position,
          velocity: body.velocity,
          speed: Math.sqrt(
            body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y
          ),
          angle: body.angle,
        }));

        onUpdate(data);
      }
    }, 50); // Collect data every 50ms

    return () => clearInterval(interval);
  }, [engine, isRunning, onUpdate]);

  return (
    <div className={cn('relative', className)}>
      <canvas ref={canvasRef} className="rounded-xl shadow-lg" />
    </div>
  );
};

export default PhysicsLayer;