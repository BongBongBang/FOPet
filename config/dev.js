const webpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {},
  mini: {
    webpackChain(chain, webpack, PARSE_AST_TYPE) {
      chain.plugin('analyzer').use(webpackBundleAnalyzer, []);
      chain.plugin("terser").use(TerserWebpackPlugin, [
        {
          cache: true,
          parallel: true,
          extractComments: true,
          terserOptions: {
            output: {
              comments: /@license/i
            }
          }
        }
      ])
    },
  },
  h5: {}
};
