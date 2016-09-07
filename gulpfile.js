const gulp = require('gulp');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');

gulp.task('babel', () => {
	gulp.src('dev/js/*.js')
	.pipe(babel())
	.pipe(gulp.dest('dist/js'))
});

gulp.task('minCSS', () => {
	gulp.src('dev/css/*.css')
	.pipe(cleanCSS())
	.pipe(rename({ suffix: '.min' }))
	.pipe(gulp.dest('dist/css'));
});

gulp.task('build', ['babel', 'minCSS']);

gulp.task('watch', () => {
	gulp.watch('dev/css/*.css', ['minCSS']);
	gulp.watch('dev/js/*.js', ['babel']);
});
