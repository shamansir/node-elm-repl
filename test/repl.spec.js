const readFile = require('fs-readfile-promise');

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

const Repl = require('../src/repl.js')
const repl = new Repl({ workDir: './test/samples/elm/',
                        elmVer: '0.17.1',
                        user: 'shaman-sir',
                        project: 'test-node-elm-repl',
                        projectVer: '0.0.1' });

const expectations = [
    'SimpleTypes',
    'Lambdas',
    'Lists',
    'Tuples',
    'ImportUserTypes'
];

describe('Repl', function() {

    expectations.forEach(function(expectationsGroupName) {

        describe('Repl.' + expectationsGroupName, function() {

            it('should properly parse ' + expectationsGroupName, function() {
                const expectationsPath = './test/expectations/Repl.' + expectationsGroupName + '.expectation';
                return readFile(expectationsPath)
                       .then(function(buffer) {
                           var lines = buffer.toString().split('\n');
                           const imports = lines.shift().split(' ');
                           const pairs = lines.slice(0,-1);
                           return {
                               imports: imports,
                               pairs: pairs.map(function(line) {
                                                    const pair = line.split('\t');
                                                    return {
                                                        expression: pair[0],
                                                        expectation: pair[1]
                                                    }
                                                })
                           };
                       }).then(function(spec) {
                           const imports = spec.imports;
                           const expressions   = spec.pairs.map(function(s) { return s.expression; });
                           const expectedTypes = spec.pairs.map(function(s) { return s.expectation; });
                           return repl.getTypes(imports, expressions)
                                      .then(Repl.stringifyAll)
                                      .should.eventually.deep.equal(expectedTypes);
                       });
            });

        });

    });

});
