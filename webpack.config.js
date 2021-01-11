const path = require('path');

module.exports = {
  mode: 'production',
  entry: './server/www/js/app.js',
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, 'server/www/js'),
  },
};
