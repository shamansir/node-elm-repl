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
                        user: 'user',
                        package: 'project',
                        packageVer: '1.0.0',
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
    'ImportUserTypes',
    'Issues'
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
                                      .then(filterWeirdFunctions)
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
                                            values: filterWeirdFunctions(result.values)
                                        }
                                      }).should.eventually.deep.equal({
                                          types: expectedTypes,
                                          values: expectedValues
                                      });
                       });
            });

        });

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

    it('parser is accessible and could be used to parse elmi files', function() {
        const buffer = fs.readFileSync('./test/single-pass/ComplexTypes.elmi');
        const expectedResult = JSON.parse(fs.readFileSync('./test/single-pass/ComplexTypesParseResult.json', 'utf8'));
        expect(Repl.Parser.parse(buffer)).to.deep.equal(expectedResult);
    });

    it('it is possible to specify just the name of the module to parse', function() {
        const expectedResult = JSON.parse(
            fs.readFileSync('./test/single-pass/ComplexTypesParseResult.json', 'utf8')
        );
        const parsePromise =
            new Repl({ workDir: './test/single-pass',
                       elmVer: '0.18.0' })
                .parseModule('ComplexTypes');
        return parsePromise.should.eventually.deep.equal(expectedResult);
    });

    it('it is possible to specify a path to the module to parse', function() {
        const expectedResult = JSON.parse(
            fs.readFileSync('./test/single-pass/InnerModule/InnerTypesParseResult.json', 'utf8')
        );
        const parsePromise =
            new Repl({ workDir: './test/single-pass',
                       elmVer: '0.18.0' })
                .parseModule('InnerModule.InnerTypes');
        return parsePromise.should.eventually.deep.equal(expectedResult);
    });

    it('is is possible to pass some lines to create a module from them and parse', function() {
        const userLines = JSON.parse(
            fs.readFileSync('./test/single-pass/LinesTest.json', 'utf8')
        ).lines;
        const expectedResult = JSON.parse(
            fs.readFileSync('./test/single-pass/LinesTestParseResult.json', 'utf8')
        );
        const parsePromise =
            new Repl({ workDir: './test/single-pass',
                       elmVer: '0.18.0' })
                .parseLines(userLines, 'Foobar');
        return parsePromise.should.eventually.deep.equal(expectedResult);
    });

    it('is is possible to pass module text to create a module from it and parse', function() {
        const userLines = JSON.parse(
            fs.readFileSync('./test/single-pass/LinesTest.json', 'utf8')
        ).lines;
        const userText = [ 'module Foobar exposing (..)', '' ].concat(userLines).join('\n')
        const expectedResult = JSON.parse(
            fs.readFileSync('./test/single-pass/LinesTestParseResult.json', 'utf8')
        );
        const parsePromise =
            new Repl({ workDir: './test/single-pass',
                       elmVer: '0.18.0' })
                .parseModuleText(userText);
        return parsePromise.should.eventually.deep.equal(expectedResult);
    });

    it('it is possible to format a specific type in a custom way', function() {
        const customStringifier = {
            'var': function(name) { return '<' + name + '>'; },
            'type': function(name, path) {
                return path ? '+ ' + path.join('..') + ' // ' + name + ' +'
                            : '- ' + name;
            },
            'aliased': function(name, path) {
                return path ? '{{ ' + path.join('^^') + ' --- ' + name + ' }}'
                            : '[[ ' + name + ' ]]';
            },
            'lambda': function(left, right) { return right + ' ::: ' + left; },
            'app': function(subject, object) { return subject + ' ** ' + object.join('_'); },
            'record': function(fields) {
                return '& ' + fields.map(function(pair) {
                    return pair.name + ' >< ' + pair.value;
                }).join(' %% ') + ' &';
            }
        };

        const customTypeDefinition =
            '+ Platform // Program + ** + Basics // Never +_<model>_<msg> ::: ' +
            '& model >< <model> %% update >< <model> ::: <model> ::: <msg> %% view >< {{ Html --- Html }} ::: ' +
            '<model> & ::: - List ** {{ Html --- Html }} ::: {{ Html --- Html }}';

        const buffer = fs.readFileSync('./test/single-pass/ComplexTypes.elmi');
        const parsedElmi = Repl.Parser.parse(buffer);
        expect(parsedElmi.types[1].name).to.equal('testComplexType');
        const complexTypeDef = parsedElmi.types[1].value;
        expect(Repl.stringify(complexTypeDef, customStringifier)).to.equal(customTypeDefinition);
    });

    it('it is possible to format several types in a custom way', function() {
        const customStringifier = {
            'var': function(name) { return '$' + name + '$'; },
            'type': function(name, path) {
                return path ? '> ' + path.join('..') + ' ¯\\_(ツ)_/¯ ' + name + ' +'
                            : '<  ' + name;
            },
            'aliased': function(name, path) {
                return path ? '{{ ' + path.join('^^') + ' --- ' + name + ' }}'
                            : '[[ ' + name + ' ]]';
            },
            'lambda': function(left, right) { return right + ' ::: ' + left; },
            'app': function(subject, object) { return subject + ' ** ' + object.join('_'); },
            'record': function(fields) {
                return '& ' + fields.map(function(pair) {
                    return pair.name + ' GG ' + pair.value;
                }).join(' %% ') + ' &';
            }
        };

        const customTypeDefinitions = [
            '> Platform ¯\\_(ツ)_/¯ Program + ** > Basics ¯\\_(ツ)_/¯ Never +_$model$_$msg$ ::: ' +
            '& model GG $model$ %% update GG $model$ ::: $model$ ::: $msg$ %% view GG {{ Html --- Html }} ::: ' +
            '$model$ & ::: <  List ** {{ Html --- Html }} ::: {{ Html --- Html }}',
            '> A..B ¯\\_(ツ)_/¯ AAA +' ];

        const buffer = fs.readFileSync('./test/single-pass/ComplexTypes.elmi');
        const parsedElmi = Repl.Parser.parse(buffer);
        expect(parsedElmi.types[1].name).to.equal('testComplexType');
        const complexTypeDef = parsedElmi.types[1].value;
        expect(Repl.stringifyAll(
            [ complexTypeDef,
              { type: 'type', 'def': { 'name': 'AAA', 'path': [ 'A', 'B' ] } }
            ], customStringifier)).to.deep.equal(customTypeDefinitions);
    });

});


function filterWeirdFunctions(values) {
    return values.map(function(value) {
        if ((typeof value === 'string') &&
            (value.indexOf('<function:') >= 0)) {
            return '<function>';
        }
        return value;
    })
}
