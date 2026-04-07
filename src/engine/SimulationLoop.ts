import { PHYSICS } from '@/lib/constants';

export interface DataPoint {
  time: number;
  [key: string]: number | string;
}

export type DataCallback = (data: DataPoint) => void;

/**
 * Core Simulation Loop with Delta Time Correction
 * This solves the "Time-Step Problem" (CO1)
 */
export class SimulationLoop {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private elapsedTime: number = 0;
  private fps: number = PHYSICS.FPS;
  private targetFrameTime: number = 1000 / PHYSICS.FPS;
  
  private updateCallback: ((deltaTime: number) => void) | null = null;
  private dataCallback: DataCallback | null = null;
  
  private dataCollectionInterval: number = 50; // milliseconds
  private lastDataCollection: number = 0;

  /**
   * Set update callback (called every frame)
   */
  onUpdate(callback: (deltaTime: number) => void) {
    this.updateCallback = callback;
  }

  /**
   * Set data callback (called at intervals for data logging)
   */
  onDataCollect(callback: DataCallback, interval: number = 50) {
    this.dataCallback = callback;
    this.dataCollectionInterval = interval;
  }

  /**
   * Main animation loop with delta time correction
   */
  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    // Calculate delta time
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
    }

    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Accumulate elapsed time
    this.elapsedTime += deltaTime;

    // Call update callback with delta time
    if (this.updateCallback) {
      // Clamp delta time to prevent spiral of death
      const clampedDelta = Math.min(deltaTime, this.targetFrameTime * 2);
      this.updateCallback(clampedDelta);
    }

    // Collect data at intervals
    if (
      this.dataCallback &&
      timestamp - this.lastDataCollection >= this.dataCollectionInterval
    ) {
      this.lastDataCollection = timestamp;
      // Data callback will be called from the hook with actual simulation data
    }

    // Request next frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Start the simulation loop
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTimestamp = 0;
    this.elapsedTime = 0;
    this.lastDataCollection = 0;
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  /**
   * Stop the simulation loop
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Pause the simulation
   */
  pause() {
    this.stop();
  }

  /**
   * Resume the simulation
   */
  resume() {
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Reset the simulation
   */
  reset() {
    this.stop();
    this.elapsedTime = 0;
    this.lastTimestamp = 0;
    this.lastDataCollection = 0;
  }

  /**
   * Get elapsed time in seconds
   */
  getElapsedTime(): number {
    return this.elapsedTime / 1000;
  }

  /**
   * Get elapsed time in milliseconds
   */
  getElapsedTimeMs(): number {
    return this.elapsedTime;
  }

  /**
   * Check if running
   */
  running(): boolean {
    return this.isRunning;
  }

  /**
   * Set target FPS
   */
  setFPS(fps: number) {
    this.fps = fps;
    this.targetFrameTime = 1000 / fps;
  }

  /**
   * Get target FPS
   */
  getFPS(): number {
    return this.fps;
  }
}

export default SimulationLoop;
