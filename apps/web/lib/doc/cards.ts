import * as Y from "yjs";
import { nanoid } from "nanoid";
import { generateKeyBetween } from "fractional-indexing";
import { logEvent, newActivityLog, type Author } from "@/lib/doc/activity";

export const STATUSES = ["todo", "in-progress", "done"] as const;       // in other word, this is just the column (or col name)

export type Status = (typeof STATUSES)[number];

/**  expected shape of the card but not how it is stored in reality; 
 * card does not have id in its maps, but the parent's map uses the id to get the card */
export interface Card {
    id: string;
    title: string;
    description: string;
    status: Status;     
    order: string;                        // fractional index
}

// check if column is a real "status" 
function isStatus(value: unknown): value is Status {
    return STATUSES.includes(value as Status);
}

// note: Y.Map<unknown> is a mapping for one card (title, desc...) 
// Y.Map<Y.Map<unknown>> is a mapping of the every cards 
export function cardsMap(doc: Y.Doc): Y.Map<Y.Map<unknown>> {
    return doc.getMap("cards") as Y.Map<Y.Map<unknown>>;
}

/** Plain string comparison for defining order.
 * Fractional-index keys must NOT use localeCompare. */
function compareStrings(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
}

/** Same order on every user: by order key, then by card id as the tiebreak. */
function compareCards(a: Card, b: Card): number {
    return compareStrings(a.order, b.order) || compareStrings(a.id, b.id);
}


function readCard(id: string, card: Y.Map<unknown>): Card {
    const description = card.get("description");
    const status = card.get("status");
    const title = card.get("title");
    
    return {
        id,
        title: typeof title === "string" ? title : "",
        description: description instanceof Y.Text ? description.toString() : "",
        status: isStatus(status) ? status : "todo", // tolerate bad data from a peer
        order: String(card.get("order") ?? ""),
    };
}

// All cards, or one column's cards, in display order
export function getCards(doc: Y.Doc, status?: Status): Card[] {
    const cards: Card[] = [];
    cardsMap(doc).forEach((card, id) => {
        const c = readCard(id, card);

        if (!status || c.status === status) { 
            cards.push(c);
        }
    });
    return cards.sort(compareCards);
}

export function getCard(doc: Y.Doc, id: string): Card | undefined {
    const card = cardsMap(doc).get(id);
    return card ? readCard(id, card) : undefined;
}

/**
 * Order key for dropping a card at `index` in a column 
 * (index counts the cards as the user sees them, excluding the card being moved).
 */
export function orderForIndex(
    doc: Y.Doc,
    status: Status,
    index: number,
    movingId?: string,
): string {
    const column = getCards(doc, status).filter((c) => c.id !== movingId);
    const clamped = Math.max(0, Math.min(index, column.length));

    // find the card before the drop spot 
    const before = column[clamped - 1]?.order ?? null;

    // Two users can briefly hold equal keys. generateKeyBetween needs a < b,
    // so skip ahead to the first neighbour that is strictly greater.
    let after: string | null = null;
    for (const next of column.slice(clamped)) {
        if (before === null || next.order > before) {
            after = next.order;
            break;
        }
    }

    return generateKeyBetween(before, after);
}

export function createCard(
    doc: Y.Doc,
    input: { status: Status; title: string; order?: string },
    by: Author,
    event: "created" | "imported" = "created"
): string {
    const id = nanoid();
    const order = input.order ?? orderForIndex(doc, input.status, Infinity);

    // changes on yjs doc are wrapped in transaction 
    doc.transact(() => {
        const card = new Y.Map<unknown>();
        cardsMap(doc).set(id, card); // integrate first, then fill
        card.set("title", input.title);
        card.set("description", new Y.Text());
        card.set("status", input.status);
        card.set("order", order);
        card.set("activity", newActivityLog()); 
        logEvent(card, by, {type: event});
    });

    return id;
}

/** status and order change in one transaction. Returns false if the card is gone. */
export function moveCard(
    doc: Y.Doc,
    id: string,
    status: Status,
    order: string,
    by: Author
): boolean {
    const card = cardsMap(doc).get(id);
    if (!card) return false;

    const from = card.get("status");

    doc.transact(() => {
        card.set("status", status);
        card.set("order", order);
                
        if (isStatus(from) && from !== status) {
            logEvent(card, by, { type: "status", from, to: status });
        }
    });

    return true;
}

export function setTitle(doc: Y.Doc, id: string, title: string): boolean {
    const card = cardsMap(doc).get(id);
    if (!card) return false;
    card.set("title", title);
    return true;
}

/** The live Y.Text, for editor bindings and tests. */
export function getDescription(doc: Y.Doc, id: string): Y.Text | undefined {
    const text = cardsMap(doc).get(id)?.get("description");
    return text instanceof Y.Text ? text : undefined;
}

export function deleteCard(doc: Y.Doc, id: string): boolean {
    const cards = cardsMap(doc);
    if (!cards.has(id)) return false;
    cards.delete(id);
    return true;
}

/** Called once, when the user releases a card. 
 *  `columnIds` is the target column's card ids in their final order, with the dragged card already in its new slot.
 *  Using neighbours from that list (not an index into the doc) avoids the same-column bug, where the dragged card counts as its own neighbour. */ 
export function dropCard(doc: Y.Doc, cardId: string, status: Status, columnIds: string[], by: Author) {
    const index = columnIds.indexOf(cardId);
    if (index === -1) return;

    // helper for fetching the order value of a given id from the doc
    const orderOf = (id: string | undefined): string | null => {
        if (!id) return null;

        const order = cardsMap(doc).get(id)?.get("order");
        return (typeof order === "string") ? order : null;
    };

    // get the order of surrounding card
    const prev = orderOf(columnIds[index - 1]);
    const next = orderOf(columnIds[index + 1]);

    // when card is dropped back where it already was: write nothing, so a plain click can't conflict with a peer
    const card = cardsMap(doc).get(cardId);
    const current = card?.get("order");
    if (
        card?.get("status") === status &&
        typeof current === "string" &&
        (prev === null || prev < current) &&
        (next === null || current < next)
    ) {
        return;
    }

    // two peers can briefly leave equal or inverted keys, and generateKeyBetween throws on those
    const order = 
        (prev !== null && next !== null && prev >= next)
            ? generateKeyBetween(prev, null)
            : generateKeyBetween(prev, next);

    moveCard(doc, cardId, status, order, by);
}
