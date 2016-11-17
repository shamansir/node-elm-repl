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
        'evenlyDivisibleBy4',
        'evenlyDivisibleBy100',
        'evenlyDivisibleBy400',
        'isLeapYear'
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
            name: 'evenlyDivisibleBy100',
            value: b.lambda(
                b.type('Int'),
                b.type('Bool')
            )
        },
        {
            name: 'evenlyDivisibleBy4',
            value: b.lambda(
                b.type('Int'),
                b.type('Bool')
            )
        },
        {
            name: 'evenlyDivisibleBy400',
            value: b.lambda(
                b.type('Int'),
                b.type('Bool')
            )
        },
        {
            name: 'isLeapYear',
            value: b.lambda(
                b.type('Int'),
                b.type('Bool')
            )
        }
    ]
};

module.exports = expectation;
