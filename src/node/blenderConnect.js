const spawn = require( 'child_process' ).spawn;
const blender = spawn( 'blender', [] );

blender.stdout.on( 'data', ( data ) => {
	console.log( 'stdout: ' + data );
});

blender.stderr.on( 'data', ( data ) => {
	console.log( 'stderr: ' + data );
});

blender.on( 'close', ( code ) => {
	console.log( 'child process exited with code: ' + code );
});