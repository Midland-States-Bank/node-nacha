# @midlandsbank/node-nacha

# NACHA File Formatter/Parser

Parses and formats NACHA ACH standard CCD+/PPD+ bank transaction files.

This module was made from Eli Doran's cli tool [@ach/ach](https://www.npmjs.com/package/@ach/ach) 
Couldn't fork his module due to it being built in coffeescript.

# Table of Contents

1. [Installation](#Installation)
2. [Using the Package](#using-the-package)
   1. [create()](#create)
   2. [from()](#from)

### Installation

    npm install @midlandsbank/node-nacha

## Using the Package

`nacha` has three main functions to start with

1. create() - used to generate an object that can be loaded into `from()` function
2. from() - used to create a new file from a different format like a NACHA file or JSON

[Back to: Table of Contents](#table-of-contents)

### create()

```javascript
const nacha = require('@midlandsbank/node-nacha')

// Create a new file Instance
const nachaObj = nacha.create({
  "from": {
    "name": "Your Company",
    "fein": "071904779"
  },
  "for": {
    "name": "Our Bank",
    "routing": "081204540"
  },
  "referenceCode": '12345678',
  "idModifier": 'B'
})
.ccd({
  "effectiveDate": getTomorrowYYMMDD(),
  "description": "Payment",
  "note": "the \"discretionary data\"",
  "date": "Mar 30"
})
.credit({
  "name": "Target Company",
  "account": {
    "num": "135792468",
    "type": "C"
  },
  "routing": "987654321",
  "amount": 12345,
  "addenda": {
    "info": "some addenda 80 chars long"
  }
})
.credit({
  "name": "Another Company",
  "account": {
    "num": "159260",
    "type": "C"
  },
  "routing": "987654321",
  "amount": 13579
})
.debit({
  "name": "Your Company",
  "account": {
    "num": "135792468",
    "type": "C"
  },
  "routing": "987654321",
  "amount": 25924,
  "addenda": {
    "info": "some addenda 80 chars long",
    "type": "99",
  }
})
.debit({
  "name": "Your Company",
  "account": {
    "num": "135792468",
    "type": "C"
  },
  "routing": "987654321",
  "prenote": true
})

let nachaFile = nacha.from(nachaObj)

// To access the nacha object use the data property
console.log(nachaFile.data)

// convert the file into different formats
let nachaString = nachaFile.to('ach')
let nachaJSON = nachaFile.to('json')
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

```javascript
const nacha = require('@midlandsbank/node-nacha');
const fs = require('fs')

const nachaString = fs.readFileSync(`./NACHA.txt`).toString()

let nachaFile = nacha.from(nachaString)

/* 
.from() returns: {
  data: { *File Data* },
  to: function to convert to other formats
}
*/

let newNachaString = nachaFile.to('ach')
let nachaJSON = nachaFile.to('json')

```

[Back to: Table of Contents](#table-of-contents)
