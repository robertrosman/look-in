
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

export class Look {
    text: string
    scopeStart: number
    scopeEnd: number
    caseSensitive: boolean
    dotNewline: boolean

    /**
     * You can call the constructor to prepare an instance with options, then use the instance itself to search and replace with the given options.
     * @example
     * const look = new Look({ caseSensitive: true })
     * look.in("Will ONLY return matches with the correct casing.").find("only")  // no match
     * @param options An existing object or any options to be used for further interactions
     */
    constructor(options: Options | Look) {
        this.text = options.text ?? ""
        this.scopeStart = options.scopeStart ?? 0
        this.scopeEnd = options.scopeEnd ?? options.text?.length ?? 0
        this.caseSensitive = options.caseSensitive ?? false
        this.dotNewline = options.dotNewline ?? true
    }

    /**
     * clone is used internally to keep all objects 'immutable'. Can of course be used to clone a Look object at any time.
     * @param modifications An Options object with properties that should be different in the cloned object
     * @returns A Look instance for further chaining
     */
    clone(modifications?: Options): Look {
        return Object.assign(new Look(this), modifications)
    }

    /**
     * Use the options method to set options anytime in the chaining. All following method calls will use the options set here.
     * @param options The options to use for all following interactions with the object
     * @returns 
     */
    options(options?: Options): Look {
        return this.clone(options)
    }

    /**
     * Use the 'in' method with the text you want to search through
     * @param text The text to looked in. 
     * @returns A Look instance for further chaining
     */
    static in (text: string): Look {
        return new Look({ text })
    }

    /**
     * Use the 'in' method with the text you want to search through
     * @param text The text to looked in. 
     * @returns A Look instance for further chaining
     */
    in (text: string): Look {
        return this.clone({ 
            text,
            scopeStart: 0,
            scopeEnd: text.length
        })
    }

    /**
     * This is the part of the text that will be used to search and replace. Set the scope with methods like {@link after}, {@link before} and {@link between}.
     * @readonly
     * @type {string}
     * @memberof Look
     */
    get scopedText(): string {
        return this.text.substring(this.scopeStart, this.scopeEnd)
    }

    /**
     * Within the already given scope, find the first match of pattern and shrink the new scope to start from there.
     * @param pattern The pattern to search for
     * @returns A Look instance for further chaining
     */
    after(pattern: string | RegExp): Look {
        const clone = this.clone()
        const result = this.match(pattern)
        clone.scopeStart = result?.index
            ? this.scopeStart + result.index + result[0].length
            : this.scopeEnd 
        return clone
    }

    /**
     * Within the already given scope, find the first match of pattern and shrink the new scope to stop there.
     * @param pattern The pattern to search for
     * @returns A Look instance for further chaining
     */
    before(pattern: string | RegExp): Look {
        const clone = this.clone()
        const result = this.match(pattern)
        clone.scopeEnd = result?.index
            ? this.scopeStart + result.index
            : this.scopeStart
        return clone
    }

    /**
     * Shrink the already given scope to only be between the first match of startPattern, and the following first match of endPattern.
     * @param pattern The pattern to search for
     * @returns A Look instance for further chaining
     */
    between(startPattern: string | RegExp, endPattern: string | RegExp): Look {
        return this.after(startPattern).before(endPattern)
    }

    /**
     * Find and return the first match of the given pattern. If you only want to return a part of the match, you can use 
     * [capture groups](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges) and 
     * the format parameter to specify the format to be returned. By default the whole match will be returned.
     * If no match is found, undefined is returned.
     * @example
     * const matchWithEuroSign    = Look.in("Find a given amount, like €123").find(/€(\d+)/)
     * const matchWithoutEuroSIgn = Look.in("Find a given amount, like €123").find(/€(\d+)/, "$1")
     * @param pattern The pattern to search for
     * @param format The format of the result. Supports back references like $1 and $&.
     * @returns The matched string, optionally formatted
     */
    find (pattern: string | RegExp, format: string = '$&'): string | undefined {
        const match = this.match(pattern)
        if (match) return formatResult(match, format)
    }

