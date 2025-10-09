export const RecordTypes = {
  FILE_HEADER: 1,
  BATCH_HEADER: 5,
  ENTRY: 6,
  ADDENDA: 7,
  BATCH_FOOTER: 8,
  FILE_FOOTER: 9,
} as const;

export const RecordTypeCodes  = Object.values(RecordTypes);
export type RecordTypeCode = typeof RecordTypeCodes[number]