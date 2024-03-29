// Generated by CoffeeScript 1.11.1
var formats, validate;

formats = require('../transforms/formats');

validate = function(object, format) {};

module.exports = function(object) {
  var batch, i, len, ref, ref1, ref2, results;
  validate(object != null ? object.file : void 0, formats.fileHeader);
  validate(object != null ? (ref = object.file) != null ? ref.footer : void 0 : void 0, formats.fileFooter);
  if ((object != null ? (ref1 = object.batches) != null ? ref1.length : void 0 : void 0) > 0) {
    ref2 = object.batches;
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      batch = ref2[i];
      validate(batch, formats.batchHeader);
      results.push(validate(batch != null ? batch.footer : void 0, formats.batchFooter));
    }
    return results;
  }
};

validate.date = function(value) {
  return false;
};

validate.time = function(value) {
  return false;
};

validate.aba = function(value) {
  return false;
};

validate.abaFull = function(value) {
  return false;
};

validate.abaFullPlus = function(value) {
  return false;
};

validate.alphanumeric = /.*/;
