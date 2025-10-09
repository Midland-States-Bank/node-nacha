import type { FieldDefs } from "../types/FieldDef.js";
import {
  type BatchFooter,
  type BatchHeader,
} from "../types/Nacha/Batch.js";
import { SEC_CODES } from "../types/Nacha/SEC.js";
import { dfi } from "../validators.js";

export const batchHeader: FieldDefs<BatchHeader> = {
  serviceClassCode: {
    position: [2, 4],
    numeric: true,
    allow: [200, 220, 225],
  },
  companyName: {
    position: [5, 20],
  },
  companyDiscretionaryData: {
    position: [21, 40],
    optional: true,
  },
  companyId: {
    position: [41, 50],
    trim: false,
  },
  standardEntryClass: {
    position: [51, 53],
    allow: SEC_CODES as unknown as string[],
  },
  companyEntryDescription: {
    position: [54, 63],
  },
  companyEntryDescriptiveDate: {
    position: [64, 69],
    optional: true,
  },
  effectiveDate: {
    position: [70, 75],
  },
  settlementDate: {
    position: [76, 78],
    isBlank: true,
    optional: true,
  },
  originatorStatusCode: {
    position: [79, 79],
  },
  originatingDFIIdentification: {
    position: [80, 87],
  },
  batchNumber: {
    position: [88, 94],
    numeric: true,
  },
} as const;

export const batchFooter: FieldDefs<BatchFooter> = {
  serviceClassCode: {
    position: [2, 4],
    numeric: true,
    allow: [200, 220, 225],
  },
  entryAndAddendaCount: {
    position: [5, 10],
    numeric: true,
  },
  entryHash: {
    position: [11, 20],
    numeric: true,
  },
  totalDebits: {
    position: [21, 32],
    numeric: true,
  },
  totalCredits: {
    position: [33, 44],
    numeric: true,
  },
  companyId: {
    position: [45, 54],
    trim: false,
  },
  messageAuthCode: {
    position: [55, 73],
    trim: false,
    optional: true,
  },
  reserved: {
    position: [74, 79],
    isBlank: true,
    trim: false,
  },
  originatingDFIIdentification: {
    position: [80, 87],
    validator: dfi,
  },
  batchNumber: {
    position: [88, 94],
    numeric: true,
  },
} as const;
