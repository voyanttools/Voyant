import * as constellation from "./constellation.js"
import * as vec from "./vec_math.js"

Voyant.panel.Constellation.constellation = constellation;
Voyant.panel.Constellation.vec = vec;
Voyant.application.dispatchEvent('constellationJSLoaded', Voyant.panel.Constellation);
