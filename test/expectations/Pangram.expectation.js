var b = require('./builder.js');

var expectation = {
    version: b.version(0, 18, 0),
    package: {
        user: 'user',
        name: 'project'
    },
    imports: b.imports([
        [ 'Basics' ],
        [ 'Char' ],
        [ 'Debug' ],
        [ 'List' ],
        [ 'Maybe' ],
        [ 'Platform' ],
        [ 'Platform', 'Cmd' ],
        [ 'Platform', 'Sub' ],
        [ 'Result' ],
        [ 'Set' ],
        [ 'String' ],
        [ 'Tuple' ]
    ]),
    exports: b.exports([
        'isPangram',
        'findLetterCount',
        'isLetter',
        'subtractA'
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
            name: 'findLetterCount',
            value: b.lambda(
                b.type('String'),
                b.type('Int')
            )
        },
        {
            name: 'isLetter',
            value: b.lambda(
                b.aliased(
                    b.complexType('elm-lang', 'core', 'Char', 'KeyCode'),
                    [ b.type('Int') ]
                ),
                b.type('Bool')
            )
        },
        {
            name: 'isPangram',
            value: b.lambda(
                b.type('String'),
                b.type('Bool')
            )
        },
        {
            name: 'subtractA',
            value: b.lambda(
                b.type('Int'),
                b.type('Int')
            )
        }
    ],
    unions: []
};

module.exports = expectation;
