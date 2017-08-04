const elmiParser = require('./parser.js');
const Types = require('./types.js');

const fs = require('fs');
const cp = require('child_process');

const DEFAULT_ELM_VER = '0.18.0';
const DEFAULT_USER = 'user';
const DEFAULT_PACKAGE = 'project';
const DEFAULT_PACKAGE_VER = '1.0.0';

function Repl(options) {
    this.options = options || {};
    /*if (!this.options.user || !this.options.package) {
        this.options = injectOptionsFromPackageJson(options);
    }*/
}

Repl.Parser = elmiParser;

let lastIteration = 0;
Repl.prototype.getTypes = function(imports, expressions) {
    const varsMap = mapToVariables(expressions);
    const varsNames = Object.keys(varsMap);

    const elmVer = this.options.elmVer || DEFAULT_ELM_VER;
    const workDir = this.options.workDir;

    const keepTempFile = this.options.keepTempFile || false;
    const keepElmiFile = this.options.keepElmiFile || false;

    const currentIteration = lastIteration + 1;
          lastIteration = currentIteration;

    const initialDir = process.cwd();

    const tempFilePath = getTempFilePath(this.options, currentIteration);
    const tempElmiPath = getTempElmiPath(this.options, currentIteration);

    return new Promise(
        function(resolve, reject) {
            const firstLines = [ 'module NodeRepl' + currentIteration + ' exposing (..)' ]
                .concat(imports.map(function(_import) {
                    return _import ? ('import ' + _import) : '';
                }));
            const fileContent = firstLines.concat(['']).concat(
                varsNames.map(function(varName) {
                    return varName + ' = (' + varsMap[varName] + ')';
                })
            );
            if (workDir) process.chdir(workDir);
            fs.writeFileSync(tempFilePath, fileContent.join('\n') + '\n');
            cp.execSync('elm-make --yes ' + tempFilePath, { cwd: process.cwd() });
            resolve();
        }.bind(this)
    ).then(function() {
        if (!keepTempFile) fs.unlinkSync(tempFilePath);
        const buffer = fs.readFileSync(tempElmiPath);
        return elmiParser.parse(buffer);
    }).then(function(parsedIface) {
        if (!keepElmiFile) fs.unlinkSync(tempElmiPath);
        if (workDir) process.chdir(initialDir);
        return new Types(parsedIface).findAll(varsNames);
    }).catch(function(e) {
        if (workDir) process.chdir(initialDir);
        throw e;
    });
}

Repl.prototype.getValues = function(imports, expressions) {
    const varsMap = mapToVariables(expressions);
    const varsNames = Object.keys(varsMap);

    const elmVer = this.options.elmVer || DEFAULT_ELM_VER;
    const workDir = this.options.workDir;

    const keepTempFile = this.options.keepTempFile || false;
    const keepElmiFile = this.options.keepElmiFile || false;

    const currentIteration = lastIteration + 1;
          lastIteration = currentIteration;

    const initialDir = process.cwd();

    const tempFilePath = getTempFilePath(this.options, currentIteration);
    const tempElmiPath = getTempElmiPath(this.options, currentIteration);
    const jsOutputPath = getJsOutputPath(this.options, currentIteration);

    const tempModuleName = getTempModuleName(this.options, currentIteration);

    return new Promise(
        function(resolve, reject) {
            const firstLines = [ 'port module ' + tempModuleName + ' exposing (..)' ]
                .concat(imports.map(function(_import) {
                        return _import ? ('import ' + _import) : '';
                    })
                ).concat([
                    'import Platform exposing (..)',
                    'import Json.Decode', '',
                ]);
            const fileContent = firstLines.concat(
                varsNames.map(function(varName) {
                    return varName + ' = (' + varsMap[varName] + ')';
                })
            ).concat(VALUES_EXTRACTION_INTRO)
             .concat(getValuesExtractionBody(varsNames))
             .concat(VALUES_EXTRACTION_OUTRO);
            if (workDir) process.chdir(workDir);
            fs.writeFileSync(tempFilePath, fileContent.join('\n') + '\n');
            cp.execSync('elm-make --yes ' + tempFilePath + ' --output ' + jsOutputPath,
                { cwd: process.cwd() });
            resolve();
        }.bind(this)
    ).then(function() {
        if (!keepTempFile) fs.unlinkSync(tempFilePath);
        const srcJsContent = fs.readFileSync(jsOutputPath);
        const targetJsContent = Buffer.concat([
            srcJsContent,
            new Buffer(getValuesExtractionJs(tempModuleName).join('\n'))
        ]);
        fs.writeFileSync(jsOutputPath, targetJsContent + '\n');
        const cp = require('child_process');
        return new Promise(function(resolve, reject) {
            const childProcess = cp.fork(jsOutputPath, { silent: true });
            let allValues;
            childProcess.stdout.on('data', function(data) {
                allValues = JSON.parse(data.toString()).out;
            });
            childProcess.on('error', reject);
            childProcess.on('exit', function() {
                if (workDir) process.chdir(initialDir);
                resolve(allValues || []);
            });
        });
    }).catch(function(e) {
        if (workDir) process.chdir(initialDir);
        throw e;
    });
}

