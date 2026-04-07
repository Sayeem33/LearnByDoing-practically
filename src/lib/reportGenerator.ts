import { formatValidationValue, ValidationSummary } from '@/lib/validation';

interface ReportMetric {
  count: number;
  min: number;
  max: number;
  mean: number;
  last: number;
}

interface GenerateReportInput {
  title: string;
  description?: string;
  experimentType: string;
  category?: string;
  status?: string;
  theory?: string;
  objectives?: string[];
  results?: Record<string, any>[];
  snapshot?: Record<string, any> | null;
  generatedAt?: string;
}

function formatValue(value: any) {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(3);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value ?? '');
}

function computeStatistics(results: Record<string, any>[]) {
  if (!results.length) return {} as Record<string, ReportMetric>;

  const numericKeys = Object.keys(results[0]).filter((key) =>
    results.some((row) => typeof row[key] === 'number')
  );

  return numericKeys.reduce<Record<string, ReportMetric>>((acc, key) => {
    const values = results
      .map((row) => row[key])
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

    if (!values.length) return acc;

    const sum = values.reduce((total, value) => total + value, 0);

    acc[key] = {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: sum / values.length,
      last: values[values.length - 1],
    };

    return acc;
  }, {});
}

function summarizeSnapshot(snapshot?: Record<string, any> | null) {
  if (!snapshot) return [] as Array<{ key: string; value: string }>;

  return Object.entries(snapshot)
    .filter(
      ([key, value]) =>
        key !== 'dataPoints' &&
        key !== 'savedAt' &&
        key !== 'validation' &&
        value !== undefined &&
        value !== null
    )
    .slice(0, 10)
    .map(([key, value]) => ({
      key,
      value: formatValue(value),
    }));
}

function extractValidationSummary(snapshot?: Record<string, any> | null) {
  if (!snapshot?.validation) {
    return null;
  }

  return snapshot.validation as ValidationSummary;
}

export function generateReport({
  title,
  description,
  experimentType,
  category,
  status,
  theory,
  objectives = [],
  results = [],
  snapshot,
  generatedAt,
}: GenerateReportInput) {
  const reportDate = generatedAt || new Date().toISOString();
  const statistics = computeStatistics(results);
  const snapshotSummary = summarizeSnapshot(snapshot);
  const validationSummary = extractValidationSummary(snapshot);
  const variables = results.length ? Object.keys(results[0]).join(', ') : 'No measurements recorded';
  const sampleRows = results.slice(0, 5);

  const lines: string[] = [
    `# Lab Report: ${title}`,
    '',
    `Generated: ${new Date(reportDate).toLocaleString()}`,
    `Experiment Type: ${experimentType}`,
    `Category: ${category || 'N/A'}`,
    `Status: ${status || 'draft'}`,
    '',
    '## Overview',
    description || 'No description provided.',
    '',
    '## Theory Summary',
    theory || 'Add a short explanation of the scientific principle behind this experiment.',
    '',
    '## Objectives',
    ...(objectives.length
      ? objectives.map((objective) => `- ${objective}`)
      : ['- Add the learning goals for this lab.']),
    '',
    '## Data Summary',
    `- Measurements captured: ${results.length}`,
    `- Recorded variables: ${variables}`,
    results.length && typeof results[0]?.time === 'number'
      ? `- Time window: ${formatValue(results[0].time)} to ${formatValue(results[results.length - 1].time)}`
      : '- Time window: N/A',
    '',
    '## Setup Snapshot',
    ...(snapshotSummary.length
      ? snapshotSummary.map((entry) => `- ${entry.key}: ${entry.value}`)
      : ['- Add setup details, controls, and conditions used during the lab.']),
    '',
    '## Key Metrics',
  ];

  if (Object.keys(statistics).length) {
    Object.entries(statistics).forEach(([key, metric]) => {
      lines.push(
        `- ${key}: mean ${metric.mean.toFixed(3)}, min ${metric.min.toFixed(3)}, max ${metric.max.toFixed(3)}, last ${metric.last.toFixed(3)}`
      );
    });
  } else {
    lines.push('- No numeric measurements are available yet.');
  }

  lines.push('', '## Validation Summary');

  if (validationSummary?.metrics.length) {
    lines.push(`- Validation status: ${validationSummary.status}`);
    lines.push(
      `- Accuracy score: ${
        validationSummary.accuracyScore !== null
          ? `${validationSummary.accuracyScore.toFixed(1)}%`
          : 'N/A'
      }`
    );
    lines.push(`- Passed checks: ${validationSummary.passRate.toFixed(1)}%`);

    validationSummary.metrics.forEach((metric) => {
      lines.push(
        `- ${metric.label}: theoretical ${formatValidationValue(metric.theoretical, metric.unit)}, measured ${formatValidationValue(metric.measured, metric.unit)}, error ${metric.errorPercent?.toFixed(2) || '0.00'}%`
      );
    });

    if (validationSummary.notes.length) {
      validationSummary.notes.forEach((note) => lines.push(`- Note: ${note}`));
    }
  } else {
    lines.push('- Validation data is not available yet for this report.');
  }

  lines.push('', '## Sample Measurements');

  if (sampleRows.length) {
    const headers = Object.keys(sampleRows[0]);
    lines.push(`| ${headers.join(' | ')} |`);
    lines.push(`| ${headers.map(() => '---').join(' | ')} |`);
    sampleRows.forEach((row) => {
      lines.push(`| ${headers.map((header) => formatValue(row[header])).join(' | ')} |`);
    });
  } else {
    lines.push('No measurement rows captured yet.');
  }

  lines.push(
    '',
    '## Observations',
    '- Add the main behaviors, trends, or reactions you observed during the simulation.',
    '',
    '## Conclusion',
    '- Summarize whether the experiment matched the expected theory and mention any error sources or limitations.',
    '',
    '## Next Steps',
    '- Add follow-up improvements, new trials, or further questions to investigate.'
  );

  return lines.join('\n');
}
