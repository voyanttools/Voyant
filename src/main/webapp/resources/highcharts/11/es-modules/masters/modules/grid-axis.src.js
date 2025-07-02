/**
 * @license Highcharts Gantt JS v11.4.8 (2024-08-29)
 * @module highcharts/modules/grid-axis
 * @requires highcharts
 *
 * GridAxis
 *
 * (c) 2016-2024 Lars A. V. Cabrera
 *
 * License: www.highcharts.com/license
 */
'use strict';
import Highcharts from '../../Core/Globals.js';
import GridAxis from '../../Core/Axis/GridAxis.js';
const G = Highcharts;
// Compositions
GridAxis.compose(G.Axis, G.Chart, G.Tick);
export default Highcharts;
