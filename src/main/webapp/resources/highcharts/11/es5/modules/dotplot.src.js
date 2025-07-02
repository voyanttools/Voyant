/**
 * @license Highcharts JS v11.4.8 (2024-08-29)
 *
 * Dot plot series type for Highcharts
 *
 * (c) 2010-2024 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/modules/dotplot', ['highcharts'], function (Highcharts) {
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
    _registerModule(_modules, 'Series/DotPlot/DotPlotSeriesDefaults.js', [], function () {
        /* *
         *
         *  (c) 2009-2024 Torstein Honsi
         *
         *  Dot plot series type for Highcharts
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
        var DotPlotSeriesDefaults = {
            itemPadding: 0.1,
            marker: {
                symbol: 'circle',
                states: {
                    hover: {},
                    select: {}
                }
            },
            slotsPerBar: void 0
        };
        /* *
         *
         *  Default Export
         *
         * */

        return DotPlotSeriesDefaults;
    });
    _registerModule(_modules, 'Series/DotPlot/DotPlotSeries.js', [_modules['Series/DotPlot/DotPlotSeriesDefaults.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (DotPlotSeriesDefaults, SeriesRegistry, U) {
        /* *
         *
         *  (c) 2009-2024 Torstein Honsi
         *
         *  Dot plot series type for Highcharts
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        /**
         * @private
         * @todo
         * - Check update, remove etc.
         * - Custom icons like persons, carts etc. Either as images, font icons or
         *   Highcharts symbols.
         */
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
        var extend = U.extend, isNumber = U.isNumber, merge = U.merge, pick = U.pick;
        /* *
         *
         *  Class
         *
         * */
        /**
         * @private
         * @class
         * @name Highcharts.seriesTypes.dotplot
         *
         * @augments Highcharts.Series
         */
        var DotPlotSeries = /** @class */ (function (_super) {
            __extends(DotPlotSeries, _super);
            function DotPlotSeries() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* *
             *
             *  Functions
             *
             * */
            DotPlotSeries.prototype.drawPoints = function () {
                var _a, _b, _c;
                var series = this, options = series.options, renderer = series.chart.renderer, seriesMarkerOptions = options.marker, total = this.points.reduce(function (acc, point) { return acc + Math.abs(point.y || 0); }, 0), totalHeight = this.points.reduce(function (acc, point) { var _a; return acc + (((_a = point.shapeArgs) === null || _a === void 0 ? void 0 : _a.height) || 0); }, 0), itemPadding = options.itemPadding || 0, columnWidth = ((_b = (_a = this.points[0]) === null || _a === void 0 ? void 0 : _a.shapeArgs) === null || _b === void 0 ? void 0 : _b.width) || 0;
                var slotsPerBar = options.slotsPerBar, slotWidth = columnWidth;
                // Find the suitable number of slots per column
                if (!isNumber(slotsPerBar)) {
                    slotsPerBar = 1;
                    while (slotsPerBar < total) {
                        if (total / slotsPerBar <
                            (totalHeight / slotWidth) * 1.2) {
                            break;
                        }
                        slotsPerBar++;
                        slotWidth = columnWidth / slotsPerBar;
                    }
                }
                var height = (totalHeight * slotsPerBar) / total;
                for (var _i = 0, _d = series.points; _i < _d.length; _i++) {
                    var point = _d[_i];
                    var pointMarkerOptions = point.marker || {}, symbol = (pointMarkerOptions.symbol ||
                        seriesMarkerOptions.symbol), radius = pick(pointMarkerOptions.radius, seriesMarkerOptions.radius), isSquare = symbol !== 'rect', width = isSquare ? height : slotWidth, shapeArgs = point.shapeArgs || {}, startX = (shapeArgs.x || 0) + ((shapeArgs.width || 0) -
                        slotsPerBar * width) / 2, positiveYValue = Math.abs((_c = point.y) !== null && _c !== void 0 ? _c : 0), shapeY = (shapeArgs.y || 0), shapeHeight = (shapeArgs.height || 0);
                    var graphics = void 0, x = startX, y = point.negative ? shapeY : shapeY + shapeHeight - height, slotColumn = 0;
                    point.graphics = graphics = point.graphics || [];
                    var pointAttr = point.pointAttr ?
                        (point.pointAttr[point.selected ? 'selected' : ''] ||
                            series.pointAttr['']) :
                        series.pointAttribs(point, point.selected && 'select');
                    delete pointAttr.r;
                    if (series.chart.styledMode) {
                        delete pointAttr.stroke;
                        delete pointAttr['stroke-width'];
                    }
                    if (typeof point.y === 'number') {
                        if (!point.graphic) {
                            point.graphic = renderer.g('point').add(series.group);
                        }
                        for (var val = 0; val < positiveYValue; val++) {
                            var attr = {
                                x: x + width * itemPadding,
                                y: y + height * itemPadding,
                                width: width * (1 - 2 * itemPadding),
                                height: height * (1 - 2 * itemPadding),
                                r: radius
                            };
                            var graphic = graphics[val];
                            if (graphic) {
                                graphic.animate(attr);
                            }
                            else {
                                graphic = renderer
                                    .symbol(symbol)
                                    .attr(extend(attr, pointAttr))
                                    .add(point.graphic);
                            }
                            graphic.isActive = true;
                            graphics[val] = graphic;
                            x += width;
                            slotColumn++;
                            if (slotColumn >= slotsPerBar) {
                                slotColumn = 0;
                                x = startX;
                                y = point.negative ? y + height : y - height;
                            }
                        }
                    }
                    var i = -1;
                    for (var _e = 0, graphics_1 = graphics; _e < graphics_1.length; _e++) {
                        var graphic = graphics_1[_e];
                        ++i;
                        if (graphic) {
                            if (!graphic.isActive) {
                                graphic.destroy();
                                graphics.splice(i, 1);
                            }
                            else {
                                graphic.isActive = false;
                            }
                        }
                    }
                }
            };
            /* *
             *
             *  Static Properties
             *
             * */
            DotPlotSeries.defaultOptions = merge(ColumnSeries.defaultOptions, DotPlotSeriesDefaults);
            return DotPlotSeries;
        }(ColumnSeries));
        extend(DotPlotSeries.prototype, {
            markerAttribs: void 0
        });
        SeriesRegistry.registerSeriesType('dotplot', DotPlotSeries);
        /* *
         *
         *  Default Export
         *
         * */

        return DotPlotSeries;
    });
    _registerModule(_modules, 'masters/modules/dotplot.src.js', [_modules['Core/Globals.js']], function (Highcharts) {


        return Highcharts;
    });
}));
