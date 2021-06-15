import HtmlWebpackPlugin from 'html-webpack-plugin'
import { Configuration } from 'webpack'
import { VueLoaderPlugin } from 'vue-loader'

const config: Configuration = {
  mode:
    (process.env.NODE_ENV as 'development' | 'production' | undefined) ??
    'development',
  entry: './src/index.ts',
  devtool: 'source-map',
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
      },
      {
        test: /\.ttf$/,
        loader: 'url-loader',
      },
    ],
  },
  plugins: [new VueLoaderPlugin(), new HtmlWebpackPlugin()],
}

export default config
