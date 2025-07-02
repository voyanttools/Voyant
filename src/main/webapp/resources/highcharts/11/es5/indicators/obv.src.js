/**
 * @license Highstock JS v11.4.8 (2024-08-29)
 *
 * Indicator series type for Highcharts Stock
 *
 * (c) 2010-2024 Karol Kolodziej
 *
 * License: www.highcharts.com/license
 */
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/indicators/obv', ['highcharts', 'highcharts/modules/stock'], function (Highcharts) {
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
    _registerModule(_modules, 'Stock/Indicators/OBV/OBVIndicator.js', [_modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (SeriesRegistry, U) {
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
        var isNumber = U.isNumber, error = U.error, extend = U.extend, merge = U.merge;
        /* *
         *
         *  Class
         *
         * */
        /**
         * The OBV series type.
         *
         * @private
         * @class
         * @name Highcharts.seriesTypes.obv
         *
         * @augments Highcharts.Series
         */
        var OBVIndicator = /** @class */ (function (_super) {
            __extends(OBVIndicator, _super);
            function OBVIndicator() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* *
             *
             *  Functions
             *
             * */
            OBVIndicator.prototype.getValues = function (series, params) {
                var volumeSeries = series.chart.get(params.volumeSeriesID), xVal = series.xData, yVal = series.yData, OBV = [], xData = [], yData = [], hasOHLC = !isNumber(yVal[0]);
                var OBVPoint = [], i = 1, previousOBV = 0, curentOBV = 0, previousClose = 0, curentClose = 0, volume;
                // Checks if volume series exists.
                if (volumeSeries) {
                    volume = volumeSeries.yData;
                    // Add first point and get close value.
                    OBVPoint = [xVal[0], previousOBV];
                    previousClose = hasOHLC ?
                        yVal[0][3] : yVal[0];
                    OBV.push(OBVPoint);
                    xData.push(xVal[0]);
                    yData.push(OBVPoint[1]);
                    for (i; i < yVal.length; i++) {
                        curentClose = hasOHLC ?
                            yVal[i][3] : yVal[i];
                        if (curentClose > previousClose) { // Up
                            curentOBV = previousOBV + volume[i];
                        }
                        else if (curentClose === previousClose) { // Constant
                            curentOBV = previousOBV;
                        }
                        else { // Down
                            curentOBV = previousOBV - volume[i];
                        }
                        // Add point.
                        OBVPoint = [xVal[i], curentOBV];
                        // Assign current as previous for next iteration.
                        previousOBV = curentOBV;
                        previousClose = curentClose;
                        OBV.push(OBVPoint);
                        xData.push(xVal[i]);
                        yData.push(OBVPoint[1]);
                    }
                }
                else {
                    error('Series ' +
                        params.volumeSeriesID +
                        ' not found! Check `volumeSeriesID`.', true, series.chart);
                    return;
                }
                return {
                    values: OBV,
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
             * On-Balance Volume (OBV) technical indicator. This series
             * requires the `linkedTo` option to be set and should be loaded after
             * the `stock/indicators/indicators.js` file. Through the `volumeSeriesID`
             * there also should be linked the volume series.
             *
             * @sample stock/indicators/obv
             *         OBV indicator
             *
             * @extends      plotOptions.sma
             * @since 9.1.0
             * @product      highstock
             * @requires     stock/indicators/indicators
             * @requires     stock/indicators/obv
             * @excluding    allAreas, colorAxis, joinBy, keys, navigatorOptions,
             *               pointInterval, pointIntervalUnit, pointPlacement,
             *               pointRange, pointStart, showInNavigator, stacking
             * @optionparent plotOptions.obv
             */
            OBVIndicator.defaultOptions = merge(SMAIndicator.defaultOptions, {
                marker: {
                    enabled: false
                },
                /**
                 * @excluding index, period
                 */
                params: {
                    // Index and period are unchangeable, do not inherit (#15362)
                    index: void 0,
                    period: void 0,
                    /**
                     * The id of another series to use its data as volume data for the
                     * indicator calculation.
                     */
                    volumeSeriesID: 'volume'
                },
                tooltip: {
                    valueDecimals: 0
                }
            });
            return OBVIndicator;
        }(SMAIndicator));
        extend(OBVIndicator.prototype, {
            nameComponents: void 0
        });
        SeriesRegistry.registerSeriesType('obv', OBVIndicator);
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
         * A `OBV` series. If the [type](#series.obv.type) option is not
         * specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.obv
         * @since 9.1.0
         * @product   highstock
         * @excluding dataParser, dataURL
         * @requires  stock/indicators/indicators
         * @requires  stock/indicators/obv
         * @apioption series.obv
         */
        ''; // To include the above in the js output

        return OBVIndicator;
    });
    _registerModule(_modules, 'masters/indicators/obv.src.js', [_modules['Core/Globals.js']], function (Highcharts) {


        return Highcharts;
    });
}));
