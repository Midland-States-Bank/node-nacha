import fs from "fs";
import path from "path";
import Nacha from "./Nacha";
import { SEC_CODES } from "../types/Nacha/SEC";
import { AccountTypeMap } from "../types/EntryHelpers";
import { getTranCodeDetails, parseYYMMDD } from "../utils";

const EXAMPLES_DIR = path.resolve("./tests/NACHA_Examples");

// Collect all .txt NACHA examples
const exampleFiles = fs
  .readdirSync(EXAMPLES_DIR)
  .filter((f) => f.toLowerCase().endsWith(".txt"));

describe("Nacha Wrapper", () => {
  // Run parsing tests for each file
  describe.each(exampleFiles)("%s", (fileName) => {
    const nachaStringExample = fs
      .readFileSync(path.join(EXAMPLES_DIR, fileName))
      .toString()
      .replace(/\r/g, "");

    test("Can parse file from string", () => {
      const nacha = Nacha.fromString(nachaStringExample);

      expect(nacha.batches.length).toBeGreaterThan(0);
      expect(nacha.raw()).toBeDefined();

      nacha.batches.forEach((batch) => {
        // Header
        expect(batch.serviceClassCode).toBeTypeOf("number");
        expect(batch.company.name).toBeTypeOf("string");
        expect(batch.company.id).toBeDefined();
        expect(batch.sec).toBeOneOf(SEC_CODES as unknown as unknown[]);
        expect(batch.entryDescription).toBeTypeOf("string");
        expect(batch.originatorStatusCode).toBe(1);
        expect(batch.origin).toBeTypeOf("string");

        // Footer
        expect(batch.entryAndAddendaCount).toBeGreaterThan(0);
        expect(batch.totalDebits).toBeGreaterThan(-1);
        expect(batch.totalCredits).toBeGreaterThan(-1);
        expect(batch.batchNumber).toBeGreaterThan(0);

        batch.entries.forEach((entry) => {
          // Note: if you using a var to check a type ensure it's const
          const { type } = entry;

          expect(entry.account.number).toBeTypeOf("string");
          expect(entry.account.type).toBeOneOf(Object.keys(AccountTypeMap));
          expect(entry.account.routing).toBeTypeOf("string");
          expect(entry.amount).toBeGreaterThan(-1);
          expect(entry.amountSigned).toBeTypeOf("number");
          expect(entry.transactionCode).toBeTypeOf("number");
          expect(entry.direction).toBeOneOf(["credit", "debit"]);
          expect(entry.purpose).toBeOneOf(["live", "remittance", "prenote"]);
          expect(entry.name).toBeTypeOf("string");
          expect(entry.traceNumber).toBeTypeOf("string");
          expect(entry.idNumber);

          if (type !== "TEL" && entry.addenda) {
            expect(entry.addenda).toBeTypeOf("object");
          }

          if (type === "WEB") {
            expect(entry.paymentTypeCode).toBeOneOf(["R", "S"]);
          }

          if (type === "CTX") {
            if (entry.addenda) expect(Array.isArray(entry.addenda)).toBe(true);
            expect(entry.numberOfAddendas).toBeGreaterThan(-1);
          }

          if (type === "TEL") {
            expect((entry as any).addenda).toBeUndefined();
          }

          if (type !== "WEB" && entry.discretionaryData) {
            expect(entry.discretionaryData).toBeTypeOf("string");
          }
        });
      });
    });

    test("Can parse & rebuild the same nacha file", () => {
      const parsed = Nacha.parse(nachaStringExample);
      const { header, batches } = parsed;

      const nacha = new Nacha({
        origin: {
          name: header.originName,
          routing: header.origin,
        },
        destination: {
          name: header.destinationName,
          routing: header.destination,
        },
        priorityCode: header.priorityCode,
        fileIdModifier: header.fileIdModifier,
        creationDate: parseYYMMDD(
          header.fileCreationDate,
          header.fileCreationTime
        ),
        referenceCode: header.referenceCode,
      });

      batches.forEach((batch) => {
        const { header: bh, footer: bf } = batch;

        const nachaBatch = nacha.addBatch(bh.standardEntryClassCode, {
          origin: bh.originatingDFIIdentification,
          entryDescription: bh.companyEntryDescription,
          company: {
            name: bh.companyName,
            id: bh.companyId,
            descriptiveDate: bh.companyEntryDescriptiveDate,
            discretionaryData: bh.companyDiscretionaryData,
          },
          effectiveDate: parseYYMMDD(bh.effectiveDate),
          messageAuthCode: bf.messageAuthCode,
        });

        batch.entries.forEach(({ entry, addenda }) => {
          const type = entry.type;
          const { purpose, direction, accountType } = getTranCodeDetails(
            entry.transactionCode
          );

          const base = {
            direction,
            account: {
              type: accountType,
              number: entry.accountNumber,
              routing: entry.routingNumber,
            },
            amount: entry.amount / 100, // Convert to dollars
            name: entry.name,
            idNumber: entry.idNumber,
            traceNumber: entry.traceNumber,
            purpose,
          };

          switch (type) {
            case "CCD":
            case "PPD": {
              const addendaOpts =
                addenda?.length > 0
                  ? {
                      typeCode: addenda[0].addendaTypeCode,
                      paymentRelatedInfo: addenda[0].paymentRelatedInfo,
                    }
                  : undefined;

              nachaBatch.addEntry({
                ...base,
                discretionaryData: entry.discretionaryData,
                addenda: addendaOpts,
              });
              break;
            }
            case "WEB": {
              const addendaOpts =
                addenda?.length > 0
                  ? {
                      typeCode: addenda[0].addendaTypeCode,
                      paymentRelatedInfo: addenda[0].paymentRelatedInfo,
                    }
                  : undefined;

              nachaBatch.addEntry({
                ...base,
                paymentTypeCode: entry.paymentTypeCode,
                addenda: addendaOpts,
              });
              break;
            }
            case "TEL": {
              nachaBatch.addEntry({
                ...base,
                discretionaryData: entry.discretionaryData,
              });
              break;
            }
            case "CTX": {
              const addendaOpts = (addenda ?? []).map((a) => ({
                typeCode: a.addendaTypeCode,
                paymentRelatedInfo: a.paymentRelatedInfo,
              }));

              nachaBatch.addEntry({
                ...base,
                discretionaryData: entry.discretionaryData,
                addenda: addendaOpts,
              });
              break;
            }
          }
        });
      });

      const newNachaStr = nacha.toString();
      const originalLines = nachaStringExample.split(/\r?\n/);
      const newLines = newNachaStr.split(/\r?\n/);

      // Ensure each line is the same
      // expect(newLines).toEqual(originalLines);
      originalLines.forEach((line, idx) => {
        expect(newLines[idx], `Line ${idx + 1}`).toEqual(line);
      });
    });
  });

  // Keep the constructor-based build test once
  test("Can build a NACHA file", () => {
    const nacha = new Nacha({
      origin: {
        name: "Example ODFI",
        routing: "123456789",
      },
      destination: {
        name: "Example ODFI",
        routing: "987654321",
      },
    })
      .ccd({
        company: {
          name: "Company ABC",
          id: "123456789",
        },
        entryDescription: "Example Entry Desc.",
      })
      .addEntry({
        direction: "credit",
        amount: 100.0,
        account: {
          type: "Checking",
          number: "1234567890",
          routing: "123456789",
        },
        name: "John Doe",
      })
      .done();

    expect(nacha.toString().length).toBeGreaterThan(0);
    expect(nacha.batches.length).toBe(1);
    expect(nacha.batches.length).toEqual(nacha.batchCount);

    const ccdBatch = nacha.batches[0];
    expect(ccdBatch.raw().entries.length).toBe(1);
    expect(ccdBatch.raw().header.companyId).toBe("123456789");
  });
});
