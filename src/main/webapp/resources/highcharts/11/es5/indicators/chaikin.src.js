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
        define('highcharts/indicators/chaikin', ['highcharts', 'highcharts/modules/stock'], function (Highcharts) {
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
    _registerModule(_modules, 'Stock/Indicators/AD/ADIndicator.js', [_modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (SeriesRegistry, U) {
        /* *
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
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
        var error = U.error, extend = U.extend, merge = U.merge;
        /* *
         *
         *  Class
         *
         * */
        /**
         * The AD series type.
         *
         * @private
         * @class
         * @name Highcharts.seriesTypes.ad
         *
         * @augments Highcharts.Series
         */
        var ADIndicator = /** @class */ (function (_super) {
            __extends(ADIndicator, _super);
            function ADIndicator() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* *
             *
             *  Static Functions
             *
             * */
            ADIndicator.populateAverage = function (xVal, yVal, yValVolume, i, 
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _period) {
                var high = yVal[i][1], low = yVal[i][2], close = yVal[i][3], volume = yValVolume[i], adY = close === high && close === low || high === low ?
                    0 :
                    ((2 * close - low - high) / (high - low)) * volume, adX = xVal[i];
                return [adX, adY];
            };
            /* *
             *
             *  Functions
             *
             * */
            ADIndicator.prototype.getValues = function (series, params) {
                var period = params.period, xVal = series.xData, yVal = series.yData, volumeSeriesID = params.volumeSeriesID, volumeSeries = series.chart.get(volumeSeriesID), yValVolume = volumeSeries && volumeSeries.yData, yValLen = yVal ? yVal.length : 0, AD = [], xData = [], yData = [];
                var len, i, ADPoint;
                if (xVal.length <= period &&
                    yValLen &&
                    yVal[0].length !== 4) {
                    return;
                }
                if (!volumeSeries) {
                    error('Series ' +
                        volumeSeriesID +
                        ' not found! Check `volumeSeriesID`.', true, series.chart);
                    return;
                }
                // When i = period <-- skip first N-points
                // Calculate value one-by-one for each period in visible data
                for (i = period; i < yValLen; i++) {
                    len = AD.length;
                    ADPoint = ADIndicator.populateAverage(xVal, yVal, yValVolume, i, period);
                    if (len > 0) {
                        ADPoint[1] += AD[len - 1][1];
                    }
                    AD.push(ADPoint);
                    xData.push(ADPoint[0]);
                    yData.push(ADPoint[1]);
                }
                return {
                    values: AD,
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
             * Accumulation Distribution (AD). This series requires `linkedTo` option to
             * be set.
             *
             * @sample stock/indicators/accumulation-distribution
             *         Accumulation/Distribution indicator
             *
             * @extends      plotOptions.sma
             * @since        6.0.0
             * @product      highstock
             * @requires     stock/indicators/indicators
             * @requires     stock/indicators/accumulation-distribution
             * @optionparent plotOptions.ad
             */
            ADIndicator.defaultOptions = merge(SMAIndicator.defaultOptions, {
                /**
                 * @excluding index
                 */
                params: {
                    index: void 0, // Unused index, do not inherit (#15362)
                    /**
                     * The id of volume series which is mandatory.
                     * For example using OHLC data, volumeSeriesID='volume' means
                     * the indicator will be calculated using OHLC and volume values.
                     *
                     * @since 6.0.0
                     */
                    volumeSeriesID: 'volume'
                }
            });
            return ADIndicator;
        }(SMAIndicator));
        extend(ADIndicator.prototype, {
            nameComponents: false,
            nameBase: 'Accumulation/Distribution'
        });
        SeriesRegistry.registerSeriesType('ad', ADIndicator);
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
         * A `AD` series. If the [type](#series.ad.type) option is not
         * specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.ad
         * @since     6.0.0
         * @excluding dataParser, dataURL
         * @product   highstock
         * @requires  stock/indicators/indicators
         * @requires  stock/indicators/accumulation-distribution
         * @apioption series.ad
         */
        ''; // Add doclet above to transpiled file

        return ADIndicator;
    });
    _registerModule(_modules, 'Stock/Indicators/Chaikin/ChaikinIndicator.js', [_modules['Stock/Indicators/AD/ADIndicator.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (AD, SeriesRegistry, U) {
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
        var EMAIndicator = SeriesRegistry.seriesTypes.ema;
        var correctFloat = U.correctFloat, extend = U.extend, merge = U.merge, error = U.error;
        /* *
         *
         *  Class
         *
         * */
        /**
         * The Chaikin series type.
         *
         * @private
         * @class
         * @name Highcharts.seriesTypes.chaikin
         *
         * @augments Highcharts.Series
         */
        var ChaikinIndicator = /** @class */ (function (_super) {
            __extends(ChaikinIndicator, _super);
            function ChaikinIndicator() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* *
             *
             *  Functions
             *
             * */
            ChaikinIndicator.prototype.getValues = function (series, params) {
                var periods = params.periods, period = params.period, 
                // 0- date, 1- Chaikin Oscillator
                CHA = [], xData = [], yData = [];
                var oscillator, i;
                // Check if periods are correct
                if (periods.length !== 2 || periods[1] <= periods[0]) {
                    error('Error: "Chaikin requires two periods. Notice, first ' +
                        'period should be lower than the second one."');
                    return;
                }
                // Accumulation Distribution Line data
                var ADL = AD.prototype.getValues.call(this, series, {
                    volumeSeriesID: params.volumeSeriesID,
                    period: period
                });
                // Check if adl is calculated properly, if not skip
                if (!ADL) {
                    return;
                }
                // Shorter Period EMA
                var SPE = _super.prototype.getValues.call(this, ADL, {
                    period: periods[0]
                });
                // Longer Period EMA
                var LPE = _super.prototype.getValues.call(this, ADL, {
                    period: periods[1]
                });
                // Check if ema is calculated properly, if not skip
                if (!SPE || !LPE) {
                    return;
                }
                var periodsOffset = periods[1] - periods[0];
                for (i = 0; i < LPE.yData.length; i++) {
                    oscillator = correctFloat(SPE.yData[i + periodsOffset] -
                        LPE.yData[i]);
                    CHA.push([LPE.xData[i], oscillator]);
                    xData.push(LPE.xData[i]);
                    yData.push(oscillator);
                }
                return {
                    values: CHA,
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
             * Chaikin Oscillator. This series requires the `linkedTo` option to
             * be set and should be loaded after the `stock/indicators/indicators.js`.
             *
             * @sample {highstock} stock/indicators/chaikin
             *         Chaikin Oscillator
             *
             * @extends      plotOptions.ema
             * @since        7.0.0
             * @product      highstock
             * @excluding    allAreas, colorAxis, joinBy, keys, navigatorOptions,
             *               pointInterval, pointIntervalUnit, pointPlacement,
             *               pointRange, pointStart, showInNavigator, stacking
             * @requires     stock/indicators/indicators
             * @requires     stock/indicators/chaikin
             * @optionparent plotOptions.chaikin
             */
            ChaikinIndicator.defaultOptions = merge(EMAIndicator.defaultOptions, {
                /**
                 * Parameters used in calculation of Chaikin Oscillator
                 * series points.
                 *
                 * @excluding index
                 */
                params: {
                    index: void 0, // Unused index, do not inherit (#15362)
                    /**
                     * The id of volume series which is mandatory.
                     * For example using OHLC data, volumeSeriesID='volume' means
                     * the indicator will be calculated using OHLC and volume values.
                     */
                    volumeSeriesID: 'volume',
                    /**
                     * Parameter used indirectly for calculating the `AD` indicator.
                     * Decides about the number of data points that are taken
                     * into account for the indicator calculations.
                     */
                    period: 9,
                    /**
                     * Periods for Chaikin Oscillator calculations.
                     *
                     * @type    {Array<number>}
                     * @default [3, 10]
                     */
                    periods: [3, 10]
                }
            });
            return ChaikinIndicator;
        }(EMAIndicator));
        extend(ChaikinIndicator.prototype, {
            nameBase: 'Chaikin Osc',
            nameComponents: ['periods']
        });
        SeriesRegistry.registerSeriesType('chaikin', ChaikinIndicator);
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
         * A `Chaikin Oscillator` series. If the [type](#series.chaikin.type)
         * option is not specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.chaikin
         * @since     7.0.0
         * @product   highstock
         * @excluding allAreas, colorAxis, dataParser, dataURL, joinBy, keys,
         *            navigatorOptions, pointInterval, pointIntervalUnit,
         *            pointPlacement, pointRange, pointStart, stacking, showInNavigator
         * @requires  stock/indicators/indicators
         * @requires  stock/indicators/chaikin
         * @apioption series.chaikin
         */
        ''; // To include the above in the js output

        return ChaikinIndicator;
    });
    _registerModule(_modules, 'masters/indicators/chaikin.src.js', [_modules['Core/Globals.js']], function (Highcharts) {


        return Highcharts;
    });
}));
