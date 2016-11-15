const readFile = require('fs-readfile-promise');

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

const elmiParser = require('../src/parser.js');

function parseStream(stream) {
    return elmiParser.parse(stream);
}

var samples = [
    'Anagram',
    'HelloWorld',
    'Leap',
    'DifferenceOfSquares',
    'Bob',
    'Raindrops',
    'SpaceAge',
    'Pangram',
    'Triangle'
];

describe('Parser', function() {

    samples.forEach(function(sampleName) {

        describe(sampleName + '.elmi', function() {

            it('should properly parse ' + sampleName + '.elmi file', function() {
                var expectation = require('./expectations/' + sampleName + '.expectation.js');
                return readFile('./test/samples/elmi/' + sampleName + '.elmi')
                       .then(parseStream)
                       .should.eventually.deep.equal(expectation);
            });

        });

    });

});
