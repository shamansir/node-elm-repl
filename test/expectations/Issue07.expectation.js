var b = require('./builder.js');

var expectation = {
    version: b.version(0, 18, 0),
    package: {
        user: 'shaman-sir',
        name: 'test-node-elm-repl'
    },
    imports: b.imports([
        [ 'Basics' ],
        [ 'Debug' ],
        [ 'Html' ],
        [ 'Json', 'Decode' ],
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
        [ 'Cat' ],
        'Cat',
        [ 'Dog' ],
        'Dog',
        [ 'User' ],
        'User',
        'decodeUser',
        'decodeDog',
        'decodeCat',
        'somethingElse',
        'viewCat',
        'viewDog'
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
            name: 'Cat',
            value: b.lambda(
                b.type('Int'),
                b.aliased(
                    b.complexType('shaman-sir', 'test-node-elm-repl', 'Issue07', 'Cat'),
                    [ b.record({
                        lives: b.type('Int')
                    }) ]
                )
            )
        },
        {
            name: 'Dog',
            value: b.lambda(
                b.type('String'),
                b.aliased(
                    b.complexType('shaman-sir', 'test-node-elm-repl', 'Issue07', 'Dog'),
                    [ b.record({
                        breed: b.type('String')
                    }) ]
                )
            )
        },
        {
            name: 'User',
            value: b.lambda(
                b.type('String'),
                b.lambda(
                    b.type('Int'),
                    b.aliased(
                        b.complexType('shaman-sir', 'test-node-elm-repl', 'Issue07', 'User'),
                        [ b.record({
                            age: b.type('Int'),
                            name: b.type('String')
                        }) ]
                    )
                )
            )
        },
        {
            name: 'decodeCat',
            value: b.app(
                b.complexType('elm-lang', 'core', [ 'Json', 'Decode' ], 'Decoder'),
                [
                    b.aliased(
                        b.complexType('shaman-sir', 'test-node-elm-repl', 'Issue07', 'Cat'),
                        [ b.record({
                            lives: b.type('Int')
                        }) ]
                    )
                ]
            )
        },
        {
            name: 'decodeDog',
            value: b.app(
                b.complexType('elm-lang', 'core', [ 'Json', 'Decode' ], 'Decoder'),
                [
                    b.aliased(
                        b.complexType('shaman-sir', 'test-node-elm-repl', 'Issue07', 'Dog'),
                        [ b.record({
                            breed: b.type('String')
                        }) ]
                    )
                ]
            )
        },
        {
            name: 'decodeUser',
            value: b.app(
                b.complexType('elm-lang', 'core', [ 'Json', 'Decode' ], 'Decoder'),
                [
                    b.aliased(
                        b.complexType('shaman-sir', 'test-node-elm-repl', 'Issue07', 'User'),
                        [ b.record({
                            age: b.type('Int'),
                            name: b.type('String')
                        }) ]
                    )
                ]
            )
        },
        {
            name: 'somethingElse',
            value: b.type('String')
        },
        {
            name: 'viewCat',
            value: b.lambda(
                b.aliased(
                    b.complexType('shaman-sir', 'test-node-elm-repl', 'Issue07', 'Cat'),
                    [ b.record({
                        lives: b.type('Int')
                    }) ]
                ),
                b.msgAliased(
                    b.complexType('elm-lang', 'html', 'Html', 'Html'),
                    b.app(
                        b.complexType('elm-lang', 'virtual-dom', 'VirtualDom', 'Node'),
                        [ b.var('msg') ]
                    )
                )

            )
        },
        {
            name: 'viewDog',
            value: b.lambda(
                b.aliased(
                    b.complexType('shaman-sir', 'test-node-elm-repl', 'Issue07', 'Dog'),
                    [ b.record({
                        breed: b.type('String')
                    }) ]
                ),
                b.msgAliased(
                    b.complexType('elm-lang', 'html', 'Html', 'Html'),
                    b.app(
                        b.complexType('elm-lang', 'virtual-dom', 'VirtualDom', 'Node'),
                        [ b.var('msg') ]
                    )
                )

            )
        }
    ]
};

module.exports = expectation;
