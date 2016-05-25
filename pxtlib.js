var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var pxt;
(function (pxt) {
    var BrowserUtils;
    (function (BrowserUtils) {
        function browserDownloadText(text, name, contentType, onError) {
            if (contentType === void 0) { contentType = "application/octet-stream"; }
            console.log('trigger download');
            var buf = pxt.Util.stringToUint8Array(pxt.Util.toUTF8(text));
            return browserDownloadUInt8Array(buf, name, contentType, onError);
        }
        BrowserUtils.browserDownloadText = browserDownloadText;
        function browserDownloadUInt8Array(buf, name, contentType, onError) {
            if (contentType === void 0) { contentType = "application/octet-stream"; }
            var isMobileBrowser = /mobile/.test(navigator.userAgent);
            var dataurl = "data:" + contentType + ";base64," + btoa(pxt.Util.uint8ArrayToString(buf));
            try {
                if (window.navigator.msSaveOrOpenBlob && !isMobileBrowser) {
                    var b = new Blob([buf], { type: contentType });
                    var result = window.navigator.msSaveOrOpenBlob(b, name);
                }
                else {
                    var link = window.document.createElement('a');
                    if (typeof link.download == "string") {
                        link.href = dataurl;
                        link.download = name;
                        document.body.appendChild(link); // for FF
                        link.click();
                        document.body.removeChild(link);
                    }
                    else {
                        document.location.href = dataurl;
                    }
                }
            }
            catch (e) {
                if (onError)
                    onError(e);
                console.log("saving failed");
            }
            return dataurl;
        }
    })(BrowserUtils = pxt.BrowserUtils || (pxt.BrowserUtils = {}));
})(pxt || (pxt = {}));
var pxt;
(function (pxt) {
    var commands;
    (function (commands) {
        // overriden by targets    
        commands.deployCoreAsync = undefined;
        commands.browserDownloadAsync = undefined;
    })(commands = pxt.commands || (pxt.commands = {}));
})(pxt || (pxt = {}));
/// <reference path="../../typings/bluebird/bluebird.d.ts"/>
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        var Util;
        (function (Util) {
            Util.debug = false;
            function assert(cond, msg) {
                if (msg === void 0) { msg = "Assertion failed"; }
                if (!cond) {
                    debugger;
                    throw new Error(msg);
                }
            }
            Util.assert = assert;
            function repeatMap(n, fn) {
                n = n || 0;
                var r = [];
                for (var i = 0; i < n; ++i)
                    r.push(fn(i));
                return r;
            }
            Util.repeatMap = repeatMap;
            function oops(msg) {
                if (msg === void 0) { msg = "OOPS"; }
                debugger;
                throw new Error(msg);
            }
            Util.oops = oops;
            function reversed(arr) {
                arr = arr.slice(0);
                arr.reverse();
                return arr;
            }
            Util.reversed = reversed;
            function flatClone(obj) {
                if (obj == null)
                    return null;
                var r = {};
                Object.keys(obj).forEach(function (k) { r[k] = obj[k]; });
                return r;
            }
            Util.flatClone = flatClone;
            function clone(v) {
                if (v == null)
                    return null;
                return JSON.parse(JSON.stringify(v));
            }
            Util.clone = clone;
            function iterStringMap(m, f) {
                Object.keys(m).forEach(function (k) { return f(k, m[k]); });
            }
            Util.iterStringMap = iterStringMap;
            function mapStringMap(m, f) {
                var r = {};
                Object.keys(m).forEach(function (k) { return r[k] = f(k, m[k]); });
                return r;
            }
            Util.mapStringMap = mapStringMap;
            function mapStringMapAsync(m, f) {
                var r = {};
                return Promise.all(Object.keys(m).map(function (k) { return f(k, m[k]).then(function (v) { return r[k] = v; }); }))
                    .then(function () { return r; });
            }
            Util.mapStringMapAsync = mapStringMapAsync;
            function values(m) {
                return Object.keys(m || {}).map(function (k) { return m[k]; });
            }
            Util.values = values;
            function lookup(m, key) {
                if (m.hasOwnProperty(key))
                    return m[key];
                return null;
            }
            Util.lookup = lookup;
            function pushRange(trg, src) {
                for (var i = 0; i < src.length; ++i)
                    trg.push(src[i]);
            }
            Util.pushRange = pushRange;
            function concat(arrays) {
                var r = [];
                for (var i = 0; i < arrays.length; ++i) {
                    pushRange(r, arrays[i]);
                }
                return r;
            }
            Util.concat = concat;
            function jsonMergeFrom(trg, src) {
                if (!src)
                    return;
                Object.keys(src).forEach(function (k) {
                    if (typeof trg[k] === 'object' && typeof src[k] === "object")
                        jsonMergeFrom(trg[k], src[k]);
                    else
                        trg[k] = clone(src[k]);
                });
            }
            Util.jsonMergeFrom = jsonMergeFrom;
            function jsonCopyFrom(trg, src) {
                var v = clone(src);
                for (var _i = 0, _a = Object.keys(src); _i < _a.length; _i++) {
                    var k = _a[_i];
                    trg[k] = v[k];
                }
            }
            Util.jsonCopyFrom = jsonCopyFrom;
            function strcmp(a, b) {
                if (a == b)
                    return 0;
                if (a < b)
                    return -1;
                else
                    return 1;
            }
            Util.strcmp = strcmp;
            function stringMapEq(a, b) {
                var ak = Object.keys(a);
                var bk = Object.keys(b);
                if (ak.length != bk.length)
                    return false;
                for (var _i = 0, ak_1 = ak; _i < ak_1.length; _i++) {
                    var k = ak_1[_i];
                    if (!b.hasOwnProperty(k))
                        return false;
                    if (a[k] !== b[k])
                        return false;
                }
                return true;
            }
            Util.stringMapEq = stringMapEq;
            function endsWith(str, suffix) {
                if (str.length < suffix.length)
                    return false;
                if (suffix.length == 0)
                    return true;
                return str.slice(-suffix.length) == suffix;
            }
            Util.endsWith = endsWith;
            function startsWith(str, prefix) {
                if (str.length < prefix.length)
                    return false;
                if (prefix.length == 0)
                    return true;
                return str.slice(0, prefix.length) == prefix;
            }
            Util.startsWith = startsWith;
            function replaceAll(str, old, new_) {
                if (!old)
                    return str;
                return str.split(old).join(new_);
            }
            Util.replaceAll = replaceAll;
            function sortObjectFields(o) {
                var keys = Object.keys(o);
                keys.sort(strcmp);
                var r = {};
                keys.forEach(function (k) { return r[k] = o[k]; });
                return r;
            }
            Util.sortObjectFields = sortObjectFields;
            function chopArray(arr, chunkSize) {
                var res = [];
                for (var i = 0; i < arr.length; i += chunkSize)
                    res.push(arr.slice(i, i + chunkSize));
                return res;
            }
            Util.chopArray = chopArray;
            function unique(arr, f) {
                var v = [];
                var r = {};
                arr.forEach(function (e) {
                    var k = f(e);
                    if (!r.hasOwnProperty(k)) {
                        r[k] = null;
                        v.push(e);
                    }
                });
                return v;
            }
            Util.unique = unique;
            function groupBy(arr, f) {
                var r = {};
                arr.forEach(function (e) {
                    var k = f(e);
                    if (!r.hasOwnProperty(k))
                        r[k] = [];
                    r[k].push(e);
                });
                return r;
            }
            Util.groupBy = groupBy;
            function toDictionary(arr, f) {
                var r = {};
                arr.forEach(function (e) { r[f(e)] = e; });
                return r;
            }
            Util.toDictionary = toDictionary;
            function toArray(a) {
                var r = [];
                for (var i = 0; i < a.length; ++i)
                    r.push(a[i]);
                return r;
            }
            Util.toArray = toArray;
            function indexOfMatching(arr, f) {
                for (var i = 0; i < arr.length; ++i)
                    if (f(arr[i]))
                        return i;
                return -1;
            }
            Util.indexOfMatching = indexOfMatching;
            function nextTick(f) {
                Promise._async._schedule(f);
            }
            Util.nextTick = nextTick;
            function memoizeString(createNew) {
                return memoize(function (s) { return s; }, createNew);
            }
            Util.memoizeString = memoizeString;
            function memoize(getId, createNew) {
                var cache = {};
                return function (v) {
                    var id = getId(v);
                    if (cache.hasOwnProperty(id))
                        return cache[id];
                    return (cache[id] = createNew(v));
                };
            }
            Util.memoize = memoize;
            // Returns a function, that, as long as it continues to be invoked, will not
            // be triggered. The function will be called after it stops being called for
            // N milliseconds. If `immediate` is passed, trigger the function on the
            // leading edge, instead of the trailing.
            function debounce(func, wait, immediate) {
                var timeout;
                return function () {
                    var context = this;
                    var args = arguments;
                    var later = function () {
                        timeout = null;
                        if (!immediate)
                            func.apply(context, args);
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow)
                        func.apply(context, args);
                };
            }
            Util.debounce = debounce;
            function randomPermute(arr) {
                for (var i = 0; i < arr.length; ++i) {
                    var j = randomUint32() % arr.length;
                    var tmp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = tmp;
                }
            }
            Util.randomPermute = randomPermute;
            function randomPick(arr) {
                if (arr.length == 0)
                    return null;
                return arr[randomUint32() % arr.length];
            }
            Util.randomPick = randomPick;
            var awesomeAdj;
            function getAwesomeAdj() {
                if (!awesomeAdj)
                    awesomeAdj = (lf("amazing, astonishing, astounding, awe-inspiring, awesome, breathtaking, classic, cool, curious, distinct, exceptional, exclusive, extraordinary, fabulous, fantastic, glorious, great, ") +
                        lf("incredible, magical, marvellous, marvelous, mind-blowing, mind-boggling, miraculous, peculiar, phenomenal, rad, rockin', special, spectacular, startling, stunning, super-cool, ") +
                        lf("superior, supernatural, terrific, unbelievable, unearthly, unique, unprecedented, unusual, weird, wonderful, wondrous")).split(/\s*[,،、]\s*/);
                return randomPick(awesomeAdj);
            }
            Util.getAwesomeAdj = getAwesomeAdj;
            function isoTime(time) {
                var d = new Date(time * 1000);
                return Util.fmt("{0}-{1:f02.0}-{2:f02.0} {3:f02.0}:{4:f02.0}:{5:f02.0}", d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
            }
            Util.isoTime = isoTime;
            function timeSince(time) {
                var now = Date.now();
                time *= 1000;
                var diff = (now - time) / 1000;
                if (isNaN(diff))
                    return "";
                if (diff < -30) {
                    diff = -diff;
                    if (diff < 60)
                        return lf("in a few seconds");
                    if (diff < 2 * 60)
                        return lf("in a minute");
                    if (diff < 60 * 60)
                        return lf("in {0} minute{0:s}", Math.floor(diff / 60));
                    if (diff < 2 * 60 * 60)
                        return lf("in an hour");
                    if (diff < 60 * 60 * 24)
                        return lf("in {0} hour{0:s}", Math.floor(diff / 60 / 60));
                    if (diff < 60 * 60 * 24 * 30)
                        return lf("in {0} day{0:s}", Math.floor(diff / 60 / 60 / 24));
                    if (diff < 60 * 60 * 24 * 365)
                        return lf("in {0} month{0:s}", Math.floor(diff / 60 / 60 / 24 / 30));
                    return lf("in {0} year{0:s}", Math.floor(diff / 60 / 60 / 24 / 365));
                }
                else {
                    if (diff < 0)
                        return lf("now");
                    if (diff < 10)
                        return lf("a few seconds ago");
                    if (diff < 60)
                        return lf("{0} second{0:s} ago", Math.floor(diff));
                    if (diff < 2 * 60)
                        return lf("a minute ago");
                    if (diff < 60 * 60)
                        return lf("{0} minute{0:s} ago", Math.floor(diff / 60));
                    if (diff < 2 * 60 * 60)
                        return lf("an hour ago");
                    if (diff < 60 * 60 * 24)
                        return lf("{0} hour{0:s} ago", Math.floor(diff / 60 / 60));
                    if (diff < 60 * 60 * 24 * 30)
                        return lf("{0} day{0:s} ago", Math.floor(diff / 60 / 60 / 24));
                    if (diff < 60 * 60 * 24 * 365)
                        return lf("{0} month{0:s} ago", Math.floor(diff / 60 / 60 / 24 / 30));
                    return lf("{0} year{0:s} ago", Math.floor(diff / 60 / 60 / 24 / 365));
                }
            }
            Util.timeSince = timeSince;
            Util.isNodeJS = false;
            function requestAsync(options) {
                return Util.httpRequestCoreAsync(options)
                    .then(function (resp) {
                    if (resp.statusCode != 200 && !options.allowHttpErrors) {
                        var msg = Util.lf("Bad HTTP status code: {0} at {1}; message: {2}", resp.statusCode, options.url, (resp.text || "").slice(0, 500));
                        var err = new Error(msg);
                        err.statusCode = resp.statusCode;
                        return Promise.reject(err);
                    }
                    if (resp.text && /application\/json/.test(resp.headers["content-type"]))
                        resp.json = JSON.parse(resp.text);
                    return resp;
                });
            }
            Util.requestAsync = requestAsync;
            function httpGetTextAsync(url) {
                return requestAsync({ url: url }).then(function (resp) { return resp.text; });
            }
            Util.httpGetTextAsync = httpGetTextAsync;
            function httpGetJsonAsync(url) {
                return requestAsync({ url: url }).then(function (resp) { return resp.json; });
            }
            Util.httpGetJsonAsync = httpGetJsonAsync;
            function httpPostJsonAsync(url, data) {
                return requestAsync({ url: url, data: data || {} }).then(function (resp) { return resp.json; });
            }
            Util.httpPostJsonAsync = httpPostJsonAsync;
            function userError(msg) {
                var e = new Error(msg);
                e.isUserError = true;
                throw e;
            }
            Util.userError = userError;
            // this will take lower 8 bits from each character
            function stringToUint8Array(input) {
                var len = input.length;
                var res = new Uint8Array(len);
                for (var i = 0; i < len; ++i)
                    res[i] = input.charCodeAt(i) & 0xff;
                return res;
            }
            Util.stringToUint8Array = stringToUint8Array;
            function uint8ArrayToString(input) {
                var len = input.length;
                var res = "";
                for (var i = 0; i < len; ++i)
                    res += String.fromCharCode(input[i]);
                return res;
            }
            Util.uint8ArrayToString = uint8ArrayToString;
            function fromUTF8(binstr) {
                if (!binstr)
                    return "";
                // escape function is deprecated
                var escaped = "";
                for (var i = 0; i < binstr.length; ++i) {
                    var k = binstr.charCodeAt(i) & 0xff;
                    if (k == 37 || k > 0x7f) {
                        escaped += "%" + k.toString(16);
                    }
                    else {
                        escaped += binstr.charAt(i);
                    }
                }
                // decodeURIComponent does the actual UTF8 decoding
                return decodeURIComponent(escaped);
            }
            Util.fromUTF8 = fromUTF8;
            function toUTF8(str) {
                var res = "";
                if (!str)
                    return res;
                for (var i = 0; i < str.length; ++i) {
                    var code = str.charCodeAt(i);
                    if (code <= 0x7f)
                        res += str.charAt(i);
                    else if (code <= 0x7ff) {
                        res += String.fromCharCode(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
                    }
                    else {
                        if (0xd800 <= code && code <= 0xdbff) {
                            var next = str.charCodeAt(++i);
                            if (!isNaN(next))
                                code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
                        }
                        if (code <= 0xffff)
                            res += String.fromCharCode(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
                        else
                            res += String.fromCharCode(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
                    }
                }
                return res;
            }
            Util.toUTF8 = toUTF8;
            var PromiseQueue = (function () {
                function PromiseQueue() {
                    this.promises = {};
                }
                PromiseQueue.prototype.enqueue = function (id, f) {
                    var _this = this;
                    if (!this.promises.hasOwnProperty(id)) {
                        this.promises[id] = Promise.resolve();
                    }
                    var newOne = this.promises[id]
                        .catch(function (e) {
                        Util.nextTick(function () { throw e; });
                    })
                        .then(function () { return f().then(function (v) {
                        if (_this.promises[id] === newOne)
                            delete _this.promises[id];
                        return v;
                    }); });
                    this.promises[id] = newOne;
                    return newOne;
                };
                return PromiseQueue;
            }());
            Util.PromiseQueue = PromiseQueue;
            function now() {
                return Date.now();
            }
            Util.now = now;
            function nowSeconds() {
                return Math.round(now() / 1000);
            }
            Util.nowSeconds = nowSeconds;
            function getMime(filename) {
                var m = /\.([a-zA-Z0-9]+)$/.exec(filename);
                if (m)
                    switch (m[1]) {
                        case "txt": return "text/plain";
                        case "html":
                        case "htm": return "text/html";
                        case "css": return "text/css";
                        case "js": return "application/javascript";
                        case "jpg":
                        case "jpeg": return "image/jpeg";
                        case "png": return "image/png";
                        case "ico": return "image/x-icon";
                        case "manifest": return "text/cache-manifest";
                        case "webmanifest": return "application/manifest+json";
                        case "json": return "application/json";
                        case "svg": return "image/svg+xml";
                        case "eot": return "application/vnd.ms-fontobject";
                        case "ttf": return "font/ttf";
                        case "woff": return "application/font-woff";
                        case "woff2": return "application/font-woff2";
                        case "md": return "text/markdown";
                        case "xml": return "application/xml";
                        default: return "application/octet-stream";
                    }
                else
                    return "application/octet-stream";
            }
            Util.getMime = getMime;
            function randomUint32() {
                var buf = new Uint8Array(4);
                Util.getRandomBuf(buf);
                return new Uint32Array(buf.buffer)[0];
            }
            Util.randomUint32 = randomUint32;
            function guidGen() {
                function f() { return (randomUint32() | 0x10000).toString(16).slice(-4); }
                return f() + f() + "-" + f() + "-4" + f().slice(-3) + "-" + f() + "-" + f() + f() + f();
            }
            Util.guidGen = guidGen;
            var _localizeLang = "en";
            var _localizeStrings = {};
            function _localize(s, account) {
                return _localizeStrings[s] || s;
            }
            Util._localize = _localize;
            function updateLocalizationAsync(baseUrl, code) {
                // normalize code (keep synched with localized files)
                if (!/^(es|pt|zh)/i.test(code))
                    code = code.split("-")[0];
                if (_localizeLang != code) {
                    return Util.httpGetJsonAsync(baseUrl + "locales/" + code + "/strings.json")
                        .then(function (tr) {
                        _localizeStrings = tr || {};
                        _localizeLang = code;
                    }, function (e) {
                        console.error('failed to load localizations');
                    });
                }
                //                    
                return Promise.resolve(undefined);
            }
            Util.updateLocalizationAsync = updateLocalizationAsync;
            function htmlEscape(_input) {
                if (!_input)
                    return _input; // null, undefined, empty string test
                return _input.replace(/([^\w .!?\-$])/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; });
            }
            Util.htmlEscape = htmlEscape;
            function jsStringQuote(s) {
                return s.replace(/[^\w .!?\-$]/g, function (c) {
                    var h = c.charCodeAt(0).toString(16);
                    return "\\u" + "0000".substr(0, 4 - h.length) + h;
                });
            }
            Util.jsStringQuote = jsStringQuote;
            function jsStringLiteral(s) {
                return "\"" + jsStringQuote(s) + "\"";
            }
            Util.jsStringLiteral = jsStringLiteral;
            function fmt_va(f, args) {
                if (args.length == 0)
                    return f;
                return f.replace(/\{([0-9]+)(\:[^\}]+)?\}/g, function (s, n, spec) {
                    var v = args[parseInt(n)];
                    var r = "";
                    var fmtMatch = /^:f(\d*)\.(\d+)/.exec(spec);
                    if (fmtMatch) {
                        var precision = parseInt(fmtMatch[2]);
                        var len = parseInt(fmtMatch[1]) || 0;
                        var fillChar = /^0/.test(fmtMatch[1]) ? "0" : " ";
                        var num = v.toFixed(precision);
                        if (len > 0 && precision > 0)
                            len += precision + 1;
                        if (len > 0) {
                            while (num.length < len) {
                                num = fillChar + num;
                            }
                        }
                        r = num;
                    }
                    else if (spec == ":x") {
                        r = "0x" + v.toString(16);
                    }
                    else if (v === undefined)
                        r = "(undef)";
                    else if (v === null)
                        r = "(null)";
                    else if (v.toString)
                        r = v.toString();
                    else
                        r = v + "";
                    if (spec == ":a") {
                        if (/^\s*[euioah]/.test(r.toLowerCase()))
                            r = "an " + r;
                        else if (/^\s*[bcdfgjklmnpqrstvwxz]/.test(r.toLowerCase()))
                            r = "a " + r;
                    }
                    else if (spec == ":s") {
                        if (v == 1)
                            r = "";
                        else
                            r = "s";
                    }
                    else if (spec == ":q") {
                        r = Util.htmlEscape(r);
                    }
                    else if (spec == ":jq") {
                        r = Util.jsStringQuote(r);
                    }
                    else if (spec == ":uri") {
                        r = encodeURIComponent(r).replace(/'/g, "%27").replace(/"/g, "%22");
                    }
                    else if (spec == ":url") {
                        r = encodeURI(r).replace(/'/g, "%27").replace(/"/g, "%22");
                    }
                    else if (spec == ":%") {
                        r = (v * 100).toFixed(1).toString() + '%';
                    }
                    return r;
                });
            }
            Util.fmt_va = fmt_va;
            function fmt(f) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return fmt_va(f, args);
            }
            Util.fmt = fmt;
            var sForPlural = true;
            function lf_va(format, args) {
                var lfmt = Util._localize(format, true);
                if (!sForPlural && lfmt != format && /\d:s\}/.test(lfmt)) {
                    lfmt = lfmt.replace(/\{\d+:s\}/g, "");
                }
                return fmt_va(lfmt, args);
            }
            Util.lf_va = lf_va;
            function lf(format) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return lf_va(format, args);
            }
            Util.lf = lf;
            function capitalize(n) {
                return n ? (n[0].toLocaleUpperCase() + n.slice(1)) : n;
            }
            Util.capitalize = capitalize;
            function toDataUri(data, mimetype) {
                // TODO does this only support trusted data?
                // weed out urls
                if (/^http?s:/i.test(data))
                    return data;
                // already a data uri?       
                if (/^data:/i.test(data))
                    return data;
                // infer mimetype
                if (!mimetype) {
                    if (/^<svg/i.test(data))
                        mimetype = "image/svg+xml";
                }
                // encode
                if (/xml|svg/.test(mimetype))
                    return "data:" + mimetype + "," + encodeURIComponent(data);
                else
                    return "data:" + (mimetype || "image/png") + ";base64," + btoa(toUTF8(data));
            }
            Util.toDataUri = toDataUri;
        })(Util = pxt.Util || (pxt.Util = {}));
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        var BrowserImpl;
        (function (BrowserImpl) {
            pxt.Util.httpRequestCoreAsync = httpRequestCoreAsync;
            pxt.Util.sha256 = sha256string;
            pxt.Util.getRandomBuf = function (buf) {
                if (window.crypto)
                    window.crypto.getRandomValues(buf);
                else {
                    for (var i = 0; i < buf.length; ++i)
                        buf[i] = Math.floor(Math.random() * 255);
                }
            };
            function httpRequestCoreAsync(options) {
                return new Promise(function (resolve, reject) {
                    var client;
                    var resolved = false;
                    var headers = pxt.Util.clone(options.headers) || {};
                    client = new XMLHttpRequest();
                    client.onreadystatechange = function () {
                        if (resolved)
                            return; // Safari/iOS likes to call this thing more than once
                        if (client.readyState == 4) {
                            resolved = true;
                            var res_1 = {
                                statusCode: client.status,
                                headers: {},
                                buffer: client.responseBody,
                                text: client.responseText,
                            };
                            client.getAllResponseHeaders().split('\r\n').forEach(function (l) {
                                var m = /^([^:]+): (.*)/.exec(l);
                                if (m)
                                    res_1.headers[m[1].toLowerCase()] = m[2];
                            });
                            resolve(res_1);
                        }
                    };
                    var data = options.data;
                    var method = options.method || (data == null ? "GET" : "POST");
                    var buf;
                    if (data == null) {
                        buf = null;
                    }
                    else if (data instanceof Uint8Array) {
                        buf = data;
                    }
                    else if (typeof data == "object") {
                        buf = JSON.stringify(data);
                        headers["content-type"] = "application/json; charset=utf8";
                    }
                    else if (typeof data == "string") {
                        buf = data;
                    }
                    else {
                        pxt.Util.oops("bad data");
                    }
                    client.open(method, options.url);
                    Object.keys(headers).forEach(function (k) {
                        client.setRequestHeader(k, headers[k]);
                    });
                    if (buf == null)
                        client.send();
                    else
                        client.send(buf);
                });
            }
            var sha256_k = new Uint32Array([
                0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
            ]);
            function rotr(v, b) {
                return (v >>> b) | (v << (32 - b));
            }
            function sha256round(hs, w) {
                pxt.Util.assert(hs.length == 8);
                pxt.Util.assert(w.length == 64);
                for (var i = 16; i < 64; ++i) {
                    var s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
                    var s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
                    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
                }
                var a = hs[0];
                var b = hs[1];
                var c = hs[2];
                var d = hs[3];
                var e = hs[4];
                var f = hs[5];
                var g = hs[6];
                var h = hs[7];
                for (var i = 0; i < 64; ++i) {
                    var s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
                    var ch = (e & f) ^ (~e & g);
                    var temp1 = (h + s1 + ch + sha256_k[i] + w[i]) | 0;
                    var s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
                    var maj = (a & b) ^ (a & c) ^ (b & c);
                    var temp2 = (s0 + maj) | 0;
                    h = g;
                    g = f;
                    f = e;
                    e = (d + temp1) | 0;
                    d = c;
                    c = b;
                    b = a;
                    a = (temp1 + temp2) | 0;
                }
                hs[0] += a;
                hs[1] += b;
                hs[2] += c;
                hs[3] += d;
                hs[4] += e;
                hs[5] += f;
                hs[6] += g;
                hs[7] += h;
            }
            function sha256buffer(buf) {
                var h = new Uint32Array(8);
                h[0] = 0x6a09e667;
                h[1] = 0xbb67ae85;
                h[2] = 0x3c6ef372;
                h[3] = 0xa54ff53a;
                h[4] = 0x510e527f;
                h[5] = 0x9b05688c;
                h[6] = 0x1f83d9ab;
                h[7] = 0x5be0cd19;
                var work = new Uint32Array(64);
                var chunkLen = 16 * 4;
                function addBuf(buf) {
                    var end = buf.length - (chunkLen - 1);
                    for (var i = 0; i < end; i += chunkLen) {
                        for (var j = 0; j < 16; j++) {
                            var off = (j << 2) + i;
                            work[j] = (buf[off] << 24) | (buf[off + 1] << 16) | (buf[off + 2] << 8) | buf[off + 3];
                        }
                        sha256round(h, work);
                    }
                }
                addBuf(buf);
                var padSize = 64 - (buf.length + 9) % 64;
                if (padSize == 64)
                    padSize = 0;
                var endPos = buf.length - (buf.length % chunkLen);
                var padBuf = new Uint8Array((buf.length - endPos) + 1 + padSize + 8);
                var dst = 0;
                while (endPos < buf.length)
                    padBuf[dst++] = buf[endPos++];
                padBuf[dst++] = 0x80;
                while (padSize-- > 0)
                    padBuf[dst++] = 0x00;
                var len = buf.length * 8;
                dst = padBuf.length;
                while (len > 0) {
                    padBuf[--dst] = len & 0xff;
                    len >>= 8;
                }
                addBuf(padBuf);
                var res = "";
                for (var i = 0; i < h.length; ++i)
                    res += ("000000000" + h[i].toString(16)).slice(-8);
                return res.toLowerCase();
            }
            BrowserImpl.sha256buffer = sha256buffer;
            function sha256string(s) {
                return sha256buffer(pxt.Util.stringToUint8Array(pxt.Util.toUTF8(s)));
            }
            BrowserImpl.sha256string = sha256string;
        })(BrowserImpl = pxt.BrowserImpl || (pxt.BrowserImpl = {}));
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
/// <reference path="emitter/util.ts"/>
var pxt;
(function (pxt) {
    function getLzma() {
        if (pxt.U.isNodeJS)
            return require("lzma");
        else
            return window.LZMA;
    }
    function lzmaDecompressAsync(buf) {
        var lzma = getLzma();
        return new Promise(function (resolve, reject) {
            try {
                lzma.decompress(buf, function (res, error) {
                    resolve(error ? undefined : res);
                });
            }
            catch (e) {
                resolve(undefined);
            }
        });
    }
    pxt.lzmaDecompressAsync = lzmaDecompressAsync;
    function lzmaCompressAsync(text) {
        var lzma = getLzma();
        return new Promise(function (resolve, reject) {
            try {
                lzma.compress(text, 7, function (res, error) {
                    resolve(error ? undefined : new Uint8Array(res));
                });
            }
            catch (e) {
                resolve(undefined);
            }
        });
    }
    pxt.lzmaCompressAsync = lzmaCompressAsync;
})(pxt || (pxt = {}));
var pxt;
(function (pxt) {
    var cpp;
    (function (cpp) {
        var U = ts.pxt.Util;
        var Y = ts.pxt;
        var lf = U.lf;
        function parseExpr(e) {
            e = e.trim();
            e = e.replace(/^\(/, "");
            e = e.replace(/\)$/, "");
            e = e.trim();
            if (/^-/.test(e) && parseExpr(e.slice(1)) != null)
                return -parseExpr(e.slice(1));
            if (/^0x[0-9a-f]+$/i.exec(e))
                return parseInt(e.slice(2), 16);
            if (/^0b[01]+$/i.exec(e))
                return parseInt(e.slice(2), 2);
            if (/^0\d+$/i.exec(e))
                return parseInt(e, 8);
            if (/^\d+$/i.exec(e))
                return parseInt(e, 10);
            return null;
        }
        function nsWriter(nskw) {
            if (nskw === void 0) { nskw = "namespace"; }
            var text = "";
            var currNs = "";
            var setNs = function (ns, over) {
                if (over === void 0) { over = ""; }
                if (currNs == ns)
                    return;
                if (currNs)
                    text += "}\n";
                if (ns)
                    text += over || (nskw + " " + ns + " {\n");
                currNs = ns;
            };
            var indent = "    ";
            return {
                setNs: setNs,
                clear: function () {
                    text = "";
                    currNs = "";
                },
                write: function (s) {
                    if (!s.trim())
                        text += "\n";
                    else {
                        s = s.trim()
                            .replace(/^\s*/mg, indent)
                            .replace(/^(\s*)\*/mg, function (f, s) { return s + " *"; });
                        text += s + "\n";
                    }
                },
                incrIndent: function () {
                    indent += "    ";
                },
                decrIndent: function () {
                    indent = indent.slice(4);
                },
                finish: function () {
                    setNs("");
                    return text;
                }
            };
        }
        cpp.nsWriter = nsWriter;
        function parseCppInt(v) {
            if (!v)
                return null;
            v = v.trim();
            if (/^-?(\d+|0[xX][0-9a-fA-F]+)$/.test(v))
                return parseInt(v);
            return null;
        }
        cpp.parseCppInt = parseCppInt;
        var prevExtInfo;
        var prevSnapshot;
        function getExtensionInfo(mainPkg) {
            var pkgSnapshot = {};
            var constsName = "dal.d.ts";
            for (var _i = 0, _a = mainPkg.sortedDeps(); _i < _a.length; _i++) {
                var pkg = _a[_i];
                pkg.addSnapshot(pkgSnapshot, [constsName, ".h", ".cpp"]);
            }
            if (prevSnapshot && U.stringMapEq(pkgSnapshot, prevSnapshot)) {
                console.log("Using cached extinfo");
                return prevExtInfo;
            }
            console.log("Generating new extinfo");
            var res = Y.emptyExtInfo();
            var pointersInc = "\nPXT_SHIMS_BEGIN\n";
            var includesInc = "#include \"pxt.h\"\n";
            var thisErrors = "";
            var dTsNamespace = "";
            var err = function (s) { return thisErrors += "   " + fileName + "(" + lineNo + "): " + s + "\n"; };
            var lineNo = 0;
            var fileName = "";
            var protos = nsWriter("namespace");
            var shimsDTS = nsWriter("declare namespace");
            var enumsDTS = nsWriter("declare namespace");
            var compileService = pxt.appTarget.compileService;
            if (!compileService)
                compileService = {
                    gittag: "none",
                    serviceId: "nocompile"
                };
            var enumVals = {
                "true": "1",
                "false": "0",
                "null": "0",
                "NULL": "0",
            };
            // we sometimes append _ to C++ names to avoid name clashes
            function toJs(name) {
                return name.trim().replace(/_$/, "");
            }
            for (var _b = 0, _c = mainPkg.sortedDeps(); _b < _c.length; _b++) {
                var pkg = _c[_b];
                if (pkg.getFiles().indexOf(constsName) >= 0) {
                    var src = pkg.host().readFile(pkg, constsName);
                    src.split(/\r?\n/).forEach(function (ln) {
                        var m = /^\s*(\w+) = (.*),/.exec(ln);
                        if (m) {
                            enumVals[m[1]] = m[2];
                        }
                    });
                }
            }
            function parseCpp(src, isHeader) {
                var currNs = "";
                var currDocComment = "";
                var currAttrs = "";
                var inDocComment = false;
                function interfaceName() {
                    var n = currNs.replace(/Methods$/, "");
                    if (n == currNs)
                        return null;
                    return n;
                }
                lineNo = 0;
                function mapType(tp) {
                    switch (tp.replace(/\s+/g, "")) {
                        case "void": return "void";
                        case "int32_t":
                        case "uint32_t":
                        case "int": return "number";
                        case "bool": return "boolean";
                        case "StringData*": return "string";
                        case "ImageLiteral": return "string";
                        case "Action": return "() => void";
                        default:
                            return toJs(tp);
                    }
                }
                var outp = "";
                var inEnum = false;
                var enumVal = 0;
                enumsDTS.setNs("");
                shimsDTS.setNs("");
                src.split(/\r?\n/).forEach(function (ln) {
                    ++lineNo;
                    var lnNC = ln.replace(/\/\/.*/, "").replace(/\/\*/, "");
                    if (inEnum && lnNC.indexOf("}") >= 0) {
                        inEnum = false;
                        enumsDTS.write("}");
                    }
                    if (inEnum) {
                        var mm = /^\s*(\w+)\s*(=\s*(.*?))?,?\s*$/.exec(lnNC);
                        if (mm) {
                            var nm = mm[1];
                            var v = mm[3];
                            var opt = "";
                            if (v) {
                                v = v.trim();
                                var curr = U.lookup(enumVals, v);
                                if (curr != null) {
                                    opt = "  // " + v;
                                    v = curr;
                                }
                                enumVal = parseCppInt(v);
                                if (enumVal == null)
                                    err("cannot determine value of " + lnNC);
                            }
                            else {
                                enumVal++;
                                v = enumVal + "";
                            }
                            enumsDTS.write("    " + toJs(nm) + " = " + v + "," + opt);
                        }
                        else {
                            enumsDTS.write(ln);
                        }
                    }
                    var enM = /^\s*enum\s+(|class\s+|struct\s+)(\w+)\s*({|$)/.exec(lnNC);
                    if (enM) {
                        inEnum = true;
                        enumVal = -1;
                        enumsDTS.write("");
                        enumsDTS.write("");
                        if (currAttrs || currDocComment) {
                            enumsDTS.write(currDocComment);
                            enumsDTS.write(currAttrs);
                            currAttrs = "";
                            currDocComment = "";
                        }
                        enumsDTS.write("declare enum " + toJs(enM[2]) + " " + enM[3]);
                        if (!isHeader) {
                            protos.setNs(currNs);
                            protos.write("enum " + enM[2] + " : int;");
                        }
                    }
                    if (inEnum) {
                        outp += ln + "\n";
                        return;
                    }
                    if (/^\s*\/\*\*/.test(ln)) {
                        inDocComment = true;
                        currDocComment = ln + "\n";
                        if (/\*\//.test(ln))
                            inDocComment = false;
                        outp += "//\n";
                        return;
                    }
                    if (inDocComment) {
                        currDocComment += ln + "\n";
                        if (/\*\//.test(ln)) {
                            inDocComment = false;
                        }
                        outp += "//\n";
                        return;
                    }
                    if (/^\s*\/\/%/.test(ln)) {
                        currAttrs += ln + "\n";
                        outp += "//\n";
                        return;
                    }
                    outp += ln + "\n";
                    if (/^typedef.*;\s*$/.test(ln)) {
                        protos.setNs(currNs);
                        protos.write(ln);
                    }
                    var m = /^\s*namespace\s+(\w+)/.exec(ln);
                    if (m) {
                        //if (currNs) err("more than one namespace declaration not supported")
                        currNs = m[1];
                        if (interfaceName()) {
                            shimsDTS.setNs("");
                            shimsDTS.write("");
                            shimsDTS.write("");
                            if (currAttrs || currDocComment) {
                                shimsDTS.write(currDocComment);
                                shimsDTS.write(currAttrs);
                                currAttrs = "";
                                currDocComment = "";
                            }
                            var tpName = interfaceName();
                            shimsDTS.setNs(currNs, "declare interface " + tpName + " {");
                        }
                        else if (currAttrs || currDocComment) {
                            shimsDTS.setNs("");
                            shimsDTS.write("");
                            shimsDTS.write("");
                            shimsDTS.write(currDocComment);
                            shimsDTS.write(currAttrs);
                            shimsDTS.setNs(toJs(currNs));
                            enumsDTS.setNs(toJs(currNs));
                            currAttrs = "";
                            currDocComment = "";
                        }
                        return;
                    }
                    m = /^\s*(\w+)([\*\&]*\s+[\*\&]*)(\w+)\s*\(([^\(\)]*)\)\s*(;\s*$|\{|$)/.exec(ln);
                    if (currAttrs && m) {
                        var parsedAttrs_1 = ts.pxt.parseCommentString(currAttrs);
                        if (!currNs)
                            err("missing namespace declaration");
                        var retTp = (m[1] + m[2]).replace(/\s+/g, "");
                        var funName = m[3];
                        var origArgs = m[4];
                        currAttrs = currAttrs.trim().replace(/ \w+\.defl=\w+/g, "");
                        var args = origArgs.split(/,/).filter(function (s) { return !!s; }).map(function (s) {
                            s = s.trim();
                            var m = /(.*)=\s*(-?\w+)$/.exec(s);
                            var defl = "";
                            var qm = "";
                            if (m) {
                                defl = m[2];
                                qm = "?";
                                s = m[1].trim();
                            }
                            m = /^(.*?)(\w+)$/.exec(s);
                            if (!m) {
                                err("invalid argument: " + s);
                                return "";
                            }
                            var argName = m[2];
                            if (parsedAttrs_1.paramDefl[argName]) {
                                defl = parsedAttrs_1.paramDefl[argName];
                                qm = "?";
                            }
                            var numVal = defl ? U.lookup(enumVals, defl) : null;
                            if (numVal != null)
                                defl = numVal;
                            if (defl) {
                                if (parseCppInt(defl) == null)
                                    err("Invalid default value (non-integer): " + defl);
                                currAttrs += " " + argName + ".defl=" + defl;
                            }
                            return "" + argName + qm + ": " + mapType(m[1]);
                        });
                        var numArgs = args.length;
                        var fi = {
                            name: currNs + "::" + funName,
                            type: retTp == "void" ? "P" : "F",
                            args: numArgs,
                            value: null
                        };
                        if (currDocComment) {
                            shimsDTS.setNs(toJs(currNs));
                            shimsDTS.write("");
                            shimsDTS.write(currDocComment);
                            if (/ImageLiteral/.test(m[4]) && !/imageLiteral=/.test(currAttrs))
                                currAttrs += " imageLiteral=1";
                            currAttrs += " shim=" + fi.name;
                            shimsDTS.write(currAttrs);
                            funName = toJs(funName);
                            if (interfaceName()) {
                                var tp0 = (args[0] || "").replace(/^.*:\s*/, "").trim();
                                if (tp0.toLowerCase() != interfaceName().toLowerCase()) {
                                    err(lf("Invalid first argument; should be of type '{0}', but is '{1}'", interfaceName(), tp0));
                                }
                                args.shift();
                                if (args.length == 0 && /\bproperty\b/.test(currAttrs))
                                    shimsDTS.write(funName + ": " + mapType(retTp) + ";");
                                else
                                    shimsDTS.write(funName + "(" + args.join(", ") + "): " + mapType(retTp) + ";");
                            }
                            else {
                                shimsDTS.write("function " + funName + "(" + args.join(", ") + "): " + mapType(retTp) + ";");
                            }
                        }
                        currDocComment = "";
                        currAttrs = "";
                        if (!isHeader) {
                            protos.setNs(currNs);
                            protos.write(retTp + " " + funName + "(" + origArgs + ");");
                        }
                        res.functions.push(fi);
                        pointersInc += "(uint32_t)(void*)::" + fi.name + ",\n";
                        return;
                    }
                    if (currAttrs && ln.trim()) {
                        err("declaration not understood: " + ln);
                        currAttrs = "";
                        currDocComment = "";
                        return;
                    }
                });
                return outp;
            }
            function parseJson(pkg) {
                var json = pkg.config.yotta;
                if (!json)
                    return;
                // TODO check for conflicts
                if (json.dependencies) {
                    U.jsonCopyFrom(res.yotta.dependencies, json.dependencies);
                }
                if (json.config)
                    U.jsonMergeFrom(res.yotta.config, json.config);
            }
            // This is overridden on the build server, but we need it for command line build
            if (pxt.appTarget.compile && pxt.appTarget.compile.isNative) {
                U.assert(!!pxt.appTarget.compileService.yottaCorePackage);
                U.assert(!!pxt.appTarget.compileService.githubCorePackage);
                U.assert(!!pxt.appTarget.compileService.gittag);
                res.yotta.dependencies[pxt.appTarget.compileService.yottaCorePackage] = pxt.appTarget.compileService.githubCorePackage + "#" + compileService.gittag;
            }
            if (mainPkg) {
                var seenMain = false;
                // TODO computeReachableNodes(pkg, true)
                for (var _d = 0, _e = mainPkg.sortedDeps(); _d < _e.length; _d++) {
                    var pkg = _e[_d];
                    thisErrors = "";
                    parseJson(pkg);
                    if (pkg == mainPkg) {
                        seenMain = true;
                        // we only want the main package in generated .d.ts
                        shimsDTS.clear();
                        enumsDTS.clear();
                    }
                    else {
                        U.assert(!seenMain);
                    }
                    for (var _f = 0, _g = pkg.getFiles(); _f < _g.length; _f++) {
                        var fn = _g[_f];
                        var isHeader = U.endsWith(fn, ".h");
                        if (isHeader || U.endsWith(fn, ".cpp")) {
                            var fullName = pkg.config.name + "/" + fn;
                            if (isHeader)
                                includesInc += "#include \"source/" + fullName + "\"\n";
                            var src = pkg.readFile(fn);
                            fileName = fullName;
                            // parseCpp() will remove doc comments, to prevent excessive recompilation
                            src = parseCpp(src, isHeader);
                            res.extensionFiles["/source/" + fullName] = src;
                            if (pkg.level == 0)
                                res.onlyPublic = false;
                            if (pkg.verProtocol() && pkg.verProtocol() != "pub" && pkg.verProtocol() != "embed")
                                res.onlyPublic = false;
                        }
                    }
                    if (thisErrors) {
                        res.errors += lf("Package {0}:\n", pkg.id) + thisErrors;
                    }
                }
            }
            if (res.errors)
                return res;
            var configJson = res.yotta.config;
            var moduleJson = {
                "name": "pxt-microbit-app",
                "version": "0.0.0",
                "description": "Auto-generated. Do not edit.",
                "license": "n/a",
                "dependencies": res.yotta.dependencies,
                "targetDependencies": {},
                "bin": "./source"
            };
            res.generatedFiles["/source/pointers.cpp"] = includesInc + protos.finish() + pointersInc + "\nPXT_SHIMS_END\n";
            res.generatedFiles["/module.json"] = JSON.stringify(moduleJson, null, 4) + "\n";
            res.generatedFiles["/config.json"] = JSON.stringify(configJson, null, 4) + "\n";
            res.generatedFiles["/source/main.cpp"] = "\n#include \"pxt.h\"\nint main() { \n    uBit.init(); \n    pxt::start(); \n    while (1) uBit.sleep(10000);    \n    return 0; \n}\n";
            var tmp = res.extensionFiles;
            U.jsonCopyFrom(tmp, res.generatedFiles);
            var creq = {
                config: compileService.serviceId,
                tag: compileService.gittag,
                replaceFiles: tmp,
                dependencies: res.yotta.dependencies,
            };
            var data = JSON.stringify(creq);
            res.sha = U.sha256(data);
            res.compileData = btoa(U.toUTF8(data));
            res.shimsDTS = shimsDTS.finish();
            res.enumsDTS = enumsDTS.finish();
            prevSnapshot = pkgSnapshot;
            prevExtInfo = res;
            return res;
        }
        cpp.getExtensionInfo = getExtensionInfo;
        function fileReadAsArrayBufferAsync(f) {
            if (!f)
                return Promise.resolve(null);
            else {
                return new Promise(function (resolve, reject) {
                    var reader = new FileReader();
                    reader.onerror = function (ev) { return resolve(null); };
                    reader.onload = function (ev) { return resolve(reader.result); };
                    reader.readAsArrayBuffer(f);
                });
            }
        }
        function fromUTF8Bytes(binstr) {
            if (!binstr)
                return "";
            // escape function is deprecated
            var escaped = "";
            for (var i = 0; i < binstr.length; ++i) {
                var k = binstr[i] & 0xff;
                if (k == 37 || k > 0x7f) {
                    escaped += "%" + k.toString(16);
                }
                else {
                    escaped += String.fromCharCode(k);
                }
            }
            // decodeURIComponent does the actual UTF8 decoding
            return decodeURIComponent(escaped);
        }
        function swapBytes(str) {
            var r = "";
            var i = 0;
            for (; i < str.length; i += 2)
                r = str[i] + str[i + 1] + r;
            pxt.Util.assert(i == str.length);
            return r;
        }
        function extractSource(hexfile) {
            if (!hexfile)
                return undefined;
            var metaLen = 0;
            var textLen = 0;
            var toGo = 0;
            var buf;
            var ptr = 0;
            hexfile.split(/\r?\n/).forEach(function (ln) {
                var m = /^:10....0041140E2FB82FA2BB(....)(....)(....)(....)(..)/.exec(ln);
                if (m) {
                    metaLen = parseInt(swapBytes(m[1]), 16);
                    textLen = parseInt(swapBytes(m[2]), 16);
                    toGo = metaLen + textLen;
                    buf = new Uint8Array(toGo);
                }
                else if (toGo > 0) {
                    m = /^:10....00(.*)(..)$/.exec(ln);
                    if (!m)
                        return;
                    var k = m[1];
                    while (toGo > 0 && k.length > 0) {
                        buf[ptr++] = parseInt(k[0] + k[1], 16);
                        k = k.slice(2);
                        toGo--;
                    }
                }
            });
            if (!buf || !(toGo == 0 && ptr == buf.length)) {
                return undefined;
            }
            var bufmeta = new Uint8Array(metaLen);
            var buftext = new Uint8Array(textLen);
            for (var i = 0; i < metaLen; ++i)
                bufmeta[i] = buf[i];
            for (var i = 0; i < textLen; ++i)
                buftext[i] = buf[metaLen + i];
            // iOS Safari doesn't seem to have slice() on Uint8Array
            return {
                meta: fromUTF8Bytes(bufmeta),
                text: buftext
            };
        }
        function unpackSourceFromHexFileAsync(file) {
            if (!file)
                return undefined;
            return fileReadAsArrayBufferAsync(file).then(function (data) {
                var a = new Uint8Array(data);
                return unpackSourceFromHexAsync(a);
            });
        }
        cpp.unpackSourceFromHexFileAsync = unpackSourceFromHexFileAsync;
        function unpackSourceFromHexAsync(dat) {
            var str = fromUTF8Bytes(dat);
            var tmp = extractSource(str || "");
            if (!tmp)
                return undefined;
            if (!tmp.meta || !tmp.text) {
                console.log("This .hex file doesn't contain source.");
                return undefined;
            }
            var hd = JSON.parse(tmp.meta);
            if (!hd) {
                console.log("This .hex file is not valid.");
                return undefined;
            }
            else if (hd.compression == "LZMA") {
                return pxt.lzmaDecompressAsync(tmp.text)
                    .then(function (res) {
                    if (!res)
                        return null;
                    var meta = res.slice(0, hd.headerSize || hd.metaSize);
                    var text = res.slice(meta.length);
                    var metajs = JSON.parse(meta);
                    return { meta: metajs, source: text };
                });
            }
            else if (hd.compression) {
                console.log("Compression type {0} not supported.", hd.compression);
                return undefined;
            }
            else {
                return Promise.resolve({ source: fromUTF8Bytes(tmp.text) });
            }
        }
        cpp.unpackSourceFromHexAsync = unpackSourceFromHexAsync;
    })(cpp = pxt.cpp || (pxt.cpp = {}));
})(pxt || (pxt = {}));
var pxt;
(function (pxt) {
    var hex;
    (function (hex_1) {
        var downloadCache = {};
        var cdnUrlPromise;
        function downloadHexInfoAsync(extInfo) {
            if (downloadCache.hasOwnProperty(extInfo.sha))
                return downloadCache[extInfo.sha];
            return (downloadCache[extInfo.sha] = downloadHexInfoCoreAsync(extInfo));
        }
        function getCdnUrlAsync() {
            if (cdnUrlPromise)
                return cdnUrlPromise;
            else
                return (cdnUrlPromise = pxt.Cloud.privateGetAsync("clientconfig").then(function (r) { return r.primaryCdnUrl; }));
        }
        function downloadHexInfoCoreAsync(extInfo) {
            var hexurl = "";
            return getCdnUrlAsync()
                .then(function (url) {
                hexurl = url + "/compile/" + extInfo.sha;
                return pxt.U.httpGetTextAsync(hexurl + ".hex");
            })
                .then(function (r) { return r; }, function (e) {
                return pxt.Cloud.privatePostAsync("compile/extension", { data: extInfo.compileData })
                    .then(function (ret) { return new Promise(function (resolve, reject) {
                    var tryGet = function () { return pxt.Util.httpGetJsonAsync(ret.hex.replace(/\.hex/, ".json"))
                        .then(function (json) {
                        if (!json.success)
                            pxt.U.userError(JSON.stringify(json, null, 1));
                        else
                            resolve(pxt.U.httpGetTextAsync(hexurl + ".hex"));
                    }, function (e) {
                        setTimeout(tryGet, 1000);
                        return null;
                    }); };
                    tryGet();
                }); });
            })
                .then(function (text) {
                return pxt.Util.httpGetJsonAsync(hexurl + "-metainfo.json")
                    .then(function (meta) {
                    meta.hex = text.split(/\r?\n/);
                    return meta;
                });
            });
        }
        function storeWithLimitAsync(host, idxkey, newkey, newval, maxLen) {
            if (maxLen === void 0) { maxLen = 10; }
            return host.cacheStoreAsync(newkey, newval)
                .then(function () { return host.cacheGetAsync(idxkey); })
                .then(function (res) {
                var keys = JSON.parse(res || "[]");
                keys = keys.filter(function (k) { return k != newkey; });
                keys.unshift(newkey);
                var todel = keys.slice(maxLen);
                keys = keys.slice(0, maxLen);
                return Promise.map(todel, function (e) { return host.cacheStoreAsync(e, null); })
                    .then(function () { return host.cacheStoreAsync(idxkey, JSON.stringify(keys)); });
            });
        }
        hex_1.storeWithLimitAsync = storeWithLimitAsync;
        function recordGetAsync(host, idxkey, newkey) {
            return host.cacheGetAsync(idxkey)
                .then(function (res) {
                var keys = JSON.parse(res || "[]");
                if (keys[0] != newkey) {
                    keys = keys.filter(function (k) { return k != newkey; });
                    keys.unshift(newkey);
                    return host.cacheStoreAsync(idxkey, JSON.stringify(keys));
                }
                else {
                    return null;
                }
            });
        }
        hex_1.recordGetAsync = recordGetAsync;
        function getHexInfoAsync(host, extInfo) {
            if (!extInfo.sha)
                return Promise.resolve(null);
            if (ts.pxt.hex.isSetupFor(extInfo))
                return Promise.resolve(ts.pxt.hex.currentHexInfo);
            console.log("get hex info: " + extInfo.sha);
            var key = "hex-" + extInfo.sha;
            return host.cacheGetAsync(key)
                .then(function (res) {
                if (res) {
                    console.log("cache hit, size=" + res.length);
                    var meta_1 = JSON.parse(res);
                    meta_1.hex = decompressHex(meta_1.hex);
                    return recordGetAsync(host, "hex-keys", key)
                        .then(function () { return meta_1; });
                }
                else {
                    //if (!Cloud.isOnline()) return null;
                    return downloadHexInfoAsync(extInfo)
                        .then(function (meta) {
                        var origHex = meta.hex;
                        meta.hex = compressHex(meta.hex);
                        var store = JSON.stringify(meta);
                        meta.hex = origHex;
                        return storeWithLimitAsync(host, "hex-keys", key, store)
                            .then(function () { return meta; });
                    });
                }
            });
        }
        hex_1.getHexInfoAsync = getHexInfoAsync;
        function decompressHex(hex) {
            var outp = [];
            for (var i = 0; i < hex.length; i++) {
                var m = /^([@!])(....)$/.exec(hex[i]);
                if (!m) {
                    outp.push(hex[i]);
                    continue;
                }
                var addr = parseInt(m[2], 16);
                var nxt = hex[++i];
                var buf = "";
                if (m[1] == "@") {
                    buf = "";
                    var cnt = parseInt(nxt, 16);
                    while (cnt-- > 0) {
                        buf += "\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0";
                    }
                }
                else {
                    buf = atob(nxt);
                }
                pxt.Util.assert(buf.length > 0);
                pxt.Util.assert(buf.length % 16 == 0);
                for (var j = 0; j < buf.length;) {
                    var bytes = [0x10, (addr >> 8) & 0xff, addr & 0xff, 0];
                    addr += 16;
                    for (var k = 0; k < 16; ++k) {
                        bytes.push(buf.charCodeAt(j++));
                    }
                    var chk = 0;
                    for (var k = 0; k < bytes.length; ++k)
                        chk += bytes[k];
                    bytes.push((-chk) & 0xff);
                    var r = ":";
                    for (var k = 0; k < bytes.length; ++k) {
                        var b = bytes[k] & 0xff;
                        if (b <= 0xf)
                            r += "0";
                        r += b.toString(16);
                    }
                    outp.push(r.toUpperCase());
                }
            }
            return outp;
        }
        function compressHex(hex) {
            var outp = [];
            var j = 0;
            for (var i = 0; i < hex.length; i += j) {
                var addr = -1;
                var outln = "";
                j = 0;
                var zeroMode = false;
                while (j < 500) {
                    var m = /^:10(....)00(.{32})(..)$/.exec(hex[i + j]);
                    if (!m)
                        break;
                    var h = m[2];
                    var isZero = /^0+$/.test(h);
                    var newaddr = parseInt(m[1], 16);
                    if (addr == -1) {
                        zeroMode = isZero;
                        outp.push((zeroMode ? "@" : "!") + m[1]);
                        addr = newaddr - 16;
                    }
                    else {
                        if (isZero != zeroMode)
                            break;
                        if (addr + 16 != newaddr)
                            break;
                    }
                    if (!zeroMode)
                        outln += h;
                    addr = newaddr;
                    j++;
                }
                if (j == 0) {
                    outp.push(hex[i]);
                    j = 1;
                }
                else {
                    if (zeroMode) {
                        outp.push(j.toString(16));
                    }
                    else {
                        var bin = "";
                        for (var k = 0; k < outln.length; k += 2)
                            bin += String.fromCharCode(parseInt(outln.slice(k, k + 2), 16));
                        outp.push(btoa(bin));
                    }
                }
            }
            return outp;
        }
    })(hex = pxt.hex || (pxt.hex = {}));
})(pxt || (pxt = {}));
/// <reference path='../typings/marked/marked.d.ts' />
/// <reference path="emitter/util.ts"/>
var pxt;
(function (pxt) {
    var docs;
    (function (docs) {
        var marked;
        var U = ts.pxt.Util;
        var stdboxes = {};
        var stdmacros = {};
        var stdSetting = "<!-- @CMD@ @ARGS@ -->";
        var stdsettings = {
            "parent": stdSetting,
            "short": stdSetting,
            "description": "<!-- desc -->"
        };
        function replaceAll(replIn, x, y) {
            return replIn.split(x).join(y);
        }
        function htmlQuote(s) {
            s = replaceAll(s, "&", "&amp;");
            s = replaceAll(s, "<", "&lt;");
            s = replaceAll(s, ">", "&gt;");
            s = replaceAll(s, "\"", "&quot;");
            s = replaceAll(s, "\'", "&#39;");
            return s;
        }
        docs.htmlQuote = htmlQuote;
        // the input already should be HTML-quoted but we want to make sure, and also quote quotes
        function html2Quote(s) {
            return htmlQuote(s.replace(/\&([#a-z0-9A-Z]+);/g, function (f, ent) {
                switch (ent) {
                    case "amp": return "&";
                    case "lt": return "<";
                    case "gt": return ">";
                    case "quot": return "\"";
                    default:
                        if (ent[0] == "#")
                            return String.fromCharCode(parseInt(ent.slice(1)));
                        else
                            return f;
                }
            }));
        }
        docs.html2Quote = html2Quote;
        var links = [
            {
                rx: /^vimeo\.com\/(\d+)/,
                cmd: "### @vimeo $1"
            },
            {
                rx: /^youtu\.be\/(\w+)/,
                cmd: "### @youtube $1"
            },
            {
                rx: /^www\.youtube\.com\/watch\?v=(\w+)/,
                cmd: "### @youtube $1"
            },
        ];
        docs.requireMarked = function () { return require("marked"); };
        function renderMarkdown(template, src, theme, pubinfo, breadcrumb) {
            if (theme === void 0) { theme = {}; }
            if (pubinfo === void 0) { pubinfo = null; }
            if (breadcrumb === void 0) { breadcrumb = []; }
            var params = pubinfo || {};
            var boxes = U.clone(stdboxes);
            var macros = U.clone(stdmacros);
            var settings = U.clone(stdsettings);
            var menus = {};
            function parseHtmlAttrs(s) {
                var attrs = {};
                while (s.trim()) {
                    var m = /^\s*([^=\s]+)=("([^"]*)"|'([^']*)'|(\S*))/.exec(s);
                    if (m) {
                        var v = m[3] || m[4] || m[5] || "";
                        attrs[m[1].toLowerCase()] = v;
                    }
                    else {
                        m = /^\s*(\S+)/.exec(s);
                        attrs[m[1]] = "true";
                    }
                    s = s.slice(m[0].length);
                }
                return attrs;
            }
            var error = function (s) {
                return ("<div class='ui negative message'>" + htmlQuote(s) + "</div>");
            };
            template = template.replace(/<aside\s+([^<>]+)>([^]*?)<\/aside>/g, function (full, attrsStr, body) {
                var attrs = parseHtmlAttrs(attrsStr);
                var name = attrs["data-name"] || attrs["id"];
                if (!name)
                    return error("id or data-name missing on macro");
                if (/box/.test(attrs["class"])) {
                    boxes[name] = body;
                }
                else if (/aside/.test(attrs["class"])) {
                    boxes[name] = "<!-- BEGIN-ASIDE " + name + " -->" + body + "<!-- END-ASIDE -->";
                }
                else if (/setting/.test(attrs["class"])) {
                    settings[name] = body;
                }
                else if (/menu/.test(attrs["class"])) {
                    menus[name] = body;
                }
                else {
                    macros[name] = body;
                }
                return "<!-- macro " + name + " -->";
            });
            if (!marked) {
                marked = docs.requireMarked();
                var renderer = new marked.Renderer();
                renderer.image = function (href, title, text) {
                    var out = '<img class="ui centered image" src="' + href + '" alt="' + text + '"';
                    if (title) {
                        out += ' title="' + title + '"';
                    }
                    out += this.options.xhtml ? '/>' : '>';
                    return out;
                };
                marked.setOptions({
                    renderer: renderer,
                    gfm: true,
                    tables: true,
                    breaks: false,
                    pedantic: false,
                    sanitize: true,
                    smartLists: true,
                    smartypants: true
                });
            }
            ;
            src = src.replace(/^\s*https?:\/\/(\S+)\s*$/mg, function (f, lnk) {
                var _loop_1 = function(ent) {
                    var m = ent.rx.exec(lnk);
                    if (m) {
                        return { value: ent.cmd.replace(/\$(\d+)/g, function (f, k) {
                            return m[parseInt(k)] || "";
                        }) + "\n" };
                    }
                };
                for (var _i = 0, links_1 = links; _i < links_1.length; _i++) {
                    var ent = links_1[_i];
                    var state_1 = _loop_1(ent);
                    if (typeof state_1 === "object") return state_1.value;
                }
                return f;
            });
            var html = marked(src);
            // support for breaks which somehow don't work out of the box
            html = html.replace(/&lt;br\s*\/&gt;/ig, "<br/>");
            var endBox = "";
            html = html.replace(/<h\d[^>]+>\s*([~@])\s*(.*?)<\/h\d>/g, function (f, tp, body) {
                var m = /^(\w+)\s+(.*)/.exec(body);
                var cmd = m ? m[1] : body;
                var args = m ? m[2] : "";
                var rawArgs = args;
                args = html2Quote(args);
                cmd = html2Quote(cmd);
                if (tp == "@") {
                    var expansion = U.lookup(settings, cmd);
                    if (expansion != null) {
                        params[cmd] = args;
                    }
                    else {
                        expansion = U.lookup(macros, cmd);
                        if (expansion == null)
                            return error("Unknown command: @" + cmd);
                    }
                    var ivars = {
                        ARGS: args,
                        CMD: cmd
                    };
                    return injectHtml(expansion, ivars, ["ARGS", "CMD"]);
                }
                else {
                    if (!cmd) {
                        var r = endBox;
                        endBox = "";
                        return r;
                    }
                    var box = U.lookup(boxes, cmd);
                    if (box) {
                        var parts = box.split("@BODY@");
                        endBox = parts[1];
                        return parts[0].replace("@ARGS@", args);
                    }
                    else {
                        return error("Unknown box: ~" + cmd);
                    }
                }
            });
            if (!params["title"]) {
                var titleM = /<h1[^<>]*>([^<>]+)<\/h1>/.exec(html);
                if (titleM)
                    params["title"] = html2Quote(titleM[1]);
            }
            if (!params["description"]) {
                var descM = /<p>(.+?)<\/p>/.exec(html);
                if (descM)
                    params["description"] = html2Quote(descM[1]);
            }
            var breadcrumbHtml = '';
            if (breadcrumb && breadcrumb.length > 1) {
                breadcrumbHtml = "\n            <div class=\"ui breadcrumb\">\n                " + breadcrumb.map(function (b, i) {
                    return ("<a class=\"" + (i == breadcrumb.length - 1 ? "active" : "") + " section\" \n                        href=\"" + html2Quote(b.href) + "\">" + html2Quote(b.name) + "</a>");
                })
                    .join('<i class="right chevron icon divider"></i>') + "\n            </div>";
            }
            var registers = {};
            registers["main"] = ""; // first
            html = html.replace(/<!-- BEGIN-ASIDE (\S+) -->([^]*?)<!-- END-ASIDE -->/g, function (f, nam, cont) {
                var s = U.lookup(registers, nam);
                registers[nam] = (s || "") + cont;
                return "<!-- aside -->";
            });
            registers["main"] = html;
            var injectBody = function (tmpl, body) {
                return injectHtml(boxes[tmpl] || "@BODY@", { BODY: body }, ["BODY"]);
            };
            html = "";
            for (var _i = 0, _a = Object.keys(registers); _i < _a.length; _i++) {
                var k = _a[_i];
                html += injectBody(k + "-container", registers[k]);
            }
            var recMenu = function (m, lev) {
                var templ = menus["item"];
                var mparams = {
                    NAME: m.name,
                };
                if (m.subitems) {
                    if (lev == 0)
                        templ = menus["top-dropdown"];
                    else
                        templ = menus["inner-dropdown"];
                    mparams["ITEMS"] = m.subitems.map(function (e) { return recMenu(e, lev + 1); }).join("\n");
                }
                else {
                    if (/^-+$/.test(m.name)) {
                        templ = menus["divider"];
                    }
                    if (m.path && !/^(https?:|\/)/.test(m.path))
                        return error("Invalid link: " + m.path);
                    mparams["LINK"] = m.path;
                }
                return injectHtml(templ, mparams, ["ITEMS"]);
            };
            params["body"] = html;
            params["menu"] = (theme.docMenu || []).map(function (e) { return recMenu(e, 0); }).join("\n");
            params["breadcrumb"] = breadcrumbHtml;
            params["targetname"] = theme.name || "PXT";
            params["targetlogo"] = theme.docsLogo ? "<img class=\"ui mini image\" src=\"" + U.toDataUri(theme.docsLogo) + "\" />" : "";
            params["name"] = params["title"] + " - " + params["targetname"];
            var style = '';
            if (theme.accentColor)
                style += "\n.ui.accent { color: " + theme.accentColor + "; }\n.ui.inverted.accent { background: " + theme.accentColor + "; }\n";
            params["targetstyle"] = style;
            return injectHtml(template, params, ["body", "menu", "breadcrumb", "targetlogo"]);
        }
        docs.renderMarkdown = renderMarkdown;
        function injectHtml(template, vars, quoted) {
            if (quoted === void 0) { quoted = []; }
            return template.replace(/@(\w+)@/g, function (f, key) {
                var res = U.lookup(vars, key) || "";
                res += ""; // make sure it's a string
                if (quoted.indexOf(key) < 0) {
                    res = html2Quote(res);
                }
                return res;
            });
        }
    })(docs = pxt.docs || (pxt.docs = {}));
})(pxt || (pxt = {}));
/// <reference path="../typings/bluebird/bluebird.d.ts"/>
/// <reference path="emitter/util.ts"/>
var pxt;
(function (pxt) {
    pxt.U = ts.pxt.Util;
    pxt.Util = ts.pxt.Util;
    var lf = pxt.U.lf;
    function debugMode() { return ts.pxt.Util.debug; }
    pxt.debugMode = debugMode;
    function setDebugMode(debug) {
        ts.pxt.Util.debug = !!debug;
    }
    pxt.setDebugMode = setDebugMode;
    // general error reported
    pxt.reportException = function (e, d) {
        if (console) {
            console.error(e);
            if (d) {
                try {
                    console.log(JSON.stringify(d, null, 2));
                }
                catch (e) { }
            }
        }
    };
    pxt.reportError = function (m, d) {
        if (console) {
            console.error(m);
            if (d) {
                try {
                    console.log(JSON.stringify(d, null, 2));
                }
                catch (e) { }
            }
        }
    };
    function localWebConfig() {
        var r = {
            relprefix: "/--",
            workerjs: "/worker.js",
            tdworkerjs: "/tdworker.js",
            pxtVersion: "local",
            pxtRelId: "",
            pxtCdnUrl: "/cdn/",
            targetVersion: "local",
            targetRelId: "",
            targetCdnUrl: "/sim/",
            targetId: pxt.appTarget ? pxt.appTarget.id : "",
            simUrl: "/sim/simulator.html",
        };
        return r;
    }
    pxt.localWebConfig = localWebConfig;
    function setupWebConfig(cfg) {
        if (cfg)
            pxt.webConfig = cfg;
        else if (!pxt.webConfig)
            pxt.webConfig = localWebConfig();
    }
    pxt.setupWebConfig = setupWebConfig;
    function getEmbeddedScript(id) {
        return pxt.U.lookup(pxt.appTarget.bundledpkgs || {}, id);
    }
    pxt.getEmbeddedScript = getEmbeddedScript;
    var Package = (function () {
        function Package(id, _verspec, parent) {
            this.id = id;
            this._verspec = _verspec;
            this.parent = parent;
            this.level = -1;
            this.isLoaded = false;
            if (parent) {
                this.level = this.parent.level + 1;
            }
        }
        Package.prototype.version = function () {
            return this.resolvedVersion || this._verspec;
        };
        Package.prototype.verProtocol = function () {
            var spl = this.version().split(':');
            if (spl.length > 1)
                return spl[0];
            else
                return "";
        };
        Package.prototype.verArgument = function () {
            var p = this.verProtocol();
            if (p)
                return this.version().slice(p.length + 1);
            return this.version();
        };
        Package.prototype.host = function () { return this.parent._host; };
        Package.prototype.readFile = function (fn) {
            return this.host().readFile(this, fn);
        };
        Package.prototype.resolveDep = function (id) {
            if (this.parent.deps.hasOwnProperty(id))
                return this.parent.deps[id];
            return null;
        };
        Package.prototype.saveConfig = function () {
            var cfg = JSON.stringify(this.config, null, 4) + "\n";
            this.host().writeFile(this, pxt.configName, cfg);
        };
        Package.prototype.resolveVersionAsync = function () {
            var _this = this;
            var v = this._verspec;
            if (getEmbeddedScript(this.id)) {
                this.resolvedVersion = v = "embed:" + this.id;
            }
            else if (!v || v == "*")
                return this.host().resolveVersionAsync(this).then(function (id) {
                    if (!/:/.test(id))
                        id = "pub:" + id;
                    return (_this.resolvedVersion = id);
                });
            return Promise.resolve(v);
        };
        Package.prototype.downloadAsync = function () {
            var _this = this;
            var kindCfg = "";
            return this.resolveVersionAsync()
                .then(function (verNo) {
                if (_this.config && _this.config.installedVersion == verNo)
                    return;
                console.log('downloading ' + verNo);
                return _this.host().downloadPackageAsync(_this)
                    .then(function () {
                    var confStr = _this.readFile(pxt.configName);
                    if (!confStr)
                        pxt.U.userError("package " + _this.id + " is missing " + pxt.configName);
                    _this.parseConfig(confStr);
                    _this.config.installedVersion = _this.version();
                    _this.saveConfig();
                })
                    .then(function () {
                    info("installed " + _this.id + " /" + verNo);
                });
            });
        };
        Package.prototype.validateConfig = function () {
            if (!this.config.dependencies)
                pxt.U.userError("Missing dependencies in config of: " + this.id);
            if (!Array.isArray(this.config.files))
                pxt.U.userError("Missing files in config of: " + this.id);
            if (typeof this.config.name != "string" || !this.config.name ||
                (this.config.public && !/^[a-z][a-z0-9\-]+$/.test(this.config.name)))
                pxt.U.userError("Invalid package name: " + this.config.name);
        };
        Package.prototype.parseConfig = function (str) {
            var cfg = JSON.parse(str);
            this.config = cfg;
            // temp patch for cloud corrupted configs
            for (var dep in this.config.dependencies)
                if (/^microbit-(led|music|game|pins|serial)$/.test(dep))
                    delete this.config.dependencies[dep];
            this.validateConfig();
        };
        Package.prototype.loadAsync = function (isInstall) {
            var _this = this;
            if (isInstall === void 0) { isInstall = false; }
            if (this.isLoaded)
                return Promise.resolve();
            this.isLoaded = true;
            var str = this.readFile(pxt.configName);
            if (str == null) {
                if (!isInstall)
                    pxt.U.userError("Package not installed: " + this.id);
            }
            else {
                this.parseConfig(str);
            }
            return (isInstall ? this.downloadAsync() : Promise.resolve())
                .then(function () {
                return pxt.U.mapStringMapAsync(_this.config.dependencies, function (id, ver) {
                    var mod = _this.resolveDep(id);
                    ver = ver || "*";
                    if (mod) {
                        if (mod._verspec != ver)
                            pxt.U.userError("Version spec mismatch on " + id);
                        mod.level = Math.min(mod.level, _this.level + 1);
                        return Promise.resolve();
                    }
                    else {
                        mod = new Package(id, ver, _this.parent);
                        _this.parent.deps[id] = mod;
                        return mod.loadAsync(isInstall);
                    }
                });
            })
                .then(function () { });
        };
        Package.prototype.getFiles = function () {
            if (this.level == 0)
                return this.config.files.concat(this.config.testFiles || []);
            else
                return this.config.files.slice(0);
        };
        Package.prototype.addSnapshot = function (files, exts) {
            if (exts === void 0) { exts = [""]; }
            var _loop_2 = function(fn) {
                if (exts.some(function (e) { return pxt.U.endsWith(fn, e); })) {
                    files[this_1.id + "/" + fn] = this_1.readFile(fn);
                }
            };
            var this_1 = this;
            for (var _i = 0, _a = this.getFiles(); _i < _a.length; _i++) {
                var fn = _a[_i];
                _loop_2(fn);
            }
            files[this.id + "/" + pxt.configName] = this.readFile(pxt.configName);
        };
        return Package;
    }());
    pxt.Package = Package;
    var MainPackage = (function (_super) {
        __extends(MainPackage, _super);
        function MainPackage(_host) {
            _super.call(this, "this", "file:.", null);
            this._host = _host;
            this.deps = {};
            this.parent = this;
            this.level = 0;
            this.deps[this.id] = this;
        }
        MainPackage.prototype.installAllAsync = function () {
            return this.loadAsync(true);
        };
        MainPackage.prototype.installPkgAsync = function (name) {
            var _this = this;
            return pxt.Cloud.privateGetAsync(pxt.pkgPrefix + name)
                .then(function (ptrinfo) {
                _this.config.dependencies[name] = "*";
            })
                .then(function () { return _this.installAllAsync(); })
                .then(function () { return _this.saveConfig(); });
        };
        MainPackage.prototype.sortedDeps = function () {
            var _this = this;
            var visited = {};
            var ids = [];
            var rec = function (p) {
                if (pxt.U.lookup(visited, p.id))
                    return;
                visited[p.id] = true;
                var deps = Object.keys(p.config.dependencies);
                deps.sort(function (a, b) { return pxt.U.strcmp(a, b); });
                deps.forEach(function (id) { return rec(_this.resolveDep(id)); });
                ids.push(p.id);
            };
            rec(this);
            return ids.map(function (id) { return _this.resolveDep(id); });
        };
        MainPackage.prototype.getTargetOptions = function () {
            var res = pxt.U.clone(pxt.appTarget.compile);
            if (!res)
                res = { isNative: false, hasHex: false };
            if (res.hasHex && res.jsRefCounting === undefined)
                res.jsRefCounting = true;
            if (!res.hasHex && res.floatingPoint === undefined)
                res.floatingPoint = true;
            return res;
        };
        MainPackage.prototype.getCompileOptionsAsync = function (target) {
            var _this = this;
            if (target === void 0) { target = this.getTargetOptions(); }
            var opts = {
                sourceFiles: [],
                fileSystem: {},
                target: target,
                hexinfo: {}
            };
            var generateFile = function (fn, cont) {
                if (_this.config.files.indexOf(fn) < 0)
                    pxt.U.userError(lf("please add '{0}' to \"files\" in {1}", fn, pxt.configName));
                cont = "// Auto-generated. Do not edit.\n" + cont + "\n// Auto-generated. Do not edit. Really.\n";
                if (_this.host().readFile(_this, fn) !== cont) {
                    console.log(lf("updating {0} (size={1})...", fn, cont.length));
                    _this.host().writeFile(_this, fn, cont);
                }
            };
            return this.loadAsync()
                .then(function () {
                info("building: " + _this.sortedDeps().map(function (p) { return p.config.name; }).join(", "));
                var ext = pxt.cpp.getExtensionInfo(_this);
                if (ext.errors)
                    pxt.U.userError(ext.errors);
                if (ext.shimsDTS)
                    generateFile("shims.d.ts", ext.shimsDTS);
                if (ext.enumsDTS)
                    generateFile("enums.d.ts", ext.enumsDTS);
                return (target.isNative ? _this.host().getHexInfoAsync(ext) : Promise.resolve(null))
                    .then(function (inf) {
                    ext = pxt.U.flatClone(ext);
                    delete ext.compileData;
                    delete ext.generatedFiles;
                    delete ext.extensionFiles;
                    opts.extinfo = ext;
                    opts.hexinfo = inf;
                });
            })
                .then(function () { return _this.config.binaryonly ? null : _this.filesToBePublishedAsync(true); })
                .then(function (files) {
                if (files) {
                    var headerString_1 = JSON.stringify({
                        name: _this.config.name,
                        comment: _this.config.description,
                        status: "unpublished",
                        scriptId: _this.config.installedVersion,
                        cloudId: "pxt/" + pxt.appTarget.id,
                        editor: pxt.U.lookup(files, "main.blocks") ? "blocksprj" : "tsprj"
                    });
                    var programText_1 = JSON.stringify(files);
                    return pxt.lzmaCompressAsync(headerString_1 + programText_1)
                        .then(function (buf) {
                        opts.embedMeta = JSON.stringify({
                            compression: "LZMA",
                            headerSize: headerString_1.length,
                            textSize: programText_1.length,
                            name: _this.config.name,
                        });
                        opts.embedBlob = btoa(pxt.U.uint8ArrayToString(buf));
                    });
                }
                else {
                    return Promise.resolve();
                }
            })
                .then(function () {
                for (var _i = 0, _a = _this.sortedDeps(); _i < _a.length; _i++) {
                    var pkg = _a[_i];
                    for (var _b = 0, _c = pkg.getFiles(); _b < _c.length; _b++) {
                        var f = _c[_b];
                        if (/\.(ts|asm)$/.test(f)) {
                            var sn = f;
                            if (pkg.level > 0)
                                sn = "pxt_modules/" + pkg.id + "/" + f;
                            opts.sourceFiles.push(sn);
                            opts.fileSystem[sn] = pkg.readFile(f);
                        }
                    }
                }
                return opts;
            });
        };
        MainPackage.prototype.buildAsync = function (target) {
            return this.getCompileOptionsAsync(target)
                .then(function (opts) { return ts.pxt.compile(opts); });
        };
        MainPackage.prototype.serviceAsync = function (op) {
            return this.getCompileOptionsAsync()
                .then(function (opts) {
                ts.pxt.service.performOperation("reset", {});
                ts.pxt.service.performOperation("setOpts", { options: opts });
                return ts.pxt.service.performOperation(op, {});
            });
        };
        MainPackage.prototype.initAsync = function (name) {
            var _this = this;
            if (!name)
                pxt.U.userError("missing project name");
            var str = this.readFile(pxt.configName);
            if (str)
                pxt.U.userError("config already present");
            console.log("initializing " + name + " for target " + pxt.appTarget.id);
            var prj = pxt.appTarget.tsprj;
            this.config = pxt.U.clone(prj.config);
            this.config.name = name;
            var files = {};
            for (var f in prj.files)
                files[f] = prj.files[f];
            for (var f in defaultFiles)
                files[f] = defaultFiles[f];
            delete files["README.md"]; // override existing readme files
            delete files["pxt.json"];
            this.config.files = Object.keys(files).filter(function (s) { return !/test/.test(s); });
            this.config.testFiles = Object.keys(files).filter(function (s) { return /test/.test(s); });
            this.validateConfig();
            this.saveConfig();
            pxt.U.iterStringMap(files, function (k, v) {
                if (v != null)
                    _this.host().writeFile(_this, k, v.replace(/@NAME@/g, name));
            });
            info("package initialized");
            return Promise.resolve();
        };
        MainPackage.prototype.filesToBePublishedAsync = function (allowPrivate) {
            var _this = this;
            if (allowPrivate === void 0) { allowPrivate = false; }
            var files = {};
            return this.loadAsync()
                .then(function () {
                if (!allowPrivate && !_this.config.public)
                    pxt.U.userError('Only packages with "public":true can be published');
                var cfg = pxt.U.clone(_this.config);
                delete cfg.installedVersion;
                pxt.U.iterStringMap(cfg.dependencies, function (k, v) {
                    if (v != "*" && !/^pub:/.test(v)) {
                        cfg.dependencies[k] = "*";
                        if (v)
                            info("local dependency '" + v + "' replaced with '*' in published package");
                    }
                });
                files[pxt.configName] = JSON.stringify(cfg, null, 4);
                for (var _i = 0, _a = _this.getFiles(); _i < _a.length; _i++) {
                    var f = _a[_i];
                    var str = _this.readFile(f);
                    if (str == null)
                        pxt.U.userError("referenced file missing: " + f);
                    files[f] = str;
                }
                return pxt.U.sortObjectFields(files);
            });
        };
        MainPackage.prototype.publishAsync = function () {
            var _this = this;
            var text;
            var scrInfo = null;
            return this.filesToBePublishedAsync()
                .then(function (files) {
                text = JSON.stringify(files, null, 2);
                var hash = pxt.U.sha256(text).substr(0, 32);
                info("checking for pre-existing script at " + hash);
                return pxt.Cloud.privateGetAsync("scripthash/" + hash)
                    .then(function (resp) {
                    if (resp.items && resp.items[0])
                        return resp.items[0];
                    else
                        return null;
                });
            })
                .then(function (sinfo) {
                scrInfo = sinfo;
                if (scrInfo) {
                    info("found existing script at /" + scrInfo.id);
                    return Promise.resolve();
                }
                var scrReq = {
                    baseid: "",
                    name: _this.config.name,
                    description: _this.config.description || "",
                    islibrary: true,
                    ishidden: false,
                    userplatform: ["pxt"],
                    editor: pxt.javaScriptProjectName,
                    target: pxt.appTarget.id,
                    text: text
                };
                info("publishing script; " + text.length + " bytes; target=" + scrReq.target);
                return pxt.Cloud.privatePostAsync("scripts", scrReq)
                    .then(function (inf) {
                    scrInfo = inf;
                    info("published; id /" + scrInfo.id);
                });
            })
                .then(function () { return pxt.Cloud.privateGetAsync(pxt.pkgPrefix + _this.config.name)
                .then(function (res) { return res.scriptid == scrInfo.id; }, function (e) { return false; }); })
                .then(function (alreadySet) {
                if (alreadySet) {
                    info("package already published");
                    return;
                }
                return pxt.Cloud.privatePostAsync("pointers", {
                    path: pxt.pkgPrefix.replace(/^ptr-/, "").replace(/-$/, "") + "/" + _this.config.name,
                    scriptid: scrInfo.id
                }).then(function () {
                    info("package published");
                });
            })
                .then(function () {
                if (_this.config.installedVersion != scrInfo.id) {
                    _this.config.installedVersion = scrInfo.id;
                    _this.saveConfig();
                }
            });
        };
        return MainPackage;
    }(Package));
    pxt.MainPackage = MainPackage;
    pxt.pkgPrefix = "ptr-pkg-";
    pxt.configName = "pxt.json";
    pxt.blocksProjectName = "blocksprj";
    pxt.javaScriptProjectName = "tsprj";
    var info = function info(msg) {
        console.log(msg);
    };
    var defaultFiles = {
        "tsconfig.json": "{\n    \"compilerOptions\": {\n        \"target\": \"es5\",\n        \"noImplicitAny\": true,\n        \"outDir\": \"built\",\n        \"rootDir\": \".\"\n    }\n}\n",
        ".gitignore": "built\nnode_modules\nyotta_modules\nyotta_targets\npxt_modules\n*.db\n*.tgz\n",
        ".vscode/settings.json": "{\n    \"editor.formatOnType\": true,\n    \"files.autoSave\": \"afterDelay\",\n    \"search.exclude\": {\n        \"**/built\": true,\n        \"**/node_modules\": true,\n        \"**/yotta_modules\": true,\n        \"**/yotta_targets\": true,\n        \"**/pxt_modules\": true\n    }\n}",
        ".vscode/tasks.json": "\n// A task runner that calls the PXT compiler and\n{\n    \"version\": \"0.1.0\",\n\n    // The command is pxt. Assumes that PXT has been installed using npm install -g pxt\n    \"command\": \"pxt\",\n\n    // The command is a shell script\n    \"isShellCommand\": true,\n\n    // Show the output window always.\n    \"showOutput\": \"always\",\n\n    \"tasks\": [{\n        \"taskName\": \"deploy\",\n        \"isBuildCommand\": true,\n        \"problemMatcher\": \"$tsc\",\n        \"args\": [\"deploy\"]\n    }, {\n        \"taskName\": \"build\",\n        \"isTestCommand\": true,\n        \"problemMatcher\": \"$tsc\",\n        \"args\": [\"build\"]\n    }, {\n        \"taskName\": \"publish\",\n        \"problemMatcher\": \"$tsc\",\n        \"args\": [\"publish\"]\n    }]\n}\n"
    };
})(pxt || (pxt = {}));
var pxt;
(function (pxt) {
    function simshim(prog) {
        var SK = ts.SyntaxKind;
        var checker = prog.getTypeChecker();
        var mainWr = pxt.cpp.nsWriter("declare namespace");
        var currNs = "";
        for (var _i = 0, _a = prog.getSourceFiles(); _i < _a.length; _i++) {
            var src = _a[_i];
            if (!pxt.U.startsWith(src.fileName, "sim/"))
                continue;
            for (var _b = 0, _c = src.statements; _b < _c.length; _b++) {
                var stmt = _c[_b];
                var mod = stmt;
                if (stmt.kind == SK.ModuleDeclaration && mod.name.text == "pxsim") {
                    doStmt(mod.body);
                }
            }
        }
        var res = {};
        res[pxt.appTarget.corepkg] = mainWr.finish();
        return res;
        function typeOf(node) {
            var r;
            if (ts.isExpression(node))
                r = checker.getContextualType(node);
            if (!r)
                r = checker.getTypeAtLocation(node);
            return r;
        }
        /*
        let doSymbol = (sym: ts.Symbol) => {
            if (sym.getFlags() & ts.SymbolFlags.HasExports) {
                typechecker.getExportsOfModule(sym).forEach(doSymbol)
            }
            decls[ts.pxt.getFullName(typechecker, sym)] = sym
        }
        */
        function emitModuleDeclaration(mod) {
            var prevNs = currNs;
            if (currNs)
                currNs += ".";
            currNs += mod.name.text;
            doStmt(mod.body);
            currNs = prevNs;
        }
        function mapType(tp) {
            var fn = checker.typeToString(tp, null, ts.TypeFormatFlags.UseFullyQualifiedType);
            switch (fn) {
                case "pxsim.RefAction": return "() => void";
                default:
                    return fn.replace(/^pxsim\./, "");
            }
        }
        function promiseElementType(tp) {
            if ((tp.flags & ts.TypeFlags.Reference) && tp.symbol.name == "Promise") {
                return tp.typeArguments[0];
            }
            return null;
        }
        function emitClassDeclaration(cl) {
            var cmts = getExportComments(cl);
            if (!cmts)
                return;
            mainWr.setNs(currNs);
            mainWr.write(cmts);
            var prevNs = currNs;
            if (currNs)
                currNs += ".";
            currNs += cl.name.text;
            mainWr.write("declare class " + cl.name.text + " {");
            mainWr.incrIndent();
            for (var _i = 0, _a = cl.members; _i < _a.length; _i++) {
                var mem = _a[_i];
                switch (mem.kind) {
                    case SK.MethodDeclaration:
                        emitFunctionDeclaration(mem);
                        break;
                    case SK.PropertyDeclaration:
                        emitPropertyDeclaration(mem);
                        break;
                    case SK.Constructor:
                        emitConstructorDeclaration(mem);
                        break;
                    default:
                        break;
                }
            }
            currNs = prevNs;
            mainWr.decrIndent();
            mainWr.write("}");
        }
        function getExportComments(n) {
            var cmts = ts.pxt.getComments(n);
            if (!/^\s*\/\/%/m.test(cmts))
                return null;
            return cmts;
        }
        function emitPropertyDeclaration(fn) {
            var cmts = getExportComments(fn);
            if (!cmts)
                return;
            var nm = fn.name.getText();
            var attrs = "//% shim=." + nm;
            var tp = checker.getTypeAtLocation(fn);
            mainWr.write(cmts);
            mainWr.write(attrs);
            mainWr.write("public " + nm + ": " + mapType(tp) + ";");
            mainWr.write("");
        }
        function emitConstructorDeclaration(fn) {
            var cmts = getExportComments(fn);
            if (!cmts)
                return;
            var tp = checker.getTypeAtLocation(fn);
            var args = fn.parameters.map(function (p) { return p.name.getText() + ": " + mapType(typeOf(p)); });
            mainWr.write(cmts);
            mainWr.write("//% shim=\"new " + currNs + "\"");
            mainWr.write("constructor(" + args.join(", ") + ");");
            mainWr.write("");
        }
        function emitFunctionDeclaration(fn) {
            var cmts = getExportComments(fn);
            if (!cmts)
                return;
            var fnname = fn.name.getText();
            var isMethod = fn.kind == SK.MethodDeclaration;
            var attrs = "//% shim=" + (isMethod ? "." + fnname : currNs + "::" + fnname);
            var sig = checker.getSignatureFromDeclaration(fn);
            var rettp = checker.getReturnTypeOfSignature(sig);
            var asyncName = /Async$/.test(fnname);
            var prom = promiseElementType(rettp);
            if (prom) {
                attrs += " promise";
                rettp = prom;
                if (!asyncName)
                    pxt.U.userError(currNs + "::" + fnname + " should be called " + fnname + "Async");
            }
            else if (asyncName) {
                pxt.U.userError(currNs + "::" + fnname + " doesn't return a promise");
            }
            var args = fn.parameters.map(function (p) { return p.name.getText() + ": " + mapType(typeOf(p)); });
            var localname = fnname.replace(/Async$/, "");
            var defkw = isMethod ? "public" : "function";
            if (!isMethod)
                mainWr.setNs(currNs);
            mainWr.write(cmts);
            mainWr.write(attrs);
            mainWr.write(defkw + " " + localname + "(" + args.join(", ") + "): " + mapType(rettp) + ";");
            mainWr.write("");
        }
        function doStmt(stmt) {
            switch (stmt.kind) {
                case SK.ModuleDeclaration:
                    return emitModuleDeclaration(stmt);
                case SK.ModuleBlock:
                    return stmt.statements.forEach(doStmt);
                case SK.FunctionDeclaration:
                    return emitFunctionDeclaration(stmt);
                case SK.ClassDeclaration:
                    return emitClassDeclaration(stmt);
            }
            //console.log("SKIP", ts.pxt.stringKind(stmt))
            //let mod = stmt as ts.ModuleDeclaration
            //if (mod.name) console.log(mod.name.text)
            /*
            if (mod.name) {
                let sym = typechecker.getSymbolAtLocation(mod.name)
                if (sym) doSymbol(sym)
            }
            */
        }
    }
    pxt.simshim = simshim;
})(pxt || (pxt = {}));
// See https://github.com/Microsoft/TouchDevelop-backend/blob/master/docs/streams.md
var pxt;
(function (pxt) {
    var streams;
    (function (streams) {
        function createStreamAsync(target, name) {
            return pxt.Cloud.privatePostAsync("streams", { target: target, name: name || 'data' }).then(function (j) { return j; });
        }
        streams.createStreamAsync = createStreamAsync;
        function postPayloadAsync(stream, data) {
            pxt.Util.assert(!!stream.privatekey);
            return pxt.Cloud.privatePostAsync(stream.id + "/data?privatekey=" + stream.privatekey, data);
        }
        streams.postPayloadAsync = postPayloadAsync;
    })(streams = pxt.streams || (pxt.streams = {}));
})(pxt || (pxt = {}));
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        var jsOpMap = {
            "thumb::adds": "+",
            "thumb::subs": "-",
            "Number_::div": "/",
            "Number_::mod": "%",
            "thumb::muls": "*"
        };
        function jsEmit(bin) {
            var jssource = "";
            if (!bin.target.jsRefCounting)
                jssource += "pxsim.noRefCounting();\n";
            bin.procs.forEach(function (p) {
                jssource += "\n" + irToJS(bin, p) + "\n";
            });
            if (bin.res.breakpoints)
                jssource += "\nsetupDebugger(" + bin.res.breakpoints.length + ")\n";
            jssource += "\npxsim.setupStringLiterals(" +
                JSON.stringify(pxt.U.mapStringMap(bin.strings, function (k, v) { return 1; }), null, 1) +
                ")\n";
            bin.writeFile(pxt.BINARY_JS, jssource);
        }
        pxt.jsEmit = jsEmit;
        function irToJS(bin, proc) {
            var resText = "";
            var writeRaw = function (s) { resText += s + "\n"; };
            var write = function (s) { resText += "    " + s + "\n"; };
            var EK = pxt.ir.EK;
            var refCounting = !!bin.target.jsRefCounting;
            writeRaw("\nvar " + pxt.getFunctionLabel(proc.action) + " " + (bin.procs[0] == proc ? "= entryPoint" : "") + " = function (s) {\nvar r0 = s.r0, step = s.pc;\ns.pc = -1;\nwhile (true) { \nif (yieldSteps-- < 0 && maybeYield(s, step, r0)) return null;\nswitch (step) {\n  case 0:\n");
            //console.log(proc.toString())
            proc.resolve();
            //console.log("OPT", proc.toString())
            proc.locals.forEach(function (l) {
                write(locref(l) + " = 0;");
            });
            if (proc.args.length) {
                write("if (s.lambdaArgs) {");
                proc.args.forEach(function (l, i) {
                    write("  " + locref(l) + " = s.lambdaArgs[" + i + "];");
                });
                write("  s.lambdaArgs = null;");
                write("}");
            }
            var exprStack = [];
            var lblIdx = 0;
            for (var _i = 0, _a = proc.body; _i < _a.length; _i++) {
                var s = _a[_i];
                if (s.stmtKind == pxt.ir.SK.Label)
                    s.lblId = ++lblIdx;
            }
            for (var _b = 0, _c = proc.body; _b < _c.length; _b++) {
                var s = _c[_b];
                switch (s.stmtKind) {
                    case pxt.ir.SK.Expr:
                        emitExpr(s.expr);
                        break;
                    case pxt.ir.SK.StackEmpty:
                        for (var _d = 0, exprStack_1 = exprStack; _d < exprStack_1.length; _d++) {
                            var e = exprStack_1[_d];
                            if (e.totalUses !== e.currUses)
                                pxt.oops();
                        }
                        exprStack = [];
                        break;
                    case pxt.ir.SK.Jmp:
                        emitJmp(s);
                        break;
                    case pxt.ir.SK.Label:
                        writeRaw("  case " + s.lblId + ":");
                        break;
                    case pxt.ir.SK.Breakpoint:
                        emitBreakpoint(s);
                        break;
                    default: pxt.oops();
                }
            }
            write("return leave(s, r0)");
            writeRaw("  default: oops()");
            writeRaw("} } }");
            var info = pxt.nodeLocationInfo(proc.action);
            info.functionName = proc.getName();
            writeRaw(pxt.getFunctionLabel(proc.action) + ".info = " + JSON.stringify(info));
            return resText;
            function emitBreakpoint(s) {
                var lbl = ++lblIdx;
                var id = s.breakpointInfo.id;
                var brkCall = "return breakpoint(s, " + lbl + ", " + id + ", r0);";
                if (s.breakpointInfo.isDebuggerStmt)
                    write(brkCall);
                else
                    write("if ((breakAlways && isBreakFrame(s)) || breakpoints[" + id + "]) " + brkCall);
                writeRaw("  case " + lbl + ":");
            }
            function locref(cell) {
                if (cell.iscap)
                    return "s.caps[" + cell.index + "]";
                return "s." + cell.uniqueName();
            }
            function glbref(cell) {
                return "globals." + cell.uniqueName();
            }
            function emitJmp(jmp) {
                var trg = "{ step = " + jmp.lbl.lblId + "; continue; }";
                if (jmp.jmpMode == pxt.ir.JmpMode.Always) {
                    if (jmp.expr)
                        emitExpr(jmp.expr);
                    write(trg);
                }
                else if (jmp.jmpMode == pxt.ir.JmpMode.IfJmpValEq) {
                    write("if (r0 == (" + emitExprInto(jmp.expr) + ")) " + trg);
                }
                else {
                    emitExpr(jmp.expr);
                    if (jmp.jmpMode == pxt.ir.JmpMode.IfNotZero) {
                        write("if (r0) " + trg);
                    }
                    else {
                        write("if (!r0) " + trg);
                    }
                }
            }
            function withRef(name, isRef) {
                return name + (isRef ? "Ref" : "");
            }
            function emitExprInto(e) {
                switch (e.exprKind) {
                    case EK.NumberLiteral:
                        if (e.data === true)
                            return "true";
                        else if (e.data === false)
                            return "false";
                        else if (e.data === null)
                            return "null";
                        else if (typeof e.data == "number")
                            return e.data + "";
                        else
                            throw pxt.oops();
                    case EK.PointerLiteral:
                        return e.jsInfo;
                    case EK.SharedRef:
                        var arg = e.args[0];
                        pxt.U.assert(!!arg.currUses); // not first use
                        pxt.U.assert(arg.currUses < arg.totalUses);
                        arg.currUses++;
                        var idx = exprStack.indexOf(arg);
                        pxt.U.assert(idx >= 0);
                        return "s.tmp_" + idx;
                    case EK.CellRef:
                        var cell = e.data;
                        if (cell.isGlobal()) {
                            if (refCounting && cell.isRef())
                                return "pxtrt.incr(" + glbref(cell) + ")";
                            else
                                return glbref(cell);
                        }
                        else {
                            return locref(cell);
                        }
                    default: throw pxt.oops();
                }
            }
            // result in R0
            function emitExpr(e) {
                //console.log(`EMITEXPR ${e.sharingInfo()} E: ${e.toString()}`)
                switch (e.exprKind) {
                    case EK.JmpValue:
                        write("// jmp value (already in r0)");
                        break;
                    case EK.Incr:
                        emitExpr(e.args[0]);
                        if (refCounting)
                            write("pxtrt.incr(r0);");
                        break;
                    case EK.Decr:
                        emitExpr(e.args[0]);
                        if (refCounting)
                            write("pxtrt.decr(r0);");
                        break;
                    case EK.FieldAccess:
                        var info_1 = e.data;
                        if (info_1.shimName) {
                            pxt.assert(!refCounting);
                            emitExpr(e.args[0]);
                            write("r0 = r0" + info_1.shimName + ";");
                            return;
                        }
                        // it does the decr itself, no mask
                        return emitExpr(pxt.ir.rtcall(withRef("pxtrt::ldfld", info_1.isRef), [e.args[0], pxt.ir.numlit(info_1.idx)]));
                    case EK.Store:
                        return emitStore(e.args[0], e.args[1]);
                    case EK.RuntimeCall:
                        return emitRtCall(e);
                    case EK.ProcCall:
                        return emitProcCall(e);
                    case EK.SharedDef:
                        return emitSharedDef(e);
                    case EK.Sequence:
                        return e.args.forEach(emitExpr);
                    default:
                        write("r0 = " + emitExprInto(e) + ";");
                }
            }
            function emitSharedDef(e) {
                var arg = e.args[0];
                pxt.U.assert(arg.totalUses >= 1);
                pxt.U.assert(arg.currUses === 0);
                arg.currUses = 1;
                if (arg.totalUses == 1)
                    return emitExpr(arg);
                else {
                    emitExpr(arg);
                    var idx = exprStack.length;
                    exprStack.push(arg);
                    write("s.tmp_" + idx + " = r0;");
                }
            }
            function emitRtCall(topExpr) {
                var info = pxt.ir.flattenArgs(topExpr);
                info.precomp.forEach(emitExpr);
                var name = topExpr.data;
                var args = info.flattened.map(emitExprInto);
                var text = "";
                if (name[0] == ".")
                    text = "" + args[0] + name + "(" + args.slice(1).join(", ") + ")";
                else if (pxt.U.startsWith(name, "new "))
                    text = "new pxsim." + name.slice(4).replace(/::/g, ".") + "(" + args.join(", ") + ")";
                else if (args.length == 2 && bin.target.floatingPoint && pxt.U.lookup(jsOpMap, name))
                    text = "(" + args[0] + " " + pxt.U.lookup(jsOpMap, name) + " " + args[1] + ")";
                else
                    text = "pxsim." + name.replace(/::/g, ".") + "(" + args.join(", ") + ")";
                if (topExpr.callingConvention == pxt.ir.CallingConvention.Plain) {
                    write("r0 = " + text + ";");
                }
                else {
                    var loc = ++lblIdx;
                    if (topExpr.callingConvention == pxt.ir.CallingConvention.Promise) {
                        write("(function(cb) { " + text + ".done(cb) })(buildResume(s, " + loc + "));");
                    }
                    else {
                        write("setupResume(s, " + loc + ");");
                        write(text + ";");
                    }
                    write("checkResumeConsumed();");
                    write("return;");
                    writeRaw("  case " + loc + ":");
                    write("r0 = s.retval;");
                }
            }
            function emitProcCall(topExpr) {
                var frameExpr = pxt.ir.rtcall("<frame>", []);
                frameExpr.totalUses = 1;
                frameExpr.currUses = 0;
                var frameIdx = exprStack.length;
                exprStack.push(frameExpr);
                var proc = bin.procs.filter(function (p) { return p.action == topExpr.data; })[0];
                var frameRef = "s.tmp_" + frameIdx;
                var lblId = ++lblIdx;
                write(frameRef + " = { fn: " + pxt.getFunctionLabel(proc.action) + ", parent: s };");
                //console.log("PROCCALL", topExpr.toString())
                topExpr.args.forEach(function (a, i) {
                    emitExpr(a);
                    write(frameRef + "." + proc.args[i].uniqueName() + " = r0;");
                });
                write("s.pc = " + lblId + ";");
                write("return actionCall(" + frameRef + ")");
                writeRaw("  case " + lblId + ":");
                write("r0 = s.retval;");
                frameExpr.currUses = 1;
            }
            function emitStore(trg, src) {
                switch (trg.exprKind) {
                    case EK.CellRef:
                        var cell = trg.data;
                        emitExpr(src);
                        if (cell.isGlobal()) {
                            if (refCounting && cell.isRef())
                                write("pxtrt.decr(" + glbref(cell) + ");");
                            write(glbref(cell) + " = r0;");
                        }
                        else {
                            write(locref(cell) + " = r0;");
                        }
                        break;
                    case EK.FieldAccess:
                        var info_2 = trg.data;
                        // it does the decr itself, no mask
                        emitExpr(pxt.ir.rtcall(withRef("pxtrt::stfld", info_2.isRef), [trg.args[0], pxt.ir.numlit(info_2.idx), src]));
                        break;
                    default: pxt.oops();
                }
            }
        }
        pxt.irToJS = irToJS;
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        function irToAssembly(bin, proc) {
            var resText = "";
            var write = function (s) { resText += asmline(s); };
            var EK = pxt.ir.EK;
            write("\n;\n; Function " + proc.getName() + "\n;\n.section code\n" + pxt.getFunctionLabel(proc.action) + ":\n    @stackmark func\n    @stackmark args\n    push {lr}\n");
            var numlocals = proc.locals.length;
            if (numlocals > 0)
                write("movs r0, #0");
            proc.locals.forEach(function (l) {
                write("push {r0} ; loc");
            });
            write("@stackmark locals");
            //console.log(proc.toString())
            proc.resolve();
            //console.log("OPT", proc.toString())
            var exprStack = [];
            for (var i = 0; i < proc.body.length; ++i) {
                var s = proc.body[i];
                // console.log("STMT", s.toString())
                switch (s.stmtKind) {
                    case pxt.ir.SK.Expr:
                        emitExpr(s.expr);
                        break;
                    case pxt.ir.SK.StackEmpty:
                        if (exprStack.length > 0) {
                            for (var _i = 0, _a = proc.body.slice(i - 4, i + 1); _i < _a.length; _i++) {
                                var stmt = _a[_i];
                                console.log("PREVSTMT " + stmt.toString().trim());
                            }
                            for (var _b = 0, exprStack_2 = exprStack; _b < exprStack_2.length; _b++) {
                                var e = exprStack_2[_b];
                                console.log("EXPRSTACK " + e.currUses + "/" + e.totalUses + " E: " + e.toString());
                            }
                            pxt.oops("stack should be empty");
                        }
                        write("@stackempty locals");
                        break;
                    case pxt.ir.SK.Jmp:
                        emitJmp(s);
                        break;
                    case pxt.ir.SK.Label:
                        write(s.lblName + ":");
                        break;
                    case pxt.ir.SK.Breakpoint:
                        break;
                    default: pxt.oops();
                }
            }
            pxt.assert(0 <= numlocals && numlocals < 127);
            if (numlocals > 0)
                write("add sp, #4*" + numlocals + " ; pop locals " + numlocals);
            write("pop {pc}");
            write("@stackempty func");
            write("@stackempty args");
            if (proc.args.length <= 2)
                emitLambdaWrapper();
            return resText;
            function mkLbl(root) {
                return "." + root + bin.lblNo++;
            }
            function emitJmp(jmp) {
                if (jmp.jmpMode == pxt.ir.JmpMode.Always) {
                    if (jmp.expr)
                        emitExpr(jmp.expr);
                    write("bb " + jmp.lblName + " ; with expression");
                }
                else {
                    var lbl = mkLbl("jmpz");
                    if (jmp.jmpMode == pxt.ir.JmpMode.IfJmpValEq) {
                        emitExprInto(jmp.expr, "r1");
                        write("cmp r0, r1");
                    }
                    else {
                        emitExpr(jmp.expr);
                        if (jmp.expr.exprKind == EK.RuntimeCall && jmp.expr.data === "thumb::subs") {
                        }
                        else {
                            write("cmp r0, #0");
                        }
                    }
                    if (jmp.jmpMode == pxt.ir.JmpMode.IfNotZero) {
                        write("beq " + lbl); // this is to *skip* the following 'b' instruction; beq itself has a very short range
                    }
                    else {
                        // IfZero or IfJmpValEq
                        write("bne " + lbl);
                    }
                    write("bb " + jmp.lblName);
                    write(lbl + ":");
                }
            }
            function clearStack() {
                var numEntries = 0;
                while (exprStack.length > 0 && exprStack[0].currUses == exprStack[0].totalUses) {
                    numEntries++;
                    exprStack.shift();
                }
                if (numEntries)
                    write("add sp, #4*" + numEntries + " ; clear stack");
            }
            function withRef(name, isRef) {
                return name + (isRef ? "Ref" : "");
            }
            function emitExprInto(e, reg) {
                switch (e.exprKind) {
                    case EK.NumberLiteral:
                        if (e.data === true)
                            emitInt(1, reg);
                        else if (e.data === false)
                            emitInt(0, reg);
                        else if (e.data === null)
                            emitInt(0, reg);
                        else if (typeof e.data == "number")
                            emitInt(e.data, reg);
                        else
                            pxt.oops();
                        break;
                    case EK.PointerLiteral:
                        emitLdPtr(e.data, reg);
                        break;
                    case EK.SharedRef:
                        var arg = e.args[0];
                        pxt.U.assert(!!arg.currUses); // not first use
                        pxt.U.assert(arg.currUses < arg.totalUses);
                        arg.currUses++;
                        var idx = exprStack.indexOf(arg);
                        pxt.U.assert(idx >= 0);
                        if (idx == 0 && arg.totalUses == arg.currUses) {
                            write("pop {" + reg + "}  ; tmpref @" + exprStack.length);
                            exprStack.shift();
                            clearStack();
                        }
                        else {
                            write("ldr " + reg + ", [sp, #4*" + idx + "]   ; tmpref @" + (exprStack.length - idx));
                        }
                        break;
                    case EK.CellRef:
                        var cell = e.data;
                        pxt.U.assert(!cell.isGlobal());
                        write("ldr " + reg + ", " + cellref(cell));
                        break;
                    default: pxt.oops();
                }
            }
            // result in R0
            function emitExpr(e) {
                //console.log(`EMITEXPR ${e.sharingInfo()} E: ${e.toString()}`)
                switch (e.exprKind) {
                    case EK.JmpValue:
                        write("; jmp value (already in r0)");
                        break;
                    case EK.Incr:
                        emitExpr(e.args[0]);
                        emitCallRaw("pxt::incr");
                        break;
                    case EK.Decr:
                        emitExpr(e.args[0]);
                        emitCallRaw("pxt::decr");
                        break;
                    case EK.FieldAccess:
                        var info = e.data;
                        // it does the decr itself, no mask
                        return emitExpr(pxt.ir.rtcall(withRef("pxtrt::ldfld", info.isRef), [e.args[0], pxt.ir.numlit(info.idx)]));
                    case EK.Store:
                        return emitStore(e.args[0], e.args[1]);
                    case EK.RuntimeCall:
                        return emitRtCall(e);
                    case EK.ProcCall:
                        return emitProcCall(e);
                    case EK.SharedDef:
                        return emitSharedDef(e);
                    case EK.Sequence:
                        return e.args.forEach(emitExpr);
                    case EK.CellRef:
                        var cell = e.data;
                        if (cell.isGlobal())
                            return emitExpr(pxt.ir.rtcall(withRef("pxtrt::ldglb", cell.isRef()), [pxt.ir.numlit(cell.index)]));
                        else
                            return emitExprInto(e, "r0");
                    default:
                        return emitExprInto(e, "r0");
                }
            }
            function emitSharedDef(e) {
                var arg = e.args[0];
                pxt.U.assert(arg.totalUses >= 1);
                pxt.U.assert(arg.currUses === 0);
                arg.currUses = 1;
                if (arg.totalUses == 1)
                    return emitExpr(arg);
                else {
                    emitExpr(arg);
                    exprStack.unshift(arg);
                    write("push {r0} ; tmpstore @" + exprStack.length);
                }
            }
            function emitRtCall(topExpr) {
                var info = pxt.ir.flattenArgs(topExpr);
                info.precomp.forEach(emitExpr);
                info.flattened.forEach(function (a, i) {
                    pxt.U.assert(i <= 3);
                    emitExprInto(a, "r" + i);
                });
                var name = topExpr.data;
                //console.log("RT",name,topExpr.isAsync)
                if (pxt.U.startsWith(name, "thumb::")) {
                    write(name.slice(7) + " r0, r1");
                }
                else {
                    write("bl " + name);
                }
            }
            function emitProcCall(topExpr) {
                var stackBottom = 0;
                //console.log("PROCCALL", topExpr.toString())
                var argStmts = topExpr.args.map(function (a, i) {
                    emitExpr(a);
                    write("push {r0} ; proc-arg");
                    a.totalUses = 1;
                    a.currUses = 0;
                    exprStack.unshift(a);
                    if (i == 0)
                        stackBottom = exprStack.length;
                    pxt.U.assert(exprStack.length - stackBottom == i);
                    return a;
                });
                var proc = bin.procs.filter(function (p) { return p.action == topExpr.data; })[0];
                write("bl " + pxt.getFunctionLabel(proc.action));
                for (var _i = 0, argStmts_1 = argStmts; _i < argStmts_1.length; _i++) {
                    var a = argStmts_1[_i];
                    a.currUses = 1;
                }
                clearStack();
            }
            function emitStore(trg, src) {
                switch (trg.exprKind) {
                    case EK.CellRef:
                        var cell = trg.data;
                        if (cell.isGlobal()) {
                            emitExpr(pxt.ir.rtcall(withRef("pxtrt::stglb", cell.isRef()), [src, pxt.ir.numlit(cell.index)]));
                        }
                        else {
                            emitExpr(src);
                            write("str r0, " + cellref(cell));
                        }
                        break;
                    case EK.FieldAccess:
                        var info = trg.data;
                        // it does the decr itself, no mask
                        emitExpr(pxt.ir.rtcall(withRef("pxtrt::stfld", info.isRef), [trg.args[0], pxt.ir.numlit(info.idx), src]));
                        break;
                    default: pxt.oops();
                }
            }
            function cellref(cell) {
                pxt.U.assert(!cell.isGlobal());
                if (cell.iscap) {
                    pxt.assert(0 <= cell.index && cell.index < 32);
                    return "[r5, #4*" + cell.index + "]";
                }
                else if (cell.isarg) {
                    var idx = proc.args.length - cell.index - 1;
                    return "[sp, args@" + idx + "] ; " + cell.toString();
                }
                else {
                    return "[sp, locals@" + cell.index + "] ; " + cell.toString();
                }
            }
            function emitLambdaWrapper() {
                var node = proc.action;
                write("");
                write(".section code");
                write(".balign 4");
                write(pxt.getFunctionLabel(node) + "_Lit:");
                write(".short 0xffff, 0x0000   ; action literal");
                write("@stackmark litfunc");
                write("push {r5, lr}");
                write("mov r5, r1");
                var parms = proc.args.map(function (a) { return a.def; });
                parms.forEach(function (p, i) {
                    if (i >= 2)
                        pxt.U.userError(pxt.U.lf("only up to two parameters supported in lambdas"));
                    write("push {r" + (i + 2) + "}");
                });
                write("@stackmark args");
                write("bl " + pxt.getFunctionLabel(node));
                write("@stackempty args");
                if (parms.length)
                    write("add sp, #4*" + parms.length + " ; pop args");
                write("pop {r5, pc}");
                write("@stackempty litfunc");
            }
            function emitCallRaw(name) {
                var inf = hex.lookupFunc(name);
                pxt.assert(!!inf, "unimplemented raw function: " + name);
                write("bl " + name + " ; *" + inf.type + inf.args + " (raw)");
            }
            function emitLdPtr(lbl, reg) {
                pxt.assert(!!lbl);
                write("movs " + reg + ", " + lbl + "@hi  ; ldptr");
                write("lsls " + reg + ", " + reg + ", #8");
                write("adds " + reg + ", " + lbl + "@lo");
            }
            function emitInt(v, reg) {
                function writeMov(v) {
                    pxt.assert(0 <= v && v <= 255);
                    write("movs " + reg + ", #" + v);
                }
                function writeAdd(v) {
                    pxt.assert(0 <= v && v <= 255);
                    write("adds " + reg + ", #" + v);
                }
                function shift() {
                    write("lsls " + reg + ", " + reg + ", #8");
                }
                pxt.assert(v != null);
                var n = Math.floor(v);
                var isNeg = false;
                if (n < 0) {
                    isNeg = true;
                    n = -n;
                }
                if (n <= 255) {
                    writeMov(n);
                }
                else if (n <= 0xffff) {
                    writeMov((n >> 8) & 0xff);
                    shift();
                    writeAdd(n & 0xff);
                }
                else if (n <= 0xffffff) {
                    writeMov((n >> 16) & 0xff);
                    shift();
                    writeAdd((n >> 8) & 0xff);
                    shift();
                    writeAdd(n & 0xff);
                }
                else {
                    writeMov((n >> 24) & 0xff);
                    shift();
                    writeAdd((n >> 16) & 0xff);
                    shift();
                    writeAdd((n >> 8) & 0xff);
                    shift();
                    writeAdd((n >> 0) & 0xff);
                }
                if (isNeg) {
                    write("negs " + reg + ", " + reg);
                }
            }
        }
        // TODO should be internal
        var hex;
        (function (hex_2) {
            var funcInfo;
            var hex;
            var jmpStartAddr;
            var jmpStartIdx;
            var bytecodeStartAddr;
            var bytecodeStartIdx;
            var asmLabels = {};
            hex_2.asmTotalSource = "";
            function swapBytes(str) {
                var r = "";
                var i = 0;
                for (; i < str.length; i += 2)
                    r = str[i] + str[i + 1] + r;
                pxt.assert(i == str.length);
                return r;
            }
            function setupInlineAssembly(opts) {
                asmLabels = {};
                var asmSources = opts.sourceFiles.filter(function (f) { return pxt.U.endsWith(f, ".asm"); });
                hex_2.asmTotalSource = "";
                var asmIdx = 0;
                for (var _i = 0, asmSources_1 = asmSources; _i < asmSources_1.length; _i++) {
                    var f = asmSources_1[_i];
                    var src = opts.fileSystem[f];
                    src.replace(/^\s*(\w+):/mg, function (f, lbl) {
                        asmLabels[lbl] = true;
                        return "";
                    });
                    var code = ".section code\n" +
                        "@stackmark func\n" +
                        "@scope user" + asmIdx++ + "\n" +
                        src + "\n" +
                        "@stackempty func\n" +
                        "@scope\n";
                    hex_2.asmTotalSource += code;
                }
            }
            hex_2.setupInlineAssembly = setupInlineAssembly;
            function isSetupFor(extInfo) {
                return currentSetup == extInfo.sha;
            }
            hex_2.isSetupFor = isSetupFor;
            function parseHexBytes(bytes) {
                bytes = bytes.replace(/^[\s:]/, "");
                if (!bytes)
                    return [];
                var m = /^([a-f0-9][a-f0-9])/i.exec(bytes);
                if (m)
                    return [parseInt(m[1], 16)].concat(parseHexBytes(bytes.slice(2)));
                else
                    throw pxt.oops("bad bytes " + bytes);
            }
            var currentSetup = null;
            function setupFor(extInfo, hexinfo) {
                if (isSetupFor(extInfo))
                    return;
                currentSetup = extInfo.sha;
                hex_2.currentHexInfo = hexinfo;
                hex = hexinfo.hex;
                var i = 0;
                var upperAddr = "0000";
                var lastAddr = 0;
                var lastIdx = 0;
                bytecodeStartAddr = 0;
                for (; i < hex.length; ++i) {
                    var m = /:02000004(....)/.exec(hex[i]);
                    if (m) {
                        upperAddr = m[1];
                    }
                    m = /^:..(....)00/.exec(hex[i]);
                    if (m) {
                        var newAddr = parseInt(upperAddr + m[1], 16);
                        if (!bytecodeStartAddr && newAddr >= 0x3C000) {
                            var bytes = parseHexBytes(hex[lastIdx]);
                            if (bytes[0] != 0x10) {
                                bytes.pop(); // checksum
                                bytes[0] = 0x10;
                                while (bytes.length < 20)
                                    bytes.push(0x00);
                                hex[lastIdx] = hexBytes(bytes);
                            }
                            pxt.assert((bytes[2] & 0xf) == 0);
                            bytecodeStartAddr = lastAddr + 16;
                            bytecodeStartIdx = lastIdx + 1;
                        }
                        lastIdx = i;
                        lastAddr = newAddr;
                    }
                    m = /^:10....000108010842424242010801083ED8E98D/.exec(hex[i]);
                    if (m) {
                        jmpStartAddr = lastAddr;
                        jmpStartIdx = i;
                    }
                }
                if (!jmpStartAddr)
                    pxt.oops("No hex start");
                funcInfo = {};
                var funs = hexinfo.functions.concat(extInfo.functions);
                for (var i_1 = jmpStartIdx + 1; i_1 < hex.length; ++i_1) {
                    var m = /^:10(....)00(.{16})/.exec(hex[i_1]);
                    if (!m)
                        continue;
                    var s = hex[i_1].slice(9);
                    while (s.length >= 8) {
                        var inf = funs.shift();
                        if (!inf)
                            return;
                        funcInfo[inf.name] = inf;
                        var hexb = s.slice(0, 8);
                        //console.log(inf.name, hexb)
                        inf.value = parseInt(swapBytes(hexb), 16) & 0xfffffffe;
                        if (!inf.value) {
                            pxt.U.oops("No value for " + inf.name + " / " + hexb);
                        }
                        s = s.slice(8);
                    }
                }
                pxt.oops();
            }
            hex_2.setupFor = setupFor;
            function validateShim(funname, attrs, hasRet, numArgs) {
                if (attrs.shim == "TD_ID" || attrs.shim == "TD_NOOP")
                    return;
                if (pxt.U.lookup(asmLabels, attrs.shim))
                    return;
                var nm = funname + "(...) (shim=" + attrs.shim + ")";
                var inf = lookupFunc(attrs.shim);
                if (inf) {
                    if (!hasRet) {
                        if (inf.type != "P")
                            pxt.U.userError("expecting procedure for " + nm);
                    }
                    else {
                        if (inf.type != "F")
                            pxt.U.userError("expecting function for " + nm);
                    }
                    if (numArgs != inf.args)
                        pxt.U.userError("argument number mismatch: " + numArgs + " vs " + inf.args + " in C++");
                }
                else {
                    pxt.U.userError("function not found: " + nm);
                }
            }
            hex_2.validateShim = validateShim;
            function lookupFunc(name) {
                return funcInfo[name];
            }
            hex_2.lookupFunc = lookupFunc;
            function lookupFunctionAddr(name) {
                var inf = lookupFunc(name);
                if (inf)
                    return inf.value;
                return null;
            }
            hex_2.lookupFunctionAddr = lookupFunctionAddr;
            function hexTemplateHash() {
                var sha = currentSetup ? currentSetup.slice(0, 16) : "";
                while (sha.length < 16)
                    sha += "0";
                return sha.toUpperCase();
            }
            hex_2.hexTemplateHash = hexTemplateHash;
            function hexPrelude() {
                return "    .startaddr 0x" + bytecodeStartAddr.toString(16) + "\n";
            }
            hex_2.hexPrelude = hexPrelude;
            function hexBytes(bytes) {
                var chk = 0;
                var r = ":";
                bytes.forEach(function (b) { return chk += b; });
                bytes.push((-chk) & 0xff);
                bytes.forEach(function (b) { return r += ("0" + b.toString(16)).slice(-2); });
                return r.toUpperCase();
            }
            function patchHex(bin, buf, shortForm) {
                var myhex = hex.slice(0, bytecodeStartIdx);
                pxt.assert(buf.length < 32000);
                var ptr = 0;
                function nextLine(buf, addr) {
                    var bytes = [0x10, (addr >> 8) & 0xff, addr & 0xff, 0];
                    for (var j = 0; j < 8; ++j) {
                        bytes.push((buf[ptr] || 0) & 0xff);
                        bytes.push((buf[ptr] || 0) >>> 8);
                        ptr++;
                    }
                    return bytes;
                }
                var hd = [0x4208, bin.globals.length, bytecodeStartAddr & 0xffff, bytecodeStartAddr >>> 16];
                var tmp = hexTemplateHash();
                for (var i = 0; i < 4; ++i)
                    hd.push(parseInt(swapBytes(tmp.slice(i * 4, i * 4 + 4)), 16));
                myhex[jmpStartIdx] = hexBytes(nextLine(hd, jmpStartAddr));
                ptr = 0;
                if (shortForm)
                    myhex = [];
                var addr = bytecodeStartAddr;
                var upper = (addr - 16) >> 16;
                while (ptr < buf.length) {
                    if ((addr >> 16) != upper) {
                        upper = addr >> 16;
                        myhex.push(hexBytes([0x02, 0x00, 0x00, 0x04, upper >> 8, upper & 0xff]));
                    }
                    myhex.push(hexBytes(nextLine(buf, addr)));
                    addr += 16;
                }
                if (!shortForm)
                    hex.slice(bytecodeStartIdx).forEach(function (l) { return myhex.push(l); });
                return myhex;
            }
            hex_2.patchHex = patchHex;
        })(hex = pxt.hex || (pxt.hex = {}));
        function asmline(s) {
            if (!/(^[\s;])|(:$)/.test(s))
                s = "    " + s;
            return s + "\n";
        }
        pxt.asmline = asmline;
        function isDataRecord(s) {
            if (!s)
                return false;
            var m = /^:......(..)/.exec(s);
            pxt.assert(!!m);
            return m[1] == "00";
        }
        function stringLiteral(s) {
            var r = "\"";
            for (var i = 0; i < s.length; ++i) {
                // TODO generate warning when seeing high character ?
                var c = s.charCodeAt(i) & 0xff;
                var cc = String.fromCharCode(c);
                if (cc == "\\" || cc == "\"")
                    r += "\\" + cc;
                else if (cc == "\n")
                    r += "\\n";
                else if (c <= 0xf)
                    r += "\\x0" + c.toString(16);
                else if (c < 32 || c > 127)
                    r += "\\x" + c.toString(16);
                else
                    r += cc;
            }
            return r + "\"";
        }
        function emitStrings(bin) {
            for (var _i = 0, _a = Object.keys(bin.strings); _i < _a.length; _i++) {
                var s = _a[_i];
                var lbl = bin.strings[s];
                bin.otherLiterals.push("\n.balign 4\n" + lbl + "meta: .short 0xffff, " + s.length + "\n" + lbl + ": .string " + stringLiteral(s) + "\n");
            }
        }
        function serialize(bin) {
            var asmsource = "; start\n" + hex.hexPrelude() + "        \n    .hex 708E3B92C615A841C49866C975EE5197 ; magic number\n    .hex " + hex.hexTemplateHash() + " ; hex template hash\n    .hex 0000000000000000 ; @SRCHASH@\n    .space 16 ; reserved\n";
            bin.procs.forEach(function (p) {
                asmsource += "\n" + irToAssembly(bin, p) + "\n";
            });
            asmsource += hex.asmTotalSource;
            asmsource += "_js_end:\n";
            emitStrings(bin);
            asmsource += bin.otherLiterals.join("");
            asmsource += "_program_end:\n";
            return asmsource;
        }
        function patchSrcHash(src) {
            var sha = pxt.U.sha256(src);
            return src.replace(/\n.*@SRCHASH@\n/, "\n    .hex " + sha.slice(0, 16).toUpperCase() + " ; program hash\n");
        }
        function thumbInlineAssemble(src) {
            var b = mkThumbFile();
            b.emit(src);
            throwThumbErrors(b);
            var res = [];
            for (var i = 0; i < b.buf.length; i += 2) {
                res.push((((b.buf[i + 1] || 0) << 16) | b.buf[i]) >>> 0);
            }
            return res;
        }
        pxt.thumbInlineAssemble = thumbInlineAssemble;
        function mkThumbFile() {
            pxt.thumb.test(); // just in case
            var b = new pxt.thumb.File();
            b.lookupExternalLabel = hex.lookupFunctionAddr;
            b.normalizeExternalLabel = function (s) {
                var inf = hex.lookupFunc(s);
                if (inf)
                    return inf.name;
                return s;
            };
            // b.throwOnError = true;
            return b;
        }
        function throwThumbErrors(b) {
            if (b.errors.length > 0) {
                var userErrors_1 = "";
                b.errors.forEach(function (e) {
                    var m = /^user(\d+)/.exec(e.scope);
                    if (m) {
                        // This generally shouldn't happen, but it may for certin kind of global 
                        // errors - jump range and label redefinitions
                        var no = parseInt(m[1]); // TODO lookup assembly file name
                        userErrors_1 += pxt.U.lf("At inline assembly:\n");
                        userErrors_1 += e.message;
                    }
                });
                if (userErrors_1) {
                    //TODO
                    console.log(pxt.U.lf("errors in inline assembly"));
                    console.log(userErrors_1);
                    throw new Error(b.errors[0].message);
                }
                else {
                    throw new Error(b.errors[0].message);
                }
            }
        }
        var peepDbg = false;
        function assemble(bin, src) {
            var b = mkThumbFile();
            b.emit(src);
            src = b.getSource(!peepDbg);
            throwThumbErrors(b);
            return {
                src: src,
                buf: b.buf
            };
        }
        function addSource(meta, binstring) {
            var metablob = pxt.Util.toUTF8(meta);
            var totallen = metablob.length + binstring.length;
            if (totallen > 40000) {
                return "; program too long\n";
            }
            var str = "\n    .balign 16\n    .hex 41140E2FB82FA2BB\n    .short " + metablob.length + "\n    .short " + binstring.length + "\n    .short 0, 0   ; future use\n\n_stored_program: .string \"";
            var addblob = function (b) {
                for (var i = 0; i < b.length; ++i) {
                    var v = b.charCodeAt(i) & 0xff;
                    if (v <= 0xf)
                        str += "\\x0" + v.toString(16);
                    else
                        str += "\\x" + v.toString(16);
                }
            };
            addblob(metablob);
            addblob(binstring);
            str += "\"\n";
            return str;
        }
        function thumbEmit(bin, opts) {
            var src = serialize(bin);
            src = patchSrcHash(src);
            if (opts.embedBlob)
                src += addSource(opts.embedMeta, atob(opts.embedBlob));
            bin.writeFile(ts.pxt.BINARY_ASM, src);
            var res = assemble(bin, src);
            if (res.src)
                bin.writeFile(ts.pxt.BINARY_ASM, res.src);
            if (res.buf) {
                var myhex = hex.patchHex(bin, res.buf, false).join("\r\n") + "\r\n";
                bin.writeFile(ts.pxt.BINARY_HEX, myhex);
            }
        }
        pxt.thumbEmit = thumbEmit;
        pxt.validateShim = hex.validateShim;
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
var pxt;
(function (pxt) {
    var Cloud;
    (function (Cloud) {
        var Util = ts.pxt.Util;
        Cloud.apiRoot = "https://www.pxt.io/api/";
        Cloud.accessToken = "";
        Cloud.localToken = "";
        var _isOnline = true;
        Cloud.onOffline = function () { };
        function offlineError(url) {
            var e = new Error(Util.lf("Cannot access {0} while offline", url));
            e.isOffline = true;
            return Promise.delay(1000).then(function () { return Promise.reject(e); });
        }
        function hasAccessToken() {
            return !!Cloud.accessToken;
        }
        Cloud.hasAccessToken = hasAccessToken;
        function isLocalHost() {
            try {
                return /^http:\/\/(localhost|127\.0\.0\.1):3232\//.test(window.location.href);
            }
            catch (e) {
                return false;
            }
        }
        Cloud.isLocalHost = isLocalHost;
        function privateRequestAsync(options) {
            options.url = Cloud.apiRoot + options.url;
            if (!Cloud.isOnline()) {
                return offlineError(options.url);
            }
            if (Cloud.accessToken) {
                if (!options.headers)
                    options.headers = {};
                options.headers["x-td-access-token"] = Cloud.accessToken;
            }
            return Util.requestAsync(options)
                .catch(function (e) {
                if (e.statusCode == 0) {
                    if (_isOnline) {
                        _isOnline = false;
                        Cloud.onOffline();
                    }
                    return offlineError(options.url);
                }
                else {
                    return Promise.reject(e);
                }
            });
        }
        Cloud.privateRequestAsync = privateRequestAsync;
        function privateGetAsync(path) {
            return privateRequestAsync({ url: path }).then(function (resp) { return resp.json; });
        }
        Cloud.privateGetAsync = privateGetAsync;
        function downloadScriptFilesAsync(id) {
            return privateRequestAsync({ url: id + "/text" }).then(function (resp) {
                return JSON.parse(resp.text);
            });
        }
        Cloud.downloadScriptFilesAsync = downloadScriptFilesAsync;
        function privateDeleteAsync(path) {
            return privateRequestAsync({ url: path, method: "DELETE" }).then(function (resp) { return resp.json; });
        }
        Cloud.privateDeleteAsync = privateDeleteAsync;
        function privatePostAsync(path, data) {
            return privateRequestAsync({ url: path, data: data || {} }).then(function (resp) { return resp.json; });
        }
        Cloud.privatePostAsync = privatePostAsync;
        function isLoggedIn() { return !!Cloud.accessToken; }
        Cloud.isLoggedIn = isLoggedIn;
        function isOnline() { return _isOnline; }
        Cloud.isOnline = isOnline;
        function getServiceUrl() {
            return Cloud.apiRoot.replace(/\/api\/$/, "");
        }
        Cloud.getServiceUrl = getServiceUrl;
        function getUserId() {
            var m = /^0(\w+)\./.exec(Cloud.accessToken);
            if (m)
                return m[1];
            return null;
        }
        Cloud.getUserId = getUserId;
    })(Cloud = pxt.Cloud || (pxt.Cloud = {}));
})(pxt || (pxt = {}));
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        var decompiler;
        (function (decompiler) {
            var SK = ts.SyntaxKind;
            var ops = {
                "+": { type: "math_arithmetic", op: "ADD" },
                "-": { type: "math_arithmetic", op: "MINUS" },
                "/": { type: "math_arithmetic", op: "DIVIDE" },
                "*": { type: "math_arithmetic", op: "MULTIPLY" },
                "<": { type: "logic_compare", op: "LT" },
                "<=": { type: "logic_compare", op: "LTE" },
                ">": { type: "logic_compare", op: "GT" },
                ">=": { type: "logic_compare", op: "GTE" },
                "==": { type: "logic_compare", op: "EQ" },
                "!=": { type: "logic_compare", op: "NEQ" },
                "&&": { type: "logic_operation", op: "AND" },
                "||": { type: "logic_operation", op: "OR" },
            };
            var builtinBlocks = {
                "Math.random": { blockId: "device_random", block: "pick random 0 to %limit" },
                "Math.abs": { blockId: "math_op3", block: "absolute of %x" },
                "Math.min": { blockId: "math_op2", block: "of %x|and %y" },
                "Math.max": { blockId: "math_op2", block: "of %x|and %y", fields: "<field name=\"op\">max</field>" }
            };
            function decompileToBlocks(blocksInfo, file) {
                var stmts = file.statements;
                var result = {
                    blocksInfo: blocksInfo,
                    outfiles: {}, diagnostics: [], success: true, times: {}
                };
                var output = "";
                var nexts = [];
                emitTopStatements(stmts);
                result.outfiles[file.fileName.replace(/(\.blocks)?\.\w*$/i, '') + '.blocks'] = "<xml xmlns=\"http://www.w3.org/1999/xhtml\">\n" + output + "</xml>";
                return result;
                function write(s) {
                    output += s + "\n";
                }
                function emit(n) {
                    switch (n.kind) {
                        case SK.ExpressionStatement:
                            emit(n.expression);
                            break;
                        case SK.ParenthesizedExpression:
                            emit(n.expression);
                            break;
                        case SK.VariableStatement:
                            emitVariableStatement(n);
                            break;
                        case SK.Identifier:
                            emitIdentifier(n);
                            break;
                        case SK.Block:
                            emitBlock(n);
                            break;
                        case SK.CallExpression:
                            emitCallExpression(n);
                            break;
                        case SK.StringLiteral:
                        case SK.FirstTemplateToken:
                        case SK.NoSubstitutionTemplateLiteral:
                            emitStringLiteral(n);
                            break;
                        case SK.PrefixUnaryExpression:
                            emitPrefixUnaryExpression(n);
                            break;
                        case SK.PostfixUnaryExpression:
                            emitPostfixUnaryExpression(n);
                            break;
                        case SK.BinaryExpression:
                            emitBinaryExpression(n);
                            break;
                        case SK.NullKeyword:
                            // don't emit anything
                            break;
                        case SK.NumericLiteral:
                            emitNumberExpression(n);
                            break;
                        case SK.TrueKeyword:
                        case SK.FalseKeyword:
                            emitBooleanExpression(n);
                            break;
                        case SK.WhileStatement:
                            emitWhileStatement(n);
                            break;
                        case SK.IfStatement:
                            emitIfStatement(n);
                            break;
                        case SK.ForStatement:
                            emitForStatement(n);
                            break;
                        case SK.ArrowFunction:
                            emitArrowFunction(n);
                            break;
                        case SK.PropertyAccessExpression:
                            emitPropertyAccessExpression(n);
                            break;
                        default:
                            error(n);
                            break;
                    }
                }
                function error(n, msg) {
                    var diags = ts.pxt.patchUpDiagnostics([{
                            file: file,
                            start: n.getFullStart(),
                            length: n.getFullWidth(),
                            messageText: msg || "Language feature \"" + n.getFullText().trim() + "\"\" not supported in blocks",
                            category: ts.DiagnosticCategory.Error,
                            code: 1001
                        }]);
                    pxt.U.pushRange(result.diagnostics, diags);
                    result.success = false;
                }
                function writeBeginBlock(type) {
                    var next = nexts[nexts.length - 1];
                    if (next.top > 0)
                        write('<next>');
                    write("<block type=\"" + pxt.Util.htmlEscape(type) + "\">");
                    next.top++;
                    next.current++;
                }
                function writeEndBlock() {
                    var next = nexts[nexts.length - 1];
                    next.current--;
                }
                function pushBlocks() {
                    nexts.push({ current: 0, top: 0 });
                }
                function flushBlocks() {
                    var next = nexts.pop();
                    pxt.Util.assert(next && next.current == 0);
                    for (var i = 0; i < next.top - 1; ++i) {
                        write('</block>');
                        write('</next>');
                    }
                    if (next.top > 0)
                        write('</block>');
                }
                function emitPostfixUnaryExpression(n) {
                    var parent = n.parent;
                    if (parent.kind != ts.SyntaxKind.ExpressionStatement ||
                        n.operand.kind != ts.SyntaxKind.Identifier) {
                        error(n);
                        return;
                    }
                    var left = n.operand.text;
                    switch (n.operator) {
                        case ts.SyntaxKind.PlusPlusToken:
                            emitVariableSetOrChange(left, 1, true);
                            break;
                        case ts.SyntaxKind.MinusMinusToken:
                            emitVariableSetOrChange(left, -1, true);
                            break;
                        default:
                            error(n);
                            break;
                    }
                }
                function emitPrefixUnaryExpression(n) {
                    switch (n.operator) {
                        case ts.SyntaxKind.ExclamationToken:
                            writeBeginBlock("logic_negate");
                            write('<value name="BOOL">');
                            pushBlocks();
                            emit(n.operand);
                            flushBlocks();
                            write('</value>');
                            writeEndBlock();
                            break;
                        case ts.SyntaxKind.PlusToken:
                            emit(n.operand);
                            break;
                        case ts.SyntaxKind.MinusToken:
                            if (n.operand.kind == ts.SyntaxKind.NumericLiteral) {
                                write("<block type=\"math_number\"><field name=\"NUM\">-" + pxt.U.htmlEscape(n.operand.text) + "</field></block>");
                            }
                            else {
                                write("<block type=\"math_arithmetic\">\n        <field name=\"OP\">MINUS</field>\n        <value name=\"A\">\n          <block type=\"math_number\">\n            <field name=\"NUM\">0</field>\n          </block>\n        </value>\n        <value name=\"B\">\n          <block type=\"math_number\">\n            <field name=\"NUM\">");
                                pushBlocks();
                                emit(n.operand);
                                flushBlocks();
                                write("</field>\n          </block>\n        </value>\n      </block>");
                            }
                            break; // TODO add negation block
                        case ts.SyntaxKind.PlusPlusToken:
                        case ts.SyntaxKind.MinusMinusToken:
                            var parent_1 = n.parent;
                            if (parent_1.kind != ts.SyntaxKind.ExpressionStatement ||
                                n.operand.kind != ts.SyntaxKind.Identifier) {
                                error(n);
                                return;
                            }
                            emitVariableSetOrChange(n.operand.text, n.operator == ts.SyntaxKind.PlusPlusToken ? 1 : -1, true);
                            break;
                        default:
                            error(n);
                            break;
                    }
                }
                function emitBinaryExpression(n) {
                    var op = n.operatorToken.getText();
                    if (n.left.kind == ts.SyntaxKind.Identifier) {
                        switch (op) {
                            case '=':
                                emitVariableSetOrChange(n.left.text, n.right);
                                return;
                            case '+=':
                                emitVariableSetOrChange(n.left.text, n.right, true);
                                return;
                        }
                    }
                    var npp = ops[op];
                    if (!npp)
                        return error(n);
                    writeBeginBlock(npp.type);
                    write("<field name=\"OP\">" + npp.op + "</field>");
                    write('<value name="A">');
                    pushBlocks();
                    emit(n.left);
                    flushBlocks();
                    write('</value>');
                    write('<value name="B">');
                    pushBlocks();
                    emit(n.right);
                    flushBlocks();
                    write('</value>');
                    writeEndBlock();
                }
                function emitIdentifier(n) {
                    write("<block type=\"variables_get\"><field name=\"VAR\">" + pxt.Util.htmlEscape(n.text) + "</field></block>");
                }
                // TODO handle special for loops
                function emitForStatement(n) {
                    writeBeginBlock("controls_simple_for");
                    var vd = n.initializer;
                    if (vd.declarations.length != 1) {
                        error(n, "for loop with multiple variables not supported");
                    }
                    var id = vd.declarations[0].name;
                    write("<field name=\"VAR\">" + pxt.Util.htmlEscape(id.text) + "</field>");
                    write('<value name="TO">');
                    var c = n.condition;
                    if (c.kind == ts.SyntaxKind.BinaryExpression) {
                        var bs = c;
                        if (bs.left.kind == ts.SyntaxKind.Identifier &&
                            bs.left.text == id.text &&
                            bs.operatorToken.getText() == "<") {
                            write('<block type="math_number">');
                            if (bs.right.kind == ts.SyntaxKind.NumericLiteral)
                                write("<field name=\"NUM\">" + (parseInt(bs.right.text) - 1) + "</field>");
                            else {
                                write("<block type=\"math_arithmetic\">\n        <field name=\"OP\">MINUS</field>\n        <value name=\"A\">\n          <block type=\"math_number\">\n            <field name=\"NUM\">");
                                emit(bs.right);
                                write("</field>\n          </block>\n        </value>\n        <value name=\"B\">\n          <block type=\"math_number\">\n            <field name=\"NUM\">1</field>\n          </block>\n        </value>\n      </block>");
                            }
                            write('</block>');
                        }
                    }
                    write('</value>');
                    write('<statement name="DO">');
                    emit(n.statement);
                    write('</statement>');
                    writeEndBlock();
                }
                function emitVariableStatement(n) {
                    n.declarationList.declarations.forEach(function (decl) {
                        emitVariableSetOrChange(decl.name.text, decl.initializer);
                    });
                }
                function emitVariableSetOrChange(name, value, changed) {
                    if (changed === void 0) { changed = false; }
                    writeBeginBlock(changed ? "variables_change" : "variables_set");
                    write("<field name=\"VAR\">" + pxt.Util.htmlEscape(name) + "</field>");
                    if (typeof value == 'number')
                        write("<value name=\"VALUE\"><block type=\"math_number\"><field name=\"NUM\">" + value + "</field></block></value>");
                    else {
                        write('<value name="VALUE">');
                        pushBlocks();
                        emit(value);
                        flushBlocks();
                        write('</value>');
                    }
                    writeEndBlock();
                }
                function emitPropertyAccessExpression(n) {
                    var callInfo = n.callInfo;
                    if (!callInfo) {
                        error(n);
                        return;
                    }
                    output += (callInfo.attrs.blockId || callInfo.qName);
                }
                function emitArrowFunction(n) {
                    if (n.parameters.length > 0) {
                        error(n);
                        return;
                    }
                    emit(n.body);
                }
                function emitTopStatements(stmts) {
                    // chunk statements
                    var chunks = [[]];
                    stmts.forEach(function (stmt) {
                        if (stmt.kind == ts.SyntaxKind.ExpressionStatement && isOutputExpression(stmt.expression))
                            chunks.push([]);
                        chunks[chunks.length - 1].push(stmt);
                    });
                    chunks.forEach(function (chunk) {
                        pushBlocks();
                        chunk.forEach(function (statement) { return emit(statement); });
                        flushBlocks();
                    });
                }
                function emitStatements(stmts) {
                    pushBlocks();
                    stmts.forEach(function (statement) { return emit(statement); });
                    flushBlocks();
                }
                function isOutputExpression(expr) {
                    switch (expr.kind) {
                        case ts.SyntaxKind.BinaryExpression:
                            return !/[=<>]/.test(expr.operatorToken.getText());
                        case ts.SyntaxKind.PrefixUnaryExpression: {
                            var op = expr.operator;
                            return op != ts.SyntaxKind.PlusPlusToken && op != ts.SyntaxKind.MinusMinusToken;
                        }
                        case ts.SyntaxKind.PostfixUnaryExpression: {
                            var op = expr.operator;
                            return op != ts.SyntaxKind.PlusPlusToken && op != ts.SyntaxKind.MinusMinusToken;
                        }
                        default: return false;
                    }
                }
                function emitBlock(n) {
                    emitStatements(n.statements);
                }
                function flattenIfStatement(n) {
                    var r = {
                        ifStatements: [{
                                expression: n.expression,
                                thenStatement: n.thenStatement
                            }],
                        elseStatement: n.elseStatement
                    };
                    if (n.elseStatement && n.elseStatement.kind == SK.IfStatement) {
                        var flat = flattenIfStatement(n.elseStatement);
                        r.ifStatements = r.ifStatements.concat(flat.ifStatements);
                        r.elseStatement = flat.elseStatement;
                    }
                    return r;
                }
                function emitIfStatement(n) {
                    var flatif = flattenIfStatement(n);
                    writeBeginBlock("controls_if");
                    write("<mutation elseif=\"" + (flatif.ifStatements.length - 1) + "\" else=\"" + (flatif.elseStatement ? 1 : 0) + "\"></mutation>");
                    flatif.ifStatements.forEach(function (stmt, i) {
                        write("<value name=\"IF" + i + "\">");
                        pushBlocks();
                        emit(stmt.expression);
                        flushBlocks();
                        write('</value>');
                        write("<statement name=\"DO" + i + "\">");
                        pushBlocks();
                        emit(stmt.thenStatement);
                        flushBlocks();
                        write('</statement>');
                    });
                    if (flatif.elseStatement) {
                        write('<statement name="ELSE">');
                        pushBlocks();
                        emit(flatif.elseStatement);
                        flushBlocks();
                        write('</statement>');
                    }
                    writeEndBlock();
                }
                function emitWhileStatement(n) {
                    writeBeginBlock("device_while");
                    write('<value name="COND">');
                    pushBlocks();
                    emit(n.expression);
                    flushBlocks();
                    write('</value>');
                    write('<statement name="DO">');
                    pushBlocks();
                    emit(n.statement);
                    flushBlocks();
                    write('</statement>');
                    writeEndBlock();
                }
                function emitStringLiteral(n) {
                    write("<block type=\"text\"><field name=\"TEXT\">" + pxt.U.htmlEscape(n.text) + "</field></block>");
                }
                function emitNumberExpression(n) {
                    write("<block type=\"math_number\"><field name=\"NUM\">" + pxt.U.htmlEscape(n.text) + "</field></block>");
                }
                function emitBooleanExpression(n) {
                    write("<block type=\"logic_boolean\"><field name=\"BOOL\">" + pxt.U.htmlEscape(n.kind == ts.SyntaxKind.TrueKeyword ? 'TRUE' : 'FALSE') + "</field></block>");
                }
                function emitCallImageLiteralExpression(node, info) {
                    var arg = node.arguments[0];
                    if (arg.kind != ts.SyntaxKind.StringLiteral && arg.kind != ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
                        error(node);
                        return;
                    }
                    writeBeginBlock(info.attrs.blockId);
                    var leds = (arg.text || '').replace(/\s/g, '');
                    var nc = info.attrs.imageLiteral * 5;
                    for (var r = 0; r < 5; ++r) {
                        for (var c = 0; c < nc; ++c) {
                            write("<field name=\"LED" + c + r + "\">" + (/[#*1]/.test(leds[r * nc + c]) ? "TRUE" : "FALSE") + "</field>");
                        }
                    }
                    writeEndBlock();
                }
                function emitCallExpression(node) {
                    var extraArgs = '';
                    var info = node.callInfo;
                    if (!info) {
                        error(node);
                        return;
                    }
                    if (!info.attrs.blockId || !info.attrs.block) {
                        var builtin = builtinBlocks[info.qName];
                        if (!builtin) {
                            error(node);
                            return;
                        }
                        info.attrs.block = builtin.block;
                        info.attrs.blockId = builtin.blockId;
                        if (builtin.fields)
                            extraArgs += builtin.fields;
                    }
                    if (info.attrs.imageLiteral) {
                        emitCallImageLiteralExpression(node, info);
                        return;
                    }
                    var argNames = [];
                    info.attrs.block.replace(/%(\w+)/g, function (f, n) {
                        argNames.push(n);
                        return "";
                    });
                    writeBeginBlock(info.attrs.blockId);
                    if (extraArgs)
                        write(extraArgs);
                    info.args.forEach(function (e, i) {
                        switch (e.kind) {
                            case SK.ArrowFunction:
                                write('<statement name="HANDLER">');
                                pushBlocks();
                                emit(e);
                                flushBlocks();
                                write('</statement>');
                                break;
                            case SK.PropertyAccessExpression:
                                output += "<field name=\"" + argNames[i] + "\">";
                                pushBlocks();
                                emit(e);
                                flushBlocks();
                                output += "</field>";
                                break;
                            default:
                                write("<value name=\"" + argNames[i] + "\">");
                                pushBlocks();
                                emit(e);
                                flushBlocks();
                                write("</value>");
                                break;
                        }
                    });
                    writeEndBlock();
                }
            }
            decompiler.decompileToBlocks = decompileToBlocks;
        })(decompiler = pxt.decompiler || (pxt.decompiler = {}));
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        var thumb;
        (function (thumb) {
            function lf(fmt) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return fmt.replace(/{(\d+)}/g, function (match, index) { return args[+index]; });
            }
            thumb.lf = lf;
            var badNameError = emitErr("opcode name doesn't match", "<name>");
            var Instruction = (function () {
                function Instruction(format, opcode, mask, jsFormat) {
                    this.opcode = opcode;
                    this.mask = mask;
                    this.jsFormat = jsFormat;
                    pxt.assert((opcode & mask) == opcode);
                    this.code = format.replace(/\s+/g, " ");
                    this.friendlyFmt = format.replace(/\$\w+/g, function (m) {
                        if (encoders[m])
                            return encoders[m].pretty;
                        return m;
                    });
                    var words = tokenize(format);
                    this.name = words[0];
                    this.args = words.slice(1);
                }
                Instruction.prototype.emit = function (ln) {
                    var tokens = ln.words;
                    if (tokens[0] != this.name)
                        return badNameError;
                    var r = this.opcode;
                    var j = 1;
                    var stack = 0;
                    var numArgs = [];
                    var labelName = null;
                    for (var i = 0; i < this.args.length; ++i) {
                        var formal = this.args[i];
                        var actual = tokens[j++];
                        if (formal[0] == "$") {
                            var enc = encoders[formal];
                            var v = null;
                            if (enc.isRegister) {
                                v = registerNo(actual);
                                if (v == null)
                                    return emitErr("expecting register name", actual);
                            }
                            else if (enc.isImmediate) {
                                actual = actual.replace(/^#/, "");
                                v = ln.bin.parseOneInt(actual);
                                if (v == null) {
                                    return emitErr("expecting number", actual);
                                }
                                else {
                                    if (this.opcode == 0xb000)
                                        stack = -(v / 4);
                                    else if (this.opcode == 0xb080)
                                        stack = (v / 4);
                                }
                            }
                            else if (enc.isRegList) {
                                if (actual != "{")
                                    return emitErr("expecting {", actual);
                                v = 0;
                                while (tokens[j] != "}") {
                                    actual = tokens[j++];
                                    if (!actual)
                                        return emitErr("expecting }", tokens[j - 2]);
                                    var no = registerNo(actual);
                                    if (no == null)
                                        return emitErr("expecting register name", actual);
                                    if (v & (1 << no))
                                        return emitErr("duplicate register name", actual);
                                    v |= (1 << no);
                                    if (this.opcode == 0xb400)
                                        stack++;
                                    else if (this.opcode == 0xbc00)
                                        stack--;
                                    if (tokens[j] == ",")
                                        j++;
                                }
                                actual = tokens[j++]; // skip close brace
                            }
                            else if (enc.isLabel) {
                                actual = actual.replace(/^#/, "");
                                if (/^[+-]?\d+$/.test(actual)) {
                                    v = parseInt(actual, 10);
                                    labelName = "rel" + v;
                                }
                                else {
                                    labelName = actual;
                                    v = ln.bin.getRelativeLabel(actual, enc.isWordAligned);
                                    if (v == null) {
                                        if (ln.bin.finalEmit)
                                            return emitErr("unknown label", actual);
                                        else
                                            v = 8; // needs to be divisible by 4 etc
                                    }
                                }
                            }
                            else {
                                pxt.oops();
                            }
                            if (v == null)
                                return emitErr("didn't understand it", actual); // shouldn't happen
                            if (this.name == "bl" || this.name == "bb") {
                                if (tokens[j])
                                    return emitErr("trailing tokens", tokens[j]);
                                return this.emitBl(v, ln.bin.normalizeExternalLabel(actual));
                            }
                            numArgs.push(v);
                            v = enc.encode(v);
                            if (v == null)
                                return emitErr("argument out of range or mis-aligned", actual);
                            pxt.assert((r & v) == 0);
                            r |= v;
                        }
                        else if (formal == actual) {
                        }
                        else {
                            return emitErr("expecting " + formal, actual);
                        }
                    }
                    if (tokens[j])
                        return emitErr("trailing tokens", tokens[j]);
                    return {
                        stack: stack,
                        opcode: r,
                        numArgs: numArgs,
                        labelName: ln.bin.normalizeExternalLabel(labelName)
                    };
                };
                Instruction.prototype.emitBl = function (v, actual) {
                    if (v % 2)
                        return emitErr("uneven BL?", actual);
                    var off = v / 2;
                    pxt.assert(off != null);
                    if ((off | 0) != off ||
                        // we can actually support more but the board has 256k (128k instructions)
                        !(-128 * 1024 <= off && off <= 128 * 1024))
                        return emitErr("jump out of range", actual);
                    // note that off is already in instructions, not bytes
                    var imm11 = off & 0x7ff;
                    var imm10 = (off >> 11) & 0x3ff;
                    return {
                        opcode: (off & 0xf0000000) ? (0xf400 | imm10) : (0xf000 | imm10),
                        opcode2: (0xf800 | imm11),
                        stack: 0,
                        numArgs: [v],
                        labelName: actual
                    };
                };
                Instruction.prototype.toString = function () {
                    return this.friendlyFmt;
                };
                return Instruction;
            }());
            var Line = (function () {
                function Line(bin, text) {
                    this.bin = bin;
                    this.text = text;
                }
                Line.prototype.getOpExt = function () {
                    return this.instruction ? this.instruction.code : "";
                };
                Line.prototype.getOp = function () {
                    return this.instruction ? this.instruction.name : "";
                };
                Line.prototype.singleReg = function () {
                    pxt.assert(this.getOp() == "push" || this.getOp() == "pop");
                    var k = 0;
                    var ret = -1;
                    var v = this.numArgs[0];
                    while (v > 0) {
                        if (v & 1) {
                            if (ret == -1)
                                ret = k;
                            else
                                ret = -2;
                        }
                        v >>= 1;
                        k++;
                    }
                    if (ret >= 0)
                        return ret;
                    else
                        return -1;
                };
                // if true then instruction doesn't write r<n> and doesn't read/write memory
                Line.prototype.preservesReg = function (n) {
                    if (this.getOpExt() == "movs $r5, $i0" && this.numArgs[0] != n)
                        return true;
                    return false;
                };
                Line.prototype.clobbersReg = function (n) {
                    // TODO add some more
                    if (this.getOp() == "pop" && this.numArgs[0] & (1 << n))
                        return true;
                    return false;
                };
                Line.prototype.update = function (s) {
                    this.bin.peepOps++;
                    s = s.replace(/^\s*/, "");
                    if (!s)
                        this.bin.peepDel++;
                    if (s)
                        s += "      ";
                    s = "    " + s;
                    this.text = s + "; WAS: " + this.text.trim();
                    this.instruction = null;
                    this.numArgs = null;
                    this.words = tokenize(s) || [];
                    if (this.words.length == 0)
                        this.type = "empty";
                };
                return Line;
            }());
            var File = (function () {
                function File() {
                    this.baseOffset = 0;
                    this.checkStack = true;
                    this.inlineMode = false;
                    this.normalizeExternalLabel = function (n) { return n; };
                    this.currLineNo = 0;
                    this.scope = "";
                    this.errors = [];
                    this.labels = {};
                    this.stackpointers = {};
                    this.stack = 0;
                    this.peepOps = 0;
                    this.peepDel = 0;
                    this.stats = "";
                    this.throwOnError = false;
                    this.disablePeepHole = false;
                    this.currLine = new Line(this, "<start>");
                    this.currLine.lineNo = 0;
                }
                File.prototype.emitShort = function (op) {
                    pxt.assert(0 <= op && op <= 0xffff);
                    this.buf.push(op);
                };
                File.prototype.location = function () {
                    return this.buf.length * 2;
                };
                File.prototype.parseOneInt = function (s) {
                    if (!s)
                        return null;
                    if (s == "0")
                        return 0;
                    var mul = 1;
                    if (s.indexOf("*") >= 0) {
                        var m_1 = null;
                        while (m_1 = /^([^\*]*)\*(.*)$/.exec(s)) {
                            var tmp = this.parseOneInt(m_1[1]);
                            if (tmp == null)
                                return null;
                            mul *= tmp;
                            s = m_1[2];
                        }
                    }
                    if (s[0] == "-") {
                        mul *= -1;
                        s = s.slice(1);
                    }
                    var v = null;
                    if (pxt.U.endsWith(s, "|1")) {
                        return this.parseOneInt(s.slice(0, s.length - 2)) | 1;
                    }
                    if (s[0] == "0") {
                        if (s[1] == "x" || s[1] == "X") {
                            var m_2 = /^0x([a-f0-9]+)$/i.exec(s);
                            if (m_2)
                                v = parseInt(m_2[1], 16);
                        }
                        else if (s[1] == "b" || s[1] == "B") {
                            var m_3 = /^0b([01]+)$/i.exec(s);
                            if (m_3)
                                v = parseInt(m_3[1], 2);
                        }
                    }
                    var m = /^(\d+)$/i.exec(s);
                    if (m)
                        v = parseInt(m[1], 10);
                    if (s.indexOf("@") >= 0) {
                        m = /^(\w+)@(-?\d+)$/.exec(s);
                        if (m) {
                            if (mul != 1)
                                this.directiveError(lf("multiplication not supported with saved stacks"));
                            if (this.stackpointers.hasOwnProperty(m[1]))
                                v = 4 * (this.stack - this.stackpointers[m[1]] + parseInt(m[2]));
                            else
                                this.directiveError(lf("saved stack not found"));
                        }
                        m = /^(.*)@(hi|lo)$/.exec(s);
                        if (m && this.looksLikeLabel(m[1])) {
                            v = this.lookupLabel(m[1], true);
                            if (v != null) {
                                v >>= 1;
                                if (0 <= v && v <= 0xffff) {
                                    if (m[2] == "hi")
                                        v = (v >> 8) & 0xff;
                                    else if (m[2] == "lo")
                                        v = v & 0xff;
                                    else
                                        pxt.oops();
                                }
                                else {
                                    this.directiveError(lf("@hi/lo out of range"));
                                    v = null;
                                }
                            }
                        }
                    }
                    if (v == null && this.looksLikeLabel(s)) {
                        v = this.lookupLabel(s, true);
                        if (v != null)
                            v += this.baseOffset;
                    }
                    if (v == null || isNaN(v))
                        return null;
                    return v * mul;
                };
                File.prototype.looksLikeLabel = function (name) {
                    if (/^(r\d|pc|sp|lr)$/i.test(name))
                        return false;
                    return /^[\.a-zA-Z_][\.:\w+]*$/.test(name);
                };
                File.prototype.scopedName = function (name) {
                    if (name[0] == "." && this.scope)
                        return this.scope + "$" + name;
                    else
                        return name;
                };
                File.prototype.lookupLabel = function (name, direct) {
                    if (direct === void 0) { direct = false; }
                    var v = null;
                    var scoped = this.scopedName(name);
                    if (this.labels.hasOwnProperty(scoped))
                        v = this.labels[scoped];
                    else if (this.lookupExternalLabel) {
                        v = this.lookupExternalLabel(name);
                        if (v != null)
                            v -= this.baseOffset;
                    }
                    if (v == null && direct) {
                        if (this.finalEmit)
                            this.directiveError(lf("unknown label: {0}", name));
                        else
                            v = 42;
                    }
                    return v;
                };
                File.prototype.getRelativeLabel = function (s, wordAligned) {
                    if (wordAligned === void 0) { wordAligned = false; }
                    var l = this.lookupLabel(s);
                    if (l == null)
                        return null;
                    var pc = this.location() + 4;
                    if (wordAligned)
                        pc = pc & 0xfffffffc;
                    return l - pc;
                };
                File.prototype.align = function (n) {
                    pxt.assert(n == 2 || n == 4 || n == 8 || n == 16);
                    while (this.location() % n != 0)
                        this.emitShort(0);
                };
                File.prototype.pushError = function (msg, hints) {
                    if (hints === void 0) { hints = ""; }
                    var err = {
                        scope: this.scope,
                        message: lf("  -> Line {2} ('{1}'), error: {0}\n{3}", msg, this.currLine.text, this.currLine.lineNo, hints),
                        lineNo: this.currLine.lineNo,
                        line: this.currLine.text,
                        coremsg: msg,
                        hints: hints
                    };
                    this.errors.push(err);
                    if (this.throwOnError)
                        throw new Error(err.message);
                };
                File.prototype.directiveError = function (msg) {
                    this.pushError(msg);
                    // this.pushError(lf("directive error: {0}", msg))
                };
                File.prototype.emitString = function (l) {
                    function byteAt(s, i) { return (s.charCodeAt(i) || 0) & 0xff; }
                    var m = /^\s*([\w\.]+\s*:\s*)?.\w+\s+(".*")\s*$/.exec(l);
                    var s;
                    if (!m || null == (s = parseString(m[2]))) {
                        this.directiveError(lf("expecting string"));
                    }
                    else {
                        this.align(2);
                        // s.length + 1 to NUL terminate
                        for (var i = 0; i < s.length + 1; i += 2) {
                            this.emitShort((byteAt(s, i + 1) << 8) | byteAt(s, i));
                        }
                    }
                };
                File.prototype.parseNumber = function (words) {
                    var v = this.parseOneInt(words.shift());
                    if (v == null)
                        return null;
                    return v;
                };
                File.prototype.parseNumbers = function (words) {
                    words = words.slice(1);
                    var nums = [];
                    while (true) {
                        var n = this.parseNumber(words);
                        if (n == null) {
                            this.directiveError(lf("cannot parse number at '{0}'", words[0]));
                            break;
                        }
                        else
                            nums.push(n);
                        if (words[0] == ",") {
                            words.shift();
                            if (words[0] == null)
                                break;
                        }
                        else if (words[0] == null) {
                            break;
                        }
                        else {
                            this.directiveError(lf("expecting number, got '{0}'", words[0]));
                            break;
                        }
                    }
                    return nums;
                };
                File.prototype.emitSpace = function (words) {
                    var nums = this.parseNumbers(words);
                    if (nums.length == 1)
                        nums.push(0);
                    if (nums.length != 2)
                        this.directiveError(lf("expecting one or two numbers"));
                    else if (nums[0] % 2 != 0)
                        this.directiveError(lf("only even space supported"));
                    else {
                        var f = nums[1] & 0xff;
                        f = f | (f << 8);
                        for (var i = 0; i < nums[0]; i += 2)
                            this.emitShort(f);
                    }
                };
                File.prototype.emitBytes = function (words) {
                    var nums = this.parseNumbers(words);
                    if (nums.length % 2 != 0) {
                        this.directiveError(".bytes needs an even number of arguments");
                        nums.push(0);
                    }
                    for (var i = 0; i < nums.length; i += 2) {
                        var n0 = nums[i];
                        var n1 = nums[i + 1];
                        if (0 <= n0 && n1 <= 0xff &&
                            0 <= n1 && n0 <= 0xff)
                            this.emitShort((n0 & 0xff) | ((n1 & 0xff) << 8));
                        else
                            this.directiveError(lf("expecting uint8"));
                    }
                };
                File.prototype.emitHex = function (words) {
                    var _this = this;
                    words.slice(1).forEach(function (w) {
                        if (w == ",")
                            return;
                        if (w.length % 4 != 0)
                            _this.directiveError(".hex needs an even number of bytes");
                        else if (!/^[a-f0-9]+$/i.test(w))
                            _this.directiveError(".hex needs a hex number");
                        else
                            for (var i = 0; i < w.length; i += 4) {
                                var n = parseInt(w.slice(i, i + 4), 16);
                                n = ((n & 0xff) << 8) | ((n >> 8) & 0xff);
                                _this.emitShort(n);
                            }
                    });
                };
                File.prototype.handleDirective = function (l) {
                    var _this = this;
                    var words = l.words;
                    var expectOne = function () {
                        if (words.length != 2)
                            _this.directiveError(lf("expecting one argument"));
                    };
                    var num0;
                    switch (words[0]) {
                        case ".ascii":
                        case ".asciz":
                        case ".string":
                            this.emitString(l.text);
                            break;
                        case ".align":
                            expectOne();
                            num0 = this.parseOneInt(words[1]);
                            if (num0 != null) {
                                if (num0 == 0)
                                    return;
                                if (num0 <= 4) {
                                    this.align(1 << num0);
                                }
                                else {
                                    this.directiveError(lf("expecting 1, 2, 3 or 4 (for 2, 4, 8, or 16 byte alignment)"));
                                }
                            }
                            else
                                this.directiveError(lf("expecting number"));
                            break;
                        case ".balign":
                            expectOne();
                            num0 = this.parseOneInt(words[1]);
                            if (num0 != null) {
                                if (num0 == 1)
                                    return;
                                if (num0 == 2 || num0 == 4 || num0 == 8 || num0 == 16) {
                                    this.align(num0);
                                }
                                else {
                                    this.directiveError(lf("expecting 2, 4, 8, or 16"));
                                }
                            }
                            else
                                this.directiveError(lf("expecting number"));
                            break;
                        case ".byte":
                            this.emitBytes(words);
                            break;
                        case ".hex":
                            this.emitHex(words);
                            break;
                        case ".hword":
                        case ".short":
                        case ".2bytes":
                            this.parseNumbers(words).forEach(function (n) {
                                // we allow negative numbers
                                if (-0x8000 <= n && n <= 0xffff)
                                    _this.emitShort(n & 0xffff);
                                else
                                    _this.directiveError(lf("expecting int16"));
                            });
                            break;
                        case ".word":
                        case ".4bytes":
                            this.parseNumbers(words).forEach(function (n) {
                                // we allow negative numbers
                                if (-0x80000000 <= n && n <= 0xffffffff) {
                                    _this.emitShort(n & 0xffff);
                                    _this.emitShort((n >> 16) & 0xffff);
                                }
                                else {
                                    _this.directiveError(lf("expecting int32"));
                                }
                            });
                            break;
                        case ".skip":
                        case ".space":
                            this.emitSpace(words);
                            break;
                        case ".startaddr":
                            if (this.location())
                                this.directiveError(lf(".startaddr can be only be specified at the beginning of the file"));
                            expectOne();
                            this.baseOffset = this.parseOneInt(words[1]);
                            break;
                        // The usage for this is as follows:
                        // push {...}
                        // @stackmark locals   ; locals := sp
                        // ... some push/pops ...
                        // ldr r0, [pc, locals@3] ; load local number 3
                        // ... some push/pops ...
                        // @stackempty locals ; expect an empty stack here
                        case "@stackmark":
                            expectOne();
                            this.stackpointers[words[1]] = this.stack;
                            break;
                        case "@stackempty":
                            if (this.stackpointers[words[1]] == null)
                                this.directiveError(lf("no such saved stack"));
                            else if (this.stackpointers[words[1]] != this.stack)
                                this.directiveError(lf("stack mismatch"));
                            break;
                        case "@scope":
                            this.scope = words[1] || "";
                            this.currLineNo = this.scope ? 0 : this.realCurrLineNo;
                            break;
                        case "@nostackcheck":
                            this.checkStack = false;
                            break;
                        case ".section":
                        case ".global":
                            this.stackpointers = {};
                            this.stack = 0;
                            break;
                        case ".file":
                        case ".text":
                        case ".cpu":
                        case ".fpu":
                        case ".eabi_attribute":
                        case ".code":
                        case ".thumb_func":
                        case ".type":
                            break;
                        case "@":
                            // @ sp needed
                            break;
                        default:
                            if (/^\.cfi_/.test(words[0])) {
                            }
                            else {
                                this.directiveError(lf("unknown directive"));
                            }
                            break;
                    }
                };
                File.prototype.handleOneInstruction = function (ln, instr) {
                    var op = instr.emit(ln);
                    if (!op.error) {
                        this.stack += op.stack;
                        if (this.checkStack && this.stack < 0)
                            this.pushError(lf("stack underflow"));
                        this.emitShort(op.opcode);
                        if (op.opcode2 != null)
                            this.emitShort(op.opcode2);
                        ln.instruction = instr;
                        ln.numArgs = op.numArgs;
                        return true;
                    }
                    return false;
                };
                File.prototype.handleInstruction = function (ln) {
                    if (ln.instruction) {
                        if (this.handleOneInstruction(ln, ln.instruction))
                            return;
                    }
                    var getIns = function (n) { return instructions.hasOwnProperty(n) ? instructions[n] : []; };
                    if (!ln.instruction) {
                        var ins = getIns(ln.words[0]);
                        for (var i = 0; i < ins.length; ++i) {
                            if (this.handleOneInstruction(ln, ins[i]))
                                return;
                        }
                    }
                    var w0 = ln.words[0].toLowerCase().replace(/s$/, "").replace(/[^a-z]/g, "");
                    var hints = "";
                    var possibilities = getIns(w0).concat(getIns(w0 + "s"));
                    if (possibilities.length > 0) {
                        possibilities.forEach(function (i) {
                            var err = i.emit(ln);
                            hints += lf("   Maybe: {0} ({1} at '{2}')\n", i.toString(), err.error, err.errorAt);
                        });
                    }
                    this.pushError(lf("assembly error"), hints);
                };
                File.prototype.mkLine = function (tx) {
                    var l = new Line(this, tx);
                    l.scope = this.scope;
                    l.lineNo = this.currLineNo;
                    this.lines.push(l);
                    return l;
                };
                File.prototype.prepLines = function (text) {
                    var _this = this;
                    this.currLineNo = 0;
                    this.realCurrLineNo = 0;
                    this.lines = [];
                    text.split(/\r?\n/).forEach(function (tx) {
                        if (_this.errors.length > 10)
                            return;
                        _this.currLineNo++;
                        _this.realCurrLineNo++;
                        var l = _this.mkLine(tx);
                        var words = tokenize(l.text) || [];
                        l.words = words;
                        var w0 = words[0] || "";
                        if (w0.charAt(w0.length - 1) == ":") {
                            var m = /^([\.\w]+):$/.exec(words[0]);
                            if (m) {
                                l.type = "label";
                                l.text = m[1] + ":";
                                l.words = [m[1]];
                                if (words.length > 1) {
                                    words.shift();
                                    l = _this.mkLine(tx.replace(/^[^:]*:/, ""));
                                    l.words = words;
                                    w0 = words[0] || "";
                                }
                                else {
                                    return;
                                }
                            }
                        }
                        var c0 = w0.charAt(0);
                        if (c0 == "." || c0 == "@") {
                            l.type = "directive";
                            if (l.words[0] == "@scope")
                                _this.handleDirective(l);
                        }
                        else {
                            if (l.words.length == 0)
                                l.type = "empty";
                            else
                                l.type = "instruction";
                        }
                    });
                };
                File.prototype.iterLines = function () {
                    var _this = this;
                    this.stack = 0;
                    this.buf = [];
                    this.lines.forEach(function (l) {
                        if (_this.errors.length > 10)
                            return;
                        _this.currLine = l;
                        if (l.words.length == 0)
                            return;
                        if (l.type == "label") {
                            var lblname = _this.scopedName(l.words[0]);
                            if (_this.finalEmit) {
                                var curr = _this.labels[lblname];
                                if (curr == null)
                                    pxt.oops();
                                pxt.assert(_this.errors.length > 0 || curr == _this.location());
                            }
                            else {
                                if (_this.labels.hasOwnProperty(lblname))
                                    _this.directiveError(lf("label redefinition"));
                                else if (_this.inlineMode && /^_/.test(lblname))
                                    _this.directiveError(lf("labels starting with '_' are reserved for the compiler"));
                                else {
                                    _this.labels[lblname] = _this.location();
                                }
                            }
                        }
                        else if (l.type == "directive") {
                            _this.handleDirective(l);
                        }
                        else if (l.type == "instruction") {
                            _this.handleInstruction(l);
                        }
                        else if (l.type == "empty") {
                        }
                        else {
                            pxt.oops();
                        }
                    });
                };
                File.prototype.getSource = function (clean) {
                    var _this = this;
                    var lenTotal = this.buf ? this.buf.length * 2 : 0;
                    var lenThumb = this.labels["_program_end"] || lenTotal;
                    var res = lf("; thumb size: {0} bytes; src size {1} bytes\n", lenThumb, lenTotal - lenThumb) +
                        lf("; assembly: {0} lines\n", this.lines.length) +
                        this.stats + "\n\n";
                    var pastEnd = false;
                    this.lines.forEach(function (ln, i) {
                        if (pastEnd)
                            return;
                        if (ln.type == "label" && ln.words[0] == "_program_end")
                            pastEnd = true;
                        var text = ln.text;
                        if (clean) {
                            if (ln.words[0] == "@stackempty" &&
                                _this.lines[i - 1].text == ln.text)
                                return;
                            text = text.replace(/; WAS: .*/, "");
                            if (!text.trim())
                                return;
                        }
                        res += text + "\n";
                    });
                    return res;
                };
                File.prototype.peepHole = function () {
                    // TODO add: str X; ldr X -> str X ?
                    var lb11 = encoders["$lb11"];
                    var lb = encoders["$lb"];
                    var mylines = this.lines.filter(function (l) { return l.type != "empty"; });
                    for (var i = 0; i < mylines.length; ++i) {
                        var ln = mylines[i];
                        if (/^user/.test(ln.scope))
                            continue;
                        var lnNext = mylines[i + 1];
                        if (!lnNext)
                            continue;
                        var lnNext2 = mylines[i + 2];
                        if (ln.type == "instruction") {
                            var lnop = ln.getOp();
                            var isSkipBranch = false;
                            if (lnop == "bne" || lnop == "beq") {
                                if (lnNext.getOp() == "b" && ln.numArgs[0] == 0)
                                    isSkipBranch = true;
                                if (lnNext.getOp() == "bb" && ln.numArgs[0] == 2)
                                    isSkipBranch = true;
                            }
                            if (lnop == "bb" && lb11.encode(ln.numArgs[0]) != null) {
                                // RULE: bb .somewhere -> b .somewhere (if fits)
                                ln.update("b " + ln.words[1]);
                            }
                            else if (lnop == "b" && ln.numArgs[0] == -2) {
                                // RULE: b .somewhere; .somewhere: -> .somewhere:
                                ln.update("");
                            }
                            else if (lnop == "bne" && isSkipBranch && lb.encode(lnNext.numArgs[0]) != null) {
                                // RULE: bne .next; b .somewhere; .next: -> beq .somewhere
                                ln.update("beq " + lnNext.words[1]);
                                lnNext.update("");
                            }
                            else if (lnop == "beq" && isSkipBranch && lb.encode(lnNext.numArgs[0]) != null) {
                                // RULE: beq .next; b .somewhere; .next: -> bne .somewhere
                                ln.update("bne " + lnNext.words[1]);
                                lnNext.update("");
                            }
                            else if (lnop == "push" && lnNext.getOp() == "pop" && ln.numArgs[0] == lnNext.numArgs[0]) {
                                // RULE: push {X}; pop {X} -> nothing
                                pxt.assert(ln.numArgs[0] > 0);
                                ln.update("");
                                lnNext.update("");
                            }
                            else if (lnop == "push" && lnNext.getOp() == "pop" &&
                                ln.words.length == 4 &&
                                lnNext.words.length == 4) {
                                // RULE: push {rX}; pop {rY} -> mov rY, rX
                                pxt.assert(ln.words[1] == "{");
                                ln.update("mov " + lnNext.words[2] + ", " + ln.words[2]);
                                lnNext.update("");
                            }
                            else if (lnNext2 && ln.getOpExt() == "movs $r5, $i0" && lnNext.getOpExt() == "mov $r0, $r1" &&
                                ln.numArgs[0] == lnNext.numArgs[1] &&
                                lnNext2.clobbersReg(ln.numArgs[0])) {
                                // RULE: movs rX, #V; mov rY, rX; clobber rX -> movs rY, #V
                                ln.update("movs r" + lnNext.numArgs[0] + ", #" + ln.numArgs[1]);
                                lnNext.update("");
                            }
                            else if (lnop == "pop" && ln.singleReg() >= 0 && lnNext.getOp() == "push" &&
                                ln.singleReg() == lnNext.singleReg()) {
                                // RULE: pop {rX}; push {rX} -> ldr rX, [sp, #0]
                                ln.update("ldr r" + ln.singleReg() + ", [sp, #0]");
                                lnNext.update("");
                            }
                            else if (lnNext2 && lnop == "push" && ln.singleReg() >= 0 && lnNext.preservesReg(ln.singleReg()) &&
                                lnNext2.getOp() == "pop" && ln.singleReg() == lnNext2.singleReg()) {
                                // RULE: push {rX}; movs rY, #V; pop {rX} -> movs rY, #V (when X != Y)
                                ln.update("");
                                lnNext2.update("");
                            }
                        }
                    }
                };
                File.prototype.peepPass = function (reallyFinal) {
                    if (this.disablePeepHole)
                        return;
                    this.peepOps = 0;
                    this.peepDel = 0;
                    this.peepHole();
                    this.throwOnError = true;
                    this.finalEmit = false;
                    this.labels = {};
                    this.iterLines();
                    pxt.assert(!this.checkStack || this.stack == 0);
                    this.finalEmit = true;
                    this.reallyFinalEmit = reallyFinal || this.peepOps == 0;
                    this.iterLines();
                    this.stats += lf("; peep hole pass: {0} instructions removed and {1} updated\n", this.peepDel, this.peepOps - this.peepDel);
                };
                File.prototype.emit = function (text) {
                    init();
                    pxt.assert(this.buf == null);
                    this.prepLines(text);
                    if (this.errors.length > 0)
                        return;
                    this.labels = {};
                    this.iterLines();
                    if (this.checkStack && this.stack != 0)
                        this.directiveError(lf("stack misaligned at the end of the file"));
                    if (this.errors.length > 0)
                        return;
                    this.finalEmit = true;
                    this.reallyFinalEmit = this.disablePeepHole;
                    this.iterLines();
                    if (this.errors.length > 0)
                        return;
                    var maxPasses = 5;
                    for (var i = 0; i < maxPasses; ++i) {
                        this.peepPass(i == maxPasses);
                        if (this.peepOps == 0)
                            break;
                    }
                };
                return File;
            }());
            thumb.File = File;
            function registerNo(actual) {
                if (!actual)
                    return null;
                actual = actual.toLowerCase();
                switch (actual) {
                    case "pc":
                        actual = "r15";
                        break;
                    case "lr":
                        actual = "r14";
                        break;
                    case "sp":
                        actual = "r13";
                        break;
                }
                var m = /^r(\d+)$/.exec(actual);
                if (m) {
                    var r = parseInt(m[1], 10);
                    if (0 <= r && r < 16)
                        return r;
                }
                return null;
            }
            var instructions;
            var encoders;
            function tokenize(line) {
                var words = [];
                var w = "";
                loop: for (var i = 0; i < line.length; ++i) {
                    switch (line[i]) {
                        case "[":
                        case "]":
                        case "!":
                        case "{":
                        case "}":
                        case ",":
                            if (w) {
                                words.push(w);
                                w = "";
                            }
                            words.push(line[i]);
                            break;
                        case " ":
                        case "\t":
                        case "\r":
                        case "\n":
                            if (w) {
                                words.push(w);
                                w = "";
                            }
                            break;
                        case ";":
                            if (!w)
                                break loop;
                            w += line[i];
                            break;
                        default:
                            w += line[i];
                            break;
                    }
                }
                if (w) {
                    words.push(w);
                    w = "";
                }
                if (!words[0])
                    return null;
                return words;
            }
            function init() {
                if (instructions)
                    return;
                encoders = {};
                var addEnc = function (n, p, e) {
                    var ee = {
                        name: n,
                        pretty: p,
                        encode: e,
                        isRegister: /^\$r\d/.test(n),
                        isImmediate: /^\$i\d/.test(n),
                        isRegList: /^\$rl\d/.test(n),
                        isLabel: /^\$l[a-z]/.test(n),
                    };
                    encoders[n] = ee;
                    return ee;
                };
                var inrange = function (max, v, e) {
                    if (Math.floor(v) != v)
                        return null;
                    if (v < 0)
                        return null;
                    if (v > max)
                        return null;
                    return e;
                };
                // Registers
                // $r0 - bits 2:1:0
                // $r1 - bits 5:4:3
                // $r2 - bits 7:2:1:0
                // $r3 - bits 6:5:4:3
                // $r4 - bits 8:7:6
                // $r5 - bits 10:9:8
                addEnc("$r0", "R0-7", function (v) { return inrange(7, v, v); });
                addEnc("$r1", "R0-7", function (v) { return inrange(7, v, v << 3); });
                addEnc("$r2", "R0-15", function (v) { return inrange(15, v, (v & 7) | ((v & 8) << 4)); });
                addEnc("$r3", "R0-15", function (v) { return inrange(15, v, v << 3); });
                addEnc("$r4", "R0-7", function (v) { return inrange(7, v, v << 6); });
                addEnc("$r5", "R0-7", function (v) { return inrange(7, v, v << 8); });
                // this for setting both $r0 and $r1 (two argument adds and subs)
                addEnc("$r01", "R0-7", function (v) { return inrange(7, v, (v | v << 3)); });
                // Immdiates:
                // $i0 - bits 7-0
                // $i1 - bits 7-0 * 4
                // $i2 - bits 6-0 * 4
                // $i3 - bits 8-6
                // $i4 - bits 10-6
                // $i5 - bits 10-6 * 4
                // $i6 - bits 10-6, 0 is 32
                // $i7 - bits 10-6 * 2
                addEnc("$i0", "#0-255", function (v) { return inrange(255, v, v); });
                addEnc("$i1", "#0-1020", function (v) { return inrange(255, v / 4, v >> 2); });
                addEnc("$i2", "#0-510", function (v) { return inrange(127, v / 4, v >> 2); });
                addEnc("$i3", "#0-7", function (v) { return inrange(7, v, v << 6); });
                addEnc("$i4", "#0-31", function (v) { return inrange(31, v, v << 6); });
                addEnc("$i5", "#0-124", function (v) { return inrange(31, v / 4, (v >> 2) << 6); });
                addEnc("$i6", "#1-32", function (v) { return v == 0 ? null : v == 32 ? 0 : inrange(31, v, v << 6); });
                addEnc("$i7", "#0-62", function (v) { return inrange(31, v / 2, (v >> 1) << 6); });
                addEnc("$rl0", "{R0-7,...}", function (v) { return inrange(255, v, v); });
                addEnc("$rl1", "{LR,R0-7,...}", function (v) { return (v & 0x4000) ? inrange(255, (v & ~0x4000), 0x100 | (v & 0xff)) : inrange(255, v, v); });
                addEnc("$rl2", "{PC,R0-7,...}", function (v) { return (v & 0x8000) ? inrange(255, (v & ~0x8000), 0x100 | (v & 0xff)) : inrange(255, v, v); });
                var inrangeSigned = function (max, v, e) {
                    if (Math.floor(v) != v)
                        return null;
                    if (v < -(max + 1))
                        return null;
                    if (v > max)
                        return null;
                    var mask = (max << 1) | 1;
                    return e & mask;
                };
                addEnc("$la", "LABEL", function (v) { return inrange(255, v / 4, v >> 2); }).isWordAligned = true;
                addEnc("$lb", "LABEL", function (v) { return inrangeSigned(127, v / 2, v >> 1); });
                addEnc("$lb11", "LABEL", function (v) { return inrangeSigned(1023, v / 2, v >> 1); });
                instructions = {};
                var add = function (name, code, mask, jsFormat) {
                    var ins = new Instruction(name, code, mask, jsFormat);
                    if (!instructions.hasOwnProperty(ins.name))
                        instructions[ins.name] = [];
                    instructions[ins.name].push(ins);
                };
                //add("nop",                   0xbf00, 0xffff);  // we use mov r8,r8 as gcc
                add("adcs  $r0, $r1", 0x4140, 0xffc0);
                add("add   $r2, $r3", 0x4400, 0xff00, "$r2 += $r3");
                add("add   $r5, pc, $i1", 0xa000, 0xf800);
                add("add   $r5, sp, $i1", 0xa800, 0xf800);
                add("add   sp, $i2", 0xb000, 0xff80);
                add("adds  $r0, $r1, $i3", 0x1c00, 0xfe00);
                add("adds  $r0, $r1, $r4", 0x1800, 0xfe00);
                add("adds  $r01, $r4", 0x1800, 0xfe00);
                add("adds  $r5, $i0", 0x3000, 0xf800, "$r5 += $i0");
                add("adr   $r5, $la", 0xa000, 0xf800);
                add("ands  $r0, $r1", 0x4000, 0xffc0);
                add("asrs  $r0, $r1", 0x4100, 0xffc0);
                add("asrs  $r0, $r1, $i6", 0x1000, 0xf800);
                add("bics  $r0, $r1", 0x4380, 0xffc0);
                add("bkpt  $i0", 0xbe00, 0xff00);
                add("blx   $r3", 0x4780, 0xff87);
                add("bx    $r3", 0x4700, 0xff80);
                add("cmn   $r0, $r1", 0x42c0, 0xffc0);
                add("cmp   $r0, $r1", 0x4280, 0xffc0);
                add("cmp   $r2, $r3", 0x4500, 0xff00);
                add("cmp   $r5, $i0", 0x2800, 0xf800);
                add("eors  $r0, $r1", 0x4040, 0xffc0);
                add("ldmia $r5!, $rl0", 0xc800, 0xf800);
                add("ldmia $r5, $rl0", 0xc800, 0xf800);
                add("ldr   $r0, [$r1, $i5]", 0x6800, 0xf800);
                add("ldr   $r0, [$r1, $r4]", 0x5800, 0xfe00);
                add("ldr   $r5, [pc, $i1]", 0x4800, 0xf800);
                add("ldr   $r5, $la", 0x4800, 0xf800);
                add("ldr   $r5, [sp, $i1]", 0x9800, 0xf800);
                add("ldrb  $r0, [$r1, $i4]", 0x7800, 0xf800);
                add("ldrb  $r0, [$r1, $r4]", 0x5c00, 0xfe00);
                add("ldrh  $r0, [$r1, $i7]", 0x8800, 0xf800);
                add("ldrh  $r0, [$r1, $r4]", 0x5a00, 0xfe00);
                add("ldrsb $r0, [$r1, $r4]", 0x5600, 0xfe00);
                add("ldrsh $r0, [$r1, $r4]", 0x5e00, 0xfe00);
                add("lsls  $r0, $r1", 0x4080, 0xffc0, "$r0 = $r0 << $r1");
                add("lsls  $r0, $r1, $i4", 0x0000, 0xf800, "$r0 = $r1 << $i4");
                add("lsrs  $r0, $r1", 0x40c0, 0xffc0);
                add("lsrs  $r0, $r1, $i6", 0x0800, 0xf800);
                add("mov   $r0, $r1", 0x4600, 0xffc0, "$r0 = $r1");
                //add("mov   $r2, $r3",        0x4600, 0xff00);
                add("movs  $r0, $r1", 0x0000, 0xffc0, "$r0 = $r1");
                add("movs  $r5, $i0", 0x2000, 0xf800, "$r5 = $i0");
                add("muls  $r0, $r1", 0x4340, 0xffc0);
                add("mvns  $r0, $r1", 0x43c0, 0xffc0);
                add("negs  $r0, $r1", 0x4240, 0xffc0, "$r0 = -$r1");
                add("nop", 0x46c0, 0xffff); // mov r8, r8
                add("orrs  $r0, $r1", 0x4300, 0xffc0);
                add("pop   $rl2", 0xbc00, 0xfe00);
                add("push  $rl1", 0xb400, 0xfe00);
                add("rev   $r0, $r1", 0xba00, 0xffc0);
                add("rev16 $r0, $r1", 0xba40, 0xffc0);
                add("revsh $r0, $r1", 0xbac0, 0xffc0);
                add("rors  $r0, $r1", 0x41c0, 0xffc0);
                add("sbcs  $r0, $r1", 0x4180, 0xffc0);
                add("sev", 0xbf40, 0xffff);
                add("stmia $r5!, $rl0", 0xc000, 0xf800);
                add("str   $r0, [$r1, $i5]", 0x6000, 0xf800);
                add("str   $r0, [$r1, $r4]", 0x5000, 0xfe00);
                add("str   $r5, [sp, $i1]", 0x9000, 0xf800);
                add("strb  $r0, [$r1, $i4]", 0x7000, 0xf800);
                add("strb  $r0, [$r1, $r4]", 0x5400, 0xfe00);
                add("strh  $r0, [$r1, $i7]", 0x8000, 0xf800);
                add("strh  $r0, [$r1, $r4]", 0x5200, 0xfe00);
                add("sub   sp, $i2", 0xb080, 0xff80);
                add("subs  $r0, $r1, $i3", 0x1e00, 0xfe00);
                add("subs  $r0, $r1, $r4", 0x1a00, 0xfe00);
                add("subs  $r01, $r4", 0x1a00, 0xfe00);
                add("subs  $r5, $i0", 0x3800, 0xf800);
                add("svc   $i0", 0xdf00, 0xff00);
                add("sxtb  $r0, $r1", 0xb240, 0xffc0);
                add("sxth  $r0, $r1", 0xb200, 0xffc0);
                add("tst   $r0, $r1", 0x4200, 0xffc0);
                add("udf   $i0", 0xde00, 0xff00);
                add("uxtb  $r0, $r1", 0xb2c0, 0xffc0);
                add("uxth  $r0, $r1", 0xb280, 0xffc0);
                add("wfe", 0xbf20, 0xffff);
                add("wfi", 0xbf30, 0xffff);
                add("yield", 0xbf10, 0xffff);
                add("cpsid i", 0xb672, 0xffff);
                add("cpsie i", 0xb662, 0xffff);
                add("beq   $lb", 0xd000, 0xff00);
                add("bne   $lb", 0xd100, 0xff00);
                add("bcs   $lb", 0xd200, 0xff00);
                add("bcc   $lb", 0xd300, 0xff00);
                add("bmi   $lb", 0xd400, 0xff00);
                add("bpl   $lb", 0xd500, 0xff00);
                add("bvs   $lb", 0xd600, 0xff00);
                add("bvc   $lb", 0xd700, 0xff00);
                add("bhi   $lb", 0xd800, 0xff00);
                add("bls   $lb", 0xd900, 0xff00);
                add("bge   $lb", 0xda00, 0xff00);
                add("blt   $lb", 0xdb00, 0xff00);
                add("bgt   $lb", 0xdc00, 0xff00);
                add("ble   $lb", 0xdd00, 0xff00);
                add("bhs   $lb", 0xd200, 0xff00); // cs
                add("blo   $lb", 0xd300, 0xff00); // cc
                add("b     $lb11", 0xe000, 0xf800, "B");
                add("bal   $lb11", 0xe000, 0xf800, "B");
                // handled specially - 32 bit instruction
                add("bl    $lb", 0xf000, 0xf800, "BL");
                // this is normally emitted as 'b' but will be emitted as 'bl' if needed
                add("bb    $lb", 0xe000, 0xf800, "B");
            }
            function parseString(s) {
                s = s.replace(/\/\//g, "\\B") // don't get confused by double backslash
                    .replace(/\\(['\?])/g, function (f, q) { return q; }) // these are not valid in JSON yet valid in C
                    .replace(/\\[z0]/g, "\u0000") // \0 is valid in C 
                    .replace(/\\x([0-9a-f][0-9a-f])/gi, function (f, h) { return "\\u00" + h; })
                    .replace(/\\B/g, "\\\\"); // undo anti-confusion above
                try {
                    return JSON.parse(s);
                }
                catch (e) {
                    return null;
                }
            }
            function emitErr(msg, tok) {
                return {
                    stack: null,
                    opcode: null,
                    error: msg,
                    errorAt: tok
                };
            }
            function testOne(op, code) {
                var b = new File();
                b.checkStack = false;
                b.emit(op);
                pxt.assert(b.buf[0] == code);
            }
            function expectError(asm) {
                var b = new File();
                b.emit(asm);
                if (b.errors.length == 0) {
                    pxt.oops("ASMTEST: expecting error for: " + asm);
                }
                // console.log(b.errors[0].message)
            }
            function tohex(n) {
                if (n < 0 || n > 0xffff)
                    return ("0x" + n.toString(16)).toLowerCase();
                else
                    return ("0x" + ("000" + n.toString(16)).slice(-4)).toLowerCase();
            }
            thumb.tohex = tohex;
            function expect(disasm) {
                var exp = [];
                var asm = disasm.replace(/^([0-9a-fA-F]{4})\s/gm, function (w, n) {
                    exp.push(parseInt(n, 16));
                    return "";
                });
                var b = new File();
                b.throwOnError = true;
                b.disablePeepHole = true;
                b.emit(asm);
                if (b.errors.length > 0) {
                    console.log(b.errors[0].message);
                    pxt.oops("ASMTEST: not expecting errors");
                }
                if (b.buf.length != exp.length)
                    pxt.oops("ASMTEST: wrong buf len");
                for (var i = 0; i < exp.length; ++i) {
                    if (b.buf[i] != exp[i])
                        pxt.oops("ASMTEST: wrong buf content, exp:" + tohex(exp[i]) + ", got: " + tohex(b.buf[i]));
                }
            }
            function test() {
                expectError("lsl r0, r0, #8");
                expectError("push {pc,lr}");
                expectError("push {r17}");
                expectError("mov r0, r1 foo");
                expectError("movs r14, #100");
                expectError("push {r0");
                expectError("push lr,r0}");
                expectError("pop {lr,r0}");
                expectError("b #+11");
                expectError("b #+102400");
                expectError("bne undefined_label");
                expectError(".foobar");
                expect("0200      lsls    r0, r0, #8\n" +
                    "b500      push    {lr}\n" +
                    "2064      movs    r0, #100        ; 0x64\n" +
                    "b401      push    {r0}\n" +
                    "bc08      pop     {r3}\n" +
                    "b501      push    {r0, lr}\n" +
                    "bd20      pop {r5, pc}\n" +
                    "bc01      pop {r0}\n" +
                    "4770      bx      lr\n" +
                    "0000      .balign 4\n" +
                    "e6c0      .word   -72000\n" +
                    "fffe\n");
                expect("4291      cmp     r1, r2\n" +
                    "d100      bne     l6\n" +
                    "e000      b       l8\n" +
                    "1840  l6: adds    r0, r0, r1\n" +
                    "4718  l8: bx      r3\n");
                expect("          @stackmark base\n" +
                    "b403      push    {r0, r1}\n" +
                    "          @stackmark locals\n" +
                    "9801      ldr     r0, [sp, locals@1]\n" +
                    "b401      push    {r0}\n" +
                    "9802      ldr     r0, [sp, locals@1]\n" +
                    "bc01      pop     {r0}\n" +
                    "          @stackempty locals\n" +
                    "9901      ldr     r1, [sp, locals@1]\n" +
                    "9102      str     r1, [sp, base@0]\n" +
                    "          @stackempty locals\n" +
                    "b002      add     sp, #8\n" +
                    "          @stackempty base\n");
                expect("b090      sub sp, #4*16\n" +
                    "b010      add sp, #4*16\n");
                expect("6261      .string \"abc\"\n" +
                    "0063      \n");
                expect("6261      .string \"abcde\"\n" +
                    "6463      \n" +
                    "0065      \n");
                expect("3042      adds r0, 0x42\n" +
                    "1c0d      adds r5, r1, #0\n" +
                    "d100      bne #0\n" +
                    "2800      cmp r0, #0\n" +
                    "6b28      ldr r0, [r5, #48]\n" +
                    "0200      lsls r0, r0, #8\n" +
                    "2063      movs r0, 0x63\n" +
                    "4240      negs r0, r0\n" +
                    "46c0      nop\n" +
                    "b500      push {lr}\n" +
                    "b401      push {r0}\n" +
                    "b402      push {r1}\n" +
                    "b404      push {r2}\n" +
                    "b408      push {r3}\n" +
                    "b520      push {r5, lr}\n" +
                    "bd00      pop {pc}\n" +
                    "bc01      pop {r0}\n" +
                    "bc02      pop {r1}\n" +
                    "bc04      pop {r2}\n" +
                    "bc08      pop {r3}\n" +
                    "bd20      pop {r5, pc}\n" +
                    "9003      str r0, [sp, #4*3]\n");
            }
            thumb.test = test;
        })(thumb = pxt.thumb || (pxt.thumb = {}));
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        var ir;
        (function (ir) {
            var U = ts.pxt.Util;
            var assert = U.assert;
            (function (EK) {
                EK[EK["None"] = 0] = "None";
                EK[EK["NumberLiteral"] = 1] = "NumberLiteral";
                EK[EK["PointerLiteral"] = 2] = "PointerLiteral";
                EK[EK["RuntimeCall"] = 3] = "RuntimeCall";
                EK[EK["ProcCall"] = 4] = "ProcCall";
                EK[EK["SharedRef"] = 5] = "SharedRef";
                EK[EK["SharedDef"] = 6] = "SharedDef";
                EK[EK["FieldAccess"] = 7] = "FieldAccess";
                EK[EK["Store"] = 8] = "Store";
                EK[EK["CellRef"] = 9] = "CellRef";
                EK[EK["Incr"] = 10] = "Incr";
                EK[EK["Decr"] = 11] = "Decr";
                EK[EK["Sequence"] = 12] = "Sequence";
                EK[EK["JmpValue"] = 13] = "JmpValue";
            })(ir.EK || (ir.EK = {}));
            var EK = ir.EK;
            (function (CallingConvention) {
                CallingConvention[CallingConvention["Plain"] = 0] = "Plain";
                CallingConvention[CallingConvention["Async"] = 1] = "Async";
                CallingConvention[CallingConvention["Promise"] = 2] = "Promise";
            })(ir.CallingConvention || (ir.CallingConvention = {}));
            var CallingConvention = ir.CallingConvention;
            var Node = (function () {
                function Node() {
                }
                Node.prototype.isExpr = function () { return false; };
                Node.prototype.isStmt = function () { return false; };
                return Node;
            }());
            ir.Node = Node;
            var Expr = (function (_super) {
                __extends(Expr, _super);
                function Expr(exprKind, args, data) {
                    _super.call(this);
                    this.exprKind = exprKind;
                    this.args = args;
                    this.data = data;
                    this.callingConvention = CallingConvention.Plain;
                }
                Expr.clone = function (e) {
                    var copy = new Expr(e.exprKind, e.args.slice(0), e.data);
                    if (e.jsInfo)
                        copy.jsInfo = e.jsInfo;
                    if (e.totalUses) {
                        copy.totalUses = e.totalUses;
                        copy.currUses = e.currUses;
                    }
                    copy.callingConvention = e.callingConvention;
                    return copy;
                };
                Expr.prototype.isExpr = function () { return true; };
                Expr.prototype.isPure = function () {
                    return this.isStateless() || this.exprKind == EK.CellRef;
                };
                Expr.prototype.isStateless = function () {
                    switch (this.exprKind) {
                        case EK.NumberLiteral:
                        case EK.PointerLiteral:
                        case EK.SharedRef:
                            return true;
                        default: return false;
                    }
                };
                Expr.prototype.sharingInfo = function () {
                    var arg0 = this;
                    if (this.exprKind == EK.SharedRef || this.exprKind == EK.SharedDef) {
                        arg0 = this.args[0];
                        if (!arg0)
                            arg0 = { currUses: "", totalUses: "" };
                    }
                    return arg0.currUses + "/" + arg0.totalUses;
                };
                Expr.prototype.toString = function () {
                    switch (this.exprKind) {
                        case EK.NumberLiteral:
                            return this.data + "";
                        case EK.PointerLiteral:
                            return this.data + "";
                        case EK.CellRef:
                            return this.data.toString();
                        case EK.JmpValue:
                            return "JMPVALUE";
                        case EK.SharedRef:
                            return "SHARED_REF(" + this.args[0].toString() + ")";
                        case EK.SharedDef:
                            return "SHARED_DEF(" + this.args[0].toString() + ")";
                        case EK.Incr:
                            return "INCR(" + this.args[0].toString() + ")";
                        case EK.Decr:
                            return "DECR(" + this.args[0].toString() + ")";
                        case EK.FieldAccess:
                            return this.args[0].toString() + "." + this.data.name;
                        case EK.RuntimeCall:
                            return this.data + "(" + this.args.map(function (a) { return a.toString(); }).join(", ") + ")";
                        case EK.ProcCall:
                            return pxt.getDeclName(this.data) + "(" + this.args.map(function (a) { return a.toString(); }).join(", ") + ")";
                        case EK.Sequence:
                            return "(" + this.args.map(function (a) { return a.toString(); }).join("; ") + ")";
                        case EK.Store:
                            return "{ " + this.args[0].toString() + " := " + this.args[1].toString() + " }";
                        default: throw pxt.oops();
                    }
                };
                Expr.prototype.canUpdateCells = function () {
                    switch (this.exprKind) {
                        case EK.NumberLiteral:
                        case EK.PointerLiteral:
                        case EK.CellRef:
                        case EK.JmpValue:
                        case EK.SharedRef:
                            return false;
                        case EK.SharedDef:
                        case EK.Incr:
                        case EK.Decr:
                        case EK.FieldAccess:
                            return this.args[0].canUpdateCells();
                        case EK.RuntimeCall:
                        case EK.ProcCall:
                        case EK.Sequence:
                            return true;
                        case EK.Store:
                            return true;
                        default: throw pxt.oops();
                    }
                };
                return Expr;
            }(Node));
            ir.Expr = Expr;
            (function (SK) {
                SK[SK["None"] = 0] = "None";
                SK[SK["Expr"] = 1] = "Expr";
                SK[SK["Label"] = 2] = "Label";
                SK[SK["Jmp"] = 3] = "Jmp";
                SK[SK["StackEmpty"] = 4] = "StackEmpty";
                SK[SK["Breakpoint"] = 5] = "Breakpoint";
            })(ir.SK || (ir.SK = {}));
            var SK = ir.SK;
            (function (JmpMode) {
                JmpMode[JmpMode["Always"] = 1] = "Always";
                JmpMode[JmpMode["IfZero"] = 2] = "IfZero";
                JmpMode[JmpMode["IfNotZero"] = 3] = "IfNotZero";
                JmpMode[JmpMode["IfJmpValEq"] = 4] = "IfJmpValEq";
            })(ir.JmpMode || (ir.JmpMode = {}));
            var JmpMode = ir.JmpMode;
            var Stmt = (function (_super) {
                __extends(Stmt, _super);
                function Stmt(stmtKind, expr) {
                    _super.call(this);
                    this.stmtKind = stmtKind;
                    this.expr = expr;
                }
                Stmt.prototype.isStmt = function () { return true; };
                Stmt.prototype.toString = function () {
                    var inner = this.expr ? this.expr.toString() : "{null}";
                    switch (this.stmtKind) {
                        case ir.SK.Expr:
                            return "    " + inner + "\n";
                        case ir.SK.Jmp:
                            var fin = "goto " + this.lblName + "\n";
                            switch (this.jmpMode) {
                                case JmpMode.Always:
                                    if (this.expr)
                                        return "    { JMPVALUE := " + inner + " } " + fin;
                                    else
                                        return "    " + fin;
                                case JmpMode.IfZero:
                                    return "    if (! " + inner + ") " + fin;
                                case JmpMode.IfNotZero:
                                    return "    if (" + inner + ") " + fin;
                                case JmpMode.IfJmpValEq:
                                    return "    if (r0 == " + inner + ") " + fin;
                                default: throw pxt.oops();
                            }
                        case ir.SK.StackEmpty:
                            return "    ;\n";
                        case ir.SK.Breakpoint:
                            return "    // brk " + (this.breakpointInfo.id) + "\n";
                        case ir.SK.Label:
                            return this.lblName + ":\n";
                        default: throw pxt.oops();
                    }
                };
                return Stmt;
            }(Node));
            ir.Stmt = Stmt;
            var Cell = (function () {
                function Cell(index, def, info) {
                    this.index = index;
                    this.def = def;
                    this.info = info;
                    this.isarg = false;
                    this.iscap = false;
                    this._isRef = false;
                    this._isLocal = false;
                    this._isGlobal = false;
                    pxt.setCellProps(this);
                }
                Cell.prototype.toString = function () {
                    var n = "";
                    if (this.def)
                        n += this.def.name.text || "?";
                    if (this.isarg)
                        n = "ARG " + n;
                    if (this.isRef())
                        n = "REF " + n;
                    //if (this.isByRefLocal()) n = "BYREF " + n
                    return "[" + n + "]";
                };
                Cell.prototype.uniqueName = function () {
                    return pxt.getDeclName(this.def) + "___" + ts.getNodeId(this.def);
                };
                Cell.prototype.refSuff = function () {
                    if (this.isRef())
                        return "Ref";
                    else
                        return "";
                };
                Cell.prototype.isRef = function () { return this._isRef; };
                Cell.prototype.isLocal = function () { return this._isLocal; };
                Cell.prototype.isGlobal = function () { return this._isGlobal; };
                Cell.prototype.loadCore = function () {
                    return op(EK.CellRef, null, this);
                };
                Cell.prototype.load = function () {
                    var r = this.loadCore();
                    if (this.isByRefLocal())
                        return rtcall("pxtrt::ldloc" + this.refSuff(), [r]);
                    if (this.refCountingHandledHere())
                        return op(EK.Incr, [r]);
                    return r;
                };
                Cell.prototype.refCountingHandledHere = function () {
                    return this.isRef() && !this.isGlobal() && !this.isByRefLocal();
                };
                Cell.prototype.isByRefLocal = function () {
                    return this.isLocal() && this.info.captured && this.info.written;
                };
                Cell.prototype.storeDirect = function (src) {
                    return op(EK.Store, [this.loadCore(), src]);
                };
                Cell.prototype.storeByRef = function (src) {
                    if (this.isByRefLocal()) {
                        return rtcall("pxtrt::stloc" + this.refSuff(), [this.loadCore(), src]);
                    }
                    else {
                        if (this.refCountingHandledHere()) {
                            var tmp = shared(src);
                            return op(EK.Sequence, [
                                tmp,
                                op(EK.Decr, [this.loadCore()]),
                                this.storeDirect(tmp)
                            ]);
                        }
                        else {
                            return this.storeDirect(src);
                        }
                    }
                };
                return Cell;
            }());
            ir.Cell = Cell;
            var Procedure = (function (_super) {
                __extends(Procedure, _super);
                function Procedure() {
                    _super.apply(this, arguments);
                    this.numArgs = 0;
                    this.isRoot = false;
                    this.locals = [];
                    this.captured = [];
                    this.args = [];
                    this.body = [];
                    this.lblNo = 0;
                }
                Procedure.prototype.toString = function () {
                    return "\nPROC " + pxt.getDeclName(this.action) + "\n" + this.body.map(function (s) { return s.toString(); }).join("") + "\n";
                };
                Procedure.prototype.emit = function (stmt) {
                    this.body.push(stmt);
                };
                Procedure.prototype.emitExpr = function (expr) {
                    this.emit(stmt(SK.Expr, expr));
                };
                Procedure.prototype.mkLabel = function (name) {
                    var lbl = stmt(SK.Label, null);
                    lbl.lblName = "." + name + "_" + this.lblNo++ + "_" + this.seqNo;
                    lbl.lbl = lbl;
                    return lbl;
                };
                Procedure.prototype.emitLbl = function (lbl) {
                    this.emit(lbl);
                };
                Procedure.prototype.emitLblDirect = function (lblName) {
                    var lbl = stmt(SK.Label, null);
                    lbl.lblName = lblName;
                    lbl.lbl = lbl;
                    this.emit(lbl);
                };
                Procedure.prototype.getName = function () {
                    var text = this.action && this.action.name ? this.action.name.text : null;
                    return text || "inline";
                };
                Procedure.prototype.mkLocal = function (def, info) {
                    var l = new Cell(this.locals.length, def, info);
                    this.locals.push(l);
                    return l;
                };
                Procedure.prototype.localIndex = function (l, noargs) {
                    if (noargs === void 0) { noargs = false; }
                    return this.captured.filter(function (n) { return n.def == l; })[0] ||
                        this.locals.filter(function (n) { return n.def == l; })[0] ||
                        (noargs ? null : this.args.filter(function (n) { return n.def == l; })[0]);
                };
                Procedure.prototype.stackEmpty = function () {
                    this.emit(stmt(SK.StackEmpty, null));
                };
                Procedure.prototype.emitClrIfRef = function (p) {
                    assert(!p.isGlobal() && !p.iscap);
                    if (p.isRef() || p.isByRefLocal()) {
                        this.emitExpr(op(EK.Decr, [p.loadCore()]));
                    }
                };
                Procedure.prototype.emitClrs = function () {
                    var _this = this;
                    if (this.isRoot)
                        return;
                    var lst = this.locals.concat(this.args);
                    lst.forEach(function (p) { return _this.emitClrIfRef(p); });
                };
                Procedure.prototype.emitJmpZ = function (trg, expr) {
                    this.emitJmp(trg, expr, JmpMode.IfZero);
                };
                Procedure.prototype.emitJmp = function (trg, expr, mode) {
                    if (mode === void 0) { mode = JmpMode.Always; }
                    var jmp = stmt(SK.Jmp, expr);
                    jmp.jmpMode = mode;
                    if (typeof trg == "string")
                        jmp.lblName = trg;
                    else {
                        jmp.lbl = trg;
                        jmp.lblName = jmp.lbl.lblName;
                    }
                    this.emit(jmp);
                };
                Procedure.prototype.resolve = function () {
                    // TODO remove decr(stringData)
                    // TODO remove decr(static function literal)
                    var iterargs = function (e, f) {
                        if (e.args)
                            for (var i = 0; i < e.args.length; ++i)
                                e.args[i] = f(e.args[i]);
                    };
                    var refdef = function (e) {
                        switch (e.exprKind) {
                            case EK.SharedDef: throw U.oops();
                            case EK.SharedRef:
                                var arg = e.args[0];
                                if (!arg.totalUses) {
                                    arg.totalUses = -1;
                                    arg.currUses = 0;
                                    var e2 = Expr.clone(e);
                                    e2.exprKind = EK.SharedDef;
                                    e2.args[0] = refdef(e2.args[0]);
                                    return e2;
                                }
                                else {
                                    arg.totalUses--;
                                    return e;
                                }
                        }
                        iterargs(e, refdef);
                        return e;
                    };
                    var opt = function (e) {
                        if (e.exprKind == EK.SharedRef)
                            return e;
                        iterargs(e, opt);
                        switch (e.exprKind) {
                            case EK.Decr:
                                if (e.args[0].exprKind == EK.Incr)
                                    return e.args[0].args[0];
                                break;
                            case EK.Sequence:
                                e.args = e.args.filter(function (a, i) { return i == e.args.length - 1 || !a.isPure(); });
                                break;
                        }
                        return e;
                    };
                    var cntuses = function (e) {
                        switch (e.exprKind) {
                            case EK.SharedDef:
                                var arg = e.args[0];
                                //console.log(arg)
                                U.assert(arg.totalUses < 0);
                                U.assert(arg.currUses === 0);
                                if (arg.totalUses == -1)
                                    return cntuses(arg);
                                else
                                    arg.totalUses = 1;
                                break;
                            case EK.SharedRef:
                                U.assert(e.args[0].totalUses > 0);
                                e.args[0].totalUses++;
                                return e;
                        }
                        iterargs(e, cntuses);
                        return e;
                    };
                    this.body = this.body.filter(function (s) {
                        if (s.expr) {
                            //console.log("OPT", s.expr.toString())
                            s.expr = opt(refdef(s.expr));
                            if (s.stmtKind == ir.SK.Expr && s.expr.isPure())
                                return false;
                        }
                        return true;
                    });
                    var lbls = U.toDictionary(this.body.filter(function (s) { return s.stmtKind == ir.SK.Label; }), function (s) { return s.lblName; });
                    for (var _i = 0, _a = this.body; _i < _a.length; _i++) {
                        var s = _a[_i];
                        if (s.expr) {
                            //console.log("CNT", s.expr.toString())
                            s.expr = cntuses(s.expr);
                        }
                        switch (s.stmtKind) {
                            case ir.SK.Expr:
                                break;
                            case ir.SK.Jmp:
                                s.lbl = U.lookup(lbls, s.lblName);
                                if (!s.lbl)
                                    pxt.oops("missing label: " + s.lblName);
                                s.lbl.lblNumUses++;
                                break;
                            case ir.SK.StackEmpty:
                            case ir.SK.Label:
                            case ir.SK.Breakpoint:
                                break;
                            default: pxt.oops();
                        }
                    }
                };
                return Procedure;
            }(Node));
            ir.Procedure = Procedure;
            function iterExpr(e, f) {
                f(e);
                if (e.args)
                    for (var _i = 0, _a = e.args; _i < _a.length; _i++) {
                        var a = _a[_i];
                        iterExpr(a, f);
                    }
            }
            ir.iterExpr = iterExpr;
            function stmt(kind, expr) {
                return new Stmt(kind, expr);
            }
            ir.stmt = stmt;
            function op(kind, args, data) {
                return new Expr(kind, args, data);
            }
            ir.op = op;
            function numlit(v) {
                return op(EK.NumberLiteral, null, v);
            }
            ir.numlit = numlit;
            function shared(expr) {
                switch (expr.exprKind) {
                    case EK.NumberLiteral:
                    case EK.SharedRef:
                        return expr;
                }
                return op(EK.SharedRef, [expr]);
            }
            ir.shared = shared;
            function ptrlit(lbl, jsInfo) {
                var r = op(EK.PointerLiteral, null, lbl);
                r.jsInfo = jsInfo;
                return r;
            }
            ir.ptrlit = ptrlit;
            function rtcall(name, args) {
                return op(EK.RuntimeCall, args, name);
            }
            ir.rtcall = rtcall;
            function rtcallMask(name, mask, callingConv, args) {
                var decrs = [];
                args = args.map(function (a, i) {
                    if (mask & (1 << i)) {
                        a = shared(a);
                        decrs.push(op(EK.Decr, [a]));
                        return a;
                    }
                    else
                        return a;
                });
                var r = op(EK.RuntimeCall, args, name);
                r.callingConvention = callingConv;
                if (decrs.length > 0) {
                    r = shared(r);
                    decrs.unshift(r);
                    decrs.push(r);
                    r = op(EK.Sequence, decrs);
                }
                return r;
            }
            ir.rtcallMask = rtcallMask;
            function flattenArgs(topExpr) {
                var didStateUpdate = false;
                var complexArgs = [];
                for (var _i = 0, _a = U.reversed(topExpr.args); _i < _a.length; _i++) {
                    var a = _a[_i];
                    if (a.isStateless())
                        continue;
                    if (a.exprKind == EK.CellRef && !a.data.isGlobal() && !didStateUpdate)
                        continue;
                    if (a.canUpdateCells())
                        didStateUpdate = true;
                    complexArgs.push(a);
                }
                complexArgs.reverse();
                var precomp = [];
                var flattened = topExpr.args.map(function (a) {
                    var idx = complexArgs.indexOf(a);
                    if (idx >= 0) {
                        var sharedRef = a;
                        var sharedDef = a;
                        if (a.exprKind == EK.SharedDef) {
                            a.args[0].totalUses++;
                            sharedRef = ir.op(EK.SharedRef, [a.args[0]]);
                        }
                        else {
                            sharedRef = ir.op(EK.SharedRef, [a]);
                            sharedDef = ir.op(EK.SharedDef, [a]);
                            a.totalUses = 2;
                            a.currUses = 0;
                        }
                        precomp.push(sharedDef);
                        return sharedRef;
                    }
                    else
                        return a;
                });
                return { precomp: precomp, flattened: flattened };
            }
            ir.flattenArgs = flattenArgs;
        })(ir = pxt.ir || (pxt.ir = {}));
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        pxt.assert = pxt.Util.assert;
        pxt.oops = pxt.Util.oops;
        pxt.U = ts.pxt.Util;
        pxt.BINARY_JS = "binary.js";
        pxt.BINARY_HEX = "binary.hex";
        pxt.BINARY_ASM = "binary.asm";
        var EK = pxt.ir.EK;
        pxt.SK = ts.SyntaxKind;
        function stringKind(n) {
            if (!n)
                return "<null>";
            return ts.SyntaxKind[n.kind];
        }
        pxt.stringKind = stringKind;
        function inspect(n) {
            console.log(stringKind(n));
        }
        function userError(msg) {
            debugger;
            var e = new Error(msg);
            e.ksEmitterUserError = true;
            throw e;
        }
        function isRefType(t) {
            checkType(t);
            return !(t.flags & (ts.TypeFlags.Number | ts.TypeFlags.Boolean | ts.TypeFlags.Enum));
        }
        function isRefDecl(def) {
            if (def.isThisParameter)
                return true;
            //let tp = checker.getDeclaredTypeOfSymbol(def.symbol)
            var tp = typeOf(def);
            return isRefType(tp);
        }
        function setCellProps(l) {
            l._isRef = isRefDecl(l.def);
            l._isLocal = isLocalVar(l.def) || isParameter(l.def);
            l._isGlobal = isGlobalVar(l.def);
            if (!l.isRef() && typeOf(l.def).flags & ts.TypeFlags.Void) {
                pxt.oops("void-typed variable, " + l.toString());
            }
        }
        pxt.setCellProps = setCellProps;
        function isStringLiteral(node) {
            switch (node.kind) {
                case pxt.SK.TemplateHead:
                case pxt.SK.TemplateMiddle:
                case pxt.SK.TemplateTail:
                case pxt.SK.StringLiteral:
                case pxt.SK.NoSubstitutionTemplateLiteral:
                    return true;
                default: return false;
            }
        }
        function isEmptyStringLiteral(e) {
            return isStringLiteral(e) && e.text == "";
        }
        function getEnclosingMethod(node) {
            if (!node)
                return null;
            if (node.kind == pxt.SK.MethodDeclaration || node.kind == pxt.SK.Constructor)
                return node;
            return getEnclosingMethod(node.parent);
        }
        function getEnclosingFunction(node0) {
            var node = node0;
            while (true) {
                node = node.parent;
                if (!node)
                    userError(lf("cannot determine parent of {0}", stringKind(node0)));
                if (node.kind == pxt.SK.FunctionDeclaration ||
                    node.kind == pxt.SK.ArrowFunction ||
                    node.kind == pxt.SK.FunctionExpression ||
                    node.kind == pxt.SK.MethodDeclaration ||
                    node.kind == pxt.SK.Constructor)
                    return node;
                if (node.kind == pxt.SK.SourceFile)
                    return null;
            }
        }
        function isGlobalVar(d) {
            return d.kind == pxt.SK.VariableDeclaration && !getEnclosingFunction(d);
        }
        function isLocalVar(d) {
            return d.kind == pxt.SK.VariableDeclaration && !isGlobalVar(d);
        }
        function isParameter(d) {
            return d.kind == pxt.SK.Parameter;
        }
        function isTopLevelFunctionDecl(decl) {
            return (decl.kind == pxt.SK.FunctionDeclaration && !getEnclosingFunction(decl)) ||
                decl.kind == pxt.SK.MethodDeclaration ||
                decl.kind == pxt.SK.Constructor;
        }
        function isSideEffectfulInitializer(init) {
            if (!init)
                return false;
            switch (init.kind) {
                case pxt.SK.NullKeyword:
                case pxt.SK.NumericLiteral:
                case pxt.SK.StringLiteral:
                case pxt.SK.TrueKeyword:
                case pxt.SK.FalseKeyword:
                    return false;
                default:
                    return true;
            }
        }
        var lf = pxt.thumb.lf;
        var checker;
        function getComments(node) {
            var src = ts.getSourceFileOfNode(node);
            var doc = ts.getLeadingCommentRangesOfNodeFromText(node, src.text);
            if (!doc)
                return "";
            var cmt = doc.map(function (r) { return src.text.slice(r.pos, r.end); }).join("\n");
            return cmt;
        }
        pxt.getComments = getComments;
        function parseCommentString(cmt) {
            var res = { paramDefl: {}, callingConvention: pxt.ir.CallingConvention.Plain };
            var didSomething = true;
            while (didSomething) {
                didSomething = false;
                cmt = cmt.replace(/\/\/%[ \t]*([\w\.]+)(=(("[^"\n]+")|'([^'\n]+)'|([^\s]*)))?/, function (f, n, d0, d1, v0, v1, v2) {
                    var v = v0 ? JSON.parse(v0) : (d0 ? (v0 || v1 || v2) : "true");
                    if (pxt.U.endsWith(n, ".defl")) {
                        res.paramDefl[n.slice(0, n.length - 5)] = v;
                    }
                    else {
                        res[n] = v;
                    }
                    didSomething = true;
                    return "//% ";
                });
            }
            if (typeof res.weight == "string")
                res.weight = parseInt(res.weight);
            res.paramHelp = {};
            res.jsDoc = "";
            cmt = cmt.replace(/\/\*\*([^]*?)\*\//g, function (full, doccmt) {
                doccmt = doccmt.replace(/\n\s*(\*\s*)?/g, "\n");
                doccmt = doccmt.replace(/^\s*@param\s+(\w+)\s+(.*)$/mg, function (full, name, desc) {
                    res.paramHelp[name] = desc;
                    return "";
                });
                res.jsDoc += doccmt;
                return "";
            });
            res.jsDoc = res.jsDoc.trim();
            if (res.async)
                res.callingConvention = pxt.ir.CallingConvention.Async;
            if (res.promise)
                res.callingConvention = pxt.ir.CallingConvention.Promise;
            return res;
        }
        pxt.parseCommentString = parseCommentString;
        function parseCommentsOnSymbol(symbol) {
            var cmts = "";
            for (var _i = 0, _a = symbol.declarations; _i < _a.length; _i++) {
                var decl = _a[_i];
                cmts += getComments(decl);
            }
            return parseCommentString(cmts);
        }
        pxt.parseCommentsOnSymbol = parseCommentsOnSymbol;
        function parseComments(node) {
            if (!node || node.isRootFunction)
                return parseCommentString("");
            var res = parseCommentString(getComments(node));
            res._name = getName(node);
            return res;
        }
        pxt.parseComments = parseComments;
        function getName(node) {
            if (!node.name || node.name.kind != pxt.SK.Identifier)
                return "???";
            return node.name.text;
        }
        pxt.getName = getName;
        function isArrayType(t) {
            return (t.flags & ts.TypeFlags.Reference) && t.symbol.name == "Array";
        }
        function isInterfaceType(t) {
            return t.flags & ts.TypeFlags.Interface;
        }
        function isClassType(t) {
            // check if we like the class?
            return (t.flags & ts.TypeFlags.Class) || (t.flags & ts.TypeFlags.ThisType);
        }
        function arrayElementType(t) {
            if (isArrayType(t))
                return checkType(t.typeArguments[0]);
            return null;
        }
        function deconstructFunctionType(t) {
            var sigs = checker.getSignaturesOfType(t, ts.SignatureKind.Call);
            if (sigs && sigs.length == 1)
                return sigs[0];
            return null;
        }
        function checkType(t) {
            var ok = ts.TypeFlags.String | ts.TypeFlags.Number | ts.TypeFlags.Boolean |
                ts.TypeFlags.Void | ts.TypeFlags.Enum | ts.TypeFlags.Null;
            if ((t.flags & ok) == 0) {
                if (isArrayType(t))
                    return t;
                if (isClassType(t))
                    return t;
                if (isInterfaceType(t))
                    return t;
                if (deconstructFunctionType(t))
                    return t;
                userError(lf("unsupported type: {0} 0x{1}", checker.typeToString(t), t.flags.toString(16)));
            }
            return t;
        }
        function typeOf(node) {
            var r;
            if (ts.isExpression(node))
                r = checker.getContextualType(node);
            if (!r)
                r = checker.getTypeAtLocation(node);
            return checkType(r);
        }
        function funcHasReturn(fun) {
            var sig = checker.getSignatureFromDeclaration(fun);
            var rettp = checker.getReturnTypeOfSignature(sig);
            return !(rettp.flags & ts.TypeFlags.Void);
        }
        function getDeclName(node) {
            var text = node && node.name ? node.name.text : null;
            if (!text && node.kind == pxt.SK.Constructor)
                text = "constructor";
            if (node.parent && node.parent.kind == pxt.SK.ClassDeclaration)
                text = node.parent.name.text + "." + text;
            text = text || "inline";
            return text;
        }
        pxt.getDeclName = getDeclName;
        function getFunctionLabel(node) {
            var text = getDeclName(node);
            return "_" + text.replace(/[^\w]+/g, "_") + "_" + ts.getNodeId(node);
        }
        pxt.getFunctionLabel = getFunctionLabel;
        function compileBinary(program, host, opts, res) {
            var diagnostics = ts.createDiagnosticCollection();
            checker = program.getTypeChecker();
            var classInfos = {};
            var usedDecls = {};
            var usedWorkList = [];
            var variableStatus = {};
            var functionInfo = {};
            var brkMap = {};
            if (opts.target.isNative) {
                pxt.hex.setupFor(opts.extinfo || emptyExtInfo(), opts.hexinfo);
                pxt.hex.setupInlineAssembly(opts);
            }
            if (opts.breakpoints)
                res.breakpoints = [{
                        id: 0,
                        isDebuggerStmt: false,
                        fileName: "bogus",
                        start: 0,
                        length: 0,
                        line: 0,
                        character: 0
                    }];
            var bin;
            var proc;
            function reset() {
                bin = new Binary();
                bin.res = res;
                bin.target = opts.target;
                proc = null;
            }
            var allStmts = pxt.Util.concat(program.getSourceFiles().map(function (f) { return f.statements; }));
            var src = program.getSourceFiles()[0];
            var rootFunction = {
                kind: pxt.SK.FunctionDeclaration,
                parameters: [],
                name: {
                    text: "<main>",
                    pos: 0,
                    end: 0
                },
                body: {
                    kind: pxt.SK.Block,
                    statements: allStmts
                },
                parent: src,
                pos: 0,
                end: 0,
                isRootFunction: true
            };
            markUsed(rootFunction);
            usedWorkList = [];
            reset();
            emit(rootFunction);
            if (diagnostics.getModificationCount() == 0) {
                reset();
                bin.finalPass = true;
                emit(rootFunction);
                try {
                    finalEmit();
                }
                catch (e) {
                    handleError(rootFunction, e);
                }
            }
            return {
                diagnostics: diagnostics.getDiagnostics(),
                emitSkipped: !!opts.noEmit
            };
            function error(node, msg, arg0, arg1, arg2) {
                diagnostics.add(ts.createDiagnosticForNode(node, {
                    code: 9042,
                    message: msg,
                    key: msg.replace(/^[a-zA-Z]+/g, "_"),
                    category: ts.DiagnosticCategory.Error,
                }, arg0, arg1, arg2));
            }
            function unhandled(n, addInfo) {
                if (addInfo === void 0) { addInfo = ""; }
                if (addInfo)
                    addInfo = " (" + addInfo + ")";
                return userError(lf("Unsupported syntax node: {0}", stringKind(n)) + addInfo);
            }
            function nodeKey(f) {
                return ts.getNodeId(f) + "";
            }
            function getFunctionInfo(f) {
                var key = nodeKey(f);
                var info = functionInfo[key];
                if (!info)
                    functionInfo[key] = info = {
                        capturedVars: []
                    };
                return info;
            }
            function getVarInfo(v) {
                var key = ts.getNodeId(v) + "";
                var info = variableStatus[key];
                if (!info)
                    variableStatus[key] = info = {};
                return info;
            }
            function recordUse(v, written) {
                if (written === void 0) { written = false; }
                var info = getVarInfo(v);
                if (written)
                    info.written = true;
                var outer = getEnclosingFunction(v);
                if (outer == null || outer == proc.action) {
                }
                else {
                    if (proc.info.capturedVars.indexOf(v) < 0)
                        proc.info.capturedVars.push(v);
                    info.captured = true;
                }
            }
            function scope(f) {
                var prevProc = proc;
                try {
                    f();
                }
                finally {
                    proc = prevProc;
                }
            }
            function finalEmit() {
                if (diagnostics.getModificationCount() || opts.noEmit)
                    return;
                bin.writeFile = function (fn, data) {
                    return host.writeFile(fn, data, false, null);
                };
                if (opts.target.isNative) {
                    pxt.thumbEmit(bin, opts);
                }
                else {
                    pxt.jsEmit(bin);
                }
            }
            function typeCheckVar(decl) {
                if (typeOf(decl).flags & ts.TypeFlags.Void)
                    userError("void-typed variables not supported");
            }
            function lookupCell(decl) {
                if (isGlobalVar(decl)) {
                    markUsed(decl);
                    typeCheckVar(decl);
                    var ex = bin.globals.filter(function (l) { return l.def == decl; })[0];
                    if (!ex) {
                        ex = new pxt.ir.Cell(bin.globals.length, decl, getVarInfo(decl));
                        bin.globals.push(ex);
                    }
                    return ex;
                }
                else {
                    var res_2 = proc.localIndex(decl);
                    if (!res_2) {
                        if (bin.finalPass)
                            userError(lf("cannot locate identifer"));
                        else
                            res_2 = proc.mkLocal(decl, getVarInfo(decl));
                    }
                    return res_2;
                }
            }
            function getClassInfo(t) {
                var decl = t.symbol.valueDeclaration;
                var id = ts.getNodeId(decl);
                var info = classInfos[id + ""];
                if (!info) {
                    info = {
                        reffields: [],
                        primitivefields: [],
                        allfields: null,
                        attrs: parseComments(decl)
                    };
                    classInfos[id + ""] = info;
                    for (var _i = 0, _a = decl.members; _i < _a.length; _i++) {
                        var mem = _a[_i];
                        if (mem.kind == pxt.SK.PropertyDeclaration) {
                            var pdecl = mem;
                            if (isRefType(typeOf(pdecl)))
                                info.reffields.push(pdecl);
                            else
                                info.primitivefields.push(pdecl);
                        }
                    }
                    info.allfields = info.reffields.concat(info.primitivefields);
                }
                return info;
            }
            function emitImageLiteral(s) {
                if (!s)
                    s = "0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n";
                var x = 0;
                var w = 0;
                var h = 0;
                var lit = "";
                s += "\n";
                for (var i = 0; i < s.length; ++i) {
                    switch (s[i]) {
                        case ".":
                        case "_":
                        case "0":
                            lit += "0,";
                            x++;
                            break;
                        case "#":
                        case "*":
                        case "1":
                            lit += "1,";
                            x++;
                            break;
                        case "\t":
                        case "\r":
                        case " ": break;
                        case "\n":
                            if (x) {
                                if (w == 0)
                                    w = x;
                                else if (x != w)
                                    userError(lf("lines in image literal have to have the same width (got {0} and then {1} pixels)", w, x));
                                x = 0;
                                h++;
                            }
                            break;
                        default:
                            userError(lf("Only 0 . _ (off) and 1 # * (on) are allowed in image literals"));
                    }
                }
                var lbl = "_img" + bin.lblNo++;
                if (lit.length % 4 != 0)
                    lit += "42"; // pad
                bin.otherLiterals.push("\n.balign 4\n" + lbl + ": .short 0xffff\n        .short " + w + ", " + h + "\n        .byte " + lit + "\n");
                var jsLit = "new pxsim.Image(" + w + ", [" + lit + "])";
                return {
                    kind: pxt.SK.NumericLiteral,
                    imageLiteral: lbl,
                    jsLit: jsLit
                };
            }
            function emitLocalLoad(decl) {
                var l = lookupCell(decl);
                recordUse(decl);
                var r = l.load();
                //console.log("LOADLOC", l.toString(), r.toString())
                return r;
            }
            function emitIdentifier(node) {
                var decl = getDecl(node);
                if (decl && (decl.kind == pxt.SK.VariableDeclaration || decl.kind == pxt.SK.Parameter)) {
                    return emitLocalLoad(decl);
                }
                else if (decl && decl.kind == pxt.SK.FunctionDeclaration) {
                    var f = decl;
                    var info = getFunctionInfo(f);
                    if (info.location) {
                        return info.location.load();
                    }
                    else {
                        pxt.assert(!bin.finalPass || info.capturedVars.length == 0);
                        return emitFunLit(f);
                    }
                }
                else {
                    throw unhandled(node, "id");
                }
            }
            function emitParameter(node) { }
            function emitAccessor(node) { }
            function emitThis(node) {
                var meth = getEnclosingMethod(node);
                if (!meth)
                    userError("'this' used outside of a method");
                var inf = getFunctionInfo(meth);
                if (!inf.thisParameter) {
                    //console.log("get this param,", meth.kind, nodeKey(meth))
                    //console.log("GET", meth)
                    pxt.oops("no this");
                }
                return emitLocalLoad(inf.thisParameter);
            }
            function emitSuper(node) { }
            function emitLiteral(node) {
                if (node.kind == pxt.SK.NumericLiteral) {
                    if (node.imageLiteral) {
                        return pxt.ir.ptrlit(node.imageLiteral, node.jsLit);
                    }
                    else {
                        return pxt.ir.numlit(parseInt(node.text));
                    }
                }
                else if (isStringLiteral(node)) {
                    if (node.text == "") {
                        return pxt.ir.rtcall("String_::mkEmpty", []);
                    }
                    else {
                        var lbl = bin.emitString(node.text);
                        var ptr = pxt.ir.ptrlit(lbl + "meta", JSON.stringify(node.text));
                        return pxt.ir.rtcall("pxt::ptrOfLiteral", [ptr]);
                    }
                }
                else {
                    throw pxt.oops();
                }
            }
            function emitTemplateExpression(node) {
                var concat = function (a, b) {
                    return isEmptyStringLiteral(b) ? a :
                        pxt.ir.rtcallMask("String_::concat", 3, pxt.ir.CallingConvention.Plain, [
                            a,
                            emitAsString(b)
                        ]);
                };
                // TODO could optimize for the case where node.head is empty
                var expr = emitAsString(node.head);
                for (var _i = 0, _a = node.templateSpans; _i < _a.length; _i++) {
                    var span = _a[_i];
                    expr = concat(expr, span.expression);
                    expr = concat(expr, span.literal);
                }
                return expr;
            }
            function emitTemplateSpan(node) { }
            function emitJsxElement(node) { }
            function emitJsxSelfClosingElement(node) { }
            function emitJsxText(node) { }
            function emitJsxExpression(node) { }
            function emitQualifiedName(node) { }
            function emitObjectBindingPattern(node) { }
            function emitArrayBindingPattern(node) { }
            function emitBindingElement(node) { }
            function emitArrayLiteral(node) {
                var eltT = arrayElementType(typeOf(node));
                var isRef = isRefType(eltT);
                var flag = 0;
                if (eltT.flags & ts.TypeFlags.String)
                    flag = 3;
                else if (isRef)
                    flag = 1;
                var coll = pxt.ir.shared(pxt.ir.rtcall("Array_::mk", [pxt.ir.numlit(flag)]));
                for (var _i = 0, _a = node.elements; _i < _a.length; _i++) {
                    var elt = _a[_i];
                    var e = pxt.ir.shared(emitExpr(elt));
                    proc.emitExpr(pxt.ir.rtcall("Array_::push", [coll, e]));
                    if (isRef) {
                        proc.emitExpr(pxt.ir.op(EK.Decr, [e]));
                    }
                }
                return coll;
            }
            function emitObjectLiteral(node) { }
            function emitPropertyAssignment(node) {
                if (node.initializer)
                    userError(lf("class field initializers not supported"));
                // do nothing
            }
            function emitShorthandPropertyAssignment(node) { }
            function emitComputedPropertyName(node) { }
            function emitPropertyAccess(node) {
                var decl = getDecl(node);
                var attrs = parseComments(decl);
                var callInfo = {
                    decl: decl,
                    qName: pxt.getFullName(checker, decl.symbol),
                    attrs: attrs,
                    args: []
                };
                node.callInfo = callInfo;
                if (decl.kind == pxt.SK.EnumMember) {
                    var ev = attrs.enumval;
                    if (!ev) {
                        var val = checker.getConstantValue(decl);
                        if (val == null) {
                            if (decl.initializer)
                                return emitExpr(decl.initializer);
                            userError(lf("Cannot compute enum value"));
                        }
                        ev = val + "";
                    }
                    if (/^\d+$/.test(ev))
                        return pxt.ir.numlit(parseInt(ev));
                    return pxt.ir.rtcall(ev, []);
                }
                else if (decl.kind == pxt.SK.PropertySignature) {
                    if (attrs.shim) {
                        callInfo.args.push(node.expression);
                        return emitShim(decl, node, [node.expression]);
                    }
                    else {
                        throw unhandled(node, "no {shim:...}");
                    }
                }
                else if (decl.kind == pxt.SK.PropertyDeclaration) {
                    var idx = fieldIndex(node);
                    callInfo.args.push(node.expression);
                    return pxt.ir.op(EK.FieldAccess, [emitExpr(node.expression)], idx);
                }
                else if (decl.kind == pxt.SK.MethodDeclaration || decl.kind == pxt.SK.MethodSignature) {
                    throw userError(lf("cannot use method as lambda; did you forget '()' ?"));
                }
                else {
                    throw unhandled(node, stringKind(decl));
                }
            }
            function emitIndexedAccess(node, assign) {
                if (assign === void 0) { assign = null; }
                var t = typeOf(node.expression);
                var indexer = "";
                if (!assign && t.flags & ts.TypeFlags.String)
                    indexer = "String_::charAt";
                else if (isArrayType(t))
                    indexer = assign ? "Array_::setAt" : "Array_::getAt";
                else if (isInterfaceType(t)) {
                    var attrs = parseCommentsOnSymbol(t.symbol);
                    indexer = assign ? attrs.indexerSet : attrs.indexerGet;
                }
                if (indexer) {
                    if (typeOf(node.argumentExpression).flags & ts.TypeFlags.Number) {
                        var arr = emitExpr(node.expression);
                        var idx = emitExpr(node.argumentExpression);
                        var args = [node.expression, node.argumentExpression];
                        return rtcallMask(indexer, args, pxt.ir.CallingConvention.Plain, assign ? [assign] : []);
                    }
                    else {
                        throw unhandled(node, lf("non-numeric indexer on {0}", indexer));
                    }
                }
                else {
                    throw unhandled(node, "unsupported indexer");
                }
            }
            function isOnDemandDecl(decl) {
                var res = (isGlobalVar(decl) && !isSideEffectfulInitializer(decl.initializer)) ||
                    isTopLevelFunctionDecl(decl);
                if (opts.testMode && res) {
                    if (!pxt.U.startsWith(ts.getSourceFileOfNode(decl).fileName, "pxt_modules"))
                        return false;
                }
                return res;
            }
            function isUsed(decl) {
                return !isOnDemandDecl(decl) || usedDecls.hasOwnProperty(nodeKey(decl));
            }
            function markUsed(decl) {
                if (!isUsed(decl)) {
                    usedDecls[nodeKey(decl)] = true;
                    usedWorkList.push(decl);
                }
            }
            function getDecl(node) {
                if (!node)
                    return null;
                var sym = checker.getSymbolAtLocation(node);
                var decl = sym ? sym.valueDeclaration : null;
                markUsed(decl);
                return decl;
            }
            function isRefCountedExpr(e) {
                // we generate a fake NULL expression for default arguments
                // we also generate a fake numeric literal for image literals
                if (e.kind == pxt.SK.NullKeyword || e.kind == pxt.SK.NumericLiteral)
                    return false;
                // no point doing the incr/decr for these - they are statically allocated anyways
                if (isStringLiteral(e))
                    return false;
                return isRefType(typeOf(e));
            }
            function getMask(args) {
                pxt.assert(args.length <= 8);
                var m = 0;
                args.forEach(function (a, i) {
                    if (isRefCountedExpr(a))
                        m |= (1 << i);
                });
                return m;
            }
            function emitShim(decl, node, args) {
                var attrs = parseComments(decl);
                var hasRet = !(typeOf(node).flags & ts.TypeFlags.Void);
                var nm = attrs.shim;
                if (nm == "TD_NOOP") {
                    pxt.assert(!hasRet);
                    return pxt.ir.numlit(0);
                }
                if (nm == "TD_ID") {
                    pxt.assert(args.length == 1);
                    return emitExpr(args[0]);
                }
                if (opts.target.isNative) {
                    pxt.hex.validateShim(getDeclName(decl), attrs, hasRet, args.length);
                }
                return rtcallMask(attrs.shim, args, attrs.callingConvention);
            }
            function isNumericLiteral(node) {
                switch (node.kind) {
                    case pxt.SK.NullKeyword:
                    case pxt.SK.TrueKeyword:
                    case pxt.SK.FalseKeyword:
                    case pxt.SK.NumericLiteral:
                        return true;
                    default:
                        return false;
                }
            }
            function emitPlainCall(decl, args, hasRet) {
                if (hasRet === void 0) { hasRet = false; }
                return pxt.ir.op(EK.ProcCall, args.map(emitExpr), decl);
            }
            function addDefaultParameters(sig, args, attrs) {
                if (!sig)
                    return;
                var parms = sig.getParameters();
                if (parms.length > args.length) {
                    parms.slice(args.length).forEach(function (p) {
                        if (p.valueDeclaration &&
                            p.valueDeclaration.kind == pxt.SK.Parameter) {
                            var prm = p.valueDeclaration;
                            if (!prm.initializer) {
                                var defl = attrs.paramDefl[getName(prm)];
                                args.push({
                                    kind: pxt.SK.NullKeyword,
                                    valueOverride: defl ? parseInt(defl) : undefined
                                });
                            }
                            else {
                                if (!isNumericLiteral(prm.initializer)) {
                                    userError("only numbers, null, true and false supported as default arguments");
                                }
                                args.push(prm.initializer);
                            }
                        }
                        else {
                            userError("unsupported default argument (shouldn't happen)");
                        }
                    });
                }
                if (attrs.imageLiteral) {
                    if (!isStringLiteral(args[0])) {
                        userError(lf("Only image literals (string literals) supported here; {0}", stringKind(args[0])));
                    }
                    args[0] = emitImageLiteral(args[0].text);
                }
            }
            function emitCallExpression(node) {
                var decl = getDecl(node.expression);
                var attrs = parseComments(decl);
                var hasRet = !(typeOf(node).flags & ts.TypeFlags.Void);
                var args = node.arguments.slice(0);
                var callInfo = {
                    decl: decl,
                    qName: pxt.getFullName(checker, decl.symbol),
                    attrs: attrs,
                    args: args.slice(0)
                };
                node.callInfo = callInfo;
                if (!decl)
                    unhandled(node, "no declaration");
                function emitPlain() {
                    return emitPlainCall(decl, args, hasRet);
                }
                addDefaultParameters(checker.getResolvedSignature(node), args, attrs);
                if (decl.kind == pxt.SK.FunctionDeclaration) {
                    var info = getFunctionInfo(decl);
                    if (!info.location) {
                        if (attrs.shim) {
                            return emitShim(decl, node, args);
                        }
                        return emitPlain();
                    }
                }
                if (decl.kind == pxt.SK.MethodSignature ||
                    decl.kind == pxt.SK.MethodDeclaration) {
                    if (node.expression.kind == pxt.SK.PropertyAccessExpression) {
                        var recv = node.expression.expression;
                        args.unshift(recv);
                        callInfo.args.unshift(recv);
                    }
                    else
                        unhandled(node, "strange method call");
                    if (attrs.shim) {
                        return emitShim(decl, node, args);
                    }
                    else if (attrs.helper) {
                        var syms = checker.getSymbolsInScope(node, ts.SymbolFlags.Module);
                        var helpersModule = syms.filter(function (s) { return s.name == "helpers"; })[0].valueDeclaration;
                        var helperStmt = helpersModule.body.statements.filter(function (s) { return s.symbol.name == attrs.helper; })[0];
                        if (!helperStmt)
                            userError(lf("helpers.{0} not found", attrs.helper));
                        if (helperStmt.kind != pxt.SK.FunctionDeclaration)
                            userError(lf("helpers.{0} isn't a function", attrs.helper));
                        decl = helperStmt;
                        markUsed(decl);
                        return emitPlain();
                    }
                    else {
                        markUsed(decl);
                        return emitPlain();
                    }
                }
                if (decl.kind == pxt.SK.VariableDeclaration ||
                    decl.kind == pxt.SK.FunctionDeclaration ||
                    decl.kind == pxt.SK.Parameter) {
                    if (args.length > 1)
                        userError("lambda functions with more than 1 argument not supported");
                    if (hasRet)
                        userError("lambda functions cannot yet return values");
                    var suff = args.length + "";
                    args.unshift(node.expression);
                    callInfo.args.unshift(node.expression);
                    return rtcallMask("pxt::runAction" + suff, args, pxt.ir.CallingConvention.Async);
                }
                throw unhandled(node, stringKind(decl));
            }
            function emitNewExpression(node) {
                var t = typeOf(node);
                if (isArrayType(t)) {
                    throw pxt.oops();
                }
                else if (isClassType(t)) {
                    var classDecl = getDecl(node.expression);
                    if (classDecl.kind != pxt.SK.ClassDeclaration) {
                        userError("new expression only supported on class types");
                    }
                    var ctor = classDecl.members.filter(function (n) { return n.kind == pxt.SK.Constructor; })[0];
                    var info = getClassInfo(t);
                    var obj = pxt.ir.shared(pxt.ir.rtcall("pxt::mkRecord", [pxt.ir.numlit(info.reffields.length), pxt.ir.numlit(info.allfields.length)]));
                    if (ctor) {
                        markUsed(ctor);
                        var args = node.arguments.slice(0);
                        var ctorAttrs = parseComments(ctor);
                        addDefaultParameters(checker.getResolvedSignature(node), args, ctorAttrs);
                        var compiled = args.map(emitExpr);
                        if (ctorAttrs.shim)
                            // we drop 'obj' variable
                            return pxt.ir.rtcall(ctorAttrs.shim, compiled);
                        compiled.unshift(pxt.ir.op(EK.Incr, [obj]));
                        proc.emitExpr(pxt.ir.op(EK.ProcCall, compiled, ctor));
                        return obj;
                    }
                    else {
                        if (node.arguments && node.arguments.length)
                            userError(lf("constructor with arguments not found"));
                        return obj;
                    }
                }
                else {
                    throw unhandled(node);
                }
            }
            function emitTaggedTemplateExpression(node) { }
            function emitTypeAssertion(node) {
                return emitExpr(node.expression);
            }
            function emitAsExpression(node) {
                return emitExpr(node.expression);
            }
            function emitParenExpression(node) {
                return emitExpr(node.expression);
            }
            function getParameters(node) {
                var res = node.parameters.slice(0);
                if (node.kind == pxt.SK.MethodDeclaration || node.kind == pxt.SK.Constructor) {
                    var info = getFunctionInfo(node);
                    if (!info.thisParameter) {
                        info.thisParameter = {
                            kind: pxt.SK.Parameter,
                            name: { text: "this" },
                            isThisParameter: true,
                            parent: node
                        };
                    }
                    res.unshift(info.thisParameter);
                }
                return res;
            }
            function emitFunLit(node, raw) {
                if (raw === void 0) { raw = false; }
                var lbl = getFunctionLabel(node);
                var r = pxt.ir.ptrlit(lbl + "_Lit", lbl);
                if (!raw) {
                    r = pxt.ir.rtcall("pxt::ptrOfLiteral", [r]);
                }
                return r;
            }
            function emitFunctionDeclaration(node) {
                if (!isUsed(node))
                    return;
                var attrs = parseComments(node);
                if (attrs.shim != null) {
                    if (opts.target.isNative) {
                        pxt.hex.validateShim(getDeclName(node), attrs, funcHasReturn(node), getParameters(node).length);
                    }
                    return;
                }
                if (node.flags & ts.NodeFlags.Ambient)
                    return;
                if (!node.body)
                    return;
                var info = getFunctionInfo(node);
                var isExpression = node.kind == pxt.SK.ArrowFunction || node.kind == pxt.SK.FunctionExpression;
                var isRef = function (d) {
                    if (isRefDecl(d))
                        return true;
                    var info = getVarInfo(d);
                    return (info.captured && info.written);
                };
                var refs = info.capturedVars.filter(function (v) { return isRef(v); });
                var prim = info.capturedVars.filter(function (v) { return !isRef(v); });
                var caps = refs.concat(prim);
                var locals = caps.map(function (v, i) {
                    var l = new pxt.ir.Cell(i, v, getVarInfo(v));
                    l.iscap = true;
                    return l;
                });
                var lit = null;
                // if no captured variables, then we can get away with a plain pointer to code
                if (caps.length > 0) {
                    pxt.assert(getEnclosingFunction(node) != null);
                    lit = pxt.ir.shared(pxt.ir.rtcall("pxt::mkAction", [pxt.ir.numlit(refs.length), pxt.ir.numlit(caps.length), emitFunLit(node, true)]));
                    caps.forEach(function (l, i) {
                        var loc = proc.localIndex(l);
                        if (!loc)
                            userError("cannot find captured value: " + checker.symbolToString(l.symbol));
                        var v = loc.loadCore();
                        if (loc.isRef() || loc.isByRefLocal())
                            v = pxt.ir.op(EK.Incr, [v]);
                        proc.emitExpr(pxt.ir.rtcall("pxtrt::stclo", [lit, pxt.ir.numlit(i), v]));
                    });
                    if (node.kind == pxt.SK.FunctionDeclaration) {
                        info.location = proc.mkLocal(node, getVarInfo(node));
                        proc.emitExpr(info.location.storeDirect(lit));
                        lit = null;
                    }
                }
                else {
                    if (isExpression) {
                        lit = emitFunLit(node);
                    }
                }
                pxt.assert(!!lit == isExpression);
                scope(function () {
                    var isRoot = proc == null;
                    proc = new pxt.ir.Procedure();
                    proc.isRoot = isRoot;
                    proc.action = node;
                    proc.info = info;
                    proc.captured = locals;
                    bin.addProc(proc);
                    proc.args = getParameters(node).map(function (p, i) {
                        var l = new pxt.ir.Cell(i, p, getVarInfo(p));
                        l.isarg = true;
                        return l;
                    });
                    proc.args.forEach(function (l) {
                        //console.log(l.toString(), l.info)
                        if (l.isByRefLocal()) {
                            // TODO add C++ support function to do this
                            var tmp = pxt.ir.shared(pxt.ir.rtcall("pxtrt::mkloc" + l.refSuff(), []));
                            proc.emitExpr(pxt.ir.rtcall("pxtrt::stloc" + l.refSuff(), [tmp, l.loadCore()]));
                            proc.emitExpr(l.storeDirect(tmp));
                        }
                    });
                    emit(node.body);
                    proc.emitLblDirect(getLabels(node).ret);
                    proc.stackEmpty();
                    if (funcHasReturn(proc.action)) {
                        var v = pxt.ir.shared(pxt.ir.op(EK.JmpValue, []));
                        proc.emitExpr(v); // make sure we save it
                        proc.emitClrs();
                        var lbl = proc.mkLabel("final");
                        proc.emitJmp(lbl, v, pxt.ir.JmpMode.Always);
                        proc.emitLbl(lbl);
                    }
                    else {
                        proc.emitClrs();
                    }
                    pxt.assert(!bin.finalPass || usedWorkList.length == 0);
                    while (usedWorkList.length > 0) {
                        var f = usedWorkList.pop();
                        emit(f);
                    }
                });
                return lit;
            }
            function emitDeleteExpression(node) { }
            function emitTypeOfExpression(node) { }
            function emitVoidExpression(node) { }
            function emitAwaitExpression(node) { }
            function emitPrefixUnaryExpression(node) {
                var tp = typeOf(node.operand);
                if (tp.flags & ts.TypeFlags.Boolean) {
                    if (node.operator == pxt.SK.ExclamationToken) {
                        return rtcallMask("Boolean_::bang", [node.operand]);
                    }
                }
                if (tp.flags & ts.TypeFlags.Number) {
                    switch (node.operator) {
                        case pxt.SK.PlusPlusToken:
                            return emitIncrement(node.operand, "thumb::adds", false);
                        case pxt.SK.MinusMinusToken:
                            return emitIncrement(node.operand, "thumb::subs", false);
                        case pxt.SK.MinusToken:
                            return pxt.ir.rtcall("thumb::subs", [pxt.ir.numlit(0), emitExpr(node.operand)]);
                        case pxt.SK.PlusToken:
                            return emitExpr(node.operand); // no-op
                        default: unhandled(node, "postfix unary number");
                    }
                }
                throw unhandled(node, "prefix unary");
            }
            function prepForAssignment(trg) {
                var left = emitExpr(trg);
                var storeCache = null;
                if (left.exprKind == EK.FieldAccess) {
                    left.args[0] = pxt.ir.shared(left.args[0]);
                    storeCache = emitExpr(trg); // clone
                    storeCache.args[0] = pxt.ir.op(EK.Incr, [left.args[0]]);
                    proc.emitExpr(left.args[0]);
                }
                left = pxt.ir.shared(left);
                return { left: left, storeCache: storeCache };
            }
            function emitIncrement(trg, meth, isPost, one) {
                if (one === void 0) { one = null; }
                var tmp = prepForAssignment(trg);
                var oneExpr = one ? emitExpr(one) : pxt.ir.numlit(1);
                var result = pxt.ir.shared(pxt.ir.rtcall(meth, [tmp.left, oneExpr]));
                emitStore(trg, result, tmp.storeCache);
                return isPost ? tmp.left : result;
            }
            function emitPostfixUnaryExpression(node) {
                var tp = typeOf(node.operand);
                if (tp.flags & ts.TypeFlags.Number) {
                    switch (node.operator) {
                        case pxt.SK.PlusPlusToken:
                            return emitIncrement(node.operand, "thumb::adds", true);
                        case pxt.SK.MinusMinusToken:
                            return emitIncrement(node.operand, "thumb::subs", true);
                        default: unhandled(node, "postfix unary number");
                    }
                }
                throw unhandled(node);
            }
            function fieldIndex(pacc) {
                var tp = typeOf(pacc.expression);
                if (isClassType(tp)) {
                    var info = getClassInfo(tp);
                    var fld = info.allfields.filter(function (f) { return f.name.text == pacc.name.text; })[0];
                    if (!fld)
                        userError(lf("field {0} not found", pacc.name.text));
                    var attrs = parseComments(fld);
                    return {
                        idx: info.allfields.indexOf(fld),
                        name: pacc.name.text,
                        isRef: isRefType(typeOf(pacc)),
                        shimName: attrs.shim
                    };
                }
                else {
                    throw unhandled(pacc, "bad field access");
                }
            }
            function refSuff(e) {
                if (isRefType(typeOf(e)))
                    return "Ref";
                else
                    return "";
            }
            function emitStore(trg, src, cachedTrg) {
                if (cachedTrg === void 0) { cachedTrg = null; }
                if (trg.kind == pxt.SK.Identifier) {
                    var decl = getDecl(trg);
                    if (decl && (decl.kind == pxt.SK.VariableDeclaration || decl.kind == pxt.SK.Parameter)) {
                        var l = lookupCell(decl);
                        recordUse(decl, true);
                        proc.emitExpr(l.storeByRef(src));
                    }
                    else {
                        unhandled(trg, "target identifier");
                    }
                }
                else if (trg.kind == pxt.SK.PropertyAccessExpression) {
                    proc.emitExpr(pxt.ir.op(EK.Store, [cachedTrg || emitExpr(trg), src]));
                }
                else if (trg.kind == pxt.SK.ElementAccessExpression) {
                    proc.emitExpr(emitIndexedAccess(trg, src));
                }
                else {
                    unhandled(trg, "assignment target");
                }
            }
            function handleAssignment(node) {
                var src = pxt.ir.shared(emitExpr(node.right));
                emitStore(node.left, src);
                if (isRefType(typeOf(node.right)))
                    src = pxt.ir.op(EK.Incr, [src]);
                return src;
            }
            function rtcallMask(name, args, callingConv, append) {
                if (callingConv === void 0) { callingConv = pxt.ir.CallingConvention.Plain; }
                if (append === void 0) { append = null; }
                var args2 = args.map(emitExpr);
                if (append)
                    args2 = args2.concat(append);
                return pxt.ir.rtcallMask(name, getMask(args), callingConv, args2);
            }
            function emitInJmpValue(expr) {
                var lbl = proc.mkLabel("ldjmp");
                proc.emitJmp(lbl, expr, pxt.ir.JmpMode.Always);
                proc.emitLbl(lbl);
            }
            function emitLazyBinaryExpression(node) {
                var lbl = proc.mkLabel("lazy");
                // TODO what if the value is of ref type?
                if (node.operatorToken.kind == pxt.SK.BarBarToken) {
                    proc.emitJmp(lbl, emitExpr(node.left), pxt.ir.JmpMode.IfNotZero);
                }
                else if (node.operatorToken.kind == pxt.SK.AmpersandAmpersandToken) {
                    proc.emitJmpZ(lbl, emitExpr(node.left));
                }
                else {
                    pxt.oops();
                }
                proc.emitJmp(lbl, emitExpr(node.right), pxt.ir.JmpMode.Always);
                proc.emitLbl(lbl);
                return pxt.ir.op(EK.JmpValue, []);
            }
            function stripEquals(k) {
                switch (k) {
                    case pxt.SK.PlusEqualsToken: return pxt.SK.PlusToken;
                    case pxt.SK.MinusEqualsToken: return pxt.SK.MinusToken;
                    case pxt.SK.AsteriskEqualsToken: return pxt.SK.AsteriskToken;
                    case pxt.SK.AsteriskAsteriskEqualsToken: return pxt.SK.AsteriskAsteriskToken;
                    case pxt.SK.SlashEqualsToken: return pxt.SK.SlashToken;
                    case pxt.SK.PercentEqualsToken: return pxt.SK.PercentToken;
                    case pxt.SK.LessThanLessThanEqualsToken: return pxt.SK.LessThanLessThanToken;
                    case pxt.SK.GreaterThanGreaterThanEqualsToken: return pxt.SK.GreaterThanGreaterThanToken;
                    case pxt.SK.GreaterThanGreaterThanGreaterThanEqualsToken: return pxt.SK.GreaterThanGreaterThanGreaterThanToken;
                    case pxt.SK.AmpersandEqualsToken: return pxt.SK.AmpersandToken;
                    case pxt.SK.BarEqualsToken: return pxt.SK.BarToken;
                    case pxt.SK.CaretEqualsToken: return pxt.SK.CaretToken;
                    default: return pxt.SK.Unknown;
                }
            }
            function emitBrk(node) {
                if (!opts.breakpoints)
                    return;
                var brk = pxt.U.lookup(brkMap, nodeKey(node));
                if (!brk) {
                    var src_1 = ts.getSourceFileOfNode(node);
                    if (opts.justMyCode && pxt.U.startsWith(src_1.fileName, "pxt_modules"))
                        return;
                    var pos = node.pos;
                    while (/^\s$/.exec(src_1.text[pos]))
                        pos++;
                    var p = ts.getLineAndCharacterOfPosition(src_1, pos);
                    brk = {
                        id: res.breakpoints.length,
                        isDebuggerStmt: node.kind == pxt.SK.DebuggerStatement,
                        fileName: src_1.fileName,
                        start: pos,
                        length: node.end - pos,
                        line: p.line,
                        character: p.character
                    };
                    brkMap[nodeKey(node)] = brk;
                    res.breakpoints.push(brk);
                }
                var st = pxt.ir.stmt(pxt.ir.SK.Breakpoint, null);
                st.breakpointInfo = brk;
                proc.emit(st);
            }
            function simpleInstruction(k) {
                switch (k) {
                    case pxt.SK.PlusToken: return "thumb::adds";
                    case pxt.SK.MinusToken: return "thumb::subs";
                    // we could expose __aeabi_idiv directly...
                    case pxt.SK.SlashToken: return "Number_::div";
                    case pxt.SK.PercentToken: return "Number_::mod";
                    case pxt.SK.AsteriskToken: return "thumb::muls";
                    case pxt.SK.AmpersandToken: return "thumb::ands";
                    case pxt.SK.BarToken: return "thumb::orrs";
                    case pxt.SK.CaretToken: return "thumb::eors";
                    case pxt.SK.LessThanLessThanToken: return "thumb::lsls";
                    case pxt.SK.GreaterThanGreaterThanToken: return "thumb::asrs";
                    case pxt.SK.GreaterThanGreaterThanGreaterThanToken: return "thumb::lsrs";
                    // these could be compiled to branches butthis is more code-size efficient
                    case pxt.SK.LessThanEqualsToken: return "Number_::le";
                    case pxt.SK.LessThanToken: return "Number_::lt";
                    case pxt.SK.GreaterThanEqualsToken: return "Number_::ge";
                    case pxt.SK.GreaterThanToken: return "Number_::gt";
                    case pxt.SK.EqualsEqualsToken:
                    case pxt.SK.EqualsEqualsEqualsToken:
                        return "Number_::eq";
                    case pxt.SK.ExclamationEqualsEqualsToken:
                    case pxt.SK.ExclamationEqualsToken:
                        return "Number_::neq";
                    default: return null;
                }
            }
            function emitBinaryExpression(node) {
                if (node.operatorToken.kind == pxt.SK.EqualsToken) {
                    return handleAssignment(node);
                }
                var lt = typeOf(node.left);
                var rt = typeOf(node.right);
                var shim = function (n) { return rtcallMask(n, [node.left, node.right]); };
                if ((lt.flags & ts.TypeFlags.Number) && (rt.flags & ts.TypeFlags.Number)) {
                    var noEq = stripEquals(node.operatorToken.kind);
                    var shimName = simpleInstruction(noEq || node.operatorToken.kind);
                    if (!shimName)
                        unhandled(node.operatorToken, "numeric operator");
                    if (noEq)
                        return emitIncrement(node.left, shimName, false, node.right);
                    return shim(shimName);
                }
                if (node.operatorToken.kind == pxt.SK.PlusToken) {
                    if ((lt.flags & ts.TypeFlags.String) || (rt.flags & ts.TypeFlags.String)) {
                        return pxt.ir.rtcallMask("String_::concat", 3, pxt.ir.CallingConvention.Plain, [
                            emitAsString(node.left),
                            emitAsString(node.right)]);
                    }
                }
                if (node.operatorToken.kind == pxt.SK.PlusEqualsToken &&
                    (lt.flags & ts.TypeFlags.String)) {
                    var tmp = prepForAssignment(node.left);
                    var post = pxt.ir.shared(pxt.ir.rtcallMask("String_::concat", 3, pxt.ir.CallingConvention.Plain, [
                        tmp.left,
                        emitAsString(node.right)]));
                    emitStore(node.left, post, tmp.storeCache);
                    return pxt.ir.op(EK.Incr, [post]);
                }
                if ((lt.flags & ts.TypeFlags.String) && (rt.flags & ts.TypeFlags.String)) {
                    switch (node.operatorToken.kind) {
                        case pxt.SK.LessThanEqualsToken:
                        case pxt.SK.LessThanToken:
                        case pxt.SK.GreaterThanEqualsToken:
                        case pxt.SK.GreaterThanToken:
                        case pxt.SK.EqualsEqualsToken:
                        case pxt.SK.EqualsEqualsEqualsToken:
                        case pxt.SK.ExclamationEqualsEqualsToken:
                        case pxt.SK.ExclamationEqualsToken:
                            return pxt.ir.rtcall(simpleInstruction(node.operatorToken.kind), [shim("String_::compare"), pxt.ir.numlit(0)]);
                        default:
                            unhandled(node.operatorToken, "numeric operator");
                    }
                }
                switch (node.operatorToken.kind) {
                    case pxt.SK.EqualsEqualsToken:
                    case pxt.SK.EqualsEqualsEqualsToken:
                        return shim("Number_::eq");
                    case pxt.SK.ExclamationEqualsEqualsToken:
                    case pxt.SK.ExclamationEqualsToken:
                        return shim("Number_::neq");
                    case pxt.SK.BarBarToken:
                    case pxt.SK.AmpersandAmpersandToken:
                        return emitLazyBinaryExpression(node);
                    default:
                        throw unhandled(node.operatorToken, "generic operator");
                }
            }
            function emitAsString(e) {
                var r = emitExpr(e);
                // TS returns 'any' as type of template elements
                if (isStringLiteral(e))
                    return r;
                var tp = typeOf(e);
                if (tp.flags & ts.TypeFlags.Number)
                    return pxt.ir.rtcall("Number_::toString", [r]);
                else if (tp.flags & ts.TypeFlags.Boolean)
                    return pxt.ir.rtcall("Boolean_::toString", [r]);
                else if (tp.flags & ts.TypeFlags.String)
                    return r; // OK
                else
                    throw userError(lf("don't know how to convert to string"));
            }
            function emitConditionalExpression(node) {
                var els = proc.mkLabel("condexprz");
                var fin = proc.mkLabel("condexprfin");
                // TODO what if the value is of ref type?
                proc.emitJmp(els, emitExpr(node.condition), pxt.ir.JmpMode.IfZero);
                proc.emitJmp(fin, emitExpr(node.whenTrue), pxt.ir.JmpMode.Always);
                proc.emitLbl(els);
                proc.emitJmp(fin, emitExpr(node.whenFalse), pxt.ir.JmpMode.Always);
                proc.emitLbl(fin);
                return pxt.ir.op(EK.JmpValue, []);
            }
            function emitSpreadElementExpression(node) { }
            function emitYieldExpression(node) { }
            function emitBlock(node) {
                node.statements.forEach(emit);
            }
            function emitVariableStatement(node) {
                if (node.flags & ts.NodeFlags.Ambient)
                    return;
                node.declarationList.declarations.forEach(emit);
            }
            function emitExpressionStatement(node) {
                emitExprAsStmt(node.expression);
            }
            function emitIfStatement(node) {
                emitBrk(node);
                var elseLbl = proc.mkLabel("else");
                proc.emitJmpZ(elseLbl, emitExpr(node.expression));
                emit(node.thenStatement);
                var afterAll = proc.mkLabel("afterif");
                proc.emitJmp(afterAll);
                proc.emitLbl(elseLbl);
                if (node.elseStatement)
                    emit(node.elseStatement);
                proc.emitLbl(afterAll);
            }
            function getLabels(stmt) {
                var id = ts.getNodeId(stmt);
                return {
                    fortop: ".fortop." + id,
                    cont: ".cont." + id,
                    brk: ".brk." + id,
                    ret: ".ret." + id
                };
            }
            function emitDoStatement(node) {
                emitBrk(node);
                var l = getLabels(node);
                proc.emitLblDirect(l.cont);
                emit(node.statement);
                proc.emitJmpZ(l.brk, emitExpr(node.expression));
                proc.emitJmp(l.cont);
                proc.emitLblDirect(l.brk);
            }
            function emitWhileStatement(node) {
                emitBrk(node);
                var l = getLabels(node);
                proc.emitLblDirect(l.cont);
                proc.emitJmpZ(l.brk, emitExpr(node.expression));
                emit(node.statement);
                proc.emitJmp(l.cont);
                proc.emitLblDirect(l.brk);
            }
            function emitExprAsStmt(node) {
                if (!node)
                    return;
                switch (node.kind) {
                    case pxt.SK.Identifier:
                    case pxt.SK.StringLiteral:
                    case pxt.SK.NumericLiteral:
                    case pxt.SK.NullKeyword:
                        return; // no-op
                }
                emitBrk(node);
                var v = emitExpr(node);
                var a = typeOf(node);
                if (!(a.flags & ts.TypeFlags.Void)) {
                    if (isRefType(a)) {
                        // will pop
                        v = pxt.ir.op(EK.Decr, [v]);
                    }
                }
                proc.emitExpr(v);
                proc.stackEmpty();
            }
            function emitForStatement(node) {
                if (node.initializer && node.initializer.kind == pxt.SK.VariableDeclarationList)
                    node.initializer.declarations.forEach(emit);
                else
                    emitExprAsStmt(node.initializer);
                emitBrk(node);
                var l = getLabels(node);
                proc.emitLblDirect(l.fortop);
                if (node.condition)
                    proc.emitJmpZ(l.brk, emitExpr(node.condition));
                emit(node.statement);
                proc.emitLblDirect(l.cont);
                emitExprAsStmt(node.incrementor);
                proc.emitJmp(l.fortop);
                proc.emitLblDirect(l.brk);
            }
            function emitForInOrForOfStatement(node) { }
            function emitBreakOrContinueStatement(node) {
                emitBrk(node);
                var label = node.label ? node.label.text : null;
                var isBreak = node.kind == pxt.SK.BreakStatement;
                function findOuter(parent) {
                    if (!parent)
                        return null;
                    if (label && parent.kind == pxt.SK.LabeledStatement &&
                        parent.label.text == label)
                        return parent.statement;
                    if (parent.kind == pxt.SK.SwitchStatement && !label && isBreak)
                        return parent;
                    if (!label && ts.isIterationStatement(parent, false))
                        return parent;
                    return findOuter(parent.parent);
                }
                var stmt = findOuter(node);
                if (!stmt)
                    error(node, lf("cannot find outer loop"));
                else {
                    var l = getLabels(stmt);
                    if (node.kind == pxt.SK.ContinueStatement) {
                        if (!ts.isIterationStatement(stmt, false))
                            error(node, lf("continue on non-loop"));
                        else
                            proc.emitJmp(l.cont);
                    }
                    else if (node.kind == pxt.SK.BreakStatement) {
                        proc.emitJmp(l.brk);
                    }
                    else {
                        pxt.oops();
                    }
                }
            }
            function emitReturnStatement(node) {
                emitBrk(node);
                var v = null;
                if (node.expression) {
                    v = emitExpr(node.expression);
                }
                else if (funcHasReturn(proc.action)) {
                    v = pxt.ir.numlit(null); // == return undefined
                }
                proc.emitJmp(getLabels(proc.action).ret, v, pxt.ir.JmpMode.Always);
            }
            function emitWithStatement(node) { }
            function emitSwitchStatement(node) {
                emitBrk(node);
                if (!(typeOf(node.expression).flags & (ts.TypeFlags.Number | ts.TypeFlags.Enum))) {
                    userError(lf("switch() only supported over numbers or enums"));
                }
                var l = getLabels(node);
                var hasDefault = false;
                var expr = emitExpr(node.expression);
                emitInJmpValue(expr);
                var lbls = node.caseBlock.clauses.map(function (cl) {
                    var lbl = proc.mkLabel("switch");
                    if (cl.kind == pxt.SK.CaseClause) {
                        var cc = cl;
                        proc.emitJmp(lbl, emitExpr(cc.expression), pxt.ir.JmpMode.IfJmpValEq);
                    }
                    else {
                        hasDefault = true;
                        proc.emitJmp(lbl);
                    }
                    return lbl;
                });
                if (!hasDefault)
                    proc.emitJmp(l.brk);
                node.caseBlock.clauses.forEach(function (cl, i) {
                    proc.emitLbl(lbls[i]);
                    cl.statements.forEach(emit);
                });
                proc.emitLblDirect(l.brk);
            }
            function emitCaseOrDefaultClause(node) { }
            function emitLabeledStatement(node) {
                var l = getLabels(node.statement);
                emit(node.statement);
                proc.emitLblDirect(l.brk);
            }
            function emitThrowStatement(node) { }
            function emitTryStatement(node) { }
            function emitCatchClause(node) { }
            function emitDebuggerStatement(node) {
                emitBrk(node);
            }
            function emitVariableDeclaration(node) {
                if (!isUsed(node))
                    return;
                typeCheckVar(node);
                var loc = isGlobalVar(node) ?
                    lookupCell(node) : proc.mkLocal(node, getVarInfo(node));
                if (loc.isByRefLocal()) {
                    proc.emitClrIfRef(loc); // we might be in a loop
                    proc.emitExpr(loc.storeDirect(pxt.ir.rtcall("pxtrt::mkloc" + loc.refSuff(), [])));
                }
                // TODO make sure we don't emit code for top-level globals being initialized to zero
                if (node.initializer) {
                    emitBrk(node);
                    proc.emitExpr(loc.storeByRef(emitExpr(node.initializer)));
                    proc.stackEmpty();
                }
            }
            function emitClassExpression(node) { }
            function emitClassDeclaration(node) {
                if (node.typeParameters)
                    userError(lf("generic classes not supported"));
                if (node.heritageClauses)
                    userError(lf("inheritance not supported"));
                node.members.forEach(emit);
            }
            function emitInterfaceDeclaration(node) {
                // nothing
            }
            function emitEnumDeclaration(node) {
            }
            function emitEnumMember(node) { }
            function emitModuleDeclaration(node) {
                if (node.flags & ts.NodeFlags.Ambient)
                    return;
                emit(node.body);
            }
            function emitImportDeclaration(node) { }
            function emitImportEqualsDeclaration(node) { }
            function emitExportDeclaration(node) { }
            function emitExportAssignment(node) { }
            function emitSourceFileNode(node) {
                node.statements.forEach(emit);
            }
            function handleError(node, e) {
                if (!e.ksEmitterUserError)
                    console.log(e.stack);
                error(node, e.message);
            }
            function emitExpr(node) {
                try {
                    var expr = emitExprCore(node);
                    if (expr.isExpr())
                        return expr;
                    throw new Error("expecting expression");
                }
                catch (e) {
                    handleError(node, e);
                    return pxt.ir.numlit(0);
                }
            }
            function emit(node) {
                try {
                    emitNodeCore(node);
                }
                catch (e) {
                    handleError(node, e);
                    return null;
                }
            }
            function emitNodeCore(node) {
                switch (node.kind) {
                    case pxt.SK.SourceFile:
                        return emitSourceFileNode(node);
                    case pxt.SK.InterfaceDeclaration:
                        return emitInterfaceDeclaration(node);
                    case pxt.SK.VariableStatement:
                        return emitVariableStatement(node);
                    case pxt.SK.ModuleDeclaration:
                        return emitModuleDeclaration(node);
                    case pxt.SK.EnumDeclaration:
                        return emitEnumDeclaration(node);
                    //case SyntaxKind.MethodSignature:
                    case pxt.SK.FunctionDeclaration:
                    case pxt.SK.Constructor:
                    case pxt.SK.MethodDeclaration:
                        emitFunctionDeclaration(node);
                        return;
                    case pxt.SK.ExpressionStatement:
                        return emitExpressionStatement(node);
                    case pxt.SK.Block:
                    case pxt.SK.ModuleBlock:
                        return emitBlock(node);
                    case pxt.SK.VariableDeclaration:
                        return emitVariableDeclaration(node);
                    case pxt.SK.IfStatement:
                        return emitIfStatement(node);
                    case pxt.SK.WhileStatement:
                        return emitWhileStatement(node);
                    case pxt.SK.DoStatement:
                        return emitDoStatement(node);
                    case pxt.SK.ForStatement:
                        return emitForStatement(node);
                    case pxt.SK.ContinueStatement:
                    case pxt.SK.BreakStatement:
                        return emitBreakOrContinueStatement(node);
                    case pxt.SK.LabeledStatement:
                        return emitLabeledStatement(node);
                    case pxt.SK.ReturnStatement:
                        return emitReturnStatement(node);
                    case pxt.SK.ClassDeclaration:
                        return emitClassDeclaration(node);
                    case pxt.SK.PropertyDeclaration:
                    case pxt.SK.PropertyAssignment:
                        return emitPropertyAssignment(node);
                    case pxt.SK.SwitchStatement:
                        return emitSwitchStatement(node);
                    case pxt.SK.TypeAliasDeclaration:
                        // skip
                        return;
                    case pxt.SK.DebuggerStatement:
                        return emitDebuggerStatement(node);
                    default:
                        unhandled(node);
                }
            }
            function emitExprCore(node) {
                switch (node.kind) {
                    case pxt.SK.NullKeyword:
                        var v = node.valueOverride;
                        return pxt.ir.numlit(v || null);
                    case pxt.SK.TrueKeyword:
                        return pxt.ir.numlit(true);
                    case pxt.SK.FalseKeyword:
                        return pxt.ir.numlit(false);
                    case pxt.SK.TemplateHead:
                    case pxt.SK.TemplateMiddle:
                    case pxt.SK.TemplateTail:
                    case pxt.SK.NumericLiteral:
                    case pxt.SK.StringLiteral:
                    case pxt.SK.NoSubstitutionTemplateLiteral:
                        //case SyntaxKind.RegularExpressionLiteral:                    
                        return emitLiteral(node);
                    case pxt.SK.PropertyAccessExpression:
                        return emitPropertyAccess(node);
                    case pxt.SK.BinaryExpression:
                        return emitBinaryExpression(node);
                    case pxt.SK.PrefixUnaryExpression:
                        return emitPrefixUnaryExpression(node);
                    case pxt.SK.PostfixUnaryExpression:
                        return emitPostfixUnaryExpression(node);
                    case pxt.SK.ElementAccessExpression:
                        return emitIndexedAccess(node);
                    case pxt.SK.ParenthesizedExpression:
                        return emitParenExpression(node);
                    case pxt.SK.TypeAssertionExpression:
                        return emitTypeAssertion(node);
                    case pxt.SK.ArrayLiteralExpression:
                        return emitArrayLiteral(node);
                    case pxt.SK.NewExpression:
                        return emitNewExpression(node);
                    case pxt.SK.ThisKeyword:
                        return emitThis(node);
                    case pxt.SK.CallExpression:
                        return emitCallExpression(node);
                    case pxt.SK.FunctionExpression:
                    case pxt.SK.ArrowFunction:
                        return emitFunctionDeclaration(node);
                    case pxt.SK.Identifier:
                        return emitIdentifier(node);
                    case pxt.SK.ConditionalExpression:
                        return emitConditionalExpression(node);
                    case pxt.SK.AsExpression:
                        return emitAsExpression(node);
                    case ts.SyntaxKind.TemplateExpression:
                        return emitTemplateExpression(node);
                    default:
                        unhandled(node);
                        return null;
                }
            }
        }
        pxt.compileBinary = compileBinary;
        function emptyExtInfo() {
            return {
                functions: [],
                generatedFiles: {},
                extensionFiles: {},
                errors: "",
                sha: "",
                compileData: "",
                shimsDTS: "",
                enumsDTS: "",
                onlyPublic: true,
                yotta: {
                    dependencies: {},
                    config: {}
                }
            };
        }
        pxt.emptyExtInfo = emptyExtInfo;
        var Binary = (function () {
            function Binary() {
                this.procs = [];
                this.globals = [];
                this.finalPass = false;
                this.writeFile = function (fn, cont) { };
                this.strings = {};
                this.otherLiterals = [];
                this.lblNo = 0;
            }
            Binary.prototype.isDataRecord = function (s) {
                if (!s)
                    return false;
                var m = /^:......(..)/.exec(s);
                pxt.assert(!!m);
                return m[1] == "00";
            };
            Binary.prototype.addProc = function (proc) {
                this.procs.push(proc);
                proc.seqNo = this.procs.length;
                //proc.binary = this
            };
            Binary.prototype.emitString = function (s) {
                if (this.strings.hasOwnProperty(s))
                    return this.strings[s];
                var lbl = "_str" + this.lblNo++;
                this.strings[s] = lbl;
                return lbl;
            };
            return Binary;
        }());
        pxt.Binary = Binary;
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
/// <reference path="../../built/typescriptServices.d.ts"/>
// Enforce order:
/// <reference path="util.ts"/>
/// <reference path="cloud.ts"/>
/// <reference path="thumb.ts"/>
/// <reference path="ir.ts"/>
/// <reference path="emitter.ts"/>
/// <reference path="backthumb.ts"/>
/// <reference path="decompiler.ts"/>
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        function getTsCompilerOptions(opts) {
            var options = ts.getDefaultCompilerOptions();
            options.target = ts.ScriptTarget.ES5;
            options.module = ts.ModuleKind.None;
            options.noImplicitAny = true;
            options.noImplicitReturns = true;
            return options;
        }
        pxt.getTsCompilerOptions = getTsCompilerOptions;
        function nodeLocationInfo(node) {
            var file = ts.getSourceFileOfNode(node);
            var _a = ts.getLineAndCharacterOfPosition(file, node.pos), line = _a.line, character = _a.character;
            var r = {
                start: node.pos,
                length: node.end - node.pos,
                line: line,
                character: character,
                fileName: file.fileName,
            };
            return r;
        }
        pxt.nodeLocationInfo = nodeLocationInfo;
        function patchUpDiagnostics(diags) {
            var highPri = diags.filter(function (d) { return d.code == 1148; });
            if (highPri.length > 0)
                diags = highPri;
            return diags.map(function (d) {
                if (!d.file) {
                    var rr = {
                        code: d.code,
                        start: d.start,
                        length: d.length,
                        line: 0,
                        character: 0,
                        messageText: d.messageText,
                        category: d.category,
                        fileName: "?",
                    };
                    return rr;
                }
                var pos = ts.getLineAndCharacterOfPosition(d.file, d.start);
                var r = {
                    code: d.code,
                    start: d.start,
                    length: d.length,
                    line: pos.line,
                    character: pos.character,
                    messageText: d.messageText,
                    category: d.category,
                    fileName: d.file.fileName,
                };
                if (r.code == 1148)
                    r.messageText = pxt.Util.lf("all symbols in top-level scope are always exported; please use a namespace if you want to export only some");
                return r;
            });
        }
        pxt.patchUpDiagnostics = patchUpDiagnostics;
        function compile(opts) {
            var startTime = Date.now();
            var res = {
                outfiles: {},
                diagnostics: [],
                success: false,
                times: {},
            };
            var fileText = opts.fileSystem;
            var setParentNodes = true;
            var options = getTsCompilerOptions(opts);
            var host = {
                getSourceFile: function (fn, v, err) {
                    var text = "";
                    if (fileText.hasOwnProperty(fn)) {
                        text = fileText[fn];
                    }
                    else {
                        if (err)
                            err("File not found: " + fn);
                    }
                    return ts.createSourceFile(fn, text, v, setParentNodes);
                },
                fileExists: function (fn) { return fileText.hasOwnProperty(fn); },
                getCanonicalFileName: function (fn) { return fn; },
                getDefaultLibFileName: function () { return "no-default-lib.d.ts"; },
                writeFile: function (fileName, data, writeByteOrderMark, onError) {
                    res.outfiles[fileName] = data;
                },
                getCurrentDirectory: function () { return "."; },
                useCaseSensitiveFileNames: function () { return true; },
                getNewLine: function () { return "\n"; },
                readFile: function (fn) { return fileText[fn] || ""; },
                directoryExists: function (dn) { return true; },
            };
            if (!opts.sourceFiles)
                opts.sourceFiles = Object.keys(opts.fileSystem);
            var tsFiles = opts.sourceFiles.filter(function (f) { return pxt.U.endsWith(f, ".ts"); });
            var program = ts.createProgram(tsFiles, options, host);
            // First get and report any syntactic errors.
            res.diagnostics = patchUpDiagnostics(program.getSyntacticDiagnostics());
            if (res.diagnostics.length > 0)
                return res;
            // If we didn't have any syntactic errors, then also try getting the global and
            // semantic errors.
            res.diagnostics = patchUpDiagnostics(program.getOptionsDiagnostics().concat(program.getGlobalDiagnostics()));
            if (res.diagnostics.length == 0) {
                res.diagnostics = patchUpDiagnostics(program.getSemanticDiagnostics());
            }
            var emitStart = Date.now();
            res.times["typescript"] = emitStart - startTime;
            if (opts.ast) {
                res.ast = program;
            }
            if (opts.ast || res.diagnostics.length == 0) {
                var binOutput = pxt.compileBinary(program, host, opts, res);
                res.times["compilebinary"] = Date.now() - emitStart;
                res.diagnostics = patchUpDiagnostics(binOutput.diagnostics);
            }
            if (res.diagnostics.length == 0)
                res.success = true;
            for (var _i = 0, _a = opts.sourceFiles; _i < _a.length; _i++) {
                var f = _a[_i];
                if (pxt.Util.startsWith(f, "built/"))
                    res.outfiles[f.slice(6)] = opts.fileSystem[f];
            }
            return res;
        }
        pxt.compile = compile;
        function decompile(opts, fileName) {
            var resp = compile(opts);
            if (!resp.success)
                return resp;
            var file = resp.ast.getSourceFile(fileName);
            var apis = pxt.getApiInfo(resp.ast);
            var blocksInfo = ts.pxt.getBlocksInfo(apis);
            var bresp = ts.pxt.decompiler.decompileToBlocks(blocksInfo, file);
            return bresp;
        }
        pxt.decompile = decompile;
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        var TokenKind;
        (function (TokenKind) {
            TokenKind[TokenKind["None"] = 0] = "None";
            TokenKind[TokenKind["Whitespace"] = 1] = "Whitespace";
            TokenKind[TokenKind["Identifier"] = 2] = "Identifier";
            TokenKind[TokenKind["Keyword"] = 3] = "Keyword";
            TokenKind[TokenKind["Operator"] = 4] = "Operator";
            TokenKind[TokenKind["CommentLine"] = 5] = "CommentLine";
            TokenKind[TokenKind["CommentBlock"] = 6] = "CommentBlock";
            TokenKind[TokenKind["NewLine"] = 7] = "NewLine";
            TokenKind[TokenKind["Literal"] = 8] = "Literal";
            TokenKind[TokenKind["Tree"] = 9] = "Tree";
            TokenKind[TokenKind["Block"] = 10] = "Block";
            TokenKind[TokenKind["EOF"] = 11] = "EOF";
        })(TokenKind || (TokenKind = {}));
        var inputForMsg = "";
        function lookupKind(k) {
            for (var _i = 0, _a = Object.keys(ts.SyntaxKind); _i < _a.length; _i++) {
                var o = _a[_i];
                if (ts.SyntaxKind[o] === k)
                    return o;
            }
            return "?";
        }
        var SK = ts.SyntaxKind;
        function showMsg(t, msg) {
            var pos = t.pos;
            var ctx = inputForMsg.slice(pos - 20, pos) + "<*>" + inputForMsg.slice(pos, pos + 20);
            console.log(ctx.replace(/\n/g, "<NL>"), ": L ", t.lineNo, msg);
        }
        function infixOperatorPrecedence(kind) {
            switch (kind) {
                case SK.CommaToken:
                    return 2;
                case SK.EqualsToken:
                case SK.PlusEqualsToken:
                case SK.MinusEqualsToken:
                case SK.AsteriskEqualsToken:
                case SK.AsteriskAsteriskEqualsToken:
                case SK.SlashEqualsToken:
                case SK.PercentEqualsToken:
                case SK.LessThanLessThanEqualsToken:
                case SK.GreaterThanGreaterThanEqualsToken:
                case SK.GreaterThanGreaterThanGreaterThanEqualsToken:
                case SK.AmpersandEqualsToken:
                case SK.BarEqualsToken:
                case SK.CaretEqualsToken:
                    return 5;
                case SK.QuestionToken:
                case SK.ColonToken:
                    return 7; // ternary operator
                case SK.BarBarToken:
                    return 10;
                case SK.AmpersandAmpersandToken:
                    return 20;
                case SK.BarToken:
                    return 30;
                case SK.CaretToken:
                    return 40;
                case SK.AmpersandToken:
                    return 50;
                case SK.EqualsEqualsToken:
                case SK.ExclamationEqualsToken:
                case SK.EqualsEqualsEqualsToken:
                case SK.ExclamationEqualsEqualsToken:
                    return 60;
                case SK.LessThanToken:
                case SK.GreaterThanToken:
                case SK.LessThanEqualsToken:
                case SK.GreaterThanEqualsToken:
                case SK.InstanceOfKeyword:
                case SK.InKeyword:
                case SK.AsKeyword:
                    return 70;
                case SK.LessThanLessThanToken:
                case SK.GreaterThanGreaterThanToken:
                case SK.GreaterThanGreaterThanGreaterThanToken:
                    return 80;
                case SK.PlusToken:
                case SK.MinusToken:
                    return 90;
                case SK.AsteriskToken:
                case SK.SlashToken:
                case SK.PercentToken:
                    return 100;
                case SK.AsteriskAsteriskToken:
                    return 101;
                case SK.DotToken:
                    return 120;
                default:
                    return 0;
            }
        }
        function getTokKind(kind) {
            switch (kind) {
                case SK.EndOfFileToken:
                    return TokenKind.EOF;
                case SK.SingleLineCommentTrivia:
                    return TokenKind.CommentLine;
                case SK.MultiLineCommentTrivia:
                    return TokenKind.CommentBlock;
                case SK.NewLineTrivia:
                    return TokenKind.NewLine;
                case SK.WhitespaceTrivia:
                    return TokenKind.Whitespace;
                case SK.ShebangTrivia:
                case SK.ConflictMarkerTrivia:
                    return TokenKind.CommentBlock;
                case SK.NumericLiteral:
                case SK.StringLiteral:
                case SK.RegularExpressionLiteral:
                case SK.NoSubstitutionTemplateLiteral:
                case SK.TemplateHead:
                case SK.TemplateMiddle:
                case SK.TemplateTail:
                    return TokenKind.Literal;
                case SK.Identifier:
                    return TokenKind.Identifier;
                default:
                    if (kind < SK.Identifier)
                        return TokenKind.Operator;
                    return TokenKind.Keyword;
            }
        }
        var brokenRegExps = false;
        function tokenize(input) {
            inputForMsg = input;
            var scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, input, function (msg) {
                var pos = scanner.getTextPos();
                console.log("scanner error", pos, msg.message);
            });
            var tokens = [];
            var braceBalance = 0;
            var templateLevel = -1;
            while (true) {
                var kind = scanner.scan();
                if (kind == SK.CloseBraceToken && braceBalance == templateLevel) {
                    templateLevel = -1;
                    kind = scanner.reScanTemplateToken();
                }
                if (brokenRegExps && kind == SK.SlashToken || kind == SK.SlashEqualsToken) {
                    var tmp = scanner.reScanSlashToken();
                    if (tmp == SK.RegularExpressionLiteral)
                        kind = tmp;
                }
                if (kind == SK.GreaterThanToken) {
                    kind = scanner.reScanGreaterToken();
                }
                var tok = {
                    kind: getTokKind(kind),
                    synKind: kind,
                    lineNo: 0,
                    pos: scanner.getTokenPos(),
                    text: scanner.getTokenText(),
                };
                if (kind == SK.OpenBraceToken)
                    braceBalance++;
                if (kind == SK.CloseBraceToken) {
                    if (--braceBalance < 0)
                        braceBalance = -10000000;
                }
                tokens.push(tok);
                if (kind == SK.TemplateHead || kind == SK.TemplateMiddle) {
                    templateLevel = braceBalance;
                }
                if (tok.kind == TokenKind.EOF)
                    break;
            }
            // Util.assert(tokens.map(t => t.text).join("") == input)
            return { tokens: tokens, braceBalance: braceBalance };
        }
        function skipWhitespace(tokens, i) {
            while (tokens[i] && tokens[i].kind == TokenKind.Whitespace)
                i++;
            return i;
        }
        // We do not want empty lines in the source to get lost - they serve as a sort of comment dividing parts of code
        // We turn them into empty comments here
        function emptyLinesToComments(tokens, cursorPos) {
            var output = [];
            var atLineBeg = true;
            var lineNo = 1;
            for (var i = 0; i < tokens.length; ++i) {
                if (atLineBeg) {
                    var bkp = i;
                    i = skipWhitespace(tokens, i);
                    if (tokens[i].kind == TokenKind.NewLine) {
                        var isCursor = false;
                        if (cursorPos >= 0 && tokens[i].pos >= cursorPos) {
                            cursorPos = -1;
                            isCursor = true;
                        }
                        output.push({
                            text: "",
                            kind: TokenKind.CommentLine,
                            pos: tokens[i].pos,
                            lineNo: lineNo,
                            synKind: SK.SingleLineCommentTrivia,
                            isCursor: isCursor
                        });
                    }
                    else {
                        i = bkp;
                    }
                }
                output.push(tokens[i]);
                tokens[i].lineNo = lineNo;
                if (tokens[i].kind == TokenKind.NewLine) {
                    atLineBeg = true;
                    lineNo++;
                }
                else {
                    atLineBeg = false;
                }
                if (cursorPos >= 0 && tokens[i].pos >= cursorPos) {
                    cursorPos = -1;
                }
            }
            return output;
        }
        // Add Tree tokens where needed
        function matchBraces(tokens) {
            var braceStack = [];
            var braceTop = function () { return braceStack[braceStack.length - 1]; };
            braceStack.push({
                synKind: SK.EndOfFileToken,
                token: {
                    children: [],
                },
            });
            var pushClose = function (tok, synKind) {
                var token = tok;
                token.children = [];
                token.kind = TokenKind.Tree;
                braceStack.push({ synKind: synKind, token: token });
            };
            for (var i = 0; i < tokens.length; ++i) {
                var token = tokens[i];
                var top_1 = braceStack[braceStack.length - 1];
                top_1.token.children.push(token);
                switch (token.kind) {
                    case TokenKind.Operator:
                        switch (token.synKind) {
                            case SK.OpenBraceToken:
                            case SK.OpenParenToken:
                            case SK.OpenBracketToken:
                                pushClose(token, token.synKind + 1);
                                break;
                            case SK.CloseBraceToken:
                            case SK.CloseParenToken:
                            case SK.CloseBracketToken:
                                top_1.token.children.pop();
                                while (true) {
                                    top_1 = braceStack.pop();
                                    if (top_1.synKind == token.synKind) {
                                        top_1.token.endToken = token;
                                        break;
                                    }
                                    // don't go past brace with other closing parens
                                    if (braceStack.length == 0 || top_1.synKind == SK.CloseBraceToken) {
                                        braceStack.push(top_1);
                                        break;
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                        break;
                }
            }
            return braceStack[0].token.children;
        }
        function mkEOF() {
            return {
                kind: TokenKind.EOF,
                synKind: SK.EndOfFileToken,
                pos: 0,
                lineNo: 0,
                text: ""
            };
        }
        function mkSpace(t, s) {
            return {
                kind: TokenKind.Whitespace,
                synKind: SK.WhitespaceTrivia,
                pos: t.pos - s.length,
                lineNo: t.lineNo,
                text: s
            };
        }
        function mkNewLine(t) {
            return {
                kind: TokenKind.NewLine,
                synKind: SK.NewLineTrivia,
                pos: t.pos,
                lineNo: t.lineNo,
                text: "\n"
            };
        }
        function mkBlock(toks) {
            return {
                kind: TokenKind.Block,
                synKind: SK.OpenBraceToken,
                pos: toks[0].pos,
                lineNo: toks[0].lineNo,
                stmts: [{ tokens: toks }],
                text: "{",
                endToken: null
            };
        }
        function mkVirtualTree(toks) {
            return {
                kind: TokenKind.Tree,
                synKind: SK.WhitespaceTrivia,
                pos: toks[0].pos,
                lineNo: toks[0].lineNo,
                children: toks,
                endToken: null,
                text: ""
            };
        }
        function isExprEnd(t) {
            if (!t)
                return false;
            switch (t.synKind) {
                case SK.IfKeyword:
                case SK.ElseKeyword:
                case SK.LetKeyword:
                case SK.ConstKeyword:
                case SK.VarKeyword:
                case SK.DoKeyword:
                case SK.WhileKeyword:
                case SK.SwitchKeyword:
                case SK.CaseKeyword:
                case SK.DefaultKeyword:
                case SK.ForKeyword:
                case SK.ReturnKeyword:
                case SK.BreakKeyword:
                case SK.ContinueKeyword:
                case SK.TryKeyword:
                case SK.CatchKeyword:
                case SK.FinallyKeyword:
                case SK.DeleteKeyword:
                case SK.FunctionKeyword:
                case SK.ClassKeyword:
                case SK.YieldKeyword:
                case SK.DebuggerKeyword:
                    return true;
                default:
                    return false;
            }
        }
        function delimitStmts(tokens, inStmtCtx, ctxToken) {
            if (ctxToken === void 0) { ctxToken = null; }
            var res = [];
            var i = 0;
            var currCtxToken;
            var didBlock = false;
            tokens = tokens.concat([mkEOF()]);
            while (tokens[i].kind != TokenKind.EOF) {
                var stmtBeg = i;
                skipToStmtEnd();
                pxt.Util.assert(i > stmtBeg, "Error at " + tokens[i].text);
                addStatement(tokens.slice(stmtBeg, i));
            }
            return res;
            function addStatement(tokens) {
                if (inStmtCtx)
                    tokens = trimWhitespace(tokens);
                if (tokens.length == 0)
                    return;
                tokens.forEach(delimitIn);
                tokens = injectBlocks(tokens);
                var merge = false;
                if (inStmtCtx && res.length > 0) {
                    var prev = res[res.length - 1];
                    var prevKind = prev.tokens[0].synKind;
                    var thisKind = tokens[0].synKind;
                    if ((prevKind == SK.IfKeyword && thisKind == SK.ElseKeyword) ||
                        (prevKind == SK.TryKeyword && thisKind == SK.CatchKeyword) ||
                        (prevKind == SK.TryKeyword && thisKind == SK.FinallyKeyword) ||
                        (prevKind == SK.CatchKeyword && thisKind == SK.FinallyKeyword)) {
                        tokens.unshift(mkSpace(tokens[0], " "));
                        pxt.Util.pushRange(res[res.length - 1].tokens, tokens);
                        return;
                    }
                }
                res.push({
                    tokens: tokens
                });
            }
            function injectBlocks(tokens) {
                var output = [];
                var i = 0;
                while (i < tokens.length) {
                    if (tokens[i].blockSpanLength) {
                        var inner = tokens.slice(i, i + tokens[i].blockSpanLength);
                        var isVirtual = !!inner[0].blockSpanIsVirtual;
                        delete inner[0].blockSpanLength;
                        delete inner[0].blockSpanIsVirtual;
                        i += inner.length;
                        inner = injectBlocks(inner);
                        if (isVirtual) {
                            output.push(mkVirtualTree(inner));
                        }
                        else {
                            output.push(mkSpace(inner[0], " "));
                            output.push(mkBlock(trimWhitespace(inner)));
                        }
                    }
                    else {
                        output.push(tokens[i++]);
                    }
                }
                return output;
            }
            function delimitIn(t) {
                if (t.kind == TokenKind.Tree) {
                    var tree = t;
                    tree.children = pxt.Util.concat(delimitStmts(tree.children, false, tree).map(function (s) { return s.tokens; }));
                }
            }
            function nextNonWs(stopOnNewLine) {
                if (stopOnNewLine === void 0) { stopOnNewLine = false; }
                while (true) {
                    i++;
                    switch (tokens[i].kind) {
                        case TokenKind.Whitespace:
                        case TokenKind.CommentBlock:
                        case TokenKind.CommentLine:
                            break;
                        case TokenKind.NewLine:
                            if (stopOnNewLine)
                                break;
                            break;
                        default:
                            return;
                    }
                }
            }
            function skipOptionalNewLine() {
                while (tokens[i].kind == TokenKind.Whitespace) {
                    i++;
                }
                if (tokens[i].kind == TokenKind.NewLine)
                    i++;
            }
            function skipUntilBlock() {
                while (true) {
                    i++;
                    switch (tokens[i].kind) {
                        case TokenKind.EOF:
                            return;
                        case TokenKind.Tree:
                            if (tokens[i].synKind == SK.OpenBraceToken) {
                                i--;
                                expectBlock();
                                return;
                            }
                            break;
                    }
                }
            }
            function handleBlock() {
                pxt.Util.assert(tokens[i].synKind == SK.OpenBraceToken);
                var tree = tokens[i];
                pxt.Util.assert(tree.kind == TokenKind.Tree);
                var blk = tokens[i];
                blk.stmts = delimitStmts(tree.children, true, currCtxToken);
                delete tree.children;
                blk.kind = TokenKind.Block;
                i++;
                didBlock = true;
            }
            function expectBlock() {
                var begIdx = i + 1;
                nextNonWs();
                if (tokens[i].synKind == SK.OpenBraceToken) {
                    handleBlock();
                    skipOptionalNewLine();
                }
                else {
                    skipToStmtEnd();
                    tokens[begIdx].blockSpanLength = i - begIdx;
                }
            }
            function skipToStmtEnd() {
                while (true) {
                    var t = tokens[i];
                    var bkp = i;
                    currCtxToken = t;
                    didBlock = false;
                    if (t.kind == TokenKind.EOF)
                        return;
                    if (inStmtCtx && t.synKind == SK.SemicolonToken) {
                        i++;
                        skipOptionalNewLine();
                        return;
                    }
                    if (t.synKind == SK.EqualsGreaterThanToken) {
                        nextNonWs();
                        if (tokens[i].synKind == SK.OpenBraceToken) {
                            handleBlock();
                            continue;
                        }
                        else {
                            var begIdx = i;
                            skipToStmtEnd();
                            var j = i;
                            while (tokens[j].kind == TokenKind.NewLine)
                                j--;
                            tokens[begIdx].blockSpanLength = j - begIdx;
                            tokens[begIdx].blockSpanIsVirtual = true;
                            return;
                        }
                    }
                    if (inStmtCtx && infixOperatorPrecedence(t.synKind)) {
                        var begIdx = i;
                        // an infix operator at the end of the line prevents the newline from ending the statement
                        nextNonWs();
                        if (isExprEnd(tokens[i])) {
                            // unless next line starts with something statement-like
                            i = begIdx;
                        }
                        else {
                            continue;
                        }
                    }
                    if (inStmtCtx && t.kind == TokenKind.NewLine) {
                        nextNonWs();
                        t = tokens[i];
                        // if we get a infix operator other than +/- after newline, it's a continuation
                        if (infixOperatorPrecedence(t.synKind) && t.synKind != SK.PlusToken && t.synKind != SK.MinusToken) {
                            continue;
                        }
                        else {
                            i = bkp + 1;
                            return;
                        }
                    }
                    if (t.synKind == SK.OpenBraceToken && ctxToken && ctxToken.synKind == SK.ClassKeyword) {
                        var jj = i - 1;
                        while (jj >= 0 && tokens[jj].kind == TokenKind.Whitespace)
                            jj--;
                        if (jj < 0 || tokens[jj].synKind != SK.EqualsToken) {
                            i--;
                            expectBlock(); // method body
                            return;
                        }
                    }
                    pxt.Util.assert(bkp == i);
                    switch (t.synKind) {
                        case SK.ForKeyword:
                        case SK.WhileKeyword:
                        case SK.IfKeyword:
                        case SK.CatchKeyword:
                            nextNonWs();
                            if (tokens[i].synKind == SK.OpenParenToken) {
                                expectBlock();
                            }
                            else {
                                continue; // just continue until new line
                            }
                            return;
                        case SK.DoKeyword:
                            expectBlock();
                            i--;
                            nextNonWs();
                            if (tokens[i].synKind == SK.WhileKeyword) {
                                i++;
                                continue;
                            }
                            else {
                                return;
                            }
                        case SK.ElseKeyword:
                            nextNonWs();
                            if (tokens[i].synKind == SK.IfKeyword) {
                                continue; // 'else if' - keep scanning
                            }
                            else {
                                i = bkp;
                                expectBlock();
                                return;
                            }
                        case SK.TryKeyword:
                        case SK.FinallyKeyword:
                            expectBlock();
                            return;
                        case SK.ClassKeyword:
                        case SK.NamespaceKeyword:
                        case SK.ModuleKeyword:
                        case SK.InterfaceKeyword:
                        case SK.FunctionKeyword:
                            skipUntilBlock();
                            return;
                    }
                    pxt.Util.assert(!didBlock, "forgot continue/return after expectBlock");
                    i++;
                }
            }
        }
        function isWhitespaceOrNewLine(tok) {
            return tok && (tok.kind == TokenKind.Whitespace || tok.kind == TokenKind.NewLine);
        }
        function removeIndent(tokens) {
            var output = [];
            var atLineBeg = false;
            for (var i = 0; i < tokens.length; ++i) {
                if (atLineBeg)
                    i = skipWhitespace(tokens, i);
                if (tokens[i]) {
                    output.push(tokens[i]);
                    atLineBeg = tokens[i].kind == TokenKind.NewLine;
                }
            }
            return output;
        }
        function trimWhitespace(toks) {
            toks = toks.slice(0);
            while (isWhitespaceOrNewLine(toks[0]))
                toks.shift();
            while (isWhitespaceOrNewLine(toks[toks.length - 1]))
                toks.pop();
            return toks;
        }
        function normalizeSpace(tokens) {
            var output = [];
            var i = 0;
            var lastNonTrivialToken = mkEOF();
            tokens = tokens.concat([mkEOF()]);
            while (i < tokens.length) {
                i = skipWhitespace(tokens, i);
                var token = tokens[i];
                if (token.kind == TokenKind.EOF)
                    break;
                var j = skipWhitespace(tokens, i + 1);
                if (token.kind == TokenKind.NewLine && tokens[j].synKind == SK.OpenBraceToken) {
                    i = j; // skip NL
                    continue;
                }
                var needsSpace = true;
                var last = output.length == 0 ? mkNewLine(token) : output[output.length - 1];
                switch (last.synKind) {
                    case SK.ExclamationToken:
                    case SK.TildeToken:
                    case SK.DotToken:
                        needsSpace = false;
                        break;
                    case SK.PlusToken:
                    case SK.MinusToken:
                    case SK.PlusPlusToken:
                    case SK.MinusMinusToken:
                        if (last.isPrefix)
                            needsSpace = false;
                        break;
                }
                switch (token.synKind) {
                    case SK.DotToken:
                    case SK.CommaToken:
                    case SK.NewLineTrivia:
                    case SK.ColonToken:
                    case SK.SemicolonToken:
                    case SK.OpenBracketToken:
                        needsSpace = false;
                        break;
                    case SK.PlusPlusToken:
                    case SK.MinusMinusToken:
                        if (last.kind == TokenKind.Tree || last.kind == TokenKind.Identifier || last.kind == TokenKind.Keyword)
                            needsSpace = false;
                    /* fall through */
                    case SK.PlusToken:
                    case SK.MinusToken:
                        if (lastNonTrivialToken.kind == TokenKind.EOF ||
                            infixOperatorPrecedence(lastNonTrivialToken.synKind) ||
                            lastNonTrivialToken.synKind == SK.SemicolonToken)
                            token.isPrefix = true;
                        break;
                    case SK.OpenParenToken:
                        if (last.kind == TokenKind.Identifier)
                            needsSpace = false;
                        if (last.kind == TokenKind.Keyword)
                            switch (last.synKind) {
                                case SK.IfKeyword:
                                case SK.ForKeyword:
                                case SK.WhileKeyword:
                                case SK.SwitchKeyword:
                                case SK.ReturnKeyword:
                                case SK.ThrowKeyword:
                                case SK.CatchKeyword:
                                    break;
                                default:
                                    needsSpace = false;
                            }
                        break;
                }
                if (last.kind == TokenKind.NewLine)
                    needsSpace = false;
                if (needsSpace)
                    output.push(mkSpace(token, " "));
                output.push(token);
                if (token.kind != TokenKind.NewLine)
                    lastNonTrivialToken = token;
                i++;
            }
            return output;
        }
        function finalFormat(ind, token) {
            if (token.synKind == SK.NoSubstitutionTemplateLiteral &&
                /^`[\s\.#01]*`$/.test(token.text)) {
                var lines = token.text.slice(1, token.text.length - 1).split("\n").map(function (l) { return l.replace(/\s/g, ""); }).filter(function (l) { return !!l; });
                if (lines.length < 4 || lines.length > 5)
                    return;
                var numFrames = Math.floor((Math.max.apply(Math, lines.map(function (l) { return l.length; })) + 2) / 5);
                if (numFrames <= 0)
                    numFrames = 1;
                var out = "`\n";
                for (var i = 0; i < 5; ++i) {
                    var l = lines[i] || "";
                    while (l.length < numFrames * 5)
                        l += ".";
                    l = l.replace(/0/g, ".");
                    l = l.replace(/1/g, "#");
                    l = l.replace(/...../g, function (m) { return "/" + m; });
                    out += ind + l.replace(/./g, function (m) { return " " + m; }).replace(/\//g, " ").slice(3) + "\n";
                }
                out += ind + "`";
                token.text = out;
            }
        }
        function toStr(v) {
            if (Array.isArray(v))
                return "[[ " + v.map(toStr).join("  ") + " ]]";
            if (typeof v.text == "string")
                return JSON.stringify(v.text);
            return v + "";
        }
        pxt.toStr = toStr;
        function format(input, pos) {
            var r = tokenize(input);
            //if (r.braceBalance != 0) return null
            var topTokens = r.tokens;
            topTokens = emptyLinesToComments(topTokens, pos);
            topTokens = matchBraces(topTokens);
            var topStmts = delimitStmts(topTokens, true);
            var ind = "";
            var output = "";
            var outpos = -1;
            var indIncrLine = 0;
            topStmts.forEach(ppStmt);
            topStmts.forEach(function (s) { return s.tokens.forEach(findNonBlocks); });
            if (outpos == -1)
                outpos = output.length;
            return {
                formatted: output,
                pos: outpos
            };
            function findNonBlocks(t) {
                if (t.kind == TokenKind.Tree) {
                    var tree = t;
                    if (t.synKind == SK.OpenBraceToken) {
                    }
                    tree.children.forEach(findNonBlocks);
                }
                else if (t.kind == TokenKind.Block) {
                    t.stmts.forEach(function (s) { return s.tokens.forEach(findNonBlocks); });
                }
            }
            function incrIndent(parToken, f) {
                if (indIncrLine == parToken.lineNo) {
                    f();
                }
                else {
                    indIncrLine = parToken.lineNo;
                    var prev = ind;
                    ind += "    ";
                    f();
                    ind = prev;
                }
            }
            function ppStmt(s) {
                var toks = removeIndent(s.tokens);
                if (toks.length == 1 && !toks[0].isCursor && toks[0].text == "") {
                    output += "\n";
                    return;
                }
                output += ind;
                incrIndent(toks[0], function () {
                    ppToks(toks);
                });
                if (output[output.length - 1] != "\n")
                    output += "\n";
            }
            function writeToken(t) {
                if (outpos == -1 && t.pos + t.text.length >= pos) {
                    outpos = output.length + (pos - t.pos);
                }
                output += t.text;
            }
            function ppToks(tokens) {
                tokens = normalizeSpace(tokens);
                var _loop_3 = function(i) {
                    var t = tokens[i];
                    finalFormat(ind, t);
                    writeToken(t);
                    switch (t.kind) {
                        case TokenKind.Tree:
                            var tree_1 = t;
                            incrIndent(t, function () {
                                ppToks(removeIndent(tree_1.children));
                            });
                            if (tree_1.endToken) {
                                writeToken(tree_1.endToken);
                            }
                            break;
                        case TokenKind.Block:
                            var blk = t;
                            if (blk.stmts.length == 0) {
                                output += " ";
                            }
                            else {
                                output += "\n";
                                blk.stmts.forEach(ppStmt);
                                output += ind.slice(4);
                            }
                            if (blk.endToken)
                                writeToken(blk.endToken);
                            else
                                output += "}";
                            break;
                        case TokenKind.NewLine:
                            if (tokens[i + 1] && tokens[i + 1].kind == TokenKind.CommentLine &&
                                tokens[i + 1].text == "" && !tokens[i + 1].isCursor)
                                break; // no indent for empty line
                            if (i == tokens.length - 1)
                                output += ind.slice(4);
                            else
                                output += ind;
                            break;
                        case TokenKind.Whitespace:
                            break;
                    }
                };
                for (var i = 0; i < tokens.length; ++i) {
                    _loop_3(i);
                }
            }
        }
        pxt.format = format;
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        var reportDiagnostic = reportDiagnosticSimply;
        function reportDiagnostics(diagnostics, host) {
            for (var _i = 0, diagnostics_1 = diagnostics; _i < diagnostics_1.length; _i++) {
                var diagnostic = diagnostics_1[_i];
                reportDiagnostic(diagnostic, host);
            }
        }
        function reportDiagnosticSimply(diagnostic, host) {
            var output = "";
            if (diagnostic.file) {
                var _a = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start), line = _a.line, character = _a.character;
                var relativeFileName = diagnostic.file.fileName;
                output += relativeFileName + "(" + (line + 1) + "," + (character + 1) + "): ";
            }
            var category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
            output += category + " TS" + diagnostic.code + ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine) + ts.sys.newLine;
            ts.sys.write(output);
        }
        function plainTsc(dir) {
            var commandLine = ts.parseCommandLine([]);
            var configFileName = ts.findConfigFile(dir, ts.sys.fileExists);
            return performCompilation();
            function parseConfigFile() {
                var cachedConfigFileText = ts.sys.readFile(configFileName);
                var result = ts.parseConfigFileTextToJson(configFileName, cachedConfigFileText);
                var configObject = result.config;
                if (!configObject) {
                    reportDiagnostics([result.error], /* compilerHost */ undefined);
                    ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
                    return;
                }
                var configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, dir, commandLine.options, configFileName);
                if (configParseResult.errors.length > 0) {
                    reportDiagnostics(configParseResult.errors, /* compilerHost */ undefined);
                    ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
                    return;
                }
                return configParseResult;
            }
            function performCompilation() {
                var configParseResult = parseConfigFile();
                var compilerHost = ts.createCompilerHost(configParseResult.options);
                compilerHost.getDefaultLibFileName = function () { return "node_modules/typescript/lib/lib.d.ts"; };
                return compile(configParseResult.fileNames, configParseResult.options, compilerHost);
            }
        }
        pxt.plainTsc = plainTsc;
        function compile(fileNames, compilerOptions, compilerHost) {
            var program = ts.createProgram(fileNames, compilerOptions, compilerHost);
            compileProgram();
            return program;
            function compileProgram() {
                var diagnostics = program.getSyntacticDiagnostics();
                if (diagnostics.length === 0) {
                    diagnostics = program.getOptionsDiagnostics().concat(program.getGlobalDiagnostics());
                    if (diagnostics.length === 0) {
                        diagnostics = program.getSemanticDiagnostics();
                    }
                }
                reportDiagnostics(diagnostics, compilerHost);
                //const emitOutput = program.emit();
                //diagnostics = diagnostics.concat(emitOutput.diagnostics);
            }
        }
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        (function (SymbolKind) {
            SymbolKind[SymbolKind["None"] = 0] = "None";
            SymbolKind[SymbolKind["Method"] = 1] = "Method";
            SymbolKind[SymbolKind["Property"] = 2] = "Property";
            SymbolKind[SymbolKind["Function"] = 3] = "Function";
            SymbolKind[SymbolKind["Variable"] = 4] = "Variable";
            SymbolKind[SymbolKind["Module"] = 5] = "Module";
            SymbolKind[SymbolKind["Enum"] = 6] = "Enum";
            SymbolKind[SymbolKind["EnumMember"] = 7] = "EnumMember";
        })(pxt.SymbolKind || (pxt.SymbolKind = {}));
        var SymbolKind = pxt.SymbolKind;
        pxt.placeholderChar = "◊";
        pxt.defaultImgLit = "\n. . . . .\n. . . . .\n. . # . .\n. . . . .\n. . . . .\n";
        function renderDefaultVal(apis, p, imgLit, cursorMarker) {
            if (p.initializer)
                return p.initializer;
            if (p.defaults)
                return p.defaults[0];
            if (p.type == "number")
                return "0";
            else if (p.type == "string") {
                if (imgLit) {
                    imgLit = false;
                    return "`" + pxt.defaultImgLit + cursorMarker + "`";
                }
                return "\"" + cursorMarker + "\"";
            }
            var si = apis ? pxt.Util.lookup(apis.byQName, p.type) : undefined;
            if (si && si.kind == SymbolKind.Enum) {
                var en = pxt.Util.values(apis.byQName).filter(function (e) { return e.namespace == p.type; })[0];
                if (en)
                    return en.namespace + "." + en.name;
            }
            var m = /^\((.*)\) => (.*)$/.exec(p.type);
            if (m)
                return "(" + m[1] + ") => {\n    " + cursorMarker + "\n}";
            return pxt.placeholderChar;
        }
        function renderParameters(apis, si, cursorMarker) {
            if (cursorMarker === void 0) { cursorMarker = ''; }
            if (si.parameters) {
                var imgLit_1 = !!si.attributes.imageLiteral;
                return "(" + si.parameters
                    .filter(function (p) { return !p.initializer; })
                    .map(function (p) { return renderDefaultVal(apis, p, imgLit_1, cursorMarker); }).join(", ") + ")";
            }
            return '';
        }
        pxt.renderParameters = renderParameters;
        function getSymbolKind(node) {
            switch (node.kind) {
                case pxt.SK.MethodDeclaration:
                case pxt.SK.MethodSignature:
                    return SymbolKind.Method;
                case pxt.SK.PropertyDeclaration:
                case pxt.SK.PropertySignature:
                    return SymbolKind.Property;
                case pxt.SK.FunctionDeclaration:
                    return SymbolKind.Function;
                case pxt.SK.VariableDeclaration:
                    return SymbolKind.Variable;
                case pxt.SK.ModuleDeclaration:
                    return SymbolKind.Module;
                case pxt.SK.EnumDeclaration:
                    return SymbolKind.Enum;
                case pxt.SK.EnumMember:
                    return SymbolKind.EnumMember;
                default:
                    return SymbolKind.None;
            }
        }
        function isExported(decl) {
            if (decl.modifiers && decl.modifiers.some(function (m) { return m.kind == pxt.SK.PrivateKeyword || m.kind == pxt.SK.ProtectedKeyword; }))
                return false;
            var symbol = decl.symbol;
            if (!symbol)
                return false;
            while (true) {
                var parSymbol = symbol.parent;
                if (parSymbol)
                    symbol = parSymbol;
                else
                    break;
            }
            var topDecl = symbol.valueDeclaration || symbol.declarations[0];
            if (topDecl.kind == pxt.SK.VariableDeclaration)
                topDecl = topDecl.parent.parent;
            if (topDecl.parent && topDecl.parent.kind == pxt.SK.SourceFile)
                return true;
            else
                return false;
        }
        function isInKsModule(decl) {
            while (decl) {
                if (decl.kind == pxt.SK.SourceFile) {
                    var src = decl;
                    return src.fileName.indexOf("pxt_modules") >= 0;
                }
                decl = decl.parent;
            }
            return false;
        }
        function createSymbolInfo(typechecker, qName, stmt) {
            function typeOf(tn, n, stripParams) {
                if (stripParams === void 0) { stripParams = false; }
                var t = typechecker.getTypeAtLocation(n);
                if (!t)
                    return "None";
                if (stripParams) {
                    t = t.getCallSignatures()[0].getReturnType();
                }
                return typechecker.typeToString(t, null, ts.TypeFormatFlags.UseFullyQualifiedType);
            }
            var kind = getSymbolKind(stmt);
            if (kind != SymbolKind.None) {
                var decl = stmt;
                var attributes_1 = pxt.parseComments(decl);
                if (attributes_1.weight < 0)
                    return null;
                var m = /^(.*)\.(.*)/.exec(qName);
                var hasParams = kind == SymbolKind.Function || kind == SymbolKind.Method;
                return {
                    kind: kind,
                    namespace: m ? m[1] : "",
                    name: m ? m[2] : qName,
                    attributes: attributes_1,
                    retType: kind == SymbolKind.Module ? "" : typeOf(decl.type, decl, hasParams),
                    parameters: !hasParams ? null : (decl.parameters || []).map(function (p) {
                        var n = pxt.getName(p);
                        var desc = attributes_1.paramHelp[n] || "";
                        var m = /\beg\.?:\s*(.+)/.exec(desc);
                        return {
                            name: n,
                            description: desc,
                            type: typeOf(p.type, p),
                            initializer: p.initializer ? p.initializer.getText() : attributes_1.paramDefl[n],
                            defaults: m && m[1].trim() ? m[1].split(/,\s*/).map(function (e) { return e.trim(); }) : undefined
                        };
                    })
                };
            }
            return null;
        }
        function getBlocksInfo(info) {
            return {
                apis: info,
                blocks: pxt.Util.values(info.byQName)
                    .filter(function (s) { return !!s.attributes.block && !!s.attributes.blockId && (s.kind != ts.pxt.SymbolKind.EnumMember); })
            };
        }
        pxt.getBlocksInfo = getBlocksInfo;
        function genMarkdown(pkg, apiInfo) {
            var files = {};
            var infos = pxt.Util.values(apiInfo.byQName);
            var namespaces = infos.filter(function (si) { return si.kind == SymbolKind.Module; });
            namespaces.sort(compareSymbol);
            var locStrings = {};
            var reference = "";
            var writeRef = function (s) { return reference += s + "\n"; };
            var writeLoc = function (si) {
                if (si.qName && si.attributes.jsDoc)
                    locStrings[si.qName] = si.attributes.jsDoc;
            };
            writeRef("# " + pkg + " Reference");
            writeRef('');
            writeRef('```namespaces');
            var _loop_4 = function(ns) {
                var syms = infos
                    .filter(function (si) { return si.namespace == ns.name && !!si.attributes.help; })
                    .sort(compareSymbol);
                if (!syms.length)
                    return "continue";
                var nsmd = "";
                var writeNs = function (s) {
                    nsmd += s + "\n";
                };
                writeNs("# " + capitalize(ns.name));
                writeNs('');
                if (ns.attributes.jsDoc) {
                    writeLoc(ns);
                    writeNs("" + ns.attributes.jsDoc);
                    writeNs('');
                }
                writeNs('```cards');
                syms.forEach(function (si, i) {
                    writeLoc(si);
                    var call = si.namespace + "." + si.name + renderParameters(apiInfo, si) + ";";
                    if (i == 0)
                        writeRef(call);
                    writeNs(call);
                });
                writeNs('```');
                files["reference/" + ns.name + '.md'] = nsmd;
            };
            for (var _i = 0, namespaces_1 = namespaces; _i < namespaces_1.length; _i++) {
                var ns = namespaces_1[_i];
                var state_4 = _loop_4(ns);
                if (state_4 === "continue") continue;
            }
            writeRef('```');
            files[pkg + "-reference.md"] = reference;
            var locs = {};
            Object.keys(locStrings).sort().forEach(function (l) { return locs[l] = locStrings[l]; });
            files[pkg + "-strings.json"] = JSON.stringify(locs, null, 2);
            return files;
            function hasBlock(sym) {
                return !!sym.attributes.block && !!sym.attributes.blockId;
            }
            function capitalize(name) {
                return name[0].toUpperCase() + name.slice(1);
            }
            function urlify(name) {
                return name.replace(/[A-Z]/g, '-$&').toLowerCase();
            }
            function compareSymbol(l, r) {
                var c = -(hasBlock(l) ? 1 : -1) + (hasBlock(r) ? 1 : -1);
                if (c)
                    return c;
                c = -(l.attributes.weight || 50) + (r.attributes.weight || 50);
                if (c)
                    return c;
                return pxt.U.strcmp(l.name, r.name);
            }
        }
        pxt.genMarkdown = genMarkdown;
        function getApiInfo(program) {
            var res = {
                byQName: {}
            };
            var typechecker = program.getTypeChecker();
            var collectDecls = function (stmt) {
                if (stmt.kind == pxt.SK.VariableStatement) {
                    var vs = stmt;
                    vs.declarationList.declarations.forEach(collectDecls);
                    return;
                }
                // if (!isExported(stmt as Declaration)) return; ?
                if (isExported(stmt)) {
                    if (!stmt.symbol) {
                        console.warn("no symbol", stmt);
                        return;
                    }
                    var qName = getFullName(typechecker, stmt.symbol);
                    var si = createSymbolInfo(typechecker, qName, stmt);
                    if (si)
                        res.byQName[qName] = si;
                }
                if (stmt.kind == pxt.SK.ModuleDeclaration) {
                    var mod = stmt;
                    if (mod.body.kind == pxt.SK.ModuleBlock) {
                        var blk = mod.body;
                        blk.statements.forEach(collectDecls);
                    }
                }
                else if (stmt.kind == pxt.SK.InterfaceDeclaration) {
                    var iface = stmt;
                    iface.members.forEach(collectDecls);
                }
                else if (stmt.kind == pxt.SK.ClassDeclaration) {
                    var iface = stmt;
                    iface.members.forEach(collectDecls);
                }
                else if (stmt.kind == pxt.SK.EnumDeclaration) {
                    var e = stmt;
                    e.members.forEach(collectDecls);
                }
            };
            for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
                var srcFile = _a[_i];
                srcFile.statements.forEach(collectDecls);
            }
            // store qName in symbols
            for (var qName in res.byQName)
                res.byQName[qName].qName = qName;
            return res;
        }
        pxt.getApiInfo = getApiInfo;
        function getFullName(typechecker, symbol) {
            return typechecker.getFullyQualifiedName(symbol);
        }
        pxt.getFullName = getFullName;
        function fillCompletionEntries(program, symbols, r, lastApiInfo) {
            var typechecker = program.getTypeChecker();
            for (var _i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
                var s = symbols_1[_i];
                var qName = getFullName(typechecker, s);
                if (!r.isMemberCompletion && pxt.Util.lookup(lastApiInfo.byQName, qName))
                    continue; // global symbol
                if (pxt.Util.lookup(r.entries, qName))
                    continue;
                var decl = s.valueDeclaration || (s.declarations || [])[0];
                if (!decl)
                    continue;
                var si = createSymbolInfo(typechecker, qName, decl);
                if (!si)
                    continue;
                si.isContextual = true;
                //let tmp = ts.getLocalSymbolForExportDefault(s)
                //let name = typechecker.symbolToString(tmp || s)
                r.entries[qName] = si;
            }
        }
        pxt.fillCompletionEntries = fillCompletionEntries;
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
var ts;
(function (ts) {
    var pxt;
    (function (pxt) {
        var service;
        (function (service_1) {
            var emptyOptions = {
                fileSystem: {},
                sourceFiles: [],
                target: { isNative: false, hasHex: false },
                hexinfo: null
            };
            var Host = (function () {
                function Host() {
                    this.opts = emptyOptions;
                    this.fileVersions = {};
                    this.projectVer = 0;
                }
                Host.prototype.getProjectVersion = function () {
                    return this.projectVer + "";
                };
                Host.prototype.setFile = function (fn, cont) {
                    if (this.opts.fileSystem[fn] != cont) {
                        this.fileVersions[fn] = (this.fileVersions[fn] || 0) + 1;
                        this.opts.fileSystem[fn] = cont;
                        this.projectVer++;
                    }
                };
                Host.prototype.setOpts = function (o) {
                    var _this = this;
                    pxt.Util.iterStringMap(o.fileSystem, function (fn, v) {
                        if (_this.opts.fileSystem[fn] != v) {
                            _this.fileVersions[fn] = (_this.fileVersions[fn] || 0) + 1;
                        }
                    });
                    this.opts = o;
                    this.projectVer++;
                };
                Host.prototype.getCompilationSettings = function () {
                    return pxt.getTsCompilerOptions(this.opts);
                };
                Host.prototype.getScriptFileNames = function () {
                    return this.opts.sourceFiles;
                };
                Host.prototype.getScriptVersion = function (fileName) {
                    return (this.fileVersions[fileName] || 0).toString();
                };
                Host.prototype.getScriptSnapshot = function (fileName) {
                    var f = this.opts.fileSystem[fileName];
                    if (f)
                        return ts.ScriptSnapshot.fromString(f);
                    else
                        return null;
                };
                Host.prototype.getNewLine = function () { return "\n"; };
                Host.prototype.getCurrentDirectory = function () { return "."; };
                Host.prototype.getDefaultLibFileName = function (options) { return null; };
                Host.prototype.log = function (s) { console.log("LOG", s); };
                Host.prototype.trace = function (s) { console.log("TRACE", s); };
                Host.prototype.error = function (s) { console.error("ERROR", s); };
                Host.prototype.useCaseSensitiveFileNames = function () { return true; };
                return Host;
            }());
            var service;
            var host;
            var lastApiInfo;
            function fileDiags(fn) {
                if (!/\.ts$/.test(fn))
                    return [];
                var d = service.getSyntacticDiagnostics(fn);
                if (!d || !d.length)
                    d = service.getSemanticDiagnostics(fn);
                if (!d)
                    d = [];
                return d;
            }
            var operations = {
                reset: function () {
                    service.cleanupSemanticCache();
                    host.setOpts(emptyOptions);
                },
                setOptions: function (v) {
                    host.setOpts(v.options);
                },
                getCompletions: function (v) {
                    if (v.fileContent) {
                        host.setFile(v.fileName, v.fileContent);
                    }
                    var program = service.getProgram(); // this synchornizes host data as well
                    var data = service.getCompletionData(v.fileName, v.position);
                    if (!data)
                        return {};
                    var typechecker = program.getTypeChecker();
                    var r = {
                        entries: {},
                        isMemberCompletion: data.isMemberCompletion,
                        isNewIdentifierLocation: data.isNewIdentifierLocation,
                        isTypeLocation: false // TODO
                    };
                    pxt.fillCompletionEntries(program, data.symbols, r, lastApiInfo);
                    return r;
                },
                compile: function (v) {
                    return pxt.compile(v.options);
                },
                decompile: function (v) {
                    return pxt.decompile(v.options, v.fileName);
                },
                assemble: function (v) {
                    return {
                        words: pxt.thumbInlineAssemble(v.fileContent)
                    };
                },
                fileDiags: function (v) { return pxt.patchUpDiagnostics(fileDiags(v.fileName)); },
                allDiags: function () {
                    var global = service.getCompilerOptionsDiagnostics() || [];
                    var byFile = host.getScriptFileNames().map(fileDiags);
                    return pxt.patchUpDiagnostics(global.concat(pxt.Util.concat(byFile)));
                },
                apiInfo: function () {
                    return (lastApiInfo = pxt.getApiInfo(service.getProgram()));
                },
            };
            function performOperation(op, arg) {
                init();
                var res = null;
                if (operations.hasOwnProperty(op)) {
                    try {
                        res = operations[op](arg) || {};
                    }
                    catch (e) {
                        res = {
                            errorMessage: e.stack
                        };
                    }
                }
                else {
                    res = {
                        errorMessage: "No such operation: " + op
                    };
                }
                return res;
            }
            service_1.performOperation = performOperation;
            function init() {
                if (!service) {
                    host = new Host();
                    service = ts.createLanguageService(host);
                }
            }
        })(service = pxt.service || (pxt.service = {}));
    })(pxt = ts.pxt || (ts.pxt = {}));
})(ts || (ts = {}));
//# sourceMappingURL=pxtlib.js.map