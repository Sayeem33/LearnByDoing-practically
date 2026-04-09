'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { BookOpen, FileJson, FlaskConical, LineChart, PlusCircle, SlidersHorizontal, Sigma, Target, Trash2 } from 'lucide-react';

type Category = 'physics' | 'chemistry' | 'math';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type ControlKind = 'range' | 'number' | 'select' | 'toggle';

interface ControlRow {
  key: string;
  label: string;
  kind: ControlKind;
  unit: string;
  description: string;
  min?: number;
  max?: number;
  step?: number;
  optionsText: string;
}

interface FormulaRow {
  key: string;
  label: string;
  expression: string;
  description: string;
}

interface ChartRow {
  key: string;
  title: string;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
}

interface ChapterRow {
  title: string;
  content: string;
  keyPointsText: string;
}

interface ValidationRow {
  key: string;
  label: string;
  description: string;
  implemented: boolean;
}

interface SavedDefinition {
  _id: string;
  conceptId: string;
  name: string;
  category: Category;
  creatorRole: 'teacher' | 'admin';
  updatedAt: string;
}

const emptyControl = (): ControlRow => ({
  key: '',
  label: '',
  kind: 'range',
  unit: '',
  description: '',
  min: 0,
  max: 100,
  step: 1,
  optionsText: '',
});

const emptyFormula = (): FormulaRow => ({
  key: '',
  label: '',
  expression: '',
  description: '',
});

const emptyChart = (): ChartRow => ({
  key: '',
  title: '',
  xKey: 'time',
  yKey: '',
  xLabel: 'Time',
  yLabel: '',
});

const emptyChapter = (): ChapterRow => ({
  title: '',
  content: '',
  keyPointsText: '',
});

const emptyValidation = (): ValidationRow => ({
  key: '',
  label: '',
  description: '',
  implemented: false,
});

interface AuthoringStudioProps {
  creatorRole: 'teacher' | 'admin';
}

