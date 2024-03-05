# node-elm-repl

* [Intro](#intro)
* [Installation](#installation)
* [Description](#description)
* [Running tests](#running-tests)
* [How to use it with Node.js? (JS API)](#how-to-use-it-with-nodejs)
* [How to deconstruct Type Definitions in JS? (JS API)](./Types.md) (_a separate page_)
* [How to use it with CLI? (Command-Line API)](#how-to-use-it-with-cli)
* [How to contribute?](#how-to-contribute)
* [How it was done?](./Story.md) (_a separate page_)
* [Security notice][#security-notes] **NB!**

# Intro

Actually the name may confuse you, so I would make it clear from the start, that _technically_ what you see here is **TOTALLY NOT** the REPL. At least, by itself. It is _the replacement_ for the REPL for those who need to know the evaluated values together with their types in their entirety (not just string-encoded boring types, but a structures defining the type, like... JSON Elm Type AST) for Elm expressions in JavaScript environment. Also, this tool may help you make some REPL... in JavaScript.

So, this tool would help you if, and only if, all of these points satisfy:

* You are interested in Elm language;
* You are writing something in JavaScript for the Elm Language, for example a plugin for some Electron-driven IDE / Code Editor;
* In JavaScript, you need to know the values and/or the returned [structured types definitions](./Types.md) of several Elm expressions with a single `elm-make` compilation cycle (for the moment, one cycle takes about 200-300ms in average, except rare first-run cases, taking up to 3 seconds);
* Also, you are willing to do everything mentioned above _offline_, both for you and the user (except the case when `elm-make` auto-downloads required packages);

If these points are applicable to you, but you are still uncertain if you need this, please read [The "Modern Binary Reverse Engineering with Node.js for Elm" Article](https://medium.com/@shaman_sir/modern-binary-reverse-engineering-with-node-js-for-elm-bd7546853e43) (written by me) which describes in the very details, what is done here and how it works. Another way for you, in this case, is just to [use this binary tool](https://github.com/stoeffel/elm-interface-to-json) which was developed later than this one, and which is driven by Haskell (which is an advantage), so has a compiled binary (which is an advantage) and uses the "core" code to get the type information (which is an advantage), but has no ability to get values (which is whatever) and only has types in their stringified form (which is a disadvantage, but may be implementing it for an author is just a matter of time).

----

In short, when you use this:

```javascript
new Repl({ elmVer: '0.18.0' })
    .getTypes([], [
        '1 + 1',
        '\\a b -> a + b'
    ])
    .then(types => console.dir(types, { depth: null }));
```

In response you get this:

```javascript
[ { type: "var", name: "number" },
  { type: "lambda",
    left: { type: "var", name: "number" },
    right:
     { type: "lambda",
       left: { type: "var", name: "number" },
       right: { type: "var", name: "number" } } } ]
```

----

Or when you use this:

```javascript
new Repl({ elmVer: '0.18.0' })
    .getTypesAndValues([], [
        '1 + 1',
        '\\a b -> a + b'
    ])
    .then(typesAndValues => console.dir(typesAndValues, { depth: null }))
    .catch(err => console.error(err));
```

Then you get this:

```javascript
{ types: [ ... <same-as-above> ... ],
  values: [
      "2",
      "<function>"
  ] }
```

----

It is also possible to specify a complete module to parse, so:

```javascript
new Repl({ elmVer: '0.18.0',
           workDir: 'my/source/dir' })
    .parseModule('MyModule.MyInnerModule')
    .then(parsedModule => console.dir(parsedModule, { depth: null }))
    .catch(err => console.error(err));
```

Will give you:

```javascript
{
    "version": {
        "major": 0,
        "minor": 18,
        "patch": 0
    },
    "package": {
        "name": "project",
        "user": "user"
    },
    "imports": [ ... <a-list-of-imports> ... ],
    "exports": [ ... <a-list-of-exports> ... ],
    "types": [ ... <a-list-of-types> ... ]
    ...
}
```

----

Use the [Types](./Types.md) documentation to help you investigate the inner structure of such constructs.

And, the JS grammar for the `.elmi` files [is just lying here](https://github.com/shamansir/node-elm-repl/blob/master/src/parser.js), in case you need it separately. It is accessible from JS with the `Repl.Parser.parse(elmiFileBuffer)`. And [the Kaitai Struct Format](http://kaitai.io/) is defined for `.elmi` files [as well](https://github.com/shamansir/node-elm-repl/blob/master/elmi.ksy). And [the XML version](https://github.com/shamansir/node-elm-repl/blob/master/elmi.grammar) for [Synalize it!](https://www.synalysis.net/) just for the sake of joy.

# Installation

```
npm install node-elm-repl
```

If this command fails, it's a [known](http://stackoverflow.com/questions/17990647/npm-install-errors-with-error-enoent-chmod) `npm` [issue](https://github.com/npm/npm/issues/9633), please try:

```
npm install node-elm-repl --no-bin-links
```

You need to have the fully working Elm project in current directory (by default), _or_ in the place where you plan to use this library, _or_ in the directory you specify with `workDir` (a.k.a. `--work-dir` in CLI) option, so before using it, please ensure to run there:

```
elm-package install
```

Then, you may test it with `npm test` or with creating the test-file:

```
touch ./test-repl.js
```

And filling it with the minimal example (it works only with defaults, i.e. when Elm configuration wasn't changed after `elm-package install` execution and `elm-package.json` also wasn't manually modified, so `user`/`project` is the name of your current project at this moment):

```javascript
var Repl = require('node-elm-repl');

new Repl({ // options
    elmVer: '0.18.0', // your exact elm-compiler version
}).getTypes(
    [ /* imports */ ],
    [ /* expressions */
      '\\a b -> a + b'
    ]
).then(function(types) { // getTypes returns the Promise which resolves to array
    console.log(Repl.stringifyAll(types).join('\n'));
});
```

If everything's ok, you should get:

```
> node ./test-repl.js
number -> number -> number
```

# Description

This package is a very specific and weird package.

So if you (yet) don't care about [Elm language](http://elm-lang.org), you shouldn't be interested. Actually, even if you are a big fan of the [Elm language](http://elm-lang.org) (like me, since 0.15), there's totally no guarantee that this package could be interesting to you too.

Why? Because it actually does exactly what [`elm-repl`](https://github.com/elm-lang/elm-repl) does. Even less. It just gets the types of expressions, no values (HAHA NO, with last updates it also extracts values, so now it has just the same functionality as REPL has, ensure to look through the documentation below!). But... what... changes... everything... is... this package does it completely with node.js!!

And it calculates all the expressions types you asked for just with one single call of `elm-make` (original `elm-repl` currently recompiles everything on every new input).

This makes this REPL three times faster and three times awesomer, since it gives you access to the JSONified structure of the type, instead of just a boring string.

How it got to be so fast and good? Read [How it was done?](#how-it-was-done) below for the nice story and some technical details.

NB: If you find a case when some complex construct is not supported in this project, please don't panic, just follow at least some of the steps described in [Contribute](#how-to-contribute) section.

![Example from CLI](https://raw.githubusercontent.com/shamansir/node-elm-repl/master/img/cli-example.png)

## Running tests

It's better to ensure that binary parser works with your elm version etc.,
so please first run this in the directory where you've installed the package:

```
npm install
npm install -g mocha
npm test
```

> *NB:* When `elm-stuff` was cleaned up, the very first call to `elm-make` in this directory takes longer than 2 seconds since it checks package availability and installs them sometimes, so the very first test always takes much longer than other 33 tests, which in their case are satisfyingly fast; so please take into consideration that `elm-stuff` is cleaned for every test run and timeout is set to 10 seconds just to make tests fair for clean environment, but there's a high chance that in your environment you won't clean up `elm-stuff` so frequently, so absolutely any call should take less than 500ms.

> You may see it for yourself, if you run instead `test-dirty`:

```
npm run test-dirty
```

> Now any call should take no more than 500ms (usually less than 300ms).

## How to use it in Node.js environment?

You may easily install the project using:

```
npm install node-elm-repl
```

#### `Repl.getTypes`

Then, in your JS file, and in the same directory where you have `elm-package.json` or where you store your `.elm` modules, if you have any, just do something like:

```javascript
var Repl = require('node-elm-repl');

new Repl({ // options, defaults are listed:
    workDir: '.', // working directory
    elmVer: '0.18.0', // your exact elm-compiler version
    user: 'user', // specify github username you used in elm-package.json
    package: 'project', // specify project name you used in elm-package.json
    packageVer: '1.0.0' // specify project version you used in elm-package.json
}).getTypes(
    [ // imports:
        'List as L',
        'Maybe exposing ( Maybe(..) )'
    ],
    [ // expressions:
        'L.map',
        'L.foldl',
        'Just',
        'Nothing',
        '1 + 1',
        '\\a b -> a + b'
    ]
).then(function(types) { // getTypes returns the Promise which resolves to array
    // see ./Types.md for the details on every type definition
    console.log(Repl.stringifyAll(types).join('\n'));
}).catch(console.error);
```

And when you run this script in the console you should see something like:

```
(a -> b) -> List a -> List b
(a -> b -> b) -> b -> List a -> b
a -> Maybe.Maybe a
Maybe.Maybe a
number
number -> number -> number
```

*N.B.:* Here you explicitly convert the received types descriptors to their `string`-type text-friendly versions—but before this conversion took place, they actually were very detailed and descriptive JavaScript objects. So, if you need more than just a boring string representation of a type, you may follow to the [Types API documentation](./Types.md), to know what exactly to expect from object representation of the type definition.

#### REPL Options

`Repl` constructor accepts several options:

* `workDir` — specify working directory for execution, for example where the `.elm` files you use are located, or where you have your `elm-package.json`;
* `elmVer` — the exact elm-version you use (default: `'0.18.0'`);
* `user` — your github username specified in `elm-package.json` (default: `'user'`);
* `package` — your project specified in `elm-package.json` (default: `'project'`);
* `packageVer` — the version of your project from `elm-package.json` (default: `'1.0.0'`);
* `keepTempFile` — for debugging purposes, if _truthy_, then do not delete `.elm` files after compilation;
* `keepElmiFile` — for debugging purposes, if _truthy_, then do not delete `.elmi` files after compilation;

It's not the only method of `Repl` class:

#### `Repl.getValues`

`Repl.getValues` returns the array of values in the same manner, so:

```javascript
var Repl = require('node-elm-repl');

new Repl({
    // ... your options
}).getValues(
    [ // imports:
        'List as L',
        'Maybe exposing ( Maybe(..) )'
    ],
    [ // expressions:
        'L.map',
        'Nothing',
        '1 + 1',
        '1.01',
        '"f"++"a"',
        '100 // 2'
        'L.range 1 4',
        '\\a b -> a + b'
    ]
).then(function(values) { // getValues returns the Promise which resolves to array
    console.log(values).join('\n');
}).catch(console.error);
```

will show in console:

```
<function>
Nothing
2
1.01
"fa"
[1,2,3,4]
50
<function>
```

#### `Repl.getTypesAndValues`

`Repl.getTypesAndValues` returns both types and values for the cases when you need both. In this moment the Node-REPL becomes as powerful as it's father and, can't resist to mention it again, at least three times faster.

```javascript
var Repl = require('node-elm-repl');

new Repl({
    // ... your options
}).getTypesAndValues(
    [ // imports:
        'List as L',
        'Maybe exposing ( Maybe(..) )'
    ],
    [ // expressions:
        'L.map',
        'Nothing',
        '1 + 1',
        '1.01',
        '"f"++"a"',
        '100 // 2'
        'L.range 1 4',
        '\\a b -> a + b'
    ]
).then(function(typesAndValues) { // getTypesAndValues returns the Promise which resolves to array
    var types = typesAndValues.types;
    var values = typesAndValues.values;
    types.forEach(function(type, idx) {
        // see ./Types.md for the details on every type definition
        console.log('TYPE', Repl.stringify(type), 'VALUE', values[idx]);
    });
}).catch(console.error);
```

Will output:

```
TYPE (a -> b) -> List a -> List b VALUE <function>
TYPE Maybe.Maybe a VALUE Nothing
TYPE number VALUE 2
TYPE Float VALUE 1.01
TYPE String VALUE "fa"
TYPE List Int VALUE [1,2,3,4]
TYPE Int VALUE 50
TYPE number -> number -> number VALUE <function>
```

#### `Repl.parseModule`

**NB**: `Repl.parseModule` could be not safe for usage, see [Security Notice](#security-notice) below.

`Repl.parseModule` allows you to parse the whole Elm Module and extract not only the types, but also imports and exports. Just point it to your directory with sources, and if you need to parse some nested module, put a dot between the names:

```javascript
var Repl = require('node-elm-repl');

new Repl({
    // the options may vary depending on environment
    elmVer: '0.18.0',
    workDir: './src'
})
.parseModule('MyModule') // or 'MyLib.MyModule' or 'Sub.Sub.Module'
.then(function(parsedModule) {
    console.dir(parsedModule, { depth: null });
});
```

Will output:

```javascript
{
    "version": {
        "major": 0,
        "minor": 18,
        "patch": 0
    },
    "package": {
        "name": "project",
        "user": "user"
    },
    "imports": [ ... <a-list-of-imports> ... ],
    "exports": [ ... <a-list-of-exports> ... ],
    "types": [ ... <a-list-of-types> ... ],
    ...
}
```

#### `Repl.parseLines`

`Repl.parseLines` does almost the same as `Repl.parseModule`, but creates the module file itself, filling it with the lines you provide and naming it with the name you provide.

It could be used like that:

```javascript
var Repl = require('node-elm-repl');

new Repl({
    // the options may vary depending on environment
    elmVer: '0.18.0',
    workDir: './src'
})
.parseLines([
    "import List",
    "",
    "myFun : number -> number -> List number",
    "myFun a b = ",
    "   [a] ++ [b]"
], 'MyModule')
.then(function(parsedModule) {
    console.dir(parsedModule, { depth: null });
});
```

The resulting object will have the same structure as the result for `Repl.parseModule` above.

#### `Repl.parseModuleText`

`Repl.parseModuleText` does almost the same as `Repl.parseModule`, but takes the module text and creates a file from it:

It could be used like that:

```javascript
var Repl = require('node-elm-repl');

new Repl({
    // the options may vary depending on environment
    elmVer: '0.18.0',
    workDir: './src'
})
.parseModuleText([
    "module MyModule exposing (..)",
    "",
    "import List",
    "",
    "myFun : number -> number -> List number",
    "myFun a b = ",
    "   [a] ++ [b]"
].join('\n'))
.then(function(parsedModule) {
    console.dir(parsedModule, { depth: null });
});
```

The resulting object will have the same structure as the result for `Repl.parseModule` above.

#### `Repl.stringify`

`Repl.stringify` is a static method exposed to help you get a friendly version of a [Type Definition Tree Structure](./Types.md). You may pass it the nested structure you received from any method described above, i.e.:

```javascript
new Repl(...).getTypes(...).then(function(types) {
    console.log(Repl.stringify(types[0]));
});
// > "number -> number -> List number"
new Repl(...).parseLines(...).then(function(parsedModule) {
    console.log(Repl.stringify(parsedModule.types[0].value));
});
// > "number -> number -> List number"
```

It is also possible to specify a custom specification on how to convert Type Structures to strings, so you may even achieve weird stuff like this:

```javascript
const mySpec = {
    'var': function(name) { return '<' + name + '>'; },
    'type': function(name, path) {
        return path ? '+ ' + path.join('..') + ' // ' + name + ' +'
                    : '- ' + name;
    },
    'aliased': function(name, path) {
        return path ? '{{ ' + path.join('^^') + ' --- ' + name + ' }}'
                    : '[[ ' + name + ' ]]';
    },
    'lambda': function(left, right) { return right + ' ::: ' + left; },
    'app': function(subject, object) { return subject + ' ** ' + object.join('_'); },
    'record': function(fields) {
        return '& ' + fields.map(function(pair) {
            return pair.name + ' >< ' + pair.value;
        }).join(' %% ') + ' &';
    }
};
new Repl(...).getTypes(...).then(function(types) {
    console.log(Repl.stringifyAll(types, mySpec));
});

/* Result:
> Platform ¯\_(ツ)_/¯ Program + ** > Basics ¯\_(ツ)_/¯ Never +_$model$_$msg$ :::
& model GG $model$ %% update GG $model$ ::: $model$ ::: $msg$ %% view GG {{ Html --- Html }} :::
$model$ & ::: <  List ** {{ Html --- Html }} ::: {{ Html --- Html }}
> A..B ¯\_(ツ)_/¯ AAA +
*/
```

See [Tests code](https://github.com/shamansir/node-elm-repl/blob/master/test/repl.spec.js#L184) for more examples.

#### `Repl.stringifyAll`

`Repl.stringifyAll` is a static method which is actually the shortcut for [`typesArray.map(Repl.stringify)`](#repl-stringify):

```javascript
new Repl(...).getTypes(...).then(Repl.stringifyAll);
// > [ "number -> number -> List number",
//     "...",
//     "...",
//     ...
//   ]
new Repl(...).parseLines(...).then(function(parsedModule) {
    console.log(
        Repl.stringifyAll(
            parsedModule.types.map(function(typeSpec) { return typeSpec.value; })
        )
    );
});
// > [ "number -> number -> List number",
//     "...",
//     "...",
//     ...
//   ]
```

`Repl.stringifyAll` accepts custom conversion specifications in the same manner as [`Repl.stringify`](#repl-stringify) does.

#### Types

See [Types section](./Types.md) to discover the detailed stucture of Imports, Exports and Types.

## How to use it with CLI?

When you install the package through NPM, CLI should be accessible as `node-elm-repl` binary, which is actually an alias for `node ./src/cli.js` (or just `./bin/cli` for UNIX environments), so you may safely replace one with another.

Run it without any arguments and you'll observe the detailed help.

Use `--from-module` parameter to extract types and values from any Elm module in a form of JSON.

Run `./bin/cli --from-module <your-module-name>`, let's try it with a test sample from this repository:

```
> ./bin/cli --from-module Anagram --work-dir ./test/samples/elm'
:: : a -> List a -> List a
detect : String -> List String -> List String
isAnagram : String -> String -> Maybe.Maybe String
sortChars : String -> String
> ./bin/cli --from-module Anagram --json --work-dir ./test/samples/elm
{ "package": ..., imports": ..., "exports": ..., "types": ..., "values": ... }
```

Another way to use it, is to create a file with expressions listed, the ones you need to be evaluated.

If you need imports, list them in the first line starting with `;` and splitting them with `;`.

For example (the contents of `src/cli-example`):

```
;List as L;Maybe exposing ( Maybe(..) );String
L.map
L.foldl
Just
Nothing
1 + 1
\a b -> a + b
```

Then run `node-elm-repl --from <your-file-name>`, `node-elm-repl --from ./src/cli-example` in this case.

And you should get:

```
(a -> b) -> List a -> List b
(a -> b -> b) -> b -> List a -> b
a -> Maybe.Maybe a
Maybe.Maybe a
number
number -> number -> number
```

Or, if you want to get JSON in response, just add `--json` flag.

Repl-CLI accepts different options:

General ones:

* `--from` — specify a file name to extract all the types, imports and exports from it (intended to be used as a replacement for `--from-module`);
* `--from-module` — specify a module name to extract all the types, imports and exports from it (intended to be used as a replacement for `--from`);
* `--json` — do not stringify the result, but output to JSON;
* `--work-dir` — specify working directory for execution, for example where the `.elm` files you use are located, or where you have your `elm-stuff` and `elm-package.json`;
* `--elm-ver` — the exact elm-version you use (default: `'0.18.0'`);
* `--user` — your username specified in `elm-package.json` (default: `'user'` or the one specified in `elm-package.json`);
* `--package` — your project specified in `elm-package.json` (default: `'project'` or the one specified in `elm-package.json`);
* `--package-ver` — the version of your project from `elm-package.json` (default: `'1.0.0'`);
* `--keep-temp-file` — for debugging purposes, if specified, then do not delete `.elm` files after compilation;
* `--keep-elmi-file` — for debugging purposes, if specified, then do not delete `.elmi` files after compilation;
* `--show-time` — additionally report the time was spent to extract types, works with `--from` only;
* `--module-info` — show module information: imports, exports, when called with `--from-module` without `--json` flag,
* `--with-values` — include values into the output (takes more time to extract them), works with `--from` only;
* `--only-values` — report and extract only values, not the types (overrides `--with-values`), works with `--from` only;
* `--values-below` — has sense only when `--with-values` was used: instead of putting types and values in lines like `TYPE<TAB>VALUE`, put a list of values line-by-line below the list of types: could be useful for parsing, works with `--from` only;

## How to contribute?

Write a test which fails with `npm run test`, file an issue, fork the repository, make a pull request — just any of that or all together will help.

# Security notice

**NB!**

Please note that the code of the modules you pass to `parseModule` is later executed using `exec` function of `child_process` and without sanitization, so that compiled Elm code would not be improperly transformed. This could lead to CWE-77 [1] known as arbitrary command injection.

Thanks for the NodeMedic-FINE project for noticing about the potentional security issue.

[1] [[https://cwe.mitre.org/data/definitions/77.html][https://cwe.mitre.org/data/definitions/77.html]]
[2] [[https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback][https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback]]