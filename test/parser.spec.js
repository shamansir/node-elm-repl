const readFile = require('fs-readfile-promise');

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

const elmiParser = require('../parser.js');

function parseStream(stream) {
    return elmiParser.parse(stream);
}

describe('Parser', function() {

    describe('Anagram.elmi', function() {

        it('should be able to parse Anagram.elmi file', function() {
            var expectation = require('./expectations/Anagram.expectation.json');
            return readFile('./test/samples/elmi/Anagram.elmi')
                   .then(parseStream)
                   .should.eventually.deep.equal(expectation);
        });

    });

});
