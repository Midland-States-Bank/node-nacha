import { NachaRecordType } from "./NachaRecordType.js";

export interface FileHeader extends NachaRecordType<1> {
  priorityCode: number;
  destination: string;
  origin: string;
  fileCreationDate: string;
  fileCreationTime: string;
  fileIdModifier: string;
  recordSize: 94;
  blockingFactor: 10;
  formatCode: 1;
  destinationName: string;
  originName: string;
  referenceCode?: string;
}

export interface FileFooter extends NachaRecordType<9> {
  batchCount: number;
  blockCount: number;
  entryAndAddendaCount: number;
  entryHash: number;
  totalDebits: number;
  totalCredits: number;
  reserved: string;
}