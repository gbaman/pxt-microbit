var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var pxsim;
(function (pxsim) {
    function getBreakpointMsg(s, brkId) {
        function valToJSON(v) {
            switch (typeof v) {
                case "string":
                case "number":
                case "boolean":
                    return v;
                case "function":
                    return { text: "(function)" };
                case "undefined":
                    return null;
                case "object":
                    if (!v)
                        return null;
                    if (v instanceof pxsim.RefObject)
                        return { id: v.id };
                    return { text: "(object)" };
                default:
                    throw new Error();
            }
        }
        function frameVars(frame) {
            var r = {};
            for (var _i = 0, _a = Object.keys(frame); _i < _a.length; _i++) {
                var k = _a[_i];
                if (/___\d+$/.test(k)) {
                    r[k] = valToJSON(frame[k]);
                }
            }
            return r;
        }
        var r = {
            type: "debugger",
            subtype: "breakpoint",
            breakpointId: brkId,
            globals: frameVars(pxsim.runtime.globals),
            stackframes: []
        };
        while (s != null) {
            var info = s.fn ? s.fn.info : null;
            if (info)
                r.stackframes.push({
                    locals: frameVars(s),
                    funcInfo: info
                });
            s = s.parent;
        }
        return r;
    }
    pxsim.getBreakpointMsg = getBreakpointMsg;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var Embed;
    (function (Embed) {
        function start() {
            console.log('listening for simulator commands');
            window.addEventListener("message", receiveMessage, false);
            var frameid = window.location.hash.slice(1);
            pxsim.Runtime.postMessage({ type: 'ready', frameid: frameid });
        }
        Embed.start = start;
        function receiveMessage(event) {
            var origin = event.origin; // || (<any>event).originalEvent.origin;
            // TODO: test origins
            var data = event.data || {};
            var type = data.type || '';
            if (!type)
                return;
            switch (type || '') {
                case 'run':
                    run(data);
                    break;
                case 'stop':
                    stop();
                    break;
                case 'debugger':
                    if (runtime) {
                        runtime.handleDebuggerMsg(data);
                    }
                    break;
                default:
                    queue(data);
                    break;
            }
        }
        // TODO remove this; this should be using Runtime.runtime which gets
        // set correctly depending on which runtime is currently running
        var runtime;
        function stop() {
            if (runtime) {
                console.log('stopping simulator...');
                runtime.kill();
            }
        }
        Embed.stop = stop;
        function run(msg) {
            stop();
            console.log("starting " + msg.id);
            if (runtime && runtime.board)
                runtime.board.kill();
            runtime = new pxsim.Runtime(msg.code);
            runtime.id = msg.id;
            runtime.board.initAsync(msg)
                .done(function () {
                runtime.run(function (v) {
                    console.log("DONE");
                    pxsim.dumpLivePointers();
                });
            });
        }
        Embed.run = run;
        function queue(msg) {
            if (!runtime || runtime.dead) {
                return;
            }
            runtime.board.receiveMessage(msg);
        }
    })(Embed = pxsim.Embed || (pxsim.Embed = {}));
})(pxsim || (pxsim = {}));
if (typeof window !== 'undefined') {
    window.addEventListener('load', function (ev) {
        console.log('simulator loaded and ready...');
        pxsim.Embed.start();
    });
}
// APIs for language/runtime support (records, locals, function values)
var pxsim;
(function (pxsim) {
    pxsim.quiet = false;
    function check(cond) {
        if (!cond)
            throw new Error("sim: check failed");
    }
    pxsim.check = check;
    var refObjId = 1;
    var liveRefObjs = {};
    var stringLiterals;
    var stringRefCounts = {};
    var refCounting = true;
    function noRefCounting() {
        refCounting = false;
    }
    pxsim.noRefCounting = noRefCounting;
    var RefObject = (function () {
        function RefObject() {
            this.id = refObjId++;
            this.refcnt = 1;
            liveRefObjs[this.id + ""] = this;
        }
        RefObject.prototype.destroy = function () { };
        RefObject.prototype.print = function () {
            console.log("RefObject id:" + this.id + " refs:" + this.refcnt);
        };
        return RefObject;
    }());
    pxsim.RefObject = RefObject;
    var FnWrapper = (function () {
        function FnWrapper(func, caps, a0, a1, cb) {
            this.func = func;
            this.caps = caps;
            this.a0 = a0;
            this.a1 = a1;
            this.cb = cb;
        }
        return FnWrapper;
    }());
    pxsim.FnWrapper = FnWrapper;
    var RefRecord = (function (_super) {
        __extends(RefRecord, _super);
        function RefRecord() {
            _super.apply(this, arguments);
            this.fields = [];
        }
        RefRecord.prototype.destroy = function () {
            for (var i = 0; i < this.reflen; ++i)
                decr(this.fields[i]);
            this.fields = null;
        };
        RefRecord.prototype.print = function () {
            console.log("RefRecord id:" + this.id + " refs:" + this.refcnt + " len:" + this.len);
        };
        return RefRecord;
    }(RefObject));
    pxsim.RefRecord = RefRecord;
    var RefAction = (function (_super) {
        __extends(RefAction, _super);
        function RefAction() {
            _super.apply(this, arguments);
        }
        RefAction.prototype.ldclo = function (n) {
            n >>= 2;
            check(0 <= n && n < this.len);
            return this.fields[n];
        };
        RefAction.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.func = null;
        };
        RefAction.prototype.print = function () {
            console.log("RefAction id:" + this.id + " refs:" + this.refcnt + " len:" + this.len);
        };
        return RefAction;
    }(RefRecord));
    pxsim.RefAction = RefAction;
    var pxt;
    (function (pxt) {
        function mkAction(reflen, len, fn) {
            var r = new RefAction();
            r.len = len;
            r.reflen = reflen;
            r.func = fn;
            return r;
        }
        pxt.mkAction = mkAction;
        function runAction2(a, a0, a1) {
            var cb = pxsim.getResume();
            if (a instanceof RefAction) {
                pxtrt.incr(a);
                cb(new FnWrapper(a.func, a.fields, a0, a1, function () {
                    pxtrt.decr(a);
                }));
            }
            else {
                // no-closure case
                cb(new FnWrapper(a, null, a0, a1, null));
            }
        }
        pxt.runAction2 = runAction2;
        function runAction1(a, v) {
            runAction2(a, v, null);
        }
        pxt.runAction1 = runAction1;
        function runAction0(a) {
            runAction2(a, null, null);
        }
        pxt.runAction0 = runAction0;
    })(pxt = pxsim.pxt || (pxsim.pxt = {}));
    var RefLocal = (function (_super) {
        __extends(RefLocal, _super);
        function RefLocal() {
            _super.apply(this, arguments);
            this.v = 0;
        }
        RefLocal.prototype.print = function () {
            console.log("RefLocal id:" + this.id + " refs:" + this.refcnt + " v:" + this.v);
        };
        return RefLocal;
    }(RefObject));
    pxsim.RefLocal = RefLocal;
    var RefRefLocal = (function (_super) {
        __extends(RefRefLocal, _super);
        function RefRefLocal() {
            _super.apply(this, arguments);
            this.v = null;
        }
        RefRefLocal.prototype.destroy = function () {
            decr(this.v);
        };
        RefRefLocal.prototype.print = function () {
            console.log("RefRefLocal id:" + this.id + " refs:" + this.refcnt + " v:" + this.v);
        };
        return RefRefLocal;
    }(RefObject));
    pxsim.RefRefLocal = RefRefLocal;
    function num(v) {
        if (v === undefined)
            return 0;
        return v;
    }
    function ref(v) {
        if (v === undefined)
            return null;
        return v;
    }
    function decr(v) {
        if (noRefCounting)
            return;
        if (v instanceof RefObject) {
            var o = v;
            check(o.refcnt > 0);
            if (--o.refcnt == 0) {
                delete liveRefObjs[o.id + ""];
                o.destroy();
            }
        }
        else if (typeof v == "string") {
            if (stringLiterals && !stringLiterals.hasOwnProperty(v)) {
                stringRefDelta(v, -1);
            }
        }
        else if (!v) {
        }
        else if (typeof v == "function") {
        }
        else {
            throw new Error("bad decr");
        }
    }
    pxsim.decr = decr;
    function setupStringLiterals(strings) {
        strings[""] = 1;
        strings["true"] = 1;
        strings["false"] = 1;
        // comment out next line to disable string ref counting
        stringLiterals = strings;
    }
    pxsim.setupStringLiterals = setupStringLiterals;
    function stringRefDelta(s, n) {
        if (!stringRefCounts.hasOwnProperty(s))
            stringRefCounts[s] = 0;
        var r = (stringRefCounts[s] += n);
        if (r == 0)
            delete stringRefCounts[s];
        else
            check(r > 0);
        return r;
    }
    function initString(v) {
        if (!v || !stringLiterals)
            return v;
        if (typeof v == "string" && !stringLiterals.hasOwnProperty(v))
            stringRefDelta(v, 1);
        return v;
    }
    pxsim.initString = initString;
    function incr(v) {
        if (noRefCounting)
            return v;
        if (v instanceof RefObject) {
            var o = v;
            check(o.refcnt > 0);
            o.refcnt++;
        }
        else if (stringLiterals && typeof v == "string" && !stringLiterals.hasOwnProperty(v)) {
            var k = stringRefDelta(v, 1);
            check(k > 1);
        }
        return v;
    }
    pxsim.incr = incr;
    function dumpLivePointers() {
        if (noRefCounting)
            return;
        Object.keys(liveRefObjs).forEach(function (k) {
            liveRefObjs[k].print();
        });
        Object.keys(stringRefCounts).forEach(function (k) {
            var n = stringRefCounts[k];
            console.log("Live String:", JSON.stringify(k), "refcnt=", n);
        });
    }
    pxsim.dumpLivePointers = dumpLivePointers;
    var pxt;
    (function (pxt) {
        pxt.incr = pxsim.incr;
        pxt.decr = pxsim.decr;
        function ptrOfLiteral(v) {
            return v;
        }
        pxt.ptrOfLiteral = ptrOfLiteral;
        function debugMemLeaks() {
            dumpLivePointers();
        }
        pxt.debugMemLeaks = debugMemLeaks;
        function allocate() {
            pxsim.U.userError("allocate() called in simulator");
        }
        pxt.allocate = allocate;
        function templateHash() {
            return 0;
        }
        pxt.templateHash = templateHash;
        function programHash() {
            return 0;
        }
        pxt.programHash = programHash;
    })(pxt = pxsim.pxt || (pxsim.pxt = {}));
    var pxtrt;
    (function (pxtrt) {
        pxtrt.incr = pxsim.incr;
        pxtrt.decr = pxsim.decr;
        function panic(code) {
            pxsim.U.userError("PANIC! Code " + code);
        }
        pxtrt.panic = panic;
        function ldfld(r, idx) {
            check(r.reflen <= idx && idx < r.len);
            var v = num(r.fields[idx]);
            pxtrt.decr(r);
            return v;
        }
        pxtrt.ldfld = ldfld;
        function stfld(r, idx, v) {
            check(r.reflen <= idx && idx < r.len);
            r.fields[idx] = v;
            pxtrt.decr(r);
        }
        pxtrt.stfld = stfld;
        function ldfldRef(r, idx) {
            check(0 <= idx && idx < r.reflen);
            var v = pxtrt.incr(ref(r.fields[idx]));
            pxtrt.decr(r);
            return v;
        }
        pxtrt.ldfldRef = ldfldRef;
        function stfldRef(r, idx, v) {
            check(0 <= idx && idx < r.reflen);
            pxtrt.decr(r.fields[idx]);
            r.fields[idx] = v;
            pxtrt.decr(r);
        }
        pxtrt.stfldRef = stfldRef;
        function ldloc(r) {
            return r.v;
        }
        pxtrt.ldloc = ldloc;
        function ldlocRef(r) {
            return pxtrt.incr(r.v);
        }
        pxtrt.ldlocRef = ldlocRef;
        function stloc(r, v) {
            r.v = v;
        }
        pxtrt.stloc = stloc;
        function stlocRef(r, v) {
            pxtrt.decr(r.v);
            r.v = v;
        }
        pxtrt.stlocRef = stlocRef;
        function mkloc() {
            return new RefLocal();
        }
        pxtrt.mkloc = mkloc;
        function mklocRef() {
            return new RefRefLocal();
        }
        pxtrt.mklocRef = mklocRef;
        // Store a captured local in a closure. It returns the action, so it can be chained.
        function stclo(a, idx, v) {
            check(0 <= idx && idx < a.len);
            check(a.fields[idx] === undefined);
            //console.log(`STCLO [${idx}] = ${v}`)
            a.fields[idx] = v;
            return a;
        }
        pxtrt.stclo = stclo;
    })(pxtrt = pxsim.pxtrt || (pxsim.pxtrt = {}));
    var pxt;
    (function (pxt) {
        function mkRecord(reflen, totallen) {
            check(0 <= reflen && reflen <= totallen);
            check(reflen <= totallen && totallen <= 255);
            var r = new RefRecord();
            r.reflen = reflen;
            r.len = totallen;
            for (var i = 0; i < totallen; ++i)
                r.fields.push(i < reflen ? null : 0);
            return r;
        }
        pxt.mkRecord = mkRecord;
    })(pxt = pxsim.pxt || (pxsim.pxt = {}));
    var thread;
    (function (thread) {
        thread.panic = pxtrt.panic;
        function pause(ms) {
            var cb = pxsim.getResume();
            setTimeout(function () { cb(); }, ms);
        }
        thread.pause = pause;
        function runInBackground(a) {
            pxsim.runtime.runFiberAsync(a).done();
        }
        thread.runInBackground = runInBackground;
        function forever(a) {
            function loop() {
                pxsim.runtime.runFiberAsync(a)
                    .then(function () { return Promise.delay(20); })
                    .then(loop)
                    .done();
            }
            incr(a);
            loop();
        }
        thread.forever = forever;
    })(thread = pxsim.thread || (pxsim.thread = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    // A ref-counted collection of either primitive or ref-counted objects (String, Image,
    // user-defined record, another collection)
    var RefCollection = (function (_super) {
        __extends(RefCollection, _super);
        // 1 - collection of refs (need decr)
        // 2 - collection of strings (in fact we always have 3, never 2 alone)
        function RefCollection(flags) {
            _super.call(this);
            this.flags = flags;
            this.data = [];
        }
        RefCollection.prototype.destroy = function () {
            var data = this.data;
            if (this.flags & 1)
                for (var i = 0; i < data.length; ++i) {
                    pxsim.decr(data[i]);
                    data[i] = 0;
                }
            this.data = [];
        };
        RefCollection.prototype.print = function () {
            console.log("RefCollection id:" + this.id + " refs:" + this.refcnt + " len:" + this.data.length + " flags:" + this.flags + " d0:" + this.data[0]);
        };
        return RefCollection;
    }(pxsim.RefObject));
    pxsim.RefCollection = RefCollection;
    var Array_;
    (function (Array_) {
        function mk(f) {
            return new RefCollection(f);
        }
        Array_.mk = mk;
        function length(c) {
            return c.data.length;
        }
        Array_.length = length;
        function push(c, x) {
            if (c.flags & 1)
                pxsim.incr(x);
            c.data.push(x);
        }
        Array_.push = push;
        function in_range(c, x) {
            return (0 <= x && x < c.data.length);
        }
        Array_.in_range = in_range;
        function getAt(c, x) {
            if (in_range(c, x)) {
                var tmp = c.data[x];
                if (c.flags & 1)
                    pxsim.incr(tmp);
                return tmp;
            }
            else {
                pxsim.check(false);
            }
        }
        Array_.getAt = getAt;
        function removeAt(c, x) {
            if (!in_range(c, x))
                return;
            if (c.flags & 1)
                pxsim.decr(c.data[x]);
            c.data.splice(x, 1);
        }
        Array_.removeAt = removeAt;
        function setAt(c, x, y) {
            if (!in_range(c, x))
                return;
            if (c.flags & 1) {
                pxsim.decr(c.data[x]);
                pxsim.incr(y);
            }
            c.data[x] = y;
        }
        Array_.setAt = setAt;
        function indexOf(c, x, start) {
            if (!in_range(c, start))
                return -1;
            return c.data.indexOf(x, start);
        }
        Array_.indexOf = indexOf;
        function removeElement(c, x) {
            var idx = indexOf(c, x, 0);
            if (idx >= 0) {
                removeAt(c, idx);
                return 1;
            }
            return 0;
        }
        Array_.removeElement = removeElement;
    })(Array_ = pxsim.Array_ || (pxsim.Array_ = {}));
    var Math_;
    (function (Math_) {
        function sqrt(n) {
            return Math.sqrt(n) >>> 0;
        }
        Math_.sqrt = sqrt;
        function pow(x, y) {
            return Math.pow(x, y) >>> 0;
        }
        Math_.pow = pow;
        function random(max) {
            if (max < 1)
                return 0;
            var r = 0;
            do {
                r = Math.floor(Math.random() * max);
            } while (r == max);
            return r;
        }
        Math_.random = random;
    })(Math_ = pxsim.Math_ || (pxsim.Math_ = {}));
    // for explanations see:
    // http://stackoverflow.com/questions/3428136/javascript-integer-math-incorrect-results (second answer)
    // (but the code below doesn't come from there; I wrote it myself)
    // TODO use Math.imul if available
    function intMult(a, b) {
        return (((a & 0xffff) * (b >>> 16) + (b & 0xffff) * (a >>> 16)) << 16) + ((a & 0xffff) * (b & 0xffff));
    }
    var Number_;
    (function (Number_) {
        function lt(x, y) { return x < y; }
        Number_.lt = lt;
        function le(x, y) { return x <= y; }
        Number_.le = le;
        function neq(x, y) { return x != y; }
        Number_.neq = neq;
        function eq(x, y) { return x == y; }
        Number_.eq = eq;
        function gt(x, y) { return x > y; }
        Number_.gt = gt;
        function ge(x, y) { return x >= y; }
        Number_.ge = ge;
        function div(x, y) { return Math.floor(x / y) | 0; }
        Number_.div = div;
        function mod(x, y) { return x % y; }
        Number_.mod = mod;
        function toString(x) { return pxsim.initString(x + ""); }
        Number_.toString = toString;
    })(Number_ = pxsim.Number_ || (pxsim.Number_ = {}));
    var thumb;
    (function (thumb) {
        function adds(x, y) { return (x + y) | 0; }
        thumb.adds = adds;
        function subs(x, y) { return (x - y) | 0; }
        thumb.subs = subs;
        function divs(x, y) { return Math.floor(x / y) | 0; }
        thumb.divs = divs;
        function muls(x, y) { return intMult(x, y); }
        thumb.muls = muls;
        function ands(x, y) { return x & y; }
        thumb.ands = ands;
        function orrs(x, y) { return x | y; }
        thumb.orrs = orrs;
        function eors(x, y) { return x ^ y; }
        thumb.eors = eors;
        function lsls(x, y) { return x << y; }
        thumb.lsls = lsls;
        function lsrs(x, y) { return x >>> y; }
        thumb.lsrs = lsrs;
        function asrs(x, y) { return x >> y; }
        thumb.asrs = asrs;
        function cmp_lt(x, y) { return x < y; }
        thumb.cmp_lt = cmp_lt;
        function cmp_le(x, y) { return x <= y; }
        thumb.cmp_le = cmp_le;
        function cmp_ne(x, y) { return x != y; }
        thumb.cmp_ne = cmp_ne;
        function cmp_eq(x, y) { return x == y; }
        thumb.cmp_eq = cmp_eq;
        function cmp_gt(x, y) { return x > y; }
        thumb.cmp_gt = cmp_gt;
        function cmp_ge(x, y) { return x >= y; }
        thumb.cmp_ge = cmp_ge;
    })(thumb = pxsim.thumb || (pxsim.thumb = {}));
    var String_;
    (function (String_) {
        function mkEmpty() {
            return "";
        }
        String_.mkEmpty = mkEmpty;
        function fromCharCode(code) {
            return String.fromCharCode(code);
        }
        String_.fromCharCode = fromCharCode;
        function toNumber(s) {
            return parseInt(s);
        }
        String_.toNumber = toNumber;
        // TODO check edge-conditions
        function concat(a, b) {
            return pxsim.initString(a + b);
        }
        String_.concat = concat;
        function substring(s, i, j) {
            return pxsim.initString(s.slice(i, i + j));
        }
        String_.substring = substring;
        function equals(s1, s2) {
            return s1 == s2;
        }
        String_.equals = equals;
        function compare(s1, s2) {
            if (s1 == s2)
                return 0;
            if (s1 < s2)
                return -1;
            return 1;
        }
        String_.compare = compare;
        function length(s) {
            return s.length;
        }
        String_.length = length;
        function isEmpty(s) {
            return s == null || s.length == 0;
        }
        String_.isEmpty = isEmpty;
        function substr(s, start, length) {
            return s.substr(start, length);
        }
        String_.substr = substr;
        function inRange(s, i) { return 0 <= i && i < s.length; }
        function charAt(s, i) {
            return inRange(s, i) ? pxsim.initString(s.charAt(i)) : null;
        }
        String_.charAt = charAt;
        function charCodeAt(s, i) {
            return inRange(s, i) ? s.charCodeAt(i) : 0;
        }
        String_.charCodeAt = charCodeAt;
    })(String_ = pxsim.String_ || (pxsim.String_ = {}));
    var Boolean_;
    (function (Boolean_) {
        function toString(v) {
            return v ? "true" : "false";
        }
        Boolean_.toString = toString;
        function bang(v) {
            return !v;
        }
        Boolean_.bang = bang;
    })(Boolean_ = pxsim.Boolean_ || (pxsim.Boolean_ = {}));
    var RefBuffer = (function (_super) {
        __extends(RefBuffer, _super);
        function RefBuffer(data) {
            _super.call(this);
            this.data = data;
        }
        RefBuffer.prototype.print = function () {
            console.log("RefBuffer id:" + this.id + " refs:" + this.refcnt + " len:" + this.data.length + " d0:" + this.data[0]);
        };
        return RefBuffer;
    }(pxsim.RefObject));
    pxsim.RefBuffer = RefBuffer;
    var BufferMethods;
    (function (BufferMethods) {
        function createBuffer(size) {
            return new RefBuffer(new Uint8Array(size));
        }
        BufferMethods.createBuffer = createBuffer;
        function getBytes(buf) {
            // not sure if this is any useful...
            return buf.data;
        }
        BufferMethods.getBytes = getBytes;
        function inRange(buf, off) {
            return 0 <= off && off < buf.data.length;
        }
        function getByte(buf, off) {
            if (inRange(buf, off))
                return buf.data[off];
            else
                return 0;
        }
        BufferMethods.getByte = getByte;
        function setByte(buf, off, v) {
            if (inRange(buf, off))
                buf.data[off] = v;
        }
        BufferMethods.setByte = setByte;
        function length(buf) {
            return buf.data.length;
        }
        BufferMethods.length = length;
        function fill(buf, value, offset, length) {
            if (offset === void 0) { offset = 0; }
            if (length === void 0) { length = -1; }
            if (offset < 0 || offset > buf.data.length)
                return;
            if (length < 0)
                length = buf.data.length;
            length = Math.min(length, buf.data.length - offset);
            buf.data.fill(value, offset, offset + length);
        }
        BufferMethods.fill = fill;
        function slice(buf, offset, length) {
            offset = Math.min(buf.data.length, offset);
            if (length < 0)
                length = buf.data.length;
            length = Math.min(length, buf.data.length - offset);
            return new RefBuffer(buf.data.slice(offset, offset + length));
        }
        BufferMethods.slice = slice;
        function memmove(dst, dstOff, src, srcOff, len) {
            if (src.buffer === dst.buffer) {
                memmove(dst, dstOff, src.slice(srcOff, srcOff + len), 0, len);
            }
            else {
                for (var i = 0; i < len; ++i)
                    dst[dstOff + i] = src[srcOff + i];
            }
        }
        var INT_MIN = -0x80000000;
        function shift(buf, offset) {
            if (buf.data.length == 0 || offset == 0 || offset == INT_MIN)
                return;
            if (offset <= -buf.data.length || offset >= buf.data.length) {
                fill(buf, 0);
                return;
            }
            if (offset < 0) {
                offset = -offset;
                memmove(buf.data, offset, buf.data, 0, buf.data.length - offset);
                buf.data.fill(0, 0, offset);
            }
            else {
                var len = buf.data.length - offset;
                memmove(buf.data, 0, buf.data, offset, len);
                buf.data.fill(0, len, len + offset);
            }
        }
        BufferMethods.shift = shift;
        function rotate(buf, offset) {
            var len = buf.data.length;
            if (len == 0 || offset == 0 || offset == INT_MIN)
                return;
            if (offset < 0)
                offset += len << 8; // try to make it positive
            offset %= len;
            if (offset < 0)
                offset += len;
            var data = buf.data;
            var n_first = offset;
            var first = 0;
            var next = n_first;
            var last = len;
            while (first != next) {
                var tmp = data[first];
                data[first++] = data[next];
                data[next++] = tmp;
                if (next == last) {
                    next = n_first;
                }
                else if (first == n_first) {
                    n_first = next;
                }
            }
        }
        BufferMethods.rotate = rotate;
        function write(buf, dstOffset, src, srcOffset, length) {
            if (srcOffset === void 0) { srcOffset = 0; }
            if (length === void 0) { length = -1; }
            if (length < 0)
                length = src.data.length;
            if (srcOffset < 0 || dstOffset < 0 || dstOffset > buf.data.length)
                return;
            length = Math.min(src.data.length - srcOffset, buf.data.length - dstOffset);
            if (length < 0)
                return;
            memmove(buf.data, dstOffset, src.data, srcOffset, length);
        }
        BufferMethods.write = write;
    })(BufferMethods = pxsim.BufferMethods || (pxsim.BufferMethods = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var logs;
    (function (logs) {
        var TrendChartElement = (function () {
            function TrendChartElement(log, className) {
                this.log = log;
                this.vpw = 80;
                this.vph = 15;
                this.log = log;
                this.element = pxsim.svg.elt("svg");
                pxsim.svg.hydrate(this.element, { class: className, viewBox: "0 0 " + this.vpw + " " + this.vph });
                this.g = pxsim.svg.child(this.element, "g");
                this.line = pxsim.svg.child(this.g, "polyline");
            }
            TrendChartElement.prototype.render = function () {
                var _this = this;
                var data = this.log.accvalues.slice(-25); // take last 10 entry
                var margin = 2;
                var times = data.map(function (d) { return d.t; });
                var values = data.map(function (d) { return d.v; });
                var maxt = Math.max.apply(null, times);
                var mint = Math.min.apply(null, times);
                var maxv = Math.max.apply(null, values);
                var minv = Math.min.apply(null, values);
                var h = (maxv - minv) || 10;
                var w = (maxt - mint) || 10;
                var points = data.map(function (d) { return ((d.t - mint) / w * _this.vpw + "," + (_this.vph - (d.v - minv) / h * (_this.vph - 2 * margin) - margin)); }).join(' ');
                pxsim.svg.hydrate(this.line, { points: points });
            };
            return TrendChartElement;
        }());
        var LogViewElement = (function () {
            function LogViewElement(props) {
                var _this = this;
                this.props = props;
                this.shouldScroll = false;
                this.entries = [];
                this.serialBuffers = {};
                this.registerEvents();
                this.registerChromeSerial();
                this.element = document.createElement("div");
                this.element.className = "ui segment hideempty logs";
                if (this.props.onClick)
                    this.element.onclick = function () { return _this.props.onClick(_this.rows()); };
            }
            LogViewElement.prototype.setLabel = function (text) {
                if (this.labelElement && this.labelElement.innerText == text)
                    return;
                if (this.labelElement) {
                    if (this.labelElement.parentElement)
                        this.labelElement.parentElement.removeChild(this.labelElement);
                    this.labelElement = undefined;
                }
                if (text) {
                    this.labelElement = document.createElement("a");
                    this.labelElement.className = "ui green top right attached mini label";
                    this.labelElement.appendChild(document.createTextNode(text));
                }
            };
            // creates a deep clone of the log entries
            LogViewElement.prototype.rows = function () {
                return this.entries.map(function (e) {
                    return {
                        id: e.id,
                        theme: e.theme,
                        variable: e.variable,
                        accvalues: e.accvalues ? e.accvalues.slice(0) : undefined,
                        time: e.time,
                        value: e.value,
                        source: e.source,
                        count: e.count
                    };
                });
            };
            LogViewElement.prototype.streamPayload = function (startTime) {
                // filter out data
                var es = this.entries.filter(function (e) { return !!e.accvalues && e.time + e.accvalues[e.accvalues.length - 1].t >= startTime; });
                if (es.length == 0)
                    return undefined;
                var fields = { "timestamp": 1, "partition": 1 };
                var rows = [];
                function entryVariable(e) {
                    return /^\s*$/.test(e.variable) ? 'data' : e.variable;
                }
                // collect fields
                es.forEach(function (e) {
                    var n = entryVariable(e);
                    if (!fields[n])
                        fields[n] = 1;
                });
                // collapse data and fill values
                var fs = Object.keys(fields);
                es.forEach(function (e) {
                    var n = entryVariable(e);
                    var ei = fs.indexOf(n);
                    e.accvalues
                        .filter(function (v) { return (e.time + v.t) >= startTime; })
                        .forEach(function (v) {
                        var row = [e.time + v.t, 0];
                        for (var i = 2; i < fs.length; ++i)
                            row.push(i == ei ? v.v : null);
                        rows.push(row);
                    });
                });
                return { fields: fs, values: rows };
            };
            LogViewElement.prototype.registerChromeSerial = function () {
                var _this = this;
                var buffers = {};
                var chrome = window.chrome;
                if (chrome && chrome.runtime) {
                    var port = chrome.runtime.connect("cihhkhnngbjlhahcfmhekmbnnjcjdbge", { name: "micro:bit" });
                    port.onMessage.addListener(function (msg) {
                        if (msg.type == "serial") {
                            var buf = (buffers[msg.id] || "") + msg.data;
                            var i = buf.lastIndexOf("\n");
                            if (i >= 0) {
                                var msgb = buf.substring(0, i + 1);
                                msgb.split('\n').filter(function (line) { return !!line; }).forEach(function (line) { return _this.appendEntry('microbit' + msg.id, line, 'black'); });
                                buf = buf.slice(i + 1);
                            }
                            buffers[msg.id] = buf;
                        }
                    });
                }
            };
            LogViewElement.prototype.registerEvents = function () {
                var _this = this;
                window.addEventListener('message', function (ev) {
                    var msg = ev.data;
                    switch (msg.type || '') {
                        case 'serial':
                            var value = msg.data || '';
                            var source = msg.id || '?';
                            var theme = source.split('-')[0] || '';
                            if (!/^[a-z]+$/.test(theme))
                                theme = 'black';
                            var buffer = _this.serialBuffers[source] || '';
                            for (var i = 0; i < value.length; ++i) {
                                switch (value.charCodeAt(i)) {
                                    case 10:
                                        _this.appendEntry(source, buffer, theme);
                                        buffer = '';
                                        break;
                                    case 13:
                                        break;
                                    default:
                                        buffer += value[i];
                                        break;
                                }
                            }
                            _this.serialBuffers[source] = buffer;
                            break;
                    }
                }, false);
            };
            LogViewElement.prototype.appendEntry = function (source, value, theme) {
                var _this = this;
                if (this.labelElement && !this.labelElement.parentElement)
                    this.element.insertBefore(this.labelElement, this.element.firstElementChild);
                var ens = this.entries;
                while (ens.length > this.props.maxEntries) {
                    var po = ens.shift();
                    if (po.element)
                        po.element.remove();
                }
                // find the entry with same source
                var last = undefined;
                var m = /^\s*(([^:]+):)?\s*(-?\d+)/i.exec(value);
                var variable = m ? (m[2] || ' ') : undefined;
                var nvalue = m ? parseInt(m[3]) : null;
                for (var i = ens.length - 1; i >= 0; --i) {
                    if (ens[i].source == source &&
                        (ens[i].value == value ||
                            (variable && ens[i].variable == variable))) {
                        last = ens[i];
                        break;
                    }
                }
                if (last) {
                    last.value = value;
                    if (last.accvalues) {
                        last.accvalues.push({
                            t: Date.now() - last.time,
                            v: nvalue
                        });
                        if (last.accvalues.length > this.props.maxAccValues)
                            last.accvalues.shift();
                    }
                    else if (!last.countElement) {
                        last.countElement = document.createElement("span");
                        last.countElement.className = 'ui log counter';
                        last.element.insertBefore(last.countElement, last.element.firstChild);
                    }
                    last.count++;
                    this.scheduleRender(last);
                }
                else {
                    var e_1 = {
                        id: LogViewElement.counter++,
                        theme: theme,
                        time: Date.now(),
                        value: value,
                        source: source,
                        count: 1,
                        dirty: true,
                        variable: variable,
                        accvalues: nvalue != null ? [{ t: 0, v: nvalue }] : undefined,
                        element: document.createElement("div"),
                        valueElement: document.createTextNode('')
                    };
                    e_1.element.className = "ui log " + e_1.theme;
                    if (e_1.accvalues) {
                        e_1.accvaluesElement = document.createElement('span');
                        e_1.accvaluesElement.className = "ui log " + e_1.theme + " gauge";
                        e_1.chartElement = new TrendChartElement(e_1, "ui trend " + e_1.theme);
                        if (this.props.onTrendChartClick) {
                            e_1.chartElement.element.onclick = function () { return _this.props.onTrendChartClick(e_1); };
                            e_1.chartElement.element.className += " link";
                        }
                        e_1.element.appendChild(e_1.accvaluesElement);
                        e_1.element.appendChild(e_1.chartElement.element);
                    }
                    e_1.element.appendChild(e_1.valueElement);
                    ens.push(e_1);
                    this.element.appendChild(e_1.element);
                    this.scheduleRender(e_1);
                }
            };
            LogViewElement.prototype.scheduleRender = function (e) {
                var _this = this;
                e.dirty = true;
                if (!this.renderFiberId)
                    this.renderFiberId = setTimeout(function () { return _this.render(); }, 50);
            };
            LogViewElement.prototype.clear = function () {
                this.entries = [];
                if (this.labelElement && this.labelElement.parentElement)
                    this.labelElement.parentElement.removeChild(this.labelElement);
                this.element.innerHTML = '';
                this.serialBuffers = {};
            };
            LogViewElement.prototype.render = function () {
                this.entries.forEach(function (entry) {
                    if (!entry.dirty)
                        return;
                    if (entry.countElement)
                        entry.countElement.innerText = entry.count.toString();
                    if (entry.accvaluesElement)
                        entry.accvaluesElement.innerText = entry.value;
                    if (entry.chartElement)
                        entry.chartElement.render();
                    entry.valueElement.textContent = entry.accvalues ? '' : entry.value;
                    entry.dirty = false;
                });
                this.renderFiberId = 0;
            };
            LogViewElement.counter = 0;
            return LogViewElement;
        }());
        logs.LogViewElement = LogViewElement;
        function entriesToCSV(entries) {
            // first log all data entries to CSV
            var dataEntries = [];
            var rows = entries.length;
            entries.forEach(function (e) {
                if (e.accvalues && e.accvalues.length > 0) {
                    dataEntries.push(e);
                    rows = Math.max(e.accvalues.length, rows);
                }
            });
            var csv = '';
            // name columns
            csv += dataEntries.map(function (entry) { return (entry.theme + " time, " + entry.theme + " " + (entry.variable.trim() || "data")); })
                .concat(['log time', 'log source', 'log message'])
                .join(', ');
            csv += '\n';
            var _loop_1 = function(i) {
                var cols = [];
                dataEntries.forEach(function (entry) {
                    var t0 = entry.accvalues[0].t;
                    if (i < entry.accvalues.length) {
                        cols.push(((entry.accvalues[i].t - t0) / 1000).toString());
                        cols.push(entry.accvalues[i].v.toString());
                    }
                    else {
                        cols.push(' ');
                        cols.push(' ');
                    }
                });
                if (i < entries.length) {
                    var t0 = entries[0].time;
                    cols.push(((entries[i].time - t0) / 1000).toString());
                    cols.push(entries[i].source);
                    cols.push(entries[i].value);
                }
                csv += cols.join(', ') + '\n';
            };
            for (var i = 0; i < rows; ++i) {
                _loop_1(i);
            }
            return csv;
        }
        logs.entriesToCSV = entriesToCSV;
        function entryToCSV(entry) {
            var t0 = entry.accvalues.length > 0 ? entry.accvalues[0].t : 0;
            var csv = (entry.theme + " time, " + (entry.variable.trim() || "data") + "\n")
                + entry.accvalues.map(function (v) { return ((v.t - t0) / 1000) + ", " + v.v; }).join('\n');
            return csv;
        }
        logs.entryToCSV = entryToCSV;
    })(logs = pxsim.logs || (pxsim.logs = {}));
})(pxsim || (pxsim = {}));
/// <reference path="../typings/bluebird/bluebird.d.ts"/>
var pxsim;
(function (pxsim) {
    var U;
    (function (U) {
        function addClass(el, cls) {
            if (el.classList)
                el.classList.add(cls);
            else if (!el.className.indexOf(cls))
                el.className += ' ' + cls;
        }
        U.addClass = addClass;
        function removeClass(el, cls) {
            if (el.classList)
                el.classList.remove(cls);
            else
                el.className = el.className.replace(cls, '').replace(/\s{2,}/, ' ');
        }
        U.removeClass = removeClass;
        function assert(cond, msg) {
            if (msg === void 0) { msg = "Assertion failed"; }
            if (!cond) {
                debugger;
                throw new Error(msg);
            }
        }
        U.assert = assert;
        function repeatMap(n, fn) {
            n = n || 0;
            var r = [];
            for (var i = 0; i < n; ++i)
                r.push(fn(i));
            return r;
        }
        U.repeatMap = repeatMap;
        function userError(msg) {
            var e = new Error(msg);
            e.isUserError = true;
            throw e;
        }
        U.userError = userError;
        function now() {
            return Date.now();
        }
        U.now = now;
        function nextTick(f) {
            Promise._async._schedule(f);
        }
        U.nextTick = nextTick;
    })(U = pxsim.U || (pxsim.U = {}));
    function getResume() { return pxsim.runtime.getResume(); }
    pxsim.getResume = getResume;
    var BaseBoard = (function () {
        function BaseBoard() {
            this.serialOutBuffer = '';
        }
        BaseBoard.prototype.updateView = function () { };
        BaseBoard.prototype.receiveMessage = function (msg) { };
        BaseBoard.prototype.initAsync = function (msg) { return Promise.resolve(); };
        BaseBoard.prototype.kill = function () { };
        BaseBoard.prototype.writeSerial = function (s) {
            if (!s)
                return;
            for (var i = 0; i < s.length; ++i) {
                var c = s[i];
                switch (c) {
                    case '\n':
                        Runtime.postMessage({
                            type: 'serial',
                            data: this.serialOutBuffer,
                            id: pxsim.runtime.id
                        });
                        this.serialOutBuffer = '';
                        break;
                    case '\r': continue;
                    default: this.serialOutBuffer += c;
                }
            }
        };
        return BaseBoard;
    }());
    pxsim.BaseBoard = BaseBoard;
    var BareBoard = (function (_super) {
        __extends(BareBoard, _super);
        function BareBoard() {
            _super.apply(this, arguments);
        }
        return BareBoard;
    }(BaseBoard));
    function initBareRuntime() {
        pxsim.runtime.board = new BareBoard();
        var myRT = pxsim;
        myRT.basic = {
            pause: pxsim.thread.pause,
            showNumber: function (n) {
                var cb = getResume();
                console.log("SHOW NUMBER:", n);
                U.nextTick(cb);
            }
        };
        myRT.serial = {
            writeString: function (s) { return pxsim.runtime.board.writeSerial(s); },
        };
        myRT.pins = {
            createBuffer: pxsim.BufferMethods.createBuffer,
        };
        myRT.control = {
            inBackground: pxsim.thread.runInBackground
        };
    }
    pxsim.initBareRuntime = initBareRuntime;
    var EventQueue = (function () {
        function EventQueue(runtime) {
            this.runtime = runtime;
            this.max = 5;
            this.events = [];
        }
        EventQueue.prototype.push = function (e) {
            if (!this.handler || this.events.length > this.max)
                return;
            this.events.push(e);
            // if this is the first event pushed - start processing
            if (this.events.length == 1)
                this.poke();
        };
        EventQueue.prototype.poke = function () {
            var _this = this;
            var top = this.events.shift();
            this.runtime.runFiberAsync(this.handler, top)
                .done(function () {
                // we're done processing the current event, if there is still something left to do, do it
                if (_this.events.length > 0)
                    _this.poke();
            });
        };
        return EventQueue;
    }());
    pxsim.EventQueue = EventQueue;
    // overriden at loadtime by specific implementation
    pxsim.initCurrentRuntime = undefined;
    var Runtime = (function () {
        function Runtime(code) {
            this.numGlobals = 1000;
            this.dead = false;
            this.running = false;
            this.startTime = 0;
            this.globals = {};
            this.numDisplayUpdates = 0;
            U.assert(!!pxsim.initCurrentRuntime);
            var yieldMaxSteps = 100;
            // These variables are used by the generated code as well
            // ---
            var entryPoint;
            var pxtrt = pxsim.pxtrt;
            var breakpoints = null;
            var breakAlways = false;
            var globals = this.globals;
            var yieldSteps = yieldMaxSteps;
            // ---
            var currResume;
            var dbgResume;
            var breakFrame = null; // for step-over
            var lastYield = Date.now();
            var _this = this;
            function oops(msg) {
                throw new Error("sim error: " + msg);
            }
            function maybeYield(s, pc, r0) {
                yieldSteps = yieldMaxSteps;
                var now = Date.now();
                if (now - lastYield >= 20) {
                    lastYield = now;
                    s.pc = pc;
                    s.r0 = r0;
                    var cont = function () {
                        if (_this.dead)
                            return;
                        U.assert(s.pc == pc);
                        return loop(s);
                    };
                    //U.nextTick(cont)
                    setTimeout(cont, 5);
                    return true;
                }
                return false;
            }
            function setupDebugger(numBreakpoints) {
                breakpoints = new Uint8Array(numBreakpoints);
                breakAlways = true;
            }
            function isBreakFrame(s) {
                if (!breakFrame)
                    return true; // nothing specified
                for (var p = breakFrame; p; p = p.parent) {
                    if (p == s)
                        return true;
                }
                return false;
            }
            function breakpoint(s, retPC, brkId, r0) {
                U.assert(!dbgResume);
                s.pc = retPC;
                s.r0 = r0;
                Runtime.postMessage(pxsim.getBreakpointMsg(s, brkId));
                dbgResume = function (m) {
                    dbgResume = null;
                    if (_this.dead)
                        return;
                    pxsim.runtime = _this;
                    U.assert(s.pc == retPC);
                    breakAlways = false;
                    breakFrame = null;
                    switch (m.subtype) {
                        case "resume":
                            break;
                        case "stepover":
                            breakAlways = true;
                            breakFrame = s;
                            break;
                        case "stepinto":
                            breakAlways = true;
                            break;
                    }
                    return loop(s);
                };
                return null;
            }
            function handleDebuggerMsg(msg) {
                switch (msg.subtype) {
                    case "config":
                        var cfg = msg;
                        if (cfg.setBreakpoints) {
                            breakpoints.fill(0);
                            for (var _i = 0, _a = cfg.setBreakpoints; _i < _a.length; _i++) {
                                var n = _a[_i];
                                breakpoints[n] = 1;
                            }
                        }
                        break;
                    case "pause":
                        breakAlways = true;
                        breakFrame = null;
                        break;
                    case "resume":
                    case "stepover":
                    case "stepinto":
                        if (dbgResume)
                            dbgResume(msg);
                        break;
                }
            }
            function loop(p) {
                if (_this.dead) {
                    console.log("Runtime terminated");
                    return;
                }
                try {
                    pxsim.runtime = _this;
                    while (!!p) {
                        p = p.fn(p);
                        _this.maybeUpdateDisplay();
                    }
                }
                catch (e) {
                    if (_this.errorHandler)
                        _this.errorHandler(e);
                    else
                        console.error("Simulator crashed, no error handler", e.stack);
                }
            }
            function actionCall(s, cb) {
                if (cb)
                    s.finalCallback = cb;
                s.depth = s.parent.depth + 1;
                if (s.depth > 1000) {
                    U.userError("Stack overflow");
                }
                s.pc = 0;
                return s;
            }
            function leave(s, v) {
                s.parent.retval = v;
                if (s.finalCallback)
                    s.finalCallback(v);
                return s.parent;
            }
            function setupTop(cb) {
                var s = setupTopCore(cb);
                setupResume(s, 0);
                return s;
            }
            function setupTopCore(cb) {
                var frame = {
                    parent: null,
                    pc: 0,
                    depth: 0,
                    fn: function () {
                        if (cb)
                            cb(frame.retval);
                        return null;
                    }
                };
                return frame;
            }
            function topCall(fn, cb) {
                U.assert(!!_this.board);
                U.assert(!_this.running);
                _this.setRunning(true);
                var topFrame = setupTopCore(cb);
                var frame = {
                    parent: topFrame,
                    fn: fn,
                    depth: 0,
                    pc: 0
                };
                loop(actionCall(frame));
            }
            function checkResumeConsumed() {
                if (currResume)
                    oops("getResume() not called");
            }
            function setupResume(s, retPC) {
                currResume = buildResume(s, retPC);
            }
            function buildResume(s, retPC) {
                if (currResume)
                    oops("already has resume");
                s.pc = retPC;
                return function (v) {
                    if (_this.dead)
                        return;
                    pxsim.runtime = _this;
                    U.assert(s.pc == retPC);
                    // TODO should loop() be called here using U.nextTick?
                    // This matters if the simulator function calls cb()
                    // synchronously.
                    if (v instanceof pxsim.FnWrapper) {
                        var w = v;
                        var frame = {
                            parent: s,
                            fn: w.func,
                            lambdaArgs: [w.a0, w.a1],
                            pc: 0,
                            caps: w.caps,
                            depth: s.depth + 1,
                            finalCallback: w.cb,
                        };
                        return loop(actionCall(frame));
                    }
                    s.retval = v;
                    return loop(s);
                };
            }
            // tslint:disable-next-line
            eval(code);
            this.run = function (cb) { return topCall(entryPoint, cb); };
            this.getResume = function () {
                if (!currResume)
                    oops("noresume");
                var r = currResume;
                currResume = null;
                return r;
            };
            this.setupTop = setupTop;
            this.handleDebuggerMsg = handleDebuggerMsg;
            pxsim.runtime = this;
            pxsim.initCurrentRuntime();
        }
        Runtime.prototype.runningTime = function () {
            return U.now() - this.startTime;
        };
        Runtime.prototype.runFiberAsync = function (a, arg0, arg1) {
            var _this = this;
            pxsim.incr(a);
            return new Promise(function (resolve, reject) {
                return U.nextTick(function () {
                    pxsim.runtime = _this;
                    _this.setupTop(resolve);
                    pxsim.pxt.runAction2(a, arg0, arg1);
                    pxsim.decr(a); // if it's still running, action.run() has taken care of incrementing the counter
                });
            });
        };
        Runtime.postMessage = function (data) {
            if (!data)
                return;
            // TODO: origins
            if (typeof window !== 'undefined' && window.parent && window.parent.postMessage) {
                window.parent.postMessage(data, "*");
            }
            if (Runtime.messagePosted)
                Runtime.messagePosted(data);
        };
        Runtime.prototype.kill = function () {
            this.dead = true;
            // TODO fix this
            this.setRunning(false);
        };
        Runtime.prototype.updateDisplay = function () {
            this.board.updateView();
        };
        Runtime.prototype.queueDisplayUpdate = function () {
            this.numDisplayUpdates++;
        };
        Runtime.prototype.maybeUpdateDisplay = function () {
            if (this.numDisplayUpdates) {
                this.numDisplayUpdates = 0;
                this.updateDisplay();
            }
        };
        Runtime.prototype.setRunning = function (r) {
            if (this.running != r) {
                this.running = r;
                if (this.running) {
                    this.startTime = U.now();
                    Runtime.postMessage({ type: 'status', runtimeid: this.id, state: 'running' });
                }
                else {
                    Runtime.postMessage({ type: 'status', runtimeid: this.id, state: 'killed' });
                }
                if (this.stateChanged)
                    this.stateChanged();
            }
        };
        return Runtime;
    }());
    pxsim.Runtime = Runtime;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    (function (SimulatorState) {
        SimulatorState[SimulatorState["Unloaded"] = 0] = "Unloaded";
        SimulatorState[SimulatorState["Stopped"] = 1] = "Stopped";
        SimulatorState[SimulatorState["Running"] = 2] = "Running";
        SimulatorState[SimulatorState["Paused"] = 3] = "Paused";
    })(pxsim.SimulatorState || (pxsim.SimulatorState = {}));
    var SimulatorState = pxsim.SimulatorState;
    (function (SimulatorDebuggerCommand) {
        SimulatorDebuggerCommand[SimulatorDebuggerCommand["StepInto"] = 0] = "StepInto";
        SimulatorDebuggerCommand[SimulatorDebuggerCommand["StepOver"] = 1] = "StepOver";
        SimulatorDebuggerCommand[SimulatorDebuggerCommand["Resume"] = 2] = "Resume";
        SimulatorDebuggerCommand[SimulatorDebuggerCommand["Pause"] = 3] = "Pause";
    })(pxsim.SimulatorDebuggerCommand || (pxsim.SimulatorDebuggerCommand = {}));
    var SimulatorDebuggerCommand = pxsim.SimulatorDebuggerCommand;
    var SimulatorDriver = (function () {
        function SimulatorDriver(container, options) {
            if (options === void 0) { options = {}; }
            this.container = container;
            this.options = options;
            this.themes = ["blue", "red", "green", "yellow"];
            this.runId = '';
            this.nextFrameId = 0;
            this.frameCounter = 0;
            this.debug = false;
            this.state = SimulatorState.Unloaded;
            this.frameCleanupTimeout = 0;
        }
        SimulatorDriver.prototype.setThemes = function (themes) {
            pxsim.U.assert(themes && themes.length > 0);
            this.themes = themes;
        };
        SimulatorDriver.prototype.setState = function (state) {
            if (this.state != state) {
                console.log("simulator: " + this.state + " -> " + state);
                this.state = state;
                if (this.options.onStateChanged)
                    this.options.onStateChanged(this.state);
            }
        };
        SimulatorDriver.prototype.postMessage = function (msg, source) {
            // dispatch to all iframe besides self
            var frames = this.container.getElementsByTagName("iframe");
            if (source && (msg.type === 'eventbus' || msg.type == 'radiopacket')) {
                if (frames.length < 2) {
                    this.container.appendChild(this.createFrame());
                    frames = this.container.getElementsByTagName("iframe");
                }
                else if (frames[1].dataset['runid'] != this.runId) {
                    this.startFrame(frames[1]);
                }
            }
            for (var i = 0; i < frames.length; ++i) {
                var frame = frames[i];
                if (source && frame.contentWindow == source)
                    continue;
                frame.contentWindow.postMessage(msg, "*");
            }
        };
        SimulatorDriver.prototype.createFrame = function () {
            var wrapper = document.createElement("div");
            wrapper.className = 'simframe';
            var frame = document.createElement('iframe');
            frame.id = 'sim-frame-' + this.nextId();
            frame.allowFullscreen = true;
            frame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
            var simUrl = this.options.simUrl || (window.pxtConfig || {}).simUrl || "/sim/simulator.html";
            if (this.options.aspectRatio)
                wrapper.style.paddingBottom = (100 / this.options.aspectRatio) + "%";
            frame.src = simUrl + '#' + frame.id;
            frame.frameBorder = "0";
            frame.dataset['runid'] = this.runId;
            wrapper.appendChild(frame);
            return wrapper;
        };
        SimulatorDriver.prototype.stop = function (unload) {
            if (unload === void 0) { unload = false; }
            this.postMessage({ type: 'stop' });
            this.setState(SimulatorState.Stopped);
            if (unload)
                this.unload();
            else {
                var frames_1 = this.container.getElementsByTagName("iframe");
                for (var i = 0; i < frames_1.length; ++i) {
                    var frame = frames_1[i];
                    if (!/grayscale/.test(frame.className))
                        pxsim.U.addClass(frame, "grayscale");
                }
                this.scheduleFrameCleanup();
            }
        };
        SimulatorDriver.prototype.unload = function () {
            this.cancelFrameCleanup();
            this.container.innerHTML = '';
            this.setState(SimulatorState.Unloaded);
        };
        SimulatorDriver.prototype.cancelFrameCleanup = function () {
            if (this.frameCleanupTimeout) {
                clearTimeout(this.frameCleanupTimeout);
                this.frameCleanupTimeout = 0;
            }
        };
        SimulatorDriver.prototype.scheduleFrameCleanup = function () {
            var _this = this;
            this.cancelFrameCleanup();
            this.frameCleanupTimeout = setTimeout(function () {
                _this.frameCleanupTimeout = 0;
                _this.cleanupFrames();
            }, 5000);
        };
        SimulatorDriver.prototype.cleanupFrames = function () {
            // drop unused extras frames after 5 seconds
            var frames = this.container.getElementsByTagName("iframe");
            for (var i = 1; i < frames.length; ++i) {
                var frame = frames[i];
                if (this.state == SimulatorState.Stopped
                    || frame.dataset['runid'] != this.runId) {
                    if (this.options.removeElement)
                        this.options.removeElement(frame.parentElement);
                    else
                        frame.parentElement.remove();
                }
            }
        };
        SimulatorDriver.prototype.run = function (js, debug) {
            this.debug = debug;
            this.runId = this.nextId();
            this.addEventListeners();
            // store information
            this.currentRuntime = {
                type: 'run',
                code: js
            };
            this.scheduleFrameCleanup();
            // first frame            
            var frame = this.container.querySelector("iframe");
            // lazy allocate iframe
            if (!frame) {
                var wrapper = this.createFrame();
                this.container.appendChild(wrapper);
                frame = wrapper.firstElementChild;
            }
            else
                this.startFrame(frame);
            this.setState(SimulatorState.Running);
        };
        SimulatorDriver.prototype.startFrame = function (frame) {
            console.log("starting frame " + frame.id);
            var msg = JSON.parse(JSON.stringify(this.currentRuntime));
            var mc = '';
            var m = /player=([A-Za-z0-9]+)/i.exec(window.location.href);
            if (m)
                mc = m[1];
            msg.frameCounter = ++this.frameCounter;
            msg.options = {
                theme: this.themes[this.nextFrameId++ % this.themes.length],
                player: mc
            };
            msg.id = msg.options.theme + "-" + this.nextId();
            frame.dataset['runid'] = this.runId;
            frame.contentWindow.postMessage(msg, "*");
            pxsim.U.removeClass(frame, "grayscale");
        };
        SimulatorDriver.prototype.removeEventListeners = function () {
            if (this.listener) {
                window.removeEventListener('message', this.listener, false);
                this.listener = undefined;
            }
        };
        SimulatorDriver.prototype.addEventListeners = function () {
            var _this = this;
            if (!this.listener) {
                this.listener = function (ev) {
                    var msg = ev.data;
                    switch (msg.type || '') {
                        case 'ready':
                            var frameid = msg.frameid;
                            console.log("frame " + frameid + " ready");
                            var frame = document.getElementById(frameid);
                            if (frame) {
                                _this.startFrame(frame);
                                if (_this.options.revealElement)
                                    _this.options.revealElement(frame);
                            }
                            break;
                        case 'serial': break; //handled elsewhere
                        case 'debugger':
                            _this.handleDebuggerMessage(msg);
                            break;
                        case 'compile':
                            var cmp = msg;
                            if (_this.options.onCompile)
                                _this.options.onCompile(cmp.name, cmp.content, cmp.contentType);
                            break;
                        default:
                            if (msg.type == 'radiopacket') {
                                // assign rssi noisy?
                                msg.rssi = 10;
                            }
                            _this.postMessage(ev.data, ev.source);
                            break;
                    }
                };
                window.addEventListener('message', this.listener, false);
            }
        };
        SimulatorDriver.prototype.resume = function (c) {
            var msg;
            switch (c) {
                case SimulatorDebuggerCommand.Resume:
                    msg = 'resume';
                    this.setState(SimulatorState.Running);
                    break;
                case SimulatorDebuggerCommand.StepInto:
                    msg = 'stepinto';
                    this.setState(SimulatorState.Running);
                    break;
                case SimulatorDebuggerCommand.StepOver:
                    msg = 'stepover';
                    this.setState(SimulatorState.Running);
                    break;
                case SimulatorDebuggerCommand.Pause:
                    msg = 'pause';
                    break;
                default:
                    console.log('unknown command');
                    return;
            }
            this.postDebuggerMessage(msg);
        };
        SimulatorDriver.prototype.handleDebuggerMessage = function (msg) {
            console.log("DBG-MSG", msg.subtype, msg);
            switch (msg.subtype) {
                case "breakpoint":
                    var brk = msg;
                    if (this.state == SimulatorState.Running) {
                        this.setState(SimulatorState.Paused);
                        if (this.options.onDebuggerBreakpoint)
                            this.options.onDebuggerBreakpoint(brk);
                    }
                    else {
                        console.error("debugger: trying to pause from " + this.state);
                    }
                    break;
            }
        };
        SimulatorDriver.prototype.postDebuggerMessage = function (subtype, data) {
            if (data === void 0) { data = {}; }
            var msg = JSON.parse(JSON.stringify(data));
            msg.type = "debugger";
            msg.subtype = subtype;
            this.postMessage(msg);
        };
        SimulatorDriver.prototype.nextId = function () {
            return this.nextFrameId++ + (Math.random() + '' + Math.random()).replace(/[^\d]/, '');
        };
        return SimulatorDriver;
    }());
    pxsim.SimulatorDriver = SimulatorDriver;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var svg;
    (function (svg_1) {
        var pt;
        function cursorPoint(pt, svg, evt) {
            pt.x = evt.clientX;
            pt.y = evt.clientY;
            return pt.matrixTransform(svg.getScreenCTM().inverse());
        }
        svg_1.cursorPoint = cursorPoint;
        function rotateElement(el, originX, originY, degrees) {
            el.setAttribute('transform', "translate(" + originX + "," + originY + ") rotate(" + (degrees + 90) + ") translate(" + -originX + "," + -originY + ")");
        }
        svg_1.rotateElement = rotateElement;
        function addClass(el, cls) {
            if (el.classList)
                el.classList.add(cls);
            else if (!el.className.baseVal.indexOf(cls))
                el.className.baseVal += ' ' + cls;
        }
        svg_1.addClass = addClass;
        function removeClass(el, cls) {
            if (el.classList)
                el.classList.remove(cls);
            else
                el.className.baseVal = el.className.baseVal.replace(cls, '').replace(/\s{2,}/, ' ');
        }
        svg_1.removeClass = removeClass;
        function elt(name) {
            return document.createElementNS("http://www.w3.org/2000/svg", name);
        }
        svg_1.elt = elt;
        function hydrate(el, props) {
            for (var k in props) {
                if (k == "title") {
                    svg.title(el, props[k]);
                }
                else
                    el.setAttributeNS(null, k, props[k]);
            }
        }
        svg_1.hydrate = hydrate;
        function child(parent, name, props) {
            var el = svg.elt(name);
            if (props)
                svg.hydrate(el, props);
            parent.appendChild(el);
            return el;
        }
        svg_1.child = child;
        function path(parent, cls, data, title) {
            var p = { class: cls, d: data };
            if (title)
                p["title"] = title;
            return svg.child(parent, "path", p);
        }
        svg_1.path = path;
        function fill(el, c) {
            el.style.fill = c;
        }
        svg_1.fill = fill;
        function fills(els, c) {
            els.forEach(function (el) { return el.style.fill = c; });
        }
        svg_1.fills = fills;
        function buttonEvents(el, move, start, stop) {
            var captured = false;
            el.addEventListener('mousedown', function (ev) {
                captured = true;
                if (start)
                    start(ev);
                return true;
            });
            el.addEventListener('mousemove', function (ev) {
                if (captured) {
                    move(ev);
                    ev.preventDefault();
                    return false;
                }
                return true;
            });
            el.addEventListener('mouseup', function (ev) {
                captured = false;
                if (stop)
                    stop(ev);
            });
            el.addEventListener('mouseleave', function (ev) {
                captured = false;
                if (stop)
                    stop(ev);
            });
        }
        svg_1.buttonEvents = buttonEvents;
        function linearGradient(defs, id) {
            var gradient = svg.child(defs, "linearGradient", { id: id, x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
            var stop1 = svg.child(gradient, "stop", { offset: "0%" });
            var stop2 = svg.child(gradient, "stop", { offset: "100%" });
            var stop3 = svg.child(gradient, "stop", { offset: "100%" });
            var stop4 = svg.child(gradient, "stop", { offset: "100%" });
            return gradient;
        }
        svg_1.linearGradient = linearGradient;
        function setGradientColors(lg, start, end) {
            if (!lg)
                return;
            lg.childNodes[0].style.stopColor = start;
            lg.childNodes[1].style.stopColor = start;
            lg.childNodes[2].style.stopColor = end;
            lg.childNodes[3].style.stopColor = end;
        }
        svg_1.setGradientColors = setGradientColors;
        function setGradientValue(lg, percent) {
            lg.childNodes[1].setAttribute("offset", percent);
            lg.childNodes[2].setAttribute("offset", percent);
        }
        svg_1.setGradientValue = setGradientValue;
        function animate(el, cls) {
            svg.addClass(el, cls);
            var p = el.parentElement;
            p.removeChild(el);
            p.appendChild(el);
        }
        svg_1.animate = animate;
        function title(el, txt) {
            var t = svg.child(el, "title", {});
            t.textContent = txt;
        }
        svg_1.title = title;
    })(svg = pxsim.svg || (pxsim.svg = {}));
})(pxsim || (pxsim = {}));
//# sourceMappingURL=pxtsim.js.map