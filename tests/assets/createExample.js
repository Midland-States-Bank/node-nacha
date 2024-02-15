const ach = require('../../index');

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

module.exports = achFile
