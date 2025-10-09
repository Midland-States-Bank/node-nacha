import fs from "fs";
import parseNacha from "./parseNacha.js";
import { SEC_CODES } from "../../types/Nacha/SEC.js";

const nachaStringExample = fs
  .readFileSync(`./tests/NACHA_Examples/WEB.txt`)
  .toString()
  .replace(/\r/g, "");

describe("parseNacha.ts", () => {
  test("Can correctly parse NACHA file", () => {
    let data = parseNacha(nachaStringExample);

    expect(data).toHaveProperty("header");
    expect(data).toHaveProperty("footer");
    expect(data).toHaveProperty("batches");

    let { header, footer, batches } = data;

    // Header Validation
    expect(header).toEqual({
      recordTypeCode: 1,
      priorityCode: 1,
      destination: "081204540",
      origin: "071904779",
      fileCreationDate: "240507",
      fileCreationTime: "1642",
      fileIdModifier: "A",
      recordSize: 94,
      blockingFactor: 10,
      formatCode: 1,
      destinationName: "ImmDestName",
      originName: "ImmOriginName",
      referenceCode: undefined,
    });

    // Footer Validation
    expect(footer).toEqual({
      recordTypeCode: 9,
      batchCount: 5,
      blockCount: 19,
      entryAndAddendaCount: 173,
      entryHash: 202441149,
      totalDebits: 9633588,
      totalCredits: 130764,
      reserved: " ".repeat(39),
    });

    Object.values(batches).forEach((batch) => {
      let { footer, header, entries } = batch;

      expect(header).toBeDefined();
      expect(footer).toBeDefined();

      // Should never happen but needed for compiler
      if (!header || !footer) {
        throw new Error("Missing header or footer");
      }

      // Ensure all required properties are defined
      expect(header.recordTypeCode).toBe(5);
      expect([200, 220, 225]).toContain(header.serviceClassCode);
      expect(header.companyName).toBeDefined();
      expect(header.companyId).toBeDefined();
      expect(SEC_CODES).toContain(header.standardEntryClass);
      expect(header.companyEntryDescription).toBeDefined();
      expect(header.effectiveDate).toBeDefined();
      expect(header.originatingDFIIdentification).toBeDefined();
      expect(header.originatorStatusCode).toBeDefined();
      expect(header.originatingDFIIdentification).toBeDefined();
      expect(header.batchNumber).toBeDefined();

      // Footer
      expect(footer.recordTypeCode).toBe(8);
      expect([200, 220, 225]).toContain(footer.serviceClassCode);
      expect(footer.entryAndAddendaCount).toBeDefined();
      expect(footer.entryHash).toBeDefined();
      expect(footer.totalDebits).toBeDefined();
      expect(footer.totalCredits).toBeDefined();
      expect(footer.companyId).toBeDefined();
      expect(footer.messageAuthCode).toBeUndefined();
      expect(footer.reserved.length).toBe(6);
      expect(footer.batchNum).toBeDefined;

      // Entries
      expect(entries.length).toBeGreaterThan(0);
      entries.forEach(({ entry }) => {
        expect(entry.recordTypeCode).toBe(6);
        expect(entry.transactionCode).toBeDefined();
        expect(entry.accountNumber).toBeDefined();
        expect(entry.amount).toBeDefined();
        expect(entry.name).toBeDefined();
        expect(entry.idNumber).toBeDefined();
        expect(entry.routingNumber).toBeDefined();
        expect(entry.addendaRecordIndicator).toBeDefined();
        expect(entry.traceNumber).toBeDefined();
      });
    });
  });

  test("Throw if NACHA is invalid", () => {
    const lines = nachaStringExample.split(/\r?\n/);

    let missingHeader = lines.slice(1).join("\n");
    expect(() => parseNacha(missingHeader)).toThrow();

    let missingFooter = lines
      .filter((line) => !line.startsWith("9") && line !== "9".repeat(94))
      .join("\n");
    expect(() => parseNacha(missingFooter)).toThrow();
  });
});
