
isStream = require('./is-stream');

transforms = require('../transforms');

/**
 * Returns a Promise with an object that's copy of a data in the ACH file loaded
 * @returns {Promise.<Object>}
 */
async function toObject() {

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

module.exports = toObject