Repl.prototype.getTypesAndValues = function(imports, expressions) {
    const varsMap = mapToVariables(expressions);
    const varsNames = Object.keys(varsMap);

    const elmVer = this.options.elmVer || DEFAULT_ELM_VER;
    const workDir = this.options.workDir;

    const keepTempFile = this.options.keepTempFile || false;
    const keepElmiFile = this.options.keepElmiFile || false;

    const currentIteration = lastIteration + 1;
          lastIteration = currentIteration;

    const initialDir = process.cwd();

    const tempFilePath = getTempFilePath(this.options, currentIteration);
    const tempElmiPath = getTempElmiPath(this.options, currentIteration);
    const jsOutputPath = getJsOutputPath(this.options, currentIteration);

    const tempModuleName = getTempModuleName(this.options, currentIteration);

    return new Promise(
        function(resolve, reject) {
            const firstLines = [ 'port module ' + tempModuleName + ' exposing (..)' ]
                .concat(imports.map(function(_import) {
                        return _import ? ('import ' + _import) : '';
                    })
                ).concat([
                    'import Platform exposing (..)',
                    'import Json.Decode', ''
                ]);
            const fileContent = firstLines.concat(
                varsNames.map(function(varName) {
                    return varName + ' = (' + varsMap[varName] + ')';
                })
            ).concat(VALUES_EXTRACTION_INTRO)
             .concat(getValuesExtractionBody(varsNames))
             .concat(VALUES_EXTRACTION_OUTRO);
            if (workDir) process.chdir(workDir);
            fs.writeFileSync(tempFilePath, fileContent.join('\n') + '\n');
            cp.execSync('elm-make --yes ' + tempFilePath + ' --output ' + jsOutputPath,
                { cwd: process.cwd() });
            resolve(jsOutputPath);
        }.bind(this)
    ).then(function(jsOutputPath) {
        if (!keepTempFile) fs.unlinkSync(tempFilePath);
        const buffer = fs.readFileSync(tempElmiPath);
        return elmiParser.parse(buffer);
    }).then(function(parsedIface) {
        if (!keepElmiFile) fs.unlinkSync(tempElmiPath);
        return new Types(parsedIface).findAll(varsNames);
    }).then(function(allTypes) {
        const srcJsContent = fs.readFileSync(jsOutputPath);
        const targetJsContent = Buffer.concat([
            srcJsContent,
            new Buffer(getValuesExtractionJs(tempModuleName).join('\n'))
        ]);
        fs.writeFileSync(jsOutputPath, targetJsContent + '\n');
        const cp = require('child_process');
        return new Promise(function(resolve, reject) {
            const childProcess = cp.fork(jsOutputPath, { silent: true });
            let allValues;
            childProcess.stdout.on('data', function(data) {
                allValues = JSON.parse(data.toString()).out;
            });
            childProcess.on('error', reject);
            childProcess.on('exit', function() {
                if (workDir) process.chdir(initialDir);
                resolve({
                    types: allTypes || [],
                    values: allValues || []
                });
            });
        });
    }).catch(function(e) {
        if (workDir) process.chdir(initialDir);
        throw e;
    });
}

