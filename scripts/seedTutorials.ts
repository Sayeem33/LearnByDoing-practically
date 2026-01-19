import mongoose from 'mongoose';

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
        content:
          'Free fall is the motion of an object under the influence of gravity alone, with no other forces acting on it (like air resistance). On Earth, all objects in free fall experience the same acceleration regardless of their mass.',
        keyPoints: [
          'Free fall occurs when only gravity acts on an object',
          'Acceleration due to gravity (g) = 9.8 m/s²',
          'All objects fall at the same rate in a vacuum',
          'Direction: downward (toward the center of Earth)',
        ],
        visualDescription:
          'Imagine a ball dropped from a building. Show position markers at equal time intervals getting further apart (accelerating)',
      },
      {
        chapterNumber: 2,
        title: 'Equations of Motion',
        content:
          'The motion of a falling object can be described using kinematic equations. These equations relate displacement, velocity, acceleration, and time.',
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
        content:
          'A velocity-time graph for free fall is a straight line because the acceleration is constant. The slope of the line equals the acceleration due to gravity.',
        keyPoints: [
          'Velocity increases linearly with time',
          'Slope = acceleration = 9.8 m/s²',
          'The line passes through origin (starts from rest if dropped)',
          'Steeper slope = greater acceleration',
        ],
        visualDescription:
          'Show a straight line on a v-t graph starting at origin, with velocity on y-axis and time on x-axis. The slope is constant at 9.8 m/s per second.',
      },
      {
        chapterNumber: 4,
        title: 'Position-Time Graphs',
        content:
          'A position-time graph for free fall is a parabola because the displacement depends on time squared. The curve gets steeper as time increases, showing acceleration.',
        keyPoints: [
          'Graph is parabolic (curved)',
          'Steepness increases with time',
          'Curvature shows acceleration',
          'Starting point depends on initial height',
        ],
        visualDescription:
          'Show a parabolic curve on a position-time graph. Mark positions at equal time intervals showing increasing distances between them.',
      },
      {
        chapterNumber: 5,
        title: 'Real-World Considerations',
        content:
          'In reality, objects experience air resistance which affects their motion. However, for most everyday scenarios and this simulation, we can ignore air resistance for small objects over short distances.',
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
    description:
      'Study the combined effects of horizontal and vertical motion in projectile motion',
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
        content:
          'Projectile motion occurs when an object is launched into the air and follows a curved path under the influence of gravity. The key insight is that the horizontal and vertical components of motion are independent of each other.',
        keyPoints: [
          'Horizontal motion: constant velocity (no acceleration)',
          'Vertical motion: constant acceleration (gravity)',
          'Path is parabolic',
          'Launch angle and initial velocity determine the trajectory',
        ],
        visualDescription:
          'Show a cannon firing at an angle. The path of the projectile curves downward following a parabola. Show velocity vectors at different points.',
      },
      {
        chapterNumber: 2,
        title: 'Velocity Components',
        content:
          'When a projectile is launched, the initial velocity can be broken into horizontal and vertical components using trigonometry.',
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
            calculation:
              'vₓ = 20 × cos(45°) = 20 × 0.707 = 14.14 m/s\nvᵧ = 20 × sin(45°) = 20 × 0.707 = 14.14 m/s',
          },
        ],
      },
      {
        chapterNumber: 3,
        title: 'Time of Flight',
        content:
          'The time a projectile stays in the air depends on its initial vertical velocity and gravity. When the projectile returns to the launch height, the total time of flight can be calculated.',
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
            calculation:
              'vᵧ = 20 × sin(45°) = 14.14 m/s\nT = 2 × 14.14 / 9.8 = 2.89 seconds',
          },
        ],
      },
      {
        chapterNumber: 4,
        title: 'Range (Horizontal Distance)',
        content:
          'The range is the horizontal distance traveled by the projectile during its flight. It depends on the launch angle, initial velocity, and gravity.',
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
        content:
          'The maximum height is reached when the vertical velocity becomes zero. This is when all the initial vertical kinetic energy is converted to potential energy.',
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
            calculation:
              'H = (20² × sin²(45°)) / (2 × 9.8) = (400 × 0.5) / 19.6 = 10.2 m',
          },
        ],
      },
      {
        chapterNumber: 6,
        title: 'Trajectory Equation',
        content:
          'The path of a projectile can be described by an equation that relates vertical position (y) to horizontal position (x). This equation represents a parabola.',
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
        content:
          'A simple pendulum consists of a mass (bob) attached to a string or rod of fixed length that swings freely under gravity. It demonstrates simple harmonic motion and is one of the most common examples of periodic motion.',
        keyPoints: [
          'Composed of a mass and a string/rod',
          'Swings back and forth in a regular pattern',
          'Motion is periodic (repeats)',
          'Amplitude: maximum angle from vertical',
        ],
        visualDescription:
          'Show a pendulum swinging back and forth. Mark the equilibrium position and maximum displacement. Show the motion path as a smooth arc.',
      },
      {
        chapterNumber: 2,
        title: 'Period and Frequency',
        content:
          'The period is the time it takes for one complete oscillation. Frequency is the number of oscillations per second. These are fundamental properties of periodic motion.',
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
        content:
          'The length of the pendulum is the most important factor determining its period. A longer pendulum swings more slowly (longer period) than a shorter one.',
        keyPoints: [
          'Period is proportional to √L',
          'Doubling length increases period by √2 (about 1.41 times)',
          'Quadrupling length doubles the period',
          'Mass of bob does NOT affect period',
        ],
        visualDescription:
          'Show three pendulums of different lengths side by side. The longer one swings slower. Include a graph showing period vs length relationship.',
      },
      {
        chapterNumber: 4,
        title: 'Energy in a Pendulum',
        content:
          'As a pendulum swings, energy constantly converts between potential and kinetic energy. The total mechanical energy remains constant (energy conservation).',
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
        content:
          'An important property of the simple pendulum is that the period is independent of amplitude. Whether the pendulum swings through a small or large angle, the period remains the same (for small angles).',
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
        content:
          'A pendulum (for small angles) exhibits simple harmonic motion, where the restoring force is proportional to displacement. This results in the sinusoidal motion we observe.',
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
    description:
      'Understand momentum and energy conservation in elastic collisions',
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
        content:
          'A collision occurs when two objects come into contact and exert forces on each other. There are two main types: elastic collisions (kinetic energy conserved) and inelastic collisions (kinetic energy not conserved).',
        keyPoints: [
          'Collision: two objects interact through contact',
          'Elastic collision: KE is conserved',
          'Inelastic collision: KE is not conserved',
          'Momentum is always conserved',
        ],
        visualDescription:
          'Show two balls approaching each other, making contact, and separating. Indicate momentum vectors before and after collision.',
      },
      {
        chapterNumber: 2,
        title: 'Momentum Conservation',
        content:
          'The law of conservation of momentum states that the total momentum before a collision equals the total momentum after the collision (in the absence of external forces).',
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
            calculation:
              'Before: p = 2×5 + 2×0 = 10 kg·m/s\nAfter: p = 2×v₁f + 2×v₂f = 10 kg·m/s\nFor equal masses: v₁f = 0, v₂f = 5 m/s',
          },
        ],
      },
      {
        chapterNumber: 3,
        title: 'Elastic Collisions',
        content:
          'In an elastic collision, both momentum AND kinetic energy are conserved. This typically occurs with hard objects like billiard balls or steel spheres.',
        keyPoints: [
          'Both momentum and kinetic energy conserved',
          'Objects may bounce off each other',
          'Common in atomic and subatomic collisions',
          'Coefficient of restitution (e) = 1',
        ],
        formula:
          'Momentum: m₁v₁ᵢ + m₂v₂ᵢ = m₁v₁f + m₂v₂f\nEnergy: ½m₁v₁ᵢ² + ½m₂v₂ᵢ² = ½m₁v₁f² + ½m₂v₂f²',
      },
      {
        chapterNumber: 4,
        title: 'Elastic Collision Formulas',
        content:
          'For two objects in a head-on elastic collision, we can derive formulas for the final velocities directly.',
        keyPoints: [
          'For equal masses with one stationary: velocities exchange',
          'For different masses: use the full formula',
          'Final velocity depends on both initial velocity and mass ratio',
          'Can have negative velocities (opposite direction)',
        ],
        formula:
          'v₁f = ((m₁-m₂)/(m₁+m₂))v₁ᵢ + (2m₂/(m₁+m₂))v₂ᵢ\nv₂f = (2m₁/(m₁+m₂))v₁ᵢ + ((m₂-m₁)/(m₁+m₂))v₂ᵢ',
        examples: [
          {
            title: 'Example: Equal masses',
            description: 'Two 1 kg balls, first moving at 4 m/s, second at rest',
            calculation: 'v₁f = 0 m/s, v₂f = 4 m/s (velocities exchange)',
          },
          {
            title: 'Example: Different masses',
            description: '2 kg ball at 5 m/s hits stationary 1 kg ball',
            calculation:
              'v₁f = ((2-1)/(2+1))×5 = (1/3)×5 = 1.67 m/s\nv₂f = (2×2/(2+1))×5 = (4/3)×5 = 6.67 m/s',
          },
        ],
      },
      {
        chapterNumber: 5,
        title: 'Coefficient of Restitution',
        content:
          'The coefficient of restitution (e) is a measure of how much kinetic energy is retained in a collision. For elastic collisions, e = 1.',
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
        content:
          'Most real collisions are partially inelastic, losing some energy to sound, heat, and deformation. However, elastic collisions are a good approximation for many situations.',
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
        content:
          'Acids and bases are chemical compounds with opposite properties. Acids donate hydrogen ions (H⁺) and taste sour, while bases accept hydrogen ions and taste bitter. The pH scale measures how acidic or basic a solution is.',
        keyPoints: [
          'Acid: donates H⁺ ions, pH < 7',
          'Base: accepts H⁺ ions, pH > 7',
          'pH scale: 0-14, where 7 is neutral',
          'Strong acids/bases dissociate completely',
        ],
        visualDescription:
          'Show pH scale from 0 to 14 with examples. Indicate acids on left (0-7), neutral in middle (7), bases on right (7-14).',
      },
      {
        chapterNumber: 2,
        title: 'pH Scale',
        content:
          'The pH scale is a logarithmic scale that measures the concentration of hydrogen ions in a solution. Each unit change represents a 10-fold change in H⁺ concentration.',
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
        content:
          'Strong acids and bases completely dissociate in water, meaning they break apart entirely into ions. Common strong acids include HCl, HBr, HI, HNO₃, H₂SO₄, and HClO₄.',
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
        content:
          'When an acid and base react, they neutralize each other in a neutralization reaction. The general form is: Acid + Base → Salt + Water.',
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
            description:
              'Mixing strong acid and strong base produces salt and water',
            calculation:
              'HCl + NaOH → NaCl + H₂O\nIf equal moles: final pH = 7 (neutral)',
          },
          {
            title: 'Example: Excess acid',
            description: 'If more HCl than NaOH',
            calculation:
              'Some HCl remains unreacted\nFinal pH < 7 (acidic)',
          },
        ],
      },
      {
        chapterNumber: 5,
        title: 'Stoichiometry of Neutralization',
        content:
          'The amount of acid and base needed to completely neutralize each other depends on their concentrations and volumes. At the equivalence point, all acid is neutralized by base.',
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
            calculation:
              'Moles HCl = 1 × 0.050 = 0.05 mol\nMoles NaOH needed = 0.05 mol\nVolume NaOH = 0.05 / 1 = 50 mL',
          },
        ],
      },
      {
        chapterNumber: 6,
        title: 'Heat of Neutralization',
        content:
          'Neutralization reactions are exothermic, meaning they release energy in the form of heat. For strong acid-strong base reactions, the heat released is approximately constant.',
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
        content:
          'Titration is an analytical procedure used to determine the concentration of a substance in a solution. A solution of known concentration (titrant) is gradually added to a solution of unknown concentration (analyte) until a color change occurs, indicating the endpoint.',
        keyPoints: [
          'Titration determines unknown concentration',
          'Titrant: solution of known concentration',
          'Analyte: solution of unknown concentration',
          'Endpoint: color change indicating completion',
          'Equivalence point: all analyte is neutralized',
        ],
        visualDescription:
          'Show a burette containing titrant above a flask containing analyte. Include color change at endpoint.',
      },
      {
        chapterNumber: 2,
        title: 'Equipment and Setup',
        content:
          'Titration requires specific laboratory equipment to ensure accurate measurements. The main pieces include a burette for precise volume measurement, an Erlenmeyer flask for the analyte, and an indicator for visual identification of the endpoint.',
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
        content:
          'An indicator is a chemical compound that changes color at a specific pH. The choice of indicator depends on the acid-base pair being titrated.',
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
        content:
          'The titration procedure involves systematically adding titrant to the analyte while monitoring for the endpoint. The volume of titrant used is recorded and used in calculations.',
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
        content:
          'The equivalence point is the theoretical point where moles of acid equal moles of base. The endpoint is the observable moment when the indicator changes color. These may not be exactly the same.',
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
        content:
          'Once you have the volume of titrant used, you can calculate the concentration of the unknown solution using the stoichiometric relationship between acid and base.',
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
            description:
              'Using 0.1 M NaOH to titrate unknown HCl. 25 mL HCl required 20 mL NaOH.',
            calculation:
              'M₁V₁ = M₂V₂\nM(HCl) × 25 = 0.1 × 20\nM(HCl) = 2/25 = 0.08 M',
          },
          {
            title: 'Example: Multiple trials',
            description: 'Trial 1: 19.8 mL, Trial 2: 20.1 mL, Trial 3: 20.0 mL',
            calculation:
              'Average = (19.8 + 20.1 + 20.0) / 3 = 19.97 mL\nUse average for concentration calculation',
          },
        ],
      },
      {
        chapterNumber: 7,
        title: 'Sources of Error',
        content:
          'Several factors can affect the accuracy of titration results. Understanding and minimizing these errors is important for good analytical practice.',
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
];

