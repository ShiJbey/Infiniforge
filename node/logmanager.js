/* manages writing to log files */
const fs = require('fs');

module.exports.writeToLog = function (filePath, text) {
	fs.appendFile(filePath, text + "\n", (err) => { if (err) throw err; });
}

