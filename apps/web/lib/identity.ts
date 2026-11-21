import type { Author } from "@/lib/doc/activity";

const KEY = "huddle:identity";
const EVENT = "huddle:identity-changed";
export const MAX_NAME_LENGTH = 32;

/** Presence colors from Sanzo Wada's dictionary. All keep white initials at 5:1 or better. */
export const IDENTITY_COLORS = [
  { name: "Antwerp Blue", hex: "#007190" },
  { name: "Blue Violet", hex: "#6450a1" },
  { name: "Diamine Green", hex: "#1a7444" },
  { name: "Brick Red", hex: "#a84222" },
  { name: "Veronia Purple", hex: "#8c4c62" },
  { name: "Dark Medici Blue", hex: "#547076" },
  { name: "Burnt Sienna", hex: "#ae5224" },
  { name: "Rosolanc Purple", hex: "#b73f74" },
] as const;

function store(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function parseIdentity(raw: string | null): Author | null {
  if (!raw) return null;
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null) return null;
    const { name, color } = v as Record<string, unknown>;
    return typeof name === "string" && typeof color === "string" ? { name, color } : null;
  } catch {
    return null;
  }
}

/** Raw string, so useSyncExternalStore compares by value. */
export function getIdentitySnapshot(): string | null {
  return store()?.getItem(KEY) ?? null;
}

export function subscribeIdentity(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // other tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setIdentity(identity: Author): void {
  const clean: Author = {
    name: identity.name.trim().slice(0, MAX_NAME_LENGTH) || "Guest",
    color: identity.color,
  };
  try {
    store()?.setItem(KEY, JSON.stringify(clean));
  } catch {
    // storage blocked: the name lasts for this page only
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/** The current identity; creates and saves a guest one on first use. Browser only. */
export function getIdentity(): Author {
  const saved = parseIdentity(getIdentitySnapshot());
  if (saved) return saved;

  const identity: Author = {
    name: `Guest ${Math.floor(1000 + Math.random() * 9000)}`,
    color: IDENTITY_COLORS[Math.floor(Math.random() * IDENTITY_COLORS.length)].hex,
  };
  setIdentity(identity);
  return identity;
}
