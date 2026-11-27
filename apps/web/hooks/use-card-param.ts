// reads and writes the URL (?card=id) through Next.js's router.
"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** The open card lives in the URL (?card=id): shareable, and Back closes it. */
export function useCardParam() {
  const router = useRouter();
  const pathname = usePathname();
  const cardId = useSearchParams().get("card");

  const openCard = useCallback(
    (id: string) => router.push(`${pathname}?card=${encodeURIComponent(id)}`, { scroll: false }),
    [router, pathname],
  );
  // replace, not back(): if someone arrived through a shared card link, Back would leave the board
  const closeCard = useCallback(
    () => router.replace(pathname, { scroll: false }),
    [router, pathname],
  );

  return { cardId, openCard, closeCard };
}
