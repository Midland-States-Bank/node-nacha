import {
  Batch,
  BatchHeader,
  FileFooter,
  FileHeader,
  NachaData,
  SEC,
} from "../../types/Nacha";
import { EntryType } from "../../types/Nacha/Entry";
import { isBlank } from "../isBlank";
import parseLine from "./parseLine";

const RECORD_LEN = 94;
const PADDING = "9".repeat(RECORD_LEN);

export default function parseNacha(raw: string): NachaData {
  // If files are large, prefer streaming (see streaming example below).
  // Keeping split for compatibility, but avoid regex and extra allocations.
  // Handles both \n and \r\n safely:
  const lines = raw.indexOf("\r") >= 0 ? raw.split("\r\n") : raw.split("\n");

  // Remove trailing blank lines
  while (lines.length && isBlank(lines[lines.length - 1])) lines.pop();

  let fileHeader: FileHeader | undefined;
  let fileFooter: FileFooter | undefined;
  let filePadding = 0;

  let currentBatchHeader: BatchHeader | undefined;
  let currentEntries: EntryType<SEC>[] = [];
  const batches: NachaData["batches"] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const lineNum = idx + 1;

    // Fast path: possible padding
    let isNines = /^9+$/
    if (line.length === RECORD_LEN && isNines.test(line)) {
      if (line === PADDING) {
        if (!fileHeader || !fileFooter) {
          throw new Error("File Padding found before end of file");
        }
        filePadding++;
        continue;
      }
    }

    if (line.length === 0) continue; // silently skip accidental blank lines

    const recordTypeCode = Number(line[0]); // '1','5','6','7','8','9'
    switch (recordTypeCode) {
      // File Header
      case 1: { 
        if (fileHeader) throw new Error("More than one File Header found in file");
        fileHeader = parseLine(1, line) as FileHeader;
        break;
      }

      // 5 Batch Header
      case 5: { 
        if (currentBatchHeader) {
          const batchNum = currentBatchHeader.batchNumber;
          throw new Error(`Batch #${batchNum} missing footer`);
        }
        currentBatchHeader = parseLine(5, line) as BatchHeader;
        break;
      }

      // Entry Detail
      case 6: { 
        if (!currentBatchHeader) {
          throw new Error(`Entry found outside of batch at ${lineNum}`);
        }
        const sec = currentBatchHeader.standardEntryClass as SEC;
        const entry = parseLine(6, line, sec);
        
        currentEntries.push({ entry, addenda: [] });
        break;
      }

      // Addenda
      case 7: { 
        if (!currentBatchHeader) {
          throw new Error(`Addenda found outside of batch at ${lineNum}`);
        }
        const current = currentEntries[currentEntries.length - 1];
        if (!current) throw new Error("Addenda found before entry");
        current.addenda.push(parseLine(7, line));
        break;
      }

      // Batch Control/Footer
      case 8: { 
        if (!currentBatchHeader) {
          throw new Error(`Batch footer without corresponding header found at ${lineNum}`);
        }
        const footer = parseLine(8, line);
        batches.push({
          header: currentBatchHeader,
          entries: currentEntries,
          footer,
        } as Batch<SEC>);

        // Reset batch state
        currentBatchHeader = undefined;
        currentEntries = [];
        break;
      }

      // File Footer (non-padding)
      case 9: { 
        if (!fileHeader) {
          throw new Error(`File footer found before file header at ${lineNum}`);
        }
        fileFooter = parseLine(9, line) as FileFooter;
        break;
      }

      default: {
        // Invalid record type code
        const recordTypeCode = line[0];
        throw new Error(
          `Line #:${lineNum} has an invalid record type code of ${recordTypeCode}`
        );
      }
    }
  }

  if (!fileHeader) throw new Error("No file header found");
  if (!fileFooter) throw new Error("No file footer found");

  return {
    header: fileHeader,
    batches,
    footer: fileFooter,
    padding: filePadding,
  };
}
