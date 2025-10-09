import type { BatchHeader, BatchFooter } from "./Batch.js";
import type { EntryType, CCDType, PPDType, TELType, WEBType, CTXType, SecCodeMap } from "./Entry.js";
import type { Addenda } from "./Addenda.js";
import type { FileHeader, FileFooter } from "./File.js";
import { SEC } from "./SEC.js";
import { RecordTypes } from "./RecordTypes.js";

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
