import { EXPERIMENT_DEFINITIONS } from '@/lib/experimentDefinitions';
import { PHYSICS } from '@/lib/constants';

export type ValidationStatus =
  | 'validated'
  | 'needs_review'
  | 'insufficient_data'
  | 'not_available';

export interface ValidationMetric {
  key: string;
  label: string;
  theoretical: number | null;
  measured: number | null;
  unit?: string;
  tolerancePercent: number;
  errorPercent: number | null;
  withinTolerance: boolean;
  note?: string;
}

export interface ValidationSummary {
  experimentType: string;
  title: string;
  status: ValidationStatus;
  generatedAt: string;
  accuracyScore: number | null;
  passRate: number;
  supported: boolean;
  metrics: ValidationMetric[];
  notes: string[];
}

interface RawMetricInput {
  key: string;
  label: string;
  theoretical: number | null | undefined;
  measured: number | null | undefined;
  unit?: string;
  tolerancePercent?: number;
  note?: string;
}

const EPSILON = 1e-6;
const FREE_FALL_GRAVITY = PHYSICS.GRAVITY;
const PROJECTILE_GRAVITY = 9.81;
const PENDULUM_GRAVITY = 9.81;
const ELECTRIC_FIELD_CONSTANT = 8.99;

export const SUPPORTED_VALIDATION_EXPERIMENTS = new Set(
  Object.entries(EXPERIMENT_DEFINITIONS)
    .filter(([, definition]) => definition.validationRules.some((rule) => rule.implemented))
    .map(([experimentId]) => experimentId)
);

export const VALIDATION_STATUS_META: Record<
  ValidationStatus,
  { label: string; className: string; accentClassName: string }
> = {
  validated: {
    label: 'Validated',
    className: 'bg-green-100 text-green-700',
    accentClassName: 'text-green-600',
  },
  needs_review: {
    label: 'Needs Review',
    className: 'bg-amber-100 text-amber-700',
    accentClassName: 'text-amber-600',
  },
  insufficient_data: {
    label: 'Need More Data',
    className: 'bg-slate-100 text-slate-700',
    accentClassName: 'text-slate-600',
  },
  not_available: {
    label: 'Not Available',
    className: 'bg-gray-100 text-gray-700',
    accentClassName: 'text-gray-500',
  },
};

