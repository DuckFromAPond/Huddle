import type { Author } from "@/lib/schema";
import { nanoid } from "nanoid";

// set up for listener
const KEY = "huddle:identity";
const EVENT = "huddle:identity-changed";
export const MAX_NAME_LENGTH = 32;

// used when localStorage is blocked, so one tab keeps one identity
let fallback: Author | null = null;

const HEX = /^#[0-9a-f]{6}$/i;

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

/** Peer data is untrusted: only plain #rrggbb colours reach `style`. */
export function safeColor(color: unknown): string {
  return typeof color === "string" && HEX.test(color) ? color : "#547076";
}

/** parsed JSON input and returns name and color */
export function parseIdentity(raw: string | null): Author | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const { id, name, color } = parsed as Record<string, unknown>;
    return typeof id === "string" &&
      id !== "" &&
      typeof name === "string" &&
      typeof color === "string"
      ? { id, name, color: safeColor(color) }
      : null;
  } catch {
    return null;
  }
}

/** get user detail (selected color & name) as raw string, so useSyncExternalStore compares by value in hook. */
export function getIdentitySnapshot(): string | null {
  return store()?.getItem(KEY) ?? (fallback ? JSON.stringify(fallback) : null);
}

// set up listener
export function subscribeIdentity(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // other tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setIdentity(identity: Author): void {
  // user input
  const user: Author = {
    id: identity.id || nanoid(),
    name: identity.name.trim().slice(0, MAX_NAME_LENGTH) || "Guest",
    color: identity.color,
  };

  fallback = user; // always, so a rename still works without storage

  try {
    store()?.setItem(KEY, JSON.stringify(user));
  } catch {
    // storage blocked: the name lasts for this page only
  }

  // set changed event after setting identity
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

/** The current identity; creates and saves a guest one on first use. Browser only. */
export function getIdentity(): Author {
  const saved = parseIdentity(getIdentitySnapshot());

  // get existing identity
  if (saved) {
    return saved;
  }

  // set up initial identity
  const identity: Author = {
    id: nanoid(),
    name: `Guest ${Math.floor(1000 + Math.random() * 9000)}`,
    color: IDENTITY_COLORS[Math.floor(Math.random() * IDENTITY_COLORS.length)].hex,
  };

  setIdentity(identity);
  return identity;
}
