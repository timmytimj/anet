const merge = require("webpack-merge")
const webpack = require("webpack")
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const common = require("./webpack.common.js")
const paths = require("./paths")

module.exports = merge.merge(common.clientConfig, {
  resolve: {
    modules: [paths.appSrc, "node_modules", "platform/web-dev"]
  },
  // not using source maps due to https://github.com/facebook/create-react-app/issues/343#issuecomment-237241875
  // switched from 'eval' to 'cheap-module-source-map' to address https://github.com/facebook/create-react-app/issues/920
  devtool: "cheap-module-source-map",
  output: {
    pathinfo: true,
    publicPath: "/",
    filename: "static/js/[name].js",
    chunkFilename: "static/js/[name].chunk.js"
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
    contentBase: "public",
    port: process.env.DEV_PORT,
    proxy: [
      {
        context: ["/graphql", "/api", "/assets", "/imagery", "/data"],
        target: process.env.SERVER_URL
      }
    ]
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          // ... other loaders
          {
            loader: require.resolve("babel-loader"),
            options: {
              // ... other options
              plugins: [
                // ... other plugins
                require.resolve("react-refresh/babel")
              ].filter(Boolean)
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development")
    }),
    new HtmlWebpackPlugin({
      title: "ANET",
      publicUrl: "/",
      inject: true,
      template: "public/index.hbs"
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin()
  ]
})
