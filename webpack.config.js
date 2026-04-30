/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

/**
 * Webpack config for the standalone embed popup bundle.
 *
 * Bundles `components/embed/popup/standalone-bundle-root.tsx` into
 * `public/embed-popup.js` so consumer sites can drop in:
 *   <script src="https://your.app/embed-popup.js" data-stridify-sandbox-id="..."></script>
 */
module.exports = {
  mode: process.env.NODE_ENV === "development" ? "development" : "production",
  entry: "./components/embed/popup/standalone-bundle-root.tsx",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "embed-popup.js",
    clean: false,
  },
  devtool: "source-map",
  resolve: {
    alias: { "@": path.resolve(__dirname) },
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new Dotenv({
      systemvars: true,
      path: ".env.local",
      ignoreStub: true,
    }),
    // Provide a fallback `process.env` so any unresolved references don't
    // crash in the browser. Dotenv-webpack only inlines vars that exist;
    // anything else falls back to this empty object.
    new webpack.DefinePlugin({
      "process.env": JSON.stringify({}),
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV === "development" ? "development" : "production",
      ),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.webpack.json",
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: "css-loader",
            options: { exportType: "string", importLoaders: 1 },
          },
          "postcss-loader",
        ],
      },
    ],
  },
};
