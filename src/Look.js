
class Look {
    constructor(obj) {
        this.text = obj.text
        this.scopeStart = obj.scopeStart ?? 0
        this.scopeEnd = obj.scopeEnd ?? obj.text?.length
        this.caseSensitive = obj.caseSensitive ?? false
        this.dotNewline = obj.dotNewline ?? true
    }

    clone(modifications) {
        return new Look(Object.assign({}, this, modifications))
    }

    options(options) {
        return this.clone(options)
    }

    static in (text) {
        return new Look({ text })
    }

    in (text) {
        return this.clone({ text })
    }

    get scopedText() {
        return this.text.substring(this.scopeStart, this.scopeEnd)
    }

    find (pattern, captureGroup = 0) {
        const match = this.match(pattern)
        return match?.[captureGroup]
    }

    findAll (pattern, captureGroup = 0) {
        const match = this.matchAll(pattern)
        return match.map(m => m[captureGroup])
    }

    after(pattern) {
        const clone = this.clone()
        const result = this.match(pattern)
        clone.scopeStart = result 
            ? this.scopeStart + result.index + result[0].length
            : this.scopeEnd 
        return clone
    }

    before(pattern) {
        const clone = this.clone()
        const result = this.match(pattern)
        clone.scopeEnd = result 
            ? this.scopeStart + result.index
            : this.scopeStart
        return clone
    }

    between(startPattern, endPattern) {
        return this.after(startPattern).before(endPattern)
    }

    matchAll(pattern) {
        const regexp = this.generateRegexp(pattern)
        return [...this.scopedText.matchAll(regexp)]
    }

    match(pattern) {
        const regexp = this.generateRegexp(pattern, false)
        return this.scopedText.match(regexp)
    }

    generateRegexp(pattern, global = true) {
        const source = pattern instanceof RegExp
            ? pattern.source 
            : pattern.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
        const flags = ["m"]
        if (global) flags.push("g")
        if (this.dotNewline) flags.push("s")
        if (!this.caseSensitive) flags.push("i")
        return new RegExp(source, flags.join(''))
    }
}

module.exports = Look