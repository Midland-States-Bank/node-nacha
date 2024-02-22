const ach = require('../index');
const fs = require('fs')

const achString = fs.readFileSync(`${__dirname}/assets/NACHA.txt`).toString()
const achObject = require('./assets/NACHA.json')
const achJSONString = JSON.stringify(achObject)
const createdNachFile = require('./assets/createExample')

function isValidJson(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
}


describe('to test cases', () => {

    let nachaFile = ach.from(achString)
    it('ensure it can output NACHA file', () => {

        let achStringLines = achString.replace(/\r/g, '').split('\n')
        
        nachaFile.to('ach').split('\n').forEach((generatedLine, index) => {
            let originalLine = achStringLines[index]
            
            expect(generatedLine).toEqual(originalLine)
        });


    })

    it('ensure it can output JSON', () => {
        let jsonNacha = nachaFile.to('json')

        expect(isValidJson(jsonNacha)).toBe(true)

    })


})