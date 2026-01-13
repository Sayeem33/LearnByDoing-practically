import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to fixed decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Convert pixels to meters (for physics calculations)
 */
export function pixelsToMeters(pixels: number, scale: number = 50): number {
  return pixels / scale;
}

/**
 * Convert meters to pixels (for rendering)
 */
export function metersToPixels(meters: number, scale: number = 50): number {
  return meters * scale;
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string = 'experiment_data.csv') {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Calculate velocity from positions
 */
export function calculateVelocity(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number },
  deltaTime: number
): { vx: number; vy: number; magnitude: number } {
  const vx = (pos2.x - pos1.x) / deltaTime;
  const vy = (pos2.y - pos1.y) / deltaTime;
  const magnitude = Math.sqrt(vx * vx + vy * vy);
  
  return { vx, vy, magnitude };
}

/**
 * Calculate kinetic energy
 */
export function calculateKineticEnergy(mass: number, velocity: number): number {
  return 0.5 * mass * velocity * velocity;
}

/**
 * Calculate potential energy
 */
export function calculatePotentialEnergy(
  mass: number,
  height: number,
  gravity: number = 9.8
): number {
  return mass * gravity * height;
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get color based on pH value
 */
export function getColorFromPH(ph: number): string {
  if (ph < 3) return '#ef4444'; // Red (Acidic)
  if (ph < 6) return '#f97316'; // Orange
  if (ph < 8) return '#4ade80'; // Green (Neutral)
  if (ph < 11) return '#3b82f6'; // Blue
  return '#8b5cf6'; // Purple (Basic)
}

/**
 * Calculate pH from H+ concentration
 */
export function calculatePH(hPlusConcentration: number): number {
  return -Math.log10(hPlusConcentration);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate random color
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}