//Инициализация зависимостей
var gulp 					= require('gulp'),
	sass 					= require('gulp-sass'),
	pug	 					= require('gulp-pug'),
	browserSync 			= require('browser-sync'),
	dirSync 				= require('gulp-directory-sync'),
	concat 					= require('gulp-concat'),
	prefix 					= require('gulp-autoprefixer'),
	csso 					= require('gulp-csso'),
	imagemin 				= require('gulp-imagemin'),
	plumber 				= require('gulp-plumber'),
	purify 					= require('gulp-purifycss'),
	uglify 					= require('gulp-uglify'),
	pngquant 				= require('imagemin-pngquant'),
	rimraf 					= require('rimraf');

//Инициализация путей
var assetsDir = 'assets/';
var outputDir = 'dist/';
var buildDir = 'build/';


//Такс для Pug
gulp.task('pug', function () {
	gulp.src([assetsDir + 'pug/*.pug', '!' + assetsDir + 'pug/_*.pug'])//берем файлы
		.pipe(plumber())
		.pipe(pug({pretty:true}))
		.pipe(gulp.dest(outputDir))
		.pipe(browserSync.stream());
});

//Sass компиляция
gulp.task('sass', function () {
	gulp.src([assetsDir + 'sass/**/*.scss', '!' + assetsDir + 'sass/**/_*.scss'])
		.pipe(plumber())
		.pipe(sass())
		.pipe(prefix('last 15 versions'))
		.pipe(gulp.dest(outputDir + 'styles/'))
		.pipe(browserSync.stream());
});

//Конкатинация скриптов в 1
gulp.task('jsConcat', function () {
	return gulp.src([
		assetsDir + 'js/jquery.js',
		assetsDir + 'js/common.js'
		])
		.pipe(concat('scripts.js', {newLine: ';'}))
		.pipe(gulp.dest(outputDir + 'js/'))
		.pipe(browserSync.stream());
});

//Синхронизирования папок картинок
gulp.task('imageSync', function () {
	return gulp.src('')
		.pipe(plumber())
		.pipe(dirSync(assetsDir + 'i/', outputDir + 'i/', {printSummary: true}))
		.pipe(browserSync.stream());
});


//Синхронизирование папок с шрифтами 
gulp.task('fontsSync', function () {
	return gulp.src('')
		.pipe(plumber())
		.pipe(dirSync(assetsDir + 'fonts/', outputDir + 'fonts/', {printSummary: true}))
		.pipe(browserSync.stream());
});

//Синхронизация папок с скриптами
gulp.task('jsSync', function () {
	return gulp.src(assetsDir + 'js/*.js')
		.pipe(plumber())
		.pipe(gulp.dest(outputDir + 'js/'))
		.pipe(browserSync.stream());
});

gulp.task('watch', function () {
	gulp.watch(assetsDir + 'pug/**/*.pug', ['pug']);
	gulp.watch(assetsDir + 'sass/**/*.scss', ['sass']);
	gulp.watch(assetsDir + 'js/**/*.js', ['jsSync']);
	gulp.watch(assetsDir + 'js/all/**/*.js', ['jsConcat']);
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
	return gulp.src(outputDir + 'js/**/*')
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

gulp.task('default', ['pug', 'sass', 'imageSync', 'fontsSync', 'jsConcat', 'jsSync', 'watch', 'browser-sync']);

gulp.task('build', ['cleanBuildDir'], function () {
	gulp.start('imgBuild', 'fontsBuild', 'htmlBuild', 'jsBuild', 'cssBuild');
});