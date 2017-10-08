const Repl = require('./repl.js');
const helpText = require('./cli-help.js');

const argv = require('minimist')(process.argv.slice(2));
const out = require('cli-output');

if (!argv.from && !argv.fromModule) {

    out.info('');
    out.info('No input was defined. Please specify either a file with expressions using --from parameter or a module name using --from-module.');

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
                        out.info(Repl.stringifyAll(response).join('\n'));
                    } else if (onlyValues) {
                        out.info(response.join('\n'));
                    } else if (withValues) {
                        if (valuesBelow) {
                            out.info(Repl.stringifyAll(response.types).join('\n'));
                            out.info(response.values.join('\n'));
                        } else {
                            var allTypes = Repl.stringifyAll(response.types);
                            var allValues = response.values;
                            out.info(allTypes.map(function(type, idx) {
                                return type + '\t' + allValues[idx];
                            }).join('\n'));
                        }
                    }

                } else { // use JSON

                    if (!onlyValues && !withValues) {
                        out.rawJSON({ types: response });
                    } else if (onlyValues) {
                        out.rawJSON({ values: response });
                    } else if (withValues) {
                        out.rawJSON(response);
                    }

                }

                const finishTime = new Date().getTime();
                if (showTime) {
                    out.info('-----------');
                    out.info('Time to read source file: ' + getNiceTime(afterReadTime - startTime));

                    if (!onlyValues && !withValues) {
                        out.info('Time to parse binary and return types: ' + getNiceTime(convertTime - afterReadTime));
                    } else if (onlyValues) {
                        out.info('Time to extract values: ' + getNiceTime(convertTime - afterReadTime));
                    } else if (withValues) {
                        out.info('Time to parse binary, execute js and extract both types and values: ' + getNiceTime(convertTime - afterReadTime));
                    }

                    if (!onlyValues) out.info('Time to stringify types: ' + getNiceTime(finishTime - convertTime));
                    out.info('Altogether: ' + getNiceTime(finishTime - startTime));
                }
            }).catch(logAndThrowError);

    } else if (argv.fromModule) {

        repl.parseModule(argv.fromModule)
            .then(parsedModule => {
                //if (argv.json) {
                    //out.prettyJSON(parsedModule);
                    out.rawJSON(parsedModule);
                //}
            })
            .catch(logAndThrowError);

    } else {

        out.info('');
        out.info('No input was defined. Please specify either a file with expressions using --from parameter or a module name using --from-module.');

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
        out.info(helpLine);
    });
}

function logAndThrowError(err) {
    process.exitCode = 1;
    out.error(err);
    out.log('ERROR.');
    throw e;
}
