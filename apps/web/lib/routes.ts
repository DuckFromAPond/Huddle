/** prepends projects/ for routing */
export function projectPath(id: string): string {
  return `/projects/${id}`;
}
