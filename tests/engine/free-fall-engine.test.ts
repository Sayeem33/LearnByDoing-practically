import { describe, expect, it, vi } from 'vitest';
import FreeFallEngine from '@/engine/physics/freeFallEngine';

describe('FreeFallEngine', () => {
  it('computes theoretical distance and velocity correctly', () => {
    expect(FreeFallEngine.theoreticalDistance(9.8, 2)).toBeCloseTo(19.6, 5);
    expect(FreeFallEngine.theoreticalVelocity(9.8, 3)).toBeCloseTo(29.4, 5);
  });

  it('recreates the ball when the initial height changes', () => {
    const physics = {
      createBall: vi
        .fn()
        .mockReturnValueOnce('ball-1')
        .mockReturnValueOnce('ball-2'),
      removeObject: vi.fn(),
      getObjectData: vi.fn().mockReturnValue({
        position: { x: 250, y: 100 },
        metadata: { radius: 18, color: '#ef4444' },
      }),
      setVelocity: vi.fn(),
    } as any;

    const engine = new FreeFallEngine(physics);
    engine.spawnBall(250, 100, 18, { color: '#ef4444' });
    engine.setInitialHeight(220);

    expect(physics.removeObject).toHaveBeenNthCalledWith(1, 'ball-1');
    expect(physics.setVelocity).toHaveBeenCalledWith('ball-1', { x: 0, y: 0 });
    expect(physics.createBall).toHaveBeenLastCalledWith(250, 220, 18, {
      radius: 18,
      color: '#ef4444',
    });
    expect(engine.ballId).toBe('ball-2');
  });
});
