// Physics Constants
export const PHYSICS = {
  GRAVITY: 9.8, // m/s²
  SCALE: 50, // pixels per meter
  FPS: 60,
  DELTA_TIME: 1000 / 60, // milliseconds
  AIR_RESISTANCE: 0.01,
  FRICTION: 0.1,
};

// Canvas Dimensions
export const CANVAS = {
  WIDTH: 800,
  HEIGHT: 600,
  BACKGROUND_COLOR: '#f0f4f8',
  GRID_SIZE: 50,
};

// Chemistry Reaction Rules
export const REACTION_MATRIX = {
  'HCl+NaOH': {
    product: 'NaCl+H2O',
    name: 'Salt Water',
    heat: 50,
    color: '#4ade80',
    animation: 'neutralization',
  },
  'K+H2O': {
    product: 'KOH+H2',
    name: 'Potassium Hydroxide + Hydrogen',
    heat: 500,
    color: '#f59e0b',
    animation: 'explosion',
  },
  'CaCO3+HCl': {
    product: 'CaCl2+H2O+CO2',
    name: 'Calcium Chloride + Water + Carbon Dioxide',
    heat: 20,
    color: '#06b6d4',
    animation: 'bubbling',
  },
  'Fe+CuSO4': {
    product: 'FeSO4+Cu',
    name: 'Iron Sulfate + Copper',
    heat: 30,
    color: '#8b5cf6',
    animation: 'displacement',
  },
};

// Chemical Properties
export const CHEMICALS = {
  HCl: {
    name: 'Hydrochloric Acid',
    formula: 'HCl',
    color: '#ef4444',
    ph: 1,
    density: 1.18,
    state: 'liquid',
    hazard: 'corrosive',
  },
  NaOH: {
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    color: '#3b82f6',
    ph: 14,
    density: 2.13,
    state: 'solid',
    hazard: 'corrosive',
  },
  H2O: {
    name: 'Water',
    formula: 'H₂O',
    color: '#06b6d4',
    ph: 7,
    density: 1.0,
    state: 'liquid',
    hazard: 'none',
  },
  NaCl: {
    name: 'Sodium Chloride',
    formula: 'NaCl',
    color: '#e5e7eb',
    ph: 7,
    density: 2.16,
    state: 'solid',
    hazard: 'none',
  },
};

// Physics Objects
export const PHYSICS_OBJECTS = {
  ball: {
    name: 'Ball',
    mass: 1,
    restitution: 0.8,
    friction: 0.1,
    color: '#ef4444',
  },
  box: {
    name: 'Box',
    mass: 2,
    restitution: 0.3,
    friction: 0.5,
    color: '#8b5cf6',
  },
  ramp: {
    name: 'Ramp',
    mass: 0, // Static
    restitution: 0.5,
    friction: 0.3,
    color: '#6b7280',
  },
  spring: {
    name: 'Spring',
    stiffness: 0.05,
    damping: 0.01,
    restLength: 100,
    color: '#22c55e',
  },
};

// Experiment Templates
export const EXPERIMENT_TEMPLATES = {
  freefall: {
    name: 'Free Fall',
    category: 'physics',
    description: 'Study acceleration due to gravity',
    theory: 'An object in free fall accelerates at g = 9.8 m/s². Distance: d = ½gt²',
    objectives: [
      'Verify gravitational acceleration',
      'Understand velocity-time relationship',
      'Analyze position-time graphs',
    ],
    initialSetup: {
      objects: [
        { type: 'ball', x: 400, y: 100, radius: 20 },
      ],
    },
  },
  projectilemotion: {
    name: 'Projectile Motion',
    category: 'physics',
    description: 'Analyze 2D motion under gravity',
    theory: 'A projectile follows a parabolic path. Horizontal and vertical motions are independent.',
    objectives: [
      'Understand parabolic trajectories',
      'Analyze range vs angle relationship',
      'Study time of flight',
    ],
    initialSetup: {
      objects: [
        { type: 'cannon', x: 50, y: 500, angle: 45, velocity: 20 },
      ],
    },
  },
  pendulum: {
    name: 'Simple Pendulum',
    category: 'physics',
    description: 'Study periodic motion and energy conservation',
    theory: 'Period T = 2π√(L/g). Energy oscillates between kinetic and potential.',
    objectives: [
      'Measure period of oscillation',
      'Study effect of length on period',
      'Observe energy conservation',
    ],
    initialSetup: {
      objects: [
        { type: 'pendulum', x: 400, y: 100, length: 200, mass: 1 },
      ],
    },
  },
  collision: {
    name: 'Elastic Collision',
    category: 'physics',
    description: 'Study momentum and energy conservation',
    theory: 'In elastic collisions: momentum and kinetic energy are conserved.',
    objectives: [
      'Verify momentum conservation',
      'Analyze velocity exchange',
      'Study coefficient of restitution',
    ],
    initialSetup: {
      objects: [
        { type: 'ball', x: 200, y: 300, radius: 20, vx: 5, vy: 0 },
        { type: 'ball', x: 600, y: 300, radius: 20, vx: 0, vy: 0 },
      ],
    },
  },
  acidbase: {
    name: 'Acid-Base Neutralization',
    category: 'chemistry',
    description: 'Observe neutralization reaction',
    theory: 'Acid + Base → Salt + Water. HCl + NaOH → NaCl + H₂O + Heat',
    objectives: [
      'Understand neutralization',
      'Observe pH changes',
      'Measure heat release',
    ],
    initialSetup: {
      chemicals: ['HCl', 'NaOH'],
    },
  },
  titration: {
    name: 'Acid-Base Titration',
    category: 'chemistry',
    description: 'Determine acid concentration using titration',
    theory: 'Add base gradually until pH = 7 (equivalence point)',
    objectives: [
      'Understand titration process',
      'Identify equivalence point',
      'Calculate concentration',
    ],
    initialSetup: {
      chemicals: ['HCl', 'NaOH'],
      apparatus: ['burette', 'flask', 'indicator'],
    },
  },
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

// Data Export Settings
export const EXPORT = {
  CSV_DELIMITER: ',',
  MAX_DATA_POINTS: 10000,
  CHART_IMAGE_FORMAT: 'png',
  CHART_IMAGE_QUALITY: 0.95,
};