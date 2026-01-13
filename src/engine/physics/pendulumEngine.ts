import PhysicsEngine from '@/engine/PhysicsEngine';

export default class PendulumEngine {
  physics: PhysicsEngine;
  pendulumId: string | null = null;

  constructor(physics: PhysicsEngine) {
    this.physics = physics;
  }

  create(x: number, y: number, length: number, mass = 1, options: any = {}) {
    if (this.pendulumId) {
      this.physics.removeObject(this.pendulumId);
    }
    this.pendulumId = this.physics.createPendulum(x, y, length, { density: mass, ...options });
    return this.pendulumId;
  }

  // Small-angle approximation period (seconds)
  static period(lengthMeters: number, g = 9.8) {
    return 2 * Math.PI * Math.sqrt(lengthMeters / g);
  }

  getEnergy(g = 9.8) {
    if (!this.pendulumId) return null;
    const data = this.physics.getObjectData(this.pendulumId);
    if (!data) return null;
    const y = data.position.y;
    const v = data.speed;
    // potential energy relative to pivot approximated by m*g*h; mass unknown -> use density
    const m = (data.metadata && data.metadata.density) || 1;
    const h = y - (data.metadata && data.metadata.anchor ? data.metadata.anchor.position.y : 0);
    const pe = m * g * h;
    const ke = 0.5 * m * v * v;
    return { pe, ke, total: pe + ke };
  }
}
