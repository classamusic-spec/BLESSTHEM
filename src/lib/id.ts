/** Short, collision-resistant ids for local records. */
export function newId(prefix = ''): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 14);
  return prefix ? `${prefix}_${body}` : body;
}
