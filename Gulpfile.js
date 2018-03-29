var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('newstyles', function() {
    gulp.src('./new/styles/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./new/styles/'));
});

gulp.task('styles', function() {  
    gulp.src('./css/general.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css/styles/'));
});

gulp.task('stylesNew', function() {  
    gulp.src('./css/new.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css/styles/'));
});

//Watch task
gulp.task('default',function() {
    gulp.watch('new/styles/sass/**/*.scss',['newstyles']);
    gulp.watch('./css/general.scss',['styles']);
    gulp.watch('./css/new.scss',['stylesNew']);
}); 