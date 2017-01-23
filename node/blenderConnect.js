/* Responsible for managing the interacttion
 * between the Infiniforge application and blender
 */
const LogManager = require( './logmanager.js' );
const spawn = require( 'child_process' ).spawn;
const LOG_NAME = "BlenderConnect";
	
module.exports.issueRenderRequest = function ( args ) {
	
	const blender = spawn( 'blender',
		[ '--background',
		'--python',
		`${__dirname}/python/renderSword.py`,
		'--',
		__dirname,
		args.weaponStyle ] );
		
		blender.stdout.on( 'data', ( data ) => {
			LogManager.writeToLog(LOG_NAME, 'stdout: ' + data);
		});

		blender.stderr.on( 'data', ( data ) => {
			LogManager.writeToLog(LOG_NAME, 'stdout: ' + data);
		});

		blender.on( 'close', ( code ) => {
			LogManager.writeToLog(LOG_NAME, 'Blender process exited with code: ' + code);
		});

		blender.on('error', (err) => {
			console.log(err);
		});

		return String(args.weaponStyle) + "sword.json";
}
