import PhysicsEngine from '@/engine/PhysicsEngine';
import { PHYSICS } from '@/lib/constants';

/**
 * ProjectileEngine
 * Provides helper calculations for projectile motion and can use PhysicsEngine
 * to visualize an actual projectile via a cannon body.
 */

export default class ProjectileEngine {
  physics: PhysicsEngine;
  projectileId: string | null = null;

  constructor(physics: PhysicsEngine) {
    this.physics = physics;
  }

  launch(x: number, y: number, speed: number, angleDeg: number, options: any = {}) {
    // create a cannonball and set velocity
    if (this.projectileId) {
      this.physics.removeObject(this.projectileId);
      this.projectileId = null;
    }
    const rad = (angleDeg * Math.PI) / 180;
    // Convert speed from m/s to px/s using PHYSICS.SCALE
    const speedPx = speed * PHYSICS.SCALE;
    const vx = speedPx * Math.cos(rad);
    const vy = -speedPx * Math.sin(rad); // negative because canvas y grows down

    this.projectileId = this.physics.createBall(x, y, options.radius || 8, options);
    this.physics.setVelocity(this.projectileId, { x: vx, y: vy });
    return this.projectileId;
  }

  // Analytical range (ignoring air resistance) in meters using g (m/s^2)
  static range(speed: number, angleDeg: number, g = 9.8) {
    const rad = (angleDeg * Math.PI) / 180;
    return (Math.pow(speed, 2) * Math.sin(2 * rad)) / g;
  }

  static timeOfFlight(speed: number, angleDeg: number, g = 9.8) {
    const rad = (angleDeg * Math.PI) / 180;
    return (2 * speed * Math.sin(rad)) / g;
  }

  static optimalAngle() {
    return 45; // degrees (approx)
  }
}
