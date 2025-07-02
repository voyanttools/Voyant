/**
 * @license Highcharts JS v11.4.8 (2024-08-29)
 *
 * (c) 2010-2024 Highsoft AS
 * Author: Sebastian Domas
 *
 * License: www.highcharts.com/license
 */
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/modules/histogram-bellcurve', ['highcharts'], function (Highcharts) {
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
    _registerModule(_modules, 'Series/DerivedComposition.js', [_modules['Core/Globals.js'], _modules['Core/Series/Series.js'], _modules['Core/Utilities.js']], function (H, Series, U) {
        /* *
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var noop = H.noop;
        var addEvent = U.addEvent, defined = U.defined;
        /* *
         *
         *  Composition
         *
         * */
        /**
         * Provides methods for auto setting/updating series data based on the based
         * series data.
         * @private
         */
        var DerivedComposition;
        (function (DerivedComposition) {
            /* *
             *
             *  Declarations
             *
             * */
            /* *
             *
             *  Constants
             *
             * */
            DerivedComposition.hasDerivedData = true;
            /**
             * Method to be implemented - inside the method the series has already
             * access to the base series via m `this.baseSeries` and the bases data is
             * initialised. It should return data in the format accepted by
             * `Series.setData()` method
             * @private
             */
            DerivedComposition.setDerivedData = noop;
            /* *
             *
             *  Functions
             *
             * */
            /* eslint-disable valid-jsdoc */
            /**
             * @private
             */
            function compose(SeriesClass) {
                var seriesProto = SeriesClass.prototype;
                seriesProto.addBaseSeriesEvents = addBaseSeriesEvents;
                seriesProto.addEvents = addEvents;
                seriesProto.destroy = destroy;
                seriesProto.init = init;
                seriesProto.setBaseSeries = setBaseSeries;
                return SeriesClass;
            }
            DerivedComposition.compose = compose;
            /**
             * Initialise series
             * @private
             */
            function init() {
                Series.prototype.init.apply(this, arguments);
                this.initialised = false;
                this.baseSeries = null;
                this.eventRemovers = [];
                this.addEvents();
            }
            DerivedComposition.init = init;
            /**
             * Sets base series for the series
             * @private
             */
            function setBaseSeries() {
                var chart = this.chart, baseSeriesOptions = this.options.baseSeries, baseSeries = (defined(baseSeriesOptions) &&
                    (chart.series[baseSeriesOptions] ||
                        chart.get(baseSeriesOptions)));
                this.baseSeries = baseSeries || null;
            }
            DerivedComposition.setBaseSeries = setBaseSeries;
            /**
             * Adds events for the series
             * @private
             */
            function addEvents() {
                var _this = this;
                this.eventRemovers.push(addEvent(this.chart, 'afterLinkSeries', function () {
                    _this.setBaseSeries();
                    if (_this.baseSeries && !_this.initialised) {
                        _this.setDerivedData();
                        _this.addBaseSeriesEvents();
                        _this.initialised = true;
                    }
                }));
            }
            DerivedComposition.addEvents = addEvents;
            /**
             * Adds events to the base series - it required for recalculating the data
             * in the series if the base series is updated / removed / etc.
             * @private
             */
            function addBaseSeriesEvents() {
                var _this = this;
                this.eventRemovers.push(addEvent(this.baseSeries, 'updatedData', function () {
                    _this.setDerivedData();
                }), addEvent(this.baseSeries, 'destroy', function () {
                    _this.baseSeries = null;
                    _this.initialised = false;
                }));
            }
            DerivedComposition.addBaseSeriesEvents = addBaseSeriesEvents;
            /**
             * Destroys the series
             * @private
             */
            function destroy() {
                this.eventRemovers.forEach(function (remover) {
                    remover();
                });
                Series.prototype.destroy.apply(this, arguments);
            }
            DerivedComposition.destroy = destroy;
        })(DerivedComposition || (DerivedComposition = {}));
        /* *
         *
         *  Default Export
         *
         * */

        return DerivedComposition;
    });
    _registerModule(_modules, 'Series/Histogram/HistogramSeriesDefaults.js', [], function () {
        /* *
         *
         *  (c) 2010-2024 Highsoft AS
         *  Author: Sebastian Domas
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        /* *
         *
         *  API Options
         *
         * */
        /**
         * A histogram is a column series which represents the distribution of the
         * data set in the base series. Histogram splits data into bins and shows
         * their frequencies.
         *
         * @sample {highcharts} highcharts/demo/histogram/
         *         Histogram
         *
         * @extends      plotOptions.column
         * @excluding    boostThreshold, dragDrop, pointInterval, pointIntervalUnit,
         *               stacking, boostBlending
         * @product      highcharts
         * @since        6.0.0
         * @requires     modules/histogram-bellcurve
         * @optionparent plotOptions.histogram
         */
        var HistogramSeriesDefaults = {
            /**
             * A preferable number of bins. It is a suggestion, so a histogram may
             * have a different number of bins. By default it is set to the square
             * root of the base series' data length. Available options are:
             * `square-root`, `sturges`, `rice`. You can also define a function
             * which takes a `baseSeries` as a parameter and should return a
             * positive integer.
             *
             * @type {"square-root"|"sturges"|"rice"|number|Function}
             */
            binsNumber: 'square-root',
            /**
             * Width of each bin. By default the bin's width is calculated as
             * `(max - min) / number of bins`. This option takes precedence over
             * [binsNumber](#plotOptions.histogram.binsNumber).
             *
             * @type {number}
             */
            binWidth: void 0,
            pointPadding: 0,
            groupPadding: 0,
            grouping: false,
            pointPlacement: 'between',
            tooltip: {
                headerFormat: '',
                pointFormat: ('<span style="font-size: 0.8em">{point.x} - {point.x2}' +
                    '</span><br/>' +
                    '<span style="color:{point.color}">\u25CF</span>' +
                    ' {series.name} <b>{point.y}</b><br/>')
            }
        };
        /**
         * A `histogram` series. If the [type](#series.histogram.type) option is not
         * specified, it is inherited from [chart.type](#chart.type).
         *
         * @extends   series,plotOptions.histogram
         * @excluding data, dataParser, dataURL, boostThreshold, boostBlending
         * @product   highcharts
         * @since     6.0.0
         * @requires  modules/histogram-bellcurve
         * @apioption series.histogram
         */
        /**
         * An integer identifying the index to use for the base series, or a string
         * representing the id of the series.
         *
         * @type      {number|string}
         * @apioption series.histogram.baseSeries
         */
        ''; // Keeps doclets above separate
        /* *
         *
         *  Default Export
         *
         * */

        return HistogramSeriesDefaults;
    });
    _registerModule(_modules, 'Series/Histogram/HistogramSeries.js', [_modules['Series/DerivedComposition.js'], _modules['Series/Histogram/HistogramSeriesDefaults.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (DerivedComposition, HistogramSeriesDefaults, SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2024 Highsoft AS
         *  Author: Sebastian Domas
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
        var ColumnSeries = SeriesRegistry.seriesTypes.column;
        var arrayMax = U.arrayMax, arrayMin = U.arrayMin, correctFloat = U.correctFloat, extend = U.extend, isNumber = U.isNumber, merge = U.merge;
        /* ************************************************************************** *
         *  HISTOGRAM
         * ************************************************************************** */
        /**
         * A dictionary with formulas for calculating number of bins based on the
         * base series
         **/
        var binsNumberFormulas = {
            'square-root': function (baseSeries) {
                return Math.ceil(Math.sqrt(baseSeries.options.data.length));
            },
            'sturges': function (baseSeries) {
                return Math.ceil(Math.log(baseSeries.options.data.length) * Math.LOG2E);
            },
            'rice': function (baseSeries) {
                return Math.ceil(2 * Math.pow(baseSeries.options.data.length, 1 / 3));
            }
        };
        /**
         * Returns a function for mapping number to the closed (right opened) bins
         * @private
         * @param {Array<number>} bins
         * Width of the bins
         */
        function fitToBinLeftClosed(bins) {
            return function (y) {
                var i = 1;
                while (bins[i] <= y) {
                    i++;
                }
                return bins[--i];
            };
        }
        /* *
         *
         *  Class
         *
         * */
        /**
         * Histogram class
         * @private
         * @class
         * @name Highcharts.seriesTypes.histogram
         * @augments Highcharts.Series
         */
        var HistogramSeries = /** @class */ (function (_super) {
            __extends(HistogramSeries, _super);
            function HistogramSeries() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* *
             *
             *  Functions
             *
             * */
            HistogramSeries.prototype.binsNumber = function () {
                var binsNumberOption = this.options.binsNumber;
                var binsNumber = binsNumberFormulas[binsNumberOption] ||
                    // #7457
                    (typeof binsNumberOption === 'function' && binsNumberOption);
                return Math.ceil((binsNumber && binsNumber(this.baseSeries)) ||
                    (isNumber(binsNumberOption) ?
                        binsNumberOption :
                        binsNumberFormulas['square-root'](this.baseSeries)));
            };
            HistogramSeries.prototype.derivedData = function (baseData, binsNumber, binWidth) {
                var series = this, max = correctFloat(arrayMax(baseData)), 
                // Float correction needed, because first frequency value is not
                // corrected when generating frequencies (within for loop).
                min = correctFloat(arrayMin(baseData)), frequencies = [], bins = {}, data = [];
                var x;
                binWidth = series.binWidth = (correctFloat(isNumber(binWidth) ?
                    (binWidth || 1) :
                    (max - min) / binsNumber));
                // #12077 negative pointRange causes wrong calculations,
                // browser hanging.
                series.options.pointRange = Math.max(binWidth, 0);
                // If binWidth is 0 then max and min are equaled,
                // increment the x with some positive value to quit the loop
                for (x = min; 
                // This condition is needed because of the margin of error while
                // operating on decimal numbers. Without that, additional bin
                // was sometimes noticeable on the graph, because of too small
                // precision of float correction.
                x < max &&
                    (series.userOptions.binWidth ||
                        correctFloat(max - x) >= binWidth ||
                        // #13069 - Every add and subtract operation should
                        // be corrected, due to general problems with
                        // operations on float numbers in JS.
                        correctFloat(correctFloat(min + (frequencies.length * binWidth)) -
                            x) <= 0); x = correctFloat(x + binWidth)) {
                    frequencies.push(x);
                    bins[x] = 0;
                }
                if (bins[min] !== 0) {
                    frequencies.push(min);
                    bins[min] = 0;
                }
                var fitToBin = fitToBinLeftClosed(frequencies.map(function (elem) { return parseFloat(elem); }));
                for (var _i = 0, baseData_1 = baseData; _i < baseData_1.length; _i++) {
                    var y = baseData_1[_i];
                    bins[correctFloat(fitToBin(y))]++;
                }
                for (var _a = 0, _b = Object.keys(bins); _a < _b.length; _a++) {
                    var key = _b[_a];
                    data.push({
                        x: Number(key),
                        y: bins[key],
                        x2: correctFloat(Number(key) + binWidth)
                    });
                }
                data.sort(function (a, b) { return (a.x - b.x); });
                data[data.length - 1].x2 = max;
                return data;
            };
            HistogramSeries.prototype.setDerivedData = function () {
                var yData = this.baseSeries.yData;
                if (!yData.length) {
                    this.setData([]);
                    return;
                }
                var data = this.derivedData(yData, this.binsNumber(), this.options.binWidth);
                this.setData(data, false);
            };
            /* *
             *
             *  Static Properties
             *
             * */
            HistogramSeries.defaultOptions = merge(ColumnSeries.defaultOptions, HistogramSeriesDefaults);
            return HistogramSeries;
        }(ColumnSeries));
        extend(HistogramSeries.prototype, {
            hasDerivedData: DerivedComposition.hasDerivedData
        });
        DerivedComposition.compose(HistogramSeries);
        SeriesRegistry.registerSeriesType('histogram', HistogramSeries);
        /* *
         *
         *  Default Export
         *
         * */

        return HistogramSeries;
    });
    _registerModule(_modules, 'Series/Bellcurve/BellcurveSeriesDefaults.js', [], function () {
        /* *
         *
         *  (c) 2010-2024 Highsoft AS
         *
         *  Author: Sebastian Domas
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        /* *
         *
         *  API Optiions
         *
         * */
        /**
         * A bell curve is an areaspline series which represents the probability
         * density function of the normal distribution. It calculates mean and
         * standard deviation of the base series data and plots the curve according
         * to the calculated parameters.
         *
         * @sample {highcharts} highcharts/demo/bellcurve/
         *         Bell curve
         *
         * @extends      plotOptions.areaspline
         * @since        6.0.0
         * @product      highcharts
         * @excluding    boostThreshold, connectNulls, dragDrop, stacking,
         *               pointInterval, pointIntervalUnit
         * @requires     modules/histogram-bellcurve
         * @optionparent plotOptions.bellcurve
         */
        var BellcurveSeriesDefaults = {
            /**
             * @see [fillColor](#plotOptions.bellcurve.fillColor)
             * @see [fillOpacity](#plotOptions.bellcurve.fillOpacity)
             *
             * @apioption plotOptions.bellcurve.color
             */
            /**
             * @see [color](#plotOptions.bellcurve.color)
             * @see [fillOpacity](#plotOptions.bellcurve.fillOpacity)
             *
             * @apioption plotOptions.bellcurve.fillColor
             */
            /**
             * @see [color](#plotOptions.bellcurve.color)
             * @see [fillColor](#plotOptions.bellcurve.fillColor)
             *
             * @default   {highcharts} 0.75
             * @default   {highstock} 0.75
             * @apioption plotOptions.bellcurve.fillOpacity
             */
            /**
             * This option allows to define the length of the bell curve. A unit of
             * the length of the bell curve is standard deviation.
             *
             * @sample highcharts/plotoptions/bellcurve-intervals-pointsininterval
             *         Intervals and points in interval
             */
            intervals: 3,
            /**
             * Defines how many points should be plotted within 1 interval. See
             * `plotOptions.bellcurve.intervals`.
             *
             * @sample highcharts/plotoptions/bellcurve-intervals-pointsininterval
             *         Intervals and points in interval
             */
            pointsInInterval: 3,
            marker: {
                enabled: false
            }
        };
        /**
         * A `bellcurve` series. If the [type](#series.bellcurve.type) option is not
         * specified, it is inherited from [chart.type](#chart.type).
         *
         * For options that apply to multiple series, it is recommended to add
         * them to the [plotOptions.series](#plotOptions.series) options structure.
         * To apply to all series of this specific type, apply it to
         * [plotOptions.bellcurve](#plotOptions.bellcurve).
         *
         * @extends   series,plotOptions.bellcurve
         * @since     6.0.0
         * @product   highcharts
         * @excluding dataParser, dataURL, data, boostThreshold, boostBlending
         * @requires  modules/histogram-bellcurve
         * @apioption series.bellcurve
         */
        /**
         * An integer identifying the index to use for the base series, or a string
         * representing the id of the series.
         *
         * @type      {number|string}
         * @apioption series.bellcurve.baseSeries
         */
        /**
         * @see [fillColor](#series.bellcurve.fillColor)
         * @see [fillOpacity](#series.bellcurve.fillOpacity)
         *
         * @apioption series.bellcurve.color
         */
        /**
         * @see [color](#series.bellcurve.color)
         * @see [fillOpacity](#series.bellcurve.fillOpacity)
         *
         * @apioption series.bellcurve.fillColor
         */
        /**
         * @see [color](#series.bellcurve.color)
         * @see [fillColor](#series.bellcurve.fillColor)
         *
         * @default   {highcharts} 0.75
         * @default   {highstock} 0.75
         * @apioption series.bellcurve.fillOpacity
         */
        ''; // Keeps doclets above separate
        /* *
         *
         *  Default Export
         *
         * */

        return BellcurveSeriesDefaults;
    });
    _registerModule(_modules, 'Series/Bellcurve/BellcurveSeries.js', [_modules['Series/Bellcurve/BellcurveSeriesDefaults.js'], _modules['Series/DerivedComposition.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (BellcurveSeriesDefaults, DerivedComposition, SeriesRegistry, U) {
        /* *
         *
         *  (c) 2010-2024 Highsoft AS
         *
         *  Author: Sebastian Domas
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
        var AreaSplineSeries = SeriesRegistry.seriesTypes.areaspline;
        var correctFloat = U.correctFloat, isNumber = U.isNumber, merge = U.merge;
        /* *
         *
         *  Class
         *
         * */
        /**
         * Bell curve class
         *
         * @private
         * @class
         * @name Highcharts.seriesTypes.bellcurve
         *
         * @augments Highcharts.Series
         */
        var BellcurveSeries = /** @class */ (function (_super) {
            __extends(BellcurveSeries, _super);
            function BellcurveSeries() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* *
             *
             *  Static Functions
             *
             * */
            /** @private */
            BellcurveSeries.mean = function (data) {
                var length = data.length, sum = data.reduce(function (sum, value) {
                    return (sum += value);
                }, 0);
                return length > 0 && sum / length;
            };
            /** @private */
            BellcurveSeries.standardDeviation = function (data, average) {
                var len = data.length;
                average = isNumber(average) ?
                    average : BellcurveSeries.mean(data);
                var sum = data.reduce(function (sum, value) {
                    var diff = value - average;
                    return (sum += diff * diff);
                }, 0);
                return len > 1 && Math.sqrt(sum / (len - 1));
            };
            /** @private */
            BellcurveSeries.normalDensity = function (x, mean, standardDeviation) {
                var translation = x - mean;
                return Math.exp(-(translation * translation) /
                    (2 * standardDeviation * standardDeviation)) / (standardDeviation * Math.sqrt(2 * Math.PI));
            };
            /* *
             *
             *  Functions
             *
             * */
            BellcurveSeries.prototype.derivedData = function (mean, standardDeviation) {
                var options = this.options, intervals = options.intervals, pointsInInterval = options.pointsInInterval, stop = intervals * pointsInInterval * 2 + 1, increment = standardDeviation / pointsInInterval, data = [];
                var x = mean - intervals * standardDeviation;
                for (var i = 0; i < stop; i++) {
                    data.push([x, BellcurveSeries.normalDensity(x, mean, standardDeviation)]);
                    x += increment;
                }
                return data;
            };
            BellcurveSeries.prototype.setDerivedData = function () {
                var _a, _b;
                var series = this;
                if (((_b = (_a = series.baseSeries) === null || _a === void 0 ? void 0 : _a.yData) === null || _b === void 0 ? void 0 : _b.length) || 0 > 1) {
                    series.setMean();
                    series.setStandardDeviation();
                    series.setData(series.derivedData(series.mean || 0, series.standardDeviation || 0), false, void 0, false);
                }
                return (void 0);
            };
            BellcurveSeries.prototype.setMean = function () {
                var series = this;
                series.mean = correctFloat(BellcurveSeries.mean(series.baseSeries.yData));
            };
            BellcurveSeries.prototype.setStandardDeviation = function () {
                var series = this;
                series.standardDeviation = correctFloat(BellcurveSeries.standardDeviation(series.baseSeries.yData, series.mean));
            };
            /* *
             *
             *  Static Properties
             *
             * */
            BellcurveSeries.defaultOptions = merge(AreaSplineSeries.defaultOptions, BellcurveSeriesDefaults);
            return BellcurveSeries;
        }(AreaSplineSeries));
        DerivedComposition.compose(BellcurveSeries);
        SeriesRegistry.registerSeriesType('bellcurve', BellcurveSeries);
        /* *
         *
         *  Default Export
         *
         * */

        return BellcurveSeries;
    });
    _registerModule(_modules, 'masters/modules/histogram-bellcurve.src.js', [_modules['Core/Globals.js']], function (Highcharts) {


        return Highcharts;
    });
}));
