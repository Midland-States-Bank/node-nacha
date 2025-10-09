import { Addenda, SEC } from "../../types/Nacha";
import { EntryType } from "../../types/Nacha/Entry";
import BatchWrapper from "../BatchWrapper";
import BaseEntryWrapper, { AddendaOpts, BaseEntryOpts } from "./BaseEntry";

// -----------------------
// Constructor arg types
// -----------------------
export type PPDEntryOpts = BaseEntryOpts & {
  discretionaryData?: string;
  addenda?: string | AddendaOpts;
};
export type CCDEntryOpts = PPDEntryOpts;

export type WEBEntryOpts = Omit<PPDEntryOpts, "discretionaryData"> & {
  paymentTypeCode: "R" | "S";
};

export type TELEntryOpts = Omit<PPDEntryOpts, "addenda">; // TEL has no addenda

export type CTXEntryOpts = BaseEntryOpts & {
  discretionaryData?: string;
  addenda?: (string | AddendaOpts)[];
};

export type EntryCtxMap = {
  PPD: PPDEntryOpts;
  CCD: CCDEntryOpts;
  WEB: WEBEntryOpts;
  TEL: TELEntryOpts;
  CTX: CTXEntryOpts;
};
export type GetEntryCtx<S extends SEC> = EntryCtxMap[S];

// -----------------------
// Small shared helpers
// -----------------------
const hasEntry = <S extends SEC>(opts: unknown): opts is EntryType<S> =>
  typeof opts === "object" && !!opts && "entry" in opts;

function ensureArray<T>(val?: T | T[]): T[] {
  if (val == null) return [];
  return Array.isArray(val) ? val : [val];
}

function rawSingle<S extends SEC>(
  wrapper: BaseEntryWrapper<S>,
  type: S,
  extra: Record<string, unknown>,
  addenda?: Addenda | Addenda[]
): EntryType<S> {
  const base = (wrapper as any).getBaseEntry(); // protected on base; wrapper method is available on subclass
  const addendaArr = ensureArray(addenda);
  return {
    entry: {
      ...base,
      type,
      ...extra,
    } as EntryType<S>["entry"],
    addenda: addendaArr,
  };
}

// -------------------------------------------------
// Concrete wrappers
// -------------------------------------------------

class CCDPPDEntryWrapper<S extends "CCD" | "PPD"> extends BaseEntryWrapper<S> {
  public discretionaryData?: string;
  public addenda?: Addenda;

  constructor(batch: BatchWrapper<S>, opts: PPDEntryOpts | EntryType<S>) {
    super(batch, opts);
    if (hasEntry<S>(opts)) {
      this.discretionaryData = opts.entry.discretionaryData;
      this.addenda = opts.addenda?.[0];
    } else {
      this.discretionaryData = opts.discretionaryData;
      if (opts.addenda) this.addenda = this.toAddenda(opts.addenda);
    }
  }

  getAddendaCount(): number {
    return this.addenda ? 1 : 0;
  }

  raw(): EntryType<S> {
    return rawSingle(
      this,
      this._batch.sec,
      {
        discretionaryData: this.discretionaryData,
      },
      this.addenda
    );
  }
}

export class CCDEntryWrapper extends CCDPPDEntryWrapper<"CCD"> {}
export class PPDEntryWrapper extends CCDPPDEntryWrapper<"PPD"> {}

export class WEBEntryWrapper extends BaseEntryWrapper<"WEB"> {
  public paymentTypeCode: "R" | "S";
  public addenda?: Addenda;

  constructor(
    batch: BatchWrapper<"WEB">,
    opts: WEBEntryOpts | EntryType<"WEB">
  ) {
    super(batch, opts);
    if (hasEntry<"WEB">(opts)) {
      this.paymentTypeCode = opts.entry.paymentTypeCode;
      this.addenda = opts.addenda?.[0];
    } else {
      this.paymentTypeCode = opts.paymentTypeCode;
      if (opts.addenda) this.addenda = this.toAddenda(opts.addenda);
    }
  }

  getAddendaCount(): number {
    return this.addenda ? 1 : 0;
  }

  raw(): EntryType<"WEB"> {
    return rawSingle(
      this,
      "WEB",
      { paymentTypeCode: this.paymentTypeCode },
      this.addenda
    );
  }
}

export class TELEntryWrapper extends BaseEntryWrapper<"TEL"> {
  public discretionaryData?: string;

  constructor(
    batch: BatchWrapper<"TEL">,
    opts: TELEntryOpts | EntryType<"TEL">
  ) {
    super(batch, opts);
    this.discretionaryData = hasEntry<"TEL">(opts)
      ? opts.entry.discretionaryData
      : opts.discretionaryData;
  }

  getAddendaCount(): number {
    return 0;
  }

  raw(): EntryType<"TEL"> {
    return rawSingle(this, "TEL", {
      discretionaryData: this.discretionaryData,
    });
  }
}

export class CTXEntryWrapper extends BaseEntryWrapper<"CTX"> {
  public discretionaryData?: string;
  public addenda?: Addenda[];

  constructor(
    batch: BatchWrapper<"CTX">,
    opts: CTXEntryOpts | EntryType<"CTX">
  ) {
    super(batch, opts);
    if (hasEntry<"CTX">(opts)) {
      this.discretionaryData = opts.entry.discretionaryData;
      this.addenda = opts.addenda;
    } else {
      this.discretionaryData = opts.discretionaryData;
      this.addenda = this.toAddendaArray(opts.addenda);
    }
  }

  getAddendaCount() {
    return this.addenda?.length ?? 0;
  }

  get numberOfAddendas() {
    return this.getAddendaCount();
  }

  raw(): EntryType<"CTX"> {
    const base = this.getBaseEntry();
    return {
      entry: {
        ...base,
        type: "CTX",
        numberOfAddendas: this.numberOfAddendas,
        reserved: "  ",
        discretionaryData: this.discretionaryData,
      },
      addenda: this.addenda ?? [],
    };
  }
}

// -----------------------
// Factory
// -----------------------
const EntryClassMap = {
  PPD: PPDEntryWrapper,
  CCD: CCDEntryWrapper,
  WEB: WEBEntryWrapper,
  TEL: TELEntryWrapper,
  CTX: CTXEntryWrapper,
} as const;

type EntryWrapperMap = {
  PPD: PPDEntryWrapper;
  CCD: CCDEntryWrapper;
  WEB: WEBEntryWrapper;
  TEL: TELEntryWrapper;
  CTX: CTXEntryWrapper;
};
export type EntryOf<S extends SEC> = EntryWrapperMap[S];

export function makeEntry<S extends SEC>(
  sec: S,
  batch: BatchWrapper<S>,
  entryDetails: GetEntryCtx<S> | EntryType<S>
) {
  const EntryClass = EntryClassMap[sec] as new (
    batch: BatchWrapper<S>,
    opts: GetEntryCtx<S> | EntryType<S>
  ) => EntryOf<S>;

  return new EntryClass(batch, entryDetails);
}
