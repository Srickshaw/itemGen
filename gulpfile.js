const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('babel', () => {
	gulp.src('dev/js/*.js')
	.pipe(babel())
	.pipe(gulp.dest('dist/js'))
});
