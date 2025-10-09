import { getEntryFieldDef, getNonEntryFieldDef } from "../../fieldDefinitions/index.js";
import { RecordMap, SEC } from "../../types/Nacha/index.js";
import { RecordTypeCode } from "../../types/Nacha/RecordTypes.js";
import { isBlank } from "../isBlank.js";

type NonEntries = Exclude<RecordTypeCode, 6>;
type ValueOf<T> = T[keyof T];
type EntryDetailUnion = ValueOf<RecordMap[6]>;

// 1) Non-6
export default function parseLine<T extends NonEntries>(
  recordTypeCode: T,
  raw: string
): RecordMap[T];

// 2) 6 + specific SEC
export default function parseLine<S extends SEC>(
  recordTypeCode: 6,
  raw: string,
  sec: S
): RecordMap[6][S];

// 3) Implementation
export default function parseLine(
  recordTypeCode: RecordTypeCode,
  raw: string,
  sec?: SEC
): RecordMap[NonEntries] | EntryDetailUnion {
  if (raw.length !== 94) throw new Error("line must be 94 chars long");

  const fieldDefs =
    recordTypeCode === 6
      ? getEntryFieldDef(sec as SEC)
      : getNonEntryFieldDef(recordTypeCode);

  const record: any = { recordTypeCode };

  // Loop over field defs without creating extra arrays/closures
  for (const key in fieldDefs) {
    const def = fieldDefs[key];
    const [start, end] = def.position;

    // Fixed-width slice (1-based positions)
    let valStr = raw.slice(start - 1, end);

    // If optional and the raw slice is all whitespace, skip it
    if (def.optional && isBlank(valStr)) continue;

    // Trim by default but allow opt-out
    if (def.trim !== false) {
      valStr = valStr.trim();
    }

    // Numeric conversion when needed
    let value: string | number = valStr;
    if (def.numeric) {
      const num = Number(valStr);
      if (!Number.isFinite(num)) {
        throw new Error(`${String(key)} is not a valid number`);
      }
      value = num;
    }

    // Exact value constraint
    if (def.mustEqual !== undefined && def.mustEqual !== value) {
      throw new Error(
        `${String(key)} must equal ${def.mustEqual}. Found "${value}"`
      );
    }

    // Allowed set
    if (def.allow && def.allow.length > 0) {
      // Keep it simple and readable; Set conversion not worth it unless huge
      if (!def.allow.includes(value as any)) {
        const allowed = def.allow.join(", ");
        throw new Error(
          `${String(key)} must be one of: ${allowed}. Found "${value}"`
        );
      }
    }

    record[key] = value;
  }

  // If Entry then add SEC for correct type inferencing
  if (recordTypeCode === 6) record.type = sec;

  return record;
}
