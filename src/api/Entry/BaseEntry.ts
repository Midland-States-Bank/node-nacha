import { EntryCtxMap } from "./index.js";
import {
  Account,
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

export type BaseEntryOpts = {
  direction: Direction;
  account: Account;
  amount: number; // dollars and cents (input); internally stored as CENTS
  name: string;
  idNumber?: string;
  traceNumber?: string;
  purpose?: Purpose;
};

// ----------------------------------------------
// Base class with common behavior & accessors
// ----------------------------------------------
export default abstract class BaseEntryWrapper<S extends SEC> {
  protected _batch: BatchWrapper<S>;

  /** SEC for this entry */
  public readonly type: S;

  public account: Account;

  /** Credit/Debit */
  public direction: Direction;

  /** amount of the transaction in dollars */
  public amount: number;

  /** determines the purpose of the entry. Non-live transactions should
   * have an amount of 0.
   */
  public purpose: Purpose;

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
      const { accountType, direction, purpose } = getTranCodeDetails(
        opts.entry.transactionCode
      );

      this.type = opts.entry.type as S;
      this.account = {
        type: accountType,
        number: opts.entry.accountNumber,
        routing: opts.entry.routingNumber,
      };
      this.amount = opts.entry.amount; // already cents
      this.direction = direction;
      this.purpose = purpose;
      this.idNumber = opts.entry.idNumber;
      this.name = opts.entry.name;
      this.traceNumber = opts.entry.traceNumber;
      return;
    }

    // Otherwise, build from friendly opts (amount provided in dollars)
    this.type = batch.sec;
    this.account = opts.account;
    this.direction = opts.direction;
    this.amount = opts.amount;
    this.purpose = opts.purpose ?? "live";
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
      routingNumber: this.account.routing,
      accountNumber: this.account.number,
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
  /** Two digit code identifying the account type & purpose at the
   * receiving financial institution */
  get transactionCode(): TransactionCode {
    return this.getTranCode(this.account.type, this.direction, this.purpose);
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
