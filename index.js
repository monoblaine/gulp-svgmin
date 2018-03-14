var fs = require("fs");
var through = require("through2");
var gulputil = require("gulp-util");
var PluginError = gulputil.PluginError;
var Path = require("path");

const PLUGIN_NAME = "gulp-svgmin";

function gulpSvgMin (options) {
	var stream = through.obj(function (file, enc, callback) {
		if (file.isStream()) {
			this.emit("error", new PluginError(PLUGIN_NAME, "Streams are not supported!"));
			return callback();
		}

		var svgName = Path.basename(file.relative, Path.extname(file.relative)).replace(/^\d\d\d\-/g, ""),
            fileContents = "",
            regex = {
                clean: /(\s*\<\!\-\-((?!\-\-\>).)+\-\-\>\s*)|(<!DOCTYPE[^>]+>)|(\<\?.*\r?\n)|( xmlns\=\"[^"]+\")|( xmlns\:xlink\=\"[^"]+\")|( class\="[^"]+\")|(\<title\>[^<]+\<\/title\>)|(\<defs[^<]+\<\/defs\>)|( id\=\"[^"]+\")|( xml\:[^"]+\=\"[^"]+\")|(\<g\>\s*\<\/g\>)/g,
                containsWidthHeight: /( width\s*\=\s*\")|( height\s*\=\s*\")/g,
                viewBox: {
                    test: /viewBox\=\"0 0 \d+ \d+\"/g,
                    clean: /(viewBox\=\"0 0 (?=\d)|(\"$))/g
                }
            };

		try {
            fileContents = String(file.contents);

            var cleaned = fileContents.replace(regex.clean, ""),
                modified = cleaned.replace(/(\r?\n\s*)/g, " ")
                                    .replace(/\<svg/, '<svg class="svgic svgic-' + svgName + '" role="img" aria-hidden="true"')
                                    .replace(/(fill\=\"\#[^"]+\")|(style\=\"fill\:[^"]+\")/g, 'fill="currentColor"')
                                    .replace(/\>\s+\</g, "><")
                                    .replace(/( $)|( style\=\"[^"]+\")/, "")
                                    .trim();

            if (!regex.containsWidthHeight.test(modified.match(/\<svg [^>]+/)[0])) {
                if (regex.viewBox.test.test(modified)) {
                    var widthHeightPair = modified.match(regex.viewBox.test)[0].replace(regex.viewBox.clean, "").split(" ");

                    modified = modified.replace(/\<svg/, `<svg width="${widthHeightPair[0]}" height="${widthHeightPair[1]}"`);
                }
                else {
                    this.emit("error", new PluginError(PLUGIN_NAME, "SVG element does not contain neither the width nor the height attribute. It doesn't have any viewBox attribute, either."));
                    return;
                }
            }

			fileContents = modified;
			file.contents = new Buffer(fileContents);
			this.push(file);
		}
		catch (e) {
			console.warn("Error: " + e.message + " in " + file.path);
			this.push(file);
			return callback();
		}

		callback();
	});

	return stream;
}

module.exports = gulpSvgMin;