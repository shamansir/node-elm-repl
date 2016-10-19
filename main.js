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

var typesParser = new Parser();

// main

var elmiParser = new Parser()
        .nest('version', { type: versionParser })
        .nest('package', { type: packageInfoParser,
                           formatter: packageInfoFormatter })
        .nest('imports', { type: importsParser,
                           formatter: importsFormatter })
        .nest('exports', { type: exportsParser,
                           formatter: exportsFormatter })
        .nest('types',   { type: typesParser });

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
        console.log('- ', '[' + i + ']', iface.imports[i].type, ' : ', iface.imports[i].name);
    }
    console.log('exports:', iface.exports.length);
    i = iface.exports.length;
    while (i--) {
        console.log('- ', '[' + i + ']', iface.exports[i].path.join('/'));
    }

}
