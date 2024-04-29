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
    it('ensure it can output a valid NACHA file', () => {

        let nachaStringLines = achString.replace(/\r/g, '').split('\n')
        let newNachaStringLines = nachaFile.to('ach').split('\n')

        // NACHA files should pad end with 9s so that line count is divisible by 10
        expect(nachaStringLines.length % 10).toBe(0)

        newNachaStringLines.forEach( (generatedLine, index) => {
            let originalLine = nachaStringLines[index]
            
            // Nacha files have to be 94 chars wide
            expect(generatedLine.length == 94).toBe(true)
            expect(generatedLine).toEqual(originalLine)
        });


    })

    it('ensure it can output JSON', () => {
        let jsonNacha = nachaFile.to('json')

        expect(isValidJson(jsonNacha)).toBe(true)

    })


})