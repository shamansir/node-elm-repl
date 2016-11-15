const elmiParser = require('./parser.js');
const Types = require('./types.js');

const fs = require('fs');
const cp = require('child_process');

const DEFAULT_ELM_VER = '0.17.1';
const DEFAULT_USER = 'user';
const DEFAULT_PROJECT = 'project';
const DEFAULT_PROJECT_VER = '1.0.0';

function Repl(options) {
    this.options = options || {};
    /*if (!this.options.user || !this.options.project) {
        this.options = injectOptionsFromPackageJson(options);
    }*/
}

var lastIteration = 0;
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
    const elmiPath = getElmiPath(this.options, currentIteration);

    return new Promise(
        function(resolve, reject) {
            const firstLines = [ 'module NodeRepl' + currentIteration + ' exposing (..)' ]
                .concat(imports.map(function(_import) {
                    return _import ? ('import ' + _import) : '';
                }));
            const fileContent = firstLines.concat(
                varsNames.map(function(varName) {
                    return varName + ' = (' + varsMap[varName] + ')';
                })
            );
            if (workDir) process.chdir(workDir);
            fs.writeFileSync(tempFilePath, fileContent.join('\n') + '\n');
            cp.execSync('elm-make ' + tempFilePath, { cwd: process.cwd() });
            resolve(tempFilePath);
        }.bind(this)
    ).then(function(filePath) {
        if (!keepTempFile) fs.unlinkSync(tempFilePath);
        var buffer = fs.readFileSync(elmiPath);
        return elmiParser.parse(buffer);
    }).then(function(parsedIface) {
        if (!keepElmiFile) fs.unlinkSync(elmiPath);
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
    const elmiPath = getElmiPath(this.options, currentIteration);
    const jsOutputPath = getJsOutputPath(this.options, currentIteration);

    const moduleName = 'NodeRepl' + currentIteration;

    return new Promise(
        function(resolve, reject) {
            const firstLines = [ 'port module ' + moduleName + ' exposing (..)' ]
                .concat(imports.map(function(_import) {
                        return _import ? ('import ' + _import) : '';
                    })
                ).concat([
                    'import Platform exposing (..)',
                    'import Json.Decode'
                ]);
            const fileContent = firstLines.concat(
                varsNames.map(function(varName) {
                    return varName + ' = (' + varsMap[varName] + ')';
                })
            ).concat([
                'port outcome : List String -> Cmd msg',
                'port income : (Bool -> msg) -> Sub msg',
                '',
                'type alias Model = Maybe (List String)',
                '',
                'sendIt : List String',
                'sendIt ='
            ]).concat(
                varsNames.map(function(varName, index) {
                    return (index == 0)
                        ? '    [ toString ' + varName
                        : '    , toString ' + varName;
                })
            ).concat([
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
            ]);
            if (workDir) process.chdir(workDir);
            fs.writeFileSync(tempFilePath, fileContent.join('\n') + '\n');
            cp.execSync('elm-make ' + tempFilePath + ' --output ' + jsOutputPath,
                { cwd: process.cwd() });
            resolve(jsOutputPath);
        }.bind(this)
    ).then(function(jsOutputPath) {
        if (!keepTempFile) fs.unlinkSync(tempFilePath);
        var srcJsContent = fs.readFileSync(jsOutputPath);
        var targetJsContent = Buffer.concat([
            srcJsContent,
            new Buffer([
                'var Elm = module.exports;',
                'var app = Elm.' + moduleName + '.worker();',
                'app.ports.outcome.subscribe(function(list) {',
                '    console.log(JSON.stringify({ out: list }));',
                '});',
                'app.ports.income.send(true);'
            ].join('\n'))
        ]);
        fs.writeFileSync(jsOutputPath, targetJsContent + '\n');
        var cp = require('child_process');
        return new Promise(function(resolve, reject) {
            var childProcess = cp.fork(jsOutputPath, { silent: true });
            var receivedValue;
            childProcess.stdout.on('data', function(data) {
                receivedValue = JSON.parse(data.toString()).out;
            });
            childProcess.on('error', reject);
            childProcess.on('exit', function() {
                if (workDir) process.chdir(initialDir);
                resolve(receivedValue || []);
            });
        });
    }).catch(function(e) {
        if (workDir) process.chdir(initialDir);
        throw e;
    });
}

Repl.prototype.getTypesAndValues = function(imports, expressions) {
}

Repl.stringify = Types.stringify;

Repl.stringifyAll = Types.stringifyAll;

function getElmiPath(options, iterationId) {
    return './elm-stuff/build-artifacts/' + (options.elmVer || DEFAULT_ELM_VER) + '/' +
            (options.user || DEFAULT_USER) + '/' +
            (options.project || DEFAULT_PROJECT) + '/' +
            (options.projectVer || DEFAULT_PROJECT_VER) + '/' +
            'NodeRepl' + iterationId + '.elmi';
}

function getTempFilePath(options, iterationId) {
    return './f_o_o_b_a_r_test' + iterationId + '.elm';
}


function getJsOutputPath(options, iterationId) {
    return './f_o_o_b_a_r_test' + iterationId + '.js';
}

var varsCount = 0;
function generateVarName() {
    return 'f_o_o_b_a_r_' + varsCount++;
}

function mapToVariables(expressions) {
    var varsMap = {};
    expressions.forEach(function(expression) {
        varsMap[generateVarName()] = expression;
    });
    return varsMap;
}

function getJsIntro(varNames) {

}

function getJsOutro(varNames) {

}

module.exports = Repl;
