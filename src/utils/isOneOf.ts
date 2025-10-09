export function isOneOf<const T extends readonly unknown[]>(
  val: unknown,
  arr: T
): val is T[number] {
  return (arr as readonly unknown[]).includes(val);
}
