/**
 * @license Highstock JS v11.4.8 (2024-08-29)
 *
 * Indicator series type for Highcharts Stock
 *
 * (c) 2010-2024 Wojciech Chmiel
 *
 * License: www.highcharts.com/license
 */
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/indicators/dpo', ['highcharts', 'highcharts/modules/stock'], function (Highcharts) {
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
    _registerModule(_modules, 'Stock/Indicators/DPO/DPOIndicator.js', [_modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (SeriesRegistry, U) {
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
        var SMAIndicator = SeriesRegistry.seriesTypes.sma;
        var extend = U.extend, merge = U.merge, correctFloat = U.correctFloat, pick = U.pick;
        /* *
         *
         *  Functions
         *
         * */
        // Utils:
        /**
         * @private
         */
        function accumulatePoints(sum, yVal, i, index, subtract) {
            var price = pick(yVal[i][index], yVal[i]);
            if (subtract) {
                return correctFloat(sum - price);
            }
            return correctFloat(sum + price);
        }
        /* *
         *
         *  Class
         *
         * */
        /**
         * The DPO series type.
         *
         * @private
         * @class
         * @name Highcharts.seriesTypes.dpo
         *
         * @augments Highcharts.Series
         */
        var DPOIndicator = /** @class */ (function (_super) {
            __extends(DPOIndicator, _super);
            function DPOIndicator() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* *
             *
             *  Functions
             *
             * */
            DPOIndicator.prototype.getValues = function (series, params) {
                var period = params.period, index = params.index, offset = Math.floor(period / 2 + 1), range = period + offset, xVal = series.xData || [], yVal = series.yData || [], yValLen = yVal.length, 
                // 0- date, 1- Detrended Price Oscillator
                DPO = [], xData = [], yData = [];
                var oscillator, periodIndex, rangeIndex, price, i, j, sum = 0;
                if (xVal.length <= range) {
                    return;
                }
                // Accumulate first N-points for SMA
                for (i = 0; i < period - 1; i++) {
                    sum = accumulatePoints(sum, yVal, i, index);
                }
                // Detrended Price Oscillator formula:
                // DPO = Price - Simple moving average [from (n / 2 + 1) days ago]
                for (j = 0; j <= yValLen - range; j++) {
                    periodIndex = j + period - 1;
                    rangeIndex = j + range - 1;
                    // Adding the last period point
                    sum = accumulatePoints(sum, yVal, periodIndex, index);
                    price = pick(yVal[rangeIndex][index], yVal[rangeIndex]);
                    oscillator = price - sum / period;
                    // Subtracting the first period point
                    sum = accumulatePoints(sum, yVal, j, index, true);
                    DPO.push([xVal[rangeIndex], oscillator]);
                    xData.push(xVal[rangeIndex]);
                    yData.push(oscillator);
                }
                return {
                    values: DPO,
                    xData: xData,
                    yData: yData
                };
            };
            /* *
             *
             *  Static Properties
             *
             * */
            /**
             * Detrended Price Oscillator. This series requires the `linkedTo` option to
             * be set and should be loaded after the `stock/indicators/indicators.js`.
             *
             * @sample {highstock} stock/indicators/dpo
             *         Detrended Price Oscillator
             *
             * @extends      plotOptions.sma
             * @since        7.0.0
             * @product      highstock
             * @excluding    allAreas, colorAxis, compare, compareBase, joinBy, keys,
             *               navigatorOptions, pointInterval, pointIntervalUnit,
             *               pointPlacement, pointRange, pointStart, showInNavigator,
             *               stacking
             * @requires     stock/indicators/indicators
             * @requires     stock/indicators/dpo
             * @optionparent plotOptions.dpo
             */
            DPOIndicator.defaultOptions = merge(SMAIndicator.defaultOptions, {
                /**
                 * Parameters used in calculation of Detrended Price Oscillator series
                 * points.
                 */
                params: {
                    index: 0,
                    /**
                     * Period for Detrended Price Oscillator
                     */
                    period: 21
                }
            });
            return DPOIndicator;
        }(SMAIndicator));
        extend(DPOIndicator.prototype, {
            nameBase: 'DPO'
        });
        SeriesRegistry.registerSeriesType('dpo', DPOIndicator);
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
         * A Detrended Price Oscillator. If the [type](#series.dpo.type) option is not
         * specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.dpo
         * @since     7.0.0
         * @product   highstock
         * @excluding allAreas, colorAxis, compare, compareBase, dataParser, dataURL,
         *            joinBy, keys, navigatorOptions, pointInterval, pointIntervalUnit,
         *            pointPlacement, pointRange, pointStart, showInNavigator, stacking
         * @requires  stock/indicators/indicators
         * @requires  stock/indicators/dpo
         * @apioption series.dpo
         */
        ''; // To include the above in the js output'

        return DPOIndicator;
    });
    _registerModule(_modules, 'masters/indicators/dpo.src.js', [_modules['Core/Globals.js']], function (Highcharts) {


        return Highcharts;
    });
}));
