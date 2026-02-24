export const loadSliceState = <T = unknown>(key: string): T | undefined => {
  try {
    const serialized = localStorage.getItem(key);
    return serialized ? (JSON.parse(serialized) as T) : undefined;
  } catch (err) {
    console.error(`Failed to load ${key} from localStorage`, err);
    return undefined;
  }
};

export const saveSliceState = (key: string, sliceState: unknown): void => {
  try {
    const serialized = JSON.stringify(sliceState);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage`, err);
  }
};
