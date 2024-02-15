const achFormatter = require('./../lib/transforms/ach-formatter')
const achParser = require('./../lib/transforms/ach-parser')
const fs = require('fs')

const achString = fs.readFileSync(`${__dirname}/assets/NACHA.txt`).toString().replace(/\r/g, '')

const achFile = achParser(achString)



describe('ach-formatter test cases', () => {
    
    it('should return ach file that was parsed', () => {
        
        const generatedAchString = achFormatter(achFile)

        console.log(achString);
        console.log(generatedAchString);
        
        let generatedAchStringLines = generatedAchString.split('\n')
        let achStringLines = achString.split('\n')

        console.log(achStringLines);
        console.log(generatedAchStringLines);

        expect(generatedAchStringLines.length).toEqual(achStringLines.length)

        achStringLines.forEach((achLine, index) => {
            const generatedAchLine = generatedAchStringLines[index]

            if(achLine !== generatedAchLine){
                console.log(`
                -------------------
                old: '${achLine}'
                gen: '${generatedAchLine}'
                -------------------
                `);
            }

            expect(achLine).toEqual(generatedAchLine)
        })
    })

})