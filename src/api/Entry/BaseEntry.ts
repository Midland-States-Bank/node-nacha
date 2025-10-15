import { EntryCtxMap } from "./index.js";
import {
  AccountCode,
  AccountType,
  AccountTypeMap,
  Direction,
  EntryTypeCode,
  Purpose,
  TransactionCode,
} from "../../types/EntryHelpers.js";
import { Addenda, EntryType, SEC } from "../../types/Nacha/index.js";
import { getTranCodeDetails } from "../../utils/index.js";
import BatchWrapper from "../BatchWrapper.js";

export type AddendaOpts = {
  typeCode: Addenda["addendaTypeCode"];
  paymentRelatedInfo: Addenda["paymentRelatedInfo"];
};

type EntryBaseCommon = {
  amount: number; // dollars and cents (input); internally stored as CENTS
  name: string;
  accountNumber: string;
  routingNumber: string;
  idNumber?: string;
  traceNumber?: string;
};

// These are all field deriver from/use to derive the NACHA tran code
type TranCodeFields = {
  direction: Direction;
  accountType: AccountType;
  purpose?: Purpose; // Default to Live
  transactionCode?: never; // can't be present in this branch
};

type RawTranCode = {
  transactionCode: TransactionCode;
  direction?: never; // can't be present in this branch
  accountType?: never;
  purpose?: never;
};

export type BaseEntryOpts = EntryBaseCommon & (TranCodeFields | RawTranCode);

// ----------------------------------------------
// Base class with common behavior & accessors
// ----------------------------------------------
export default abstract class BaseEntryWrapper<S extends SEC> {
  protected _batch: BatchWrapper<S>;

  /** SEC for this entry */
  public readonly type: S;

  /** Two digit code identifying the account type & purpose at the
   * receiving financial institution */
  public transactionCode: TransactionCode;

  public accountNumber: string;

  public routingNumber: string;

  /** amount of the transaction in dollars */
  public amount: number;

  /** determines the purpose of the entry. Non-live transactions should
   * have an amount of 0.
   */
  // public purpose: Purpose;

  /** Receiver's identification number. This number may
   * be printed on the receiver's bank statement by the
   * Receiving Financial Institution */
  public idNumber?: string;

  /** Name of receiver. */
  public name: string;

  /** This number will be unique to the transaction and will help
   * identify the transaction in case of an inquiry */
  public traceNumber: string;

  constructor(batch: BatchWrapper<S>, opts: EntryCtxMap[S] | EntryType<S>) {
    this._batch = batch;

    // Construct from a raw EntryType (already in cents)
    if ("entry" in opts) {
      this.type = opts.entry.type as S;
      this.transactionCode = opts.entry.transactionCode;
      this.accountNumber = opts.entry.accountNumber;
      this.routingNumber = opts.entry.routingNumber;
      this.amount = opts.entry.amount; // already cents
      this.idNumber = opts.entry.idNumber;
      this.name = opts.entry.name;
      this.traceNumber = opts.entry.traceNumber;
      return;
    }

    let tranCode: TransactionCode;
    if (opts.accountType && opts.direction) {
      tranCode = this.getTranCode(
        opts.accountType,
        opts.direction,
        opts.purpose ?? "live"
      );
    } else {
      tranCode = opts.transactionCode!;
    }

    this.transactionCode = tranCode;
    this.type = batch.sec;
    this.accountNumber = opts.accountNumber;
    this.routingNumber = opts.routingNumber;

    this.amount = opts.amount;
    this.idNumber = opts.idNumber;
    this.name = opts.name;
    this.traceNumber = opts.traceNumber ?? this.generateTraceNum();
  }

  abstract toJSON(): EntryType<S>;
  abstract getAddendaCount(): number;

  // --------------
  // Helper methods
  // --------------
  protected getBaseEntry() {
    return {
      recordTypeCode: 6 as const,
      transactionCode: this.transactionCode,
      routingNumber: this.routingNumber,
      accountNumber: this.accountNumber,
      amount: Math.round(this.amount * 100),
      name: this.name,
      idNumber: this.idNumber,
      addendaRecordIndicator: this.getAddendaCount() > 0 ? 1 : 0,
      traceNumber: this.traceNumber,
    };
  }

  protected toAddenda(
    addenda: string | AddendaOpts,
    addendaNumber = 1
  ): Addenda {
    const { paymentRelatedInfo, typeCode } =
      typeof addenda === "string"
        ? { paymentRelatedInfo: addenda, typeCode: "05" as const }
        : addenda;

    return {
      recordTypeCode: 7,
      addendaTypeCode: typeCode,
      paymentRelatedInfo,
      addendaSequenceNum: addendaNumber,
      entryDetailSequenceNum: this.traceNumber.slice(-7),
    };
  }

  protected toAddendaArray(addenda?: (string | AddendaOpts)[]) {
    return addenda?.map((a, i) => this.toAddenda(a, i + 1)) ?? [];
  }

  protected getTranCode(
    accountType: AccountCode | AccountType,
    direction: Direction,
    purpose: Purpose
  ): TransactionCode {
    const accountCode =
      typeof accountType === "number"
        ? accountType
        : AccountTypeMap[accountType];

    let entryTypeCode: EntryTypeCode;
    const isCredit = direction === "credit";
    switch (purpose) {
      case "live":
        entryTypeCode = isCredit ? 2 : 7;
        break;
      case "prenote":
        entryTypeCode = isCredit ? 3 : 8;
        break;
      case "remittance":
        entryTypeCode = isCredit ? 4 : 9;
        break;
      default:
        entryTypeCode = 2;
    }

    return (accountCode * 10 + entryTypeCode) as TransactionCode;
  }

  protected generateTraceNum(): string {
    const originDFI = this._batch.origin.slice(0, 7);
    const seq = this._batch.entries.length + 1;
    return originDFI + String(seq).padStart(7, "0");
  }

  // -----------------
  // Common accessors
  // -----------------

  /** Credit/Debit */
  get direction(): Direction {
    let { direction } = getTranCodeDetails(this.transactionCode);
    return direction;
  }

  get purpose(): Purpose {
    let { purpose } = getTranCodeDetails(this.transactionCode);
    return purpose;
  }

  get accountType(): AccountType {
    let { accountType } = getTranCodeDetails(this.transactionCode);
    return accountType;
  }

  /** Signed amount in dollars. Credit are positives & Debits are negative. */
  get amountSigned(): number {
    return this.direction === "credit" ? this.amount : -this.amount;
  }

  get cents(): number {
    return Math.round(this.amount * 100);
  }

  set cents(val: number) {
    this.amount = val / 100;
  }

  get centsSigned(): number {
    return this.direction === "credit" ? this.cents : -this.cents;
  }
}
