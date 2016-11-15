var b = require('./builder.js');

var expectation = {
    version: b.version(0, 18, 0),
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
        [ 'String' ],
        [ 'Tuple' ]
    ]),
    imports: b.imports([
        'sortChars',
        'isAnagram',
        'detect'
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
            name: 'detect',
            value: b.lambda(
                b.type('String'),
                b.lambda(
                    b.app(b.type('List'), [ b.type('String') ]),
                    b.app(b.type('List'), [ b.type('String') ])
                )
            )
        },
        {
            name: 'isAnagram',
            value: b.lambda(
                b.type('String'),
                b.lambda(
                    b.type('String'),
                    b.app(
                        b.complexType('elm-lang', 'core', 'Maybe'),
                        [ b.type('String') ]
                    )
                )
            )
        },
        {
            name: 'sortChars',
            value: b.lambda(
                b.type('String'),
                b.type('String')
            )
        }
    ]
};

module.exports = expectation;
