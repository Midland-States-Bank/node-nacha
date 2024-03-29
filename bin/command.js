// Generated by CoffeeScript 1.11.1
var ach, arg, editTransforms, i, inFormat, interactive, j, outFormat, pkg, ref, ref1, started;

ach = require('../lib')();

if ((ref = process.argv[2]) === '-v' || ref === '--version') {
  pkg = require('../package.json');
  console.log(pkg.name, pkg.version);
  process.exit(0);
}

inFormat = null;

outFormat = null;

editTransforms = [];

for (i = j = 2, ref1 = process.argv.length; 2 <= ref1 ? j < ref1 : j > ref1; i = 2 <= ref1 ? ++j : --j) {
  arg = process.argv[i];
  if (arg == null) {
    continue;
  }
  switch (arg) {
    case '-i':
    case '--input':
    case 'from':
      if (i < process.argv.length) {
        inFormat = process.argv[i + 1];
        if (inFormat[0] === '-') {

        }
        process.argv[i + 1] = null;
      } else {

      }
      break;
    case '-o':
    case '--output':
    case 'to':
      if (i < process.argv.length) {
        outFormat = process.argv[i + 1];
        if (outFormat[0] === '-') {

        }
        process.argv[i + 1] = null;
      } else {

      }
      break;
    case '-e':
    case '--edit':
    case 'edit':
      if (i < process.argv.length && process.argv[i + 1] !== '-') {
        editTransforms.push(process.argv[i + 1]);
        process.argv[i + 1] = null;
      } else {

      }
      break;
    case 'gen':
      interactive = true;
      break;
    case 'coffee':
    case 'node':
    case 'with':
    case 'and':
      break;
    default:
      if (arg[0] === '-') {

      } else if (arg[0] === '.' || arg[0] === '/') {
        editTransforms.push(arg);
      } else if (!((inFormat != null) && (ach.getParser(arg) != null))) {
        inFormat = arg;
      } else if (!((outFormat != null) && (ach.getFormatter(arg) != null))) {
        outFormat = arg;
      } else {
        editTransforms.push(arg);
      }
  }
}

if (interactive) {
  console.log('haven\'t coded the interactive version yet');
} else {
  started = ach.from(inFormat).edit(editTransforms).to(outFormat);
  if ((started != null ? started.error : void 0) != null) {
    console.error(started.error);
  }
}
