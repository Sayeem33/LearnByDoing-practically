import { describe, expect, it } from 'vitest';
import {
  createInitialStateFromDefinition,
  EXPERIMENT_DEFINITIONS,
  EXPERIMENT_TEMPLATES,
  getExperimentDefinition,
  getExperimentDefinitionsByCategory,
} from '@/lib/experimentDefinitions';
import { SUPPORTED_VALIDATION_EXPERIMENTS } from '@/lib/validation';

describe('experiment definition registry', () => {
  it('exposes schema metadata for existing labs', () => {
    const freeFall = getExperimentDefinition('freefall');
    const projectile = getExperimentDefinition('projectilemotion');
    const collision = getExperimentDefinition('collision');
    const circuits = getExperimentDefinition('simplecircuits');
    const optics = getExperimentDefinition('rayoptics');
    const theorem = getExperimentDefinition('pythagorean');

    expect(freeFall?.name).toBe('Free Fall');
    expect(freeFall?.controls).toHaveLength(1);
    expect(freeFall?.formulas.length).toBeGreaterThan(0);
    expect(freeFall?.tutorialSteps.length).toBeGreaterThan(0);
    expect(freeFall?.outputMetrics.length).toBeGreaterThan(0);
    expect(projectile?.controls.some((control) => control.kind === 'select')).toBe(true);
    expect(collision?.controls.some((control) => control.kind === 'toggle')).toBe(true);
    expect(circuits?.controls.some((control) => control.kind === 'select')).toBe(true);
    expect(optics?.validationRules.every((rule) => rule.implemented)).toBe(true);
    expect(theorem?.category).toBe('math');
  });

  it('derives backwards-compatible experiment templates from definitions', () => {
    expect(EXPERIMENT_TEMPLATES.projectilemotion.name).toBe('Projectile Motion');
    expect(EXPERIMENT_TEMPLATES.projectilemotion.objectives).toContain(
      'Analyze range vs angle relationship'
    );
  });

  it('builds initial state from the schema definition', () => {
    const state = createInitialStateFromDefinition('collision', {
      height: 100,
      angle: 45,
      speed: 25,
      initialHeight: 2,
      length: 2,
      mass: 1,
      initialAngle: 30,
      damping: 0.01,
      massA: 4,
      massB: 3,
      velocityA: 6,
      velocityB: -2,
      restitution: 0.9,
      voltage: 6,
      electrolyteConc: 0.5,
      showVectors: true,
      measurementMode: 'standard',
      chargeStrength: 5,
      chargeSeparation: 160,
      probeDistance: 120,
      circuitResistanceA: 4,
      circuitResistanceB: 6,
      circuitMode: 'series',
      waveAmplitude: 30,
      waveFrequency: 1.5,
      waveLength: 120,
      sourceSeparation: 120,
      incidentAngle: 45,
      refractiveIndex: 1.5,
      triangleBase: 6,
      triangleHeight: 8,
      trigAngle: 35,
      circleCentralAngle: 80,
      derivativePointX: 1.5,
      derivativeScale: 1,
    });

    expect(state.massA).toBe(4);
    expect(state.collision.balls).toHaveLength(2);
    expect(state.collision.coefficientOfRestitution).toBe(0.9);
    expect(state.sessionOptions.showVectors).toBe(true);
  });

  it('groups definitions by category and exposes validation support from schema rules', () => {
    const physicsDefinitions = getExperimentDefinitionsByCategory('physics');

    expect(physicsDefinitions.length).toBeGreaterThan(0);
    expect(physicsDefinitions.every(([, definition]) => definition.category === 'physics')).toBe(true);
    expect(SUPPORTED_VALIDATION_EXPERIMENTS.has('freefall')).toBe(true);
    expect(SUPPORTED_VALIDATION_EXPERIMENTS.has('electricfields')).toBe(true);
    expect(SUPPORTED_VALIDATION_EXPERIMENTS.has('rayoptics')).toBe(true);
    expect(SUPPORTED_VALIDATION_EXPERIMENTS.has('pythagorean')).toBe(true);
    expect(SUPPORTED_VALIDATION_EXPERIMENTS.has('trigonometry')).toBe(true);
    expect(SUPPORTED_VALIDATION_EXPERIMENTS.has('acidbase')).toBe(false);
  });

  it('keeps every registered definition addressable by id', () => {
    Object.keys(EXPERIMENT_DEFINITIONS).forEach((definitionId) => {
      expect(getExperimentDefinition(definitionId)?.id).toBe(definitionId);
    });
  });
});
