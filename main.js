'use strict';

const
    spawn = require( 'child_process' ).spawn,
    async = require( 'async' ),
    repl = spawn( 'elm-repl' );

setTimeout(function() {
  const lines = [
      'add b c = b + c',
      '12+12',
      'import String',
      'String.join "a" ["H","w","ii","n"]',
      '12+322',
      '12+323',
      '1-4'
  ];

  let stdouts = [];

  let replStarted = false;

  let waitsForResponse = null;

  repl.stdout.on( 'data', data => {
      console.log( `from repl: \n [[[ ${data} ]]] \n\n` );
      if (!replStarted) {
          replStarted = true;
          async.nextTick(writeLines);
      } else if (waitsForResponse) {
          waitsForResponse(data);
          waitsForResponse = null;
      }
  });

  repl.stderr.on( 'data', data => {
      console.log( `stderr: ${data} ` );
  });

  repl.on( 'close', code => {
      console.log( `child process exited with code [[[ ${code} ]]]\n\n` );
  });

  var q = async.queue(function(data, callback) {
      console.log( `sending line [[[ ${data.line} ]]]\n\n`);
      repl.stdin.write(data.line + '\n', function(err) {
        // console.log(`inside stdin.write callback. wrote ${data.line}`)
        if(err) {
          console.log('error writing to stdid', err.toString())
        }
          waitsForResponse = function(response) {
              console.log( `${data.line} === ${response}\n\n`);
              setTimeout(function() {
                callback(response);
              }, 1000)
          };
      });
  });

  q.drain = function() {
      console.log('all lines were sent, killing repl');
      setTimeout(() => {
        repl.kill();
      }, 5000)
  };


  function writeLines() {
      console.log('write lines called');
      lines.forEach(function(line) {
          q.push({ line: line });
      });
  }
}, 500)
