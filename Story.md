## How it was done?

_N.B.:_ Below is actually the short summary of [this article](medium.com/@shaman_sir/modern-binary-reverse-engineering-with-node-js-for-elm-bd7546853e43), so you may prefer something with images and a plot to this bunch of the boring hard-to-read paragraphs below. The text below was written before the article, if that's important. Sure it is.

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
