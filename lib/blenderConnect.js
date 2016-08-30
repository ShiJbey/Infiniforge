const spawn = require( 'child_process' ).spawn;

module.exports.connect = function( args ) {

	const blender = spawn( 'blender', [ '--background', '--python', './python/renderSword.py',
																	'--',
																	__dirname,
																	 args['swordStyle']] );

	blender.stdout.on( 'data', ( data ) => {
		console.log( 'stdout: ' + data );
	});

	blender.stderr.on( 'data', ( data ) => {
		console.log( 'stderr: ' + data );
	});

	blender.on( 'close', ( code ) => {
		console.log( 'child process exited with code: ' + code );
	});

}