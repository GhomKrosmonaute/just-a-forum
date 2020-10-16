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
  gulp.watch(
    ["src/**/*.ts"],
    { delay: 500 },
    gulp.series(cleanTypescript, buildTypescript)
  )
  gulp.watch(
    ["sass/**/*.scss"],
    { delay: 500 },
    gulp.series(cleanSass, buildSass)
  )
  gulp.watch(
    ["brand/**/*.png"],
    { delay: 500 },
    gulp.series(cleanAssets, copyAssets)
  )
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

function cleanTypescript() {
  return cleanByGlob("dist")
}

function cleanDatabase() {
  return cleanByGlob("data")
}

function cleanSass() {
  return cleanByGlob("public/sass")
}

function cleanAssets() {
  return cleanByGlob(["public/assets/brand"])
}

function cleanByGlob(globs) {
  return gulp
    .src(globs, { read: false, allowEmpty: true })
    .pipe(clean({ force: true }))
}

function copyAssets() {
  return gulp.src("brand/**/*.png").pipe(gulp.dest("public/brand/"))
}

const safeClean = gulp.series(cleanAssets, cleanSass, cleanTypescript)
const build = gulp.series(safeClean, copyAssets, buildSass, buildTypescript)
const watch = gulp.series(build, watching)

exports.start = start
exports.reset = cleanDatabase
exports.clean = safeClean
exports.build = build
exports.sass = buildSass
exports.tsc = buildTypescript
exports.watch = watch
exports.default = watch
