var pxt;
(function (pxt) {
    var storage;
    (function (storage) {
        function storageId() {
            var id = pxt.appTarget ? pxt.appTarget.id : window.pxtConfig ? window.pxtConfig.targetId : '';
            return id;
        }
        storage.storageId = storageId;
        function targetKey(key) {
            return storageId() + '/' + key;
        }
        function setLocal(key, value) {
            window.localStorage[targetKey(key)] = value;
        }
        storage.setLocal = setLocal;
        function getLocal(key) {
            return window.localStorage[targetKey(key)];
        }
        storage.getLocal = getLocal;
        function removeLocal(key) {
            window.localStorage.removeItem(targetKey(key));
        }
        storage.removeLocal = removeLocal;
        function clearLocal() {
            var prefix = targetKey('');
            var keys = [];
            for (var i = 0; i < window.localStorage.length; ++i) {
                var key = window.localStorage.key(i);
                if (key.indexOf(prefix) == 0)
                    keys.push(key);
            }
            keys.forEach(function (key) { return window.localStorage.removeItem(key); });
        }
        storage.clearLocal = clearLocal;
    })(storage = pxt.storage || (pxt.storage = {}));
})(pxt || (pxt = {}));
/// <reference path="../typings/bluebird/bluebird.d.ts"/>
/// <reference path="../built/pxtlib.d.ts"/>
//# sourceMappingURL=pxteditor.js.map