// パッケージの読み込み
const path = require('path');
const glob = require('glob');

const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const imagemin = require('imagemin-keep-folder');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminGifsicle = require('imagemin-gifsicle');
// const imageminSvgo = require('imagemin-svgo');


const entries = {};
const createEntries = () => {
  const srcDir = './src/js';
  glob.sync('**/*.js', {
      ignore: '**/_*/*.js',
      cwd: srcDir,
  }).forEach(jsFileName => {
      const fileNameExceptExt = jsFileName.replace(/\.js$/, '');
      entries[fileNameExceptExt] = path.resolve(srcDir, jsFileName);
  });
}
createEntries();


// バンドル時の設定
module.exports = {
    mode: 'production',
    entry: entries,
    watch: true,
    target: ['web', 'es5'],
    watchOptions: {
      ignored: /node_modules/,
    },
    cache: true,
    output: {
      filename: 'js/[name].min.js',
      path: path.join(__dirname, 'dist'),
    },
    // !!!本番時はコメントアウト!!!
    // devtool: "source-map",
    module: {
        rules: [
          {
            test: /\.scss$/,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader',
              {
                loader: 'sass-loader',
                options: {
                    implementation: require('sass'),
                },
              },
            ]
          },
          {
            test: /\.js$/,
            use: {
             loader: 'babel-loader',
             options: {
              presets: [ '@babel/preset-env' ]
             }
            }
          },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
          filename: 'css/[name].min.css',
        }),
        // new ImageminPlugin({
        //   // disable: process.env.NODE_ENV !== 'production',
        //   test: /\.(jpe?g|png|gif|svg)$/i,
        //   pngquant: {
        //     quality: '65-80'
        //   },
        //   gifsicle: {
        //     interlaced: false,
        //     optimizationLevel: 1,
        //     colors: 256
        //   },
        //   svgo: {
        //   },
        //   plugins: [
        //     ImageminMozjpeg({
        //       quality: 80,
        //       progressive: true
        //     })
        //   ]
        // }),
        new BrowserSyncPlugin({
          host: 'localhost',
          server: { baseDir: 'dist' },
          watch: true
        })
    ],
    optimization: {
        minimizer: [
          new TerserPlugin({
            extractComments: false,
          }),
        ],
    }
};


imagemin(['src/images/**/*.{jpg,png,gif,svg}'], {
  plugins: [
    imageminMozjpeg({ quality: 80 }),
    imageminPngquant({ quality: [.65, .8] }),
    imageminGifsicle(),
    // imageminSvgo()
    // エラーになるなぁCOMMONモジュールとか言ってるなぁ…
    // 「a dynamic import() which is available in all CommonJS modules.」
  ],
  replaceOutputDir: output => {
    return output.replace(/images\//, '../dist/images/');
  }
}).then(() => {
  console.log('Images optimized');
});
