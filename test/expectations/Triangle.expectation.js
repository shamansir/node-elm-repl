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
        { 'Triangle' : [ 'Equilateral', 'Isosceles', 'Scalene' ] },
        [ 'ErrorDescription' ],
        'version',
        'triangleKind',
        'testValidity',
        'isIsosceles',
        'isEquilaterial'
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
            name: 'Equilateral',
            value: b.complexType('user', 'project', 'Triangle', 'Triangle')
        },
        {
            name: 'Isosceles',
            value: b.complexType('user', 'project', 'Triangle', 'Triangle')
        },
        {
            name: 'Scalene',
            value: b.complexType('user', 'project', 'Triangle', 'Triangle')
        },
        {
            name: 'isEquilaterial',
            value: b.lambda(
                b.type('Float'),
                b.lambda(
                    b.type('Float'),
                    b.lambda(
                        b.type('Float'),
                        b.type('Bool')
                    )
                )
            )
        },
        {
            name: 'isIsosceles',
            value: b.lambda(
                b.type('Float'),
                b.lambda(
                    b.type('Float'),
                    b.lambda(
                        b.type('Float'),
                        b.type('Bool')
                    )
                )
            )
        },
        {
            name: 'testValidity',
            value: b.lambda(
                b.type('Float'),
                b.lambda(
                    b.type('Float'),
                    b.lambda(
                        b.type('Float'),
                        b.app(
                            b.complexType('elm-lang', 'core', 'Maybe', 'Maybe'),
                            [
                                b.aliased(
                                    b.complexType('user', 'project', 'Triangle', 'ErrorDescription'),
                                    [ b.type('String') ]
                                )
                            ]
                        )
                    )
                )
            )
        },
        {
            name: 'triangleKind',
            value: b.lambda(
                b.type('Float'),
                b.lambda(
                    b.type('Float'),
                    b.lambda(
                        b.type('Float'),
                        b.app(
                            b.complexType('elm-lang', 'core', 'Result', 'Result'),
                            [
                                b.aliased(
                                    b.complexType('user', 'project', 'Triangle', 'ErrorDescription'),
                                    [ b.type('String') ]
                                ),
                                b.complexType('user', 'project', 'Triangle', 'Triangle'),
                            ]
                        )
                    )
                )
            )
        },
        {
            name: 'version',
            value: b.type('Int')
        }
    ],
    unions: [
        {
            name: 'Triangle',
            items: []
        }
    ]
};

module.exports = expectation;