Repl.prototype.parseModule = function(moduleName) {
    const elmVer = this.options.elmVer || DEFAULT_ELM_VER;
    const workDir = this.options.workDir;

    //const keepTempFile = this.options.keepTempFile || false;
    const keepElmiFile = this.options.keepElmiFile || false;

    const initialDir = process.cwd();

    const moduleElmiPath = getModuleElmiPath(this.options, moduleName);
    const modulePath = getModuleFilePath(this.options, moduleName);

    return new Promise(
        function(resolve, reject) {
            if (workDir) process.chdir(workDir);
            cp.execSync('elm-make --yes ' + modulePath, { cwd: process.cwd() });
            resolve(modulePath);
        }
    ).then(function() {
        const buffer = fs.readFileSync(moduleElmiPath);
        return elmiParser.parse(buffer);
    }).then(function(parsedIface) {
        if (!keepElmiFile) fs.unlinkSync(moduleElmiPath);
        if (workDir) process.chdir(initialDir);
        return parsedIface;
    }).catch(function(e) {
        if (workDir) process.chdir(initialDir);
        throw e;
    });
}

const VALUES_EXTRACTION_INTRO = [
    '',
    'port outcome : List String -> Cmd msg',
    'port income : (Bool -> msg) -> Sub msg',
    '',
    'type alias Model = Maybe (List String)',
    '',
    'sendIt : List String',
    'sendIt ='
];

function getValuesExtractionBody(varsNames) {
    return varsNames.map(function(varName, index) {
        return (index == 0)
            ? '    [ toString ' + varName
            : '    , toString ' + varName;
    });
}

const VALUES_EXTRACTION_OUTRO = [
    '    ]',
    '',
    'update : Bool -> Model -> (Model, Cmd msg)',
    'update _ _ =',
    '    (Just sendIt, outcome sendIt)',
    '',
    'main : Program Never Model Bool',
    'main =',
    '    program',
    '        { init = (Nothing, Cmd.none)',
    '        , update = update',
    '        , subscriptions = (\\_ -> income (\\_ -> True))',
    '        }'
];

function getValuesExtractionJs(moduleName) {
    return [
        'var Elm = module.exports;',
        'var app = Elm.' + moduleName + '.worker();',
        'app.ports.outcome.subscribe(function(list) {',
        '    console.log(JSON.stringify({ out: list }));',
        '});',
        'app.ports.income.send(true);'
    ];
}

Repl.stringify = Types.stringify;

Repl.stringifyAll = Types.stringifyAll;

function getModuleFilePath(options, moduleName) {
    return './' + moduleName.replace(/\./g, '/') + '.elm';
}

function getModuleElmiPath(options, moduleName) {
    return './elm-stuff/build-artifacts/' + (options.elmVer || DEFAULT_ELM_VER) + '/' +
            (options.user || DEFAULT_USER) + '/' +
            (options.package || DEFAULT_PACKAGE) + '/' +
            (options.packageVer || DEFAULT_PACKAGE_VER) + '/' +
            (moduleName.replace(/\./g, '-')) + '.elmi';
}

function getTempModuleName(options, interationId) {
    return 'NodeRepl' + interationId;
}

function getTempElmiPath(options, iterationId) {
    return './elm-stuff/build-artifacts/' + (options.elmVer || DEFAULT_ELM_VER) + '/' +
            (options.user || DEFAULT_USER) + '/' +
            (options.package || DEFAULT_PACKAGE) + '/' +
            (options.packageVer || DEFAULT_PACKAGE_VER) + '/' +
            'NodeRepl' + iterationId + '.elmi';
}

function getTempFilePath(options, iterationId) {
    if (options.tempFileName) return options.tempFileName + '.elm';
    return './f_o_o_b_a_r_test' + iterationId + '.elm';
}


function getJsOutputPath(options, iterationId) {
    if (options.tempFileName) return options.tempFileName + '.js';
    return './f_o_o_b_a_r_test' + iterationId + '.js';
}

let varsCount = 0;
function generateVarName() {
    return 'f_o_o_b_a_r_' + varsCount++;
}

function mapToVariables(expressions) {
    const varsMap = {};
    expressions.forEach(function(expression) {
        varsMap[generateVarName()] = expression;
    });
    return varsMap;
}

module.exports = Repl;
