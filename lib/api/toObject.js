
isStream = require('./is-stream');

const strung = require('strung')
transforms = require('..//transforms');

async function promiseTo() {

  const objectTransform = transforms.getFormatter('json');

  this.streams.unshift(objectTransform);

  const sink = strung();
  this.streams.unshift(sink);

  return new Promise((resolve, reject) => {

    let nextStream = this.streams.pop();
    while (this.streams.length !== 0) {
      nextStream = nextStream.pipe(this.streams.pop());
    }

    // Handle errors during stream processing
    nextStream.on('error', (error) => {
      reject(error);
    });

    // Pipe the data through the stream
    nextStream.pipe(sink);

    sink.on('finish', ()=>{
      const jsonStr = sink.string
      const achObj = JSON.parse(jsonStr)
      resolve(achObj)
    })
  });
}

module.exports = promiseTo
