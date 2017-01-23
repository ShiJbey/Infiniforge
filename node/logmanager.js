/* manages writing to log files */
const fs = require('fs');
const LOG_DIR = "./logs/";

module.exports.writeToLog = function (logName, text) {
	fs.appendFile(LOG_DIR + logName + '.txt', text + "\n", (err) => {
  	if (err) throw err;
  });
}

