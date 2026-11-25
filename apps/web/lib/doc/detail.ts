import type * as Y from "yjs";

/**
 * Compare text: editing only the changed part (instead of replacing
 * everything) is what lets two people type in the same description and both keep
 * their words.
 */
export function applyTextDiff(text: Y.Text, next: string): void {
  const prev = text.toString();
  if (prev === next) return;

  // shared start
  let start = 0;
  const maxStart = Math.min(prev.length, next.length);
  while (start < maxStart && prev[start] === next[start]) {
    start++;
  }

  // shared end (never overlapping the shared start)
  let end = 0;
  const maxEnd = Math.min(prev.length, next.length) - start;
  while (end < maxEnd && prev[prev.length - 1 - end] === next[next.length - 1 - end]) {
    end++;
  }

  const removed = prev.length - start - end;
  const inserted = next.slice(start, next.length - end);

  const apply = () => {
    if (removed > 0) {
      text.delete(start, removed);
    }
    if (inserted) {
      text.insert(start, inserted);
    }
  };
  if (text.doc) {
    text.doc.transact(apply);
  } else {
    apply();
  }
}
