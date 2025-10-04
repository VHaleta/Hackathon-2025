const path = require('path');

module.exports = {
  paths: function (paths, env) {
    paths.appIndexJs = path.resolve(__dirname, 'src/index.jsx');
    paths.appSrc = path.resolve(__dirname, 'src');
    return paths;
  },
  webpack: function (config, env) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src')
    };
    return config;
  }
};