var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('styles', function() {
    gulp.src('./new/styles/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./new/styles/'));
});

//Watch task
gulp.task('default',function() {
    gulp.watch('new/styles/sass/**/*.scss',['styles']);
});