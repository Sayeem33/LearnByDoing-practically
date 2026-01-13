import React, { useEffect, useRef } from 'react';

export default function TrajectoryCanvas({ path = [], width = 800, height = 400 }: { path: { x: number; y: number }[]; width?: number; height?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (path.length === 0) return;

    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();

    // draw points
    ctx.fillStyle = '#ef4444';
    for (const p of path) {
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
  }, [path]);

  return <canvas ref={ref} width={width} height={height} className="border" />;
}
