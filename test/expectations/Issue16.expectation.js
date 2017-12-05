var b = require('./builder.js');

var expectation = {
    version: b.version(0, 18, 0),
    package: {
        user: 'user',
        name: 'project'
    },
    imports: b.imports([
        [ 'Basics' ],
        [ 'Debug' ],
        [ 'Html' ],
        [ 'List' ],
        [ 'Maybe' ],
        [ 'Platform' ],
        [ 'Platform', 'Cmd' ],
        [ 'Platform', 'Sub' ],
        [ 'Result' ],
        [ 'String' ],
        [ 'Tuple' ]
    ]),
    exports: b.exports([
        'view',
        { 'Msg': [] }
    ]),
    types: [
        {
            name: '::',
            value: b.lambda(
                b.var('a'),
                b.lambda(
                    b.app(b.type('List'), [ b.var('a') ]),
                    b.app(b.type('List'), [ b.var('a') ])
                )
            )
        },
        {
            name: 'Test1',
            value: b.lambda(
                b.type('String'),
                b.complexType('user', 'project', 'Issue16', 'Msg')
            )
        },
        {
            name: 'Test2',
            value: b.lambda(
                b.type('Int'),
                b.complexType('user', 'project', 'Issue16', 'Msg')
            )
        },
        {
            name: 'view',
            value: b.lambda(
                b.type('Float'),
                b.msgAliased(
                    b.complexType('elm-lang', 'html', 'Html', 'Html'),
                    b.complexType('user', 'project', 'Issue16', 'Msg'),
                    b.app(
                        b.complexType('elm-lang', 'virtual-dom', 'VirtualDom', 'Node'),
                        [ b.complexType('user', 'project', 'Issue16', 'Msg') ]
                    )
                )
            )
        }
    ],
    unions: [
        {
            name: 'Msg',
            items: []
        }
    ]
};

module.exports = expectation;
