# @midlandsbank/node-nacha

# NACHA File Formatter/Parser

Parses and formats NACHA ACH standard CCD+/PPD+ bank transaction files.

This module was made from Eli Doran's cli tool [@ach/ach](https://www.npmjs.com/package/@ach/ach) 
Couldn't fork his module due to it being built in coffeescript.

# Table of Contents

- [@midlandsbank/node-nacha](#midlandsbanknode-nacha)
- [NACHA File Formatter/Parser](#nacha-file-formatterparser)
- [Table of Contents](#table-of-contents)
    - [Installation](#installation)
  - [Using the Package](#using-the-package)
    - [Nacha](#nacha)
    - [Nacha.parse()](#nachaparse)
    - [Nacha.format()](#nachaformat)
    - [NACHA Data Structure](#nacha-data-structure)

### Installation

    npm install @midlandsbank/node-nacha

## Using the Package

### Nacha
```typescript
import Nacha from '@midlandsbank/node-nacha';

// Create a new file Instance
let nacha = new Nacha({
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
  .done(); // Returns parent Nacha class


// convert the file into different formats
let nachaString = nachaFile.toString() // NACHA file Format
let nachaJSON = nachaFile.toJSON() // JS Object
```

If you want to initialize the class from a NACHA file you can do the following:
```typescript
import Nacha from '@midlandsbank/node-nacha';
import fs from 'fs';

let nachaStr = fs.readdirSync('./NACHA.txt');

// Function will throw if file is invalid
let nacha = Nacha.fromNacha(nachaStr)

nacha.ccd(/* batch options */)

let nachaStr = nacha.toString();
```
- Note: Using `Nacha.fromNacha()` might result in changes to the file since derived fields will be recalculated.
  if you want to prevent this use the `Nacha.parse()` and `Nacha.format()` functions which will not keeps all fields as is.

Reading the entry data can be tricky since the structure of the data is determined by batch's standard entry class code (SEC). 
TypeScript can infer the type of the entries by either checking the batches sec/standardEntryClass.

```typescript
import Nacha from '@midlandsbank/node-nacha';
import fs from 'fs';

let nachaStr = fs.readdirSync('./NACHA.txt');

// Function will throw if file is invalid
let nacha = Nacha.fromNacha(nachaStr)

// This will show as a union of all entry types
let entries = nacha.batches[0].entries

let ccdBatch = nacha.batches.find((batch) => batch.sec === "CCD")

if (ccdBatch) {
  // Will be correctly typed as CCDEntry[]
  let ccdEntries = ccdBatch.entries
}
```


[Back to: Table of Contents](#table-of-contents)

### Nacha.parse()
Simple function to parse a NACHA string & returns an object representation of the file. 
If the file has any issues to prevents parsing the function will throw.
[Back to: Table of Contents](#table-of-contents)
```typescript
import Nacha from '@midlandsbank/node-nacha';
import fs from 'fs';

let nachaStr = fs.readdirSync('./NACHA.txt');

try {
  let nachaData = Nacha.parse(nachaStr);
} catch (error) {
  console.log(`Unable to parse NACHA file`)
}
```

### Nacha.format()
format() is a sister function to parse(). It accepts a NACHA Data object like the one returned from
parse() and formats it into a valid NACHA file. See [here](#nacha-data-structure) for the structure of this data.

```typescript
import Nacha from '@midlandsbank/node-nacha';
import fs from 'fs';

let nachaStr = fs.readdirSync('./NACHA.txt');

let nachaData = Nacha.parse(nachaStr);

console.log(nachaData.footer.totalDebits);

let nachaStr = Nacha.format();
```

**Example NACHA File** 
NACHA.txt

```text
101 081000032 0180362811503042207A094101Some Bank              Your Company Inc       #A000001
5220Your Company Inc                    0018036281WEBTrnsNicknaMar 5 150305   1081000030000000
622081000210123456789012345670000003521RAj##23920rjf31John Doe              A10081000030000000
6220810002105654221          0000002300RAj##32b1kn1bb3Bob Dole              A10081000030000001
6220810002105654221          0000002499RAj##765kn4    Adam Something        A10081000030000002
6220810002105654221          0000001000RAj##3j43kj4   James Bond            A10081000030000003
822000000400324000840000000000000000000093200018036281                         081000030000000
5220Your Company Inc                    0018036281WEBTrnsNicknaMar 16150316   1081000030000001
6220810002105654221          0000017500RAj##8k765j4k32Luke Skywalker        A10081000030000004
822000000100081000210000000000000000000175000018036281                         081000030000001
5225Your Company Inc                    0018036281PPDTrnsNicknaMar 6 150306   1081000030000002
627101000019923698412584     0000015000RAj##765432hj  Jane Doe              A10081000030000005
822500000100101000010000000150000000000000000018036281                         081000030000002
9000003000002000000060050600106000000015000000000026820                                     
9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
```

### NACHA Data Structure

Here's the structure of the NACHA data that is used widely across the package.
```JSON
{
  "header": {
    "recordTypeCode": 1,
    "priorityCode": 1,
    "destination": "065503681",
    "origin": "065503681",
    "fileCreationDate": "120217",
    "fileCreationTime": "0910",
    "fileIdModifier": "A",
    "recordSize": 94,
    "blockingFactor": 10,
    "formatCode": 1,
    "destinationName": "HANCOCK BANK",
    "originName": "MY COMPANY USA"
  },
  "batches": [
    {
      "header": {
        "recordTypeCode": 5,
        "serviceClassCode": 220,
        "companyName": "MY COMPANY USA",
        "companyId": "9123456789",
        "standardEntryClassCode": "PPD",
        "companyEntryDescription": "PAYROLL",
        "companyEntryDescriptiveDate": "120220",
        "effectiveDate": "120220",
        "originatorStatusCode": "1",
        "originatingDFIIdentification": "06550368",
        "batchNumber": 1
      },
      "entries": [
        {
          "entry": {
            "recordTypeCode": 6,
            "transactionCode": 23,
            "routingNumber": "065503348",
            "accountNumber": "1111111",
            "amount": 0,
            "idNumber": "000001309",
            "name": "JOHN M SMITH",
            "addendaRecordIndicator": 0,
            "traceNumber": "065503680000001",
            "type": "PPD"
          },
          "addenda": []
        },
        {
          "entry": {
            "recordTypeCode": 6,
            "transactionCode": 33,
            "routingNumber": "265577585",
            "accountNumber": "11122333",
            "amount": 0,
            "idNumber": "000001309",
            "name": "JOHN M SMITH",
            "addendaRecordIndicator": 0,
            "traceNumber": "065503680000002",
            "type": "PPD"
          },
          "addenda": []
        },
      ],
      "footer": {
        "recordTypeCode": 8,
        "serviceClassCode": 220,
        "entryAndAddendaCount": 8,
        "entryHash": 137163116,
        "totalDebits": 0,
        "totalCredits": 0,
        "companyId": "9123456789",
        "reserved": "      ",
        "originatingDFIIdentification": "06550368",
        "batchNumber": 1
      }
    }
  ],
  "footer": {
    "recordTypeCode": 9,
    "batchCount": 1,
    "blockCount": 2,
    "entryAndAddendaCount": 8,
    "entryHash": 137163116,
    "totalDebits": 0,
    "totalCredits": 0,
    "reserved": "                                       "
  },
  "padding": 8
}
```

[Back to: Table of Contents](#table-of-contents)
