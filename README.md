Look.in 🔍
==========

Look.in is a dependency-free library to make text search and replace more readable

* Lightweight, <1 kb gzipped
* Readable
* Immutable

```
const result = 
    Look.in('The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?')
        .after('dog.')
        .replaceAll('dog', 'pet')
```
Getting started
---------------

### NPM

First run npm to install the package:
`npm install look-in`

Then in your repo, import it as a ES6 or CommonJS module.

```
import { Look } from 'look-in';

// or

const { Look } = require('look-in');
```

### CDN

You can also use the package directly in an HTML page.

```
<script src="https://unpkg.com/look-in/dist/look-in.min.js"></script>
<script>
    const result = Look.in('Go ahead and find all words individually').findAll(/\w+/)
</script>
```

Concepts
--------

Look.in is created to make text search and replace as simple and readable as possible. 

### Patterns

All methods that takes a pattern as a parameter will accept a string or a regular expression. Strings will be escaped, so for example "this?" will only match "this" with a question mark after, while /this?/ will match "thi" or "this".

### Options

By design Look.in ignores any flags passed to regular expressions. Instead you can use the options if you want to tweak the matching behaviour:

```
Look.in('ONLY MATCH the matches with correct case')
    .options({
        caseSensitive: true // false by default
    })
    .findAll(/match/i)  // Note that the i flag is overridden by the options
```

If you want to reuse the same options several times, you can instantiate a Look object like this:

```
const look = new Look({ caseSensitive: true })
const result = look.in('ONLY MATCH the matches with correct case').find('match')
const result = look.in('This one is also case sensitive').find(/CASE/)
```

#### Available options

| Option         | Default value | Description |
| -------------- | ------------- | ------------- |
| caseSensitive  | false         | By default Look.in will match both uppercase and lowercase (by setting the [RegExp flag i](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/ignoreCase)). Set to true to be strict about case. |
| dotNewline     | true          | Set dotNewline to false if you want dots in your regular expressions to _not_ [match newlines](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/dotAll). |
| scopeStart     | 0             | If you want to narrow down the scope by setting the index manually, this value sets where the scope should start. |
| scopeEnd       | text.length   | If you want to narrow down the scope by setting the index manually, this value sets where the scope should end. |

The [global flag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/global) is set depending on which method you use - find/findAll, replace/replaceAll etc.

### Scope

You can narrow down the scope of the text that you want to search by using the scope methods `after`, `before` and `between`.

```
const result = Look.in('This is the complete text (but only text inside the parantheses will be replaced)')
    .between('(', ')')
    .replace('text', 'stuff')
// result = 'This is the complete text (but only stuff inside the parantheses will be replaced)'
```

Of course you can chain the scope methods too if you want:

```
const result = Look.in(document.body.innerHTML)
    .after('<hr>')
    .after('<h1>')
    .between('<p>', '</p>')
    .findAll(pattern)
```

### Format

The methods `find` and `findAll` accepts an optional parameter called `format`. Here you can specify what format you like the result to be in. It works just like the [replacement in replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_a_parameter) and replaceAll, so you can include back references.

```
const isoDates = Look.in('01-02-2022, 03-04-2022')
    .findAll(/(\d{2})-(\d{2})-(\d{4})/, '$3-$1-$2')
// isoDates = ['2022-01-02', '2022-03-04']
```

API reference
-------------

### in(text)
Use the 'in' method with the text you want to search through.

### after(pattern)
Within the already given scope, find the first match of pattern and shrink the new scope to start from there.

### before(pattern)
Within the already given scope, find the first match of pattern and shrink the new scope to stop there.

### between(startPattern, endPattern)
Shrink the already given scope to only be between the first match of startPattern, and the following first match of endPattern.

### find(pattern, format = '$&')
Find and return the first match of the given pattern. If you only want to return a part of the match, you can use 
[capture groups](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges) and 
the format parameter to specify the format to be returned. By default the whole match will be returned.
If no match is found, undefined is returned.

### findAll (pattern, format = '$&')
Find and return an array with all matches of the given pattern. If you only want to return a part of each match, you can use 
[capture groups](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges) and 
the format parameter to specify the format to be returned. By default the whole matches will be returned.
If no match is found, an empty array will be returned.

### match(pattern)
A wrapper around [String.prototype.match](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match).
Will apply apply flags etc. from the current instance settings to the pattern before the matching. Also note that only the current scope will be searched through.

### matchAll(pattern)
A wrapper around [String.prototype.matchAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll).
Will apply apply flags etc. from the current instance settings to the pattern before the matching. Also note that only the current scope will be searched through.

### replace(pattern, replacement)
A wrapper around [String.prototype.replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace).
Will apply apply flags etc. from the current instance settings to the pattern before running the replace. Also note that only the first match within the current scope will be replaced.

### replaceAll(pattern, replacement)
A wrapper around [String.prototype.replaceAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll).
Will apply apply flags etc. from the current instance settings to the pattern before running the replace. Also note that only matches within the current scope will be replaced.
