'use strict';

const
    spawn = require( 'child_process' ).spawn,
    async = require( 'async' ),
    repl = spawn( 'elm-repl' );

const lines = [
    'add b c = b + c',
    'import String',
    'other = String.join "a" ["H","w","ii","n"]'
];

let stdouts = [];

let replStarted = false;

repl.stdout.on( 'data', data => {
    if (!replStarted) {
        replStarted = true;
        async.nextTick(writeLines);
    }
    if (data !== '>') stdouts.push(data);
    console.log( `stdout: [[[ ${data} ]]] ` );
});

repl.stderr.on( 'data', data => {
    console.log( `stderr: ${data} ` );
});

repl.on( 'close', code => {
    console.log( `child process exited with code >>> ${code} }}}` );
});

var q = async.queue(function(data, callback) {
    console.log( `sending line [[[ ${data.line} ]]]`);
    repl.stdin.write(data.line + '\n', null, function() {
        setTimeout(function() {
            console.log( `${data.line} was executed, last stdout is [[[ ${stdouts[stdouts.length - 1]} ]]]`);
            callback(stdouts[stdouts.length - 1]);
        }, 500);
    });
});

// assign a callback
q.drain = function() {
    console.log('all lines were sent, killing repl');
    repl.kill();
};


function writeLines() {
    console.log('write lines called');
    lines.forEach(function(line) {
        q.push({ line: line });
    });
}
