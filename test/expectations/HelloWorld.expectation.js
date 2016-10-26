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
        'helloWorld'
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
            name: 'helloWorld',
            value: b.lambda(
                b.app(
                    b.complexType('elm-lang', 'core', 'Maybe'),
                    [ b.type('String') ]
                ),
                b.type('String')
            )
        }
    ]
};

module.exports = expectation;
