var asap = require('asap');

function Promise(fn) {
    if (!(this instanceof Promise)) return new Promise(fn);
    if (typeof fn !== 'function') throw new TypeError('not a function');

    var state = null,
        value = null,
        deferreds = [],
        self = this;
        
    self.then = function (onFulfilled, onRejected) {
        return new Promise(function(resolve, reject) {
            handle({
                onFulfilled: onFulfilled || null,
                onRejected: onRejected || null,
                resolve: resolve,
                reject: reject
            });
        })
    };

    function resolve(newValue) {
        if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
            var then = newValue.then;
            if (typeof then === 'function') {
                doResolve(then.bind(newValue), resolve, reject);
                return;
            }
        }
        state = true;
        value = newValue;
        final();
    }

    function reject(reason) {
        state = false;
        value = reason;
        final();
    }

    function final() {
        var i, len;
        for (i = 0, len = deferreds.length; i < len; ++i) {
            handle(deferreds[i]);
        }
        deferreds = null;
    }

    function handle(deferred) {
        if (state === null) {
            deferreds.push(deferred);
            return;
        }

        asap(function () {
            var cb = state ? deferred.onFulfilled : deferred.onRejected,
                ret;
            if (cb === null) {
                cb = state ? deferred.resolve : deferred.reject;
                cb(value);
                return;
            }
            ret = cb(value);
            deferred.resolve(ret);
        });
    }

    doResolve(fn, resolve, reject);
}

function doResolve(fn, resolve, reject) {
    var done = false;
    fn(function (value) {
        if (done) return;
        done = true;
        resolve(value);
    }, function (reason) {
        if (done) return;
        done = true;
        reject(reason);
    });
}

module.exports = Promise;
