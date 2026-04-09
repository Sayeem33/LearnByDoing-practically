import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Tutorial from '@/models/Tutorial';
import ConceptDefinition from '@/models/ConceptDefinition';
import { buildConceptId, buildTutorialPayloadFromDefinition } from '@/lib/authoredDefinitions';
import { RBAC_POLICY, requireRoles } from '@/lib/rbac';

function cleanStringArray(values: unknown) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);
}

function cleanRows<T extends Record<string, any>>(values: unknown, mapper: (value: any, index: number) => T | null) {
  if (!Array.isArray(values)) return [];
  return values
    .map(mapper)
    .filter(Boolean) as T[];
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.authoring.list);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    const query = auth.user.role === 'admin' ? {} : { createdBy: auth.user.id };
    const definitions = await ConceptDefinition.find(query).sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, data: definitions }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/authoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch concept definitions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.authoring.create);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();
    const body = await request.json();

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const category = body?.category;
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const theory = typeof body?.theory === 'string' ? body.theory.trim() : '';

    if (!name || !description || !theory || !['physics', 'chemistry', 'math'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Name, category, description, and theory are required' },
        { status: 400 }
      );
    }

    const conceptId =
      typeof body?.conceptId === 'string' && body.conceptId.trim()
        ? buildConceptId(body.conceptId)
        : buildConceptId(name);

    const controls = cleanRows(body?.controls, (control) => {
      if (!control?.key || !control?.label || !control?.kind) return null;
      return {
        key: String(control.key).trim(),
        label: String(control.label).trim(),
        kind: control.kind,
        unit: typeof control.unit === 'string' ? control.unit.trim() : '',
        description: typeof control.description === 'string' ? control.description.trim() : '',
        min: typeof control.min === 'number' ? control.min : undefined,
        max: typeof control.max === 'number' ? control.max : undefined,
        step: typeof control.step === 'number' ? control.step : undefined,
        options: Array.isArray(control.options)
          ? control.options
              .filter((option: any) => option?.label && option?.value)
              .map((option: any) => ({
                label: String(option.label).trim(),
                value: String(option.value).trim(),
              }))
          : [],
      };
    });

    const formulas = cleanRows(body?.formulas, (formula) => {
      if (!formula?.key || !formula?.label || !formula?.expression) return null;
      return {
        key: String(formula.key).trim(),
        label: String(formula.label).trim(),
        expression: String(formula.expression).trim(),
        description: typeof formula.description === 'string' ? formula.description.trim() : '',
      };
    });

    const charts = cleanRows(body?.charts, (chart) => {
      if (!chart?.key || !chart?.title || !chart?.xKey || !chart?.yKey) return null;
      return {
        key: String(chart.key).trim(),
        title: String(chart.title).trim(),
        xKey: String(chart.xKey).trim(),
        yKey: String(chart.yKey).trim(),
        xLabel:
          typeof chart.xLabel === 'string' && chart.xLabel.trim()
            ? chart.xLabel.trim()
            : String(chart.xKey).trim(),
        yLabel:
          typeof chart.yLabel === 'string' && chart.yLabel.trim()
            ? chart.yLabel.trim()
            : String(chart.yKey).trim(),
      };
    });

    const tutorialChapters = cleanRows(body?.tutorialChapters, (chapter, index) => {
      if (!chapter?.title || !chapter?.content) return null;
      return {
        chapterNumber: index + 1,
        title: String(chapter.title).trim(),
        content: String(chapter.content).trim(),
        keyPoints: cleanStringArray(chapter.keyPoints),
      };
    });

    const validationRules = cleanRows(body?.validationRules, (rule) => {
      if (!rule?.key || !rule?.label) return null;
      return {
        key: String(rule.key).trim(),
        label: String(rule.label).trim(),
        description: typeof rule.description === 'string' ? rule.description.trim() : '',
        implemented: Boolean(rule.implemented),
      };
    });

    const definitionPayload = {
      conceptId,
      name,
      category,
      description,
      theory,
      difficulty: body?.difficulty || 'beginner',
      duration: typeof body?.duration === 'number' ? body.duration : 30,
      objectives: cleanStringArray(body?.objectives),
      controls,
      formulas,
      charts,
      tutorialChapters,
      validationRules,
      defaultState:
        body?.defaultState && typeof body.defaultState === 'object' ? body.defaultState : {},
      createdBy: auth.user.id,
      createdByName: auth.user.name,
      creatorRole: auth.user.role,
      isPublished: body?.isPublished !== false,
    };

    const definition = await ConceptDefinition.findOneAndUpdate(
      { conceptId },
      definitionPayload,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    if (tutorialChapters.length > 0) {
      await Tutorial.findOneAndUpdate(
        { experimentId: conceptId },
        buildTutorialPayloadFromDefinition({
          conceptId,
          name,
          category,
          description,
          difficulty: definitionPayload.difficulty,
          duration: definitionPayload.duration,
          objectives: definitionPayload.objectives,
          tutorialChapters,
        }),
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    return NextResponse.json({ success: true, data: definition }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/authoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save concept definition' },
      { status: 500 }
    );
  }
}
