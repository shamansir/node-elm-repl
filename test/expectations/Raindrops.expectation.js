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
        'factors',
        'hasFactor',
        'correspondingDrop',
        'extractDrop',
        'raindrops'
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
            name: 'correspondingDrop',
            value: b.lambda(
                b.type('Int'),
                b.type('String')
            )
        },
        {
            name: 'extractDrop',
            value: b.lambda(
                b.type('Int'),
                b.lambda(
                    b.type('Int'),
                    b.type('String')
                )
            )
        },
        {
            name: 'factors',
            value: b.app(
                b.type('List'),
                [ b.type('Int') ]
            )
        },
        {
            name: 'hasFactor',
            value: b.lambda(
                b.type('Int'),
                b.lambda(
                    b.type('Int'),
                    b.type('Bool')
                )
            )
        },
        {
            name: 'raindrops',
            value: b.lambda(
                b.type('Int'),
                b.type('String')
            )
        }
    ]
};

module.exports = expectation;
