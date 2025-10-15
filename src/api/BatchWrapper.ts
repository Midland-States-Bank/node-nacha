import { Batch, EntryType, SEC } from "../types/Nacha/index.js";
import { OneOrMany } from "../types/OneOrMany.js";
import { parseYYMMDD, sumArray, toYYMMDD } from "../utils/index.js";
import { EntryOf, EntryCtxMap, makeEntry } from "./Entry/index.js";
import Nacha from "./Nacha.js";

type Company = {
  id: string;
  name: string;
  discretionaryData?: string;
  descriptiveDate?: Date | string;
};

export type BatchCtx = {
  origin?: string;
  entryDescription: string;
  company: Company;
  effectiveDate?: Date;
  messageAuthCode?: string;
};

export type AnyBatch = { [K in SEC]: BatchWrapper<K> }[SEC];
export default class BatchWrapper<S extends SEC> {
  public readonly sec: S;
  public company: Company;
  public effectiveDate: Date;
  public entryDescription: string;
  public readonly originatorStatusCode = 1;
  public origin: string;
  public messageAuthCode?: string;

  public entries: EntryOf<S>[];

  constructor(private _parentFile: Nacha, sec: S, opts: BatchCtx | Batch<S>) {
    this.sec = sec;

    // Handle case where use gives raw data
    if ("header" in opts && "footer" in opts && "entries" in opts) {
      this.company = {
        id: opts.header.companyId,
        name: opts.header.companyName,
        discretionaryData: opts.header.companyDiscretionaryData,
        descriptiveDate: opts.header.companyEntryDescriptiveDate,
      };
      this.effectiveDate = parseYYMMDD(opts.header.effectiveDate);
      this.entryDescription = opts.header.companyEntryDescription;
      this.origin = opts.header.originatingDFIIdentification;
      this.messageAuthCode = opts.footer.messageAuthCode;

      this.entries = opts.entries.map((e) => makeEntry(sec, this, e));
      return;
    }

    // Init properties
    this.effectiveDate = opts.effectiveDate ?? this._parentFile.creationDate;
    this.company = opts.company;
    this.entryDescription = opts.entryDescription;
    this.origin = opts.origin ?? this._parentFile.origin.routing;
    this.messageAuthCode = opts.messageAuthCode;
    this.entries = [];
  }

  // ---------- Builder-ish API when constructing new ----------
  addEntry(opts: OneOrMany<EntryCtxMap[S]>): this {
    let entryOpts = Array.isArray(opts) ? opts : [opts];
    let entries = entryOpts.map((e) => makeEntry(this.sec, this, e));
    this.entries.push(...entries);
    return this;
  }

  credit(opts: OneOrMany<Omit<EntryCtxMap[S], "direction">>): this {
    return this.addEntry({ direction: "credit", ...opts } as EntryCtxMap[S]);
  }

  debit(opts: OneOrMany<Omit<EntryCtxMap[S], "direction">>): this {
    return this.addEntry({ direction: "debit", ...opts } as EntryCtxMap[S]);
  }

  /** Returns parent file */
  done() {
    return this._parentFile;
  }

  /** Alias of {@link done} */
  end = this.done;

  // Service Class Code (non-mutable)
  get serviceClassCode(): 200 | 220 | 225 {
    if (this.entries.length === 0) return 200;

    const hasDebits = this.entries.some((e) => e.direction === "debit");
    const hasCredits = this.entries.some((e) => e.direction === "credit");

    if (hasCredits && hasDebits) return 200;

    if (hasCredits) return 220;
    if (hasDebits) return 225;

    // Should never happen
    return 200;
  }

  get standardEntryClass(): S {
    return this.sec
  }

  get batchNumber() {
    return this._parentFile.batches.indexOf(this) + 1;
  }

  get entryAndAddendaCount() {
    return this.entries.reduce(
      (acc, entry) => acc + entry.getAddendaCount() + 1,
      0 // Default
    );
  }

  get entryHash() {
    let entryDFIs = this.entries
      .map((e) => e.routingNumber)
      .map((routing) => Number(routing.slice(0, 8)));

    return sumArray(entryDFIs) % (1_000_000_000 * 10);
  }

  get totalDebits() {
    let debits = this.entries
      .filter((e) => e.direction === "debit")
      .map((e) => e.cents);

    return sumArray(debits);
  }

  get totalCredits() {
    let credits = this.entries
      .filter((e) => e.direction === "credit")
      .map((e) => e.cents);

    return sumArray(credits);
  }

  toJSON(): Batch<S> {
    let { id, name, discretionaryData, descriptiveDate } = this.company;
    return {
      header: {
        recordTypeCode: 5,
        serviceClassCode: this.serviceClassCode,
        companyName: name,
        companyDiscretionaryData: discretionaryData,
        companyId: id,
        standardEntryClass: this.sec,
        companyEntryDescription: this.entryDescription,
        companyEntryDescriptiveDate:
          typeof descriptiveDate === "string"
            ? descriptiveDate
            : toYYMMDD(descriptiveDate),
        effectiveDate: toYYMMDD(this.effectiveDate),
        settlementDate: " ".repeat(3),
        originatorStatusCode: 1,
        originatingDFIIdentification: this.origin,
        batchNumber: this.batchNumber,
      },
      entries: this.entries.map((entry) => entry.toJSON()) as EntryType<S>[],
      footer: {
        recordTypeCode: 8,
        serviceClassCode: this.serviceClassCode,
        entryAndAddendaCount: this.entryAndAddendaCount,
        entryHash: this.entryHash,
        totalDebits: this.totalDebits,
        totalCredits: this.totalCredits,
        companyId: id,
        messageAuthCode: this.messageAuthCode,
        reserved: " ".repeat(6),
        originatingDFIIdentification: this.origin,
        batchNumber: this.batchNumber,
      },
    };
  }
}
