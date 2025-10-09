export type Issue = {
  message: string;
  level: "NACHA" | "structural"; 
  lineNum?: number;
  value?: string | number;
};