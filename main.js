const binary = require('binary');
const fs = require('fs');

fs.readFile('./Anagram.elmi', function(_, stream) {
    vars = binary.parse(stream)
        .into('version', parseCompilerVersion)
        .into('package', parsePackageName)
        .into('imports', parseImports)
        .into('exports', parseExports)
        .into('types', parseTypes)
        .vars

    console.dir(vars);
});


function parseCompilerVersion() {
    this.word64bs('patch')
        .word64bs('minor')
        .word64bs('major');
}

function parsePackageName() {
    this.tap(parseBStringAs('user'))
        .tap(parseBStringAs('project'));
}

function parseImports() {
    this.word64bs('imports')
        .loop(function(end, vars) {
            var count = vars.imports;
            console.log('count', count);
            var imports = [];
            while (count--) {
                this.into('types', function() {
                    this.word8bs('type');
                });
                console.log('pos', count);
                //this.word8bs('type');
                parseBString(this, function(v, len) {
                    console.log('got', v, len);
                    imports.push(v);
                });
            }
            vars.imports = imports;
            end();
        });
}

function parseExports() {
}

function parseTypes() {
}

function parseBString(buff, callback) {
    var tempLenKey = '___tempLen';
    var tempKey = '___temp';
    buff.word64bs(tempLenKey)
        .buffer(tempKey, tempLenKey)
        .tap(function(vars) {
            var value = vars[tempKey];
            var len = vars[tempLenKey];
            delete vars[tempLenKey];
            delete vars[tempKey];
            callback(value.toString(), len);
        });
}

function parseBStringAs(label) {
    return function() {
        this.word64bs(label)
            .buffer(label, label)
            .tap(function(vars) {
                vars[label] = vars[label].toString();
            });
    }
}
