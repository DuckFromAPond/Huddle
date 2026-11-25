/** Per-device board preferences, stored like the identity (localStorage + change event). */

export interface Preferences {
  dotBackground: boolean; // Magic UI dot pattern behind the columns
  compactCards: boolean; // tighter card padding, smaller gaps
}

export const DEFAULT_PREFERENCES: Preferences = {
  dotBackground: true,
  compactCards: false,
};

const KEY = "huddle:preferences";
const EVENT = "huddle:preferences-changed";

function store(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const v = JSON.parse(raw) as Partial<Record<keyof Preferences, unknown>>;
    // keep only known keys with the right type; anything else falls back to the default
    return {
      dotBackground:
        typeof v.dotBackground === "boolean" ? v.dotBackground : DEFAULT_PREFERENCES.dotBackground,
      compactCards:
        typeof v.compactCards === "boolean" ? v.compactCards : DEFAULT_PREFERENCES.compactCards,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

// ---------- For hooks ----------

export function getPreferencesSnapshot(): string | null {
  return store()?.getItem(KEY) ?? null;
}

export function subscribePreferences(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // other tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]): void {
  const next = { ...parsePreferences(getPreferencesSnapshot()), [key]: value };
  try {
    store()?.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage blocked: the change lasts for this page only
  }
  window.dispatchEvent(new Event(EVENT));
}
