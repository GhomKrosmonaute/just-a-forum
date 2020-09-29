const gulp = require("gulp")
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
        declaration: true,
        strict: true,
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
      })
    )
    .pipe(gulp.dest("dist"))
}

exports.start = start
exports.watch = watching
exports.default = watching
