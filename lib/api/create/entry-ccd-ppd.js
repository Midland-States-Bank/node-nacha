// Generated by CoffeeScript 1.11.1
var createEntry, getTransactionCode, validate;

validate = require('../validate');

getTransactionCode = function(transactionType, accountType, isPrenote) {
  var code, nextCode;
  code = accountType === 'S' ? '3' : '2';
  nextCode = transactionType === 'D' ? 7 : 2;
  return code += isPrenote ? nextCode + 1 : nextCode;
};

createEntry = function(whichKind, entryData) {
  var accountType, ach, batch, ccd, entry, ppd, ref, toCompany;
  ach = this.object;
  batch = ach.batches[ach.batches.length - 1];
  toCompany = 'string' === typeof entryData.to ? this.data.to[entryData.to] : entryData.to;
  entry = {
    recordType: '6',
    receivingDFIIdentification: toCompany.dfi,
    checkDigit: toCompany.routing[8],
    dfiAccount: toCompany.account.num,
    amount: entryData.amount,
    receivingCompanyName: toCompany.name,
    addendaIndicator: entryData.addenda != null ? '1' : '0',
    traceNumber: this.data["for"].dfi + ('000000' + this.data.entryCount).slice(-7)
  };
  if (entryData.note != null) {
    entry.discretionaryData = entryData.note;
  }
  if (entryData.addenda != null) {
    entry.addenda = {
      recordType: '7',
      type: '05',
      num: 1,
      entryNum: this.data.entryCount,
      info: entryData.addenda
    };
  }
  this.data.entryCount++;
  accountType = toCompany.account.type;
  entry.transactionCode = getTransactionCode(whichKind, accountType, entryData.prenote);
  if (whichKind === 'C') {
    switch (batch.serviceClassCode) {
      case '200':
        break;
      case '225':
        batch.serviceClassCode = batch.footer.serviceClassCode = '200';
        break;
      default:
        batch.serviceClassCode = batch.footer.serviceClassCode = '220';
    }
  } else {
    switch (batch.serviceClassCode) {
      case '200':
        break;
      case '220':
        batch.serviceClassCode = batch.footer.serviceClassCode = '200';
        break;
      default:
        batch.serviceClassCode = batch.footer.serviceClassCode = '225';
    }
  }
  batch.footer.entryHash += entry.receivingDFIIdentification;
  ach.file.footer.entryHash += entry.receivingDFIIdentification;
  if (whichKind === 'C') {
    batch.footer.totalCredit += entry.amount;
    ach.file.footer.totalCredit += entry.amount;
  } else {
    batch.footer.totalDebit += entry.amount;
    ach.file.footer.totalDebit += entry.amount;
  }
  if (entry.addenda != null) {
    batch.footer.entryAndAddendaCount += 2;
    ach.file.footer.entryAndAddendaCount += 2;
    ach.file.footer.lineCount += 2;
  } else {
    batch.footer.entryAndAddendaCount += 1;
    ach.file.footer.entryAndAddendaCount += 1;
    ach.file.footer.lineCount += 1;
  }
  ach.file.footer.blockCount = Math.ceil(ach.file.footer.lineCount / 10);
  batch.entries.push(entry);
  ref = require('./batch-ccd-ppd'), ccd = ref.ccd, ppd = ref.ppd;
  this.ccd = ccd;
  this.ppd = ppd;
  return this;
};

module.exports = {
  credit: function(entryData) {
    return createEntry.call(this, 'C', entryData);
  },
  debit: function(entryData) {
    return createEntry.call(this, 'D', entryData);
  }
};
