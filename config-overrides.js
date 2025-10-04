const path = require('path');
const fs = require('fs');

module.exports = {
  paths: function (paths, env) {
    paths.appIndexJs = path.resolve(__dirname, 'src/front/index.jsx');
    paths.appSrc = path.resolve(__dirname, 'src/front');
    return paths;
  }
};