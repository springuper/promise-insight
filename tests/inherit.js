var InheritPromise = require('../inherit'),
    assert = require('assert');

describe('Inherit Promise', function () {
    describe('fulfill', function () {
        it('should fulfill with a value', function (done) {
            var fulfilledValue = null,
                fulfilledChainValue = null,
                fulfilledPromise = InheritPromise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve('value');
                    }, 100);
                });

            fulfilledPromise.then(function (value) {
                fulfilledValue = value;
                return InheritPromise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve('inherit ' + value);
                    }, 100);
                });
            }, function () {
                fulfilledValue = null;
            }).then(function (value) {
                fulfilledChainValue = value;
            }, function () {
                fulfilledChainValue = null;
            });

            setTimeout(function () {
                assert(fulfilledValue === 'value' && fulfilledChainValue === 'inherit value', 'fulfilled promise failed');
                done();
            }, 300);
        });
    });

    describe('reject', function () {
        it('should reject with a reason', function (done) {
            var rejectedValue = null,
                rejectedChainValue = null,
                rejectedPromise = InheritPromise(function (resolve, reject) {
                    setTimeout(function () {
                        reject('reason');
                    }, 100);
                });

            rejectedPromise.then(function (value) {
                rejectedValue = null;
            }, function (reason) {
                rejectedValue = reason;
                return InheritPromise(function (resolve, reject) {
                    setTimeout(function () {
                        reject('inherit ' + reason);
                    }, 100);
                });
            }).then(function (value) {
                rejectedChainValue = null;
            }, function (reason) {
                rejectedChainValue = reason;
            });

            setTimeout(function () {
                assert(rejectedValue === 'reason' && rejectedChainValue === 'inherit reason', 'rejected promise failed');
                done();
            }, 300);
        });
    });
});

