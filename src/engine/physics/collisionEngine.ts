import PhysicsEngine from '@/engine/PhysicsEngine';

export default class CollisionEngine {
  physics: PhysicsEngine;
  objA: string | null = null;
  objB: string | null = null;

  constructor(physics: PhysicsEngine) {
    this.physics = physics;
  }

  spawnPair(optsA: any = {}, optsB: any = {}) {
    this.physics.reset();
    this.objA = this.physics.createBall(200, 300, 20, optsA);
    this.objB = this.physics.createBall(600, 300, 20, optsB);
    return { objA: this.objA, objB: this.objB };
  }

  setVelocities(vA: { x: number; y: number }, vB: { x: number; y: number }) {
    if (this.objA) this.physics.setVelocity(this.objA, vA);
    if (this.objB) this.physics.setVelocity(this.objB, vB);
  }

  getMomentum() {
    const a = this.objA ? this.physics.getObjectData(this.objA) : null;
    const b = this.objB ? this.physics.getObjectData(this.objB) : null;
    const ma = (a && a.metadata && a.metadata.density) || 1;
    const mb = (b && b.metadata && b.metadata.density) || 1;
    return {
      px: (a ? ma * a.velocity.x : 0) + (b ? mb * b.velocity.x : 0),
      py: (a ? ma * a.velocity.y : 0) + (b ? mb * b.velocity.y : 0),
    };
  }

  coefficientOfRestitution(preVrel: number, postVrel: number) {
    if (preVrel === 0) return 0;
    return Math.abs(postVrel / preVrel);
  }
}
