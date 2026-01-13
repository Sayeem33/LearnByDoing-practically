import { useDataStream, DataStreamConfig } from './useDataStream';

// Simple alias with same API name useDataLogger for compatibility
export function useDataLogger(config: DataStreamConfig = {}) {
  return useDataStream(config);
}
