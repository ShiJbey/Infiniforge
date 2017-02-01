/* Responsible for managing the interacttion
 * between the Infiniforge application and blender
 */
const LogManager = require( './logmanager.js' );
const spawn = require( 'child_process' ).spawn;
const LOG_NAME = "BlenderConnect";
const os = require('os');
	
module.exports.issueRenderRequest = function ( fileName, seed, templateData, emitter, reqParams, res ) {

	var pythonScriptPath = (os.platform() == 'win32') ?
		`${__dirname}\\python\\generateSword.py` :
		`${__dirname}/python/generateSword.py`;

	var jsonDirPath =  (os.platform() == 'win32') ?
		`${__dirname}\\json\\` :
		`${__dirname}/json/`;

		console.log(jsonDirPath);
	
	const blender = spawn( 'blender',
		[ '--background',
		'--python',
		pythonScriptPath,
		'--',
		jsonDirPath,
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
			emitter.emit( 'forgeFinished', jsonDirPath + fileName, reqParams, res);
		});

		blender.on('error', (err) => {
			console.log(err);
		});

		return fileName;
}
