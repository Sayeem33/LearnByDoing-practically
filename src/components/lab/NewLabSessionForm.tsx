'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { EXPERIMENT_TEMPLATES } from '@/lib/constants';
import {
  createInitialLabState,
  DEFAULT_NEW_LAB_CONFIG,
  ExperimentTemplateKey,
  NewLabSessionConfig,
} from '@/lib/labSessionBuilder';
import {
  ArrowLeft,
  Beaker,
  FlaskConical,
  GraduationCap,
  Sparkles,
  Zap,
} from 'lucide-react';

interface NewLabSessionFormProps {
  creatorRole: 'teacher' | 'admin';
}

const templates = Object.entries(EXPERIMENT_TEMPLATES) as Array<
  [ExperimentTemplateKey, (typeof EXPERIMENT_TEMPLATES)[ExperimentTemplateKey]]
>;

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
} as const;

function getCategoryAccent(category: 'physics' | 'chemistry') {
  return categoryAccent[category];
}

function getDefaultTitle(experimentType: ExperimentTemplateKey) {
  return `${EXPERIMENT_TEMPLATES[experimentType].name} Session`;
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

  const selectedTemplate = EXPERIMENT_TEMPLATES[selectedExperiment];
  const groupedTemplates = useMemo(
    () => ({
      physics: templates.filter(([, template]) => template.category === 'physics'),
      chemistry: templates.filter(([, template]) => template.category === 'chemistry'),
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
            description: description.trim() || selectedTemplate.description,
            category: selectedTemplate.category,
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

  const renderRangeField = (
    label: string,
    key: keyof NewLabSessionConfig,
    options: { min: number; max: number; step?: number; suffix?: string }
  ) => (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <label className="font-medium text-gray-700">{label}</label>
        <span className="font-semibold text-gray-900">
          {String(config[key])}
          {options.suffix || ''}
        </span>
      </div>
      <input
        type="range"
        min={options.min}
        max={options.max}
        step={options.step || 1}
        value={Number(config[key])}
        onChange={(event) => updateConfig(key, Number(event.target.value))}
        className="w-full h-2 cursor-pointer appearance-none rounded-lg bg-gray-200"
      />
    </div>
  );

  const renderConfigurationPanel = () => {
    switch (selectedExperiment) {
      case 'freefall':
        return renderRangeField('Initial Height', 'height', { min: 20, max: 400, suffix: ' px' });
      case 'projectilemotion':
        return (
          <div className="space-y-5">
            {renderRangeField('Launch Angle', 'angle', { min: 10, max: 80, suffix: '°' })}
            {renderRangeField('Launch Speed', 'speed', { min: 5, max: 50, suffix: ' m/s' })}
            {renderRangeField('Initial Height', 'initialHeight', {
              min: 0,
              max: 20,
              step: 0.5,
              suffix: ' m',
            })}
          </div>
        );
      case 'pendulum':
        return (
          <div className="space-y-5">
            {renderRangeField('Length', 'length', { min: 1, max: 5, step: 0.1, suffix: ' m' })}
            {renderRangeField('Mass', 'mass', { min: 1, max: 10, step: 0.5, suffix: ' kg' })}
            {renderRangeField('Initial Angle', 'initialAngle', {
              min: 5,
              max: 60,
              suffix: '°',
            })}
            {renderRangeField('Damping', 'damping', {
              min: 0,
              max: 0.1,
              step: 0.01,
            })}
          </div>
        );
      case 'collision':
        return (
          <div className="space-y-5">
            {renderRangeField('Mass A', 'massA', { min: 1, max: 10, step: 0.5, suffix: ' kg' })}
            {renderRangeField('Mass B', 'massB', { min: 1, max: 10, step: 0.5, suffix: ' kg' })}
            {renderRangeField('Velocity A', 'velocityA', {
              min: -10,
              max: 10,
              step: 0.5,
              suffix: ' m/s',
            })}
            {renderRangeField('Velocity B', 'velocityB', {
              min: -10,
              max: 10,
              step: 0.5,
              suffix: ' m/s',
            })}
            {renderRangeField('Restitution', 'restitution', {
              min: 0,
              max: 1,
              step: 0.05,
            })}
          </div>
        );
      case 'electrolysis':
        return (
          <div className="space-y-5">
            {renderRangeField('Voltage', 'voltage', { min: 1, max: 12, step: 0.5, suffix: ' V' })}
            {renderRangeField('Electrolyte Concentration', 'electrolyteConc', {
              min: 0.1,
              max: 1,
              step: 0.1,
              suffix: ' M',
            })}
          </div>
        );
      default:
        return (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            This experiment uses the template default setup. You can fine-tune it after the session is created.
          </div>
        );
    }
  };

  const renderTemplateSection = (
    category: 'physics' | 'chemistry',
    title: string,
    items: typeof groupedTemplates.physics
  ) => (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-white p-2 shadow-sm">{categoryAccent[category].icon}</div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(([experimentType, template]) => {
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
                  {template.category}
                </span>
                {isSelected ? (
                  <span className="text-xs font-semibold text-gray-900">Selected</span>
                ) : null}
              </div>
              <h3 className="font-bold text-gray-900">{template.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{template.description}</p>
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
                    placeholder={selectedTemplate.description}
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
                  <p className="text-sm text-gray-500">Set the starting conditions before the lab opens.</p>
                </div>
              </div>
              {renderConfigurationPanel()}
            </Card>

            <Card className="border border-gray-100 bg-white">
              <h2 className="mb-3 font-bold text-gray-900">Summary</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-900">Experiment:</span> {selectedTemplate.name}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Category:</span> {selectedTemplate.category}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Objectives:</span> {selectedTemplate.objectives.length} learning goals
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
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${getCategoryAccent(selectedTemplate.category as 'physics' | 'chemistry').button} disabled:cursor-not-allowed disabled:opacity-60`}
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
