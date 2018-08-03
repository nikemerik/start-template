//Инициализация зависимостей
var gulp 					= require('gulp'),
	sass					= require('gulp-sass'),
	browserSync				= require('browser-sync'),
	dirSync					= require('gulp-directory-sync'),
	concat 					= require('gulp-concat'),
	prefix 					= require('gulp-autoprefixer'),
	csso 					= require('gulp-csso'),
	imagemin 				= require('gulp-imagemin'),
	plumber 				= require('gulp-plumber'),
	purify 					= require('gulp-purifycss'),
	uglify 					= require('gulp-uglify'),
	fs						= require('fs');
	pngquant 				= require('imagemin-pngquant'),
	rimraf 					= require('rimraf');
	nunjucksRender			= require('gulp-nunjucks-render');
	data 					= require('gulp-data');
	path					= require('path');

//Initializing paths
var assetsDir = 'assets/';
var outputDir = 'dist/';
var buildDir = 'build/';


//Initializing task for Nunjucks
gulp.task ('nunjucks', function() {
	gulp.src(assetsDir + 'nunjucks/**/*.+(html|nunjucks)')
		.pipe(data(function() { 
			return JSON.parse(fs.readFileSync('./data.json'));
	   	}))
		.pipe(nunjucksRender({
			path: [assetsDir+'nunjucks/template/']
		}))
		.pipe(gulp.dest(outputDir))
		.pipe(browserSync.stream());
});
//Sass compile
gulp.task('sass', function () {
	gulp.src([assetsDir + 'sass/**/*.scss', '!' + assetsDir + 'sass/**/_*.scss'])
		.pipe(plumber())
		.pipe(sass())
		.pipe(prefix('last 15 versions'))
		.pipe(gulp.dest(outputDir + 'styles/'))
		.pipe(browserSync.stream());
});

//concatinate all scripts to one
gulp.task('jsConcat', function () {
	return gulp.src([
		assetsDir + 'js/jquery.js',
		assetsDir + 'js/common.js'
		])
		.pipe(concat('scripts.js', {newLine: ';'}))
		.pipe(gulp.dest(outputDir + 'js/'))
		.pipe(browserSync.stream());
});

//Sync folders with image
gulp.task('imageSync', function () {
	return gulp.src('')
		.pipe(plumber())
		.pipe(dirSync(assetsDir + 'i/', outputDir + 'i/', {printSummary: true}))
		.pipe(browserSync.stream());
});


//Sync folders with fonts 
gulp.task('fontsSync', function () {
	return gulp.src('')
		.pipe(plumber())
		.pipe(dirSync(assetsDir + 'fonts/', outputDir + 'fonts/', {printSummary: true}))
		.pipe(browserSync.stream());
});

//Sync scripts
gulp.task('jsSync', function () {
	return gulp.src(assetsDir + 'js/*.js')
		.pipe(plumber())
		.pipe(gulp.dest(outputDir + 'js/'))
		.pipe(browserSync.stream());
});

//Watch task's
gulp.task('watch', function () {
	gulp.watch(assetsDir + 'nunjucks/**/*.nunjucks', ['nunjucks']);
	gulp.watch(assetsDir + 'sass/**/*.scss', ['sass']);
	gulp.watch(assetsDir + 'js/**/*.js', ['jsSync']);
	gulp.watch(assetsDir + 'js/**/*.js', ['jsConcat']);
	gulp.watch(assetsDir + 'i/**/*', ['imageSync']);
	gulp.watch(assetsDir + 'fonts/**/*', ['fontsSync']);
});

//livereload and open project in browser
gulp.task('browser-sync', function () {
	browserSync.init({
		port: 1337,
		server: {
			baseDir: outputDir
		}
	});
});

//clean build folder
gulp.task('cleanBuildDir', function (cb) {
	rimraf(buildDir, cb);
});


//minify images
gulp.task('imgBuild', function () {
	return gulp.src(outputDir + 'i/**/*')
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest(buildDir + 'i/'))
});

//copy fonts
gulp.task('fontsBuild', function () {
	return gulp.src(outputDir + 'fonts/**/*')
		.pipe(gulp.dest(buildDir + 'fonts/'))
});

//copy html
gulp.task('htmlBuild', function () {
	return gulp.src(outputDir + '**/*.html')
		.pipe(gulp.dest(buildDir))
});

//copy and minify js
gulp.task('jsBuild', function () {
	return gulp.src(outputDir + 'js/scripts.js')
		.pipe(uglify())
		.pipe(gulp.dest(buildDir + 'js/'))
});

//copy, minify css
gulp.task('cssBuild', function () {
	return gulp.src(outputDir + 'styles/**/*')
		.pipe(purify([outputDir + 'js/**/*', outputDir + '**/*.html']))
		.pipe(csso())
		.pipe(gulp.dest(buildDir + 'styles/'))
});

//default task
gulp.task('default', ['nunjucks', 'sass', 'imageSync', 'fontsSync', 'jsConcat', 'jsSync', 'watch', 'browser-sync']);

//build task
gulp.task('build', ['cleanBuildDir'], function () {
	gulp.start('imgBuild', 'fontsBuild', 'htmlBuild', 'jsBuild', 'cssBuild');
});