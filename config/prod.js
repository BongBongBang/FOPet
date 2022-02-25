const TerserWebpackPlugin = require('terser-webpack-plugin');
const webpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {},
  mini: {
    webpackChain(chain, webpack, PARSE_AST_TYPE) {
      chain.plugin('analyzer').use(webpackBundleAnalyzer, []);
    }
  },
  h5: {}
};
