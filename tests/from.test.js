const ach = require('../index');
const fs = require('fs')

const achString = fs.readFileSync(`${__dirname}/assets/NACHA.txt`).toString()
const achObject = require('./assets/NACHA.json')
const achJSONString = JSON.stringify(achObject)
const achFromCreateFunc = require('./assets/createExample')


describe('from test cases', () => {

    it('ensure it can create from multiple formats', () => {

        let achFileFromString = ach.from(achString)
        expect(achFileFromString.data !== undefined).toBe(true)

        let achFileFromJSON = ach.from(achJSONString)
        expect(achFileFromJSON.data !== undefined).toBe(true)

        let achFileFromObject = ach.from(achObject)
        expect(achFileFromObject.data !== undefined).toBe(true)

        let achFileFromCreateData = ach.from(achFromCreateFunc)
        expect(achFileFromCreateData.data !== undefined).toBe(true)

    })

    it('ensure you can specify format also', () => {

        let achFileFromString = ach.from({
            format: 'ach',
            source: achString
        })

        // console.log(JSON.stringify(achFileFromString, null, 2))
        expect(achFileFromString.data !== undefined).toBe(true)

        let achFileFromJSON = ach.from({
            format: 'json',
            source: achJSONString
        })
        expect(achFileFromJSON.data !== 'undefined').toBe(true)

        let achFileFromObject = ach.from({
            format: 'object',
            source: achObject
        })
        expect(achFileFromObject.data !== 'undefined').toBe(true)

        let achFileFromCreateData = ach.from({
            format: 'object',
            source: achFromCreateFunc
        })
        expect(achFileFromCreateData.data !== 'undefined').toBe(true)

    })


})