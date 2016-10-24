const Parser = require('binary-parser').Parser;
const fs = require('fs');

// version

var versionParser = new Parser()
    .skip(4).int32('major')
    .skip(4).int32('minor')
    .skip(4).int32('patch');

// package info

var packageInfoParser = new Parser()
    .skip(4).int32('userLen')
    .string('user', { length: 'userLen' })
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' });

var packageInfoFormatter = function(v) {
    return {
        'user': v.user, 'name': v.name
    };
};

// imports

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

var importsFormatter = function(v) {
    return v.values.map(function(iv) {
        return { 'type': iv.type,
                 'name': iv.name };
    });
};

// exports

var exportPathItemParser = new Parser()
    .skip(4).int32('itemLen')
    .string('item', { length: 'itemLen' });

var singleExportParser = new Parser()
    .skip(4).int32('count')
    .array('path', {
        type: exportPathItemParser,
        length: 'count'
    });

var exportsParser = new Parser()
    .skip(4).int32('count')
    .array('values', {
        type: singleExportParser,
        length: 'count'
    });

var exportsFormatter = function(v) {
    return v.values.map(function(ev) {
        return {
            path: ev.path.map(function(pv) {
                      return pv.item;
                  })
        }
    });
};

// types

var nodeParser = new Parser().namely('node');

var stop = new Parser();

var variableParser = new Parser()
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' });

function variableFormatter(v) {
    return v.name;
}

var typeParser = new Parser()
    .int8('isFilled')
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' })
    .choice('inner', {
        tag: 'isFilled',
        choices: {
            0: stop,
            1: stop // TODO
        }
    });

function typeFormatter(t) {
    return t.name;
}

var appRightSideParser = new Parser()
   .skip(4).int32('count')
   .array('values', {
       type: 'node',
       length: 'count'
   });

nodeParser
    .int8('tag')
    .choice('cell', {
        tag: 'tag',
        choices: {
            // Lambda a b
            0: Parser.start().nest('lambda', {
                                type: Parser.start().nest('left',  { type: 'node' })
                                                    .nest('right', { type: 'node'  })
                             }),
            // Var a
            1: Parser.start().nest('var', { type: variableParser,
                                            formatter: variableFormatter }),
            // Type a
            2: Parser.start().nest('type', { type: typeParser,
                                             formatter: typeFormatter }),
            // App a b
            3: Parser.start().nest('app', {
                                type: Parser.start().nest('object',  { type: 'node' })
                                                    .nest('subject', { type: appRightSideParser })
                             }),
            // Record a b
            4: Parser.start().nest('record', {
                                type: Parser.start().nest('left',  { type: 'node' })
                                                    .nest('right', { type: 'node' })
                             }),
            // Aliased a b c
            5: Parser.start().nest('aliased', {
                                type: Parser.start().nest('value', { type: 'node' })
                                                    .nest('left',  { type: 'node' })
                                                    .nest('right', { type: 'node' })
                             })
        }/*,
        defaultChoice: stop,*/
    });

function singleNodeFormatter(n) {
    var cell = n.cell;
    switch (n.tag) {
        case 0: return {
            type: 'lambda',
            left: singleNodeFormatter(cell.lambda.left),
            right: singleNodeFormatter(cell.lambda.right),
        };
        case 1: return {
            type: 'var',
            name: n.var
        };
        case 2: return {
            type: 'type',
            name: cell.type
        };
        case 3: return {
            type: 'app',
            object: singleNodeFormatter(cell.app.object),
            subject: cell.app.subject
        };
        case 4: return {
            type: 'record',
            left: singleNodeFormatter(cell.record.left),
            right: singleNodeFormatter(cell.record.right)
        };
        case 5: return {
            type: 'aliased',
            left: singleNodeFormatter(cell.aliased.left),
            right: singleNodeFormatter(cell.aliased.right),
            value: singleNodeFormatter(cell.aliased.value)
        };
    }
}

var singleNodeParser = new Parser()
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' })
    .nest('value', {
        type: nodeParser,
        formatter: singleNodeFormatter
    });

var typesParser = new Parser()
    .skip(4).int32('count')
    .array('values', {
        type: singleNodeParser,
        length: 'count'
    });

function typesFormatter(v) {
    return v.values.map(function(nv) {
        console.dir({
            name: nv.name,
            value: nv.value
        });
        return {
            name: nv.name,
            value: nv.value
        }
    });
}

// main

var elmiParser = new Parser()
        .nest('version', { type: versionParser })
        .nest('package', { type: packageInfoParser,
                           formatter: packageInfoFormatter })
        .nest('imports', { type: importsParser,
                           formatter: importsFormatter })
        .nest('exports', { type: exportsParser,
                           formatter: exportsFormatter })
        .nest('types',   { type: typesParser,
                           formatter: typesFormatter });

fs.readFile('./Anagram.elmi', function(_, stream) {
    var interface = elmiParser.parse(stream);
    console.dir(interface);
    logInterface(interface);
});

function logInterface(iface) {

    console.log('compiler version is', iface.version.major + '.' + iface.version.minor + '.' + iface.version.patch);
    console.log('package name is', iface.package.user + '/' + iface.package.name);
    console.log('imports:', iface.imports.length);
    var i = iface.imports.length;
    while (i--) {
        console.log('- ', '[' + i + ']', '(' + iface.imports[i].type + ')', iface.imports[i].name);
    }
    console.log('exports:', iface.exports.length);
    i = iface.exports.length;
    while (i--) {
        console.log('- ', '[' + i + ']', iface.exports[i].path.join('/'));
    }
    console.log('types:', iface.types.length);
    i = iface.types.length;
    while (i--) {
        console.log('- ', '[' + i + ']', iface.types[i].name, iface.types[i].value );
    }

}
