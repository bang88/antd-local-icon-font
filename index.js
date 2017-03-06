"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var fs = require("fs");
var path = require("path");
exports.formatUrl = function (url) { return url.replace(/https:/g, 'http:'); };
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
    var request = http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(); // close() is async, call cb after close completes.
            cb(null, file);
            console.log("Download " + url + " done.");
        });
    }).on('error', function (err) {
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
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
        if (file && path.extname(file) === '.css') {
            var filePath = input + file;
            var content = fs.readFileSync(filePath);
            cb(content, filePath);
        }
    });
};
var reg = /((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]'#|]+)/g;
// finding files and replace it 
var runner = function (_a) {
    var _b = _a.fontsSavedPath, fontsSavedPath = _b === void 0 ? __dirname + '/build/static/fonts/' : _b, _c = _a.iconUrl, iconUrl = _c === void 0 ? 'https://at.alicdn.com/t/' : _c, _d = _a.fontReg, fontReg = _d === void 0 ? /@font-face{font-family:anticon;src:url(.*)}$/g : _d, _e = _a.urlReg, urlReg = _e === void 0 ? reg : _e, _f = _a.cssPath, cssPath = _f === void 0 ? __dirname + '/build/static/css/' : _f, _g = _a.fontsPath, fontsPath = _g === void 0 ? '/static/fonts/' : _g;
    return exports.finder(cssPath, function (content, filePath) {
        // create fonts folder if not exists
        !fs.existsSync(fontsSavedPath) && fs.mkdir(fontsSavedPath, function (err) {
            if (err) {
                throw err;
            }
            console.log('mkdir success');
        });
        console.log('finding css file');
        var cssContents = content.toString();
        var m = cssContents.match(urlReg);
        if (m) {
            m.forEach(function (item) {
                var itemInfo = path.parse(item);
                var shortname = itemInfo.base.replace(/((\?|#).*)/g, '');
                exports.downloader(item, fontsSavedPath + shortname, function (err, c) {
                    if (err) {
                        throw err;
                    }
                    console.log('download ' + shortname + ' success...');
                    var replacedContents = cssContents.replace(new RegExp(iconUrl, 'gi'), fontsPath);
                    fs.writeFile(filePath, replacedContents, function (err) {
                        if (err) {
                            throw err;
                        }
                        console.log('replace ' + shortname + ' done.');
                    });
                });
            });
        }
        else {
            console.log('no results founded.');
        }
    });
};
exports.default = runner;
//# sourceMappingURL=index.js.map