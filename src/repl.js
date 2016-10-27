const elmiParser = require('./parser.js');
const types = require('./types.js');

function Repl(workDir) {

}

Repl.prototype.getTypes = function(expressions) {
    return new Promise(
        function(resolve, reject) {
            setTimeout(
                function() {
                    resolve([
                        'Int', 'Float', 'Int', 'Int -> Int -> Int'
                    ]);
                }, Math.random() * 500);
        }
    );
}

module.exports = Repl;
