/**
 * progressTracker
 * Minimal in-memory progress tracker. In production this would persist to a DB.
 */

type Progress = {
  userId: string;
  experimentType: string;
  completedSteps: string[];
  achievements: string[];
};

const _store: Record<string, Progress> = {};

export function getProgress(userId: string) {
  return _store[userId] || { userId, experimentType: '', completedSteps: [], achievements: [] };
}

export function markStepCompleted(userId: string, experimentType: string, step: string) {
  const p = _store[userId] || { userId, experimentType, completedSteps: [], achievements: [] };
  p.experimentType = experimentType;
  if (!p.completedSteps.includes(step)) p.completedSteps.push(step);
  _store[userId] = p;
  return p;
}

export function awardAchievement(userId: string, achievementId: string) {
  const p = _store[userId] || { userId, experimentType: '', completedSteps: [], achievements: [] };
  if (!p.achievements.includes(achievementId)) p.achievements.push(achievementId);
  _store[userId] = p;
  return p;
}
