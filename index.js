"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var fs = require("fs");
var path = require("path");
exports.formatUrl = function (url) { return url.replace(/https:/g, "http:"); };
/**
 * download file
 * @param url res should be download
 * @param dest where should we put the downloaded file interface
 * @param cb when the download task is done or has en error occured
 */
exports.downloader = function (url, dest, cb) {
    var file = fs.createWriteStream(dest);
    url = exports.formatUrl(url);
    console.log("Downloading " + url + "...");
    var request = http
        .get(url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
            file.close(); // close() is async, call cb after close completes.
            cb(null, file);
            console.log("Download " + url + " done.");
        });
    })
        .on("error", function (err) {
        // Handle errors
        fs.unlink(dest, function () { }); // Delete the file async. (But we don't check the result)
        if (cb)
            cb(err.message);
        console.log("Download " + url + " fail.");
    });
};
/**
 * find file
 * @param input destination
 * @param cb
 */
exports.finder = function (input, cb) {
    var files = fs.readdirSync(input);
    files.forEach(function (file) {
        if (file && path.extname(file) === ".css") {
            var filePath = input + "/" + file;
            var content = fs.readFileSync(filePath);
            cb(content, filePath);
        }
    });
};
var reg = /((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]'#|]+)/g;
var getPath = function () {
    var p = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        p[_i] = arguments[_i];
    }
    return path.resolve.apply(path, p);
};
// finding files and replace it
var runner = function (_a) {
    var _b = _a === void 0 ? {} : _a, baseDir = _b.baseDir, _c = _b.fontsPathToSave, fontsPathToSave = _c === void 0 ? process.cwd() + "/build/static/fonts/" : _c, _d = _b.iconUrl, iconUrl = _d === void 0 ? "https://at.alicdn.com/t/" : _d, _e = _b.fontReg, fontReg = _e === void 0 ? /@font-face{font-family:anticon;src:url(.*)}$/g : _e, _f = _b.urlReg, urlReg = _f === void 0 ? reg : _f, _g = _b.cssPath, cssPath = _g === void 0 ? process.cwd() + "/build/static/css/" : _g, _h = _b.newFontsPath, newFontsPath = _h === void 0 ? "/static/fonts/" : _h;
    if (baseDir !== "") {
        fontsPathToSave = getPath(baseDir, fontsPathToSave);
        cssPath = getPath(baseDir, cssPath);
    }
    return exports.finder(cssPath, function (content, filePath) {
        var cssContents = content.toString();
        var m = cssContents.match(urlReg);
        if (m) {
            // create fonts folder if not exists
            if (!fs.existsSync(fontsPathToSave)) {
                fs.mkdir(fontsPathToSave, function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log("mkdir " + fontsPathToSave + " success");
                });
            }
            m.forEach(function (item) {
                var itemInfo = path.parse(item);
                var shortname = itemInfo.base.replace(/((\?|#).*)/g, "");
                exports.downloader(item, fontsPathToSave + "/" + shortname, function (err, c) {
                    if (err) {
                        throw err;
                    }
                    var replacedContents = cssContents.replace(new RegExp(iconUrl, "gi"), newFontsPath);
                    fs.writeFile(filePath, replacedContents, function (err) {
                        if (err) {
                            throw err;
                        }
                        console.log("replace " + shortname + " done.");
                    });
                });
            });
        }
        else {
            console.log("no results founded.");
        }
    });
};
exports.default = runner;
//# sourceMappingURL=index.js.map