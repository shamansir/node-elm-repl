var b = require('./builder.js');

module.exports = {
    "version": b.version(0, 17, 1),
    "package": {
        "user": "user",
        "name": "project"
    },
    "exports": [
        { "path": [ "Basics" ] },
        { "path": [ "Debug" ] },
        { "path": [ "List" ] },
        { "path": [ "Maybe" ] },
        { "path": [ "Platform" ] },
        { "path": [ "Platform", "Cmd" ] },
        { "path": [ "Platform", "Sub" ] },
        { "path": [ "Result" ] },
        { "path": [ "String" ] }
    ],
    "imports": [
        { "type": 0, "name": "sortChars" },
        { "type": 0, "name": "isAnagram" },
        { "type": 0, "name": "detect" }
    ],
    "types": [
        {
            "name": "::",
            "value": b.lambda(
                b.var('a'),
                b.lambda(
                    b.app(b.type('List'), [ b.var('a') ]),
                    b.app(b.type('List'), [ b.var('a') ])
                )
            )
        },
        {
            "name": "detect",
            "value": b.lambda(
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
