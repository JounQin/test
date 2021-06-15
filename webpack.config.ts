import HtmlWebpackPlugin from 'html-webpack-plugin'
import { DefinePlugin, Configuration } from 'webpack'
import { VueLoaderPlugin } from 'vue-loader'

const NODE_ENV = (process.env.NODE_ENV ?? 'development') as
  | 'development'
  | 'production'

const isProd = NODE_ENV === 'production'

const config: Configuration = {
  mode: NODE_ENV,
  entry: './src/index.ts',
  devtool: isProd ? false : 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.[jt]sx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['vue-style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.worker\.[jt]s$/,
        loader: 'worker-loader',
        exclude: require.resolve('monaco-editor/esm/vs/editor/editor.worker'),
      },
      {
        test: /\.ttf$/,
        loader: 'url-loader',
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin(),
  ],
}

export default config