async function seedTutorials() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab';
    const dbUri = mongoUri.includes('/lab') ? mongoUri : mongoUri + '/lab';
    await mongoose.connect(dbUri);
    console.log('✓ Connected to MongoDB (lab database)');

    // Create Tutorial model
    const tutorialSchema = new mongoose.Schema({
      experimentId: { type: String, unique: true, index: true },
      experimentName: String,
      category: { type: String, enum: ['physics', 'chemistry'] },
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

    const Tutorial = mongoose.model('Tutorial', tutorialSchema);

    // Clear existing tutorials
    await Tutorial.deleteMany({});
    console.log('✓ Cleared existing tutorials');

    // Insert tutorials
    const createdTutorials = await Tutorial.insertMany(tutorialData);
    console.log(`✓ Created ${createdTutorials.length} tutorials\n`);

    // Display created tutorials
    console.log('Seeded Tutorials:');
    createdTutorials.forEach((tutorial: any) => {
      console.log(`  • ${tutorial.experimentName} (${tutorial.experimentId})`);
      console.log(`    - Category: ${tutorial.category}`);
      console.log(`    - Difficulty: ${tutorial.difficulty}`);
      console.log(`    - Duration: ${tutorial.duration} minutes`);
      console.log(`    - Chapters: ${tutorial.chapters.length}`);
    });

    console.log('\n✓ Tutorial seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding error:', error);
    process.exit(1);
  }
}

seedTutorials();
