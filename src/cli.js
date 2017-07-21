const Repl = require('./repl.js');

var argv = require('minimist')(process.argv.slice(2));

if (!argv.from) {
    console.log('');
    console.log('Node-Elm-REPL.');
    console.log('');
    console.log('Prepare a file and put all your elm expressions there, line by line');
    console.log('If you need imports, list them in the first line starting with `;` and splitting them with `;`');
    console.log('');
    console.log('For example (the contents of `src/cli-example`):');
    console.log('');
    console.log(';List as L;Maybe exposing ( Maybe(..) );String');
    console.log('L.map');
    console.log('L.foldl');
    console.log('Just');
    console.log('Nothing');
    console.log('1 + 1');
    console.log('\\a b -> a + b');
    console.log('');
    console.log('Then run `node src/cli.js --from <your-file-name>`');
    console.log('');
    console.log('And you should get:');
    console.log('');
    console.log('(a -> b) -> List a -> List b');
    console.log('(a -> b -> b) -> b -> List a -> b');
    console.log('a -> Maybe.Maybe a');
    console.log('Maybe.Maybe a');
    console.log('number');
    console.log('number -> number -> number');
    console.log('');
    console.log('Other options:');
    console.log('--work-dir — specify working directory for execution, for example where the `.elm` files you use are located');
    console.log('--elm-ver — exact elm-version you use (default: 0.18.0), required to be known if you import your own modules');
    console.log('--user — your username specified in elm-package.json (default: user), required to be known if you import your own modules');
    console.log('--package — your project specified in elm-package.json (default: project), required to be known if you import your own modules');
    console.log('--package-ver — your project version specified in elm-package.json (default: 1.0.0), required to be known if you import your own modules');
    console.log('--show-time — show how much time it took to convert everyting');
    console.log('--with-values — include values into the output (takes more time to extract them)');
    console.log('--only-values — report and extract only values, not the types (overrides --with-values)');
    console.log('--values-below — has sense only when --with-values was used: instead of putting types and values in lines like TYPE<TAB>VALUE, put a list of values line-by-line below the list of types: could be useful for parsing');
    console.log('--temp-file-name — specify file name of the generated Elm');
    console.log('');
} else {

    const readFile = require('fs-readfile-promise');

    const repl = new Repl({
        workDir: argv['work-dir'] || null,
        elmVer: argv['elm-ver'] || null,
        user: argv['user'] || null,
        package: argv['package'] || null,
        packageVer: argv['package-ver'] || null,
        keepTempFile: argv.hasOwnProperty('keep-temp') || false,
        keepElmiFile: argv.hasOwnProperty('keep-elmi') || false,
        tempFileName: argv['temp-file-name'] || null
    });

    const showTime = argv['show-time'];

    const startTime = new Date().getTime();
    var afterReadTime;

    var valuesBelow = argv.hasOwnProperty('values-below') || false;
    var withValues = argv.hasOwnProperty('with-values') || false;
    var onlyValues = argv.hasOwnProperty('only-values') || false;

    readFile(argv.from)
           .then(function(buffer) {
               var lines = buffer.toString().split('\n');
               const imports = (lines[0].indexOf(';') === 0) ? lines.shift().split(';').slice(1) : [];
               const expressions = lines.slice(0,-1);
               return {
                   imports: imports,
                   expressions: expressions
               };
           }).then(function(spec) {
               afterReadTime = new Date().getTime();
               if (!onlyValues && !withValues) {
                   return repl.getTypes(spec.imports, spec.expressions);
               } else if (onlyValues) {
                   return repl.getValues(spec.imports, spec.expressions);
               } else if (withValues) {
                   return repl.getTypesAndValues(spec.imports, spec.expressions);
               }
           }).then(function(response) {
               const convertTime = new Date().getTime();
               if (!onlyValues && !withValues) {
                   console.log(Repl.stringifyAll(response).join('\n'));
               } else if (onlyValues) {
                   console.log(response.join('\n'));
               } else if (withValues) {
                   if (valuesBelow) {
                       console.log(Repl.stringifyAll(response.types).join('\n'));
                       console.log(response.values.join('\n'));
                   } else {
                       var allTypes = Repl.stringifyAll(response.types);
                       var allValues = response.values;
                       console.log(allTypes.map(function(type, idx) {
                           return type + '\t' + allValues[idx];
                       }).join('\n'));
                   }
               }
               const finishTime = new Date().getTime();
               if (showTime) {
                   console.log('-----------');
                   console.log('Time to read source file: ' + getNiceTime(afterReadTime - startTime));

                   if (!onlyValues && !withValues) {
                       console.log('Time to parse binary and return types: ' + getNiceTime(convertTime - afterReadTime));
                   } else if (onlyValues) {
                       console.log('Time to extract values: ' + getNiceTime(convertTime - afterReadTime));
                   } else if (withValues) {
                       console.log('Time to parse binary, execute js and extract both types and values: ' + getNiceTime(convertTime - afterReadTime));
                   }

                   if (!onlyValues) console.log('Time to stringify types: ' + getNiceTime(finishTime - convertTime));
                   console.log('Altogether: ' + getNiceTime(finishTime - startTime));
               }
           }).catch(function(e) {
               process.exitCode = 1;
               console.log(e);
               console.log('ERROR.');
               throw e;
           });

    function getNiceTime(time) {
        const seconds = Math.floor(time / 1000);
        return (seconds > 0) ? seconds + 's ' + (time % 1000) + 'ms'
                             : (time % 1000) + 'ms';
    }
}
