!/**
 * Highcharts JS v11.4.8 (2024-08-29)
 *
 * (c) 2009-2024 Highsoft AS
 *
 * License: www.highcharts.com/license
 */function(t){"object"==typeof module&&module.exports?(t.default=t,module.exports=t):"function"==typeof define&&define.amd?define("highcharts/themes/high-contrast-light",["highcharts"],function(e){return t(e),t.Highcharts=e,t}):t("undefined"!=typeof Highcharts?Highcharts:void 0)}(function(t){"use strict";var e=t?t._modules:{};function o(e,o,n,s){e.hasOwnProperty(o)||(e[o]=s.apply(null,n),"function"==typeof CustomEvent&&t.win.dispatchEvent(new CustomEvent("HighchartsModuleLoaded",{detail:{path:o,module:e[o]}})))}o(e,"Extensions/Themes/HighContrastLight.js",[e["Core/Defaults.js"]],function(t){var e,o;let{setOptions:n}=t;return(o=e||(e={})).options={colors:["#265FB5","#222","#698F01","#F4693E","#4C0684","#0FA388","#B7104A","#AF9023","#1A704C","#B02FDD"],credits:{style:{color:"#767676"}},navigator:{series:{color:"#5f98cf",lineColor:"#5f98cf"}}},o.apply=function(){n(o.options)},e}),o(e,"masters/themes/high-contrast-light.src.js",[e["Core/Globals.js"],e["Extensions/Themes/HighContrastLight.js"]],function(t,e){return t.theme=e.options,e.apply(),t})});