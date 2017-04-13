var gulp = require('gulp');
var sass = require('gulp-sass');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');

var del = require('del');
var runSequence = require('run-sequence');
var browserSyncApp = require('browser-sync').create();
var browserSyncDist = require('browser-sync').create();


// Browser sync /app/.
gulp.task('browserSyncApp', function(){

	browserSyncApp.init({
		server: {
			baseDir: 'app'
		},
	});

});

// Browser sync /dist/
gulp.task('browserSyncDist', function(){

	browserSyncDist.init({
		server: {
			baseDir: 'dist'
		},
	});

});

// Sass task.
gulp.task('sass', function(){

	return gulp.src('app/scss/**/*.scss')
		.pipe( sass() )
		.pipe( gulp.dest('app/css') )
		.pipe( browserSyncApp.reload({ stream: true }) )

});

// Image minification.
gulp.task('images', function(){

	return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
		.pipe( cache( imagemin({
			interlaced: true// Interlace GIFs
		}) ) )
		.pipe( gulp.dest('dist/images') )

});

// Bundle CSs and JS files.
gulp.task('useref', function(){

	return gulp.src('app/*.html')
		.pipe( useref() )
		.pipe( gulpIf( '*.js', uglify() ) )// Minifies only if it's js.
		.pipe( gulpIf( '*.css', cssnano() ) )// Minifies only if it's css.
		.pipe( gulp.dest( 'dist' ) )

});

// Fonts.
gulp.task('fonts', function() {
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'))
});

// Clean.
gulp.task('clean:dist', function(){

	return del.sync('dist');

});

// Clear cache  - only runs manually, ie. $ gulp cache:clear
gulp.task('cache:clear', function( callback ){

	return cache.clearAll( callback );

});

// Watch.
gulp.task('watch', ['browserSyncApp', 'sass'], function(){

	// Watch sass files.
	gulp.watch('app/scss/**/*.scss', ['sass']);

	// Reload on html/js changes.
	gulp.watch('app/*.html', browserSyncApp.reload);
	gulp.watch('app/js/**/*.js', browserSyncApp.reload);

});

// Build.
gulp.task('build', function( callback ){

	runSequence(
		'clean:dist',
		['sass', 'useref', 'images', 'fonts'],
		callback
	);

});

// Default.
gulp.task('default', function( callback ) {

	runSequence(
		['sass', 'browserSyncApp', 'watch'],
		callback
	);

});