function round(value: number, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function asFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function calculateErrorPercent(theoretical: number, measured: number) {
  const denominator = Math.max(Math.abs(theoretical), EPSILON);
  return round((Math.abs(measured - theoretical) / denominator) * 100, 2);
}

function createMetric({
  key,
  label,
  theoretical,
  measured,
  unit,
  tolerancePercent = 10,
  note,
}: RawMetricInput): ValidationMetric | null {
  const safeTheoretical = asFiniteNumber(theoretical);
  const safeMeasured = asFiniteNumber(measured);

  if (safeTheoretical === null || safeMeasured === null) {
    return null;
  }

  const errorPercent = calculateErrorPercent(safeTheoretical, safeMeasured);

  return {
    key,
    label,
    theoretical: round(safeTheoretical),
    measured: round(safeMeasured),
    unit,
    tolerancePercent,
    errorPercent,
    withinTolerance: errorPercent <= tolerancePercent,
    note,
  };
}

function finalizeSummary(
  experimentType: string,
  title: string,
  metrics: ValidationMetric[],
  notes: string[] = []
): ValidationSummary {
  if (!SUPPORTED_VALIDATION_EXPERIMENTS.has(experimentType)) {
    return {
      experimentType,
      title,
      status: 'not_available',
      generatedAt: new Date().toISOString(),
      accuracyScore: null,
      passRate: 0,
      supported: false,
      metrics: [],
      notes: ['Validation rules are not configured yet for this experiment.'],
    };
  }

  if (!metrics.length) {
    return {
      experimentType,
      title,
      status: 'insufficient_data',
      generatedAt: new Date().toISOString(),
      accuracyScore: null,
      passRate: 0,
      supported: true,
      metrics: [],
      notes:
        notes.length > 0
          ? notes
          : ['Run the simulation longer so measured values can be compared with theory.'],
    };
  }

  const passed = metrics.filter((metric) => metric.withinTolerance).length;
  const passRate = round((passed / metrics.length) * 100, 1);
  const accuracyScore = round(
    metrics.reduce((total, metric) => total + Math.max(0, 100 - (metric.errorPercent || 0)), 0) /
      metrics.length,
    1
  );

  return {
    experimentType,
    title,
    status: passed === metrics.length ? 'validated' : 'needs_review',
    generatedAt: new Date().toISOString(),
    accuracyScore,
    passRate,
    supported: true,
    metrics,
    notes,
  };
}

function buildFreeFallValidation(snapshot: any, dataPoints: Record<string, any>[]) {
  const latestPoint = dataPoints[dataPoints.length - 1];
  const elapsed = asFiniteNumber(latestPoint?.time);

  if (elapsed === null || elapsed <= 0) {
    return finalizeSummary('freefall', 'Free Fall Verification', [], [
      'No time-series samples are available for the free-fall comparison yet.',
    ]);
  }

  const initialHeightMeters =
    asFiniteNumber(snapshot?.height) !== null
      ? Number(snapshot.height) / PHYSICS.SCALE
      : asFiniteNumber(dataPoints[0]?.position) ?? 0;
  const measuredPosition = asFiniteNumber(latestPoint?.position);
  const measuredVelocity = asFiniteNumber(latestPoint?.velocity);

  const displacement =
    measuredPosition === null ? null : Math.max(0, measuredPosition - initialHeightMeters);

  const metrics = [
    createMetric({
      key: 'distance',
      label: 'Displacement after t seconds',
      theoretical: 0.5 * FREE_FALL_GRAVITY * elapsed * elapsed,
      measured: displacement,
      unit: 'm',
      tolerancePercent: 10,
      note: 'Compared against d = 1/2 g t^2 using the latest recorded sample.',
    }),
    createMetric({
      key: 'velocity',
      label: 'Velocity after t seconds',
      theoretical: FREE_FALL_GRAVITY * elapsed,
      measured: measuredVelocity === null ? null : Math.abs(measuredVelocity),
      unit: 'm/s',
      tolerancePercent: 10,
      note: 'Compared against v = g t using the latest recorded sample.',
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('freefall', 'Free Fall Verification', metrics);
}

function buildProjectileValidation(snapshot: any) {
  const angle = asFiniteNumber(snapshot?.angle);
  const speed = asFiniteNumber(snapshot?.speed);
  const initialHeight = asFiniteNumber(snapshot?.initialHeight);

  if (angle === null || speed === null || initialHeight === null) {
    return finalizeSummary('projectilemotion', 'Projectile Motion Verification', [], [
      'Angle, speed, and initial height are required before projectile validation can run.',
    ]);
  }

  const radians = (angle * Math.PI) / 180;
  const horizontalVelocity = speed * Math.cos(radians);
  const verticalVelocity = speed * Math.sin(radians);
  const discriminant = verticalVelocity * verticalVelocity + 2 * PROJECTILE_GRAVITY * initialHeight;
  const timeOfFlight = (verticalVelocity + Math.sqrt(Math.max(discriminant, 0))) / PROJECTILE_GRAVITY;
  const expectedRange = horizontalVelocity * timeOfFlight;
  const expectedMaxHeight =
    initialHeight + (verticalVelocity * verticalVelocity) / (2 * PROJECTILE_GRAVITY);

  const metrics = [
    createMetric({
      key: 'range',
      label: 'Horizontal range',
      theoretical: expectedRange,
      measured: snapshot?.measuredRange,
      unit: 'm',
      tolerancePercent: 8,
    }),
    createMetric({
      key: 'max_height',
      label: 'Maximum height',
      theoretical: expectedMaxHeight,
      measured: snapshot?.measuredMaxHeight,
      unit: 'm',
      tolerancePercent: 8,
    }),
    createMetric({
      key: 'time_of_flight',
      label: 'Time of flight',
      theoretical: timeOfFlight,
      measured: snapshot?.measuredTimeOfFlight,
      unit: 's',
      tolerancePercent: 8,
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('projectilemotion', 'Projectile Motion Verification', metrics);
}

function buildPendulumValidation(snapshot: any) {
  const length = asFiniteNumber(snapshot?.length);
  const initialAngle = asFiniteNumber(snapshot?.initialAngle);

  if (length === null) {
    return finalizeSummary('pendulum', 'Pendulum Verification', [], [
      'Pendulum length is required before the theoretical period can be calculated.',
    ]);
  }

  const metrics = [
    createMetric({
      key: 'period',
      label: 'Oscillation period',
      theoretical: 2 * Math.PI * Math.sqrt(length / PENDULUM_GRAVITY),
      measured: snapshot?.measuredPeriod,
      unit: 's',
      tolerancePercent: initialAngle !== null && initialAngle > 20 ? 15 : 8,
      note:
        initialAngle !== null && initialAngle > 20
          ? 'A wider tolerance is used because the small-angle approximation is less accurate above 20 degrees.'
          : 'Compared against the small-angle pendulum period formula.',
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('pendulum', 'Pendulum Verification', metrics);
}

function buildCollisionValidation(snapshot: any) {
  const collision = snapshot?.collision;
  const initialMomentum = asFiniteNumber(collision?.initialMomentum?.px);
  const currentMomentum = asFiniteNumber(collision?.currentMomentum?.px);
  const configuredRestitution =
    asFiniteNumber(snapshot?.restitution) ??
    asFiniteNumber(collision?.coefficientOfRestitution);

  const ballA = Array.isArray(collision?.balls)
    ? collision.balls.find((ball: any) => ball.id === 'A')
    : null;
  const ballB = Array.isArray(collision?.balls)
    ? collision.balls.find((ball: any) => ball.id === 'B')
    : null;
  const initialVelocityA = asFiniteNumber(snapshot?.velocityA);
  const initialVelocityB = asFiniteNumber(snapshot?.velocityB);
  const finalVelocityA = asFiniteNumber(ballA?.vx);
  const finalVelocityB = asFiniteNumber(ballB?.vx);

  const closingSpeed =
    initialVelocityA !== null && initialVelocityB !== null
      ? Math.abs(initialVelocityA - initialVelocityB)
      : null;
  const measuredRestitution =
    collision?.isCollided &&
    closingSpeed !== null &&
    closingSpeed > EPSILON &&
    finalVelocityA !== null &&
    finalVelocityB !== null
      ? Math.abs(finalVelocityB - finalVelocityA) / closingSpeed
      : null;

  const metrics = [
    createMetric({
      key: 'momentum_x',
      label: 'Horizontal momentum conservation',
      theoretical: initialMomentum,
      measured: currentMomentum,
      unit: 'kg m/s',
      tolerancePercent: 5,
    }),
    createMetric({
      key: 'restitution',
      label: 'Measured coefficient of restitution',
      theoretical: configuredRestitution,
      measured: measuredRestitution,
      unit: '',
      tolerancePercent: 10,
    }),
    configuredRestitution !== null && configuredRestitution >= 0.95
      ? createMetric({
          key: 'kinetic_energy',
          label: 'Kinetic energy retention',
          theoretical: collision?.initialKE,
          measured: collision?.currentKE,
          unit: 'J',
          tolerancePercent: 10,
          note: 'Shown for near-elastic runs where kinetic energy should stay close to the starting value.',
        })
      : null,
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('collision', 'Collision Verification', metrics, [
    configuredRestitution !== null && configuredRestitution < 0.95
      ? 'Kinetic energy is not forced to match perfectly because the configured collision is not fully elastic.'
      : 'Momentum conservation is the main verification target for this collision run.',
  ]);
}

function buildElectrolysisValidation(snapshot: any) {
  const state = snapshot?.state;
  const h2Volume = asFiniteNumber(state?.h2Volume);
  const o2Volume = asFiniteNumber(state?.o2Volume);

  if (h2Volume === null || o2Volume === null || h2Volume <= 0 || o2Volume <= 0) {
    return finalizeSummary('electrolysis', 'Electrolysis Verification', [], [
      'Collect measurable H2 and O2 volumes before comparing the electrolysis ratio.',
    ]);
  }

  const measuredRatio = h2Volume / o2Volume;
  const expectedO2FromHydrogen = h2Volume / 2;

  const metrics = [
    createMetric({
      key: 'gas_ratio',
      label: 'H2:O2 gas ratio',
      theoretical: 2,
      measured: measuredRatio,
      unit: ':1',
      tolerancePercent: 10,
      note: 'Water electrolysis should produce hydrogen and oxygen in a 2:1 volume ratio.',
    }),
    createMetric({
      key: 'oxygen_volume',
      label: 'O2 volume predicted from H2',
      theoretical: expectedO2FromHydrogen,
      measured: o2Volume,
      unit: 'mL',
      tolerancePercent: 10,
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('electrolysis', 'Electrolysis Verification', metrics);
}

function buildElectricFieldsValidation(snapshot: any) {
  const chargeStrength = asFiniteNumber(snapshot?.chargeStrength);
  const chargeSeparation = asFiniteNumber(snapshot?.chargeSeparation);
  const probeX = asFiniteNumber(snapshot?.probeX);
  const measuredField = asFiniteNumber(snapshot?.fieldStrength);
  const measuredPotential = asFiniteNumber(snapshot?.potential);

  if (
    chargeStrength === null ||
    chargeSeparation === null ||
    probeX === null ||
    measuredField === null ||
    measuredPotential === null
  ) {
    return finalizeSummary('electricfields', 'Electric Field Verification', [], [
      'Run the electric-field probe so field and potential measurements are available.',
    ]);
  }

  const leftX = -chargeSeparation / 2;
  const rightX = chargeSeparation / 2;
  const safeLeft = Math.sign(probeX - leftX || 1) * Math.max(Math.abs(probeX - leftX), 10);
  const safeRight = Math.sign(probeX - rightX || 1) * Math.max(Math.abs(probeX - rightX), 10);
  const leftDistance = Math.max(Math.abs(probeX - leftX), 10);
  const rightDistance = Math.max(Math.abs(probeX - rightX), 10);
  const theoreticalField =
    (ELECTRIC_FIELD_CONSTANT * chargeStrength) / (safeLeft * safeLeft) +
    (ELECTRIC_FIELD_CONSTANT * chargeStrength) / (safeRight * safeRight);
  const theoreticalPotential =
    (ELECTRIC_FIELD_CONSTANT * chargeStrength) / leftDistance -
    (ELECTRIC_FIELD_CONSTANT * chargeStrength) / rightDistance;

  const metrics = [
    createMetric({
      key: 'field_strength',
      label: 'Probe electric field',
      theoretical: theoreticalField,
      measured: measuredField,
      tolerancePercent: 6,
    }),
    createMetric({
      key: 'potential',
      label: 'Probe electric potential',
      theoretical: theoreticalPotential,
      measured: measuredPotential,
      tolerancePercent: 8,
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('electricfields', 'Electric Field Verification', metrics);
}

function buildSimpleCircuitsValidation(snapshot: any) {
  const voltage = asFiniteNumber(snapshot?.voltage);
  const resistanceA = asFiniteNumber(snapshot?.circuitResistanceA);
  const resistanceB = asFiniteNumber(snapshot?.circuitResistanceB);
  const measuredCurrent = asFiniteNumber(snapshot?.current);
  const measuredResistance = asFiniteNumber(snapshot?.totalResistance);
  const measuredDropA = asFiniteNumber(snapshot?.voltageDropA);
  const measuredDropB = asFiniteNumber(snapshot?.voltageDropB);
  const mode = snapshot?.circuitMode === 'parallel' ? 'parallel' : 'series';

  if (
    voltage === null ||
    resistanceA === null ||
    resistanceB === null ||
    measuredCurrent === null ||
    measuredResistance === null
  ) {
    return finalizeSummary('simplecircuits', 'Simple Circuit Verification', [], [
      'Voltage, resistor values, and measured current are needed before validation can run.',
    ]);
  }

  const totalResistance =
    mode === 'series' ? resistanceA + resistanceB : 1 / (1 / resistanceA + 1 / resistanceB);
  const expectedCurrent = voltage / totalResistance;
  const expectedVoltageRule = mode === 'series' ? voltage : voltage;
  const measuredVoltageRule =
    mode === 'series'
      ? (measuredDropA ?? 0) + (measuredDropB ?? 0)
      : Math.max(measuredDropA ?? 0, measuredDropB ?? 0);

  const metrics = [
    createMetric({
      key: 'total_resistance',
      label: 'Equivalent resistance',
      theoretical: totalResistance,
      measured: measuredResistance,
      unit: 'Ω',
      tolerancePercent: 3,
    }),
    createMetric({
      key: 'current',
      label: 'Circuit current',
      theoretical: expectedCurrent,
      measured: measuredCurrent,
      unit: 'A',
      tolerancePercent: 6,
    }),
    createMetric({
      key: 'voltage_rule',
      label: mode === 'series' ? 'Series voltage sum' : 'Parallel branch voltage',
      theoretical: expectedVoltageRule,
      measured: measuredVoltageRule,
      unit: 'V',
      tolerancePercent: 6,
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('simplecircuits', 'Simple Circuit Verification', metrics);
}

function buildWaveInterferenceValidation(snapshot: any) {
  const waveLength = asFiniteNumber(snapshot?.waveLength);
  const pathDifference = asFiniteNumber(snapshot?.pathDifference);
  const measuredPhase = asFiniteNumber(snapshot?.phaseDifference);
  const measuredIntensity = asFiniteNumber(snapshot?.intensity);

  if (
    waveLength === null ||
    pathDifference === null ||
    measuredPhase === null ||
    measuredIntensity === null
  ) {
    return finalizeSummary('waveinterference', 'Wave Interference Verification', [], [
      'Run the interference screen long enough to collect path and intensity measurements.',
    ]);
  }

  const theoreticalPhase = (2 * Math.PI * pathDifference) / waveLength;
  const theoreticalIntensity = (1 + Math.cos(theoreticalPhase)) / 2;

  const metrics = [
    createMetric({
      key: 'phase_difference',
      label: 'Phase difference',
      theoretical: theoreticalPhase,
      measured: measuredPhase,
      unit: 'rad',
      tolerancePercent: 5,
    }),
    createMetric({
      key: 'intensity',
      label: 'Relative intensity',
      theoretical: theoreticalIntensity,
      measured: measuredIntensity,
      tolerancePercent: 6,
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('waveinterference', 'Wave Interference Verification', metrics);
}

function buildRayOpticsValidation(snapshot: any) {
  const incidentAngle = asFiniteNumber(snapshot?.incidentAngle);
  const refractiveIndex = asFiniteNumber(snapshot?.refractiveIndex);
  const reflectedAngle = asFiniteNumber(snapshot?.reflectedAngle);
  const refractedAngle = asFiniteNumber(snapshot?.refractedAngle);

  if (
    incidentAngle === null ||
    refractiveIndex === null ||
    reflectedAngle === null ||
    refractedAngle === null
  ) {
    return finalizeSummary('rayoptics', 'Ray Optics Verification', [], [
      'Incident angle, refractive index, and measured ray angles are required before validation can run.',
    ]);
  }

  const theoreticalRefracted = (Math.asin(Math.min(1, Math.sin((incidentAngle * Math.PI) / 180) / refractiveIndex)) * 180) / Math.PI;

  const metrics = [
    createMetric({
      key: 'reflection',
      label: 'Reflected angle',
      theoretical: incidentAngle,
      measured: reflectedAngle,
      unit: '°',
      tolerancePercent: 2,
    }),
    createMetric({
      key: 'refraction',
      label: 'Refracted angle',
      theoretical: theoreticalRefracted,
      measured: refractedAngle,
      unit: '°',
      tolerancePercent: 4,
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('rayoptics', 'Ray Optics Verification', metrics);
}

function buildPythagoreanValidation(snapshot: any) {
  const base = asFiniteNumber(snapshot?.triangleBase);
  const height = asFiniteNumber(snapshot?.triangleHeight);
  const hypotenuse = asFiniteNumber(snapshot?.hypotenuse);
  const theoremLeft = asFiniteNumber(snapshot?.theoremLeft);
  const theoremRight = asFiniteNumber(snapshot?.theoremRight);

  if (base === null || height === null || hypotenuse === null) {
    return finalizeSummary('pythagorean', 'Pythagorean Verification', [], [
      'Base, height, and hypotenuse values are needed before theorem validation can run.',
    ]);
  }

  const expectedHypotenuse = Math.sqrt(base * base + height * height);
  const expectedAreaBalance = base * base + height * height;

  const metrics = [
    createMetric({
      key: 'hypotenuse_length',
      label: 'Hypotenuse length',
      theoretical: expectedHypotenuse,
      measured: hypotenuse,
      tolerancePercent: 1,
    }),
    createMetric({
      key: 'square_balance',
      label: 'a² + b² equals c²',
      theoretical: expectedAreaBalance,
      measured: theoremRight ?? theoremLeft,
      tolerancePercent: 1,
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('pythagorean', 'Pythagorean Verification', metrics);
}

function buildTrigonometryValidation(snapshot: any) {
  const trigAngle = asFiniteNumber(snapshot?.trigAngle);
  const measuredSin = asFiniteNumber(snapshot?.sinValue);
  const measuredCos = asFiniteNumber(snapshot?.cosValue);
  const measuredTan = asFiniteNumber(snapshot?.tanValue);

  if (trigAngle === null || measuredSin === null || measuredCos === null || measuredTan === null) {
    return finalizeSummary('trigonometry', 'Trigonometry Verification', [], [
      'Angle and ratio measurements are needed before validation can run.',
    ]);
  }

  const radians = (trigAngle * Math.PI) / 180;
  const metrics = [
    createMetric({
      key: 'sin_ratio',
      label: 'sin θ',
      theoretical: Math.sin(radians),
      measured: measuredSin,
      tolerancePercent: 1,
    }),
    createMetric({
      key: 'cos_ratio',
      label: 'cos θ',
      theoretical: Math.cos(radians),
      measured: measuredCos,
      tolerancePercent: 1,
    }),
    createMetric({
      key: 'tan_ratio',
      label: 'tan θ',
      theoretical: Math.tan(radians),
      measured: measuredTan,
      tolerancePercent: 2,
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('trigonometry', 'Trigonometry Verification', metrics);
}

function buildCircleTheoremValidation(snapshot: any) {
  const centralAngle = asFiniteNumber(snapshot?.centralAngle ?? snapshot?.circleCentralAngle);
  const inscribedAngle = asFiniteNumber(snapshot?.inscribedAngle);

  if (centralAngle === null || inscribedAngle === null) {
    return finalizeSummary('circletheorems', 'Circle Theorem Verification', [], [
      'Central and inscribed angle measurements are required before validation can run.',
    ]);
  }

  const metrics = [
    createMetric({
      key: 'angle_ratio',
      label: 'Inscribed angle is half the central angle',
      theoretical: centralAngle / 2,
      measured: inscribedAngle,
      unit: '°',
      tolerancePercent: 1,
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('circletheorems', 'Circle Theorem Verification', metrics);
}

function buildDerivativeValidation(snapshot: any) {
  const pointX = asFiniteNumber(snapshot?.pointX ?? snapshot?.derivativePointX);
  const pointY = asFiniteNumber(snapshot?.pointY);
  const tangentSlope = asFiniteNumber(snapshot?.tangentSlope);
  const derivativeScale = asFiniteNumber(snapshot?.derivativeScale);

  if (pointX === null || pointY === null || tangentSlope === null || derivativeScale === null) {
    return finalizeSummary('derivativeintuition', 'Derivative Verification', [], [
      'Point coordinates, scale, and tangent slope are required before validation can run.',
    ]);
  }

  const metrics = [
    createMetric({
      key: 'point_height',
      label: 'Curve height y = ax²',
      theoretical: derivativeScale * pointX * pointX,
      measured: pointY,
      tolerancePercent: 1,
    }),
    createMetric({
      key: 'tangent_slope',
      label: 'Derivative slope 2ax',
      theoretical: 2 * derivativeScale * pointX,
      measured: tangentSlope,
      tolerancePercent: 1,
    }),
  ].filter((metric): metric is ValidationMetric => Boolean(metric));

  return finalizeSummary('derivativeintuition', 'Derivative Verification', metrics);
}

export function formatValidationValue(value: number | null, unit?: string) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '--';
  }

  const rounded = Math.abs(value) >= 100 ? value.toFixed(1) : value.toFixed(3);
  return unit ? `${rounded} ${unit}`.trim() : rounded;
}

export function getValidationSummary(
  experimentType: string,
  snapshot?: Record<string, any> | null,
  dataPoints: Record<string, any>[] = []
): ValidationSummary {
  const safeSnapshot = snapshot || {};

  switch (experimentType) {
    case 'freefall':
      return buildFreeFallValidation(safeSnapshot, dataPoints);
    case 'projectilemotion':
      return buildProjectileValidation(safeSnapshot);
    case 'pendulum':
      return buildPendulumValidation(safeSnapshot);
    case 'collision':
      return buildCollisionValidation(safeSnapshot);
    case 'electrolysis':
      return buildElectrolysisValidation(safeSnapshot);
    case 'electricfields':
      return buildElectricFieldsValidation(safeSnapshot);
    case 'simplecircuits':
      return buildSimpleCircuitsValidation(safeSnapshot);
    case 'waveinterference':
      return buildWaveInterferenceValidation(safeSnapshot);
    case 'rayoptics':
      return buildRayOpticsValidation(safeSnapshot);
    case 'pythagorean':
      return buildPythagoreanValidation(safeSnapshot);
    case 'trigonometry':
      return buildTrigonometryValidation(safeSnapshot);
    case 'circletheorems':
      return buildCircleTheoremValidation(safeSnapshot);
    case 'derivativeintuition':
      return buildDerivativeValidation(safeSnapshot);
    default:
      return finalizeSummary(experimentType, 'Validation', []);
  }
}
