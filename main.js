const Parser = require('binary-parser').Parser;
const fs = require('fs');

var versionParser = new Parser()
                    .skip(4).int32('major')
                    .skip(4).int32('minor')
                    .skip(4).int32('patch');

var packageInfoParser = new Parser()
    .skip(4).int32('userLen')
    .string('user', { length: 'userLen' })
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' });

var singleImportParser = new Parser()
    .int8('type')
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' });

var importsParser = new Parser()
    .skip(4).int32('count')
    .array('values', {
        type: singleImportParser,
        length: 'count'
    });

var exportsParser = new Parser();

var typesParser = new Parser();

var elmiParser = new Parser()
        .nest('version', { type: versionParser })
        .nest('package', { type: packageInfoParser })
        .nest('imports', { type: importsParser })
        .nest('exports', { type: exportsParser })
        .nest('types',   { type: typesParser });

fs.readFile('./Anagram.elmi', function(_, stream) {
    var interface = elmiParser.parse(stream);
    console.dir(interface);
    logInterface(interface);
});

//logInterface(elmiParser.parse(fs.readFile('./Anagram.elmi')));

/* fs.readFile('./Anagram.elmi', function(_, stream) {
    vars = binary.parse(stream)
        .into('version', parseCompilerVersion)
        .into('package', parsePackageName)
        .into('imports', parseImports)
        .into('exports', parseExports)
        .into('types', parseTypes)
        .vars

    console.dir(vars);
    logInterface(vars);
});


function parseCompilerVersion() {
    this.word64bs('major')
        .word64bs('minor')
        .word64bs('patch');
}

function parsePackageName() {
    this.tap(parseBStringAs('user'))
        .tap(parseBStringAs('name'));
}

function parseImports() {
    this.word64bs('count')
        .tap(function(vars) {
            vars.pos = vars.count;
            vars.values = [];
        })
        .loop(function(end, vars) {
            if (vars.pos <= 0) {
                delete vars.pos;
                delete vars.lastType;
                end();
                return;
            }
            vars.pos--;
            this.word8bs('lastType')
                .tap(function(vars) {
                    parseBString(this, function(v) {
                        vars.values.push({
                            'type': vars.lastType,
                            'name': v
                        })
                    });
                })

        });
}

function parseExports() {
    this.word64bs('count')
        .tap(function(vars) {
            vars.pos = vars.count;
            vars.values = [];
        })
        .loop(function(end, vars) {
            if (vars.pos <= 0) {
                delete vars.pos;
                end();
                return;
            }
            vars.pos--;
            this.word64bs('lastCount')
                .tap(function(vars) {
                    vars.innerPos = vars.lastCount;
                    vars.collected = [];
                    vars.values.push({
                        'count': vars.lastCount,
                        'name': []
                    });
                })
                .loop(function(end, vars) {
                    if (vars.innerPos <= 0) {
                        delete vars.innerPos;
                        delete vars.lastCount;
                        delete vars.collected;
                        end();
                        return;
                    }
                    vars.innerPos--;
                    parseBString(this, function(v) {
                        vars.values[vars.values.length - 1].name.push(v);
                    });
                })

        });
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
} */

function logInterface(iface) {

    console.log('compiler version is', iface.version.major + '.' + iface.version.minor + '.' + iface.version.patch);
    console.log('package name is', iface.package.user + '/' + iface.package.name);
    console.log('imports:', iface.imports.count);
    var i = iface.imports.count;
    while (i--) {
        console.log('- ', '[' + i + ']', iface.imports.values[i].type, ' : ', iface.imports.values[i].name);
    }
    // console.log('imports:', iface.exports.count);
    // i = iface.exports.count;
    // while (i--) {
    //     console.log('- ', '[' + i + ']', iface.exports.values[i].count, ' : ', iface.exports.values[i].name.join('/'));
    // }

}
