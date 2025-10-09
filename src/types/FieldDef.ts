import type { Issue } from "./Issue";
import { NachaRecordType } from "./Nacha/NachaRecordType";
import { RecordTypeCode } from "./Nacha/RecordTypes";

export type FieldDef = {
  position: [number, number];
  validator?:
    | ((val: string | number) => Issue[])
    | {
        regex: RegExp;
        message: string;
      };
  numeric?: boolean;
  justify?: "left" | "right";
  optional?: boolean;
  trim?: boolean;
  allow?: Array<string | number>;
  mustEqual?: string | number;
  isBlank?: boolean;
};

export type FieldDefs<T extends NachaRecordType<RecordTypeCode>> = Record<
  keyof Required<T>,
  FieldDef
>;
