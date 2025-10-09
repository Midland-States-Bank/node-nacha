export const SEC_CODES = ["WEB", "TEL", "PPD", "CCD", "CTX"] as const;

/** Stand Entry Class. Identifies the entries in a batch. */
export type SEC = (typeof SEC_CODES)[number];