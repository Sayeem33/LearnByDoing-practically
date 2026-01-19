import React, { useEffect, useRef, useState } from 'react';
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
 * PhysicsLayer - Renders Matter.js physics using canvas with drag support
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
  const [dragEnabled, setDragEnabled] = useState(true);

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

    // Create mouse constraint for drag & drop
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { type: 'line' },
      },
    });

    Matter.World.add(engine.world, mouseConstraint);
    setDragEnabled(true);

    // Start rendering
    Matter.Render.run(render);

    // Cleanup
    return () => {
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        if (canvasRef.current) {
          canvasRef.current.remove();
        }
        renderRef.current = null;
      }
      if (mouseConstraint) {
        Matter.World.remove(engine.world, mouseConstraint as any);
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

    let frameId: number;
    const collectData = () => {
      // Collect data from all bodies (non-static)
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
      frameId = requestAnimationFrame(collectData);
    };

    frameId = requestAnimationFrame(collectData);

    return () => cancelAnimationFrame(frameId);
  }, [engine, isRunning, onUpdate]);

  return (
    <div className={cn('relative', className)}>
      <canvas 
        ref={canvasRef} 
        className="rounded-xl shadow-lg cursor-grab active:cursor-grabbing w-full" 
        style={{ display: 'block' }}
      />
      {dragEnabled && (
        <div className="absolute bottom-4 left-4 text-xs text-gray-600 bg-white/70 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
          🖱️ <span className="font-medium">Drag objects</span> to move them
        </div>
      )}
    </div>
  );
};

export default PhysicsLayer;