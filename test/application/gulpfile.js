var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var babelify = require("babelify");
var reactify = require("reactify");
var stringify = require("stringify");

var opts = {
  mainJsInput: './app/main.js',
  mainJsOutput: 'app.js',
  buildFolder: './build/',
  indexHtml: './app/index.html',
  watchedFiles: [
    './app/*.js',
    './app/**/*.js',
    './app/**/**/*.js',
    './node_modules/live/lib/client/*.js',
    './node_modules/live/lib/shared/*.js'
  ]
};

gulp.task('index', function() {
  gulp.src(opts.indexHtml)
    .pipe(gulp.dest(opts.buildFolder));
});

gulp.task('compile', function() {
  var b = browserify(opts.mainJsInput, {
    paths: ['./node_modules','./app/components']
  });
  b.transform(reactify)
  b.transform(babelify)
  b.transform(stringify(['.html']))
  b.ignore('./node_modules/live/lib/server', 'tela-db')
  b.add(opts.mainJsInput)
  return b.bundle()
    .pipe(source(opts.mainJsInput))
    .pipe(rename(opts.mainJsOutput))
    .pipe(gulp.dest(opts.buildFolder))
})

gulp.task('default', ['compile', 'index'], function() {
  gulp.watch(opts.watchedFiles, ['compile', 'index']);
});
