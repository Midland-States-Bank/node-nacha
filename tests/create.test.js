const nacha = require('../index');
const fs = require('fs')

const nachaStringExample = fs.readFileSync(`${__dirname}/assets/NACHA.txt`).toString().replace(/\r/g, '')
const createdFile = require('./assets/createExample')
const createdNachaString = createdFile.to('ach')

describe('create function test cases', () => {


    it('should error if nothing is passed', () => {
        expect(() => { nacha.create() }).toThrow()
        expect(() => { nacha.create({}) }).toThrow()
    })

    it('should be able to create a NACHA String', () => {
 
        const nachaString = createdFile.to('ach')
        expect(typeof nachaString === 'string' && nachaString.length > 1).toBe(true)

    })

    it('should be able to read then recreate the same file', () => {
        
        let nachaFile = nacha.from(nachaStringExample)

        console.log(JSON.stringify(nachaFile.data, null, 2))

        let { data } = nachaFile

        let { creationDate } = data.file
        let year = '20' + creationDate.slice(0, 2)
        let month = creationDate.slice(2, 4)
        let day = creationDate.slice(4, 6)

        let mockDate = new Date(`${year}-${month}-${day}`)
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        let newNacha = nacha.create({
            from: {
                name: data.file.originName,
                fein: data.file.origin
            },
            for: {
                name: data.file.destinationName,
                routing: data.file.destination
            },
            referenceCode: data.file.referenceCode,
        })

        let { batches } = data

        for(let batch of batches){

            let transactionsType = batch.entryClassCode.toLowerCase()

            console.log(transactionsType);
            newNacha = newNacha[transactionsType]({
                effectiveDate: batch.effectiveDate,
                description: batch.description,
                note: batch.discretionaryData,
                date: batch.date
            })

            let { entries } = batch

            for(let entry of entries){
                let entryType = entry.transactionCode.endsWith('3') ? 'credit' : 'debit'

                newNacha = newNacha[entryType]({
                    name: entry.receivingCompanyName,
                    account: {
                        num: entry.dfiAccount,
                        type: entry.transactionCode.startsWith('2') ? 'C': 'S'
                    },
                    routing: entry.receivingDFIIdentification,
                    amount: entry.amount,
                    identificationNumber: entry.identificationNumber,
                    paymentTypeCode: entry.paymentTypeCode
                })
            }

            let newCreatedNachaString = nacha.from(newNacha).to('ach')

            expect(newCreatedNachaString).toEqual(nachaStringExample)

        }
        
        global.Date.mockRestore();
    })

    it('should be able to create a JSON String', () => {

        const jsonString = createdFile.to('json')

        expect(typeof jsonString === 'string' && jsonString.length > 1).toBe(true)
        expect(() => { JSON.parse(jsonString) }).not.toThrow()

    })

})