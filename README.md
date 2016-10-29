# node-elm-repl

This package is a very specific weird package.

So if you (yet) don't care about [Elm language](http://elm-lang.org), you shouldn't be interested. Actually, even if you are a big fan of the [Elm language](http://elm-lang.org) (like me, since 0.15), there's totally no guarantee that this package could be interesting to you too.

Why? Because it actually does exactly what [`elm-repl`](https://github.com/elm-lang/elm-repl) does. Even less. It just gets the types of expressions, no values. But... what... changes... everything... is... this package does it completely in node.js!!

And it calculates all the expressions types you asked for just with one single call of `elm-make` (original `elm-repl` currently recompiles everything on every new input).

This makes this REPL three times faster and three times awesomer, since it gives you access to the JSONified structure of the type, instead of just string.

## How to use it with Node.js?



## How to use it with CLI?



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

So when user asks for types several expressions, we put all of them in one single `.elmi` file instead, and each expression gets its own variable and only one `elm-make` call is required to know the types for all of them as a response. Though it also requires to binary-parse this `.elmi` file (in `src/parser.js` you may find this parser), anyway it is much faster than original way.

For the moments, tests for a packs of 10 expressions run from 30ms to 200ms each. More benchmarking later.

_Interesting fact_: If you remove `elm-html` dependency from `elm-package.json` in `test/samples/elm` and disable the corresponding tests for `Html` package, all other tests now run from 10ms to 90ms!

Thanks to Mukesh @mukeshsoni Soni for huge-helping me in my findings, and leading me through trials and errors!

Probably it was a stupid idea, but at least it was fun.