export default function AuthoringStudio({ creatorRole }: AuthoringStudioProps) {
  const [definitions, setDefinitions] = useState<SavedDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [conceptId, setConceptId] = useState('');
  const [category, setCategory] = useState<Category>('physics');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [duration, setDuration] = useState(30);
  const [description, setDescription] = useState('');
  const [theory, setTheory] = useState('');
  const [objectivesText, setObjectivesText] = useState('');
  const [defaultStateText, setDefaultStateText] = useState('{\n  "dataPoints": []\n}');
  const [controls, setControls] = useState<ControlRow[]>([emptyControl()]);
  const [formulas, setFormulas] = useState<FormulaRow[]>([emptyFormula()]);
  const [charts, setCharts] = useState<ChartRow[]>([emptyChart()]);
  const [chapters, setChapters] = useState<ChapterRow[]>([emptyChapter()]);
  const [validationRules, setValidationRules] = useState<ValidationRow[]>([emptyValidation()]);

  const refreshDefinitions = async () => {
    const response = await fetch('/api/authoring');
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to load saved concept definitions');
    }

    setDefinitions(result.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await refreshDefinitions();
      } catch (loadError: any) {
        setError(loadError.message || 'Failed to load authoring studio');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateRow = <T,>(
    rows: T[],
    setRows: Dispatch<SetStateAction<T[]>>,
    index: number,
    patch: Partial<T>
  ) => {
    setRows(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const removeRow = <T,>(
    rows: T[],
    setRows: Dispatch<SetStateAction<T[]>>,
    index: number,
    fallback: () => T
  ) => {
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    setRows(nextRows.length > 0 ? nextRows : [fallback()]);
  };

  const resetForm = () => {
    setName('');
    setConceptId('');
    setCategory('physics');
    setDifficulty('beginner');
    setDuration(30);
    setDescription('');
    setTheory('');
    setObjectivesText('');
    setDefaultStateText('{\n  "dataPoints": []\n}');
    setControls([emptyControl()]);
    setFormulas([emptyFormula()]);
    setCharts([emptyChart()]);
    setChapters([emptyChapter()]);
    setValidationRules([emptyValidation()]);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    let parsedDefaultState: Record<string, any> = {};

    try {
      parsedDefaultState = JSON.parse(defaultStateText || '{}');
    } catch {
      setError('Default state must be valid JSON.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/authoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          conceptId,
          category,
          difficulty,
          duration,
          description,
          theory,
          objectives: objectivesText
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          controls: controls.map((control) => ({
            key: control.key,
            label: control.label,
            kind: control.kind,
            unit: control.unit,
            description: control.description,
            min: control.kind === 'toggle' || control.kind === 'select' ? undefined : Number(control.min),
            max: control.kind === 'toggle' || control.kind === 'select' ? undefined : Number(control.max),
            step: control.kind === 'range' || control.kind === 'number' ? Number(control.step) : undefined,
            options:
              control.kind === 'select'
                ? control.optionsText
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => ({
                      label: line.split(':')[0]?.trim() || line,
                      value: line.split(':')[1]?.trim() || line,
                    }))
                : [],
          })),
          formulas,
          charts,
          tutorialChapters: chapters.map((chapter) => ({
            title: chapter.title,
            content: chapter.content,
            keyPoints: chapter.keyPointsText
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean),
          })),
          validationRules,
          defaultState: parsedDefaultState,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save concept definition');
      }

      setSuccess(`Saved "${result.data.name}" and synced its tutorial.`);
      await refreshDefinitions();
      resetForm();
    } catch (saveError: any) {
      setError(saveError.message || 'Failed to save concept definition');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Experiment Authoring Studio</h1>
            <p className="mt-2 text-gray-600">
              Create a practical concept definition, sync tutorial chapters, and make it available for labs or assignments.
            </p>
          </div>
          <Link href={creatorRole === 'admin' ? '/admin/dashboard' : '/instructor/dashboard'}>
            <Button variant="outline" size="sm">Back to Dashboard</Button>
          </Link>
        </div>

        {error ? (
          <Card className="border border-rose-200 bg-rose-50 text-rose-700">{error}</Card>
        ) : null}
        {success ? (
          <Card className="border border-emerald-200 bg-emerald-50 text-emerald-700">{success}</Card>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
          <div className="space-y-6">
            <Card className="border border-gray-100 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-blue-100 p-2">
                  <FlaskConical className="text-blue-600" size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Metadata</h2>
                  <p className="text-sm text-gray-500">Basic information students and teachers will see first.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Concept Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Concept Id</label>
                  <input value={conceptId} onChange={(e) => setConceptId(e.target.value)} placeholder="auto-generated if blank" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="math">Math</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Theory / Explanation</label>
                  <textarea value={theory} onChange={(e) => setTheory(e.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Learning Objectives</label>
                  <textarea value={objectivesText} onChange={(e) => setObjectivesText(e.target.value)} rows={4} placeholder="One objective per line" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>
            </Card>

            <Card className="border border-gray-100 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-amber-100 p-2">
                  <SlidersHorizontal className="text-amber-700" size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Controls</h2>
                  <p className="text-sm text-gray-500">Simple parameter controls for the generic module view.</p>
                </div>
              </div>

              <div className="space-y-4">
                {controls.map((control, index) => (
                  <div key={`control-${index}`} className="rounded-2xl border border-gray-200 p-4 space-y-3">
                    <div className="grid md:grid-cols-3 gap-3">
                      <input value={control.key} onChange={(e) => updateRow(controls, setControls, index, { key: e.target.value })} placeholder="Key" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                      <input value={control.label} onChange={(e) => updateRow(controls, setControls, index, { label: e.target.value })} placeholder="Label" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                      <select value={control.kind} onChange={(e) => updateRow(controls, setControls, index, { kind: e.target.value as ControlKind })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                        <option value="range">Slider</option>
                        <option value="number">Numeric Input</option>
                        <option value="select">Dropdown</option>
                        <option value="toggle">Toggle</option>
                      </select>
                    </div>
                    <div className="grid md:grid-cols-4 gap-3">
                      <input value={control.unit} onChange={(e) => updateRow(controls, setControls, index, { unit: e.target.value })} placeholder="Unit" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                      <input type="number" value={control.min ?? 0} onChange={(e) => updateRow(controls, setControls, index, { min: Number(e.target.value) })} placeholder="Min" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                      <input type="number" value={control.max ?? 0} onChange={(e) => updateRow(controls, setControls, index, { max: Number(e.target.value) })} placeholder="Max" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                      <input type="number" value={control.step ?? 1} onChange={(e) => updateRow(controls, setControls, index, { step: Number(e.target.value) })} placeholder="Step" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                    </div>
                    <textarea value={control.description} onChange={(e) => updateRow(controls, setControls, index, { description: e.target.value })} rows={2} placeholder="Short control description" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                    {control.kind === 'select' ? (
                      <textarea value={control.optionsText} onChange={(e) => updateRow(controls, setControls, index, { optionsText: e.target.value })} rows={3} placeholder={'One option per line: Label:value'} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                    ) : null}
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(controls, setControls, index, emptyControl)} leftIcon={<Trash2 size={14} />}>Remove Control</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setControls((prev) => [...prev, emptyControl()])} leftIcon={<PlusCircle size={14} />}>Add Control</Button>
              </div>
            </Card>

            <Card className="border border-gray-100 bg-white">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-violet-100 p-2">
                      <Sigma className="text-violet-600" size={18} />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Formulas</h2>
                      <p className="text-sm text-gray-500">Add the equations or relationships to explain.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {formulas.map((formula, index) => (
                      <div key={`formula-${index}`} className="rounded-2xl border border-gray-200 p-4 space-y-3">
                        <input value={formula.key} onChange={(e) => updateRow(formulas, setFormulas, index, { key: e.target.value })} placeholder="Key" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <input value={formula.label} onChange={(e) => updateRow(formulas, setFormulas, index, { label: e.target.value })} placeholder="Label" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <input value={formula.expression} onChange={(e) => updateRow(formulas, setFormulas, index, { expression: e.target.value })} placeholder="Expression" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <textarea value={formula.description} onChange={(e) => updateRow(formulas, setFormulas, index, { description: e.target.value })} rows={2} placeholder="Meaning of the formula" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(formulas, setFormulas, index, emptyFormula)} leftIcon={<Trash2 size={14} />}>Remove Formula</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setFormulas((prev) => [...prev, emptyFormula()])} leftIcon={<PlusCircle size={14} />}>Add Formula</Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-cyan-100 p-2">
                      <LineChart className="text-cyan-600" size={18} />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Chart Settings</h2>
                      <p className="text-sm text-gray-500">Define the simple charts shown in the module.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {charts.map((chart, index) => (
                      <div key={`chart-${index}`} className="rounded-2xl border border-gray-200 p-4 space-y-3">
                        <input value={chart.key} onChange={(e) => updateRow(charts, setCharts, index, { key: e.target.value })} placeholder="Key" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <input value={chart.title} onChange={(e) => updateRow(charts, setCharts, index, { title: e.target.value })} placeholder="Title" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <div className="grid grid-cols-2 gap-3">
                          <input value={chart.xKey} onChange={(e) => updateRow(charts, setCharts, index, { xKey: e.target.value })} placeholder="xKey" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                          <input value={chart.yKey} onChange={(e) => updateRow(charts, setCharts, index, { yKey: e.target.value })} placeholder="yKey" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input value={chart.xLabel} onChange={(e) => updateRow(charts, setCharts, index, { xLabel: e.target.value })} placeholder="xLabel" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                          <input value={chart.yLabel} onChange={(e) => updateRow(charts, setCharts, index, { yLabel: e.target.value })} placeholder="yLabel" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(charts, setCharts, index, emptyChart)} leftIcon={<Trash2 size={14} />}>Remove Chart</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setCharts((prev) => [...prev, emptyChart()])} leftIcon={<PlusCircle size={14} />}>Add Chart</Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-gray-100 bg-white">
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-green-100 p-2">
                      <BookOpen className="text-green-600" size={18} />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Tutorial Chapters</h2>
                      <p className="text-sm text-gray-500">These chapters are synced into the tutorial collection.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {chapters.map((chapter, index) => (
                      <div key={`chapter-${index}`} className="rounded-2xl border border-gray-200 p-4 space-y-3">
                        <input value={chapter.title} onChange={(e) => updateRow(chapters, setChapters, index, { title: e.target.value })} placeholder={`Chapter ${index + 1} title`} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <textarea value={chapter.content} onChange={(e) => updateRow(chapters, setChapters, index, { content: e.target.value })} rows={4} placeholder="Chapter content" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <textarea value={chapter.keyPointsText} onChange={(e) => updateRow(chapters, setChapters, index, { keyPointsText: e.target.value })} rows={3} placeholder="One key point per line" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(chapters, setChapters, index, emptyChapter)} leftIcon={<Trash2 size={14} />}>Remove Chapter</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setChapters((prev) => [...prev, emptyChapter()])} leftIcon={<PlusCircle size={14} />}>Add Chapter</Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-rose-100 p-2">
                      <Target className="text-rose-600" size={18} />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Validation Rules</h2>
                      <p className="text-sm text-gray-500">Simple rule list for evidence and future validation support.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {validationRules.map((rule, index) => (
                      <div key={`rule-${index}`} className="rounded-2xl border border-gray-200 p-4 space-y-3">
                        <input value={rule.key} onChange={(e) => updateRow(validationRules, setValidationRules, index, { key: e.target.value })} placeholder="Key" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <input value={rule.label} onChange={(e) => updateRow(validationRules, setValidationRules, index, { label: e.target.value })} placeholder="Label" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <textarea value={rule.description} onChange={(e) => updateRow(validationRules, setValidationRules, index, { description: e.target.value })} rows={2} placeholder="Short validation description" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <input type="checkbox" checked={rule.implemented} onChange={(e) => updateRow(validationRules, setValidationRules, index, { implemented: e.target.checked })} />
                          Implemented in current engine
                        </label>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(validationRules, setValidationRules, index, emptyValidation)} leftIcon={<Trash2 size={14} />}>Remove Rule</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setValidationRules((prev) => [...prev, emptyValidation()])} leftIcon={<PlusCircle size={14} />}>Add Rule</Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-gray-100 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-slate-100 p-2">
                  <FileJson className="text-slate-700" size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Default State</h2>
                  <p className="text-sm text-gray-500">A simple JSON object used when the module is opened in the generic lab view.</p>
                </div>
              </div>
              <textarea value={defaultStateText} onChange={(e) => setDefaultStateText(e.target.value)} rows={10} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </Card>

            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Definition'}
              </Button>
              <Button variant="outline" onClick={resetForm}>Reset Form</Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border border-gray-100 bg-white">
              <h2 className="font-bold text-gray-900 mb-4">Studio Notes</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>This studio saves a MongoDB-backed concept definition.</p>
                <p>Tutorial chapters are also synced into the existing tutorial system.</p>
                <p>Saved concepts can be assigned to students through the assignment workflow.</p>
                <p>When there is no hand-built workbench, the lab route falls back to a generic module view.</p>
              </div>
            </Card>

            <Card className="border border-gray-100 bg-white">
              <h2 className="font-bold text-gray-900 mb-4">Saved Definitions</h2>
              {loading ? (
                <p className="text-sm text-gray-500">Loading saved definitions...</p>
              ) : definitions.length === 0 ? (
                <p className="text-sm text-gray-500">No saved definitions yet.</p>
              ) : (
                <div className="space-y-3">
                  {definitions.map((definition) => (
                    <div key={definition._id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{definition.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            /lab/{definition.conceptId} • {definition.category}
                          </p>
                        </div>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          {definition.creatorRole}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Updated {new Date(definition.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
