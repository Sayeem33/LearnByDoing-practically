"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
// Tutorial data for all experiments
const tutorialData = [
    {
        experimentId: 'freefall',
        experimentName: 'Free Fall',
        category: 'physics',
        description: 'Understand the motion of objects falling under gravity without air resistance',
        difficulty: 'beginner',
        duration: 15,
        objectives: [
            'Understand acceleration due to gravity',
            'Learn the equations of motion for free fall',
            'Analyze velocity and displacement relationships',
            'Interpret motion graphs',
        ],
        prerequisites: ['Basic algebra', 'Understanding of velocity and acceleration'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'What is Free Fall?',
                content: 'Free fall is the motion of an object under the influence of gravity alone, with no other forces acting on it (like air resistance). On Earth, all objects in free fall experience the same acceleration regardless of their mass.',
                keyPoints: [
                    'Free fall occurs when only gravity acts on an object',
                    'Acceleration due to gravity (g) = 9.8 m/s²',
                    'All objects fall at the same rate in a vacuum',
                    'Direction: downward (toward the center of Earth)',
                ],
                visualDescription: 'Imagine a ball dropped from a building. Show position markers at equal time intervals getting further apart (accelerating)',
            },
            {
                chapterNumber: 2,
                title: 'Equations of Motion',
                content: 'The motion of a falling object can be described using kinematic equations. These equations relate displacement, velocity, acceleration, and time.',
                keyPoints: [
                    'Velocity: v = gt (starting from rest)',
                    'Displacement: s = ½gt²',
                    'Velocity squared: v² = 2gs',
                    'All equations use g = 9.8 m/s² downward',
                ],
                formula: 'v = gt, s = ½gt², v² = 2gs',
                examples: [
                    {
                        title: 'Example 1: Finding velocity after 2 seconds',
                        description: 'A ball is dropped from rest. What is its velocity after 2 seconds?',
                        calculation: 'v = gt = 9.8 × 2 = 19.6 m/s',
                    },
                    {
                        title: 'Example 2: Finding distance fallen',
                        description: 'How far does a ball fall in 3 seconds?',
                        calculation: 's = ½gt² = ½ × 9.8 × 3² = ½ × 9.8 × 9 = 44.1 m',
                    },
                    {
                        title: 'Example 3: Finding velocity from distance',
                        description: 'A ball falls 50 meters. What is its final velocity?',
                        calculation: 'v² = 2gs → v = √(2 × 9.8 × 50) = √(980) = 31.3 m/s',
                    },
                ],
            },
            {
                chapterNumber: 3,
                title: 'Velocity-Time Graphs',
                content: 'A velocity-time graph for free fall is a straight line because the acceleration is constant. The slope of the line equals the acceleration due to gravity.',
                keyPoints: [
                    'Velocity increases linearly with time',
                    'Slope = acceleration = 9.8 m/s²',
                    'The line passes through origin (starts from rest if dropped)',
                    'Steeper slope = greater acceleration',
                ],
                visualDescription: 'Show a straight line on a v-t graph starting at origin, with velocity on y-axis and time on x-axis. The slope is constant at 9.8 m/s per second.',
            },
            {
                chapterNumber: 4,
                title: 'Position-Time Graphs',
                content: 'A position-time graph for free fall is a parabola because the displacement depends on time squared. The curve gets steeper as time increases, showing acceleration.',
                keyPoints: [
                    'Graph is parabolic (curved)',
                    'Steepness increases with time',
                    'Curvature shows acceleration',
                    'Starting point depends on initial height',
                ],
                visualDescription: 'Show a parabolic curve on a position-time graph. Mark positions at equal time intervals showing increasing distances between them.',
            },
            {
                chapterNumber: 5,
                title: 'Real-World Considerations',
                content: 'In reality, objects experience air resistance which affects their motion. However, for most everyday scenarios and this simulation, we can ignore air resistance for small objects over short distances.',
                keyPoints: [
                    'Air resistance increases with speed and surface area',
                    'Terminal velocity occurs when air resistance equals gravitational force',
                    'Denser objects experience less effect from air resistance',
                    'At high speeds, air resistance becomes very significant',
                ],
            },
        ],
        relatedTopics: [
            'Projectile Motion',
            'Gravitational Force',
            'Kinematics',
            'Energy Conservation',
        ],
        references: [
            {
                title: 'Khan Academy - Free Fall',
                url: 'https://www.khanacademy.org/science/physics/one-dimensional-motion/kinematic-equations/v/introduction-to-free-fall',
            },
            {
                title: 'PhET Simulations - Free Fall',
                url: 'https://phet.colorado.edu',
            },
        ],
    },
    {
        experimentId: 'projectilemotion',
        experimentName: 'Projectile Motion',
        category: 'physics',
        description: 'Study the combined effects of horizontal and vertical motion in projectile motion',
        difficulty: 'intermediate',
        duration: 20,
        objectives: [
            'Understand independence of horizontal and vertical motion',
            'Learn how launch angle affects range and height',
            'Analyze projectile trajectories',
            'Calculate range, height, and time of flight',
        ],
        prerequisites: ['Free Fall', 'Vector components', 'Trigonometry basics'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'What is Projectile Motion?',
                content: 'Projectile motion occurs when an object is launched into the air and follows a curved path under the influence of gravity. The key insight is that the horizontal and vertical components of motion are independent of each other.',
                keyPoints: [
                    'Horizontal motion: constant velocity (no acceleration)',
                    'Vertical motion: constant acceleration (gravity)',
                    'Path is parabolic',
                    'Launch angle and initial velocity determine the trajectory',
                ],
                visualDescription: 'Show a cannon firing at an angle. The path of the projectile curves downward following a parabola. Show velocity vectors at different points.',
            },
            {
                chapterNumber: 2,
                title: 'Velocity Components',
                content: 'When a projectile is launched, the initial velocity can be broken into horizontal and vertical components using trigonometry.',
                keyPoints: [
                    'Horizontal component: vₓ = v₀ cos(θ)',
                    'Vertical component: vᵧ = v₀ sin(θ)',
                    'Horizontal velocity remains constant throughout flight',
                    'Vertical velocity changes due to gravity',
                ],
                formula: 'vₓ = v₀ cos(θ), vᵧ = v₀ sin(θ)',
                examples: [
                    {
                        title: 'Example 1: Finding velocity components',
                        description: 'A projectile is launched at 20 m/s at 45° angle. Find the components.',
                        calculation: 'vₓ = 20 × cos(45°) = 20 × 0.707 = 14.14 m/s\nvᵧ = 20 × sin(45°) = 20 × 0.707 = 14.14 m/s',
                    },
                ],
            },
            {
                chapterNumber: 3,
                title: 'Time of Flight',
                content: 'The time a projectile stays in the air depends on its initial vertical velocity and gravity. When the projectile returns to the launch height, the total time of flight can be calculated.',
                keyPoints: [
                    'Time to max height: t = vᵧ / g',
                    'Total time of flight: T = 2vᵧ / g',
                    'Height of launch point affects time',
                    'Independent of horizontal velocity',
                ],
                formula: 'T = 2v₀sin(θ) / g',
                examples: [
                    {
                        title: 'Example: Time of flight at 45°',
                        description: 'Initial velocity 20 m/s at 45°',
                        calculation: 'vᵧ = 20 × sin(45°) = 14.14 m/s\nT = 2 × 14.14 / 9.8 = 2.89 seconds',
                    },
                ],
            },
            {
                chapterNumber: 4,
                title: 'Range (Horizontal Distance)',
                content: 'The range is the horizontal distance traveled by the projectile during its flight. It depends on the launch angle, initial velocity, and gravity.',
                keyPoints: [
                    'Range: R = (v₀²sin(2θ)) / g',
                    'Maximum range occurs at 45° angle',
                    'Range increases with initial velocity',
                    'Complementary angles (30° and 60°) give same range',
                ],
                formula: 'R = (v₀² × sin(2θ)) / g',
                examples: [
                    {
                        title: 'Example: Range at 45°',
                        description: 'Initial velocity 20 m/s at 45°',
                        calculation: 'R = (20² × sin(90°)) / 9.8 = 400 / 9.8 = 40.8 m',
                    },
                ],
            },
            {
                chapterNumber: 5,
                title: 'Maximum Height',
                content: 'The maximum height is reached when the vertical velocity becomes zero. This is when all the initial vertical kinetic energy is converted to potential energy.',
                keyPoints: [
                    'At max height: vᵧ = 0',
                    'Height: H = (v₀²sin²(θ)) / (2g)',
                    'Time to reach max height: t = v₀sin(θ) / g',
                    'Max height occurs at mid-flight time',
                ],
                formula: 'H = (v₀² × sin²(θ)) / (2g)',
                examples: [
                    {
                        title: 'Example: Maximum height at 45°',
                        description: 'Initial velocity 20 m/s at 45°',
                        calculation: 'H = (20² × sin²(45°)) / (2 × 9.8) = (400 × 0.5) / 19.6 = 10.2 m',
                    },
                ],
            },
            {
                chapterNumber: 6,
                title: 'Trajectory Equation',
                content: 'The path of a projectile can be described by an equation that relates vertical position (y) to horizontal position (x). This equation represents a parabola.',
                keyPoints: [
                    'Trajectory equation: y = x·tan(θ) - (g·x²)/(2v₀²cos²(θ))',
                    'The path is a parabola',
                    'Independent of launch angle, all projectiles follow similar curved paths',
                    'Can be used to predict where projectile will be',
                ],
            },
        ],
        relatedTopics: ['Free Fall', 'Vector Analysis', 'Circular Motion', 'Energy'],
        references: [
            {
                title: 'Khan Academy - Projectile Motion',
                url: 'https://www.khanacademy.org/science/physics/two-dimensional-motion/projectile-motion',
            },
        ],
    },
    {
        experimentId: 'pendulum',
        experimentName: 'Simple Pendulum',
        category: 'physics',
        description: 'Study periodic motion and energy conservation in a simple pendulum',
        difficulty: 'beginner',
        duration: 18,
        objectives: [
            'Understand simple harmonic motion',
            'Learn the relationship between period and length',
            'Observe energy conservation',
            'Analyze pendulum motion graphs',
        ],
        prerequisites: ['Basic trigonometry', 'Understanding of energy'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'What is a Pendulum?',
                content: 'A simple pendulum consists of a mass (bob) attached to a string or rod of fixed length that swings freely under gravity. It demonstrates simple harmonic motion and is one of the most common examples of periodic motion.',
                keyPoints: [
                    'Composed of a mass and a string/rod',
                    'Swings back and forth in a regular pattern',
                    'Motion is periodic (repeats)',
                    'Amplitude: maximum angle from vertical',
                ],
                visualDescription: 'Show a pendulum swinging back and forth. Mark the equilibrium position and maximum displacement. Show the motion path as a smooth arc.',
            },
            {
                chapterNumber: 2,
                title: 'Period and Frequency',
                content: 'The period is the time it takes for one complete oscillation. Frequency is the number of oscillations per second. These are fundamental properties of periodic motion.',
                keyPoints: [
                    'Period (T): time for one complete swing',
                    'Frequency (f): number of swings per second',
                    'Relationship: T = 1/f',
                    'For a pendulum: T = 2π√(L/g)',
                ],
                formula: 'T = 2π√(L/g) where L is length and g is gravity',
                examples: [
                    {
                        title: 'Example 1: Period of 1-meter pendulum',
                        description: 'Find the period of a 1-meter long pendulum',
                        calculation: 'T = 2π√(1/9.8) = 2π × 0.319 = 2.01 seconds',
                    },
                    {
                        title: 'Example 2: Period of 0.5-meter pendulum',
                        description: 'How does halving the length affect the period?',
                        calculation: 'T = 2π√(0.5/9.8) = 2π × 0.226 = 1.42 seconds',
                    },
                ],
            },
            {
                chapterNumber: 3,
                title: 'Effect of Length on Period',
                content: 'The length of the pendulum is the most important factor determining its period. A longer pendulum swings more slowly (longer period) than a shorter one.',
                keyPoints: [
                    'Period is proportional to √L',
                    'Doubling length increases period by √2 (about 1.41 times)',
                    'Quadrupling length doubles the period',
                    'Mass of bob does NOT affect period',
                ],
                visualDescription: 'Show three pendulums of different lengths side by side. The longer one swings slower. Include a graph showing period vs length relationship.',
            },
            {
                chapterNumber: 4,
                title: 'Energy in a Pendulum',
                content: 'As a pendulum swings, energy constantly converts between potential and kinetic energy. The total mechanical energy remains constant (energy conservation).',
                keyPoints: [
                    'At maximum displacement: Maximum PE, Minimum KE',
                    'At equilibrium: Minimum PE, Maximum KE',
                    'Total Energy = PE + KE = constant',
                    'Energy is related to amplitude of swing',
                ],
                formula: 'Total Energy = ½mv² + mgh',
                examples: [
                    {
                        title: 'Energy at different positions',
                        description: 'At the top: PE is maximum, KE is zero\nAt the bottom: PE is minimum, KE is maximum\nAt intermediate position: Both PE and KE present',
                        calculation: 'Energy transformation is continuous and smooth',
                    },
                ],
            },
            {
                chapterNumber: 5,
                title: 'Amplitude and Period',
                content: 'An important property of the simple pendulum is that the period is independent of amplitude. Whether the pendulum swings through a small or large angle, the period remains the same (for small angles).',
                keyPoints: [
                    'Period is independent of amplitude (for small angles < 15°)',
                    'This is called isochronism',
                    'For large angles, period slightly increases',
                    'Useful in clock design',
                ],
            },
            {
                chapterNumber: 6,
                title: 'Simple Harmonic Motion',
                content: 'A pendulum (for small angles) exhibits simple harmonic motion, where the restoring force is proportional to displacement. This results in the sinusoidal motion we observe.',
                keyPoints: [
                    'Restoring force: F = -mgsin(θ) ≈ -mgθ (for small θ)',
                    'Results in sinusoidal motion',
                    'Acceleration is always directed toward equilibrium',
                    'Characterized by constant frequency regardless of amplitude',
                ],
            },
        ],
        relatedTopics: [
            'Circular Motion',
            'Energy Conservation',
            'Oscillations',
            'Waves',
        ],
        references: [
            {
                title: 'Khan Academy - Pendulums',
                url: 'https://www.khanacademy.org/science/physics/oscillations-and-waves/pendulums',
            },
        ],
    },
    {
        experimentId: 'collision',
        experimentName: 'Elastic Collision',
        category: 'physics',
        description: 'Understand momentum and energy conservation in elastic collisions',
        difficulty: 'intermediate',
        duration: 22,
        objectives: [
            'Understand momentum conservation',
            'Learn about elastic collisions',
            'Calculate velocities after collision',
            'Compare kinetic energy before and after',
        ],
        prerequisites: ['Newton\'s Laws', 'Kinetic Energy', 'Basic algebra'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'What is a Collision?',
                content: 'A collision occurs when two objects come into contact and exert forces on each other. There are two main types: elastic collisions (kinetic energy conserved) and inelastic collisions (kinetic energy not conserved).',
                keyPoints: [
                    'Collision: two objects interact through contact',
                    'Elastic collision: KE is conserved',
                    'Inelastic collision: KE is not conserved',
                    'Momentum is always conserved',
                ],
                visualDescription: 'Show two balls approaching each other, making contact, and separating. Indicate momentum vectors before and after collision.',
            },
            {
                chapterNumber: 2,
                title: 'Momentum Conservation',
                content: 'The law of conservation of momentum states that the total momentum before a collision equals the total momentum after the collision (in the absence of external forces).',
                keyPoints: [
                    'Momentum: p = mv',
                    'Total momentum before = Total momentum after',
                    'p₁ᵢ + p₂ᵢ = p₁f + p₂f',
                    'Applies to all collisions (elastic and inelastic)',
                ],
                formula: 'm₁v₁ᵢ + m₂v₂ᵢ = m₁v₁f + m₂v₂f',
                examples: [
                    {
                        title: 'Example: Two ball collision',
                        description: 'Ball 1 (2 kg) moving at 5 m/s hits stationary ball 2 (2 kg)',
                        calculation: 'Before: p = 2×5 + 2×0 = 10 kg·m/s\nAfter: p = 2×v₁f + 2×v₂f = 10 kg·m/s\nFor equal masses: v₁f = 0, v₂f = 5 m/s',
                    },
                ],
            },
            {
                chapterNumber: 3,
                title: 'Elastic Collisions',
                content: 'In an elastic collision, both momentum AND kinetic energy are conserved. This typically occurs with hard objects like billiard balls or steel spheres.',
                keyPoints: [
                    'Both momentum and kinetic energy conserved',
                    'Objects may bounce off each other',
                    'Common in atomic and subatomic collisions',
                    'Coefficient of restitution (e) = 1',
                ],
                formula: 'Momentum: m₁v₁ᵢ + m₂v₂ᵢ = m₁v₁f + m₂v₂f\nEnergy: ½m₁v₁ᵢ² + ½m₂v₂ᵢ² = ½m₁v₁f² + ½m₂v₂f²',
            },
            {
                chapterNumber: 4,
                title: 'Elastic Collision Formulas',
                content: 'For two objects in a head-on elastic collision, we can derive formulas for the final velocities directly.',
                keyPoints: [
                    'For equal masses with one stationary: velocities exchange',
                    'For different masses: use the full formula',
                    'Final velocity depends on both initial velocity and mass ratio',
                    'Can have negative velocities (opposite direction)',
                ],
                formula: 'v₁f = ((m₁-m₂)/(m₁+m₂))v₁ᵢ + (2m₂/(m₁+m₂))v₂ᵢ\nv₂f = (2m₁/(m₁+m₂))v₁ᵢ + ((m₂-m₁)/(m₁+m₂))v₂ᵢ',
                examples: [
                    {
                        title: 'Example: Equal masses',
                        description: 'Two 1 kg balls, first moving at 4 m/s, second at rest',
                        calculation: 'v₁f = 0 m/s, v₂f = 4 m/s (velocities exchange)',
                    },
                    {
                        title: 'Example: Different masses',
                        description: '2 kg ball at 5 m/s hits stationary 1 kg ball',
                        calculation: 'v₁f = ((2-1)/(2+1))×5 = (1/3)×5 = 1.67 m/s\nv₂f = (2×2/(2+1))×5 = (4/3)×5 = 6.67 m/s',
                    },
                ],
            },
            {
                chapterNumber: 5,
                title: 'Coefficient of Restitution',
                content: 'The coefficient of restitution (e) is a measure of how much kinetic energy is retained in a collision. For elastic collisions, e = 1.',
                keyPoints: [
                    'e = relative velocity of separation / relative velocity of approach',
                    'For elastic collision: e = 1',
                    'For perfectly inelastic: e = 0',
                    'For partial: 0 < e < 1',
                ],
                formula: 'e = |v₂f - v₁f| / |v₁ᵢ - v₂ᵢ|',
            },
            {
                chapterNumber: 6,
                title: 'Real-World Collisions',
                content: 'Most real collisions are partially inelastic, losing some energy to sound, heat, and deformation. However, elastic collisions are a good approximation for many situations.',
                keyPoints: [
                    'Billiard balls: nearly elastic (e ≈ 0.95)',
                    'Tennis balls: partially elastic',
                    'Car crash: very inelastic (e ≈ 0)',
                    'Understanding collision type helps predict outcomes',
                ],
            },
        ],
        relatedTopics: [
            'Newton\'s Laws',
            'Kinetic Energy',
            'Work and Energy',
            'Inelastic Collisions',
        ],
        references: [
            {
                title: 'Khan Academy - Elastic Collisions',
                url: 'https://www.khanacademy.org/science/physics/linear-momentum/elastic-and-inelastic-collisions',
            },
        ],
    },
    {
        experimentId: 'acidbase',
        experimentName: 'Acid-Base Neutralization',
        category: 'chemistry',
        description: 'Observe and understand acid-base neutralization reactions',
        difficulty: 'beginner',
        duration: 16,
        objectives: [
            'Understand acids and bases',
            'Learn about neutralization reactions',
            'Understand pH scale',
            'Observe heat release in exothermic reactions',
        ],
        prerequisites: ['Basic atomic structure', 'Understanding of reactants and products'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'Acids and Bases',
                content: 'Acids and bases are chemical compounds with opposite properties. Acids donate hydrogen ions (H⁺) and taste sour, while bases accept hydrogen ions and taste bitter. The pH scale measures how acidic or basic a solution is.',
                keyPoints: [
                    'Acid: donates H⁺ ions, pH < 7',
                    'Base: accepts H⁺ ions, pH > 7',
                    'pH scale: 0-14, where 7 is neutral',
                    'Strong acids/bases dissociate completely',
                ],
                visualDescription: 'Show pH scale from 0 to 14 with examples. Indicate acids on left (0-7), neutral in middle (7), bases on right (7-14).',
            },
            {
                chapterNumber: 2,
                title: 'pH Scale',
                content: 'The pH scale is a logarithmic scale that measures the concentration of hydrogen ions in a solution. Each unit change represents a 10-fold change in H⁺ concentration.',
                keyPoints: [
                    'pH = -log[H⁺]',
                    'pH < 7: acidic',
                    'pH = 7: neutral',
                    'pH > 7: basic',
                    'Each unit is 10× more or less H⁺',
                ],
                formula: 'pH = -log[H⁺], where [H⁺] is hydrogen ion concentration',
                examples: [
                    {
                        title: 'Example: Lemon juice pH',
                        description: 'Lemon juice has [H⁺] = 0.01 M',
                        calculation: 'pH = -log(0.01) = 2 (acidic)',
                    },
                    {
                        title: 'Example: Baking soda pH',
                        description: 'Baking soda solution has [H⁺] = 10⁻⁹ M',
                        calculation: 'pH = -log(10⁻⁹) = 9 (basic)',
                    },
                ],
            },
            {
                chapterNumber: 3,
                title: 'Strong Acids and Bases',
                content: 'Strong acids and bases completely dissociate in water, meaning they break apart entirely into ions. Common strong acids include HCl, HBr, HI, HNO₃, H₂SO₄, and HClO₄.',
                keyPoints: [
                    'Strong acids: HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄',
                    'Strong bases: NaOH, KOH, LiOH, Ba(OH)₂',
                    'Complete dissociation: HA → H⁺ + A⁻',
                    'Produce high [H⁺] or [OH⁻]',
                ],
            },
            {
                chapterNumber: 4,
                title: 'Neutralization Reaction',
                content: 'When an acid and base react, they neutralize each other in a neutralization reaction. The general form is: Acid + Base → Salt + Water.',
                keyPoints: [
                    'General form: HA + BOH → BA + H₂O',
                    'Produces salt and water',
                    'Reaction is typically exothermic (releases heat)',
                    'pH of product depends on relative amounts',
                ],
                formula: 'HCl + NaOH → NaCl + H₂O',
                examples: [
                    {
                        title: 'Example: Hydrochloric acid + Sodium hydroxide',
                        description: 'Mixing strong acid and strong base produces salt and water',
                        calculation: 'HCl + NaOH → NaCl + H₂O\nIf equal moles: final pH = 7 (neutral)',
                    },
                    {
                        title: 'Example: Excess acid',
                        description: 'If more HCl than NaOH',
                        calculation: 'Some HCl remains unreacted\nFinal pH < 7 (acidic)',
                    },
                ],
            },
            {
                chapterNumber: 5,
                title: 'Stoichiometry of Neutralization',
                content: 'The amount of acid and base needed to completely neutralize each other depends on their concentrations and volumes. At the equivalence point, all acid is neutralized by base.',
                keyPoints: [
                    'Equivalence point: moles acid = moles base (in terms of H⁺ and OH⁻)',
                    'At equivalence: pH = 7 for strong acid + strong base',
                    'Before equivalence: solution is acidic',
                    'After equivalence: solution is basic',
                ],
                formula: 'Moles acid = Moles base (for complete neutralization)',
                examples: [
                    {
                        title: 'Example: 1 M HCl neutralization',
                        description: 'How much 1 M NaOH needed to neutralize 50 mL of 1 M HCl?',
                        calculation: 'Moles HCl = 1 × 0.050 = 0.05 mol\nMoles NaOH needed = 0.05 mol\nVolume NaOH = 0.05 / 1 = 50 mL',
                    },
                ],
            },
            {
                chapterNumber: 6,
                title: 'Heat of Neutralization',
                content: 'Neutralization reactions are exothermic, meaning they release energy in the form of heat. For strong acid-strong base reactions, the heat released is approximately constant.',
                keyPoints: [
                    'Neutralization is exothermic (ΔH < 0)',
                    'Heat of neutralization ≈ -57 kJ/mol for strong acid-base',
                    'Temperature increase can be measured',
                    'Energy released breaks bonds in reactants',
                ],
            },
        ],
        relatedTopics: [
            'pH and pOH',
            'Buffer Solutions',
            'Titration',
            'Ionic Equations',
        ],
        references: [
            {
                title: 'Khan Academy - Acids and Bases',
                url: 'https://www.khanacademy.org/science/chemistry/acids-bases-and-salts',
            },
        ],
    },
    {
        experimentId: 'titration',
        experimentName: 'Acid-Base Titration',
        category: 'chemistry',
        description: 'Learn analytical chemistry through titration analysis',
        difficulty: 'intermediate',
        duration: 25,
        objectives: [
            'Understand titration procedure',
            'Learn to identify the equivalence point',
            'Calculate concentration using titration data',
            'Understand analytical chemistry techniques',
        ],
        prerequisites: ['Acid-Base Neutralization', 'Molarity', 'pH scale'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'What is Titration?',
                content: 'Titration is an analytical procedure used to determine the concentration of a substance in a solution. A solution of known concentration (titrant) is gradually added to a solution of unknown concentration (analyte) until a color change occurs, indicating the endpoint.',
                keyPoints: [
                    'Titration determines unknown concentration',
                    'Titrant: solution of known concentration',
                    'Analyte: solution of unknown concentration',
                    'Endpoint: color change indicating completion',
                    'Equivalence point: all analyte is neutralized',
                ],
                visualDescription: 'Show a burette containing titrant above a flask containing analyte. Include color change at endpoint.',
            },
            {
                chapterNumber: 2,
                title: 'Equipment and Setup',
                content: 'Titration requires specific laboratory equipment to ensure accurate measurements. The main pieces include a burette for precise volume measurement, an Erlenmeyer flask for the analyte, and an indicator for visual identification of the endpoint.',
                keyPoints: [
                    'Burette: measures volume of titrant (±0.05 mL accuracy)',
                    'Erlenmeyer flask: holds analyte',
                    'Pipette: measures initial analyte volume',
                    'Indicator: changes color at endpoint',
                    'White tile: background for color observation',
                ],
            },
            {
                chapterNumber: 3,
                title: 'Indicator Selection',
                content: 'An indicator is a chemical compound that changes color at a specific pH. The choice of indicator depends on the acid-base pair being titrated.',
                keyPoints: [
                    'Indicator: weak acid or weak base that changes color',
                    'Color change occurs over narrow pH range',
                    'Phenolphthalein: pH 8.2-10.0 (colorless to pink)',
                    'Methyl orange: pH 3.1-4.4 (red to orange)',
                    'Must match the expected pH at equivalence point',
                ],
                visualDescription: 'Show color changes of different indicators at various pH values',
            },
            {
                chapterNumber: 4,
                title: 'Titration Procedure',
                content: 'The titration procedure involves systematically adding titrant to the analyte while monitoring for the endpoint. The volume of titrant used is recorded and used in calculations.',
                keyPoints: [
                    'Record initial burette reading',
                    'Add titrant slowly while swirling flask',
                    'As endpoint approaches, add titrant drop by drop',
                    'Record final burette reading when color change persists',
                    'Volume used = Final reading - Initial reading',
                ],
            },
            {
                chapterNumber: 5,
                title: 'Equivalence Point vs Endpoint',
                content: 'The equivalence point is the theoretical point where moles of acid equal moles of base. The endpoint is the observable moment when the indicator changes color. These may not be exactly the same.',
                keyPoints: [
                    'Equivalence point: stoichiometric completion',
                    'Endpoint: observable color change',
                    'For ideal titration, endpoint ≈ equivalence point',
                    'Good indicator minimizes the difference',
                    'Affects accuracy of results',
                ],
            },
            {
                chapterNumber: 6,
                title: 'Calculations',
                content: 'Once you have the volume of titrant used, you can calculate the concentration of the unknown solution using the stoichiometric relationship between acid and base.',
                keyPoints: [
                    'Use: M₁V₁ = M₂V₂',
                    'For acids and bases of different strengths, adjust for H⁺ and OH⁻',
                    'Average multiple trials for better accuracy',
                    'Percent error: |experimental - theoretical| / theoretical × 100%',
                ],
                formula: 'M₁V₁ = M₂V₂ (for 1:1 acid-base ratio)',
                examples: [
                    {
                        title: 'Example: Unknown HCl concentration',
                        description: 'Using 0.1 M NaOH to titrate unknown HCl. 25 mL HCl required 20 mL NaOH.',
                        calculation: 'M₁V₁ = M₂V₂\nM(HCl) × 25 = 0.1 × 20\nM(HCl) = 2/25 = 0.08 M',
                    },
                    {
                        title: 'Example: Multiple trials',
                        description: 'Trial 1: 19.8 mL, Trial 2: 20.1 mL, Trial 3: 20.0 mL',
                        calculation: 'Average = (19.8 + 20.1 + 20.0) / 3 = 19.97 mL\nUse average for concentration calculation',
                    },
                ],
            },
            {
                chapterNumber: 7,
                title: 'Sources of Error',
                content: 'Several factors can affect the accuracy of titration results. Understanding and minimizing these errors is important for good analytical practice.',
                keyPoints: [
                    'Parallax error: not reading burette at eye level',
                    'Overfilling burette: air bubbles affect volume',
                    'Not allowing analyte/burette to reach room temperature',
                    'Using wrong indicator for acid-base pair',
                    'Not rinsing equipment properly',
                ],
            },
        ],
        relatedTopics: [
            'Acid-Base Neutralization',
            'Analytical Chemistry',
            'Molarity',
            'pH Buffer Solutions',
        ],
        references: [
            {
                title: 'Khan Academy - Acid-Base Titration',
                url: 'https://www.khanacademy.org/science/chemistry/acids-bases-and-salts/acid-base-titration',
            },
        ],
    },
    // ====================== NEW CHEMISTRY EXPERIMENTS ======================
    {
        experimentId: 'electrolysis',
        experimentName: 'Electrolysis of Water',
        category: 'chemistry',
        description: 'Learn how electrical energy splits water into hydrogen and oxygen gases',
        difficulty: 'intermediate',
        duration: 20,
        objectives: [
            'Understand the process of electrolysis',
            'Learn about oxidation and reduction at electrodes',
            'Observe the 2:1 ratio of hydrogen to oxygen production',
            'Apply Faraday\'s laws of electrolysis',
        ],
        prerequisites: ['Basic atomic structure', 'Understanding of ions', 'Redox reactions basics'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'What is Electrolysis?',
                content: 'Electrolysis is the process of using electrical energy to drive a non-spontaneous chemical reaction. In the electrolysis of water, electrical current passes through water to decompose it into hydrogen and oxygen gases. This process is the opposite of a fuel cell reaction.',
                keyPoints: [
                    'Electrolysis = "breaking apart with electricity"',
                    'Requires electrical energy input (non-spontaneous)',
                    'Water splits into H₂ and O₂ gases',
                    'Overall: 2H₂O → 2H₂ + O₂',
                    'Minimum voltage required: ~1.23V (decomposition potential)',
                ],
                visualDescription: 'Show an electrolysis cell with two electrodes immersed in water. Bubbles form at both electrodes, more at the cathode than the anode.',
            },
            {
                chapterNumber: 2,
                title: 'The Electrolysis Cell',
                content: 'An electrolysis cell consists of two electrodes (cathode and anode) immersed in an electrolyte solution. Pure water is a poor conductor, so an electrolyte like NaOH or H₂SO₄ is added to improve conductivity.',
                keyPoints: [
                    'Cathode: negative electrode (reduction occurs)',
                    'Anode: positive electrode (oxidation occurs)',
                    'Electrolyte: increases water conductivity',
                    'Common electrolytes: NaOH, KOH, H₂SO₄',
                    'Electrodes are usually inert (platinum, graphite)',
                ],
                visualDescription: 'Diagram showing cathode (−), anode (+), electrolyte solution, and gas collection tubes above each electrode.',
            },
            {
                chapterNumber: 3,
                title: 'Half-Reactions',
                content: 'Electrolysis involves two separate half-reactions occurring at each electrode. At the cathode, reduction produces hydrogen. At the anode, oxidation produces oxygen.',
                keyPoints: [
                    'Cathode (reduction): 2H₂O + 2e⁻ → H₂ + 2OH⁻',
                    'Anode (oxidation): 4OH⁻ → O₂ + 2H₂O + 4e⁻',
                    'Remember: "CATions go to CAThode"',
                    'Reduction: gain of electrons',
                    'Oxidation: loss of electrons (OIL RIG)',
                ],
                formula: 'Cathode: 2H₂O + 2e⁻ → H₂ + 2OH⁻\nAnode: 4OH⁻ → O₂ + 2H₂O + 4e⁻',
                examples: [
                    {
                        title: 'Example: Balancing electrons',
                        description: 'To produce 2 moles of H₂, how many moles of O₂ are produced?',
                        calculation: 'Cathode needs 4e⁻ for 2H₂\nAnode releases 4e⁻ for 1O₂\nRatio H₂:O₂ = 2:1',
                    },
                ],
            },
            {
                chapterNumber: 4,
                title: 'Volume Ratio of Gases',
                content: 'The stoichiometry of electrolysis shows that hydrogen gas is produced at twice the volume of oxygen gas. This 2:1 ratio is consistent with the molecular formula of water (H₂O).',
                keyPoints: [
                    'Volume ratio H₂:O₂ = 2:1',
                    'This matches the formula of water',
                    'At cathode: more gas bubbles (H₂)',
                    'At anode: fewer gas bubbles (O₂)',
                    'Can be used to verify water composition',
                ],
                formula: '2H₂O → 2H₂ + O₂',
                examples: [
                    {
                        title: 'Example: Gas volumes',
                        description: 'If 50 mL of H₂ is collected, how much O₂ is collected?',
                        calculation: 'O₂ volume = H₂ volume / 2 = 50 / 2 = 25 mL',
                    },
                ],
            },
            {
                chapterNumber: 5,
                title: 'Faraday\'s Laws of Electrolysis',
                content: 'Faraday\'s laws quantify the relationship between the amount of substance produced and the electrical charge passed through the electrolyte.',
                keyPoints: [
                    'First Law: Mass deposited ∝ charge passed (Q = It)',
                    'Second Law: Mass ∝ equivalent weight',
                    'Faraday constant F = 96,485 C/mol',
                    '1 Faraday deposits 1 mole of monovalent ions',
                    'Can calculate mass from current and time',
                ],
                formula: 'm = (M × I × t) / (n × F)\nwhere M = molar mass, n = electrons transferred, F = 96,485 C/mol',
                examples: [
                    {
                        title: 'Example: Hydrogen production',
                        description: 'How many grams of H₂ are produced with 2A for 1 hour?',
                        calculation: 'Q = 2 × 3600 = 7200 C\nmoles e⁻ = 7200/96485 = 0.075\nmoles H₂ = 0.075/2 = 0.0375\nmass = 0.0375 × 2 = 0.075 g',
                    },
                ],
            },
            {
                chapterNumber: 6,
                title: 'Factors Affecting Electrolysis',
                content: 'Several factors influence the rate and efficiency of electrolysis, including voltage, current, electrolyte concentration, and electrode surface area.',
                keyPoints: [
                    'Higher voltage → faster reaction',
                    'Higher current → more gas produced per unit time',
                    'Greater electrolyte concentration → better conductivity',
                    'Larger electrode surface → more reaction sites',
                    'Temperature affects reaction rate',
                ],
            },
            {
                chapterNumber: 7,
                title: 'Applications of Electrolysis',
                content: 'Electrolysis has many important industrial and technological applications beyond water splitting.',
                keyPoints: [
                    'Hydrogen fuel production (clean energy)',
                    'Electroplating metals',
                    'Chlor-alkali process (Cl₂ and NaOH production)',
                    'Aluminum extraction (Hall-Héroult process)',
                    'Water purification',
                ],
            },
        ],
        relatedTopics: [
            'Redox Reactions',
            'Electrochemistry',
            'Fuel Cells',
            'Industrial Chemistry',
        ],
        references: [
            {
                title: 'Khan Academy - Electrolysis',
                url: 'https://www.khanacademy.org/science/chemistry/oxidation-reduction/electrolysis',
            },
            {
                title: 'Royal Society of Chemistry - Electrolysis',
                url: 'https://edu.rsc.org/resources/electrolysis',
            },
        ],
    },
    {
        experimentId: 'flametest',
        experimentName: 'Flame Test',
        category: 'chemistry',
        description: 'Identify metal ions by their characteristic flame colors',
        difficulty: 'beginner',
        duration: 15,
        objectives: [
            'Learn to identify metal ions by flame color',
            'Understand electron excitation and emission',
            'Relate flame color to light wavelength',
            'Apply flame tests in qualitative analysis',
        ],
        prerequisites: ['Basic atomic structure', 'Understanding of electrons and energy levels'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'What is a Flame Test?',
                content: 'A flame test is a qualitative analytical procedure used to detect the presence of certain metal ions based on the characteristic color they impart to a flame. Different metals produce different colors when heated.',
                keyPoints: [
                    'Simple qualitative test for metal ions',
                    'Each metal has a characteristic flame color',
                    'Used to identify unknown metal compounds',
                    'Quick and easy to perform',
                    'Based on atomic emission spectroscopy principles',
                ],
                visualDescription: 'Show a Bunsen burner flame with a wire loop holding a sample. Different flame colors for different metals.',
            },
            {
                chapterNumber: 2,
                title: 'The Science Behind Flame Colors',
                content: 'When metal compounds are heated, electrons absorb thermal energy and jump to higher energy levels (excited state). When these electrons fall back to their ground state, they release energy as light of specific wavelengths, producing characteristic colors.',
                keyPoints: [
                    'Electrons absorb heat energy',
                    'Jump to higher energy levels (excited)',
                    'Fall back to ground state',
                    'Release energy as visible light',
                    'Wavelength determines color observed',
                ],
                formula: 'E = hf = hc/λ\nwhere h = Planck\'s constant, f = frequency, c = speed of light, λ = wavelength',
                visualDescription: 'Energy level diagram showing electron excitation and emission with photon release.',
            },
            {
                chapterNumber: 3,
                title: 'Common Metal Flame Colors',
                content: 'Each metal ion produces a distinct flame color. Learning these colors allows quick identification of unknown metal compounds.',
                keyPoints: [
                    'Lithium (Li⁺): Crimson red (671 nm)',
                    'Sodium (Na⁺): Intense yellow (589 nm)',
                    'Potassium (K⁺): Lilac/violet (766 nm)',
                    'Calcium (Ca²⁺): Orange-red (622 nm)',
                    'Copper (Cu²⁺): Blue-green (515 nm)',
                    'Barium (Ba²⁺): Apple green (554 nm)',
                    'Strontium (Sr²⁺): Red (650 nm)',
                ],
                visualDescription: 'Table showing metal ions and their corresponding flame colors with wavelengths.',
            },
            {
                chapterNumber: 4,
                title: 'Performing a Flame Test',
                content: 'The flame test procedure is straightforward but requires careful technique to avoid contamination and ensure accurate results.',
                keyPoints: [
                    'Clean nichrome or platinum wire loop',
                    'Dip loop in concentrated HCl to clean',
                    'Heat until no color is imparted to flame',
                    'Dip clean loop in sample solution',
                    'Hold loop at edge of Bunsen burner flame',
                    'Observe and record flame color',
                ],
            },
            {
                chapterNumber: 5,
                title: 'Visible Light Spectrum',
                content: 'The visible light spectrum ranges from about 400 nm (violet) to 700 nm (red). Different wavelengths correspond to different colors we perceive.',
                keyPoints: [
                    'Violet: ~400-450 nm',
                    'Blue: ~450-500 nm',
                    'Green: ~500-550 nm',
                    'Yellow: ~550-600 nm',
                    'Orange: ~600-650 nm',
                    'Red: ~650-700 nm',
                ],
                visualDescription: 'Rainbow spectrum showing wavelength ranges for each color.',
            },
            {
                chapterNumber: 6,
                title: 'Limitations and Interferences',
                content: 'While flame tests are useful, they have limitations. Some metals can interfere with each other, and the test is only qualitative.',
                keyPoints: [
                    'Sodium contamination is common (yellow overwhelms other colors)',
                    'Some metals have similar colors',
                    'Only works for certain metal ions',
                    'Cannot determine concentration',
                    'Use cobalt blue glass to filter sodium\'s yellow',
                ],
            },
            {
                chapterNumber: 7,
                title: 'Applications',
                content: 'Flame tests and their underlying principles have many practical applications in science and everyday life.',
                keyPoints: [
                    'Qualitative analysis in chemistry labs',
                    'Fireworks use metal salts for colors',
                    'Atomic emission spectroscopy',
                    'Forensic analysis',
                    'Quality control in manufacturing',
                ],
            },
        ],
        relatedTopics: [
            'Atomic Structure',
            'Emission Spectra',
            'Qualitative Analysis',
            'Fireworks Chemistry',
        ],
        references: [
            {
                title: 'Royal Society of Chemistry - Flame Tests',
                url: 'https://edu.rsc.org/resources/flame-tests',
            },
            {
                title: 'Khan Academy - Atomic Emission Spectra',
                url: 'https://www.khanacademy.org/science/chemistry/electronic-structure-of-atoms',
            },
        ],
    },
    {
        experimentId: 'crystallization',
        experimentName: 'Crystallization',
        category: 'chemistry',
        description: 'Grow crystals and understand the science of supersaturation and crystal formation',
        difficulty: 'beginner',
        duration: 18,
        objectives: [
            'Understand supersaturation and crystal nucleation',
            'Learn how cooling rate affects crystal size',
            'Observe different crystal structures',
            'Apply purification by recrystallization',
        ],
        prerequisites: ['Solubility concepts', 'States of matter'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'What is Crystallization?',
                content: 'Crystallization is the process by which a solid forms from a solution, melt, or gas, where the atoms or molecules are arranged in an orderly, repeating pattern called a crystal lattice. It is both a natural phenomenon and a technique used for purification.',
                keyPoints: [
                    'Solid formation with ordered atomic arrangement',
                    'Creates crystal lattice structure',
                    'Can occur from solutions, melts, or vapors',
                    'Important purification technique',
                    'Used extensively in chemistry and materials science',
                ],
                visualDescription: 'Show the progression from dissolved solute particles to an organized crystal structure.',
            },
            {
                chapterNumber: 2,
                title: 'Solubility and Temperature',
                content: 'The solubility of most solids increases with temperature. This relationship is key to crystallization: a hot saturated solution becomes supersaturated as it cools.',
                keyPoints: [
                    'Solubility usually increases with temperature',
                    'Saturated solution: maximum solute dissolved at that temperature',
                    'Supersaturated: contains more solute than equilibrium allows',
                    'Supersaturation is unstable → drives crystallization',
                    'Solubility curves show temperature dependence',
                ],
                visualDescription: 'Solubility curve graph showing increasing solubility with temperature for common salts.',
            },
            {
                chapterNumber: 3,
                title: 'Supersaturation',
                content: 'A supersaturated solution contains more dissolved solute than would normally be possible at that temperature. This metastable state provides the driving force for crystallization.',
                keyPoints: [
                    'Created by cooling a hot saturated solution',
                    'Or by evaporating solvent',
                    'Metastable state (unstable but persistent)',
                    'Degree of supersaturation affects crystal formation',
                    'Higher supersaturation → more nucleation sites',
                ],
                formula: 'Supersaturation ratio = Actual concentration / Equilibrium concentration',
            },
            {
                chapterNumber: 4,
                title: 'Nucleation',
                content: 'Nucleation is the first step of crystallization where tiny seed crystals form. These nuclei act as templates for further crystal growth.',
                keyPoints: [
                    'Primary nucleation: spontaneous formation',
                    'Secondary nucleation: from existing crystals',
                    'Requires overcoming energy barrier',
                    'Dust particles can act as nucleation sites',
                    'More nuclei → smaller crystals',
                ],
                visualDescription: 'Show small crystal nuclei forming in solution and growing larger over time.',
            },
            {
                chapterNumber: 5,
                title: 'Crystal Growth',
                content: 'Once nuclei form, solute molecules continue to attach in an ordered manner, growing the crystal. The rate of growth depends on supersaturation and temperature.',
                keyPoints: [
                    'Molecules add to existing crystal faces',
                    'Growth rate depends on supersaturation level',
                    'Slower cooling → larger crystals',
                    'Faster cooling → smaller crystals',
                    'Impurities can affect growth',
                ],
            },
            {
                chapterNumber: 6,
                title: 'Crystal Structures',
                content: 'Different compounds form crystals with characteristic shapes based on their molecular structure and bonding.',
                keyPoints: [
                    'Cubic: NaCl (table salt)',
                    'Hexagonal: ice, quartz',
                    'Rhombic: copper sulfate',
                    'Needle-like: sucrose (sugar)',
                    'Crystal system determined by unit cell',
                ],
                visualDescription: 'Show different crystal shapes: cubic, hexagonal, needle, and rhombic crystals.',
            },
            {
                chapterNumber: 7,
                title: 'Recrystallization for Purification',
                content: 'Recrystallization is a technique used to purify solid compounds by exploiting differences in solubility between the desired compound and impurities.',
                keyPoints: [
                    'Dissolve impure solid in hot solvent',
                    'Filter to remove insoluble impurities',
                    'Cool slowly to crystallize pure compound',
                    'Impurities stay in solution (mother liquor)',
                    'Multiple recrystallizations increase purity',
                ],
            },
        ],
        relatedTopics: [
            'Solubility',
            'Phase Diagrams',
            'Material Science',
            'Purification Techniques',
        ],
        references: [
            {
                title: 'Royal Society of Chemistry - Growing Crystals',
                url: 'https://edu.rsc.org/resources/growing-crystals',
            },
            {
                title: 'Khan Academy - Solubility',
                url: 'https://www.khanacademy.org/science/chemistry/states-of-matter-and-intermolecular-forces',
            },
        ],
    },
    {
        experimentId: 'displacement',
        experimentName: 'Metal Displacement',
        category: 'chemistry',
        description: 'Explore the reactivity series through metal displacement reactions',
        difficulty: 'intermediate',
        duration: 20,
        objectives: [
            'Understand the reactivity series of metals',
            'Predict displacement reactions',
            'Observe physical and chemical changes',
            'Write ionic equations for displacement',
        ],
        prerequisites: ['Basic chemical reactions', 'Understanding of ions', 'Oxidation states'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'What is Metal Displacement?',
                content: 'A metal displacement reaction occurs when a more reactive metal displaces a less reactive metal from a compound, typically in solution. This is a type of single replacement reaction.',
                keyPoints: [
                    'More reactive metal pushes out less reactive metal',
                    'Also called single replacement reaction',
                    'Involves electron transfer (redox)',
                    'More reactive metal gets oxidized',
                    'Less reactive metal gets reduced',
                ],
                formula: 'A + BX → AX + B\nwhere A is more reactive than B',
                visualDescription: 'Show zinc metal being placed in copper sulfate solution, with copper metal forming.',
            },
            {
                chapterNumber: 2,
                title: 'The Reactivity Series',
                content: 'The reactivity series ranks metals by their tendency to lose electrons and form positive ions. Metals higher in the series are more reactive and can displace metals lower in the series.',
                keyPoints: [
                    'Potassium (K) - most reactive',
                    'Sodium (Na)',
                    'Calcium (Ca)',
                    'Magnesium (Mg)',
                    'Aluminum (Al)',
                    'Zinc (Zn)',
                    'Iron (Fe)',
                    'Hydrogen (H) - reference point',
                    'Copper (Cu)',
                    'Silver (Ag)',
                    'Gold (Au) - least reactive',
                ],
                visualDescription: 'Vertical chart showing metals arranged from most reactive (top) to least reactive (bottom).',
            },
            {
                chapterNumber: 3,
                title: 'Predicting Reactions',
                content: 'Using the reactivity series, we can predict whether a displacement reaction will occur. A metal will only displace another metal that is below it in the series.',
                keyPoints: [
                    'Higher metal displaces lower metal: reaction occurs',
                    'Lower metal cannot displace higher metal: no reaction',
                    'Zn + CuSO₄ → ZnSO₄ + Cu (Zn above Cu: reacts)',
                    'Cu + ZnSO₄ → No reaction (Cu below Zn)',
                    'Can also predict reactions with acids (above/below H)',
                ],
                examples: [
                    {
                        title: 'Example 1: Zinc in copper sulfate',
                        description: 'Will zinc react with copper sulfate solution?',
                        calculation: 'Zn is above Cu in reactivity series\n✓ Reaction occurs: Zn + CuSO₄ → ZnSO₄ + Cu',
                    },
                    {
                        title: 'Example 2: Copper in silver nitrate',
                        description: 'Will copper react with silver nitrate solution?',
                        calculation: 'Cu is above Ag in reactivity series\n✓ Reaction occurs: Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag',
                    },
                    {
                        title: 'Example 3: Silver in iron sulfate',
                        description: 'Will silver react with iron sulfate solution?',
                        calculation: 'Ag is below Fe in reactivity series\n✗ No reaction occurs',
                    },
                ],
            },
            {
                chapterNumber: 4,
                title: 'Ionic Equations',
                content: 'Displacement reactions can be written as ionic equations, showing only the species that change during the reaction. This reveals the electron transfer.',
                keyPoints: [
                    'Spectator ions are not included',
                    'Shows oxidation and reduction clearly',
                    'Electrons transfer from reactive to less reactive metal',
                    'Balance atoms and charges',
                    'Net ionic equation shows core reaction',
                ],
                formula: 'Full: Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)\nIonic: Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)',
                examples: [
                    {
                        title: 'Example: Writing ionic equation',
                        description: 'Write the ionic equation for Mg + FeCl₂',
                        calculation: 'Full: Mg + FeCl₂ → MgCl₂ + Fe\nIonic: Mg(s) + Fe²⁺(aq) → Mg²⁺(aq) + Fe(s)',
                    },
                ],
            },
            {
                chapterNumber: 5,
                title: 'Observable Changes',
                content: 'Displacement reactions often produce visible changes that indicate the reaction is occurring.',
                keyPoints: [
                    'Color change in solution (e.g., blue CuSO₄ fades)',
                    'Metal appears on the reactive metal surface',
                    'Temperature change (usually exothermic)',
                    'Metal piece may decrease in size',
                    'Bubbling if H₂ gas produced (with acids)',
                ],
                visualDescription: 'Before/after comparison: blue copper sulfate solution becoming colorless with brown copper metal formed.',
            },
            {
                chapterNumber: 6,
                title: 'Redox Perspective',
                content: 'Displacement reactions are redox reactions involving oxidation and reduction. The more reactive metal is oxidized while the less reactive metal ion is reduced.',
                keyPoints: [
                    'Oxidation: loss of electrons (reactive metal)',
                    'Reduction: gain of electrons (metal ion)',
                    'OIL RIG: Oxidation Is Loss, Reduction Is Gain',
                    'Reducing agent: donates electrons (gets oxidized)',
                    'Oxidizing agent: accepts electrons (gets reduced)',
                ],
                formula: 'Zn → Zn²⁺ + 2e⁻ (oxidation)\nCu²⁺ + 2e⁻ → Cu (reduction)',
            },
            {
                chapterNumber: 7,
                title: 'Applications',
                content: 'Understanding metal displacement has many practical applications in industry and everyday life.',
                keyPoints: [
                    'Thermite reaction (Al + Fe₂O₃) for welding',
                    'Extracting metals from ores',
                    'Galvanization (zinc coating on iron)',
                    'Batteries and electrochemical cells',
                    'Corrosion prevention',
                ],
            },
        ],
        relatedTopics: [
            'Redox Reactions',
            'Electrochemistry',
            'Metal Extraction',
            'Corrosion',
        ],
        references: [
            {
                title: 'Khan Academy - Redox Reactions',
                url: 'https://www.khanacademy.org/science/chemistry/oxidation-reduction',
            },
            {
                title: 'BBC Bitesize - Reactivity Series',
                url: 'https://www.bbc.co.uk/bitesize/guides/z84wjxs/revision/1',
            },
        ],
    },
    {
        experimentId: 'llm',
        experimentName: 'Large Language Models (LLM)',
        category: 'technology',
        description: 'Get a high-level view of how modern language models are trained, prompted, and used in real products',
        difficulty: 'beginner',
        duration: 18,
        objectives: [
            'Understand what an LLM is and what it is good at',
            'Learn the difference between training, fine-tuning, and prompting',
            'Recognize common limitations like hallucinations and context limits',
            'See how LLMs fit into real applications and workflows',
        ],
        prerequisites: ['Basic understanding of AI concepts', 'Comfort reading technical examples'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'What Is an LLM?',
                content: 'A Large Language Model is an AI system trained on massive amounts of text to predict the next token in a sequence. Even though the training objective is simple, the result is a model that can summarize, answer questions, write code, translate, and reason over text at a surprisingly broad level.',
                keyPoints: [
                    'LLMs generate text by predicting likely next tokens',
                    'Scale in data, parameters, and compute improves capability',
                    'They are general-purpose language interfaces',
                    'They do not truly store knowledge like a database',
                ],
            },
            {
                chapterNumber: 2,
                title: 'How Training Works',
                content: 'Training usually happens in stages. First, a base model learns language patterns from huge datasets. Then instruction tuning helps it follow user requests better. Some systems also use preference optimization to improve helpfulness, safety, and style.',
                keyPoints: [
                    'Pretraining teaches broad language patterns',
                    'Instruction tuning teaches task-following behavior',
                    'Preference optimization shapes response quality',
                    'Training is expensive and done before deployment',
                ],
            },
            {
                chapterNumber: 3,
                title: 'Prompting and Context',
                content: 'Most users interact with LLMs through prompts. The prompt, prior conversation, and any attached context all influence the response. Clear instructions and relevant context often matter as much as the model itself.',
                keyPoints: [
                    'Prompt quality strongly affects output quality',
                    'System instructions and user prompts both matter',
                    'Context windows are large but still limited',
                    'Examples in prompts can improve consistency',
                ],
                examples: [
                    {
                        title: 'Prompt upgrade',
                        description: 'Instead of “explain AI”, specify the audience, tone, depth, and desired format.',
                    },
                ],
            },
            {
                chapterNumber: 4,
                title: 'Strengths and Limitations',
                content: 'LLMs are excellent at drafting, summarization, classification, coding help, and conversational interfaces. However, they can hallucinate facts, misread ambiguous requests, and sound confident even when wrong.',
                keyPoints: [
                    'Great for language-heavy tasks',
                    'Weaknesses include hallucination and inconsistency',
                    'Confidence does not guarantee correctness',
                    'High-stakes use needs validation and review',
                ],
            },
            {
                chapterNumber: 5,
                title: 'Where LLMs Are Used',
                content: 'Today, LLMs power chat assistants, coding copilots, knowledge bots, customer support tools, and document workflows. In practice, the most useful products combine the model with retrieval, application logic, guardrails, and analytics.',
                keyPoints: [
                    'Many successful LLM products are workflow tools',
                    'Grounding and permissions matter in enterprise systems',
                    'Good UX and guardrails are part of the product',
                    'LLMs are often one layer in a bigger system',
                ],
            },
        ],
        relatedTopics: ['Prompt Engineering', 'RAG', 'Agentic AI', 'Model Evaluation'],
        references: [
            {
                title: 'Attention Is All You Need',
                url: 'https://arxiv.org/abs/1706.03762',
            },
            {
                title: 'Prompting Guide',
                url: 'https://www.promptingguide.ai/',
            },
        ],
    },
    {
        experimentId: 'agenticai',
        experimentName: 'Agentic AI',
        category: 'technology',
        description: 'Learn how AI agents plan, use tools, take actions, and complete multi-step tasks beyond simple chat',
        difficulty: 'intermediate',
        duration: 20,
        objectives: [
            'Understand what makes an AI system agentic',
            'Learn the role of tools, memory, and planning',
            'Compare chatbots, copilots, and autonomous agents',
            'Identify common design risks in agent-based systems',
        ],
        prerequisites: ['Large Language Models (LLM)', 'Basic understanding of APIs and automation'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'What Makes AI Agentic?',
                content: 'An agentic system does more than answer a question once. It can decide on next steps, call tools, observe outcomes, and continue working toward a goal. The core shift is from single-turn generation to goal-directed behavior.',
                keyPoints: [
                    'Agents are goal-oriented, not just response-oriented',
                    'They often operate over multiple steps',
                    'They can use tools and react to feedback',
                    'Autonomy exists on a spectrum',
                ],
            },
            {
                chapterNumber: 2,
                title: 'Planning, Memory, and Tools',
                content: 'Most practical agents need planning to break down a task, memory to keep track of progress, and tools to interact with external systems. Without these, an agent is often just a chatbot with a fancy label.',
                keyPoints: [
                    'Planning turns goals into executable steps',
                    'Memory helps preserve state across iterations',
                    'Tools let the agent search, calculate, fetch, or edit',
                    'Tool outputs often need validation',
                ],
            },
            {
                chapterNumber: 3,
                title: 'Common Agent Loops',
                content: 'A common pattern is Think -> Act -> Observe -> Repeat. The model chooses an action, a tool runs, the result comes back, and the model decides what to do next. This continues until the task is complete or a stop condition is reached.',
                keyPoints: [
                    'Agent loops alternate reasoning and execution',
                    'Stop conditions prevent runaway behavior',
                    'Logs and traces help debugging',
                    'Human approval is useful for sensitive actions',
                ],
            },
            {
                chapterNumber: 4,
                title: 'Real-World Use Cases',
                content: 'Agentic AI is useful in coding assistants, research assistants, workflow automation, internal enterprise tools, and support systems that need to coordinate several actions instead of giving a one-off response.',
                keyPoints: [
                    'Strong use cases involve multi-step but bounded workflows',
                    'Agents shine when several tools must be coordinated',
                    'Clear success criteria improve reliability',
                    'Monitoring matters in production',
                ],
            },
            {
                chapterNumber: 5,
                title: 'Risks and Guardrails',
                content: 'Agentic systems can fail in more ways than normal chat systems. They may pick the wrong tool, loop unnecessarily, take unsafe actions, or act on incomplete information. Good guardrails include permission checks, action scopes, cost limits, and human review.',
                keyPoints: [
                    'More autonomy means more operational risk',
                    'Permissions and scope limits are essential',
                    'Human-in-the-loop design improves safety',
                    'Evaluation should test behavior, not just wording',
                ],
            },
        ],
        relatedTopics: ['LLM', 'Tool Use', 'Workflow Automation', 'AI Evaluation'],
        references: [
            {
                title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
                url: 'https://arxiv.org/abs/2210.03629',
            },
            {
                title: 'Toolformer',
                url: 'https://arxiv.org/abs/2302.04761',
            },
        ],
    },
    {
        experimentId: 'rag',
        experimentName: 'Retrieval-Augmented Generation (RAG)',
        category: 'technology',
        description: 'See how retrieval systems help language models answer with fresher and more grounded information',
        difficulty: 'intermediate',
        duration: 16,
        objectives: [
            'Understand why RAG is used with LLM applications',
            'Learn the high-level flow from query to retrieved context to answer',
            'Recognize tradeoffs in chunking, ranking, and grounding',
            'Understand where RAG helps and where it does not',
        ],
        prerequisites: ['Large Language Models (LLM)', 'Basic understanding of search systems'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'Why RAG Exists',
                content: 'Language models are powerful, but their built-in knowledge may be stale, incomplete, or not specific to your organization. RAG solves this by retrieving relevant documents at runtime and passing them into the model as context.',
                keyPoints: [
                    'RAG improves grounding with external knowledge',
                    'It helps with freshness and domain-specific information',
                    'It reduces reliance on the model’s memory alone',
                    'It is widely used in enterprise AI systems',
                ],
            },
            {
                chapterNumber: 2,
                title: 'The Basic RAG Pipeline',
                content: 'A typical RAG flow is: ingest documents, split them into chunks, create embeddings or search indexes, retrieve relevant content for a user query, then ask the model to answer using that retrieved context.',
                keyPoints: [
                    'Ingestion and chunking shape retrieval quality',
                    'Retrieval happens before generation',
                    'The model answers with grounded context',
                    'Better retrieval often matters more than better prompting',
                ],
            },
            {
                chapterNumber: 3,
                title: 'Search, Embeddings, and Ranking',
                content: 'Some RAG systems use keyword search, some use vector search, and many use a hybrid approach. Ranking matters because only a limited amount of retrieved text can fit into the model context window.',
                keyPoints: [
                    'Vector search finds semantic similarity',
                    'Keyword search is still useful for exact terms',
                    'Hybrid retrieval often works best in practice',
                    'Ranking and re-ranking improve relevance',
                ],
            },
            {
                chapterNumber: 4,
                title: 'Common Failure Modes',
                content: 'RAG can still fail if the wrong chunks are retrieved, the chunks are too broad or too small, or the model ignores the context. Good systems test retrieval quality and whether answers stay faithful to the sources.',
                keyPoints: [
                    'Bad chunking can hurt answer quality',
                    'Wrong retrieval leads to wrong answers',
                    'The model can still hallucinate around retrieved facts',
                    'Citations and evaluations increase trust',
                ],
            },
            {
                chapterNumber: 5,
                title: 'Where RAG Fits Best',
                content: 'RAG works especially well for knowledge bases, policy lookup, internal docs, manuals, and research assistants. It is most useful when answers should come from a trusted document set instead of pure model memory.',
                keyPoints: [
                    'Best for grounded, document-centric tasks',
                    'Less useful when no reliable source corpus exists',
                    'RAG is often combined with agents',
                    'Access control matters in enterprise deployments',
                ],
            },
        ],
        relatedTopics: ['LLM', 'Embeddings', 'Search', 'Agentic AI'],
        references: [
            {
                title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
                url: 'https://arxiv.org/abs/2005.11401',
            },
            {
                title: 'Dense Passage Retrieval',
                url: 'https://arxiv.org/abs/2004.04906',
            },
        ],
    },
    {
        experimentId: 'pythagorean',
        experimentName: 'Pythagorean Theorem',
        category: 'math',
        description: 'See why the square areas on the legs of a right triangle combine to match the square on the hypotenuse.',
        difficulty: 'beginner',
        duration: 12,
        objectives: [
            'Understand the relationship a² + b² = c²',
            'Connect triangle side lengths with square areas',
            'Use the theorem to calculate missing lengths',
        ],
        prerequisites: ['Basic algebra', 'Area of a square'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'Right Triangles',
                content: 'The theorem applies only to right triangles. A right triangle has one angle equal to 90 degrees.',
                keyPoints: ['One angle is 90°', 'The two shorter sides are called legs', 'The longest side is the hypotenuse'],
            },
            {
                chapterNumber: 2,
                title: 'The Main Formula',
                content: 'The square built on one leg has area a², the square built on the other leg has area b², and the square on the hypotenuse has area c².',
                keyPoints: ['a² + b² = c²', 'The relation compares square areas', 'The hypotenuse is always opposite the right angle'],
                formula: 'a² + b² = c²',
            },
            {
                chapterNumber: 3,
                title: 'Worked Example',
                content: 'If a = 6 and b = 8, then c² = 6² + 8² = 36 + 64 = 100, so c = 10.',
                keyPoints: ['Square each leg first', 'Add the two square values', 'Take the square root to get c'],
                examples: [
                    {
                        title: '6-8-10 triangle',
                        description: 'Find the hypotenuse when the legs are 6 and 8.',
                        calculation: 'c = √(6² + 8²) = √100 = 10',
                    },
                ],
            },
            {
                chapterNumber: 4,
                title: 'Why the Visualization Matters',
                content: 'Seeing the squares helps students understand that the theorem is about area balance, not only symbol manipulation.',
                keyPoints: ['Geometry and algebra support each other', 'Visual models help check formulas', 'Changing side lengths changes all three areas together'],
            },
        ],
        relatedTopics: ['Trigonometric Ratios', 'Distance Formula'],
    },
    {
        experimentId: 'trigonometry',
        experimentName: 'Trigonometric Ratios',
        category: 'math',
        description: 'Visualize sine, cosine, and tangent using a right triangle with an adjustable angle.',
        difficulty: 'beginner',
        duration: 14,
        objectives: [
            'Understand opposite, adjacent, and hypotenuse sides',
            'Interpret sin, cos, and tan as ratios',
            'Observe how ratios change with angle',
        ],
        prerequisites: ['Right triangles', 'Basic division'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'Naming the Sides',
                content: 'For a chosen angle, the opposite side is across from the angle, the adjacent side touches the angle, and the hypotenuse is the longest side.',
                keyPoints: ['Opposite is across the angle', 'Adjacent touches the angle', 'Hypotenuse is the longest side'],
            },
            {
                chapterNumber: 2,
                title: 'Sine, Cosine, and Tangent',
                content: 'Trigonometric ratios connect an angle to side lengths in a right triangle.',
                keyPoints: ['sin θ = opposite / hypotenuse', 'cos θ = adjacent / hypotenuse', 'tan θ = opposite / adjacent'],
                formula: 'sin θ = opp/hyp, cos θ = adj/hyp, tan θ = opp/adj',
            },
            {
                chapterNumber: 3,
                title: 'Changing the Angle',
                content: 'As the angle grows, the opposite side becomes larger relative to the hypotenuse, so sine increases. Cosine behaves differently because the adjacent side shrinks.',
                keyPoints: ['Sine increases between 0° and 90°', 'Cosine decreases between 0° and 90°', 'Tangent grows quickly for larger angles'],
            },
            {
                chapterNumber: 4,
                title: 'Using the Ratios',
                content: 'Trig ratios help solve missing-side and missing-angle problems in geometry and physics.',
                keyPoints: ['Useful in heights and distances', 'Used in projectile and wave problems', 'Connects geometry with real applications'],
            },
        ],
        relatedTopics: ['Pythagorean Theorem', 'Projectile Motion'],
    },
    {
        experimentId: 'circletheorems',
        experimentName: 'Circle Theorems',
        category: 'math',
        description: 'Explore the theorem that links a central angle and an inscribed angle standing on the same arc.',
        difficulty: 'intermediate',
        duration: 15,
        objectives: [
            'Understand arc-based angle relationships',
            'Compare central and inscribed angles',
            'Use the theorem to predict unknown angles',
        ],
        prerequisites: ['Basic circle vocabulary', 'Angle measurement'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'Angles in a Circle',
                content: 'A central angle has its vertex at the center of the circle. An inscribed angle has its vertex on the circumference.',
                keyPoints: ['Central angle is at the center', 'Inscribed angle is on the circle', 'Both can stand on the same arc'],
            },
            {
                chapterNumber: 2,
                title: 'The Theorem',
                content: 'For the same arc, the angle at the center is twice the angle at the circumference.',
                keyPoints: ['Central angle = 2 × inscribed angle', 'Inscribed angle = central angle / 2', 'The theorem works for the same intercepted arc'],
                formula: 'central angle = 2 × inscribed angle',
            },
            {
                chapterNumber: 3,
                title: 'Worked Example',
                content: 'If the central angle is 100°, the inscribed angle on the same arc is 50°.',
                keyPoints: ['Divide by 2 to find the inscribed angle', 'Multiply by 2 to recover the central angle'],
            },
            {
                chapterNumber: 4,
                title: 'Visual Reasoning',
                content: 'The dynamic circle diagram helps learners see that changing the arc changes both angles together while preserving the 2:1 ratio.',
                keyPoints: ['The ratio remains stable', 'The arc controls both angles', 'Visual geometry reduces memorization'],
            },
        ],
        relatedTopics: ['Geometry Proofs', 'Angles and Arcs'],
    },
    {
        experimentId: 'derivativeintuition',
        experimentName: 'Derivative and Slope',
        category: 'math',
        description: 'Build intuition for derivatives by watching the tangent slope change along a curve.',
        difficulty: 'intermediate',
        duration: 16,
        objectives: [
            'Understand derivative as instantaneous slope',
            'Relate the tangent line to local change',
            'Connect y = ax² with dy/dx = 2ax',
        ],
        prerequisites: ['Straight-line slope', 'Basic functions'],
        chapters: [
            {
                chapterNumber: 1,
                title: 'Slope on a Curve',
                content: 'For a curve, the slope changes from point to point. A tangent line gives the local direction of the curve at one chosen point.',
                keyPoints: ['Slope can vary', 'A tangent touches locally', 'The tangent shows instant steepness'],
            },
            {
                chapterNumber: 2,
                title: 'A Simple Curve',
                content: 'Using y = ax² makes the changing slope easy to see. Near the center the curve is flat, and further out it becomes steeper.',
                keyPoints: ['Parabolas are symmetric', 'Steepness grows away from x = 0', 'Scale a changes how steep the graph is'],
                formula: 'y = ax²',
            },
            {
                chapterNumber: 3,
                title: 'Derivative Formula',
                content: 'For y = ax², the derivative is dy/dx = 2ax. This tells us the tangent slope at any x-value.',
                keyPoints: ['Derivative gives tangent slope', 'dy/dx = 2ax for this curve', 'Positive x gives positive slope, negative x gives negative slope'],
                formula: 'dy/dx = 2ax',
            },
            {
                chapterNumber: 4,
                title: 'Interpreting the Visualization',
                content: 'Moving the point on the graph while watching the tangent line helps students connect algebraic derivatives with geometry.',
                keyPoints: ['Derivative is not just a formula', 'Slope can be seen and measured', 'Visual intuition supports calculus ideas'],
            },
        ],
        relatedTopics: ['Rate of Change', 'Graphs of Functions'],
    },
];
async function seedTutorials() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab';
        const dbUri = mongoUri.includes('/lab') ? mongoUri : mongoUri + '/lab';
        await mongoose_1.default.connect(dbUri);
        console.log('✓ Connected to MongoDB (lab database)');
        // Create Tutorial model
        const tutorialSchema = new mongoose_1.default.Schema({
            experimentId: { type: String, unique: true, index: true },
            experimentName: String,
            category: { type: String, enum: ['physics', 'chemistry', 'technology', 'math'] },
            description: String,
            difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
            duration: Number,
            objectives: [String],
            prerequisites: [String],
            chapters: [
                {
                    chapterNumber: Number,
                    title: String,
                    content: String,
                    keyPoints: [String],
                    visualDescription: String,
                    formula: String,
                    examples: [
                        {
                            title: String,
                            description: String,
                            calculation: String,
                        },
                    ],
                },
            ],
            relatedTopics: [String],
            references: [
                {
                    title: String,
                    url: String,
                },
            ],
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },
        });
        const Tutorial = mongoose_1.default.model('Tutorial', tutorialSchema);
        // Clear existing tutorials
        await Tutorial.deleteMany({});
        console.log('✓ Cleared existing tutorials');
        // Insert tutorials
        const createdTutorials = await Tutorial.insertMany(tutorialData);
        console.log(`✓ Created ${createdTutorials.length} tutorials\n`);
        // Display created tutorials
        console.log('Seeded Tutorials:');
        createdTutorials.forEach((tutorial) => {
            console.log(`  • ${tutorial.experimentName} (${tutorial.experimentId})`);
            console.log(`    - Category: ${tutorial.category}`);
            console.log(`    - Difficulty: ${tutorial.difficulty}`);
            console.log(`    - Duration: ${tutorial.duration} minutes`);
            console.log(`    - Chapters: ${tutorial.chapters.length}`);
        });
        console.log('\n✓ Tutorial seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('✗ Seeding error:', error);
        process.exit(1);
    }
}
seedTutorials();
