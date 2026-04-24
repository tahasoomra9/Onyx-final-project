const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const readFromStorage = <T>(key: string, fallback: T): T => {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeToStorage = <T>(key: string, value: T): void => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write errors (e.g. quota exceeded, private mode restrictions).
  }
};