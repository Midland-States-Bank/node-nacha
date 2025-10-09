import { NachaRecordType } from "./NachaRecordType";
import { SEC } from "./SEC";

type serviceClassCode = 200 | 220 | 225;

export interface BatchHeader extends NachaRecordType<5> {
  serviceClassCode: serviceClassCode;
  companyName: string;
  companyDiscretionaryData?: string;
  companyId: string;
  standardEntryClass: SEC;
  companyEntryDescription: string;
  companyEntryDescriptiveDate?: string;
  effectiveDate: string;
  settlementDate: string;
  originatorStatusCode: number;
  originatingDFIIdentification: string;
  batchNumber: number;
}

export interface BatchFooter extends NachaRecordType<8> {
  serviceClassCode: serviceClassCode;
  entryAndAddendaCount: number;
  entryHash: number;
  totalDebits: number;
  totalCredits: number;
  companyId: string;
  messageAuthCode?: string;
  reserved: string;
  originatingDFIIdentification: string;
  batchNumber: number;
}
