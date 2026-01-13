import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CANVAS } from '@/lib/constants';
import PhysicsEngine from '@/engine/PhysicsEngine';

export interface CanvasObject {
  id: string;
  type: string;
  x: number;
  y: number;
  color: string;
  [key: string]: any;
}

export interface CanvasStageProps {
  physicsEngine: PhysicsEngine | null;
  objects: CanvasObject[];
  onCanvasClick?: (x: number, y: number) => void;
  className?: string;
}

const CanvasStage: React.FC<CanvasStageProps> = ({
  physicsEngine,
  objects,
  onCanvasClick,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Handle canvas click
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCanvasClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onCanvasClick(x, y);
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = CANVAS.BACKGROUND_COLOR;
      ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

      // Draw grid (optional)
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS.WIDTH; x += CANVAS.GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS.HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS.HEIGHT; y += CANVAS.GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS.WIDTH, y);
        ctx.stroke();
      }

      // Draw ground
      ctx.fillStyle = '#166534';
      ctx.fillRect(0, CANVAS.HEIGHT - 40, CANVAS.WIDTH, 40);

      // Draw objects from physics engine
      if (physicsEngine) {
        const allBodies = physicsEngine.getWorld().bodies;

        allBodies.forEach((body) => {
          ctx.save();

          // Translate to body position
          ctx.translate(body.position.x, body.position.y);
          ctx.rotate(body.angle);

          // Get render options
          const fillStyle = (body as any).render?.fillStyle || '#8b5cf6';
          ctx.fillStyle = fillStyle;

          // Draw based on shape
          if (body.circleRadius) {
            // Circle
            ctx.beginPath();
            ctx.arc(0, 0, body.circleRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
          } else {
            // Rectangle
            const vertices = body.vertices;
            ctx.beginPath();
            ctx.moveTo(vertices[0].x - body.position.x, vertices[0].y - body.position.y);
            for (let i = 1; i < vertices.length; i++) {
              ctx.lineTo(vertices[i].x - body.position.x, vertices[i].y - body.position.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          ctx.restore();
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [physicsEngine, objects]);

  return (
    <div className={cn('relative bg-white rounded-xl shadow-lg overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        width={CANVAS.WIDTH}
        height={CANVAS.HEIGHT}
        onClick={handleClick}
        className="cursor-crosshair"
      />
      
      {/* Overlay info */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
        <div>Objects: {objects.length}</div>
      </div>
    </div>
  );
};

export default CanvasStage;