const gulp = require("gulp")
const clean = require("gulp-clean")
const tsc = require("gulp-typescript")
const sass = require("gulp-sass")
const maps = require("gulp-sourcemaps")
const cp = require("child_process")

function start(cb) {
  cp.exec("nodemon dist/index", cb)
}

function watching(cb) {
  start(cb)
  gulp.watch(["src/**/*.ts"], { delay: 500 }, buildTypescript)
  gulp.watch(["sass/**/*.scss"], { delay: 500 }, buildSass)
}

function buildSass() {
  return gulp
    .src("sass/**/*.scss")
    .pipe(maps.init())
    .pipe(sass.sync({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(maps.write())
    .pipe(gulp.dest("public/sass"))
}

function buildTypescript() {
  return gulp
    .src("src/**/*.ts")
    .pipe(
      tsc({
        target: "es2020",
        lib: ["es2020"],
        module: "commonjs",
        declaration: false,
        strict: true,
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
      })
    )
    .pipe(gulp.dest("dist"))
}

function cleaner() {
  return gulp
    .src(["dist", "data", "public/sass"], { read: false, allowEmpty: true })
    .pipe(clean({ force: true }))
}

const build = gulp.series(buildSass, buildTypescript)
const watch = gulp.series(cleaner, build, watching)

exports.start = start
exports.clean = cleaner
exports.build = build
exports.sass = buildSass
exports.tsc = buildTypescript
exports.watch = watch
exports.default = watch
