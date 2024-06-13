'use strict';

const nacha = require('../index');
const fs = require('fs')

const nachaStringExample = fs.readFileSync(`${__dirname}/assets/NACHA.txt`).toString().replace(/\r/g, '')
const createdFile = require('./assets/createExample')


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
        let { data } = nachaFile

        let { creationDate, creationTime } = data.file
        let year = new Date().getFullYear().toString().slice(0, 2) + Number(creationDate.slice(0, 2))
        let month = Number(creationDate.slice(2, 4)) - 1 // months are 0 indexed
        let day = Number(creationDate.slice(4, 6))
        let hour = Number(creationTime.slice(0, 2))
        let minute = Number(creationTime.slice(2, 4))
        let mockDate = new Date(year, month, day, hour, minute)

        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        let newNacha = nacha.create({
            from: {
                name: data.file.originName,
                fein: data.file.origin.trim()
            },
            for: {
                name: data.file.destinationName,
                routing: data.file.destination.trim()
            },
            referenceCode: data.file.referenceCode,
            idModifier: data.file.idModifier
        })

        let { batches } = data
        for(let batch of batches){

            let transactionsType = batch.entryClassCode.toLowerCase()

            newNacha = newNacha[transactionsType]({
                effectiveDate: batch.effectiveDate,
                description: batch.description,
                note: batch.discretionaryData,
                date: batch.date,
                companyId: batch.companyId,
                companyName: batch.companyName,
                originatingDFIIdentification: batch.originatingDFIIdentification
            })

            let { entries } = batch
            for(let entry of entries){
                let entryType = entry.transactionCode.endsWith('7') ? 'debit' : 'credit'
                newNacha = newNacha[entryType]({
                    name: entry.receivingCompanyName,
                    account: {
                        num: entry.dfiAccount,
                        type: entry.transactionCode.startsWith('2') ? 'C': 'S'
                    },
                    routing: String(entry.receivingDFIIdentification) + entry.checkDigit,
                    amount: entry.amount,
                    identificationNumber: entry.identificationNumber,
                    paymentTypeCode: entry.paymentTypeCode,
                    note: entry.discretionaryData,
                    traceNumber: entry.traceNumber,
                    addenda: entry.addenda?.info
                })
            }

        }

        let newNachaFile = nacha.from(newNacha)

        let newCreatedNachaString = newNachaFile.to('ach')
        let newNachaStringLines = newCreatedNachaString.split('\n')
        let nachaStringLines = nachaStringExample.replace(/\r/g, '').split('\n')

        expect(nachaStringLines.length).toEqual(newNachaStringLines.length)

        // Loop though all the lines of the NACHA files & ensure they're equal
        nachaStringLines.forEach( (originalLine, index) => {
            let generatedLine = newNachaStringLines[index]

            expect(generatedLine).toEqual(originalLine)
        })

        global.Date.mockRestore();
    })

    it('should be able to create a JSON String', () => {

        const jsonString = createdFile.to('json')

        expect(typeof jsonString === 'string' && jsonString.length > 1).toBe(true)
        expect(() => { JSON.parse(jsonString) }).not.toThrow()

    })

})