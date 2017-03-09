# node-elm-repl

* [Installation](#installation)
* [Description](#description)
* [How to use it with Node.js?](#how-to-use-it-with-nodejs)
* [How to use it with CLI?](#how-to-use-it-with-cli)
* [How to contribute?](#how-to-contribute)
* [How it was done?](#how-it-was-done)

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

NB: It's work-in-progress, so at some moment you could discover that it parses no records, for example (just for example, of course it parses records!) or something even worse. If you find such case, please don't panic, please just follow at least some of the steps described in [Contribute](#how-to-contribute) section.

![Example from CLI](https://raw.githubusercontent.com/shamansir/node-elm-repl/master/img/cli-example.png)

## How to use it with Node.js?

You may easily install the project using:

```
npm install git://github.com/shamansir/node-elm-repl.git
```

It's better to ensure that binary parser works with your elm version etc.,
so please first run this in the directory where you've installed the package:

```
npm test
```

> *NB:* When `elm-stuff` was cleaned up, the very first call to `elm-make` in this directory takes longer than 2 seconds, so the very first test always takes much longer than other 33 tests, which in their case are satisfyingly fast; so please take into consideration that `elm-stuff` is cleaned for every test run and timeout is set to 5 seconds just to make tests fair for clean environment, but there's a high chance that in your environment you won't do it so frequently, so absolutely any call should take less than 500ms.

> You may see it for yourself, if in `package.json` you replace:

```javascript
"scripts": {
    "test": "cd ./test/samples/elm/ && rm -Rf ./elm-stuff && elm-package install --yes && cd ../../.. && mocha -t 5000 ./test/*.spec.js"
}
```

> With just:

```javascript
"scripts": {
    "test": "cd ./test/samples/elm/ && elm-package install --yes && cd ../../.. && mocha -t 5000 ./test/*.spec.js"
}
```

> And then run `npm test` several times, only the first time among these calls will take so much time, while all the next ones will run much-much faster.

> *End of NB.*

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
).then(function(typesAndValues) { // getValues returns the Promise which resolves to array
    var types = typesAndValues.types;
    var values = typesAndValues.values;
    types.forEach(function(type, idx) {
        console.log('TYPE', type, 'VALUE', value);
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

Then run `node-elm-repl --from <your-file-name>`, `node-elm-repl ./src/cli-example` in this case.

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

## How it was done?

Elm language has no reflection for the moment, and sometimes you need to know a type of a variable or lambda, or a partial application or... If you are still reading this, you know exactly which cases I mean.

You could use some AST parser for that, but AST is not storing variables-to-types maps, it only allows you to know *what* is this expression, not the types of the variables it was made from, unless you get AST of all the user files and it sounds huge.

You could use `elm-repl` CLI, but it was made for other purposes and for the moment it's quite slow. And anyway, you still need to parse the output.

So I decided to dig into how `elm-repl` works. For the moment, the scenario is:

- Take new input expression;
- Append it to all the imports executed before, so imports will go first;
- Assign a variable to your expression (easter-egg from Evan here);
- Put everything in a temporary `.elm` file;
- Compile this file with `elm-make`;
- Go into `elm-stuff/build-artifacts/blah/blah/` and find the corresponding `.elmi` file there (which is binary!);
- Parse this file with the same Haskell code which compiled it and so extract the variable type from it;
- Also, take the value of this expression by executing compiled `.js` file;

This all takes a lot of time!

So I decided to parse this `.elmi` file with node.js, since its structure turned out not to be very complex (a bit complex, but not too very). You may see some screenshots of reverse-engineering in the process in the `./img` folder.

Then I've searched trough several existing binary parsers for node.js. First I've tried [`node-binary` from @substack](https://github.com/substack/node-binary), it was nice, but also it had several limitations, so I've switched to [`binary-parser` from @keichi](https://github.com/keichi/binary-parser). Though it was also unable to do recursion, so I was required to [fork it](https://github.com/keichi/binary-parser) and add it manually. Finally, the parser satisfied all my needs. (Note to myself: also consider trying [Node Packet](http://bigeasy.github.io/node-packet/)).

So when user asks for types several expressions, we put all of them in one single `.elmi` file instead, and each expression gets its own variable and only one `elm-make` call is required to know the types for all of them as a response. Though it also requires to binary-parse this `.elmi` file (in `src/parser.js` you may find this parser), anyway it is much faster than original way.

For the moments, tests for a packs of 10 expressions run from 30ms to 200ms each. More benchmarking later.

_Interesting fact_: If you remove `elm-html` dependency from `elm-package.json` in `test/samples/elm` and disable the corresponding tests for `Html` package, all other tests now run from 10ms to 90ms!

P.S. Only today (2 Nov 2016), when everything was almost finished, while digging into some creepy `.elmi` file, I've found a nice tool named [Synalize it!](https://www.synalysis.net/) a.k.a. [Hexinator](https://hexinator.com/) which allows to build grammars for binary files in a nice visual way. You may find the resulting grammar right in the repository, under the name [`elmi.grammar`](https://github.com/shamansir/node-elm-repl/blob/master/elmi.grammar).

P.P.S. Actually, with [update to Elm v0.18](https://github.com/shamansir/node-elm-repl/pull/3), one compilation cycle became a bit slower in my configuration (200-300ms instead of 60-120ms before), but it's surely not the REPL fault.

Thanks to Mukesh @mukeshsoni Soni for huge-helping me in my findings, and leading me through trials and errors!

Probably it was a stupid idea, but at least it was fun.
