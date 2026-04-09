import { describe, expect, it } from 'vitest';
import {
  formatClassLabel,
  getAssignmentStudentStatus,
  getStudentClassKey,
  isAssignmentVisibleToStudent,
  summarizeAssignmentStatuses,
} from '@/lib/assignmentAnalytics';

describe('assignment analytics', () => {
  it('builds class keys from institution and grade', () => {
    expect(
      getStudentClassKey({
        institution: 'SimuLab School',
        grade: 'Class 10',
      } as any)
    ).toBe('SimuLab School__Class 10');
  });

  it('checks whether an assignment is visible to a student', () => {
    expect(
      isAssignmentVisibleToStudent(
        {
          assignedStudentIds: ['student-1'],
          assignedClasses: ['School__Class 9'],
        },
        'student-1',
        'School__Class 10'
      )
    ).toBe(true);

    expect(
      isAssignmentVisibleToStudent(
        {
          assignedStudentIds: [],
          assignedClasses: ['School__Class 10'],
        },
        'student-2',
        'School__Class 10'
      )
    ).toBe(true);
  });

  it('reads tutorial progress from the existing progress structure', () => {
    const status = getAssignmentStudentStatus('tutorial', 'freefall', {
      tutorialProgress: [
        {
          tutorialId: 'freefall',
          completionPercent: 100,
          completedAt: new Date().toISOString(),
        },
      ],
    });

    expect(status).toEqual({
      started: true,
      completed: true,
      submitted: true,
      completionPercent: 100,
    });
  });

  it('reads lab submission progress from the existing progress structure', () => {
    const status = getAssignmentStudentStatus('lab', 'projectilemotion', {
      labProgress: [
        {
          experimentType: 'projectilemotion',
          completionPercent: 85,
          status: 'submitted',
        },
      ],
    });

    expect(status.submitted).toBe(true);
    expect(status.completed).toBe(true);
    expect(status.completionPercent).toBe(85);
  });

  it('summarizes class-level performance', () => {
    const summary = summarizeAssignmentStatuses([
      {
        started: true,
        completed: true,
        submitted: true,
        completionPercent: 100,
        classKey: 'School__Class 10',
      },
      {
        started: true,
        completed: false,
        submitted: false,
        completionPercent: 40,
        classKey: 'School__Class 10',
      },
      {
        started: false,
        completed: false,
        submitted: false,
        completionPercent: 0,
        classKey: 'School__Class 9',
      },
    ]);

    expect(summary.assignedCount).toBe(3);
    expect(summary.startedCount).toBe(2);
    expect(summary.completedCount).toBe(1);
    expect(summary.submissionRate).toBeCloseTo(33.33, 1);
    expect(formatClassLabel(summary.classPerformance[0].classKey)).toContain('Class');
  });
});
