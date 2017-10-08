#! /usr/bin/env node

const Repl = require('./repl.js');
const helpText = require('./cli-help.js');

const argv = require('minimist')(process.argv.slice(2));

if (!argv.from && !argv.fromModule) {

    console.info('');
    console.info('No input was defined. Please specify either a file with expressions using --from parameter or a module name using --from-module.');

    showHelp();

} else {

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
    let afterReadTime;

    if (argv.from) {

        const valuesBelow = argv.hasOwnProperty('values-below') || false;
        const withValues = argv.hasOwnProperty('with-values') || false;
        const onlyValues = argv.hasOwnProperty('only-values') || false;

        const readFile = require('fs-readfile-promise');

        readFile(argv.from)
            .then(function(buffer) {
                const lines = buffer.toString().split('\n');
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

                if (!argv.json) { // output as a raw text

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

                } else { // use JSON

                    if (!onlyValues && !withValues) {
                        console.log(JSON.stringify({ types: response }));
                    } else if (onlyValues) {
                        console.log(JSON.stringify({ values: response }));
                    } else if (withValues) {
                        console.log(JSON.stringify(response));
                    }

                }

                const finishTime = new Date().getTime();
                if (showTime) {
                    console.info('-----------');
                    console.info('Time to read source file: ' + getNiceTime(afterReadTime - startTime));

                    if (!onlyValues && !withValues) {
                        console.info('Time to parse binary and return types: ' + getNiceTime(convertTime - afterReadTime));
                    } else if (onlyValues) {
                        console.info('Time to extract values: ' + getNiceTime(convertTime - afterReadTime));
                    } else if (withValues) {
                        console.info('Time to parse binary, execute js and extract both types and values: ' + getNiceTime(convertTime - afterReadTime));
                    }

                    if (!onlyValues) console.info('Time to stringify types: ' + getNiceTime(finishTime - convertTime));
                    console.info('Altogether: ' + getNiceTime(finishTime - startTime));
                }
            }).catch(logAndThrowError);

    } else if (argv.fromModule) {

        repl.parseModule(argv.fromModule)
            .then(parsedModule => {
                //if (argv.json) {
                    //console.prettyJSON(parsedModule);
                    console.log(JSON.stringify(parsedModule));
                //}
            })
            .catch(logAndThrowError);

    } else {

        console.info('');
        console.info('No input was defined. Please specify either a file with expressions using --from parameter or a module name using --from-module.');

        showHelp();

    }

}

function getNiceTime(time) {
    const seconds = Math.floor(time / 1000);
    return (seconds > 0) ? seconds + 's ' + (time % 1000) + 'ms'
                         : (time % 1000) + 'ms';
}

function showHelp() {
    helpText.forEach(function(helpLine) {
        console.info(helpLine);
    });
}

function logAndThrowError(err) {
    process.exitCode = 1;
    console.error(err);
    console.log('ERROR.');
    throw e;
}
