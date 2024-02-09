const fs = require('fs')
const ach = require('../index')();

console.log(__dirname);
const achFile = fs.readFileSync(`${__dirname}/assets/NACHA.txt`).toString()

const achFrom = ach.from({
    format: 'ACH',
    source: achFile
})


describe('toObject Function Test Cases', () => {

    it('Should return an object', async () => {

        const achObj = await achFrom.toObject()
        console.log(achObj);

        expect(typeof achObj).toEqual('object')

    })

})