import type { Author } from "@/lib/doc/activity";

const KEY = "huddle:identity";
const COLORS = ["#82aae2", "#5dcaa5", "#f0997b", "#ed93b1", "#afa9ec", "#ef9f27"];

export function getIdentity(): Author {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved) as Author;
  } catch {}

  const identity: Author = {
    name: `Guest ${Math.floor(1000 + Math.random() * 9000)}`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
  setIdentity(identity);
  return identity;
}

export function setIdentity(identity: Author) {
  try {
    localStorage.setItem(KEY, JSON.stringify(identity));
  } catch {}
}
