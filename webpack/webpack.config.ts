import path from 'path';
import { Configuration } from 'webpack';

import { RewritePlugin } from './rewrite-plugin';

const config: Configuration = {
  mode: 'production',
  entry: path.resolve(__dirname, '../src/index.ts'),

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js',
  },

  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [
      new RewritePlugin({
        suffix: '-18',
      }),
    ],
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
};

export default config;
