import { describe, expect, it } from 'vitest';
import {
  buildConceptId,
  buildTutorialPayloadFromDefinition,
  normalizeConceptDefinition,
} from '@/lib/authoredDefinitions';

describe('authored definitions helpers', () => {
  it('creates a simple concept id from a title', () => {
    expect(buildConceptId('Electric Field Mapping')).toBe('electricfieldmapping');
  });

  it('normalizes a saved concept definition for the generic lab view', () => {
    const normalized = normalizeConceptDefinition({
      conceptId: 'customconcept',
      name: 'Custom Concept',
      category: 'physics',
      description: 'A custom module',
      theory: 'Theory text',
      objectives: ['Observe behaviour'],
      tutorialChapters: [
        {
          chapterNumber: 1,
          title: 'Intro',
          content: 'Chapter content',
        },
      ],
      formulas: [
        {
          key: 'f1',
          label: 'Formula 1',
          expression: 'x + y',
          description: 'Simple relation',
        },
      ],
      charts: [
        {
          key: 'chart1',
          title: 'Primary Chart',
          xKey: 'time',
          yKey: 'value',
          xLabel: 'Time',
          yLabel: 'Value',
        },
      ],
      validationRules: [],
      controls: [],
      defaultState: {
        dataPoints: [],
        sample: 1,
      },
    } as any);

    expect(normalized.workspace).toBe('generic');
    expect(normalized.id).toBe('customconcept');
    expect(normalized.buildInitialState().sample).toBe(1);
  });

  it('builds a tutorial payload from the authored definition', () => {
    const tutorial = buildTutorialPayloadFromDefinition({
      conceptId: 'trigvisual',
      name: 'Trig Visual',
      category: 'math',
      description: 'Visual trig',
      difficulty: 'beginner',
      duration: 20,
      objectives: ['See sine and cosine'],
      tutorialChapters: [
        {
          chapterNumber: 1,
          title: 'Start',
          content: 'Intro text',
          keyPoints: ['Point 1'],
        },
      ],
    });

    expect(tutorial.experimentId).toBe('trigvisual');
    expect(tutorial.chapters).toHaveLength(1);
    expect(tutorial.chapters[0].title).toBe('Start');
  });
});
