import { IUser } from '@/models/User';

type ProgressEntry = {
  tutorialProgress?: Array<{
    tutorialId: string;
    completionPercent: number;
    completedAt?: string | Date | null;
  }>;
  labProgress?: Array<{
    experimentType: string;
    completionPercent: number;
    status: 'draft' | 'completed' | 'submitted';
  }>;
};

export interface AssignmentStudentStatus {
  started: boolean;
  completed: boolean;
  submitted: boolean;
  completionPercent: number;
}

export function getStudentClassKey(student: Partial<IUser> | null | undefined) {
  const institution = student?.institution?.trim();
  const grade = student?.grade?.trim();

  if (!institution || !grade) {
    return null;
  }

  return `${institution}__${grade}`;
}

export function formatClassLabel(classKey: string) {
  const [institution, grade] = classKey.split('__');
  return grade ? `${institution} - ${grade}` : classKey;
}

export function isAssignmentVisibleToStudent(
  assignment: {
    assignedStudentIds?: string[];
    assignedClasses?: string[];
  },
  studentId: string,
  classKey: string | null
) {
  if (assignment.assignedStudentIds?.includes(studentId)) {
    return true;
  }

  if (classKey && assignment.assignedClasses?.includes(classKey)) {
    return true;
  }

  return false;
}

export function getAssignmentStudentStatus(
  sourceType: 'lab' | 'tutorial',
  sourceId: string,
  progress: ProgressEntry | null | undefined
): AssignmentStudentStatus {
  if (!progress) {
    return {
      started: false,
      completed: false,
      submitted: false,
      completionPercent: 0,
    };
  }

  if (sourceType === 'tutorial') {
    const tutorialEntry = progress.tutorialProgress?.find((entry) => entry.tutorialId === sourceId);
    const completionPercent = tutorialEntry?.completionPercent || 0;
    const completed = Boolean(tutorialEntry?.completedAt) || completionPercent >= 100;

    return {
      started: completionPercent > 0,
      completed,
      submitted: completed,
      completionPercent,
    };
  }

  const labEntries = (progress.labProgress || []).filter((entry) => entry.experimentType === sourceId);
  const bestEntry = [...labEntries].sort((a, b) => b.completionPercent - a.completionPercent)[0];

  if (!bestEntry) {
    return {
      started: false,
      completed: false,
      submitted: false,
      completionPercent: 0,
    };
  }

  return {
    started: bestEntry.completionPercent > 0,
    completed: bestEntry.status === 'completed' || bestEntry.status === 'submitted',
    submitted: bestEntry.status === 'submitted',
    completionPercent: bestEntry.completionPercent,
  };
}

export function summarizeAssignmentStatuses(
  statuses: Array<AssignmentStudentStatus & { classKey: string | null }>
) {
  const assignedCount = statuses.length;
  const startedCount = statuses.filter((status) => status.started).length;
  const completedCount = statuses.filter((status) => status.completed).length;
  const submittedCount = statuses.filter((status) => status.submitted).length;
  const completionRate = assignedCount > 0 ? (completedCount / assignedCount) * 100 : 0;
  const submissionRate = assignedCount > 0 ? (submittedCount / assignedCount) * 100 : 0;
  const averageCompletion =
    assignedCount > 0
      ? statuses.reduce((total, status) => total + status.completionPercent, 0) / assignedCount
      : 0;

  const classMap = new Map<
    string,
    {
      classKey: string;
      assignedCount: number;
      startedCount: number;
      completedCount: number;
      submittedCount: number;
      averageCompletion: number;
    }
  >();

  statuses.forEach((status) => {
    const classKey = status.classKey || 'unassigned';
    const existing = classMap.get(classKey) || {
      classKey,
      assignedCount: 0,
      startedCount: 0,
      completedCount: 0,
      submittedCount: 0,
      averageCompletion: 0,
    };

    existing.assignedCount += 1;
    if (status.started) existing.startedCount += 1;
    if (status.completed) existing.completedCount += 1;
    if (status.submitted) existing.submittedCount += 1;
    existing.averageCompletion += status.completionPercent;

    classMap.set(classKey, existing);
  });

  const classPerformance = Array.from(classMap.values()).map((entry) => ({
    ...entry,
    averageCompletion:
      entry.assignedCount > 0 ? entry.averageCompletion / entry.assignedCount : 0,
  }));

  return {
    assignedCount,
    startedCount,
    completedCount,
    submittedCount,
    completionRate,
    submissionRate,
    averageCompletion,
    classPerformance,
  };
}
