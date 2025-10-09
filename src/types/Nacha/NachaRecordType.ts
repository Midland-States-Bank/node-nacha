import { RecordTypeCode } from "./RecordTypes.js";

export type NachaRecordType<R extends RecordTypeCode> = Record<
  string,
  string | number | undefined
> & {
  recordTypeCode: R;
};
