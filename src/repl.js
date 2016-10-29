const elmiParser = require('./parser.js');
const Types = require('./types.js');

const fs = require('fs');
const cp = require('child_process');

function Repl(options) {
    options.keepTempFile = true;
    options.keepElmiFile = true;
    this.options = options || {};
    /*if (!this.options.user || !this.options.project) {
        this.options = injectOptionsFromPackageJson(options);
    }*/
}

var lastIteration = 0;
Repl.prototype.getTypes = function(imports, expressions) {
    const varsMap = mapToVariables(expressions);
    const varsNames = Object.keys(varsMap);

    const elmVer = this.options.elmVer;
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
            process.chdir(workDir);
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
        process.chdir(initialDir);
        return new Types(parsedIface).findAll(varsNames);
    }).catch(function(e) {
        console.error(e);
        process.chdir(initialDir);
    });
}

Repl.stringify = Types.stringify;

Repl.stringifyAll = Types.stringifyAll;

function getElmiPath(options, iterationId) {
    return './elm-stuff/build-artifacts/' + options.elmVer + '/' +
            (options.user || 'user') + '/' +
            (options.project || 'project') + '/' +
            (options.projectVer || '1.1.0') + '/' +
            'NodeRepl' + iterationId + '.elmi';
}

function getTempFilePath(options, iterationId) {
    return './f_o_o_b_a_r_test' + iterationId + '.elm';
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

module.exports = Repl;
