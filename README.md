A gulp plugin to clean and minify SVG files for inline use in HTML pages.

# Installing

```
npm install --save-dev https://github.com/monoblaine/gulp-svgmin
```

# Sample `gulpfile.js`

```js
var del = require("del");
var svgmin = require("gulp-svgmin");
var path = {
    src: "",
    dest: ""
};

gulp.task("clean.minifySvgFiles", function () {
    return del(path.dest);
});

gulp.task("minifySvgFiles", ["clean.minifySvgFiles"], function () {
    return gulp.src(path.src)
            .pipe(svgmin())
            .pipe(gulp.dest(path.dest));
});
```