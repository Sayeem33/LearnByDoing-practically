import { describe, expect, it, vi } from 'vitest';
import ProjectileEngine from '@/engine/physics/projectileEngine';
import { PHYSICS } from '@/lib/constants';

describe('ProjectileEngine', () => {
  it('computes analytical range, flight time, and optimal angle', () => {
    expect(ProjectileEngine.range(20, 45, 9.8)).toBeCloseTo(40.8163, 3);
    expect(ProjectileEngine.timeOfFlight(20, 30, 9.8)).toBeCloseTo(2.0408, 3);
    expect(ProjectileEngine.optimalAngle()).toBe(45);
  });

  it('launches a projectile using scaled canvas velocity', () => {
    const physics = {
      createBall: vi.fn().mockReturnValue('projectile-1'),
      setVelocity: vi.fn(),
      removeObject: vi.fn(),
    } as any;

    const engine = new ProjectileEngine(physics);
    engine.launch(100, 200, 10, 60, { radius: 10, color: '#ef4444' });

    const expectedVx = 10 * PHYSICS.SCALE * Math.cos((60 * Math.PI) / 180);
    const expectedVy = -(10 * PHYSICS.SCALE * Math.sin((60 * Math.PI) / 180));

    expect(physics.createBall).toHaveBeenCalledWith(100, 200, 10, {
      radius: 10,
      color: '#ef4444',
    });
    expect(physics.setVelocity).toHaveBeenCalledWith('projectile-1', {
      x: expectedVx,
      y: expectedVy,
    });
  });
});
