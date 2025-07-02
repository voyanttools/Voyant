/**
 * @license Highcharts JS v11.4.8 (2024-08-29)
 *
 * Highcharts funnel module
 *
 * (c) 2010-2024 Kacper Madej
 *
 * License: www.highcharts.com/license
 */
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        factory['default'] = factory;
        module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
        define('highcharts/modules/funnel3d', ['highcharts', 'highcharts/highcharts-3d', 'highcharts/modules/cylinder'], function (Highcharts) {
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
    _registerModule(_modules, 'Series/Funnel3D/SVGElement3DFunnel.js', [_modules['Core/Color/Color.js'], _modules['Core/Globals.js'], _modules['Core/Renderer/RendererRegistry.js'], _modules['Core/Utilities.js']], function (Color, H, RendererRegistry, U) {
        /* *
         *
         *  Highcharts funnel3d series module
         *
         *  (c) 2010-2024 Highsoft AS
         *
         *  Author: Kacper Madej
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
        var color = Color.parse;
        var charts = H.charts;
        var SVGElement3D = RendererRegistry.getRendererType().prototype.Element3D;
        var merge = U.merge;
        /* *
         *
         *  Class
         *
         * */
        var SVGElement3DFunnel = /** @class */ (function (_super) {
            __extends(SVGElement3DFunnel, _super);
            function SVGElement3DFunnel() {
                /* *
                 *
                 *  Properties
                 *
                 * */
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.mainParts = ['top', 'bottom'];
                _this.parts = [
                    'top', 'bottom',
                    'frontUpper', 'backUpper',
                    'frontLower', 'backLower',
                    'rightUpper', 'rightLower'
                ];
                _this.sideGroups = [
                    'upperGroup', 'lowerGroup'
                ];
                _this.sideParts = {
                    upperGroup: ['frontUpper', 'backUpper', 'rightUpper'],
                    lowerGroup: ['frontLower', 'backLower', 'rightLower']
                };
                _this.pathType = 'funnel3d';
                return _this;
            }
            /* *
             *
             *  Functions
             *
             * */
            // override opacity and color setters to control opacity
            SVGElement3DFunnel.prototype.opacitySetter = function (value) {
                var funnel3d = this, opacity = parseFloat(value), parts = funnel3d.parts, chart = charts[funnel3d.renderer.chartIndex], filterId = 'group-opacity-' + opacity + '-' + chart.index;
                // Use default for top and bottom
                funnel3d.parts = funnel3d.mainParts;
                funnel3d.singleSetterForParts('opacity', opacity);
                // Restore
                funnel3d.parts = parts;
                if (!chart.renderer.filterId) {
                    chart.renderer.definition({
                        tagName: 'filter',
                        attributes: {
                            id: filterId
                        },
                        children: [{
                                tagName: 'feComponentTransfer',
                                children: [{
                                        tagName: 'feFuncA',
                                        attributes: {
                                            type: 'table',
                                            tableValues: '0 ' + opacity
                                        }
                                    }]
                            }]
                    });
                    for (var _i = 0, _a = funnel3d.sideGroups; _i < _a.length; _i++) {
                        var groupName = _a[_i];
                        funnel3d[groupName].attr({
                            filter: 'url(#' + filterId + ')'
                        });
                    }
                    // Styled mode
                    if (funnel3d.renderer.styledMode) {
                        chart.renderer.definition({
                            tagName: 'style',
                            textContent: '.highcharts-' + filterId +
                                ' {filter:url(#' + filterId + ')}'
                        });
                        for (var _b = 0, _c = funnel3d.sideGroups; _b < _c.length; _b++) {
                            var groupName = _c[_b];
                            funnel3d[groupName].addClass('highcharts-' + filterId);
                        }
                    }
                }
                return funnel3d;
            };
            SVGElement3DFunnel.prototype.fillSetter = function (fill) {
                var fillColor = color(fill);
                // Extract alpha channel to use the opacitySetter
                var funnel3d = this, alpha = fillColor.rgba[3], partsWithColor = {
                    // Standard color for top and bottom
                    top: color(fill).brighten(0.1).get(),
                    bottom: color(fill).brighten(-0.2).get()
                };
                if (alpha < 1) {
                    fillColor.rgba[3] = 1;
                    fillColor = fillColor.get('rgb');
                    // Set opacity through the opacitySetter
                    funnel3d.attr({
                        opacity: alpha
                    });
                }
                else {
                    // Use default for full opacity
                    fillColor = fill;
                }
                // Add gradient for sides
                if (!fillColor.linearGradient &&
                    !fillColor.radialGradient &&
                    funnel3d.gradientForSides) {
                    fillColor = {
                        linearGradient: { x1: 0, x2: 1, y1: 1, y2: 1 },
                        stops: [
                            [0, color(fill).brighten(-0.2).get()],
                            [0.5, fill],
                            [1, color(fill).brighten(-0.2).get()]
                        ]
                    };
                }
                // Gradient support
                if (fillColor.linearGradient) {
                    // Color in steps, as each gradient will generate a key
                    for (var _i = 0, _a = funnel3d.sideGroups; _i < _a.length; _i++) {
                        var sideGroupName = _a[_i];
                        var box = funnel3d[sideGroupName].gradientBox, gradient = fillColor.linearGradient, alteredGradient = merge(fillColor, {
                            linearGradient: {
                                x1: box.x + gradient.x1 * box.width,
                                y1: box.y + gradient.y1 * box.height,
                                x2: box.x + gradient.x2 * box.width,
                                y2: box.y + gradient.y2 * box.height
                            }
                        });
                        for (var _b = 0, _c = funnel3d.sideParts[sideGroupName]; _b < _c.length; _b++) {
                            var partName = _c[_b];
                            partsWithColor[partName] = alteredGradient;
                        }
                    }
                }
                else {
                    merge(true, partsWithColor, {
                        frontUpper: fillColor,
                        backUpper: fillColor,
                        rightUpper: fillColor,
                        frontLower: fillColor,
                        backLower: fillColor,
                        rightLower: fillColor
                    });
                    if (fillColor.radialGradient) {
                        for (var _d = 0, _e = funnel3d.sideGroups; _d < _e.length; _d++) {
                            var sideGroupName = _e[_d];
                            var gradBox = funnel3d[sideGroupName].gradientBox, centerX = gradBox.x + gradBox.width / 2, centerY = gradBox.y + gradBox.height / 2, diameter = Math.min(gradBox.width, gradBox.height);
                            for (var _f = 0, _g = funnel3d.sideParts[sideGroupName]; _f < _g.length; _f++) {
                                var partName = _g[_f];
                                funnel3d[partName].setRadialReference([
                                    centerX, centerY, diameter
                                ]);
                            }
                        }
                    }
                }
                funnel3d.singleSetterForParts('fill', null, partsWithColor);
                // Fill for animation getter (#6776)
                funnel3d.color = funnel3d.fill = fill;
                // Change gradientUnits to userSpaceOnUse for linearGradient
                if (fillColor.linearGradient) {
                    for (var _h = 0, _j = [funnel3d.frontLower, funnel3d.frontUpper]; _h < _j.length; _h++) {
                        var part = _j[_h];
                        var elem = part.element, grad = (elem &&
                            funnel3d.renderer.gradients[elem.gradient]);
                        if (grad &&
                            grad.attr('gradientUnits') !== 'userSpaceOnUse') {
                            grad.attr({
                                gradientUnits: 'userSpaceOnUse'
                            });
                        }
                    }
                }
                return funnel3d;
            };
            SVGElement3DFunnel.prototype.adjustForGradient = function () {
                var funnel3d = this;
                var bbox;
                for (var _i = 0, _a = funnel3d.sideGroups; _i < _a.length; _i++) {
                    var sideGroupName = _a[_i];
                    // Use common extremes for groups for matching gradients
                    var topLeftEdge = {
                        x: Number.MAX_VALUE,
                        y: Number.MAX_VALUE
                    }, bottomRightEdge = {
                        x: -Number.MAX_VALUE,
                        y: -Number.MAX_VALUE
                    };
                    // Get extremes
                    for (var _b = 0, _c = funnel3d.sideParts[sideGroupName]; _b < _c.length; _b++) {
                        var partName = _c[_b];
                        var part = funnel3d[partName];
                        bbox = part.getBBox(true);
                        topLeftEdge = {
                            x: Math.min(topLeftEdge.x, bbox.x),
                            y: Math.min(topLeftEdge.y, bbox.y)
                        };
                        bottomRightEdge = {
                            x: Math.max(bottomRightEdge.x, bbox.x + bbox.width),
                            y: Math.max(bottomRightEdge.y, bbox.y + bbox.height)
                        };
                    }
                    // Store for color fillSetter
                    funnel3d[sideGroupName].gradientBox = {
                        x: topLeftEdge.x,
                        width: bottomRightEdge.x - topLeftEdge.x,
                        y: topLeftEdge.y,
                        height: bottomRightEdge.y - topLeftEdge.y
                    };
                }
            };
            SVGElement3DFunnel.prototype.zIndexSetter = function () {
                // `this.added` won't work, because zIndex is set after the prop is set,
                // but before the graphic is really added
                if (this.finishedOnAdd) {
                    this.adjustForGradient();
                }
                // Run default
                return this.renderer.Element.prototype.zIndexSetter.apply(this, arguments);
            };
            SVGElement3DFunnel.prototype.onAdd = function () {
                this.adjustForGradient();
                this.finishedOnAdd = true;
            };
            return SVGElement3DFunnel;
        }(SVGElement3D));
        /* *
         *
         *  Default Export
         *
         * */

        return SVGElement3DFunnel;
    });
    _registerModule(_modules, 'Series/Funnel3D/Funnel3DComposition.js', [_modules['Series/Funnel3D/SVGElement3DFunnel.js'], _modules['Core/Globals.js'], _modules['Core/Utilities.js']], function (SVGElement3DFunnel, H, U) {
        /* *
         *
         *  Highcharts funnel3d series module
         *
         *  (c) 2010-2024 Highsoft AS
         *
         *  Author: Kacper Madej
         *
         *  License: www.highcharts.com/license
         *
         *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
         *
         * */
        var charts = H.charts;
        var error = U.error, extend = U.extend, merge = U.merge;
        /* *
         *
         *  Functions
         *
         * */
        /** @private */
        function compose(SVGRendererClass) {
            var rendererProto = SVGRendererClass.prototype;
            if (!rendererProto.funnel3d) {
                rendererProto.Element3D.types.funnel3d = SVGElement3DFunnel;
                extend(rendererProto, {
                    funnel3d: rendererFunnel3d,
                    funnel3dPath: rendererFunnel3dPath
                });
            }
        }
        /** @private */
        function rendererFunnel3d(shapeArgs) {
            var renderer = this, funnel3d = renderer.element3d('funnel3d', shapeArgs), styledMode = renderer.styledMode, 
            // Hide stroke for Firefox
            strokeAttrs = {
                'stroke-width': 1,
                stroke: 'none'
            };
            // Create groups for sides for opacity setter
            funnel3d.upperGroup = renderer.g('funnel3d-upper-group').attr({
                zIndex: funnel3d.frontUpper.zIndex
            }).add(funnel3d);
            for (var _i = 0, _a = [funnel3d.frontUpper, funnel3d.backUpper, funnel3d.rightUpper]; _i < _a.length; _i++) {
                var upperElem = _a[_i];
                if (!styledMode) {
                    upperElem.attr(strokeAttrs);
                }
                upperElem.add(funnel3d.upperGroup);
            }
            funnel3d.lowerGroup = renderer.g('funnel3d-lower-group').attr({
                zIndex: funnel3d.frontLower.zIndex
            }).add(funnel3d);
            for (var _b = 0, _c = [funnel3d.frontLower, funnel3d.backLower, funnel3d.rightLower]; _b < _c.length; _b++) {
                var lowerElem = _c[_b];
                if (!styledMode) {
                    lowerElem.attr(strokeAttrs);
                }
                lowerElem.add(funnel3d.lowerGroup);
            }
            funnel3d.gradientForSides = shapeArgs.gradientForSides;
            return funnel3d;
        }
        /**
         * Generates paths and zIndexes.
         * @private
         */
        function rendererFunnel3dPath(shapeArgs) {
            // Check getCylinderEnd for better error message if
            // the cylinder module is missing
            if (!this.getCylinderEnd) {
                error('A required Highcharts module is missing: cylinder.js', true, charts[this.chartIndex]);
            }
            var renderer = this, chart = charts[renderer.chartIndex], 
            // Adjust angles for visible edges
            // based on alpha, selected through visual tests
            alphaCorrection = shapeArgs.alphaCorrection = 90 - Math.abs((chart.options.chart.options3d.alpha % 180) -
                90), 
            // Set zIndexes of parts based on cuboid logic, for
            // consistency
            cuboidData = this.cuboidPath.call(renderer, merge(shapeArgs, {
                depth: shapeArgs.width,
                width: (shapeArgs.width + shapeArgs.bottom.width) / 2
            })), isTopFirst = cuboidData.isTop, isFrontFirst = !cuboidData.isFront, hasMiddle = !!shapeArgs.middle, 
            //
            top = renderer.getCylinderEnd(chart, merge(shapeArgs, {
                x: shapeArgs.x - shapeArgs.width / 2,
                z: shapeArgs.z - shapeArgs.width / 2,
                alphaCorrection: alphaCorrection
            })), bottomWidth = shapeArgs.bottom.width, bottomArgs = merge(shapeArgs, {
                width: bottomWidth,
                x: shapeArgs.x - bottomWidth / 2,
                z: shapeArgs.z - bottomWidth / 2,
                alphaCorrection: alphaCorrection
            }), bottom = renderer.getCylinderEnd(chart, bottomArgs, true);
            var middleWidth = bottomWidth, middleTopArgs = bottomArgs, middleTop = bottom, middleBottom = bottom, 
            // Masking for cylinders or a missing part of a side shape
            useAlphaCorrection;
            if (hasMiddle) {
                middleWidth = shapeArgs.middle.width;
                middleTopArgs = merge(shapeArgs, {
                    y: (shapeArgs.y +
                        shapeArgs.middle.fraction * shapeArgs.height),
                    width: middleWidth,
                    x: shapeArgs.x - middleWidth / 2,
                    z: shapeArgs.z - middleWidth / 2
                });
                middleTop = renderer.getCylinderEnd(chart, middleTopArgs, false);
                middleBottom = renderer.getCylinderEnd(chart, middleTopArgs, false);
            }
            var ret = {
                top: top,
                bottom: bottom,
                frontUpper: renderer.getCylinderFront(top, middleTop),
                zIndexes: {
                    group: cuboidData.zIndexes.group,
                    top: isTopFirst !== 0 ? 0 : 3,
                    bottom: isTopFirst !== 1 ? 0 : 3,
                    frontUpper: isFrontFirst ? 2 : 1,
                    backUpper: isFrontFirst ? 1 : 2,
                    rightUpper: isFrontFirst ? 2 : 1
                }
            };
            ret.backUpper = renderer.getCylinderBack(top, middleTop);
            useAlphaCorrection = (Math.min(middleWidth, shapeArgs.width) /
                Math.max(middleWidth, shapeArgs.width)) !== 1;
            ret.rightUpper = renderer.getCylinderFront(renderer.getCylinderEnd(chart, merge(shapeArgs, {
                x: shapeArgs.x - shapeArgs.width / 2,
                z: shapeArgs.z - shapeArgs.width / 2,
                alphaCorrection: useAlphaCorrection ?
                    -alphaCorrection : 0
            }), false), renderer.getCylinderEnd(chart, merge(middleTopArgs, {
                alphaCorrection: useAlphaCorrection ?
                    -alphaCorrection : 0
            }), !hasMiddle));
            if (hasMiddle) {
                useAlphaCorrection = (Math.min(middleWidth, bottomWidth) /
                    Math.max(middleWidth, bottomWidth)) !== 1;
                merge(true, ret, {
                    frontLower: renderer.getCylinderFront(middleBottom, bottom),
                    backLower: renderer.getCylinderBack(middleBottom, bottom),
                    rightLower: renderer.getCylinderFront(renderer.getCylinderEnd(chart, merge(bottomArgs, {
                        alphaCorrection: useAlphaCorrection ?
                            -alphaCorrection : 0
                    }), true), renderer.getCylinderEnd(chart, merge(middleTopArgs, {
                        alphaCorrection: useAlphaCorrection ?
                            -alphaCorrection : 0
                    }), false)),
                    zIndexes: {
                        frontLower: isFrontFirst ? 2 : 1,
                        backLower: isFrontFirst ? 1 : 2,
                        rightLower: isFrontFirst ? 1 : 2
                    }
                });
            }
            return ret;
        }
        /* *
         *
         *  Default Export
         *
         * */
        var Funnel3DComposition = {
            compose: compose
        };

        return Funnel3DComposition;
    });
    _registerModule(_modules, 'Series/Funnel3D/Funnel3DSeriesDefaults.js', [], function () {
        /* *
         *
         *  Imports
         *
         * */
        /* *
         *
         *  API Options
         *
         * */
        /**
         * A funnel3d is a 3d version of funnel series type. Funnel charts are
         * a type of chart often used to visualize stages in a sales project,
         * where the top are the initial stages with the most clients.
         *
         * It requires that the `highcharts-3d.js`, `cylinder.js` and
         * `funnel3d.js` module are loaded.
         *
         * @sample highcharts/demo/funnel3d/
         *         Funnel3d
         *
         * @extends      plotOptions.column
         * @excluding    allAreas, boostThreshold, colorAxis, compare, compareBase,
         *               dataSorting, boostBlending
         * @product      highcharts
         * @since        7.1.0
         * @requires     highcharts-3d
         * @requires     modules/cylinder
         * @requires     modules/funnel3d
         * @optionparent plotOptions.funnel3d
         */
        var Funnel3DSeriesDefaults = {
            /** @ignore-option */
            center: ['50%', '50%'],
            /**
             * The max width of the series compared to the width of the plot area,
             * or the pixel width if it is a number.
             *
             * @type    {number|string}
             * @sample  {highcharts} highcharts/demo/funnel3d/ Funnel3d demo
             * @product highcharts
             */
            width: '90%',
            /**
             * The width of the neck, the lower part of the funnel. A number defines
             * pixel width, a percentage string defines a percentage of the plot
             * area width.
             *
             * @type    {number|string}
             * @sample  {highcharts} highcharts/demo/funnel3d/ Funnel3d demo
             * @product highcharts
             */
            neckWidth: '30%',
            /**
             * The height of the series. If it is a number it defines
             * the pixel height, if it is a percentage string it is the percentage
             * of the plot area height.
             *
             * @type    {number|string}
             * @sample  {highcharts} highcharts/demo/funnel3d/ Funnel3d demo
             * @product highcharts
             */
            height: '100%',
            /**
             * The height of the neck, the lower part of the funnel. A number
             * defines pixel width, a percentage string defines a percentage
             * of the plot area height.
             *
             * @type    {number|string}
             * @sample  {highcharts} highcharts/demo/funnel3d/ Funnel3d demo
             * @product highcharts
             */
            neckHeight: '25%',
            /**
             * A reversed funnel has the widest area down. A reversed funnel with
             * no neck width and neck height is a pyramid.
             *
             * @product highcharts
             */
            reversed: false,
            /**
             * By default sides fill is set to a gradient through this option being
             * set to `true`. Set to `false` to get solid color for the sides.
             *
             * @product highcharts
             */
            gradientForSides: true,
            animation: false,
            edgeWidth: 0,
            colorByPoint: true,
            showInLegend: false,
            dataLabels: {
                align: 'right',
                crop: false,
                inside: false,
                overflow: 'allow'
            }
        };
        /**
         * A `funnel3d` series. If the [type](#series.funnel3d.type) option is
         * not specified, it is inherited from [chart.type](#chart.type).
         *
         * @sample {highcharts} highcharts/demo/funnel3d/
         *         Funnel3d demo
         *
         * @since     7.1.0
         * @extends   series,plotOptions.funnel3d
         * @excluding allAreas,boostThreshold,colorAxis,compare,compareBase
         * @product   highcharts
         * @requires  highcharts-3d
         * @requires  modules/cylinder
         * @requires  modules/funnel3d
         * @apioption series.funnel3d
         */
        /**
         * An array of data points for the series. For the `funnel3d` series
         * type, points can be given in the following ways:
         *
         * 1.  An array of numerical values. In this case, the numerical values
         * will be interpreted as `y` options. The `x` values will be automatically
         * calculated, either starting at 0 and incremented by 1, or from `pointStart`
         * and `pointInterval` given in the series options. If the axis has
         * categories, these will be used. Example:
         *
         *  ```js
         *  data: [0, 5, 3, 5]
         *  ```
         *
         * 2.  An array of objects with named values. The following snippet shows only a
         * few settings, see the complete options set below. If the total number of data
         * points exceeds the series' [turboThreshold](#series.funnel3d.turboThreshold),
         * this option is not available.
         *
         *  ```js
         *     data: [{
         *         y: 2,
         *         name: "Point2",
         *         color: "#00FF00"
         *     }, {
         *         y: 4,
         *         name: "Point1",
         *         color: "#FF00FF"
         *     }]
         *  ```
         *
         * @sample {highcharts} highcharts/chart/reflow-true/
         *         Numerical values
         * @sample {highcharts} highcharts/series/data-array-of-arrays/
         *         Arrays of numeric x and y
         * @sample {highcharts} highcharts/series/data-array-of-arrays-datetime/
         *         Arrays of datetime x and y
         * @sample {highcharts} highcharts/series/data-array-of-name-value/
         *         Arrays of point.name and y
         * @sample {highcharts} highcharts/series/data-array-of-objects/
         *         Config objects
         *
         * @type      {Array<number|Array<number>|*>}
         * @extends   series.column.data
         * @product   highcharts
         * @apioption series.funnel3d.data
         */
        /**
         * By default sides fill is set to a gradient through this option being
         * set to `true`. Set to `false` to get solid color for the sides.
         *
         * @type      {boolean}
         * @product   highcharts
         * @apioption series.funnel3d.data.gradientForSides
         */
        ''; // Detachs doclets above
        /* *
         *
         *  Default Export
         *
         * */

        return Funnel3DSeriesDefaults;
    });
    _registerModule(_modules, 'Series/Funnel3D/Funnel3DPoint.js', [_modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (SeriesRegistry, U) {
        /* *
         *
         *  Highcharts funnel3d series module
         *
         *  (c) 2010-2024 Highsoft AS
         *
         *  Author: Kacper Madej
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
        var extend = U.extend;
        /* *
         *
         *  Class
         *
         * */
        var Funnel3DPoint = /** @class */ (function (_super) {
            __extends(Funnel3DPoint, _super);
            function Funnel3DPoint() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return Funnel3DPoint;
        }(ColumnSeries.prototype.pointClass));
        extend(Funnel3DPoint.prototype, {
            shapeType: 'funnel3d'
        });
        /* *
         *
         *  Default Export
         *
         * */

        return Funnel3DPoint;
    });
    _registerModule(_modules, 'Series/Funnel3D/Funnel3DSeries.js', [_modules['Series/Funnel3D/Funnel3DComposition.js'], _modules['Series/Funnel3D/Funnel3DSeriesDefaults.js'], _modules['Series/Funnel3D/Funnel3DPoint.js'], _modules['Core/Globals.js'], _modules['Core/Math3D.js'], _modules['Core/Series/SeriesRegistry.js'], _modules['Core/Utilities.js']], function (Funnel3DComposition, Funnel3DSeriesDefaults, Funnel3DPoint, H, Math3D, SeriesRegistry, U) {
        /* *
         *
         *  Highcharts funnel3d series module
         *
         *  (c) 2010-2024 Highsoft AS
         *
         *  Author: Kacper Madej
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
        var noop = H.noop;
        var perspective = Math3D.perspective;
        var Series = SeriesRegistry.series, ColumnSeries = SeriesRegistry.seriesTypes.column;
        var extend = U.extend, merge = U.merge, pick = U.pick, relativeLength = U.relativeLength;
        /* *
         *
         *  Class
         *
         * */
        /**
         * The funnel3d series type.
         *
         * @private
         * @class
         * @name Highcharts.seriesTypes.funnel3d
         * @augments seriesTypes.column
         * @requires highcharts-3d
         * @requires modules/cylinder
         * @requires modules/funnel3d
         */
        var Funnel3DSeries = /** @class */ (function (_super) {
            __extends(Funnel3DSeries, _super);
            function Funnel3DSeries() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* *
             *
             *  Functions
             *
             * */
            /**
             * @private
             */
            Funnel3DSeries.prototype.alignDataLabel = function (point, _dataLabel, options) {
                var series = this, dlBoxRaw = point.dlBoxRaw, inverted = series.chart.inverted, below = point.plotY > pick(series.translatedThreshold, series.yAxis.len), inside = pick(options.inside, !!series.options.stacking), dlBox = {
                    x: dlBoxRaw.x,
                    y: dlBoxRaw.y,
                    height: 0
                };
                options.align = pick(options.align, !inverted || inside ? 'center' : below ? 'right' : 'left');
                options.verticalAlign = pick(options.verticalAlign, inverted || inside ? 'middle' : below ? 'top' : 'bottom');
                if (options.verticalAlign !== 'top') {
                    dlBox.y += dlBoxRaw.bottom /
                        (options.verticalAlign === 'bottom' ? 1 : 2);
                }
                dlBox.width = series.getWidthAt(dlBox.y);
                if (series.options.reversed) {
                    dlBox.width = dlBoxRaw.fullWidth - dlBox.width;
                }
                if (inside) {
                    dlBox.x -= dlBox.width / 2;
                }
                else {
                    // Swap for inside
                    if (options.align === 'left') {
                        options.align = 'right';
                        dlBox.x -= dlBox.width * 1.5;
                    }
                    else if (options.align === 'right') {
                        options.align = 'left';
                        dlBox.x += dlBox.width / 2;
                    }
                    else {
                        dlBox.x -= dlBox.width / 2;
                    }
                }
                point.dlBox = dlBox;
                ColumnSeries.prototype.alignDataLabel.apply(series, arguments);
            };
            /**
             * Override default axis options with series required options for axes.
             * @private
             */
            Funnel3DSeries.prototype.bindAxes = function () {
                Series.prototype.bindAxes.apply(this, arguments);
                extend(this.xAxis.options, {
                    gridLineWidth: 0,
                    lineWidth: 0,
                    title: void 0,
                    tickPositions: []
                });
                merge(true, this.yAxis.options, {
                    gridLineWidth: 0,
                    title: void 0,
                    labels: {
                        enabled: false
                    }
                });
            };
            /**
             * @private
             */
            Funnel3DSeries.prototype.translate = function () {
                Series.prototype.translate.apply(this, arguments);
                var series = this, chart = series.chart, options = series.options, reversed = options.reversed, ignoreHiddenPoint = options.ignoreHiddenPoint, plotWidth = chart.plotWidth, plotHeight = chart.plotHeight, center = options.center, centerX = relativeLength(center[0], plotWidth), centerY = relativeLength(center[1], plotHeight), width = relativeLength(options.width, plotWidth), height = relativeLength(options.height, plotHeight), neckWidth = relativeLength(options.neckWidth, plotWidth), neckHeight = relativeLength(options.neckHeight, plotHeight), neckY = (centerY - height / 2) + height - neckHeight, points = series.points;
                var sum = 0, cumulative = 0, // Start at top
                tempWidth, getWidthAt, fraction, tooltipPos, 
                //
                y1, y3, y5, 
                //
                h, shapeArgs; // @todo: Type it. It's an extended SVGAttributes.
                // Return the width at a specific y coordinate
                series.getWidthAt = getWidthAt = function (y) {
                    var top = (centerY - height / 2);
                    return (y > neckY || height === neckHeight) ?
                        neckWidth :
                        neckWidth + (width - neckWidth) *
                            (1 - (y - top) / (height - neckHeight));
                };
                // Expose
                series.center = [centerX, centerY, height];
                series.centerX = centerX;
                /*
                    * Individual point coordinate naming:
                    *
                    *  _________centerX,y1________
                    *  \                         /
                    *   \                       /
                    *    \                     /
                    *     \                   /
                    *      \                 /
                    *        ___centerX,y3___
                    *
                    * Additional for the base of the neck:
                    *
                    *       |               |
                    *       |               |
                    *       |               |
                    *        ___centerX,y5___
                    */
                // get the total sum
                for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
                    var point = points_1[_i];
                    if (!ignoreHiddenPoint || point.visible !== false) {
                        sum += point.y;
                    }
                }
                for (var _a = 0, points_2 = points; _a < points_2.length; _a++) {
                    var point = points_2[_a];
                    // Set start and end positions
                    y5 = null;
                    fraction = sum ? point.y / sum : 0;
                    y1 = centerY - height / 2 + cumulative * height;
                    y3 = y1 + fraction * height;
                    tempWidth = getWidthAt(y1);
                    h = y3 - y1;
                    shapeArgs = {
                        // For fill setter
                        gradientForSides: pick(point.options.gradientForSides, options.gradientForSides),
                        x: centerX,
                        y: y1,
                        height: h,
                        width: tempWidth,
                        z: 1,
                        top: {
                            width: tempWidth
                        }
                    };
                    tempWidth = getWidthAt(y3);
                    shapeArgs.bottom = {
                        fraction: fraction,
                        width: tempWidth
                    };
                    // The entire point is within the neck
                    if (y1 >= neckY) {
                        shapeArgs.isCylinder = true;
                    }
                    else if (y3 > neckY) {
                        // The base of the neck
                        y5 = y3;
                        tempWidth = getWidthAt(neckY);
                        y3 = neckY;
                        shapeArgs.bottom.width = tempWidth;
                        shapeArgs.middle = {
                            fraction: h ? (neckY - y1) / h : 0,
                            width: tempWidth
                        };
                    }
                    if (reversed) {
                        shapeArgs.y = y1 = centerY + height / 2 -
                            (cumulative + fraction) * height;
                        if (shapeArgs.middle) {
                            shapeArgs.middle.fraction = 1 -
                                (h ? shapeArgs.middle.fraction : 0);
                        }
                        tempWidth = shapeArgs.width;
                        shapeArgs.width = shapeArgs.bottom.width;
                        shapeArgs.bottom.width = tempWidth;
                    }
                    point.shapeArgs = extend(point.shapeArgs, shapeArgs);
                    // For tooltips and data labels context
                    point.percentage = fraction * 100;
                    point.plotX = centerX;
                    if (reversed) {
                        point.plotY = centerY + height / 2 -
                            (cumulative + fraction / 2) * height;
                    }
                    else {
                        point.plotY = (y1 + (y5 || y3)) / 2;
                    }
                    // Placement of tooltips and data labels in 3D
                    tooltipPos = perspective([{
                            x: centerX,
                            y: point.plotY,
                            z: reversed ?
                                -(width - getWidthAt(point.plotY)) / 2 :
                                -(getWidthAt(point.plotY)) / 2
                        }], chart, true)[0];
                    point.tooltipPos = [tooltipPos.x, tooltipPos.y];
                    // Base to be used when alignment options are known
                    point.dlBoxRaw = {
                        x: centerX,
                        width: getWidthAt(point.plotY),
                        y: y1,
                        bottom: shapeArgs.height || 0,
                        fullWidth: width
                    };
                    if (!ignoreHiddenPoint || point.visible !== false) {
                        cumulative += fraction;
                    }
                }
            };
            /* *
             *
             *  Static Properties
             *
             * */
            Funnel3DSeries.compose = Funnel3DComposition.compose;
            Funnel3DSeries.defaultOptions = merge(ColumnSeries.defaultOptions, Funnel3DSeriesDefaults);
            return Funnel3DSeries;
        }(ColumnSeries));
        extend(Funnel3DSeries.prototype, {
            pointClass: Funnel3DPoint,
            translate3dShapes: noop
        });
        SeriesRegistry.registerSeriesType('funnel3d', Funnel3DSeries);
        /* *
         *
         *  Default Export
         *
         * */

        return Funnel3DSeries;
    });
    _registerModule(_modules, 'masters/modules/funnel3d.src.js', [_modules['Core/Globals.js'], _modules['Series/Funnel3D/Funnel3DSeries.js'], _modules['Core/Renderer/RendererRegistry.js']], function (Highcharts, Funnel3DSeries, RendererRegistry) {

        Funnel3DSeries.compose(RendererRegistry.getRendererType());

        return Highcharts;
    });
}));
