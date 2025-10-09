import { AccountType, TransactionCode } from "../EntryHelpers";
import { Addenda } from "./Addenda";
import { NachaRecordType } from "./NachaRecordType";
import { SEC } from "./SEC";

export type EntryType<S extends SEC> = {
  entry: SecCodeMap[S];
  addenda: Addenda[];
};

export type EntryTypes = SecCodeMap[SEC];

export type SecCodeMap = {
  CCD: CCDType;
  PPD: PPDType;
  WEB: WEBType;
  TEL: TELType;
  CTX: CTXType;
};

export interface PPDCCDType<S extends "PPD" | "CCD"> extends EntryBase<S> {
  discretionaryData?: string;
}

export type PPDType = PPDCCDType<"PPD">;
export type CCDType = PPDCCDType<"CCD">;

export interface TELType extends EntryBase<"TEL"> {
  discretionaryData?: string;
}

export interface WEBType extends EntryBase<"WEB"> {
  name: string;
  paymentTypeCode: "R" | "S";
}

export interface CTXType extends EntryBase<"CTX"> {
  numberOfAddendas: number;
  reserved: string;
  discretionaryData?: string;
}

interface EntryBase<S extends SEC> extends NachaRecordType<6> {
  type: S;
  transactionCode: TransactionCode;
  routingNumber: string;
  accountNumber: string;
  amount: number;

  name: string;
  idNumber?: string;

  addendaRecordIndicator: number;
  traceNumber: string;
}
