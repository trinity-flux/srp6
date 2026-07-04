/**
 * Uppercases ASCII a-z only, leaving every other character untouched,
 * mirroring TrinityCore's `Utf8ToUpperOnlyLatin` (Util.h: `wcharToUpperOnlyLatin`
 * gated by `isBasicLatinCharacter`). A full-Unicode `toUpperCase()` would
 * produce verifiers incompatible with TrinityCore for non-ASCII credentials.
 */
export const toUpperOnlyLatin = (value: string): string =>
  value.replace(/[a-z]/g, (char) => char.toUpperCase());
