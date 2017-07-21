var path         = require('path'),
    gulp         = require('gulp'),
    less         = require('gulp-less'),
    babel        = require('gulp-babel'),
    colors       = require('colors'),
    moment       = require('moment'),
    plumber      = require('gulp-plumber'),
    webpack      = require('webpack');
    gWebpack     = require('gulp-webpack'),
    revAppend    = require('gulp-rev-append'),
    sourcemaps   = require('gulp-sourcemaps');

var CONFIG       = require('./config');
var WEBPACK      = require('./webpack.config');

process.chdir('../');

function htmlCopy() {
    return gulp.src(CONFIG.path.srcCompile.html)
               .pipe(gulp.dest(CONFIG.path.dist.html));
}

function htmlSign() {
    return gulp.src(path.resolve(CONFIG.path.dist.html, '*.html'))
               .pipe(revAppend())
               .pipe(gulp.dest(CONFIG.path.dist.html));
}
/* json 文件被修改，直接拷贝 */
    gulp.task('build json', function() {
        gulp.src(CONFIG.path.srcCompile.json)
            .pipe(gulp.dest(CONFIG.path.dist.json));
    })
/* end */


/* font 文件被修改，直接拷贝 */
    gulp.task('build font', function() {
        gulp.src(CONFIG.path.srcCompile.font)
            .pipe(gulp.dest(CONFIG.path.dist.font));
    })
/* end */


/* html 文件被修改任务列表 */
    gulp.task('copy html', function() {
        htmlCopy();
    });

    gulp.task('sign html', ['copy html'], function() {
        htmlSign();
    });

    gulp.task('build html', ['sign html']);
/* end */


/* 图片文件被修改，直接拷贝（TODO：文件压缩 & 合并） */
    gulp.task('build img', function() {
        gulp.src(CONFIG.path.srcCompile.img)
            .pipe(gulp.dest(CONFIG.path.dist.img));
    })
/* end */


/* css / less 文件被修改
        编译样式文件后更新 html 文件引用指纹 
        任务顺序：
                1、build css；
                2、build css > compile css；
                3、build css > sign html。
 */
    gulp.task('build css > sign html', ['build css > compile css'], function() {
        htmlSign();
    });

    gulp.task('build css > compile css', function() {
        gulp.src(CONFIG.path.srcCompile.css)
            .pipe(plumber({ errHandler: e => CONFIG.plumberCatch(e) }))
            .pipe(sourcemaps.init(CONFIG.sourcemaps.init))
            .pipe(less(CONFIG.less))
            .pipe(sourcemaps.write(CONFIG.sourcemaps.path, CONFIG.sourcemaps.write))
            .pipe(gulp.dest(CONFIG.path.dist.css));
        })

    gulp.task('build css', ['build css > sign html']);
/* end */


/* js / jsx 文件被修改
        通过 webpack 打包文件后更新 html 文件引用指纹
        任务顺序：
                1、build js；
                2、build js > package js & sign html。
 */
    gulp.task('build js > package js & sign html',function() {
        gulp.src(CONFIG.path.srcWatch.js)
            .pipe(gWebpack(WEBPACK, null, function(err, stats) {
                /* 在 gulp-webpack 插件的回调函数中更新 html 引用指纹，此时 js 文件已经打包完成并输出到指定目录 */
                console.log('[' + moment().format('HH:mm:ss').grey + '] Strating \'' + 'build js > sign html'.cyan + '\'...');
                
                // 异常捕获
                if (stats.compilation.errors.length) {
                    console.log(stats.compilation.errors[0].error.message)

                    return;
                }
                htmlSign();
                console.log('[' + moment().format('HH:mm:ss').grey + '] Finished \'' + 'build js > sign html'.cyan + '\'');
            }))
            .pipe(gulp.dest(CONFIG.path.dist.js));
    });

    gulp.task('build js', ['build js > package js & sign html']);
/* end */


/* 监控各个源码路径下的文件改动，实时运行指定任务 */
gulp.task('default', function() {
    gulp.watch(CONFIG.path.srcWatch.json, ['build json']);
    gulp.watch(CONFIG.path.srcWatch.json, ['build font']);
    gulp.watch(CONFIG.path.srcWatch.html, ['build html']);
    gulp.watch(CONFIG.path.srcWatch.img, ['build img']);
    gulp.watch(CONFIG.path.srcWatch.css, ['build css']);
    gulp.watch(CONFIG.path.srcWatch.js, ['build js']);
});

/* 编译全部文件 */
gulp.task('build', ['build json', 'build font', 'build html' ,'build img', 'build css', 'build js']);