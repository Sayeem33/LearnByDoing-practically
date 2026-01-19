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
  const containerRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const [dragEnabled, setDragEnabled] = useState(true);

  useEffect(() => {
    if (!engine || !containerRef.current) return;

    // Create renderer and append to container
    const render = Matter.Render.create({
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

    // Append the canvas to our container
    containerRef.current.innerHTML = ''; // Clear container
    containerRef.current.appendChild(render.canvas);

    // Style the canvas
    render.canvas.style.borderRadius = '0.75rem';
    render.canvas.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    render.canvas.style.cursor = 'grab';
    render.canvas.style.display = 'block';
    render.canvas.style.width = '100%';
    render.canvas.style.height = 'auto';

    // Create mouse for drag & drop
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

    // Start rendering loop
    Matter.Render.run(render);

    // Cleanup
    return () => {
      if (mouseConstraint) {
        try {
          Matter.World.remove(engine.world, mouseConstraint as any);
        } catch (e) {
          // Already removed
        }
      }
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        renderRef.current = null;
      }
    };
  }, [engine]);

  // Data collection loop - separate from rendering
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
      <div 
        ref={containerRef}
        className="rounded-xl overflow-hidden shadow-lg"
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