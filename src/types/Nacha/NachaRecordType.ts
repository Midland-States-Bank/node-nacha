import { RecordTypeCode } from "./RecordTypes";

export type NachaRecordType<R extends RecordTypeCode> = Record<
  string,
  string | number | undefined
> & {
  recordTypeCode: R;
};
