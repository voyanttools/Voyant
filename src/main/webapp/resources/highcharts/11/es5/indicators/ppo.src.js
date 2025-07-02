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
        define('highcharts/indicators/ppo', ['highcharts', 'highcharts/modules/stock'], function (Highcharts) {
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
    _registerModule(_modules, 'Stock/Indicators/PPO/PPOIndicator.js', [_modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (SeriesRegistry, U) {
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
         * The PPO series type.
         *
         * @private
         * @class
         * @name Highcharts.seriesTypes.ppo
         *
         * @augments Highcharts.Series
         */
        var PPOIndicator = /** @class */ (function (_super) {
            __extends(PPOIndicator, _super);
            function PPOIndicator() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* *
             *
             *  Functions
             *
             * */
            PPOIndicator.prototype.getValues = function (series, params) {
                var periods = params.periods, index = params.index, 
                // 0- date, 1- Percentage Price Oscillator
                PPO = [], xData = [], yData = [];
                var oscillator, i;
                // Check if periods are correct
                if (periods.length !== 2 || periods[1] <= periods[0]) {
                    error('Error: "PPO requires two periods. Notice, first period ' +
                        'should be lower than the second one."');
                    return;
                }
                // Shorter Period EMA
                var SPE = _super.prototype.getValues.call(this, series, {
                    index: index,
                    period: periods[0]
                });
                // Longer Period EMA
                var LPE = _super.prototype.getValues.call(this, series, {
                    index: index,
                    period: periods[1]
                });
                // Check if ema is calculated properly, if not skip
                if (!SPE || !LPE) {
                    return;
                }
                var periodsOffset = periods[1] - periods[0];
                for (i = 0; i < LPE.yData.length; i++) {
                    oscillator = correctFloat((SPE.yData[i + periodsOffset] -
                        LPE.yData[i]) /
                        LPE.yData[i] *
                        100);
                    PPO.push([LPE.xData[i], oscillator]);
                    xData.push(LPE.xData[i]);
                    yData.push(oscillator);
                }
                return {
                    values: PPO,
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
             * Percentage Price Oscillator. This series requires the
             * `linkedTo` option to be set and should be loaded after the
             * `stock/indicators/indicators.js`.
             *
             * @sample {highstock} stock/indicators/ppo
             *         Percentage Price Oscillator
             *
             * @extends      plotOptions.ema
             * @since        7.0.0
             * @product      highstock
             * @excluding    allAreas, colorAxis, joinBy, keys, navigatorOptions,
             *               pointInterval, pointIntervalUnit, pointPlacement,
             *               pointRange, pointStart, showInNavigator, stacking
             * @requires     stock/indicators/indicators
             * @requires     stock/indicators/ppo
             * @optionparent plotOptions.ppo
             */
            PPOIndicator.defaultOptions = merge(EMAIndicator.defaultOptions, {
                /**
                 * Parameters used in calculation of Percentage Price Oscillator series
                 * points.
                 *
                 * @excluding period
                 */
                params: {
                    period: void 0, // Unchangeable period, do not inherit (#15362)
                    /**
                     * Periods for Percentage Price Oscillator calculations.
                     *
                     * @type    {Array<number>}
                     * @default [12, 26]
                     */
                    periods: [12, 26]
                }
            });
            return PPOIndicator;
        }(EMAIndicator));
        extend(PPOIndicator.prototype, {
            nameBase: 'PPO',
            nameComponents: ['periods']
        });
        SeriesRegistry.registerSeriesType('ppo', PPOIndicator);
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
         * A `Percentage Price Oscillator` series. If the [type](#series.ppo.type)
         * option is not specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.ppo
         * @since     7.0.0
         * @product   highstock
         * @excluding allAreas, colorAxis, dataParser, dataURL, joinBy, keys,
         *            navigatorOptions, pointInterval, pointIntervalUnit,
         *            pointPlacement, pointRange, pointStart, showInNavigator, stacking
         * @requires  stock/indicators/indicators
         * @requires  stock/indicators/ppo
         * @apioption series.ppo
         */
        ''; // To include the above in the js output

        return PPOIndicator;
    });
    _registerModule(_modules, 'masters/indicators/ppo.src.js', [_modules['Core/Globals.js']], function (Highcharts) {


        return Highcharts;
    });
}));
