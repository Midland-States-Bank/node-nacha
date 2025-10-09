/** Unused currently. Will be used to surface validation issues */
export type Issue = {
  message: string;
  level: "NACHA" | "structural";
  lineNum?: number;
  value?: string | number;
};
