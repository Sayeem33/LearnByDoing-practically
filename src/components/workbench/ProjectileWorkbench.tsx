'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import PhysicsEngine from '@/engine/PhysicsEngine';
import ProjectileEngine from '@/engine/physics/projectileEngine';
import TrajectoryCanvas from '@/components/analysis/TrajectoryCanvas';
import { useDataStream } from '@/hooks/useDataStream';

export default function ProjectileWorkbench() {
  const [physics] = useState(() => new PhysicsEngine());
  const [engine] = useState(() => new ProjectileEngine(physics));
  const [angle, setAngle] = useState(45);
  const [speed, setSpeed] = useState(20);
  const [autoLaunch, setAutoLaunch] = useState(true);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const { dataPoints, capture, startCapture, stopCapture, exportCSV, clearData } = useDataStream({ captureInterval: 50 });

  useEffect(() => {
    // draw loop to sample projectile position when running
    let raf = 0;
    const loop = () => {
      const pid = engine.projectileId;
      if (pid) {
        const d = physics.getObjectData(pid);
        if (d) {
          setPath((p) => [...p, { x: d.position.x, y: d.position.y }]);
          capture({ time: Date.now(), x: d.position.x, y: d.position.y, vx: d.velocity.x, vy: d.velocity.y });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLaunch = (reset = true) => {
    if (reset) physics.reset();
    engine.launch(50, 400, speed, angle, { color: '#ef4444' });
    physics.start();
    startCapture();
    setPath([]);
  };

  const handleManualLaunch = () => handleLaunch(false);

  const range = useMemo(() => ProjectileEngine.range(speed, angle), [speed, angle]);
  const tof = useMemo(() => ProjectileEngine.timeOfFlight(speed, angle), [speed, angle]);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex gap-2 mb-4">
            <button className="btn btn-primary" onClick={() => handleLaunch(true)}>Launch (Reset)</button>
            <button className="btn btn-secondary" onClick={handleManualLaunch}>Manual Launch</button>
            <button className="btn btn-outline" onClick={exportCSV}>Export CSV</button>
          </div>
          <TrajectoryCanvas path={path} />
        </div>
      </div>

      <div className="col-span-1 space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <label className="block text-sm text-gray-600">Angle: {angle}°</label>
          <input type="range" min={15} max={75} value={angle} onChange={(e) => setAngle(Number(e.target.value))} />

          <label className="block text-sm text-gray-600 mt-3">Initial Speed: {speed} m/s</label>
          <input type="range" min={10} max={40} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />

          <div className="mt-3">
            <label className="inline-flex items-center">
              <input type="checkbox" checked={autoLaunch} onChange={(e) => setAutoLaunch(e.target.checked)} className="mr-2" />
              <span className="text-sm">Auto-launch on start</span>
            </label>
          </div>

          <div className="mt-4">
            <strong>Computed</strong>
            <p>Range (analytical): {range.toFixed(2)} m</p>
            <p>Time of flight (analytical): {tof.toFixed(2)} s</p>
            <p>Optimal angle ≈ 45°</p>
          </div>
        </div>
      </div>
    </div>
  );
}
