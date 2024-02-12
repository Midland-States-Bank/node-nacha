
isStream = require('./is-stream');

transforms = require('../transforms');

async function promiseTo() {

  const objectTransform = transforms.getFormatter('json');

  this.streams.unshift(objectTransform);

  let nextStream = this.streams.pop();
  while (this.streams.length !== 0) {
    nextStream = nextStream.pipe(this.streams.pop());
  }

  let jsonString = ''

  return new Promise((resolve, reject) => {
    
    // Handle errors during stream processing
    nextStream.on('error', (error) => {
      reject(error);
    });

    objectTransform.on('data', (chunk) => {
      jsonString += chunk.toString()
    })
    
    objectTransform.on('finish', ()=>{
      const achObj = JSON.parse(jsonString)
      resolve(achObj)
    })
  });

}

module.exports = promiseTo
