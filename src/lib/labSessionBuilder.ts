import { EXPERIMENT_TEMPLATES } from '@/lib/constants';

export type ExperimentTemplateKey = keyof typeof EXPERIMENT_TEMPLATES;

export interface NewLabSessionConfig {
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
}

export const DEFAULT_NEW_LAB_CONFIG: NewLabSessionConfig = {
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
};

function cloneTemplateSetup(experimentType: ExperimentTemplateKey) {
  const template = EXPERIMENT_TEMPLATES[experimentType];
  return template?.initialSetup ? JSON.parse(JSON.stringify(template.initialSetup)) : {};
}

export function createInitialLabState(
  experimentType: ExperimentTemplateKey,
  config: NewLabSessionConfig = DEFAULT_NEW_LAB_CONFIG
) {
  const templateSetup = cloneTemplateSetup(experimentType);
  const savedAt = new Date().toISOString();

  switch (experimentType) {
    case 'freefall':
      return {
        ...(templateSetup || {}),
        objects: templateSetup?.objects || [{ type: 'ball', x: 400, y: config.height, radius: 20 }],
        height: config.height,
        dataPoints: [],
        savedAt,
      };

    case 'projectilemotion':
      return {
        time: 0,
        angle: config.angle,
        speed: config.speed,
        initialHeight: config.initialHeight,
        projectile: {
          x: 0,
          y: config.initialHeight,
          vx: 0,
          vy: 0,
          launched: false,
          landed: false,
        },
        trajectory: [],
        measuredRange: null,
        measuredMaxHeight: null,
        measuredTimeOfFlight: null,
        dataPoints: [],
        savedAt,
      };

    case 'pendulum':
      return {
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
        savedAt,
      };

    case 'collision':
      return {
        time: 0,
        massA: config.massA,
        massB: config.massB,
        velocityA: config.velocityA,
        velocityB: config.velocityB,
        restitution: config.restitution,
        collision: {
          balls: [
            {
              id: 'A',
              x: 150,
              y: 320,
              vx: config.velocityA,
              vy: 0,
              radius: 20 + config.massA * 3,
              mass: config.massA,
              color: '#ef4444',
              label: 'A',
            },
            {
              id: 'B',
              x: 650,
              y: 320,
              vx: config.velocityB,
              vy: 0,
              radius: 20 + config.massB * 3,
              mass: config.massB,
              color: '#3b82f6',
              label: 'B',
            },
          ],
          isCollided: false,
          collisionTime: null,
          initialMomentum: {
            px: config.massA * config.velocityA + config.massB * config.velocityB,
            py: 0,
          },
          currentMomentum: {
            px: config.massA * config.velocityA + config.massB * config.velocityB,
            py: 0,
          },
          initialKE:
            0.5 * config.massA * config.velocityA * config.velocityA +
            0.5 * config.massB * config.velocityB * config.velocityB,
          currentKE:
            0.5 * config.massA * config.velocityA * config.velocityA +
            0.5 * config.massB * config.velocityB * config.velocityB,
          coefficientOfRestitution: config.restitution,
        },
        dataPoints: [],
        savedAt,
      };

    case 'electrolysis':
      return {
        time: 0,
        voltage: config.voltage,
        electrolyteConc: config.electrolyteConc,
        state: {
          voltage: config.voltage,
          current: 0,
          h2Volume: 0,
          o2Volume: 0,
          time: 0,
          bubbles: [],
        },
        dataPoints: [],
        savedAt,
      };

    default:
      return {
        ...(templateSetup || {}),
        dataPoints: [],
        savedAt,
      };
  }
}
