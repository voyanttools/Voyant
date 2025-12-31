/**
 * @license Highcharts JS v11.4.8 (2024-08-29)
 *
 * (c) 2009-2024 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = (root && root.document) ?
            factory(root) :
            factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/polyfills', function () {
            return factory(root);
        });
    } else {
        if (root.Highcharts) {
            root.Highcharts.error(16, true);
        }
        root.Highcharts = factory(root);
    }
}(typeof window !== 'undefined' ? window : this, function (window) {
    'use strict';
    var _modules = {};
    function _registerModule(obj, path, args, fn) {
        if (!obj.hasOwnProperty(path)) {
            obj[path] = fn.apply(null, args);

            if (window && typeof CustomEvent === 'function') {
                window.dispatchEvent(new CustomEvent(
                    'HighchartsModuleLoaded',
                    { detail: { path: path, module: obj[path] } }
                ));
            }
        }
    }
    _registerModule(_modules, 'masters-es5/polyfills.js', [], function () {

        if (!Array.prototype.includes) {
            // eslint-disable-next-line no-extend-native
            Array.prototype.includes = function (searchElement, fromIndex) {
                return this.indexOf(searchElement, fromIndex) > -1;
            };
        }
        if (!Array.prototype.find) {
            // eslint-disable-next-line no-extend-native
            Array.prototype.find = function (predicate, thisArg) {
                for (var i = 0; i < this.length; i++) {
                    if (predicate.call(thisArg, this[i], i, this)) {
                        return this[i];
                    }
                }
            };
        }
        if (!Object.entries) {
            Object.entries = function (obj) {
                var keys = Object.keys(obj), iEnd = keys.length, entries = [];
                for (var i = 0; i < iEnd; ++i) {
                    entries.push([keys[i], obj[keys[i]]]);
                }
                return entries;
            };
        }
        if (!Object.values) {
            Object.values = function (obj) {
                var keys = Object.keys(obj), iEnd = keys.length, values = [];
                for (var i = 0; i < iEnd; ++i) {
                    values.push(obj[keys[i]]);
                }
                return values;
            };
        }
        (function () {
            if (typeof window.CustomEvent === "function")
                return false;
            function CustomEvent(type, params) {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
                return evt;
            }
            CustomEvent.prototype = window.Event.prototype;
            window.CustomEvent = CustomEvent;
        })();

    });
    _modules['masters-es5/polyfills.js']._modules = _modules;
    return _modules['masters-es5/polyfills.js'];
}));