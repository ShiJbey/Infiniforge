/* Responsible for managing the interacttion
 * between the Infiniforge application and blender
 */
const LogManager = require( './logmanager.js' );
const spawn = require( 'child_process' ).spawn;
const LOG_NAME = "BlenderConnect";
	
module.exports.issueRenderRequest = function ( fileName, seed, templateData ) {

	
	const blender = spawn( 'blender',
		[ '--background',
		'--python',
		`${__dirname}/python/generateSword.py`,
		'--',
		`${__dirname}/json/`,
		fileName,
		seed,
		templateData["baseWidth"],
		templateData["widthMarginRatio"],
		templateData["length"]] );
		
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

		return fileName;
}
