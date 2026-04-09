import { describe, expect, it } from 'vitest';
import { getValidationSummary } from '@/lib/validation';

describe('validation summaries', () => {
  it('validates a free-fall run against d = 1/2 g t^2 and v = g t', () => {
    const summary = getValidationSummary(
      'freefall',
      { height: 100 },
      [
        { time: 0, position: 2, velocity: 0 },
        { time: 1, position: 6.9, velocity: 9.8 },
      ]
    );

    expect(summary.status).toBe('validated');
    expect(summary.metrics).toHaveLength(2);
    expect(summary.passRate).toBe(100);
  });

  it('compares projectile measurements with analytical range, height, and flight time', () => {
    const speed = 20;
    const angle = 45;
    const initialHeight = 0;
    const gravity = 9.81;
    const radians = (angle * Math.PI) / 180;
    const timeOfFlight = (2 * speed * Math.sin(radians)) / gravity;
    const range = speed * Math.cos(radians) * timeOfFlight;
    const maxHeight = (speed * speed * Math.sin(radians) * Math.sin(radians)) / (2 * gravity);

    const summary = getValidationSummary('projectilemotion', {
      angle,
      speed,
      initialHeight,
      measuredRange: range,
      measuredMaxHeight: maxHeight,
      measuredTimeOfFlight: timeOfFlight,
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics).toHaveLength(3);
    expect(summary.accuracyScore).toBe(100);
  });

  it('uses the pendulum period formula with a wider tolerance for larger angles', () => {
    const theoreticalPeriod = 2 * Math.PI * Math.sqrt(1 / 9.81);

    const summary = getValidationSummary('pendulum', {
      length: 1,
      initialAngle: 30,
      measuredPeriod: theoreticalPeriod * 1.05,
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics[0]?.tolerancePercent).toBe(15);
  });

  it('verifies collision momentum and restitution', () => {
    const summary = getValidationSummary('collision', {
      velocityA: 5,
      velocityB: -3,
      restitution: 1,
      collision: {
        isCollided: true,
        initialMomentum: { px: 4, py: 0 },
        currentMomentum: { px: 4.1, py: 0 },
        initialKE: 34,
        currentKE: 33.5,
        coefficientOfRestitution: 1,
        balls: [
          { id: 'A', vx: -3 },
          { id: 'B', vx: 5 },
        ],
      },
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics.length).toBeGreaterThanOrEqual(2);
  });

  it('checks the expected 2:1 gas ratio for electrolysis', () => {
    const summary = getValidationSummary('electrolysis', {
      state: {
        h2Volume: 40,
        o2Volume: 20,
      },
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics).toHaveLength(2);
  });

  it('validates electric field and potential at the probe point', () => {
    const summary = getValidationSummary('electricfields', {
      chargeStrength: 5,
      chargeSeparation: 160,
      probeX: 0,
      fieldStrength: 0.014046875,
      potential: 0,
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics).toHaveLength(2);
  });

  it('checks Ohm’s law for the simple circuits module', () => {
    const summary = getValidationSummary('simplecircuits', {
      voltage: 12,
      circuitResistanceA: 4,
      circuitResistanceB: 6,
      circuitMode: 'series',
      totalResistance: 10,
      current: 1.2,
      voltageDropA: 4.8,
      voltageDropB: 7.2,
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics).toHaveLength(3);
  });

  it('verifies wave interference phase and intensity', () => {
    const pathDifference = 30;
    const waveLength = 120;
    const phaseDifference = (2 * Math.PI * pathDifference) / waveLength;
    const intensity = (1 + Math.cos(phaseDifference)) / 2;

    const summary = getValidationSummary('waveinterference', {
      waveLength,
      pathDifference,
      phaseDifference,
      intensity,
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics).toHaveLength(2);
  });

  it('checks reflection and refraction in the ray optics module', () => {
    const incidentAngle = 45;
    const refractiveIndex = 1.5;
    const refractedAngle =
      (Math.asin(Math.sin((incidentAngle * Math.PI) / 180) / refractiveIndex) * 180) / Math.PI;

    const summary = getValidationSummary('rayoptics', {
      incidentAngle,
      refractiveIndex,
      reflectedAngle: 45,
      refractedAngle,
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics).toHaveLength(2);
  });

  it('verifies the Pythagorean theorem for a right triangle', () => {
    const summary = getValidationSummary('pythagorean', {
      triangleBase: 6,
      triangleHeight: 8,
      hypotenuse: 10,
      theoremLeft: 100,
      theoremRight: 100,
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics).toHaveLength(2);
  });

  it('checks trigonometric ratios for a measured angle', () => {
    const angle = 30;
    const radians = (angle * Math.PI) / 180;

    const summary = getValidationSummary('trigonometry', {
      trigAngle: angle,
      sinValue: Math.sin(radians),
      cosValue: Math.cos(radians),
      tanValue: Math.tan(radians),
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics).toHaveLength(3);
  });

  it('checks the inscribed-angle theorem', () => {
    const summary = getValidationSummary('circletheorems', {
      centralAngle: 100,
      inscribedAngle: 50,
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics).toHaveLength(1);
  });

  it('checks the derivative slope for the parabola module', () => {
    const summary = getValidationSummary('derivativeintuition', {
      derivativeScale: 1.2,
      pointX: 2,
      pointY: 4.8,
      tangentSlope: 4.8,
    });

    expect(summary.status).toBe('validated');
    expect(summary.metrics).toHaveLength(2);
  });

  it('marks unsupported experiments as not available', () => {
    const summary = getValidationSummary('acidbase', {});

    expect(summary.supported).toBe(false);
    expect(summary.status).toBe('not_available');
  });
});
