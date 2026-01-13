'use client';

import React, { useEffect, useState } from 'react';
import PhysicsEngine from '@/engine/PhysicsEngine';
import CollisionEngine from '@/engine/physics/collisionEngine';

export default function CollisionWorkbench() {
  const [physics] = useState(() => new PhysicsEngine());
  const [engine] = useState(() => new CollisionEngine(physics));
  const [mA, setMA] = useState(1);
  const [mB, setMB] = useState(1);
  const [vA, setVA] = useState(5);
  const [vB, setVB] = useState(0);

  useEffect(() => {
    engine.spawnPair({ density: mA }, { density: mB });
    return () => physics.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    engine.setVelocities({ x: vA, y: 0 }, { x: vB, y: 0 });
    physics.start();
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white p-4 rounded shadow">
        <div className="flex gap-2 mb-4">
          <button onClick={handleStart} className="btn btn-primary">Start</button>
        </div>
        <div className="h-96 border flex items-center justify-center">Collision canvas preview</div>
      </div>

      <div className="col-span-1 space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <label className="block text-sm">Mass A: {mA} kg</label>
          <input type="range" min={0.2} max={10} step={0.1} value={mA} onChange={(e) => setMA(Number(e.target.value))} />
          <label className="block text-sm mt-2">Mass B: {mB} kg</label>
          <input type="range" min={0.2} max={10} step={0.1} value={mB} onChange={(e) => setMB(Number(e.target.value))} />
          <label className="block text-sm mt-2">Velocity A: {vA} m/s</label>
          <input type="range" min={-20} max={20} step={0.5} value={vA} onChange={(e) => setVA(Number(e.target.value))} />
        </div>
      </div>
    </div>
  );
}
