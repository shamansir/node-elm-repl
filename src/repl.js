const elmiParser = require('./parser.js');
const Types = require('./types.js');

const fs = require('fs');
const cp = require('child_process');

function Repl(workDir, options) {
    options = options || {};
    this.workDir = workDir;
    this.elmVer = options.elmVer || '0.17.1';
    this.keepTempFile = options.keepTempFile || false;
    this.keepElmiFile = options.keepElmiFile || false;
}

var lastIteration = 0;
Repl.prototype.getTypes = function(imports, expressions) {
    const varsMap = mapToVariables(expressions);
    const varsNames = Object.keys(varsMap);

    const elmVer = this.elmVer;

    const keepTempFile = this.keepTempFile;
    const keepElmiFile = this.keepElmiFile;

    const currentIteration = lastIteration + 1;
          lastIteration = currentIteration;

    const tempFilePath = getTempFilePath(this.workDir, currentIteration);
    const elmiPath = getElmiPath(elmVer, currentIteration);

    return new Promise(
        function(resolve, reject) {
            const firstLines = [ 'module NodeRepl' + currentIteration + ' exposing (..)' ];
            const fileContent = firstLines.concat(
                varsNames.map(function(varName) {
                    return varName + ' = (' + varsMap[varName] + ')';
                })
            );
            fs.writeFileSync(tempFilePath, fileContent.join('\n'));
            cp.execSync('elm-make ' + tempFilePath);
            resolve(tempFilePath);
        }.bind(this)
    ).then(function(filePath) {
        if (!keepTempFile) fs.unlinkSync(tempFilePath);
        var buffer = fs.readFileSync(elmiPath);
        return elmiParser.parse(buffer);
    }).then(function(parsedIface) {
        if (!keepElmiFile) fs.unlinkSync(elmiPath);
        return new Types(parsedIface).findAll(varsNames);
    });
}

Repl.stringify = Types.stringify;

Repl.stringifyAll = Types.stringifyAll;

function getElmiPath(elmVer, iterationId) {
    return './elm-stuff/build-artifacts/' + elmVer +
                     '/user/project/1.0.0/NodeRepl' + iterationId + '.elmi';
}

function getTempFilePath(workDir, iterationId) {
    return this.workDir + 'f_o_o_b_a_r_test' + iterationId + '.elm';
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
