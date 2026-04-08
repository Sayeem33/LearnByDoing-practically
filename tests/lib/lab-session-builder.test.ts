import { describe, expect, it } from 'vitest';
import { createInitialLabState, DEFAULT_NEW_LAB_CONFIG } from '@/lib/labSessionBuilder';

describe('lab session builder', () => {
  it('creates a configured free-fall state', () => {
    const state = createInitialLabState('freefall', {
      ...DEFAULT_NEW_LAB_CONFIG,
      height: 240,
    });

    expect(state.height).toBe(240);
    expect(state.objects?.[0]?.type).toBe('ball');
    expect(state.dataPoints).toEqual([]);
  });

  it('creates a configured projectile state', () => {
    const state = createInitialLabState('projectilemotion', {
      ...DEFAULT_NEW_LAB_CONFIG,
      angle: 55,
      speed: 30,
      initialHeight: 4,
    });

    expect(state.angle).toBe(55);
    expect(state.speed).toBe(30);
    expect(state.initialHeight).toBe(4);
    expect(state.projectile?.y).toBe(4);
  });

  it('creates a chemistry state from the template defaults', () => {
    const state = createInitialLabState('acidbase', DEFAULT_NEW_LAB_CONFIG);

    expect(state.chemicals).toEqual(['HCl', 'NaOH']);
    expect(state.dataPoints).toEqual([]);
  });
});
