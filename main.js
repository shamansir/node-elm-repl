'use strict';

const
    spawn = require( 'child_process' ).spawn,
    repl = spawn( 'elm-repl' );

repl.stdout.on( 'data', data => {
    console.log( `stdout: ${data}` );
});

repl.stderr.on( 'data', data => {
    console.log( `stderr: ${data}` );
});

repl.on( 'close', code => {
    console.log( `child process exited with code ${code}` );
});

repl.stdin.write('add b c = b + c\nimport String\nother = String.join "a" ["H","w","ii","n"]\n').end();

//repl.stdin.write('String\n');

//repl.kill();

/* const spawnSync = require( 'child_process' ).spawnSync;

const runResult = spawnSync('elm-repl', [], {
    input: 'add b c = b + c\nimport String\nother = String.join "a" ["H","w","ii","n"]\n'
});

console.log('---- STDOUT -----');
console.log(runResult.stdout.toString());
console.log('---- STDERR -----');
console.log(runResult.stderr.toString()); */
