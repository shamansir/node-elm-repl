const Parser = require('binary-parser').Parser;

var stop = new Parser();

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

var importPathItemParser = new Parser()
    .skip(4).int32('itemLen')
    .string('item', { length: 'itemLen' });

var importPathParser = new Parser()
    .skip(4).int32('count')
    .array('path', {
        type: importPathItemParser,
        length: 'count'
    })
    .skip(1);

function importPathFormatter(v) {
    if (!v.path) return v;
    return v.path.map(function(data) {
        return data.item;
    });
}

var singleImportParser = new Parser()
    .int8('type')
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' })
    .choice('values', {
        tag: 'type',
        choices: {
            0: stop,
            1: stop,
            2: importPathParser
        },
        formatter: importPathFormatter
    });

var importsParser = new Parser()
    .skip(4).int32('count')
    .array('values', {
        type: singleImportParser,
        length: 'count'
    });

var importsFormatter = function(v) {
    return v.values.map(function(iv) {
        if (iv.type !== 2) {
            return { 'type': iv.type,
                     'name': iv.name };
        } else {
            return { 'type': iv.type,
                     'name': iv.name,
                     'values': iv.values };
        }
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

var variableParser = new Parser()
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' });

function variableFormatter(v) {
    return v.name;
}

var holleyTypeParser = new Parser()
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' });

var filledTypeParser = new Parser()
    .skip(4).int32('userLen')
    .string('user', { length: 'userLen' })
    .skip(4).int32('projectLen')
    .string('project', { length: 'projectLen' })
    .skip(4).int32('filler1')
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' })
    .skip(4).int32('subNameLen')
    .string('subName', { length: 'subNameLen' });

var typeParser = new Parser()
    .int8('isFilled')
    .choice('inner', {
        tag: 'isFilled',
        choices: {
            0: holleyTypeParser,
            1: filledTypeParser
        }
    });

function typeFormatter(t) {
    return t.isFilled
        ? { user: t.inner.user,
            project: t.inner.project,
            name: t.inner.name,
            subName: t.inner.subName }
        : { name: t.inner.name };
}

var appRightSideParser = new Parser()
   .skip(4).int32('count')
   .array('values', {
       type: 'node',
       length: 'count'/*,
       formatter: nodeArrayFormatter FIXME*/
   });

function appRightSideFormatter(rs) {
    return rs.values;
}

var recordPairParser = new Parser()
    .skip(4).int32('nameLen')
    .string('name', { length: 'nameLen' })
    .nest('node', {
        type: 'node'
    });

var recordParser = new Parser()
    .skip(4).int32('count')
    .array('fields', {
        type: recordPairParser,
        length: 'count',/*,
        formatter: nodeMapFormatter FIXME*/
    })
    .skip(1);

function recordFormatter(r) {
    return r.fields;
}

var aliasedTypeParser = new Parser()
    .nest('type', { type: typeParser,
                    formatter: typeFormatter })
    .skip(1)
    .skip(4).int32('count')
    .array('list', {
        type: 'node',
        length: 'count'/*,
        formatter: nodeArrayFormatter FIXME*/
    });

function aliasedTypeFormatter(at) {
    return {
        type: at.type,
        list: at.list
    };
}

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
                                type: Parser.start().nest('subject',  { type: 'node' })
                                                    .nest('object', { type: appRightSideParser,
                                                                      formatter: appRightSideFormatter })
                             }),
            // Record a b
            4: Parser.start().nest('record', { type: recordParser,
                                               formatter: recordFormatter }),
            // Aliased a b c
            5: Parser.start().nest('aliased', {
                                type: aliasedTypeParser,
                                formatter: aliasedTypeFormatter
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
            name: cell.var
        };
        case 2: return {
            type: 'type',
            def: cell.type
        };
        case 3: return {
            type: 'app',
            subject: singleNodeFormatter(cell.app.subject),
            object: cell.app.object.map(singleNodeFormatter)
        };
        case 4: return {
            type: 'record',
            fields: cell.record.map(function(pair) {
                return { name: pair.name, node: singleNodeFormatter(pair.node) };
            })
        };
        case 5: return {
            type: 'aliased',
            def: cell.aliased.type,
            list: cell.aliased.list.map(singleNodeFormatter)
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

module.exports = elmiParser;
