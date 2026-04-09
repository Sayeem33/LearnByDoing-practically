import { IConceptDefinition } from '@/models/ConceptDefinition';

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 40);
}

export function buildConceptId(value: string) {
  return toSlug(value);
}

export function normalizeConceptDefinition(definition: IConceptDefinition | Record<string, any>) {
  const raw = typeof (definition as any).toObject === 'function'
    ? (definition as any).toObject()
    : definition;

  return {
    id: raw.conceptId,
    name: raw.name,
    category: raw.category,
    workspace: 'generic' as const,
    description: raw.description,
    theory: raw.theory,
    objectives: raw.objectives || [],
    tutorialSteps: (raw.tutorialChapters || []).map((chapter: any) => ({
      title: chapter.title,
      description: chapter.content,
    })),
    formulas: raw.formulas || [],
    charts: raw.charts || [],
    validationRules: raw.validationRules || [],
    outputMetrics: (raw.charts || []).map((chart: any) => ({
      key: chart.yKey,
      label: chart.yLabel,
      description: `${chart.yLabel} plotted against ${chart.xLabel}.`,
      unit: '',
    })),
    controls: raw.controls || [],
    initialSetup: raw.defaultState || {},
    buildInitialState: () => ({
      ...(raw.defaultState || {}),
      dataPoints: Array.isArray(raw.defaultState?.dataPoints) ? raw.defaultState.dataPoints : [],
      savedAt: new Date().toISOString(),
    }),
  };
}

export function buildTutorialPayloadFromDefinition(definition: {
  conceptId: string;
  name: string;
  category: 'physics' | 'chemistry' | 'math';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  objectives: string[];
  tutorialChapters: Array<{
    chapterNumber: number;
    title: string;
    content: string;
    keyPoints?: string[];
  }>;
}) {
  return {
    experimentId: definition.conceptId,
    experimentName: definition.name,
    category: definition.category,
    description: definition.description,
    difficulty: definition.difficulty,
    duration: definition.duration,
    objectives: definition.objectives,
    chapters: definition.tutorialChapters.map((chapter) => ({
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      content: chapter.content,
      keyPoints: chapter.keyPoints || [],
    })),
  };
}
