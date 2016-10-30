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
    console.log('--show-time — show how much time it took to convert everyting');
    console.log('--work-dir — specify working directory for execution, for example where the `.elm` files you use are located');
    console.log('--elm-ver — exact elm-version you use (default: 0.17.1), required to be known if you import your own modules');
    console.log('--user — your github username specified in elm-package.json (default: user), required to be known if you import your own modules');
    console.log('--project — your github project specified in elm-package.json (default: project), required to be known if you import your own modules');
    console.log('--project-ver — your project version specified in elm-package.json (default: project), required to be known if you import your own modules');
    console.log('');
} else {

    const readFile = require('fs-readfile-promise');

    const repl = new Repl({
        workDir: argv['work-dir'],
        elmVer: argv['elm-ver'],
        user: argv['user'],
        project: argv['project'],
        projectVer: argv['project-ver'],
        keepTempFile: argv.hasOwnProperty('keep-temp') || false,
        keepElmiFile: argv.hasOwnProperty('keep-elmi') || false
    });

    const showTime = argv['show-time'];

    const startTime = new Date().getTime();
    var afterReadTime;

    readFile(argv.from)
           .then(function(buffer) {
               var lines = buffer.toString().split('\n');
               const imports = (lines[0].indexOf(';') === 0) ? lines.shift().split(';').slice(1) : [];
               const expressions = lines.slice(0,-1);
               return {
                   imports: imports,
                   expressions: expressions
               }
           }).then(function(spec) {
               afterReadTime = new Date().getTime();
               return repl.getTypes(spec.imports, spec.expressions);
           }).then(function(types) {
               const convertTime = new Date().getTime();
               console.log(Repl.stringifyAll(types).join('\n'));
               const finishTime = new Date().getTime();
               if (showTime) {
                   console.log('-----------');
                   console.log('Time to read source file: ' + getNiceTime(afterReadTime - startTime));
                   console.log('Time to parse binary and return types: ' + getNiceTime(convertTime - afterReadTime));
                   console.log('Time to stringify types: ' + getNiceTime(finishTime - convertTime));
                   console.log('Altogether: ' + getNiceTime(finishTime - startTime));
               }
           }).catch(console.error);

    function getNiceTime(time) {
        const seconds = Math.floor(time / 1000);
        return (seconds > 0) ? seconds + 's ' + (time % 1000) + 'ms'
                             : (time % 1000) + 'ms';
    }
}
