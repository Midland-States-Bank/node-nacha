import type { FieldDefs } from "../types/FieldDef.js";
import type { FileFooter, FileHeader } from "../types/Nacha/index.js";
import { aba } from "../validators.js";

export const fileHeader: FieldDefs<FileHeader> = {
  priorityCode: {
    numeric: true,
    position: [2, 3],
  },
  destination: {
    validator: aba,
    // trim: false,
    position: [4, 13],
    justify: "right",
  },
  origin: {
    validator: aba,
    // trim: false,
    position: [14, 23],
    justify: "right",
  },
  fileCreationDate: {
    position: [24, 29],
    // type: "date",
  },
  fileCreationTime: {
    position: [30, 33],
  },
  fileIdModifier: {
    position: [34, 34],
    validator: {
      regex: /[A-Z0-9]/,
      message: "fileIdModifier must be alphanumeric",
    },
  },
  recordSize: {
    position: [35, 37],
    mustEqual: 94,
    numeric: true,
  },
  blockingFactor: {
    position: [38, 39],
    mustEqual: 10,
    numeric: true,
  },
  formatCode: {
    position: [40, 40],
    mustEqual: 1,
    numeric: true,
  },
  destinationName: {
    position: [41, 63],
    optional: true,
  },
  originName: {
    position: [64, 86],
    optional: true,
  },
  referenceCode: {
    position: [87, 94],
    optional: true,
  },
} as const;

export const fileFooter: FieldDefs<FileFooter> = {
  batchCount: {
    numeric: true,
    position: [2, 7],
  },
  blockCount: {
    numeric: true,
    position: [8, 13],
  },
  entryAndAddendaCount: {
    numeric: true,
    position: [14, 21],
  },
  entryHash: {
    numeric: true,
    position: [22, 31],
  },
  totalDebits: {
    numeric: true,
    position: [32, 43],
  },
  totalCredits: {
    numeric: true,
    position: [44, 55],
  },
  reserved: {
    isBlank: true,
    trim: false,
    position: [56, 94],
  },
} as const;
