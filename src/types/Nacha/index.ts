import type { BatchHeader, BatchFooter } from "./Batch";
import type { EntryType, CCDType, PPDType, TELType, WEBType, CTXType, SecCodeMap } from "./Entry";
import type { Addenda } from "./Addenda";
import type { FileHeader, FileFooter } from "./File";
import { SEC } from "./SEC";
import { RecordTypes } from "./RecordTypes";

export interface NachaData {
  header: FileHeader;

  batches: Batch<SEC>[];
  footer: FileFooter;
  padding: number;
}

export type Batches = {
  [K in keyof SecCodeMap]: Batch<K>[];
};

export interface Batch<S extends SEC> {
  header: BatchHeader;
  entries: Array<EntryType<S>>;
  footer: BatchFooter;
}

export type {
  FileHeader,
  FileFooter,
  BatchHeader,
  BatchFooter,
  EntryType,
  CCDType,
  PPDType,
  TELType,
  WEBType,
  CTXType,
  SEC,
  Addenda,
};

export type RecordMap = {
  [RecordTypes.FILE_HEADER]: FileHeader;
  [RecordTypes.BATCH_HEADER]: BatchHeader;
  [RecordTypes.ENTRY]: SecCodeMap;
  [RecordTypes.ADDENDA]: Addenda;
  [RecordTypes.BATCH_FOOTER]: BatchFooter;
  [RecordTypes.FILE_FOOTER]: FileFooter;
};

export type NachaTypes =
  | FileHeader
  | FileFooter
  | BatchHeader
  | BatchFooter
  | SecCodeMap[SEC]
  | CCDType
  | PPDType
  | TELType
  | WEBType
  | CTXType
  | Addenda;
