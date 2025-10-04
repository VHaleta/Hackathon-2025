const path = require('path');

module.exports = function override(config, env) {
  config.resolve.modules = [
    path.resolve(__dirname, 'src/front'),
    'node_modules'
  ];

  config.entry = path.resolve(__dirname, 'src/front/index.jsx');

  return config;
};