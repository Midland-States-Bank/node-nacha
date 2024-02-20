# NACHA File Formatter/Parser
<!-- [![Build Status](https://travis-ci.org/elidoran/node-ach.svg?branch=master)](https://travis-ci.org/elidoran/node-ach) -->
<!-- [![Dependency Status](https://gemnasium.com/badges/github.com/elidoran/node-ach.svg)](https://gemnasium.com/github.com/elidoran/node-ach) -->
<!-- [![npm version](https://badge.fury.io/js/%40ach%2Fach.svg)](https://badge.fury.io/js/%40ach%2Fach) -->

Parses and formats NACHA ACH standard CCD+/PPD+ bank transaction files.

# Table of Contents

1. [Installation](#Installation)
2. [Using the Package](#using-the-package)
    1. [create()](#create)
    2. [from()](#from)

### Installation

    npm install PLACEHOLDER TODO: Publish Package



## Using the Package

`ach` has three main functions to start with

1. create() - used to generate an ACH file object
2. from() - used to create a new file from a different format like a NACHA file or JSON

[Back to: Table of Contents](#table-of-contents)


### create()

```javascript
ach = require('PLACEHOLDER')

// Create a new file Instance
const achFile = ach.create({
  from: {
    name: 'Your Company',
    fein: '123456789'
  },
  for: {
    name: 'Our Bank',
    routing: '123456789'
  },
  ccd: {
    effectiveDate: '991231',
    description: 'Payment',
    note: 'the "discretionary data"',
    date: 'Mar 30'
  },
  credit: [
    {
      name: 'Target Company',
      account: {
        num: '135792468',
        type: 'C'
      },
      routing: '987654321',
      amount: 12345,
      addenda: 'some addenda 80 chars long'
    },
    {
      name: 'Another Company',
      account: {
        num: '159260',
        type: 'C'
      },
      routing: '987654321',
      amount: 13579
    }
  ],
  debit: {
    name: 'Your Company',
    account: {
      num: '135792468',
      type: 'C'
    },
    routing: '987654321',
    amount: 25924,
    addenda: 'some addenda 80 chars long'
  }
});

// To access the nacha object use the data property
console.log(achFile.data)
```

[Back to: Table of Contents](#table-of-contents)

### from()

Valid arguments:

1. a string representing the file in a raw NACHA file or a JSON representation
2. an object with format and source (See more below)
  * format - the name of the input format. currently only 'ach' and 'json' are available
  * source - the input source may be:
      * string - string content must be in a format compatible with a known parser
      * object - an ACH object to send into the pipeline

[Back to: Table of Contents](#table-of-contents)

### from() Examples

**Example NACHA File** \
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

```javascript
const ach = require('PLACEHOLDER');
const fs = require('fs')

const nachaString = fs.readFileSync(`./NACHA.txt`).toString()

let nachaFile = ach.from(achString)

let nachaJSON = JSON.stringify(nachaFile.data)
console.log(nachaFile)
/* Output
      {
        "file": {
          "recordType": "1",
          "priority": 1,
          "destination": " 081000032",
          "origin": " 018036281",
          "creationDate": "150304",
          "creationTime": "2207",
          "idModifier": "A",
          "recordSize": "094",
          "blockingFactor": "10",
          "formatCode": "1",
          "destinationName": "Some Bank",
          "originName": "Your Company Inc",
          "referenceCode": "#A000001",
          "footer": {
            "recordType": "9",
            "batchCount": 3,
            "blockCount": 2,
            "entryAndAddendaCount": 6,
            "entryHash": 50600106,
            "totalDebit": 15000,
            "totalCredit": 26820,
            "reserved": ""
          }
        },
        "batches": [
          {
            "entries": [
              {
                "recordType": "6",
                "transactionCode": "22",
                "receivingDFIIdentification": 8100021,
                "checkDigit": 0,
                "dfiAccount": "12345678901234567",
                "amount": 3521,
                "identificationNumber": "RAj##23920rjf31",
                "receivingCompanyName": "John Doe",
                "paymentTypeCode": "A1",
                "addendaIndicator": "0",
                "traceNumber": 81000030000000
              },
              {
                "recordType": "6",
                "transactionCode": "22",
                "receivingDFIIdentification": 8100021,
                "checkDigit": 0,
                "dfiAccount": "5654221",
                "amount": 2300,
                "identificationNumber": "RAj##32b1kn1bb3",
                "receivingCompanyName": "Bob Dole",
                "paymentTypeCode": "A1",
                "addendaIndicator": "0",
                "traceNumber": 81000030000001
              },
              {
                "recordType": "6",
                "transactionCode": "22",
                "receivingDFIIdentification": 8100021,
                "checkDigit": 0,
                "dfiAccount": "5654221",
                "amount": 2499,
                "identificationNumber": "RAj##765kn4",
                "receivingCompanyName": "Adam Something",
                "paymentTypeCode": "A1",
                "addendaIndicator": "0",
                "traceNumber": 81000030000002
              },
              {
                "recordType": "6",
                "transactionCode": "22",
                "receivingDFIIdentification": 8100021,
                "checkDigit": 0,
                "dfiAccount": "5654221",
                "amount": 1000,
                "identificationNumber": "RAj##3j43kj4",
                "receivingCompanyName": "James Bond",
                "paymentTypeCode": "A1",
                "addendaIndicator": "0",
                "traceNumber": 81000030000003
              }
            ],
            "recordType": "5",
            "serviceClassCode": 220,
            "companyName": "Your Company Inc",
            "discretionaryData": "",
            "companyId": "0018036281",
            "entryClassCode": "WEB",
            "description": "TrnsNickna",
            "date": "Mar 5",
            "effectiveDate": "150305",
            "settlementDate": "",
            "originatorStatusCode": "1",
            "originatingDFIIdentification": "08100003",
            "num": 0,
            "footer": {
              "recordType": "8",
              "serviceClassCode": 220,
              "entryAndAddendaCount": 4,
              "entryHash": 32400084,
              "totalDebit": 0,
              "totalCredit": 9320,
              "companyId": "0018036281",
              "messageAuthenticationCode": "",
              "reserved": "",
              "originatingDFIIdentification": "08100003",
              "num": 0
            }
          },
          {
            "entries": [
              {
                "recordType": "6",
                "transactionCode": "22",
                "receivingDFIIdentification": 8100021,
                "checkDigit": 0,
                "dfiAccount": "5654221",
                "amount": 17500,
                "identificationNumber": "RAj##8k765j4k32",
                "receivingCompanyName": "Luke Skywalker",
                "paymentTypeCode": "A1",
                "addendaIndicator": "0",
                "traceNumber": 81000030000004
              }
            ],
            "recordType": "5",
            "serviceClassCode": 220,
            "companyName": "Your Company Inc",
            "discretionaryData": "",
            "companyId": "0018036281",
            "entryClassCode": "WEB",
            "description": "TrnsNickna",
            "date": "Mar 16",
            "effectiveDate": "150316",
            "settlementDate": "",
            "originatorStatusCode": "1",
            "originatingDFIIdentification": "08100003",
            "num": 1,
            "footer": {
              "recordType": "8",
              "serviceClassCode": 220,
              "entryAndAddendaCount": 1,
              "entryHash": 8100021,
              "totalDebit": 0,
              "totalCredit": 17500,
              "companyId": "0018036281",
              "messageAuthenticationCode": "",
              "reserved": "",
              "originatingDFIIdentification": "08100003",
              "num": 1
            }
          },
          {
            "entries": [
              {
                "recordType": "6",
                "transactionCode": "27",
                "receivingDFIIdentification": 10100001,
                "checkDigit": 9,
                "dfiAccount": "923698412584",
                "amount": 15000,
                "identificationNumber": "RAj##765432hj",
                "receivingCompanyName": "Jane Doe",
                "discretionaryData": "A1",
                "addendaIndicator": "0",
                "traceNumber": 81000030000005
              }
            ],
            "recordType": "5",
            "serviceClassCode": 225,
            "companyName": "Your Company Inc",
            "discretionaryData": "",
            "companyId": "0018036281",
            "entryClassCode": "PPD",
            "description": "TrnsNickna",
            "date": "Mar 6",
            "effectiveDate": "150306",
            "settlementDate": "",
            "originatorStatusCode": "1",
            "originatingDFIIdentification": "08100003",
            "num": 2,
            "footer": {
              "recordType": "8",
              "serviceClassCode": 225,
              "entryAndAddendaCount": 1,
              "entryHash": 10100001,
              "totalDebit": 15000,
              "totalCredit": 0,
              "companyId": "0018036281",
              "messageAuthenticationCode": "",
              "reserved": "",
              "originatingDFIIdentification": "08100003",
              "num": 2
            }
          }
        ]
      }
*/

```

[Back to: Table of Contents](#table-of-contents)

