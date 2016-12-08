const fs = require('fs');
const readFile = require('fs-readfile-promise');

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');

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
                                      .then(function(result) {
                                        return {
                                            types: Repl.stringifyAll(result.types),
                                            values: result.values
                                        }
                                      }).should.eventually.deep.equal({
                                          types: expectedTypes,
                                          values: expectedValues
                                      });
                       });
            });

        });

    });

    it('parser is accessible and could be used to parse elmi files', function() {
        var buffer = fs.readFileSync('./test/single-pass/ComplexType.elmi');
        var expectedResult = JSON.parse(fs.readFileSync('./test/single-pass/ComplexTypeParseResult.json', 'utf8'));
        expect(Repl.Parser.parse(buffer)).to.deep.equal(expectedResult);
    });

    it('works when type was not specified', function() {
        const singlePassTestRoot = './test/single-pass';
        const singlePassRepl = new Repl({ workDir: singlePassTestRoot,
                                          elmVer: '0.18.0' });
        return singlePassRepl.getTypes([ 'NoTypeSpecified' ], [ 'NoTypeSpecified.myAdd' ])
                             .then(function(result) {
                                 return Repl.stringify(result[0]);
                             }).should.eventually.equal('a -> a -> a -> List a');
    });

});
