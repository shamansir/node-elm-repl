var buf = new Buffer([ 97, 98, 99, 100, 101, 102, 0 ]);

var binary = require('binary');
var vars = binary.parse(buf)
    .word16ls('ab')
    .word32bu('cf')
    .word8('x')
    .vars
;
console.dir(vars);

const fs = require('fs');

fs.readFile('./Anagram.elmi', function(_, stream) {
    vars = binary.parse(stream)
        .into('version', function() {
            this.word64bs('patch')
                .word64bs('minor')
                .word64bs('major');
        })
        .vars

    console.dir(vars);
});
