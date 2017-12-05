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
        'factorial',
        'squareOfSum',
        'sumOfSquares',
        'difference'
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
            name: 'difference',
            value: b.lambda(
                b.type('Float'),
                b.type('Float')
            )
        },
        {
            name: 'factorial',
            value: b.lambda(
                b.type('Float'),
                b.type('Float')
            )
        },
        {
            name: 'squareOfSum',
            value: b.lambda(
                b.type('Float'),
                b.type('Float')
            )
        },
        {
            name: 'sumOfSquares',
            value: b.lambda(
                b.type('Float'),
                b.type('Float')
            )
        }
    ],
    unions: []
};

module.exports = expectation;
