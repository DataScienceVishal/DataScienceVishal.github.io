/**
 * The players' words come from gpt-5-mini, which writes dashes that the
 * site's own writing never uses. The page shows those words as written,
 * except that a dash is set as a comma, and a dash that joins two numbers
 * reads "to", so a range keeps its meaning. The ordinary hyphen is untouched,
 * and so is every comma the players wrote themselves. A line under the page's
 * introduction says so.
 */

/** Figure dash, en dash, em dash and horizontal bar: U+2012 to U+2015. */
const DASH = "[\\u2012-\\u2015]";

export function commaDashes(text: string): string {
  return (
    text
      // A range: after a digit, and before a number or a word ending in one,
      // as gpt-5-mini writes "tick4" or "tick 6". "4 to 6", "tick4 to tick6".
      .replace(new RegExp(`(\\d)\\s*${DASH}+\\s*(?=(?:[A-Za-z]+ ?)?\\d)`, "g"), "$1 to ")
      // A dash opening or closing the text is dropped.
      .replace(new RegExp(`^\\s*${DASH}+\\s*`), "")
      .replace(new RegExp(`\\s*${DASH}+\\s*$`), "")
      // Any other dash becomes a comma, unless punctuation already stands
      // beside it: then the dash just goes, so no comma is doubled and none
      // of the players' own is removed.
      .replace(new RegExp(`\\s*${DASH}+\\s*`, "g"), (dash, at: number, all: string) => {
        const after = all[at + dash.length] ?? "";
        const before = all.slice(0, at).trimEnd().slice(-1);
        if (/[,.;:!?]/.test(after)) return "";
        if (before === ",") return " ";
        return ", ";
      })
  );
}
