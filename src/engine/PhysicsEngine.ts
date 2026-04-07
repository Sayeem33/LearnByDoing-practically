import Matter from 'matter-js';
import { PHYSICS, CANVAS } from '@/lib/constants';

export interface PhysicsObject {
  id: string;
  body: Matter.Body;
  type: string;
  metadata?: any;
}

export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private runner: Matter.Runner | null = null;
  private objects: Map<string, PhysicsObject> = new Map();
  private isRunning: boolean = false;

  constructor() {
    // Create Matter.js engine
    this.engine = Matter.Engine.create({
      gravity: {
        x: 0,
        y: PHYSICS.GRAVITY / PHYSICS.SCALE, // Convert to Matter.js units
        scale: 0.001,
      },
    });

    this.world = this.engine.world;

    // Configure engine properties for better stability
    this.engine.timing.timeScale = 1;
    this.engine.constraintIterations = 2;
    this.engine.positionIterations = 6;
    this.engine.velocityIterations = 4;

    // Add ground
    this.createGround();
  }

  /**
   * Create static ground
   */
  private createGround() {
    const ground = Matter.Bodies.rectangle(
      CANVAS.WIDTH / 2,
      CANVAS.HEIGHT - 20,
      CANVAS.WIDTH,
      40,
      {
        isStatic: true,
        friction: 0.5,
        restitution: 0.3,
        render: {
          fillStyle: '#166534',
        },
      }
    );

    Matter.World.add(this.world, ground);
  }

  /**
   * Create a ball
   */
  createBall(x: number, y: number, radius: number, options: any = {}): string {
    const id = `ball_${Date.now()}_${Math.random()}`;
    
    const ball = Matter.Bodies.circle(x, y, radius, {
      restitution: options.restitution || 0.8,
      friction: options.friction || 0.1,
      density: options.density || 0.001,
      render: {
        fillStyle: options.color || '#ef4444',
      },
      ...options,
    });

    Matter.World.add(this.world, ball);
    this.objects.set(id, { id, body: ball, type: 'ball', metadata: options });

    return id;
  }

  /**
   * Create a box
   */
  createBox(x: number, y: number, width: number, height: number, options: any = {}): string {
    const id = `box_${Date.now()}_${Math.random()}`;
    
    const box = Matter.Bodies.rectangle(x, y, width, height, {
      restitution: options.restitution || 0.3,
      friction: options.friction || 0.5,
      density: options.density || 0.001,
      render: {
        fillStyle: options.color || '#8b5cf6',
      },
      ...options,
    });

    Matter.World.add(this.world, box);
    this.objects.set(id, { id, body: box, type: 'box', metadata: options });

    return id;
  }

  /**
   * Create a ramp (static inclined plane)
   */
  createRamp(x: number, y: number, width: number, angle: number, options: any = {}): string {
    const id = `ramp_${Date.now()}_${Math.random()}`;
    
    const ramp = Matter.Bodies.rectangle(x, y, width, 20, {
      isStatic: true,
      angle: (angle * Math.PI) / 180,
      friction: options.friction || 0.3,
      restitution: options.restitution || 0.5,
      render: {
        fillStyle: options.color || '#6b7280',
      },
      ...options,
    });

    Matter.World.add(this.world, ramp);
    this.objects.set(id, { id, body: ramp, type: 'ramp', metadata: options });

    return id;
  }

  /**
   * Create a spring constraint
   */
  createSpring(
    bodyA: Matter.Body,
    bodyB: Matter.Body,
    options: any = {}
  ): Matter.Constraint {
    const spring = Matter.Constraint.create({
      bodyA,
      bodyB,
      stiffness: options.stiffness || 0.05,
      damping: options.damping || 0.01,
      length: options.length || 100,
      render: {
        strokeStyle: options.color || '#22c55e',
        lineWidth: 3,
      },
    });

    Matter.World.add(this.world, spring);
    return spring;
  }

  /**
   * Create a pendulum
   */
  createPendulum(x: number, y: number, length: number, options: any = {}): string {
    const id = `pendulum_${Date.now()}_${Math.random()}`;

    // Fixed point
    const anchor = Matter.Bodies.circle(x, y, 5, {
      isStatic: true,
      render: { fillStyle: '#000' },
    });

    // Bob
    const bob = Matter.Bodies.circle(x, y + length, options.bobRadius || 20, {
      density: options.density || 0.001,
      render: { fillStyle: options.color || '#ef4444' },
    });

    // Constraint (string)
    const string = Matter.Constraint.create({
      bodyA: anchor,
      bodyB: bob,
      length: length,
      stiffness: 1,
      damping: options.damping || 0.01,
      render: {
        strokeStyle: '#333',
        lineWidth: 2,
      },
    });

    Matter.World.add(this.world, [anchor, bob, string]);
    this.objects.set(id, {
      id,
      body: bob,
      type: 'pendulum',
      metadata: { anchor, string, ...options },
    });

    return id;
  }

  /**
   * Apply force to a body
   */
  applyForce(objectId: string, force: { x: number; y: number }) {
    const obj = this.objects.get(objectId);
    if (obj) {
      Matter.Body.applyForce(obj.body, obj.body.position, force);
    }
  }

  /**
   * Set velocity
   */
  setVelocity(objectId: string, velocity: { x: number; y: number }) {
    const obj = this.objects.get(objectId);
    if (obj) {
      Matter.Body.setVelocity(obj.body, velocity);
    }
  }

  /**
   * Get object data
   */
  getObjectData(objectId: string) {
    const obj = this.objects.get(objectId);
    if (!obj) return null;

    const body = obj.body;
    return {
      id: objectId,
      type: obj.type,
      metadata: obj.metadata,
      position: body.position,
      velocity: body.velocity,
      angle: body.angle,
      angularVelocity: body.angularVelocity,
      speed: Matter.Vector.magnitude(body.velocity),
    };
  }

  /**
   * Get all objects data
   */
  getAllObjectsData() {
    const data: any[] = [];
    this.objects.forEach((obj) => {
      const objData = this.getObjectData(obj.id);
      if (objData) data.push(objData);
    });
    return data;
  }

  /**
   * Remove object
   */
  removeObject(objectId: string) {
    const obj = this.objects.get(objectId);
    if (obj) {
      Matter.World.remove(this.world, obj.body);
      this.objects.delete(objectId);
    }
  }

  /**
   * Clear all objects (except ground)
   */
  clearAll() {
    this.objects.forEach((obj) => {
      Matter.World.remove(this.world, obj.body);
    });
    this.objects.clear();
  }

  /**
   * Start simulation
   */
  start() {
    if (!this.isRunning) {
      this.runner = Matter.Runner.create();
      Matter.Runner.run(this.runner, this.engine);
      this.isRunning = true;
    }
  }

  /**
   * Stop simulation
   */
  stop() {
    if (this.isRunning && this.runner) {
      Matter.Runner.stop(this.runner);
      this.isRunning = false;
    }
  }

  /**
   * Step simulation manually (for controlled updates)
   */
  step(deltaTime: number = 1000 / 60) {
    Matter.Engine.update(this.engine, deltaTime);
  }

  /**
   * Reset simulation
   */
  reset() {
    this.stop();
    this.clearAll();
    Matter.Engine.clear(this.engine);
    this.world = this.engine.world;
    this.createGround();
  }

  /**
   * Get engine instance
   */
  getEngine(): Matter.Engine {
    return this.engine;
  }

  /**
   * Get world instance
   */
  getWorld(): Matter.World {
    return this.world;
  }

  /**
   * Check if running
   */
  running(): boolean {
    return this.isRunning;
  }
}

export default PhysicsEngine;
