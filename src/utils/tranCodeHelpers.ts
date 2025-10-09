import {
  AccountCode,
  AccountCodeMap,
  AccountType,
  Direction,
  EntryTypeCode,
  Purpose,
  TransactionCode,
} from "../types/EntryHelpers.js";

export function getTranCodeDetails(tranCode: TransactionCode): {
  accountType: AccountType;
  direction: Direction;
  purpose: Purpose;
} {
  const { entryTypeCode, accountTypeCode } = splitTranCode(tranCode);

  return {
    accountType: AccountCodeMap[accountTypeCode],
    // Credit codes are 2/3/4; debit are 7/8/9
    direction: entryTypeCode < 5 ? "credit" : "debit",
    purpose: getPurpose(entryTypeCode),
  };
}

export function splitTranCode(tranCode: TransactionCode) {
  const entryTypeCode = (tranCode % 10) as EntryTypeCode;
  const accountTypeCode = Math.floor(tranCode / 10) as AccountCode;
  return { entryTypeCode, accountTypeCode };
}

export function getPurpose(entryTypeCode: EntryTypeCode): Purpose {
  switch (entryTypeCode) {
    case 3:
    case 8:
      return "prenote";
    case 4:
    case 9:
      return "remittance";
    default:
      return "live";
  }
}
