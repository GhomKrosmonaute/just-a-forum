const gulp = require("gulp")
const clean = require("gulp-clean")
const tsc = require("gulp-typescript")
const cp = require("child_process")

function start(cb) {
  cp.exec("nodemon dist/index", function (err, stdout, stderr) {
    console.log(stdout)
    console.log(stderr)
    cb(err)
  })
}

function watching(cb) {
  start(cb)
  gulp.watch(
    ["gulpfile.js", "assets/**", "src/**/*.ts", "views/**/*.ejs"],
    { delay: 500 },
    build
  )
}

function build() {
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
    .src(["dist", "data"], { read: false, allowEmpty: true })
    .pipe(clean({ force: true }))
}

exports.start = start
exports.clean = cleaner
exports.build = build
exports.watch = gulp.series(cleaner, build, watching)
exports.default = watching
