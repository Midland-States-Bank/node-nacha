/** @returns true if string is blank else false */
export function isBlank(str: string): boolean {
  for (const char of str) {
    // NACHA fixed-width fields are space-padded; tabs rare but harmless to include
    if (char !== " " && char !== "\t" && char !== "\r" && char !== "\n")
      return false;
  }
  return true;
}
