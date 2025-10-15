/** 
 * @module EntryHelpers 
 * These functions & Types are abstracts away the Transaction Codes
 * that NACHA Entries use to determine if a transaction is a credit/debit,
 * if its a normal transaction (live), pre-notification (prenote), or a 
 * Zero-Dollar Remittance (remittance), and the type of the account.
 */

export const AccountTypeMap = {
  Checking: 2,
  Savings: 3,
  GL: 4,
  Loan: 5,
} as const;
export type AccountType = keyof typeof AccountTypeMap;

export const AccountTypeCodes = Object.values(AccountTypeMap);
export type AccountCode = (typeof AccountTypeMap)[keyof typeof AccountTypeMap];

export const AccountCodeMap = Object.fromEntries(
  Object.entries(AccountTypeMap).map(([k, v]) => [v, k])
) as Record<AccountCode, AccountType>;

export const EntryTypeCodes = [2, 3, 4, 6, 7, 8, 9] as const;
export type EntryTypeCode = (typeof EntryTypeCodes)[number];

export type TransactionCode =
  `${AccountCode}${EntryTypeCode}` extends `${infer N extends number}`
    ? N
    : never;

export const TRANSACTION_CODES = AccountTypeCodes.flatMap((a) =>
  EntryTypeCodes.map((e) => a * 10 + e)
) as TransactionCode[];


export type Direction = "credit" | "debit";
export type Purpose = "live" | "prenote" | "remittance";