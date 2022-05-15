const { expect } = require("chai")
const Look = require('../src/Look')

describe('Look', () => {
    describe('in', () => {
        it('should return an instance of Look', () => {
            const look = Look.in("This is the string")

            expect(look instanceof Look).to.equal(true)
        })

        it('should set text internally', () => {
            const look = Look.in("This is the string")

            expect(look.scopedText).to.equal("This is the string")
        })

        it('should work on a prepared instance', () => {
            const look = new Look({ 
                caseSensitive: true
            })
            const result = look.in("This is the string AS expected").find(/[IA]S/)

            expect(result).to.equal('AS')
        })
    })

    describe('find', () => {
        it('should return the exact match', () => {
            const result = Look.in("This is the string").find(/the/)

            expect(result).to.equal("the")
        })

        it('should return the first match', () => {
            const result = Look.in("This is the string as expected").find(/[ia]s/)

            expect(result).to.equal("is")
        })

        it('should be case insensitive by default', () => {
            const result = Look.in("THIS IS the string as expected").find(/[ia]s/)

            expect(result).to.equal("IS")
        })

        it('should support back reference in format', () => {
            const result = Look.in("This is the string as expected")
                .find(/the (string) as/, '$1')

            expect(result).to.equal("string")
        })

        it('should support dollar sign in format', () => {
            const result = Look.in("This is the string as expected")
                .find(/the (string) as/, '$ $$ $')

            expect(result).to.equal("$ $ $")
        })

        it('should support dollar sign in format', () => {
            const result = Look.in("This is the string as expected")
                .find(/the (string) as/, 'a $1 just as')

            expect(result).to.equal("a string just as")
        })

        it('should escape regex characters in string patterns', () => {
            const result = Look.in("Can you match this? (yup)").find("this? (yup)")

            expect(result).to.equal("this? (yup)")
        })

        it('should default to multiline search', () => {
            const result = Look.in(`first line
                second line
                third line
            `)
            .find(/second.*third/)

            expect(result).to.not.equal(undefined)
        })

        it('should not match newlines if dotNewline is false', () => {
            const result = Look.in(`first line
                second line
                third line
            `).options({ dotNewline: false })
            .find(/second.*third/)

            expect(result).to.equal(undefined)
        })
    })

    describe('findAll', () => {
        it('should return an array', () => {
            const result = Look.in("This is the string").findAll(/the/)

            expect(Array.isArray(result)).to.equal(true)
        })

        it('should return an empty array if no match', () => {
            const result = Look.in("This is the string").findAll("no match")

            expect(result.length).to.equal(0)
        })

        it('should find all occurences', () => {
            const result = Look.in("I scream, you scream, we all scream for ice cream").findAll("cream")

            expect(result.length).to.equal(4)
        })

        it('should support capture group return', () => {
            const result = Look.in("This is the string as expected")
                .findAll(/the (string) as/, '$1')

            expect(result[0]).to.equal("string")
        })

    })

    describe('clone', () => {
        it('should be chainable', () => {
            const look = Look.in("This is the string as expected")

            expect(look.clone() instanceof Look).to.equal(true)
        })

        it('should be immutable', () => {
            const look = Look.in("This is the string as expected")

            expect(look.clone()).to.not.equal(look)
        })

        it('should accept modifications', () => {
            const look = Look.in("This is the string as expected")
            const clone = look.clone({ text: "new one" })

            expect(clone.text).to.equal("new one")
        })
    })

    describe('options', () => {
        it('should be chainable', () => {
            const look = Look.in("This is the string as expected")

            expect(look.options() instanceof Look).to.equal(true)
        })

        it('should be immutable', () => {
            const look = Look.in("This is the string as expected")

            expect(look.options()).to.not.equal(look)
        })

        it('should accept modifications', () => {
            const look = Look.in("This is the string as expected")
            const clone = look.options({ text: "new one" })

            expect(clone.text).to.equal("new one")
        })

        it('should support case sensitive searches', () => {
            const result = Look.in("This is the string as expected")
                .options({ caseSensitive: true })
                .find("IS")

            expect(result).to.equal(undefined)
        })
    })

    describe('after', () => {
        it('should be chainable', () => {
            const look = Look.in("This is the string as expected")

            expect(look.after("string") instanceof Look).to.equal(true)
        })

        it('should be immutable', () => {
            const look = Look.in("This is the string as expected")

            expect(look.after("string")).to.not.equal(look)
        })

        it('should only find results after the given pattern', () => {
            const result = Look.in("This is the string as expected").after("string").find(/[ia]s/)

            expect(result).to.equal("as")
        })

        it('should scope the text to after first match', () => {
            const look = Look.in("This is the string as expected").after("string")

            expect(look.scopedText).to.equal(' as expected')
        })

        it('should work with regexp pattern', () => {
            const look = Look.in("This is the string as expected").after(/string/)

            expect(look.scopedText).to.equal(' as expected')
        })

        it('should empty the scopedText prop if not found', () => {
            const look = Look.in("This is the string as expected").after("not found")

            expect(look.scopedText).to.equal('')
        })
    })

    describe('before', () => {
        it('should be chainable', () => {
            const look = Look.in("This is the string as expected")

            expect(look.before("string") instanceof Look).to.equal(true)
        })

        it('should be immutable', () => {
            const look = Look.in("This is the string as expected")

            expect(look.before("string")).to.not.equal(look)
        })

        it('should scope the text to before first match', () => {
            const look = Look.in("This is the string as expected").before("string")

            expect(look.scopedText).to.equal('This is the ')
        })

        it('should work with regexp pattern', () => {
            const look = Look.in("This is the string as expected").before(/string/)

            expect(look.scopedText).to.equal('This is the ')
        })

        it('should empty the scopedText prop if not found', () => {
            const look = Look.in("This is the string as expected").before("not found")

            expect(look.scopedText).to.equal('')
        })
    })

    describe('between', () => {
        it('should scope the text to before between patterns', () => {
            const look = Look.in("This is the string as expected").between("string", "expected")

            expect(look.scopedText).to.equal(' as ')
        })
    })

    describe('replace', () => {
        it('should replace first match with replacement', () => {
            const result = Look.in("I scream, you scream, we all scream for ice cream")
                .after("you")
                .replace("scream", "dream")

            expect(result).to.equal('I scream, you dream, we all scream for ice cream')
        })

        it('should support back reference in replacement', () => {
            const result = Look.in("I scream, you scream, we all scream for ice cream")
                .after("you")
                .replace(/(\w+) scream/, "$1 dream")

            expect(result).to.equal('I scream, you scream, we all dream for ice cream')
        })
    })

    describe('replaceAll', () => {
        it('should replace all matches in scope with replacement', () => {
            const result = Look.in("I scream, you scream, we all scream for ice cream")
                .after("you")
                .replaceAll("scream", "dream")

            expect(result).to.equal('I scream, you dream, we all dream for ice cream')
        })

        it('should support back reference in replacement', () => {
            const result = Look.in("I scream, you scream, we all scream for ice cream")
                .replaceAll(/(\w+) scream/, "$1 dream")

            expect(result).to.equal('I dream, you dream, we all dream for ice cream')
        })
    })
})