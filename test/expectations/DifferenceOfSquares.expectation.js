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
        [ 'Result' ]
    ]),
    imports: b.imports([
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
    ]
};

module.exports = expectation;
