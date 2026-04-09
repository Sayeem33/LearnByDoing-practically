'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ParameterControlRenderer from '@/components/lab/ParameterControlRenderer';
import {
  createInitialLabState,
  DEFAULT_NEW_LAB_CONFIG,
  ExperimentTemplateKey,
  NewLabSessionConfig,
} from '@/lib/labSessionBuilder';
import {
  EXPERIMENT_DEFINITIONS,
  getExperimentDefinitionsByCategory,
} from '@/lib/experimentDefinitions';
import {
  ArrowLeft,
  Compass,
  Beaker,
  FlaskConical,
  GraduationCap,
  Sparkles,
  Zap,
} from 'lucide-react';

interface NewLabSessionFormProps {
  creatorRole: 'teacher' | 'admin';
}

const categoryAccent = {
  physics: {
    badge: 'bg-blue-100 text-blue-700',
    icon: <Zap size={18} className="text-blue-600" />,
    button: 'bg-blue-600 hover:bg-blue-700',
    border: 'hover:border-blue-200',
  },
  chemistry: {
    badge: 'bg-purple-100 text-purple-700',
    icon: <Beaker size={18} className="text-purple-600" />,
    button: 'bg-purple-600 hover:bg-purple-700',
    border: 'hover:border-purple-200',
  },
  math: {
    badge: 'bg-emerald-100 text-emerald-700',
    icon: <Compass size={18} className="text-emerald-600" />,
    button: 'bg-emerald-600 hover:bg-emerald-700',
    border: 'hover:border-emerald-200',
  },
} as const;

function getCategoryAccent(category: 'physics' | 'chemistry' | 'math') {
  return categoryAccent[category];
}

function getDefaultTitle(experimentType: ExperimentTemplateKey) {
  return `${EXPERIMENT_DEFINITIONS[experimentType].name} Session`;
}

export default function NewLabSessionForm({ creatorRole }: NewLabSessionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedExperiment, setSelectedExperiment] =
    useState<ExperimentTemplateKey>('freefall');
  const [title, setTitle] = useState(getDefaultTitle('freefall'));
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState<NewLabSessionConfig>(DEFAULT_NEW_LAB_CONFIG);
  const [error, setError] = useState('');

  const selectedDefinition = EXPERIMENT_DEFINITIONS[selectedExperiment];
  const groupedTemplates = useMemo(
    () => ({
      physics: getExperimentDefinitionsByCategory('physics'),
      chemistry: getExperimentDefinitionsByCategory('chemistry'),
      math: getExperimentDefinitionsByCategory('math'),
    }),
    []
  );

  const updateConfig = <K extends keyof NewLabSessionConfig>(
    key: K,
    value: NewLabSessionConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleExperimentChange = (experimentType: ExperimentTemplateKey) => {
    setSelectedExperiment(experimentType);
    setTitle(getDefaultTitle(experimentType));
    setDescription('');
    setConfig(DEFAULT_NEW_LAB_CONFIG);
    setError('');
  };

  const handleCreate = () => {
    setError('');

    startTransition(async () => {
      try {
        const state = createInitialLabState(selectedExperiment, config);
        const response = await fetch('/api/experiments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim() || getDefaultTitle(selectedExperiment),
            description: description.trim() || selectedDefinition.description,
            category: selectedDefinition.category,
            experimentType: selectedExperiment,
            state,
            status: 'draft',
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setError(result.error || 'Failed to create the lab session');
          return;
        }

        router.push(`/lab/${selectedExperiment}?saved=${result.data._id}`);
      } catch (createError: any) {
        setError(createError.message || 'Failed to create the lab session');
      }
    });
  };

  const renderTemplateSection = (
    category: 'physics' | 'chemistry' | 'math',
    title: string,
    items: typeof groupedTemplates.physics
  ) => (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-white p-2 shadow-sm">{categoryAccent[category].icon}</div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(([experimentType, definition]) => {
          const isSelected = selectedExperiment === experimentType;

          return (
            <button
              key={experimentType}
              type="button"
              onClick={() => handleExperimentChange(experimentType)}
              className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition-all ${
                isSelected
                  ? 'border-gray-900 ring-2 ring-gray-900/10'
                  : `border-gray-100 ${categoryAccent[category].border}`
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryAccent[category].badge}`}>
                  {definition.category}
                </span>
                {isSelected ? (
                  <span className="text-xs font-semibold text-gray-900">Selected</span>
                ) : null}
              </div>
              <h3 className="font-bold text-gray-900">{definition.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{definition.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {definition.controls.length} controls
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {definition.formulas.length} formulas
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {definition.outputMetrics.length} outputs
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Lab Session</h1>
              <p className="text-sm text-gray-500">
                Build a configured draft session for {creatorRole === 'admin' ? 'administration' : 'instruction'} and jump straight into the chosen lab.
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 md:inline-flex">
            <GraduationCap size={14} />
            {creatorRole === 'admin' ? 'Admin flow' : 'Instructor flow'}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            {renderTemplateSection('physics', 'Physics Experiments', groupedTemplates.physics)}
            {renderTemplateSection('chemistry', 'Chemistry Experiments', groupedTemplates.chemistry)}
            {renderTemplateSection('math', 'Math Concepts', groupedTemplates.math)}
          </div>

          <div className="space-y-6">
            <Card className="border border-gray-100 bg-white">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-2">
                  <FlaskConical className="text-indigo-600" size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Session Details</h2>
                  <p className="text-sm text-gray-500">Optional title and description overrides.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    placeholder={getDefaultTitle(selectedExperiment)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    placeholder={selectedDefinition.description}
                  />
                </div>
              </div>
            </Card>

            <Card className="border border-gray-100 bg-white">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-2">
                  <Sparkles className="text-amber-600" size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Initial Configuration</h2>
                  <p className="text-sm text-gray-500">Set the starting conditions from the experiment schema before the lab opens.</p>
                </div>
              </div>
              <ParameterControlRenderer
                controls={selectedDefinition.controls}
                values={config}
                defaults={DEFAULT_NEW_LAB_CONFIG}
                onChange={updateConfig}
                onResetAll={() => setConfig(DEFAULT_NEW_LAB_CONFIG)}
              />
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <h3 className="font-semibold text-gray-900">Definition Blueprint</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Key Formulas</p>
                    <ul className="mt-2 space-y-2 text-sm text-gray-700">
                      {selectedDefinition.formulas.slice(0, 3).map((formula) => (
                        <li key={formula.key}>
                          <span className="font-semibold text-gray-900">{formula.label}:</span> {formula.expression}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Output Metrics</p>
                    <ul className="mt-2 space-y-2 text-sm text-gray-700">
                      {selectedDefinition.outputMetrics.slice(0, 4).map((metric) => (
                        <li key={metric.key}>
                          <span className="font-semibold text-gray-900">{metric.label}</span>
                          {'unit' in metric && metric.unit ? ` (${metric.unit})` : ''} - {metric.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-gray-100 bg-white">
              <h2 className="mb-3 font-bold text-gray-900">Summary</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-900">Experiment:</span> {selectedDefinition.name}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Category:</span> {selectedDefinition.category}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Objectives:</span> {selectedDefinition.objectives.length} learning goals
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Validation Rules:</span> {selectedDefinition.validationRules.length} defined checks
                </p>
              </div>

              {error ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => router.push('/instructor/dashboard')}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isPending}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${getCategoryAccent(selectedDefinition.category as 'physics' | 'chemistry' | 'math').button} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isPending ? 'Creating...' : 'Create And Open Lab'}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
