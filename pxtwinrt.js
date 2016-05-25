/// <reference path="../typings/bluebird/bluebird.d.ts"/>
/// <reference path="../typings/winrt/winrt.d.ts"/>
/// <reference path="../built/pxtlib.d.ts"/>
var pxtwinrt;
(function (pxtwinrt) {
    function deployCoreAsync(res) {
        var drives = pxt.appTarget.compile.deployDrives;
        pxt.Util.assert(!!drives);
        console.log("deploying to drives " + drives);
        var drx = new RegExp(drives);
        var r = res.outfiles[ts.pxt.BINARY_HEX];
        function writeAsync(folder) {
            console.log("writing .hex to " + folder.displayName);
            return pxtwinrt.promisify(folder.createFileAsync("firmware.hex", Windows.Storage.CreationCollisionOption.replaceExisting)
                .then(function (file) { return Windows.Storage.FileIO.writeTextAsync(file, r); })).then(function (r) { }).catch(function (e) {
                console.log("failed to write to " + folder.displayName + " - " + e);
            });
        }
        return pxtwinrt.promisify(Windows.Storage.KnownFolders.removableDevices.getFoldersAsync())
            .then(function (ds) {
            var df = ds.filter(function (d) { return drx.test(d.displayName); });
            var pdf = df.map(writeAsync);
            var all = Promise.join.apply(Promise, pdf);
            return all;
        }).then(function (r) { });
    }
    pxtwinrt.deployCoreAsync = deployCoreAsync;
    function browserDownloadAsync(text, name, contentType) {
        var file;
        return pxtwinrt.promisify(Windows.Storage.ApplicationData.current.temporaryFolder.createFileAsync(name, Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (f) { return Windows.Storage.FileIO.writeTextAsync(file = f, text); })
            .then(function () { return Windows.System.Launcher.launchFileAsync(file); })
            .then(function (b) { }));
    }
    pxtwinrt.browserDownloadAsync = browserDownloadAsync;
})(pxtwinrt || (pxtwinrt = {}));
/// <reference path="../typings/winrt/winrt.d.ts"/>
var pxtwinrt;
(function (pxtwinrt) {
    var watcher;
    var ports = {};
    var options;
    function initSerial() {
        if (!pxt.appTarget.serial || !pxt.appTarget.serial.log)
            return;
        var filter = new RegExp(pxt.appTarget.serial.nameFilter) || { test: function (s) { return true; } };
        var serialDeviceSelector = Windows.Devices.SerialCommunication.SerialDevice.getDeviceSelector();
        // Create a device watcher to look for instances of the Serial device
        // The createWatcher() takes a string only when you provide it two arguments, so be sure to include an array as a second 
        // parameter (JavaScript can only recognize overloaded functions with different numbers of parameters).
        watcher = Windows.Devices.Enumeration.DeviceInformation.createWatcher(serialDeviceSelector, []);
        watcher.addEventListener("added", function (dis) {
            pxtwinrt.toArray(dis.detail).forEach(function (di) {
                if (!filter.test(di.name))
                    return;
                console.log("serial port added " + di.name + " - " + di.id);
                ports[di.id] = {
                    info: di
                };
                Windows.Devices.SerialCommunication.SerialDevice.fromIdAsync(di.id)
                    .done(function (dev) {
                    ports[di.id].device = dev;
                    startDevice(di.id);
                });
            });
        });
        watcher.addEventListener("removed", function (dis) {
            pxtwinrt.toArray(dis.detail).forEach(function (di) { return delete ports[di.id]; });
        });
        watcher.addEventListener("updated", function (dis) {
            pxtwinrt.toArray(dis.detail).forEach(function (di) { return ports[di.id] ? ports[di.id].info.update(di.info) : null; });
        });
        watcher.start();
    }
    pxtwinrt.initSerial = initSerial;
    function startDevice(id) {
        var port = ports[id];
        if (!port)
            return;
        if (!port.device) {
            var status_1 = Windows.Devices.Enumeration.DeviceAccessInformation.createFromId(id).currentStatus;
            console.log("device issue: " + status_1);
            return;
        }
        port.device.baudRate = 115200;
        var stream = port.device.inputStream;
        var reader = new Windows.Storage.Streams.DataReader(stream);
        var readMore = function () { return reader.loadAsync(32).done(function (bytesRead) {
            var msg = reader.readString(Math.floor(bytesRead / 4) * 4);
            window.postMessage({
                type: 'serial',
                data: msg,
                id: id
            }, "*");
            readMore();
        }, function (e) {
            setTimeout(function () { return startDevice(id); }, 1000);
        }); };
        readMore();
    }
})(pxtwinrt || (pxtwinrt = {}));
/// <reference path="../typings/bluebird/bluebird.d.ts"/>
var pxtwinrt;
(function (pxtwinrt) {
    function promisify(p) {
        return new Promise(function (resolve, reject) {
            p.done(function (v) { return resolve(v); }, function (e) { return reject(e); });
        });
    }
    pxtwinrt.promisify = promisify;
    function toArray(v) {
        var r = [];
        var length = v.length;
        for (var i = 0; i < length; ++i)
            r.push(v[i]);
        return r;
    }
    pxtwinrt.toArray = toArray;
    function isWinRT() {
        return typeof Windows !== "undefined";
    }
    pxtwinrt.isWinRT = isWinRT;
    function initAsync(onHexFileImported) {
        if (!isWinRT())
            return Promise.resolve();
        pxtwinrt.initSerial();
        if (onHexFileImported)
            initActivation(onHexFileImported);
        return Promise.resolve();
    }
    pxtwinrt.initAsync = initAsync;
    function initActivation(onHexFileImported) {
        // Subscribe to the Windows Activation Event
        Windows.UI.WebUI.WebUIApplication.addEventListener("activated", function (args) {
            var activation = Windows.ApplicationModel.Activation;
            if (args.kind === activation.ActivationKind.file) {
                var info = args;
                var file = info.files.getAt(0);
                if (file && file.isOfType(Windows.Storage.StorageItemTypes.file)) {
                    var f = file;
                    Windows.Storage.FileIO.readBufferAsync(f)
                        .done(function (buffer) {
                        var ar = new Uint8Array(buffer.length);
                        var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
                        dataReader.readBytes(ar);
                        dataReader.close();
                        pxt.cpp.unpackSourceFromHexAsync(ar)
                            .done(function (hex) { return onHexFileImported(hex); });
                    });
                }
            }
            ;
        });
    }
})(pxtwinrt || (pxtwinrt = {}));
//# sourceMappingURL=pxtwinrt.js.map