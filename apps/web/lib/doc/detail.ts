import type * as Y from "yjs";

export interface TextEdit {
  start: number;
  removed: number;
  inserted: string;
}

// for emoji
const isHighSurrogate = (c: number) => c >= 0xd800 && c <= 0xdbff;
const isLowSurrogate = (c: number) => c >= 0xdc00 && c <= 0xdfff;

/** The single change that turns `prev` into `next`. Never cuts an emoji (surrogate pair) in half. */
export function diffText(prev: string, next: string): TextEdit | null {
  if (prev === next) return null;

  // shared start (walks forward until diff)
  let start = 0;
  const max = Math.min(prev.length, next.length);
  while (start < max && prev.charCodeAt(start) === next.charCodeAt(start)) {
    start++;
  }
  if (start > 0 && isHighSurrogate(prev.charCodeAt(start - 1))) {
    start--; // stopped mid-emoji: back up
  }

  // shared end (walks backward until diff so never overlapping the shared start)
  let end = 0;
  const maxEnd = max - start;
  while (
    end < maxEnd &&
    prev.charCodeAt(prev.length - 1 - end) === next.charCodeAt(next.length - 1 - end)
  ) {
    end++;
  }

  if (end > 0 && isLowSurrogate(prev.charCodeAt(prev.length - end))) {
    end--; // stopped mid-emoji: back up
  }

  return {
    start,
    removed: prev.length - start - end,
    inserted: next.slice(start, next.length - end),
  };
}

/**
 * Apply what the user typed. `base` is the text the textarea was showing when another user typed
 * (its last rendered value). If someone else's edit arrived in between, our current is shifted
 * around theirs; theirs is never reverted.
 */
export function applyTextDiff(text: Y.Text, base: string, next: string): void {
  const edit = diffText(base, next);
  if (!edit) return;

  let { start } = edit;
  const current = text.toString();

  if (current !== base) {
    const remote = diffText(base, current)!;

    if (remote.start + remote.removed <= start) {
      // their edit is before ours: shift ours
      start += remote.inserted.length - remote.removed;
    } else if (remote.start < edit.start + edit.removed) {
      return; // edits overlap (rare): drop our keystroke rather than damage theirs; the textarea re-renders with their text
    } // their edit is after ours: positions unchanged
  }

  const apply = () => {
    if (edit.removed > 0) {
      text.delete(start, edit.removed);
    }
    if (edit.inserted) text.insert(start, edit.inserted);
  };
  if (text.doc) text.doc.transact(apply);
  else apply();
}
