const readFile = require('fs-readfile-promise');

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

const Repl = require('../src/repl.js')

const repl = new Repl('./test/samples/elm');

const expectations = [
    'SimpleTypes',
    'Lambdas',
    'Lists',
    'Tuples'
];

describe('Repl', function() {

    expectations.forEach(function(expectationsGroupName) {

        describe('Repl.' + expectationsGroupName, function() {

            it('should properly parse ' + expectationsGroupName, function() {
                const expectationsPath = './test/expectations/Repl.' + expectationsGroupName + '.expectation';
                return readFile(expectationsPath)
                       .then(function(buffer) {
                           return buffer.toString()
                                        .split('\n').slice(0,-1)
                                        .map(function(line) {
                                            var pair = line.split('\t');
                                            return {
                                                expression: pair[0],
                                                expectation: pair[1]
                                            }
                                        });
                       }).then(function(specs) {
                           const expressions   = specs.map(function(s) { return s.expression; });
                           const expectedTypes = specs.map(function(s) { return s.expectation; });
                           return repl.getTypes([], expressions)
                                      .then(Repl.stringifyAll)
                                      .should.eventually.deep.equal(expectedTypes);
                       });
            });

        });

    });

});
