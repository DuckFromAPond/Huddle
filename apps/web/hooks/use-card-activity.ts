import { useEffect, useState } from "react";
import * as Y from "yjs";
import { getActivity, type CardEvent } from "@/lib/doc/activity";

export function useCardActivity(card?: Y.Map<unknown>) {
  const [events, setEvents] = useState<CardEvent[]>([]);

  useEffect(() => {
    const log = card?.get("activity") as Y.Array<CardEvent> | undefined;

    if (!card || !log) {
      return setEvents([]);
    }

    const update = () => setEvents(getActivity(card));
    update();

    log.observe(update);

    return () => log.unobserve(update);
  }, [card]);

  return events;
}
