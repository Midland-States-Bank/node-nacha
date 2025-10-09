import { SEC } from "../types/Nacha/index.js";
import { RecordTypeCode, RecordTypes } from "../types/Nacha/RecordTypes.js";
import { addenda } from "./addenda.js";
import { batchFooter, batchHeader } from "./batch.js";
import { CCD, CTX, PPD, TEL, WEB } from "./entry.js";
import { fileHeader, fileFooter } from "./file.js";

const fieldDefinitions = {
  [RecordTypes.FILE_HEADER]: fileHeader,
  [RecordTypes.BATCH_HEADER]: batchHeader,
  [RecordTypes.ENTRY]: {
    CCD,
    PPD,
    WEB,
    TEL,
    CTX,
  },
  [RecordTypes.ADDENDA]: addenda,
  [RecordTypes.BATCH_FOOTER]: batchFooter,
  [RecordTypes.FILE_FOOTER]: fileFooter,
} as const

export default fieldDefinitions;

type NonEntries = Exclude<RecordTypeCode, 6>;
export function getNonEntryFieldDef(recordTypeCode: NonEntries) {
  return fieldDefinitions[recordTypeCode];
}

export function getEntryFieldDef<S extends SEC>(sec: S) {
  return fieldDefinitions[6][sec];
}

