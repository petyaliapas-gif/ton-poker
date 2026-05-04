/** Tiny clsx replacement to avoid the dependency. */
export default function clsx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
