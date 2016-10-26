var b = require('./builder.js');

var expectation = {
    version: b.version(0, 17, 1),
    package: {
        user: 'user',
        name: 'project'
    },
    exports: b.exports([
        [ 'Basics' ],
        [ 'Debug' ],
        [ 'List' ],
        [ 'Maybe' ],
        [ 'Platform' ],
        [ 'Platform', 'Cmd' ],
        [ 'Platform', 'Sub' ],
        [ 'Result' ],
        [ 'String' ]
    ]),
    imports: b.imports([
        { 'Phrase' : [ 'NotDetermined', 'Silence', 'Statement', 'Question', 'Shout' ] },
        'determine',
        'response',
        'hey'
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
            name: 'NotDetermined',
            value: b.complexType('user', 'project', 'Bob', 'Phrase')
        },
        {
            name: 'Question',
            value: b.complexType('user', 'project', 'Bob', 'Phrase')
        },
        {
            name: 'Shout',
            value: b.complexType('user', 'project', 'Bob', 'Phrase')
        },
        {
            name: 'Silence',
            value: b.complexType('user', 'project', 'Bob', 'Phrase')
        },
        {
            name: 'Statement',
            value: b.complexType('user', 'project', 'Bob', 'Phrase')
        },
        {
            name: 'determine',
            value: b.lambda(
                b.type('String'),
                b.complexType('user', 'project', 'Bob', 'Phrase')
            )
        },
        {
            name: 'hey',
            value: b.lambda(
                b.type('String'),
                b.type('String')
            )
        },
        {
            name: 'response',
            value: b.lambda(
                b.complexType('user', 'project', 'Bob', 'Phrase'),
                b.type('String')
            )
        }
    ]
};

module.exports = expectation;
