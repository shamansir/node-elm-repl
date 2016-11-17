const readFile = require('fs-readfile-promise');

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

const Repl = require('../src/repl.js')
const repl = new Repl({ workDir: './test/samples/elm/',
                        elmVer: '0.18.0',
                        user: 'shaman-sir',
                        project: 'test-node-elm-repl',
                        projectVer: '0.0.1',
                        keepTempFile: true,
                        keepElmiFile: true });

const expectations = [
    'SimpleTypes',
    'Lambdas',
    'Lists',
    'Tuples',
    'Records',
    'ImportCoreTypes',
    'ImportTypesFromInstalledPackage',
    'ImportUserTypes'
];

describe('Repl', function() {

    expectations.forEach(function(expectationsGroupName) {

        describe('Repl.' + expectationsGroupName, function() {

            it('should properly extract types for ' + expectationsGroupName, function() {
                const expectationsPath = './test/expectations/Repl.' + expectationsGroupName + '.expectation';
                return readFile(expectationsPath)
                       .then(function(buffer) {
                           var lines = buffer.toString().split('\n');
                           const imports = lines.shift().split('\t');
                           const triplets = lines.slice(0,-1);
                           return {
                               imports: imports,
                               pairs: triplets.map(function(line) {
                                                       const triplet = line.split('\t');
                                                       return {
                                                           expression: triplet[0],
                                                           expectation: triplet[1]
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

            it('should properly extract values for ' + expectationsGroupName, function() {
                const expectationsPath = './test/expectations/Repl.' + expectationsGroupName + '.expectation';
                return readFile(expectationsPath)
                       .then(function(buffer) {
                           var lines = buffer.toString().split('\n');
                           const imports = lines.shift().split('\t');
                           const triplets = lines.slice(0,-1);
                           return {
                               imports: imports,
                               pairs: triplets.map(function(line) {
                                                       const triplet = line.split('\t');
                                                       return {
                                                           expression: triplet[0],
                                                           expectation: triplet[2]
                                                       }
                                                   })
                           };
                       }).then(function(spec) {
                           const imports = spec.imports;
                           const expressions   = spec.pairs.map(function(s) { return s.expression; });
                           const expectedValues = spec.pairs.map(function(s) { return s.expectation; });
                           return repl.getValues(imports, expressions)
                                      .should.eventually.deep.equal(expectedValues);
                       });
            });

            it('should properly extract both types and values for ' + expectationsGroupName, function() {
                const expectationsPath = './test/expectations/Repl.' + expectationsGroupName + '.expectation';
                return readFile(expectationsPath)
                       .then(function(buffer) {
                           var lines = buffer.toString().split('\n');
                           const imports = lines.shift().split('\t');
                           const triplets = lines.slice(0,-1);
                           return {
                               imports: imports,
                               triplets: triplets.map(function(line) {
                                                          const triplet = line.split('\t');
                                                          return {
                                                              expression: triplet[0],
                                                              type: triplet[1],
                                                              value: triplet[2],
                                                          }
                                                      })
                           };
                       }).then(function(spec) {
                           const imports = spec.imports;
                           const expressions    = spec.triplets.map(function(s) { return s.expression; });
                           const expectedTypes  = spec.triplets.map(function(s) { return s.type; });
                           const expectedValues = spec.triplets.map(function(s) { return s.value; });
                           return repl.getTypesAndValues(imports, expressions)
                                      .should.eventually.deep.equal({
                                          types: expectedTypes,
                                          values: expectedValues
                                      });
                       });
            });

        });

    });

});
