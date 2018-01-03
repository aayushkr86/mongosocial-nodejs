var gulp     = require('gulp'),
    nodeunit = require('gulp-nodeunit');

gulp.task('unit', function () {
    gulp.src('tests/**/*.js')
        .pipe(nodeunit());
});