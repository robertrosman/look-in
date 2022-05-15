
const formatResult = (match: RegExpMatchArray, format: string): string => {
    return format.replace(/\$([$&0-9])/g, (m, p1) => {
        if (m === '$$') return '$'
        if (m === '$&') return match?.[0]
        return match?.[p1]
    })
}

interface Options {
    text?: string
    scopeStart?: number
    scopeEnd?: number
    caseSensitive?: boolean
    dotNewline?: boolean
}

class Look {
    text: string
    scopeStart: number
    scopeEnd: number
    caseSensitive: boolean
    dotNewline: boolean

    constructor(obj: Options) {
        this.text = obj.text ?? ""
        this.scopeStart = obj.scopeStart ?? 0
        this.scopeEnd = obj.scopeEnd ?? obj.text?.length ?? 0
        this.caseSensitive = obj.caseSensitive ?? false
        this.dotNewline = obj.dotNewline ?? true
    }

    clone(modifications?: Options): Look {
        return Object.assign(new Look(this), modifications)
    }

    options(options?: Options): Look {
        return this.clone(options)
    }

    static in (text: string): Look {
        return new Look({ text })
    }

    in (text: string): Look {
        return this.clone({ 
            text,
            scopeStart: 0,
            scopeEnd: text.length
        })
    }

    get scopedText(): string {
        return this.text.substring(this.scopeStart, this.scopeEnd)
    }

    after(pattern: string | RegExp): Look {
        const clone = this.clone()
        const result = this.match(pattern)
        clone.scopeStart = result?.index
            ? this.scopeStart + result.index + result[0].length
            : this.scopeEnd 
        return clone
    }

    before(pattern: string | RegExp): Look {
        const clone = this.clone()
        const result = this.match(pattern)
        clone.scopeEnd = result?.index
            ? this.scopeStart + result.index
            : this.scopeStart
        return clone
    }

    between(startPattern: string | RegExp, endPattern: string | RegExp): Look {
        return this.after(startPattern).before(endPattern)
    }

    find (pattern: string | RegExp, format: string = '$&'): string | undefined {
        const match = this.match(pattern)
        if (match) return formatResult(match, format)
    }

    findAll (pattern: string | RegExp, format: string = '$&'): string[] {
        const match = this.matchAll(pattern)
        return match.map(m => formatResult(m, format))
    }

    match(pattern: string | RegExp): RegExpMatchArray | null {
        const regexp = this.generateRegexp(pattern, false)
        return this.scopedText.match(regexp)
    }

    matchAll(pattern: string | RegExp): RegExpMatchArray[] {
        const regexp = this.generateRegexp(pattern)
        return [...this.scopedText.matchAll(regexp)]
    }

    replace(pattern: string | RegExp, replacement: string): string {
        const regexp = this.generateRegexp(pattern, false)
        const newScopedText = this.scopedText.replace(regexp, replacement)
        return this.replaceScopedText(newScopedText)
    }

    replaceAll(pattern: string | RegExp, replacement: string): string {
        const regexp = this.generateRegexp(pattern, true)
        const newScopedText = this.scopedText.replace(regexp, replacement)
        return this.replaceScopedText(newScopedText)
    }

    replaceScopedText(replacement: string): string {
        return this.text.substring(0, this.scopeStart)
            + replacement
            + this.text.substring(this.scopeEnd)
    }

    generateRegexp(pattern: string | RegExp, global: boolean = true) {
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

export default Look