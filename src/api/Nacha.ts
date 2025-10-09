import { NachaData, SEC } from "../types/Nacha/index.js";
import { parseYYMMDD, sumArray, toHHMM, toYYMMDD } from "../utils/index.js";
import BatchWrapper, { AnyBatch, BatchCtx } from "./BatchWrapper.js";
import parseNacha from "../utils/parse/parseNacha.js";
import { SEC_CODES } from "../types/Nacha/SEC.js";
import formatNacha from "../utils/formatNacha.js";

interface DFI {
  /** Name of the Financial Institution */
  name: string;
  /** Routing # of the Financial Institution */
  routing: string;
}

interface NachaCtx {
  origin: DFI;
  destination: DFI;
  priorityCode?: number;
  fileIdModifier?: string;
  creationDate?: Date;
  referenceCode?: string;
}

// Map out possible SEC code to helper method on NACHA
type SecMethodMap = {
  [K in SEC as Lowercase<K>]: (opts: BatchCtx) => BatchWrapper<K>;
};

// Add auto-generated functions to Nacha class type
export default interface Nacha extends SecMethodMap {}
export default class Nacha {
  /** The lower the number, the higher processing priority. */
  public priorityCode: number = 1;

  /** RDFI Details */
  public destination: DFI;
  /** ODFI Details */
  public origin: DFI;

  /** Date file was created */
  public creationDate: Date = new Date();

  /** Code to distinguish among multiple input files. Label the first
   * (or only) file "A", and continue in sequence (A-Z). If more than
   * one file is delivered, they must have different modifiers.  */
  public fileIdModifier = "A";

  /** Number of bytes per record. Should only be "094".  */
  public readonly recordSize = 94;

  /** How many blocks the file is made up of. Should always be 10 */
  public readonly blockingFactor = 10;

  /** Currently there is only one code. Enter 1. */
  public readonly formatCode = 1;

  /** Optional field you may use to describe input
   * file for internal accounting purposes.  */
  public referenceCode?: string;

  public batches: AnyBatch[] = [];

  constructor(opts: NachaCtx | NachaData) {
    // Init from Parsed Nacha Obj
    if ("header" in opts && "footer" in opts && "batches" in opts) {
      this.batches = opts.batches.map(
        (batch) =>
          new BatchWrapper(
            this,
            batch.header.standardEntryClass,
            batch
          ) as AnyBatch
      );

      this.priorityCode = opts.header.priorityCode;
      this.destination = {
        name: opts.header.destinationName,
        routing: opts.header.destination,
      };
      this.origin = {
        name: opts.header.originName,
        routing: opts.header.origin,
      };
      this.creationDate = parseYYMMDD(
        opts.header.fileCreationDate,
        opts.header.fileCreationTime
      );
      this.fileIdModifier = opts.header.fileIdModifier;
      this.referenceCode = opts.header.referenceCode;

      return;
    }

    let {
      priorityCode,
      destination,
      origin,
      creationDate,
      fileIdModifier,
      referenceCode,
    } = opts;
    if (priorityCode) this.priorityCode = priorityCode;
    this.destination = destination;
    this.origin = origin;
    if (creationDate) this.creationDate = creationDate;
    if (fileIdModifier) this.fileIdModifier = fileIdModifier;
    this.referenceCode = referenceCode;
  }

  // Batch Builder methods
  addBatch<S extends SEC>(sec: S, opts: BatchCtx): BatchWrapper<S> {
    const batch = new BatchWrapper(this, sec, opts);
    this.batches.push(batch as AnyBatch);
    return batch;
  }

  // Add helper methods for each SEC code
  static {
    SEC_CODES.forEach((sec) => {
      Object.defineProperty(this.prototype, sec.toLowerCase(), {
        value(this: Nacha, opts: BatchCtx) {
          return this.addBatch(sec, opts);
        },
        configurable: true,
        writable: true,
      });
    });
  }

  /** The total number of batch header records in the file.  */
  get batchCount() {
    return this.batches.length;
  }

  /**
   * The total number of physical blocks on the file,
   * including the File Header and File Control records.
   */
  get blockCount() {
    return Math.ceil(this.totalRecordCount / this.blockingFactor);
  }

  get totalRecordCount() {
    return (
      2 + // File Header & Footer
      this.entryAndAddendaCount +
      this.batchCount * 2
    ); // Each batch has footer & header
  }
  /** Total number of entry detail and addenda records on the file. */
  get entryAndAddendaCount() {
    let entryAndAddendaCounts = this.batches.map((b) => b.entryAndAddendaCount);
    return sumArray(entryAndAddendaCounts);
  }

  /**
   * Total of all entries' DFI(Routing # excluding final check digit).
   * Only use the final 10 positions in the entry.
   */
  get entryHash() {
    let entryDFIs = this.batches
      .flatMap((b) => b.entries.map((e) => e.account.routing))
      .map((routing) => Number(routing.slice(0, 8)));

    return sumArray(entryDFIs) % (100_000_000 * 10);
  }

  /** Dollar totals of debit entries within the file. */
  get totalDebits() {
    let allDebits = this.batches.map((b) => b.totalDebits);
    return sumArray(allDebits);
  }

  /** Dollar totals of credit entries within the file. */
  get totalCredits() {
    let allCredits = this.batches.map((b) => b.totalCredits);
    return sumArray(allCredits);
  }

  /**
   * Amount of file padding the file will have.
   * File padding is a line of 94 '9's.
   */
  get padding() {
    return 10 - (this.totalRecordCount % 10);
  }

  /** @returns A NACHA formatted file */
  toString(): string {
    return formatNacha(this.toJSON());
  }

  /** @returns a JSON representation of the file */
  toJSON(): NachaData {
    return {
      header: {
        recordTypeCode: 1,
        priorityCode: this.priorityCode,
        destination: this.destination.routing,
        origin: this.origin.routing,
        fileCreationDate: toYYMMDD(this.creationDate),
        fileCreationTime: toHHMM(this.creationDate),
        fileIdModifier: this.fileIdModifier,
        recordSize: this.recordSize,
        blockingFactor: this.blockingFactor,
        formatCode: this.formatCode,
        destinationName: this.destination.name,
        originName: this.origin.name,
        referenceCode: this.referenceCode,
      },
      batches: this.batches.map((b) => b.toJSON()),
      footer: {
        recordTypeCode: 9,
        batchCount: this.batchCount,
        blockCount: this.blockCount,
        entryAndAddendaCount: this.entryAndAddendaCount,
        entryHash: this.entryHash,
        totalDebits: this.totalDebits,
        totalCredits: this.totalCredits,
        reserved: " ".repeat(39),
      },
      padding: this.padding,
    };
  }

  /** Factory: parses NACHA text and return an initialized Nacha file */
  static fromNacha(raw: string): Nacha {
    let data = parseNacha(raw);
    return new Nacha(data);
  }

  /**
   * Accepts a NACHA file in the form of a string & returns an object
   * representation of the file. Any issues preventing the file from being 
   * parsed will cause the function to throw.
   */
  static parse = parseNacha;

  /** Takes a NACHA object and returns NACHA formatted file as a string */
  static format = formatNacha;
}
