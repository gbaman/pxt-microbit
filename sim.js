var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../node_modules/pxt-core/typings/bluebird/bluebird.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
/// <reference path="../libs/microbit/dal.d.ts"/>
var pxsim;
(function (pxsim) {
    pxsim.initCurrentRuntime = function () {
        pxsim.U.assert(!pxsim.runtime.board);
        pxsim.runtime.board = new pxsim.Board();
    };
    function board() {
        return pxsim.runtime.board;
    }
    pxsim.board = board;
    var AnimationQueue = (function () {
        function AnimationQueue(runtime) {
            var _this = this;
            this.runtime = runtime;
            this.queue = [];
            this.process = function () {
                var top = _this.queue[0];
                if (!top)
                    return;
                if (_this.runtime.dead)
                    return;
                runtime = _this.runtime;
                var res = top.frame();
                runtime.queueDisplayUpdate();
                runtime.maybeUpdateDisplay();
                if (res === false) {
                    _this.queue.shift();
                    // if there is already something in the queue, start processing
                    if (_this.queue[0])
                        setTimeout(_this.process, _this.queue[0].interval);
                    // this may push additional stuff 
                    top.whenDone(false);
                }
                else {
                    setTimeout(_this.process, top.interval);
                }
            };
        }
        AnimationQueue.prototype.cancelAll = function () {
            var q = this.queue;
            this.queue = [];
            for (var _i = 0, q_1 = q; _i < q_1.length; _i++) {
                var a = q_1[_i];
                a.whenDone(true);
            }
        };
        AnimationQueue.prototype.cancelCurrent = function () {
            var top = this.queue[0];
            if (top) {
                this.queue.shift();
                top.whenDone(true);
            }
        };
        AnimationQueue.prototype.enqueue = function (anim) {
            if (!anim.whenDone)
                anim.whenDone = function () { };
            this.queue.push(anim);
            // we start processing when the queue goes from 0 to 1
            if (this.queue.length == 1)
                this.process();
        };
        AnimationQueue.prototype.executeAsync = function (anim) {
            var _this = this;
            pxsim.U.assert(!anim.whenDone);
            return new Promise(function (resolve, reject) {
                anim.whenDone = resolve;
                _this.enqueue(anim);
            });
        };
        return AnimationQueue;
    }());
    pxsim.AnimationQueue = AnimationQueue;
    /**
      * Error codes used in the micro:bit runtime.
      */
    (function (PanicCode) {
        // PANIC Codes. These are not return codes, but are terminal conditions.
        // These induce a panic operation, where all code stops executing, and a panic state is
        // entered where the panic code is diplayed.
        // Out out memory error. Heap storage was requested, but is not available.
        PanicCode[PanicCode["MICROBIT_OOM"] = 20] = "MICROBIT_OOM";
        // Corruption detected in the micro:bit heap space
        PanicCode[PanicCode["MICROBIT_HEAP_ERROR"] = 30] = "MICROBIT_HEAP_ERROR";
        // Dereference of a NULL pointer through the ManagedType class,
        PanicCode[PanicCode["MICROBIT_NULL_DEREFERENCE"] = 40] = "MICROBIT_NULL_DEREFERENCE";
    })(pxsim.PanicCode || (pxsim.PanicCode = {}));
    var PanicCode = pxsim.PanicCode;
    ;
    function panic(code) {
        console.log("PANIC:", code);
        pxsim.led.setBrightness(255);
        var img = board().image;
        img.clear();
        img.set(0, 4, 255);
        img.set(1, 3, 255);
        img.set(2, 3, 255);
        img.set(3, 3, 255);
        img.set(4, 4, 255);
        img.set(0, 0, 255);
        img.set(1, 0, 255);
        img.set(0, 1, 255);
        img.set(1, 1, 255);
        img.set(3, 0, 255);
        img.set(4, 0, 255);
        img.set(3, 1, 255);
        img.set(4, 1, 255);
        pxsim.runtime.updateDisplay();
        throw new Error("PANIC " + code);
    }
    pxsim.panic = panic;
    function getPin(id) {
        return board().pins.filter(function (p) { return p && p.id == id; })[0] || null;
    }
    pxsim.getPin = getPin;
    var AudioContextManager;
    (function (AudioContextManager) {
        var _context; // AudioContext
        var _vco; // OscillatorNode;
        var _vca; // GainNode;
        function context() {
            if (!_context)
                _context = freshContext();
            return _context;
        }
        function freshContext() {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            if (window.AudioContext) {
                try {
                    // this call my crash.
                    // SyntaxError: audio resources unavailable for AudioContext construction
                    return new window.AudioContext();
                }
                catch (e) { }
            }
            return undefined;
        }
        function stop() {
            if (_vca)
                _vca.gain.value = 0;
        }
        AudioContextManager.stop = stop;
        function tone(frequency, gain) {
            if (frequency <= 0)
                return;
            var ctx = context();
            if (!ctx)
                return;
            gain = Math.max(0, Math.min(1, gain));
            if (!_vco) {
                try {
                    _vco = ctx.createOscillator();
                    _vca = ctx.createGain();
                    _vco.connect(_vca);
                    _vca.connect(ctx.destination);
                    _vca.gain.value = gain;
                    _vco.start(0);
                }
                catch (e) {
                    _vco = undefined;
                    _vca = undefined;
                    return;
                }
            }
            _vco.frequency.value = frequency;
            _vca.gain.value = gain;
        }
        AudioContextManager.tone = tone;
    })(AudioContextManager = pxsim.AudioContextManager || (pxsim.AudioContextManager = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var basic;
    (function (basic) {
        basic.pause = pxsim.thread.pause;
        basic.forever = pxsim.thread.forever;
        function showNumber(x, interval) {
            if (interval < 0)
                return;
            var leds = pxsim.createImageFromString(x.toString());
            if (x < 0 || x >= 10)
                pxsim.ImageMethods.scrollImage(leds, interval, 1);
            else
                showLeds(leds, interval * 5);
        }
        basic.showNumber = showNumber;
        function showString(s, interval) {
            if (interval < 0)
                return;
            if (s.length == 0) {
                clearScreen();
                basic.pause(interval * 5);
            }
            else {
                if (s.length == 1)
                    showLeds(pxsim.createImageFromString(s), interval * 5);
                else
                    pxsim.ImageMethods.scrollImage(pxsim.createImageFromString(s + " "), interval, 1);
            }
        }
        basic.showString = showString;
        function showLeds(leds, delay) {
            showAnimation(leds, delay);
        }
        basic.showLeds = showLeds;
        function clearScreen() {
            pxsim.board().image.clear();
            pxsim.runtime.queueDisplayUpdate();
        }
        basic.clearScreen = clearScreen;
        function showAnimation(leds, interval) {
            if (interval === void 0) { interval = 400; }
            pxsim.ImageMethods.scrollImage(leds, interval, 5);
        }
        basic.showAnimation = showAnimation;
        function plotLeds(leds) {
            pxsim.ImageMethods.plotImage(leds, 0);
        }
        basic.plotLeds = plotLeds;
    })(basic = pxsim.basic || (pxsim.basic = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var control;
    (function (control) {
        control.inBackground = pxsim.thread.runInBackground;
        function reset() {
            pxsim.U.userError("reset not implemented in simulator yet");
        }
        control.reset = reset;
        function deviceName() {
            var b = pxsim.board();
            return b && b.id
                ? b.id.slice(0, 4)
                : "abcd";
        }
        control.deviceName = deviceName;
        function deviceSerialNumber() {
            var b = pxsim.board();
            return parseInt(b && b.id
                ? b.id.slice(1)
                : "42");
        }
        control.deviceSerialNumber = deviceSerialNumber;
        function onEvent(id, evid, handler) {
            pxsim.pxt.registerWithDal(id, evid, handler);
        }
        control.onEvent = onEvent;
        function raiseEvent(id, evid, mode) {
            // TODO mode?
            pxsim.board().bus.queue(id, evid);
        }
        control.raiseEvent = raiseEvent;
    })(control = pxsim.control || (pxsim.control = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var pxt;
    (function (pxt) {
        function registerWithDal(id, evid, handler) {
            pxsim.board().bus.listen(id, evid, handler);
        }
        pxt.registerWithDal = registerWithDal;
    })(pxt = pxsim.pxt || (pxsim.pxt = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function onButtonPressed(button, handler) {
            var b = pxsim.board();
            if (button == 26 /* MICROBIT_ID_BUTTON_AB */ && !pxsim.board().usesButtonAB) {
                b.usesButtonAB = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            pxsim.pxt.registerWithDal(button, 3 /* MICROBIT_BUTTON_EVT_CLICK */, handler);
        }
        input.onButtonPressed = onButtonPressed;
        function buttonIsPressed(button) {
            var b = pxsim.board();
            if (button == 26 /* MICROBIT_ID_BUTTON_AB */ && !pxsim.board().usesButtonAB) {
                b.usesButtonAB = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            var bts = b.buttons;
            if (button == 1 /* MICROBIT_ID_BUTTON_A */)
                return bts[0].pressed;
            if (button == 2 /* MICROBIT_ID_BUTTON_B */)
                return bts[1].pressed;
            return bts[2].pressed || (bts[0].pressed && bts[1].pressed);
        }
        input.buttonIsPressed = buttonIsPressed;
        function onGesture(gesture, handler) {
            var b = pxsim.board();
            b.accelerometer.activate();
            if (gesture == 11 && !b.useShake) {
                b.useShake = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            pxsim.pxt.registerWithDal(27 /* MICROBIT_ID_GESTURE */, gesture, handler);
        }
        input.onGesture = onGesture;
        function onPinPressed(pinId, handler) {
            var pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.isTouched();
            input.onButtonPressed(pin.id, handler);
        }
        input.onPinPressed = onPinPressed;
        function pinIsPressed(pinId) {
            var pin = pxsim.getPin(pinId);
            if (!pin)
                return false;
            return pin.isTouched();
        }
        input.pinIsPressed = pinIsPressed;
        function compassHeading() {
            var b = pxsim.board();
            if (!b.usesHeading) {
                b.usesHeading = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            return b.heading;
        }
        input.compassHeading = compassHeading;
        function temperature() {
            var b = pxsim.board();
            if (!b.usesTemperature) {
                b.usesTemperature = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            return b.temperature;
        }
        input.temperature = temperature;
        function acceleration(dimension) {
            var b = pxsim.board();
            var acc = b.accelerometer;
            acc.activate();
            switch (dimension) {
                case 0: return acc.getX();
                case 1: return acc.getY();
                case 2: return acc.getZ();
                default: return Math.floor(Math.sqrt(acc.instantaneousAccelerationSquared()));
            }
        }
        input.acceleration = acceleration;
        function rotation(kind) {
            var b = pxsim.board();
            var acc = b.accelerometer;
            acc.activate();
            var x = acc.getX(pxsim.MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var y = acc.getX(pxsim.MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var z = acc.getX(pxsim.MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var roll = Math.atan2(y, z);
            var pitch = Math.atan(-x / (y * Math.sin(roll) + z * Math.cos(roll)));
            var r = 0;
            switch (kind) {
                case 0:
                    r = pitch;
                    break;
                case 1:
                    r = roll;
                    break;
            }
            return Math.floor(r / Math.PI * 180);
        }
        input.rotation = rotation;
        function setAccelerometerRange(range) {
            var b = pxsim.board();
            b.accelerometer.setSampleRange(range);
        }
        input.setAccelerometerRange = setAccelerometerRange;
        function lightLevel() {
            var b = pxsim.board();
            if (!b.usesLightLevel) {
                b.usesLightLevel = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            return b.lightLevel;
        }
        input.lightLevel = lightLevel;
        function magneticForce() {
            // TODO
            return 0;
        }
        input.magneticForce = magneticForce;
        function runningTime() {
            return pxsim.runtime.runningTime();
        }
        input.runningTime = runningTime;
        function calibrate() {
        }
        input.calibrate = calibrate;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var led;
    (function (led) {
        function plot(x, y) {
            pxsim.board().image.set(x, y, 255);
            pxsim.runtime.queueDisplayUpdate();
        }
        led.plot = plot;
        function unplot(x, y) {
            pxsim.board().image.set(x, y, 0);
            pxsim.runtime.queueDisplayUpdate();
        }
        led.unplot = unplot;
        function point(x, y) {
            return !!pxsim.board().image.get(x, y);
        }
        led.point = point;
        function brightness() {
            return pxsim.board().brigthness;
        }
        led.brightness = brightness;
        function setBrightness(value) {
            pxsim.board().brigthness = value;
            pxsim.runtime.queueDisplayUpdate();
        }
        led.setBrightness = setBrightness;
        function stopAnimation() {
            pxsim.board().animationQ.cancelAll();
        }
        led.stopAnimation = stopAnimation;
        function setDisplayMode(mode) {
            pxsim.board().displayMode = mode;
            pxsim.runtime.queueDisplayUpdate();
        }
        led.setDisplayMode = setDisplayMode;
        function screenshot() {
            var img = pxsim.createImage(5);
            pxsim.board().image.copyTo(0, 5, img, 0);
            return img;
        }
        led.screenshot = screenshot;
    })(led = pxsim.led || (pxsim.led = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var serial;
    (function (serial) {
        function writeString(s) {
            pxsim.board().writeSerial(s);
        }
        serial.writeString = writeString;
        function readString() {
            return pxsim.board().readSerial();
        }
        serial.readString = readString;
        function readLine() {
            return pxsim.board().readSerial();
        }
        serial.readLine = readLine;
        function onDataReceived(delimiters, handler) {
            var b = pxsim.board();
            b.bus.listen(32 /* MICROBIT_ID_SERIAL */, 1 /* MICROBIT_SERIAL_EVT_DELIM_MATCH */, handler);
        }
        serial.onDataReceived = onDataReceived;
    })(serial = pxsim.serial || (pxsim.serial = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var radio;
    (function (radio) {
        function broadcastMessage(msg) {
            pxsim.board().radio.broadcast(msg);
        }
        radio.broadcastMessage = broadcastMessage;
        function onBroadcastMessageReceived(msg, handler) {
            pxsim.pxt.registerWithDal(2000 /* MES_BROADCAST_GENERAL_ID */, msg, handler);
        }
        radio.onBroadcastMessageReceived = onBroadcastMessageReceived;
        function setGroup(id) {
            pxsim.board().radio.setGroup(id);
        }
        radio.setGroup = setGroup;
        function setTransmitPower(power) {
            pxsim.board().radio.setTransmitPower(power);
        }
        radio.setTransmitPower = setTransmitPower;
        function setTransmitSerialNumber(transmit) {
            pxsim.board().radio.setTransmitSerialNumber(transmit);
        }
        radio.setTransmitSerialNumber = setTransmitSerialNumber;
        function sendNumber(value) {
            pxsim.board().radio.datagram.send([value]);
        }
        radio.sendNumber = sendNumber;
        function sendString(msg) {
            pxsim.board().radio.datagram.send(msg);
        }
        radio.sendString = sendString;
        function writeValueToSerial() {
            var b = pxsim.board();
            var v = b.radio.datagram.recv().data[0];
            b.writeSerial("{v:" + v + "}");
        }
        radio.writeValueToSerial = writeValueToSerial;
        function sendValue(name, value) {
            pxsim.board().radio.datagram.send([value]);
        }
        radio.sendValue = sendValue;
        function receiveNumber() {
            var buffer = pxsim.board().radio.datagram.recv().data;
            if (buffer instanceof Array)
                return buffer[0];
            return 0;
        }
        radio.receiveNumber = receiveNumber;
        function receiveString() {
            var buffer = pxsim.board().radio.datagram.recv().data;
            if (typeof buffer === "string")
                return buffer;
            return "";
        }
        radio.receiveString = receiveString;
        function receivedNumberAt(index) {
            var buffer = pxsim.board().radio.datagram.recv().data;
            if (buffer instanceof Array)
                return buffer[index] || 0;
            return 0;
        }
        radio.receivedNumberAt = receivedNumberAt;
        function receivedSignalStrength() {
            return pxsim.board().radio.datagram.lastReceived.rssi;
        }
        radio.receivedSignalStrength = receivedSignalStrength;
        function onDataReceived(handler) {
            pxsim.pxt.registerWithDal(29 /* MICROBIT_ID_RADIO */, 1 /* MICROBIT_RADIO_EVT_DATAGRAM */, handler);
        }
        radio.onDataReceived = onDataReceived;
    })(radio = pxsim.radio || (pxsim.radio = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var pins;
    (function (pins) {
        function onPulse(name, pulse, body) {
        }
        pins.onPulse = onPulse;
        function pulseDuration() {
            return 0;
        }
        pins.pulseDuration = pulseDuration;
        function digitalReadPin(pinId) {
            var pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.mode = pxsim.PinMode.Digital | pxsim.PinMode.Input;
            return pin.value > 100 ? 1 : 0;
        }
        pins.digitalReadPin = digitalReadPin;
        function digitalWritePin(pinId, value) {
            var pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.mode = pxsim.PinMode.Digital | pxsim.PinMode.Output;
            pin.value = value > 0 ? 1023 : 0;
            pxsim.runtime.queueDisplayUpdate();
        }
        pins.digitalWritePin = digitalWritePin;
        function analogReadPin(pinId) {
            var pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.mode = pxsim.PinMode.Analog | pxsim.PinMode.Input;
            return pin.value || 0;
        }
        pins.analogReadPin = analogReadPin;
        function analogWritePin(pinId, value) {
            var pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.mode = pxsim.PinMode.Analog | pxsim.PinMode.Output;
            pin.value = value ? 1 : 0;
            pxsim.runtime.queueDisplayUpdate();
        }
        pins.analogWritePin = analogWritePin;
        function analogSetPeriod(pinId, micros) {
            var pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pin.mode = pxsim.PinMode.Analog | pxsim.PinMode.Output;
            pin.period = micros;
            pxsim.runtime.queueDisplayUpdate();
        }
        pins.analogSetPeriod = analogSetPeriod;
        function servoWritePin(pinId, value) {
            analogSetPeriod(pinId, 20000);
            // TODO
        }
        pins.servoWritePin = servoWritePin;
        function servoSetPulse(pinId, micros) {
            var pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            // TODO
        }
        pins.servoSetPulse = servoSetPulse;
        function analogSetPitchPin(pinId) {
            var pin = pxsim.getPin(pinId);
            if (!pin)
                return;
            pxsim.board().pins.filter(function (p) { return !!p; }).forEach(function (p) { return p.pitch = false; });
            pin.pitch = true;
        }
        pins.analogSetPitchPin = analogSetPitchPin;
        function analogPitch(frequency, ms) {
            // update analog output
            var pin = pxsim.board().pins.filter(function (pin) { return !!pin && pin.pitch; })[0] || pxsim.board().pins[0];
            pin.mode = pxsim.PinMode.Analog | pxsim.PinMode.Output;
            if (frequency <= 0) {
                pin.value = 0;
                pin.period = 0;
            }
            else {
                pin.value = 512;
                pin.period = 1000000 / frequency;
            }
            pxsim.runtime.queueDisplayUpdate();
            var cb = pxsim.getResume();
            pxsim.AudioContextManager.tone(frequency, 1);
            if (ms <= 0)
                cb();
            else {
                setTimeout(function () {
                    pxsim.AudioContextManager.stop();
                    pin.value = 0;
                    pin.period = 0;
                    pin.mode = pxsim.PinMode.Unused;
                    pxsim.runtime.queueDisplayUpdate();
                    cb();
                }, ms);
            }
        }
        pins.analogPitch = analogPitch;
    })(pins = pxsim.pins || (pxsim.pins = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var images;
    (function (images) {
        function createImage(img) { return img; }
        images.createImage = createImage;
        function createBigImage(img) { return img; }
        images.createBigImage = createBigImage;
    })(images = pxsim.images || (pxsim.images = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var ImageMethods;
    (function (ImageMethods) {
        function showImage(leds, offset) {
            if (!leds)
                pxsim.panic(pxsim.PanicCode.MICROBIT_NULL_DEREFERENCE);
            leds.copyTo(offset, 5, pxsim.board().image, 0);
            pxsim.runtime.queueDisplayUpdate();
        }
        ImageMethods.showImage = showImage;
        function plotImage(leds, offset) {
            if (!leds)
                pxsim.panic(pxsim.PanicCode.MICROBIT_NULL_DEREFERENCE);
            leds.copyTo(offset, 5, pxsim.board().image, 0);
            pxsim.runtime.queueDisplayUpdate();
        }
        ImageMethods.plotImage = plotImage;
        function height(leds) {
            if (!leds)
                pxsim.panic(pxsim.PanicCode.MICROBIT_NULL_DEREFERENCE);
            return pxsim.Image.height;
        }
        ImageMethods.height = height;
        function width(leds) {
            if (!leds)
                pxsim.panic(pxsim.PanicCode.MICROBIT_NULL_DEREFERENCE);
            return leds.width;
        }
        ImageMethods.width = width;
        function plotFrame(leds, frame) {
            ImageMethods.plotImage(leds, frame * pxsim.Image.height);
        }
        ImageMethods.plotFrame = plotFrame;
        function showFrame(leds, frame) {
            ImageMethods.showImage(leds, frame * pxsim.Image.height);
        }
        ImageMethods.showFrame = showFrame;
        function pixel(leds, x, y) {
            if (!leds)
                pxsim.panic(pxsim.PanicCode.MICROBIT_NULL_DEREFERENCE);
            return leds.get(x, y);
        }
        ImageMethods.pixel = pixel;
        function setPixel(leds, x, y, v) {
            if (!leds)
                pxsim.panic(pxsim.PanicCode.MICROBIT_NULL_DEREFERENCE);
            leds.set(x, y, v);
        }
        ImageMethods.setPixel = setPixel;
        function clear(leds) {
            if (!leds)
                pxsim.panic(pxsim.PanicCode.MICROBIT_NULL_DEREFERENCE);
            leds.clear();
        }
        ImageMethods.clear = clear;
        function setPixelBrightness(i, x, y, b) {
            if (!i)
                pxsim.panic(pxsim.PanicCode.MICROBIT_NULL_DEREFERENCE);
            i.set(x, y, b);
        }
        ImageMethods.setPixelBrightness = setPixelBrightness;
        function pixelBrightness(i, x, y) {
            if (!i)
                pxsim.panic(pxsim.PanicCode.MICROBIT_NULL_DEREFERENCE);
            return i.get(x, y);
        }
        ImageMethods.pixelBrightness = pixelBrightness;
        function scrollImage(leds, interval, stride) {
            if (!leds)
                pxsim.panic(pxsim.PanicCode.MICROBIT_NULL_DEREFERENCE);
            var cb = pxsim.getResume();
            var off = stride > 0 ? 0 : leds.width - 1;
            var display = pxsim.board().image;
            pxsim.board().animationQ.enqueue({
                interval: interval,
                frame: function () {
                    if (off >= leds.width || off < 0)
                        return false;
                    stride > 0 ? display.shiftLeft(stride) : display.shiftRight(-stride);
                    var c = Math.min(stride, leds.width - off);
                    leds.copyTo(off, c, display, 5 - stride);
                    off += stride;
                    return true;
                },
                whenDone: cb
            });
        }
        ImageMethods.scrollImage = scrollImage;
    })(ImageMethods = pxsim.ImageMethods || (pxsim.ImageMethods = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var micro_bit;
    (function (micro_bit) {
        var svg = pxsim.svg;
        micro_bit.themes = ["#3ADCFE", "#FFD43A", "#3AFFB3", "#FF3A54"].map(function (accent) {
            return {
                accent: accent,
                display: "#000",
                pin: "#D4AF37",
                pinTouched: "#FFA500",
                pinActive: "#FF5500",
                ledOn: "#ff7f7f",
                ledOff: "#202020",
                buttonOuter: "#979797",
                buttonUp: "#000",
                buttonDown: "#FFA500",
                virtualButtonOuter: "#333",
                virtualButtonUp: "#fff",
                lightLevelOn: "yellow",
                lightLevelOff: "#555"
            };
        });
        function randomTheme() {
            return micro_bit.themes[Math.floor(Math.random() * micro_bit.themes.length)];
        }
        micro_bit.randomTheme = randomTheme;
        var pointerEvents = !!window.PointerEvent ? {
            up: "pointerup",
            down: "pointerdown",
            move: "pointermove",
            leave: "pointerleave"
        } : {
            up: "mouseup",
            down: "mousedown",
            move: "mousemove",
            leave: "mouseleave"
        };
        var MicrobitBoardSvg = (function () {
            function MicrobitBoardSvg(props) {
                var _this = this;
                this.props = props;
                this.headInitialized = false;
                this.lastFlashTime = 0;
                this.lastAntennaFlash = 0;
                this.board = this.props.runtime.board;
                this.board.updateView = function () { return _this.updateState(); };
                this.buildDom();
                this.updateTheme();
                this.updateState();
                this.attachEvents();
            }
            MicrobitBoardSvg.prototype.updateTheme = function () {
                var theme = this.props.theme;
                svg.fill(this.display, theme.display);
                svg.fills(this.leds, theme.ledOn);
                svg.fills(this.ledsOuter, theme.ledOff);
                svg.fills(this.buttonsOuter.slice(0, 2), theme.buttonOuter);
                svg.fills(this.buttons.slice(0, 2), theme.buttonUp);
                svg.fill(this.buttonsOuter[2], theme.virtualButtonOuter);
                svg.fill(this.buttons[2], theme.virtualButtonUp);
                svg.fills(this.logos, theme.accent);
                if (this.shakeButton)
                    svg.fill(this.shakeButton, theme.virtualButtonUp);
                this.pinGradients.forEach(function (lg) { return svg.setGradientColors(lg, theme.pin, theme.pinActive); });
                svg.setGradientColors(this.lightLevelGradient, theme.lightLevelOn, theme.lightLevelOff);
                svg.setGradientColors(this.thermometerGradient, theme.ledOff, theme.ledOn);
            };
            MicrobitBoardSvg.prototype.updateState = function () {
                var _this = this;
                var state = this.board;
                if (!state)
                    return;
                var theme = this.props.theme;
                state.buttons.forEach(function (btn, index) {
                    svg.fill(_this.buttons[index], btn.pressed ? theme.buttonDown : theme.buttonUp);
                });
                var bw = state.displayMode == pxsim.DisplayMode.bw;
                var img = state.image;
                this.leds.forEach(function (led, i) {
                    var sel = led;
                    sel.style.opacity = ((bw ? img.data[i] > 0 ? 255 : 0 : img.data[i]) / 255.0) + "";
                });
                this.updatePins();
                this.updateTilt();
                this.updateHeading();
                this.updateLightLevel();
                this.updateTemperature();
                this.updateButtonAB();
                this.updateGestures();
                if (!pxsim.runtime || pxsim.runtime.dead)
                    svg.addClass(this.element, "grayscale");
                else
                    svg.removeClass(this.element, "grayscale");
            };
            MicrobitBoardSvg.prototype.updateGestures = function () {
                var _this = this;
                var state = this.board;
                if (state.useShake && !this.shakeButton) {
                    this.shakeButton = svg.child(this.g, "circle", { cx: 380, cy: 100, r: 16.5 });
                    svg.fill(this.shakeButton, this.props.theme.virtualButtonUp);
                    this.shakeButton.addEventListener(pointerEvents.down, function (ev) {
                        var state = _this.board;
                        svg.fill(_this.shakeButton, _this.props.theme.buttonDown);
                    });
                    this.shakeButton.addEventListener(pointerEvents.leave, function (ev) {
                        var state = _this.board;
                        svg.fill(_this.shakeButton, _this.props.theme.virtualButtonUp);
                    });
                    this.shakeButton.addEventListener(pointerEvents.up, function (ev) {
                        var state = _this.board;
                        svg.fill(_this.shakeButton, _this.props.theme.virtualButtonUp);
                        _this.board.bus.queue(27 /* MICROBIT_ID_GESTURE */, 11); // GESTURE_SHAKE
                    });
                    this.shakeText = svg.child(this.g, "text", { x: 400, y: 110, class: "sim-text" });
                    this.shakeText.textContent = "SHAKE";
                }
            };
            MicrobitBoardSvg.prototype.updateButtonAB = function () {
                var state = this.board;
                if (state.usesButtonAB && !this.buttonABText) {
                    this.buttonsOuter[2].style.visibility = "visible";
                    this.buttons[2].style.visibility = "visible";
                    this.buttonABText = svg.child(this.g, "text", { class: "sim-text", x: 370, y: 272 });
                    this.buttonABText.textContent = "A+B";
                    this.updateTheme();
                }
            };
            MicrobitBoardSvg.prototype.updatePin = function (pin, index) {
                if (!pin)
                    return;
                var text = this.pinTexts[index];
                var v = "";
                if (pin.mode & pxsim.PinMode.Analog) {
                    v = Math.floor(100 - (pin.value || 0) / 1023 * 100) + "%";
                    if (text)
                        text.textContent = (pin.period ? "~" : "") + (pin.value || 0) + "";
                }
                else if (pin.mode & pxsim.PinMode.Digital) {
                    v = pin.value > 0 ? '0%' : '100%';
                    if (text)
                        text.textContent = pin.value > 0 ? "1" : "0";
                }
                else if (pin.mode & pxsim.PinMode.Touch) {
                    v = pin.touched ? '0%' : '100%';
                    if (text)
                        text.textContent = "";
                }
                else {
                    v = '100%';
                    if (text)
                        text.textContent = '';
                }
                if (v)
                    svg.setGradientValue(this.pinGradients[index], v);
            };
            MicrobitBoardSvg.prototype.updateTemperature = function () {
                var _this = this;
                var state = this.board;
                if (!state || !state.usesTemperature)
                    return;
                var tmin = -5;
                var tmax = 50;
                if (!this.thermometer) {
                    var gid = "gradient-thermometer";
                    this.thermometerGradient = svg.linearGradient(this.defs, gid);
                    this.thermometer = svg.child(this.g, "rect", {
                        class: "sim-thermometer",
                        x: 120,
                        y: 110,
                        width: 20,
                        height: 160,
                        rx: 5, ry: 5,
                        fill: "url(#" + gid + ")"
                    });
                    this.thermometerText = svg.child(this.g, "text", { class: 'sim-text', x: 58, y: 130 });
                    this.updateTheme();
                    var pt_1 = this.element.createSVGPoint();
                    svg.buttonEvents(this.thermometer, function (ev) {
                        var cur = svg.cursorPoint(pt_1, _this.element, ev);
                        var t = Math.max(0, Math.min(1, (260 - cur.y) / 140));
                        state.temperature = Math.floor(tmin + t * (tmax - tmin));
                        _this.updateTemperature();
                    }, function (ev) { }, function (ev) { });
                }
                var t = Math.max(tmin, Math.min(tmax, state.temperature));
                var per = Math.floor((state.temperature - tmin) / (tmax - tmin) * 100);
                svg.setGradientValue(this.thermometerGradient, 100 - per + "%");
                this.thermometerText.textContent = t + "°C";
            };
            MicrobitBoardSvg.prototype.updateHeading = function () {
                var _this = this;
                var xc = 258;
                var yc = 75;
                var state = this.board;
                if (!state || !state.usesHeading)
                    return;
                if (!this.headInitialized) {
                    var p = this.head.firstChild.nextSibling;
                    p.setAttribute("d", "m269.9,50.134647l0,0l-39.5,0l0,0c-14.1,0.1 -24.6,10.7 -24.6,24.8c0,13.9 10.4,24.4 24.3,24.7l0,0l39.6,0c14.2,0 40.36034,-22.97069 40.36034,-24.85394c0,-1.88326 -26.06034,-24.54606 -40.16034,-24.64606m-0.2,39l0,0l-39.3,0c-7.7,-0.1 -14,-6.4 -14,-14.2c0,-7.8 6.4,-14.2 14.2,-14.2l39.1,0c7.8,0 14.2,6.4 14.2,14.2c0,7.9 -6.4,14.2 -14.2,14.2l0,0l0,0z");
                    this.updateTheme();
                    var pt_2 = this.element.createSVGPoint();
                    svg.buttonEvents(this.head, function (ev) {
                        var cur = svg.cursorPoint(pt_2, _this.element, ev);
                        state.heading = Math.floor(Math.atan2(cur.y - yc, cur.x - xc) * 180 / Math.PI + 90);
                        if (state.heading < 0)
                            state.heading += 360;
                        _this.updateHeading();
                    });
                    this.headInitialized = true;
                }
                var txt = state.heading.toString() + "°";
                if (txt != this.headText.textContent) {
                    svg.rotateElement(this.head, xc, yc, state.heading + 180);
                    this.headText.textContent = txt;
                }
            };
            MicrobitBoardSvg.prototype.flashSystemLed = function () {
                if (!this.systemLed)
                    this.systemLed = svg.child(this.g, "circle", { class: "sim-systemled", cx: 300, cy: 20, r: 5 });
                var now = Date.now();
                if (now - this.lastFlashTime > 150) {
                    this.lastFlashTime = now;
                    svg.animate(this.systemLed, "sim-flash");
                }
            };
            MicrobitBoardSvg.prototype.flashAntenna = function () {
                if (!this.antenna) {
                    var ax = 380;
                    var dax = 18;
                    var ayt = 10;
                    var ayb = 40;
                    this.antenna = svg.child(this.g, "polyline", { class: "sim-antenna", points: ax + "," + ayb + " " + ax + "," + ayt + " " + (ax += dax) + "," + ayt + " " + ax + "," + ayb + " " + (ax += dax) + "," + ayb + " " + ax + "," + ayt + " " + (ax += dax) + "," + ayt + " " + ax + "," + ayb + " " + (ax += dax) + "," + ayb + " " + ax + "," + ayt + " " + (ax += dax) + "," + ayt });
                }
                var now = Date.now();
                if (now - this.lastAntennaFlash > 200) {
                    this.lastAntennaFlash = now;
                    svg.animate(this.antenna, 'sim-flash-stroke');
                }
            };
            MicrobitBoardSvg.prototype.updatePins = function () {
                var _this = this;
                var state = this.board;
                if (!state)
                    return;
                state.pins.forEach(function (pin, i) { return _this.updatePin(pin, i); });
            };
            MicrobitBoardSvg.prototype.updateLightLevel = function () {
                var _this = this;
                var state = this.board;
                if (!state || !state.usesLightLevel)
                    return;
                if (!this.lightLevelButton) {
                    var gid = "gradient-light-level";
                    this.lightLevelGradient = svg.linearGradient(this.defs, gid);
                    var cy_1 = 50;
                    var r_1 = 35;
                    this.lightLevelButton = svg.child(this.g, "circle", {
                        cx: "50px", cy: cy_1 + "px", r: r_1 + "px",
                        class: 'sim-light-level-button',
                        fill: "url(#" + gid + ")"
                    });
                    var pt_3 = this.element.createSVGPoint();
                    svg.buttonEvents(this.lightLevelButton, function (ev) {
                        var pos = svg.cursorPoint(pt_3, _this.element, ev);
                        var rs = r_1 / 2;
                        var level = Math.max(0, Math.min(255, Math.floor((pos.y - (cy_1 - rs)) / (2 * rs) * 255)));
                        if (level != _this.board.lightLevel) {
                            _this.board.lightLevel = level;
                            _this.applyLightLevel();
                        }
                    }, function (ev) { }, function (ev) { });
                    this.lightLevelText = svg.child(this.g, "text", { x: 85, y: cy_1 + r_1 - 5, text: '', class: 'sim-text' });
                    this.updateTheme();
                }
                svg.setGradientValue(this.lightLevelGradient, Math.min(100, Math.max(0, Math.floor(state.lightLevel * 100 / 255))) + '%');
                this.lightLevelText.textContent = state.lightLevel.toString();
            };
            MicrobitBoardSvg.prototype.applyLightLevel = function () {
                var lv = this.board.lightLevel;
                svg.setGradientValue(this.lightLevelGradient, Math.min(100, Math.max(0, Math.floor(lv * 100 / 255))) + '%');
                this.lightLevelText.textContent = lv.toString();
            };
            MicrobitBoardSvg.prototype.updateTilt = function () {
                if (this.props.disableTilt)
                    return;
                var state = this.board;
                if (!state || !state.accelerometer.isActive)
                    return;
                var x = state.accelerometer.getX();
                var y = state.accelerometer.getY();
                var af = 8 / 1023;
                this.element.style.transform = "perspective(30em) rotateX(" + y * af + "deg) rotateY(" + x * af + "deg)";
                this.element.style.perspectiveOrigin = "50% 50% 50%";
                this.element.style.perspective = "30em";
            };
            MicrobitBoardSvg.prototype.buildDom = function () {
                var _this = this;
                this.element = svg.elt("svg");
                svg.hydrate(this.element, {
                    "version": "1.0",
                    "viewBox": "0 0 498 406",
                    "enable-background": "new 0 0 498 406",
                    "class": "sim",
                    "x": "0px",
                    "y": "0px"
                });
                this.style = svg.child(this.element, "style", {});
                this.style.textContent = "\nsvg.sim {\n    margin-bottom:1em;\n}\nsvg.sim.grayscale {    \n    -moz-filter: grayscale(1);\n    -webkit-filter: grayscale(1);\n    filter: grayscale(1);\n}\n.sim-button {\n    pointer-events: none;    \n}\n\n.sim-button-outer:hover {\n    stroke:grey;\n    stroke-width: 3px;\n}\n\n.sim-pin:hover {\n    stroke:#D4AF37;\n    stroke-width:2px;\n}\n\n.sim-pin-touch.touched:hover {\n    stroke:darkorange;\n}\n\n.sim-led-back:hover {\n    stroke:#a0a0a0;\n    stroke-width:3px;\n}\n.sim-led:hover {\n    stroke:#ff7f7f;\n    stroke-width:3px;\n}\n\n.sim-systemled {\n    fill:#333;\n    stroke:#555;\n    stroke-width: 1px;\n}\n\n.sim-light-level-button {\n    stroke:#fff;\n    stroke-width: 3px;\n}\n\n.sim-antenna {\n    stroke:#555;\n    stroke-width: 2px;\n}\n\n.sim-text {\n  font-family:\"Lucida Console\", Monaco, monospace;\n  font-size:25px;\n  fill:#fff;\n  pointer-events: none;\n}\n\n.sim-text-pin {\n  font-family:\"Lucida Console\", Monaco, monospace;\n  font-size:20px;\n  fill:#fff;\n  pointer-events: none;\n}\n\n.sim-thermometer {\n    stroke:#aaa;\n    stroke-width: 3px;\n}\n\n/* animations */\n.sim-theme-glow {\n    animation-name: sim-theme-glow-animation;\n    animation-timing-function: ease-in-out;\n    animation-direction: alternate;\n    animation-iteration-count: infinite;\n    animation-duration: 1.25s;\n}\n@keyframes sim-theme-glow-animation {  \n    from { opacity: 1; }\n    to   { opacity: 0.8; }\n}\n\n.sim-flash {\n    animation-name: sim-flash-animation;\n    animation-duration: 0.1s;\n}\n\n@keyframes sim-flash-animation {  \n    from { fill: yellow; }\n    to   { fill: default; }\n}\n\n.sim-flash-stroke {\n    animation-name: sim-flash-stroke-animation;\n    animation-duration: 0.4s;\n    animation-timing-function: ease-in;\n}\n\n@keyframes sim-flash-stroke-animation {  \n    from { stroke: yellow; }\n    to   { stroke: default; }\n}\n\n            ";
                this.defs = svg.child(this.element, "defs", {});
                this.g = svg.elt("g");
                this.element.appendChild(this.g);
                // filters
                var glow = svg.child(this.defs, "filter", { id: "filterglow", x: "-5%", y: "-5%", width: "120%", height: "120%" });
                svg.child(glow, "feGaussianBlur", { stdDeviation: "5", result: "glow" });
                var merge = svg.child(glow, "feMerge", {});
                for (var i = 0; i < 3; ++i)
                    svg.child(merge, "feMergeNode", { in: "glow" });
                // outline
                svg.path(this.g, "sim-board", "M498,31.9C498,14.3,483.7,0,466.1,0H31.9C14.3,0,0,14.3,0,31.9v342.2C0,391.7,14.3,406,31.9,406h434.2c17.6,0,31.9-14.3,31.9-31.9V31.9z M14.3,206.7c-2.7,0-4.8-2.2-4.8-4.8c0-2.7,2.2-4.8,4.8-4.8c2.7,0,4.8,2.2,4.8,4.8C19.2,204.6,17,206.7,14.3,206.7z M486.2,206.7c-2.7,0-4.8-2.2-4.8-4.8c0-2.72.2-4.8,4.8-4.8c2.7,0,4.8,2.2,4.8,4.8C491,204.6,488.8,206.7,486.2,206.7z");
                // script background
                this.display = svg.path(this.g, "sim-display", "M333.8,310.3H165.9c-8.3,0-15-6.7-15-15V127.5c0-8.3,6.7-15,15-15h167.8c8.3,0,15,6.7,15,15v167.8C348.8,303.6,342.1,310.3,333.8,310.3z");
                this.logos = [];
                this.logos.push(svg.child(this.g, "polygon", { class: "sim-theme", points: "115,56.7 173.1,0 115,0" }));
                this.logos.push(svg.path(this.g, "sim-theme", "M114.2,0H25.9C12.1,2.1,0,13.3,0,27.7v83.9L114.2,0z"));
                this.logos.push(svg.child(this.g, "polygon", { class: "sim-theme", points: "173,27.9 202.5,0 173,0" }));
                this.logos.push(svg.child(this.g, "polygon", { class: "sim-theme", points: "54.1,242.4 54.1,274.1 22.4,274.1" }));
                this.logos.push(svg.child(this.g, "polygon", { class: "sim-theme", points: "446.2,164.6 446.2,132.8 477.9,132.8" }));
                // leds
                this.leds = [];
                this.ledsOuter = [];
                var left = 154, top = 113, ledoffw = 46, ledoffh = 44;
                for (var i = 0; i < 5; ++i) {
                    var ledtop = i * ledoffh + top;
                    for (var j = 0; j < 5; ++j) {
                        var ledleft = j * ledoffw + left;
                        var k = i * 5 + j;
                        this.ledsOuter.push(svg.child(this.g, "rect", { class: "sim-led-back", x: ledleft, y: ledtop, width: 10, height: 20, rx: 2, ry: 2 }));
                        this.leds.push(svg.child(this.g, "rect", { class: "sim-led", x: ledleft - 2, y: ledtop - 2, width: 14, height: 24, rx: 3, ry: 3, title: "(" + j + "," + i + ")" }));
                    }
                }
                // head
                this.head = svg.child(this.g, "g", {});
                svg.child(this.head, "circle", { cx: 258, cy: 75, r: 100, fill: "transparent" });
                this.logos.push(svg.path(this.head, "sim-theme sim-theme-glow", "M269.9,50.2L269.9,50.2l-39.5,0v0c-14.1,0.1-24.6,10.7-24.6,24.8c0,13.9,10.4,24.4,24.3,24.7v0h39.6c14.2,0,24.8-10.6,24.8-24.7C294.5,61,284,50.3,269.9,50.2 M269.7,89.2L269.7,89.2l-39.3,0c-7.7-0.1-14-6.4-14-14.2c0-7.8,6.4-14.2,14.2-14.2h39.1c7.8,0,14.2,6.4,14.2,14.2C283.9,82.9,277.5,89.2,269.7,89.2"));
                this.logos.push(svg.path(this.head, "sim-theme sim-theme-glow", "M230.6,69.7c-2.9,0-5.3,2.4-5.3,5.3c0,2.9,2.4,5.3,5.3,5.3c2.9,0,5.3-2.4,5.3-5.3C235.9,72.1,233.5,69.7,230.6,69.7"));
                this.logos.push(svg.path(this.head, "sim-theme sim-theme-glow", "M269.7,80.3c2.9,0,5.3-2.4,5.3-5.3c0-2.9-2.4-5.3-5.3-5.3c-2.9,0-5.3,2.4-5.3,5.3C264.4,77.9,266.8,80.3,269.7,80.3"));
                this.headText = svg.child(this.g, "text", { x: 310, y: 100, class: "sim-text" });
                // https://www.microbit.co.uk/device/pins
                // P0, P1, P2
                this.pins = [
                    "M16.5,341.2c0,0.4-0.1,0.9-0.1,1.3v60.7c4.1,1.7,8.6,2.7,12.9,2.7h34.4v-64.7h0.3c0,0,0-0.1,0-0.1c0-13-10.6-23.6-23.7-23.6C27.2,317.6,16.5,328.1,16.5,341.2z M21.2,341.6c0-10.7,8.7-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3c0,10.7-8.6,19.3-19.3,19.3C29.9,360.9,21.2,352.2,21.2,341.6z",
                    "M139.1,317.3c-12.8,0-22.1,10.3-23.1,23.1V406h46.2v-65.6C162.2,327.7,151.9,317.3,139.1,317.3zM139.3,360.1c-10.7,0-19.3-8.6-19.3-19.3c0-10.7,8.6-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3C158.6,351.5,150,360.1,139.3,360.1z",
                    "M249,317.3c-12.8,0-22.1,10.3-23.1,23.1V406h46.2v-65.6C272.1,327.7,261.8,317.3,249,317.3z M249.4,360.1c-10.7,0-19.3-8.6-19.3-19.3c0-10.7,8.6-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3C268.7,351.5,260.1,360.1,249.4,360.1z"
                ].map(function (p, pi) { return svg.path(_this.g, "sim-pin sim-pin-touch", p, "P" + pi + ", ANALOG IN"); });
                // P3
                this.pins.push(svg.path(this.g, "sim-pin", "M0,357.7v19.2c0,10.8,6.2,20.2,14.4,25.2v-44.4H0z", "P3, ANALOG IN, LED Col 1"));
                [66.7, 79.1, 91.4, 103.7, 164.3, 176.6, 188.9, 201.3, 213.6, 275.2, 287.5, 299.8, 312.1, 324.5, 385.1, 397.4, 409.7, 422].forEach(function (x) {
                    _this.pins.push(svg.child(_this.g, "rect", { x: x, y: 356.7, width: 10, height: 50, class: "sim-pin" }));
                });
                svg.title(this.pins[4], "P4, ANALOG IN, LED Col 2");
                svg.title(this.pins[5], "P5, BUTTON A");
                svg.title(this.pins[6], "P6, LED Col 9");
                svg.title(this.pins[7], "P7, LED Col 8");
                svg.title(this.pins[8], "P8");
                svg.title(this.pins[9], "P9, LED Col 7");
                svg.title(this.pins[10], "P10, ANALOG IN, LED Col 3");
                svg.title(this.pins[11], "P11, BUTTON B");
                svg.title(this.pins[12], "P12, RESERVED ACCESSIBILITY");
                svg.title(this.pins[13], "P13, SPI - SCK");
                svg.title(this.pins[14], "P14, SPI - MISO");
                svg.title(this.pins[15], "P15, SPI - MOSI");
                svg.title(this.pins[16], "P16, SPI - Chip Select");
                svg.title(this.pins[17], "P17, +3v3");
                svg.title(this.pins[18], "P18, +3v3");
                svg.title(this.pins[19], "P19, I2C - SCL");
                svg.title(this.pins[20], "P20, I2C - SDA");
                svg.title(this.pins[21], "GND");
                this.pins.push(svg.path(this.g, "sim-pin", "M483.6,402c8.2-5,14.4-14.4,14.4-25.1v-19.2h-14.4V402z", "GND"));
                this.pins.push(svg.path(this.g, "sim-pin", "M359.9,317.3c-12.8,0-22.1,10.3-23.1,23.1V406H383v-65.6C383,327.7,372.7,317.3,359.9,317.3z M360,360.1c-10.7,0-19.3-8.6-19.3-19.3c0-10.7,8.6-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3C379.3,351.5,370.7,360.1,360,360.1z", "+3v3"));
                this.pins.push(svg.path(this.g, "sim-pin", "M458,317.6c-13,0-23.6,10.6-23.6,23.6c0,0,0,0.1,0,0.1h0V406H469c4.3,0,8.4-1,12.6-2.7v-60.7c0-0.4,0-0.9,0-1.3C481.6,328.1,471,317.6,458,317.6z M457.8,360.9c-10.7,0-19.3-8.6-19.3-19.3c0-10.7,8.6-19.3,19.3-19.3c10.7,0,19.3,8.7,19.3,19.3C477.1,352.2,468.4,360.9,457.8,360.9z", "GND"));
                this.pinGradients = this.pins.map(function (pin, i) {
                    var gid = "gradient-pin-" + i;
                    var lg = svg.linearGradient(_this.defs, gid);
                    pin.setAttribute("fill", "url(#" + gid + ")");
                    return lg;
                });
                this.pinTexts = [67, 165, 275].map(function (x) { return svg.child(_this.g, "text", { class: 'sim-text-pin', x: x, y: 345 }); });
                this.buttonsOuter = [];
                this.buttons = [];
                this.buttonsOuter.push(svg.path(this.g, "sim-button-outer", "M82.1,232.6H25.9c-0.5,0-1-0.4-1-1v-56.2c0-0.5,0.4-1,1-1h56.2c0.5,0,1,0.4,1,1v56.2C83,232.2,82.6,232.6,82.1,232.6", "A"));
                this.buttons.push(svg.path(this.g, "sim-button", "M69.7,203.5c0,8.7-7,15.7-15.7,15.7s-15.7-7-15.7-15.7c0-8.7,7-15.7,15.7-15.7S69.7,194.9,69.7,203.5"));
                this.buttonsOuter.push(svg.path(this.g, "sim-button-outer", "M474.3,232.6h-56.2c-0.5,0-1-0.4-1-1v-56.2c0-0.5,0.4-1,1-1h56.2c0.5,0,1,0.4,1,1v56.2C475.3,232.2,474.8,232.6,474.3,232.6", "B"));
                this.buttons.push(svg.path(this.g, "sim-button", "M461.9,203.5c0,8.7-7,15.7-15.7,15.7c-8.7,0-15.7-7-15.7-15.7c0-8.7,7-15.7,15.7-15.7C454.9,187.8,461.9,194.9,461.9,203.5"));
                this.buttonsOuter.push(svg.child(this.g, "rect", { class: "sim-button-outer", x: 417, y: 250, width: 58, height: 58, rx: 1, ry: 1, title: "A+B" }));
                this.buttons.push(svg.child(this.g, "circle", { class: "sim-button", cx: 446, cy: 278, r: 16.5 }));
                this.buttonsOuter[2].style.visibility = 'hidden';
                this.buttons[2].style.visibility = 'hidden';
                svg.path(this.g, "sim-label", "M35.7,376.4c0-2.8,2.1-5.1,5.5-5.1c3.3,0,5.5,2.4,5.5,5.1v4.7c0,2.8-2.2,5.1-5.5,5.1c-3.3,0-5.5-2.4-5.5-5.1V376.4zM43.3,376.4c0-1.3-0.8-2.3-2.2-2.3c-1.3,0-2.1,1.1-2.1,2.3v4.7c0,1.2,0.8,2.3,2.1,2.3c1.3,0,2.2-1.1,2.2-2.3V376.4z");
                svg.path(this.g, "sim-label", "M136.2,374.1c2.8,0,3.4-0.8,3.4-2.5h2.9v14.3h-3.4v-9.5h-3V374.1z");
                svg.path(this.g, "sim-label", "M248.6,378.5c1.7-1,3-1.7,3-3.1c0-1.1-0.7-1.6-1.6-1.6c-1,0-1.8,0.6-1.8,2.1h-3.3c0-2.6,1.8-4.6,5.1-4.6c2.6,0,4.9,1.3,4.9,4.3c0,2.4-2.3,3.9-3.8,4.7c-2,1.3-2.5,1.8-2.5,2.9h6.1v2.7h-10C244.8,381.2,246.4,379.9,248.6,378.5z");
                svg.path(this.g, "sim-button-label", "M48.1,270.9l-0.6-1.7h-5.1l-0.6,1.7h-3.5l5.1-14.3h3.1l5.2,14.3H48.1z M45,260.7l-1.8,5.9h3.5L45,260.7z");
                svg.path(this.g, "sim-button-label", "M449.1,135.8h5.9c3.9,0,4.7,2.4,4.7,3.9c0,1.8-1.4,2.9-2.5,3.2c0.9,0,2.6,1.1,2.6,3.3c0,1.5-0.8,4-4.7,4h-6V135.8zM454.4,141.7c1.6,0,2-1,2-1.7c0-0.6-0.3-1.7-2-1.7h-2v3.4H454.4z M452.4,144.1v3.5h2.1c1.6,0,2-1,2-1.8c0-0.7-0.4-1.8-2-1.8H452.4z");
                svg.path(this.g, "sim-label", "M352.1,381.1c0,1.6,0.9,2.5,2.2,2.5c1.2,0,1.9-0.9,1.9-1.9c0-1.2-0.6-2-2.1-2h-1.3v-2.6h1.3c1.5,0,1.9-0.7,1.9-1.8c0-1.1-0.7-1.6-1.6-1.6c-1.4,0-1.8,0.8-1.8,2.1h-3.3c0-2.4,1.5-4.6,5.1-4.6c2.6,0,5,1.3,5,4c0,1.6-1,2.8-2.1,3.2c1.3,0.5,2.3,1.6,2.3,3.5c0,2.7-2.4,4.3-5.2,4.3c-3.5,0-5.5-2.1-5.5-5.1H352.1z");
                svg.path(this.g, "sim-label", "M368.5,385.9h-3.1l-5.1-14.3h3.5l3.1,10.1l3.1-10.1h3.6L368.5,385.9z");
                svg.path(this.g, "sim-label", "M444.4,378.3h7.4v2.5h-1.5c-0.6,3.3-3,5.5-7.1,5.5c-4.8,0-7.5-3.5-7.5-7.5c0-3.9,2.8-7.5,7.5-7.5c3.8,0,6.4,2.3,6.6,5h-3.5c-0.2-1.1-1.4-2.2-3.1-2.2c-2.7,0-4.1,2.3-4.1,4.7c0,2.5,1.4,4.7,4.4,4.7c2,0,3.2-1.2,3.4-2.7h-2.5V378.3z");
                svg.path(this.g, "sim-label", "M461.4,380.9v-9.3h3.3v14.3h-3.5l-5.2-9.2v9.2h-3.3v-14.3h3.5L461.4,380.9z");
                svg.path(this.g, "sim-label", "M472.7,371.6c4.8,0,7.5,3.5,7.5,7.2s-2.7,7.2-7.5,7.2h-5.3v-14.3H472.7z M470.8,374.4v8.6h1.8c2.7,0,4.2-2.1,4.2-4.3s-1.6-4.3-4.2-4.3H470.8z");
            };
            MicrobitBoardSvg.prototype.attachEvents = function () {
                var _this = this;
                pxsim.Runtime.messagePosted = function (msg) {
                    switch (msg.type || '') {
                        case 'serial':
                            _this.flashSystemLed();
                            break;
                        case 'radiopacket':
                            _this.flashAntenna();
                            break;
                    }
                };
                var tiltDecayer = 0;
                this.element.addEventListener(pointerEvents.move, function (ev) {
                    var state = _this.board;
                    if (!state.accelerometer.isActive)
                        return;
                    if (tiltDecayer) {
                        clearInterval(tiltDecayer);
                        tiltDecayer = 0;
                    }
                    var ax = (ev.clientX - _this.element.clientWidth / 2) / (_this.element.clientWidth / 3);
                    var ay = (ev.clientY - _this.element.clientHeight / 2) / (_this.element.clientHeight / 3);
                    var x = -Math.max(-1023, Math.min(1023, Math.floor(ax * 1023)));
                    var y = Math.max(-1023, Math.min(1023, Math.floor(ay * 1023)));
                    var z2 = 1023 * 1023 - x * x - y * y;
                    var z = Math.floor((z2 > 0 ? -1 : 1) * Math.sqrt(Math.abs(z2)));
                    state.accelerometer.update(x, y, z);
                    _this.updateTilt();
                }, false);
                this.element.addEventListener(pointerEvents.leave, function (ev) {
                    var state = _this.board;
                    if (!state.accelerometer.isActive)
                        return;
                    if (!tiltDecayer) {
                        tiltDecayer = setInterval(function () {
                            var accx = state.accelerometer.getX(pxsim.MicroBitCoordinateSystem.RAW);
                            accx = Math.floor(Math.abs(accx) * 0.85) * (accx > 0 ? 1 : -1);
                            var accy = state.accelerometer.getY(pxsim.MicroBitCoordinateSystem.RAW);
                            accy = Math.floor(Math.abs(accy) * 0.85) * (accy > 0 ? 1 : -1);
                            var accz = -Math.sqrt(Math.max(0, 1023 * 1023 - accx * accx - accy * accy));
                            if (Math.abs(accx) <= 24 && Math.abs(accy) <= 24) {
                                clearInterval(tiltDecayer);
                                tiltDecayer = 0;
                                accx = 0;
                                accy = 0;
                                accz = -1023;
                            }
                            state.accelerometer.update(accx, accy, accz);
                            _this.updateTilt();
                        }, 50);
                    }
                }, false);
                this.pins.forEach(function (pin, index) {
                    if (!_this.board.pins[index])
                        return;
                    var pt = _this.element.createSVGPoint();
                    svg.buttonEvents(pin, 
                    // move
                    function (ev) {
                        var state = _this.board;
                        var pin = state.pins[index];
                        var svgpin = _this.pins[index];
                        if (pin.mode & pxsim.PinMode.Input) {
                            var cursor = svg.cursorPoint(pt, _this.element, ev);
                            var v = (400 - cursor.y) / 40 * 1023;
                            pin.value = Math.max(0, Math.min(1023, Math.floor(v)));
                        }
                        _this.updatePin(pin, index);
                    }, 
                    // start
                    function (ev) {
                        var state = _this.board;
                        var pin = state.pins[index];
                        var svgpin = _this.pins[index];
                        svg.addClass(svgpin, "touched");
                        if (pin.mode & pxsim.PinMode.Input) {
                            var cursor = svg.cursorPoint(pt, _this.element, ev);
                            var v = (400 - cursor.y) / 40 * 1023;
                            pin.value = Math.max(0, Math.min(1023, Math.floor(v)));
                        }
                        _this.updatePin(pin, index);
                    }, 
                    // stop
                    function (ev) {
                        var state = _this.board;
                        var pin = state.pins[index];
                        var svgpin = _this.pins[index];
                        svg.removeClass(svgpin, "touched");
                        _this.updatePin(pin, index);
                        return false;
                    });
                });
                this.pins.slice(0, 3).forEach(function (btn, index) {
                    btn.addEventListener(pointerEvents.down, function (ev) {
                        var state = _this.board;
                        state.pins[index].touched = true;
                        _this.updatePin(state.pins[index], index);
                    });
                    btn.addEventListener(pointerEvents.leave, function (ev) {
                        var state = _this.board;
                        state.pins[index].touched = false;
                        _this.updatePin(state.pins[index], index);
                    });
                    btn.addEventListener(pointerEvents.up, function (ev) {
                        var state = _this.board;
                        state.pins[index].touched = false;
                        _this.updatePin(state.pins[index], index);
                        _this.board.bus.queue(state.pins[index].id, 3 /* MICROBIT_BUTTON_EVT_CLICK */);
                    });
                });
                this.buttonsOuter.slice(0, 2).forEach(function (btn, index) {
                    btn.addEventListener(pointerEvents.down, function (ev) {
                        var state = _this.board;
                        state.buttons[index].pressed = true;
                        svg.fill(_this.buttons[index], _this.props.theme.buttonDown);
                    });
                    btn.addEventListener(pointerEvents.leave, function (ev) {
                        var state = _this.board;
                        state.buttons[index].pressed = false;
                        svg.fill(_this.buttons[index], _this.props.theme.buttonUp);
                    });
                    btn.addEventListener(pointerEvents.up, function (ev) {
                        var state = _this.board;
                        state.buttons[index].pressed = false;
                        svg.fill(_this.buttons[index], _this.props.theme.buttonUp);
                        _this.board.bus.queue(state.buttons[index].id, 3 /* MICROBIT_BUTTON_EVT_CLICK */);
                    });
                });
                this.buttonsOuter[2].addEventListener(pointerEvents.down, function (ev) {
                    var state = _this.board;
                    state.buttons[0].pressed = true;
                    state.buttons[1].pressed = true;
                    state.buttons[2].pressed = true;
                    svg.fill(_this.buttons[0], _this.props.theme.buttonDown);
                    svg.fill(_this.buttons[1], _this.props.theme.buttonDown);
                    svg.fill(_this.buttons[2], _this.props.theme.buttonDown);
                });
                this.buttonsOuter[2].addEventListener(pointerEvents.leave, function (ev) {
                    var state = _this.board;
                    state.buttons[0].pressed = false;
                    state.buttons[1].pressed = false;
                    state.buttons[2].pressed = false;
                    svg.fill(_this.buttons[0], _this.props.theme.buttonUp);
                    svg.fill(_this.buttons[1], _this.props.theme.buttonUp);
                    svg.fill(_this.buttons[2], _this.props.theme.virtualButtonUp);
                });
                this.buttonsOuter[2].addEventListener(pointerEvents.up, function (ev) {
                    var state = _this.board;
                    state.buttons[0].pressed = false;
                    state.buttons[1].pressed = false;
                    state.buttons[2].pressed = false;
                    svg.fill(_this.buttons[0], _this.props.theme.buttonUp);
                    svg.fill(_this.buttons[1], _this.props.theme.buttonUp);
                    svg.fill(_this.buttons[2], _this.props.theme.virtualButtonUp);
                    _this.board.bus.queue(state.buttons[2].id, 3 /* MICROBIT_BUTTON_EVT_CLICK */);
                });
            };
            return MicrobitBoardSvg;
        }());
        micro_bit.MicrobitBoardSvg = MicrobitBoardSvg;
    })(micro_bit = pxsim.micro_bit || (pxsim.micro_bit = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    (function (DisplayMode) {
        DisplayMode[DisplayMode["bw"] = 0] = "bw";
        DisplayMode[DisplayMode["greyscale"] = 1] = "greyscale";
    })(pxsim.DisplayMode || (pxsim.DisplayMode = {}));
    var DisplayMode = pxsim.DisplayMode;
    (function (PinMode) {
        PinMode[PinMode["Unused"] = 0] = "Unused";
        PinMode[PinMode["Digital"] = 1] = "Digital";
        PinMode[PinMode["Analog"] = 2] = "Analog";
        PinMode[PinMode["Input"] = 4] = "Input";
        PinMode[PinMode["Output"] = 8] = "Output";
        PinMode[PinMode["Touch"] = 16] = "Touch";
    })(pxsim.PinMode || (pxsim.PinMode = {}));
    var PinMode = pxsim.PinMode;
    var Pin = (function () {
        function Pin(id) {
            this.id = id;
            this.touched = false;
            this.value = 0;
            this.period = 0;
            this.mode = PinMode.Unused;
            this.pitch = false;
        }
        Pin.prototype.isTouched = function () {
            this.mode = PinMode.Touch;
            return this.touched;
        };
        return Pin;
    }());
    pxsim.Pin = Pin;
    var Button = (function () {
        function Button(id) {
            this.id = id;
        }
        return Button;
    }());
    pxsim.Button = Button;
    var EventBus = (function () {
        function EventBus(runtime) {
            this.runtime = runtime;
            this.queues = {};
        }
        EventBus.prototype.listen = function (id, evid, handler) {
            var k = id + ':' + evid;
            var queue = this.queues[k];
            if (!queue)
                queue = this.queues[k] = new pxsim.EventQueue(this.runtime);
            queue.handler = handler;
        };
        EventBus.prototype.queue = function (id, evid, value) {
            if (value === void 0) { value = 0; }
            var k = id + ':' + evid;
            var queue = this.queues[k];
            if (queue)
                queue.push(value);
        };
        return EventBus;
    }());
    pxsim.EventBus = EventBus;
    var RadioDatagram = (function () {
        function RadioDatagram(runtime) {
            this.runtime = runtime;
            this.datagram = [];
            this.lastReceived = {
                data: [0, 0, 0, 0],
                rssi: -1
            };
        }
        RadioDatagram.prototype.queue = function (packet) {
            if (this.datagram.length < 5) {
                this.datagram.push(packet);
                pxsim.runtime.board.bus.queue(29 /* MICROBIT_ID_RADIO */, 1 /* MICROBIT_RADIO_EVT_DATAGRAM */);
            }
        };
        RadioDatagram.prototype.send = function (buffer) {
            if (buffer instanceof String)
                buffer = buffer.slice(0, 32);
            else
                buffer = buffer.slice(0, 8);
            pxsim.Runtime.postMessage({
                type: "radiopacket",
                data: buffer
            });
        };
        RadioDatagram.prototype.recv = function () {
            var r = this.datagram.shift();
            if (!r)
                r = {
                    data: [0, 0, 0, 0],
                    rssi: -1
                };
            return this.lastReceived = r;
        };
        return RadioDatagram;
    }());
    pxsim.RadioDatagram = RadioDatagram;
    var RadioBus = (function () {
        function RadioBus(runtime) {
            this.runtime = runtime;
            // uint8_t radioDefaultGroup = MICROBIT_RADIO_DEFAULT_GROUP;
            this.groupId = 0; // todo
            this.power = 0;
            this.transmitSerialNumber = false;
            this.datagram = new RadioDatagram(runtime);
        }
        RadioBus.prototype.setGroup = function (id) {
            this.groupId = id & 0xff; // byte only
        };
        RadioBus.prototype.setTransmitPower = function (power) {
            this.power = Math.max(0, Math.min(7, power));
        };
        RadioBus.prototype.setTransmitSerialNumber = function (sn) {
            this.transmitSerialNumber = !!sn;
        };
        RadioBus.prototype.broadcast = function (msg) {
            pxsim.Runtime.postMessage({
                type: 'eventbus',
                id: 2000 /* MES_BROADCAST_GENERAL_ID */,
                eventid: msg,
                power: this.power,
                group: this.groupId
            });
        };
        return RadioBus;
    }());
    pxsim.RadioBus = RadioBus;
    /**
      * Co-ordinate systems that can be used.
      * RAW: Unaltered data. Data will be returned directly from the accelerometer.
      *
      * SIMPLE_CARTESIAN: Data will be returned based on an easy to understand alignment, consistent with the cartesian system taught in schools.
      * When held upright, facing the user:
      *
      *                            /
      *    +--------------------+ z
      *    |                    |
      *    |       .....        |
      *    | *     .....      * |
      * ^  |       .....        |
      * |  |                    |
      * y  +--------------------+  x-->
      *
      *
      * NORTH_EAST_DOWN: Data will be returned based on the industry convention of the North East Down (NED) system.
      * When held upright, facing the user:
      *
      *                            z
      *    +--------------------+ /
      *    |                    |
      *    |       .....        |
      *    | *     .....      * |
      * ^  |       .....        |
      * |  |                    |
      * x  +--------------------+  y-->
      *
      */
    (function (MicroBitCoordinateSystem) {
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["RAW"] = 0] = "RAW";
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["SIMPLE_CARTESIAN"] = 1] = "SIMPLE_CARTESIAN";
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["NORTH_EAST_DOWN"] = 2] = "NORTH_EAST_DOWN";
    })(pxsim.MicroBitCoordinateSystem || (pxsim.MicroBitCoordinateSystem = {}));
    var MicroBitCoordinateSystem = pxsim.MicroBitCoordinateSystem;
    var Accelerometer = (function () {
        function Accelerometer(runtime) {
            this.runtime = runtime;
            this.sigma = 0; // the number of ticks that the instantaneous gesture has been stable.
            this.lastGesture = 0; // the last, stable gesture recorded.
            this.currentGesture = 0; // the instantaneous, unfiltered gesture detected.
            this.sample = { x: 0, y: 0, z: -1023 };
            this.shake = { x: false, y: false, z: false, count: 0, shaken: 0, timer: 0 }; // State information needed to detect shake events.
            this.isActive = false;
            this.sampleRange = 2;
            this.id = 4 /* MICROBIT_ID_ACCELEROMETER */;
        }
        Accelerometer.prototype.setSampleRange = function (range) {
            this.activate();
            this.sampleRange = Math.max(1, Math.min(8, range));
        };
        Accelerometer.prototype.activate = function () {
            if (!this.isActive) {
                this.isActive = true;
                this.runtime.queueDisplayUpdate();
            }
        };
        /**
         * Reads the acceleration data from the accelerometer, and stores it in our buffer.
         * This is called by the tick() member function, if the interrupt is set!
         */
        Accelerometer.prototype.update = function (x, y, z) {
            // read MSB values...
            this.sample.x = Math.floor(x);
            this.sample.y = Math.floor(y);
            this.sample.z = Math.floor(z);
            // Update gesture tracking
            this.updateGesture();
            // Indicate that a new sample is available
            pxsim.board().bus.queue(this.id, 1 /* MICROBIT_ACCELEROMETER_EVT_DATA_UPDATE */);
        };
        Accelerometer.prototype.instantaneousAccelerationSquared = function () {
            // Use pythagoras theorem to determine the combined force acting on the device.
            return this.sample.x * this.sample.x + this.sample.y * this.sample.y + this.sample.z * this.sample.z;
        };
        /**
         * Service function. Determines the best guess posture of the device based on instantaneous data.
         * This makes no use of historic data (except for shake), and forms this input to the filter implemented in updateGesture().
         *
         * @return A best guess of the current posture of the device, based on instantaneous data.
         */
        Accelerometer.prototype.instantaneousPosture = function () {
            var force = this.instantaneousAccelerationSquared();
            var shakeDetected = false;
            // Test for shake events.
            // We detect a shake by measuring zero crossings in each axis. In other words, if we see a strong acceleration to the left followed by
            // a string acceleration to the right, then we can infer a shake. Similarly, we can do this for each acxis (left/right, up/down, in/out).
            //
            // If we see enough zero crossings in succession (MICROBIT_ACCELEROMETER_SHAKE_COUNT_THRESHOLD), then we decide that the device
            // has been shaken.
            if ((this.getX() < -1000 /* MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.x) || (this.getX() > 1000 /* MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.x)) {
                shakeDetected = true;
                this.shake.x = !this.shake.x;
            }
            if ((this.getY() < -1000 /* MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.y) || (this.getY() > 1000 /* MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.y)) {
                shakeDetected = true;
                this.shake.y = !this.shake.y;
            }
            if ((this.getZ() < -1000 /* MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.z) || (this.getZ() > 1000 /* MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.z)) {
                shakeDetected = true;
                this.shake.z = !this.shake.z;
            }
            if (shakeDetected && this.shake.count < 4 /* MICROBIT_ACCELEROMETER_SHAKE_COUNT_THRESHOLD */ && ++this.shake.count == 4 /* MICROBIT_ACCELEROMETER_SHAKE_COUNT_THRESHOLD */)
                this.shake.shaken = 1;
            if (++this.shake.timer >= 10 /* MICROBIT_ACCELEROMETER_SHAKE_DAMPING */) {
                this.shake.timer = 0;
                if (this.shake.count > 0) {
                    if (--this.shake.count == 0)
                        this.shake.shaken = 0;
                }
            }
            if (this.shake.shaken)
                return 11 /* MICROBIT_ACCELEROMETER_EVT_SHAKE */;
            var sq = function (n) { return n * n; };
            if (force < sq(400 /* MICROBIT_ACCELEROMETER_FREEFALL_TOLERANCE */))
                return 7 /* MICROBIT_ACCELEROMETER_EVT_FREEFALL */;
            if (force > sq(3072 /* MICROBIT_ACCELEROMETER_3G_TOLERANCE */))
                return 8 /* MICROBIT_ACCELEROMETER_EVT_3G */;
            if (force > sq(6144 /* MICROBIT_ACCELEROMETER_6G_TOLERANCE */))
                return 9 /* MICROBIT_ACCELEROMETER_EVT_6G */;
            if (force > sq(8192 /* MICROBIT_ACCELEROMETER_8G_TOLERANCE */))
                return 10 /* MICROBIT_ACCELEROMETER_EVT_8G */;
            // Determine our posture.
            if (this.getX() < (-1000 + 200 /* MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 3 /* MICROBIT_ACCELEROMETER_EVT_TILT_LEFT */;
            if (this.getX() > (1000 - 200 /* MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 4 /* MICROBIT_ACCELEROMETER_EVT_TILT_RIGHT */;
            if (this.getY() < (-1000 + 200 /* MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 2 /* MICROBIT_ACCELEROMETER_EVT_TILT_DOWN */;
            if (this.getY() > (1000 - 200 /* MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 1 /* MICROBIT_ACCELEROMETER_EVT_TILT_UP */;
            if (this.getZ() < (-1000 + 200 /* MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 5 /* MICROBIT_ACCELEROMETER_EVT_FACE_UP */;
            if (this.getZ() > (1000 - 200 /* MICROBIT_ACCELEROMETER_TILT_TOLERANCE */))
                return 6 /* MICROBIT_ACCELEROMETER_EVT_FACE_DOWN */;
            return 0;
        };
        Accelerometer.prototype.updateGesture = function () {
            // Determine what it looks like we're doing based on the latest sample...
            var g = this.instantaneousPosture();
            // Perform some low pass filtering to reduce jitter from any detected effects
            if (g == this.currentGesture) {
                if (this.sigma < 10 /* MICROBIT_ACCELEROMETER_GESTURE_DAMPING */)
                    this.sigma++;
            }
            else {
                this.currentGesture = g;
                this.sigma = 0;
            }
            // If we've reached threshold, update our record and raise the relevant event...
            if (this.currentGesture != this.lastGesture && this.sigma >= 10 /* MICROBIT_ACCELEROMETER_GESTURE_DAMPING */) {
                this.lastGesture = this.currentGesture;
                pxsim.board().bus.queue(27 /* MICROBIT_ID_GESTURE */, this.lastGesture);
            }
        };
        /**
          * Reads the X axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the X axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getX();
          * uBit.accelerometer.getX(RAW);
          * @endcode
          */
        Accelerometer.prototype.getX = function (system) {
            if (system === void 0) { system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN; }
            this.activate();
            switch (system) {
                case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                    return -this.sample.x;
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    return this.sample.y;
                //case MicroBitCoordinateSystem.SIMPLE_CARTESIAN.RAW:
                default:
                    return this.sample.x;
            }
        };
        /**
          * Reads the Y axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the Y axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getY();
          * uBit.accelerometer.getY(RAW);
          * @endcode
          */
        Accelerometer.prototype.getY = function (system) {
            if (system === void 0) { system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN; }
            this.activate();
            switch (system) {
                case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                    return -this.sample.y;
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    return -this.sample.x;
                //case RAW:
                default:
                    return this.sample.y;
            }
        };
        /**
          * Reads the Z axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the Z axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getZ();
          * uBit.accelerometer.getZ(RAW);
          * @endcode
          */
        Accelerometer.prototype.getZ = function (system) {
            if (system === void 0) { system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN; }
            this.activate();
            switch (system) {
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    return -this.sample.z;
                //case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                //case MicroBitCoordinateSystem.RAW:
                default:
                    return this.sample.z;
            }
        };
        /**
          * Provides a rotation compensated pitch of the device, based on the latest update from the accelerometer.
          * @return The pitch of the device, in degrees.
          *
          * Example:
          * @code
          * uBit.accelerometer.getPitch();
          * @endcode
          */
        Accelerometer.prototype.getPitch = function () {
            this.activate();
            return Math.floor((360 * this.getPitchRadians()) / (2 * Math.PI));
        };
        Accelerometer.prototype.getPitchRadians = function () {
            this.recalculatePitchRoll();
            return this.pitch;
        };
        /**
          * Provides a rotation compensated roll of the device, based on the latest update from the accelerometer.
          * @return The roll of the device, in degrees.
          *
          * Example:
          * @code
          * uBit.accelerometer.getRoll();
          * @endcode
          */
        Accelerometer.prototype.getRoll = function () {
            this.activate();
            return Math.floor((360 * this.getRollRadians()) / (2 * Math.PI));
        };
        Accelerometer.prototype.getRollRadians = function () {
            this.recalculatePitchRoll();
            return this.roll;
        };
        /**
         * Recalculate roll and pitch values for the current sample.
         * We only do this at most once per sample, as the necessary trigonemteric functions are rather
         * heavyweight for a CPU without a floating point unit...
         */
        Accelerometer.prototype.recalculatePitchRoll = function () {
            var x = this.getX(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var y = this.getY(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var z = this.getZ(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            this.roll = Math.atan2(y, z);
            this.pitch = Math.atan(-x / (y * Math.sin(this.roll) + z * Math.cos(this.roll)));
        };
        return Accelerometer;
    }());
    pxsim.Accelerometer = Accelerometer;
    var Board = (function (_super) {
        __extends(Board, _super);
        function Board() {
            _super.call(this);
            // display
            this.image = createImage(5);
            this.brigthness = 255;
            this.displayMode = DisplayMode.bw;
            this.font = createFont();
            // buttons    
            this.usesButtonAB = false;
            // serial
            this.serialIn = [];
            // gestures
            this.useShake = false;
            this.usesHeading = false;
            this.heading = 90;
            this.usesTemperature = false;
            this.temperature = 21;
            this.usesLightLevel = false;
            this.lightLevel = 128;
            this.serialOutBuffer = '';
            this.id = "b" + pxsim.Math_.random(2147483647);
            this.animationQ = new pxsim.AnimationQueue(pxsim.runtime);
            this.bus = new EventBus(pxsim.runtime);
            this.radio = new RadioBus(pxsim.runtime);
            this.accelerometer = new Accelerometer(pxsim.runtime);
            this.buttons = [
                new Button(1 /* MICROBIT_ID_BUTTON_A */),
                new Button(2 /* MICROBIT_ID_BUTTON_B */),
                new Button(26 /* MICROBIT_ID_BUTTON_AB */)
            ];
            this.pins = [
                new Pin(7 /* MICROBIT_ID_IO_P0 */),
                new Pin(8 /* MICROBIT_ID_IO_P1 */),
                new Pin(9 /* MICROBIT_ID_IO_P2 */),
                new Pin(10 /* MICROBIT_ID_IO_P3 */),
                new Pin(11 /* MICROBIT_ID_IO_P4 */),
                new Pin(12 /* MICROBIT_ID_IO_P5 */),
                new Pin(13 /* MICROBIT_ID_IO_P6 */),
                new Pin(14 /* MICROBIT_ID_IO_P7 */),
                new Pin(15 /* MICROBIT_ID_IO_P8 */),
                new Pin(16 /* MICROBIT_ID_IO_P9 */),
                new Pin(17 /* MICROBIT_ID_IO_P10 */),
                new Pin(18 /* MICROBIT_ID_IO_P11 */),
                new Pin(19 /* MICROBIT_ID_IO_P12 */),
                new Pin(20 /* MICROBIT_ID_IO_P13 */),
                new Pin(21 /* MICROBIT_ID_IO_P14 */),
                new Pin(22 /* MICROBIT_ID_IO_P15 */),
                new Pin(23 /* MICROBIT_ID_IO_P16 */),
                null,
                null,
                new Pin(24 /* MICROBIT_ID_IO_P19 */),
                new Pin(25 /* MICROBIT_ID_IO_P20 */)
            ];
        }
        Board.prototype.initAsync = function (msg) {
            var options = (msg.options || {});
            var theme;
            switch (options.theme) {
                case 'blue':
                    theme = pxsim.micro_bit.themes[0];
                    break;
                case 'yellow':
                    theme = pxsim.micro_bit.themes[1];
                    break;
                case 'green':
                    theme = pxsim.micro_bit.themes[2];
                    break;
                case 'red':
                    theme = pxsim.micro_bit.themes[3];
                    break;
                default: theme = pxsim.micro_bit.randomTheme();
            }
            console.log('setting up microbit simulator');
            var view = new pxsim.micro_bit.MicrobitBoardSvg({
                theme: theme,
                runtime: pxsim.runtime
            });
            document.body.innerHTML = ''; // clear children
            document.body.appendChild(view.element);
            return Promise.resolve();
        };
        Board.prototype.receiveMessage = function (msg) {
            if (!pxsim.runtime || pxsim.runtime.dead)
                return;
            switch (msg.type || "") {
                case "eventbus":
                    var ev = msg;
                    this.bus.queue(ev.id, ev.eventid, ev.value);
                    break;
                case "serial":
                    this.serialIn.push(msg.data || "");
                    break;
                case "radiopacket":
                    var packet = msg;
                    this.radio.datagram.queue({ data: packet.data, rssi: packet.rssi || 0 });
                    break;
            }
        };
        Board.prototype.readSerial = function () {
            var v = this.serialIn.shift() || '';
            return v;
        };
        Board.prototype.writeSerial = function (s) {
            for (var i = 0; i < s.length; ++i) {
                var c = s[i];
                this.serialOutBuffer += c;
                if (c == '\n') {
                    pxsim.Runtime.postMessage({
                        type: 'serial',
                        data: this.serialOutBuffer,
                        id: pxsim.runtime.id
                    });
                    this.serialOutBuffer = '';
                    break;
                }
            }
        };
        return Board;
    }(pxsim.BaseBoard));
    pxsim.Board = Board;
    var Image = (function () {
        function Image(width, data) {
            this.width = width;
            this.data = data;
        }
        Image.prototype.get = function (x, y) {
            if (x < 0 || x >= this.width || y < 0 || y >= 5)
                return 0;
            return this.data[y * this.width + x];
        };
        Image.prototype.set = function (x, y, v) {
            if (x < 0 || x >= this.width || y < 0 || y >= 5)
                return;
            this.data[y * this.width + x] = Math.max(0, Math.min(255, v));
        };
        Image.prototype.copyTo = function (xSrcIndex, length, target, xTargetIndex) {
            for (var x = 0; x < length; x++) {
                for (var y = 0; y < 5; y++) {
                    var value = this.get(xSrcIndex + x, y);
                    target.set(xTargetIndex + x, y, value);
                }
            }
        };
        Image.prototype.shiftLeft = function (cols) {
            for (var x = 0; x < this.width; ++x)
                for (var y = 0; y < 5; ++y)
                    this.set(x, y, x < this.width - cols ? this.get(x + cols, y) : 0);
        };
        Image.prototype.shiftRight = function (cols) {
            for (var x = this.width - 1; x <= 0; --x)
                for (var y = 0; y < 5; ++y)
                    this.set(x, y, x > cols ? this.get(x - cols, y) : 0);
        };
        Image.prototype.clear = function () {
            for (var i = 0; i < this.data.length; ++i)
                this.data[i] = 0;
        };
        Image.height = 5;
        return Image;
    }());
    pxsim.Image = Image;
    function createImage(width) {
        return new Image(width, new Array(width * 5));
    }
    pxsim.createImage = createImage;
    function createImageFromBuffer(data) {
        return new Image(data.length / 5, data);
    }
    pxsim.createImageFromBuffer = createImageFromBuffer;
    function createImageFromString(text) {
        var font = pxsim.board().font;
        var w = font.width;
        var sprite = createImage(6 * text.length - 1);
        var k = 0;
        for (var i = 0; i < text.length; i++) {
            var charCode = text.charCodeAt(i);
            var charStart = (charCode - 32) * 5;
            if (charStart < 0 || charStart + 5 > w) {
                charCode = " ".charCodeAt(0);
                charStart = (charCode - 32) * 5;
            }
            font.copyTo(charStart, 5, sprite, k);
            k = k + 5;
            if (i < text.length - 1) {
                k = k + 1;
            }
        }
        return sprite;
    }
    pxsim.createImageFromString = createImageFromString;
    function createFont() {
        var data = [0x0, 0x0, 0x0, 0x0, 0x0, 0x8, 0x8, 0x8, 0x0, 0x8, 0xa, 0x4a, 0x40, 0x0, 0x0, 0xa, 0x5f, 0xea, 0x5f, 0xea, 0xe, 0xd9, 0x2e, 0xd3, 0x6e, 0x19, 0x32, 0x44, 0x89, 0x33, 0xc, 0x92, 0x4c, 0x92, 0x4d, 0x8, 0x8, 0x0, 0x0, 0x0, 0x4, 0x88, 0x8, 0x8, 0x4, 0x8, 0x4, 0x84, 0x84, 0x88, 0x0, 0xa, 0x44, 0x8a, 0x40, 0x0, 0x4, 0x8e, 0xc4, 0x80, 0x0, 0x0, 0x0, 0x4, 0x88, 0x0, 0x0, 0xe, 0xc0, 0x0, 0x0, 0x0, 0x0, 0x8, 0x0, 0x1, 0x22, 0x44, 0x88, 0x10, 0xc, 0x92, 0x52, 0x52, 0x4c, 0x4, 0x8c, 0x84, 0x84, 0x8e, 0x1c, 0x82, 0x4c, 0x90, 0x1e, 0x1e, 0xc2, 0x44, 0x92, 0x4c, 0x6, 0xca, 0x52, 0x5f, 0xe2, 0x1f, 0xf0, 0x1e, 0xc1, 0x3e, 0x2, 0x44, 0x8e, 0xd1, 0x2e, 0x1f, 0xe2, 0x44, 0x88, 0x10, 0xe, 0xd1, 0x2e, 0xd1, 0x2e, 0xe, 0xd1, 0x2e, 0xc4, 0x88, 0x0, 0x8, 0x0, 0x8, 0x0, 0x0, 0x4, 0x80, 0x4, 0x88, 0x2, 0x44, 0x88, 0x4, 0x82, 0x0, 0xe, 0xc0, 0xe, 0xc0, 0x8, 0x4, 0x82, 0x44, 0x88, 0xe, 0xd1, 0x26, 0xc0, 0x4, 0xe, 0xd1, 0x35, 0xb3, 0x6c, 0xc, 0x92, 0x5e, 0xd2, 0x52, 0x1c, 0x92, 0x5c, 0x92, 0x5c, 0xe, 0xd0, 0x10, 0x10, 0xe, 0x1c, 0x92, 0x52, 0x52, 0x5c, 0x1e, 0xd0, 0x1c, 0x90, 0x1e, 0x1e, 0xd0, 0x1c, 0x90, 0x10, 0xe, 0xd0, 0x13, 0x71, 0x2e, 0x12, 0x52, 0x5e, 0xd2, 0x52, 0x1c, 0x88, 0x8, 0x8, 0x1c, 0x1f, 0xe2, 0x42, 0x52, 0x4c, 0x12, 0x54, 0x98, 0x14, 0x92, 0x10, 0x10, 0x10, 0x10, 0x1e, 0x11, 0x3b, 0x75, 0xb1, 0x31, 0x11, 0x39, 0x35, 0xb3, 0x71, 0xc, 0x92, 0x52, 0x52, 0x4c, 0x1c, 0x92, 0x5c, 0x90, 0x10, 0xc, 0x92, 0x52, 0x4c, 0x86, 0x1c, 0x92, 0x5c, 0x92, 0x51, 0xe, 0xd0, 0xc, 0x82, 0x5c, 0x1f, 0xe4, 0x84, 0x84, 0x84, 0x12, 0x52, 0x52, 0x52, 0x4c, 0x11, 0x31, 0x31, 0x2a, 0x44, 0x11, 0x31, 0x35, 0xbb, 0x71, 0x12, 0x52, 0x4c, 0x92, 0x52, 0x11, 0x2a, 0x44, 0x84, 0x84, 0x1e, 0xc4, 0x88, 0x10, 0x1e, 0xe, 0xc8, 0x8, 0x8, 0xe, 0x10, 0x8, 0x4, 0x82, 0x41, 0xe, 0xc2, 0x42, 0x42, 0x4e, 0x4, 0x8a, 0x40, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x1f, 0x8, 0x4, 0x80, 0x0, 0x0, 0x0, 0xe, 0xd2, 0x52, 0x4f, 0x10, 0x10, 0x1c, 0x92, 0x5c, 0x0, 0xe, 0xd0, 0x10, 0xe, 0x2, 0x42, 0x4e, 0xd2, 0x4e, 0xc, 0x92, 0x5c, 0x90, 0xe, 0x6, 0xc8, 0x1c, 0x88, 0x8, 0xe, 0xd2, 0x4e, 0xc2, 0x4c, 0x10, 0x10, 0x1c, 0x92, 0x52, 0x8, 0x0, 0x8, 0x8, 0x8, 0x2, 0x40, 0x2, 0x42, 0x4c, 0x10, 0x14, 0x98, 0x14, 0x92, 0x8, 0x8, 0x8, 0x8, 0x6, 0x0, 0x1b, 0x75, 0xb1, 0x31, 0x0, 0x1c, 0x92, 0x52, 0x52, 0x0, 0xc, 0x92, 0x52, 0x4c, 0x0, 0x1c, 0x92, 0x5c, 0x90, 0x0, 0xe, 0xd2, 0x4e, 0xc2, 0x0, 0xe, 0xd0, 0x10, 0x10, 0x0, 0x6, 0xc8, 0x4, 0x98, 0x8, 0x8, 0xe, 0xc8, 0x7, 0x0, 0x12, 0x52, 0x52, 0x4f, 0x0, 0x11, 0x31, 0x2a, 0x44, 0x0, 0x11, 0x31, 0x35, 0xbb, 0x0, 0x12, 0x4c, 0x8c, 0x92, 0x0, 0x11, 0x2a, 0x44, 0x98, 0x0, 0x1e, 0xc4, 0x88, 0x1e, 0x6, 0xc4, 0x8c, 0x84, 0x86, 0x8, 0x8, 0x8, 0x8, 0x8, 0x18, 0x8, 0xc, 0x88, 0x18, 0x0, 0x0, 0xc, 0x83, 0x60];
        var nb = data.length;
        var n = nb / 5;
        var font = createImage(nb);
        for (var c = 0; c < n; c++) {
            for (var row = 0; row < 5; row++) {
                var char = data[c * 5 + row];
                for (var col = 0; col < 5; col++) {
                    if ((char & (1 << col)) != 0)
                        font.set((c * 5 + 4) - col, row, 255);
                }
            }
        }
        return font;
    }
    pxsim.createFont = createFont;
})(pxsim || (pxsim = {}));
//# sourceMappingURL=sim.js.map