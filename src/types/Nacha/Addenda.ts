import { NachaRecordType } from "./NachaRecordType.js";

export interface Addenda extends NachaRecordType<7> {
  addendaTypeCode: "02" | "05" | "98" | "99";
  paymentRelatedInfo: string;
  addendaSequenceNum: number;
  entryDetailSequenceNum: string;
}
