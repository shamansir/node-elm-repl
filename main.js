'use strict';

const
    //spawn = require( 'child_process' ).spawn,
    pty = require('pty.js')/*,
    async = require( 'async' ),
    repl = spawn( 'elm-repl' )*/;

const lines = [
    'add b c = b + c',
    'import String',
    'other = String.join "a" ["H","w","ii","n"]'
];

const term = pty.spawn('elm-repl', [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});

let lineToSend = 0;

let waitsForResponse = null;

const INPUTS_TO_SKIP = 2;

let inputsLeftToSkip = 2;

term.on( 'data', data => {
    //const strData = data.toString();
    //console.log(typeof data);
    //console.log( `stdout: [[[${data}]]]`, data.trim().length, 'welcoming: ', data.indexOf('>') === 0);
    console.log( `stdout: [[[${data}]]]`);
    if (data == '> ') {
        sendNextLine();
    } else if (waitsForResponse && (data.trim().length > 0)) {
        if (inputsLeftToSkip == 0) {
            waitsForResponse(data);
            waitsForResponse = null;
            sendNextLine();
        } else {
            inputsLeftToSkip--;
        }
    }
});

/* term.stderr.on( 'data', data => {
    console.log( `stderr: ${data} ` );
}); */

term.on( 'exit', code => {
    console.log( `child process exited with code [[[${code}]]]` );
});

function sendNextLine() {
    console.log(`trying to send next line #${lineToSend + 1} / ${lines.length}`);
    if (lineToSend < lines.length) {
        var nextLine = lines[lineToSend];
        console.log( `sending line [[[${nextLine}]]]`);
        inputsLeftToSkip = INPUTS_TO_SKIP;
        term.write(nextLine + '\r');
        waitsForResponse = function(response) {
            console.log( `[[[${nextLine}]]] was executed, received response as [[[${response}]]]`);
        };
        lineToSend++;
    } else {
        console.log('all lines were sent, killing repl');
        term.kill();
    }
}
