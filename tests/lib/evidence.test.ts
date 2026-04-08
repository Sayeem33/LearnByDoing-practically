import { describe, expect, it } from 'vitest';
import { buildEvidenceSummary, evidenceSummaryToMarkdown } from '@/lib/evidence';
import { ValidationSummary } from '@/lib/validation';

describe('evidence summary helpers', () => {
  it('builds reusable statistics and export-ready metadata', () => {
    const validation: ValidationSummary = {
      experimentType: 'freefall',
      title: 'Free Fall Verification',
      status: 'validated',
      generatedAt: '2026-04-08T00:00:00.000Z',
      accuracyScore: 98.5,
      passRate: 100,
      supported: true,
      metrics: [
        {
          key: 'velocity',
          label: 'Velocity',
          theoretical: 9.8,
          measured: 9.7,
          tolerancePercent: 10,
          errorPercent: 1.02,
          withinTolerance: true,
          unit: 'm/s',
        },
      ],
      notes: [],
    };

    const summary = buildEvidenceSummary({
      title: 'Free Fall',
      experimentType: 'freefall',
      category: 'physics',
      experimentStatus: 'submitted',
      results: [
        { time: 0, velocity: 0, position: 2 },
        { time: 1, velocity: 9.7, position: 6.8 },
      ],
      snapshot: { height: 100 },
      validation,
      labReport: '# Report',
      savedExperimentId: 'exp-1',
      review: {
        status: 'approved',
        feedback: 'Looks good.',
        reviewedBy: 'Teacher',
      },
    });

    expect(summary.sampleCount).toBe(2);
    expect(summary.numericVariableCount).toBe(3);
    expect(summary.statistics.find((metric) => metric.key === 'velocity')?.mean).toBe(4.85);
    expect(summary.toolsUsed).toContain('Validation engine');
    expect(summary.storedOutputs.find((output) => output.key === 'lab_report')?.available).toBe(true);

    const markdown = evidenceSummaryToMarkdown(summary);
    expect(markdown).toContain('# Verification Evidence: Free Fall');
    expect(markdown).toContain('Validation status: validated');
    expect(markdown).toContain('Status: approved');
  });
});
