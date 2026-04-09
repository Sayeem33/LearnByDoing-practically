import {
  createInitialStateFromDefinition,
  DEFAULT_EXPERIMENT_SESSION_CONFIG,
  ExperimentDefinitionId,
  ExperimentSessionConfig,
} from '@/lib/experimentDefinitions';

export type ExperimentTemplateKey = ExperimentDefinitionId;
export type NewLabSessionConfig = ExperimentSessionConfig;

export const DEFAULT_NEW_LAB_CONFIG: NewLabSessionConfig = DEFAULT_EXPERIMENT_SESSION_CONFIG;

export function createInitialLabState(
  experimentType: ExperimentTemplateKey,
  config: NewLabSessionConfig = DEFAULT_NEW_LAB_CONFIG
) {
  return createInitialStateFromDefinition(experimentType, config);
}
