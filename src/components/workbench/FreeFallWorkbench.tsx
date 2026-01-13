'use client';

import React, { useEffect, useRef, useState } from 'react';
import PhysicsEngine from '@/engine/PhysicsEngine';
import FreeFallEngine from '@/engine/physics/freeFallEngine';
import { useDataStream } from '@/hooks/useDataStream';
import LiveChart from '@/components/analysis/LiveChart';
import VelocityGraph from '@/components/analysis/VelocityGraph';
import PositionGraph from '@/components/analysis/PositionGraph';
import ExportBtn from '@/components/analysis/ExportBtn';

const FREEFALL_CAPTURE_INTERVAL = 50; // ms

export default function FreeFallWorkbench() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [physics] = useState(() => new PhysicsEngine());
  const [engine] = useState(() => new FreeFallEngine(physics));
  const { dataPoints, capture, startCapture, stopCapture, exportCSV, clearData } =
    useDataStream({ captureInterval: FREEFALL_CAPTURE_INTERVAL });

  const [running, setRunning] = useState(false);
  const [height, setHeight] = useState(100);

  useEffect(() => {
    // spawn initial ball
    engine.spawnBall(400, height, 20, { color: '#ef4444' });
    drawLoop();
    return () => {
      physics.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawLoop = () => {
    requestAnimationFrame(() => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current) return drawLoop();

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const objs = physics.getAllObjectsData();
      objs.forEach((o) => {
        if (o.type === 'ball') {
          ctx.beginPath();
          ctx.fillStyle = '#ef4444';
          ctx.arc(o.position.x, o.position.y, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // capture ball telemetry
      const ball = engine.getBallData();
      if (ball) {
        const t = Date.now();
        capture({ time: t, x: ball.position.x, y: ball.position.y, vx: ball.velocity.x, vy: ball.velocity.y, speed: ball.speed });
      }

      drawLoop();
    });
  };

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
    engine.spawnBall(400, h, 20, { color: '#ef4444' });
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex gap-2 mb-4">
            <button className="btn btn-primary" onClick={handleStart} disabled={running}>Start</button>
            <button className="btn btn-secondary" onClick={handleStop} disabled={!running}>Stop</button>
            <button className="btn" onClick={handleReset}>Reset</button>
            <ExportBtn onExportCSV={exportCSV} />
          </div>

          <canvas ref={canvasRef} width={800} height={400} className="border" />
        </div>
      </div>

      <div className="col-span-1 space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Controls</h3>
          <label className="block text-sm text-gray-600">Initial Height</label>
          <input type="range" min={20} max={300} value={height} onChange={handleHeightChange} />
          <div className="text-sm">Height: {height}px</div>
          <div className="mt-4">
            <h4 className="font-semibold">Theory</h4>
            <p>d = ½ g t²</p>
            <p>v = g t</p>
          </div>
        </div>

        <VelocityGraph data={dataPoints.map((d) => ({ time: d.time, vy: d.vy }))} />
        <PositionGraph data={dataPoints.map((d) => ({ time: d.time, y: d.y }))} />
      </div>
    </div>
  );
}
