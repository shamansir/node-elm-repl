# node-elm-repl

* [Intro](#intro)
* [Installation](#installation)
* [Description](#description)
* [Running tests](#running-tests)
* [How to use it with Node.js? (JS API)](#how-to-use-it-with-nodejs)
* [How to deconstruct Type Definitions in JS? (JS API)](./Types.md) (_separate page_)
* [How to use it with CLI? (Command-Line API)](#how-to-use-it-with-cli)
* [How to contribute?](#how-to-contribute)
* [How it was done?](./Story.md) (_separate page_)

# Intro

Actually the name may confuse you, so I would make it clear from the start, that _technically_ what you see here is **TOTALLY NOT** the REPL. At least, by itself. It is _the replacement_ for the REPL for those who need to know evaluated values together with their types in their entirety (not just strings, but a structures defining the type, like... types AST) for Elm expressions in JavaScript environment. Also, this tool may help you make some REPL... in JavaScript.

So, this tool would help you if, and only if, all of these points satisfy:

* You are interested in Elm language;
* You are writing something in JavaScript for the Elm Language, for example a plugin for some Electron-driven IDE / Code Editor;
* In JavaScript, you need to know the values and/or the returned [structured types definitions](./Types.md) of several Elm expressions with a single `elm-make` compilation cycle (for the moment, one cycle takes about 200-300ms in average, except rare first-run cases, taking up to 3 seconds);
* Also, you are willing to do everything mentioned above _offline_, both for you and the user (except the case when `elm-make` auto-downloads required packages);

And, a binary parser grammar for the `.elmi` files [is just lying here](https://github.com/shamansir/node-elm-repl/blob/master/elmi.grammar),s in case you need it. Though it is for [Synalize it!](https://www.synalysis.net/) and it is XML. Sorry. I need to make a PEG Grammar out of it, sometimes.

So if those points satisfy for you, but you are still uncertain if you need this, please read [This Very Article](medium.com/@shaman_sir/modern-binary-reverse-engineering-with-node-js-for-elm-bd7546853e43) (written by me) which describes in the detailed details, what is done here. Another way for you, in this case, is just to [use this binary tool](https://github.com/stoeffel/elm-interface-to-json) which was developed later than this one, and which is driven by Haskell (which is an advantage), so has a compiled binary (which is an advantage) and uses the "core" code to get type (which is an advantage), but has no ability to get values (which is whatever) and only has types in their stringified form (which is a disadvantage, but may be implementing it for an author is just a matter of time).

In short, when you use this:

```javascript
new Repl({ elmVer: '0.18.0' })
    .getTypes([], [ '1 + 1', '\\a b -> a + b' ])
    .then(types => console.dir(types, { depth: null }));
```

You get this:

```javascript
[ { type: "var", name: "number" },
  { type: "lambda",
    left: { type: "var", name: "number" },
    right:
     { type: "lambda",
       left: { type: "var", name: "number" },
       right: { type: "var", name: "number" } } } ]
```

Or when you use this:

```javascript
new Repl({ elmVer: '0.18.0' })
    .getTypesAndValues([], [ '1 + 1', '\\a b -> a + b' ])
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

> *NB:* When `elm-stuff` was cleaned up, the very first call to `elm-make` in this directory takes longer than 2 seconds since it checks package availability and installs them sometimes, so the very first test always takes much longer than other 33 tests, which in their case are satisfyingly fast; so please take into consideration that `elm-stuff` is cleaned for every test run and timeout is set to 5 seconds just to make tests fair for clean environment, but there's a high chance that in your environment you won't clean up `elm-stuff` so frequently, so absolutely any call should take less than 500ms.

> You may see it for yourself, if in `package.json` you replace:

```javascript
"scripts": {
    "test": "cd ./test/samples/elm/ && rm -Rf ./elm-stuff && elm-package install --yes && cd ../../.. && mocha -t 5000 ./test/*.spec.js"
}
```

> With just (no `elm-stuff` removal):

```javascript
"scripts": {
    "test": "cd ./test/samples/elm/ && elm-package install --yes && cd ../../.. && mocha -t 5000 ./test/*.spec.js"
}
```

> And then run `npm test` several times, only the first time among these calls will take so much time, while all the next ones will run much-much faster.

> *End of NB.*

## How to use it in Node.js environment?

You may easily install the project using:

```
npm install node-elm-repl
```

Then, in your JS file, and in the same directory where you have `elm-package.json` or where you store your `.elm` modules, if you have any, just do something like:

```javascript
var Repl = require('node-elm-repl');

new Repl({ // options, defaults are listed:
    workDir: '.', // working directory
    elmVer: '0.18.0', // your exact elm-compiler version
    user: 'user', // specify github username you used in elm-package.json
    project: 'project', // specify project name you used in elm-package.json
    projectVer: '1.0.0' // specify project version you used in elm-package.json
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

*N.B.:* Here you manually convert the received types descriptors to their `string`-type text-friendly versions—but before this conversion took place, they actually were very detailed and descriptive JavaScript objects. So, if you need more than just a boring string representation of a type, you may follow to the [Types API documentation](./Types.md), to know what exactly to expect from object representation of the type definition.

`Repl` constructor accepts several options:

* `workDir` — specify working directory for execution, for example where the `.elm` files you use are located, or where you have your `elm-package.json`;
* `elmVer` — the exact elm-version you use (default: `'0.18.0'`);
* `user` — your github username specified in `elm-package.json` (default: `'user'`);
* `project` — your github project specified in `elm-package.json` (default: `'project'`);
* `projectVer` — the version of your project from `elm-package.json` (default: `'1.0.0'`);
* `keepTempFile` — for debugging purposes, if _truthy_, then do not delete `.elm` files after compilation;
* `keepElmiFile` — for debugging purposes, if _truthy_, then do not delete `.elmi` files after compilation;

It's not the only method of `Repl` class:

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

## How to use it with CLI?

CLI interface is a bit different, to use it, you need to create a file with expressions listed.

When you install the package through NPM, CLI should be accessible as `node-elm-repl` binary, which is actually an alias for `node ./src/cli.js`, so you may safely replace one with another.

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

Repl-CLI accepts several options:

* `--work-dir` — specify working directory for execution, for example where the `.elm` files you use are located, or where you have your `elm-package.json`;
* `--elm-ver` — the exact elm-version you use (default: `'0.18.0'`);
* `--user` — your github username specified in `elm-package.json` (default: `'user'`);
* `--project` — your github project specified in `elm-package.json` (default: `'project'`);
* `--project-ver` — the version of your project from `elm-package.json` (default: `'1.0.0'`);
* `--keep-temp-file` — for debugging purposes, if specified, then do not delete `.elm` files after compilation;
* `--keep-elmi-file` — for debugging purposes, if specified, then do not delete `.elmi` files after compilation;
* `--show-time` — additionally report the time was spent to extract types;
* `--with-values` — include values into the output (takes more time to extract them);
* `--only-values` — report and extract only values, not the types (overrides `--with-values`);
* `--values-below` — has sense only when `--with-values` was used: instead of putting types and values in lines like `TYPE<TAB>VALUE`, put a list of values line-by-line below the list of types: could be useful for parsing;

## How to contribute?

Write a test which fails with `npm test`, file an issue, fork the repository, make a pull request — just any of that or all together will help.
