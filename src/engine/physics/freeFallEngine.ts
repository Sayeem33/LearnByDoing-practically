import PhysicsEngine from '@/engine/PhysicsEngine';

/**
 * FreeFallEngine
 * Lightweight wrapper around the central PhysicsEngine to provide
 * experiment-specific helpers: spawn ball at height, compute theoretical
 * d = 1/2 * g * t^2 and v = g * t, and provide data extraction for graphs.
 */

export default class FreeFallEngine {
  physics: PhysicsEngine;
  ballId: string | null = null;

  constructor(physics: PhysicsEngine) {
    this.physics = physics;
  }

  spawnBall(x = 400, y = 100, radius = 20, options: any = {}) {
    if (this.ballId) {
      this.physics.removeObject(this.ballId);
      this.ballId = null;
    }
    this.ballId = this.physics.createBall(x, y, radius, options);
    return this.ballId;
  }

  setInitialHeight(y: number) {
    if (!this.ballId) return;
    const obj = this.physics.getObjectData(this.ballId);
    if (!obj) return;
    const body = (obj as any).position;
    // Set position directly
    this.physics.setVelocity(this.ballId, { x: 0, y: 0 });
    // Matter.Body.setPosition is not exposed here; use applyForce tiny to move
    // For a clean approach, recreate ball at new height
    const meta = (obj as any).metadata || {};
    this.physics.removeObject(this.ballId);
    this.ballId = this.physics.createBall(body.x, y, meta.radius || 20, meta);
  }

  // Compute theoretical values at time t (seconds)
  static theoreticalDistance(g: number, t: number) {
    return 0.5 * g * t * t; // meters
  }

  static theoreticalVelocity(g: number, t: number) {
    return g * t; // m/s
  }

  getBallData() {
    if (!this.ballId) return null;
    return this.physics.getObjectData(this.ballId);
  }
}
