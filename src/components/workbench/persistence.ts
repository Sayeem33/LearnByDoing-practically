export interface WorkbenchPersistenceProps<TSnapshot = Record<string, any>> {
  initialSnapshot?: TSnapshot | null;
  onSnapshotChange?: (snapshot: TSnapshot) => void;
}
