import fieldDefinitions from "../fieldDefinitions/index.js";
import { NachaData, NachaTypes } from "../types/Nacha/index.js";

/** @param data JSON representation of a NACHA file */
export default function formatNacha(data: NachaData): string {
  // Init record array
  let records: NachaTypes[] = [data.header];

  // Loop through batches, entries, and addenda
  // and add them to field array
  data.batches
    .sort((a, b) => a.header.batchNumber - b.header.batchNumber)
    .forEach((batch) => {
      records.push(batch.header);

      batch.entries.forEach(({ entry, addenda }) => {
        records.push(entry);

        (addenda ?? [])
          .sort((a, b) => a.addendaSequenceNum - b.addendaSequenceNum)
          .forEach((addenda) => records.push(addenda));
      });

      records.push(batch.footer);
    });

  records.push(data.footer);

  let padding: string[] = Array(data.padding).fill("9".repeat(94));

  // Format all records
  let fileContents = records.map(formatField);
  fileContents.push(...padding);

  // Format all fields put each record on its own line
  return fileContents.join("\n");
}

function formatField(data: NachaTypes) {
  let fieldDefs =
    data.recordTypeCode === 6
      ? fieldDefinitions[6][data.type]
      : fieldDefinitions[data.recordTypeCode];

  let charArray = [data.recordTypeCode.toString()];
  charArray.push(..." ".repeat(93).split(""));

  Object.keys(fieldDefs).forEach((key) => {
    let { position, numeric, justify } = fieldDefs[key];
    let [start, end] = position;
    let val = data[key]?.toString() ?? "";
    let length = end - start + 1;

    let justifySide = justify ?? (numeric ? "right" : "left");
    let padChar = numeric ? "0" : " ";

    val =
      justifySide === "right"
        ? val.padStart(length, padChar)
        : val.padEnd(length, padChar);

    charArray.splice(start - 1, end, ...val.split(""));
  });

  return charArray.join("");
}
