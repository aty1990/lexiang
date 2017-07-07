/**
 * Created by yuanxiufu on 2017/2/22.
 */

var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    amd = require('amd-optimize'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
   /* sprity = require('sprity'),*/
    babel = require('gulp-babel'),
    htmlmin = require('gulp-htmlmin'),
    sourcemaps = require('gulp-sourcemaps'),
    connect = require('gulp-connect');

var srcRoot = './app',
    serverRoot = './src/main/webapp',
    distRoot = `${serverRoot}/app`;

var path = {
  rjs: [`${srcRoot}/js/lib/**/*.js`, `${distRoot}/js/lib/`],
  js: [[`!${srcRoot}/js/lib/**/*.js`, `${srcRoot}/js/**/*.js`], `${distRoot}/js/`],
  sass: [`${srcRoot}/sass/**/*.scss`, `${distRoot}/css/`],
  img: [[`!${srcRoot}/img/icon/**/*.png`, `${srcRoot}/img/**/*.jpg`, `${srcRoot}/img/**/*.png`], `${distRoot}/img/`],
  tpl: [`${srcRoot}/tpl/**/*.html`, `${distRoot}/tpl/`]
};

gulp.task('default', ['rjs', 'js', 'sass', 'tpl', 'connect', 'watch']);
gulp.task('dist', ['rjs', 'js', 'sass', 'tpl']);

gulp.task('connect', function () {
  connect.server({
    root: serverRoot,
    port: 9090,
    livereload: true
  })
});

gulp.task('watch', function () {
  gulp.watch(path.rjs[0], ['rjs']);
  gulp.watch(path.js[0], ['js']);
  gulp.watch(path.sass[0], ['sass']);
  gulp.watch(path.tpl[0], ['tpl'])
});

gulp.task('rjs', function (done) {
  var libPath = 'app/js/lib';
  gulp.src(path.rjs[0])
      //.pipe(sourcemaps.init())
      .pipe(amd('base', {
        paths: {
          'const': `${libPath}/constant`,
          '$': `${libPath}/zepto`,
          'weui': `${libPath}/weui`,
          'pm': `${libPath}/page-manager`,
          'iscroll': `${libPath}/iscroll-probe`,
          'iscroll-pullable': `${libPath}/iscroll-pullable`,
          'lexiang-iscroll': `${libPath}/lexiang-iscroll`,
          'drag-refresh': `${libPath}/drag-refresh`,
          'list': `${libPath}/list`,
          'fm': `${libPath}/fm`,
          'spinner': `${libPath}/spinner`,
          'html-tpl': `${libPath}/html-tpl`,
          'http-util': `${libPath}/http-util`,
          'tabs': `${libPath}/tabs`,
          'util': `${libPath}/util`,
          'parabola': `${libPath}/parabola`,
          'wx-util': `${libPath}/wx-util`
        }
      }))
      .pipe(concat('base.js'))
      .pipe(gulp.dest(path.rjs[1]))
      .pipe(uglify())
      //.pipe(sourcemaps.write())
      .pipe(rename('base.min.js'))
      .pipe(gulp.dest(path.rjs[1]))
      .pipe(connect.reload())
      .on('end', done);
});

gulp.task('js', function (done) {
  gulp.src(path.js[0])
      .pipe(babel({ presets: ['es2015'] }))
      //.pipe(uglify())
      .pipe(gulp.dest(path.js[1]))
      .pipe(connect.reload())
      .on('end', done);
});

gulp.task('sass', function (done) {
  gulp.src(path.sass[0])
      .pipe(sass())
      .on('error', sass.logError)
      .pipe(minifyCss({ keepSpecialComments: 0 }))
      .pipe(gulp.dest(path.sass[1]))
      .pipe(connect.reload())
      .on('end', done);
});

gulp.task('tpl', function (done) {
  gulp.src(path.tpl[0])
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest(path.tpl[1]))
      .pipe(connect.reload())
      .on('end', done);
});

gulp.task('sprity', function (done) {
  var opt = {
    src: [`${srcRoot}/img/icon/**/*.png`],
    cssPath: '../img/',
    style: '_sprite.scss',
    name: 'sprite',
    prefix: 'app-icon',
    processor: 'sass',
    template: './app/sprity.hbs',
    dimension: [{ ratio: 1, dpi: 72 }, { ratio: 2, dpi: 192 }]
  };
  sprity.src(opt).pipe(gulpif('*.png', gulp.dest(path.img[1]), gulp.dest('./app/sass/')))
});

