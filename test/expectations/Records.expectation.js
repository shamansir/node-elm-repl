var b = require('./builder.js');

var ADef = b.aliased(
                b.complexType('user', 'project', 'Records', 'A'),
                [ b.record({
                    a: b.type('String')
                }) ]
           );

var BDef = b.aliased(
                b.complexType('user', 'project', 'Records', 'B'),
                [ b.record({
                    a: ADef,
                    b: b.app(b.type('List'), [ b.type('Int') ])
                }) ]
           );

var CDef = b.aliased(
                b.complexType('user', 'project', 'Records', 'C'),
                [ b.record({
                    field1: BDef,
                    field2: b.complexType('user', 'project', 'Records', 'MyUnionType'),
                    field3: ADef,
                    field4: b.app(
                        b.complexType('user', 'project', 'Records', 'MySecondUnionType'),
                        [ b.type('Bool') ]
                    ),
                }) ]
           );

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
        [ 'O' ],
        'O',
        [ 'A' ],
        'A',
        [ 'B' ],
        'B',
        [ 'C' ],
        'C',
        { 'Recursive': [] }
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
            name: 'A',
            value: b.lambda(
                b.type('String'),
                ADef
            )
        },
        {
            name: 'B',
            value: b.lambda(
                ADef,
                b.lambda(
                    b.app(b.type('List'), [ b.type('Int') ]),
                    BDef
                )
            )
        },
        {
            name: 'C',
            value: b.lambda(
                BDef,
                b.lambda(
                    b.complexType('user', 'project', 'Records', 'MyUnionType'),
                    b.lambda(
                        ADef,
                        b.lambda(
                            b.app(
                                b.complexType('user', 'project', 'Records', 'MySecondUnionType'),
                                [ b.type('Bool') ]
                            ),
                            CDef
                        )
                    )
                )
            )
        },
        {
            name: 'MyInt',
            value: b.lambda(
                b.type('Int'),
                b.complexType('user', 'project', 'Records', 'MyUnionType')
            )
        },
        {
            name: 'MySecondInt',
            value: b.lambda(
                b.type('Int'),
                b.app(
                    b.complexType('user', 'project', 'Records', 'MySecondUnionType'),
                    [ b.var('a') ]
                )
            )
        },
        {
            name: 'MySecondList',
            value: b.lambda(
                b.app(
                    b.type('List'),
                    [ b.var('a') ]
                ),
                b.app(
                    b.complexType('user', 'project', 'Records', 'MySecondUnionType'),
                    [ b.var('a') ]
                )
            )
        },
        {
            name: 'MySecondStr',
            value: b.lambda(
                b.type('String'),
                b.app(
                    b.complexType('user', 'project', 'Records', 'MySecondUnionType'),
                    [ b.var('a') ]
                )
            )
        },
        {
            name: 'MyStr',
            value: b.lambda(
                b.type('String'),
                b.complexType('user', 'project', 'Records', 'MyUnionType')
            )
        },
        {
            name: 'O',
            value: b.lambda(
                b.type('String'),
                b.lambda(
                    b.type('Int'),
                    b.lambda(
                        b.type('Bool'),
                        b.aliased(
                            b.complexType('user', 'project', 'Records', 'O'),
                            [ b.record({
                                a: b.type('String'),
                                b: b.type('Int'),
                                c: b.type('Bool')
                            }) ]
                        )
                    )
                )
            )
        },
        {
            name: 'Recursive',
            value: b.lambda(
                b.record({
                    field1: b.complexType('user', 'project', 'Records', 'Recursive'),
                    field2: CDef
                }),
                b.complexType('user', 'project', 'Records', 'Recursive')
            )
        }
    ]
};

module.exports = expectation;
