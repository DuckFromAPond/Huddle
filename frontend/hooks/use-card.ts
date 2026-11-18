"use client";
import { useEffect, useState } from "react";
import type * as Y from "yjs";
import { cardsMap, getCards, type Card } from "@/lib/doc/cards"; // adjust to your paths

// Re-reads every card whenever anything under `cards` changes, local or remote.
// The doc stays the only source of truth; React state is just a snapshot of it.
export function useCards(doc: Y.Doc): Card[] {
    const [cards, setCards] = useState<Card[]>(() => getCards(doc));

    // doc change -> observer -> refresh -> set -> re-render
    useEffect(() => {
        const map = cardsMap(doc);

        const refresh = () => setCards(getCards(doc));
        refresh(); // catches changes between the first render and subscribing

        // set observer watch the map and trigger refresh on change
        map.observeDeep(refresh);

        // clean up: unregister observer 
        return () => map.unobserveDeep(refresh);
    }, [doc]);

    return cards;
}