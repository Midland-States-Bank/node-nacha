const nacha = require('../../index');

function getTomorrowYYMMDD(){
  let tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  let year = tomorrow.getFullYear().toString().slice(-2)
  let month = ('0' + (tomorrow.getMonth() + 1)).slice(-2)
  let day = ('0' + tomorrow.getDate()).slice(-2)

  return `${year}${month}${day}`
}

const achFile = nacha.create({
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

module.exports = nacha.from(achFile)
