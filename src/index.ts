import Nacha from "./api/Nacha.js";
import { NachaData, SEC } from "./types/Nacha/index.js";
import { default as parse } from "./utils/parse/parseNacha.js";
import { default as format } from "./utils/formatNacha.js";
import {
  AccountType,
  Direction,
  Purpose,
  TransactionCode,
  TRANSACTION_CODES,
} from "./types/EntryHelpers.js";
import { SEC_CODES } from "./types/Nacha/SEC.js";

// Export Class
export default Nacha;

// Export Helper Funcs
export { parse, format };

// Export Static Values
export { SEC_CODES, TRANSACTION_CODES };

// Export Types
export type {
  NachaData,
  TransactionCode,
  SEC,
  AccountType,
  Direction,
  Purpose,
};
