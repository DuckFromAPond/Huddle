import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/fields"
import { Input } from "@/components/ui/input"

export function InputInline() {
  return (
    <Field orientation="horizontal">
      <Input type="search" placeholder="Search..." />
      <Button>Search</Button>
    </Field>
  )
}