    /**
     * Find and return all matches of the given pattern. If you only want to return a part of each match, you can use 
     * [capture groups](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges) and 
     * the format parameter to specify the format to be returned. By default the whole matches will be returned.
     * If no match is found, an empty array will be returned.
     * @example
     * const matchesWithEuroSign    = Look.in("Find a given amount, like €123 and €456").findAll(/€(\d+)/)
     * const matchesWithoutEuroSIgn = Look.in("Find a given amount, like €123 and €456").findAll(/€(\d+)/, "$1")
     * @param pattern The pattern to search for
     * @param format The format of the result. Supports back references like $1 and $&.
     * @returns The matched string, optionally formatted
     */
    findAll (pattern: string | RegExp, format: string = '$&'): string[] {
        const match = this.matchAll(pattern)
        return match.map(m => formatResult(m, format))
    }

    /**
     * A wrapper around [String.prototype.match](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match).
     * Will apply apply flags etc. from the current instance settings to the pattern before the matching. Also note that only the current scope will be searched through.
     * @param pattern The pattern to search for
     * @returns The first match as an array of the capture groups
     */
    match(pattern: string | RegExp): RegExpMatchArray | null {
        const regexp = this.generateRegexp(pattern, false)
        return this.scopedText.match(regexp)
    }

    /**
     * A wrapper around [String.prototype.matchAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll).
     * Will apply apply flags etc. from the current instance settings to the pattern before the matching. Also note that only the current scope will be searched through.
     * @param pattern The pattern to search for
     * @returns An array of all matches, each one as an array of the capture groups
     */
    matchAll(pattern: string | RegExp): RegExpMatchArray[] {
        const regexp = this.generateRegexp(pattern)
        return [...this.scopedText.matchAll(regexp)]
    }

    /**
     * A wrapper around [String.prototype.replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace).
     * Will apply apply flags etc. from the current instance settings to the pattern before running the replace. Also note that only the first match within the current scope will be replaced.
     * @param pattern The pattern to search for
     * @param replacement The text to replace each match with. Supports back references like $1 and $&.
     * @returns THe complete text after replacements are made
     */
    replace(pattern: string | RegExp, replacement: string): string {
        const regexp = this.generateRegexp(pattern, false)
        const newScopedText = this.scopedText.replace(regexp, replacement)
        return this.replaceScopedText(newScopedText)
    }

    /**
     * A wrapper around [String.prototype.replaceAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll).
     * Will apply apply flags etc. from the current instance settings to the pattern before running the replace. Also note that only matches within the current scope will be replaced.
     * @param pattern The pattern to search for
     * @param replacement The text to replace each match with. Supports back references like $1 and $&.
     * @returns THe complete text after replacements are made
     */
    replaceAll(pattern: string | RegExp, replacement: string): string {
        const regexp = this.generateRegexp(pattern, true)
        const newScopedText = this.scopedText.replace(regexp, replacement)
        return this.replaceScopedText(newScopedText)
    }

    /**
     * Replace the scoped part of the text with the replacement text
     * @param replacement The text to use instead of scopedText
     * @returns The complete text but with replacement instead of scopedText
     */
    replaceScopedText(replacement: string): string {
        return this.text.substring(0, this.scopeStart)
            + replacement
            + this.text.substring(this.scopeEnd)
    }

    /**
     * Based on the current instance settings, generate a regular expression with correct flags to be used for further search and replacing.
     * @param pattern The pattern
     * @param global Should the regular expression look for all matches or only the first one?
     * @returns A regular expression 
     */
    generateRegexp(pattern: string | RegExp, global: boolean = true) {
        const source = pattern instanceof RegExp
            ? pattern.source 
            : pattern.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

        const flags = "m"
            + (global ? "g" : "")
            + (this.dotNewline ? "s" : "")
            + (!this.caseSensitive ? "i" : "")

        return new RegExp(source, flags)
    }
}