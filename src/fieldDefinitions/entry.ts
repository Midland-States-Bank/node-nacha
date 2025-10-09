import { TransactionCodes } from "../types/EntryHelpers";
import type { FieldDef, FieldDefs } from "../types/FieldDef";
import type {
  CCDType as CCDType,
  PPDType as PPDType,
  TELType as TELType,
  WEBType as WEBType,
  CTXType as CTXType,
} from "../types/Nacha/Entry";
import { aba } from "../validators";

type FieldDefBase = Omit<FieldDef, "position">;

const transactionCode: FieldDef = {
  // length: 2,
  numeric: true,
  position: [2, 3],
  allow: TransactionCodes,
};
const routingNumber: FieldDef = {
  // length: 9,
  position: [4, 12],
  validator: aba,
};
const accountNumber: FieldDef = {
  // length: 17,
  position: [13, 29],
};
const amount: FieldDef = {
  // length: 10,
  numeric: true,
  position: [30, 39],
};
const addendaRecordIndicator: FieldDefBase = {
  // length: 1,
  allow: [0, 1],
  numeric: true,
};

const idNumber: FieldDef = {
  // length: 15,
  position: [40, 54],
  optional: true,
};
const discretionaryData: FieldDefBase = {
  // length: 2,
  optional: true,
  // position: 8,
};
const name: FieldDefBase = {
  // length: 22,
  optional: true,
  // position: 7,
};

export const PPD: FieldDefs<PPDType> = {
  transactionCode,
  routingNumber,
  accountNumber,
  amount,
  idNumber,
  name: { position: [55, 76], ...name },
  discretionaryData: { position: [77, 78], ...discretionaryData },
  addendaRecordIndicator: { position: [79, 79], ...addendaRecordIndicator },
  traceNumber: { position: [80, 94] },
} as const;

export const CCD: FieldDefs<CCDType> = PPD;
export const TEL: FieldDefs<TELType> = PPD;

export const WEB: FieldDefs<WEBType> = {
  // recordTypeCode,
  transactionCode,
  routingNumber,
  accountNumber,
  amount,
  idNumber,
  name: { position: [55, 76], ...name },
  paymentTypeCode: {
    // length: 2,
    optional: true,
    position: [77, 78],
    allow: ["R", "S"],
  },
  addendaRecordIndicator: { position: [79, 79], ...addendaRecordIndicator },
  traceNumber: { position: [80, 94] },
} as const;

export const CTX: FieldDefs<CTXType> = {
  transactionCode,
  routingNumber,
  accountNumber,
  amount,
  idNumber,
  numberOfAddendas: {
    // length: 4,
    numeric: true,
    position: [55, 58],
  },
  name: { ...name, position: [59, 74] },
  reserved: {
    position: [75, 76],
    // length: 2,
    isBlank: true,
    trim: false,
  },
  discretionaryData: {
    position: [77, 78],
    ...discretionaryData,
  },
  addendaRecordIndicator: { position: [79, 79], ...addendaRecordIndicator },
  traceNumber: { position: [80, 94] },
};
