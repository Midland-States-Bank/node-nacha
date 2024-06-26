// Generated by CoffeeScript 1.11.1
var batch, calculate, ccd, ctx, ppd, ref, validate, wrap;

ref = require('./batch-ccd-ppd-web'), ccd = ref.ccd, ppd = ref.ppd;

ctx = require('./batch-ctx');

batch = require('./batch');

validate = require('../validate');

calculate = require('../calculate');

module.exports = wrap = function(object) {
  var data, entries, lastEntry, next, ref1, traceString;
  data = {
    from: {
      name: object.file.originName,
      fein: object.file.origin
    },
    "for": {
      name: object.file.destinationName,
      routing: object.file.destination.slice(1),
      dfi: object.file.destination.slice(1, -1)
    }
  };
  calculate({
    ach: object,
    set: true
  });
  if ((object != null ? (ref1 = object.batches) != null ? ref1.length : void 0 : void 0) > 0) {
    entries = object.batches[object.batches.length - 1].entries;
    if ((entries != null ? entries.length : void 0) > 0) {
      lastEntry = entries[entries.length - 1];
      traceString = ('' + lastEntry.traceNumber).slice(-7);
      data.entryCount = (Number(traceString)) + 1;
    } else {
      data.entryCount = 1;
    }
  } else {
    data.entryCount = 1;
  }
  next = {
    data: data,
    object: object,
    ccd: ccd,
    ppd: ppd,
    ctx: ctx,
    batch: batch
  };
  next.validate = validate.bind(next, object);
  return next;
};
