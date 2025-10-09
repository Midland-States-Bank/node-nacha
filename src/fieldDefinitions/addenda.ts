import type { FieldDefs } from "../types/FieldDef";
import type { Addenda } from "../types/Nacha/Addenda";

export const addenda: FieldDefs<Addenda> = {
  addendaTypeCode: {
    position: [2, 3],
    allow: ["05", "98", "99"],
  },
  paymentRelatedInfo: {
    position: [4, 83],
    optional: true,
  },
  addendaSequenceNum: {
    position: [84, 87],
    numeric: true,
    validator: {
      regex: /\d{4}/,
      message: "addendaSequenceNum must be 4 digits",
    },
  },
  entryDetailSequenceNum: {
    position: [88, 94],
    numeric: true,
    validator: {
      regex: /\d{7}/,
      message: "entryDetailSequenceNum must be 7 digits",
    },
  },
} as const;
