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
        { 'Planet' : [ 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune' ] },
        'earthPeriod',
        'ageByOrbitalPeriod',
        'ageOn'
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
            name: 'Earth',
            value: b.complexType('user', 'project', 'SpaceAge', 'Planet')
        },
        {
            name: 'Jupiter',
            value: b.complexType('user', 'project', 'SpaceAge', 'Planet')
        },
        {
            name: 'Mars',
            value: b.complexType('user', 'project', 'SpaceAge', 'Planet')
        },
        {
            name: 'Mercury',
            value: b.complexType('user', 'project', 'SpaceAge', 'Planet')
        },
        {
            name: 'Neptune',
            value: b.complexType('user', 'project', 'SpaceAge', 'Planet')
        },
        {
            name: 'Saturn',
            value: b.complexType('user', 'project', 'SpaceAge', 'Planet')
        },
        {
            name: 'Uranus',
            value: b.complexType('user', 'project', 'SpaceAge', 'Planet')
        },
        {
            name: 'Venus',
            value: b.complexType('user', 'project', 'SpaceAge', 'Planet')
        },
        {
            name: 'ageByOrbitalPeriod',
            value: b.lambda(
                b.type('Float'),
                b.lambda(
                    b.type('Float'),
                    b.type('Float')
                )
            )
        },
        {
            name: 'ageOn',
            value: b.lambda(
                b.complexType('user', 'project', 'SpaceAge', 'Planet'),
                b.lambda(
                    b.type('Float'),
                    b.type('Float')
                )
            )
        },
        {
            name: 'earthPeriod',
            value: b.type('Float')
        }
    ]
};

module.exports = expectation;
