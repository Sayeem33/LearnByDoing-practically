'use client';

import Button from '@/components/ui/Button';
import Slider from '@/components/ui/Slider';
import {
  ExperimentControlDefinition,
  ExperimentSessionConfig,
} from '@/lib/experimentDefinitions';

interface ParameterControlRendererProps {
  controls: ExperimentControlDefinition[];
  values: ExperimentSessionConfig;
  defaults: ExperimentSessionConfig;
  onChange: <K extends keyof ExperimentSessionConfig>(
    key: K,
    value: ExperimentSessionConfig[K]
  ) => void;
  onResetAll?: () => void;
}

export default function ParameterControlRenderer({
  controls,
  values,
  defaults,
  onChange,
  onResetAll,
}: ParameterControlRendererProps) {
  if (!controls.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        This experiment uses the definition default setup. You can fine-tune it after the session is created.
      </div>
    );
  }

  const renderResetButton = (key: keyof ExperimentSessionConfig) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => onChange(key, defaults[key])}
      disabled={values[key] === defaults[key]}
    >
      Reset
    </Button>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onResetAll}>
          Reset All
        </Button>
      </div>

      {controls.map((control) => {
        const currentValue = values[control.key];

        return (
          <div key={String(control.key)} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-900">{control.label}</label>
                {control.description ? (
                  <p className="mt-1 text-xs text-gray-500">{control.description}</p>
                ) : null}
              </div>
              {renderResetButton(control.key)}
            </div>

            {control.kind === 'range' ? (
              <div className="space-y-3">
                <Slider
                  value={Number(currentValue)}
                  min={control.min}
                  max={control.max}
                  step={control.step || 1}
                  unit={control.unit ? ` ${control.unit}` : ''}
                  onChange={(event) =>
                    onChange(control.key, Number(event.target.value) as ExperimentSessionConfig[typeof control.key])
                  }
                />
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={control.min}
                    max={control.max}
                    step={control.step || 1}
                    value={Number(currentValue)}
                    onChange={(event) =>
                      onChange(control.key, Number(event.target.value) as ExperimentSessionConfig[typeof control.key])
                    }
                    className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  {control.unit ? <span className="text-sm text-gray-500">{control.unit}</span> : null}
                </div>
              </div>
            ) : null}

            {control.kind === 'number' ? (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={control.min}
                  max={control.max}
                  step={control.step || 1}
                  value={Number(currentValue)}
                  onChange={(event) =>
                    onChange(control.key, Number(event.target.value) as ExperimentSessionConfig[typeof control.key])
                  }
                  className="w-40 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                {control.unit ? <span className="text-sm text-gray-500">{control.unit}</span> : null}
              </div>
            ) : null}

            {control.kind === 'select' ? (
              <select
                value={String(currentValue)}
                onChange={(event) =>
                  onChange(control.key, event.target.value as ExperimentSessionConfig[typeof control.key])
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                {control.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}

            {control.kind === 'toggle' ? (
              <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                <span className="text-sm text-gray-700">
                  {Boolean(currentValue) ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(currentValue)}
                  onClick={() =>
                    onChange(control.key, (!currentValue) as ExperimentSessionConfig[typeof control.key])
                  }
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                    Boolean(currentValue) ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      Boolean(currentValue) ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
