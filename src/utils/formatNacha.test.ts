import { describe, test, expect } from "vitest";

import fs from "fs";
import formatNacha from "./formatNacha.js";
import parseNacha from "./parse/parseNacha.js";
import path from "path";

const EXAMPLES_DIR = path.resolve("./tests/NACHA_Examples");

// Collect all .txt NACHA examples
const exampleFiles = fs
  .readdirSync(EXAMPLES_DIR)
  .filter((f) => f.toLowerCase().endsWith(".txt"));

describe("formatNacha.ts", () => {
  describe.each(exampleFiles)("%s", (fileName) => {
    test("Can format parsed NACHA file", () => {
      const nachaStringExample = fs
        .readFileSync(path.join(EXAMPLES_DIR, fileName))
        .toString()
        .replace(/\r/g, "");

      const parsedNacha = parseNacha(nachaStringExample);
      const newNachaStr = formatNacha(parsedNacha);

      let originalLines = nachaStringExample.split(/\r?\n/);
      let newLines = newNachaStr.split(/\r?\n/);

      // Ensure each line is the same
      expect(newLines).toEqual(originalLines);

      originalLines.forEach((line, idx) => {
        expect(newLines[idx]).toEqual(line);
      });
    });
  });
});
