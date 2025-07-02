/**
 * @license Highstock JS v11.4.8 (2024-08-29)
 *
 * Indicator series type for Highcharts Stock
 *
 * (c) 2010-2024 Paweł Dalek
 *
 * License: www.highcharts.com/license
 */
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/indicators/natr', ['highcharts', 'highcharts/modules/stock'], function (Highcharts) {
            factory(Highcharts);
            factory.Highcharts = Highcharts;
            return factory;
        });
    } else {
        factory(typeof Highcharts !== 'undefined' ? Highcharts : undefined);
    }
}(function (Highcharts) {
    'use strict';
    var _modules = Highcharts ? Highcharts._modules : {};
    function _registerModule(obj, path, args, fn) {
        if (!obj.hasOwnProperty(path)) {
            obj[path] = fn.apply(null, args);

            if (typeof CustomEvent === 'function') {
                Highcharts.win.dispatchEvent(new CustomEvent(
                    'HighchartsModuleLoaded',
                    { detail: { path: path, module: obj[path] } }
                ));
            }
        }
    }
    _registerModule(_modules, 'Stock/Indicators/NATR/NATRIndicator.js', [_modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (SeriesRegistry, U) {
        /* *
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var __extends = (this && this.__extends) || (function () {
            var extendStatics = function (d, b) {
                extendStatics = Object.setPrototypeOf ||
                    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                    function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
                return extendStatics(d, b);
            };
            return function (d, b) {
                if (typeof b !== "function" && b !== null)
                    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
                extendStatics(d, b);
                function __() { this.constructor = d; }
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();
        var ATRIndicator = SeriesRegistry.seriesTypes.atr;
        var merge = U.merge;
        /* *
         *
         *  Class
         *
         * */
        /**
         * The NATR series type.
         *
         * @private
         * @class
         * @name Highcharts.seriesTypes.natr
         *
         * @augments Highcharts.Series
         */
        var NATRIndicator = /** @class */ (function (_super) {
            __extends(NATRIndicator, _super);
            function NATRIndicator() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* *
             *
             *  Functions
             *
             * */
            NATRIndicator.prototype.getValues = function (series, params) {
                var atrData = (_super.prototype.getValues.apply(this, arguments)), atrLength = atrData.values.length, yVal = series.yData;
                var i = 0, period = params.period - 1;
                if (!atrData) {
                    return;
                }
                for (; i < atrLength; i++) {
                    atrData.yData[i] = (atrData.values[i][1] / yVal[period][3] * 100);
                    atrData.values[i][1] = atrData.yData[i];
                    period++;
                }
                return atrData;
            };
            /* *
             *
             *  Static Properties
             *
             * */
            /**
             * Normalized average true range indicator (NATR). This series requires
             * `linkedTo` option to be set and should be loaded after the
             * `stock/indicators/indicators.js` and `stock/indicators/atr.js`.
             *
             * @sample {highstock} stock/indicators/natr
             *         NATR indicator
             *
             * @extends      plotOptions.atr
             * @since        7.0.0
             * @product      highstock
             * @requires     stock/indicators/indicators
             * @requires     stock/indicators/natr
             * @optionparent plotOptions.natr
             */
            NATRIndicator.defaultOptions = merge(ATRIndicator.defaultOptions, {
                tooltip: {
                    valueSuffix: '%'
                }
            });
            return NATRIndicator;
        }(ATRIndicator));
        SeriesRegistry.registerSeriesType('natr', NATRIndicator);
        /* *
         *
         *  Default Export
         *
         * */
        /* *
         *
         *  API Options
         *
         * */
        /**
         * A `NATR` series. If the [type](#series.natr.type) option is not specified, it
         * is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.natr
         * @since     7.0.0
         * @product   highstock
         * @excluding dataParser, dataURL
         * @requires  stock/indicators/indicators
         * @requires  stock/indicators/atr
         * @requires  stock/indicators/natr
         * @apioption series.natr
         */
        ''; // To include the above in the js output'

        return NATRIndicator;
    });
    _registerModule(_modules, 'masters/indicators/natr.src.js', [_modules['Core/Globals.js']], function (Highcharts) {


        return Highcharts;
    });
}));
