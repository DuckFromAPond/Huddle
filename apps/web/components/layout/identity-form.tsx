// components/layout/identity-form.tsx
"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { Author } from "@/lib/doc/schema";
import { IDENTITY_COLORS, MAX_NAME_LENGTH, setIdentity } from "@/lib/identity";

/** Name + color fields. Used in the avatar popover and on the Settings page. */
export function IdentityForm({ identity }: { identity: Author }) {
  const nameId = useId();

  function commitName(value: string) {
    if (value.trim() && value.trim() !== identity.name) setIdentity({ ...identity, name: value });
  }

  return (
    <div className="grid gap-4">
      <form
        className="grid gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          commitName(new FormData(e.currentTarget).get("name") as string);
        }}
      >
        <label htmlFor={nameId} className="text-sm font-medium">
          Your name
        </label>
        <Input
          key={identity.name}
          id={nameId}
          name="name"
          defaultValue={identity.name}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="nickname"
          required
          onBlur={(e) => commitName(e.currentTarget.value)}
        />
      </form>

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Your color</legend>
        <div className="flex flex-wrap gap-2">
          {IDENTITY_COLORS.map((c) => (
            <label key={c.hex} className="relative cursor-pointer">
              <input
                type="radio"
                name="identity-color"
                value={c.hex}
                checked={identity.color === c.hex}
                onChange={() => setIdentity({ ...identity, color: c.hex })}
                className="peer sr-only"
              />
              <span className="sr-only">{c.name}</span>
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-full ring-offset-2 ring-offset-popover peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                style={{ backgroundColor: c.hex }}
              >
                <Check
                  className={cn("size-3.5 text-white", identity.color !== c.hex && "invisible")}
                />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
