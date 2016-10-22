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

var variableParser = new Parser()
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' });

function variableFormatter(v) {
    return v.name;
}

var typeNodeParser = new Parser().namely('self')
    .int8('tagValue')
    .choice('cell', {
        tag: 'tagValue',
        choices: {
            // Lambda a b
            0: Parser.start().nest('lambda', {
                                type: Parser.start().nest('left',  { type: 'self' })
                                                    .nest('right', { type: 'self'  })
                             }),
            // Var a
            1: Parser.start().nest('var', { type: variableParser,
                                            formatter: variableFormatter }),
            // Type a
            2: Parser.start().nest('type', { type: 'self' }),
            // App a b
            3: Parser.start().nest('app', {
                                type: Parser.start().nest('left',  { type: 'self' })
                                                    .nest('right', { type: 'self' })
                             }),
            // Record a b
            4: Parser.start().nest('record', {
                                type: Parser.start().nest('left',  { type: 'self' })
                                                    .nest('right', { type: 'self' })
                             }),
            // Aliased a b c
            5: Parser.start().nest('aliased', {
                                type: Parser.start().nest('value', { type: 'self' })
                                                    .nest('left',  { type: 'self' })
                                                    .nest('right', { type: 'self' })
                             })
        }
    });

function singleTypeFormatter(typeObj) {
    console.log(typeObj);
    return typeObj.tagValue;
}

function typesFormatter(v) {
    return v.values.map(function(tv) {
        return {
            name: tv.name,
            value: tv.value
        }
    });
}

var singleTypeParser = new Parser()
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' })
    .nest('value', {
        type: typeNodeParser,
        formatter: singleTypeFormatter
    });

var typesParser = new Parser()
    .skip(4).int32('count')
    .array('values', {
        type: singleTypeParser,
        length: 'count'
    });

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
