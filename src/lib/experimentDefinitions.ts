export type ExperimentCategory = 'physics' | 'chemistry' | 'math';

interface BaseExperimentControlDefinition {
  key: keyof ExperimentSessionConfig;
  label: string;
  unit?: string;
  description?: string;
}

export interface ExperimentRangeControlDefinition extends BaseExperimentControlDefinition {
  kind: 'range';
  min: number;
  max: number;
  step?: number;
}

export interface ExperimentNumberControlDefinition extends BaseExperimentControlDefinition {
  kind: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface ExperimentSelectControlDefinition extends BaseExperimentControlDefinition {
  kind: 'select';
  options: Array<{
    label: string;
    value: string;
  }>;
}

export interface ExperimentToggleControlDefinition extends BaseExperimentControlDefinition {
  kind: 'toggle';
}

export type ExperimentControlDefinition =
  | ExperimentRangeControlDefinition
  | ExperimentNumberControlDefinition
  | ExperimentSelectControlDefinition
  | ExperimentToggleControlDefinition;

export interface ExperimentFormulaDefinition {
  key: string;
  label: string;
  expression: string;
  description: string;
}

export interface ExperimentChartDefinition {
  key: string;
  title: string;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
}

export interface ExperimentValidationRuleDefinition {
  key: string;
  label: string;
  description: string;
  implemented: boolean;
}

export interface ExperimentTutorialStepDefinition {
  title: string;
  description: string;
}

export interface ExperimentOutputMetricDefinition {
  key: string;
  label: string;
  unit?: string;
  description: string;
}

export interface ExperimentSessionConfig {
  height: number;
  angle: number;
  speed: number;
  initialHeight: number;
  length: number;
  mass: number;
  initialAngle: number;
  damping: number;
  massA: number;
  massB: number;
  velocityA: number;
  velocityB: number;
  restitution: number;
  voltage: number;
  electrolyteConc: number;
  showVectors: boolean;
  measurementMode: 'standard' | 'detailed';
  chargeStrength: number;
  chargeSeparation: number;
  probeDistance: number;
  circuitResistanceA: number;
  circuitResistanceB: number;
  circuitMode: 'series' | 'parallel';
  waveAmplitude: number;
  waveFrequency: number;
  waveLength: number;
  sourceSeparation: number;
  incidentAngle: number;
  refractiveIndex: number;
  triangleBase: number;
  triangleHeight: number;
  trigAngle: number;
  circleCentralAngle: number;
  derivativePointX: number;
  derivativeScale: number;
}

export const DEFAULT_EXPERIMENT_SESSION_CONFIG: ExperimentSessionConfig = {
  height: 100,
  angle: 45,
  speed: 25,
  initialHeight: 2,
  length: 2,
  mass: 1,
  initialAngle: 30,
  damping: 0.01,
  massA: 2,
  massB: 2,
  velocityA: 5,
  velocityB: -3,
  restitution: 1,
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
};

interface ExperimentDefinition {
  id: string;
  name: string;
  category: ExperimentCategory;
  workspace:
    | 'freefall'
    | 'projectilemotion'
    | 'pendulum'
    | 'collision'
    | 'electricfields'
    | 'simplecircuits'
    | 'waveinterference'
    | 'rayoptics'
    | 'pythagorean'
    | 'trigonometry'
    | 'circletheorems'
    | 'derivativeintuition'
    | 'acidbase'
    | 'titration'
    | 'electrolysis'
    | 'flametest'
    | 'crystallization'
    | 'displacement'
    | 'generic';
  description: string;
  theory: string;
  objectives: string[];
  tutorialSteps: ExperimentTutorialStepDefinition[];
  formulas: ExperimentFormulaDefinition[];
  charts: ExperimentChartDefinition[];
  validationRules: ExperimentValidationRuleDefinition[];
  outputMetrics: ExperimentOutputMetricDefinition[];
  controls: ExperimentControlDefinition[];
  initialSetup: Record<string, any>;
  buildInitialState: (config: ExperimentSessionConfig) => Record<string, any>;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createSessionOptions(config: ExperimentSessionConfig) {
  return {
    showVectors: config.showVectors,
    measurementMode: config.measurementMode,
  };
}

const DEFINITIONS = {
  freefall: {
    id: 'freefall',
    name: 'Free Fall',
    category: 'physics',
    workspace: 'freefall',
    description: 'Study acceleration due to gravity',
    theory: 'An object in free fall accelerates at g = 9.8 m/s². Distance: d = 1/2 g t² and velocity: v = g t.',
    objectives: [
      'Verify gravitational acceleration',
      'Understand velocity-time relationship',
      'Analyze position-time graphs',
    ],
    tutorialSteps: [
      { title: 'Set the release height', description: 'Adjust the starting height and predict how long the object will take to reach the ground.' },
      { title: 'Run the fall', description: 'Start the simulation and watch the ball accelerate downward under gravity.' },
      { title: 'Compare graphs', description: 'Inspect the velocity-time and position-time charts to connect motion with the equations.' },
      { title: 'Validate the theory', description: 'Use the built-in verification panel to compare measured values with d = 1/2 g t² and v = g t.' },
    ],
    formulas: [
      { key: 'distance', label: 'Displacement', expression: 'd = 1/2 g t²', description: 'Distance travelled under constant gravitational acceleration.' },
      { key: 'velocity', label: 'Velocity', expression: 'v = g t', description: 'Final speed after falling for time t.' },
    ],
    charts: [
      { key: 'velocity_time', title: 'Velocity vs Time', xKey: 'time', yKey: 'velocity', xLabel: 'Time (s)', yLabel: 'Velocity (m/s)' },
      { key: 'position_time', title: 'Position vs Time', xKey: 'time', yKey: 'position', xLabel: 'Time (s)', yLabel: 'Position (m)' },
    ],
    validationRules: [
      { key: 'distance', label: 'Displacement after t seconds', description: 'Compare measured displacement with d = 1/2 g t².', implemented: true },
      { key: 'velocity', label: 'Velocity after t seconds', description: 'Compare measured velocity with v = g t.', implemented: true },
    ],
    outputMetrics: [
      { key: 'time', label: 'Elapsed Time', unit: 's', description: 'Time stamp for each captured sample.' },
      { key: 'position', label: 'Position', unit: 'm', description: 'Measured vertical position during the fall.' },
      { key: 'velocity', label: 'Velocity', unit: 'm/s', description: 'Measured vertical velocity.' },
      { key: 'speed', label: 'Speed', unit: 'm/s', description: 'Magnitude of instantaneous speed.' },
    ],
    controls: [
      { key: 'height', label: 'Initial Height', kind: 'range', min: 20, max: 400, unit: 'px', description: 'Starting vertical position of the falling object.' },
    ],
    initialSetup: {
      objects: [{ type: 'ball', x: 400, y: 100, radius: 20 }],
    },
    buildInitialState: (config) => ({
      objects: [{ type: 'ball', x: 400, y: config.height, radius: 20 }],
      height: config.height,
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  projectilemotion: {
    id: 'projectilemotion',
    name: 'Projectile Motion',
    category: 'physics',
    workspace: 'projectilemotion',
    description: 'Analyze 2D motion under gravity',
    theory: 'A projectile follows a parabolic path. Horizontal and vertical motions are independent.',
    objectives: [
      'Understand parabolic trajectories',
      'Analyze range vs angle relationship',
      'Study time of flight',
    ],
    tutorialSteps: [
      { title: 'Tune launch conditions', description: 'Change launch angle, speed, and initial height to test different trajectories.' },
      { title: 'Observe the path', description: 'Launch the projectile and watch the horizontal and vertical components evolve independently.' },
      { title: 'Measure outcomes', description: 'Compare measured range, max height, and time of flight with analytical predictions.' },
      { title: 'Record evidence', description: 'Save the lab run and export charts, report, and evidence summary.' },
    ],
    formulas: [
      { key: 'range', label: 'Horizontal Range', expression: 'R = v₀ cos(θ) · t', description: 'Horizontal distance covered before hitting the ground.' },
      { key: 'max_height', label: 'Maximum Height', expression: 'H = h₀ + (v₀² sin²(θ)) / 2g', description: 'Peak vertical height reached by the projectile.' },
      { key: 'flight_time', label: 'Time of Flight', expression: 't = (v₀ sin(θ) + √(v₀² sin²(θ) + 2gh₀)) / g', description: 'Total time the projectile remains in the air.' },
    ],
    charts: [
      { key: 'trajectory', title: 'Trajectory', xKey: 'x', yKey: 'y', xLabel: 'Horizontal Distance (m)', yLabel: 'Height (m)' },
      { key: 'height_time', title: 'Height vs Time', xKey: 'time', yKey: 'y', xLabel: 'Time (s)', yLabel: 'Height (m)' },
    ],
    validationRules: [
      { key: 'range', label: 'Horizontal range', description: 'Compare measured range with analytical projectile motion.', implemented: true },
      { key: 'max_height', label: 'Maximum height', description: 'Compare measured peak height with analytical prediction.', implemented: true },
      { key: 'flight_time', label: 'Time of flight', description: 'Compare measured air time with analytical prediction.', implemented: true },
    ],
    outputMetrics: [
      { key: 'x', label: 'Horizontal Distance', unit: 'm', description: 'Horizontal displacement during flight.' },
      { key: 'y', label: 'Height', unit: 'm', description: 'Vertical height above the ground.' },
      { key: 'vx', label: 'Horizontal Velocity', unit: 'm/s', description: 'Horizontal component of velocity.' },
      { key: 'vy', label: 'Vertical Velocity', unit: 'm/s', description: 'Vertical component of velocity.' },
    ],
    controls: [
      { key: 'angle', label: 'Launch Angle', kind: 'range', min: 10, max: 80, unit: '°', description: 'Angle between the launcher and the horizontal.' },
      { key: 'speed', label: 'Launch Speed', kind: 'range', min: 5, max: 50, unit: 'm/s', description: 'Initial launch speed of the projectile.' },
      { key: 'initialHeight', label: 'Initial Height', kind: 'range', min: 0, max: 20, step: 0.5, unit: 'm', description: 'Starting height of the projectile above the ground.' },
      {
        key: 'measurementMode',
        label: 'Measurement Mode',
        kind: 'select',
        description: 'Choose how much measurement detail to record in the saved session.',
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Detailed', value: 'detailed' },
        ],
      },
    ],
    initialSetup: {
      objects: [{ type: 'cannon', x: 50, y: 500, angle: 45, velocity: 20 }],
    },
    buildInitialState: (config) => ({
      time: 0,
      angle: config.angle,
      speed: config.speed,
      initialHeight: config.initialHeight,
      projectile: { x: 0, y: config.initialHeight, vx: 0, vy: 0, launched: false, landed: false },
      trajectory: [],
      measuredRange: null,
      measuredMaxHeight: null,
      measuredTimeOfFlight: null,
      sessionOptions: createSessionOptions(config),
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  pendulum: {
    id: 'pendulum',
    name: 'Simple Pendulum',
    category: 'physics',
    workspace: 'pendulum',
    description: 'Study periodic motion and energy conservation',
    theory: 'Period T = 2π√(L/g). Energy oscillates between kinetic and potential.',
    objectives: [
      'Measure period of oscillation',
      'Study effect of length on period',
      'Observe energy conservation',
    ],
    tutorialSteps: [
      { title: 'Choose pendulum properties', description: 'Set the string length, bob mass, damping, and initial angle.' },
      { title: 'Observe periodic motion', description: 'Run the pendulum and watch the oscillation repeat over time.' },
      { title: 'Measure the period', description: 'Use the data stream to measure oscillation period and compare with theory.' },
      { title: 'Reflect on damping', description: 'Increase damping to study how energy loss changes the motion.' },
    ],
    formulas: [
      { key: 'period', label: 'Pendulum Period', expression: 'T = 2π√(L/g)', description: 'Time for one full oscillation at small angles.' },
      { key: 'energy', label: 'Energy Exchange', expression: 'E = KE + PE', description: 'Total energy alternates between kinetic and potential components.' },
    ],
    charts: [
      { key: 'angle_time', title: 'Angle vs Time', xKey: 'time', yKey: 'angleDegrees', xLabel: 'Time (s)', yLabel: 'Angle (°)' },
      { key: 'energy_time', title: 'Energy vs Time', xKey: 'time', yKey: 'totalEnergy', xLabel: 'Time (s)', yLabel: 'Energy (J)' },
    ],
    validationRules: [
      { key: 'period', label: 'Pendulum period', description: 'Compare measured period with T = 2π√(L/g).', implemented: true },
    ],
    outputMetrics: [
      { key: 'time', label: 'Elapsed Time', unit: 's', description: 'Time stamp for each oscillation sample.' },
      { key: 'angleDegrees', label: 'Angular Displacement', unit: '°', description: 'Angular position of the pendulum bob.' },
      { key: 'angularVelocity', label: 'Angular Velocity', unit: 'rad/s', description: 'Angular speed of the pendulum.' },
      { key: 'totalEnergy', label: 'Total Energy', unit: 'J', description: 'Approximate system energy over time.' },
    ],
    controls: [
      { key: 'length', label: 'Length', kind: 'range', min: 1, max: 5, step: 0.1, unit: 'm', description: 'Length of the pendulum string.' },
      { key: 'mass', label: 'Mass', kind: 'range', min: 1, max: 10, step: 0.5, unit: 'kg', description: 'Mass of the pendulum bob.' },
      { key: 'initialAngle', label: 'Initial Angle', kind: 'range', min: 5, max: 60, unit: '°', description: 'Starting angular displacement from equilibrium.' },
      { key: 'damping', label: 'Damping', kind: 'range', min: 0, max: 0.1, step: 0.01, description: 'Energy-loss factor that slows oscillation.' },
    ],
    initialSetup: {
      objects: [{ type: 'pendulum', x: 400, y: 100, length: 200, mass: 1 }],
    },
    buildInitialState: (config) => ({
      time: 0,
      length: config.length,
      mass: config.mass,
      initialAngle: config.initialAngle,
      damping: config.damping,
      pendulum: {
        angle: (config.initialAngle * Math.PI) / 180,
        angularVelocity: 0,
        length: config.length,
        mass: config.mass,
        damping: config.damping,
      },
      measuredPeriod: null,
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  collision: {
    id: 'collision',
    name: 'Elastic Collision',
    category: 'physics',
    workspace: 'collision',
    description: 'Study momentum and energy conservation',
    theory: 'In elastic collisions, momentum and kinetic energy are conserved.',
    objectives: [
      'Verify momentum conservation',
      'Analyze velocity exchange',
      'Study coefficient of restitution',
    ],
    tutorialSteps: [
      { title: 'Set initial masses and speeds', description: 'Choose the masses and initial velocities for the two carts or balls.' },
      { title: 'Run the collision', description: 'Observe the interaction and inspect the velocity change after impact.' },
      { title: 'Check conservation laws', description: 'Compare momentum and kinetic energy before and after the collision.' },
      { title: 'Change restitution', description: 'Reduce restitution to study how less-elastic collisions behave.' },
    ],
    formulas: [
      { key: 'momentum', label: 'Momentum', expression: 'p = mv', description: 'Linear momentum of each body and the total system.' },
      { key: 'kinetic_energy', label: 'Kinetic Energy', expression: 'KE = 1/2 mv²', description: 'Mechanical energy carried by each moving body.' },
      { key: 'restitution', label: 'Coefficient of Restitution', expression: 'e = relative speed after / relative speed before', description: 'Measure of how elastic the collision is.' },
    ],
    charts: [
      { key: 'momentum_time', title: 'Momentum vs Time', xKey: 'time', yKey: 'totalMomentum', xLabel: 'Time (s)', yLabel: 'Momentum (kg·m/s)' },
      { key: 'energy_time', title: 'Kinetic Energy vs Time', xKey: 'time', yKey: 'totalKE', xLabel: 'Time (s)', yLabel: 'Energy (J)' },
    ],
    validationRules: [
      { key: 'momentum', label: 'Momentum conservation', description: 'Compare total momentum before and after collision.', implemented: true },
      { key: 'kinetic_energy', label: 'Kinetic energy conservation', description: 'Check whether kinetic energy is preserved in elastic mode.', implemented: true },
      { key: 'restitution', label: 'Restitution', description: 'Compare measured restitution with configured restitution.', implemented: true },
    ],
    outputMetrics: [
      { key: 'velocityA', label: 'Velocity A', unit: 'm/s', description: 'Velocity of object A.' },
      { key: 'velocityB', label: 'Velocity B', unit: 'm/s', description: 'Velocity of object B.' },
      { key: 'totalMomentum', label: 'Total Momentum', unit: 'kg·m/s', description: 'Combined system momentum over time.' },
      { key: 'totalKE', label: 'Total Kinetic Energy', unit: 'J', description: 'Combined kinetic energy over time.' },
    ],
    controls: [
      { key: 'massA', label: 'Mass A', kind: 'range', min: 1, max: 10, step: 0.5, unit: 'kg', description: 'Mass of the first body.' },
      { key: 'massB', label: 'Mass B', kind: 'range', min: 1, max: 10, step: 0.5, unit: 'kg', description: 'Mass of the second body.' },
      { key: 'velocityA', label: 'Velocity A', kind: 'range', min: -10, max: 10, step: 0.5, unit: 'm/s', description: 'Initial velocity of the first body.' },
      { key: 'velocityB', label: 'Velocity B', kind: 'range', min: -10, max: 10, step: 0.5, unit: 'm/s', description: 'Initial velocity of the second body.' },
      { key: 'restitution', label: 'Restitution', kind: 'range', min: 0, max: 1, step: 0.05, description: 'Elasticity of the collision.' },
      {
        key: 'showVectors',
        label: 'Show Velocity Vectors',
        kind: 'toggle',
        description: 'Store whether vector overlays should be emphasized in this lab session.',
      },
    ],
    initialSetup: {
      objects: [
        { type: 'ball', x: 200, y: 300, radius: 20, vx: 5, vy: 0 },
        { type: 'ball', x: 600, y: 300, radius: 20, vx: 0, vy: 0 },
      ],
    },
    buildInitialState: (config) => ({
      time: 0,
      massA: config.massA,
      massB: config.massB,
      velocityA: config.velocityA,
      velocityB: config.velocityB,
      restitution: config.restitution,
      collision: {
        balls: [
          { id: 'A', x: 150, y: 320, vx: config.velocityA, vy: 0, radius: 20 + config.massA * 3, mass: config.massA, color: '#ef4444', label: 'A' },
          { id: 'B', x: 650, y: 320, vx: config.velocityB, vy: 0, radius: 20 + config.massB * 3, mass: config.massB, color: '#3b82f6', label: 'B' },
        ],
        isCollided: false,
        collisionTime: null,
        initialMomentum: { px: config.massA * config.velocityA + config.massB * config.velocityB, py: 0 },
        currentMomentum: { px: config.massA * config.velocityA + config.massB * config.velocityB, py: 0 },
        initialKE: 0.5 * config.massA * config.velocityA * config.velocityA + 0.5 * config.massB * config.velocityB * config.velocityB,
        currentKE: 0.5 * config.massA * config.velocityA * config.velocityA + 0.5 * config.massB * config.velocityB * config.velocityB,
        coefficientOfRestitution: config.restitution,
      },
      sessionOptions: createSessionOptions(config),
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  electricfields: {
    id: 'electricfields',
    name: 'Electric Fields',
    category: 'physics',
    workspace: 'electricfields',
    description: 'Explore electric field strength around opposite charges',
    theory: 'Electric field strength depends on charge and distance. For a point charge, E = kq/r².',
    objectives: [
      'Relate field strength to charge magnitude',
      'Observe the effect of distance on field strength',
      'Compare measured and theoretical field values',
    ],
    tutorialSteps: [
      { title: 'Place the charges', description: 'Set the charge magnitude and separation between the positive and negative charges.' },
      { title: 'Move the probe', description: 'Watch the probe sweep through the field and inspect how the vector changes.' },
      { title: 'Measure field strength', description: 'Track the field and potential values at the probe location.' },
      { title: 'Validate the theory', description: 'Compare measured field strength with the inverse-square prediction.' },
    ],
    formulas: [
      { key: 'field_strength', label: 'Electric Field', expression: 'E = kq/r²', description: 'Field strength produced by a point charge at distance r.' },
      { key: 'superposition', label: 'Net Field', expression: 'E_net = E₁ + E₂', description: 'The net electric field is the vector sum from all charges.' },
    ],
    charts: [
      { key: 'field_time', title: 'Field Strength vs Time', xKey: 'time', yKey: 'fieldStrength', xLabel: 'Time (s)', yLabel: 'Field Strength' },
      { key: 'position_field', title: 'Field Strength vs Probe Position', xKey: 'probeX', yKey: 'fieldStrength', xLabel: 'Probe Position', yLabel: 'Field Strength' },
    ],
    validationRules: [
      { key: 'field_strength', label: 'Field strength check', description: 'Compare measured probe field with the inverse-square theoretical value.', implemented: true },
      { key: 'potential', label: 'Electric potential check', description: 'Compare measured potential with the summed charge contribution.', implemented: true },
    ],
    outputMetrics: [
      { key: 'fieldStrength', label: 'Field Strength', description: 'Magnitude of electric field at the probe location.' },
      { key: 'potential', label: 'Electric Potential', description: 'Approximate electric potential at the probe location.' },
      { key: 'probeX', label: 'Probe Position', unit: 'px', description: 'Horizontal probe position relative to the field center.' },
    ],
    controls: [
      { key: 'chargeStrength', label: 'Charge Strength', kind: 'range', min: 1, max: 10, step: 0.5, unit: 'uC', description: 'Magnitude used for both opposite charges.' },
      { key: 'chargeSeparation', label: 'Charge Separation', kind: 'range', min: 80, max: 260, step: 10, unit: 'px', description: 'Distance between the positive and negative charges.' },
      { key: 'probeDistance', label: 'Probe Sweep Distance', kind: 'range', min: 60, max: 220, step: 10, unit: 'px', description: 'How far the probe sweeps from the center line.' },
    ],
    initialSetup: {
      charges: [
        { sign: '+', x: 300, y: 280 },
        { sign: '-', x: 500, y: 280 },
      ],
    },
    buildInitialState: (config) => ({
      time: 0,
      chargeStrength: config.chargeStrength,
      chargeSeparation: config.chargeSeparation,
      probeDistance: config.probeDistance,
      probeX: 0,
      fieldStrength: 0,
      potential: 0,
      sweepDirection: 1,
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  simplecircuits: {
    id: 'simplecircuits',
    name: 'Simple Circuits',
    category: 'physics',
    workspace: 'simplecircuits',
    description: 'Study current, resistance, and voltage in series and parallel circuits',
    theory: 'Ohm’s law gives V = IR. In series circuits resistances add, while in parallel the reciprocals add.',
    objectives: [
      'Apply Ohm’s law to measured current values',
      'Compare series and parallel equivalent resistance',
      'Check simple Kirchhoff voltage and current ideas',
    ],
    tutorialSteps: [
      { title: 'Choose a circuit mode', description: 'Switch between series and parallel connections for the two resistors.' },
      { title: 'Set supply and resistors', description: 'Adjust source voltage and resistor values.' },
      { title: 'Observe the circuit', description: 'Watch charge markers move through the circuit path.' },
      { title: 'Compare theory and measurement', description: 'Use the current and voltage readings to verify Ohm’s law.' },
    ],
    formulas: [
      { key: 'ohms_law', label: 'Ohm’s Law', expression: 'V = IR', description: 'Voltage equals current multiplied by resistance.' },
      { key: 'series', label: 'Series Resistance', expression: 'R_eq = R₁ + R₂', description: 'Equivalent resistance in a series circuit.' },
      { key: 'parallel', label: 'Parallel Resistance', expression: '1/R_eq = 1/R₁ + 1/R₂', description: 'Equivalent resistance in a parallel circuit.' },
    ],
    charts: [
      { key: 'current_time', title: 'Current vs Time', xKey: 'time', yKey: 'current', xLabel: 'Time (s)', yLabel: 'Current (A)' },
      { key: 'power_time', title: 'Power vs Time', xKey: 'time', yKey: 'power', xLabel: 'Time (s)', yLabel: 'Power (W)' },
    ],
    validationRules: [
      { key: 'current', label: 'Current from Ohm’s law', description: 'Compare measured circuit current with V / R_eq.', implemented: true },
      { key: 'voltage_rule', label: 'Simple Kirchhoff check', description: 'Check whether voltage distribution matches the chosen circuit mode.', implemented: true },
    ],
    outputMetrics: [
      { key: 'current', label: 'Current', unit: 'A', description: 'Measured total current in the circuit.' },
      { key: 'totalResistance', label: 'Equivalent Resistance', unit: 'Ω', description: 'Combined resistance of the selected resistor network.' },
      { key: 'power', label: 'Power', unit: 'W', description: 'Total power delivered by the source.' },
    ],
    controls: [
      { key: 'voltage', label: 'Supply Voltage', kind: 'range', min: 1, max: 24, step: 1, unit: 'V', description: 'Voltage supplied by the battery.' },
      { key: 'circuitResistanceA', label: 'Resistor A', kind: 'range', min: 1, max: 20, step: 1, unit: 'Ω', description: 'Resistance of the first resistor.' },
      { key: 'circuitResistanceB', label: 'Resistor B', kind: 'range', min: 1, max: 20, step: 1, unit: 'Ω', description: 'Resistance of the second resistor.' },
      {
        key: 'circuitMode',
        label: 'Circuit Mode',
        kind: 'select',
        description: 'Choose whether the resistors are connected in series or parallel.',
        options: [
          { label: 'Series', value: 'series' },
          { label: 'Parallel', value: 'parallel' },
        ],
      },
    ],
    initialSetup: {
      components: ['battery', 'resistorA', 'resistorB', 'switch'],
    },
    buildInitialState: (config) => ({
      time: 0,
      voltage: config.voltage,
      circuitResistanceA: config.circuitResistanceA,
      circuitResistanceB: config.circuitResistanceB,
      circuitMode: config.circuitMode,
      totalResistance: 0,
      current: 0,
      currentA: 0,
      currentB: 0,
      power: 0,
      voltageDropA: 0,
      voltageDropB: 0,
      flowOffset: 0,
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  waveinterference: {
    id: 'waveinterference',
    name: 'Wave Interference',
    category: 'physics',
    workspace: 'waveinterference',
    description: 'Visualize constructive and destructive interference from two sources',
    theory: 'Interference depends on phase difference and path difference. Waves reinforce when they arrive in phase.',
    objectives: [
      'Observe constructive and destructive interference',
      'Connect path difference with intensity',
      'Measure how source spacing changes the pattern',
    ],
    tutorialSteps: [
      { title: 'Set the wave properties', description: 'Adjust amplitude, frequency, wavelength, and source separation.' },
      { title: 'Watch the pattern develop', description: 'Observe the interference bands and the probe brightness.' },
      { title: 'Measure intensity', description: 'Track the probe intensity and path difference over time.' },
      { title: 'Explain the result', description: 'Relate bright and dark regions to phase difference.' },
    ],
    formulas: [
      { key: 'path_difference', label: 'Path Difference', expression: 'Δx = r₂ - r₁', description: 'Difference in distance travelled from the two sources.' },
      { key: 'phase_difference', label: 'Phase Difference', expression: 'φ = 2πΔx/λ', description: 'Phase shift caused by path difference.' },
      { key: 'intensity', label: 'Relative Intensity', expression: 'I ∝ 1 + cos(φ)', description: 'Simplified interference intensity relationship.' },
    ],
    charts: [
      { key: 'intensity_time', title: 'Intensity vs Time', xKey: 'time', yKey: 'intensity', xLabel: 'Time (s)', yLabel: 'Intensity' },
      { key: 'path_difference_time', title: 'Path Difference vs Time', xKey: 'time', yKey: 'pathDifference', xLabel: 'Time (s)', yLabel: 'Path Difference' },
    ],
    validationRules: [
      { key: 'intensity', label: 'Interference intensity check', description: 'Compare measured intensity with the phase-based prediction.', implemented: true },
      { key: 'phase', label: 'Phase difference check', description: 'Compare measured phase with the path difference formula.', implemented: true },
    ],
    outputMetrics: [
      { key: 'intensity', label: 'Intensity', description: 'Relative brightness at the observation point.' },
      { key: 'pathDifference', label: 'Path Difference', unit: 'px', description: 'Difference in source-to-probe distance.' },
      { key: 'phaseDifference', label: 'Phase Difference', unit: 'rad', description: 'Phase difference computed from the current geometry.' },
    ],
    controls: [
      { key: 'waveAmplitude', label: 'Amplitude', kind: 'range', min: 10, max: 50, step: 1, unit: 'px', description: 'Amplitude of the emitted waves.' },
      { key: 'waveFrequency', label: 'Frequency', kind: 'range', min: 0.5, max: 4, step: 0.1, unit: 'Hz', description: 'Oscillation rate of both sources.' },
      { key: 'waveLength', label: 'Wavelength', kind: 'range', min: 60, max: 180, step: 5, unit: 'px', description: 'Distance between successive crests.' },
      { key: 'sourceSeparation', label: 'Source Separation', kind: 'range', min: 60, max: 220, step: 10, unit: 'px', description: 'Distance between the two coherent sources.' },
    ],
    initialSetup: {
      sources: [
        { x: 180, y: 180 },
        { x: 180, y: 320 },
      ],
    },
    buildInitialState: (config) => ({
      time: 0,
      waveAmplitude: config.waveAmplitude,
      waveFrequency: config.waveFrequency,
      waveLength: config.waveLength,
      sourceSeparation: config.sourceSeparation,
      observationOffset: 0,
      pathDifference: 0,
      phaseDifference: 0,
      intensity: 0,
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  rayoptics: {
    id: 'rayoptics',
    name: 'Ray Optics',
    category: 'physics',
    workspace: 'rayoptics',
    description: 'Study reflection and refraction at a boundary',
    theory: 'The angle of reflection equals the angle of incidence. Refraction follows Snell’s law: n₁sin(i) = n₂sin(r).',
    objectives: [
      'Verify the reflection law',
      'Observe how refractive index changes bending',
      'Measure incident, reflected, and refracted angles',
    ],
    tutorialSteps: [
      { title: 'Set the incoming ray', description: 'Choose the incident angle for the incoming light ray.' },
      { title: 'Change the medium', description: 'Adjust the refractive index of the lower medium.' },
      { title: 'Observe the rays', description: 'Watch the reflected and refracted rays update live.' },
      { title: 'Validate the angle rules', description: 'Compare the displayed angles with reflection and refraction theory.' },
    ],
    formulas: [
      { key: 'reflection', label: 'Reflection Law', expression: 'θr = θi', description: 'Reflected angle matches the incident angle.' },
      { key: 'snell', label: 'Snell’s Law', expression: 'n₁ sin θi = n₂ sin θt', description: 'Relation between incident and refracted angles across a boundary.' },
    ],
    charts: [
      { key: 'refracted_time', title: 'Refracted Angle vs Time', xKey: 'time', yKey: 'refractedAngle', xLabel: 'Time (s)', yLabel: 'Refracted Angle (°)' },
      { key: 'incident_time', title: 'Incident vs Reflected Angle', xKey: 'time', yKey: 'reflectedAngle', xLabel: 'Time (s)', yLabel: 'Reflected Angle (°)' },
    ],
    validationRules: [
      { key: 'reflection', label: 'Reflection angle check', description: 'Compare measured reflected angle with the incident angle.', implemented: true },
      { key: 'refraction', label: 'Snell’s law check', description: 'Compare measured refracted angle with the Snell-law prediction.', implemented: true },
    ],
    outputMetrics: [
      { key: 'incidentAngle', label: 'Incident Angle', unit: '°', description: 'Incoming ray angle measured from the normal.' },
      { key: 'reflectedAngle', label: 'Reflected Angle', unit: '°', description: 'Angle of the reflected ray.' },
      { key: 'refractedAngle', label: 'Refracted Angle', unit: '°', description: 'Angle of the refracted ray.' },
    ],
    controls: [
      { key: 'incidentAngle', label: 'Incident Angle', kind: 'range', min: 5, max: 80, step: 1, unit: '°', description: 'Angle between the incident ray and the normal.' },
      { key: 'refractiveIndex', label: 'Lower Medium n', kind: 'range', min: 1, max: 2, step: 0.05, description: 'Refractive index of the lower medium.' },
    ],
    initialSetup: {
      media: ['air', 'glass'],
    },
    buildInitialState: (config) => ({
      time: 0,
      incidentAngle: config.incidentAngle,
      refractiveIndex: config.refractiveIndex,
      reflectedAngle: config.incidentAngle,
      refractedAngle: 0,
      pulseOffset: 0,
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  pythagorean: {
    id: 'pythagorean',
    name: 'Pythagorean Theorem',
    category: 'math',
    workspace: 'pythagorean',
    description: 'Visualize how the squares on the legs of a right triangle relate to the hypotenuse.',
    theory: 'For a right triangle, the sum of the squares of the two shorter sides equals the square of the hypotenuse: a² + b² = c².',
    objectives: [
      'Relate side lengths in a right triangle',
      'Connect area squares with the theorem formula',
      'Verify the equality numerically and visually',
    ],
    tutorialSteps: [
      { title: 'Set the triangle legs', description: 'Adjust the base and height of the right triangle.' },
      { title: 'Inspect the squares', description: 'Compare the square areas built on each side.' },
      { title: 'Check the theorem', description: 'Verify that a² + b² matches c².' },
    ],
    formulas: [
      { key: 'pythagorean', label: 'Pythagorean Theorem', expression: 'a² + b² = c²', description: 'Relationship between the two legs and the hypotenuse of a right triangle.' },
    ],
    charts: [
      { key: 'area_balance', title: 'Area Balance', xKey: 'sample', yKey: 'theoremLeft', xLabel: 'Sample', yLabel: 'a² + b²' },
      { key: 'hypotenuse', title: 'Hypotenuse Length', xKey: 'sample', yKey: 'hypotenuse', xLabel: 'Sample', yLabel: 'c' },
    ],
    validationRules: [
      { key: 'square_balance', label: 'Square area equality', description: 'Compare a² + b² with c².', implemented: true },
      { key: 'hypotenuse_length', label: 'Hypotenuse formula', description: 'Compare measured hypotenuse with √(a² + b²).', implemented: true },
    ],
    outputMetrics: [
      { key: 'base', label: 'Base', description: 'Length of the adjacent leg.' },
      { key: 'height', label: 'Height', description: 'Length of the opposite leg.' },
      { key: 'hypotenuse', label: 'Hypotenuse', description: 'Length of the longest side.' },
    ],
    controls: [
      { key: 'triangleBase', label: 'Base', kind: 'range', min: 2, max: 12, step: 0.5, description: 'Length of the horizontal leg.' },
      { key: 'triangleHeight', label: 'Height', kind: 'range', min: 2, max: 12, step: 0.5, description: 'Length of the vertical leg.' },
    ],
    initialSetup: {
      shape: 'right-triangle',
    },
    buildInitialState: (config) => ({
      triangleBase: config.triangleBase,
      triangleHeight: config.triangleHeight,
      hypotenuse: Math.sqrt(config.triangleBase ** 2 + config.triangleHeight ** 2),
      theoremLeft: config.triangleBase ** 2 + config.triangleHeight ** 2,
      theoremRight: config.triangleBase ** 2 + config.triangleHeight ** 2,
      sample: 0,
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  trigonometry: {
    id: 'trigonometry',
    name: 'Trigonometric Ratios',
    category: 'math',
    workspace: 'trigonometry',
    description: 'Visualize sine, cosine, and tangent on a right triangle.',
    theory: 'For a right triangle, sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, and tan θ = opposite/adjacent.',
    objectives: [
      'Relate an angle to triangle side ratios',
      'Understand the meanings of sine, cosine, and tangent',
      'See how the ratios change as the angle changes',
    ],
    tutorialSteps: [
      { title: 'Choose an angle', description: 'Move the angle slider and inspect the triangle.' },
      { title: 'Read the side lengths', description: 'Compare adjacent, opposite, and hypotenuse values.' },
      { title: 'Check the ratios', description: 'Verify the displayed sine, cosine, and tangent.' },
    ],
    formulas: [
      { key: 'sin', label: 'Sine', expression: 'sin θ = opposite / hypotenuse', description: 'Ratio of the opposite side to the hypotenuse.' },
      { key: 'cos', label: 'Cosine', expression: 'cos θ = adjacent / hypotenuse', description: 'Ratio of the adjacent side to the hypotenuse.' },
      { key: 'tan', label: 'Tangent', expression: 'tan θ = opposite / adjacent', description: 'Ratio of the opposite side to the adjacent side.' },
    ],
    charts: [
      { key: 'sin_curve', title: 'Sine vs Angle', xKey: 'angle', yKey: 'sinValue', xLabel: 'Angle (°)', yLabel: 'sin θ' },
      { key: 'cos_curve', title: 'Cosine vs Angle', xKey: 'angle', yKey: 'cosValue', xLabel: 'Angle (°)', yLabel: 'cos θ' },
    ],
    validationRules: [
      { key: 'sin_ratio', label: 'Sine ratio', description: 'Compare measured sine with the theoretical trig value.', implemented: true },
      { key: 'cos_ratio', label: 'Cosine ratio', description: 'Compare measured cosine with the theoretical trig value.', implemented: true },
      { key: 'tan_ratio', label: 'Tangent ratio', description: 'Compare measured tangent with the theoretical trig value.', implemented: true },
    ],
    outputMetrics: [
      { key: 'sinValue', label: 'sin θ', description: 'Current sine ratio.' },
      { key: 'cosValue', label: 'cos θ', description: 'Current cosine ratio.' },
      { key: 'tanValue', label: 'tan θ', description: 'Current tangent ratio.' },
    ],
    controls: [
      { key: 'trigAngle', label: 'Angle', kind: 'range', min: 10, max: 80, step: 1, unit: '°', description: 'Reference angle in the right triangle.' },
    ],
    initialSetup: {
      shape: 'right-triangle',
    },
    buildInitialState: (config) => {
      const radians = (config.trigAngle * Math.PI) / 180;
      const hypotenuse = 10;
      const adjacent = hypotenuse * Math.cos(radians);
      const opposite = hypotenuse * Math.sin(radians);
      return {
        trigAngle: config.trigAngle,
        adjacent,
        opposite,
        hypotenuse,
        sinValue: opposite / hypotenuse,
        cosValue: adjacent / hypotenuse,
        tanValue: opposite / adjacent,
        dataPoints: [],
        savedAt: new Date().toISOString(),
      };
    },
  },
  circletheorems: {
    id: 'circletheorems',
    name: 'Circle Theorems',
    category: 'math',
    workspace: 'circletheorems',
    description: 'Explore the relationship between a central angle and an inscribed angle.',
    theory: 'An angle at the center of a circle is twice the angle at the circumference standing on the same arc.',
    objectives: [
      'Understand the central-angle and inscribed-angle relationship',
      'See how arc changes affect angle size',
      'Connect geometry rules with measurements',
    ],
    tutorialSteps: [
      { title: 'Set the arc size', description: 'Change the central angle and watch the geometry update.' },
      { title: 'Measure both angles', description: 'Compare the angle at the center with the angle on the circle.' },
      { title: 'Verify the theorem', description: 'Check that the inscribed angle is half the central angle.' },
    ],
    formulas: [
      { key: 'inscribed', label: 'Inscribed Angle Theorem', expression: 'central angle = 2 × inscribed angle', description: 'Rule connecting the angle at the center to the angle on the circumference.' },
    ],
    charts: [
      { key: 'central_vs_inscribed', title: 'Central vs Inscribed Angle', xKey: 'centralAngle', yKey: 'inscribedAngle', xLabel: 'Central Angle (°)', yLabel: 'Inscribed Angle (°)' },
    ],
    validationRules: [
      { key: 'angle_ratio', label: 'Angle ratio check', description: 'Compare the measured inscribed angle with half the central angle.', implemented: true },
    ],
    outputMetrics: [
      { key: 'centralAngle', label: 'Central Angle', unit: '°', description: 'Angle at the center of the circle.' },
      { key: 'inscribedAngle', label: 'Inscribed Angle', unit: '°', description: 'Angle on the circumference standing on the same arc.' },
    ],
    controls: [
      { key: 'circleCentralAngle', label: 'Central Angle', kind: 'range', min: 20, max: 160, step: 2, unit: '°', description: 'Angle subtended by the chosen arc at the center.' },
    ],
    initialSetup: {
      shape: 'circle',
    },
    buildInitialState: (config) => ({
      circleCentralAngle: config.circleCentralAngle,
      centralAngle: config.circleCentralAngle,
      inscribedAngle: config.circleCentralAngle / 2,
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  derivativeintuition: {
    id: 'derivativeintuition',
    name: 'Derivative and Slope',
    category: 'math',
    workspace: 'derivativeintuition',
    description: 'Build intuition for derivatives by comparing tangent slope and curve steepness.',
    theory: 'The derivative gives the instantaneous rate of change. For y = ax², the derivative is dy/dx = 2ax.',
    objectives: [
      'Understand derivative as local slope',
      'See how slope changes along a curve',
      'Connect the derivative formula with a tangent line',
    ],
    tutorialSteps: [
      { title: 'Choose a point', description: 'Move the point along the curve to inspect different slopes.' },
      { title: 'Adjust the curve scale', description: 'Change how steep the parabola is.' },
      { title: 'Read the tangent slope', description: 'Compare the measured tangent with the derivative formula.' },
    ],
    formulas: [
      { key: 'parabola', label: 'Curve', expression: 'y = ax²', description: 'Simple curve used for building slope intuition.' },
      { key: 'derivative', label: 'Derivative', expression: 'dy/dx = 2ax', description: 'Slope of the tangent line at any chosen x-value.' },
    ],
    charts: [
      { key: 'slope_vs_x', title: 'Slope vs x', xKey: 'pointX', yKey: 'tangentSlope', xLabel: 'x', yLabel: 'Slope' },
      { key: 'y_vs_x', title: 'Point Height vs x', xKey: 'pointX', yKey: 'pointY', xLabel: 'x', yLabel: 'y' },
    ],
    validationRules: [
      { key: 'tangent_slope', label: 'Derivative slope check', description: 'Compare the measured tangent slope with 2ax.', implemented: true },
      { key: 'point_height', label: 'Curve value check', description: 'Compare the point height with y = ax².', implemented: true },
    ],
    outputMetrics: [
      { key: 'pointX', label: 'x-coordinate', description: 'Current x-position on the curve.' },
      { key: 'pointY', label: 'y-coordinate', description: 'Current y-value on the curve.' },
      { key: 'tangentSlope', label: 'Tangent Slope', description: 'Instantaneous slope at the chosen point.' },
    ],
    controls: [
      { key: 'derivativePointX', label: 'Point x', kind: 'range', min: -4, max: 4, step: 0.1, description: 'Point on the horizontal axis where the tangent is measured.' },
      { key: 'derivativeScale', label: 'Curve Scale a', kind: 'range', min: 0.5, max: 2, step: 0.1, description: 'Scale factor in y = ax².' },
    ],
    initialSetup: {
      curve: 'parabola',
    },
    buildInitialState: (config) => ({
      derivativePointX: config.derivativePointX,
      derivativeScale: config.derivativeScale,
      pointX: config.derivativePointX,
      pointY: config.derivativeScale * config.derivativePointX * config.derivativePointX,
      tangentSlope: 2 * config.derivativeScale * config.derivativePointX,
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  acidbase: {
    id: 'acidbase',
    name: 'Acid-Base Neutralization',
    category: 'chemistry',
    workspace: 'acidbase',
    description: 'Observe neutralization reaction',
    theory: 'Acid + Base → Salt + Water. HCl + NaOH → NaCl + H₂O + Heat.',
    objectives: ['Understand neutralization', 'Observe pH changes', 'Measure heat release'],
    tutorialSteps: [
      { title: 'Prepare reactants', description: 'Select acid and base solutions and inspect their initial pH values.' },
      { title: 'Mix carefully', description: 'Combine reactants and watch pH and temperature change as the reaction proceeds.' },
      { title: 'Interpret the outcome', description: 'Explain why the solution approaches neutrality and heat is released.' },
    ],
    formulas: [
      { key: 'neutralization', label: 'Neutralization', expression: 'H⁺ + OH⁻ → H₂O', description: 'Core ionic process behind acid-base neutralization.' },
    ],
    charts: [
      { key: 'ph_volume', title: 'pH vs Mixing Stage', xKey: 'step', yKey: 'ph', xLabel: 'Mixing Step', yLabel: 'pH' },
    ],
    validationRules: [
      { key: 'planned_neutralization', label: 'Neutralization completeness', description: 'Future rule for comparing measured final pH with expected equivalence.', implemented: false },
    ],
    outputMetrics: [
      { key: 'ph', label: 'pH', description: 'Acidity or basicity level during the reaction.' },
      { key: 'temperature', label: 'Temperature', unit: '°C', description: 'Temperature change caused by the reaction.' },
    ],
    controls: [],
    initialSetup: {
      chemicals: ['HCl', 'NaOH'],
    },
    buildInitialState: () => ({
      chemicals: ['HCl', 'NaOH'],
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  titration: {
    id: 'titration',
    name: 'Acid-Base Titration',
    category: 'chemistry',
    workspace: 'titration',
    description: 'Determine acid concentration using titration',
    theory: 'Add base gradually until pH reaches the equivalence region. The curve reveals concentration and neutralization behaviour.',
    objectives: ['Understand titration process', 'Identify equivalence point', 'Calculate concentration'],
    tutorialSteps: [
      { title: 'Set up the apparatus', description: 'Prepare the burette, flask, and indicator before starting the titration.' },
      { title: 'Add titrant gradually', description: 'Introduce base in small increments and watch the indicator and pH response.' },
      { title: 'Find the equivalence point', description: 'Use the titration curve and color change to identify the neutralization point.' },
    ],
    formulas: [
      { key: 'molarity', label: 'Concentration Balance', expression: 'M₁V₁ = M₂V₂', description: 'Relationship used to determine unknown concentration from titration data.' },
    ],
    charts: [
      { key: 'titration_curve', title: 'pH vs Titrant Volume', xKey: 'volumeAdded', yKey: 'ph', xLabel: 'Titrant Volume (mL)', yLabel: 'pH' },
    ],
    validationRules: [
      { key: 'planned_equivalence', label: 'Equivalence point detection', description: 'Future rule for checking equivalence point from the measured curve.', implemented: false },
    ],
    outputMetrics: [
      { key: 'volumeAdded', label: 'Volume Added', unit: 'mL', description: 'Cumulative titrant added.' },
      { key: 'ph', label: 'pH', description: 'Measured pH at each addition step.' },
    ],
    controls: [],
    initialSetup: {
      chemicals: ['HCl', 'NaOH'],
      apparatus: ['burette', 'flask', 'indicator'],
    },
    buildInitialState: () => ({
      chemicals: ['HCl', 'NaOH'],
      apparatus: ['burette', 'flask', 'indicator'],
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  electrolysis: {
    id: 'electrolysis',
    name: 'Electrolysis of Water',
    category: 'chemistry',
    workspace: 'electrolysis',
    description: 'Split water into hydrogen and oxygen using electricity',
    theory: '2H₂O → 2H₂ + O₂. Water decomposes when electric current passes through it.',
    objectives: [
      'Understand electrolysis process',
      'Observe gas collection at electrodes',
      'Verify 2:1 ratio of H₂ to O₂',
    ],
    tutorialSteps: [
      { title: 'Set electrical conditions', description: 'Adjust the applied voltage and electrolyte concentration.' },
      { title: 'Observe gas production', description: 'Watch hydrogen and oxygen evolve at different electrodes.' },
      { title: 'Check gas ratio', description: 'Compare collected gas volumes to the expected 2:1 ratio.' },
    ],
    formulas: [
      { key: 'stoichiometry', label: 'Gas Ratio', expression: '2H₂ : 1O₂', description: 'Expected stoichiometric ratio for water electrolysis.' },
      { key: 'charge', label: 'Electrical Work', expression: 'Q = It', description: 'Charge transferred through the electrolyte over time.' },
    ],
    charts: [
      { key: 'gas_volume', title: 'Gas Volume vs Time', xKey: 'time', yKey: 'h2Volume', xLabel: 'Time (s)', yLabel: 'Gas Volume (mL)' },
      { key: 'current_time', title: 'Current vs Time', xKey: 'time', yKey: 'current', xLabel: 'Time (s)', yLabel: 'Current (A)' },
    ],
    validationRules: [
      { key: 'gas_ratio', label: '2:1 gas ratio', description: 'Compare hydrogen and oxygen volumes with the expected stoichiometric ratio.', implemented: true },
      { key: 'current_response', label: 'Current response', description: 'Check whether current scales appropriately with voltage and concentration.', implemented: true },
    ],
    outputMetrics: [
      { key: 'current', label: 'Current', unit: 'A', description: 'Electrical current through the electrolyte.' },
      { key: 'h2Volume', label: 'Hydrogen Volume', unit: 'mL', description: 'Collected hydrogen gas volume.' },
      { key: 'o2Volume', label: 'Oxygen Volume', unit: 'mL', description: 'Collected oxygen gas volume.' },
    ],
    controls: [
      { key: 'voltage', label: 'Voltage', kind: 'range', min: 1, max: 12, step: 0.5, unit: 'V', description: 'Applied voltage across the electrodes.' },
      { key: 'electrolyteConc', label: 'Electrolyte Concentration', kind: 'range', min: 0.1, max: 1, step: 0.1, unit: 'M', description: 'Concentration of electrolyte in solution.' },
      {
        key: 'measurementMode',
        label: 'Measurement Mode',
        kind: 'select',
        description: 'Choose whether the lab stores a standard or detailed evidence profile.',
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Detailed', value: 'detailed' },
        ],
      },
    ],
    initialSetup: {
      chemicals: ['H2O', 'NaOH'],
      apparatus: ['electrodes', 'power supply', 'collection tubes'],
    },
    buildInitialState: (config) => ({
      time: 0,
      voltage: config.voltage,
      electrolyteConc: config.electrolyteConc,
      state: { voltage: config.voltage, current: 0, h2Volume: 0, o2Volume: 0, time: 0, bubbles: [] },
      sessionOptions: createSessionOptions(config),
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  flametest: {
    id: 'flametest',
    name: 'Flame Test',
    category: 'chemistry',
    workspace: 'flametest',
    description: 'Identify metal ions by flame color',
    theory: 'Metal ions emit characteristic colors when heated in a flame due to electron excitation.',
    objectives: [
      'Observe characteristic flame colors',
      'Identify unknown metal ions',
      'Understand electron energy levels',
    ],
    tutorialSteps: [
      { title: 'Select metal ions', description: 'Choose salts containing different metal ions for testing.' },
      { title: 'Heat the sample', description: 'Place the sample in the flame and note the emitted color.' },
      { title: 'Compare signatures', description: 'Use flame color to classify or identify the unknown ion.' },
    ],
    formulas: [
      { key: 'emission', label: 'Emission Concept', expression: 'ΔE = hf', description: 'Photon energy released when excited electrons drop to lower levels.' },
    ],
    charts: [
      { key: 'intensity_time', title: 'Emission Intensity vs Time', xKey: 'time', yKey: 'intensity', xLabel: 'Time (s)', yLabel: 'Intensity' },
    ],
    validationRules: [
      { key: 'planned_emission_match', label: 'Emission signature match', description: 'Future rule for matching observed color with expected ion signature.', implemented: false },
    ],
    outputMetrics: [
      { key: 'intensity', label: 'Emission Intensity', description: 'Relative brightness of the observed flame color.' },
      { key: 'observedColor', label: 'Observed Color', description: 'Color associated with the tested metal ion.' },
    ],
    controls: [],
    initialSetup: {
      chemicals: ['NaCl', 'KCl', 'CuCl2', 'LiCl', 'CaCl2', 'BaCl2'],
      apparatus: ['bunsen burner', 'nichrome wire'],
    },
    buildInitialState: () => ({
      chemicals: ['NaCl', 'KCl', 'CuCl2', 'LiCl', 'CaCl2', 'BaCl2'],
      apparatus: ['bunsen burner', 'nichrome wire'],
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  crystallization: {
    id: 'crystallization',
    name: 'Crystallization',
    category: 'chemistry',
    workspace: 'crystallization',
    description: 'Grow crystals from supersaturated solutions',
    theory: 'Crystals form when a solution becomes supersaturated and solute precipitates in ordered structures.',
    objectives: [
      'Prepare saturated solutions',
      'Observe crystal growth',
      'Understand solubility and temperature',
    ],
    tutorialSteps: [
      { title: 'Prepare a supersaturated solution', description: 'Dissolve as much solute as possible at high temperature.' },
      { title: 'Cool the solution', description: 'Allow the solution to cool so the excess solute begins to crystallize.' },
      { title: 'Track crystal growth', description: 'Observe how size and shape develop with time and conditions.' },
    ],
    formulas: [
      { key: 'solubility', label: 'Solubility Trend', expression: 'solubility = f(T)', description: 'Many solids become more soluble as temperature increases.' },
    ],
    charts: [
      { key: 'crystal_growth', title: 'Crystal Size vs Time', xKey: 'time', yKey: 'crystalSize', xLabel: 'Time (s)', yLabel: 'Crystal Size' },
    ],
    validationRules: [
      { key: 'planned_growth_rate', label: 'Crystal growth trend', description: 'Future rule for comparing growth trend under different cooling conditions.', implemented: false },
    ],
    outputMetrics: [
      { key: 'crystalSize', label: 'Crystal Size', description: 'Observed or simulated crystal growth over time.' },
      { key: 'temperature', label: 'Temperature', unit: '°C', description: 'Solution temperature as crystallization proceeds.' },
    ],
    controls: [],
    initialSetup: {
      chemicals: ['CuSO4', 'NaCl', 'Alum'],
      apparatus: ['beaker', 'stirring rod', 'seed crystal'],
    },
    buildInitialState: () => ({
      chemicals: ['CuSO4', 'NaCl', 'Alum'],
      apparatus: ['beaker', 'stirring rod', 'seed crystal'],
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
  displacement: {
    id: 'displacement',
    name: 'Metal Displacement',
    category: 'chemistry',
    workspace: 'displacement',
    description: 'Observe reactivity series through displacement reactions',
    theory: 'A more reactive metal displaces a less reactive metal from its compound.',
    objectives: [
      'Understand reactivity series',
      'Observe metal displacement',
      'Predict reaction outcomes',
    ],
    tutorialSteps: [
      { title: 'Choose metals and solutions', description: 'Select a metal strip and a salt solution for the displacement test.' },
      { title: 'Watch the reaction', description: 'Observe deposits, color changes, or dissolution that indicate displacement.' },
      { title: 'Relate to the reactivity series', description: 'Explain why one metal can displace another based on reactivity.' },
    ],
    formulas: [
      { key: 'reactivity', label: 'Reactivity Principle', expression: 'more reactive metal + less reactive ion → displacement', description: 'General form of a displacement reaction.' },
    ],
    charts: [
      { key: 'reaction_progress', title: 'Reaction Progress vs Time', xKey: 'time', yKey: 'progress', xLabel: 'Time (s)', yLabel: 'Progress' },
    ],
    validationRules: [
      { key: 'planned_reactivity_prediction', label: 'Reaction prediction', description: 'Future rule for comparing chosen metals with reactivity-series expectations.', implemented: false },
    ],
    outputMetrics: [
      { key: 'progress', label: 'Reaction Progress', description: 'Relative extent of displacement reaction over time.' },
      { key: 'colorShift', label: 'Color Shift', description: 'Observed color change in the solution.' },
    ],
    controls: [],
    initialSetup: {
      chemicals: ['Zn', 'CuSO4', 'Fe', 'AgNO3'],
      apparatus: ['test tubes', 'metal strips'],
    },
    buildInitialState: () => ({
      chemicals: ['Zn', 'CuSO4', 'Fe', 'AgNO3'],
      apparatus: ['test tubes', 'metal strips'],
      dataPoints: [],
      savedAt: new Date().toISOString(),
    }),
  },
} satisfies Record<string, ExperimentDefinition>;

export type ExperimentDefinitionId = keyof typeof DEFINITIONS;
export type ExperimentDefinitionMap = typeof DEFINITIONS;

export const EXPERIMENT_DEFINITIONS = DEFINITIONS;

export const EXPERIMENT_TEMPLATES = (
  Object.entries(EXPERIMENT_DEFINITIONS) as Array<
    [ExperimentDefinitionId, ExperimentDefinitionMap[ExperimentDefinitionId]]
  >
).reduce<
  Record<
    ExperimentDefinitionId,
    {
      name: string;
      category: ExperimentCategory;
      description: string;
      theory: string;
      objectives: string[];
      initialSetup: Record<string, any>;
    }
  >
>((acc, [id, definition]) => {
  acc[id] = {
    name: definition.name,
    category: definition.category,
    description: definition.description,
    theory: definition.theory,
    objectives: [...definition.objectives],
    initialSetup: deepClone(definition.initialSetup),
  };

  return acc;
}, {} as Record<
  ExperimentDefinitionId,
  {
    name: string;
    category: ExperimentCategory;
    description: string;
    theory: string;
    objectives: string[];
    initialSetup: Record<string, any>;
  }
>);

export function getExperimentDefinition(experimentId: string) {
  if (experimentId in EXPERIMENT_DEFINITIONS) {
    return EXPERIMENT_DEFINITIONS[experimentId as ExperimentDefinitionId];
  }

  return null;
}

export function getExperimentDefinitionsByCategory(category: ExperimentCategory) {
  return (Object.entries(EXPERIMENT_DEFINITIONS) as Array<
    [ExperimentDefinitionId, ExperimentDefinitionMap[ExperimentDefinitionId]]
  >).filter(([, definition]) => definition.category === category);
}

export function createInitialStateFromDefinition(
  experimentId: ExperimentDefinitionId,
  config: ExperimentSessionConfig = DEFAULT_EXPERIMENT_SESSION_CONFIG
) {
  return deepClone(EXPERIMENT_DEFINITIONS[experimentId].buildInitialState(config));
}
