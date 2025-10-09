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
  `${EntryTypeCode}${AccountCode}` extends `${infer N extends number}`
    ? N
    : never;

export const TransactionCodes = AccountTypeCodes.flatMap((a) =>
  EntryTypeCodes.map((e) => a * 10 + e)
) as TransactionCode[];


/** Account & routing number at destination bank */
export interface Account {
  routing: string;
  number: string;
  type: AccountType;
}

export type Direction = "credit" | "debit";
export type Purpose = "live" | "prenote" | "remittance";