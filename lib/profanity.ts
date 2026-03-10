import { Filter } from "bad-words";

let _filter: Filter | null = null;

function getFilter(): Filter {
  if (!_filter) {
    _filter = new Filter();
  }
  return _filter;
}

/**
 * Returns true if the text contains profanity.
 */
export function containsProfanity(text: string): boolean {
  if (!text?.trim()) return false;
  return getFilter().isProfane(text);
}

/**
 * Zod refinement message for profanity rejection.
 */
export const PROFANITY_MESSAGE = "Please remove inappropriate language.";
