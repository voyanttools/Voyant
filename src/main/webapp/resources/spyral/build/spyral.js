var Spyral = (function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global_1 =
	  // eslint-disable-next-line no-undef
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func
	  Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split;

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings



	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// `ToPrimitive` abstract operation
	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	var nativeDefineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty
	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var objectDefineProperty = {
		f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});

	var sharedStore = store;

	var functionToString = Function.toString;

	// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var isPure = false;

	var shared = createCommonjsModule(function (module) {
	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.6.5',
	  mode:  'global',
	  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = new WeakMap$1();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;
	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };
	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	var getInternalState = internalState.get;
	var enforceInternalState = internalState.enforce;
	var TEMPLATE = String(String).split('String');

	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	  }
	  if (O === global_1) {
	    if (simple) O[key] = value;
	    else setGlobal(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }
	  if (simple) O[key] = value;
	  else createNonEnumerableProperty(O, key, value);
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	});
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
	    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength
	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;


	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	// all object keys, includes non-enumerable and symbols
	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : typeof detection == 'function' ? fails(detection)
	    : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';

	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    }
	    // extend global
	    redefine(target, key, sourceProperty, options);
	  }
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol
	  // eslint-disable-next-line no-undef
	  && !Symbol.sham
	  // eslint-disable-next-line no-undef
	  && typeof Symbol.iterator == 'symbol';

	// `IsArray` abstract operation
	// https://tc39.github.io/ecma262/#sec-isarray
	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	// `ToObject` abstract operation
	// https://tc39.github.io/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys
	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// `Object.defineProperties` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperties
	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true;

	// `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	var nativeGetOwnPropertyNames = objectGetOwnPropertyNames.f;

	var toString$1 = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return nativeGetOwnPropertyNames(it);
	  } catch (error) {
	    return windowNames.slice();
	  }
	};

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var f$5 = function getOwnPropertyNames(it) {
	  return windowNames && toString$1.call(it) == '[object Window]'
	    ? getWindowNames(it)
	    : nativeGetOwnPropertyNames(toIndexedObject(it));
	};

	var objectGetOwnPropertyNamesExternal = {
		f: f$5
	};

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];
	    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  } return WellKnownSymbolsStore[name];
	};

	var f$6 = wellKnownSymbol;

	var wellKnownSymbolWrapped = {
		f: f$6
	};

	var defineProperty = objectDefineProperty.f;

	var defineWellKnownSymbol = function (NAME) {
	  var Symbol = path.Symbol || (path.Symbol = {});
	  if (!has(Symbol, NAME)) defineProperty(Symbol, NAME, {
	    value: wellKnownSymbolWrapped.f(NAME)
	  });
	};

	var defineProperty$1 = objectDefineProperty.f;



	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
	    defineProperty$1(it, TO_STRING_TAG, { configurable: true, value: TAG });
	  }
	};

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	// optional / simple context binding
	var functionBindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 0: return function () {
	      return fn.call(that);
	    };
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var SPECIES = wellKnownSymbol('species');

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate = function (originalArray, length) {
	  var C;
	  if (isArray(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
	    else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var push = [].push;

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = functionBindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push.call(target, value); // filter
	        } else if (IS_EVERY) return false;  // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6)
	};

	var $forEach = arrayIteration.forEach;

	var HIDDEN = sharedKey('hidden');
	var SYMBOL = 'Symbol';
	var PROTOTYPE$1 = 'prototype';
	var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
	var setInternalState = internalState.set;
	var getInternalState = internalState.getterFor(SYMBOL);
	var ObjectPrototype = Object[PROTOTYPE$1];
	var $Symbol = global_1.Symbol;
	var $stringify = getBuiltIn('JSON', 'stringify');
	var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	var nativeDefineProperty$1 = objectDefineProperty.f;
	var nativeGetOwnPropertyNames$1 = objectGetOwnPropertyNamesExternal.f;
	var nativePropertyIsEnumerable$1 = objectPropertyIsEnumerable.f;
	var AllSymbols = shared('symbols');
	var ObjectPrototypeSymbols = shared('op-symbols');
	var StringToSymbolRegistry = shared('string-to-symbol-registry');
	var SymbolToStringRegistry = shared('symbol-to-string-registry');
	var WellKnownSymbolsStore$1 = shared('wks');
	var QObject = global_1.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDescriptor = descriptors && fails(function () {
	  return objectCreate(nativeDefineProperty$1({}, 'a', {
	    get: function () { return nativeDefineProperty$1(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (O, P, Attributes) {
	  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype, P);
	  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
	  nativeDefineProperty$1(O, P, Attributes);
	  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
	    nativeDefineProperty$1(ObjectPrototype, P, ObjectPrototypeDescriptor);
	  }
	} : nativeDefineProperty$1;

	var wrap = function (tag, description) {
	  var symbol = AllSymbols[tag] = objectCreate($Symbol[PROTOTYPE$1]);
	  setInternalState(symbol, {
	    type: SYMBOL,
	    tag: tag,
	    description: description
	  });
	  if (!descriptors) symbol.description = description;
	  return symbol;
	};

	var isSymbol = useSymbolAsUid ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return Object(it) instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(O, P, Attributes) {
	  if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
	  anObject(O);
	  var key = toPrimitive(P, true);
	  anObject(Attributes);
	  if (has(AllSymbols, key)) {
	    if (!Attributes.enumerable) {
	      if (!has(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor(1, {}));
	      O[HIDDEN][key] = true;
	    } else {
	      if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
	      Attributes = objectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
	    } return setSymbolDescriptor(O, key, Attributes);
	  } return nativeDefineProperty$1(O, key, Attributes);
	};

	var $defineProperties = function defineProperties(O, Properties) {
	  anObject(O);
	  var properties = toIndexedObject(Properties);
	  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
	  $forEach(keys, function (key) {
	    if (!descriptors || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
	  });
	  return O;
	};

	var $create = function create(O, Properties) {
	  return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
	};

	var $propertyIsEnumerable = function propertyIsEnumerable(V) {
	  var P = toPrimitive(V, true);
	  var enumerable = nativePropertyIsEnumerable$1.call(this, P);
	  if (this === ObjectPrototype && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
	  return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
	};

	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
	  var it = toIndexedObject(O);
	  var key = toPrimitive(P, true);
	  if (it === ObjectPrototype && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
	  var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);
	  if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
	    descriptor.enumerable = true;
	  }
	  return descriptor;
	};

	var $getOwnPropertyNames = function getOwnPropertyNames(O) {
	  var names = nativeGetOwnPropertyNames$1(toIndexedObject(O));
	  var result = [];
	  $forEach(names, function (key) {
	    if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
	  });
	  return result;
	};

	var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
	  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
	  var names = nativeGetOwnPropertyNames$1(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
	  var result = [];
	  $forEach(names, function (key) {
	    if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype, key))) {
	      result.push(AllSymbols[key]);
	    }
	  });
	  return result;
	};

	// `Symbol` constructor
	// https://tc39.github.io/ecma262/#sec-symbol-constructor
	if (!nativeSymbol) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
	    var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
	    var tag = uid(description);
	    var setter = function (value) {
	      if (this === ObjectPrototype) setter.call(ObjectPrototypeSymbols, value);
	      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
	    };
	    if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
	    return wrap(tag, description);
	  };

	  redefine($Symbol[PROTOTYPE$1], 'toString', function toString() {
	    return getInternalState(this).tag;
	  });

	  redefine($Symbol, 'withoutSetter', function (description) {
	    return wrap(uid(description), description);
	  });

	  objectPropertyIsEnumerable.f = $propertyIsEnumerable;
	  objectDefineProperty.f = $defineProperty;
	  objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
	  objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
	  objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

	  wellKnownSymbolWrapped.f = function (name) {
	    return wrap(wellKnownSymbol(name), name);
	  };

	  if (descriptors) {
	    // https://github.com/tc39/proposal-Symbol-description
	    nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
	      configurable: true,
	      get: function description() {
	        return getInternalState(this).description;
	      }
	    });
	    {
	      redefine(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
	    }
	  }
	}

	_export({ global: true, wrap: true, forced: !nativeSymbol, sham: !nativeSymbol }, {
	  Symbol: $Symbol
	});

	$forEach(objectKeys(WellKnownSymbolsStore$1), function (name) {
	  defineWellKnownSymbol(name);
	});

	_export({ target: SYMBOL, stat: true, forced: !nativeSymbol }, {
	  // `Symbol.for` method
	  // https://tc39.github.io/ecma262/#sec-symbol.for
	  'for': function (key) {
	    var string = String(key);
	    if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
	    var symbol = $Symbol(string);
	    StringToSymbolRegistry[string] = symbol;
	    SymbolToStringRegistry[symbol] = string;
	    return symbol;
	  },
	  // `Symbol.keyFor` method
	  // https://tc39.github.io/ecma262/#sec-symbol.keyfor
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
	    if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
	  },
	  useSetter: function () { USE_SETTER = true; },
	  useSimple: function () { USE_SETTER = false; }
	});

	_export({ target: 'Object', stat: true, forced: !nativeSymbol, sham: !descriptors }, {
	  // `Object.create` method
	  // https://tc39.github.io/ecma262/#sec-object.create
	  create: $create,
	  // `Object.defineProperty` method
	  // https://tc39.github.io/ecma262/#sec-object.defineproperty
	  defineProperty: $defineProperty,
	  // `Object.defineProperties` method
	  // https://tc39.github.io/ecma262/#sec-object.defineproperties
	  defineProperties: $defineProperties,
	  // `Object.getOwnPropertyDescriptor` method
	  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
	});

	_export({ target: 'Object', stat: true, forced: !nativeSymbol }, {
	  // `Object.getOwnPropertyNames` method
	  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // `Object.getOwnPropertySymbols` method
	  // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
	// https://bugs.chromium.org/p/v8/issues/detail?id=3443
	_export({ target: 'Object', stat: true, forced: fails(function () { objectGetOwnPropertySymbols.f(1); }) }, {
	  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
	    return objectGetOwnPropertySymbols.f(toObject(it));
	  }
	});

	// `JSON.stringify` method behavior with symbols
	// https://tc39.github.io/ecma262/#sec-json.stringify
	if ($stringify) {
	  var FORCED_JSON_STRINGIFY = !nativeSymbol || fails(function () {
	    var symbol = $Symbol();
	    // MS Edge converts symbol values to JSON as {}
	    return $stringify([symbol]) != '[null]'
	      // WebKit converts symbol values to JSON as null
	      || $stringify({ a: symbol }) != '{}'
	      // V8 throws on boxed symbols
	      || $stringify(Object(symbol)) != '{}';
	  });

	  _export({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
	    // eslint-disable-next-line no-unused-vars
	    stringify: function stringify(it, replacer, space) {
	      var args = [it];
	      var index = 1;
	      var $replacer;
	      while (arguments.length > index) args.push(arguments[index++]);
	      $replacer = replacer;
	      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
	      if (!isArray(replacer)) replacer = function (key, value) {
	        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
	        if (!isSymbol(value)) return value;
	      };
	      args[1] = replacer;
	      return $stringify.apply(null, args);
	    }
	  });
	}

	// `Symbol.prototype[@@toPrimitive]` method
	// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@toprimitive
	if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) {
	  createNonEnumerableProperty($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
	}
	// `Symbol.prototype[@@toStringTag]` property
	// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@tostringtag
	setToStringTag($Symbol, SYMBOL);

	hiddenKeys[HIDDEN] = true;

	var defineProperty$2 = objectDefineProperty.f;


	var NativeSymbol = global_1.Symbol;

	if (descriptors && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
	  // Safari 12 bug
	  NativeSymbol().description !== undefined
	)) {
	  var EmptyStringDescriptionStore = {};
	  // wrap Symbol constructor for correct work with undefined description
	  var SymbolWrapper = function Symbol() {
	    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
	    var result = this instanceof SymbolWrapper
	      ? new NativeSymbol(description)
	      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
	      : description === undefined ? NativeSymbol() : NativeSymbol(description);
	    if (description === '') EmptyStringDescriptionStore[result] = true;
	    return result;
	  };
	  copyConstructorProperties(SymbolWrapper, NativeSymbol);
	  var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
	  symbolPrototype.constructor = SymbolWrapper;

	  var symbolToString = symbolPrototype.toString;
	  var native = String(NativeSymbol('test')) == 'Symbol(test)';
	  var regexp = /^Symbol\((.*)\)[^)]+$/;
	  defineProperty$2(symbolPrototype, 'description', {
	    configurable: true,
	    get: function description() {
	      var symbol = isObject(this) ? this.valueOf() : this;
	      var string = symbolToString.call(symbol);
	      if (has(EmptyStringDescriptionStore, symbol)) return '';
	      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
	      return desc === '' ? undefined : desc;
	    }
	  });

	  _export({ global: true, forced: true }, {
	    Symbol: SymbolWrapper
	  });
	}

	// `Symbol.asyncIterator` well-known symbol
	// https://tc39.github.io/ecma262/#sec-symbol.asynciterator
	defineWellKnownSymbol('asyncIterator');

	// `Symbol.iterator` well-known symbol
	// https://tc39.github.io/ecma262/#sec-symbol.iterator
	defineWellKnownSymbol('iterator');

	// `Symbol.toStringTag` well-known symbol
	// https://tc39.github.io/ecma262/#sec-symbol.tostringtag
	defineWellKnownSymbol('toStringTag');

	var createProperty = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
	  else object[propertyKey] = value;
	};

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	var process = global_1.process;
	var versions = process && process.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (engineUserAgent) {
	  match = engineUserAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = engineUserAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var engineV8Version = version && +version;

	var SPECIES$1 = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return engineV8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES$1] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

	// We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679
	var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});

	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

	var isConcatSpreadable = function (O) {
	  if (!isObject(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray(O);
	};

	var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

	// `Array.prototype.concat` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species
	_export({ target: 'Array', proto: true, forced: FORCED }, {
	  concat: function concat(arg) { // eslint-disable-line no-unused-vars
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;
	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];
	      if (isConcatSpreadable(E)) {
	        len = toLength(E.length);
	        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        createProperty(A, n++, E);
	      }
	    }
	    A.length = n;
	    return A;
	  }
	});

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var defineProperty$3 = Object.defineProperty;
	var cache = {};

	var thrower = function (it) { throw it; };

	var arrayMethodUsesToLength = function (METHOD_NAME, options) {
	  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
	  if (!options) options = {};
	  var method = [][METHOD_NAME];
	  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
	  var argument0 = has(options, 0) ? options[0] : thrower;
	  var argument1 = has(options, 1) ? options[1] : undefined;

	  return cache[METHOD_NAME] = !!method && !fails(function () {
	    if (ACCESSORS && !descriptors) return true;
	    var O = { length: -1 };

	    if (ACCESSORS) defineProperty$3(O, 1, { enumerable: true, get: thrower });
	    else O[1] = 1;

	    method.call(O, argument0, argument1);
	  });
	};

	var $every = arrayIteration.every;



	var STRICT_METHOD = arrayMethodIsStrict('every');
	var USES_TO_LENGTH = arrayMethodUsesToLength('every');

	// `Array.prototype.every` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.every
	_export({ target: 'Array', proto: true, forced: !STRICT_METHOD || !USES_TO_LENGTH }, {
	  every: function every(callbackfn /* , thisArg */) {
	    return $every(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// `Array.prototype.fill` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.fill
	var arrayFill = function fill(value /* , start = 0, end = @length */) {
	  var O = toObject(this);
	  var length = toLength(O.length);
	  var argumentsLength = arguments.length;
	  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
	  var end = argumentsLength > 2 ? arguments[2] : undefined;
	  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
	  while (endPos > index) O[index++] = value;
	  return O;
	};

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype = Array.prototype;

	// Array.prototype[@@unscopables]
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	if (ArrayPrototype[UNSCOPABLES] == undefined) {
	  objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
	    configurable: true,
	    value: objectCreate(null)
	  });
	}

	// add a key to Array.prototype[@@unscopables]
	var addToUnscopables = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};

	// `Array.prototype.fill` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.fill
	_export({ target: 'Array', proto: true }, {
	  fill: arrayFill
	});

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('fill');

	var $filter = arrayIteration.filter;



	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');
	// Edge 14- issue
	var USES_TO_LENGTH$1 = arrayMethodUsesToLength('filter');

	// `Array.prototype.filter` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.filter
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH$1 }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var $findIndex = arrayIteration.findIndex;



	var FIND_INDEX = 'findIndex';
	var SKIPS_HOLES = true;

	var USES_TO_LENGTH$2 = arrayMethodUsesToLength(FIND_INDEX);

	// Shouldn't skip holes
	if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

	// `Array.prototype.findIndex` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
	_export({ target: 'Array', proto: true, forced: SKIPS_HOLES || !USES_TO_LENGTH$2 }, {
	  findIndex: function findIndex(callbackfn /* , that = undefined */) {
	    return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables(FIND_INDEX);

	var $forEach$1 = arrayIteration.forEach;



	var STRICT_METHOD$1 = arrayMethodIsStrict('forEach');
	var USES_TO_LENGTH$3 = arrayMethodUsesToLength('forEach');

	// `Array.prototype.forEach` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	var arrayForEach = (!STRICT_METHOD$1 || !USES_TO_LENGTH$3) ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	// `Array.prototype.forEach` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	_export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
	  forEach: arrayForEach
	});

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (error) {
	    var returnMethod = iterator['return'];
	    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
	    throw error;
	  }
	};

	var iterators = {};

	var ITERATOR = wellKnownSymbol('iterator');
	var ArrayPrototype$1 = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR] === it);
	};

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
	var test = {};

	test[TO_STRING_TAG$1] = 'z';

	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	var ITERATOR$1 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$1]
	    || it['@@iterator']
	    || iterators[classof(it)];
	};

	// `Array.from` method implementation
	// https://tc39.github.io/ecma262/#sec-array.from
	var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	  var O = toObject(arrayLike);
	  var C = typeof this == 'function' ? this : Array;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
	  // if the target is not iterable or it's an array with the default iterator - use a simple case
	  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
	    iterator = iteratorMethod.call(O);
	    next = iterator.next;
	    result = new C();
	    for (;!(step = next.call(iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty(result, index, value);
	    }
	  } else {
	    length = toLength(O.length);
	    result = new C(length);
	    for (;length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty(result, index, value);
	    }
	  }
	  result.length = index;
	  return result;
	};

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return { done: !!called++ };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };
	  iteratorWithReturn[ITERATOR$2] = function () {
	    return this;
	  };
	  // eslint-disable-next-line no-throw-literal
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) { /* empty */ }

	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR$2] = function () {
	      return {
	        next: function () {
	          return { done: ITERATION_SUPPORT = true };
	        }
	      };
	    };
	    exec(object);
	  } catch (error) { /* empty */ }
	  return ITERATION_SUPPORT;
	};

	var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
	  Array.from(iterable);
	});

	// `Array.from` method
	// https://tc39.github.io/ecma262/#sec-array.from
	_export({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
	  from: arrayFrom
	});

	var $includes = arrayIncludes.includes;



	var USES_TO_LENGTH$4 = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

	// `Array.prototype.includes` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.includes
	_export({ target: 'Array', proto: true, forced: !USES_TO_LENGTH$4 }, {
	  includes: function includes(el /* , fromIndex = 0 */) {
	    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('includes');

	var $indexOf = arrayIncludes.indexOf;



	var nativeIndexOf = [].indexOf;

	var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
	var STRICT_METHOD$2 = arrayMethodIsStrict('indexOf');
	var USES_TO_LENGTH$5 = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

	// `Array.prototype.indexOf` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	_export({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD$2 || !USES_TO_LENGTH$5 }, {
	  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
	    return NEGATIVE_ZERO
	      // convert -0 to +0
	      ? nativeIndexOf.apply(this, arguments) || 0
	      : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// `Array.isArray` method
	// https://tc39.github.io/ecma262/#sec-array.isarray
	_export({ target: 'Array', stat: true }, {
	  isArray: isArray
	});

	var correctPrototypeGetter = !fails(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO$1 = sharedKey('IE_PROTO');
	var ObjectPrototype$1 = Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof
	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectPrototype$1 : null;
	};

	var ITERATOR$3 = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	var returnThis = function () { return this; };

	// `%IteratorPrototype%` object
	// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
	  }
	}

	if (IteratorPrototype == undefined) IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	if ( !has(IteratorPrototype, ITERATOR$3)) {
	  createNonEnumerableProperty(IteratorPrototype, ITERATOR$3, returnThis);
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





	var returnThis$1 = function () { return this; };

	var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  } return it;
	};

	// `Object.setPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$4 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis$2 = function () { return this; };

	var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    } return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$4]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
	      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
	        if (objectSetPrototypeOf) {
	          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
	        } else if (typeof CurrentIteratorPrototype[ITERATOR$4] != 'function') {
	          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$4, returnThis$2);
	        }
	      }
	      // Set @@toStringTag to native iterators
	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  }

	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;
	    defaultIterator = function values() { return nativeIterator.call(this); };
	  }

	  // define iterator
	  if ( IterablePrototype[ITERATOR$4] !== defaultIterator) {
	    createNonEnumerableProperty(IterablePrototype, ITERATOR$4, defaultIterator);
	  }
	  iterators[NAME] = defaultIterator;

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
	  }

	  return methods;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState$1 = internalState.set;
	var getInternalState$1 = internalState.getterFor(ARRAY_ITERATOR);

	// `Array.prototype.entries` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.github.io/ecma262/#sec-createarrayiterator
	var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState$1(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState$1(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return { value: undefined, done: true };
	  }
	  if (kind == 'keys') return { value: index, done: false };
	  if (kind == 'values') return { value: target[index], done: false };
	  return { value: [index, target[index]], done: false };
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
	iterators.Arguments = iterators.Array;

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	var nativeJoin = [].join;

	var ES3_STRINGS = indexedObject != Object;
	var STRICT_METHOD$3 = arrayMethodIsStrict('join', ',');

	// `Array.prototype.join` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.join
	_export({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$3 }, {
	  join: function join(separator) {
	    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
	  }
	});

	var $map = arrayIteration.map;



	var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('map');
	// FF49- issue
	var USES_TO_LENGTH$6 = arrayMethodUsesToLength('map');

	// `Array.prototype.map` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.map
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$6 }, {
	  map: function map(callbackfn /* , thisArg */) {
	    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// `Array.prototype.{ reduce, reduceRight }` methods implementation
	var createMethod$2 = function (IS_RIGHT) {
	  return function (that, callbackfn, argumentsLength, memo) {
	    aFunction$1(callbackfn);
	    var O = toObject(that);
	    var self = indexedObject(O);
	    var length = toLength(O.length);
	    var index = IS_RIGHT ? length - 1 : 0;
	    var i = IS_RIGHT ? -1 : 1;
	    if (argumentsLength < 2) while (true) {
	      if (index in self) {
	        memo = self[index];
	        index += i;
	        break;
	      }
	      index += i;
	      if (IS_RIGHT ? index < 0 : length <= index) {
	        throw TypeError('Reduce of empty array with no initial value');
	      }
	    }
	    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
	      memo = callbackfn(memo, self[index], index, O);
	    }
	    return memo;
	  };
	};

	var arrayReduce = {
	  // `Array.prototype.reduce` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
	  left: createMethod$2(false),
	  // `Array.prototype.reduceRight` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
	  right: createMethod$2(true)
	};

	var $reduce = arrayReduce.left;



	var STRICT_METHOD$4 = arrayMethodIsStrict('reduce');
	var USES_TO_LENGTH$7 = arrayMethodUsesToLength('reduce', { 1: 0 });

	// `Array.prototype.reduce` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
	_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$4 || !USES_TO_LENGTH$7 }, {
	  reduce: function reduce(callbackfn /* , initialValue */) {
	    return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var nativeReverse = [].reverse;
	var test$1 = [1, 2];

	// `Array.prototype.reverse` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.reverse
	// fix for Safari 12.0 bug
	// https://bugs.webkit.org/show_bug.cgi?id=188794
	_export({ target: 'Array', proto: true, forced: String(test$1) === String(test$1.reverse()) }, {
	  reverse: function reverse() {
	    // eslint-disable-next-line no-self-assign
	    if (isArray(this)) this.length = this.length;
	    return nativeReverse.call(this);
	  }
	});

	var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('slice');
	var USES_TO_LENGTH$8 = arrayMethodUsesToLength('slice', { ACCESSORS: true, 0: 0, 1: 2 });

	var SPECIES$2 = wellKnownSymbol('species');
	var nativeSlice = [].slice;
	var max$1 = Math.max;

	// `Array.prototype.slice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 || !USES_TO_LENGTH$8 }, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = toLength(O.length);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
	    var Constructor, result, n;
	    if (isArray(O)) {
	      Constructor = O.constructor;
	      // cross-realm fallback
	      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject(Constructor)) {
	        Constructor = Constructor[SPECIES$2];
	        if (Constructor === null) Constructor = undefined;
	      }
	      if (Constructor === Array || Constructor === undefined) {
	        return nativeSlice.call(O, k, fin);
	      }
	    }
	    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));
	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
	    result.length = n;
	    return result;
	  }
	});

	var test$2 = [];
	var nativeSort = test$2.sort;

	// IE8-
	var FAILS_ON_UNDEFINED = fails(function () {
	  test$2.sort(undefined);
	});
	// V8 bug
	var FAILS_ON_NULL = fails(function () {
	  test$2.sort(null);
	});
	// Old WebKit
	var STRICT_METHOD$5 = arrayMethodIsStrict('sort');

	var FORCED$1 = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD$5;

	// `Array.prototype.sort` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.sort
	_export({ target: 'Array', proto: true, forced: FORCED$1 }, {
	  sort: function sort(comparefn) {
	    return comparefn === undefined
	      ? nativeSort.call(toObject(this))
	      : nativeSort.call(toObject(this), aFunction$1(comparefn));
	  }
	});

	var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport('splice');
	var USES_TO_LENGTH$9 = arrayMethodUsesToLength('splice', { ACCESSORS: true, 0: 0, 1: 2 });

	var max$2 = Math.max;
	var min$2 = Math.min;
	var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

	// `Array.prototype.splice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.splice
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 || !USES_TO_LENGTH$9 }, {
	  splice: function splice(start, deleteCount /* , ...items */) {
	    var O = toObject(this);
	    var len = toLength(O.length);
	    var actualStart = toAbsoluteIndex(start, len);
	    var argumentsLength = arguments.length;
	    var insertCount, actualDeleteCount, A, k, from, to;
	    if (argumentsLength === 0) {
	      insertCount = actualDeleteCount = 0;
	    } else if (argumentsLength === 1) {
	      insertCount = 0;
	      actualDeleteCount = len - actualStart;
	    } else {
	      insertCount = argumentsLength - 2;
	      actualDeleteCount = min$2(max$2(toInteger(deleteCount), 0), len - actualStart);
	    }
	    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER$1) {
	      throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
	    }
	    A = arraySpeciesCreate(O, actualDeleteCount);
	    for (k = 0; k < actualDeleteCount; k++) {
	      from = actualStart + k;
	      if (from in O) createProperty(A, k, O[from]);
	    }
	    A.length = actualDeleteCount;
	    if (insertCount < actualDeleteCount) {
	      for (k = actualStart; k < len - actualDeleteCount; k++) {
	        from = k + actualDeleteCount;
	        to = k + insertCount;
	        if (from in O) O[to] = O[from];
	        else delete O[to];
	      }
	      for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
	    } else if (insertCount > actualDeleteCount) {
	      for (k = len - actualDeleteCount; k > actualStart; k--) {
	        from = k + actualDeleteCount - 1;
	        to = k + insertCount - 1;
	        if (from in O) O[to] = O[from];
	        else delete O[to];
	      }
	    }
	    for (k = 0; k < insertCount; k++) {
	      O[k + actualStart] = arguments[k + 2];
	    }
	    O.length = len - actualDeleteCount + insertCount;
	    return A;
	  }
	});

	var arrayBufferNative = typeof ArrayBuffer !== 'undefined' && typeof DataView !== 'undefined';

	var redefineAll = function (target, src, options) {
	  for (var key in src) redefine(target, key, src[key], options);
	  return target;
	};

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  } return it;
	};

	// `ToIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-toindex
	var toIndex = function (it) {
	  if (it === undefined) return 0;
	  var number = toInteger(it);
	  var length = toLength(number);
	  if (number !== length) throw RangeError('Wrong length or index');
	  return length;
	};

	// IEEE754 conversions based on https://github.com/feross/ieee754
	// eslint-disable-next-line no-shadow-restricted-names
	var Infinity = 1 / 0;
	var abs = Math.abs;
	var pow = Math.pow;
	var floor$1 = Math.floor;
	var log = Math.log;
	var LN2 = Math.LN2;

	var pack = function (number, mantissaLength, bytes) {
	  var buffer = new Array(bytes);
	  var exponentLength = bytes * 8 - mantissaLength - 1;
	  var eMax = (1 << exponentLength) - 1;
	  var eBias = eMax >> 1;
	  var rt = mantissaLength === 23 ? pow(2, -24) - pow(2, -77) : 0;
	  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
	  var index = 0;
	  var exponent, mantissa, c;
	  number = abs(number);
	  // eslint-disable-next-line no-self-compare
	  if (number != number || number === Infinity) {
	    // eslint-disable-next-line no-self-compare
	    mantissa = number != number ? 1 : 0;
	    exponent = eMax;
	  } else {
	    exponent = floor$1(log(number) / LN2);
	    if (number * (c = pow(2, -exponent)) < 1) {
	      exponent--;
	      c *= 2;
	    }
	    if (exponent + eBias >= 1) {
	      number += rt / c;
	    } else {
	      number += rt * pow(2, 1 - eBias);
	    }
	    if (number * c >= 2) {
	      exponent++;
	      c /= 2;
	    }
	    if (exponent + eBias >= eMax) {
	      mantissa = 0;
	      exponent = eMax;
	    } else if (exponent + eBias >= 1) {
	      mantissa = (number * c - 1) * pow(2, mantissaLength);
	      exponent = exponent + eBias;
	    } else {
	      mantissa = number * pow(2, eBias - 1) * pow(2, mantissaLength);
	      exponent = 0;
	    }
	  }
	  for (; mantissaLength >= 8; buffer[index++] = mantissa & 255, mantissa /= 256, mantissaLength -= 8);
	  exponent = exponent << mantissaLength | mantissa;
	  exponentLength += mantissaLength;
	  for (; exponentLength > 0; buffer[index++] = exponent & 255, exponent /= 256, exponentLength -= 8);
	  buffer[--index] |= sign * 128;
	  return buffer;
	};

	var unpack = function (buffer, mantissaLength) {
	  var bytes = buffer.length;
	  var exponentLength = bytes * 8 - mantissaLength - 1;
	  var eMax = (1 << exponentLength) - 1;
	  var eBias = eMax >> 1;
	  var nBits = exponentLength - 7;
	  var index = bytes - 1;
	  var sign = buffer[index--];
	  var exponent = sign & 127;
	  var mantissa;
	  sign >>= 7;
	  for (; nBits > 0; exponent = exponent * 256 + buffer[index], index--, nBits -= 8);
	  mantissa = exponent & (1 << -nBits) - 1;
	  exponent >>= -nBits;
	  nBits += mantissaLength;
	  for (; nBits > 0; mantissa = mantissa * 256 + buffer[index], index--, nBits -= 8);
	  if (exponent === 0) {
	    exponent = 1 - eBias;
	  } else if (exponent === eMax) {
	    return mantissa ? NaN : sign ? -Infinity : Infinity;
	  } else {
	    mantissa = mantissa + pow(2, mantissaLength);
	    exponent = exponent - eBias;
	  } return (sign ? -1 : 1) * mantissa * pow(2, exponent - mantissaLength);
	};

	var ieee754 = {
	  pack: pack,
	  unpack: unpack
	};

	var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	var defineProperty$4 = objectDefineProperty.f;




	var getInternalState$2 = internalState.get;
	var setInternalState$2 = internalState.set;
	var ARRAY_BUFFER = 'ArrayBuffer';
	var DATA_VIEW = 'DataView';
	var PROTOTYPE$2 = 'prototype';
	var WRONG_LENGTH = 'Wrong length';
	var WRONG_INDEX = 'Wrong index';
	var NativeArrayBuffer = global_1[ARRAY_BUFFER];
	var $ArrayBuffer = NativeArrayBuffer;
	var $DataView = global_1[DATA_VIEW];
	var $DataViewPrototype = $DataView && $DataView[PROTOTYPE$2];
	var ObjectPrototype$2 = Object.prototype;
	var RangeError$1 = global_1.RangeError;

	var packIEEE754 = ieee754.pack;
	var unpackIEEE754 = ieee754.unpack;

	var packInt8 = function (number) {
	  return [number & 0xFF];
	};

	var packInt16 = function (number) {
	  return [number & 0xFF, number >> 8 & 0xFF];
	};

	var packInt32 = function (number) {
	  return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
	};

	var unpackInt32 = function (buffer) {
	  return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
	};

	var packFloat32 = function (number) {
	  return packIEEE754(number, 23, 4);
	};

	var packFloat64 = function (number) {
	  return packIEEE754(number, 52, 8);
	};

	var addGetter = function (Constructor, key) {
	  defineProperty$4(Constructor[PROTOTYPE$2], key, { get: function () { return getInternalState$2(this)[key]; } });
	};

	var get$1 = function (view, count, index, isLittleEndian) {
	  var intIndex = toIndex(index);
	  var store = getInternalState$2(view);
	  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
	  var bytes = getInternalState$2(store.buffer).bytes;
	  var start = intIndex + store.byteOffset;
	  var pack = bytes.slice(start, start + count);
	  return isLittleEndian ? pack : pack.reverse();
	};

	var set$1 = function (view, count, index, conversion, value, isLittleEndian) {
	  var intIndex = toIndex(index);
	  var store = getInternalState$2(view);
	  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
	  var bytes = getInternalState$2(store.buffer).bytes;
	  var start = intIndex + store.byteOffset;
	  var pack = conversion(+value);
	  for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
	};

	if (!arrayBufferNative) {
	  $ArrayBuffer = function ArrayBuffer(length) {
	    anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
	    var byteLength = toIndex(length);
	    setInternalState$2(this, {
	      bytes: arrayFill.call(new Array(byteLength), 0),
	      byteLength: byteLength
	    });
	    if (!descriptors) this.byteLength = byteLength;
	  };

	  $DataView = function DataView(buffer, byteOffset, byteLength) {
	    anInstance(this, $DataView, DATA_VIEW);
	    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
	    var bufferLength = getInternalState$2(buffer).byteLength;
	    var offset = toInteger(byteOffset);
	    if (offset < 0 || offset > bufferLength) throw RangeError$1('Wrong offset');
	    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
	    if (offset + byteLength > bufferLength) throw RangeError$1(WRONG_LENGTH);
	    setInternalState$2(this, {
	      buffer: buffer,
	      byteLength: byteLength,
	      byteOffset: offset
	    });
	    if (!descriptors) {
	      this.buffer = buffer;
	      this.byteLength = byteLength;
	      this.byteOffset = offset;
	    }
	  };

	  if (descriptors) {
	    addGetter($ArrayBuffer, 'byteLength');
	    addGetter($DataView, 'buffer');
	    addGetter($DataView, 'byteLength');
	    addGetter($DataView, 'byteOffset');
	  }

	  redefineAll($DataView[PROTOTYPE$2], {
	    getInt8: function getInt8(byteOffset) {
	      return get$1(this, 1, byteOffset)[0] << 24 >> 24;
	    },
	    getUint8: function getUint8(byteOffset) {
	      return get$1(this, 1, byteOffset)[0];
	    },
	    getInt16: function getInt16(byteOffset /* , littleEndian */) {
	      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
	      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
	    },
	    getUint16: function getUint16(byteOffset /* , littleEndian */) {
	      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
	      return bytes[1] << 8 | bytes[0];
	    },
	    getInt32: function getInt32(byteOffset /* , littleEndian */) {
	      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined));
	    },
	    getUint32: function getUint32(byteOffset /* , littleEndian */) {
	      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined)) >>> 0;
	    },
	    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
	      return unpackIEEE754(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 23);
	    },
	    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
	      return unpackIEEE754(get$1(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 52);
	    },
	    setInt8: function setInt8(byteOffset, value) {
	      set$1(this, 1, byteOffset, packInt8, value);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      set$1(this, 1, byteOffset, packInt8, value);
	    },
	    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
	      set$1(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
	      set$1(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
	      set$1(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
	      set$1(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
	      set$1(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
	      set$1(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : undefined);
	    }
	  });
	} else {
	  if (!fails(function () {
	    NativeArrayBuffer(1);
	  }) || !fails(function () {
	    new NativeArrayBuffer(-1); // eslint-disable-line no-new
	  }) || fails(function () {
	    new NativeArrayBuffer(); // eslint-disable-line no-new
	    new NativeArrayBuffer(1.5); // eslint-disable-line no-new
	    new NativeArrayBuffer(NaN); // eslint-disable-line no-new
	    return NativeArrayBuffer.name != ARRAY_BUFFER;
	  })) {
	    $ArrayBuffer = function ArrayBuffer(length) {
	      anInstance(this, $ArrayBuffer);
	      return new NativeArrayBuffer(toIndex(length));
	    };
	    var ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE$2] = NativeArrayBuffer[PROTOTYPE$2];
	    for (var keys$1 = getOwnPropertyNames(NativeArrayBuffer), j = 0, key; keys$1.length > j;) {
	      if (!((key = keys$1[j++]) in $ArrayBuffer)) {
	        createNonEnumerableProperty($ArrayBuffer, key, NativeArrayBuffer[key]);
	      }
	    }
	    ArrayBufferPrototype.constructor = $ArrayBuffer;
	  }

	  // WebKit bug - the same parent prototype for typed arrays and data view
	  if (objectSetPrototypeOf && objectGetPrototypeOf($DataViewPrototype) !== ObjectPrototype$2) {
	    objectSetPrototypeOf($DataViewPrototype, ObjectPrototype$2);
	  }

	  // iOS Safari 7.x bug
	  var testView = new $DataView(new $ArrayBuffer(2));
	  var nativeSetInt8 = $DataViewPrototype.setInt8;
	  testView.setInt8(0, 2147483648);
	  testView.setInt8(1, 2147483649);
	  if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll($DataViewPrototype, {
	    setInt8: function setInt8(byteOffset, value) {
	      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
	    }
	  }, { unsafe: true });
	}

	setToStringTag($ArrayBuffer, ARRAY_BUFFER);
	setToStringTag($DataView, DATA_VIEW);

	var arrayBuffer = {
	  ArrayBuffer: $ArrayBuffer,
	  DataView: $DataView
	};

	var SPECIES$3 = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;

	  if (descriptors && Constructor && !Constructor[SPECIES$3]) {
	    defineProperty(Constructor, SPECIES$3, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	var ARRAY_BUFFER$1 = 'ArrayBuffer';
	var ArrayBuffer$1 = arrayBuffer[ARRAY_BUFFER$1];
	var NativeArrayBuffer$1 = global_1[ARRAY_BUFFER$1];

	// `ArrayBuffer` constructor
	// https://tc39.github.io/ecma262/#sec-arraybuffer-constructor
	_export({ global: true, forced: NativeArrayBuffer$1 !== ArrayBuffer$1 }, {
	  ArrayBuffer: ArrayBuffer$1
	});

	setSpecies(ARRAY_BUFFER$1);

	var SPECIES$4 = wellKnownSymbol('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor
	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$4]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var ArrayBuffer$2 = arrayBuffer.ArrayBuffer;
	var DataView$1 = arrayBuffer.DataView;
	var nativeArrayBufferSlice = ArrayBuffer$2.prototype.slice;

	var INCORRECT_SLICE = fails(function () {
	  return !new ArrayBuffer$2(2).slice(1, undefined).byteLength;
	});

	// `ArrayBuffer.prototype.slice` method
	// https://tc39.github.io/ecma262/#sec-arraybuffer.prototype.slice
	_export({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
	  slice: function slice(start, end) {
	    if (nativeArrayBufferSlice !== undefined && end === undefined) {
	      return nativeArrayBufferSlice.call(anObject(this), start); // FF fix
	    }
	    var length = anObject(this).byteLength;
	    var first = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    var result = new (speciesConstructor(this, ArrayBuffer$2))(toLength(fin - first));
	    var viewSource = new DataView$1(this);
	    var viewTarget = new DataView$1(result);
	    var index = 0;
	    while (first < fin) {
	      viewTarget.setUint8(index++, viewSource.getUint8(first++));
	    } return result;
	  }
	});

	var DatePrototype = Date.prototype;
	var INVALID_DATE = 'Invalid Date';
	var TO_STRING = 'toString';
	var nativeDateToString = DatePrototype[TO_STRING];
	var getTime = DatePrototype.getTime;

	// `Date.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-date.prototype.tostring
	if (new Date(NaN) + '' != INVALID_DATE) {
	  redefine(DatePrototype, TO_STRING, function toString() {
	    var value = getTime.call(this);
	    // eslint-disable-next-line no-self-compare
	    return value === value ? nativeDateToString.call(this) : INVALID_DATE;
	  });
	}

	var slice = [].slice;
	var factories = {};

	var construct = function (C, argsLength, args) {
	  if (!(argsLength in factories)) {
	    for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
	    // eslint-disable-next-line no-new-func
	    factories[argsLength] = Function('C,a', 'return new C(' + list.join(',') + ')');
	  } return factories[argsLength](C, args);
	};

	// `Function.prototype.bind` method implementation
	// https://tc39.github.io/ecma262/#sec-function.prototype.bind
	var functionBind = Function.bind || function bind(that /* , ...args */) {
	  var fn = aFunction$1(this);
	  var partArgs = slice.call(arguments, 1);
	  var boundFunction = function bound(/* args... */) {
	    var args = partArgs.concat(slice.call(arguments));
	    return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
	  };
	  if (isObject(fn.prototype)) boundFunction.prototype = fn.prototype;
	  return boundFunction;
	};

	// `Function.prototype.bind` method
	// https://tc39.github.io/ecma262/#sec-function.prototype.bind
	_export({ target: 'Function', proto: true }, {
	  bind: functionBind
	});

	var defineProperty$5 = objectDefineProperty.f;

	var FunctionPrototype = Function.prototype;
	var FunctionPrototypeToString = FunctionPrototype.toString;
	var nameRE = /^\s*function ([^ (]*)/;
	var NAME = 'name';

	// Function instances `.name` property
	// https://tc39.github.io/ecma262/#sec-function-instances-name
	if (descriptors && !(NAME in FunctionPrototype)) {
	  defineProperty$5(FunctionPrototype, NAME, {
	    configurable: true,
	    get: function () {
	      try {
	        return FunctionPrototypeToString.call(this).match(nameRE)[1];
	      } catch (error) {
	        return '';
	      }
	    }
	  });
	}

	// JSON[@@toStringTag] property
	// https://tc39.github.io/ecma262/#sec-json-@@tostringtag
	setToStringTag(global_1.JSON, 'JSON', true);

	// Math[@@toStringTag] property
	// https://tc39.github.io/ecma262/#sec-math-@@tostringtag
	setToStringTag(Math, 'Math', true);

	// makes subclassing work correct for wrapped built-ins
	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if (
	    // it can work only with native `setPrototypeOf`
	    objectSetPrototypeOf &&
	    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	    typeof (NewTarget = dummy.constructor) == 'function' &&
	    NewTarget !== Wrapper &&
	    isObject(NewTargetPrototype = NewTarget.prototype) &&
	    NewTargetPrototype !== Wrapper.prototype
	  ) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	// a string of all valid unicode whitespaces
	// eslint-disable-next-line max-len
	var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var whitespace = '[' + whitespaces + ']';
	var ltrim = RegExp('^' + whitespace + whitespace + '*');
	var rtrim = RegExp(whitespace + whitespace + '*$');

	// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
	var createMethod$3 = function (TYPE) {
	  return function ($this) {
	    var string = String(requireObjectCoercible($this));
	    if (TYPE & 1) string = string.replace(ltrim, '');
	    if (TYPE & 2) string = string.replace(rtrim, '');
	    return string;
	  };
	};

	var stringTrim = {
	  // `String.prototype.{ trimLeft, trimStart }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
	  start: createMethod$3(1),
	  // `String.prototype.{ trimRight, trimEnd }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
	  end: createMethod$3(2),
	  // `String.prototype.trim` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
	  trim: createMethod$3(3)
	};

	var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
	var defineProperty$6 = objectDefineProperty.f;
	var trim = stringTrim.trim;

	var NUMBER = 'Number';
	var NativeNumber = global_1[NUMBER];
	var NumberPrototype = NativeNumber.prototype;

	// Opera ~12 has broken Object#toString
	var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER;

	// `ToNumber` abstract operation
	// https://tc39.github.io/ecma262/#sec-tonumber
	var toNumber = function (argument) {
	  var it = toPrimitive(argument, false);
	  var first, third, radix, maxCode, digits, length, index, code;
	  if (typeof it == 'string' && it.length > 2) {
	    it = trim(it);
	    first = it.charCodeAt(0);
	    if (first === 43 || first === 45) {
	      third = it.charCodeAt(2);
	      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
	    } else if (first === 48) {
	      switch (it.charCodeAt(1)) {
	        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal of /^0b[01]+$/i
	        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal of /^0o[0-7]+$/i
	        default: return +it;
	      }
	      digits = it.slice(2);
	      length = digits.length;
	      for (index = 0; index < length; index++) {
	        code = digits.charCodeAt(index);
	        // parseInt parses a string to a first unavailable symbol
	        // but ToNumber should return NaN if a string contains unavailable symbols
	        if (code < 48 || code > maxCode) return NaN;
	      } return parseInt(digits, radix);
	    }
	  } return +it;
	};

	// `Number` constructor
	// https://tc39.github.io/ecma262/#sec-number-constructor
	if (isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
	  var NumberWrapper = function Number(value) {
	    var it = arguments.length < 1 ? 0 : value;
	    var dummy = this;
	    return dummy instanceof NumberWrapper
	      // check on 1..constructor(foo) case
	      && (BROKEN_CLASSOF ? fails(function () { NumberPrototype.valueOf.call(dummy); }) : classofRaw(dummy) != NUMBER)
	        ? inheritIfRequired(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
	  };
	  for (var keys$2 = descriptors ? getOwnPropertyNames$1(NativeNumber) : (
	    // ES3:
	    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	    // ES2015 (in case, if modules with ES2015 Number statics required before):
	    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
	    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
	  ).split(','), j$1 = 0, key$1; keys$2.length > j$1; j$1++) {
	    if (has(NativeNumber, key$1 = keys$2[j$1]) && !has(NumberWrapper, key$1)) {
	      defineProperty$6(NumberWrapper, key$1, getOwnPropertyDescriptor$2(NativeNumber, key$1));
	    }
	  }
	  NumberWrapper.prototype = NumberPrototype;
	  NumberPrototype.constructor = NumberWrapper;
	  redefine(global_1, NUMBER, NumberWrapper);
	}

	var nativeAssign = Object.assign;
	var defineProperty$7 = Object.defineProperty;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	var objectAssign = !nativeAssign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (descriptors && nativeAssign({ b: 1 }, nativeAssign(defineProperty$7({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$7(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) return true;
	  // should work with symbols and should have deterministic property order (V8 bug)
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var symbol = Symbol();
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
	  while (argumentsLength > index) {
	    var S = indexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
	    }
	  } return T;
	} : nativeAssign;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	_export({ target: 'Object', stat: true, forced: Object.assign !== objectAssign }, {
	  assign: objectAssign
	});

	// `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create
	_export({ target: 'Object', stat: true, sham: !descriptors }, {
	  create: objectCreate
	});

	// `Object.defineProperties` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperties
	_export({ target: 'Object', stat: true, forced: !descriptors, sham: !descriptors }, {
	  defineProperties: objectDefineProperties
	});

	// `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty
	_export({ target: 'Object', stat: true, forced: !descriptors, sham: !descriptors }, {
	  defineProperty: objectDefineProperty.f
	});

	var nativeGetOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;


	var FAILS_ON_PRIMITIVES = fails(function () { nativeGetOwnPropertyDescriptor$2(1); });
	var FORCED$2 = !descriptors || FAILS_ON_PRIMITIVES;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
	_export({ target: 'Object', stat: true, forced: FORCED$2, sham: !descriptors }, {
	  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
	    return nativeGetOwnPropertyDescriptor$2(toIndexedObject(it), key);
	  }
	});

	// `Object.getOwnPropertyDescriptors` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
	_export({ target: 'Object', stat: true, sham: !descriptors }, {
	  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
	    var O = toIndexedObject(object);
	    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	    var keys = ownKeys(O);
	    var result = {};
	    var index = 0;
	    var key, descriptor;
	    while (keys.length > index) {
	      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
	      if (descriptor !== undefined) createProperty(result, key, descriptor);
	    }
	    return result;
	  }
	});

	var nativeGetOwnPropertyNames$2 = objectGetOwnPropertyNamesExternal.f;

	var FAILS_ON_PRIMITIVES$1 = fails(function () { return !Object.getOwnPropertyNames(1); });

	// `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$1 }, {
	  getOwnPropertyNames: nativeGetOwnPropertyNames$2
	});

	var FAILS_ON_PRIMITIVES$2 = fails(function () { objectGetPrototypeOf(1); });

	// `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$2, sham: !correctPrototypeGetter }, {
	  getPrototypeOf: function getPrototypeOf(it) {
	    return objectGetPrototypeOf(toObject(it));
	  }
	});

	var FAILS_ON_PRIMITIVES$3 = fails(function () { objectKeys(1); });

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$3 }, {
	  keys: function keys(it) {
	    return objectKeys(toObject(it));
	  }
	});

	// `Object.setPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
	_export({ target: 'Object', stat: true }, {
	  setPrototypeOf: objectSetPrototypeOf
	});

	// `Object.prototype.toString` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	// `Object.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	if (!toStringTagSupport) {
	  redefine(Object.prototype, 'toString', objectToString, { unsafe: true });
	}

	var propertyIsEnumerable = objectPropertyIsEnumerable.f;

	// `Object.{ entries, values }` methods implementation
	var createMethod$4 = function (TO_ENTRIES) {
	  return function (it) {
	    var O = toIndexedObject(it);
	    var keys = objectKeys(O);
	    var length = keys.length;
	    var i = 0;
	    var result = [];
	    var key;
	    while (length > i) {
	      key = keys[i++];
	      if (!descriptors || propertyIsEnumerable.call(O, key)) {
	        result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
	      }
	    }
	    return result;
	  };
	};

	var objectToArray = {
	  // `Object.entries` method
	  // https://tc39.github.io/ecma262/#sec-object.entries
	  entries: createMethod$4(true),
	  // `Object.values` method
	  // https://tc39.github.io/ecma262/#sec-object.values
	  values: createMethod$4(false)
	};

	var $values = objectToArray.values;

	// `Object.values` method
	// https://tc39.github.io/ecma262/#sec-object.values
	_export({ target: 'Object', stat: true }, {
	  values: function values(O) {
	    return $values(O);
	  }
	});

	var trim$1 = stringTrim.trim;


	var $parseInt = global_1.parseInt;
	var hex = /^[+-]?0[Xx]/;
	var FORCED$3 = $parseInt(whitespaces + '08') !== 8 || $parseInt(whitespaces + '0x16') !== 22;

	// `parseInt` method
	// https://tc39.github.io/ecma262/#sec-parseint-string-radix
	var numberParseInt = FORCED$3 ? function parseInt(string, radix) {
	  var S = trim$1(String(string));
	  return $parseInt(S, (radix >>> 0) || (hex.test(S) ? 16 : 10));
	} : $parseInt;

	// `parseInt` method
	// https://tc39.github.io/ecma262/#sec-parseint-string-radix
	_export({ global: true, forced: parseInt != numberParseInt }, {
	  parseInt: numberParseInt
	});

	var nativePromiseConstructor = global_1.Promise;

	var iterate_1 = createCommonjsModule(function (module) {
	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
	  var boundFunction = functionBindContext(fn, that, AS_ENTRIES ? 2 : 1);
	  var iterator, iterFn, index, length, result, next, step;

	  if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
	    // optimisation for array iterators
	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = toLength(iterable.length); length > index; index++) {
	        result = AS_ENTRIES
	          ? boundFunction(anObject(step = iterable[index])[0], step[1])
	          : boundFunction(iterable[index]);
	        if (result && result instanceof Result) return result;
	      } return new Result(false);
	    }
	    iterator = iterFn.call(iterable);
	  }

	  next = iterator.next;
	  while (!(step = next.call(iterator)).done) {
	    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
	    if (typeof result == 'object' && result && result instanceof Result) return result;
	  } return new Result(false);
	};

	iterate.stop = function (result) {
	  return new Result(true, result);
	};
	});

	var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

	var location = global_1.location;
	var set$2 = global_1.setImmediate;
	var clear = global_1.clearImmediate;
	var process$1 = global_1.process;
	var MessageChannel = global_1.MessageChannel;
	var Dispatch = global_1.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;

	var run = function (id) {
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};

	var runner = function (id) {
	  return function () {
	    run(id);
	  };
	};

	var listener = function (event) {
	  run(event.data);
	};

	var post = function (id) {
	  // old engines have not location.origin
	  global_1.postMessage(id + '', location.protocol + '//' + location.host);
	};

	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!set$2 || !clear) {
	  set$2 = function setImmediate(fn) {
	    var args = [];
	    var i = 1;
	    while (arguments.length > i) args.push(arguments[i++]);
	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clear = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (classofRaw(process$1) == 'process') {
	    defer = function (id) {
	      process$1.nextTick(runner(id));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(runner(id));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  // except iOS - https://github.com/zloirock/core-js/issues/624
	  } else if (MessageChannel && !engineIsIos) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = functionBindContext(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (
	    global_1.addEventListener &&
	    typeof postMessage == 'function' &&
	    !global_1.importScripts &&
	    !fails(post) &&
	    location.protocol !== 'file:'
	  ) {
	    defer = post;
	    global_1.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
	    defer = function (id) {
	      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(runner(id), 0);
	    };
	  }
	}

	var task = {
	  set: set$2,
	  clear: clear
	};

	var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;

	var macrotask = task.set;


	var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
	var process$2 = global_1.process;
	var Promise$1 = global_1.Promise;
	var IS_NODE = classofRaw(process$2) == 'process';
	// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
	var queueMicrotaskDescriptor = getOwnPropertyDescriptor$3(global_1, 'queueMicrotask');
	var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

	var flush, head, last, notify, toggle, node, promise, then;

	// modern engines have queueMicrotask method
	if (!queueMicrotask) {
	  flush = function () {
	    var parent, fn;
	    if (IS_NODE && (parent = process$2.domain)) parent.exit();
	    while (head) {
	      fn = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch (error) {
	        if (head) notify();
	        else last = undefined;
	        throw error;
	      }
	    } last = undefined;
	    if (parent) parent.enter();
	  };

	  // Node.js
	  if (IS_NODE) {
	    notify = function () {
	      process$2.nextTick(flush);
	    };
	  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
	  } else if (MutationObserver && !engineIsIos) {
	    toggle = true;
	    node = document.createTextNode('');
	    new MutationObserver(flush).observe(node, { characterData: true });
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    promise = Promise$1.resolve(undefined);
	    then = promise.then;
	    notify = function () {
	      then.call(promise, flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global_1, flush);
	    };
	  }
	}

	var microtask = queueMicrotask || function (fn) {
	  var task = { fn: fn, next: undefined };
	  if (last) last.next = task;
	  if (!head) {
	    head = task;
	    notify();
	  } last = task;
	};

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction$1(resolve);
	  this.reject = aFunction$1(reject);
	};

	// 25.4.1.5 NewPromiseCapability(C)
	var f$7 = function (C) {
	  return new PromiseCapability(C);
	};

	var newPromiseCapability = {
		f: f$7
	};

	var promiseResolve = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var hostReportErrors = function (a, b) {
	  var console = global_1.console;
	  if (console && console.error) {
	    arguments.length === 1 ? console.error(a) : console.error(a, b);
	  }
	};

	var perform = function (exec) {
	  try {
	    return { error: false, value: exec() };
	  } catch (error) {
	    return { error: true, value: error };
	  }
	};

	var task$1 = task.set;










	var SPECIES$5 = wellKnownSymbol('species');
	var PROMISE = 'Promise';
	var getInternalState$3 = internalState.get;
	var setInternalState$3 = internalState.set;
	var getInternalPromiseState = internalState.getterFor(PROMISE);
	var PromiseConstructor = nativePromiseConstructor;
	var TypeError$1 = global_1.TypeError;
	var document$2 = global_1.document;
	var process$3 = global_1.process;
	var $fetch = getBuiltIn('fetch');
	var newPromiseCapability$1 = newPromiseCapability.f;
	var newGenericPromiseCapability = newPromiseCapability$1;
	var IS_NODE$1 = classofRaw(process$3) == 'process';
	var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;
	var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

	var FORCED$4 = isForced_1(PROMISE, function () {
	  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
	  if (!GLOBAL_CORE_JS_PROMISE) {
	    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	    // We can't detect it synchronously, so just check versions
	    if (engineV8Version === 66) return true;
	    // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
	  }
	  // We can't use @@species feature detection in V8 since it causes
	  // deoptimization and performance degradation
	  // https://github.com/zloirock/core-js/issues/679
	  if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false;
	  // Detect correctness of subclassing with @@species support
	  var promise = PromiseConstructor.resolve(1);
	  var FakePromise = function (exec) {
	    exec(function () { /* empty */ }, function () { /* empty */ });
	  };
	  var constructor = promise.constructor = {};
	  constructor[SPECIES$5] = FakePromise;
	  return !(promise.then(function () { /* empty */ }) instanceof FakePromise);
	});

	var INCORRECT_ITERATION$1 = FORCED$4 || !checkCorrectnessOfIteration(function (iterable) {
	  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
	});

	// helpers
	var isThenable = function (it) {
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};

	var notify$1 = function (promise, state, isReject) {
	  if (state.notified) return;
	  state.notified = true;
	  var chain = state.reactions;
	  microtask(function () {
	    var value = state.value;
	    var ok = state.state == FULFILLED;
	    var index = 0;
	    // variable length - can't use forEach
	    while (chain.length > index) {
	      var reaction = chain[index++];
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
	            state.rejection = HANDLED;
	          }
	          if (handler === true) result = value;
	          else {
	            if (domain) domain.enter();
	            result = handler(value); // can throw
	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }
	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (error) {
	        if (domain && !exited) domain.exit();
	        reject(error);
	      }
	    }
	    state.reactions = [];
	    state.notified = false;
	    if (isReject && !state.rejection) onUnhandled(promise, state);
	  });
	};

	var dispatchEvent = function (name, promise, reason) {
	  var event, handler;
	  if (DISPATCH_EVENT) {
	    event = document$2.createEvent('Event');
	    event.promise = promise;
	    event.reason = reason;
	    event.initEvent(name, false, true);
	    global_1.dispatchEvent(event);
	  } else event = { promise: promise, reason: reason };
	  if (handler = global_1['on' + name]) handler(event);
	  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
	};

	var onUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;
	    if (IS_UNHANDLED) {
	      result = perform(function () {
	        if (IS_NODE$1) {
	          process$3.emit('unhandledRejection', value, promise);
	        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) throw result.value;
	    }
	  });
	};

	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};

	var onHandleUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    if (IS_NODE$1) {
	      process$3.emit('rejectionHandled', promise);
	    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
	  });
	};

	var bind = function (fn, promise, state, unwrap) {
	  return function (value) {
	    fn(promise, state, value, unwrap);
	  };
	};

	var internalReject = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  state.value = value;
	  state.state = REJECTED;
	  notify$1(promise, state, true);
	};

	var internalResolve = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  try {
	    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
	    var then = isThenable(value);
	    if (then) {
	      microtask(function () {
	        var wrapper = { done: false };
	        try {
	          then.call(value,
	            bind(internalResolve, promise, wrapper, state),
	            bind(internalReject, promise, wrapper, state)
	          );
	        } catch (error) {
	          internalReject(promise, wrapper, error, state);
	        }
	      });
	    } else {
	      state.value = value;
	      state.state = FULFILLED;
	      notify$1(promise, state, false);
	    }
	  } catch (error) {
	    internalReject(promise, { done: false }, error, state);
	  }
	};

	// constructor polyfill
	if (FORCED$4) {
	  // 25.4.3.1 Promise(executor)
	  PromiseConstructor = function Promise(executor) {
	    anInstance(this, PromiseConstructor, PROMISE);
	    aFunction$1(executor);
	    Internal.call(this);
	    var state = getInternalState$3(this);
	    try {
	      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
	    } catch (error) {
	      internalReject(this, state, error);
	    }
	  };
	  // eslint-disable-next-line no-unused-vars
	  Internal = function Promise(executor) {
	    setInternalState$3(this, {
	      type: PROMISE,
	      done: false,
	      notified: false,
	      parent: false,
	      reactions: [],
	      rejection: false,
	      state: PENDING,
	      value: undefined
	    });
	  };
	  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
	    // `Promise.prototype.then` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.then
	    then: function then(onFulfilled, onRejected) {
	      var state = getInternalPromiseState(this);
	      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = IS_NODE$1 ? process$3.domain : undefined;
	      state.parent = true;
	      state.reactions.push(reaction);
	      if (state.state != PENDING) notify$1(this, state, false);
	      return reaction.promise;
	    },
	    // `Promise.prototype.catch` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    var state = getInternalState$3(promise);
	    this.promise = promise;
	    this.resolve = bind(internalResolve, promise, state);
	    this.reject = bind(internalReject, promise, state);
	  };
	  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };

	  if ( typeof nativePromiseConstructor == 'function') {
	    nativeThen = nativePromiseConstructor.prototype.then;

	    // wrap native Promise#then for native async functions
	    redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
	      var that = this;
	      return new PromiseConstructor(function (resolve, reject) {
	        nativeThen.call(that, resolve, reject);
	      }).then(onFulfilled, onRejected);
	    // https://github.com/zloirock/core-js/issues/640
	    }, { unsafe: true });

	    // wrap fetch result
	    if (typeof $fetch == 'function') _export({ global: true, enumerable: true, forced: true }, {
	      // eslint-disable-next-line no-unused-vars
	      fetch: function fetch(input /* , init */) {
	        return promiseResolve(PromiseConstructor, $fetch.apply(global_1, arguments));
	      }
	    });
	  }
	}

	_export({ global: true, wrap: true, forced: FORCED$4 }, {
	  Promise: PromiseConstructor
	});

	setToStringTag(PromiseConstructor, PROMISE, false);
	setSpecies(PROMISE);

	PromiseWrapper = getBuiltIn(PROMISE);

	// statics
	_export({ target: PROMISE, stat: true, forced: FORCED$4 }, {
	  // `Promise.reject` method
	  // https://tc39.github.io/ecma262/#sec-promise.reject
	  reject: function reject(r) {
	    var capability = newPromiseCapability$1(this);
	    capability.reject.call(undefined, r);
	    return capability.promise;
	  }
	});

	_export({ target: PROMISE, stat: true, forced:  FORCED$4 }, {
	  // `Promise.resolve` method
	  // https://tc39.github.io/ecma262/#sec-promise.resolve
	  resolve: function resolve(x) {
	    return promiseResolve( this, x);
	  }
	});

	_export({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION$1 }, {
	  // `Promise.all` method
	  // https://tc39.github.io/ecma262/#sec-promise.all
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate_1(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        $promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  },
	  // `Promise.race` method
	  // https://tc39.github.io/ecma262/#sec-promise.race
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      iterate_1(iterable, function (promise) {
	        $promiseResolve.call(C, promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	var nativeApply = getBuiltIn('Reflect', 'apply');
	var functionApply = Function.apply;

	// MS Edge argumentsList argument is optional
	var OPTIONAL_ARGUMENTS_LIST = !fails(function () {
	  nativeApply(function () { /* empty */ });
	});

	// `Reflect.apply` method
	// https://tc39.github.io/ecma262/#sec-reflect.apply
	_export({ target: 'Reflect', stat: true, forced: OPTIONAL_ARGUMENTS_LIST }, {
	  apply: function apply(target, thisArgument, argumentsList) {
	    aFunction$1(target);
	    anObject(argumentsList);
	    return nativeApply
	      ? nativeApply(target, thisArgument, argumentsList)
	      : functionApply.call(target, thisArgument, argumentsList);
	  }
	});

	var nativeConstruct = getBuiltIn('Reflect', 'construct');

	// `Reflect.construct` method
	// https://tc39.github.io/ecma262/#sec-reflect.construct
	// MS Edge supports only 2 arguments and argumentsList argument is optional
	// FF Nightly sets third argument as `new.target`, but does not create `this` from it
	var NEW_TARGET_BUG = fails(function () {
	  function F() { /* empty */ }
	  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
	});
	var ARGS_BUG = !fails(function () {
	  nativeConstruct(function () { /* empty */ });
	});
	var FORCED$5 = NEW_TARGET_BUG || ARGS_BUG;

	_export({ target: 'Reflect', stat: true, forced: FORCED$5, sham: FORCED$5 }, {
	  construct: function construct(Target, args /* , newTarget */) {
	    aFunction$1(Target);
	    anObject(args);
	    var newTarget = arguments.length < 3 ? Target : aFunction$1(arguments[2]);
	    if (ARGS_BUG && !NEW_TARGET_BUG) return nativeConstruct(Target, args, newTarget);
	    if (Target == newTarget) {
	      // w/o altered newTarget, optimization for 0-4 arguments
	      switch (args.length) {
	        case 0: return new Target();
	        case 1: return new Target(args[0]);
	        case 2: return new Target(args[0], args[1]);
	        case 3: return new Target(args[0], args[1], args[2]);
	        case 4: return new Target(args[0], args[1], args[2], args[3]);
	      }
	      // w/o altered newTarget, lot of arguments case
	      var $args = [null];
	      $args.push.apply($args, args);
	      return new (functionBind.apply(Target, $args))();
	    }
	    // with altered newTarget, not support built-in constructors
	    var proto = newTarget.prototype;
	    var instance = objectCreate(isObject(proto) ? proto : Object.prototype);
	    var result = Function.apply.call(Target, instance, args);
	    return isObject(result) ? result : instance;
	  }
	});

	var MATCH = wellKnownSymbol('match');

	// `IsRegExp` abstract operation
	// https://tc39.github.io/ecma262/#sec-isregexp
	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
	};

	// `RegExp.prototype.flags` getter implementation
	// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
	var regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
	// so we use an intermediate function.
	function RE(s, f) {
	  return RegExp(s, f);
	}

	var UNSUPPORTED_Y = fails(function () {
	  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	  var re = RE('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') != null;
	});

	var BROKEN_CARET = fails(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = RE('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') != null;
	});

	var regexpStickyHelpers = {
		UNSUPPORTED_Y: UNSUPPORTED_Y,
		BROKEN_CARET: BROKEN_CARET
	};

	var defineProperty$8 = objectDefineProperty.f;
	var getOwnPropertyNames$2 = objectGetOwnPropertyNames.f;





	var setInternalState$4 = internalState.set;



	var MATCH$1 = wellKnownSymbol('match');
	var NativeRegExp = global_1.RegExp;
	var RegExpPrototype = NativeRegExp.prototype;
	var re1 = /a/g;
	var re2 = /a/g;

	// "new" should create a new object, old webkit bug
	var CORRECT_NEW = new NativeRegExp(re1) !== re1;

	var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y;

	var FORCED$6 = descriptors && isForced_1('RegExp', (!CORRECT_NEW || UNSUPPORTED_Y$1 || fails(function () {
	  re2[MATCH$1] = false;
	  // RegExp constructor can alter flags and IsRegExp works correct with @@match
	  return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
	})));

	// `RegExp` constructor
	// https://tc39.github.io/ecma262/#sec-regexp-constructor
	if (FORCED$6) {
	  var RegExpWrapper = function RegExp(pattern, flags) {
	    var thisIsRegExp = this instanceof RegExpWrapper;
	    var patternIsRegExp = isRegexp(pattern);
	    var flagsAreUndefined = flags === undefined;
	    var sticky;

	    if (!thisIsRegExp && patternIsRegExp && pattern.constructor === RegExpWrapper && flagsAreUndefined) {
	      return pattern;
	    }

	    if (CORRECT_NEW) {
	      if (patternIsRegExp && !flagsAreUndefined) pattern = pattern.source;
	    } else if (pattern instanceof RegExpWrapper) {
	      if (flagsAreUndefined) flags = regexpFlags.call(pattern);
	      pattern = pattern.source;
	    }

	    if (UNSUPPORTED_Y$1) {
	      sticky = !!flags && flags.indexOf('y') > -1;
	      if (sticky) flags = flags.replace(/y/g, '');
	    }

	    var result = inheritIfRequired(
	      CORRECT_NEW ? new NativeRegExp(pattern, flags) : NativeRegExp(pattern, flags),
	      thisIsRegExp ? this : RegExpPrototype,
	      RegExpWrapper
	    );

	    if (UNSUPPORTED_Y$1 && sticky) setInternalState$4(result, { sticky: sticky });

	    return result;
	  };
	  var proxy = function (key) {
	    key in RegExpWrapper || defineProperty$8(RegExpWrapper, key, {
	      configurable: true,
	      get: function () { return NativeRegExp[key]; },
	      set: function (it) { NativeRegExp[key] = it; }
	    });
	  };
	  var keys$3 = getOwnPropertyNames$2(NativeRegExp);
	  var index = 0;
	  while (keys$3.length > index) proxy(keys$3[index++]);
	  RegExpPrototype.constructor = RegExpWrapper;
	  RegExpWrapper.prototype = RegExpPrototype;
	  redefine(global_1, 'RegExp', RegExpWrapper);
	}

	// https://tc39.github.io/ecma262/#sec-get-regexp-@@species
	setSpecies('RegExp');

	var nativeExec = RegExp.prototype.exec;
	// This always refers to the native implementation, because the
	// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
	// which loads this file before patching the method.
	var nativeReplace = String.prototype.replace;

	var patchedExec = nativeExec;

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	})();

	var UNSUPPORTED_Y$2 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET;

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$2;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;
	    var sticky = UNSUPPORTED_Y$2 && re.sticky;
	    var flags = regexpFlags.call(re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = flags.replace('y', '');
	      if (flags.indexOf('g') === -1) {
	        flags += 'g';
	      }

	      strCopy = String(str).slice(re.lastIndex);
	      // Support anchored sticky behavior.
	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      }
	      // ^(? + rx + ) is needed, in combination with some str slicing, to
	      // simulate the 'y' flag.
	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

	    match = nativeExec.call(sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = match.input.slice(charsAdded);
	        match[0] = match[0].slice(charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    return match;
	  };
	}

	var regexpExec = patchedExec;

	_export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
	  exec: regexpExec
	});

	var UNSUPPORTED_Y$3 = regexpStickyHelpers.UNSUPPORTED_Y;

	// `RegExp.prototype.flags` getter
	// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
	if (descriptors && (/./g.flags != 'g' || UNSUPPORTED_Y$3)) {
	  objectDefineProperty.f(RegExp.prototype, 'flags', {
	    configurable: true,
	    get: regexpFlags
	  });
	}

	var TO_STRING$1 = 'toString';
	var RegExpPrototype$1 = RegExp.prototype;
	var nativeToString = RegExpPrototype$1[TO_STRING$1];

	var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
	// FF44- RegExp#toString has a wrong name
	var INCORRECT_NAME = nativeToString.name != TO_STRING$1;

	// `RegExp.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
	if (NOT_GENERIC || INCORRECT_NAME) {
	  redefine(RegExp.prototype, TO_STRING$1, function toString() {
	    var R = anObject(this);
	    var p = String(R.source);
	    var rf = R.flags;
	    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype$1) ? regexpFlags.call(R) : rf);
	    return '/' + p + '/' + f;
	  }, { unsafe: true });
	}

	var notARegexp = function (it) {
	  if (isRegexp(it)) {
	    throw TypeError("The method doesn't accept regular expressions");
	  } return it;
	};

	var MATCH$2 = wellKnownSymbol('match');

	var correctIsRegexpLogic = function (METHOD_NAME) {
	  var regexp = /./;
	  try {
	    '/./'[METHOD_NAME](regexp);
	  } catch (e) {
	    try {
	      regexp[MATCH$2] = false;
	      return '/./'[METHOD_NAME](regexp);
	    } catch (f) { /* empty */ }
	  } return false;
	};

	// `String.prototype.includes` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.includes
	_export({ target: 'String', proto: true, forced: !correctIsRegexpLogic('includes') }, {
	  includes: function includes(searchString /* , position = 0 */) {
	    return !!~String(requireObjectCoercible(this))
	      .indexOf(notARegexp(searchString), arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// `String.prototype.{ codePointAt, at }` methods implementation
	var createMethod$5 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING ? S.charAt(position) : first
	        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$5(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$5(true)
	};

	var charAt = stringMultibyte.charAt;



	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$5 = internalState.set;
	var getInternalState$4 = internalState.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState$5(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$4(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return { value: undefined, done: true };
	  point = charAt(string, index);
	  state.index += point.length;
	  return { value: point, done: false };
	});

	// TODO: Remove from `core-js@4` since it's moved to entry points







	var SPECIES$6 = wellKnownSymbol('species');

	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
	  // #replace needs built-in support for named groups.
	  // #match works fine because it just return the exec results, even if it has
	  // a "grops" property.
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  return ''.replace(re, '$<a>') !== '7';
	});

	// IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
	var REPLACE_KEEPS_$0 = (function () {
	  return 'a'.replace(/./, '$0') === '$0';
	})();

	var REPLACE = wellKnownSymbol('replace');
	// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
	  if (/./[REPLACE]) {
	    return /./[REPLACE]('a', '$0') === '';
	  }
	  return false;
	})();

	// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	// Weex JS has frozen built-in prototypes, so use try / catch wrapper
	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});

	var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
	  var SYMBOL = wellKnownSymbol(KEY);

	  var DELEGATES_TO_SYMBOL = !fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;

	    if (KEY === 'split') {
	      // We can't use real regex here since it causes deoptimization
	      // and serious performance degradation in V8
	      // https://github.com/zloirock/core-js/issues/306
	      re = {};
	      // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.
	      re.constructor = {};
	      re.constructor[SPECIES$6] = function () { return re; };
	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }

	    re.exec = function () { execCalled = true; return null; };

	    re[SYMBOL]('');
	    return !execCalled;
	  });

	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    (KEY === 'replace' && !(
	      REPLACE_SUPPORTS_NAMED_GROUPS &&
	      REPLACE_KEEPS_$0 &&
	      !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
	    )) ||
	    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
	  ) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      if (regexp.exec === regexpExec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
	        }
	        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
	      }
	      return { done: false };
	    }, {
	      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
	      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
	    });
	    var stringMethod = methods[0];
	    var regexMethod = methods[1];

	    redefine(String.prototype, KEY, stringMethod);
	    redefine(RegExp.prototype, SYMBOL, length == 2
	      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	      ? function (string, arg) { return regexMethod.call(string, this, arg); }
	      // 21.2.5.6 RegExp.prototype[@@match](string)
	      // 21.2.5.9 RegExp.prototype[@@search](string)
	      : function (string) { return regexMethod.call(string, this); }
	    );
	  }

	  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
	};

	var charAt$1 = stringMultibyte.charAt;

	// `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex
	var advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt$1(S, index).length : 1);
	};

	// `RegExpExec` abstract operation
	// https://tc39.github.io/ecma262/#sec-regexpexec
	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);
	    if (typeof result !== 'object') {
	      throw TypeError('RegExp exec method returned something other than an Object or null');
	    }
	    return result;
	  }

	  if (classofRaw(R) !== 'RegExp') {
	    throw TypeError('RegExp#exec called on incompatible receiver');
	  }

	  return regexpExec.call(R, S);
	};

	// @@match logic
	fixRegexpWellKnownSymbolLogic('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
	  return [
	    // `String.prototype.match` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.match
	    function match(regexp) {
	      var O = requireObjectCoercible(this);
	      var matcher = regexp == undefined ? undefined : regexp[MATCH];
	      return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
	    },
	    // `RegExp.prototype[@@match]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
	    function (regexp) {
	      var res = maybeCallNative(nativeMatch, regexp, this);
	      if (res.done) return res.value;

	      var rx = anObject(regexp);
	      var S = String(this);

	      if (!rx.global) return regexpExecAbstract(rx, S);

	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	      var A = [];
	      var n = 0;
	      var result;
	      while ((result = regexpExecAbstract(rx, S)) !== null) {
	        var matchStr = String(result[0]);
	        A[n] = matchStr;
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	        n++;
	      }
	      return n === 0 ? null : A;
	    }
	  ];
	});

	var max$3 = Math.max;
	var min$3 = Math.min;
	var floor$2 = Math.floor;
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	};

	// @@replace logic
	fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
	  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
	  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

	  return [
	    // `String.prototype.replace` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
	    function replace(searchValue, replaceValue) {
	      var O = requireObjectCoercible(this);
	      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
	      return replacer !== undefined
	        ? replacer.call(searchValue, O, replaceValue)
	        : nativeReplace.call(String(O), searchValue, replaceValue);
	    },
	    // `RegExp.prototype[@@replace]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
	    function (regexp, replaceValue) {
	      if (
	        (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0) ||
	        (typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1)
	      ) {
	        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
	        if (res.done) return res.value;
	      }

	      var rx = anObject(regexp);
	      var S = String(this);

	      var functionalReplace = typeof replaceValue === 'function';
	      if (!functionalReplace) replaceValue = String(replaceValue);

	      var global = rx.global;
	      if (global) {
	        var fullUnicode = rx.unicode;
	        rx.lastIndex = 0;
	      }
	      var results = [];
	      while (true) {
	        var result = regexpExecAbstract(rx, S);
	        if (result === null) break;

	        results.push(result);
	        if (!global) break;

	        var matchStr = String(result[0]);
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	      }

	      var accumulatedResult = '';
	      var nextSourcePosition = 0;
	      for (var i = 0; i < results.length; i++) {
	        result = results[i];

	        var matched = String(result[0]);
	        var position = max$3(min$3(toInteger(result.index), S.length), 0);
	        var captures = [];
	        // NOTE: This is equivalent to
	        //   captures = result.slice(1).map(maybeToString)
	        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
	        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
	        var namedCaptures = result.groups;
	        if (functionalReplace) {
	          var replacerArgs = [matched].concat(captures, position, S);
	          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
	          var replacement = String(replaceValue.apply(undefined, replacerArgs));
	        } else {
	          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	        }
	        if (position >= nextSourcePosition) {
	          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
	          nextSourcePosition = position + matched.length;
	        }
	      }
	      return accumulatedResult + S.slice(nextSourcePosition);
	    }
	  ];

	  // https://tc39.github.io/ecma262/#sec-getsubstitution
	  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
	    var tailPos = position + matched.length;
	    var m = captures.length;
	    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
	    if (namedCaptures !== undefined) {
	      namedCaptures = toObject(namedCaptures);
	      symbols = SUBSTITUTION_SYMBOLS;
	    }
	    return nativeReplace.call(replacement, symbols, function (match, ch) {
	      var capture;
	      switch (ch.charAt(0)) {
	        case '$': return '$';
	        case '&': return matched;
	        case '`': return str.slice(0, position);
	        case "'": return str.slice(tailPos);
	        case '<':
	          capture = namedCaptures[ch.slice(1, -1)];
	          break;
	        default: // \d\d?
	          var n = +ch;
	          if (n === 0) return match;
	          if (n > m) {
	            var f = floor$2(n / 10);
	            if (f === 0) return match;
	            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
	            return match;
	          }
	          capture = captures[n - 1];
	      }
	      return capture === undefined ? '' : capture;
	    });
	  }
	});

	// `SameValue` abstract operation
	// https://tc39.github.io/ecma262/#sec-samevalue
	var sameValue = Object.is || function is(x, y) {
	  // eslint-disable-next-line no-self-compare
	  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
	};

	// @@search logic
	fixRegexpWellKnownSymbolLogic('search', 1, function (SEARCH, nativeSearch, maybeCallNative) {
	  return [
	    // `String.prototype.search` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.search
	    function search(regexp) {
	      var O = requireObjectCoercible(this);
	      var searcher = regexp == undefined ? undefined : regexp[SEARCH];
	      return searcher !== undefined ? searcher.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
	    },
	    // `RegExp.prototype[@@search]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
	    function (regexp) {
	      var res = maybeCallNative(nativeSearch, regexp, this);
	      if (res.done) return res.value;

	      var rx = anObject(regexp);
	      var S = String(this);

	      var previousLastIndex = rx.lastIndex;
	      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
	      var result = regexpExecAbstract(rx, S);
	      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
	      return result === null ? -1 : result.index;
	    }
	  ];
	});

	var arrayPush = [].push;
	var min$4 = Math.min;
	var MAX_UINT32 = 0xFFFFFFFF;

	// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
	var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

	// @@split logic
	fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
	  var internalSplit;
	  if (
	    'abbc'.split(/(b)*/)[1] == 'c' ||
	    'test'.split(/(?:)/, -1).length != 4 ||
	    'ab'.split(/(?:ab)*/).length != 2 ||
	    '.'.split(/(.?)(.?)/).length != 4 ||
	    '.'.split(/()()/).length > 1 ||
	    ''.split(/.?/).length
	  ) {
	    // based on es5-shim implementation, need to rework it
	    internalSplit = function (separator, limit) {
	      var string = String(requireObjectCoercible(this));
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (separator === undefined) return [string];
	      // If `separator` is not a regex, use native split
	      if (!isRegexp(separator)) {
	        return nativeSplit.call(string, separator, lim);
	      }
	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') +
	                  (separator.multiline ? 'm' : '') +
	                  (separator.unicode ? 'u' : '') +
	                  (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0;
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var match, lastIndex, lastLength;
	      while (match = regexpExec.call(separatorCopy, string)) {
	        lastIndex = separatorCopy.lastIndex;
	        if (lastIndex > lastLastIndex) {
	          output.push(string.slice(lastLastIndex, match.index));
	          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
	          lastLength = match[0].length;
	          lastLastIndex = lastIndex;
	          if (output.length >= lim) break;
	        }
	        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
	      }
	      if (lastLastIndex === string.length) {
	        if (lastLength || !separatorCopy.test('')) output.push('');
	      } else output.push(string.slice(lastLastIndex));
	      return output.length > lim ? output.slice(0, lim) : output;
	    };
	  // Chakra, V8
	  } else if ('0'.split(undefined, 0).length) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
	    };
	  } else internalSplit = nativeSplit;

	  return [
	    // `String.prototype.split` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.split
	    function split(separator, limit) {
	      var O = requireObjectCoercible(this);
	      var splitter = separator == undefined ? undefined : separator[SPLIT];
	      return splitter !== undefined
	        ? splitter.call(separator, O, limit)
	        : internalSplit.call(String(O), separator, limit);
	    },
	    // `RegExp.prototype[@@split]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
	    //
	    // NOTE: This cannot be properly polyfilled in engines that don't support
	    // the 'y' flag.
	    function (regexp, limit) {
	      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
	      if (res.done) return res.value;

	      var rx = anObject(regexp);
	      var S = String(this);
	      var C = speciesConstructor(rx, RegExp);

	      var unicodeMatching = rx.unicode;
	      var flags = (rx.ignoreCase ? 'i' : '') +
	                  (rx.multiline ? 'm' : '') +
	                  (rx.unicode ? 'u' : '') +
	                  (SUPPORTS_Y ? 'y' : 'g');

	      // ^(? + rx + ) is needed, in combination with some S slicing, to
	      // simulate the 'y' flag.
	      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
	      var p = 0;
	      var q = 0;
	      var A = [];
	      while (q < S.length) {
	        splitter.lastIndex = SUPPORTS_Y ? q : 0;
	        var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
	        var e;
	        if (
	          z === null ||
	          (e = min$4(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
	        ) {
	          q = advanceStringIndex(S, q, unicodeMatching);
	        } else {
	          A.push(S.slice(p, q));
	          if (A.length === lim) return A;
	          for (var i = 1; i <= z.length - 1; i++) {
	            A.push(z[i]);
	            if (A.length === lim) return A;
	          }
	          q = p = e;
	        }
	      }
	      A.push(S.slice(p));
	      return A;
	    }
	  ];
	}, !SUPPORTS_Y);

	var non = '\u200B\u0085\u180E';

	// check that a method works with the correct list
	// of whitespaces and has a correct name
	var stringTrimForced = function (METHOD_NAME) {
	  return fails(function () {
	    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
	  });
	};

	var $trim = stringTrim.trim;


	// `String.prototype.trim` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.trim
	_export({ target: 'String', proto: true, forced: stringTrimForced('trim') }, {
	  trim: function trim() {
	    return $trim(this);
	  }
	});

	var quot = /"/g;

	// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
	// https://tc39.github.io/ecma262/#sec-createhtml
	var createHtml = function (string, tag, attribute, value) {
	  var S = String(requireObjectCoercible(string));
	  var p1 = '<' + tag;
	  if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
	  return p1 + '>' + S + '</' + tag + '>';
	};

	// check the existence of a method, lowercase
	// of a tag and escaping quotes in arguments
	var stringHtmlForced = function (METHOD_NAME) {
	  return fails(function () {
	    var test = ''[METHOD_NAME]('"');
	    return test !== test.toLowerCase() || test.split('"').length > 3;
	  });
	};

	// `String.prototype.fixed` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.fixed
	_export({ target: 'String', proto: true, forced: stringHtmlForced('fixed') }, {
	  fixed: function fixed() {
	    return createHtml(this, 'tt', '', '');
	  }
	});

	var defineProperty$9 = objectDefineProperty.f;





	var Int8Array$1 = global_1.Int8Array;
	var Int8ArrayPrototype = Int8Array$1 && Int8Array$1.prototype;
	var Uint8ClampedArray = global_1.Uint8ClampedArray;
	var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
	var TypedArray = Int8Array$1 && objectGetPrototypeOf(Int8Array$1);
	var TypedArrayPrototype = Int8ArrayPrototype && objectGetPrototypeOf(Int8ArrayPrototype);
	var ObjectPrototype$3 = Object.prototype;
	var isPrototypeOf = ObjectPrototype$3.isPrototypeOf;

	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
	// Fixing native typed arrays in Opera Presto crashes the browser, see #595
	var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferNative && !!objectSetPrototypeOf && classof(global_1.opera) !== 'Opera';
	var TYPED_ARRAY_TAG_REQIRED = false;
	var NAME$1;

	var TypedArrayConstructorsList = {
	  Int8Array: 1,
	  Uint8Array: 1,
	  Uint8ClampedArray: 1,
	  Int16Array: 2,
	  Uint16Array: 2,
	  Int32Array: 4,
	  Uint32Array: 4,
	  Float32Array: 4,
	  Float64Array: 8
	};

	var isView = function isView(it) {
	  var klass = classof(it);
	  return klass === 'DataView' || has(TypedArrayConstructorsList, klass);
	};

	var isTypedArray = function (it) {
	  return isObject(it) && has(TypedArrayConstructorsList, classof(it));
	};

	var aTypedArray = function (it) {
	  if (isTypedArray(it)) return it;
	  throw TypeError('Target is not a typed array');
	};

	var aTypedArrayConstructor = function (C) {
	  if (objectSetPrototypeOf) {
	    if (isPrototypeOf.call(TypedArray, C)) return C;
	  } else for (var ARRAY in TypedArrayConstructorsList) if (has(TypedArrayConstructorsList, NAME$1)) {
	    var TypedArrayConstructor = global_1[ARRAY];
	    if (TypedArrayConstructor && (C === TypedArrayConstructor || isPrototypeOf.call(TypedArrayConstructor, C))) {
	      return C;
	    }
	  } throw TypeError('Target is not a typed array constructor');
	};

	var exportTypedArrayMethod = function (KEY, property, forced) {
	  if (!descriptors) return;
	  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
	    var TypedArrayConstructor = global_1[ARRAY];
	    if (TypedArrayConstructor && has(TypedArrayConstructor.prototype, KEY)) {
	      delete TypedArrayConstructor.prototype[KEY];
	    }
	  }
	  if (!TypedArrayPrototype[KEY] || forced) {
	    redefine(TypedArrayPrototype, KEY, forced ? property
	      : NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[KEY] || property);
	  }
	};

	var exportTypedArrayStaticMethod = function (KEY, property, forced) {
	  var ARRAY, TypedArrayConstructor;
	  if (!descriptors) return;
	  if (objectSetPrototypeOf) {
	    if (forced) for (ARRAY in TypedArrayConstructorsList) {
	      TypedArrayConstructor = global_1[ARRAY];
	      if (TypedArrayConstructor && has(TypedArrayConstructor, KEY)) {
	        delete TypedArrayConstructor[KEY];
	      }
	    }
	    if (!TypedArray[KEY] || forced) {
	      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
	      try {
	        return redefine(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && Int8Array$1[KEY] || property);
	      } catch (error) { /* empty */ }
	    } else return;
	  }
	  for (ARRAY in TypedArrayConstructorsList) {
	    TypedArrayConstructor = global_1[ARRAY];
	    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
	      redefine(TypedArrayConstructor, KEY, property);
	    }
	  }
	};

	for (NAME$1 in TypedArrayConstructorsList) {
	  if (!global_1[NAME$1]) NATIVE_ARRAY_BUFFER_VIEWS = false;
	}

	// WebKit bug - typed arrays constructors prototype is Object.prototype
	if (!NATIVE_ARRAY_BUFFER_VIEWS || typeof TypedArray != 'function' || TypedArray === Function.prototype) {
	  // eslint-disable-next-line no-shadow
	  TypedArray = function TypedArray() {
	    throw TypeError('Incorrect invocation');
	  };
	  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME$1 in TypedArrayConstructorsList) {
	    if (global_1[NAME$1]) objectSetPrototypeOf(global_1[NAME$1], TypedArray);
	  }
	}

	if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype$3) {
	  TypedArrayPrototype = TypedArray.prototype;
	  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME$1 in TypedArrayConstructorsList) {
	    if (global_1[NAME$1]) objectSetPrototypeOf(global_1[NAME$1].prototype, TypedArrayPrototype);
	  }
	}

	// WebKit bug - one more object in Uint8ClampedArray prototype chain
	if (NATIVE_ARRAY_BUFFER_VIEWS && objectGetPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
	  objectSetPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
	}

	if (descriptors && !has(TypedArrayPrototype, TO_STRING_TAG$3)) {
	  TYPED_ARRAY_TAG_REQIRED = true;
	  defineProperty$9(TypedArrayPrototype, TO_STRING_TAG$3, { get: function () {
	    return isObject(this) ? this[TYPED_ARRAY_TAG] : undefined;
	  } });
	  for (NAME$1 in TypedArrayConstructorsList) if (global_1[NAME$1]) {
	    createNonEnumerableProperty(global_1[NAME$1], TYPED_ARRAY_TAG, NAME$1);
	  }
	}

	var arrayBufferViewCore = {
	  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
	  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG,
	  aTypedArray: aTypedArray,
	  aTypedArrayConstructor: aTypedArrayConstructor,
	  exportTypedArrayMethod: exportTypedArrayMethod,
	  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod,
	  isView: isView,
	  isTypedArray: isTypedArray,
	  TypedArray: TypedArray,
	  TypedArrayPrototype: TypedArrayPrototype
	};

	/* eslint-disable no-new */



	var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

	var ArrayBuffer$3 = global_1.ArrayBuffer;
	var Int8Array$2 = global_1.Int8Array;

	var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$1 || !fails(function () {
	  Int8Array$2(1);
	}) || !fails(function () {
	  new Int8Array$2(-1);
	}) || !checkCorrectnessOfIteration(function (iterable) {
	  new Int8Array$2();
	  new Int8Array$2(null);
	  new Int8Array$2(1.5);
	  new Int8Array$2(iterable);
	}, true) || fails(function () {
	  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
	  return new Int8Array$2(new ArrayBuffer$3(2), 1, undefined).length !== 1;
	});

	var toPositiveInteger = function (it) {
	  var result = toInteger(it);
	  if (result < 0) throw RangeError("The argument can't be less than 0");
	  return result;
	};

	var toOffset = function (it, BYTES) {
	  var offset = toPositiveInteger(it);
	  if (offset % BYTES) throw RangeError('Wrong offset');
	  return offset;
	};

	var aTypedArrayConstructor$1 = arrayBufferViewCore.aTypedArrayConstructor;

	var typedArrayFrom = function from(source /* , mapfn, thisArg */) {
	  var O = toObject(source);
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var i, length, result, step, iterator, next;
	  if (iteratorMethod != undefined && !isArrayIteratorMethod(iteratorMethod)) {
	    iterator = iteratorMethod.call(O);
	    next = iterator.next;
	    O = [];
	    while (!(step = next.call(iterator)).done) {
	      O.push(step.value);
	    }
	  }
	  if (mapping && argumentsLength > 2) {
	    mapfn = functionBindContext(mapfn, arguments[2], 2);
	  }
	  length = toLength(O.length);
	  result = new (aTypedArrayConstructor$1(this))(length);
	  for (i = 0; length > i; i++) {
	    result[i] = mapping ? mapfn(O[i], i) : O[i];
	  }
	  return result;
	};

	var typedArrayConstructor = createCommonjsModule(function (module) {


















	var getOwnPropertyNames = objectGetOwnPropertyNames.f;

	var forEach = arrayIteration.forEach;






	var getInternalState = internalState.get;
	var setInternalState = internalState.set;
	var nativeDefineProperty = objectDefineProperty.f;
	var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	var round = Math.round;
	var RangeError = global_1.RangeError;
	var ArrayBuffer = arrayBuffer.ArrayBuffer;
	var DataView = arrayBuffer.DataView;
	var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
	var TYPED_ARRAY_TAG = arrayBufferViewCore.TYPED_ARRAY_TAG;
	var TypedArray = arrayBufferViewCore.TypedArray;
	var TypedArrayPrototype = arrayBufferViewCore.TypedArrayPrototype;
	var aTypedArrayConstructor = arrayBufferViewCore.aTypedArrayConstructor;
	var isTypedArray = arrayBufferViewCore.isTypedArray;
	var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
	var WRONG_LENGTH = 'Wrong length';

	var fromList = function (C, list) {
	  var index = 0;
	  var length = list.length;
	  var result = new (aTypedArrayConstructor(C))(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	};

	var addGetter = function (it, key) {
	  nativeDefineProperty(it, key, { get: function () {
	    return getInternalState(this)[key];
	  } });
	};

	var isArrayBuffer = function (it) {
	  var klass;
	  return it instanceof ArrayBuffer || (klass = classof(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
	};

	var isTypedArrayIndex = function (target, key) {
	  return isTypedArray(target)
	    && typeof key != 'symbol'
	    && key in target
	    && String(+key) == String(key);
	};

	var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
	  return isTypedArrayIndex(target, key = toPrimitive(key, true))
	    ? createPropertyDescriptor(2, target[key])
	    : nativeGetOwnPropertyDescriptor(target, key);
	};

	var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
	  if (isTypedArrayIndex(target, key = toPrimitive(key, true))
	    && isObject(descriptor)
	    && has(descriptor, 'value')
	    && !has(descriptor, 'get')
	    && !has(descriptor, 'set')
	    // TODO: add validation descriptor w/o calling accessors
	    && !descriptor.configurable
	    && (!has(descriptor, 'writable') || descriptor.writable)
	    && (!has(descriptor, 'enumerable') || descriptor.enumerable)
	  ) {
	    target[key] = descriptor.value;
	    return target;
	  } return nativeDefineProperty(target, key, descriptor);
	};

	if (descriptors) {
	  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
	    objectGetOwnPropertyDescriptor.f = wrappedGetOwnPropertyDescriptor;
	    objectDefineProperty.f = wrappedDefineProperty;
	    addGetter(TypedArrayPrototype, 'buffer');
	    addGetter(TypedArrayPrototype, 'byteOffset');
	    addGetter(TypedArrayPrototype, 'byteLength');
	    addGetter(TypedArrayPrototype, 'length');
	  }

	  _export({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
	    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
	    defineProperty: wrappedDefineProperty
	  });

	  module.exports = function (TYPE, wrapper, CLAMPED) {
	    var BYTES = TYPE.match(/\d+$/)[0] / 8;
	    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
	    var GETTER = 'get' + TYPE;
	    var SETTER = 'set' + TYPE;
	    var NativeTypedArrayConstructor = global_1[CONSTRUCTOR_NAME];
	    var TypedArrayConstructor = NativeTypedArrayConstructor;
	    var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
	    var exported = {};

	    var getter = function (that, index) {
	      var data = getInternalState(that);
	      return data.view[GETTER](index * BYTES + data.byteOffset, true);
	    };

	    var setter = function (that, index, value) {
	      var data = getInternalState(that);
	      if (CLAMPED) value = (value = round(value)) < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
	      data.view[SETTER](index * BYTES + data.byteOffset, value, true);
	    };

	    var addElement = function (that, index) {
	      nativeDefineProperty(that, index, {
	        get: function () {
	          return getter(this, index);
	        },
	        set: function (value) {
	          return setter(this, index, value);
	        },
	        enumerable: true
	      });
	    };

	    if (!NATIVE_ARRAY_BUFFER_VIEWS) {
	      TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
	        anInstance(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
	        var index = 0;
	        var byteOffset = 0;
	        var buffer, byteLength, length;
	        if (!isObject(data)) {
	          length = toIndex(data);
	          byteLength = length * BYTES;
	          buffer = new ArrayBuffer(byteLength);
	        } else if (isArrayBuffer(data)) {
	          buffer = data;
	          byteOffset = toOffset(offset, BYTES);
	          var $len = data.byteLength;
	          if ($length === undefined) {
	            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
	            byteLength = $len - byteOffset;
	            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
	          } else {
	            byteLength = toLength($length) * BYTES;
	            if (byteLength + byteOffset > $len) throw RangeError(WRONG_LENGTH);
	          }
	          length = byteLength / BYTES;
	        } else if (isTypedArray(data)) {
	          return fromList(TypedArrayConstructor, data);
	        } else {
	          return typedArrayFrom.call(TypedArrayConstructor, data);
	        }
	        setInternalState(that, {
	          buffer: buffer,
	          byteOffset: byteOffset,
	          byteLength: byteLength,
	          length: length,
	          view: new DataView(buffer)
	        });
	        while (index < length) addElement(that, index++);
	      });

	      if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
	      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = objectCreate(TypedArrayPrototype);
	    } else if (typedArrayConstructorsRequireWrappers) {
	      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
	        anInstance(dummy, TypedArrayConstructor, CONSTRUCTOR_NAME);
	        return inheritIfRequired(function () {
	          if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
	          if (isArrayBuffer(data)) return $length !== undefined
	            ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length)
	            : typedArrayOffset !== undefined
	              ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES))
	              : new NativeTypedArrayConstructor(data);
	          if (isTypedArray(data)) return fromList(TypedArrayConstructor, data);
	          return typedArrayFrom.call(TypedArrayConstructor, data);
	        }(), dummy, TypedArrayConstructor);
	      });

	      if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
	      forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
	        if (!(key in TypedArrayConstructor)) {
	          createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
	        }
	      });
	      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
	    }

	    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
	    }

	    if (TYPED_ARRAY_TAG) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
	    }

	    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

	    _export({
	      global: true, forced: TypedArrayConstructor != NativeTypedArrayConstructor, sham: !NATIVE_ARRAY_BUFFER_VIEWS
	    }, exported);

	    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
	      createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
	    }

	    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
	    }

	    setSpecies(CONSTRUCTOR_NAME);
	  };
	} else module.exports = function () { /* empty */ };
	});

	// `Uint8Array` constructor
	// https://tc39.github.io/ecma262/#sec-typedarray-objects
	typedArrayConstructor('Uint8', function (init) {
	  return function Uint8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	var min$5 = Math.min;

	// `Array.prototype.copyWithin` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.copywithin
	var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
	  var O = toObject(this);
	  var len = toLength(O.length);
	  var to = toAbsoluteIndex(target, len);
	  var from = toAbsoluteIndex(start, len);
	  var end = arguments.length > 2 ? arguments[2] : undefined;
	  var count = min$5((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
	  var inc = 1;
	  if (from < to && to < from + count) {
	    inc = -1;
	    from += count - 1;
	    to += count - 1;
	  }
	  while (count-- > 0) {
	    if (from in O) O[to] = O[from];
	    else delete O[to];
	    to += inc;
	    from += inc;
	  } return O;
	};

	var aTypedArray$1 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$1 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.copyWithin` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.copywithin
	exportTypedArrayMethod$1('copyWithin', function copyWithin(target, start /* , end */) {
	  return arrayCopyWithin.call(aTypedArray$1(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
	});

	var $every$1 = arrayIteration.every;

	var aTypedArray$2 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$2 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.every` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.every
	exportTypedArrayMethod$2('every', function every(callbackfn /* , thisArg */) {
	  return $every$1(aTypedArray$2(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$3 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$3 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.fill` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.fill
	// eslint-disable-next-line no-unused-vars
	exportTypedArrayMethod$3('fill', function fill(value /* , start, end */) {
	  return arrayFill.apply(aTypedArray$3(this), arguments);
	});

	var $filter$1 = arrayIteration.filter;


	var aTypedArray$4 = arrayBufferViewCore.aTypedArray;
	var aTypedArrayConstructor$2 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayMethod$4 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.filter` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.filter
	exportTypedArrayMethod$4('filter', function filter(callbackfn /* , thisArg */) {
	  var list = $filter$1(aTypedArray$4(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  var C = speciesConstructor(this, this.constructor);
	  var index = 0;
	  var length = list.length;
	  var result = new (aTypedArrayConstructor$2(C))(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	});

	var $find = arrayIteration.find;

	var aTypedArray$5 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$5 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.find` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.find
	exportTypedArrayMethod$5('find', function find(predicate /* , thisArg */) {
	  return $find(aTypedArray$5(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $findIndex$1 = arrayIteration.findIndex;

	var aTypedArray$6 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$6 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.findIndex` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.findindex
	exportTypedArrayMethod$6('findIndex', function findIndex(predicate /* , thisArg */) {
	  return $findIndex$1(aTypedArray$6(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $forEach$2 = arrayIteration.forEach;

	var aTypedArray$7 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$7 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.forEach` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.foreach
	exportTypedArrayMethod$7('forEach', function forEach(callbackfn /* , thisArg */) {
	  $forEach$2(aTypedArray$7(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $includes$1 = arrayIncludes.includes;

	var aTypedArray$8 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$8 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.includes` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.includes
	exportTypedArrayMethod$8('includes', function includes(searchElement /* , fromIndex */) {
	  return $includes$1(aTypedArray$8(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $indexOf$1 = arrayIncludes.indexOf;

	var aTypedArray$9 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$9 = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.indexOf` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.indexof
	exportTypedArrayMethod$9('indexOf', function indexOf(searchElement /* , fromIndex */) {
	  return $indexOf$1(aTypedArray$9(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var Uint8Array$1 = global_1.Uint8Array;
	var arrayValues = es_array_iterator.values;
	var arrayKeys = es_array_iterator.keys;
	var arrayEntries = es_array_iterator.entries;
	var aTypedArray$a = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$a = arrayBufferViewCore.exportTypedArrayMethod;
	var nativeTypedArrayIterator = Uint8Array$1 && Uint8Array$1.prototype[ITERATOR$5];

	var CORRECT_ITER_NAME = !!nativeTypedArrayIterator
	  && (nativeTypedArrayIterator.name == 'values' || nativeTypedArrayIterator.name == undefined);

	var typedArrayValues = function values() {
	  return arrayValues.call(aTypedArray$a(this));
	};

	// `%TypedArray%.prototype.entries` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.entries
	exportTypedArrayMethod$a('entries', function entries() {
	  return arrayEntries.call(aTypedArray$a(this));
	});
	// `%TypedArray%.prototype.keys` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.keys
	exportTypedArrayMethod$a('keys', function keys() {
	  return arrayKeys.call(aTypedArray$a(this));
	});
	// `%TypedArray%.prototype.values` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.values
	exportTypedArrayMethod$a('values', typedArrayValues, !CORRECT_ITER_NAME);
	// `%TypedArray%.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype-@@iterator
	exportTypedArrayMethod$a(ITERATOR$5, typedArrayValues, !CORRECT_ITER_NAME);

	var aTypedArray$b = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$b = arrayBufferViewCore.exportTypedArrayMethod;
	var $join = [].join;

	// `%TypedArray%.prototype.join` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.join
	// eslint-disable-next-line no-unused-vars
	exportTypedArrayMethod$b('join', function join(separator) {
	  return $join.apply(aTypedArray$b(this), arguments);
	});

	var min$6 = Math.min;
	var nativeLastIndexOf = [].lastIndexOf;
	var NEGATIVE_ZERO$1 = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
	var STRICT_METHOD$6 = arrayMethodIsStrict('lastIndexOf');
	// For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method
	var USES_TO_LENGTH$a = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });
	var FORCED$7 = NEGATIVE_ZERO$1 || !STRICT_METHOD$6 || !USES_TO_LENGTH$a;

	// `Array.prototype.lastIndexOf` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof
	var arrayLastIndexOf = FORCED$7 ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
	  // convert -0 to +0
	  if (NEGATIVE_ZERO$1) return nativeLastIndexOf.apply(this, arguments) || 0;
	  var O = toIndexedObject(this);
	  var length = toLength(O.length);
	  var index = length - 1;
	  if (arguments.length > 1) index = min$6(index, toInteger(arguments[1]));
	  if (index < 0) index = length + index;
	  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
	  return -1;
	} : nativeLastIndexOf;

	var aTypedArray$c = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$c = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.lastIndexOf` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.lastindexof
	// eslint-disable-next-line no-unused-vars
	exportTypedArrayMethod$c('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
	  return arrayLastIndexOf.apply(aTypedArray$c(this), arguments);
	});

	var $map$1 = arrayIteration.map;


	var aTypedArray$d = arrayBufferViewCore.aTypedArray;
	var aTypedArrayConstructor$3 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayMethod$d = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.map` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.map
	exportTypedArrayMethod$d('map', function map(mapfn /* , thisArg */) {
	  return $map$1(aTypedArray$d(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
	    return new (aTypedArrayConstructor$3(speciesConstructor(O, O.constructor)))(length);
	  });
	});

	var $reduce$1 = arrayReduce.left;

	var aTypedArray$e = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$e = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.reduce` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduce
	exportTypedArrayMethod$e('reduce', function reduce(callbackfn /* , initialValue */) {
	  return $reduce$1(aTypedArray$e(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $reduceRight = arrayReduce.right;

	var aTypedArray$f = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$f = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.reduceRicht` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduceright
	exportTypedArrayMethod$f('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
	  return $reduceRight(aTypedArray$f(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$g = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$g = arrayBufferViewCore.exportTypedArrayMethod;
	var floor$3 = Math.floor;

	// `%TypedArray%.prototype.reverse` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reverse
	exportTypedArrayMethod$g('reverse', function reverse() {
	  var that = this;
	  var length = aTypedArray$g(that).length;
	  var middle = floor$3(length / 2);
	  var index = 0;
	  var value;
	  while (index < middle) {
	    value = that[index];
	    that[index++] = that[--length];
	    that[length] = value;
	  } return that;
	});

	var aTypedArray$h = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$h = arrayBufferViewCore.exportTypedArrayMethod;

	var FORCED$8 = fails(function () {
	  // eslint-disable-next-line no-undef
	  new Int8Array(1).set({});
	});

	// `%TypedArray%.prototype.set` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.set
	exportTypedArrayMethod$h('set', function set(arrayLike /* , offset */) {
	  aTypedArray$h(this);
	  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
	  var length = this.length;
	  var src = toObject(arrayLike);
	  var len = toLength(src.length);
	  var index = 0;
	  if (len + offset > length) throw RangeError('Wrong length');
	  while (index < len) this[offset + index] = src[index++];
	}, FORCED$8);

	var aTypedArray$i = arrayBufferViewCore.aTypedArray;
	var aTypedArrayConstructor$4 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayMethod$i = arrayBufferViewCore.exportTypedArrayMethod;
	var $slice = [].slice;

	var FORCED$9 = fails(function () {
	  // eslint-disable-next-line no-undef
	  new Int8Array(1).slice();
	});

	// `%TypedArray%.prototype.slice` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.slice
	exportTypedArrayMethod$i('slice', function slice(start, end) {
	  var list = $slice.call(aTypedArray$i(this), start, end);
	  var C = speciesConstructor(this, this.constructor);
	  var index = 0;
	  var length = list.length;
	  var result = new (aTypedArrayConstructor$4(C))(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	}, FORCED$9);

	var $some = arrayIteration.some;

	var aTypedArray$j = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$j = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.some` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.some
	exportTypedArrayMethod$j('some', function some(callbackfn /* , thisArg */) {
	  return $some(aTypedArray$j(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$k = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$k = arrayBufferViewCore.exportTypedArrayMethod;
	var $sort = [].sort;

	// `%TypedArray%.prototype.sort` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.sort
	exportTypedArrayMethod$k('sort', function sort(comparefn) {
	  return $sort.call(aTypedArray$k(this), comparefn);
	});

	var aTypedArray$l = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$l = arrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.subarray` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.subarray
	exportTypedArrayMethod$l('subarray', function subarray(begin, end) {
	  var O = aTypedArray$l(this);
	  var length = O.length;
	  var beginIndex = toAbsoluteIndex(begin, length);
	  return new (speciesConstructor(O, O.constructor))(
	    O.buffer,
	    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
	    toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
	  );
	});

	var Int8Array$3 = global_1.Int8Array;
	var aTypedArray$m = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$m = arrayBufferViewCore.exportTypedArrayMethod;
	var $toLocaleString = [].toLocaleString;
	var $slice$1 = [].slice;

	// iOS Safari 6.x fails here
	var TO_LOCALE_STRING_BUG = !!Int8Array$3 && fails(function () {
	  $toLocaleString.call(new Int8Array$3(1));
	});

	var FORCED$a = fails(function () {
	  return [1, 2].toLocaleString() != new Int8Array$3([1, 2]).toLocaleString();
	}) || !fails(function () {
	  Int8Array$3.prototype.toLocaleString.call([1, 2]);
	});

	// `%TypedArray%.prototype.toLocaleString` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.tolocalestring
	exportTypedArrayMethod$m('toLocaleString', function toLocaleString() {
	  return $toLocaleString.apply(TO_LOCALE_STRING_BUG ? $slice$1.call(aTypedArray$m(this)) : aTypedArray$m(this), arguments);
	}, FORCED$a);

	var exportTypedArrayMethod$n = arrayBufferViewCore.exportTypedArrayMethod;



	var Uint8Array$2 = global_1.Uint8Array;
	var Uint8ArrayPrototype = Uint8Array$2 && Uint8Array$2.prototype || {};
	var arrayToString = [].toString;
	var arrayJoin = [].join;

	if (fails(function () { arrayToString.call({}); })) {
	  arrayToString = function toString() {
	    return arrayJoin.call(this);
	  };
	}

	var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString != arrayToString;

	// `%TypedArray%.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.tostring
	exportTypedArrayMethod$n('toString', arrayToString, IS_NOT_ARRAY_METHOD);

	var freezing = !fails(function () {
	  return Object.isExtensible(Object.preventExtensions({}));
	});

	var internalMetadata = createCommonjsModule(function (module) {
	var defineProperty = objectDefineProperty.f;



	var METADATA = uid('meta');
	var id = 0;

	var isExtensible = Object.isExtensible || function () {
	  return true;
	};

	var setMetadata = function (it) {
	  defineProperty(it, METADATA, { value: {
	    objectID: 'O' + ++id, // object ID
	    weakData: {}          // weak collections IDs
	  } });
	};

	var fastKey = function (it, create) {
	  // return a primitive with prefix
	  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!has(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMetadata(it);
	  // return object ID
	  } return it[METADATA].objectID;
	};

	var getWeakData = function (it, create) {
	  if (!has(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMetadata(it);
	  // return the store of weak collections IDs
	  } return it[METADATA].weakData;
	};

	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (freezing && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
	  return it;
	};

	var meta = module.exports = {
	  REQUIRED: false,
	  fastKey: fastKey,
	  getWeakData: getWeakData,
	  onFreeze: onFreeze
	};

	hiddenKeys[METADATA] = true;
	});
	var internalMetadata_1 = internalMetadata.REQUIRED;
	var internalMetadata_2 = internalMetadata.fastKey;
	var internalMetadata_3 = internalMetadata.getWeakData;
	var internalMetadata_4 = internalMetadata.onFreeze;

	var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
	  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
	  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var NativeConstructor = global_1[CONSTRUCTOR_NAME];
	  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
	  var Constructor = NativeConstructor;
	  var exported = {};

	  var fixMethod = function (KEY) {
	    var nativeMethod = NativePrototype[KEY];
	    redefine(NativePrototype, KEY,
	      KEY == 'add' ? function add(value) {
	        nativeMethod.call(this, value === 0 ? 0 : value);
	        return this;
	      } : KEY == 'delete' ? function (key) {
	        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : KEY == 'get' ? function get(key) {
	        return IS_WEAK && !isObject(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : KEY == 'has' ? function has(key) {
	        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : function set(key, value) {
	        nativeMethod.call(this, key === 0 ? 0 : key, value);
	        return this;
	      }
	    );
	  };

	  // eslint-disable-next-line max-len
	  if (isForced_1(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
	    new NativeConstructor().entries().next();
	  })))) {
	    // create collection constructor
	    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
	    internalMetadata.REQUIRED = true;
	  } else if (isForced_1(CONSTRUCTOR_NAME, true)) {
	    var instance = new Constructor();
	    // early implementations not supports chaining
	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
	    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
	    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
	    // most early implementations doesn't supports iterables, most modern - not close it correctly
	    // eslint-disable-next-line no-new
	    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
	    // for early implementations -0 and +0 not the same
	    var BUGGY_ZERO = !IS_WEAK && fails(function () {
	      // V8 ~ Chromium 42- fails only with 5+ elements
	      var $instance = new NativeConstructor();
	      var index = 5;
	      while (index--) $instance[ADDER](index, index);
	      return !$instance.has(-0);
	    });

	    if (!ACCEPT_ITERABLES) {
	      Constructor = wrapper(function (dummy, iterable) {
	        anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
	        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
	        if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	        return that;
	      });
	      Constructor.prototype = NativePrototype;
	      NativePrototype.constructor = Constructor;
	    }

	    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }

	    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

	    // weak collections should not contains .clear method
	    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
	  }

	  exported[CONSTRUCTOR_NAME] = Constructor;
	  _export({ global: true, forced: Constructor != NativeConstructor }, exported);

	  setToStringTag(Constructor, CONSTRUCTOR_NAME);

	  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

	  return Constructor;
	};

	var getWeakData = internalMetadata.getWeakData;








	var setInternalState$6 = internalState.set;
	var internalStateGetterFor = internalState.getterFor;
	var find = arrayIteration.find;
	var findIndex = arrayIteration.findIndex;
	var id$1 = 0;

	// fallback for uncaught frozen keys
	var uncaughtFrozenStore = function (store) {
	  return store.frozen || (store.frozen = new UncaughtFrozenStore());
	};

	var UncaughtFrozenStore = function () {
	  this.entries = [];
	};

	var findUncaughtFrozen = function (store, key) {
	  return find(store.entries, function (it) {
	    return it[0] === key;
	  });
	};

	UncaughtFrozenStore.prototype = {
	  get: function (key) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) return entry[1];
	  },
	  has: function (key) {
	    return !!findUncaughtFrozen(this, key);
	  },
	  set: function (key, value) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) entry[1] = value;
	    else this.entries.push([key, value]);
	  },
	  'delete': function (key) {
	    var index = findIndex(this.entries, function (it) {
	      return it[0] === key;
	    });
	    if (~index) this.entries.splice(index, 1);
	    return !!~index;
	  }
	};

	var collectionWeak = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, CONSTRUCTOR_NAME);
	      setInternalState$6(that, {
	        type: CONSTRUCTOR_NAME,
	        id: id$1++,
	        frozen: undefined
	      });
	      if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	    });

	    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var data = getWeakData(anObject(key), true);
	      if (data === true) uncaughtFrozenStore(state).set(key, value);
	      else data[state.id] = value;
	      return that;
	    };

	    redefineAll(C.prototype, {
	      // 23.3.3.2 WeakMap.prototype.delete(key)
	      // 23.4.3.3 WeakSet.prototype.delete(value)
	      'delete': function (key) {
	        var state = getInternalState(this);
	        if (!isObject(key)) return false;
	        var data = getWeakData(key);
	        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
	        return data && has(data, state.id) && delete data[state.id];
	      },
	      // 23.3.3.4 WeakMap.prototype.has(key)
	      // 23.4.3.4 WeakSet.prototype.has(value)
	      has: function has$1(key) {
	        var state = getInternalState(this);
	        if (!isObject(key)) return false;
	        var data = getWeakData(key);
	        if (data === true) return uncaughtFrozenStore(state).has(key);
	        return data && has(data, state.id);
	      }
	    });

	    redefineAll(C.prototype, IS_MAP ? {
	      // 23.3.3.3 WeakMap.prototype.get(key)
	      get: function get(key) {
	        var state = getInternalState(this);
	        if (isObject(key)) {
	          var data = getWeakData(key);
	          if (data === true) return uncaughtFrozenStore(state).get(key);
	          return data ? data[state.id] : undefined;
	        }
	      },
	      // 23.3.3.5 WeakMap.prototype.set(key, value)
	      set: function set(key, value) {
	        return define(this, key, value);
	      }
	    } : {
	      // 23.4.3.1 WeakSet.prototype.add(value)
	      add: function add(value) {
	        return define(this, value, true);
	      }
	    });

	    return C;
	  }
	};

	var es_weakMap = createCommonjsModule(function (module) {






	var enforceIternalState = internalState.enforce;


	var IS_IE11 = !global_1.ActiveXObject && 'ActiveXObject' in global_1;
	var isExtensible = Object.isExtensible;
	var InternalWeakMap;

	var wrapper = function (init) {
	  return function WeakMap() {
	    return init(this, arguments.length ? arguments[0] : undefined);
	  };
	};

	// `WeakMap` constructor
	// https://tc39.github.io/ecma262/#sec-weakmap-constructor
	var $WeakMap = module.exports = collection('WeakMap', wrapper, collectionWeak);

	// IE11 WeakMap frozen keys fix
	// We can't use feature detection because it crash some old IE builds
	// https://github.com/zloirock/core-js/issues/485
	if (nativeWeakMap && IS_IE11) {
	  InternalWeakMap = collectionWeak.getConstructor(wrapper, 'WeakMap', true);
	  internalMetadata.REQUIRED = true;
	  var WeakMapPrototype = $WeakMap.prototype;
	  var nativeDelete = WeakMapPrototype['delete'];
	  var nativeHas = WeakMapPrototype.has;
	  var nativeGet = WeakMapPrototype.get;
	  var nativeSet = WeakMapPrototype.set;
	  redefineAll(WeakMapPrototype, {
	    'delete': function (key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeDelete.call(this, key) || state.frozen['delete'](key);
	      } return nativeDelete.call(this, key);
	    },
	    has: function has(key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeHas.call(this, key) || state.frozen.has(key);
	      } return nativeHas.call(this, key);
	    },
	    get: function get(key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeHas.call(this, key) ? nativeGet.call(this, key) : state.frozen.get(key);
	      } return nativeGet.call(this, key);
	    },
	    set: function set(key, value) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        nativeHas.call(this, key) ? nativeSet.call(this, key, value) : state.frozen.set(key, value);
	      } else nativeSet.call(this, key, value);
	      return this;
	    }
	  });
	}
	});

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;
	  // some Chrome versions have non-configurable methods on DOMTokenList
	  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
	    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
	  } catch (error) {
	    CollectionPrototype.forEach = arrayForEach;
	  }
	}

	var ITERATOR$6 = wellKnownSymbol('iterator');
	var TO_STRING_TAG$4 = wellKnownSymbol('toStringTag');
	var ArrayValues = es_array_iterator.values;

	for (var COLLECTION_NAME$1 in domIterables) {
	  var Collection$1 = global_1[COLLECTION_NAME$1];
	  var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
	  if (CollectionPrototype$1) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype$1[ITERATOR$6] !== ArrayValues) try {
	      createNonEnumerableProperty(CollectionPrototype$1, ITERATOR$6, ArrayValues);
	    } catch (error) {
	      CollectionPrototype$1[ITERATOR$6] = ArrayValues;
	    }
	    if (!CollectionPrototype$1[TO_STRING_TAG$4]) {
	      createNonEnumerableProperty(CollectionPrototype$1, TO_STRING_TAG$4, COLLECTION_NAME$1);
	    }
	    if (domIterables[COLLECTION_NAME$1]) for (var METHOD_NAME in es_array_iterator) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype$1[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
	        createNonEnumerableProperty(CollectionPrototype$1, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype$1[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      }
	    }
	  }
	}

	var slice$1 = [].slice;
	var MSIE = /MSIE .\./.test(engineUserAgent); // <- dirty ie9- check

	var wrap$1 = function (scheduler) {
	  return function (handler, timeout /* , ...arguments */) {
	    var boundArgs = arguments.length > 2;
	    var args = boundArgs ? slice$1.call(arguments, 2) : undefined;
	    return scheduler(boundArgs ? function () {
	      // eslint-disable-next-line no-new-func
	      (typeof handler == 'function' ? handler : Function(handler)).apply(this, args);
	    } : handler, timeout);
	  };
	};

	// ie9- setTimeout & setInterval additional parameters fix
	// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
	_export({ global: true, bind: true, forced: MSIE }, {
	  // `setTimeout` method
	  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout
	  setTimeout: wrap$1(global_1.setTimeout),
	  // `setInterval` method
	  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
	  setInterval: wrap$1(global_1.setInterval)
	});

	var ITERATOR$7 = wellKnownSymbol('iterator');

	var nativeUrl = !fails(function () {
	  var url = new URL('b?a=1&b=2&c=3', 'http://a');
	  var searchParams = url.searchParams;
	  var result = '';
	  url.pathname = 'c%20d';
	  searchParams.forEach(function (value, key) {
	    searchParams['delete']('b');
	    result += key + value;
	  });
	  return (isPure && !url.toJSON)
	    || !searchParams.sort
	    || url.href !== 'http://a/c%20d?a=1&c=3'
	    || searchParams.get('c') !== '3'
	    || String(new URLSearchParams('?a=1')) !== 'a=1'
	    || !searchParams[ITERATOR$7]
	    // throws in Edge
	    || new URL('https://a@b').username !== 'a'
	    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
	    // not punycoded in Edge
	    || new URL('http://тест').host !== 'xn--e1aybc'
	    // not escaped in Chrome 62-
	    || new URL('http://a#б').hash !== '#%D0%B1'
	    // fails in Chrome 66-
	    || result !== 'a1c3'
	    // throws in Safari
	    || new URL('http://x', undefined).host !== 'x';
	});

	// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80
	var delimiter = '-'; // '\x2D'
	var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
	var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
	var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
	var baseMinusTMin = base - tMin;
	var floor$4 = Math.floor;
	var stringFromCharCode = String.fromCharCode;

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 */
	var ucs2decode = function (string) {
	  var output = [];
	  var counter = 0;
	  var length = string.length;
	  while (counter < length) {
	    var value = string.charCodeAt(counter++);
	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // It's a high surrogate, and there is a next character.
	      var extra = string.charCodeAt(counter++);
	      if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
	        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // It's an unmatched surrogate; only append this code unit, in case the
	        // next code unit is the high surrogate of a surrogate pair.
	        output.push(value);
	        counter--;
	      }
	    } else {
	      output.push(value);
	    }
	  }
	  return output;
	};

	/**
	 * Converts a digit/integer into a basic code point.
	 */
	var digitToBasic = function (digit) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26);
	};

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 */
	var adapt = function (delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor$4(delta / damp) : delta >> 1;
	  delta += floor$4(delta / numPoints);
	  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
	    delta = floor$4(delta / baseMinusTMin);
	  }
	  return floor$4(k + (baseMinusTMin + 1) * delta / (delta + skew));
	};

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 */
	// eslint-disable-next-line  max-statements
	var encode = function (input) {
	  var output = [];

	  // Convert the input in UCS-2 to an array of Unicode code points.
	  input = ucs2decode(input);

	  // Cache the length.
	  var inputLength = input.length;

	  // Initialize the state.
	  var n = initialN;
	  var delta = 0;
	  var bias = initialBias;
	  var i, currentValue;

	  // Handle the basic code points.
	  for (i = 0; i < input.length; i++) {
	    currentValue = input[i];
	    if (currentValue < 0x80) {
	      output.push(stringFromCharCode(currentValue));
	    }
	  }

	  var basicLength = output.length; // number of basic code points.
	  var handledCPCount = basicLength; // number of code points that have been handled;

	  // Finish the basic string with a delimiter unless it's empty.
	  if (basicLength) {
	    output.push(delimiter);
	  }

	  // Main encoding loop:
	  while (handledCPCount < inputLength) {
	    // All non-basic code points < n have been handled already. Find the next larger one:
	    var m = maxInt;
	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    }

	    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
	    var handledCPCountPlusOne = handledCPCount + 1;
	    if (m - n > floor$4((maxInt - delta) / handledCPCountPlusOne)) {
	      throw RangeError(OVERFLOW_ERROR);
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue < n && ++delta > maxInt) {
	        throw RangeError(OVERFLOW_ERROR);
	      }
	      if (currentValue == n) {
	        // Represent delta as a generalized variable-length integer.
	        var q = delta;
	        for (var k = base; /* no condition */; k += base) {
	          var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	          if (q < t) break;
	          var qMinusT = q - t;
	          var baseMinusT = base - t;
	          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
	          q = floor$4(qMinusT / baseMinusT);
	        }

	        output.push(stringFromCharCode(digitToBasic(q)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
	        delta = 0;
	        ++handledCPCount;
	      }
	    }

	    ++delta;
	    ++n;
	  }
	  return output.join('');
	};

	var stringPunycodeToAscii = function (input) {
	  var encoded = [];
	  var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
	  var i, label;
	  for (i = 0; i < labels.length; i++) {
	    label = labels[i];
	    encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
	  }
	  return encoded.join('.');
	};

	var getIterator = function (it) {
	  var iteratorMethod = getIteratorMethod(it);
	  if (typeof iteratorMethod != 'function') {
	    throw TypeError(String(it) + ' is not iterable');
	  } return anObject(iteratorMethod.call(it));
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`





















	var $fetch$1 = getBuiltIn('fetch');
	var Headers = getBuiltIn('Headers');
	var ITERATOR$8 = wellKnownSymbol('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState$7 = internalState.set;
	var getInternalParamsState = internalState.getterFor(URL_SEARCH_PARAMS);
	var getInternalIteratorState = internalState.getterFor(URL_SEARCH_PARAMS_ITERATOR);

	var plus = /\+/g;
	var sequences = Array(4);

	var percentSequence = function (bytes) {
	  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
	};

	var percentDecode = function (sequence) {
	  try {
	    return decodeURIComponent(sequence);
	  } catch (error) {
	    return sequence;
	  }
	};

	var deserialize = function (it) {
	  var result = it.replace(plus, ' ');
	  var bytes = 4;
	  try {
	    return decodeURIComponent(result);
	  } catch (error) {
	    while (bytes) {
	      result = result.replace(percentSequence(bytes--), percentDecode);
	    }
	    return result;
	  }
	};

	var find$1 = /[!'()~]|%20/g;

	var replace = {
	  '!': '%21',
	  "'": '%27',
	  '(': '%28',
	  ')': '%29',
	  '~': '%7E',
	  '%20': '+'
	};

	var replacer = function (match) {
	  return replace[match];
	};

	var serialize = function (it) {
	  return encodeURIComponent(it).replace(find$1, replacer);
	};

	var parseSearchParams = function (result, query) {
	  if (query) {
	    var attributes = query.split('&');
	    var index = 0;
	    var attribute, entry;
	    while (index < attributes.length) {
	      attribute = attributes[index++];
	      if (attribute.length) {
	        entry = attribute.split('=');
	        result.push({
	          key: deserialize(entry.shift()),
	          value: deserialize(entry.join('='))
	        });
	      }
	    }
	  }
	};

	var updateSearchParams = function (query) {
	  this.entries.length = 0;
	  parseSearchParams(this.entries, query);
	};

	var validateArgumentsLength = function (passed, required) {
	  if (passed < required) throw TypeError('Not enough arguments');
	};

	var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
	  setInternalState$7(this, {
	    type: URL_SEARCH_PARAMS_ITERATOR,
	    iterator: getIterator(getInternalParamsState(params).entries),
	    kind: kind
	  });
	}, 'Iterator', function next() {
	  var state = getInternalIteratorState(this);
	  var kind = state.kind;
	  var step = state.iterator.next();
	  var entry = step.value;
	  if (!step.done) {
	    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
	  } return step;
	});

	// `URLSearchParams` constructor
	// https://url.spec.whatwg.org/#interface-urlsearchparams
	var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
	  anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
	  var init = arguments.length > 0 ? arguments[0] : undefined;
	  var that = this;
	  var entries = [];
	  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;

	  setInternalState$7(that, {
	    type: URL_SEARCH_PARAMS,
	    entries: entries,
	    updateURL: function () { /* empty */ },
	    updateSearchParams: updateSearchParams
	  });

	  if (init !== undefined) {
	    if (isObject(init)) {
	      iteratorMethod = getIteratorMethod(init);
	      if (typeof iteratorMethod === 'function') {
	        iterator = iteratorMethod.call(init);
	        next = iterator.next;
	        while (!(step = next.call(iterator)).done) {
	          entryIterator = getIterator(anObject(step.value));
	          entryNext = entryIterator.next;
	          if (
	            (first = entryNext.call(entryIterator)).done ||
	            (second = entryNext.call(entryIterator)).done ||
	            !entryNext.call(entryIterator).done
	          ) throw TypeError('Expected sequence with length 2');
	          entries.push({ key: first.value + '', value: second.value + '' });
	        }
	      } else for (key in init) if (has(init, key)) entries.push({ key: key, value: init[key] + '' });
	    } else {
	      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
	    }
	  }
	};

	var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

	redefineAll(URLSearchParamsPrototype, {
	  // `URLSearchParams.prototype.appent` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
	  append: function append(name, value) {
	    validateArgumentsLength(arguments.length, 2);
	    var state = getInternalParamsState(this);
	    state.entries.push({ key: name + '', value: value + '' });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.delete` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
	  'delete': function (name) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index].key === key) entries.splice(index, 1);
	      else index++;
	    }
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.get` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
	  get: function get(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) return entries[index].value;
	    }
	    return null;
	  },
	  // `URLSearchParams.prototype.getAll` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
	  getAll: function getAll(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var result = [];
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) result.push(entries[index].value);
	    }
	    return result;
	  },
	  // `URLSearchParams.prototype.has` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
	  has: function has(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index++].key === key) return true;
	    }
	    return false;
	  },
	  // `URLSearchParams.prototype.set` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
	  set: function set(name, value) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var found = false;
	    var key = name + '';
	    var val = value + '';
	    var index = 0;
	    var entry;
	    for (; index < entries.length; index++) {
	      entry = entries[index];
	      if (entry.key === key) {
	        if (found) entries.splice(index--, 1);
	        else {
	          found = true;
	          entry.value = val;
	        }
	      }
	    }
	    if (!found) entries.push({ key: key, value: val });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.sort` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
	  sort: function sort() {
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    // Array#sort is not stable in some engines
	    var slice = entries.slice();
	    var entry, entriesIndex, sliceIndex;
	    entries.length = 0;
	    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
	      entry = slice[sliceIndex];
	      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
	        if (entries[entriesIndex].key > entry.key) {
	          entries.splice(entriesIndex, 0, entry);
	          break;
	        }
	      }
	      if (entriesIndex === sliceIndex) entries.push(entry);
	    }
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.forEach` method
	  forEach: function forEach(callback /* , thisArg */) {
	    var entries = getInternalParamsState(this).entries;
	    var boundFunction = functionBindContext(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      boundFunction(entry.value, entry.key, this);
	    }
	  },
	  // `URLSearchParams.prototype.keys` method
	  keys: function keys() {
	    return new URLSearchParamsIterator(this, 'keys');
	  },
	  // `URLSearchParams.prototype.values` method
	  values: function values() {
	    return new URLSearchParamsIterator(this, 'values');
	  },
	  // `URLSearchParams.prototype.entries` method
	  entries: function entries() {
	    return new URLSearchParamsIterator(this, 'entries');
	  }
	}, { enumerable: true });

	// `URLSearchParams.prototype[@@iterator]` method
	redefine(URLSearchParamsPrototype, ITERATOR$8, URLSearchParamsPrototype.entries);

	// `URLSearchParams.prototype.toString` method
	// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
	redefine(URLSearchParamsPrototype, 'toString', function toString() {
	  var entries = getInternalParamsState(this).entries;
	  var result = [];
	  var index = 0;
	  var entry;
	  while (index < entries.length) {
	    entry = entries[index++];
	    result.push(serialize(entry.key) + '=' + serialize(entry.value));
	  } return result.join('&');
	}, { enumerable: true });

	setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

	_export({ global: true, forced: !nativeUrl }, {
	  URLSearchParams: URLSearchParamsConstructor
	});

	// Wrap `fetch` for correct work with polyfilled `URLSearchParams`
	// https://github.com/zloirock/core-js/issues/674
	if (!nativeUrl && typeof $fetch$1 == 'function' && typeof Headers == 'function') {
	  _export({ global: true, enumerable: true, forced: true }, {
	    fetch: function fetch(input /* , init */) {
	      var args = [input];
	      var init, body, headers;
	      if (arguments.length > 1) {
	        init = arguments[1];
	        if (isObject(init)) {
	          body = init.body;
	          if (classof(body) === URL_SEARCH_PARAMS) {
	            headers = init.headers ? new Headers(init.headers) : new Headers();
	            if (!headers.has('content-type')) {
	              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	            }
	            init = objectCreate(init, {
	              body: createPropertyDescriptor(0, String(body)),
	              headers: createPropertyDescriptor(0, headers)
	            });
	          }
	        }
	        args.push(init);
	      } return $fetch$1.apply(this, args);
	    }
	  });
	}

	var web_urlSearchParams = {
	  URLSearchParams: URLSearchParamsConstructor,
	  getState: getInternalParamsState
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`











	var codeAt = stringMultibyte.codeAt;





	var NativeURL = global_1.URL;
	var URLSearchParams$1 = web_urlSearchParams.URLSearchParams;
	var getInternalSearchParamsState = web_urlSearchParams.getState;
	var setInternalState$8 = internalState.set;
	var getInternalURLState = internalState.getterFor('URL');
	var floor$5 = Math.floor;
	var pow$1 = Math.pow;

	var INVALID_AUTHORITY = 'Invalid authority';
	var INVALID_SCHEME = 'Invalid scheme';
	var INVALID_HOST = 'Invalid host';
	var INVALID_PORT = 'Invalid port';

	var ALPHA = /[A-Za-z]/;
	var ALPHANUMERIC = /[\d+-.A-Za-z]/;
	var DIGIT = /\d/;
	var HEX_START = /^(0x|0X)/;
	var OCT = /^[0-7]+$/;
	var DEC = /^\d+$/;
	var HEX = /^[\dA-Fa-f]+$/;
	// eslint-disable-next-line no-control-regex
	var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/;
	// eslint-disable-next-line no-control-regex
	var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/;
	// eslint-disable-next-line no-control-regex
	var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g;
	// eslint-disable-next-line no-control-regex
	var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
	var EOF;

	var parseHost = function (url, input) {
	  var result, codePoints, index;
	  if (input.charAt(0) == '[') {
	    if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
	    result = parseIPv6(input.slice(1, -1));
	    if (!result) return INVALID_HOST;
	    url.host = result;
	  // opaque host
	  } else if (!isSpecial(url)) {
	    if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
	    result = '';
	    codePoints = arrayFrom(input);
	    for (index = 0; index < codePoints.length; index++) {
	      result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
	    }
	    url.host = result;
	  } else {
	    input = stringPunycodeToAscii(input);
	    if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
	    result = parseIPv4(input);
	    if (result === null) return INVALID_HOST;
	    url.host = result;
	  }
	};

	var parseIPv4 = function (input) {
	  var parts = input.split('.');
	  var partsLength, numbers, index, part, radix, number, ipv4;
	  if (parts.length && parts[parts.length - 1] == '') {
	    parts.pop();
	  }
	  partsLength = parts.length;
	  if (partsLength > 4) return input;
	  numbers = [];
	  for (index = 0; index < partsLength; index++) {
	    part = parts[index];
	    if (part == '') return input;
	    radix = 10;
	    if (part.length > 1 && part.charAt(0) == '0') {
	      radix = HEX_START.test(part) ? 16 : 8;
	      part = part.slice(radix == 8 ? 1 : 2);
	    }
	    if (part === '') {
	      number = 0;
	    } else {
	      if (!(radix == 10 ? DEC : radix == 8 ? OCT : HEX).test(part)) return input;
	      number = parseInt(part, radix);
	    }
	    numbers.push(number);
	  }
	  for (index = 0; index < partsLength; index++) {
	    number = numbers[index];
	    if (index == partsLength - 1) {
	      if (number >= pow$1(256, 5 - partsLength)) return null;
	    } else if (number > 255) return null;
	  }
	  ipv4 = numbers.pop();
	  for (index = 0; index < numbers.length; index++) {
	    ipv4 += numbers[index] * pow$1(256, 3 - index);
	  }
	  return ipv4;
	};

	// eslint-disable-next-line max-statements
	var parseIPv6 = function (input) {
	  var address = [0, 0, 0, 0, 0, 0, 0, 0];
	  var pieceIndex = 0;
	  var compress = null;
	  var pointer = 0;
	  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

	  var char = function () {
	    return input.charAt(pointer);
	  };

	  if (char() == ':') {
	    if (input.charAt(1) != ':') return;
	    pointer += 2;
	    pieceIndex++;
	    compress = pieceIndex;
	  }
	  while (char()) {
	    if (pieceIndex == 8) return;
	    if (char() == ':') {
	      if (compress !== null) return;
	      pointer++;
	      pieceIndex++;
	      compress = pieceIndex;
	      continue;
	    }
	    value = length = 0;
	    while (length < 4 && HEX.test(char())) {
	      value = value * 16 + parseInt(char(), 16);
	      pointer++;
	      length++;
	    }
	    if (char() == '.') {
	      if (length == 0) return;
	      pointer -= length;
	      if (pieceIndex > 6) return;
	      numbersSeen = 0;
	      while (char()) {
	        ipv4Piece = null;
	        if (numbersSeen > 0) {
	          if (char() == '.' && numbersSeen < 4) pointer++;
	          else return;
	        }
	        if (!DIGIT.test(char())) return;
	        while (DIGIT.test(char())) {
	          number = parseInt(char(), 10);
	          if (ipv4Piece === null) ipv4Piece = number;
	          else if (ipv4Piece == 0) return;
	          else ipv4Piece = ipv4Piece * 10 + number;
	          if (ipv4Piece > 255) return;
	          pointer++;
	        }
	        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
	        numbersSeen++;
	        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
	      }
	      if (numbersSeen != 4) return;
	      break;
	    } else if (char() == ':') {
	      pointer++;
	      if (!char()) return;
	    } else if (char()) return;
	    address[pieceIndex++] = value;
	  }
	  if (compress !== null) {
	    swaps = pieceIndex - compress;
	    pieceIndex = 7;
	    while (pieceIndex != 0 && swaps > 0) {
	      swap = address[pieceIndex];
	      address[pieceIndex--] = address[compress + swaps - 1];
	      address[compress + --swaps] = swap;
	    }
	  } else if (pieceIndex != 8) return;
	  return address;
	};

	var findLongestZeroSequence = function (ipv6) {
	  var maxIndex = null;
	  var maxLength = 1;
	  var currStart = null;
	  var currLength = 0;
	  var index = 0;
	  for (; index < 8; index++) {
	    if (ipv6[index] !== 0) {
	      if (currLength > maxLength) {
	        maxIndex = currStart;
	        maxLength = currLength;
	      }
	      currStart = null;
	      currLength = 0;
	    } else {
	      if (currStart === null) currStart = index;
	      ++currLength;
	    }
	  }
	  if (currLength > maxLength) {
	    maxIndex = currStart;
	    maxLength = currLength;
	  }
	  return maxIndex;
	};

	var serializeHost = function (host) {
	  var result, index, compress, ignore0;
	  // ipv4
	  if (typeof host == 'number') {
	    result = [];
	    for (index = 0; index < 4; index++) {
	      result.unshift(host % 256);
	      host = floor$5(host / 256);
	    } return result.join('.');
	  // ipv6
	  } else if (typeof host == 'object') {
	    result = '';
	    compress = findLongestZeroSequence(host);
	    for (index = 0; index < 8; index++) {
	      if (ignore0 && host[index] === 0) continue;
	      if (ignore0) ignore0 = false;
	      if (compress === index) {
	        result += index ? ':' : '::';
	        ignore0 = true;
	      } else {
	        result += host[index].toString(16);
	        if (index < 7) result += ':';
	      }
	    }
	    return '[' + result + ']';
	  } return host;
	};

	var C0ControlPercentEncodeSet = {};
	var fragmentPercentEncodeSet = objectAssign({}, C0ControlPercentEncodeSet, {
	  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
	});
	var pathPercentEncodeSet = objectAssign({}, fragmentPercentEncodeSet, {
	  '#': 1, '?': 1, '{': 1, '}': 1
	});
	var userinfoPercentEncodeSet = objectAssign({}, pathPercentEncodeSet, {
	  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
	});

	var percentEncode = function (char, set) {
	  var code = codeAt(char, 0);
	  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
	};

	var specialSchemes = {
	  ftp: 21,
	  file: null,
	  http: 80,
	  https: 443,
	  ws: 80,
	  wss: 443
	};

	var isSpecial = function (url) {
	  return has(specialSchemes, url.scheme);
	};

	var includesCredentials = function (url) {
	  return url.username != '' || url.password != '';
	};

	var cannotHaveUsernamePasswordPort = function (url) {
	  return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
	};

	var isWindowsDriveLetter = function (string, normalized) {
	  var second;
	  return string.length == 2 && ALPHA.test(string.charAt(0))
	    && ((second = string.charAt(1)) == ':' || (!normalized && second == '|'));
	};

	var startsWithWindowsDriveLetter = function (string) {
	  var third;
	  return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (
	    string.length == 2 ||
	    ((third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#')
	  );
	};

	var shortenURLsPath = function (url) {
	  var path = url.path;
	  var pathSize = path.length;
	  if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
	    path.pop();
	  }
	};

	var isSingleDot = function (segment) {
	  return segment === '.' || segment.toLowerCase() === '%2e';
	};

	var isDoubleDot = function (segment) {
	  segment = segment.toLowerCase();
	  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
	};

	// States:
	var SCHEME_START = {};
	var SCHEME = {};
	var NO_SCHEME = {};
	var SPECIAL_RELATIVE_OR_AUTHORITY = {};
	var PATH_OR_AUTHORITY = {};
	var RELATIVE = {};
	var RELATIVE_SLASH = {};
	var SPECIAL_AUTHORITY_SLASHES = {};
	var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
	var AUTHORITY = {};
	var HOST = {};
	var HOSTNAME = {};
	var PORT = {};
	var FILE = {};
	var FILE_SLASH = {};
	var FILE_HOST = {};
	var PATH_START = {};
	var PATH = {};
	var CANNOT_BE_A_BASE_URL_PATH = {};
	var QUERY = {};
	var FRAGMENT = {};

	// eslint-disable-next-line max-statements
	var parseURL = function (url, input, stateOverride, base) {
	  var state = stateOverride || SCHEME_START;
	  var pointer = 0;
	  var buffer = '';
	  var seenAt = false;
	  var seenBracket = false;
	  var seenPasswordToken = false;
	  var codePoints, char, bufferCodePoints, failure;

	  if (!stateOverride) {
	    url.scheme = '';
	    url.username = '';
	    url.password = '';
	    url.host = null;
	    url.port = null;
	    url.path = [];
	    url.query = null;
	    url.fragment = null;
	    url.cannotBeABaseURL = false;
	    input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
	  }

	  input = input.replace(TAB_AND_NEW_LINE, '');

	  codePoints = arrayFrom(input);

	  while (pointer <= codePoints.length) {
	    char = codePoints[pointer];
	    switch (state) {
	      case SCHEME_START:
	        if (char && ALPHA.test(char)) {
	          buffer += char.toLowerCase();
	          state = SCHEME;
	        } else if (!stateOverride) {
	          state = NO_SCHEME;
	          continue;
	        } else return INVALID_SCHEME;
	        break;

	      case SCHEME:
	        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
	          buffer += char.toLowerCase();
	        } else if (char == ':') {
	          if (stateOverride && (
	            (isSpecial(url) != has(specialSchemes, buffer)) ||
	            (buffer == 'file' && (includesCredentials(url) || url.port !== null)) ||
	            (url.scheme == 'file' && !url.host)
	          )) return;
	          url.scheme = buffer;
	          if (stateOverride) {
	            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
	            return;
	          }
	          buffer = '';
	          if (url.scheme == 'file') {
	            state = FILE;
	          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
	            state = SPECIAL_RELATIVE_OR_AUTHORITY;
	          } else if (isSpecial(url)) {
	            state = SPECIAL_AUTHORITY_SLASHES;
	          } else if (codePoints[pointer + 1] == '/') {
	            state = PATH_OR_AUTHORITY;
	            pointer++;
	          } else {
	            url.cannotBeABaseURL = true;
	            url.path.push('');
	            state = CANNOT_BE_A_BASE_URL_PATH;
	          }
	        } else if (!stateOverride) {
	          buffer = '';
	          state = NO_SCHEME;
	          pointer = 0;
	          continue;
	        } else return INVALID_SCHEME;
	        break;

	      case NO_SCHEME:
	        if (!base || (base.cannotBeABaseURL && char != '#')) return INVALID_SCHEME;
	        if (base.cannotBeABaseURL && char == '#') {
	          url.scheme = base.scheme;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          url.cannotBeABaseURL = true;
	          state = FRAGMENT;
	          break;
	        }
	        state = base.scheme == 'file' ? FILE : RELATIVE;
	        continue;

	      case SPECIAL_RELATIVE_OR_AUTHORITY:
	        if (char == '/' && codePoints[pointer + 1] == '/') {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          pointer++;
	        } else {
	          state = RELATIVE;
	          continue;
	        } break;

	      case PATH_OR_AUTHORITY:
	        if (char == '/') {
	          state = AUTHORITY;
	          break;
	        } else {
	          state = PATH;
	          continue;
	        }

	      case RELATIVE:
	        url.scheme = base.scheme;
	        if (char == EOF) {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	        } else if (char == '/' || (char == '\\' && isSpecial(url))) {
	          state = RELATIVE_SLASH;
	        } else if (char == '?') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          state = FRAGMENT;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.path.pop();
	          state = PATH;
	          continue;
	        } break;

	      case RELATIVE_SLASH:
	        if (isSpecial(url) && (char == '/' || char == '\\')) {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        } else if (char == '/') {
	          state = AUTHORITY;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          state = PATH;
	          continue;
	        } break;

	      case SPECIAL_AUTHORITY_SLASHES:
	        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
	        pointer++;
	        break;

	      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
	        if (char != '/' && char != '\\') {
	          state = AUTHORITY;
	          continue;
	        } break;

	      case AUTHORITY:
	        if (char == '@') {
	          if (seenAt) buffer = '%40' + buffer;
	          seenAt = true;
	          bufferCodePoints = arrayFrom(buffer);
	          for (var i = 0; i < bufferCodePoints.length; i++) {
	            var codePoint = bufferCodePoints[i];
	            if (codePoint == ':' && !seenPasswordToken) {
	              seenPasswordToken = true;
	              continue;
	            }
	            var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
	            if (seenPasswordToken) url.password += encodedCodePoints;
	            else url.username += encodedCodePoints;
	          }
	          buffer = '';
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url))
	        ) {
	          if (seenAt && buffer == '') return INVALID_AUTHORITY;
	          pointer -= arrayFrom(buffer).length + 1;
	          buffer = '';
	          state = HOST;
	        } else buffer += char;
	        break;

	      case HOST:
	      case HOSTNAME:
	        if (stateOverride && url.scheme == 'file') {
	          state = FILE_HOST;
	          continue;
	        } else if (char == ':' && !seenBracket) {
	          if (buffer == '') return INVALID_HOST;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PORT;
	          if (stateOverride == HOSTNAME) return;
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url))
	        ) {
	          if (isSpecial(url) && buffer == '') return INVALID_HOST;
	          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PATH_START;
	          if (stateOverride) return;
	          continue;
	        } else {
	          if (char == '[') seenBracket = true;
	          else if (char == ']') seenBracket = false;
	          buffer += char;
	        } break;

	      case PORT:
	        if (DIGIT.test(char)) {
	          buffer += char;
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url)) ||
	          stateOverride
	        ) {
	          if (buffer != '') {
	            var port = parseInt(buffer, 10);
	            if (port > 0xFFFF) return INVALID_PORT;
	            url.port = (isSpecial(url) && port === specialSchemes[url.scheme]) ? null : port;
	            buffer = '';
	          }
	          if (stateOverride) return;
	          state = PATH_START;
	          continue;
	        } else return INVALID_PORT;
	        break;

	      case FILE:
	        url.scheme = 'file';
	        if (char == '/' || char == '\\') state = FILE_SLASH;
	        else if (base && base.scheme == 'file') {
	          if (char == EOF) {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	          } else if (char == '?') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	            url.fragment = '';
	            state = FRAGMENT;
	          } else {
	            if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	              url.host = base.host;
	              url.path = base.path.slice();
	              shortenURLsPath(url);
	            }
	            state = PATH;
	            continue;
	          }
	        } else {
	          state = PATH;
	          continue;
	        } break;

	      case FILE_SLASH:
	        if (char == '/' || char == '\\') {
	          state = FILE_HOST;
	          break;
	        }
	        if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	          if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);
	          else url.host = base.host;
	        }
	        state = PATH;
	        continue;

	      case FILE_HOST:
	        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
	          if (!stateOverride && isWindowsDriveLetter(buffer)) {
	            state = PATH;
	          } else if (buffer == '') {
	            url.host = '';
	            if (stateOverride) return;
	            state = PATH_START;
	          } else {
	            failure = parseHost(url, buffer);
	            if (failure) return failure;
	            if (url.host == 'localhost') url.host = '';
	            if (stateOverride) return;
	            buffer = '';
	            state = PATH_START;
	          } continue;
	        } else buffer += char;
	        break;

	      case PATH_START:
	        if (isSpecial(url)) {
	          state = PATH;
	          if (char != '/' && char != '\\') continue;
	        } else if (!stateOverride && char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          state = PATH;
	          if (char != '/') continue;
	        } break;

	      case PATH:
	        if (
	          char == EOF || char == '/' ||
	          (char == '\\' && isSpecial(url)) ||
	          (!stateOverride && (char == '?' || char == '#'))
	        ) {
	          if (isDoubleDot(buffer)) {
	            shortenURLsPath(url);
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else if (isSingleDot(buffer)) {
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else {
	            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
	              if (url.host) url.host = '';
	              buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
	            }
	            url.path.push(buffer);
	          }
	          buffer = '';
	          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
	            while (url.path.length > 1 && url.path[0] === '') {
	              url.path.shift();
	            }
	          }
	          if (char == '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          }
	        } else {
	          buffer += percentEncode(char, pathPercentEncodeSet);
	        } break;

	      case CANNOT_BE_A_BASE_URL_PATH:
	        if (char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
	        } break;

	      case QUERY:
	        if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          if (char == "'" && isSpecial(url)) url.query += '%27';
	          else if (char == '#') url.query += '%23';
	          else url.query += percentEncode(char, C0ControlPercentEncodeSet);
	        } break;

	      case FRAGMENT:
	        if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
	        break;
	    }

	    pointer++;
	  }
	};

	// `URL` constructor
	// https://url.spec.whatwg.org/#url-class
	var URLConstructor = function URL(url /* , base */) {
	  var that = anInstance(this, URLConstructor, 'URL');
	  var base = arguments.length > 1 ? arguments[1] : undefined;
	  var urlString = String(url);
	  var state = setInternalState$8(that, { type: 'URL' });
	  var baseState, failure;
	  if (base !== undefined) {
	    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
	    else {
	      failure = parseURL(baseState = {}, String(base));
	      if (failure) throw TypeError(failure);
	    }
	  }
	  failure = parseURL(state, urlString, null, baseState);
	  if (failure) throw TypeError(failure);
	  var searchParams = state.searchParams = new URLSearchParams$1();
	  var searchParamsState = getInternalSearchParamsState(searchParams);
	  searchParamsState.updateSearchParams(state.query);
	  searchParamsState.updateURL = function () {
	    state.query = String(searchParams) || null;
	  };
	  if (!descriptors) {
	    that.href = serializeURL.call(that);
	    that.origin = getOrigin.call(that);
	    that.protocol = getProtocol.call(that);
	    that.username = getUsername.call(that);
	    that.password = getPassword.call(that);
	    that.host = getHost.call(that);
	    that.hostname = getHostname.call(that);
	    that.port = getPort.call(that);
	    that.pathname = getPathname.call(that);
	    that.search = getSearch.call(that);
	    that.searchParams = getSearchParams.call(that);
	    that.hash = getHash.call(that);
	  }
	};

	var URLPrototype = URLConstructor.prototype;

	var serializeURL = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var username = url.username;
	  var password = url.password;
	  var host = url.host;
	  var port = url.port;
	  var path = url.path;
	  var query = url.query;
	  var fragment = url.fragment;
	  var output = scheme + ':';
	  if (host !== null) {
	    output += '//';
	    if (includesCredentials(url)) {
	      output += username + (password ? ':' + password : '') + '@';
	    }
	    output += serializeHost(host);
	    if (port !== null) output += ':' + port;
	  } else if (scheme == 'file') output += '//';
	  output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	  if (query !== null) output += '?' + query;
	  if (fragment !== null) output += '#' + fragment;
	  return output;
	};

	var getOrigin = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var port = url.port;
	  if (scheme == 'blob') try {
	    return new URL(scheme.path[0]).origin;
	  } catch (error) {
	    return 'null';
	  }
	  if (scheme == 'file' || !isSpecial(url)) return 'null';
	  return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
	};

	var getProtocol = function () {
	  return getInternalURLState(this).scheme + ':';
	};

	var getUsername = function () {
	  return getInternalURLState(this).username;
	};

	var getPassword = function () {
	  return getInternalURLState(this).password;
	};

	var getHost = function () {
	  var url = getInternalURLState(this);
	  var host = url.host;
	  var port = url.port;
	  return host === null ? ''
	    : port === null ? serializeHost(host)
	    : serializeHost(host) + ':' + port;
	};

	var getHostname = function () {
	  var host = getInternalURLState(this).host;
	  return host === null ? '' : serializeHost(host);
	};

	var getPort = function () {
	  var port = getInternalURLState(this).port;
	  return port === null ? '' : String(port);
	};

	var getPathname = function () {
	  var url = getInternalURLState(this);
	  var path = url.path;
	  return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	};

	var getSearch = function () {
	  var query = getInternalURLState(this).query;
	  return query ? '?' + query : '';
	};

	var getSearchParams = function () {
	  return getInternalURLState(this).searchParams;
	};

	var getHash = function () {
	  var fragment = getInternalURLState(this).fragment;
	  return fragment ? '#' + fragment : '';
	};

	var accessorDescriptor = function (getter, setter) {
	  return { get: getter, set: setter, configurable: true, enumerable: true };
	};

	if (descriptors) {
	  objectDefineProperties(URLPrototype, {
	    // `URL.prototype.href` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-href
	    href: accessorDescriptor(serializeURL, function (href) {
	      var url = getInternalURLState(this);
	      var urlString = String(href);
	      var failure = parseURL(url, urlString);
	      if (failure) throw TypeError(failure);
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.origin` getter
	    // https://url.spec.whatwg.org/#dom-url-origin
	    origin: accessorDescriptor(getOrigin),
	    // `URL.prototype.protocol` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-protocol
	    protocol: accessorDescriptor(getProtocol, function (protocol) {
	      var url = getInternalURLState(this);
	      parseURL(url, String(protocol) + ':', SCHEME_START);
	    }),
	    // `URL.prototype.username` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-username
	    username: accessorDescriptor(getUsername, function (username) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(username));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.username = '';
	      for (var i = 0; i < codePoints.length; i++) {
	        url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.password` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-password
	    password: accessorDescriptor(getPassword, function (password) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(password));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.password = '';
	      for (var i = 0; i < codePoints.length; i++) {
	        url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.host` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-host
	    host: accessorDescriptor(getHost, function (host) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(host), HOST);
	    }),
	    // `URL.prototype.hostname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hostname
	    hostname: accessorDescriptor(getHostname, function (hostname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(hostname), HOSTNAME);
	    }),
	    // `URL.prototype.port` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-port
	    port: accessorDescriptor(getPort, function (port) {
	      var url = getInternalURLState(this);
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      port = String(port);
	      if (port == '') url.port = null;
	      else parseURL(url, port, PORT);
	    }),
	    // `URL.prototype.pathname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-pathname
	    pathname: accessorDescriptor(getPathname, function (pathname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      url.path = [];
	      parseURL(url, pathname + '', PATH_START);
	    }),
	    // `URL.prototype.search` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-search
	    search: accessorDescriptor(getSearch, function (search) {
	      var url = getInternalURLState(this);
	      search = String(search);
	      if (search == '') {
	        url.query = null;
	      } else {
	        if ('?' == search.charAt(0)) search = search.slice(1);
	        url.query = '';
	        parseURL(url, search, QUERY);
	      }
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.searchParams` getter
	    // https://url.spec.whatwg.org/#dom-url-searchparams
	    searchParams: accessorDescriptor(getSearchParams),
	    // `URL.prototype.hash` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hash
	    hash: accessorDescriptor(getHash, function (hash) {
	      var url = getInternalURLState(this);
	      hash = String(hash);
	      if (hash == '') {
	        url.fragment = null;
	        return;
	      }
	      if ('#' == hash.charAt(0)) hash = hash.slice(1);
	      url.fragment = '';
	      parseURL(url, hash, FRAGMENT);
	    })
	  });
	}

	// `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson
	redefine(URLPrototype, 'toJSON', function toJSON() {
	  return serializeURL.call(this);
	}, { enumerable: true });

	// `URL.prototype.toString` method
	// https://url.spec.whatwg.org/#URL-stringification-behavior
	redefine(URLPrototype, 'toString', function toString() {
	  return serializeURL.call(this);
	}, { enumerable: true });

	if (NativeURL) {
	  var nativeCreateObjectURL = NativeURL.createObjectURL;
	  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
	  // `URL.createObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
	  // eslint-disable-next-line no-unused-vars
	  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
	    return nativeCreateObjectURL.apply(NativeURL, arguments);
	  });
	  // `URL.revokeObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
	  // eslint-disable-next-line no-unused-vars
	  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
	    return nativeRevokeObjectURL.apply(NativeURL, arguments);
	  });
	}

	setToStringTag(URLConstructor, 'URL');

	_export({ global: true, forced: !nativeUrl, sham: !descriptors }, {
	  URL: URLConstructor
	});

	var voyantjs=createCommonjsModule(function(module,exports){(function(f){{module.exports=f();}})(function(){return function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof commonjsRequire&&commonjsRequire;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a;}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r);},p,p.exports,r,e,n,t);}return n[i].exports;}for(var u="function"==typeof commonjsRequire&&commonjsRequire,i=0;i<t.length;i++){o(t[i]);}return o;}return r;}()({1:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"Corpus",{enumerable:true,get:function get(){return _corpus["default"];}});Object.defineProperty(exports,"Table",{enumerable:true,get:function get(){return _table["default"];}});Object.defineProperty(exports,"Load",{enumerable:true,get:function get(){return _load["default"];}});Object.defineProperty(exports,"Util",{enumerable:true,get:function get(){return _util["default"];}});Object.defineProperty(exports,"Chart",{enumerable:true,get:function get(){return _chart["default"];}});Object.defineProperty(exports,"Categories",{enumerable:true,get:function get(){return _categories["default"];}});var _corpus=_interopRequireDefault(require("./src/corpus"));var _table=_interopRequireDefault(require("./src/table"));var _load=_interopRequireDefault(require("./src/load"));var _util=_interopRequireDefault(require("./src/util"));var _chart=_interopRequireDefault(require("./src/chart"));var _categories=_interopRequireDefault(require("./src/categories"));},{"./src/categories":271,"./src/chart":272,"./src/corpus":273,"./src/load":274,"./src/table":276,"./src/util":277,"@babel/runtime/helpers/interopRequireDefault":37}],2:[function(require,module,exports){module.exports=require("core-js-pure/stable/array/from");},{"core-js-pure/stable/array/from":237}],3:[function(require,module,exports){module.exports=require("core-js-pure/stable/array/is-array");},{"core-js-pure/stable/array/is-array":238}],4:[function(require,module,exports){module.exports=require("core-js-pure/stable/instance/concat");},{"core-js-pure/stable/instance/concat":242}],5:[function(require,module,exports){module.exports=require("core-js-pure/stable/instance/flags");},{"core-js-pure/stable/instance/flags":243}],6:[function(require,module,exports){module.exports=require("core-js-pure/stable/instance/for-each");},{"core-js-pure/stable/instance/for-each":244}],7:[function(require,module,exports){module.exports=require("core-js-pure/stable/instance/includes");},{"core-js-pure/stable/instance/includes":245}],8:[function(require,module,exports){module.exports=require("core-js-pure/stable/instance/index-of");},{"core-js-pure/stable/instance/index-of":246}],9:[function(require,module,exports){module.exports=require("core-js-pure/stable/instance/map");},{"core-js-pure/stable/instance/map":247}],10:[function(require,module,exports){module.exports=require("core-js-pure/stable/instance/reduce");},{"core-js-pure/stable/instance/reduce":248}],11:[function(require,module,exports){module.exports=require("core-js-pure/stable/instance/slice");},{"core-js-pure/stable/instance/slice":249}],12:[function(require,module,exports){module.exports=require("core-js-pure/stable/instance/sort");},{"core-js-pure/stable/instance/sort":250}],13:[function(require,module,exports){module.exports=require("core-js-pure/stable/object/create");},{"core-js-pure/stable/object/create":251}],14:[function(require,module,exports){module.exports=require("core-js-pure/stable/object/define-property");},{"core-js-pure/stable/object/define-property":252}],15:[function(require,module,exports){module.exports=require("core-js-pure/stable/parse-int");},{"core-js-pure/stable/parse-int":253}],16:[function(require,module,exports){module.exports=require("core-js-pure/stable/symbol");},{"core-js-pure/stable/symbol":254}],17:[function(require,module,exports){module.exports=require("core-js-pure/features/array/from");},{"core-js-pure/features/array/from":72}],18:[function(require,module,exports){module.exports=require("core-js-pure/features/array/is-array");},{"core-js-pure/features/array/is-array":73}],19:[function(require,module,exports){module.exports=require("core-js-pure/features/get-iterator-method");},{"core-js-pure/features/get-iterator-method":74}],20:[function(require,module,exports){module.exports=require("core-js-pure/features/get-iterator");},{"core-js-pure/features/get-iterator":75}],21:[function(require,module,exports){module.exports=require("core-js-pure/features/instance/slice");},{"core-js-pure/features/instance/slice":76}],22:[function(require,module,exports){module.exports=require("core-js-pure/features/symbol");},{"core-js-pure/features/symbol":77}],23:[function(require,module,exports){function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i];}return arr2;}module.exports=_arrayLikeToArray;module.exports["default"]=module.exports,module.exports.__esModule=true;},{}],24:[function(require,module,exports){var _Array$isArray=require("@babel/runtime-corejs3/core-js/array/is-array");function _arrayWithHoles(arr){if(_Array$isArray(arr))return arr;}module.exports=_arrayWithHoles;module.exports["default"]=module.exports,module.exports.__esModule=true;},{"@babel/runtime-corejs3/core-js/array/is-array":18}],25:[function(require,module,exports){function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj};}module.exports=_interopRequireDefault;module.exports["default"]=module.exports,module.exports.__esModule=true;},{}],26:[function(require,module,exports){var _Symbol=require("@babel/runtime-corejs3/core-js/symbol");var _getIteratorMethod=require("@babel/runtime-corejs3/core-js/get-iterator-method");function _iterableToArrayLimit(arr,i){var _i=arr==null?null:typeof _Symbol!=="undefined"&&_getIteratorMethod(arr)||arr["@@iterator"];if(_i==null)return;var _arr=[];var _n=true;var _d=false;var _s,_e;try{for(_i=_i.call(arr);!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break;}}catch(err){_d=true;_e=err;}finally{try{if(!_n&&_i["return"]!=null)_i["return"]();}finally{if(_d)throw _e;}}return _arr;}module.exports=_iterableToArrayLimit;module.exports["default"]=module.exports,module.exports.__esModule=true;},{"@babel/runtime-corejs3/core-js/get-iterator-method":19,"@babel/runtime-corejs3/core-js/symbol":22}],27:[function(require,module,exports){function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}module.exports=_nonIterableRest;module.exports["default"]=module.exports,module.exports.__esModule=true;},{}],28:[function(require,module,exports){var arrayWithHoles=require("./arrayWithHoles.js");var iterableToArrayLimit=require("./iterableToArrayLimit.js");var unsupportedIterableToArray=require("./unsupportedIterableToArray.js");var nonIterableRest=require("./nonIterableRest.js");function _slicedToArray(arr,i){return arrayWithHoles(arr)||iterableToArrayLimit(arr,i)||unsupportedIterableToArray(arr,i)||nonIterableRest();}module.exports=_slicedToArray;module.exports["default"]=module.exports,module.exports.__esModule=true;},{"./arrayWithHoles.js":24,"./iterableToArrayLimit.js":26,"./nonIterableRest.js":27,"./unsupportedIterableToArray.js":29}],29:[function(require,module,exports){var _sliceInstanceProperty=require("@babel/runtime-corejs3/core-js/instance/slice");var _Array$from=require("@babel/runtime-corejs3/core-js/array/from");var arrayLikeToArray=require("./arrayLikeToArray.js");function _unsupportedIterableToArray(o,minLen){var _context;if(!o)return;if(typeof o==="string")return arrayLikeToArray(o,minLen);var n=_sliceInstanceProperty(_context=Object.prototype.toString.call(o)).call(_context,8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return _Array$from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return arrayLikeToArray(o,minLen);}module.exports=_unsupportedIterableToArray;module.exports["default"]=module.exports,module.exports.__esModule=true;},{"./arrayLikeToArray.js":23,"@babel/runtime-corejs3/core-js/array/from":17,"@babel/runtime-corejs3/core-js/instance/slice":21}],30:[function(require,module,exports){function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i];}return arr2;}module.exports=_arrayLikeToArray;},{}],31:[function(require,module,exports){function _arrayWithHoles(arr){if(Array.isArray(arr))return arr;}module.exports=_arrayWithHoles;},{}],32:[function(require,module,exports){function asyncGeneratorStep(gen,resolve,reject,_next,_throw,key,arg){try{var info=gen[key](arg);var value=info.value;}catch(error){reject(error);return;}if(info.done){resolve(value);}else {Promise.resolve(value).then(_next,_throw);}}function _asyncToGenerator(fn){return function(){var self=this,args=arguments;return new Promise(function(resolve,reject){var gen=fn.apply(self,args);function _next(value){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"next",value);}function _throw(err){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"throw",err);}_next(undefined);});};}module.exports=_asyncToGenerator;},{}],33:[function(require,module,exports){function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}module.exports=_classCallCheck;},{}],34:[function(require,module,exports){var setPrototypeOf=require("./setPrototypeOf");var isNativeReflectConstruct=require("./isNativeReflectConstruct");function _construct(Parent,args,Class){if(isNativeReflectConstruct()){module.exports=_construct=Reflect.construct;}else {module.exports=_construct=function _construct(Parent,args,Class){var a=[null];a.push.apply(a,args);var Constructor=Function.bind.apply(Parent,a);var instance=new Constructor();if(Class)setPrototypeOf(instance,Class.prototype);return instance;};}return _construct.apply(null,arguments);}module.exports=_construct;},{"./isNativeReflectConstruct":38,"./setPrototypeOf":41}],35:[function(require,module,exports){function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);return Constructor;}module.exports=_createClass;},{}],36:[function(require,module,exports){function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj;}module.exports=_defineProperty;},{}],37:[function(require,module,exports){function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj};}module.exports=_interopRequireDefault;},{}],38:[function(require,module,exports){function _isNativeReflectConstruct(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Date.prototype.toString.call(Reflect.construct(Date,[],function(){}));return true;}catch(e){return false;}}module.exports=_isNativeReflectConstruct;},{}],39:[function(require,module,exports){function _iterableToArrayLimit(arr,i){if(typeof Symbol==="undefined"||!(Symbol.iterator in Object(arr)))return;var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break;}}catch(err){_d=true;_e=err;}finally{try{if(!_n&&_i["return"]!=null)_i["return"]();}finally{if(_d)throw _e;}}return _arr;}module.exports=_iterableToArrayLimit;},{}],40:[function(require,module,exports){function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}module.exports=_nonIterableRest;},{}],41:[function(require,module,exports){function _setPrototypeOf(o,p){module.exports=_setPrototypeOf=Object.setPrototypeOf||function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}module.exports=_setPrototypeOf;},{}],42:[function(require,module,exports){var arrayWithHoles=require("./arrayWithHoles");var iterableToArrayLimit=require("./iterableToArrayLimit");var unsupportedIterableToArray=require("./unsupportedIterableToArray");var nonIterableRest=require("./nonIterableRest");function _slicedToArray(arr,i){return arrayWithHoles(arr)||iterableToArrayLimit(arr,i)||unsupportedIterableToArray(arr,i)||nonIterableRest();}module.exports=_slicedToArray;},{"./arrayWithHoles":31,"./iterableToArrayLimit":39,"./nonIterableRest":40,"./unsupportedIterableToArray":44}],43:[function(require,module,exports){function _typeof(obj){"@babel/helpers - typeof";if(typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"){module.exports=_typeof=function _typeof(obj){return typeof obj;};}else {module.exports=_typeof=function _typeof(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};}return _typeof(obj);}module.exports=_typeof;},{}],44:[function(require,module,exports){var arrayLikeToArray=require("./arrayLikeToArray");function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(n);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return arrayLikeToArray(o,minLen);}module.exports=_unsupportedIterableToArray;},{"./arrayLikeToArray":30}],45:[function(require,module,exports){module.exports=require("regenerator-runtime");},{"regenerator-runtime":257}],46:[function(require,module,exports){require('../../modules/es.string.iterator');require('../../modules/es.array.from');var path=require('../../internals/path');module.exports=path.Array.from;},{"../../internals/path":167,"../../modules/es.array.from":195,"../../modules/es.string.iterator":213}],47:[function(require,module,exports){require('../../modules/es.array.is-array');var path=require('../../internals/path');module.exports=path.Array.isArray;},{"../../internals/path":167,"../../modules/es.array.is-array":198}],48:[function(require,module,exports){require('../../../modules/es.array.concat');var entryVirtual=require('../../../internals/entry-virtual');module.exports=entryVirtual('Array').concat;},{"../../../internals/entry-virtual":114,"../../../modules/es.array.concat":193}],49:[function(require,module,exports){require('../../../modules/es.array.for-each');var entryVirtual=require('../../../internals/entry-virtual');module.exports=entryVirtual('Array').forEach;},{"../../../internals/entry-virtual":114,"../../../modules/es.array.for-each":194}],50:[function(require,module,exports){require('../../../modules/es.array.includes');var entryVirtual=require('../../../internals/entry-virtual');module.exports=entryVirtual('Array').includes;},{"../../../internals/entry-virtual":114,"../../../modules/es.array.includes":196}],51:[function(require,module,exports){require('../../../modules/es.array.index-of');var entryVirtual=require('../../../internals/entry-virtual');module.exports=entryVirtual('Array').indexOf;},{"../../../internals/entry-virtual":114,"../../../modules/es.array.index-of":197}],52:[function(require,module,exports){require('../../../modules/es.array.map');var entryVirtual=require('../../../internals/entry-virtual');module.exports=entryVirtual('Array').map;},{"../../../internals/entry-virtual":114,"../../../modules/es.array.map":200}],53:[function(require,module,exports){require('../../../modules/es.array.reduce');var entryVirtual=require('../../../internals/entry-virtual');module.exports=entryVirtual('Array').reduce;},{"../../../internals/entry-virtual":114,"../../../modules/es.array.reduce":201}],54:[function(require,module,exports){require('../../../modules/es.array.slice');var entryVirtual=require('../../../internals/entry-virtual');module.exports=entryVirtual('Array').slice;},{"../../../internals/entry-virtual":114,"../../../modules/es.array.slice":202}],55:[function(require,module,exports){require('../../../modules/es.array.sort');var entryVirtual=require('../../../internals/entry-virtual');module.exports=entryVirtual('Array').sort;},{"../../../internals/entry-virtual":114,"../../../modules/es.array.sort":203}],56:[function(require,module,exports){require('../modules/es.array.iterator');require('../modules/es.string.iterator');var getIteratorMethod=require('../internals/get-iterator-method');module.exports=getIteratorMethod;},{"../internals/get-iterator-method":124,"../modules/es.array.iterator":199,"../modules/es.string.iterator":213}],57:[function(require,module,exports){require('../modules/es.array.iterator');require('../modules/es.string.iterator');var getIterator=require('../internals/get-iterator');module.exports=getIterator;},{"../internals/get-iterator":125,"../modules/es.array.iterator":199,"../modules/es.string.iterator":213}],58:[function(require,module,exports){var isPrototypeOf=require('../../internals/object-is-prototype-of');var method=require('../array/virtual/concat');var ArrayPrototype=Array.prototype;module.exports=function(it){var own=it.concat;return it===ArrayPrototype||isPrototypeOf(ArrayPrototype,it)&&own===ArrayPrototype.concat?method:own;};},{"../../internals/object-is-prototype-of":160,"../array/virtual/concat":48}],59:[function(require,module,exports){var isPrototypeOf=require('../../internals/object-is-prototype-of');var flags=require('../regexp/flags');var RegExpPrototype=RegExp.prototype;module.exports=function(it){return it===RegExpPrototype||isPrototypeOf(RegExpPrototype,it)?flags(it):it.flags;};},{"../../internals/object-is-prototype-of":160,"../regexp/flags":69}],60:[function(require,module,exports){var isPrototypeOf=require('../../internals/object-is-prototype-of');var arrayMethod=require('../array/virtual/includes');var stringMethod=require('../string/virtual/includes');var ArrayPrototype=Array.prototype;var StringPrototype=String.prototype;module.exports=function(it){var own=it.includes;if(it===ArrayPrototype||isPrototypeOf(ArrayPrototype,it)&&own===ArrayPrototype.includes)return arrayMethod;if(typeof it=='string'||it===StringPrototype||isPrototypeOf(StringPrototype,it)&&own===StringPrototype.includes){return stringMethod;}return own;};},{"../../internals/object-is-prototype-of":160,"../array/virtual/includes":50,"../string/virtual/includes":70}],61:[function(require,module,exports){var isPrototypeOf=require('../../internals/object-is-prototype-of');var method=require('../array/virtual/index-of');var ArrayPrototype=Array.prototype;module.exports=function(it){var own=it.indexOf;return it===ArrayPrototype||isPrototypeOf(ArrayPrototype,it)&&own===ArrayPrototype.indexOf?method:own;};},{"../../internals/object-is-prototype-of":160,"../array/virtual/index-of":51}],62:[function(require,module,exports){var isPrototypeOf=require('../../internals/object-is-prototype-of');var method=require('../array/virtual/map');var ArrayPrototype=Array.prototype;module.exports=function(it){var own=it.map;return it===ArrayPrototype||isPrototypeOf(ArrayPrototype,it)&&own===ArrayPrototype.map?method:own;};},{"../../internals/object-is-prototype-of":160,"../array/virtual/map":52}],63:[function(require,module,exports){var isPrototypeOf=require('../../internals/object-is-prototype-of');var method=require('../array/virtual/reduce');var ArrayPrototype=Array.prototype;module.exports=function(it){var own=it.reduce;return it===ArrayPrototype||isPrototypeOf(ArrayPrototype,it)&&own===ArrayPrototype.reduce?method:own;};},{"../../internals/object-is-prototype-of":160,"../array/virtual/reduce":53}],64:[function(require,module,exports){var isPrototypeOf=require('../../internals/object-is-prototype-of');var method=require('../array/virtual/slice');var ArrayPrototype=Array.prototype;module.exports=function(it){var own=it.slice;return it===ArrayPrototype||isPrototypeOf(ArrayPrototype,it)&&own===ArrayPrototype.slice?method:own;};},{"../../internals/object-is-prototype-of":160,"../array/virtual/slice":54}],65:[function(require,module,exports){var isPrototypeOf=require('../../internals/object-is-prototype-of');var method=require('../array/virtual/sort');var ArrayPrototype=Array.prototype;module.exports=function(it){var own=it.sort;return it===ArrayPrototype||isPrototypeOf(ArrayPrototype,it)&&own===ArrayPrototype.sort?method:own;};},{"../../internals/object-is-prototype-of":160,"../array/virtual/sort":55}],66:[function(require,module,exports){require('../../modules/es.object.create');var path=require('../../internals/path');var Object=path.Object;module.exports=function create(P,D){return Object.create(P,D);};},{"../../internals/path":167,"../../modules/es.object.create":206}],67:[function(require,module,exports){require('../../modules/es.object.define-property');var path=require('../../internals/path');var Object=path.Object;var defineProperty=module.exports=function defineProperty(it,key,desc){return Object.defineProperty(it,key,desc);};if(Object.defineProperty.sham)defineProperty.sham=true;},{"../../internals/path":167,"../../modules/es.object.define-property":207}],68:[function(require,module,exports){require('../modules/es.parse-int');var path=require('../internals/path');module.exports=path.parseInt;},{"../internals/path":167,"../modules/es.parse-int":209}],69:[function(require,module,exports){require('../../modules/es.regexp.flags');var uncurryThis=require('../../internals/function-uncurry-this');var regExpFlags=require('../../internals/regexp-flags');module.exports=uncurryThis(regExpFlags);},{"../../internals/function-uncurry-this":122,"../../internals/regexp-flags":169,"../../modules/es.regexp.flags":211}],70:[function(require,module,exports){require('../../../modules/es.string.includes');var entryVirtual=require('../../../internals/entry-virtual');module.exports=entryVirtual('String').includes;},{"../../../internals/entry-virtual":114,"../../../modules/es.string.includes":212}],71:[function(require,module,exports){require('../../modules/es.array.concat');require('../../modules/es.object.to-string');require('../../modules/es.symbol');require('../../modules/es.symbol.async-iterator');require('../../modules/es.symbol.description');require('../../modules/es.symbol.has-instance');require('../../modules/es.symbol.is-concat-spreadable');require('../../modules/es.symbol.iterator');require('../../modules/es.symbol.match');require('../../modules/es.symbol.match-all');require('../../modules/es.symbol.replace');require('../../modules/es.symbol.search');require('../../modules/es.symbol.species');require('../../modules/es.symbol.split');require('../../modules/es.symbol.to-primitive');require('../../modules/es.symbol.to-string-tag');require('../../modules/es.symbol.unscopables');require('../../modules/es.json.to-string-tag');require('../../modules/es.math.to-string-tag');require('../../modules/es.reflect.to-string-tag');var path=require('../../internals/path');module.exports=path.Symbol;},{"../../internals/path":167,"../../modules/es.array.concat":193,"../../modules/es.json.to-string-tag":204,"../../modules/es.math.to-string-tag":205,"../../modules/es.object.to-string":208,"../../modules/es.reflect.to-string-tag":210,"../../modules/es.symbol":219,"../../modules/es.symbol.async-iterator":214,"../../modules/es.symbol.description":215,"../../modules/es.symbol.has-instance":216,"../../modules/es.symbol.is-concat-spreadable":217,"../../modules/es.symbol.iterator":218,"../../modules/es.symbol.match":221,"../../modules/es.symbol.match-all":220,"../../modules/es.symbol.replace":222,"../../modules/es.symbol.search":223,"../../modules/es.symbol.species":224,"../../modules/es.symbol.split":225,"../../modules/es.symbol.to-primitive":226,"../../modules/es.symbol.to-string-tag":227,"../../modules/es.symbol.unscopables":228}],72:[function(require,module,exports){var parent=require('../../stable/array/from');module.exports=parent;},{"../../stable/array/from":237}],73:[function(require,module,exports){var parent=require('../../stable/array/is-array');module.exports=parent;},{"../../stable/array/is-array":238}],74:[function(require,module,exports){var parent=require('../stable/get-iterator-method');module.exports=parent;},{"../stable/get-iterator-method":240}],75:[function(require,module,exports){var parent=require('../stable/get-iterator');module.exports=parent;},{"../stable/get-iterator":241}],76:[function(require,module,exports){var parent=require('../../stable/instance/slice');module.exports=parent;},{"../../stable/instance/slice":249}],77:[function(require,module,exports){var parent=require('../../stable/symbol');require('../../modules/esnext.symbol.async-dispose');require('../../modules/esnext.symbol.dispose');require('../../modules/esnext.symbol.matcher');require('../../modules/esnext.symbol.metadata');require('../../modules/esnext.symbol.observable');// TODO: Remove from `core-js@4`
	require('../../modules/esnext.symbol.pattern-match');// TODO: Remove from `core-js@4`
	require('../../modules/esnext.symbol.replace-all');module.exports=parent;},{"../../modules/esnext.symbol.async-dispose":229,"../../modules/esnext.symbol.dispose":230,"../../modules/esnext.symbol.matcher":231,"../../modules/esnext.symbol.metadata":232,"../../modules/esnext.symbol.observable":233,"../../modules/esnext.symbol.pattern-match":234,"../../modules/esnext.symbol.replace-all":235,"../../stable/symbol":254}],78:[function(require,module,exports){var global=require('../internals/global');var isCallable=require('../internals/is-callable');var tryToString=require('../internals/try-to-string');var TypeError=global.TypeError;// `Assert: IsCallable(argument) is true`
	module.exports=function(argument){if(isCallable(argument))return argument;throw TypeError(tryToString(argument)+' is not a function');};},{"../internals/global":127,"../internals/is-callable":137,"../internals/try-to-string":187}],79:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));var global=require('../internals/global');var isCallable=require('../internals/is-callable');var String=global.String;var TypeError=global.TypeError;module.exports=function(argument){if((0, _typeof2["default"])(argument)=='object'||isCallable(argument))return argument;throw TypeError("Can't set "+String(argument)+' as a prototype');};},{"../internals/global":127,"../internals/is-callable":137,"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/typeof":43}],80:[function(require,module,exports){module.exports=function(){/* empty */};},{}],81:[function(require,module,exports){var global=require('../internals/global');var isObject=require('../internals/is-object');var String=global.String;var TypeError=global.TypeError;// `Assert: Type(argument) is Object`
	module.exports=function(argument){if(isObject(argument))return argument;throw TypeError(String(argument)+' is not an object');};},{"../internals/global":127,"../internals/is-object":140}],82:[function(require,module,exports){var $forEach=require('../internals/array-iteration').forEach;var arrayMethodIsStrict=require('../internals/array-method-is-strict');var STRICT_METHOD=arrayMethodIsStrict('forEach');// `Array.prototype.forEach` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	module.exports=!STRICT_METHOD?function forEach(callbackfn/* , thisArg */){return $forEach(this,callbackfn,arguments.length>1?arguments[1]:undefined);// eslint-disable-next-line es/no-array-prototype-foreach -- safe
	}:[].forEach;},{"../internals/array-iteration":85,"../internals/array-method-is-strict":87}],83:[function(require,module,exports){var global=require('../internals/global');var bind=require('../internals/function-bind-context');var call=require('../internals/function-call');var toObject=require('../internals/to-object');var callWithSafeIterationClosing=require('../internals/call-with-safe-iteration-closing');var isArrayIteratorMethod=require('../internals/is-array-iterator-method');var isConstructor=require('../internals/is-constructor');var lengthOfArrayLike=require('../internals/length-of-array-like');var createProperty=require('../internals/create-property');var getIterator=require('../internals/get-iterator');var getIteratorMethod=require('../internals/get-iterator-method');var Array=global.Array;// `Array.from` method implementation
	// https://tc39.es/ecma262/#sec-array.from
	module.exports=function from(arrayLike/* , mapfn = undefined, thisArg = undefined */){var O=toObject(arrayLike);var IS_CONSTRUCTOR=isConstructor(this);var argumentsLength=arguments.length;var mapfn=argumentsLength>1?arguments[1]:undefined;var mapping=mapfn!==undefined;if(mapping)mapfn=bind(mapfn,argumentsLength>2?arguments[2]:undefined);var iteratorMethod=getIteratorMethod(O);var index=0;var length,result,step,iterator,next,value;// if the target is not iterable or it's an array with the default iterator - use a simple case
	if(iteratorMethod&&!(this==Array&&isArrayIteratorMethod(iteratorMethod))){iterator=getIterator(O,iteratorMethod);next=iterator.next;result=IS_CONSTRUCTOR?new this():[];for(;!(step=call(next,iterator)).done;index++){value=mapping?callWithSafeIterationClosing(iterator,mapfn,[step.value,index],true):step.value;createProperty(result,index,value);}}else {length=lengthOfArrayLike(O);result=IS_CONSTRUCTOR?new this(length):Array(length);for(;length>index;index++){value=mapping?mapfn(O[index],index):O[index];createProperty(result,index,value);}}result.length=index;return result;};},{"../internals/call-with-safe-iteration-closing":93,"../internals/create-property":102,"../internals/function-bind-context":119,"../internals/function-call":120,"../internals/get-iterator":125,"../internals/get-iterator-method":124,"../internals/global":127,"../internals/is-array-iterator-method":135,"../internals/is-constructor":138,"../internals/length-of-array-like":147,"../internals/to-object":182}],84:[function(require,module,exports){var toIndexedObject=require('../internals/to-indexed-object');var toAbsoluteIndex=require('../internals/to-absolute-index');var lengthOfArrayLike=require('../internals/length-of-array-like');// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod=function createMethod(IS_INCLUDES){return function($this,el,fromIndex){var O=toIndexedObject($this);var length=lengthOfArrayLike(O);var index=toAbsoluteIndex(fromIndex,length);var value;// Array#includes uses SameValueZero equality algorithm
	// eslint-disable-next-line no-self-compare -- NaN check
	if(IS_INCLUDES&&el!=el)while(length>index){value=O[index++];// eslint-disable-next-line no-self-compare -- NaN check
	if(value!=value)return true;// Array#indexOf ignores holes, Array#includes - not
	}else for(;length>index;index++){if((IS_INCLUDES||index in O)&&O[index]===el)return IS_INCLUDES||index||0;}return !IS_INCLUDES&&-1;};};module.exports={// `Array.prototype.includes` method
	// https://tc39.es/ecma262/#sec-array.prototype.includes
	includes:createMethod(true),// `Array.prototype.indexOf` method
	// https://tc39.es/ecma262/#sec-array.prototype.indexof
	indexOf:createMethod(false)};},{"../internals/length-of-array-like":147,"../internals/to-absolute-index":178,"../internals/to-indexed-object":179}],85:[function(require,module,exports){var bind=require('../internals/function-bind-context');var uncurryThis=require('../internals/function-uncurry-this');var IndexedObject=require('../internals/indexed-object');var toObject=require('../internals/to-object');var lengthOfArrayLike=require('../internals/length-of-array-like');var arraySpeciesCreate=require('../internals/array-species-create');var push=uncurryThis([].push);// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
	var createMethod=function createMethod(TYPE){var IS_MAP=TYPE==1;var IS_FILTER=TYPE==2;var IS_SOME=TYPE==3;var IS_EVERY=TYPE==4;var IS_FIND_INDEX=TYPE==6;var IS_FILTER_REJECT=TYPE==7;var NO_HOLES=TYPE==5||IS_FIND_INDEX;return function($this,callbackfn,that,specificCreate){var O=toObject($this);var self=IndexedObject(O);var boundFunction=bind(callbackfn,that);var length=lengthOfArrayLike(self);var index=0;var create=specificCreate||arraySpeciesCreate;var target=IS_MAP?create($this,length):IS_FILTER||IS_FILTER_REJECT?create($this,0):undefined;var value,result;for(;length>index;index++){if(NO_HOLES||index in self){value=self[index];result=boundFunction(value,index,O);if(TYPE){if(IS_MAP)target[index]=result;// map
	else if(result)switch(TYPE){case 3:return true;// some
	case 5:return value;// find
	case 6:return index;// findIndex
	case 2:push(target,value);// filter
	}else switch(TYPE){case 4:return false;// every
	case 7:push(target,value);// filterReject
	}}}}return IS_FIND_INDEX?-1:IS_SOME||IS_EVERY?IS_EVERY:target;};};module.exports={// `Array.prototype.forEach` method
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	forEach:createMethod(0),// `Array.prototype.map` method
	// https://tc39.es/ecma262/#sec-array.prototype.map
	map:createMethod(1),// `Array.prototype.filter` method
	// https://tc39.es/ecma262/#sec-array.prototype.filter
	filter:createMethod(2),// `Array.prototype.some` method
	// https://tc39.es/ecma262/#sec-array.prototype.some
	some:createMethod(3),// `Array.prototype.every` method
	// https://tc39.es/ecma262/#sec-array.prototype.every
	every:createMethod(4),// `Array.prototype.find` method
	// https://tc39.es/ecma262/#sec-array.prototype.find
	find:createMethod(5),// `Array.prototype.findIndex` method
	// https://tc39.es/ecma262/#sec-array.prototype.findIndex
	findIndex:createMethod(6),// `Array.prototype.filterReject` method
	// https://github.com/tc39/proposal-array-filtering
	filterReject:createMethod(7)};},{"../internals/array-species-create":92,"../internals/function-bind-context":119,"../internals/function-uncurry-this":122,"../internals/indexed-object":132,"../internals/length-of-array-like":147,"../internals/to-object":182}],86:[function(require,module,exports){var fails=require('../internals/fails');var wellKnownSymbol=require('../internals/well-known-symbol');var V8_VERSION=require('../internals/engine-v8-version');var SPECIES=wellKnownSymbol('species');module.exports=function(METHOD_NAME){// We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/677
	return V8_VERSION>=51||!fails(function(){var array=[];var constructor=array.constructor={};constructor[SPECIES]=function(){return {foo:1};};return array[METHOD_NAME](Boolean).foo!==1;});};},{"../internals/engine-v8-version":112,"../internals/fails":117,"../internals/well-known-symbol":191}],87:[function(require,module,exports){var fails=require('../internals/fails');module.exports=function(METHOD_NAME,argument){var method=[][METHOD_NAME];return !!method&&fails(function(){// eslint-disable-next-line no-useless-call,no-throw-literal -- required for testing
	method.call(null,argument||function(){throw 1;},1);});};},{"../internals/fails":117}],88:[function(require,module,exports){var global=require('../internals/global');var aCallable=require('../internals/a-callable');var toObject=require('../internals/to-object');var IndexedObject=require('../internals/indexed-object');var lengthOfArrayLike=require('../internals/length-of-array-like');var TypeError=global.TypeError;// `Array.prototype.{ reduce, reduceRight }` methods implementation
	var createMethod=function createMethod(IS_RIGHT){return function(that,callbackfn,argumentsLength,memo){aCallable(callbackfn);var O=toObject(that);var self=IndexedObject(O);var length=lengthOfArrayLike(O);var index=IS_RIGHT?length-1:0;var i=IS_RIGHT?-1:1;if(argumentsLength<2)while(true){if(index in self){memo=self[index];index+=i;break;}index+=i;if(IS_RIGHT?index<0:length<=index){throw TypeError('Reduce of empty array with no initial value');}}for(;IS_RIGHT?index>=0:length>index;index+=i){if(index in self){memo=callbackfn(memo,self[index],index,O);}}return memo;};};module.exports={// `Array.prototype.reduce` method
	// https://tc39.es/ecma262/#sec-array.prototype.reduce
	left:createMethod(false),// `Array.prototype.reduceRight` method
	// https://tc39.es/ecma262/#sec-array.prototype.reduceright
	right:createMethod(true)};},{"../internals/a-callable":78,"../internals/global":127,"../internals/indexed-object":132,"../internals/length-of-array-like":147,"../internals/to-object":182}],89:[function(require,module,exports){var uncurryThis=require('../internals/function-uncurry-this');module.exports=uncurryThis([].slice);},{"../internals/function-uncurry-this":122}],90:[function(require,module,exports){var arraySlice=require('../internals/array-slice');var floor=Math.floor;var mergeSort=function mergeSort(array,comparefn){var length=array.length;var middle=floor(length/2);return length<8?insertionSort(array,comparefn):merge(array,mergeSort(arraySlice(array,0,middle),comparefn),mergeSort(arraySlice(array,middle),comparefn),comparefn);};var insertionSort=function insertionSort(array,comparefn){var length=array.length;var i=1;var element,j;while(i<length){j=i;element=array[i];while(j&&comparefn(array[j-1],element)>0){array[j]=array[--j];}if(j!==i++)array[j]=element;}return array;};var merge=function merge(array,left,right,comparefn){var llength=left.length;var rlength=right.length;var lindex=0;var rindex=0;while(lindex<llength||rindex<rlength){array[lindex+rindex]=lindex<llength&&rindex<rlength?comparefn(left[lindex],right[rindex])<=0?left[lindex++]:right[rindex++]:lindex<llength?left[lindex++]:right[rindex++];}return array;};module.exports=mergeSort;},{"../internals/array-slice":89}],91:[function(require,module,exports){var global=require('../internals/global');var isArray=require('../internals/is-array');var isConstructor=require('../internals/is-constructor');var isObject=require('../internals/is-object');var wellKnownSymbol=require('../internals/well-known-symbol');var SPECIES=wellKnownSymbol('species');var Array=global.Array;// a part of `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	module.exports=function(originalArray){var C;if(isArray(originalArray)){C=originalArray.constructor;// cross-realm fallback
	if(isConstructor(C)&&(C===Array||isArray(C.prototype)))C=undefined;else if(isObject(C)){C=C[SPECIES];if(C===null)C=undefined;}}return C===undefined?Array:C;};},{"../internals/global":127,"../internals/is-array":136,"../internals/is-constructor":138,"../internals/is-object":140,"../internals/well-known-symbol":191}],92:[function(require,module,exports){var arraySpeciesConstructor=require('../internals/array-species-constructor');// `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	module.exports=function(originalArray,length){return new(arraySpeciesConstructor(originalArray))(length===0?0:length);};},{"../internals/array-species-constructor":91}],93:[function(require,module,exports){var anObject=require('../internals/an-object');var iteratorClose=require('../internals/iterator-close');// call something on iterator step with safe closing on error
	module.exports=function(iterator,fn,value,ENTRIES){try{return ENTRIES?fn(anObject(value)[0],value[1]):fn(value);}catch(error){iteratorClose(iterator,'throw',error);}};},{"../internals/an-object":81,"../internals/iterator-close":144}],94:[function(require,module,exports){var wellKnownSymbol=require('../internals/well-known-symbol');var ITERATOR=wellKnownSymbol('iterator');var SAFE_CLOSING=false;try{var called=0;var iteratorWithReturn={next:function next(){return {done:!!called++};},'return':function _return(){SAFE_CLOSING=true;}};iteratorWithReturn[ITERATOR]=function(){return this;};// eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
	Array.from(iteratorWithReturn,function(){throw 2;});}catch(error){/* empty */}module.exports=function(exec,SKIP_CLOSING){if(!SKIP_CLOSING&&!SAFE_CLOSING)return false;var ITERATION_SUPPORT=false;try{var object={};object[ITERATOR]=function(){return {next:function next(){return {done:ITERATION_SUPPORT=true};}};};exec(object);}catch(error){/* empty */}return ITERATION_SUPPORT;};},{"../internals/well-known-symbol":191}],95:[function(require,module,exports){var uncurryThis=require('../internals/function-uncurry-this');var toString=uncurryThis({}.toString);var stringSlice=uncurryThis(''.slice);module.exports=function(it){return stringSlice(toString(it),8,-1);};},{"../internals/function-uncurry-this":122}],96:[function(require,module,exports){var global=require('../internals/global');var TO_STRING_TAG_SUPPORT=require('../internals/to-string-tag-support');var isCallable=require('../internals/is-callable');var classofRaw=require('../internals/classof-raw');var wellKnownSymbol=require('../internals/well-known-symbol');var TO_STRING_TAG=wellKnownSymbol('toStringTag');var Object=global.Object;// ES3 wrong here
	var CORRECT_ARGUMENTS=classofRaw(function(){return arguments;}())=='Arguments';// fallback for IE11 Script Access Denied error
	var tryGet=function tryGet(it,key){try{return it[key];}catch(error){/* empty */}};// getting tag from ES6+ `Object.prototype.toString`
	module.exports=TO_STRING_TAG_SUPPORT?classofRaw:function(it){var O,tag,result;return it===undefined?'Undefined':it===null?'Null'// @@toStringTag case
	:typeof(tag=tryGet(O=Object(it),TO_STRING_TAG))=='string'?tag// builtinTag case
	:CORRECT_ARGUMENTS?classofRaw(O)// ES3 arguments fallback
	:(result=classofRaw(O))=='Object'&&isCallable(O.callee)?'Arguments':result;};},{"../internals/classof-raw":95,"../internals/global":127,"../internals/is-callable":137,"../internals/to-string-tag-support":185,"../internals/well-known-symbol":191}],97:[function(require,module,exports){var wellKnownSymbol=require('../internals/well-known-symbol');var MATCH=wellKnownSymbol('match');module.exports=function(METHOD_NAME){var regexp=/./;try{'/./'[METHOD_NAME](regexp);}catch(error1){try{regexp[MATCH]=false;return '/./'[METHOD_NAME](regexp);}catch(error2){/* empty */}}return false;};},{"../internals/well-known-symbol":191}],98:[function(require,module,exports){var fails=require('../internals/fails');module.exports=!fails(function(){function F(){/* empty */}F.prototype.constructor=null;// eslint-disable-next-line es/no-object-getprototypeof -- required for testing
	return Object.getPrototypeOf(new F())!==F.prototype;});},{"../internals/fails":117}],99:[function(require,module,exports){var IteratorPrototype=require('../internals/iterators-core').IteratorPrototype;var create=require('../internals/object-create');var createPropertyDescriptor=require('../internals/create-property-descriptor');var setToStringTag=require('../internals/set-to-string-tag');var Iterators=require('../internals/iterators');var returnThis=function returnThis(){return this;};module.exports=function(IteratorConstructor,NAME,next){var TO_STRING_TAG=NAME+' Iterator';IteratorConstructor.prototype=create(IteratorPrototype,{next:createPropertyDescriptor(1,next)});setToStringTag(IteratorConstructor,TO_STRING_TAG,false,true);Iterators[TO_STRING_TAG]=returnThis;return IteratorConstructor;};},{"../internals/create-property-descriptor":101,"../internals/iterators":146,"../internals/iterators-core":145,"../internals/object-create":152,"../internals/set-to-string-tag":172}],100:[function(require,module,exports){var DESCRIPTORS=require('../internals/descriptors');var definePropertyModule=require('../internals/object-define-property');var createPropertyDescriptor=require('../internals/create-property-descriptor');module.exports=DESCRIPTORS?function(object,key,value){return definePropertyModule.f(object,key,createPropertyDescriptor(1,value));}:function(object,key,value){object[key]=value;return object;};},{"../internals/create-property-descriptor":101,"../internals/descriptors":105,"../internals/object-define-property":154}],101:[function(require,module,exports){module.exports=function(bitmap,value){return {enumerable:!(bitmap&1),configurable:!(bitmap&2),writable:!(bitmap&4),value:value};};},{}],102:[function(require,module,exports){var toPropertyKey=require('../internals/to-property-key');var definePropertyModule=require('../internals/object-define-property');var createPropertyDescriptor=require('../internals/create-property-descriptor');module.exports=function(object,key,value){var propertyKey=toPropertyKey(key);if(propertyKey in object)definePropertyModule.f(object,propertyKey,createPropertyDescriptor(0,value));else object[propertyKey]=value;};},{"../internals/create-property-descriptor":101,"../internals/object-define-property":154,"../internals/to-property-key":184}],103:[function(require,module,exports){var $=require('../internals/export');var call=require('../internals/function-call');var IS_PURE=require('../internals/is-pure');var FunctionName=require('../internals/function-name');var isCallable=require('../internals/is-callable');var createIteratorConstructor=require('../internals/create-iterator-constructor');var getPrototypeOf=require('../internals/object-get-prototype-of');var setPrototypeOf=require('../internals/object-set-prototype-of');var setToStringTag=require('../internals/set-to-string-tag');var createNonEnumerableProperty=require('../internals/create-non-enumerable-property');var redefine=require('../internals/redefine');var wellKnownSymbol=require('../internals/well-known-symbol');var Iterators=require('../internals/iterators');var IteratorsCore=require('../internals/iterators-core');var PROPER_FUNCTION_NAME=FunctionName.PROPER;var CONFIGURABLE_FUNCTION_NAME=FunctionName.CONFIGURABLE;var IteratorPrototype=IteratorsCore.IteratorPrototype;var BUGGY_SAFARI_ITERATORS=IteratorsCore.BUGGY_SAFARI_ITERATORS;var ITERATOR=wellKnownSymbol('iterator');var KEYS='keys';var VALUES='values';var ENTRIES='entries';var returnThis=function returnThis(){return this;};module.exports=function(Iterable,NAME,IteratorConstructor,next,DEFAULT,IS_SET,FORCED){createIteratorConstructor(IteratorConstructor,NAME,next);var getIterationMethod=function getIterationMethod(KIND){if(KIND===DEFAULT&&defaultIterator)return defaultIterator;if(!BUGGY_SAFARI_ITERATORS&&KIND in IterablePrototype)return IterablePrototype[KIND];switch(KIND){case KEYS:return function keys(){return new IteratorConstructor(this,KIND);};case VALUES:return function values(){return new IteratorConstructor(this,KIND);};case ENTRIES:return function entries(){return new IteratorConstructor(this,KIND);};}return function(){return new IteratorConstructor(this);};};var TO_STRING_TAG=NAME+' Iterator';var INCORRECT_VALUES_NAME=false;var IterablePrototype=Iterable.prototype;var nativeIterator=IterablePrototype[ITERATOR]||IterablePrototype['@@iterator']||DEFAULT&&IterablePrototype[DEFAULT];var defaultIterator=!BUGGY_SAFARI_ITERATORS&&nativeIterator||getIterationMethod(DEFAULT);var anyNativeIterator=NAME=='Array'?IterablePrototype.entries||nativeIterator:nativeIterator;var CurrentIteratorPrototype,methods,KEY;// fix native
	if(anyNativeIterator){CurrentIteratorPrototype=getPrototypeOf(anyNativeIterator.call(new Iterable()));if(CurrentIteratorPrototype!==Object.prototype&&CurrentIteratorPrototype.next){if(!IS_PURE&&getPrototypeOf(CurrentIteratorPrototype)!==IteratorPrototype){if(setPrototypeOf){setPrototypeOf(CurrentIteratorPrototype,IteratorPrototype);}else if(!isCallable(CurrentIteratorPrototype[ITERATOR])){redefine(CurrentIteratorPrototype,ITERATOR,returnThis);}}// Set @@toStringTag to native iterators
	setToStringTag(CurrentIteratorPrototype,TO_STRING_TAG,true,true);if(IS_PURE)Iterators[TO_STRING_TAG]=returnThis;}}// fix Array.prototype.{ values, @@iterator }.name in V8 / FF
	if(PROPER_FUNCTION_NAME&&DEFAULT==VALUES&&nativeIterator&&nativeIterator.name!==VALUES){if(!IS_PURE&&CONFIGURABLE_FUNCTION_NAME){createNonEnumerableProperty(IterablePrototype,'name',VALUES);}else {INCORRECT_VALUES_NAME=true;defaultIterator=function values(){return call(nativeIterator,this);};}}// export additional methods
	if(DEFAULT){methods={values:getIterationMethod(VALUES),keys:IS_SET?defaultIterator:getIterationMethod(KEYS),entries:getIterationMethod(ENTRIES)};if(FORCED)for(KEY in methods){if(BUGGY_SAFARI_ITERATORS||INCORRECT_VALUES_NAME||!(KEY in IterablePrototype)){redefine(IterablePrototype,KEY,methods[KEY]);}}else $({target:NAME,proto:true,forced:BUGGY_SAFARI_ITERATORS||INCORRECT_VALUES_NAME},methods);}// define iterator
	if((!IS_PURE||FORCED)&&IterablePrototype[ITERATOR]!==defaultIterator){redefine(IterablePrototype,ITERATOR,defaultIterator,{name:DEFAULT});}Iterators[NAME]=defaultIterator;return methods;};},{"../internals/create-iterator-constructor":99,"../internals/create-non-enumerable-property":100,"../internals/export":116,"../internals/function-call":120,"../internals/function-name":121,"../internals/is-callable":137,"../internals/is-pure":141,"../internals/iterators":146,"../internals/iterators-core":145,"../internals/object-get-prototype-of":159,"../internals/object-set-prototype-of":164,"../internals/redefine":168,"../internals/set-to-string-tag":172,"../internals/well-known-symbol":191}],104:[function(require,module,exports){var path=require('../internals/path');var hasOwn=require('../internals/has-own-property');var wrappedWellKnownSymbolModule=require('../internals/well-known-symbol-wrapped');var defineProperty=require('../internals/object-define-property').f;module.exports=function(NAME){var _Symbol=path.Symbol||(path.Symbol={});if(!hasOwn(_Symbol,NAME))defineProperty(_Symbol,NAME,{value:wrappedWellKnownSymbolModule.f(NAME)});};},{"../internals/has-own-property":128,"../internals/object-define-property":154,"../internals/path":167,"../internals/well-known-symbol-wrapped":190}],105:[function(require,module,exports){var fails=require('../internals/fails');// Detect IE8's incomplete defineProperty implementation
	module.exports=!fails(function(){// eslint-disable-next-line es/no-object-defineproperty -- required for testing
	return Object.defineProperty({},1,{get:function get(){return 7;}})[1]!=7;});},{"../internals/fails":117}],106:[function(require,module,exports){var global=require('../internals/global');var isObject=require('../internals/is-object');var document=global.document;// typeof document.createElement is 'object' in old IE
	var EXISTS=isObject(document)&&isObject(document.createElement);module.exports=function(it){return EXISTS?document.createElement(it):{};};},{"../internals/global":127,"../internals/is-object":140}],107:[function(require,module,exports){// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	module.exports={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0};},{}],108:[function(require,module,exports){var userAgent=require('../internals/engine-user-agent');var firefox=userAgent.match(/firefox\/(\d+)/i);module.exports=!!firefox&&+firefox[1];},{"../internals/engine-user-agent":111}],109:[function(require,module,exports){var UA=require('../internals/engine-user-agent');module.exports=/MSIE|Trident/.test(UA);},{"../internals/engine-user-agent":111}],110:[function(require,module,exports){var classof=require('../internals/classof-raw');var global=require('../internals/global');module.exports=classof(global.process)=='process';},{"../internals/classof-raw":95,"../internals/global":127}],111:[function(require,module,exports){var getBuiltIn=require('../internals/get-built-in');module.exports=getBuiltIn('navigator','userAgent')||'';},{"../internals/get-built-in":123}],112:[function(require,module,exports){var global=require('../internals/global');var userAgent=require('../internals/engine-user-agent');var process=global.process;var Deno=global.Deno;var versions=process&&process.versions||Deno&&Deno.version;var v8=versions&&versions.v8;var match,version;if(v8){match=v8.split('.');// in old Chrome, versions of V8 isn't V8 = Chrome / 10
	// but their correct versions are not interesting for us
	version=match[0]>0&&match[0]<4?1:+(match[0]+match[1]);}// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
	// so check `userAgent` even if `.v8` exists, but 0
	if(!version&&userAgent){match=userAgent.match(/Edge\/(\d+)/);if(!match||match[1]>=74){match=userAgent.match(/Chrome\/(\d+)/);if(match)version=+match[1];}}module.exports=version;},{"../internals/engine-user-agent":111,"../internals/global":127}],113:[function(require,module,exports){var userAgent=require('../internals/engine-user-agent');var webkit=userAgent.match(/AppleWebKit\/(\d+)\./);module.exports=!!webkit&&+webkit[1];},{"../internals/engine-user-agent":111}],114:[function(require,module,exports){var path=require('../internals/path');module.exports=function(CONSTRUCTOR){return path[CONSTRUCTOR+'Prototype'];};},{"../internals/path":167}],115:[function(require,module,exports){module.exports=['constructor','hasOwnProperty','isPrototypeOf','propertyIsEnumerable','toLocaleString','toString','valueOf'];},{}],116:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));var global=require('../internals/global');var apply=require('../internals/function-apply');var uncurryThis=require('../internals/function-uncurry-this');var isCallable=require('../internals/is-callable');var getOwnPropertyDescriptor=require('../internals/object-get-own-property-descriptor').f;var isForced=require('../internals/is-forced');var path=require('../internals/path');var bind=require('../internals/function-bind-context');var createNonEnumerableProperty=require('../internals/create-non-enumerable-property');var hasOwn=require('../internals/has-own-property');var wrapConstructor=function wrapConstructor(NativeConstructor){var Wrapper=function Wrapper(a,b,c){if(this instanceof Wrapper){switch(arguments.length){case 0:return new NativeConstructor();case 1:return new NativeConstructor(a);case 2:return new NativeConstructor(a,b);}return new NativeConstructor(a,b,c);}return apply(NativeConstructor,this,arguments);};Wrapper.prototype=NativeConstructor.prototype;return Wrapper;};/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	  options.name        - the .name of the function if it does not match the key
	*/module.exports=function(options,source){var TARGET=options.target;var GLOBAL=options.global;var STATIC=options.stat;var PROTO=options.proto;var nativeSource=GLOBAL?global:STATIC?global[TARGET]:(global[TARGET]||{}).prototype;var target=GLOBAL?path:path[TARGET]||createNonEnumerableProperty(path,TARGET,{})[TARGET];var targetPrototype=target.prototype;var FORCED,USE_NATIVE,VIRTUAL_PROTOTYPE;var key,sourceProperty,targetProperty,nativeProperty,resultProperty,descriptor;for(key in source){FORCED=isForced(GLOBAL?key:TARGET+(STATIC?'.':'#')+key,options.forced);// contains in native
	USE_NATIVE=!FORCED&&nativeSource&&hasOwn(nativeSource,key);targetProperty=target[key];if(USE_NATIVE)if(options.noTargetGet){descriptor=getOwnPropertyDescriptor(nativeSource,key);nativeProperty=descriptor&&descriptor.value;}else nativeProperty=nativeSource[key];// export native or implementation
	sourceProperty=USE_NATIVE&&nativeProperty?nativeProperty:source[key];if(USE_NATIVE&&(0, _typeof2["default"])(targetProperty)==(0, _typeof2["default"])(sourceProperty))continue;// bind timers to global for call from export context
	if(options.bind&&USE_NATIVE)resultProperty=bind(sourceProperty,global);// wrap global constructors for prevent changs in this version
	else if(options.wrap&&USE_NATIVE)resultProperty=wrapConstructor(sourceProperty);// make static versions for prototype methods
	else if(PROTO&&isCallable(sourceProperty))resultProperty=uncurryThis(sourceProperty);// default case
	else resultProperty=sourceProperty;// add a flag to not completely full polyfills
	if(options.sham||sourceProperty&&sourceProperty.sham||targetProperty&&targetProperty.sham){createNonEnumerableProperty(resultProperty,'sham',true);}createNonEnumerableProperty(target,key,resultProperty);if(PROTO){VIRTUAL_PROTOTYPE=TARGET+'Prototype';if(!hasOwn(path,VIRTUAL_PROTOTYPE)){createNonEnumerableProperty(path,VIRTUAL_PROTOTYPE,{});}// export virtual prototype methods
	createNonEnumerableProperty(path[VIRTUAL_PROTOTYPE],key,sourceProperty);// export real prototype methods
	if(options.real&&targetPrototype&&!targetPrototype[key]){createNonEnumerableProperty(targetPrototype,key,sourceProperty);}}}};},{"../internals/create-non-enumerable-property":100,"../internals/function-apply":118,"../internals/function-bind-context":119,"../internals/function-uncurry-this":122,"../internals/global":127,"../internals/has-own-property":128,"../internals/is-callable":137,"../internals/is-forced":139,"../internals/object-get-own-property-descriptor":155,"../internals/path":167,"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/typeof":43}],117:[function(require,module,exports){module.exports=function(exec){try{return !!exec();}catch(error){return true;}};},{}],118:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));var FunctionPrototype=Function.prototype;var apply=FunctionPrototype.apply;var bind=FunctionPrototype.bind;var call=FunctionPrototype.call;// eslint-disable-next-line es/no-reflect -- safe
	module.exports=(typeof Reflect==="undefined"?"undefined":(0, _typeof2["default"])(Reflect))=='object'&&Reflect.apply||(bind?call.bind(apply):function(){return call.apply(apply,arguments);});},{"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/typeof":43}],119:[function(require,module,exports){var uncurryThis=require('../internals/function-uncurry-this');var aCallable=require('../internals/a-callable');var bind=uncurryThis(uncurryThis.bind);// optional / simple context binding
	module.exports=function(fn,that){aCallable(fn);return that===undefined?fn:bind?bind(fn,that):function()/* ...args */{return fn.apply(that,arguments);};};},{"../internals/a-callable":78,"../internals/function-uncurry-this":122}],120:[function(require,module,exports){var call=Function.prototype.call;module.exports=call.bind?call.bind(call):function(){return call.apply(call,arguments);};},{}],121:[function(require,module,exports){var DESCRIPTORS=require('../internals/descriptors');var hasOwn=require('../internals/has-own-property');var FunctionPrototype=Function.prototype;// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getDescriptor=DESCRIPTORS&&Object.getOwnPropertyDescriptor;var EXISTS=hasOwn(FunctionPrototype,'name');// additional protection from minified / mangled / dropped function names
	var PROPER=EXISTS&&function something(){/* empty */}.name==='something';var CONFIGURABLE=EXISTS&&(!DESCRIPTORS||DESCRIPTORS&&getDescriptor(FunctionPrototype,'name').configurable);module.exports={EXISTS:EXISTS,PROPER:PROPER,CONFIGURABLE:CONFIGURABLE};},{"../internals/descriptors":105,"../internals/has-own-property":128}],122:[function(require,module,exports){var FunctionPrototype=Function.prototype;var bind=FunctionPrototype.bind;var call=FunctionPrototype.call;var callBind=bind&&bind.bind(call);module.exports=bind?function(fn){return fn&&callBind(call,fn);}:function(fn){return fn&&function(){return call.apply(fn,arguments);};};},{}],123:[function(require,module,exports){var path=require('../internals/path');var global=require('../internals/global');var isCallable=require('../internals/is-callable');var aFunction=function aFunction(variable){return isCallable(variable)?variable:undefined;};module.exports=function(namespace,method){return arguments.length<2?aFunction(path[namespace])||aFunction(global[namespace]):path[namespace]&&path[namespace][method]||global[namespace]&&global[namespace][method];};},{"../internals/global":127,"../internals/is-callable":137,"../internals/path":167}],124:[function(require,module,exports){var classof=require('../internals/classof');var getMethod=require('../internals/get-method');var Iterators=require('../internals/iterators');var wellKnownSymbol=require('../internals/well-known-symbol');var ITERATOR=wellKnownSymbol('iterator');module.exports=function(it){if(it!=undefined)return getMethod(it,ITERATOR)||getMethod(it,'@@iterator')||Iterators[classof(it)];};},{"../internals/classof":96,"../internals/get-method":126,"../internals/iterators":146,"../internals/well-known-symbol":191}],125:[function(require,module,exports){var global=require('../internals/global');var call=require('../internals/function-call');var aCallable=require('../internals/a-callable');var anObject=require('../internals/an-object');var tryToString=require('../internals/try-to-string');var getIteratorMethod=require('../internals/get-iterator-method');var TypeError=global.TypeError;module.exports=function(argument,usingIterator){var iteratorMethod=arguments.length<2?getIteratorMethod(argument):usingIterator;if(aCallable(iteratorMethod))return anObject(call(iteratorMethod,argument));throw TypeError(tryToString(argument)+' is not iterable');};},{"../internals/a-callable":78,"../internals/an-object":81,"../internals/function-call":120,"../internals/get-iterator-method":124,"../internals/global":127,"../internals/try-to-string":187}],126:[function(require,module,exports){var aCallable=require('../internals/a-callable');// `GetMethod` abstract operation
	// https://tc39.es/ecma262/#sec-getmethod
	module.exports=function(V,P){var func=V[P];return func==null?undefined:aCallable(func);};},{"../internals/a-callable":78}],127:[function(require,module,exports){(function(global){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));var check=function check(it){return it&&it.Math==Math&&it;};// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	module.exports=// eslint-disable-next-line es/no-global-this -- safe
	check((typeof globalThis==="undefined"?"undefined":(0, _typeof2["default"])(globalThis))=='object'&&globalThis)||check((typeof window==="undefined"?"undefined":(0, _typeof2["default"])(window))=='object'&&window)||// eslint-disable-next-line no-restricted-globals -- safe
	check((typeof self==="undefined"?"undefined":(0, _typeof2["default"])(self))=='object'&&self)||check((typeof global==="undefined"?"undefined":(0, _typeof2["default"])(global))=='object'&&global)||// eslint-disable-next-line no-new-func -- fallback
	function(){return this;}()||Function('return this')();}).call(this,typeof commonjsGlobal!=="undefined"?commonjsGlobal:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/typeof":43}],128:[function(require,module,exports){var uncurryThis=require('../internals/function-uncurry-this');var toObject=require('../internals/to-object');var hasOwnProperty=uncurryThis({}.hasOwnProperty);// `HasOwnProperty` abstract operation
	// https://tc39.es/ecma262/#sec-hasownproperty
	module.exports=Object.hasOwn||function hasOwn(it,key){return hasOwnProperty(toObject(it),key);};},{"../internals/function-uncurry-this":122,"../internals/to-object":182}],129:[function(require,module,exports){module.exports={};},{}],130:[function(require,module,exports){var getBuiltIn=require('../internals/get-built-in');module.exports=getBuiltIn('document','documentElement');},{"../internals/get-built-in":123}],131:[function(require,module,exports){var DESCRIPTORS=require('../internals/descriptors');var fails=require('../internals/fails');var createElement=require('../internals/document-create-element');// Thank's IE8 for his funny defineProperty
	module.exports=!DESCRIPTORS&&!fails(function(){// eslint-disable-next-line es/no-object-defineproperty -- requied for testing
	return Object.defineProperty(createElement('div'),'a',{get:function get(){return 7;}}).a!=7;});},{"../internals/descriptors":105,"../internals/document-create-element":106,"../internals/fails":117}],132:[function(require,module,exports){var global=require('../internals/global');var uncurryThis=require('../internals/function-uncurry-this');var fails=require('../internals/fails');var classof=require('../internals/classof-raw');var Object=global.Object;var split=uncurryThis(''.split);// fallback for non-array-like ES3 and non-enumerable old V8 strings
	module.exports=fails(function(){// throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	// eslint-disable-next-line no-prototype-builtins -- safe
	return !Object('z').propertyIsEnumerable(0);})?function(it){return classof(it)=='String'?split(it,''):Object(it);}:Object;},{"../internals/classof-raw":95,"../internals/fails":117,"../internals/function-uncurry-this":122,"../internals/global":127}],133:[function(require,module,exports){var uncurryThis=require('../internals/function-uncurry-this');var isCallable=require('../internals/is-callable');var store=require('../internals/shared-store');var functionToString=uncurryThis(Function.toString);// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
	if(!isCallable(store.inspectSource)){store.inspectSource=function(it){return functionToString(it);};}module.exports=store.inspectSource;},{"../internals/function-uncurry-this":122,"../internals/is-callable":137,"../internals/shared-store":174}],134:[function(require,module,exports){var NATIVE_WEAK_MAP=require('../internals/native-weak-map');var global=require('../internals/global');var uncurryThis=require('../internals/function-uncurry-this');var isObject=require('../internals/is-object');var createNonEnumerableProperty=require('../internals/create-non-enumerable-property');var hasOwn=require('../internals/has-own-property');var shared=require('../internals/shared-store');var sharedKey=require('../internals/shared-key');var hiddenKeys=require('../internals/hidden-keys');var OBJECT_ALREADY_INITIALIZED='Object already initialized';var TypeError=global.TypeError;var WeakMap=global.WeakMap;var set,get,has;var enforce=function enforce(it){return has(it)?get(it):set(it,{});};var getterFor=function getterFor(TYPE){return function(it){var state;if(!isObject(it)||(state=get(it)).type!==TYPE){throw TypeError('Incompatible receiver, '+TYPE+' required');}return state;};};if(NATIVE_WEAK_MAP||shared.state){var store=shared.state||(shared.state=new WeakMap());var wmget=uncurryThis(store.get);var wmhas=uncurryThis(store.has);var wmset=uncurryThis(store.set);set=function set(it,metadata){if(wmhas(store,it))throw new TypeError(OBJECT_ALREADY_INITIALIZED);metadata.facade=it;wmset(store,it,metadata);return metadata;};get=function get(it){return wmget(store,it)||{};};has=function has(it){return wmhas(store,it);};}else {var STATE=sharedKey('state');hiddenKeys[STATE]=true;set=function set(it,metadata){if(hasOwn(it,STATE))throw new TypeError(OBJECT_ALREADY_INITIALIZED);metadata.facade=it;createNonEnumerableProperty(it,STATE,metadata);return metadata;};get=function get(it){return hasOwn(it,STATE)?it[STATE]:{};};has=function has(it){return hasOwn(it,STATE);};}module.exports={set:set,get:get,has:has,enforce:enforce,getterFor:getterFor};},{"../internals/create-non-enumerable-property":100,"../internals/function-uncurry-this":122,"../internals/global":127,"../internals/has-own-property":128,"../internals/hidden-keys":129,"../internals/is-object":140,"../internals/native-weak-map":149,"../internals/shared-key":173,"../internals/shared-store":174}],135:[function(require,module,exports){var wellKnownSymbol=require('../internals/well-known-symbol');var Iterators=require('../internals/iterators');var ITERATOR=wellKnownSymbol('iterator');var ArrayPrototype=Array.prototype;// check on default Array iterator
	module.exports=function(it){return it!==undefined&&(Iterators.Array===it||ArrayPrototype[ITERATOR]===it);};},{"../internals/iterators":146,"../internals/well-known-symbol":191}],136:[function(require,module,exports){var classof=require('../internals/classof-raw');// `IsArray` abstract operation
	// https://tc39.es/ecma262/#sec-isarray
	// eslint-disable-next-line es/no-array-isarray -- safe
	module.exports=Array.isArray||function isArray(argument){return classof(argument)=='Array';};},{"../internals/classof-raw":95}],137:[function(require,module,exports){// https://tc39.es/ecma262/#sec-iscallable
	module.exports=function(argument){return typeof argument=='function';};},{}],138:[function(require,module,exports){var uncurryThis=require('../internals/function-uncurry-this');var fails=require('../internals/fails');var isCallable=require('../internals/is-callable');var classof=require('../internals/classof');var getBuiltIn=require('../internals/get-built-in');var inspectSource=require('../internals/inspect-source');var noop=function noop(){/* empty */};var empty=[];var construct=getBuiltIn('Reflect','construct');var constructorRegExp=/^\s*(?:class|function)\b/;var exec=uncurryThis(constructorRegExp.exec);var INCORRECT_TO_STRING=!constructorRegExp.exec(noop);var isConstructorModern=function isConstructorModern(argument){if(!isCallable(argument))return false;try{construct(noop,empty,argument);return true;}catch(error){return false;}};var isConstructorLegacy=function isConstructorLegacy(argument){if(!isCallable(argument))return false;switch(classof(argument)){case'AsyncFunction':case'GeneratorFunction':case'AsyncGeneratorFunction':return false;// we can't check .prototype since constructors produced by .bind haven't it
	}return INCORRECT_TO_STRING||!!exec(constructorRegExp,inspectSource(argument));};// `IsConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-isconstructor
	module.exports=!construct||fails(function(){var called;return isConstructorModern(isConstructorModern.call)||!isConstructorModern(Object)||!isConstructorModern(function(){called=true;})||called;})?isConstructorLegacy:isConstructorModern;},{"../internals/classof":96,"../internals/fails":117,"../internals/function-uncurry-this":122,"../internals/get-built-in":123,"../internals/inspect-source":133,"../internals/is-callable":137}],139:[function(require,module,exports){var fails=require('../internals/fails');var isCallable=require('../internals/is-callable');var replacement=/#|\.prototype\./;var isForced=function isForced(feature,detection){var value=data[normalize(feature)];return value==POLYFILL?true:value==NATIVE?false:isCallable(detection)?fails(detection):!!detection;};var normalize=isForced.normalize=function(string){return String(string).replace(replacement,'.').toLowerCase();};var data=isForced.data={};var NATIVE=isForced.NATIVE='N';var POLYFILL=isForced.POLYFILL='P';module.exports=isForced;},{"../internals/fails":117,"../internals/is-callable":137}],140:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));var isCallable=require('../internals/is-callable');module.exports=function(it){return (0, _typeof2["default"])(it)=='object'?it!==null:isCallable(it);};},{"../internals/is-callable":137,"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/typeof":43}],141:[function(require,module,exports){module.exports=true;},{}],142:[function(require,module,exports){var isObject=require('../internals/is-object');var classof=require('../internals/classof-raw');var wellKnownSymbol=require('../internals/well-known-symbol');var MATCH=wellKnownSymbol('match');// `IsRegExp` abstract operation
	// https://tc39.es/ecma262/#sec-isregexp
	module.exports=function(it){var isRegExp;return isObject(it)&&((isRegExp=it[MATCH])!==undefined?!!isRegExp:classof(it)=='RegExp');};},{"../internals/classof-raw":95,"../internals/is-object":140,"../internals/well-known-symbol":191}],143:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));var global=require('../internals/global');var getBuiltIn=require('../internals/get-built-in');var isCallable=require('../internals/is-callable');var isPrototypeOf=require('../internals/object-is-prototype-of');var USE_SYMBOL_AS_UID=require('../internals/use-symbol-as-uid');var Object=global.Object;module.exports=USE_SYMBOL_AS_UID?function(it){return (0, _typeof2["default"])(it)=='symbol';}:function(it){var $Symbol=getBuiltIn('Symbol');return isCallable($Symbol)&&isPrototypeOf($Symbol.prototype,Object(it));};},{"../internals/get-built-in":123,"../internals/global":127,"../internals/is-callable":137,"../internals/object-is-prototype-of":160,"../internals/use-symbol-as-uid":189,"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/typeof":43}],144:[function(require,module,exports){var call=require('../internals/function-call');var anObject=require('../internals/an-object');var getMethod=require('../internals/get-method');module.exports=function(iterator,kind,value){var innerResult,innerError;anObject(iterator);try{innerResult=getMethod(iterator,'return');if(!innerResult){if(kind==='throw')throw value;return value;}innerResult=call(innerResult,iterator);}catch(error){innerError=true;innerResult=error;}if(kind==='throw')throw value;if(innerError)throw innerResult;anObject(innerResult);return value;};},{"../internals/an-object":81,"../internals/function-call":120,"../internals/get-method":126}],145:[function(require,module,exports){var fails=require('../internals/fails');var isCallable=require('../internals/is-callable');var create=require('../internals/object-create');var getPrototypeOf=require('../internals/object-get-prototype-of');var redefine=require('../internals/redefine');var wellKnownSymbol=require('../internals/well-known-symbol');var IS_PURE=require('../internals/is-pure');var ITERATOR=wellKnownSymbol('iterator');var BUGGY_SAFARI_ITERATORS=false;// `%IteratorPrototype%` object
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype,PrototypeOfArrayIteratorPrototype,arrayIterator;/* eslint-disable es/no-array-prototype-keys -- safe */if([].keys){arrayIterator=[].keys();// Safari 8 has buggy iterators w/o `next`
	if(!('next'in arrayIterator))BUGGY_SAFARI_ITERATORS=true;else {PrototypeOfArrayIteratorPrototype=getPrototypeOf(getPrototypeOf(arrayIterator));if(PrototypeOfArrayIteratorPrototype!==Object.prototype)IteratorPrototype=PrototypeOfArrayIteratorPrototype;}}var NEW_ITERATOR_PROTOTYPE=IteratorPrototype==undefined||fails(function(){var test={};// FF44- legacy iterators case
	return IteratorPrototype[ITERATOR].call(test)!==test;});if(NEW_ITERATOR_PROTOTYPE)IteratorPrototype={};else if(IS_PURE)IteratorPrototype=create(IteratorPrototype);// `%IteratorPrototype%[@@iterator]()` method
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
	if(!isCallable(IteratorPrototype[ITERATOR])){redefine(IteratorPrototype,ITERATOR,function(){return this;});}module.exports={IteratorPrototype:IteratorPrototype,BUGGY_SAFARI_ITERATORS:BUGGY_SAFARI_ITERATORS};},{"../internals/fails":117,"../internals/is-callable":137,"../internals/is-pure":141,"../internals/object-create":152,"../internals/object-get-prototype-of":159,"../internals/redefine":168,"../internals/well-known-symbol":191}],146:[function(require,module,exports){module.exports={};},{}],147:[function(require,module,exports){var toLength=require('../internals/to-length');// `LengthOfArrayLike` abstract operation
	// https://tc39.es/ecma262/#sec-lengthofarraylike
	module.exports=function(obj){return toLength(obj.length);};},{"../internals/to-length":181}],148:[function(require,module,exports){/* eslint-disable es/no-symbol -- required for testing */var V8_VERSION=require('../internals/engine-v8-version');var fails=require('../internals/fails');// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
	module.exports=!!Object.getOwnPropertySymbols&&!fails(function(){var symbol=Symbol();// Chrome 38 Symbol has incorrect toString conversion
	// `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
	return !String(symbol)||!(Object(symbol)instanceof Symbol)||// Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
	!Symbol.sham&&V8_VERSION&&V8_VERSION<41;});},{"../internals/engine-v8-version":112,"../internals/fails":117}],149:[function(require,module,exports){var global=require('../internals/global');var isCallable=require('../internals/is-callable');var inspectSource=require('../internals/inspect-source');var WeakMap=global.WeakMap;module.exports=isCallable(WeakMap)&&/native code/.test(inspectSource(WeakMap));},{"../internals/global":127,"../internals/inspect-source":133,"../internals/is-callable":137}],150:[function(require,module,exports){var global=require('../internals/global');var isRegExp=require('../internals/is-regexp');var TypeError=global.TypeError;module.exports=function(it){if(isRegExp(it)){throw TypeError("The method doesn't accept regular expressions");}return it;};},{"../internals/global":127,"../internals/is-regexp":142}],151:[function(require,module,exports){var global=require('../internals/global');var fails=require('../internals/fails');var uncurryThis=require('../internals/function-uncurry-this');var toString=require('../internals/to-string');var trim=require('../internals/string-trim').trim;var whitespaces=require('../internals/whitespaces');var $parseInt=global.parseInt;var _Symbol=global.Symbol;var ITERATOR=_Symbol&&_Symbol.iterator;var hex=/^[+-]?0x/i;var exec=uncurryThis(hex.exec);var FORCED=$parseInt(whitespaces+'08')!==8||$parseInt(whitespaces+'0x16')!==22// MS Edge 18- broken with boxed symbols
	||ITERATOR&&!fails(function(){$parseInt(Object(ITERATOR));});// `parseInt` method
	// https://tc39.es/ecma262/#sec-parseint-string-radix
	module.exports=FORCED?function parseInt(string,radix){var S=trim(toString(string));return $parseInt(S,radix>>>0||(exec(hex,S)?16:10));}:$parseInt;},{"../internals/fails":117,"../internals/function-uncurry-this":122,"../internals/global":127,"../internals/string-trim":177,"../internals/to-string":186,"../internals/whitespaces":192}],152:[function(require,module,exports){/* global ActiveXObject -- old IE, WSH */var anObject=require('../internals/an-object');var defineProperties=require('../internals/object-define-properties');var enumBugKeys=require('../internals/enum-bug-keys');var hiddenKeys=require('../internals/hidden-keys');var html=require('../internals/html');var documentCreateElement=require('../internals/document-create-element');var sharedKey=require('../internals/shared-key');var GT='>';var LT='<';var PROTOTYPE='prototype';var SCRIPT='script';var IE_PROTO=sharedKey('IE_PROTO');var EmptyConstructor=function EmptyConstructor(){/* empty */};var scriptTag=function scriptTag(content){return LT+SCRIPT+GT+content+LT+'/'+SCRIPT+GT;};// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX=function NullProtoObjectViaActiveX(activeXDocument){activeXDocument.write(scriptTag(''));activeXDocument.close();var temp=activeXDocument.parentWindow.Object;activeXDocument=null;// avoid memory leak
	return temp;};// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame=function NullProtoObjectViaIFrame(){// Thrash, waste and sodomy: IE GC bug
	var iframe=documentCreateElement('iframe');var JS='java'+SCRIPT+':';var iframeDocument;iframe.style.display='none';html.appendChild(iframe);// https://github.com/zloirock/core-js/issues/475
	iframe.src=String(JS);iframeDocument=iframe.contentWindow.document;iframeDocument.open();iframeDocument.write(scriptTag('document.F=Object'));iframeDocument.close();return iframeDocument.F;};// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;var _NullProtoObject=function NullProtoObject(){try{activeXDocument=new ActiveXObject('htmlfile');}catch(error){/* ignore */}_NullProtoObject=typeof document!='undefined'?document.domain&&activeXDocument?NullProtoObjectViaActiveX(activeXDocument)// old IE
	:NullProtoObjectViaIFrame():NullProtoObjectViaActiveX(activeXDocument);// WSH
	var length=enumBugKeys.length;while(length--){delete _NullProtoObject[PROTOTYPE][enumBugKeys[length]];}return _NullProtoObject();};hiddenKeys[IE_PROTO]=true;// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	module.exports=Object.create||function create(O,Properties){var result;if(O!==null){EmptyConstructor[PROTOTYPE]=anObject(O);result=new EmptyConstructor();EmptyConstructor[PROTOTYPE]=null;// add "__proto__" for Object.getPrototypeOf polyfill
	result[IE_PROTO]=O;}else result=_NullProtoObject();return Properties===undefined?result:defineProperties(result,Properties);};},{"../internals/an-object":81,"../internals/document-create-element":106,"../internals/enum-bug-keys":115,"../internals/hidden-keys":129,"../internals/html":130,"../internals/object-define-properties":153,"../internals/shared-key":173}],153:[function(require,module,exports){var DESCRIPTORS=require('../internals/descriptors');var definePropertyModule=require('../internals/object-define-property');var anObject=require('../internals/an-object');var toIndexedObject=require('../internals/to-indexed-object');var objectKeys=require('../internals/object-keys');// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	// eslint-disable-next-line es/no-object-defineproperties -- safe
	module.exports=DESCRIPTORS?Object.defineProperties:function defineProperties(O,Properties){anObject(O);var props=toIndexedObject(Properties);var keys=objectKeys(Properties);var length=keys.length;var index=0;var key;while(length>index){definePropertyModule.f(O,key=keys[index++],props[key]);}return O;};},{"../internals/an-object":81,"../internals/descriptors":105,"../internals/object-define-property":154,"../internals/object-keys":162,"../internals/to-indexed-object":179}],154:[function(require,module,exports){var global=require('../internals/global');var DESCRIPTORS=require('../internals/descriptors');var IE8_DOM_DEFINE=require('../internals/ie8-dom-define');var anObject=require('../internals/an-object');var toPropertyKey=require('../internals/to-property-key');var TypeError=global.TypeError;// eslint-disable-next-line es/no-object-defineproperty -- safe
	var $defineProperty=Object.defineProperty;// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	exports.f=DESCRIPTORS?$defineProperty:function defineProperty(O,P,Attributes){anObject(O);P=toPropertyKey(P);anObject(Attributes);if(IE8_DOM_DEFINE)try{return $defineProperty(O,P,Attributes);}catch(error){/* empty */}if('get'in Attributes||'set'in Attributes)throw TypeError('Accessors not supported');if('value'in Attributes)O[P]=Attributes.value;return O;};},{"../internals/an-object":81,"../internals/descriptors":105,"../internals/global":127,"../internals/ie8-dom-define":131,"../internals/to-property-key":184}],155:[function(require,module,exports){var DESCRIPTORS=require('../internals/descriptors');var call=require('../internals/function-call');var propertyIsEnumerableModule=require('../internals/object-property-is-enumerable');var createPropertyDescriptor=require('../internals/create-property-descriptor');var toIndexedObject=require('../internals/to-indexed-object');var toPropertyKey=require('../internals/to-property-key');var hasOwn=require('../internals/has-own-property');var IE8_DOM_DEFINE=require('../internals/ie8-dom-define');// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor=Object.getOwnPropertyDescriptor;// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	exports.f=DESCRIPTORS?$getOwnPropertyDescriptor:function getOwnPropertyDescriptor(O,P){O=toIndexedObject(O);P=toPropertyKey(P);if(IE8_DOM_DEFINE)try{return $getOwnPropertyDescriptor(O,P);}catch(error){/* empty */}if(hasOwn(O,P))return createPropertyDescriptor(!call(propertyIsEnumerableModule.f,O,P),O[P]);};},{"../internals/create-property-descriptor":101,"../internals/descriptors":105,"../internals/function-call":120,"../internals/has-own-property":128,"../internals/ie8-dom-define":131,"../internals/object-property-is-enumerable":163,"../internals/to-indexed-object":179,"../internals/to-property-key":184}],156:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));/* eslint-disable es/no-object-getownpropertynames -- safe */var classof=require('../internals/classof-raw');var toIndexedObject=require('../internals/to-indexed-object');var $getOwnPropertyNames=require('../internals/object-get-own-property-names').f;var arraySlice=require('../internals/array-slice');var windowNames=(typeof window==="undefined"?"undefined":(0, _typeof2["default"])(window))=='object'&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[];var getWindowNames=function getWindowNames(it){try{return $getOwnPropertyNames(it);}catch(error){return arraySlice(windowNames);}};// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	module.exports.f=function getOwnPropertyNames(it){return windowNames&&classof(it)=='Window'?getWindowNames(it):$getOwnPropertyNames(toIndexedObject(it));};},{"../internals/array-slice":89,"../internals/classof-raw":95,"../internals/object-get-own-property-names":157,"../internals/to-indexed-object":179,"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/typeof":43}],157:[function(require,module,exports){var internalObjectKeys=require('../internals/object-keys-internal');var enumBugKeys=require('../internals/enum-bug-keys');var hiddenKeys=enumBugKeys.concat('length','prototype');// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	// eslint-disable-next-line es/no-object-getownpropertynames -- safe
	exports.f=Object.getOwnPropertyNames||function getOwnPropertyNames(O){return internalObjectKeys(O,hiddenKeys);};},{"../internals/enum-bug-keys":115,"../internals/object-keys-internal":161}],158:[function(require,module,exports){exports.f=Object.getOwnPropertySymbols;},{}],159:[function(require,module,exports){var global=require('../internals/global');var hasOwn=require('../internals/has-own-property');var isCallable=require('../internals/is-callable');var toObject=require('../internals/to-object');var sharedKey=require('../internals/shared-key');var CORRECT_PROTOTYPE_GETTER=require('../internals/correct-prototype-getter');var IE_PROTO=sharedKey('IE_PROTO');var Object=global.Object;var ObjectPrototype=Object.prototype;// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	module.exports=CORRECT_PROTOTYPE_GETTER?Object.getPrototypeOf:function(O){var object=toObject(O);if(hasOwn(object,IE_PROTO))return object[IE_PROTO];var constructor=object.constructor;if(isCallable(constructor)&&object instanceof constructor){return constructor.prototype;}return object instanceof Object?ObjectPrototype:null;};},{"../internals/correct-prototype-getter":98,"../internals/global":127,"../internals/has-own-property":128,"../internals/is-callable":137,"../internals/shared-key":173,"../internals/to-object":182}],160:[function(require,module,exports){var uncurryThis=require('../internals/function-uncurry-this');module.exports=uncurryThis({}.isPrototypeOf);},{"../internals/function-uncurry-this":122}],161:[function(require,module,exports){var uncurryThis=require('../internals/function-uncurry-this');var hasOwn=require('../internals/has-own-property');var toIndexedObject=require('../internals/to-indexed-object');var indexOf=require('../internals/array-includes').indexOf;var hiddenKeys=require('../internals/hidden-keys');var push=uncurryThis([].push);module.exports=function(object,names){var O=toIndexedObject(object);var i=0;var result=[];var key;for(key in O){!hasOwn(hiddenKeys,key)&&hasOwn(O,key)&&push(result,key);}// Don't enum bug & hidden keys
	while(names.length>i){if(hasOwn(O,key=names[i++])){~indexOf(result,key)||push(result,key);}}return result;};},{"../internals/array-includes":84,"../internals/function-uncurry-this":122,"../internals/has-own-property":128,"../internals/hidden-keys":129,"../internals/to-indexed-object":179}],162:[function(require,module,exports){var internalObjectKeys=require('../internals/object-keys-internal');var enumBugKeys=require('../internals/enum-bug-keys');// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	// eslint-disable-next-line es/no-object-keys -- safe
	module.exports=Object.keys||function keys(O){return internalObjectKeys(O,enumBugKeys);};},{"../internals/enum-bug-keys":115,"../internals/object-keys-internal":161}],163:[function(require,module,exports){var $propertyIsEnumerable={}.propertyIsEnumerable;// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor=Object.getOwnPropertyDescriptor;// Nashorn ~ JDK8 bug
	var NASHORN_BUG=getOwnPropertyDescriptor&&!$propertyIsEnumerable.call({1:2},1);// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
	exports.f=NASHORN_BUG?function propertyIsEnumerable(V){var descriptor=getOwnPropertyDescriptor(this,V);return !!descriptor&&descriptor.enumerable;}:$propertyIsEnumerable;},{}],164:[function(require,module,exports){/* eslint-disable no-proto -- safe */var uncurryThis=require('../internals/function-uncurry-this');var anObject=require('../internals/an-object');var aPossiblePrototype=require('../internals/a-possible-prototype');// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	// eslint-disable-next-line es/no-object-setprototypeof -- safe
	module.exports=Object.setPrototypeOf||('__proto__'in{}?function(){var CORRECT_SETTER=false;var test={};var setter;try{// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	setter=uncurryThis(Object.getOwnPropertyDescriptor(Object.prototype,'__proto__').set);setter(test,[]);CORRECT_SETTER=test instanceof Array;}catch(error){/* empty */}return function setPrototypeOf(O,proto){anObject(O);aPossiblePrototype(proto);if(CORRECT_SETTER)setter(O,proto);else O.__proto__=proto;return O;};}():undefined);},{"../internals/a-possible-prototype":79,"../internals/an-object":81,"../internals/function-uncurry-this":122}],165:[function(require,module,exports){var TO_STRING_TAG_SUPPORT=require('../internals/to-string-tag-support');var classof=require('../internals/classof');// `Object.prototype.toString` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.tostring
	module.exports=TO_STRING_TAG_SUPPORT?{}.toString:function toString(){return '[object '+classof(this)+']';};},{"../internals/classof":96,"../internals/to-string-tag-support":185}],166:[function(require,module,exports){var global=require('../internals/global');var call=require('../internals/function-call');var isCallable=require('../internals/is-callable');var isObject=require('../internals/is-object');var TypeError=global.TypeError;// `OrdinaryToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-ordinarytoprimitive
	module.exports=function(input,pref){var fn,val;if(pref==='string'&&isCallable(fn=input.toString)&&!isObject(val=call(fn,input)))return val;if(isCallable(fn=input.valueOf)&&!isObject(val=call(fn,input)))return val;if(pref!=='string'&&isCallable(fn=input.toString)&&!isObject(val=call(fn,input)))return val;throw TypeError("Can't convert object to primitive value");};},{"../internals/function-call":120,"../internals/global":127,"../internals/is-callable":137,"../internals/is-object":140}],167:[function(require,module,exports){module.exports={};},{}],168:[function(require,module,exports){var createNonEnumerableProperty=require('../internals/create-non-enumerable-property');module.exports=function(target,key,value,options){if(options&&options.enumerable)target[key]=value;else createNonEnumerableProperty(target,key,value);};},{"../internals/create-non-enumerable-property":100}],169:[function(require,module,exports){var anObject=require('../internals/an-object');// `RegExp.prototype.flags` getter implementation
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
	module.exports=function(){var that=anObject(this);var result='';if(that.global)result+='g';if(that.ignoreCase)result+='i';if(that.multiline)result+='m';if(that.dotAll)result+='s';if(that.unicode)result+='u';if(that.sticky)result+='y';return result;};},{"../internals/an-object":81}],170:[function(require,module,exports){var global=require('../internals/global');var TypeError=global.TypeError;// `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible
	module.exports=function(it){if(it==undefined)throw TypeError("Can't call method on "+it);return it;};},{"../internals/global":127}],171:[function(require,module,exports){var global=require('../internals/global');// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty=Object.defineProperty;module.exports=function(key,value){try{defineProperty(global,key,{value:value,configurable:true,writable:true});}catch(error){global[key]=value;}return value;};},{"../internals/global":127}],172:[function(require,module,exports){var TO_STRING_TAG_SUPPORT=require('../internals/to-string-tag-support');var defineProperty=require('../internals/object-define-property').f;var createNonEnumerableProperty=require('../internals/create-non-enumerable-property');var hasOwn=require('../internals/has-own-property');var toString=require('../internals/object-to-string');var wellKnownSymbol=require('../internals/well-known-symbol');var TO_STRING_TAG=wellKnownSymbol('toStringTag');module.exports=function(it,TAG,STATIC,SET_METHOD){if(it){var target=STATIC?it:it.prototype;if(!hasOwn(target,TO_STRING_TAG)){defineProperty(target,TO_STRING_TAG,{configurable:true,value:TAG});}if(SET_METHOD&&!TO_STRING_TAG_SUPPORT){createNonEnumerableProperty(target,'toString',toString);}}};},{"../internals/create-non-enumerable-property":100,"../internals/has-own-property":128,"../internals/object-define-property":154,"../internals/object-to-string":165,"../internals/to-string-tag-support":185,"../internals/well-known-symbol":191}],173:[function(require,module,exports){var shared=require('../internals/shared');var uid=require('../internals/uid');var keys=shared('keys');module.exports=function(key){return keys[key]||(keys[key]=uid(key));};},{"../internals/shared":175,"../internals/uid":188}],174:[function(require,module,exports){var global=require('../internals/global');var setGlobal=require('../internals/set-global');var SHARED='__core-js_shared__';var store=global[SHARED]||setGlobal(SHARED,{});module.exports=store;},{"../internals/global":127,"../internals/set-global":171}],175:[function(require,module,exports){var IS_PURE=require('../internals/is-pure');var store=require('../internals/shared-store');(module.exports=function(key,value){return store[key]||(store[key]=value!==undefined?value:{});})('versions',[]).push({version:'3.18.3',mode:IS_PURE?'pure':'global',copyright:'© 2021 Denis Pushkarev (zloirock.ru)'});},{"../internals/is-pure":141,"../internals/shared-store":174}],176:[function(require,module,exports){var uncurryThis=require('../internals/function-uncurry-this');var toIntegerOrInfinity=require('../internals/to-integer-or-infinity');var toString=require('../internals/to-string');var requireObjectCoercible=require('../internals/require-object-coercible');var charAt=uncurryThis(''.charAt);var charCodeAt=uncurryThis(''.charCodeAt);var stringSlice=uncurryThis(''.slice);var createMethod=function createMethod(CONVERT_TO_STRING){return function($this,pos){var S=toString(requireObjectCoercible($this));var position=toIntegerOrInfinity(pos);var size=S.length;var first,second;if(position<0||position>=size)return CONVERT_TO_STRING?'':undefined;first=charCodeAt(S,position);return first<0xD800||first>0xDBFF||position+1===size||(second=charCodeAt(S,position+1))<0xDC00||second>0xDFFF?CONVERT_TO_STRING?charAt(S,position):first:CONVERT_TO_STRING?stringSlice(S,position,position+2):(first-0xD800<<10)+(second-0xDC00)+0x10000;};};module.exports={// `String.prototype.codePointAt` method
	// https://tc39.es/ecma262/#sec-string.prototype.codepointat
	codeAt:createMethod(false),// `String.prototype.at` method
	// https://github.com/mathiasbynens/String.prototype.at
	charAt:createMethod(true)};},{"../internals/function-uncurry-this":122,"../internals/require-object-coercible":170,"../internals/to-integer-or-infinity":180,"../internals/to-string":186}],177:[function(require,module,exports){var uncurryThis=require('../internals/function-uncurry-this');var requireObjectCoercible=require('../internals/require-object-coercible');var toString=require('../internals/to-string');var whitespaces=require('../internals/whitespaces');var replace=uncurryThis(''.replace);var whitespace='['+whitespaces+']';var ltrim=RegExp('^'+whitespace+whitespace+'*');var rtrim=RegExp(whitespace+whitespace+'*$');// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
	var createMethod=function createMethod(TYPE){return function($this){var string=toString(requireObjectCoercible($this));if(TYPE&1)string=replace(string,ltrim,'');if(TYPE&2)string=replace(string,rtrim,'');return string;};};module.exports={// `String.prototype.{ trimLeft, trimStart }` methods
	// https://tc39.es/ecma262/#sec-string.prototype.trimstart
	start:createMethod(1),// `String.prototype.{ trimRight, trimEnd }` methods
	// https://tc39.es/ecma262/#sec-string.prototype.trimend
	end:createMethod(2),// `String.prototype.trim` method
	// https://tc39.es/ecma262/#sec-string.prototype.trim
	trim:createMethod(3)};},{"../internals/function-uncurry-this":122,"../internals/require-object-coercible":170,"../internals/to-string":186,"../internals/whitespaces":192}],178:[function(require,module,exports){var toIntegerOrInfinity=require('../internals/to-integer-or-infinity');var max=Math.max;var min=Math.min;// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	module.exports=function(index,length){var integer=toIntegerOrInfinity(index);return integer<0?max(integer+length,0):min(integer,length);};},{"../internals/to-integer-or-infinity":180}],179:[function(require,module,exports){var IndexedObject=require('../internals/indexed-object');var requireObjectCoercible=require('../internals/require-object-coercible');module.exports=function(it){return IndexedObject(requireObjectCoercible(it));};},{"../internals/indexed-object":132,"../internals/require-object-coercible":170}],180:[function(require,module,exports){var ceil=Math.ceil;var floor=Math.floor;// `ToIntegerOrInfinity` abstract operation
	// https://tc39.es/ecma262/#sec-tointegerorinfinity
	module.exports=function(argument){var number=+argument;// eslint-disable-next-line no-self-compare -- safe
	return number!==number||number===0?0:(number>0?floor:ceil)(number);};},{}],181:[function(require,module,exports){var toIntegerOrInfinity=require('../internals/to-integer-or-infinity');var min=Math.min;// `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength
	module.exports=function(argument){return argument>0?min(toIntegerOrInfinity(argument),0x1FFFFFFFFFFFFF):0;// 2 ** 53 - 1 == 9007199254740991
	};},{"../internals/to-integer-or-infinity":180}],182:[function(require,module,exports){var global=require('../internals/global');var requireObjectCoercible=require('../internals/require-object-coercible');var Object=global.Object;// `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject
	module.exports=function(argument){return Object(requireObjectCoercible(argument));};},{"../internals/global":127,"../internals/require-object-coercible":170}],183:[function(require,module,exports){var global=require('../internals/global');var call=require('../internals/function-call');var isObject=require('../internals/is-object');var isSymbol=require('../internals/is-symbol');var getMethod=require('../internals/get-method');var ordinaryToPrimitive=require('../internals/ordinary-to-primitive');var wellKnownSymbol=require('../internals/well-known-symbol');var TypeError=global.TypeError;var TO_PRIMITIVE=wellKnownSymbol('toPrimitive');// `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive
	module.exports=function(input,pref){if(!isObject(input)||isSymbol(input))return input;var exoticToPrim=getMethod(input,TO_PRIMITIVE);var result;if(exoticToPrim){if(pref===undefined)pref='default';result=call(exoticToPrim,input,pref);if(!isObject(result)||isSymbol(result))return result;throw TypeError("Can't convert object to primitive value");}if(pref===undefined)pref='number';return ordinaryToPrimitive(input,pref);};},{"../internals/function-call":120,"../internals/get-method":126,"../internals/global":127,"../internals/is-object":140,"../internals/is-symbol":143,"../internals/ordinary-to-primitive":166,"../internals/well-known-symbol":191}],184:[function(require,module,exports){var toPrimitive=require('../internals/to-primitive');var isSymbol=require('../internals/is-symbol');// `ToPropertyKey` abstract operation
	// https://tc39.es/ecma262/#sec-topropertykey
	module.exports=function(argument){var key=toPrimitive(argument,'string');return isSymbol(key)?key:key+'';};},{"../internals/is-symbol":143,"../internals/to-primitive":183}],185:[function(require,module,exports){var wellKnownSymbol=require('../internals/well-known-symbol');var TO_STRING_TAG=wellKnownSymbol('toStringTag');var test={};test[TO_STRING_TAG]='z';module.exports=String(test)==='[object z]';},{"../internals/well-known-symbol":191}],186:[function(require,module,exports){var global=require('../internals/global');var classof=require('../internals/classof');var String=global.String;module.exports=function(argument){if(classof(argument)==='Symbol')throw TypeError('Cannot convert a Symbol value to a string');return String(argument);};},{"../internals/classof":96,"../internals/global":127}],187:[function(require,module,exports){var global=require('../internals/global');var String=global.String;module.exports=function(argument){try{return String(argument);}catch(error){return 'Object';}};},{"../internals/global":127}],188:[function(require,module,exports){var uncurryThis=require('../internals/function-uncurry-this');var id=0;var postfix=Math.random();var toString=uncurryThis(1.0.toString);module.exports=function(key){return 'Symbol('+(key===undefined?'':key)+')_'+toString(++id+postfix,36);};},{"../internals/function-uncurry-this":122}],189:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));/* eslint-disable es/no-symbol -- required for testing */var NATIVE_SYMBOL=require('../internals/native-symbol');module.exports=NATIVE_SYMBOL&&!Symbol.sham&&(0, _typeof2["default"])(Symbol.iterator)=='symbol';},{"../internals/native-symbol":148,"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/typeof":43}],190:[function(require,module,exports){var wellKnownSymbol=require('../internals/well-known-symbol');exports.f=wellKnownSymbol;},{"../internals/well-known-symbol":191}],191:[function(require,module,exports){var global=require('../internals/global');var shared=require('../internals/shared');var hasOwn=require('../internals/has-own-property');var uid=require('../internals/uid');var NATIVE_SYMBOL=require('../internals/native-symbol');var USE_SYMBOL_AS_UID=require('../internals/use-symbol-as-uid');var WellKnownSymbolsStore=shared('wks');var _Symbol=global.Symbol;var symbolFor=_Symbol&&_Symbol['for'];var createWellKnownSymbol=USE_SYMBOL_AS_UID?_Symbol:_Symbol&&_Symbol.withoutSetter||uid;module.exports=function(name){if(!hasOwn(WellKnownSymbolsStore,name)||!(NATIVE_SYMBOL||typeof WellKnownSymbolsStore[name]=='string')){var description='Symbol.'+name;if(NATIVE_SYMBOL&&hasOwn(_Symbol,name)){WellKnownSymbolsStore[name]=_Symbol[name];}else if(USE_SYMBOL_AS_UID&&symbolFor){WellKnownSymbolsStore[name]=symbolFor(description);}else {WellKnownSymbolsStore[name]=createWellKnownSymbol(description);}}return WellKnownSymbolsStore[name];};},{"../internals/global":127,"../internals/has-own-property":128,"../internals/native-symbol":148,"../internals/shared":175,"../internals/uid":188,"../internals/use-symbol-as-uid":189}],192:[function(require,module,exports){module.exports="\t\n\x0B\f\r \xA0\u1680\u2000\u2001\u2002"+"\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";},{}],193:[function(require,module,exports){var $=require('../internals/export');var global=require('../internals/global');var fails=require('../internals/fails');var isArray=require('../internals/is-array');var isObject=require('../internals/is-object');var toObject=require('../internals/to-object');var lengthOfArrayLike=require('../internals/length-of-array-like');var createProperty=require('../internals/create-property');var arraySpeciesCreate=require('../internals/array-species-create');var arrayMethodHasSpeciesSupport=require('../internals/array-method-has-species-support');var wellKnownSymbol=require('../internals/well-known-symbol');var V8_VERSION=require('../internals/engine-v8-version');var IS_CONCAT_SPREADABLE=wellKnownSymbol('isConcatSpreadable');var MAX_SAFE_INTEGER=0x1FFFFFFFFFFFFF;var MAXIMUM_ALLOWED_INDEX_EXCEEDED='Maximum allowed index exceeded';var TypeError=global.TypeError;// We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679
	var IS_CONCAT_SPREADABLE_SUPPORT=V8_VERSION>=51||!fails(function(){var array=[];array[IS_CONCAT_SPREADABLE]=false;return array.concat()[0]!==array;});var SPECIES_SUPPORT=arrayMethodHasSpeciesSupport('concat');var isConcatSpreadable=function isConcatSpreadable(O){if(!isObject(O))return false;var spreadable=O[IS_CONCAT_SPREADABLE];return spreadable!==undefined?!!spreadable:isArray(O);};var FORCED=!IS_CONCAT_SPREADABLE_SUPPORT||!SPECIES_SUPPORT;// `Array.prototype.concat` method
	// https://tc39.es/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species
	$({target:'Array',proto:true,forced:FORCED},{// eslint-disable-next-line no-unused-vars -- required for `.length`
	concat:function concat(arg){var O=toObject(this);var A=arraySpeciesCreate(O,0);var n=0;var i,k,length,len,E;for(i=-1,length=arguments.length;i<length;i++){E=i===-1?O:arguments[i];if(isConcatSpreadable(E)){len=lengthOfArrayLike(E);if(n+len>MAX_SAFE_INTEGER)throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);for(k=0;k<len;k++,n++){if(k in E)createProperty(A,n,E[k]);}}else {if(n>=MAX_SAFE_INTEGER)throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);createProperty(A,n++,E);}}A.length=n;return A;}});},{"../internals/array-method-has-species-support":86,"../internals/array-species-create":92,"../internals/create-property":102,"../internals/engine-v8-version":112,"../internals/export":116,"../internals/fails":117,"../internals/global":127,"../internals/is-array":136,"../internals/is-object":140,"../internals/length-of-array-like":147,"../internals/to-object":182,"../internals/well-known-symbol":191}],194:[function(require,module,exports){var $=require('../internals/export');var forEach=require('../internals/array-for-each');// `Array.prototype.forEach` method
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	// eslint-disable-next-line es/no-array-prototype-foreach -- safe
	$({target:'Array',proto:true,forced:[].forEach!=forEach},{forEach:forEach});},{"../internals/array-for-each":82,"../internals/export":116}],195:[function(require,module,exports){var $=require('../internals/export');var from=require('../internals/array-from');var checkCorrectnessOfIteration=require('../internals/check-correctness-of-iteration');var INCORRECT_ITERATION=!checkCorrectnessOfIteration(function(iterable){// eslint-disable-next-line es/no-array-from -- required for testing
	});// `Array.from` method
	// https://tc39.es/ecma262/#sec-array.from
	$({target:'Array',stat:true,forced:INCORRECT_ITERATION},{from:from});},{"../internals/array-from":83,"../internals/check-correctness-of-iteration":94,"../internals/export":116}],196:[function(require,module,exports){var $=require('../internals/export');var $includes=require('../internals/array-includes').includes;var addToUnscopables=require('../internals/add-to-unscopables');// `Array.prototype.includes` method
	// https://tc39.es/ecma262/#sec-array.prototype.includes
	$({target:'Array',proto:true},{includes:function includes(el/* , fromIndex = 0 */){return $includes(this,el,arguments.length>1?arguments[1]:undefined);}});// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('includes');},{"../internals/add-to-unscopables":80,"../internals/array-includes":84,"../internals/export":116}],197:[function(require,module,exports){/* eslint-disable es/no-array-prototype-indexof -- required for testing */var $=require('../internals/export');var uncurryThis=require('../internals/function-uncurry-this');var $IndexOf=require('../internals/array-includes').indexOf;var arrayMethodIsStrict=require('../internals/array-method-is-strict');var un$IndexOf=uncurryThis([].indexOf);var NEGATIVE_ZERO=!!un$IndexOf&&1/un$IndexOf([1],1,-0)<0;var STRICT_METHOD=arrayMethodIsStrict('indexOf');// `Array.prototype.indexOf` method
	// https://tc39.es/ecma262/#sec-array.prototype.indexof
	$({target:'Array',proto:true,forced:NEGATIVE_ZERO||!STRICT_METHOD},{indexOf:function indexOf(searchElement/* , fromIndex = 0 */){var fromIndex=arguments.length>1?arguments[1]:undefined;return NEGATIVE_ZERO// convert -0 to +0
	?un$IndexOf(this,searchElement,fromIndex)||0:$IndexOf(this,searchElement,fromIndex);}});},{"../internals/array-includes":84,"../internals/array-method-is-strict":87,"../internals/export":116,"../internals/function-uncurry-this":122}],198:[function(require,module,exports){var $=require('../internals/export');var isArray=require('../internals/is-array');// `Array.isArray` method
	// https://tc39.es/ecma262/#sec-array.isarray
	$({target:'Array',stat:true},{isArray:isArray});},{"../internals/export":116,"../internals/is-array":136}],199:[function(require,module,exports){var toIndexedObject=require('../internals/to-indexed-object');var addToUnscopables=require('../internals/add-to-unscopables');var Iterators=require('../internals/iterators');var InternalStateModule=require('../internals/internal-state');var defineIterator=require('../internals/define-iterator');var ARRAY_ITERATOR='Array Iterator';var setInternalState=InternalStateModule.set;var getInternalState=InternalStateModule.getterFor(ARRAY_ITERATOR);// `Array.prototype.entries` method
	// https://tc39.es/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.es/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.es/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.es/ecma262/#sec-createarrayiterator
	module.exports=defineIterator(Array,'Array',function(iterated,kind){setInternalState(this,{type:ARRAY_ITERATOR,target:toIndexedObject(iterated),// target
	index:0,// next index
	kind:kind// kind
	});// `%ArrayIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
	},function(){var state=getInternalState(this);var target=state.target;var kind=state.kind;var index=state.index++;if(!target||index>=target.length){state.target=undefined;return {value:undefined,done:true};}if(kind=='keys')return {value:index,done:false};if(kind=='values')return {value:target[index],done:false};return {value:[index,target[index]],done:false};},'values');// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.es/ecma262/#sec-createmappedargumentsobject
	Iterators.Arguments=Iterators.Array;// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('keys');addToUnscopables('values');addToUnscopables('entries');},{"../internals/add-to-unscopables":80,"../internals/define-iterator":103,"../internals/internal-state":134,"../internals/iterators":146,"../internals/to-indexed-object":179}],200:[function(require,module,exports){var $=require('../internals/export');var $map=require('../internals/array-iteration').map;var arrayMethodHasSpeciesSupport=require('../internals/array-method-has-species-support');var HAS_SPECIES_SUPPORT=arrayMethodHasSpeciesSupport('map');// `Array.prototype.map` method
	// https://tc39.es/ecma262/#sec-array.prototype.map
	// with adding support of @@species
	$({target:'Array',proto:true,forced:!HAS_SPECIES_SUPPORT},{map:function map(callbackfn/* , thisArg */){return $map(this,callbackfn,arguments.length>1?arguments[1]:undefined);}});},{"../internals/array-iteration":85,"../internals/array-method-has-species-support":86,"../internals/export":116}],201:[function(require,module,exports){var $=require('../internals/export');var $reduce=require('../internals/array-reduce').left;var arrayMethodIsStrict=require('../internals/array-method-is-strict');var CHROME_VERSION=require('../internals/engine-v8-version');var IS_NODE=require('../internals/engine-is-node');var STRICT_METHOD=arrayMethodIsStrict('reduce');// Chrome 80-82 has a critical bug
	// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
	var CHROME_BUG=!IS_NODE&&CHROME_VERSION>79&&CHROME_VERSION<83;// `Array.prototype.reduce` method
	// https://tc39.es/ecma262/#sec-array.prototype.reduce
	$({target:'Array',proto:true,forced:!STRICT_METHOD||CHROME_BUG},{reduce:function reduce(callbackfn/* , initialValue */){var length=arguments.length;return $reduce(this,callbackfn,length,length>1?arguments[1]:undefined);}});},{"../internals/array-method-is-strict":87,"../internals/array-reduce":88,"../internals/engine-is-node":110,"../internals/engine-v8-version":112,"../internals/export":116}],202:[function(require,module,exports){var $=require('../internals/export');var global=require('../internals/global');var isArray=require('../internals/is-array');var isConstructor=require('../internals/is-constructor');var isObject=require('../internals/is-object');var toAbsoluteIndex=require('../internals/to-absolute-index');var lengthOfArrayLike=require('../internals/length-of-array-like');var toIndexedObject=require('../internals/to-indexed-object');var createProperty=require('../internals/create-property');var wellKnownSymbol=require('../internals/well-known-symbol');var arrayMethodHasSpeciesSupport=require('../internals/array-method-has-species-support');var un$Slice=require('../internals/array-slice');var HAS_SPECIES_SUPPORT=arrayMethodHasSpeciesSupport('slice');var SPECIES=wellKnownSymbol('species');var Array=global.Array;var max=Math.max;// `Array.prototype.slice` method
	// https://tc39.es/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects
	$({target:'Array',proto:true,forced:!HAS_SPECIES_SUPPORT},{slice:function slice(start,end){var O=toIndexedObject(this);var length=lengthOfArrayLike(O);var k=toAbsoluteIndex(start,length);var fin=toAbsoluteIndex(end===undefined?length:end,length);// inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
	var Constructor,result,n;if(isArray(O)){Constructor=O.constructor;// cross-realm fallback
	if(isConstructor(Constructor)&&(Constructor===Array||isArray(Constructor.prototype))){Constructor=undefined;}else if(isObject(Constructor)){Constructor=Constructor[SPECIES];if(Constructor===null)Constructor=undefined;}if(Constructor===Array||Constructor===undefined){return un$Slice(O,k,fin);}}result=new(Constructor===undefined?Array:Constructor)(max(fin-k,0));for(n=0;k<fin;k++,n++){if(k in O)createProperty(result,n,O[k]);}result.length=n;return result;}});},{"../internals/array-method-has-species-support":86,"../internals/array-slice":89,"../internals/create-property":102,"../internals/export":116,"../internals/global":127,"../internals/is-array":136,"../internals/is-constructor":138,"../internals/is-object":140,"../internals/length-of-array-like":147,"../internals/to-absolute-index":178,"../internals/to-indexed-object":179,"../internals/well-known-symbol":191}],203:[function(require,module,exports){var $=require('../internals/export');var uncurryThis=require('../internals/function-uncurry-this');var aCallable=require('../internals/a-callable');var toObject=require('../internals/to-object');var lengthOfArrayLike=require('../internals/length-of-array-like');var toString=require('../internals/to-string');var fails=require('../internals/fails');var internalSort=require('../internals/array-sort');var arrayMethodIsStrict=require('../internals/array-method-is-strict');var FF=require('../internals/engine-ff-version');var IE_OR_EDGE=require('../internals/engine-is-ie-or-edge');var V8=require('../internals/engine-v8-version');var WEBKIT=require('../internals/engine-webkit-version');var test=[];var un$Sort=uncurryThis(test.sort);var push=uncurryThis(test.push);// IE8-
	var FAILS_ON_UNDEFINED=fails(function(){test.sort(undefined);});// V8 bug
	var FAILS_ON_NULL=fails(function(){test.sort(null);});// Old WebKit
	var STRICT_METHOD=arrayMethodIsStrict('sort');var STABLE_SORT=!fails(function(){// feature detection can be too slow, so check engines versions
	if(V8)return V8<70;if(FF&&FF>3)return;if(IE_OR_EDGE)return true;if(WEBKIT)return WEBKIT<603;var result='';var code,chr,value,index;// generate an array with more 512 elements (Chakra and old V8 fails only in this case)
	for(code=65;code<76;code++){chr=String.fromCharCode(code);switch(code){case 66:case 69:case 70:case 72:value=3;break;case 68:case 71:value=4;break;default:value=2;}for(index=0;index<47;index++){test.push({k:chr+index,v:value});}}test.sort(function(a,b){return b.v-a.v;});for(index=0;index<test.length;index++){chr=test[index].k.charAt(0);if(result.charAt(result.length-1)!==chr)result+=chr;}return result!=='DGBEFHACIJK';});var FORCED=FAILS_ON_UNDEFINED||!FAILS_ON_NULL||!STRICT_METHOD||!STABLE_SORT;var getSortCompare=function getSortCompare(comparefn){return function(x,y){if(y===undefined)return -1;if(x===undefined)return 1;if(comparefn!==undefined)return +comparefn(x,y)||0;return toString(x)>toString(y)?1:-1;};};// `Array.prototype.sort` method
	// https://tc39.es/ecma262/#sec-array.prototype.sort
	$({target:'Array',proto:true,forced:FORCED},{sort:function sort(comparefn){if(comparefn!==undefined)aCallable(comparefn);var array=toObject(this);if(STABLE_SORT)return comparefn===undefined?un$Sort(array):un$Sort(array,comparefn);var items=[];var arrayLength=lengthOfArrayLike(array);var itemsLength,index;for(index=0;index<arrayLength;index++){if(index in array)push(items,array[index]);}internalSort(items,getSortCompare(comparefn));itemsLength=items.length;index=0;while(index<itemsLength){array[index]=items[index++];}while(index<arrayLength){delete array[index++];}return array;}});},{"../internals/a-callable":78,"../internals/array-method-is-strict":87,"../internals/array-sort":90,"../internals/engine-ff-version":108,"../internals/engine-is-ie-or-edge":109,"../internals/engine-v8-version":112,"../internals/engine-webkit-version":113,"../internals/export":116,"../internals/fails":117,"../internals/function-uncurry-this":122,"../internals/length-of-array-like":147,"../internals/to-object":182,"../internals/to-string":186}],204:[function(require,module,exports){var global=require('../internals/global');var setToStringTag=require('../internals/set-to-string-tag');// JSON[@@toStringTag] property
	// https://tc39.es/ecma262/#sec-json-@@tostringtag
	setToStringTag(global.JSON,'JSON',true);},{"../internals/global":127,"../internals/set-to-string-tag":172}],205:[function(require,module,exports){// empty
	},{}],206:[function(require,module,exports){var $=require('../internals/export');var DESCRIPTORS=require('../internals/descriptors');var create=require('../internals/object-create');// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	$({target:'Object',stat:true,sham:!DESCRIPTORS},{create:create});},{"../internals/descriptors":105,"../internals/export":116,"../internals/object-create":152}],207:[function(require,module,exports){var $=require('../internals/export');var DESCRIPTORS=require('../internals/descriptors');var objectDefinePropertyModile=require('../internals/object-define-property');// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	$({target:'Object',stat:true,forced:!DESCRIPTORS,sham:!DESCRIPTORS},{defineProperty:objectDefinePropertyModile.f});},{"../internals/descriptors":105,"../internals/export":116,"../internals/object-define-property":154}],208:[function(require,module,exports){// empty
	},{}],209:[function(require,module,exports){var $=require('../internals/export');var $parseInt=require('../internals/number-parse-int');// `parseInt` method
	// https://tc39.es/ecma262/#sec-parseint-string-radix
	$({global:true,forced:parseInt!=$parseInt},{parseInt:$parseInt});},{"../internals/export":116,"../internals/number-parse-int":151}],210:[function(require,module,exports){// empty
	},{}],211:[function(require,module,exports){// empty
	},{}],212:[function(require,module,exports){var $=require('../internals/export');var uncurryThis=require('../internals/function-uncurry-this');var notARegExp=require('../internals/not-a-regexp');var requireObjectCoercible=require('../internals/require-object-coercible');var toString=require('../internals/to-string');var correctIsRegExpLogic=require('../internals/correct-is-regexp-logic');var stringIndexOf=uncurryThis(''.indexOf);// `String.prototype.includes` method
	// https://tc39.es/ecma262/#sec-string.prototype.includes
	$({target:'String',proto:true,forced:!correctIsRegExpLogic('includes')},{includes:function includes(searchString/* , position = 0 */){return !!~stringIndexOf(toString(requireObjectCoercible(this)),toString(notARegExp(searchString)),arguments.length>1?arguments[1]:undefined);}});},{"../internals/correct-is-regexp-logic":97,"../internals/export":116,"../internals/function-uncurry-this":122,"../internals/not-a-regexp":150,"../internals/require-object-coercible":170,"../internals/to-string":186}],213:[function(require,module,exports){var charAt=require('../internals/string-multibyte').charAt;var toString=require('../internals/to-string');var InternalStateModule=require('../internals/internal-state');var defineIterator=require('../internals/define-iterator');var STRING_ITERATOR='String Iterator';var setInternalState=InternalStateModule.set;var getInternalState=InternalStateModule.getterFor(STRING_ITERATOR);// `String.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String,'String',function(iterated){setInternalState(this,{type:STRING_ITERATOR,string:toString(iterated),index:0});// `%StringIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
	},function next(){var state=getInternalState(this);var string=state.string;var index=state.index;var point;if(index>=string.length)return {value:undefined,done:true};point=charAt(string,index);state.index+=point.length;return {value:point,done:false};});},{"../internals/define-iterator":103,"../internals/internal-state":134,"../internals/string-multibyte":176,"../internals/to-string":186}],214:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.asyncIterator` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.asynciterator
	defineWellKnownSymbol('asyncIterator');},{"../internals/define-well-known-symbol":104}],215:[function(require,module,exports){// empty
	},{}],216:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.hasInstance` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.hasinstance
	defineWellKnownSymbol('hasInstance');},{"../internals/define-well-known-symbol":104}],217:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.isConcatSpreadable` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.isconcatspreadable
	defineWellKnownSymbol('isConcatSpreadable');},{"../internals/define-well-known-symbol":104}],218:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.iterator` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.iterator
	defineWellKnownSymbol('iterator');},{"../internals/define-well-known-symbol":104}],219:[function(require,module,exports){var $=require('../internals/export');var global=require('../internals/global');var getBuiltIn=require('../internals/get-built-in');var apply=require('../internals/function-apply');var call=require('../internals/function-call');var uncurryThis=require('../internals/function-uncurry-this');var IS_PURE=require('../internals/is-pure');var DESCRIPTORS=require('../internals/descriptors');var NATIVE_SYMBOL=require('../internals/native-symbol');var fails=require('../internals/fails');var hasOwn=require('../internals/has-own-property');var isArray=require('../internals/is-array');var isCallable=require('../internals/is-callable');var isObject=require('../internals/is-object');var isPrototypeOf=require('../internals/object-is-prototype-of');var isSymbol=require('../internals/is-symbol');var anObject=require('../internals/an-object');var toObject=require('../internals/to-object');var toIndexedObject=require('../internals/to-indexed-object');var toPropertyKey=require('../internals/to-property-key');var $toString=require('../internals/to-string');var createPropertyDescriptor=require('../internals/create-property-descriptor');var nativeObjectCreate=require('../internals/object-create');var objectKeys=require('../internals/object-keys');var getOwnPropertyNamesModule=require('../internals/object-get-own-property-names');var getOwnPropertyNamesExternal=require('../internals/object-get-own-property-names-external');var getOwnPropertySymbolsModule=require('../internals/object-get-own-property-symbols');var getOwnPropertyDescriptorModule=require('../internals/object-get-own-property-descriptor');var definePropertyModule=require('../internals/object-define-property');var propertyIsEnumerableModule=require('../internals/object-property-is-enumerable');var arraySlice=require('../internals/array-slice');var redefine=require('../internals/redefine');var shared=require('../internals/shared');var sharedKey=require('../internals/shared-key');var hiddenKeys=require('../internals/hidden-keys');var uid=require('../internals/uid');var wellKnownSymbol=require('../internals/well-known-symbol');var wrappedWellKnownSymbolModule=require('../internals/well-known-symbol-wrapped');var defineWellKnownSymbol=require('../internals/define-well-known-symbol');var setToStringTag=require('../internals/set-to-string-tag');var InternalStateModule=require('../internals/internal-state');var $forEach=require('../internals/array-iteration').forEach;var HIDDEN=sharedKey('hidden');var SYMBOL='Symbol';var PROTOTYPE='prototype';var TO_PRIMITIVE=wellKnownSymbol('toPrimitive');var setInternalState=InternalStateModule.set;var getInternalState=InternalStateModule.getterFor(SYMBOL);var ObjectPrototype=Object[PROTOTYPE];var $Symbol=global.Symbol;var SymbolPrototype=$Symbol&&$Symbol[PROTOTYPE];var TypeError=global.TypeError;var QObject=global.QObject;var $stringify=getBuiltIn('JSON','stringify');var nativeGetOwnPropertyDescriptor=getOwnPropertyDescriptorModule.f;var nativeDefineProperty=definePropertyModule.f;var nativeGetOwnPropertyNames=getOwnPropertyNamesExternal.f;var nativePropertyIsEnumerable=propertyIsEnumerableModule.f;var push=uncurryThis([].push);var AllSymbols=shared('symbols');var ObjectPrototypeSymbols=shared('op-symbols');var StringToSymbolRegistry=shared('string-to-symbol-registry');var SymbolToStringRegistry=shared('symbol-to-string-registry');var WellKnownSymbolsStore=shared('wks');// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var USE_SETTER=!QObject||!QObject[PROTOTYPE]||!QObject[PROTOTYPE].findChild;// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDescriptor=DESCRIPTORS&&fails(function(){return nativeObjectCreate(nativeDefineProperty({},'a',{get:function get(){return nativeDefineProperty(this,'a',{value:7}).a;}})).a!=7;})?function(O,P,Attributes){var ObjectPrototypeDescriptor=nativeGetOwnPropertyDescriptor(ObjectPrototype,P);if(ObjectPrototypeDescriptor)delete ObjectPrototype[P];nativeDefineProperty(O,P,Attributes);if(ObjectPrototypeDescriptor&&O!==ObjectPrototype){nativeDefineProperty(ObjectPrototype,P,ObjectPrototypeDescriptor);}}:nativeDefineProperty;var wrap=function wrap(tag,description){var symbol=AllSymbols[tag]=nativeObjectCreate(SymbolPrototype);setInternalState(symbol,{type:SYMBOL,tag:tag,description:description});if(!DESCRIPTORS)symbol.description=description;return symbol;};var $defineProperty=function defineProperty(O,P,Attributes){if(O===ObjectPrototype)$defineProperty(ObjectPrototypeSymbols,P,Attributes);anObject(O);var key=toPropertyKey(P);anObject(Attributes);if(hasOwn(AllSymbols,key)){if(!Attributes.enumerable){if(!hasOwn(O,HIDDEN))nativeDefineProperty(O,HIDDEN,createPropertyDescriptor(1,{}));O[HIDDEN][key]=true;}else {if(hasOwn(O,HIDDEN)&&O[HIDDEN][key])O[HIDDEN][key]=false;Attributes=nativeObjectCreate(Attributes,{enumerable:createPropertyDescriptor(0,false)});}return setSymbolDescriptor(O,key,Attributes);}return nativeDefineProperty(O,key,Attributes);};var $defineProperties=function defineProperties(O,Properties){anObject(O);var properties=toIndexedObject(Properties);var keys=objectKeys(properties).concat($getOwnPropertySymbols(properties));$forEach(keys,function(key){if(!DESCRIPTORS||call($propertyIsEnumerable,properties,key))$defineProperty(O,key,properties[key]);});return O;};var $create=function create(O,Properties){return Properties===undefined?nativeObjectCreate(O):$defineProperties(nativeObjectCreate(O),Properties);};var $propertyIsEnumerable=function propertyIsEnumerable(V){var P=toPropertyKey(V);var enumerable=call(nativePropertyIsEnumerable,this,P);if(this===ObjectPrototype&&hasOwn(AllSymbols,P)&&!hasOwn(ObjectPrototypeSymbols,P))return false;return enumerable||!hasOwn(this,P)||!hasOwn(AllSymbols,P)||hasOwn(this,HIDDEN)&&this[HIDDEN][P]?enumerable:true;};var $getOwnPropertyDescriptor=function getOwnPropertyDescriptor(O,P){var it=toIndexedObject(O);var key=toPropertyKey(P);if(it===ObjectPrototype&&hasOwn(AllSymbols,key)&&!hasOwn(ObjectPrototypeSymbols,key))return;var descriptor=nativeGetOwnPropertyDescriptor(it,key);if(descriptor&&hasOwn(AllSymbols,key)&&!(hasOwn(it,HIDDEN)&&it[HIDDEN][key])){descriptor.enumerable=true;}return descriptor;};var $getOwnPropertyNames=function getOwnPropertyNames(O){var names=nativeGetOwnPropertyNames(toIndexedObject(O));var result=[];$forEach(names,function(key){if(!hasOwn(AllSymbols,key)&&!hasOwn(hiddenKeys,key))push(result,key);});return result;};var $getOwnPropertySymbols=function getOwnPropertySymbols(O){var IS_OBJECT_PROTOTYPE=O===ObjectPrototype;var names=nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE?ObjectPrototypeSymbols:toIndexedObject(O));var result=[];$forEach(names,function(key){if(hasOwn(AllSymbols,key)&&(!IS_OBJECT_PROTOTYPE||hasOwn(ObjectPrototype,key))){push(result,AllSymbols[key]);}});return result;};// `Symbol` constructor
	// https://tc39.es/ecma262/#sec-symbol-constructor
	if(!NATIVE_SYMBOL){$Symbol=function _Symbol(){if(isPrototypeOf(SymbolPrototype,this))throw TypeError('Symbol is not a constructor');var description=!arguments.length||arguments[0]===undefined?undefined:$toString(arguments[0]);var tag=uid(description);var setter=function setter(value){if(this===ObjectPrototype)call(setter,ObjectPrototypeSymbols,value);if(hasOwn(this,HIDDEN)&&hasOwn(this[HIDDEN],tag))this[HIDDEN][tag]=false;setSymbolDescriptor(this,tag,createPropertyDescriptor(1,value));};if(DESCRIPTORS&&USE_SETTER)setSymbolDescriptor(ObjectPrototype,tag,{configurable:true,set:setter});return wrap(tag,description);};SymbolPrototype=$Symbol[PROTOTYPE];redefine(SymbolPrototype,'toString',function toString(){return getInternalState(this).tag;});redefine($Symbol,'withoutSetter',function(description){return wrap(uid(description),description);});propertyIsEnumerableModule.f=$propertyIsEnumerable;definePropertyModule.f=$defineProperty;getOwnPropertyDescriptorModule.f=$getOwnPropertyDescriptor;getOwnPropertyNamesModule.f=getOwnPropertyNamesExternal.f=$getOwnPropertyNames;getOwnPropertySymbolsModule.f=$getOwnPropertySymbols;wrappedWellKnownSymbolModule.f=function(name){return wrap(wellKnownSymbol(name),name);};if(DESCRIPTORS){// https://github.com/tc39/proposal-Symbol-description
	nativeDefineProperty(SymbolPrototype,'description',{configurable:true,get:function description(){return getInternalState(this).description;}});if(!IS_PURE){redefine(ObjectPrototype,'propertyIsEnumerable',$propertyIsEnumerable,{unsafe:true});}}}$({global:true,wrap:true,forced:!NATIVE_SYMBOL,sham:!NATIVE_SYMBOL},{Symbol:$Symbol});$forEach(objectKeys(WellKnownSymbolsStore),function(name){defineWellKnownSymbol(name);});$({target:SYMBOL,stat:true,forced:!NATIVE_SYMBOL},{// `Symbol.for` method
	// https://tc39.es/ecma262/#sec-symbol.for
	'for':function _for(key){var string=$toString(key);if(hasOwn(StringToSymbolRegistry,string))return StringToSymbolRegistry[string];var symbol=$Symbol(string);StringToSymbolRegistry[string]=symbol;SymbolToStringRegistry[symbol]=string;return symbol;},// `Symbol.keyFor` method
	// https://tc39.es/ecma262/#sec-symbol.keyfor
	keyFor:function keyFor(sym){if(!isSymbol(sym))throw TypeError(sym+' is not a symbol');if(hasOwn(SymbolToStringRegistry,sym))return SymbolToStringRegistry[sym];},useSetter:function useSetter(){USE_SETTER=true;},useSimple:function useSimple(){USE_SETTER=false;}});$({target:'Object',stat:true,forced:!NATIVE_SYMBOL,sham:!DESCRIPTORS},{// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	create:$create,// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	defineProperty:$defineProperty,// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	defineProperties:$defineProperties,// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
	getOwnPropertyDescriptor:$getOwnPropertyDescriptor});$({target:'Object',stat:true,forced:!NATIVE_SYMBOL},{// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	getOwnPropertyNames:$getOwnPropertyNames,// `Object.getOwnPropertySymbols` method
	// https://tc39.es/ecma262/#sec-object.getownpropertysymbols
	getOwnPropertySymbols:$getOwnPropertySymbols});// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
	// https://bugs.chromium.org/p/v8/issues/detail?id=3443
	$({target:'Object',stat:true,forced:fails(function(){getOwnPropertySymbolsModule.f(1);})},{getOwnPropertySymbols:function getOwnPropertySymbols(it){return getOwnPropertySymbolsModule.f(toObject(it));}});// `JSON.stringify` method behavior with symbols
	// https://tc39.es/ecma262/#sec-json.stringify
	if($stringify){var FORCED_JSON_STRINGIFY=!NATIVE_SYMBOL||fails(function(){var symbol=$Symbol();// MS Edge converts symbol values to JSON as {}
	return $stringify([symbol])!='[null]'// WebKit converts symbol values to JSON as null
	||$stringify({a:symbol})!='{}'// V8 throws on boxed symbols
	||$stringify(Object(symbol))!='{}';});$({target:'JSON',stat:true,forced:FORCED_JSON_STRINGIFY},{// eslint-disable-next-line no-unused-vars -- required for `.length`
	stringify:function stringify(it,replacer,space){var args=arraySlice(arguments);var $replacer=replacer;if(!isObject(replacer)&&it===undefined||isSymbol(it))return;// IE8 returns string on undefined
	if(!isArray(replacer))replacer=function replacer(key,value){if(isCallable($replacer))value=call($replacer,this,key,value);if(!isSymbol(value))return value;};args[1]=replacer;return apply($stringify,null,args);}});}// `Symbol.prototype[@@toPrimitive]` method
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
	if(!SymbolPrototype[TO_PRIMITIVE]){var valueOf=SymbolPrototype.valueOf;// eslint-disable-next-line no-unused-vars -- required for .length
	redefine(SymbolPrototype,TO_PRIMITIVE,function(hint){// TODO: improve hint logic
	return call(valueOf,this);});}// `Symbol.prototype[@@toStringTag]` property
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
	setToStringTag($Symbol,SYMBOL);hiddenKeys[HIDDEN]=true;},{"../internals/an-object":81,"../internals/array-iteration":85,"../internals/array-slice":89,"../internals/create-property-descriptor":101,"../internals/define-well-known-symbol":104,"../internals/descriptors":105,"../internals/export":116,"../internals/fails":117,"../internals/function-apply":118,"../internals/function-call":120,"../internals/function-uncurry-this":122,"../internals/get-built-in":123,"../internals/global":127,"../internals/has-own-property":128,"../internals/hidden-keys":129,"../internals/internal-state":134,"../internals/is-array":136,"../internals/is-callable":137,"../internals/is-object":140,"../internals/is-pure":141,"../internals/is-symbol":143,"../internals/native-symbol":148,"../internals/object-create":152,"../internals/object-define-property":154,"../internals/object-get-own-property-descriptor":155,"../internals/object-get-own-property-names":157,"../internals/object-get-own-property-names-external":156,"../internals/object-get-own-property-symbols":158,"../internals/object-is-prototype-of":160,"../internals/object-keys":162,"../internals/object-property-is-enumerable":163,"../internals/redefine":168,"../internals/set-to-string-tag":172,"../internals/shared":175,"../internals/shared-key":173,"../internals/to-indexed-object":179,"../internals/to-object":182,"../internals/to-property-key":184,"../internals/to-string":186,"../internals/uid":188,"../internals/well-known-symbol":191,"../internals/well-known-symbol-wrapped":190}],220:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.matchAll` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.matchall
	defineWellKnownSymbol('matchAll');},{"../internals/define-well-known-symbol":104}],221:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.match` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.match
	defineWellKnownSymbol('match');},{"../internals/define-well-known-symbol":104}],222:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.replace` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.replace
	defineWellKnownSymbol('replace');},{"../internals/define-well-known-symbol":104}],223:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.search` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.search
	defineWellKnownSymbol('search');},{"../internals/define-well-known-symbol":104}],224:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.species` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.species
	defineWellKnownSymbol('species');},{"../internals/define-well-known-symbol":104}],225:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.split` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.split
	defineWellKnownSymbol('split');},{"../internals/define-well-known-symbol":104}],226:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.toPrimitive` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.toprimitive
	defineWellKnownSymbol('toPrimitive');},{"../internals/define-well-known-symbol":104}],227:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.toStringTag` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.tostringtag
	defineWellKnownSymbol('toStringTag');},{"../internals/define-well-known-symbol":104}],228:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.unscopables` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.unscopables
	defineWellKnownSymbol('unscopables');},{"../internals/define-well-known-symbol":104}],229:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.asyncDispose` well-known symbol
	// https://github.com/tc39/proposal-using-statement
	defineWellKnownSymbol('asyncDispose');},{"../internals/define-well-known-symbol":104}],230:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.dispose` well-known symbol
	// https://github.com/tc39/proposal-using-statement
	defineWellKnownSymbol('dispose');},{"../internals/define-well-known-symbol":104}],231:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.matcher` well-known symbol
	// https://github.com/tc39/proposal-pattern-matching
	defineWellKnownSymbol('matcher');},{"../internals/define-well-known-symbol":104}],232:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.metadata` well-known symbol
	// https://github.com/tc39/proposal-decorators
	defineWellKnownSymbol('metadata');},{"../internals/define-well-known-symbol":104}],233:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.observable` well-known symbol
	// https://github.com/tc39/proposal-observable
	defineWellKnownSymbol('observable');},{"../internals/define-well-known-symbol":104}],234:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');// `Symbol.patternMatch` well-known symbol
	// https://github.com/tc39/proposal-pattern-matching
	defineWellKnownSymbol('patternMatch');},{"../internals/define-well-known-symbol":104}],235:[function(require,module,exports){var defineWellKnownSymbol=require('../internals/define-well-known-symbol');defineWellKnownSymbol('replaceAll');},{"../internals/define-well-known-symbol":104}],236:[function(require,module,exports){require('../modules/es.array.iterator');var DOMIterables=require('../internals/dom-iterables');var global=require('../internals/global');var classof=require('../internals/classof');var createNonEnumerableProperty=require('../internals/create-non-enumerable-property');var Iterators=require('../internals/iterators');var wellKnownSymbol=require('../internals/well-known-symbol');var TO_STRING_TAG=wellKnownSymbol('toStringTag');for(var COLLECTION_NAME in DOMIterables){var Collection=global[COLLECTION_NAME];var CollectionPrototype=Collection&&Collection.prototype;if(CollectionPrototype&&classof(CollectionPrototype)!==TO_STRING_TAG){createNonEnumerableProperty(CollectionPrototype,TO_STRING_TAG,COLLECTION_NAME);}Iterators[COLLECTION_NAME]=Iterators.Array;}},{"../internals/classof":96,"../internals/create-non-enumerable-property":100,"../internals/dom-iterables":107,"../internals/global":127,"../internals/iterators":146,"../internals/well-known-symbol":191,"../modules/es.array.iterator":199}],237:[function(require,module,exports){var parent=require('../../es/array/from');module.exports=parent;},{"../../es/array/from":46}],238:[function(require,module,exports){var parent=require('../../es/array/is-array');module.exports=parent;},{"../../es/array/is-array":47}],239:[function(require,module,exports){var parent=require('../../../es/array/virtual/for-each');module.exports=parent;},{"../../../es/array/virtual/for-each":49}],240:[function(require,module,exports){var parent=require('../es/get-iterator-method');require('../modules/web.dom-collections.iterator');module.exports=parent;},{"../es/get-iterator-method":56,"../modules/web.dom-collections.iterator":236}],241:[function(require,module,exports){var parent=require('../es/get-iterator');require('../modules/web.dom-collections.iterator');module.exports=parent;},{"../es/get-iterator":57,"../modules/web.dom-collections.iterator":236}],242:[function(require,module,exports){var parent=require('../../es/instance/concat');module.exports=parent;},{"../../es/instance/concat":58}],243:[function(require,module,exports){var parent=require('../../es/instance/flags');module.exports=parent;},{"../../es/instance/flags":59}],244:[function(require,module,exports){require('../../modules/web.dom-collections.iterator');var classof=require('../../internals/classof');var hasOwn=require('../../internals/has-own-property');var isPrototypeOf=require('../../internals/object-is-prototype-of');var method=require('../array/virtual/for-each');var ArrayPrototype=Array.prototype;var DOMIterables={DOMTokenList:true,NodeList:true};module.exports=function(it){var own=it.forEach;return it===ArrayPrototype||isPrototypeOf(ArrayPrototype,it)&&own===ArrayPrototype.forEach||hasOwn(DOMIterables,classof(it))?method:own;};},{"../../internals/classof":96,"../../internals/has-own-property":128,"../../internals/object-is-prototype-of":160,"../../modules/web.dom-collections.iterator":236,"../array/virtual/for-each":239}],245:[function(require,module,exports){var parent=require('../../es/instance/includes');module.exports=parent;},{"../../es/instance/includes":60}],246:[function(require,module,exports){var parent=require('../../es/instance/index-of');module.exports=parent;},{"../../es/instance/index-of":61}],247:[function(require,module,exports){var parent=require('../../es/instance/map');module.exports=parent;},{"../../es/instance/map":62}],248:[function(require,module,exports){var parent=require('../../es/instance/reduce');module.exports=parent;},{"../../es/instance/reduce":63}],249:[function(require,module,exports){var parent=require('../../es/instance/slice');module.exports=parent;},{"../../es/instance/slice":64}],250:[function(require,module,exports){var parent=require('../../es/instance/sort');module.exports=parent;},{"../../es/instance/sort":65}],251:[function(require,module,exports){var parent=require('../../es/object/create');module.exports=parent;},{"../../es/object/create":66}],252:[function(require,module,exports){var parent=require('../../es/object/define-property');module.exports=parent;},{"../../es/object/define-property":67}],253:[function(require,module,exports){var parent=require('../es/parse-int');module.exports=parent;},{"../es/parse-int":68}],254:[function(require,module,exports){var parent=require('../../es/symbol');require('../../modules/web.dom-collections.iterator');module.exports=parent;},{"../../es/symbol":71,"../../modules/web.dom-collections.iterator":236}],255:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _ldaTopicModel=_interopRequireDefault(require("./lda-topic-model"));var _default=_ldaTopicModel["default"];exports["default"]=_default;},{"./lda-topic-model":256,"@babel/runtime/helpers/interopRequireDefault":37}],256:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _xregexp=_interopRequireDefault(require("xregexp"));function _createForOfIteratorHelper(o){if(typeof Symbol==="undefined"||o[Symbol.iterator]==null){if(Array.isArray(o)||(o=_unsupportedIterableToArray(o))){var i=0;var F=function F(){};return {s:F,n:function n(){if(i>=o.length)return {done:true};return {done:false,value:o[i++]};},e:function e(_e){throw _e;},f:F};}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var it,normalCompletion=true,didErr=false,err;return {s:function s(){it=o[Symbol.iterator]();},n:function n(){var step=it.next();normalCompletion=step.done;return step;},e:function e(_e2){didErr=true;err=_e2;},f:function f(){try{if(!normalCompletion&&it["return"]!=null)it["return"]();}finally{if(didErr)throw err;}}};}function _unsupportedIterableToArray(o,minLen){if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(n);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen);}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i];}return arr2;}var topicModelling=/*#__PURE__*/function(){/**
	   * 
	   * @param {object} settings 
	   * @param {array} sentences 
	   * @param {array} dict 
	   */function topicModelling(settings,sentences,dict){var _this=this;(0, _classCallCheck2["default"])(this,topicModelling);this.settings=settings||{};if(dict){this.dict=dict;}if(!isNaN(this.settings.numberTopics)&&this.settings.numberTopics>0){this.numTopics=this.settings.numberTopics;}else {this.numTopics=10;}this.documentTopicSmoothing=0.1;this.topicWordSmoothing=0.01;this.docSortSmoothing=10.0;this.sumDocSortSmoothing=this.docSortSmoothing*this.numTopics;this.completeSweeps=0;this.reqiestedSweeps=0;// vocabulary
	this.vocabularySize=0;this.vocabularyCounts={};if(this.settings.displayingStopWords!==undefined){this.displayingStopwords=settings.displayingStopWords;}//documents
	this.documents=[];this.wordTopicCounts={};this.topicWordCounts=[];this.topicScores=this.zeros(this.numTopics);this.tokensPerTopic=this.zeros(this.numTopics);this.topicWeights=this.zeros(this.numTopics);this.stopwords={};if(this.dict!==undefined){this.dict.forEach(function(key){_this.stopwords[key]=true;});}this.prepareData(sentences);if(this.settings.sweeps!==undefined){this.requestedSweeps=this.settings.sweeps;}else {this.requestedSweeps=500;}while(this.completeSweeps<=this.requestedSweeps){this.sweep();}}(0, _createClass2["default"])(topicModelling,[{key:"prepareData",value:function prepareData(documents){var _this2=this;if(!documents||documents.length<0){return;}var wordPattern=(0, _xregexp["default"])('\\p{L}[\\p{L}\\p{P}]*\\p{L}','g');var _iterator=_createForOfIteratorHelper(documents),_step;try{var _loop=function _loop(){var item=_step.value;if(item.text==''){return "continue";}var sentence=Array.isArray(item.text)?item.text:item.text.toLowerCase().match(wordPattern);var docID=item.id;var tokens=[];var topicCounts=_this2.zeros(_this2.numTopics);if(sentence==null){return "continue";}sentence.forEach(function(word){if(word!==''){var topic=Math.floor(Math.random()*_this2.numTopics);if(word.length<=2){_this2.stopwords[word]=1;}var isStopword=_this2.stopwords[word];if(isStopword){// Record counts for stopwords, but nothing else
	if(!_this2.vocabularyCounts[word]){_this2.vocabularyCounts[word]=1;}else {_this2.vocabularyCounts[word]+=1;}}else {_this2.tokensPerTopic[topic]++;if(!_this2.wordTopicCounts[word]){_this2.wordTopicCounts[word]={};_this2.vocabularySize++;_this2.vocabularyCounts[word]=0;}if(!_this2.wordTopicCounts[word][topic]){_this2.wordTopicCounts[word][topic]=0;}_this2.wordTopicCounts[word][topic]+=1;_this2.vocabularyCounts[word]+=1;topicCounts[topic]+=1;}tokens.push({word:word,topic:topic,isStopword:isStopword});}});_this2.documents.push({originalOrder:documents.length,id:docID,originalText:item.text,tokens:tokens,topicCounts:topicCounts});};for(_iterator.s();!(_step=_iterator.n()).done;){var _ret=_loop();if(_ret==="continue")continue;}}catch(err){_iterator.e(err);}finally{_iterator.f();}}},{key:"sweep",value:function sweep(){var topicNormalizers=this.zeros(this.numTopics);for(var topic=0;topic<this.numTopics;topic++){topicNormalizers[topic]=1.0/(this.vocabularySize*this.topicWordSmoothing+this.tokensPerTopic[topic]);}for(var doc=0;doc<this.documents.length;doc++){var currentDoc=this.documents[doc];var docTopicCounts=currentDoc.topicCounts;for(var position=0;position<currentDoc.tokens.length;position++){var token=currentDoc.tokens[position];if(token.isStopword){continue;}this.tokensPerTopic[token.topic]--;var currentWordTopicCounts=this.wordTopicCounts[token.word];currentWordTopicCounts[token.topic]--;if(currentWordTopicCounts[token.topic]==0);docTopicCounts[token.topic]--;topicNormalizers[token.topic]=1.0/(this.vocabularySize*this.topicWordSmoothing+this.tokensPerTopic[token.topic]);var sum=0.0;for(var _topic=0;_topic<this.numTopics;_topic++){if(currentWordTopicCounts[_topic]){this.topicWeights[_topic]=(this.documentTopicSmoothing+docTopicCounts[_topic])*(this.topicWordSmoothing+currentWordTopicCounts[_topic])*topicNormalizers[_topic];}else {this.topicWeights[_topic]=(this.documentTopicSmoothing+docTopicCounts[_topic])*this.topicWordSmoothing*topicNormalizers[_topic];}sum+=this.topicWeights[_topic];}// Sample from an unnormalized discrete distribution
	var sample=sum*Math.random();var i=0;sample-=this.topicWeights[i];while(sample>0.0){i++;sample-=this.topicWeights[i];}token.topic=i;this.tokensPerTopic[token.topic]++;if(!currentWordTopicCounts[token.topic]){currentWordTopicCounts[token.topic]=1;}else {currentWordTopicCounts[token.topic]+=1;}docTopicCounts[token.topic]++;topicNormalizers[token.topic]=1.0/(this.vocabularySize*this.topicWordSmoothing+this.tokensPerTopic[token.topic]);}}//console.log("sweep in " + (Date.now() - startTime) + " ms");
	this.completeSweeps+=1;if(this.completeSweeps>=this.requestedSweeps){this.sortTopicWords();}}},{key:"byCountDescending",value:function byCountDescending(a,b){return b.count-a.count;}},{key:"topNWords",value:function topNWords(wordCounts,n){return wordCounts.slice(0,n).map(function(d){return d.word;}).join(' ');}},{key:"sortTopicWords",value:function sortTopicWords(){this.topicWordCounts=[];for(var topic=0;topic<this.numTopics;topic++){this.topicWordCounts[topic]=[];}for(var word in this.wordTopicCounts){for(var _topic2 in this.wordTopicCounts[word]){this.topicWordCounts[_topic2].push({word:word,count:this.wordTopicCounts[word][_topic2]});}}for(var _topic3=0;_topic3<this.numTopics;_topic3++){this.topicWordCounts[_topic3].sort(this.byCountDescending);}}},{key:"getTopicWords",value:function getTopicWords(numWords){var _this3=this;var topicTopWords=[];for(var topic=0;topic<this.numTopics;topic++){topicTopWords.push(this.topNWords(this.topicWordCounts[topic],numWords));}this.calcDominantTopic();var topicData=topicTopWords.map(function(words,index){return {id:index,topicText:words,score:_this3.topicScores[index]};});return topicData;}},{key:"calcDominantTopic",value:function calcDominantTopic(){var _this4=this;this.documents.map(function(doc,i){var topic=-1;var score=-1;for(var selectedTopic=0;selectedTopic<_this4.numTopics;selectedTopic++){var tempScore=(doc.topicCounts[selectedTopic]+_this4.docSortSmoothing)/(doc.tokens.length+_this4.sumDocSortSmoothing);if(tempScore>=score){score=tempScore;topic=selectedTopic;}}_this4.topicScores[topic]+=1;});this.topicScores=this.topicScores.map(function(val){return val/_this4.documents.length;});}},{key:"getDocuments",value:function getDocuments(){var _this5=this;var sentences=[];var _loop2=function _loop2(selectedTopic){var documentVocab=_this5.getVocab(selectedTopic,true);var scores=_this5.documents.map(function(doc,i){return {docID:i,score:(doc.topicCounts[selectedTopic]+_this5.docSortSmoothing)/(doc.tokens.length+_this5.sumDocSortSmoothing)};});scores.sort(function(a,b){return b.score-a.score;});var docinfo=[];var _iterator2=_createForOfIteratorHelper(scores),_step2;try{for(_iterator2.s();!(_step2=_iterator2.n()).done;){var val=_step2.value;if(_this5.documents[val.docID].topicCounts[selectedTopic]>0){docinfo.push({id:_this5.documents[val.docID].id,text:_this5.documents[val.docID].originalText,score:val.score});}}}catch(err){_iterator2.e(err);}finally{_iterator2.f();}sentences.push({topic:selectedTopic,documents:docinfo,documentVocab:documentVocab});};for(var selectedTopic=0;selectedTopic<this.numTopics;selectedTopic++){_loop2(selectedTopic);}return sentences;}//
	// Vocabulary
	//
	},{key:"mostFrequentWords",value:function mostFrequentWords(includeStops,sortByTopic,selectedTopic){// Convert the random-access map to a list of word:count pairs that
	//  we can then sort.
	var wordCounts=[];if(sortByTopic){for(var word in this.vocabularyCounts){if(this.wordTopicCounts[word]&&this.wordTopicCounts[word][selectedTopic]){wordCounts.push({word:word,count:this.wordTopicCounts[word][selectedTopic]});}}}else {for(var _word in this.vocabularyCounts){if(includeStops||!this.stopwords[_word]){wordCounts.push({word:_word,count:this.vocabularyCounts[_word]});}}}wordCounts.sort(this.byCountDescending);return wordCounts;}},{key:"entropy",value:function entropy(counts){counts=counts.filter(function(x){return x>0.0;});var sum=this.sum(counts);return Math.log(sum)-1.0/sum*this.sum(counts.map(function(x){return x*Math.log(x);}));}},{key:"specificity",value:function specificity(word){if(this.wordTopicCounts[word]==undefined){return 0;}return 1.0-this.entropy(Object.values(this.wordTopicCounts[word]))/Math.log(this.numTopics);}},{key:"getVocab",value:function getVocab(selectedTopic,sortVocabByTopic){var _this6=this;var vocab=[];var wordFrequencies=this.mostFrequentWords(this.displayingStopwords,sortVocabByTopic,selectedTopic).slice(0,499);wordFrequencies.forEach(function(d){var isStopword=_this6.stopwords[d.word];var score=_this6.specificity(d.word);vocab.push({word:d.word,count:d.count,stopword:isStopword,specificity:score});});return vocab;}},{key:"truncate",value:function truncate(s){return s.length>300?s.substring(0,299)+'...':s;}},{key:"zeros",value:function zeros(n){var x=new Array(n);for(var i=0;i<n;i++){x[i]=0.0;}return x;}},{key:"sum",value:function sum(arr){return arr.reduce(function(sum,currentValue){return sum+currentValue;});}}]);return topicModelling;}();var _default=topicModelling;exports["default"]=_default;},{"@babel/runtime/helpers/classCallCheck":33,"@babel/runtime/helpers/createClass":35,"@babel/runtime/helpers/interopRequireDefault":37,"xregexp":265}],257:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */var runtime=function(exports){var Op=Object.prototype;var hasOwn=Op.hasOwnProperty;var undefined$1;// More compressible than void 0.
	var $Symbol=typeof Symbol==="function"?Symbol:{};var iteratorSymbol=$Symbol.iterator||"@@iterator";var asyncIteratorSymbol=$Symbol.asyncIterator||"@@asyncIterator";var toStringTagSymbol=$Symbol.toStringTag||"@@toStringTag";function wrap(innerFn,outerFn,self,tryLocsList){// If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	var protoGenerator=outerFn&&outerFn.prototype instanceof Generator?outerFn:Generator;var generator=Object.create(protoGenerator.prototype);var context=new Context(tryLocsList||[]);// The ._invoke method unifies the implementations of the .next,
	// .throw, and .return methods.
	generator._invoke=makeInvokeMethod(innerFn,self,context);return generator;}exports.wrap=wrap;// Try/catch helper to minimize deoptimizations. Returns a completion
	// record like context.tryEntries[i].completion. This interface could
	// have been (and was previously) designed to take a closure to be
	// invoked without arguments, but in all the cases we care about we
	// already have an existing method we want to call, so there's no need
	// to create a new function object. We can even get away with assuming
	// the method takes exactly one argument, since that happens to be true
	// in every case, so we don't have to touch the arguments object. The
	// only additional allocation required is the completion record, which
	// has a stable shape and so hopefully should be cheap to allocate.
	function tryCatch(fn,obj,arg){try{return {type:"normal",arg:fn.call(obj,arg)};}catch(err){return {type:"throw",arg:err};}}var GenStateSuspendedStart="suspendedStart";var GenStateSuspendedYield="suspendedYield";var GenStateExecuting="executing";var GenStateCompleted="completed";// Returning this object from the innerFn has the same effect as
	// breaking out of the dispatch switch statement.
	var ContinueSentinel={};// Dummy constructor functions that we use as the .constructor and
	// .constructor.prototype properties for functions that return Generator
	// objects. For full spec compliance, you may wish to configure your
	// minifier not to mangle the names of these two functions.
	function Generator(){}function GeneratorFunction(){}function GeneratorFunctionPrototype(){}// This is a polyfill for %IteratorPrototype% for environments that
	// don't natively support it.
	var IteratorPrototype={};IteratorPrototype[iteratorSymbol]=function(){return this;};var getProto=Object.getPrototypeOf;var NativeIteratorPrototype=getProto&&getProto(getProto(values([])));if(NativeIteratorPrototype&&NativeIteratorPrototype!==Op&&hasOwn.call(NativeIteratorPrototype,iteratorSymbol)){// This environment has a native %IteratorPrototype%; use it instead
	// of the polyfill.
	IteratorPrototype=NativeIteratorPrototype;}var Gp=GeneratorFunctionPrototype.prototype=Generator.prototype=Object.create(IteratorPrototype);GeneratorFunction.prototype=Gp.constructor=GeneratorFunctionPrototype;GeneratorFunctionPrototype.constructor=GeneratorFunction;GeneratorFunctionPrototype[toStringTagSymbol]=GeneratorFunction.displayName="GeneratorFunction";// Helper for defining the .next, .throw, and .return methods of the
	// Iterator interface in terms of a single ._invoke method.
	function defineIteratorMethods(prototype){["next","throw","return"].forEach(function(method){prototype[method]=function(arg){return this._invoke(method,arg);};});}exports.isGeneratorFunction=function(genFun){var ctor=typeof genFun==="function"&&genFun.constructor;return ctor?ctor===GeneratorFunction||// For the native GeneratorFunction constructor, the best we can
	// do is to check its .name property.
	(ctor.displayName||ctor.name)==="GeneratorFunction":false;};exports.mark=function(genFun){if(Object.setPrototypeOf){Object.setPrototypeOf(genFun,GeneratorFunctionPrototype);}else {genFun.__proto__=GeneratorFunctionPrototype;if(!(toStringTagSymbol in genFun)){genFun[toStringTagSymbol]="GeneratorFunction";}}genFun.prototype=Object.create(Gp);return genFun;};// Within the body of any async function, `await x` is transformed to
	// `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	// `hasOwn.call(value, "__await")` to determine if the yielded value is
	// meant to be awaited.
	exports.awrap=function(arg){return {__await:arg};};function AsyncIterator(generator,PromiseImpl){function invoke(method,arg,resolve,reject){var record=tryCatch(generator[method],generator,arg);if(record.type==="throw"){reject(record.arg);}else {var result=record.arg;var value=result.value;if(value&&(0, _typeof2["default"])(value)==="object"&&hasOwn.call(value,"__await")){return PromiseImpl.resolve(value.__await).then(function(value){invoke("next",value,resolve,reject);},function(err){invoke("throw",err,resolve,reject);});}return PromiseImpl.resolve(value).then(function(unwrapped){// When a yielded Promise is resolved, its final value becomes
	// the .value of the Promise<{value,done}> result for the
	// current iteration.
	result.value=unwrapped;resolve(result);},function(error){// If a rejected Promise was yielded, throw the rejection back
	// into the async generator function so it can be handled there.
	return invoke("throw",error,resolve,reject);});}}var previousPromise;function enqueue(method,arg){function callInvokeWithMethodAndArg(){return new PromiseImpl(function(resolve,reject){invoke(method,arg,resolve,reject);});}return previousPromise=// If enqueue has been called before, then we want to wait until
	// all previous Promises have been resolved before calling invoke,
	// so that results are always delivered in the correct order. If
	// enqueue has not been called before, then it is important to
	// call invoke immediately, without waiting on a callback to fire,
	// so that the async generator function has the opportunity to do
	// any necessary setup in a predictable way. This predictability
	// is why the Promise constructor synchronously invokes its
	// executor callback, and why async functions synchronously
	// execute code before the first await. Since we implement simple
	// async functions in terms of async generators, it is especially
	// important to get this right, even though it requires care.
	previousPromise?previousPromise.then(callInvokeWithMethodAndArg,// Avoid propagating failures to Promises returned by later
	// invocations of the iterator.
	callInvokeWithMethodAndArg):callInvokeWithMethodAndArg();}// Define the unified helper method that is used to implement .next,
	// .throw, and .return (see defineIteratorMethods).
	this._invoke=enqueue;}defineIteratorMethods(AsyncIterator.prototype);AsyncIterator.prototype[asyncIteratorSymbol]=function(){return this;};exports.AsyncIterator=AsyncIterator;// Note that simple async functions are implemented on top of
	// AsyncIterator objects; they just return a Promise for the value of
	// the final result produced by the iterator.
	exports.async=function(innerFn,outerFn,self,tryLocsList,PromiseImpl){if(PromiseImpl===void 0)PromiseImpl=Promise;var iter=new AsyncIterator(wrap(innerFn,outerFn,self,tryLocsList),PromiseImpl);return exports.isGeneratorFunction(outerFn)?iter// If outerFn is a generator, return the full iterator.
	:iter.next().then(function(result){return result.done?result.value:iter.next();});};function makeInvokeMethod(innerFn,self,context){var state=GenStateSuspendedStart;return function invoke(method,arg){if(state===GenStateExecuting){throw new Error("Generator is already running");}if(state===GenStateCompleted){if(method==="throw"){throw arg;}// Be forgiving, per 25.3.3.3.3 of the spec:
	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	return doneResult();}context.method=method;context.arg=arg;while(true){var delegate=context.delegate;if(delegate){var delegateResult=maybeInvokeDelegate(delegate,context);if(delegateResult){if(delegateResult===ContinueSentinel)continue;return delegateResult;}}if(context.method==="next"){// Setting context._sent for legacy support of Babel's
	// function.sent implementation.
	context.sent=context._sent=context.arg;}else if(context.method==="throw"){if(state===GenStateSuspendedStart){state=GenStateCompleted;throw context.arg;}context.dispatchException(context.arg);}else if(context.method==="return"){context.abrupt("return",context.arg);}state=GenStateExecuting;var record=tryCatch(innerFn,self,context);if(record.type==="normal"){// If an exception is thrown from innerFn, we leave state ===
	// GenStateExecuting and loop back for another invocation.
	state=context.done?GenStateCompleted:GenStateSuspendedYield;if(record.arg===ContinueSentinel){continue;}return {value:record.arg,done:context.done};}else if(record.type==="throw"){state=GenStateCompleted;// Dispatch the exception by looping back around to the
	// context.dispatchException(context.arg) call above.
	context.method="throw";context.arg=record.arg;}}};}// Call delegate.iterator[context.method](context.arg) and handle the
	// result, either by returning a { value, done } result from the
	// delegate iterator, or by modifying context.method and context.arg,
	// setting context.delegate to null, and returning the ContinueSentinel.
	function maybeInvokeDelegate(delegate,context){var method=delegate.iterator[context.method];if(method===undefined$1){// A .throw or .return when the delegate iterator has no .throw
	// method always terminates the yield* loop.
	context.delegate=null;if(context.method==="throw"){// Note: ["return"] must be used for ES3 parsing compatibility.
	if(delegate.iterator["return"]){// If the delegate iterator has a return method, give it a
	// chance to clean up.
	context.method="return";context.arg=undefined$1;maybeInvokeDelegate(delegate,context);if(context.method==="throw"){// If maybeInvokeDelegate(context) changed context.method from
	// "return" to "throw", let that override the TypeError below.
	return ContinueSentinel;}}context.method="throw";context.arg=new TypeError("The iterator does not provide a 'throw' method");}return ContinueSentinel;}var record=tryCatch(method,delegate.iterator,context.arg);if(record.type==="throw"){context.method="throw";context.arg=record.arg;context.delegate=null;return ContinueSentinel;}var info=record.arg;if(!info){context.method="throw";context.arg=new TypeError("iterator result is not an object");context.delegate=null;return ContinueSentinel;}if(info.done){// Assign the result of the finished delegate to the temporary
	// variable specified by delegate.resultName (see delegateYield).
	context[delegate.resultName]=info.value;// Resume execution at the desired location (see delegateYield).
	context.next=delegate.nextLoc;// If context.method was "throw" but the delegate handled the
	// exception, let the outer generator proceed normally. If
	// context.method was "next", forget context.arg since it has been
	// "consumed" by the delegate iterator. If context.method was
	// "return", allow the original .return call to continue in the
	// outer generator.
	if(context.method!=="return"){context.method="next";context.arg=undefined$1;}}else {// Re-yield the result returned by the delegate method.
	return info;}// The delegate iterator is finished, so forget it and continue with
	// the outer generator.
	context.delegate=null;return ContinueSentinel;}// Define Generator.prototype.{next,throw,return} in terms of the
	// unified ._invoke helper method.
	defineIteratorMethods(Gp);Gp[toStringTagSymbol]="Generator";// A Generator should always return itself as the iterator object when the
	// @@iterator function is called on it. Some browsers' implementations of the
	// iterator prototype chain incorrectly implement this, causing the Generator
	// object to not be returned from this call. This ensures that doesn't happen.
	// See https://github.com/facebook/regenerator/issues/274 for more details.
	Gp[iteratorSymbol]=function(){return this;};Gp.toString=function(){return "[object Generator]";};function pushTryEntry(locs){var entry={tryLoc:locs[0]};if(1 in locs){entry.catchLoc=locs[1];}if(2 in locs){entry.finallyLoc=locs[2];entry.afterLoc=locs[3];}this.tryEntries.push(entry);}function resetTryEntry(entry){var record=entry.completion||{};record.type="normal";delete record.arg;entry.completion=record;}function Context(tryLocsList){// The root entry object (effectively a try statement without a catch
	// or a finally block) gives us a place to store values thrown from
	// locations where there is no enclosing try statement.
	this.tryEntries=[{tryLoc:"root"}];tryLocsList.forEach(pushTryEntry,this);this.reset(true);}exports.keys=function(object){var keys=[];for(var key in object){keys.push(key);}keys.reverse();// Rather than returning an object with a next method, we keep
	// things simple and return the next function itself.
	return function next(){while(keys.length){var key=keys.pop();if(key in object){next.value=key;next.done=false;return next;}}// To avoid creating an additional object, we just hang the .value
	// and .done properties off the next function object itself. This
	// also ensures that the minifier will not anonymize the function.
	next.done=true;return next;};};function values(iterable){if(iterable){var iteratorMethod=iterable[iteratorSymbol];if(iteratorMethod){return iteratorMethod.call(iterable);}if(typeof iterable.next==="function"){return iterable;}if(!isNaN(iterable.length)){var i=-1,next=function next(){while(++i<iterable.length){if(hasOwn.call(iterable,i)){next.value=iterable[i];next.done=false;return next;}}next.value=undefined$1;next.done=true;return next;};return next.next=next;}}// Return an iterator with no values.
	return {next:doneResult};}exports.values=values;function doneResult(){return {value:undefined$1,done:true};}Context.prototype={constructor:Context,reset:function reset(skipTempReset){this.prev=0;this.next=0;// Resetting context._sent for legacy support of Babel's
	// function.sent implementation.
	this.sent=this._sent=undefined$1;this.done=false;this.delegate=null;this.method="next";this.arg=undefined$1;this.tryEntries.forEach(resetTryEntry);if(!skipTempReset){for(var name in this){// Not sure about the optimal order of these conditions:
	if(name.charAt(0)==="t"&&hasOwn.call(this,name)&&!isNaN(+name.slice(1))){this[name]=undefined$1;}}}},stop:function stop(){this.done=true;var rootEntry=this.tryEntries[0];var rootRecord=rootEntry.completion;if(rootRecord.type==="throw"){throw rootRecord.arg;}return this.rval;},dispatchException:function dispatchException(exception){if(this.done){throw exception;}var context=this;function handle(loc,caught){record.type="throw";record.arg=exception;context.next=loc;if(caught){// If the dispatched exception was caught by a catch block,
	// then let that catch block handle the exception normally.
	context.method="next";context.arg=undefined$1;}return !!caught;}for(var i=this.tryEntries.length-1;i>=0;--i){var entry=this.tryEntries[i];var record=entry.completion;if(entry.tryLoc==="root"){// Exception thrown outside of any try block that could handle
	// it, so set the completion value of the entire function to
	// throw the exception.
	return handle("end");}if(entry.tryLoc<=this.prev){var hasCatch=hasOwn.call(entry,"catchLoc");var hasFinally=hasOwn.call(entry,"finallyLoc");if(hasCatch&&hasFinally){if(this.prev<entry.catchLoc){return handle(entry.catchLoc,true);}else if(this.prev<entry.finallyLoc){return handle(entry.finallyLoc);}}else if(hasCatch){if(this.prev<entry.catchLoc){return handle(entry.catchLoc,true);}}else if(hasFinally){if(this.prev<entry.finallyLoc){return handle(entry.finallyLoc);}}else {throw new Error("try statement without catch or finally");}}}},abrupt:function abrupt(type,arg){for(var i=this.tryEntries.length-1;i>=0;--i){var entry=this.tryEntries[i];if(entry.tryLoc<=this.prev&&hasOwn.call(entry,"finallyLoc")&&this.prev<entry.finallyLoc){var finallyEntry=entry;break;}}if(finallyEntry&&(type==="break"||type==="continue")&&finallyEntry.tryLoc<=arg&&arg<=finallyEntry.finallyLoc){// Ignore the finally entry if control is not jumping to a
	// location outside the try/catch block.
	finallyEntry=null;}var record=finallyEntry?finallyEntry.completion:{};record.type=type;record.arg=arg;if(finallyEntry){this.method="next";this.next=finallyEntry.finallyLoc;return ContinueSentinel;}return this.complete(record);},complete:function complete(record,afterLoc){if(record.type==="throw"){throw record.arg;}if(record.type==="break"||record.type==="continue"){this.next=record.arg;}else if(record.type==="return"){this.rval=this.arg=record.arg;this.method="return";this.next="end";}else if(record.type==="normal"&&afterLoc){this.next=afterLoc;}return ContinueSentinel;},finish:function finish(finallyLoc){for(var i=this.tryEntries.length-1;i>=0;--i){var entry=this.tryEntries[i];if(entry.finallyLoc===finallyLoc){this.complete(entry.completion,entry.afterLoc);resetTryEntry(entry);return ContinueSentinel;}}},"catch":function _catch(tryLoc){for(var i=this.tryEntries.length-1;i>=0;--i){var entry=this.tryEntries[i];if(entry.tryLoc===tryLoc){var record=entry.completion;if(record.type==="throw"){var thrown=record.arg;resetTryEntry(entry);}return thrown;}}// The context.catch method must only be called with a location
	// argument that corresponds to a known catch block.
	throw new Error("illegal catch attempt");},delegateYield:function delegateYield(iterable,resultName,nextLoc){this.delegate={iterator:values(iterable),resultName:resultName,nextLoc:nextLoc};if(this.method==="next"){// Deliberately forget the last sent value so that we don't
	// accidentally pass it on to the delegate.
	this.arg=undefined$1;}return ContinueSentinel;}};// Regardless of whether this script is executing as a CommonJS module
	// or not, return the runtime object so that we can declare the variable
	// regeneratorRuntime in the outer scope, which allows this module to be
	// injected easily by `bin/regenerator --include-runtime script.js`.
	return exports;}(// If this script is executing as a CommonJS module, use module.exports
	// as the regeneratorRuntime namespace. Otherwise create a new empty
	// object. Either way, the resulting object will be used to initialize
	// the regeneratorRuntime variable at the top of this file.
	(typeof module==="undefined"?"undefined":(0, _typeof2["default"])(module))==="object"?module.exports:{});try{regeneratorRuntime=runtime;}catch(accidentalStrictMode){// This module should not be running in strict mode, so the above
	// assignment should always work unless something is misconfigured. Just
	// in case runtime.js accidentally runs in strict mode, we can escape
	// strict mode using a global Function call. This could conceivably fail
	// if a Content Security Policy forbids using Function, but in that case
	// the proper solution is to fix the accidental strict mode problem. If
	// you've misconfigured your bundler to force strict mode and applied a
	// CSP to forbid Function, and you're not willing to fix either of those
	// problems, please detail your unique predicament in a GitHub issue.
	Function("r","regeneratorRuntime = r")(runtime);}},{"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/typeof":43}],258:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault");var _Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _concat=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));var _includes=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));var _map=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));var _reduce=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/reduce"));/*!
	 * XRegExp.build 4.4.1
	 * <xregexp.com>
	 * Steven Levithan (c) 2012-present MIT License
	 */var _default=function _default(XRegExp){var REGEX_DATA='xregexp';var subParts=/(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*\]/g;var parts=XRegExp.union([/\({{([\w$]+)}}\)|{{([\w$]+)}}/,subParts],'g',{conjunction:'or'});/**
	   * Strips a leading `^` and trailing unescaped `$`, if both are present.
	   *
	   * @private
	   * @param {String} pattern Pattern to process.
	   * @returns {String} Pattern with edge anchors removed.
	   */function deanchor(pattern){// Allow any number of empty noncapturing groups before/after anchors, because regexes
	// built/generated by XRegExp sometimes include them
	var leadingAnchor=/^(?:\(\?:\))*\^/;var trailingAnchor=/\$(?:\(\?:\))*$/;if(leadingAnchor.test(pattern)&&trailingAnchor.test(pattern)&&// Ensure that the trailing `$` isn't escaped
	trailingAnchor.test(pattern.replace(/\\[\s\S]/g,''))){return pattern.replace(leadingAnchor,'').replace(trailingAnchor,'');}return pattern;}/**
	   * Converts the provided value to an XRegExp. Native RegExp flags are not preserved.
	   *
	   * @private
	   * @param {String|RegExp} value Value to convert.
	   * @param {Boolean} [addFlagX] Whether to apply the `x` flag in cases when `value` is not
	   *   already a regex generated by XRegExp
	   * @returns {RegExp} XRegExp object with XRegExp syntax applied.
	   */function asXRegExp(value,addFlagX){var flags=addFlagX?'x':'';return XRegExp.isRegExp(value)?value[REGEX_DATA]&&value[REGEX_DATA].captureNames?// Don't recompile, to preserve capture names
	value:// Recompile as XRegExp
	XRegExp(value.source,flags):// Compile string as XRegExp
	XRegExp(value,flags);}function interpolate(substitution){return substitution instanceof RegExp?substitution:XRegExp.escape(substitution);}function reduceToSubpatternsObject(subpatterns,interpolated,subpatternIndex){subpatterns["subpattern".concat(subpatternIndex)]=interpolated;return subpatterns;}function embedSubpatternAfter(raw,subpatternIndex,rawLiterals){var hasSubpattern=subpatternIndex<rawLiterals.length-1;return raw+(hasSubpattern?"{{subpattern".concat(subpatternIndex,"}}"):'');}/**
	   * Provides tagged template literals that create regexes with XRegExp syntax and flags. The
	   * provided pattern is handled as a raw string, so backslashes don't need to be escaped.
	   *
	   * Interpolation of strings and regexes shares the features of `XRegExp.build`. Interpolated
	   * patterns are treated as atomic units when quantified, interpolated strings have their special
	   * characters escaped, a leading `^` and trailing unescaped `$` are stripped from interpolated
	   * regexes if both are present, and any backreferences within an interpolated regex are
	   * rewritten to work within the overall pattern.
	   *
	   * @memberOf XRegExp
	   * @param {String} [flags] Any combination of XRegExp flags.
	   * @returns {Function} Handler for template literals that construct regexes with XRegExp syntax.
	   * @example
	   *
	   * const h12 = /1[0-2]|0?[1-9]/;
	   * const h24 = /2[0-3]|[01][0-9]/;
	   * const hours = XRegExp.tag('x')`${h12} : | ${h24}`;
	   * const minutes = /^[0-5][0-9]$/;
	   * // Note that explicitly naming the 'minutes' group is required for named backreferences
	   * const time = XRegExp.tag('x')`^ ${hours} (?<minutes>${minutes}) $`;
	   * time.test('10:59'); // -> true
	   * XRegExp.exec('10:59', time).minutes; // -> '59'
	   */XRegExp.tag=function(flags){return function(literals){var _context,_context2;for(var _len=arguments.length,substitutions=new Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){substitutions[_key-1]=arguments[_key];}var subpatterns=(0, _reduce["default"])(_context=(0, _map["default"])(substitutions).call(substitutions,interpolate)).call(_context,reduceToSubpatternsObject,{});var pattern=(0, _map["default"])(_context2=literals.raw).call(_context2,embedSubpatternAfter).join('');return XRegExp.build(pattern,subpatterns,flags);};};/**
	   * Builds regexes using named subpatterns, for readability and pattern reuse. Backreferences in
	   * the outer pattern and provided subpatterns are automatically renumbered to work correctly.
	   * Native flags used by provided subpatterns are ignored in favor of the `flags` argument.
	   *
	   * @memberOf XRegExp
	   * @param {String} pattern XRegExp pattern using `{{name}}` for embedded subpatterns. Allows
	   *   `({{name}})` as shorthand for `(?<name>{{name}})`. Patterns cannot be embedded within
	   *   character classes.
	   * @param {Object} subs Lookup object for named subpatterns. Values can be strings or regexes. A
	   *   leading `^` and trailing unescaped `$` are stripped from subpatterns, if both are present.
	   * @param {String} [flags] Any combination of XRegExp flags.
	   * @returns {RegExp} Regex with interpolated subpatterns.
	   * @example
	   *
	   * const time = XRegExp.build('(?x)^ {{hours}} ({{minutes}}) $', {
	   *   hours: XRegExp.build('{{h12}} : | {{h24}}', {
	   *     h12: /1[0-2]|0?[1-9]/,
	   *     h24: /2[0-3]|[01][0-9]/
	   *   }, 'x'),
	   *   minutes: /^[0-5][0-9]$/
	   * });
	   * time.test('10:59'); // -> true
	   * XRegExp.exec('10:59', time).minutes; // -> '59'
	   */XRegExp.build=function(pattern,subs,flags){flags=flags||'';// Used with `asXRegExp` calls for `pattern` and subpatterns in `subs`, to work around how
	// some browsers convert `RegExp('\n')` to a regex that contains the literal characters `\`
	// and `n`. See more details at <https://github.com/slevithan/xregexp/pull/163>.
	var addFlagX=(0, _includes["default"])(flags).call(flags,'x');var inlineFlags=/^\(\?([\w$]+)\)/.exec(pattern);// Add flags within a leading mode modifier to the overall pattern's flags
	if(inlineFlags){flags=XRegExp._clipDuplicates(flags+inlineFlags[1]);}var data={};for(var p in subs){if(subs.hasOwnProperty(p)){// Passing to XRegExp enables extended syntax and ensures independent validity,
	// lest an unescaped `(`, `)`, `[`, or trailing `\` breaks the `(?:)` wrapper. For
	// subpatterns provided as native regexes, it dies on octals and adds the property
	// used to hold extended regex instance data, for simplicity.
	var sub=asXRegExp(subs[p],addFlagX);data[p]={// Deanchoring allows embedding independently useful anchored regexes. If you
	// really need to keep your anchors, double them (i.e., `^^...$$`).
	pattern:deanchor(sub.source),names:sub[REGEX_DATA].captureNames||[]};}}// Passing to XRegExp dies on octals and ensures the outer pattern is independently valid;
	// helps keep this simple. Named captures will be put back.
	var patternAsRegex=asXRegExp(pattern,addFlagX);// 'Caps' is short for 'captures'
	var numCaps=0;var numPriorCaps;var numOuterCaps=0;var outerCapsMap=[0];var outerCapNames=patternAsRegex[REGEX_DATA].captureNames||[];var output=patternAsRegex.source.replace(parts,function($0,$1,$2,$3,$4){var subName=$1||$2;var capName;var intro;var localCapIndex;// Named subpattern
	if(subName){var _context3;if(!data.hasOwnProperty(subName)){throw new ReferenceError("Undefined property ".concat($0));}// Named subpattern was wrapped in a capturing group
	if($1){capName=outerCapNames[numOuterCaps];outerCapsMap[++numOuterCaps]=++numCaps;// If it's a named group, preserve the name. Otherwise, use the subpattern name
	// as the capture name
	intro="(?<".concat(capName||subName,">");}else {intro='(?:';}numPriorCaps=numCaps;var rewrittenSubpattern=data[subName].pattern.replace(subParts,function(match,paren,backref){// Capturing group
	if(paren){capName=data[subName].names[numCaps-numPriorCaps];++numCaps;// If the current capture has a name, preserve the name
	if(capName){return "(?<".concat(capName,">");}// Backreference
	}else if(backref){localCapIndex=+backref-1;// Rewrite the backreference
	return data[subName].names[localCapIndex]?// Need to preserve the backreference name in case using flag `n`
	"\\k<".concat(data[subName].names[localCapIndex],">"):"\\".concat(+backref+numPriorCaps);}return match;});return (0, _concat["default"])(_context3="".concat(intro)).call(_context3,rewrittenSubpattern,")");}// Capturing group
	if($3){capName=outerCapNames[numOuterCaps];outerCapsMap[++numOuterCaps]=++numCaps;// If the current capture has a name, preserve the name
	if(capName){return "(?<".concat(capName,">");}// Backreference
	}else if($4){localCapIndex=+$4-1;// Rewrite the backreference
	return outerCapNames[localCapIndex]?// Need to preserve the backreference name in case using flag `n`
	"\\k<".concat(outerCapNames[localCapIndex],">"):"\\".concat(outerCapsMap[+$4]);}return $0;});return XRegExp(output,flags);};};exports["default"]=_default;module.exports=exports["default"];},{"@babel/runtime-corejs3/core-js-stable/instance/concat":4,"@babel/runtime-corejs3/core-js-stable/instance/includes":7,"@babel/runtime-corejs3/core-js-stable/instance/map":9,"@babel/runtime-corejs3/core-js-stable/instance/reduce":10,"@babel/runtime-corejs3/core-js-stable/object/define-property":14,"@babel/runtime-corejs3/helpers/interopRequireDefault":25}],259:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault");var _Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _slice=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));var _concat=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));var _includes=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));/*!
	 * XRegExp.matchRecursive 4.4.1
	 * <xregexp.com>
	 * Steven Levithan (c) 2009-present MIT License
	 */var _default=function _default(XRegExp){/**
	   * Returns a match detail object composed of the provided values.
	   *
	   * @private
	   */function row(name,value,start,end){return {name:name,value:value,start:start,end:end};}/**
	   * Returns an array of match strings between outermost left and right delimiters, or an array of
	   * objects with detailed match parts and position data. An error is thrown if delimiters are
	   * unbalanced within the data.
	   *
	   * @memberOf XRegExp
	   * @param {String} str String to search.
	   * @param {String} left Left delimiter as an XRegExp pattern.
	   * @param {String} right Right delimiter as an XRegExp pattern.
	   * @param {String} [flags] Any native or XRegExp flags, used for the left and right delimiters.
	   * @param {Object} [options] Lets you specify `valueNames` and `escapeChar` options.
	   * @returns {!Array} Array of matches, or an empty array.
	   * @example
	   *
	   * // Basic usage
	   * let str = '(t((e))s)t()(ing)';
	   * XRegExp.matchRecursive(str, '\\(', '\\)', 'g');
	   * // -> ['t((e))s', '', 'ing']
	   *
	   * // Extended information mode with valueNames
	   * str = 'Here is <div> <div>an</div></div> example';
	   * XRegExp.matchRecursive(str, '<div\\s*>', '</div>', 'gi', {
	   *   valueNames: ['between', 'left', 'match', 'right']
	   * });
	   * // -> [
	   * // {name: 'between', value: 'Here is ',       start: 0,  end: 8},
	   * // {name: 'left',    value: '<div>',          start: 8,  end: 13},
	   * // {name: 'match',   value: ' <div>an</div>', start: 13, end: 27},
	   * // {name: 'right',   value: '</div>',         start: 27, end: 33},
	   * // {name: 'between', value: ' example',       start: 33, end: 41}
	   * // ]
	   *
	   * // Omitting unneeded parts with null valueNames, and using escapeChar
	   * str = '...{1}.\\{{function(x,y){return {y:x}}}';
	   * XRegExp.matchRecursive(str, '{', '}', 'g', {
	   *   valueNames: ['literal', null, 'value', null],
	   *   escapeChar: '\\'
	   * });
	   * // -> [
	   * // {name: 'literal', value: '...',  start: 0, end: 3},
	   * // {name: 'value',   value: '1',    start: 4, end: 5},
	   * // {name: 'literal', value: '.\\{', start: 6, end: 9},
	   * // {name: 'value',   value: 'function(x,y){return {y:x}}', start: 10, end: 37}
	   * // ]
	   *
	   * // Sticky mode via flag y
	   * str = '<1><<<2>>><3>4<5>';
	   * XRegExp.matchRecursive(str, '<', '>', 'gy');
	   * // -> ['1', '<<2>>', '3']
	   */XRegExp.matchRecursive=function(str,left,right,flags,options){flags=flags||'';options=options||{};var global=(0, _includes["default"])(flags).call(flags,'g');var sticky=(0, _includes["default"])(flags).call(flags,'y');// Flag `y` is controlled internally
	var basicFlags=flags.replace(/y/g,'');var _options=options,escapeChar=_options.escapeChar;var vN=options.valueNames;var output=[];var openTokens=0;var delimStart=0;var delimEnd=0;var lastOuterEnd=0;var outerStart;var innerStart;var leftMatch;var rightMatch;var esc;left=XRegExp(left,basicFlags);right=XRegExp(right,basicFlags);if(escapeChar){var _context,_context2;if(escapeChar.length>1){throw new Error('Cannot use more than one escape character');}escapeChar=XRegExp.escape(escapeChar);// Example of concatenated `esc` regex:
	// `escapeChar`: '%'
	// `left`: '<'
	// `right`: '>'
	// Regex is: /(?:%[\S\s]|(?:(?!<|>)[^%])+)+/
	esc=new RegExp((0, _concat["default"])(_context=(0, _concat["default"])(_context2="(?:".concat(escapeChar,"[\\S\\s]|(?:(?!")).call(_context2,// Using `XRegExp.union` safely rewrites backreferences in `left` and `right`.
	// Intentionally not passing `basicFlags` to `XRegExp.union` since any syntax
	// transformation resulting from those flags was already applied to `left` and
	// `right` when they were passed through the XRegExp constructor above.
	XRegExp.union([left,right],'',{conjunction:'or'}).source,")[^")).call(_context,escapeChar,"])+)+"),// Flags `gy` not needed here
	flags.replace(/[^imu]+/g,''));}while(true){// If using an escape character, advance to the delimiter's next starting position,
	// skipping any escaped characters in between
	if(escapeChar){delimEnd+=(XRegExp.exec(str,esc,delimEnd,'sticky')||[''])[0].length;}leftMatch=XRegExp.exec(str,left,delimEnd);rightMatch=XRegExp.exec(str,right,delimEnd);// Keep the leftmost match only
	if(leftMatch&&rightMatch){if(leftMatch.index<=rightMatch.index){rightMatch=null;}else {leftMatch=null;}}// Paths (LM: leftMatch, RM: rightMatch, OT: openTokens):
	// LM | RM | OT | Result
	// 1  | 0  | 1  | loop
	// 1  | 0  | 0  | loop
	// 0  | 1  | 1  | loop
	// 0  | 1  | 0  | throw
	// 0  | 0  | 1  | throw
	// 0  | 0  | 0  | break
	// The paths above don't include the sticky mode special case. The loop ends after the
	// first completed match if not `global`.
	if(leftMatch||rightMatch){delimStart=(leftMatch||rightMatch).index;delimEnd=delimStart+(leftMatch||rightMatch)[0].length;}else if(!openTokens){break;}if(sticky&&!openTokens&&delimStart>lastOuterEnd){break;}if(leftMatch){if(!openTokens){outerStart=delimStart;innerStart=delimEnd;}++openTokens;}else if(rightMatch&&openTokens){if(! --openTokens){if(vN){if(vN[0]&&outerStart>lastOuterEnd){output.push(row(vN[0],(0, _slice["default"])(str).call(str,lastOuterEnd,outerStart),lastOuterEnd,outerStart));}if(vN[1]){output.push(row(vN[1],(0, _slice["default"])(str).call(str,outerStart,innerStart),outerStart,innerStart));}if(vN[2]){output.push(row(vN[2],(0, _slice["default"])(str).call(str,innerStart,delimStart),innerStart,delimStart));}if(vN[3]){output.push(row(vN[3],(0, _slice["default"])(str).call(str,delimStart,delimEnd),delimStart,delimEnd));}}else {output.push((0, _slice["default"])(str).call(str,innerStart,delimStart));}lastOuterEnd=delimEnd;if(!global){break;}}}else {throw new Error('Unbalanced delimiter found in string');}// If the delimiter matched an empty string, avoid an infinite loop
	if(delimStart===delimEnd){++delimEnd;}}if(global&&!sticky&&vN&&vN[0]&&str.length>lastOuterEnd){output.push(row(vN[0],(0, _slice["default"])(str).call(str,lastOuterEnd),lastOuterEnd,str.length));}return output;};};exports["default"]=_default;module.exports=exports["default"];},{"@babel/runtime-corejs3/core-js-stable/instance/concat":4,"@babel/runtime-corejs3/core-js-stable/instance/includes":7,"@babel/runtime-corejs3/core-js-stable/instance/slice":11,"@babel/runtime-corejs3/core-js-stable/object/define-property":14,"@babel/runtime-corejs3/helpers/interopRequireDefault":25}],260:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault");var _Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _getIterator2=_interopRequireDefault(require("@babel/runtime-corejs3/core-js/get-iterator"));var _isArray=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));var _getIteratorMethod2=_interopRequireDefault(require("@babel/runtime-corejs3/core-js/get-iterator-method"));var _symbol=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/symbol"));var _from=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/from"));var _slice=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));var _includes=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));var _concat=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));var _forEach=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each"));function _createForOfIteratorHelper(o,allowArrayLike){var it;if(typeof _symbol["default"]==="undefined"||(0, _getIteratorMethod2["default"])(o)==null){if((0, _isArray["default"])(o)||(it=_unsupportedIterableToArray(o))||allowArrayLike&&o&&typeof o.length==="number"){if(it)o=it;var i=0;var F=function F(){};return {s:F,n:function n(){if(i>=o.length)return {done:true};return {done:false,value:o[i++]};},e:function e(_e){throw _e;},f:F};}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion=true,didErr=false,err;return {s:function s(){it=(0, _getIterator2["default"])(o);},n:function n(){var step=it.next();normalCompletion=step.done;return step;},e:function e(_e2){didErr=true;err=_e2;},f:function f(){try{if(!normalCompletion&&it["return"]!=null)it["return"]();}finally{if(didErr)throw err;}}};}function _unsupportedIterableToArray(o,minLen){var _context4;if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=(0, _slice["default"])(_context4=Object.prototype.toString.call(o)).call(_context4,8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return (0, _from["default"])(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen);}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i];}return arr2;}/*!
	 * XRegExp Unicode Base 4.4.1
	 * <xregexp.com>
	 * Steven Levithan (c) 2008-present MIT License
	 */var _default=function _default(XRegExp){/**
	   * Adds base support for Unicode matching:
	   * - Adds syntax `\p{..}` for matching Unicode tokens. Tokens can be inverted using `\P{..}` or
	   *   `\p{^..}`. Token names ignore case, spaces, hyphens, and underscores. You can omit the
	   *   braces for token names that are a single letter (e.g. `\pL` or `PL`).
	   * - Adds flag A (astral), which enables 21-bit Unicode support.
	   * - Adds the `XRegExp.addUnicodeData` method used by other addons to provide character data.
	   *
	   * Unicode Base relies on externally provided Unicode character data. Official addons are
	   * available to provide data for Unicode categories, scripts, blocks, and properties.
	   *
	   * @requires XRegExp
	   */ // ==--------------------------==
	// Private stuff
	// ==--------------------------==
	// Storage for Unicode data
	var unicode={};// Reuse utils
	var dec=XRegExp._dec;var hex=XRegExp._hex;var pad4=XRegExp._pad4;// Generates a token lookup name: lowercase, with hyphens, spaces, and underscores removed
	function normalize(name){return name.replace(/[- _]+/g,'').toLowerCase();}// Gets the decimal code of a literal code unit, \xHH, \uHHHH, or a backslash-escaped literal
	function charCode(chr){var esc=/^\\[xu](.+)/.exec(chr);return esc?dec(esc[1]):chr.charCodeAt(chr[0]==='\\'?1:0);}// Inverts a list of ordered BMP characters and ranges
	function invertBmp(range){var output='';var lastEnd=-1;(0, _forEach["default"])(XRegExp).call(XRegExp,range,/(\\x..|\\u....|\\?[\s\S])(?:-(\\x..|\\u....|\\?[\s\S]))?/,function(m){var start=charCode(m[1]);if(start>lastEnd+1){output+="\\u".concat(pad4(hex(lastEnd+1)));if(start>lastEnd+2){output+="-\\u".concat(pad4(hex(start-1)));}}lastEnd=charCode(m[2]||m[1]);});if(lastEnd<0xFFFF){output+="\\u".concat(pad4(hex(lastEnd+1)));if(lastEnd<0xFFFE){output+="-\\uFFFF";}}return output;}// Generates an inverted BMP range on first use
	function cacheInvertedBmp(slug){var prop='b!';return unicode[slug][prop]||(unicode[slug][prop]=invertBmp(unicode[slug].bmp));}// Combines and optionally negates BMP and astral data
	function buildAstral(slug,isNegated){var item=unicode[slug];var combined='';if(item.bmp&&!item.isBmpLast){var _context;combined=(0, _concat["default"])(_context="[".concat(item.bmp,"]")).call(_context,item.astral?'|':'');}if(item.astral){combined+=item.astral;}if(item.isBmpLast&&item.bmp){var _context2;combined+=(0, _concat["default"])(_context2="".concat(item.astral?'|':'',"[")).call(_context2,item.bmp,"]");}// Astral Unicode tokens always match a code point, never a code unit
	return isNegated?"(?:(?!".concat(combined,")(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\0-\uFFFF]))"):"(?:".concat(combined,")");}// Builds a complete astral pattern on first use
	function cacheAstral(slug,isNegated){var prop=isNegated?'a!':'a=';return unicode[slug][prop]||(unicode[slug][prop]=buildAstral(slug,isNegated));}// ==--------------------------==
	// Core functionality
	// ==--------------------------==
	/*
	   * Add astral mode (flag A) and Unicode token syntax: `\p{..}`, `\P{..}`, `\p{^..}`, `\pC`.
	   */XRegExp.addToken(// Use `*` instead of `+` to avoid capturing `^` as the token name in `\p{^}`
	/\\([pP])(?:{(\^?)([^}]*)}|([A-Za-z]))/,function(match,scope,flags){var ERR_DOUBLE_NEG='Invalid double negation ';var ERR_UNKNOWN_NAME='Unknown Unicode token ';var ERR_UNKNOWN_REF='Unicode token missing data ';var ERR_ASTRAL_ONLY='Astral mode required for Unicode token ';var ERR_ASTRAL_IN_CLASS='Astral mode does not support Unicode tokens within character classes';// Negated via \P{..} or \p{^..}
	var isNegated=match[1]==='P'||!!match[2];// Switch from BMP (0-FFFF) to astral (0-10FFFF) mode via flag A
	var isAstralMode=(0, _includes["default"])(flags).call(flags,'A');// Token lookup name. Check `[4]` first to avoid passing `undefined` via `\p{}`
	var slug=normalize(match[4]||match[3]);// Token data object
	var item=unicode[slug];if(match[1]==='P'&&match[2]){throw new SyntaxError(ERR_DOUBLE_NEG+match[0]);}if(!unicode.hasOwnProperty(slug)){throw new SyntaxError(ERR_UNKNOWN_NAME+match[0]);}// Switch to the negated form of the referenced Unicode token
	if(item.inverseOf){slug=normalize(item.inverseOf);if(!unicode.hasOwnProperty(slug)){var _context3;throw new ReferenceError((0, _concat["default"])(_context3="".concat(ERR_UNKNOWN_REF+match[0]," -> ")).call(_context3,item.inverseOf));}item=unicode[slug];isNegated=!isNegated;}if(!(item.bmp||isAstralMode)){throw new SyntaxError(ERR_ASTRAL_ONLY+match[0]);}if(isAstralMode){if(scope==='class'){throw new SyntaxError(ERR_ASTRAL_IN_CLASS);}return cacheAstral(slug,isNegated);}return scope==='class'?isNegated?cacheInvertedBmp(slug):item.bmp:"".concat((isNegated?'[^':'[')+item.bmp,"]");},{scope:'all',optionalFlags:'A',leadChar:'\\'});/**
	   * Adds to the list of Unicode tokens that XRegExp regexes can match via `\p` or `\P`.
	   *
	   * @memberOf XRegExp
	   * @param {Array} data Objects with named character ranges. Each object may have properties
	   *   `name`, `alias`, `isBmpLast`, `inverseOf`, `bmp`, and `astral`. All but `name` are
	   *   optional, although one of `bmp` or `astral` is required (unless `inverseOf` is set). If
	   *   `astral` is absent, the `bmp` data is used for BMP and astral modes. If `bmp` is absent,
	   *   the name errors in BMP mode but works in astral mode. If both `bmp` and `astral` are
	   *   provided, the `bmp` data only is used in BMP mode, and the combination of `bmp` and
	   *   `astral` data is used in astral mode. `isBmpLast` is needed when a token matches orphan
	   *   high surrogates *and* uses surrogate pairs to match astral code points. The `bmp` and
	   *   `astral` data should be a combination of literal characters and `\xHH` or `\uHHHH` escape
	   *   sequences, with hyphens to create ranges. Any regex metacharacters in the data should be
	   *   escaped, apart from range-creating hyphens. The `astral` data can additionally use
	   *   character classes and alternation, and should use surrogate pairs to represent astral code
	   *   points. `inverseOf` can be used to avoid duplicating character data if a Unicode token is
	   *   defined as the exact inverse of another token.
	   * @example
	   *
	   * // Basic use
	   * XRegExp.addUnicodeData([{
	   *   name: 'XDigit',
	   *   alias: 'Hexadecimal',
	   *   bmp: '0-9A-Fa-f'
	   * }]);
	   * XRegExp('\\p{XDigit}:\\p{Hexadecimal}+').test('0:3D'); // -> true
	   */XRegExp.addUnicodeData=function(data){var ERR_NO_NAME='Unicode token requires name';var ERR_NO_DATA='Unicode token has no character data ';var _iterator=_createForOfIteratorHelper(data),_step;try{for(_iterator.s();!(_step=_iterator.n()).done;){var item=_step.value;if(!item.name){throw new Error(ERR_NO_NAME);}if(!(item.inverseOf||item.bmp||item.astral)){throw new Error(ERR_NO_DATA+item.name);}unicode[normalize(item.name)]=item;if(item.alias){unicode[normalize(item.alias)]=item;}}// Reset the pattern cache used by the `XRegExp` constructor, since the same pattern and
	// flags might now produce different results
	}catch(err){_iterator.e(err);}finally{_iterator.f();}XRegExp.cache.flush('patterns');};/**
	   * @ignore
	   *
	   * Return a reference to the internal Unicode definition structure for the given Unicode
	   * Property if the given name is a legal Unicode Property for use in XRegExp `\p` or `\P` regex
	   * constructs.
	   *
	   * @memberOf XRegExp
	   * @param {String} name Name by which the Unicode Property may be recognized (case-insensitive),
	   *   e.g. `'N'` or `'Number'`. The given name is matched against all registered Unicode
	   *   Properties and Property Aliases.
	   * @returns {Object} Reference to definition structure when the name matches a Unicode Property.
	   *
	   * @note
	   * For more info on Unicode Properties, see also http://unicode.org/reports/tr18/#Categories.
	   *
	   * @note
	   * This method is *not* part of the officially documented API and may change or be removed in
	   * the future. It is meant for userland code that wishes to reuse the (large) internal Unicode
	   * structures set up by XRegExp.
	   */XRegExp._getUnicodeProperty=function(name){var slug=normalize(name);return unicode[slug];};};exports["default"]=_default;module.exports=exports["default"];},{"@babel/runtime-corejs3/core-js-stable/array/from":2,"@babel/runtime-corejs3/core-js-stable/array/is-array":3,"@babel/runtime-corejs3/core-js-stable/instance/concat":4,"@babel/runtime-corejs3/core-js-stable/instance/for-each":6,"@babel/runtime-corejs3/core-js-stable/instance/includes":7,"@babel/runtime-corejs3/core-js-stable/instance/slice":11,"@babel/runtime-corejs3/core-js-stable/object/define-property":14,"@babel/runtime-corejs3/core-js-stable/symbol":16,"@babel/runtime-corejs3/core-js/get-iterator":20,"@babel/runtime-corejs3/core-js/get-iterator-method":19,"@babel/runtime-corejs3/helpers/interopRequireDefault":25}],261:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault");var _Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _blocks=_interopRequireDefault(require("../../tools/output/blocks"));/*!
	 * XRegExp Unicode Blocks 4.4.1
	 * <xregexp.com>
	 * Steven Levithan (c) 2010-present MIT License
	 * Unicode data by Mathias Bynens <mathiasbynens.be>
	 */var _default=function _default(XRegExp){/**
	   * Adds support for all Unicode blocks. Block names use the prefix 'In'. E.g.,
	   * `\p{InBasicLatin}`. Token names are case insensitive, and any spaces, hyphens, and
	   * underscores are ignored.
	   *
	   * Uses Unicode 13.0.0.
	   *
	   * @requires XRegExp, Unicode Base
	   */if(!XRegExp.addUnicodeData){throw new ReferenceError('Unicode Base must be loaded before Unicode Blocks');}XRegExp.addUnicodeData(_blocks["default"]);};exports["default"]=_default;module.exports=exports["default"];},{"../../tools/output/blocks":267,"@babel/runtime-corejs3/core-js-stable/object/define-property":14,"@babel/runtime-corejs3/helpers/interopRequireDefault":25}],262:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault");var _Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _categories=_interopRequireDefault(require("../../tools/output/categories"));/*!
	 * XRegExp Unicode Categories 4.4.1
	 * <xregexp.com>
	 * Steven Levithan (c) 2010-present MIT License
	 * Unicode data by Mathias Bynens <mathiasbynens.be>
	 */var _default=function _default(XRegExp){/**
	   * Adds support for Unicode's general categories. E.g., `\p{Lu}` or `\p{Uppercase Letter}`. See
	   * category descriptions in UAX #44 <http://unicode.org/reports/tr44/#GC_Values_Table>. Token
	   * names are case insensitive, and any spaces, hyphens, and underscores are ignored.
	   *
	   * Uses Unicode 13.0.0.
	   *
	   * @requires XRegExp, Unicode Base
	   */if(!XRegExp.addUnicodeData){throw new ReferenceError('Unicode Base must be loaded before Unicode Categories');}XRegExp.addUnicodeData(_categories["default"]);};exports["default"]=_default;module.exports=exports["default"];},{"../../tools/output/categories":268,"@babel/runtime-corejs3/core-js-stable/object/define-property":14,"@babel/runtime-corejs3/helpers/interopRequireDefault":25}],263:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault");var _Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _properties=_interopRequireDefault(require("../../tools/output/properties"));/*!
	 * XRegExp Unicode Properties 4.4.1
	 * <xregexp.com>
	 * Steven Levithan (c) 2012-present MIT License
	 * Unicode data by Mathias Bynens <mathiasbynens.be>
	 */var _default=function _default(XRegExp){/**
	   * Adds properties to meet the UTS #18 Level 1 RL1.2 requirements for Unicode regex support. See
	   * <http://unicode.org/reports/tr18/#RL1.2>. Following are definitions of these properties from
	   * UAX #44 <http://unicode.org/reports/tr44/>:
	   *
	   * - Alphabetic
	   *   Characters with the Alphabetic property. Generated from: Lowercase + Uppercase + Lt + Lm +
	   *   Lo + Nl + Other_Alphabetic.
	   *
	   * - Default_Ignorable_Code_Point
	   *   For programmatic determination of default ignorable code points. New characters that should
	   *   be ignored in rendering (unless explicitly supported) will be assigned in these ranges,
	   *   permitting programs to correctly handle the default rendering of such characters when not
	   *   otherwise supported.
	   *
	   * - Lowercase
	   *   Characters with the Lowercase property. Generated from: Ll + Other_Lowercase.
	   *
	   * - Noncharacter_Code_Point
	   *   Code points permanently reserved for internal use.
	   *
	   * - Uppercase
	   *   Characters with the Uppercase property. Generated from: Lu + Other_Uppercase.
	   *
	   * - White_Space
	   *   Spaces, separator characters and other control characters which should be treated by
	   *   programming languages as "white space" for the purpose of parsing elements.
	   *
	   * The properties ASCII, Any, and Assigned are also included but are not defined in UAX #44. UTS
	   * #18 RL1.2 additionally requires support for Unicode scripts and general categories. These are
	   * included in XRegExp's Unicode Categories and Unicode Scripts addons.
	   *
	   * Token names are case insensitive, and any spaces, hyphens, and underscores are ignored.
	   *
	   * Uses Unicode 13.0.0.
	   *
	   * @requires XRegExp, Unicode Base
	   */if(!XRegExp.addUnicodeData){throw new ReferenceError('Unicode Base must be loaded before Unicode Properties');}var unicodeData=_properties["default"];// Add non-generated data
	unicodeData.push({name:'Assigned',// Since this is defined as the inverse of Unicode category Cn (Unassigned), the Unicode
	// Categories addon is required to use this property
	inverseOf:'Cn'});XRegExp.addUnicodeData(unicodeData);};exports["default"]=_default;module.exports=exports["default"];},{"../../tools/output/properties":269,"@babel/runtime-corejs3/core-js-stable/object/define-property":14,"@babel/runtime-corejs3/helpers/interopRequireDefault":25}],264:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault");var _Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _scripts=_interopRequireDefault(require("../../tools/output/scripts"));/*!
	 * XRegExp Unicode Scripts 4.4.1
	 * <xregexp.com>
	 * Steven Levithan (c) 2010-present MIT License
	 * Unicode data by Mathias Bynens <mathiasbynens.be>
	 */var _default=function _default(XRegExp){/**
	   * Adds support for all Unicode scripts. E.g., `\p{Latin}`. Token names are case insensitive,
	   * and any spaces, hyphens, and underscores are ignored.
	   *
	   * Uses Unicode 13.0.0.
	   *
	   * @requires XRegExp, Unicode Base
	   */if(!XRegExp.addUnicodeData){throw new ReferenceError('Unicode Base must be loaded before Unicode Scripts');}XRegExp.addUnicodeData(_scripts["default"]);};exports["default"]=_default;module.exports=exports["default"];},{"../../tools/output/scripts":270,"@babel/runtime-corejs3/core-js-stable/object/define-property":14,"@babel/runtime-corejs3/helpers/interopRequireDefault":25}],265:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault");var _Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _xregexp=_interopRequireDefault(require("./xregexp"));var _build=_interopRequireDefault(require("./addons/build"));var _matchrecursive=_interopRequireDefault(require("./addons/matchrecursive"));var _unicodeBase=_interopRequireDefault(require("./addons/unicode-base"));var _unicodeBlocks=_interopRequireDefault(require("./addons/unicode-blocks"));var _unicodeCategories=_interopRequireDefault(require("./addons/unicode-categories"));var _unicodeProperties=_interopRequireDefault(require("./addons/unicode-properties"));var _unicodeScripts=_interopRequireDefault(require("./addons/unicode-scripts"));(0, _build["default"])(_xregexp["default"]);(0, _matchrecursive["default"])(_xregexp["default"]);(0, _unicodeBase["default"])(_xregexp["default"]);(0, _unicodeBlocks["default"])(_xregexp["default"]);(0, _unicodeCategories["default"])(_xregexp["default"]);(0, _unicodeProperties["default"])(_xregexp["default"]);(0, _unicodeScripts["default"])(_xregexp["default"]);var _default=_xregexp["default"];exports["default"]=_default;module.exports=exports["default"];},{"./addons/build":258,"./addons/matchrecursive":259,"./addons/unicode-base":260,"./addons/unicode-blocks":261,"./addons/unicode-categories":262,"./addons/unicode-properties":263,"./addons/unicode-scripts":264,"./xregexp":266,"@babel/runtime-corejs3/core-js-stable/object/define-property":14,"@babel/runtime-corejs3/helpers/interopRequireDefault":25}],266:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime-corejs3/helpers/interopRequireDefault");var _Object$defineProperty=require("@babel/runtime-corejs3/core-js-stable/object/define-property");_Object$defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _getIterator2=_interopRequireDefault(require("@babel/runtime-corejs3/core-js/get-iterator"));var _isArray=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));var _getIteratorMethod2=_interopRequireDefault(require("@babel/runtime-corejs3/core-js/get-iterator-method"));var _symbol=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/symbol"));var _from=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/from"));var _concat=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));var _indexOf=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));var _create=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/create"));var _slicedToArray2=_interopRequireDefault(require("@babel/runtime-corejs3/helpers/slicedToArray"));var _forEach=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each"));var _includes=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));var _parseInt2=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/parse-int"));var _slice=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));var _sort=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/sort"));var _flags=_interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/flags"));function _createForOfIteratorHelper(o,allowArrayLike){var it;if(typeof _symbol["default"]==="undefined"||(0, _getIteratorMethod2["default"])(o)==null){if((0, _isArray["default"])(o)||(it=_unsupportedIterableToArray(o))||allowArrayLike&&o&&typeof o.length==="number"){if(it)o=it;var i=0;var F=function F(){};return {s:F,n:function n(){if(i>=o.length)return {done:true};return {done:false,value:o[i++]};},e:function e(_e){throw _e;},f:F};}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion=true,didErr=false,err;return {s:function s(){it=(0, _getIterator2["default"])(o);},n:function n(){var step=it.next();normalCompletion=step.done;return step;},e:function e(_e2){didErr=true;err=_e2;},f:function f(){try{if(!normalCompletion&&it["return"]!=null)it["return"]();}finally{if(didErr)throw err;}}};}function _unsupportedIterableToArray(o,minLen){var _context9;if(!o)return;if(typeof o==="string")return _arrayLikeToArray(o,minLen);var n=(0, _slice["default"])(_context9=Object.prototype.toString.call(o)).call(_context9,8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return (0, _from["default"])(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen);}function _arrayLikeToArray(arr,len){if(len==null||len>arr.length)len=arr.length;for(var i=0,arr2=new Array(len);i<len;i++){arr2[i]=arr[i];}return arr2;}/*!
	 * XRegExp 4.4.1
	 * <xregexp.com>
	 * Steven Levithan (c) 2007-present MIT License
	 */ /**
	 * XRegExp provides augmented, extensible regular expressions. You get additional regex syntax and
	 * flags, beyond what browsers support natively. XRegExp is also a regex utility belt with tools to
	 * make your client-side grepping simpler and more powerful, while freeing you from related
	 * cross-browser inconsistencies.
	 */ // ==--------------------------==
	// Private stuff
	// ==--------------------------==
	// Property name used for extended regex instance data
	var REGEX_DATA='xregexp';// Optional features that can be installed and uninstalled
	var features={astral:false,namespacing:false};// Native methods to use and restore ('native' is an ES3 reserved keyword)
	var nativ={exec:RegExp.prototype.exec,test:RegExp.prototype.test,match:String.prototype.match,replace:String.prototype.replace,split:String.prototype.split};// Storage for fixed/extended native methods
	var fixed={};// Storage for regexes cached by `XRegExp.cache`
	var regexCache={};// Storage for pattern details cached by the `XRegExp` constructor
	var patternCache={};// Storage for regex syntax tokens added internally or by `XRegExp.addToken`
	var tokens=[];// Token scopes
	var defaultScope='default';var classScope='class';// Regexes that match native regex syntax, including octals
	var nativeTokens={// Any native multicharacter token in default scope, or any single character
	'default':/\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|\(\?(?:[:=!]|<[=!])|[?*+]\?|{\d+(?:,\d*)?}\??|[\s\S]/,// Any native multicharacter token in character class scope, or any single character
	'class':/\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|[\s\S]/};// Any backreference or dollar-prefixed character in replacement strings
	var replacementToken=/\$(?:{([\w$]+)}|<([\w$]+)>|(\d\d?|[\s\S]))/g;// Check for correct `exec` handling of nonparticipating capturing groups
	var correctExecNpcg=nativ.exec.call(/()??/,'')[1]===undefined;// Check for ES6 `flags` prop support
	var hasFlagsProp=(0, _flags["default"])(/x/)!==undefined;// Shortcut to `Object.prototype.toString`
	var _ref={},toString=_ref.toString;function hasNativeFlag(flag){// Can't check based on the presence of properties/getters since browsers might support such
	// properties even when they don't support the corresponding flag in regex construction (tested
	// in Chrome 48, where `'unicode' in /x/` is true but trying to construct a regex with flag `u`
	// throws an error)
	var isSupported=true;try{// Can't use regex literals for testing even in a `try` because regex literals with
	// unsupported flags cause a compilation error in IE
	new RegExp('',flag);// Work around a broken/incomplete IE11 polyfill for sticky introduced in core-js 3.6.0
	if(flag==='y'){// Using function to avoid babel transform to regex literal
	var gy=function(){return 'gy';}();var incompleteY='.a'.replace(new RegExp('a',gy),'.')==='..';if(incompleteY){isSupported=false;}}}catch(exception){isSupported=false;}return isSupported;}// Check for ES6 `u` flag support
	var hasNativeU=hasNativeFlag('u');// Check for ES6 `y` flag support
	var hasNativeY=hasNativeFlag('y');// Tracker for known flags, including addon flags
	var registeredFlags={g:true,i:true,m:true,u:hasNativeU,y:hasNativeY};/**
	 * Attaches extended data and `XRegExp.prototype` properties to a regex object.
	 *
	 * @private
	 * @param {RegExp} regex Regex to augment.
	 * @param {Array} captureNames Array with capture names, or `null`.
	 * @param {String} xSource XRegExp pattern used to generate `regex`, or `null` if N/A.
	 * @param {String} xFlags XRegExp flags used to generate `regex`, or `null` if N/A.
	 * @param {Boolean} [isInternalOnly=false] Whether the regex will be used only for internal
	 *   operations, and never exposed to users. For internal-only regexes, we can improve perf by
	 *   skipping some operations like attaching `XRegExp.prototype` properties.
	 * @returns {!RegExp} Augmented regex.
	 */function augment(regex,captureNames,xSource,xFlags,isInternalOnly){var _context;regex[REGEX_DATA]={captureNames:captureNames};if(isInternalOnly){return regex;}// Can't auto-inherit these since the XRegExp constructor returns a nonprimitive value
	if(regex.__proto__){regex.__proto__=XRegExp.prototype;}else {for(var p in XRegExp.prototype){// An `XRegExp.prototype.hasOwnProperty(p)` check wouldn't be worth it here, since this
	// is performance sensitive, and enumerable `Object.prototype` or `RegExp.prototype`
	// extensions exist on `regex.prototype` anyway
	regex[p]=XRegExp.prototype[p];}}regex[REGEX_DATA].source=xSource;// Emulate the ES6 `flags` prop by ensuring flags are in alphabetical order
	regex[REGEX_DATA].flags=xFlags?(0, _sort["default"])(_context=xFlags.split('')).call(_context).join(''):xFlags;return regex;}/**
	 * Removes any duplicate characters from the provided string.
	 *
	 * @private
	 * @param {String} str String to remove duplicate characters from.
	 * @returns {string} String with any duplicate characters removed.
	 */function clipDuplicates(str){return nativ.replace.call(str,/([\s\S])(?=[\s\S]*\1)/g,'');}/**
	 * Copies a regex object while preserving extended data and augmenting with `XRegExp.prototype`
	 * properties. The copy has a fresh `lastIndex` property (set to zero). Allows adding and removing
	 * flags g and y while copying the regex.
	 *
	 * @private
	 * @param {RegExp} regex Regex to copy.
	 * @param {Object} [options] Options object with optional properties:
	 *   - `addG` {Boolean} Add flag g while copying the regex.
	 *   - `addY` {Boolean} Add flag y while copying the regex.
	 *   - `removeG` {Boolean} Remove flag g while copying the regex.
	 *   - `removeY` {Boolean} Remove flag y while copying the regex.
	 *   - `isInternalOnly` {Boolean} Whether the copied regex will be used only for internal
	 *     operations, and never exposed to users. For internal-only regexes, we can improve perf by
	 *     skipping some operations like attaching `XRegExp.prototype` properties.
	 *   - `source` {String} Overrides `<regex>.source`, for special cases.
	 * @returns {RegExp} Copy of the provided regex, possibly with modified flags.
	 */function copyRegex(regex,options){var _context2;if(!XRegExp.isRegExp(regex)){throw new TypeError('Type RegExp expected');}var xData=regex[REGEX_DATA]||{};var flags=getNativeFlags(regex);var flagsToAdd='';var flagsToRemove='';var xregexpSource=null;var xregexpFlags=null;options=options||{};if(options.removeG){flagsToRemove+='g';}if(options.removeY){flagsToRemove+='y';}if(flagsToRemove){flags=nativ.replace.call(flags,new RegExp("[".concat(flagsToRemove,"]+"),'g'),'');}if(options.addG){flagsToAdd+='g';}if(options.addY){flagsToAdd+='y';}if(flagsToAdd){flags=clipDuplicates(flags+flagsToAdd);}if(!options.isInternalOnly){if(xData.source!==undefined){xregexpSource=xData.source;}// null or undefined; don't want to add to `flags` if the previous value was null, since
	// that indicates we're not tracking original precompilation flags
	if((0, _flags["default"])(xData)!=null){// Flags are only added for non-internal regexes by `XRegExp.globalize`. Flags are never
	// removed for non-internal regexes, so don't need to handle it
	xregexpFlags=flagsToAdd?clipDuplicates((0, _flags["default"])(xData)+flagsToAdd):(0, _flags["default"])(xData);}}// Augment with `XRegExp.prototype` properties, but use the native `RegExp` constructor to avoid
	// searching for special tokens. That would be wrong for regexes constructed by `RegExp`, and
	// unnecessary for regexes constructed by `XRegExp` because the regex has already undergone the
	// translation to native regex syntax
	regex=augment(new RegExp(options.source||regex.source,flags),hasNamedCapture(regex)?(0, _slice["default"])(_context2=xData.captureNames).call(_context2,0):null,xregexpSource,xregexpFlags,options.isInternalOnly);return regex;}/**
	 * Converts hexadecimal to decimal.
	 *
	 * @private
	 * @param {String} hex
	 * @returns {number}
	 */function dec(hex){return (0, _parseInt2["default"])(hex,16);}/**
	 * Returns a pattern that can be used in a native RegExp in place of an ignorable token such as an
	 * inline comment or whitespace with flag x. This is used directly as a token handler function
	 * passed to `XRegExp.addToken`.
	 *
	 * @private
	 * @param {String} match Match arg of `XRegExp.addToken` handler
	 * @param {String} scope Scope arg of `XRegExp.addToken` handler
	 * @param {String} flags Flags arg of `XRegExp.addToken` handler
	 * @returns {string} Either '' or '(?:)', depending on which is needed in the context of the match.
	 */function getContextualTokenSeparator(match,scope,flags){if(// No need to separate tokens if at the beginning or end of a group
	match.input[match.index-1]==='('||match.input[match.index+match[0].length]===')'||// No need to separate tokens if before or after a `|`
	match.input[match.index-1]==='|'||match.input[match.index+match[0].length]==='|'||// No need to separate tokens if at the beginning or end of the pattern
	match.index<1||match.index+match[0].length>=match.input.length||// No need to separate tokens if at the beginning of a noncapturing group or lookahead.
	// The way this is written relies on:
	// - The search regex matching only 3-char strings.
	// - Although `substr` gives chars from the end of the string if given a negative index,
	//   the resulting substring will be too short to match. Ex: `'abcd'.substr(-1, 3) === 'd'`
	nativ.test.call(/^\(\?[:=!]/,match.input.substr(match.index-3,3))||// Avoid separating tokens when the following token is a quantifier
	isQuantifierNext(match.input,match.index+match[0].length,flags)){return '';}// Keep tokens separated. This avoids e.g. inadvertedly changing `\1 1` or `\1(?#)1` to `\11`.
	// This also ensures all tokens remain as discrete atoms, e.g. it avoids converting the syntax
	// error `(? :` into `(?:`.
	return '(?:)';}/**
	 * Returns native `RegExp` flags used by a regex object.
	 *
	 * @private
	 * @param {RegExp} regex Regex to check.
	 * @returns {string} Native flags in use.
	 */function getNativeFlags(regex){return hasFlagsProp?(0, _flags["default"])(regex):// Explicitly using `RegExp.prototype.toString` (rather than e.g. `String` or concatenation
	// with an empty string) allows this to continue working predictably when
	// `XRegExp.proptotype.toString` is overridden
	nativ.exec.call(/\/([a-z]*)$/i,RegExp.prototype.toString.call(regex))[1];}/**
	 * Determines whether a regex has extended instance data used to track capture names.
	 *
	 * @private
	 * @param {RegExp} regex Regex to check.
	 * @returns {boolean} Whether the regex uses named capture.
	 */function hasNamedCapture(regex){return !!(regex[REGEX_DATA]&&regex[REGEX_DATA].captureNames);}/**
	 * Converts decimal to hexadecimal.
	 *
	 * @private
	 * @param {Number|String} dec
	 * @returns {string}
	 */function hex(dec){return (0, _parseInt2["default"])(dec,10).toString(16);}/**
	 * Checks whether the next nonignorable token after the specified position is a quantifier.
	 *
	 * @private
	 * @param {String} pattern Pattern to search within.
	 * @param {Number} pos Index in `pattern` to search at.
	 * @param {String} flags Flags used by the pattern.
	 * @returns {Boolean} Whether the next nonignorable token is a quantifier.
	 */function isQuantifierNext(pattern,pos,flags){return nativ.test.call((0, _includes["default"])(flags).call(flags,'x')?// Ignore any leading whitespace, line comments, and inline comments
	/^(?:\s|#[^#\n]*|\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/:// Ignore any leading inline comments
	/^(?:\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/,(0, _slice["default"])(pattern).call(pattern,pos));}/**
	 * Determines whether a value is of the specified type, by resolving its internal [[Class]].
	 *
	 * @private
	 * @param {*} value Object to check.
	 * @param {String} type Type to check for, in TitleCase.
	 * @returns {boolean} Whether the object matches the type.
	 */function isType(value,type){return toString.call(value)==="[object ".concat(type,"]");}/**
	 * Adds leading zeros if shorter than four characters. Used for fixed-length hexadecimal values.
	 *
	 * @private
	 * @param {String} str
	 * @returns {string}
	 */function pad4(str){while(str.length<4){str="0".concat(str);}return str;}/**
	 * Checks for flag-related errors, and strips/applies flags in a leading mode modifier. Offloads
	 * the flag preparation logic from the `XRegExp` constructor.
	 *
	 * @private
	 * @param {String} pattern Regex pattern, possibly with a leading mode modifier.
	 * @param {String} flags Any combination of flags.
	 * @returns {!Object} Object with properties `pattern` and `flags`.
	 */function prepareFlags(pattern,flags){// Recent browsers throw on duplicate flags, so copy this behavior for nonnative flags
	if(clipDuplicates(flags)!==flags){throw new SyntaxError("Invalid duplicate regex flag ".concat(flags));}// Strip and apply a leading mode modifier with any combination of flags except g or y
	pattern=nativ.replace.call(pattern,/^\(\?([\w$]+)\)/,function($0,$1){if(nativ.test.call(/[gy]/,$1)){throw new SyntaxError("Cannot use flag g or y in mode modifier ".concat($0));}// Allow duplicate flags within the mode modifier
	flags=clipDuplicates(flags+$1);return '';});// Throw on unknown native or nonnative flags
	var _iterator=_createForOfIteratorHelper(flags),_step;try{for(_iterator.s();!(_step=_iterator.n()).done;){var flag=_step.value;if(!registeredFlags[flag]){throw new SyntaxError("Unknown regex flag ".concat(flag));}}}catch(err){_iterator.e(err);}finally{_iterator.f();}return {pattern:pattern,flags:flags};}/**
	 * Prepares an options object from the given value.
	 *
	 * @private
	 * @param {String|Object} value Value to convert to an options object.
	 * @returns {Object} Options object.
	 */function prepareOptions(value){var options={};if(isType(value,'String')){(0, _forEach["default"])(XRegExp).call(XRegExp,value,/[^\s,]+/,function(match){options[match]=true;});return options;}return value;}/**
	 * Registers a flag so it doesn't throw an 'unknown flag' error.
	 *
	 * @private
	 * @param {String} flag Single-character flag to register.
	 */function registerFlag(flag){if(!/^[\w$]$/.test(flag)){throw new Error('Flag must be a single character A-Za-z0-9_$');}registeredFlags[flag]=true;}/**
	 * Runs built-in and custom regex syntax tokens in reverse insertion order at the specified
	 * position, until a match is found.
	 *
	 * @private
	 * @param {String} pattern Original pattern from which an XRegExp object is being built.
	 * @param {String} flags Flags being used to construct the regex.
	 * @param {Number} pos Position to search for tokens within `pattern`.
	 * @param {Number} scope Regex scope to apply: 'default' or 'class'.
	 * @param {Object} context Context object to use for token handler functions.
	 * @returns {Object} Object with properties `matchLength`, `output`, and `reparse`; or `null`.
	 */function runTokens(pattern,flags,pos,scope,context){var i=tokens.length;var leadChar=pattern[pos];var result=null;var match;var t;// Run in reverse insertion order
	while(i--){t=tokens[i];if(t.leadChar&&t.leadChar!==leadChar||t.scope!==scope&&t.scope!=='all'||t.flag&&!(0, _includes["default"])(flags).call(flags,t.flag)){continue;}match=XRegExp.exec(pattern,t.regex,pos,'sticky');if(match){result={matchLength:match[0].length,output:t.handler.call(context,match,scope,flags),reparse:t.reparse};// Finished with token tests
	break;}}return result;}/**
	 * Enables or disables implicit astral mode opt-in. When enabled, flag A is automatically added to
	 * all new regexes created by XRegExp. This causes an error to be thrown when creating regexes if
	 * the Unicode Base addon is not available, since flag A is registered by that addon.
	 *
	 * @private
	 * @param {Boolean} on `true` to enable; `false` to disable.
	 */function setAstral(on){features.astral=on;}/**
	 * Adds named capture groups to the `groups` property of match arrays. See here for details:
	 * https://github.com/tc39/proposal-regexp-named-groups
	 *
	 * @private
	 * @param {Boolean} on `true` to enable; `false` to disable.
	 */function setNamespacing(on){features.namespacing=on;}/**
	 * Returns the object, or throws an error if it is `null` or `undefined`. This is used to follow
	 * the ES5 abstract operation `ToObject`.
	 *
	 * @private
	 * @param {*} value Object to check and return.
	 * @returns {*} The provided object.
	 */function toObject(value){// null or undefined
	if(value==null){throw new TypeError('Cannot convert null or undefined to object');}return value;}// ==--------------------------==
	// Constructor
	// ==--------------------------==
	/**
	 * Creates an extended regular expression object for matching text with a pattern. Differs from a
	 * native regular expression in that additional syntax and flags are supported. The returned object
	 * is in fact a native `RegExp` and works with all native methods.
	 *
	 * @class XRegExp
	 * @constructor
	 * @param {String|RegExp} pattern Regex pattern string, or an existing regex object to copy.
	 * @param {String} [flags] Any combination of flags.
	 *   Native flags:
	 *     - `g` - global
	 *     - `i` - ignore case
	 *     - `m` - multiline anchors
	 *     - `u` - unicode (ES6)
	 *     - `y` - sticky (Firefox 3+, ES6)
	 *   Additional XRegExp flags:
	 *     - `n` - explicit capture
	 *     - `s` - dot matches all (aka singleline)
	 *     - `x` - free-spacing and line comments (aka extended)
	 *     - `A` - astral (requires the Unicode Base addon)
	 *   Flags cannot be provided when constructing one `RegExp` from another.
	 * @returns {RegExp} Extended regular expression object.
	 * @example
	 *
	 * // With named capture and flag x
	 * XRegExp(`(?<year>  [0-9]{4} ) -?  # year
	 *          (?<month> [0-9]{2} ) -?  # month
	 *          (?<day>   [0-9]{2} )     # day`, 'x');
	 *
	 * // Providing a regex object copies it. Native regexes are recompiled using native (not XRegExp)
	 * // syntax. Copies maintain extended data, are augmented with `XRegExp.prototype` properties, and
	 * // have fresh `lastIndex` properties (set to zero).
	 * XRegExp(/regex/);
	 */function XRegExp(pattern,flags){if(XRegExp.isRegExp(pattern)){if(flags!==undefined){throw new TypeError('Cannot supply flags when copying a RegExp');}return copyRegex(pattern);}// Copy the argument behavior of `RegExp`
	pattern=pattern===undefined?'':String(pattern);flags=flags===undefined?'':String(flags);if(XRegExp.isInstalled('astral')&&!(0, _includes["default"])(flags).call(flags,'A')){// This causes an error to be thrown if the Unicode Base addon is not available
	flags+='A';}if(!patternCache[pattern]){patternCache[pattern]={};}if(!patternCache[pattern][flags]){var context={hasNamedCapture:false,captureNames:[]};var scope=defaultScope;var output='';var pos=0;var result;// Check for flag-related errors, and strip/apply flags in a leading mode modifier
	var applied=prepareFlags(pattern,flags);var appliedPattern=applied.pattern;var appliedFlags=(0, _flags["default"])(applied);// Use XRegExp's tokens to translate the pattern to a native regex pattern.
	// `appliedPattern.length` may change on each iteration if tokens use `reparse`
	while(pos<appliedPattern.length){do{// Check for custom tokens at the current position
	result=runTokens(appliedPattern,appliedFlags,pos,scope,context);// If the matched token used the `reparse` option, splice its output into the
	// pattern before running tokens again at the same position
	if(result&&result.reparse){appliedPattern=(0, _slice["default"])(appliedPattern).call(appliedPattern,0,pos)+result.output+(0, _slice["default"])(appliedPattern).call(appliedPattern,pos+result.matchLength);}}while(result&&result.reparse);if(result){output+=result.output;pos+=result.matchLength||1;}else {// Get the native token at the current position
	var _XRegExp$exec=XRegExp.exec(appliedPattern,nativeTokens[scope],pos,'sticky'),_XRegExp$exec2=(0, _slicedToArray2["default"])(_XRegExp$exec,1),token=_XRegExp$exec2[0];output+=token;pos+=token.length;if(token==='['&&scope===defaultScope){scope=classScope;}else if(token===']'&&scope===classScope){scope=defaultScope;}}}patternCache[pattern][flags]={// Use basic cleanup to collapse repeated empty groups like `(?:)(?:)` to `(?:)`. Empty
	// groups are sometimes inserted during regex transpilation in order to keep tokens
	// separated. However, more than one empty group in a row is never needed.
	pattern:nativ.replace.call(output,/(?:\(\?:\))+/g,'(?:)'),// Strip all but native flags
	flags:nativ.replace.call(appliedFlags,/[^gimuy]+/g,''),// `context.captureNames` has an item for each capturing group, even if unnamed
	captures:context.hasNamedCapture?context.captureNames:null};}var generated=patternCache[pattern][flags];return augment(new RegExp(generated.pattern,(0, _flags["default"])(generated)),generated.captures,pattern,flags);}// Add `RegExp.prototype` to the prototype chain
	XRegExp.prototype=/(?:)/;// ==--------------------------==
	// Public properties
	// ==--------------------------==
	/**
	 * The XRegExp version number as a string containing three dot-separated parts. For example,
	 * '2.0.0-beta-3'.
	 *
	 * @static
	 * @memberOf XRegExp
	 * @type String
	 */XRegExp.version='4.4.1';// ==--------------------------==
	// Public methods
	// ==--------------------------==
	// Intentionally undocumented; used in tests and addons
	XRegExp._clipDuplicates=clipDuplicates;XRegExp._hasNativeFlag=hasNativeFlag;XRegExp._dec=dec;XRegExp._hex=hex;XRegExp._pad4=pad4;/**
	 * Extends XRegExp syntax and allows custom flags. This is used internally and can be used to
	 * create XRegExp addons. If more than one token can match the same string, the last added wins.
	 *
	 * @memberOf XRegExp
	 * @param {RegExp} regex Regex object that matches the new token.
	 * @param {Function} handler Function that returns a new pattern string (using native regex syntax)
	 *   to replace the matched token within all future XRegExp regexes. Has access to persistent
	 *   properties of the regex being built, through `this`. Invoked with three arguments:
	 *   - The match array, with named backreference properties.
	 *   - The regex scope where the match was found: 'default' or 'class'.
	 *   - The flags used by the regex, including any flags in a leading mode modifier.
	 *   The handler function becomes part of the XRegExp construction process, so be careful not to
	 *   construct XRegExps within the function or you will trigger infinite recursion.
	 * @param {Object} [options] Options object with optional properties:
	 *   - `scope` {String} Scope where the token applies: 'default', 'class', or 'all'.
	 *   - `flag` {String} Single-character flag that triggers the token. This also registers the
	 *     flag, which prevents XRegExp from throwing an 'unknown flag' error when the flag is used.
	 *   - `optionalFlags` {String} Any custom flags checked for within the token `handler` that are
	 *     not required to trigger the token. This registers the flags, to prevent XRegExp from
	 *     throwing an 'unknown flag' error when any of the flags are used.
	 *   - `reparse` {Boolean} Whether the `handler` function's output should not be treated as
	 *     final, and instead be reparseable by other tokens (including the current token). Allows
	 *     token chaining or deferring.
	 *   - `leadChar` {String} Single character that occurs at the beginning of any successful match
	 *     of the token (not always applicable). This doesn't change the behavior of the token unless
	 *     you provide an erroneous value. However, providing it can increase the token's performance
	 *     since the token can be skipped at any positions where this character doesn't appear.
	 * @example
	 *
	 * // Basic usage: Add \a for the ALERT control code
	 * XRegExp.addToken(
	 *   /\\a/,
	 *   () => '\\x07',
	 *   {scope: 'all'}
	 * );
	 * XRegExp('\\a[\\a-\\n]+').test('\x07\n\x07'); // -> true
	 *
	 * // Add the U (ungreedy) flag from PCRE and RE2, which reverses greedy and lazy quantifiers.
	 * // Since `scope` is not specified, it uses 'default' (i.e., transformations apply outside of
	 * // character classes only)
	 * XRegExp.addToken(
	 *   /([?*+]|{\d+(?:,\d*)?})(\??)/,
	 *   (match) => `${match[1]}${match[2] ? '' : '?'}`,
	 *   {flag: 'U'}
	 * );
	 * XRegExp('a+', 'U').exec('aaa')[0]; // -> 'a'
	 * XRegExp('a+?', 'U').exec('aaa')[0]; // -> 'aaa'
	 */XRegExp.addToken=function(regex,handler,options){options=options||{};var _options=options,optionalFlags=_options.optionalFlags;if(options.flag){registerFlag(options.flag);}if(optionalFlags){optionalFlags=nativ.split.call(optionalFlags,'');var _iterator2=_createForOfIteratorHelper(optionalFlags),_step2;try{for(_iterator2.s();!(_step2=_iterator2.n()).done;){var flag=_step2.value;registerFlag(flag);}}catch(err){_iterator2.e(err);}finally{_iterator2.f();}}// Add to the private list of syntax tokens
	tokens.push({regex:copyRegex(regex,{addG:true,addY:hasNativeY,isInternalOnly:true}),handler:handler,scope:options.scope||defaultScope,flag:options.flag,reparse:options.reparse,leadChar:options.leadChar});// Reset the pattern cache used by the `XRegExp` constructor, since the same pattern and flags
	// might now produce different results
	XRegExp.cache.flush('patterns');};/**
	 * Caches and returns the result of calling `XRegExp(pattern, flags)`. On any subsequent call with
	 * the same pattern and flag combination, the cached copy of the regex is returned.
	 *
	 * @memberOf XRegExp
	 * @param {String} pattern Regex pattern string.
	 * @param {String} [flags] Any combination of XRegExp flags.
	 * @returns {RegExp} Cached XRegExp object.
	 * @example
	 *
	 * while (match = XRegExp.cache('.', 'gs').exec(str)) {
	 *   // The regex is compiled once only
	 * }
	 */XRegExp.cache=function(pattern,flags){if(!regexCache[pattern]){regexCache[pattern]={};}return regexCache[pattern][flags]||(regexCache[pattern][flags]=XRegExp(pattern,flags));};// Intentionally undocumented; used in tests
	XRegExp.cache.flush=function(cacheName){if(cacheName==='patterns'){// Flush the pattern cache used by the `XRegExp` constructor
	patternCache={};}else {// Flush the regex cache populated by `XRegExp.cache`
	regexCache={};}};/**
	 * Escapes any regular expression metacharacters, for use when matching literal strings. The result
	 * can safely be used at any point within a regex that uses any flags.
	 *
	 * @memberOf XRegExp
	 * @param {String} str String to escape.
	 * @returns {string} String with regex metacharacters escaped.
	 * @example
	 *
	 * XRegExp.escape('Escaped? <.>');
	 * // -> 'Escaped\?\ <\.>'
	 */XRegExp.escape=function(str){return nativ.replace.call(toObject(str),/[-\[\]{}()*+?.,\\^$|#\s]/g,'\\$&');};/**
	 * Executes a regex search in a specified string. Returns a match array or `null`. If the provided
	 * regex uses named capture, named backreference properties are included on the match array.
	 * Optional `pos` and `sticky` arguments specify the search start position, and whether the match
	 * must start at the specified position only. The `lastIndex` property of the provided regex is not
	 * used, but is updated for compatibility. Also fixes browser bugs compared to the native
	 * `RegExp.prototype.exec` and can be used reliably cross-browser.
	 *
	 * @memberOf XRegExp
	 * @param {String} str String to search.
	 * @param {RegExp} regex Regex to search with.
	 * @param {Number} [pos=0] Zero-based index at which to start the search.
	 * @param {Boolean|String} [sticky=false] Whether the match must start at the specified position
	 *   only. The string `'sticky'` is accepted as an alternative to `true`.
	 * @returns {Array} Match array with named backreference properties, or `null`.
	 * @example
	 *
	 * // Basic use, with named backreference
	 * let match = XRegExp.exec('U+2620', XRegExp('U\\+(?<hex>[0-9A-F]{4})'));
	 * match.hex; // -> '2620'
	 *
	 * // With pos and sticky, in a loop
	 * let pos = 2, result = [], match;
	 * while (match = XRegExp.exec('<1><2><3><4>5<6>', /<(\d)>/, pos, 'sticky')) {
	 *   result.push(match[1]);
	 *   pos = match.index + match[0].length;
	 * }
	 * // result -> ['2', '3', '4']
	 */XRegExp.exec=function(str,regex,pos,sticky){var cacheKey='g';var addY=false;var fakeY=false;var match;addY=hasNativeY&&!!(sticky||regex.sticky&&sticky!==false);if(addY){cacheKey+='y';}else if(sticky){// Simulate sticky matching by appending an empty capture to the original regex. The
	// resulting regex will succeed no matter what at the current index (set with `lastIndex`),
	// and will not search the rest of the subject string. We'll know that the original regex
	// has failed if that last capture is `''` rather than `undefined` (i.e., if that last
	// capture participated in the match).
	fakeY=true;cacheKey+='FakeY';}regex[REGEX_DATA]=regex[REGEX_DATA]||{};// Shares cached copies with `XRegExp.match`/`replace`
	var r2=regex[REGEX_DATA][cacheKey]||(regex[REGEX_DATA][cacheKey]=copyRegex(regex,{addG:true,addY:addY,source:fakeY?"".concat(regex.source,"|()"):undefined,removeY:sticky===false,isInternalOnly:true}));pos=pos||0;r2.lastIndex=pos;// Fixed `exec` required for `lastIndex` fix, named backreferences, etc.
	match=fixed.exec.call(r2,str);// Get rid of the capture added by the pseudo-sticky matcher if needed. An empty string means
	// the original regexp failed (see above).
	if(fakeY&&match&&match.pop()===''){match=null;}if(regex.global){regex.lastIndex=match?r2.lastIndex:0;}return match;};/**
	 * Executes a provided function once per regex match. Searches always start at the beginning of the
	 * string and continue until the end, regardless of the state of the regex's `global` property and
	 * initial `lastIndex`.
	 *
	 * @memberOf XRegExp
	 * @param {String} str String to search.
	 * @param {RegExp} regex Regex to search with.
	 * @param {Function} callback Function to execute for each match. Invoked with four arguments:
	 *   - The match array, with named backreference properties.
	 *   - The zero-based match index.
	 *   - The string being traversed.
	 *   - The regex object being used to traverse the string.
	 * @example
	 *
	 * // Extracts every other digit from a string
	 * const evens = [];
	 * XRegExp.forEach('1a2345', /\d/, (match, i) => {
	 *   if (i % 2) evens.push(+match[0]);
	 * });
	 * // evens -> [2, 4]
	 */XRegExp.forEach=function(str,regex,callback){var pos=0;var i=-1;var match;while(match=XRegExp.exec(str,regex,pos)){// Because `regex` is provided to `callback`, the function could use the deprecated/
	// nonstandard `RegExp.prototype.compile` to mutate the regex. However, since `XRegExp.exec`
	// doesn't use `lastIndex` to set the search position, this can't lead to an infinite loop,
	// at least. Actually, because of the way `XRegExp.exec` caches globalized versions of
	// regexes, mutating the regex will not have any effect on the iteration or matched strings,
	// which is a nice side effect that brings extra safety.
	callback(match,++i,str,regex);pos=match.index+(match[0].length||1);}};/**
	 * Copies a regex object and adds flag `g`. The copy maintains extended data, is augmented with
	 * `XRegExp.prototype` properties, and has a fresh `lastIndex` property (set to zero). Native
	 * regexes are not recompiled using XRegExp syntax.
	 *
	 * @memberOf XRegExp
	 * @param {RegExp} regex Regex to globalize.
	 * @returns {RegExp} Copy of the provided regex with flag `g` added.
	 * @example
	 *
	 * const globalCopy = XRegExp.globalize(/regex/);
	 * globalCopy.global; // -> true
	 */XRegExp.globalize=function(regex){return copyRegex(regex,{addG:true});};/**
	 * Installs optional features according to the specified options. Can be undone using
	 * `XRegExp.uninstall`.
	 *
	 * @memberOf XRegExp
	 * @param {Object|String} options Options object or string.
	 * @example
	 *
	 * // With an options object
	 * XRegExp.install({
	 *   // Enables support for astral code points in Unicode addons (implicitly sets flag A)
	 *   astral: true,
	 *
	 *   // Adds named capture groups to the `groups` property of matches
	 *   namespacing: true
	 * });
	 *
	 * // With an options string
	 * XRegExp.install('astral namespacing');
	 */XRegExp.install=function(options){options=prepareOptions(options);if(!features.astral&&options.astral){setAstral(true);}if(!features.namespacing&&options.namespacing){setNamespacing(true);}};/**
	 * Checks whether an individual optional feature is installed.
	 *
	 * @memberOf XRegExp
	 * @param {String} feature Name of the feature to check. One of:
	 *   - `astral`
	 *   - `namespacing`
	 * @returns {boolean} Whether the feature is installed.
	 * @example
	 *
	 * XRegExp.isInstalled('astral');
	 */XRegExp.isInstalled=function(feature){return !!features[feature];};/**
	 * Returns `true` if an object is a regex; `false` if it isn't. This works correctly for regexes
	 * created in another frame, when `instanceof` and `constructor` checks would fail.
	 *
	 * @memberOf XRegExp
	 * @param {*} value Object to check.
	 * @returns {boolean} Whether the object is a `RegExp` object.
	 * @example
	 *
	 * XRegExp.isRegExp('string'); // -> false
	 * XRegExp.isRegExp(/regex/i); // -> true
	 * XRegExp.isRegExp(RegExp('^', 'm')); // -> true
	 * XRegExp.isRegExp(XRegExp('(?s).')); // -> true
	 */XRegExp.isRegExp=function(value){return toString.call(value)==='[object RegExp]';};// isType(value, 'RegExp');
	/**
	 * Returns the first matched string, or in global mode, an array containing all matched strings.
	 * This is essentially a more convenient re-implementation of `String.prototype.match` that gives
	 * the result types you actually want (string instead of `exec`-style array in match-first mode,
	 * and an empty array instead of `null` when no matches are found in match-all mode). It also lets
	 * you override flag g and ignore `lastIndex`, and fixes browser bugs.
	 *
	 * @memberOf XRegExp
	 * @param {String} str String to search.
	 * @param {RegExp} regex Regex to search with.
	 * @param {String} [scope='one'] Use 'one' to return the first match as a string. Use 'all' to
	 *   return an array of all matched strings. If not explicitly specified and `regex` uses flag g,
	 *   `scope` is 'all'.
	 * @returns {String|Array} In match-first mode: First match as a string, or `null`. In match-all
	 *   mode: Array of all matched strings, or an empty array.
	 * @example
	 *
	 * // Match first
	 * XRegExp.match('abc', /\w/); // -> 'a'
	 * XRegExp.match('abc', /\w/g, 'one'); // -> 'a'
	 * XRegExp.match('abc', /x/g, 'one'); // -> null
	 *
	 * // Match all
	 * XRegExp.match('abc', /\w/g); // -> ['a', 'b', 'c']
	 * XRegExp.match('abc', /\w/, 'all'); // -> ['a', 'b', 'c']
	 * XRegExp.match('abc', /x/, 'all'); // -> []
	 */XRegExp.match=function(str,regex,scope){var global=regex.global&&scope!=='one'||scope==='all';var cacheKey=(global?'g':'')+(regex.sticky?'y':'')||'noGY';regex[REGEX_DATA]=regex[REGEX_DATA]||{};// Shares cached copies with `XRegExp.exec`/`replace`
	var r2=regex[REGEX_DATA][cacheKey]||(regex[REGEX_DATA][cacheKey]=copyRegex(regex,{addG:!!global,removeG:scope==='one',isInternalOnly:true}));var result=nativ.match.call(toObject(str),r2);if(regex.global){regex.lastIndex=scope==='one'&&result?// Can't use `r2.lastIndex` since `r2` is nonglobal in this case
	result.index+result[0].length:0;}return global?result||[]:result&&result[0];};/**
	 * Retrieves the matches from searching a string using a chain of regexes that successively search
	 * within previous matches. The provided `chain` array can contain regexes and or objects with
	 * `regex` and `backref` properties. When a backreference is specified, the named or numbered
	 * backreference is passed forward to the next regex or returned.
	 *
	 * @memberOf XRegExp
	 * @param {String} str String to search.
	 * @param {Array} chain Regexes that each search for matches within preceding results.
	 * @returns {Array} Matches by the last regex in the chain, or an empty array.
	 * @example
	 *
	 * // Basic usage; matches numbers within <b> tags
	 * XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>', [
	 *   XRegExp('(?is)<b>.*?</b>'),
	 *   /\d+/
	 * ]);
	 * // -> ['2', '4', '56']
	 *
	 * // Passing forward and returning specific backreferences
	 * html = '<a href="http://xregexp.com/api/">XRegExp</a>\
	 *         <a href="http://www.google.com/">Google</a>';
	 * XRegExp.matchChain(html, [
	 *   {regex: /<a href="([^"]+)">/i, backref: 1},
	 *   {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
	 * ]);
	 * // -> ['xregexp.com', 'www.google.com']
	 */XRegExp.matchChain=function(str,chain){return function recurseChain(values,level){var item=chain[level].regex?chain[level]:{regex:chain[level]};var matches=[];function addMatch(match){if(item.backref){var ERR_UNDEFINED_GROUP="Backreference to undefined group: ".concat(item.backref);var isNamedBackref=isNaN(item.backref);if(isNamedBackref&&XRegExp.isInstalled('namespacing')){// `groups` has `null` as prototype, so using `in` instead of `hasOwnProperty`
	if(!(item.backref in match.groups)){throw new ReferenceError(ERR_UNDEFINED_GROUP);}}else if(!match.hasOwnProperty(item.backref)){throw new ReferenceError(ERR_UNDEFINED_GROUP);}var backrefValue=isNamedBackref&&XRegExp.isInstalled('namespacing')?match.groups[item.backref]:match[item.backref];matches.push(backrefValue||'');}else {matches.push(match[0]);}}var _iterator3=_createForOfIteratorHelper(values),_step3;try{for(_iterator3.s();!(_step3=_iterator3.n()).done;){var value=_step3.value;(0,_forEach["default"])(XRegExp).call(XRegExp,value,item.regex,addMatch);}}catch(err){_iterator3.e(err);}finally{_iterator3.f();}return level===chain.length-1||!matches.length?matches:recurseChain(matches,level+1);}([str],0);};/**
	 * Returns a new string with one or all matches of a pattern replaced. The pattern can be a string
	 * or regex, and the replacement can be a string or a function to be called for each match. To
	 * perform a global search and replace, use the optional `scope` argument or include flag g if using
	 * a regex. Replacement strings can use `${n}` or `$<n>` for named and numbered backreferences.
	 * Replacement functions can use named backreferences via `arguments[0].name`. Also fixes browser
	 * bugs compared to the native `String.prototype.replace` and can be used reliably cross-browser.
	 *
	 * @memberOf XRegExp
	 * @param {String} str String to search.
	 * @param {RegExp|String} search Search pattern to be replaced.
	 * @param {String|Function} replacement Replacement string or a function invoked to create it.
	 *   Replacement strings can include special replacement syntax:
	 *     - $$ - Inserts a literal $ character.
	 *     - $&, $0 - Inserts the matched substring.
	 *     - $` - Inserts the string that precedes the matched substring (left context).
	 *     - $' - Inserts the string that follows the matched substring (right context).
	 *     - $n, $nn - Where n/nn are digits referencing an existent capturing group, inserts
	 *       backreference n/nn.
	 *     - ${n}, $<n> - Where n is a name or any number of digits that reference an existent capturing
	 *       group, inserts backreference n.
	 *   Replacement functions are invoked with three or more arguments:
	 *     - The matched substring (corresponds to $& above). Named backreferences are accessible as
	 *       properties of this first argument.
	 *     - 0..n arguments, one for each backreference (corresponding to $1, $2, etc. above).
	 *     - The zero-based index of the match within the total search string.
	 *     - The total string being searched.
	 * @param {String} [scope='one'] Use 'one' to replace the first match only, or 'all'. If not
	 *   explicitly specified and using a regex with flag g, `scope` is 'all'.
	 * @returns {String} New string with one or all matches replaced.
	 * @example
	 *
	 * // Regex search, using named backreferences in replacement string
	 * const name = XRegExp('(?<first>\\w+) (?<last>\\w+)');
	 * XRegExp.replace('John Smith', name, '$<last>, $<first>');
	 * // -> 'Smith, John'
	 *
	 * // Regex search, using named backreferences in replacement function
	 * XRegExp.replace('John Smith', name, (match) => `${match.last}, ${match.first}`);
	 * // -> 'Smith, John'
	 *
	 * // String search, with replace-all
	 * XRegExp.replace('RegExp builds RegExps', 'RegExp', 'XRegExp', 'all');
	 * // -> 'XRegExp builds XRegExps'
	 */XRegExp.replace=function(str,search,replacement,scope){var isRegex=XRegExp.isRegExp(search);var global=search.global&&scope!=='one'||scope==='all';var cacheKey=(global?'g':'')+(search.sticky?'y':'')||'noGY';var s2=search;if(isRegex){search[REGEX_DATA]=search[REGEX_DATA]||{};// Shares cached copies with `XRegExp.exec`/`match`. Since a copy is used, `search`'s
	// `lastIndex` isn't updated *during* replacement iterations
	s2=search[REGEX_DATA][cacheKey]||(search[REGEX_DATA][cacheKey]=copyRegex(search,{addG:!!global,removeG:scope==='one',isInternalOnly:true}));}else if(global){s2=new RegExp(XRegExp.escape(String(search)),'g');}// Fixed `replace` required for named backreferences, etc.
	var result=fixed.replace.call(toObject(str),s2,replacement);if(isRegex&&search.global){// Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
	search.lastIndex=0;}return result;};/**
	 * Performs batch processing of string replacements. Used like `XRegExp.replace`, but accepts an
	 * array of replacement details. Later replacements operate on the output of earlier replacements.
	 * Replacement details are accepted as an array with a regex or string to search for, the
	 * replacement string or function, and an optional scope of 'one' or 'all'. Uses the XRegExp
	 * replacement text syntax, which supports named backreference properties via `${name}` or
	 * `$<name>`.
	 *
	 * @memberOf XRegExp
	 * @param {String} str String to search.
	 * @param {Array} replacements Array of replacement detail arrays.
	 * @returns {String} New string with all replacements.
	 * @example
	 *
	 * str = XRegExp.replaceEach(str, [
	 *   [XRegExp('(?<name>a)'), 'z${name}'],
	 *   [/b/gi, 'y'],
	 *   [/c/g, 'x', 'one'], // scope 'one' overrides /g
	 *   [/d/, 'w', 'all'],  // scope 'all' overrides lack of /g
	 *   ['e', 'v', 'all'],  // scope 'all' allows replace-all for strings
	 *   [/f/g, ($0) => $0.toUpperCase()]
	 * ]);
	 */XRegExp.replaceEach=function(str,replacements){var _iterator4=_createForOfIteratorHelper(replacements),_step4;try{for(_iterator4.s();!(_step4=_iterator4.n()).done;){var r=_step4.value;str=XRegExp.replace(str,r[0],r[1],r[2]);}}catch(err){_iterator4.e(err);}finally{_iterator4.f();}return str;};/**
	 * Splits a string into an array of strings using a regex or string separator. Matches of the
	 * separator are not included in the result array. However, if `separator` is a regex that contains
	 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
	 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
	 * cross-browser.
	 *
	 * @memberOf XRegExp
	 * @param {String} str String to split.
	 * @param {RegExp|String} separator Regex or string to use for separating the string.
	 * @param {Number} [limit] Maximum number of items to include in the result array.
	 * @returns {Array} Array of substrings.
	 * @example
	 *
	 * // Basic use
	 * XRegExp.split('a b c', ' ');
	 * // -> ['a', 'b', 'c']
	 *
	 * // With limit
	 * XRegExp.split('a b c', ' ', 2);
	 * // -> ['a', 'b']
	 *
	 * // Backreferences in result array
	 * XRegExp.split('..word1..', /([a-z]+)(\d+)/i);
	 * // -> ['..', 'word', '1', '..']
	 */XRegExp.split=function(str,separator,limit){return fixed.split.call(toObject(str),separator,limit);};/**
	 * Executes a regex search in a specified string. Returns `true` or `false`. Optional `pos` and
	 * `sticky` arguments specify the search start position, and whether the match must start at the
	 * specified position only. The `lastIndex` property of the provided regex is not used, but is
	 * updated for compatibility. Also fixes browser bugs compared to the native
	 * `RegExp.prototype.test` and can be used reliably cross-browser.
	 *
	 * @memberOf XRegExp
	 * @param {String} str String to search.
	 * @param {RegExp} regex Regex to search with.
	 * @param {Number} [pos=0] Zero-based index at which to start the search.
	 * @param {Boolean|String} [sticky=false] Whether the match must start at the specified position
	 *   only. The string `'sticky'` is accepted as an alternative to `true`.
	 * @returns {boolean} Whether the regex matched the provided value.
	 * @example
	 *
	 * // Basic use
	 * XRegExp.test('abc', /c/); // -> true
	 *
	 * // With pos and sticky
	 * XRegExp.test('abc', /c/, 0, 'sticky'); // -> false
	 * XRegExp.test('abc', /c/, 2, 'sticky'); // -> true
	 */ // Do this the easy way :-)
	XRegExp.test=function(str,regex,pos,sticky){return !!XRegExp.exec(str,regex,pos,sticky);};/**
	 * Uninstalls optional features according to the specified options. All optional features start out
	 * uninstalled, so this is used to undo the actions of `XRegExp.install`.
	 *
	 * @memberOf XRegExp
	 * @param {Object|String} options Options object or string.
	 * @example
	 *
	 * // With an options object
	 * XRegExp.uninstall({
	 *   // Disables support for astral code points in Unicode addons
	 *   astral: true,
	 *
	 *   // Don't add named capture groups to the `groups` property of matches
	 *   namespacing: true
	 * });
	 *
	 * // With an options string
	 * XRegExp.uninstall('astral namespacing');
	 */XRegExp.uninstall=function(options){options=prepareOptions(options);if(features.astral&&options.astral){setAstral(false);}if(features.namespacing&&options.namespacing){setNamespacing(false);}};/**
	 * Returns an XRegExp object that is the union of the given patterns. Patterns can be provided as
	 * regex objects or strings. Metacharacters are escaped in patterns provided as strings.
	 * Backreferences in provided regex objects are automatically renumbered to work correctly within
	 * the larger combined pattern. Native flags used by provided regexes are ignored in favor of the
	 * `flags` argument.
	 *
	 * @memberOf XRegExp
	 * @param {Array} patterns Regexes and strings to combine.
	 * @param {String} [flags] Any combination of XRegExp flags.
	 * @param {Object} [options] Options object with optional properties:
	 *   - `conjunction` {String} Type of conjunction to use: 'or' (default) or 'none'.
	 * @returns {RegExp} Union of the provided regexes and strings.
	 * @example
	 *
	 * XRegExp.union(['a+b*c', /(dogs)\1/, /(cats)\1/], 'i');
	 * // -> /a\+b\*c|(dogs)\1|(cats)\2/i
	 *
	 * XRegExp.union([/man/, /bear/, /pig/], 'i', {conjunction: 'none'});
	 * // -> /manbearpig/i
	 */XRegExp.union=function(patterns,flags,options){options=options||{};var conjunction=options.conjunction||'or';var numCaptures=0;var numPriorCaptures;var captureNames;function rewrite(match,paren,backref){var name=captureNames[numCaptures-numPriorCaptures];// Capturing group
	if(paren){++numCaptures;// If the current capture has a name, preserve the name
	if(name){return "(?<".concat(name,">");}// Backreference
	}else if(backref){// Rewrite the backreference
	return "\\".concat(+backref+numPriorCaptures);}return match;}if(!(isType(patterns,'Array')&&patterns.length)){throw new TypeError('Must provide a nonempty array of patterns to merge');}var parts=/(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*\]/g;var output=[];var _iterator5=_createForOfIteratorHelper(patterns),_step5;try{for(_iterator5.s();!(_step5=_iterator5.n()).done;){var pattern=_step5.value;if(XRegExp.isRegExp(pattern)){numPriorCaptures=numCaptures;captureNames=pattern[REGEX_DATA]&&pattern[REGEX_DATA].captureNames||[];// Rewrite backreferences. Passing to XRegExp dies on octals and ensures patterns are
	// independently valid; helps keep this simple. Named captures are put back
	output.push(nativ.replace.call(XRegExp(pattern.source).source,parts,rewrite));}else {output.push(XRegExp.escape(pattern));}}}catch(err){_iterator5.e(err);}finally{_iterator5.f();}var separator=conjunction==='none'?'':'|';return XRegExp(output.join(separator),flags);};// ==--------------------------==
	// Fixed/extended native methods
	// ==--------------------------==
	/**
	 * Adds named capture support (with backreferences returned as `result.name`), and fixes browser
	 * bugs in the native `RegExp.prototype.exec`. Use via `XRegExp.exec`.
	 *
	 * @memberOf RegExp
	 * @param {String} str String to search.
	 * @returns {Array} Match array with named backreference properties, or `null`.
	 */fixed.exec=function(str){var origLastIndex=this.lastIndex;var match=nativ.exec.apply(this,arguments);if(match){// Fix browsers whose `exec` methods don't return `undefined` for nonparticipating capturing
	// groups. This fixes IE 5.5-8, but not IE 9's quirks mode or emulation of older IEs. IE 9
	// in standards mode follows the spec.
	if(!correctExecNpcg&&match.length>1&&(0, _includes["default"])(match).call(match,'')){var _context3;var r2=copyRegex(this,{removeG:true,isInternalOnly:true});// Using `str.slice(match.index)` rather than `match[0]` in case lookahead allowed
	// matching due to characters outside the match
	nativ.replace.call((0, _slice["default"])(_context3=String(str)).call(_context3,match.index),r2,function(){var len=arguments.length;// Skip index 0 and the last 2
	for(var i=1;i<len-2;++i){if((i<0||arguments.length<=i?undefined:arguments[i])===undefined){match[i]=undefined;}}});}// Attach named capture properties
	var groupsObject=match;if(XRegExp.isInstalled('namespacing')){// https://tc39.github.io/proposal-regexp-named-groups/#sec-regexpbuiltinexec
	match.groups=(0, _create["default"])(null);groupsObject=match.groups;}if(this[REGEX_DATA]&&this[REGEX_DATA].captureNames){// Skip index 0
	for(var i=1;i<match.length;++i){var name=this[REGEX_DATA].captureNames[i-1];if(name){groupsObject[name]=match[i];}}}// Fix browsers that increment `lastIndex` after zero-length matches
	if(this.global&&!match[0].length&&this.lastIndex>match.index){this.lastIndex=match.index;}}if(!this.global){// Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
	this.lastIndex=origLastIndex;}return match;};/**
	 * Fixes browser bugs in the native `RegExp.prototype.test`.
	 *
	 * @memberOf RegExp
	 * @param {String} str String to search.
	 * @returns {boolean} Whether the regex matched the provided value.
	 */fixed.test=function(str){// Do this the easy way :-)
	return !!fixed.exec.call(this,str);};/**
	 * Adds named capture support (with backreferences returned as `result.name`), and fixes browser
	 * bugs in the native `String.prototype.match`.
	 *
	 * @memberOf String
	 * @param {RegExp|*} regex Regex to search with. If not a regex object, it is passed to `RegExp`.
	 * @returns {Array} If `regex` uses flag g, an array of match strings or `null`. Without flag g,
	 *   the result of calling `regex.exec(this)`.
	 */fixed.match=function(regex){if(!XRegExp.isRegExp(regex)){// Use the native `RegExp` rather than `XRegExp`
	regex=new RegExp(regex);}else if(regex.global){var result=nativ.match.apply(this,arguments);// Fixes IE bug
	regex.lastIndex=0;return result;}return fixed.exec.call(regex,toObject(this));};/**
	 * Adds support for `${n}` (or `$<n>`) tokens for named and numbered backreferences in replacement
	 * text, and provides named backreferences to replacement functions as `arguments[0].name`. Also
	 * fixes browser bugs in replacement text syntax when performing a replacement using a nonregex
	 * search value, and the value of a replacement regex's `lastIndex` property during replacement
	 * iterations and upon completion. Note that this doesn't support SpiderMonkey's proprietary third
	 * (`flags`) argument. Use via `XRegExp.replace`.
	 *
	 * @memberOf String
	 * @param {RegExp|String} search Search pattern to be replaced.
	 * @param {String|Function} replacement Replacement string or a function invoked to create it.
	 * @returns {string} New string with one or all matches replaced.
	 */fixed.replace=function(search,replacement){var isRegex=XRegExp.isRegExp(search);var origLastIndex;var captureNames;var result;if(isRegex){if(search[REGEX_DATA]){captureNames=search[REGEX_DATA].captureNames;}// Only needed if `search` is nonglobal
	origLastIndex=search.lastIndex;}else {search+='';// Type-convert
	}// Don't use `typeof`; some older browsers return 'function' for regex objects
	if(isType(replacement,'Function')){// Stringifying `this` fixes a bug in IE < 9 where the last argument in replacement
	// functions isn't type-converted to a string
	result=nativ.replace.call(String(this),search,function(){for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}if(captureNames){var groupsObject;if(XRegExp.isInstalled('namespacing')){// https://tc39.github.io/proposal-regexp-named-groups/#sec-regexpbuiltinexec
	groupsObject=(0, _create["default"])(null);args.push(groupsObject);}else {// Change the `args[0]` string primitive to a `String` object that can store
	// properties. This really does need to use `String` as a constructor
	args[0]=new String(args[0]);groupsObject=args[0];}// Store named backreferences
	for(var i=0;i<captureNames.length;++i){if(captureNames[i]){groupsObject[captureNames[i]]=args[i+1];}}}// ES6 specs the context for replacement functions as `undefined`
	return replacement.apply(void 0,args);});}else {// Ensure that the last value of `args` will be a string when given nonstring `this`,
	// while still throwing on null or undefined context
	result=nativ.replace.call(this==null?this:String(this),search,function(){for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}return nativ.replace.call(String(replacement),replacementToken,replacer);function replacer($0,bracketed,angled,dollarToken){bracketed=bracketed||angled;// Named or numbered backreference with curly or angled braces
	if(bracketed){// XRegExp behavior for `${n}` or `$<n>`:
	// 1. Backreference to numbered capture, if `n` is an integer. Use `0` for the
	//    entire match. Any number of leading zeros may be used.
	// 2. Backreference to named capture `n`, if it exists and is not an integer
	//    overridden by numbered capture. In practice, this does not overlap with
	//    numbered capture since XRegExp does not allow named capture to use a bare
	//    integer as the name.
	// 3. If the name or number does not refer to an existing capturing group, it's
	//    an error.
	var n=+bracketed;// Type-convert; drop leading zeros
	if(n<=args.length-3){return args[n]||'';}// Groups with the same name is an error, else would need `lastIndexOf`
	n=captureNames?(0, _indexOf["default"])(captureNames).call(captureNames,bracketed):-1;if(n<0){throw new SyntaxError("Backreference to undefined group ".concat($0));}return args[n+1]||'';}// Else, special variable or numbered backreference without curly braces
	if(dollarToken==='$'){// $$
	return '$';}if(dollarToken==='&'||+dollarToken===0){// $&, $0 (not followed by 1-9), $00
	return args[0];}if(dollarToken==='`'){var _context4;// $` (left context)
	return (0, _slice["default"])(_context4=args[args.length-1]).call(_context4,0,args[args.length-2]);}if(dollarToken==="'"){var _context5;// $' (right context)
	return (0, _slice["default"])(_context5=args[args.length-1]).call(_context5,args[args.length-2]+args[0].length);}// Else, numbered backreference without braces
	dollarToken=+dollarToken;// Type-convert; drop leading zero
	// XRegExp behavior for `$n` and `$nn`:
	// - Backrefs end after 1 or 2 digits. Use `${..}` or `$<..>` for more digits.
	// - `$1` is an error if no capturing groups.
	// - `$10` is an error if less than 10 capturing groups. Use `${1}0` or `$<1>0`
	//   instead.
	// - `$01` is `$1` if at least one capturing group, else it's an error.
	// - `$0` (not followed by 1-9) and `$00` are the entire match.
	// Native behavior, for comparison:
	// - Backrefs end after 1 or 2 digits. Cannot reference capturing group 100+.
	// - `$1` is a literal `$1` if no capturing groups.
	// - `$10` is `$1` followed by a literal `0` if less than 10 capturing groups.
	// - `$01` is `$1` if at least one capturing group, else it's a literal `$01`.
	// - `$0` is a literal `$0`.
	if(!isNaN(dollarToken)){if(dollarToken>args.length-3){throw new SyntaxError("Backreference to undefined group ".concat($0));}return args[dollarToken]||'';}// `$` followed by an unsupported char is an error, unlike native JS
	throw new SyntaxError("Invalid token ".concat($0));}});}if(isRegex){if(search.global){// Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
	search.lastIndex=0;}else {// Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
	search.lastIndex=origLastIndex;}}return result;};/**
	 * Fixes browser bugs in the native `String.prototype.split`. Use via `XRegExp.split`.
	 *
	 * @memberOf String
	 * @param {RegExp|String} separator Regex or string to use for separating the string.
	 * @param {Number} [limit] Maximum number of items to include in the result array.
	 * @returns {!Array} Array of substrings.
	 */fixed.split=function(separator,limit){if(!XRegExp.isRegExp(separator)){// Browsers handle nonregex split correctly, so use the faster native method
	return nativ.split.apply(this,arguments);}var str=String(this);var output=[];var origLastIndex=separator.lastIndex;var lastLastIndex=0;var lastLength;// Values for `limit`, per the spec:
	// If undefined: pow(2,32) - 1
	// If 0, Infinity, or NaN: 0
	// If positive number: limit = floor(limit); if (limit >= pow(2,32)) limit -= pow(2,32);
	// If negative number: pow(2,32) - floor(abs(limit))
	// If other: Type-convert, then use the above rules
	// This line fails in very strange ways for some values of `limit` in Opera 10.5-10.63, unless
	// Opera Dragonfly is open (go figure). It works in at least Opera 9.5-10.1 and 11+
	limit=(limit===undefined?-1:limit)>>>0;(0, _forEach["default"])(XRegExp).call(XRegExp,str,separator,function(match){// This condition is not the same as `if (match[0].length)`
	if(match.index+match[0].length>lastLastIndex){output.push((0, _slice["default"])(str).call(str,lastLastIndex,match.index));if(match.length>1&&match.index<str.length){Array.prototype.push.apply(output,(0, _slice["default"])(match).call(match,1));}lastLength=match[0].length;lastLastIndex=match.index+lastLength;}});if(lastLastIndex===str.length){if(!nativ.test.call(separator,'')||lastLength){output.push('');}}else {output.push((0, _slice["default"])(str).call(str,lastLastIndex));}separator.lastIndex=origLastIndex;return output.length>limit?(0, _slice["default"])(output).call(output,0,limit):output;};// ==--------------------------==
	// Built-in syntax/flag tokens
	// ==--------------------------==
	/*
	 * Letter escapes that natively match literal characters: `\a`, `\A`, etc. These should be
	 * SyntaxErrors but are allowed in web reality. XRegExp makes them errors for cross-browser
	 * consistency and to reserve their syntax, but lets them be superseded by addons.
	 */XRegExp.addToken(/\\([ABCE-RTUVXYZaeg-mopqyz]|c(?![A-Za-z])|u(?![\dA-Fa-f]{4}|{[\dA-Fa-f]+})|x(?![\dA-Fa-f]{2}))/,function(match,scope){// \B is allowed in default scope only
	if(match[1]==='B'&&scope===defaultScope){return match[0];}throw new SyntaxError("Invalid escape ".concat(match[0]));},{scope:'all',leadChar:'\\'});/*
	 * Unicode code point escape with curly braces: `\u{N..}`. `N..` is any one or more digit
	 * hexadecimal number from 0-10FFFF, and can include leading zeros. Requires the native ES6 `u` flag
	 * to support code points greater than U+FFFF. Avoids converting code points above U+FFFF to
	 * surrogate pairs (which could be done without flag `u`), since that could lead to broken behavior
	 * if you follow a `\u{N..}` token that references a code point above U+FFFF with a quantifier, or
	 * if you use the same in a character class.
	 */XRegExp.addToken(/\\u{([\dA-Fa-f]+)}/,function(match,scope,flags){var code=dec(match[1]);if(code>0x10FFFF){throw new SyntaxError("Invalid Unicode code point ".concat(match[0]));}if(code<=0xFFFF){// Converting to \uNNNN avoids needing to escape the literal character and keep it
	// separate from preceding tokens
	return "\\u".concat(pad4(hex(code)));}// If `code` is between 0xFFFF and 0x10FFFF, require and defer to native handling
	if(hasNativeU&&(0, _includes["default"])(flags).call(flags,'u')){return match[0];}throw new SyntaxError("Cannot use Unicode code point above \\u{FFFF} without flag u");},{scope:'all',leadChar:'\\'});/*
	 * Empty character class: `[]` or `[^]`. This fixes a critical cross-browser syntax inconsistency.
	 * Unless this is standardized (per the ES spec), regex syntax can't be accurately parsed because
	 * character class endings can't be determined.
	 */XRegExp.addToken(/\[(\^?)\]/,// For cross-browser compatibility with ES3, convert [] to \b\B and [^] to [\s\S].
	// (?!) should work like \b\B, but is unreliable in some versions of Firefox
	/* eslint-disable no-confusing-arrow */function(match){return match[1]?'[\\s\\S]':'\\b\\B';},/* eslint-enable no-confusing-arrow */{leadChar:'['});/*
	 * Comment pattern: `(?# )`. Inline comments are an alternative to the line comments allowed in
	 * free-spacing mode (flag x).
	 */XRegExp.addToken(/\(\?#[^)]*\)/,getContextualTokenSeparator,{leadChar:'('});/*
	 * Whitespace and line comments, in free-spacing mode (aka extended mode, flag x) only.
	 */XRegExp.addToken(/\s+|#[^\n]*\n?/,getContextualTokenSeparator,{flag:'x'});/*
	 * Dot, in dotall mode (aka singleline mode, flag s) only.
	 */XRegExp.addToken(/\./,function(){return '[\\s\\S]';},{flag:'s',leadChar:'.'});/*
	 * Named backreference: `\k<name>`. Backreference names can use the characters A-Z, a-z, 0-9, _,
	 * and $ only. Also allows numbered backreferences as `\k<n>`.
	 */XRegExp.addToken(/\\k<([\w$]+)>/,function(match){var _context6,_context7;// Groups with the same name is an error, else would need `lastIndexOf`
	var index=isNaN(match[1])?(0, _indexOf["default"])(_context6=this.captureNames).call(_context6,match[1])+1:+match[1];var endIndex=match.index+match[0].length;if(!index||index>this.captureNames.length){throw new SyntaxError("Backreference to undefined group ".concat(match[0]));}// Keep backreferences separate from subsequent literal numbers. This avoids e.g.
	// inadvertedly changing `(?<n>)\k<n>1` to `()\11`.
	return (0, _concat["default"])(_context7="\\".concat(index)).call(_context7,endIndex===match.input.length||isNaN(match.input[endIndex])?'':'(?:)');},{leadChar:'\\'});/*
	 * Numbered backreference or octal, plus any following digits: `\0`, `\11`, etc. Octals except `\0`
	 * not followed by 0-9 and backreferences to unopened capture groups throw an error. Other matches
	 * are returned unaltered. IE < 9 doesn't support backreferences above `\99` in regex syntax.
	 */XRegExp.addToken(/\\(\d+)/,function(match,scope){if(!(scope===defaultScope&&/^[1-9]/.test(match[1])&&+match[1]<=this.captureNames.length)&&match[1]!=='0'){throw new SyntaxError("Cannot use octal escape or backreference to undefined group ".concat(match[0]));}return match[0];},{scope:'all',leadChar:'\\'});/*
	 * Named capturing group; match the opening delimiter only: `(?<name>`. Capture names can use the
	 * characters A-Z, a-z, 0-9, _, and $ only. Names can't be integers. Supports Python-style
	 * `(?P<name>` as an alternate syntax to avoid issues in some older versions of Opera which natively
	 * supported the Python-style syntax. Otherwise, XRegExp might treat numbered backreferences to
	 * Python-style named capture as octals.
	 */XRegExp.addToken(/\(\?P?<([\w$]+)>/,function(match){var _context8;// Disallow bare integers as names because named backreferences are added to match arrays
	// and therefore numeric properties may lead to incorrect lookups
	if(!isNaN(match[1])){throw new SyntaxError("Cannot use integer as capture name ".concat(match[0]));}if(!XRegExp.isInstalled('namespacing')&&(match[1]==='length'||match[1]==='__proto__')){throw new SyntaxError("Cannot use reserved word as capture name ".concat(match[0]));}if((0, _includes["default"])(_context8=this.captureNames).call(_context8,match[1])){throw new SyntaxError("Cannot use same name for multiple groups ".concat(match[0]));}this.captureNames.push(match[1]);this.hasNamedCapture=true;return '(';},{leadChar:'('});/*
	 * Capturing group; match the opening parenthesis only. Required for support of named capturing
	 * groups. Also adds explicit capture mode (flag n).
	 */XRegExp.addToken(/\((?!\?)/,function(match,scope,flags){if((0, _includes["default"])(flags).call(flags,'n')){return '(?:';}this.captureNames.push(null);return '(';},{optionalFlags:'n',leadChar:'('});var _default=XRegExp;exports["default"]=_default;module.exports=exports["default"];},{"@babel/runtime-corejs3/core-js-stable/array/from":2,"@babel/runtime-corejs3/core-js-stable/array/is-array":3,"@babel/runtime-corejs3/core-js-stable/instance/concat":4,"@babel/runtime-corejs3/core-js-stable/instance/flags":5,"@babel/runtime-corejs3/core-js-stable/instance/for-each":6,"@babel/runtime-corejs3/core-js-stable/instance/includes":7,"@babel/runtime-corejs3/core-js-stable/instance/index-of":8,"@babel/runtime-corejs3/core-js-stable/instance/slice":11,"@babel/runtime-corejs3/core-js-stable/instance/sort":12,"@babel/runtime-corejs3/core-js-stable/object/create":13,"@babel/runtime-corejs3/core-js-stable/object/define-property":14,"@babel/runtime-corejs3/core-js-stable/parse-int":15,"@babel/runtime-corejs3/core-js-stable/symbol":16,"@babel/runtime-corejs3/core-js/get-iterator":20,"@babel/runtime-corejs3/core-js/get-iterator-method":19,"@babel/runtime-corejs3/helpers/interopRequireDefault":25,"@babel/runtime-corejs3/helpers/slicedToArray":28}],267:[function(require,module,exports){module.exports=[{'name':'InAdlam','astral':"\uD83A[\uDD00-\uDD5F]"},{'name':'InAegean_Numbers','astral':"\uD800[\uDD00-\uDD3F]"},{'name':'InAhom','astral':"\uD805[\uDF00-\uDF3F]"},{'name':'InAlchemical_Symbols','astral':"\uD83D[\uDF00-\uDF7F]"},{'name':'InAlphabetic_Presentation_Forms','bmp':"\uFB00-\uFB4F"},{'name':'InAnatolian_Hieroglyphs','astral':"\uD811[\uDC00-\uDE7F]"},{'name':'InAncient_Greek_Musical_Notation','astral':"\uD834[\uDE00-\uDE4F]"},{'name':'InAncient_Greek_Numbers','astral':"\uD800[\uDD40-\uDD8F]"},{'name':'InAncient_Symbols','astral':"\uD800[\uDD90-\uDDCF]"},{'name':'InArabic','bmp':"\u0600-\u06FF"},{'name':'InArabic_Extended_A','bmp':"\u08A0-\u08FF"},{'name':'InArabic_Mathematical_Alphabetic_Symbols','astral':"\uD83B[\uDE00-\uDEFF]"},{'name':'InArabic_Presentation_Forms_A','bmp':"\uFB50-\uFDFF"},{'name':'InArabic_Presentation_Forms_B','bmp':"\uFE70-\uFEFF"},{'name':'InArabic_Supplement','bmp':"\u0750-\u077F"},{'name':'InArmenian','bmp':"\u0530-\u058F"},{'name':'InArrows','bmp':"\u2190-\u21FF"},{'name':'InAvestan','astral':"\uD802[\uDF00-\uDF3F]"},{'name':'InBalinese','bmp':"\u1B00-\u1B7F"},{'name':'InBamum','bmp':"\uA6A0-\uA6FF"},{'name':'InBamum_Supplement','astral':"\uD81A[\uDC00-\uDE3F]"},{'name':'InBasic_Latin','bmp':'\0-\x7F'},{'name':'InBassa_Vah','astral':"\uD81A[\uDED0-\uDEFF]"},{'name':'InBatak','bmp':"\u1BC0-\u1BFF"},{'name':'InBengali','bmp':"\u0980-\u09FF"},{'name':'InBhaiksuki','astral':"\uD807[\uDC00-\uDC6F]"},{'name':'InBlock_Elements','bmp':"\u2580-\u259F"},{'name':'InBopomofo','bmp':"\u3100-\u312F"},{'name':'InBopomofo_Extended','bmp':"\u31A0-\u31BF"},{'name':'InBox_Drawing','bmp':"\u2500-\u257F"},{'name':'InBrahmi','astral':"\uD804[\uDC00-\uDC7F]"},{'name':'InBraille_Patterns','bmp':"\u2800-\u28FF"},{'name':'InBuginese','bmp':"\u1A00-\u1A1F"},{'name':'InBuhid','bmp':"\u1740-\u175F"},{'name':'InByzantine_Musical_Symbols','astral':"\uD834[\uDC00-\uDCFF]"},{'name':'InCJK_Compatibility','bmp':"\u3300-\u33FF"},{'name':'InCJK_Compatibility_Forms','bmp':"\uFE30-\uFE4F"},{'name':'InCJK_Compatibility_Ideographs','bmp':"\uF900-\uFAFF"},{'name':'InCJK_Compatibility_Ideographs_Supplement','astral':"\uD87E[\uDC00-\uDE1F]"},{'name':'InCJK_Radicals_Supplement','bmp':"\u2E80-\u2EFF"},{'name':'InCJK_Strokes','bmp':"\u31C0-\u31EF"},{'name':'InCJK_Symbols_And_Punctuation','bmp':"\u3000-\u303F"},{'name':'InCJK_Unified_Ideographs','bmp':"\u4E00-\u9FFF"},{'name':'InCJK_Unified_Ideographs_Extension_A','bmp':"\u3400-\u4DBF"},{'name':'InCJK_Unified_Ideographs_Extension_B','astral':"[\uD840-\uD868][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDF]"},{'name':'InCJK_Unified_Ideographs_Extension_C','astral':"\uD869[\uDF00-\uDFFF]|[\uD86A-\uD86C][\uDC00-\uDFFF]|\uD86D[\uDC00-\uDF3F]"},{'name':'InCJK_Unified_Ideographs_Extension_D','astral':"\uD86D[\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1F]"},{'name':'InCJK_Unified_Ideographs_Extension_E','astral':"\uD86E[\uDC20-\uDFFF]|[\uD86F-\uD872][\uDC00-\uDFFF]|\uD873[\uDC00-\uDEAF]"},{'name':'InCJK_Unified_Ideographs_Extension_F','astral':"\uD873[\uDEB0-\uDFFF]|[\uD874-\uD879][\uDC00-\uDFFF]|\uD87A[\uDC00-\uDFEF]"},{'name':'InCarian','astral':"\uD800[\uDEA0-\uDEDF]"},{'name':'InCaucasian_Albanian','astral':"\uD801[\uDD30-\uDD6F]"},{'name':'InChakma','astral':"\uD804[\uDD00-\uDD4F]"},{'name':'InCham','bmp':"\uAA00-\uAA5F"},{'name':'InCherokee','bmp':"\u13A0-\u13FF"},{'name':'InCherokee_Supplement','bmp':"\uAB70-\uABBF"},{'name':'InChess_Symbols','astral':"\uD83E[\uDE00-\uDE6F]"},{'name':'InCombining_Diacritical_Marks','bmp':"\u0300-\u036F"},{'name':'InCombining_Diacritical_Marks_Extended','bmp':"\u1AB0-\u1AFF"},{'name':'InCombining_Diacritical_Marks_For_Symbols','bmp':"\u20D0-\u20FF"},{'name':'InCombining_Diacritical_Marks_Supplement','bmp':"\u1DC0-\u1DFF"},{'name':'InCombining_Half_Marks','bmp':"\uFE20-\uFE2F"},{'name':'InCommon_Indic_Number_Forms','bmp':"\uA830-\uA83F"},{'name':'InControl_Pictures','bmp':"\u2400-\u243F"},{'name':'InCoptic','bmp':"\u2C80-\u2CFF"},{'name':'InCoptic_Epact_Numbers','astral':"\uD800[\uDEE0-\uDEFF]"},{'name':'InCounting_Rod_Numerals','astral':"\uD834[\uDF60-\uDF7F]"},{'name':'InCuneiform','astral':"\uD808[\uDC00-\uDFFF]"},{'name':'InCuneiform_Numbers_And_Punctuation','astral':"\uD809[\uDC00-\uDC7F]"},{'name':'InCurrency_Symbols','bmp':"\u20A0-\u20CF"},{'name':'InCypriot_Syllabary','astral':"\uD802[\uDC00-\uDC3F]"},{'name':'InCyrillic','bmp':"\u0400-\u04FF"},{'name':'InCyrillic_Extended_A','bmp':"\u2DE0-\u2DFF"},{'name':'InCyrillic_Extended_B','bmp':"\uA640-\uA69F"},{'name':'InCyrillic_Extended_C','bmp':"\u1C80-\u1C8F"},{'name':'InCyrillic_Supplement','bmp':"\u0500-\u052F"},{'name':'InDeseret','astral':"\uD801[\uDC00-\uDC4F]"},{'name':'InDevanagari','bmp':"\u0900-\u097F"},{'name':'InDevanagari_Extended','bmp':"\uA8E0-\uA8FF"},{'name':'InDingbats','bmp':"\u2700-\u27BF"},{'name':'InDogra','astral':"\uD806[\uDC00-\uDC4F]"},{'name':'InDomino_Tiles','astral':"\uD83C[\uDC30-\uDC9F]"},{'name':'InDuployan','astral':"\uD82F[\uDC00-\uDC9F]"},{'name':'InEarly_Dynastic_Cuneiform','astral':"\uD809[\uDC80-\uDD4F]"},{'name':'InEgyptian_Hieroglyphs','astral':"\uD80C[\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F]"},{'name':'InElbasan','astral':"\uD801[\uDD00-\uDD2F]"},{'name':'InEmoticons','astral':"\uD83D[\uDE00-\uDE4F]"},{'name':'InEnclosed_Alphanumeric_Supplement','astral':"\uD83C[\uDD00-\uDDFF]"},{'name':'InEnclosed_Alphanumerics','bmp':"\u2460-\u24FF"},{'name':'InEnclosed_CJK_Letters_And_Months','bmp':"\u3200-\u32FF"},{'name':'InEnclosed_Ideographic_Supplement','astral':"\uD83C[\uDE00-\uDEFF]"},{'name':'InEthiopic','bmp':"\u1200-\u137F"},{'name':'InEthiopic_Extended','bmp':"\u2D80-\u2DDF"},{'name':'InEthiopic_Extended_A','bmp':"\uAB00-\uAB2F"},{'name':'InEthiopic_Supplement','bmp':"\u1380-\u139F"},{'name':'InGeneral_Punctuation','bmp':"\u2000-\u206F"},{'name':'InGeometric_Shapes','bmp':"\u25A0-\u25FF"},{'name':'InGeometric_Shapes_Extended','astral':"\uD83D[\uDF80-\uDFFF]"},{'name':'InGeorgian','bmp':"\u10A0-\u10FF"},{'name':'InGeorgian_Extended','bmp':"\u1C90-\u1CBF"},{'name':'InGeorgian_Supplement','bmp':"\u2D00-\u2D2F"},{'name':'InGlagolitic','bmp':"\u2C00-\u2C5F"},{'name':'InGlagolitic_Supplement','astral':"\uD838[\uDC00-\uDC2F]"},{'name':'InGothic','astral':"\uD800[\uDF30-\uDF4F]"},{'name':'InGrantha','astral':"\uD804[\uDF00-\uDF7F]"},{'name':'InGreek_And_Coptic','bmp':"\u0370-\u03FF"},{'name':'InGreek_Extended','bmp':"\u1F00-\u1FFF"},{'name':'InGujarati','bmp':"\u0A80-\u0AFF"},{'name':'InGunjala_Gondi','astral':"\uD807[\uDD60-\uDDAF]"},{'name':'InGurmukhi','bmp':"\u0A00-\u0A7F"},{'name':'InHalfwidth_And_Fullwidth_Forms','bmp':"\uFF00-\uFFEF"},{'name':'InHangul_Compatibility_Jamo','bmp':"\u3130-\u318F"},{'name':'InHangul_Jamo','bmp':"\u1100-\u11FF"},{'name':'InHangul_Jamo_Extended_A','bmp':"\uA960-\uA97F"},{'name':'InHangul_Jamo_Extended_B','bmp':"\uD7B0-\uD7FF"},{'name':'InHangul_Syllables','bmp':"\uAC00-\uD7AF"},{'name':'InHanifi_Rohingya','astral':"\uD803[\uDD00-\uDD3F]"},{'name':'InHanunoo','bmp':"\u1720-\u173F"},{'name':'InHatran','astral':"\uD802[\uDCE0-\uDCFF]"},{'name':'InHebrew','bmp':"\u0590-\u05FF"},{'name':'InHigh_Private_Use_Surrogates','bmp':"\uDB80-\uDBFF"},{'name':'InHigh_Surrogates','bmp':"\uD800-\uDB7F"},{'name':'InHiragana','bmp':"\u3040-\u309F"},{'name':'InIPA_Extensions','bmp':"\u0250-\u02AF"},{'name':'InIdeographic_Description_Characters','bmp':"\u2FF0-\u2FFF"},{'name':'InIdeographic_Symbols_And_Punctuation','astral':"\uD81B[\uDFE0-\uDFFF]"},{'name':'InImperial_Aramaic','astral':"\uD802[\uDC40-\uDC5F]"},{'name':'InIndic_Siyaq_Numbers','astral':"\uD83B[\uDC70-\uDCBF]"},{'name':'InInscriptional_Pahlavi','astral':"\uD802[\uDF60-\uDF7F]"},{'name':'InInscriptional_Parthian','astral':"\uD802[\uDF40-\uDF5F]"},{'name':'InJavanese','bmp':"\uA980-\uA9DF"},{'name':'InKaithi','astral':"\uD804[\uDC80-\uDCCF]"},{'name':'InKana_Extended_A','astral':"\uD82C[\uDD00-\uDD2F]"},{'name':'InKana_Supplement','astral':"\uD82C[\uDC00-\uDCFF]"},{'name':'InKanbun','bmp':"\u3190-\u319F"},{'name':'InKangxi_Radicals','bmp':"\u2F00-\u2FDF"},{'name':'InKannada','bmp':"\u0C80-\u0CFF"},{'name':'InKatakana','bmp':"\u30A0-\u30FF"},{'name':'InKatakana_Phonetic_Extensions','bmp':"\u31F0-\u31FF"},{'name':'InKayah_Li','bmp':"\uA900-\uA92F"},{'name':'InKharoshthi','astral':"\uD802[\uDE00-\uDE5F]"},{'name':'InKhmer','bmp':"\u1780-\u17FF"},{'name':'InKhmer_Symbols','bmp':"\u19E0-\u19FF"},{'name':'InKhojki','astral':"\uD804[\uDE00-\uDE4F]"},{'name':'InKhudawadi','astral':"\uD804[\uDEB0-\uDEFF]"},{'name':'InLao','bmp':"\u0E80-\u0EFF"},{'name':'InLatin_1_Supplement','bmp':'\x80-\xFF'},{'name':'InLatin_Extended_A','bmp':"\u0100-\u017F"},{'name':'InLatin_Extended_Additional','bmp':"\u1E00-\u1EFF"},{'name':'InLatin_Extended_B','bmp':"\u0180-\u024F"},{'name':'InLatin_Extended_C','bmp':"\u2C60-\u2C7F"},{'name':'InLatin_Extended_D','bmp':"\uA720-\uA7FF"},{'name':'InLatin_Extended_E','bmp':"\uAB30-\uAB6F"},{'name':'InLepcha','bmp':"\u1C00-\u1C4F"},{'name':'InLetterlike_Symbols','bmp':"\u2100-\u214F"},{'name':'InLimbu','bmp':"\u1900-\u194F"},{'name':'InLinear_A','astral':"\uD801[\uDE00-\uDF7F]"},{'name':'InLinear_B_Ideograms','astral':"\uD800[\uDC80-\uDCFF]"},{'name':'InLinear_B_Syllabary','astral':"\uD800[\uDC00-\uDC7F]"},{'name':'InLisu','bmp':"\uA4D0-\uA4FF"},{'name':'InLow_Surrogates','bmp':"\uDC00-\uDFFF"},{'name':'InLycian','astral':"\uD800[\uDE80-\uDE9F]"},{'name':'InLydian','astral':"\uD802[\uDD20-\uDD3F]"},{'name':'InMahajani','astral':"\uD804[\uDD50-\uDD7F]"},{'name':'InMahjong_Tiles','astral':"\uD83C[\uDC00-\uDC2F]"},{'name':'InMakasar','astral':"\uD807[\uDEE0-\uDEFF]"},{'name':'InMalayalam','bmp':"\u0D00-\u0D7F"},{'name':'InMandaic','bmp':"\u0840-\u085F"},{'name':'InManichaean','astral':"\uD802[\uDEC0-\uDEFF]"},{'name':'InMarchen','astral':"\uD807[\uDC70-\uDCBF]"},{'name':'InMasaram_Gondi','astral':"\uD807[\uDD00-\uDD5F]"},{'name':'InMathematical_Alphanumeric_Symbols','astral':"\uD835[\uDC00-\uDFFF]"},{'name':'InMathematical_Operators','bmp':"\u2200-\u22FF"},{'name':'InMayan_Numerals','astral':"\uD834[\uDEE0-\uDEFF]"},{'name':'InMedefaidrin','astral':"\uD81B[\uDE40-\uDE9F]"},{'name':'InMeetei_Mayek','bmp':"\uABC0-\uABFF"},{'name':'InMeetei_Mayek_Extensions','bmp':"\uAAE0-\uAAFF"},{'name':'InMende_Kikakui','astral':"\uD83A[\uDC00-\uDCDF]"},{'name':'InMeroitic_Cursive','astral':"\uD802[\uDDA0-\uDDFF]"},{'name':'InMeroitic_Hieroglyphs','astral':"\uD802[\uDD80-\uDD9F]"},{'name':'InMiao','astral':"\uD81B[\uDF00-\uDF9F]"},{'name':'InMiscellaneous_Mathematical_Symbols_A','bmp':"\u27C0-\u27EF"},{'name':'InMiscellaneous_Mathematical_Symbols_B','bmp':"\u2980-\u29FF"},{'name':'InMiscellaneous_Symbols','bmp':"\u2600-\u26FF"},{'name':'InMiscellaneous_Symbols_And_Arrows','bmp':"\u2B00-\u2BFF"},{'name':'InMiscellaneous_Symbols_And_Pictographs','astral':"\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]"},{'name':'InMiscellaneous_Technical','bmp':"\u2300-\u23FF"},{'name':'InModi','astral':"\uD805[\uDE00-\uDE5F]"},{'name':'InModifier_Tone_Letters','bmp':"\uA700-\uA71F"},{'name':'InMongolian','bmp':"\u1800-\u18AF"},{'name':'InMongolian_Supplement','astral':"\uD805[\uDE60-\uDE7F]"},{'name':'InMro','astral':"\uD81A[\uDE40-\uDE6F]"},{'name':'InMultani','astral':"\uD804[\uDE80-\uDEAF]"},{'name':'InMusical_Symbols','astral':"\uD834[\uDD00-\uDDFF]"},{'name':'InMyanmar','bmp':"\u1000-\u109F"},{'name':'InMyanmar_Extended_A','bmp':"\uAA60-\uAA7F"},{'name':'InMyanmar_Extended_B','bmp':"\uA9E0-\uA9FF"},{'name':'InNKo','bmp':"\u07C0-\u07FF"},{'name':'InNabataean','astral':"\uD802[\uDC80-\uDCAF]"},{'name':'InNew_Tai_Lue','bmp':"\u1980-\u19DF"},{'name':'InNewa','astral':"\uD805[\uDC00-\uDC7F]"},{'name':'InNumber_Forms','bmp':"\u2150-\u218F"},{'name':'InNushu','astral':"\uD82C[\uDD70-\uDEFF]"},{'name':'InOgham','bmp':"\u1680-\u169F"},{'name':'InOl_Chiki','bmp':"\u1C50-\u1C7F"},{'name':'InOld_Hungarian','astral':"\uD803[\uDC80-\uDCFF]"},{'name':'InOld_Italic','astral':"\uD800[\uDF00-\uDF2F]"},{'name':'InOld_North_Arabian','astral':"\uD802[\uDE80-\uDE9F]"},{'name':'InOld_Permic','astral':"\uD800[\uDF50-\uDF7F]"},{'name':'InOld_Persian','astral':"\uD800[\uDFA0-\uDFDF]"},{'name':'InOld_Sogdian','astral':"\uD803[\uDF00-\uDF2F]"},{'name':'InOld_South_Arabian','astral':"\uD802[\uDE60-\uDE7F]"},{'name':'InOld_Turkic','astral':"\uD803[\uDC00-\uDC4F]"},{'name':'InOptical_Character_Recognition','bmp':"\u2440-\u245F"},{'name':'InOriya','bmp':"\u0B00-\u0B7F"},{'name':'InOrnamental_Dingbats','astral':"\uD83D[\uDE50-\uDE7F]"},{'name':'InOsage','astral':"\uD801[\uDCB0-\uDCFF]"},{'name':'InOsmanya','astral':"\uD801[\uDC80-\uDCAF]"},{'name':'InPahawh_Hmong','astral':"\uD81A[\uDF00-\uDF8F]"},{'name':'InPalmyrene','astral':"\uD802[\uDC60-\uDC7F]"},{'name':'InPau_Cin_Hau','astral':"\uD806[\uDEC0-\uDEFF]"},{'name':'InPhags_Pa','bmp':"\uA840-\uA87F"},{'name':'InPhaistos_Disc','astral':"\uD800[\uDDD0-\uDDFF]"},{'name':'InPhoenician','astral':"\uD802[\uDD00-\uDD1F]"},{'name':'InPhonetic_Extensions','bmp':"\u1D00-\u1D7F"},{'name':'InPhonetic_Extensions_Supplement','bmp':"\u1D80-\u1DBF"},{'name':'InPlaying_Cards','astral':"\uD83C[\uDCA0-\uDCFF]"},{'name':'InPrivate_Use_Area','bmp':"\uE000-\uF8FF"},{'name':'InPsalter_Pahlavi','astral':"\uD802[\uDF80-\uDFAF]"},{'name':'InRejang','bmp':"\uA930-\uA95F"},{'name':'InRumi_Numeral_Symbols','astral':"\uD803[\uDE60-\uDE7F]"},{'name':'InRunic','bmp':"\u16A0-\u16FF"},{'name':'InSamaritan','bmp':"\u0800-\u083F"},{'name':'InSaurashtra','bmp':"\uA880-\uA8DF"},{'name':'InSharada','astral':"\uD804[\uDD80-\uDDDF]"},{'name':'InShavian','astral':"\uD801[\uDC50-\uDC7F]"},{'name':'InShorthand_Format_Controls','astral':"\uD82F[\uDCA0-\uDCAF]"},{'name':'InSiddham','astral':"\uD805[\uDD80-\uDDFF]"},{'name':'InSinhala','bmp':"\u0D80-\u0DFF"},{'name':'InSinhala_Archaic_Numbers','astral':"\uD804[\uDDE0-\uDDFF]"},{'name':'InSmall_Form_Variants','bmp':"\uFE50-\uFE6F"},{'name':'InSogdian','astral':"\uD803[\uDF30-\uDF6F]"},{'name':'InSora_Sompeng','astral':"\uD804[\uDCD0-\uDCFF]"},{'name':'InSoyombo','astral':"\uD806[\uDE50-\uDEAF]"},{'name':'InSpacing_Modifier_Letters','bmp':"\u02B0-\u02FF"},{'name':'InSpecials','bmp':"\uFFF0-\uFFFF"},{'name':'InSundanese','bmp':"\u1B80-\u1BBF"},{'name':'InSundanese_Supplement','bmp':"\u1CC0-\u1CCF"},{'name':'InSuperscripts_And_Subscripts','bmp':"\u2070-\u209F"},{'name':'InSupplemental_Arrows_A','bmp':"\u27F0-\u27FF"},{'name':'InSupplemental_Arrows_B','bmp':"\u2900-\u297F"},{'name':'InSupplemental_Arrows_C','astral':"\uD83E[\uDC00-\uDCFF]"},{'name':'InSupplemental_Mathematical_Operators','bmp':"\u2A00-\u2AFF"},{'name':'InSupplemental_Punctuation','bmp':"\u2E00-\u2E7F"},{'name':'InSupplemental_Symbols_And_Pictographs','astral':"\uD83E[\uDD00-\uDDFF]"},{'name':'InSupplementary_Private_Use_Area_A','astral':"[\uDB80-\uDBBF][\uDC00-\uDFFF]"},{'name':'InSupplementary_Private_Use_Area_B','astral':"[\uDBC0-\uDBFF][\uDC00-\uDFFF]"},{'name':'InSutton_SignWriting','astral':"\uD836[\uDC00-\uDEAF]"},{'name':'InSyloti_Nagri','bmp':"\uA800-\uA82F"},{'name':'InSyriac','bmp':"\u0700-\u074F"},{'name':'InSyriac_Supplement','bmp':"\u0860-\u086F"},{'name':'InTagalog','bmp':"\u1700-\u171F"},{'name':'InTagbanwa','bmp':"\u1760-\u177F"},{'name':'InTags','astral':"\uDB40[\uDC00-\uDC7F]"},{'name':'InTai_Le','bmp':"\u1950-\u197F"},{'name':'InTai_Tham','bmp':"\u1A20-\u1AAF"},{'name':'InTai_Viet','bmp':"\uAA80-\uAADF"},{'name':'InTai_Xuan_Jing_Symbols','astral':"\uD834[\uDF00-\uDF5F]"},{'name':'InTakri','astral':"\uD805[\uDE80-\uDECF]"},{'name':'InTamil','bmp':"\u0B80-\u0BFF"},{'name':'InTangut','astral':"[\uD81C-\uD821][\uDC00-\uDFFF]"},{'name':'InTangut_Components','astral':"\uD822[\uDC00-\uDEFF]"},{'name':'InTelugu','bmp':"\u0C00-\u0C7F"},{'name':'InThaana','bmp':"\u0780-\u07BF"},{'name':'InThai','bmp':"\u0E00-\u0E7F"},{'name':'InTibetan','bmp':"\u0F00-\u0FFF"},{'name':'InTifinagh','bmp':"\u2D30-\u2D7F"},{'name':'InTirhuta','astral':"\uD805[\uDC80-\uDCDF]"},{'name':'InTransport_And_Map_Symbols','astral':"\uD83D[\uDE80-\uDEFF]"},{'name':'InUgaritic','astral':"\uD800[\uDF80-\uDF9F]"},{'name':'InUnified_Canadian_Aboriginal_Syllabics','bmp':"\u1400-\u167F"},{'name':'InUnified_Canadian_Aboriginal_Syllabics_Extended','bmp':"\u18B0-\u18FF"},{'name':'InVai','bmp':"\uA500-\uA63F"},{'name':'InVariation_Selectors','bmp':"\uFE00-\uFE0F"},{'name':'InVariation_Selectors_Supplement','astral':"\uDB40[\uDD00-\uDDEF]"},{'name':'InVedic_Extensions','bmp':"\u1CD0-\u1CFF"},{'name':'InVertical_Forms','bmp':"\uFE10-\uFE1F"},{'name':'InWarang_Citi','astral':"\uD806[\uDCA0-\uDCFF]"},{'name':'InYi_Radicals','bmp':"\uA490-\uA4CF"},{'name':'InYi_Syllables','bmp':"\uA000-\uA48F"},{'name':'InYijing_Hexagram_Symbols','bmp':"\u4DC0-\u4DFF"},{'name':'InZanabazar_Square','astral':"\uD806[\uDE00-\uDE4F]"},{'name':'Inundefined','astral':"\uD803[\uDE80-\uDEBF\uDFB0-\uDFFF]|\uD806[\uDD00-\uDD5F\uDDA0-\uDDFF]|\uD807[\uDFB0-\uDFFF]|\uD80D[\uDC30-\uDC3F]|\uD822[\uDF00-\uDFFF]|\uD823[\uDC00-\uDD8F]|\uD82C[\uDD30-\uDD6F]|\uD838[\uDD00-\uDD4F\uDEC0-\uDEFF]|\uD83B[\uDD00-\uDD4F]|\uD83E[\uDE70-\uDFFF]|[\uD880-\uD883][\uDC00-\uDFFF]|\uD884[\uDC00-\uDF4F]"}];},{}],268:[function(require,module,exports){module.exports=[{'name':'C','alias':'Other','isBmpLast':true,'bmp':"\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u0380-\u0383\u038B\u038D\u03A2\u0530\u0557\u0558\u058B\u058C\u0590\u05C8-\u05CF\u05EB-\u05EE\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB\u07FC\u082E\u082F\u083F\u085C\u085D\u085F\u086B-\u089F\u08B5\u08C8-\u08D2\u08E2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FF\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A77-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B54\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0BFF\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C76\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0CFF\u0D0D\u0D11\u0D45\u0D49\u0D50-\u0D53\u0D64\u0D65\u0D80\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F6\u13F7\u13FE\u13FF\u169D-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180E\u180F\u181A-\u181F\u1879-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1AC1-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C89-\u1C8F\u1CBB\u1CBC\u1CC8-\u1CCF\u1CFB-\u1CFF\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20C0-\u20CF\u20F1-\u20FF\u218C-\u218F\u2427-\u243F\u244B-\u245F\u2B74\u2B75\u2B96\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E53-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u3130\u318F\u31E4-\u31EF\u321F\u9FFD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA6F8-\uA6FF\uA7C0\uA7C1\uA7CB-\uA7F4\uA82D-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C6-\uA8CD\uA8DA-\uA8DF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB6C-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF",'astral':"\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDCFF\uDD03-\uDD06\uDD34-\uDD36\uDD8F\uDD9D-\uDD9F\uDDA1-\uDDCF\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEFC-\uDEFF\uDF24-\uDF2C\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDFC4-\uDFC7\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6E\uDD70-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56\uDC9F-\uDCA6\uDCB0-\uDCDF\uDCF3\uDCF6-\uDCFA\uDD1C-\uDD1E\uDD3A-\uDD3E\uDD40-\uDD7F\uDDB8-\uDDBB\uDDD0\uDDD1\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE36\uDE37\uDE3B-\uDE3E\uDE49-\uDE4F\uDE59-\uDE5F\uDEA0-\uDEBF\uDEE7-\uDEEA\uDEF7-\uDEFF\uDF36-\uDF38\uDF56\uDF57\uDF73-\uDF77\uDF92-\uDF98\uDF9D-\uDFA8\uDFB0-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCF9\uDD28-\uDD2F\uDD3A-\uDE5F\uDE7F\uDEAA\uDEAE\uDEAF\uDEB2-\uDEFF\uDF28-\uDF2F\uDF5A-\uDFAF\uDFCC-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC4E-\uDC51\uDC70-\uDC7E\uDCBD\uDCC2-\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD48-\uDD4F\uDD77-\uDD7F\uDDE0\uDDF5-\uDDFF\uDE12\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEAA-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC5C\uDC62-\uDC7F\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDDE-\uDDFF\uDE45-\uDE4F\uDE5A-\uDE5F\uDE6D-\uDE7F\uDEB9-\uDEBF\uDECA-\uDEFF\uDF1B\uDF1C\uDF2C-\uDF2F\uDF40-\uDFFF]|\uD806[\uDC3C-\uDC9F\uDCF3-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD36\uDD39\uDD3A\uDD47-\uDD4F\uDD5A-\uDD9F\uDDA8\uDDA9\uDDD8\uDDD9\uDDE5-\uDDFF\uDE48-\uDE4F\uDEA3-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC46-\uDC4F\uDC6D-\uDC6F\uDC90\uDC91\uDCA8\uDCB7-\uDCFF\uDD07\uDD0A\uDD37-\uDD39\uDD3B\uDD3E\uDD48-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8F\uDD92\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF9-\uDFAF\uDFB1-\uDFBF\uDFF2-\uDFFE]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F\uDC75-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD824-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83F\uD87B-\uD87D\uD87F\uD885-\uDB3F\uDB41-\uDBFF][\uDC00-\uDFFF]|\uD80D[\uDC2F-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDE6D\uDE70-\uDECF\uDEEE\uDEEF\uDEF6-\uDEFF\uDF46-\uDF4F\uDF5A\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE9B-\uDEFF\uDF4B-\uDF4E\uDF88-\uDF8E\uDFA0-\uDFDF\uDFE5-\uDFEF\uDFF2-\uDFFF]|\uD821[\uDFF8-\uDFFF]|\uD823[\uDCD6-\uDCFF\uDD09-\uDFFF]|\uD82C[\uDD1F-\uDD4F\uDD53-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A\uDC9B\uDCA0-\uDFFF]|\uD834[\uDCF6-\uDCFF\uDD27\uDD28\uDD73-\uDD7A\uDDE9-\uDDFF\uDE46-\uDEDF\uDEF4-\uDEFF\uDF57-\uDF5F\uDF79-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDFCC\uDFCD]|\uD836[\uDE8C-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDCFF\uDD2D-\uDD2F\uDD3E\uDD3F\uDD4A-\uDD4D\uDD50-\uDEBF\uDEFA-\uDEFE\uDF00-\uDFFF]|\uD83A[\uDCC5\uDCC6\uDCD7-\uDCFF\uDD4C-\uDD4F\uDD5A-\uDD5D\uDD60-\uDFFF]|\uD83B[\uDC00-\uDC70\uDCB5-\uDD00\uDD3E-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDEEF\uDEF2-\uDFFF]|\uD83C[\uDC2C-\uDC2F\uDC94-\uDC9F\uDCAF\uDCB0\uDCC0\uDCD0\uDCF6-\uDCFF\uDDAE-\uDDE5\uDE03-\uDE0F\uDE3C-\uDE3F\uDE49-\uDE4F\uDE52-\uDE5F\uDE66-\uDEFF]|\uD83D[\uDED8-\uDEDF\uDEED-\uDEEF\uDEFD-\uDEFF\uDF74-\uDF7F\uDFD9-\uDFDF\uDFEC-\uDFFF]|\uD83E[\uDC0C-\uDC0F\uDC48-\uDC4F\uDC5A-\uDC5F\uDC88-\uDC8F\uDCAE\uDCAF\uDCB2-\uDCFF\uDD79\uDDCC\uDE54-\uDE5F\uDE6E\uDE6F\uDE75-\uDE77\uDE7B-\uDE7F\uDE87-\uDE8F\uDEA9-\uDEAF\uDEB7-\uDEBF\uDEC3-\uDECF\uDED7-\uDEFF\uDF93\uDFCB-\uDFEF\uDFFA-\uDFFF]|\uD869[\uDEDE-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDFFF]|\uDB40[\uDC00-\uDCFF\uDDF0-\uDFFF]"},{'name':'Cc','alias':'Control','bmp':'\0-\x1F\x7F-\x9F'},{'name':'Cf','alias':'Format','bmp':"\xAD\u0600-\u0605\u061C\u06DD\u070F\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB",'astral':"\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC38]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]"},{'name':'Cn','alias':'Unassigned','bmp':"\u0378\u0379\u0380-\u0383\u038B\u038D\u03A2\u0530\u0557\u0558\u058B\u058C\u0590\u05C8-\u05CF\u05EB-\u05EE\u05F5-\u05FF\u061D\u070E\u074B\u074C\u07B2-\u07BF\u07FB\u07FC\u082E\u082F\u083F\u085C\u085D\u085F\u086B-\u089F\u08B5\u08C8-\u08D2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FF\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A77-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B54\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0BFF\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C76\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0CFF\u0D0D\u0D11\u0D45\u0D49\u0D50-\u0D53\u0D64\u0D65\u0D80\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E8B\u0EA4\u0EA6\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F6\u13F7\u13FE\u13FF\u169D-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1879-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1AC1-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C89-\u1C8F\u1CBB\u1CBC\u1CC8-\u1CCF\u1CFB-\u1CFF\u1DFA\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u2065\u2072\u2073\u208F\u209D-\u209F\u20C0-\u20CF\u20F1-\u20FF\u218C-\u218F\u2427-\u243F\u244B-\u245F\u2B74\u2B75\u2B96\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E53-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u3130\u318F\u31E4-\u31EF\u321F\u9FFD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA6F8-\uA6FF\uA7C0\uA7C1\uA7CB-\uA7F4\uA82D-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C6-\uA8CD\uA8DA-\uA8DF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB6C-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD\uFEFE\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFF8\uFFFE\uFFFF",'astral':"\uD800[\uDC0C\uDC27\uDC3B\uDC3E\uDC4E\uDC4F\uDC5E-\uDC7F\uDCFB-\uDCFF\uDD03-\uDD06\uDD34-\uDD36\uDD8F\uDD9D-\uDD9F\uDDA1-\uDDCF\uDDFE-\uDE7F\uDE9D-\uDE9F\uDED1-\uDEDF\uDEFC-\uDEFF\uDF24-\uDF2C\uDF4B-\uDF4F\uDF7B-\uDF7F\uDF9E\uDFC4-\uDFC7\uDFD6-\uDFFF]|\uD801[\uDC9E\uDC9F\uDCAA-\uDCAF\uDCD4-\uDCD7\uDCFC-\uDCFF\uDD28-\uDD2F\uDD64-\uDD6E\uDD70-\uDDFF\uDF37-\uDF3F\uDF56-\uDF5F\uDF68-\uDFFF]|\uD802[\uDC06\uDC07\uDC09\uDC36\uDC39-\uDC3B\uDC3D\uDC3E\uDC56\uDC9F-\uDCA6\uDCB0-\uDCDF\uDCF3\uDCF6-\uDCFA\uDD1C-\uDD1E\uDD3A-\uDD3E\uDD40-\uDD7F\uDDB8-\uDDBB\uDDD0\uDDD1\uDE04\uDE07-\uDE0B\uDE14\uDE18\uDE36\uDE37\uDE3B-\uDE3E\uDE49-\uDE4F\uDE59-\uDE5F\uDEA0-\uDEBF\uDEE7-\uDEEA\uDEF7-\uDEFF\uDF36-\uDF38\uDF56\uDF57\uDF73-\uDF77\uDF92-\uDF98\uDF9D-\uDFA8\uDFB0-\uDFFF]|\uD803[\uDC49-\uDC7F\uDCB3-\uDCBF\uDCF3-\uDCF9\uDD28-\uDD2F\uDD3A-\uDE5F\uDE7F\uDEAA\uDEAE\uDEAF\uDEB2-\uDEFF\uDF28-\uDF2F\uDF5A-\uDFAF\uDFCC-\uDFDF\uDFF7-\uDFFF]|\uD804[\uDC4E-\uDC51\uDC70-\uDC7E\uDCC2-\uDCCC\uDCCE\uDCCF\uDCE9-\uDCEF\uDCFA-\uDCFF\uDD35\uDD48-\uDD4F\uDD77-\uDD7F\uDDE0\uDDF5-\uDDFF\uDE12\uDE3F-\uDE7F\uDE87\uDE89\uDE8E\uDE9E\uDEAA-\uDEAF\uDEEB-\uDEEF\uDEFA-\uDEFF\uDF04\uDF0D\uDF0E\uDF11\uDF12\uDF29\uDF31\uDF34\uDF3A\uDF45\uDF46\uDF49\uDF4A\uDF4E\uDF4F\uDF51-\uDF56\uDF58-\uDF5C\uDF64\uDF65\uDF6D-\uDF6F\uDF75-\uDFFF]|\uD805[\uDC5C\uDC62-\uDC7F\uDCC8-\uDCCF\uDCDA-\uDD7F\uDDB6\uDDB7\uDDDE-\uDDFF\uDE45-\uDE4F\uDE5A-\uDE5F\uDE6D-\uDE7F\uDEB9-\uDEBF\uDECA-\uDEFF\uDF1B\uDF1C\uDF2C-\uDF2F\uDF40-\uDFFF]|\uD806[\uDC3C-\uDC9F\uDCF3-\uDCFE\uDD07\uDD08\uDD0A\uDD0B\uDD14\uDD17\uDD36\uDD39\uDD3A\uDD47-\uDD4F\uDD5A-\uDD9F\uDDA8\uDDA9\uDDD8\uDDD9\uDDE5-\uDDFF\uDE48-\uDE4F\uDEA3-\uDEBF\uDEF9-\uDFFF]|\uD807[\uDC09\uDC37\uDC46-\uDC4F\uDC6D-\uDC6F\uDC90\uDC91\uDCA8\uDCB7-\uDCFF\uDD07\uDD0A\uDD37-\uDD39\uDD3B\uDD3E\uDD48-\uDD4F\uDD5A-\uDD5F\uDD66\uDD69\uDD8F\uDD92\uDD99-\uDD9F\uDDAA-\uDEDF\uDEF9-\uDFAF\uDFB1-\uDFBF\uDFF2-\uDFFE]|\uD808[\uDF9A-\uDFFF]|\uD809[\uDC6F\uDC75-\uDC7F\uDD44-\uDFFF]|[\uD80A\uD80B\uD80E-\uD810\uD812-\uD819\uD824-\uD82B\uD82D\uD82E\uD830-\uD833\uD837\uD839\uD83F\uD87B-\uD87D\uD87F\uD885-\uDB3F\uDB41-\uDB7F][\uDC00-\uDFFF]|\uD80D[\uDC2F\uDC39-\uDFFF]|\uD811[\uDE47-\uDFFF]|\uD81A[\uDE39-\uDE3F\uDE5F\uDE6A-\uDE6D\uDE70-\uDECF\uDEEE\uDEEF\uDEF6-\uDEFF\uDF46-\uDF4F\uDF5A\uDF62\uDF78-\uDF7C\uDF90-\uDFFF]|\uD81B[\uDC00-\uDE3F\uDE9B-\uDEFF\uDF4B-\uDF4E\uDF88-\uDF8E\uDFA0-\uDFDF\uDFE5-\uDFEF\uDFF2-\uDFFF]|\uD821[\uDFF8-\uDFFF]|\uD823[\uDCD6-\uDCFF\uDD09-\uDFFF]|\uD82C[\uDD1F-\uDD4F\uDD53-\uDD63\uDD68-\uDD6F\uDEFC-\uDFFF]|\uD82F[\uDC6B-\uDC6F\uDC7D-\uDC7F\uDC89-\uDC8F\uDC9A\uDC9B\uDCA4-\uDFFF]|\uD834[\uDCF6-\uDCFF\uDD27\uDD28\uDDE9-\uDDFF\uDE46-\uDEDF\uDEF4-\uDEFF\uDF57-\uDF5F\uDF79-\uDFFF]|\uD835[\uDC55\uDC9D\uDCA0\uDCA1\uDCA3\uDCA4\uDCA7\uDCA8\uDCAD\uDCBA\uDCBC\uDCC4\uDD06\uDD0B\uDD0C\uDD15\uDD1D\uDD3A\uDD3F\uDD45\uDD47-\uDD49\uDD51\uDEA6\uDEA7\uDFCC\uDFCD]|\uD836[\uDE8C-\uDE9A\uDEA0\uDEB0-\uDFFF]|\uD838[\uDC07\uDC19\uDC1A\uDC22\uDC25\uDC2B-\uDCFF\uDD2D-\uDD2F\uDD3E\uDD3F\uDD4A-\uDD4D\uDD50-\uDEBF\uDEFA-\uDEFE\uDF00-\uDFFF]|\uD83A[\uDCC5\uDCC6\uDCD7-\uDCFF\uDD4C-\uDD4F\uDD5A-\uDD5D\uDD60-\uDFFF]|\uD83B[\uDC00-\uDC70\uDCB5-\uDD00\uDD3E-\uDDFF\uDE04\uDE20\uDE23\uDE25\uDE26\uDE28\uDE33\uDE38\uDE3A\uDE3C-\uDE41\uDE43-\uDE46\uDE48\uDE4A\uDE4C\uDE50\uDE53\uDE55\uDE56\uDE58\uDE5A\uDE5C\uDE5E\uDE60\uDE63\uDE65\uDE66\uDE6B\uDE73\uDE78\uDE7D\uDE7F\uDE8A\uDE9C-\uDEA0\uDEA4\uDEAA\uDEBC-\uDEEF\uDEF2-\uDFFF]|\uD83C[\uDC2C-\uDC2F\uDC94-\uDC9F\uDCAF\uDCB0\uDCC0\uDCD0\uDCF6-\uDCFF\uDDAE-\uDDE5\uDE03-\uDE0F\uDE3C-\uDE3F\uDE49-\uDE4F\uDE52-\uDE5F\uDE66-\uDEFF]|\uD83D[\uDED8-\uDEDF\uDEED-\uDEEF\uDEFD-\uDEFF\uDF74-\uDF7F\uDFD9-\uDFDF\uDFEC-\uDFFF]|\uD83E[\uDC0C-\uDC0F\uDC48-\uDC4F\uDC5A-\uDC5F\uDC88-\uDC8F\uDCAE\uDCAF\uDCB2-\uDCFF\uDD79\uDDCC\uDE54-\uDE5F\uDE6E\uDE6F\uDE75-\uDE77\uDE7B-\uDE7F\uDE87-\uDE8F\uDEA9-\uDEAF\uDEB7-\uDEBF\uDEC3-\uDECF\uDED7-\uDEFF\uDF93\uDFCB-\uDFEF\uDFFA-\uDFFF]|\uD869[\uDEDE-\uDEFF]|\uD86D[\uDF35-\uDF3F]|\uD86E[\uDC1E\uDC1F]|\uD873[\uDEA2-\uDEAF]|\uD87A[\uDFE1-\uDFFF]|\uD87E[\uDE1E-\uDFFF]|\uD884[\uDF4B-\uDFFF]|\uDB40[\uDC00\uDC02-\uDC1F\uDC80-\uDCFF\uDDF0-\uDFFF]|[\uDBBF\uDBFF][\uDFFE\uDFFF]"},{'name':'Co','alias':'Private_Use','bmp':"\uE000-\uF8FF",'astral':"[\uDB80-\uDBBE\uDBC0-\uDBFE][\uDC00-\uDFFF]|[\uDBBF\uDBFF][\uDC00-\uDFFD]"},{'name':'Cs','alias':'Surrogate','bmp':"\uD800-\uDFFF"},{'name':'L','alias':'Letter','bmp':"A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC",'astral':"\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A]"},{'name':'LC','alias':'Cased_Letter','bmp':"A-Za-z\xB5\xC0-\xD6\xD8-\xF6\xF8-\u01BA\u01BC-\u01BF\u01C4-\u0293\u0295-\u02AF\u0370-\u0373\u0376\u0377\u037B-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0560-\u0588\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FD-\u10FF\u13A0-\u13F5\u13F8-\u13FD\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2134\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2C7B\u2C7E-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA640-\uA66D\uA680-\uA69B\uA722-\uA76F\uA771-\uA787\uA78B-\uA78E\uA790-\uA7BF\uA7C2-\uA7CA\uA7F5\uA7F6\uA7FA\uAB30-\uAB5A\uAB60-\uAB68\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF21-\uFF3A\uFF41-\uFF5A",'astral':"\uD801[\uDC00-\uDC4F\uDCB0-\uDCD3\uDCD8-\uDCFB]|\uD803[\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD806[\uDCA0-\uDCDF]|\uD81B[\uDE40-\uDE7F]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDD00-\uDD43]"},{'name':'Ll','alias':'Lowercase_Letter','bmp':"a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7BB\uA7BD\uA7BF\uA7C3\uA7C8\uA7CA\uA7F6\uA7FA\uAB30-\uAB5A\uAB60-\uAB68\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A",'astral':"\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD83A[\uDD22-\uDD43]"},{'name':'Lm','alias':'Modifier_Letter','bmp':"\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5\u06E6\u07F4\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C\uA69D\uA717-\uA71F\uA770\uA788\uA7F8\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3\uAAF4\uAB5C-\uAB5F\uAB69\uFF70\uFF9E\uFF9F",'astral':"\uD81A[\uDF40-\uDF43]|\uD81B[\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD838[\uDD37-\uDD3D]|\uD83A\uDD4B"},{'name':'Lo','alias':'Other_Letter','bmp':"\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05EF-\u05F2\u0620-\u063F\u0641-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1100-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC",'astral':"\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC50-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDD00-\uDD23\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF4A\uDF50]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD838[\uDD00-\uDD2C\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A]"},{'name':'Lt','alias':'Titlecase_Letter','bmp':"\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC"},{'name':'Lu','alias':'Uppercase_Letter','bmp':"A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uA7BA\uA7BC\uA7BE\uA7C2\uA7C4-\uA7C7\uA7C9\uA7F5\uFF21-\uFF3A",'astral':"\uD801[\uDC00-\uDC27\uDCB0-\uDCD3]|\uD803[\uDC80-\uDCB2]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21]"},{'name':'M','alias':'Mark','bmp':"\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D81-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1AC0\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA82C\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F",'astral':"\uD800[\uDDFD\uDEE0\uDF76-\uDF7A]|\uD802[\uDE01-\uDE03\uDE05\uDE06\uDE0C-\uDE0F\uDE38-\uDE3A\uDE3F\uDEE5\uDEE6]|\uD803[\uDD24-\uDD27\uDEAB\uDEAC\uDF46-\uDF50]|\uD804[\uDC00-\uDC02\uDC38-\uDC46\uDC7F-\uDC82\uDCB0-\uDCBA\uDD00-\uDD02\uDD27-\uDD34\uDD45\uDD46\uDD73\uDD80-\uDD82\uDDB3-\uDDC0\uDDC9-\uDDCC\uDDCE\uDDCF\uDE2C-\uDE37\uDE3E\uDEDF-\uDEEA\uDF00-\uDF03\uDF3B\uDF3C\uDF3E-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF62\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC35-\uDC46\uDC5E\uDCB0-\uDCC3\uDDAF-\uDDB5\uDDB8-\uDDC0\uDDDC\uDDDD\uDE30-\uDE40\uDEAB-\uDEB7\uDF1D-\uDF2B]|\uD806[\uDC2C-\uDC3A\uDD30-\uDD35\uDD37\uDD38\uDD3B-\uDD3E\uDD40\uDD42\uDD43\uDDD1-\uDDD7\uDDDA-\uDDE0\uDDE4\uDE01-\uDE0A\uDE33-\uDE39\uDE3B-\uDE3E\uDE47\uDE51-\uDE5B\uDE8A-\uDE99]|\uD807[\uDC2F-\uDC36\uDC38-\uDC3F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD31-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD45\uDD47\uDD8A-\uDD8E\uDD90\uDD91\uDD93-\uDD97\uDEF3-\uDEF6]|\uD81A[\uDEF0-\uDEF4\uDF30-\uDF36]|\uD81B[\uDF4F\uDF51-\uDF87\uDF8F-\uDF92\uDFE4\uDFF0\uDFF1]|\uD82F[\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD30-\uDD36\uDEEC-\uDEEF]|\uD83A[\uDCD0-\uDCD6\uDD44-\uDD4A]|\uDB40[\uDD00-\uDDEF]"},{'name':'Mc','alias':'Spacing_Mark','bmp':"\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E\u094F\u0982\u0983\u09BE-\u09C0\u09C7\u09C8\u09CB\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB\u0ACC\u0B02\u0B03\u0B3E\u0B40\u0B47\u0B48\u0B4B\u0B4C\u0B57\u0BBE\u0BBF\u0BC1\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7\u0CC8\u0CCA\u0CCB\u0CD5\u0CD6\u0D02\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2\u0DF3\u0F3E\u0F3F\u0F7F\u102B\u102C\u1031\u1038\u103B\u103C\u1056\u1057\u1062-\u1064\u1067-\u106D\u1083\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7\u17C8\u1923-\u1926\u1929-\u192B\u1930\u1931\u1933-\u1938\u1A19\u1A1A\u1A55\u1A57\u1A61\u1A63\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43\u1B44\u1B82\u1BA1\u1BA6\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2\u1BF3\u1C24-\u1C2B\u1C34\u1C35\u1CE1\u1CF7\u302E\u302F\uA823\uA824\uA827\uA880\uA881\uA8B4-\uA8C3\uA952\uA953\uA983\uA9B4\uA9B5\uA9BA\uA9BB\uA9BE-\uA9C0\uAA2F\uAA30\uAA33\uAA34\uAA4D\uAA7B\uAA7D\uAAEB\uAAEE\uAAEF\uAAF5\uABE3\uABE4\uABE6\uABE7\uABE9\uABEA\uABEC",'astral':"\uD804[\uDC00\uDC02\uDC82\uDCB0-\uDCB2\uDCB7\uDCB8\uDD2C\uDD45\uDD46\uDD82\uDDB3-\uDDB5\uDDBF\uDDC0\uDDCE\uDE2C-\uDE2E\uDE32\uDE33\uDE35\uDEE0-\uDEE2\uDF02\uDF03\uDF3E\uDF3F\uDF41-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF62\uDF63]|\uD805[\uDC35-\uDC37\uDC40\uDC41\uDC45\uDCB0-\uDCB2\uDCB9\uDCBB-\uDCBE\uDCC1\uDDAF-\uDDB1\uDDB8-\uDDBB\uDDBE\uDE30-\uDE32\uDE3B\uDE3C\uDE3E\uDEAC\uDEAE\uDEAF\uDEB6\uDF20\uDF21\uDF26]|\uD806[\uDC2C-\uDC2E\uDC38\uDD30-\uDD35\uDD37\uDD38\uDD3D\uDD40\uDD42\uDDD1-\uDDD3\uDDDC-\uDDDF\uDDE4\uDE39\uDE57\uDE58\uDE97]|\uD807[\uDC2F\uDC3E\uDCA9\uDCB1\uDCB4\uDD8A-\uDD8E\uDD93\uDD94\uDD96\uDEF5\uDEF6]|\uD81B[\uDF51-\uDF87\uDFF0\uDFF1]|\uD834[\uDD65\uDD66\uDD6D-\uDD72]"},{'name':'Me','alias':'Enclosing_Mark','bmp':"\u0488\u0489\u1ABE\u20DD-\u20E0\u20E2-\u20E4\uA670-\uA672"},{'name':'Mn','alias':'Nonspacing_Mark','bmp':"\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u09FE\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B55\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C04\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D00\u0D01\u0D3B\u0D3C\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0D81\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1ABF\u1AC0\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA82C\uA8C4\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9BD\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F",'astral':"\uD800[\uDDFD\uDEE0\uDF76-\uDF7A]|\uD802[\uDE01-\uDE03\uDE05\uDE06\uDE0C-\uDE0F\uDE38-\uDE3A\uDE3F\uDEE5\uDEE6]|\uD803[\uDD24-\uDD27\uDEAB\uDEAC\uDF46-\uDF50]|\uD804[\uDC01\uDC38-\uDC46\uDC7F-\uDC81\uDCB3-\uDCB6\uDCB9\uDCBA\uDD00-\uDD02\uDD27-\uDD2B\uDD2D-\uDD34\uDD73\uDD80\uDD81\uDDB6-\uDDBE\uDDC9-\uDDCC\uDDCF\uDE2F-\uDE31\uDE34\uDE36\uDE37\uDE3E\uDEDF\uDEE3-\uDEEA\uDF00\uDF01\uDF3B\uDF3C\uDF40\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC38-\uDC3F\uDC42-\uDC44\uDC46\uDC5E\uDCB3-\uDCB8\uDCBA\uDCBF\uDCC0\uDCC2\uDCC3\uDDB2-\uDDB5\uDDBC\uDDBD\uDDBF\uDDC0\uDDDC\uDDDD\uDE33-\uDE3A\uDE3D\uDE3F\uDE40\uDEAB\uDEAD\uDEB0-\uDEB5\uDEB7\uDF1D-\uDF1F\uDF22-\uDF25\uDF27-\uDF2B]|\uD806[\uDC2F-\uDC37\uDC39\uDC3A\uDD3B\uDD3C\uDD3E\uDD43\uDDD4-\uDDD7\uDDDA\uDDDB\uDDE0\uDE01-\uDE0A\uDE33-\uDE38\uDE3B-\uDE3E\uDE47\uDE51-\uDE56\uDE59-\uDE5B\uDE8A-\uDE96\uDE98\uDE99]|\uD807[\uDC30-\uDC36\uDC38-\uDC3D\uDC3F\uDC92-\uDCA7\uDCAA-\uDCB0\uDCB2\uDCB3\uDCB5\uDCB6\uDD31-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD45\uDD47\uDD90\uDD91\uDD95\uDD97\uDEF3\uDEF4]|\uD81A[\uDEF0-\uDEF4\uDF30-\uDF36]|\uD81B[\uDF4F\uDF8F-\uDF92\uDFE4]|\uD82F[\uDC9D\uDC9E]|\uD834[\uDD67-\uDD69\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD30-\uDD36\uDEEC-\uDEEF]|\uD83A[\uDCD0-\uDCD6\uDD44-\uDD4A]|\uDB40[\uDD00-\uDDEF]"},{'name':'N','alias':'Number','bmp':"0-9\xB2\xB3\xB9\xBC-\xBE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D58-\u0D5E\u0D66-\u0D78\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19",'astral':"\uD800[\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDEE1-\uDEFB\uDF20-\uDF23\uDF41\uDF4A\uDFD1-\uDFD5]|\uD801[\uDCA0-\uDCA9]|\uD802[\uDC58-\uDC5F\uDC79-\uDC7F\uDCA7-\uDCAF\uDCFB-\uDCFF\uDD16-\uDD1B\uDDBC\uDDBD\uDDC0-\uDDCF\uDDD2-\uDDFF\uDE40-\uDE48\uDE7D\uDE7E\uDE9D-\uDE9F\uDEEB-\uDEEF\uDF58-\uDF5F\uDF78-\uDF7F\uDFA9-\uDFAF]|\uD803[\uDCFA-\uDCFF\uDD30-\uDD39\uDE60-\uDE7E\uDF1D-\uDF26\uDF51-\uDF54\uDFC5-\uDFCB]|\uD804[\uDC52-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9\uDDE1-\uDDF4\uDEF0-\uDEF9]|\uD805[\uDC50-\uDC59\uDCD0-\uDCD9\uDE50-\uDE59\uDEC0-\uDEC9\uDF30-\uDF3B]|\uD806[\uDCE0-\uDCF2\uDD50-\uDD59]|\uD807[\uDC50-\uDC6C\uDD50-\uDD59\uDDA0-\uDDA9\uDFC0-\uDFD4]|\uD809[\uDC00-\uDC6E]|\uD81A[\uDE60-\uDE69\uDF50-\uDF59\uDF5B-\uDF61]|\uD81B[\uDE80-\uDE96]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDFCE-\uDFFF]|\uD838[\uDD40-\uDD49\uDEF0-\uDEF9]|\uD83A[\uDCC7-\uDCCF\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]"},{'name':'Nd','alias':'Decimal_Number','bmp':"0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19",'astral':"\uD801[\uDCA0-\uDCA9]|\uD803[\uDD30-\uDD39]|\uD804[\uDC66-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9\uDEF0-\uDEF9]|\uD805[\uDC50-\uDC59\uDCD0-\uDCD9\uDE50-\uDE59\uDEC0-\uDEC9\uDF30-\uDF39]|\uD806[\uDCE0-\uDCE9\uDD50-\uDD59]|\uD807[\uDC50-\uDC59\uDD50-\uDD59\uDDA0-\uDDA9]|\uD81A[\uDE60-\uDE69\uDF50-\uDF59]|\uD835[\uDFCE-\uDFFF]|\uD838[\uDD40-\uDD49\uDEF0-\uDEF9]|\uD83A[\uDD50-\uDD59]|\uD83E[\uDFF0-\uDFF9]"},{'name':'Nl','alias':'Letter_Number','bmp':"\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF",'astral':"\uD800[\uDD40-\uDD74\uDF41\uDF4A\uDFD1-\uDFD5]|\uD809[\uDC00-\uDC6E]"},{'name':'No','alias':'Other_Number','bmp':"\xB2\xB3\xB9\xBC-\xBE\u09F4-\u09F9\u0B72-\u0B77\u0BF0-\u0BF2\u0C78-\u0C7E\u0D58-\u0D5E\u0D70-\u0D78\u0F2A-\u0F33\u1369-\u137C\u17F0-\u17F9\u19DA\u2070\u2074-\u2079\u2080-\u2089\u2150-\u215F\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA830-\uA835",'astral':"\uD800[\uDD07-\uDD33\uDD75-\uDD78\uDD8A\uDD8B\uDEE1-\uDEFB\uDF20-\uDF23]|\uD802[\uDC58-\uDC5F\uDC79-\uDC7F\uDCA7-\uDCAF\uDCFB-\uDCFF\uDD16-\uDD1B\uDDBC\uDDBD\uDDC0-\uDDCF\uDDD2-\uDDFF\uDE40-\uDE48\uDE7D\uDE7E\uDE9D-\uDE9F\uDEEB-\uDEEF\uDF58-\uDF5F\uDF78-\uDF7F\uDFA9-\uDFAF]|\uD803[\uDCFA-\uDCFF\uDE60-\uDE7E\uDF1D-\uDF26\uDF51-\uDF54\uDFC5-\uDFCB]|\uD804[\uDC52-\uDC65\uDDE1-\uDDF4]|\uD805[\uDF3A\uDF3B]|\uD806[\uDCEA-\uDCF2]|\uD807[\uDC5A-\uDC6C\uDFC0-\uDFD4]|\uD81A[\uDF5B-\uDF61]|\uD81B[\uDE80-\uDE96]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD83A[\uDCC7-\uDCCF]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D]|\uD83C[\uDD00-\uDD0C]"},{'name':'P','alias':'Punctuation','bmp':"!-#%-\\*,-\\/:;\\?@\\[-\\]_\\{\\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65",'astral':"\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDFFF]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]"},{'name':'Pc','alias':'Connector_Punctuation','bmp':"_\u203F\u2040\u2054\uFE33\uFE34\uFE4D-\uFE4F\uFF3F"},{'name':'Pd','alias':'Dash_Punctuation','bmp':"\\-\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A\u2E3B\u2E40\u301C\u3030\u30A0\uFE31\uFE32\uFE58\uFE63\uFF0D",'astral':"\uD803\uDEAD"},{'name':'Pe','alias':'Close_Punctuation','bmp':"\\)\\]\\}\u0F3B\u0F3D\u169C\u2046\u207E\u208E\u2309\u230B\u232A\u2769\u276B\u276D\u276F\u2771\u2773\u2775\u27C6\u27E7\u27E9\u27EB\u27ED\u27EF\u2984\u2986\u2988\u298A\u298C\u298E\u2990\u2992\u2994\u2996\u2998\u29D9\u29DB\u29FD\u2E23\u2E25\u2E27\u2E29\u3009\u300B\u300D\u300F\u3011\u3015\u3017\u3019\u301B\u301E\u301F\uFD3E\uFE18\uFE36\uFE38\uFE3A\uFE3C\uFE3E\uFE40\uFE42\uFE44\uFE48\uFE5A\uFE5C\uFE5E\uFF09\uFF3D\uFF5D\uFF60\uFF63"},{'name':'Pf','alias':'Final_Punctuation','bmp':"\xBB\u2019\u201D\u203A\u2E03\u2E05\u2E0A\u2E0D\u2E1D\u2E21"},{'name':'Pi','alias':'Initial_Punctuation','bmp':"\xAB\u2018\u201B\u201C\u201F\u2039\u2E02\u2E04\u2E09\u2E0C\u2E1C\u2E20"},{'name':'Po','alias':'Other_Punctuation','bmp':"!-#%-'\\*,\\.\\/:;\\?@\\\xA1\xA7\xB6\xB7\xBF\u037E\u0387\u055A-\u055F\u0589\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u166E\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u1805\u1807-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2016\u2017\u2020-\u2027\u2030-\u2038\u203B-\u203E\u2041-\u2043\u2047-\u2051\u2053\u2055-\u205E\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00\u2E01\u2E06-\u2E08\u2E0B\u2E0E-\u2E16\u2E18\u2E19\u2E1B\u2E1E\u2E1F\u2E2A-\u2E2E\u2E30-\u2E39\u2E3C-\u2E3F\u2E41\u2E43-\u2E4F\u2E52\u3001-\u3003\u303D\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFE10-\uFE16\uFE19\uFE30\uFE45\uFE46\uFE49-\uFE4C\uFE50-\uFE52\uFE54-\uFE57\uFE5F-\uFE61\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF07\uFF0A\uFF0C\uFF0E\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3C\uFF61\uFF64\uFF65",'astral':"\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDF55-\uDF59]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDFFF]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]"},{'name':'Ps','alias':'Open_Punctuation','bmp':"\\(\\[\\{\u0F3A\u0F3C\u169B\u201A\u201E\u2045\u207D\u208D\u2308\u230A\u2329\u2768\u276A\u276C\u276E\u2770\u2772\u2774\u27C5\u27E6\u27E8\u27EA\u27EC\u27EE\u2983\u2985\u2987\u2989\u298B\u298D\u298F\u2991\u2993\u2995\u2997\u29D8\u29DA\u29FC\u2E22\u2E24\u2E26\u2E28\u2E42\u3008\u300A\u300C\u300E\u3010\u3014\u3016\u3018\u301A\u301D\uFD3F\uFE17\uFE35\uFE37\uFE39\uFE3B\uFE3D\uFE3F\uFE41\uFE43\uFE47\uFE59\uFE5B\uFE5D\uFF08\uFF3B\uFF5B\uFF5F\uFF62"},{'name':'S','alias':'Symbol','bmp':"\\$\\+<->\\^`\\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20BF\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC1\uFDFC\uFDFD\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD",'astral':"\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEE0-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF73\uDF80-\uDFD8\uDFE0-\uDFEB]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDD78\uDD7A-\uDDCB\uDDCD-\uDE53\uDE60-\uDE6D\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6\uDF00-\uDF92\uDF94-\uDFCA]"},{'name':'Sc','alias':'Currency_Symbol','bmp':"\\$\xA2-\xA5\u058F\u060B\u07FE\u07FF\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BF\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6",'astral':"\uD807[\uDFDD-\uDFE0]|\uD838\uDEFF|\uD83B\uDCB0"},{'name':'Sk','alias':'Modifier_Symbol','bmp':"\\^`\xA8\xAF\xB4\xB8\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u309B\u309C\uA700-\uA716\uA720\uA721\uA789\uA78A\uAB5B\uAB6A\uAB6B\uFBB2-\uFBC1\uFF3E\uFF40\uFFE3",'astral':"\uD83C[\uDFFB-\uDFFF]"},{'name':'Sm','alias':'Math_Symbol','bmp':"\\+<->\\|~\xAC\xB1\xD7\xF7\u03F6\u0606-\u0608\u2044\u2052\u207A-\u207C\u208A-\u208C\u2118\u2140-\u2144\u214B\u2190-\u2194\u219A\u219B\u21A0\u21A3\u21A6\u21AE\u21CE\u21CF\u21D2\u21D4\u21F4-\u22FF\u2320\u2321\u237C\u239B-\u23B3\u23DC-\u23E1\u25B7\u25C1\u25F8-\u25FF\u266F\u27C0-\u27C4\u27C7-\u27E5\u27F0-\u27FF\u2900-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2AFF\u2B30-\u2B44\u2B47-\u2B4C\uFB29\uFE62\uFE64-\uFE66\uFF0B\uFF1C-\uFF1E\uFF5C\uFF5E\uFFE2\uFFE9-\uFFEC",'astral':"\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD83B[\uDEF0\uDEF1]"},{'name':'So','alias':'Other_Symbol','bmp':"\xA6\xA9\xAE\xB0\u0482\u058D\u058E\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u09FA\u0B70\u0BF3-\u0BF8\u0BFA\u0C7F\u0D4F\u0D79\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116\u2117\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u214A\u214C\u214D\u214F\u218A\u218B\u2195-\u2199\u219C-\u219F\u21A1\u21A2\u21A4\u21A5\u21A7-\u21AD\u21AF-\u21CD\u21D0\u21D1\u21D3\u21D5-\u21F3\u2300-\u2307\u230C-\u231F\u2322-\u2328\u232B-\u237B\u237D-\u239A\u23B4-\u23DB\u23E2-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u25B6\u25B8-\u25C0\u25C2-\u25F7\u2600-\u266E\u2670-\u2767\u2794-\u27BF\u2800-\u28FF\u2B00-\u2B2F\u2B45\u2B46\u2B4D-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA828-\uA82B\uA836\uA837\uA839\uAA77-\uAA79\uFDFD\uFFE4\uFFE8\uFFED\uFFEE\uFFFC\uFFFD",'astral':"\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFDC\uDFE1-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838\uDD4F|\uD83B[\uDCAC\uDD2E]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFA]|\uD83D[\uDC00-\uDED7\uDEE0-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF73\uDF80-\uDFD8\uDFE0-\uDFEB]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDD78\uDD7A-\uDDCB\uDDCD-\uDE53\uDE60-\uDE6D\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6\uDF00-\uDF92\uDF94-\uDFCA]"},{'name':'Z','alias':'Separator','bmp':" \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000"},{'name':'Zl','alias':'Line_Separator','bmp':"\u2028"},{'name':'Zp','alias':'Paragraph_Separator','bmp':"\u2029"},{'name':'Zs','alias':'Space_Separator','bmp':" \xA0\u1680\u2000-\u200A\u202F\u205F\u3000"}];},{}],269:[function(require,module,exports){module.exports=[{'name':'ASCII','bmp':'\0-\x7F'},{'name':'Alphabetic','bmp':"A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0345\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05EF-\u05F2\u0610-\u061A\u0620-\u0657\u0659-\u065F\u066E-\u06D3\u06D5-\u06DC\u06E1-\u06E8\u06ED-\u06EF\u06FA-\u06FC\u06FF\u0710-\u073F\u074D-\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0817\u081A-\u082C\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u08D4-\u08DF\u08E3-\u08E9\u08F0-\u093B\u093D-\u094C\u094E-\u0950\u0955-\u0963\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD-\u09C4\u09C7\u09C8\u09CB\u09CC\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09F0\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3E-\u0A42\u0A47\u0A48\u0A4B\u0A4C\u0A51\u0A59-\u0A5C\u0A5E\u0A70-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD-\u0AC5\u0AC7-\u0AC9\u0ACB\u0ACC\u0AD0\u0AE0-\u0AE3\u0AF9-\u0AFC\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D-\u0B44\u0B47\u0B48\u0B4B\u0B4C\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD0\u0BD7\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4C\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCC\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CF1\u0CF2\u0D00-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4C\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D7A-\u0D7F\u0D81-\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E46\u0E4D\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0ECD\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F71-\u0F81\u0F88-\u0F97\u0F99-\u0FBC\u1000-\u1036\u1038\u103B-\u103F\u1050-\u108F\u109A-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1713\u1720-\u1733\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17B3\u17B6-\u17C8\u17D7\u17DC\u1820-\u1878\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u1938\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A1B\u1A20-\u1A5E\u1A61-\u1A74\u1AA7\u1ABF\u1AC0\u1B00-\u1B33\u1B35-\u1B43\u1B45-\u1B4B\u1B80-\u1BA9\u1BAC-\u1BAF\u1BBA-\u1BE5\u1BE7-\u1BF1\u1C00-\u1C36\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1DE7-\u1DF4\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u24B6-\u24E9\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA674-\uA67B\uA67F-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA805\uA807-\uA827\uA840-\uA873\uA880-\uA8C3\uA8C5\uA8F2-\uA8F7\uA8FB\uA8FD-\uA8FF\uA90A-\uA92A\uA930-\uA952\uA960-\uA97C\uA980-\uA9B2\uA9B4-\uA9BF\uA9CF\uA9E0-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA60-\uAA76\uAA7A-\uAABE\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF5\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABEA\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC",'astral':"\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD27\uDE80-\uDEA9\uDEAB\uDEAC\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC00-\uDC45\uDC82-\uDCB8\uDCD0-\uDCE8\uDD00-\uDD32\uDD44-\uDD47\uDD50-\uDD72\uDD76\uDD80-\uDDBF\uDDC1-\uDDC4\uDDCE\uDDCF\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE34\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEE8\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D-\uDF44\uDF47\uDF48\uDF4B\uDF4C\uDF50\uDF57\uDF5D-\uDF63]|\uD805[\uDC00-\uDC41\uDC43-\uDC45\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCC1\uDCC4\uDCC5\uDCC7\uDD80-\uDDB5\uDDB8-\uDDBE\uDDD8-\uDDDD\uDE00-\uDE3E\uDE40\uDE44\uDE80-\uDEB5\uDEB8\uDF00-\uDF1A\uDF1D-\uDF2A]|\uD806[\uDC00-\uDC38\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD35\uDD37\uDD38\uDD3B\uDD3C\uDD3F-\uDD42\uDDA0-\uDDA7\uDDAA-\uDDD7\uDDDA-\uDDDF\uDDE1\uDDE3\uDDE4\uDE00-\uDE32\uDE35-\uDE3E\uDE50-\uDE97\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC3E\uDC40\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD41\uDD43\uDD46\uDD47\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD96\uDD98\uDEE0-\uDEF6\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF4F-\uDF87\uDF8F-\uDF9F\uDFE0\uDFE1\uDFE3\uDFF0\uDFF1]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9E]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD47\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD30-\uDD49\uDD50-\uDD69\uDD70-\uDD89]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A]"},{'name':'Any','isBmpLast':true,'bmp':"\0-\uFFFF",'astral':"[\uD800-\uDBFF][\uDC00-\uDFFF]"},{'name':'Default_Ignorable_Code_Point','bmp':"\xAD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFF8",'astral':"\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|[\uDB40-\uDB43][\uDC00-\uDFFF]"},{'name':'Lowercase','bmp':"a-z\xAA\xB5\xBA\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02B8\u02C0\u02C1\u02E0-\u02E4\u0345\u0371\u0373\u0377\u037A-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1DBF\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u2071\u207F\u2090-\u209C\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2170-\u217F\u2184\u24D0-\u24E9\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7D\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B-\uA69D\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7BB\uA7BD\uA7BF\uA7C3\uA7C8\uA7CA\uA7F6\uA7F8-\uA7FA\uAB30-\uAB5A\uAB5C-\uAB68\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A",'astral':"\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD83A[\uDD22-\uDD43]"},{'name':'Noncharacter_Code_Point','bmp':"\uFDD0-\uFDEF\uFFFE\uFFFF",'astral':"[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]"},{'name':'Uppercase','bmp':"A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2160-\u216F\u2183\u24B6-\u24CF\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uA7BA\uA7BC\uA7BE\uA7C2\uA7C4-\uA7C7\uA7C9\uA7F5\uFF21-\uFF3A",'astral':"\uD801[\uDC00-\uDC27\uDCB0-\uDCD3]|\uD803[\uDC80-\uDCB2]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21]|\uD83C[\uDD30-\uDD49\uDD50-\uDD69\uDD70-\uDD89]"},{'name':'White_Space','bmp':"\t-\r \x85\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000"}];},{}],270:[function(require,module,exports){module.exports=[{'name':'Adlam','astral':"\uD83A[\uDD00-\uDD4B\uDD50-\uDD59\uDD5E\uDD5F]"},{'name':'Ahom','astral':"\uD805[\uDF00-\uDF1A\uDF1D-\uDF2B\uDF30-\uDF3F]"},{'name':'Anatolian_Hieroglyphs','astral':"\uD811[\uDC00-\uDE46]"},{'name':'Arabic','bmp':"\u0600-\u0604\u0606-\u060B\u060D-\u061A\u061C\u061E\u0620-\u063F\u0641-\u064A\u0656-\u066F\u0671-\u06DC\u06DE-\u06FF\u0750-\u077F\u08A0-\u08B4\u08B6-\u08C7\u08D3-\u08E1\u08E3-\u08FF\uFB50-\uFBC1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFD\uFE70-\uFE74\uFE76-\uFEFC",'astral':"\uD803[\uDE60-\uDE7E]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB\uDEF0\uDEF1]"},{'name':'Armenian','bmp':"\u0531-\u0556\u0559-\u058A\u058D-\u058F\uFB13-\uFB17"},{'name':'Avestan','astral':"\uD802[\uDF00-\uDF35\uDF39-\uDF3F]"},{'name':'Balinese','bmp':"\u1B00-\u1B4B\u1B50-\u1B7C"},{'name':'Bamum','bmp':"\uA6A0-\uA6F7",'astral':"\uD81A[\uDC00-\uDE38]"},{'name':'Bassa_Vah','astral':"\uD81A[\uDED0-\uDEED\uDEF0-\uDEF5]"},{'name':'Batak','bmp':"\u1BC0-\u1BF3\u1BFC-\u1BFF"},{'name':'Bengali','bmp':"\u0980-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09FE"},{'name':'Bhaiksuki','astral':"\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC45\uDC50-\uDC6C]"},{'name':'Bopomofo','bmp':"\u02EA\u02EB\u3105-\u312F\u31A0-\u31BF"},{'name':'Brahmi','astral':"\uD804[\uDC00-\uDC4D\uDC52-\uDC6F\uDC7F]"},{'name':'Braille','bmp':"\u2800-\u28FF"},{'name':'Buginese','bmp':"\u1A00-\u1A1B\u1A1E\u1A1F"},{'name':'Buhid','bmp':"\u1740-\u1753"},{'name':'Canadian_Aboriginal','bmp':"\u1400-\u167F\u18B0-\u18F5"},{'name':'Carian','astral':"\uD800[\uDEA0-\uDED0]"},{'name':'Caucasian_Albanian','astral':"\uD801[\uDD30-\uDD63\uDD6F]"},{'name':'Chakma','astral':"\uD804[\uDD00-\uDD34\uDD36-\uDD47]"},{'name':'Cham','bmp':"\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA5C-\uAA5F"},{'name':'Cherokee','bmp':"\u13A0-\u13F5\u13F8-\u13FD\uAB70-\uABBF"},{'name':'Chorasmian','astral':"\uD803[\uDFB0-\uDFCB]"},{'name':'Common','bmp':"\0-@\\[-`\\{-\xA9\xAB-\xB9\xBB-\xBF\xD7\xF7\u02B9-\u02DF\u02E5-\u02E9\u02EC-\u02FF\u0374\u037E\u0385\u0387\u0605\u060C\u061B\u061F\u0640\u06DD\u08E2\u0964\u0965\u0E3F\u0FD5-\u0FD8\u10FB\u16EB-\u16ED\u1735\u1736\u1802\u1803\u1805\u1CD3\u1CE1\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5-\u1CF7\u1CFA\u2000-\u200B\u200E-\u2064\u2066-\u2070\u2074-\u207E\u2080-\u208E\u20A0-\u20BF\u2100-\u2125\u2127-\u2129\u212C-\u2131\u2133-\u214D\u214F-\u215F\u2189-\u218B\u2190-\u2426\u2440-\u244A\u2460-\u27FF\u2900-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2E00-\u2E52\u2FF0-\u2FFB\u3000-\u3004\u3006\u3008-\u3020\u3030-\u3037\u303C-\u303F\u309B\u309C\u30A0\u30FB\u30FC\u3190-\u319F\u31C0-\u31E3\u3220-\u325F\u327F-\u32CF\u32FF\u3358-\u33FF\u4DC0-\u4DFF\uA700-\uA721\uA788-\uA78A\uA830-\uA839\uA92E\uA9CF\uAB5B\uAB6A\uAB6B\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE66\uFE68-\uFE6B\uFEFF\uFF01-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFF70\uFF9E\uFF9F\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFF9-\uFFFD",'astral':"\uD800[\uDD00-\uDD02\uDD07-\uDD33\uDD37-\uDD3F\uDD90-\uDD9C\uDDD0-\uDDFC\uDEE1-\uDEFB]|\uD81B[\uDFE2\uDFE3]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD66\uDD6A-\uDD7A\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDEE0-\uDEF3\uDF00-\uDF56\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDFCB\uDFCE-\uDFFF]|\uD83B[\uDC71-\uDCB4\uDD01-\uDD3D]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD00-\uDDAD\uDDE6-\uDDFF\uDE01\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEE0-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF73\uDF80-\uDFD8\uDFE0-\uDFEB]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDD78\uDD7A-\uDDCB\uDDCD-\uDE53\uDE60-\uDE6D\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6\uDF00-\uDF92\uDF94-\uDFCA\uDFF0-\uDFF9]|\uDB40[\uDC01\uDC20-\uDC7F]"},{'name':'Coptic','bmp':"\u03E2-\u03EF\u2C80-\u2CF3\u2CF9-\u2CFF"},{'name':'Cuneiform','astral':"\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC70-\uDC74\uDC80-\uDD43]"},{'name':'Cypriot','astral':"\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F]"},{'name':'Cyrillic','bmp':"\u0400-\u0484\u0487-\u052F\u1C80-\u1C88\u1D2B\u1D78\u2DE0-\u2DFF\uA640-\uA69F\uFE2E\uFE2F"},{'name':'Deseret','astral':"\uD801[\uDC00-\uDC4F]"},{'name':'Devanagari','bmp':"\u0900-\u0950\u0955-\u0963\u0966-\u097F\uA8E0-\uA8FF"},{'name':'Dives_Akuru','astral':"\uD806[\uDD00-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD35\uDD37\uDD38\uDD3B-\uDD46\uDD50-\uDD59]"},{'name':'Dogra','astral':"\uD806[\uDC00-\uDC3B]"},{'name':'Duployan','astral':"\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9C-\uDC9F]"},{'name':'Egyptian_Hieroglyphs','astral':"\uD80C[\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E\uDC30-\uDC38]"},{'name':'Elbasan','astral':"\uD801[\uDD00-\uDD27]"},{'name':'Elymaic','astral':"\uD803[\uDFE0-\uDFF6]"},{'name':'Ethiopic','bmp':"\u1200-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u137C\u1380-\u1399\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E"},{'name':'Georgian','bmp':"\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u10FF\u1C90-\u1CBA\u1CBD-\u1CBF\u2D00-\u2D25\u2D27\u2D2D"},{'name':'Glagolitic','bmp':"\u2C00-\u2C2E\u2C30-\u2C5E",'astral':"\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]"},{'name':'Gothic','astral':"\uD800[\uDF30-\uDF4A]"},{'name':'Grantha','astral':"\uD804[\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]"},{'name':'Greek','bmp':"\u0370-\u0373\u0375-\u0377\u037A-\u037D\u037F\u0384\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03E1\u03F0-\u03FF\u1D26-\u1D2A\u1D5D-\u1D61\u1D66-\u1D6A\u1DBF\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FC4\u1FC6-\u1FD3\u1FD6-\u1FDB\u1FDD-\u1FEF\u1FF2-\u1FF4\u1FF6-\u1FFE\u2126\uAB65",'astral':"\uD800[\uDD40-\uDD8E\uDDA0]|\uD834[\uDE00-\uDE45]"},{'name':'Gujarati','bmp':"\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AF1\u0AF9-\u0AFF"},{'name':'Gunjala_Gondi','astral':"\uD807[\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD98\uDDA0-\uDDA9]"},{'name':'Gurmukhi','bmp':"\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A76"},{'name':'Han','bmp':"\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DBF\u4E00-\u9FFC\uF900-\uFA6D\uFA70-\uFAD9",'astral':"\uD81B[\uDFF0\uDFF1]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A]"},{'name':'Hangul','bmp':"\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC"},{'name':'Hanifi_Rohingya','astral':"\uD803[\uDD00-\uDD27\uDD30-\uDD39]"},{'name':'Hanunoo','bmp':"\u1720-\u1734"},{'name':'Hatran','astral':"\uD802[\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDCFF]"},{'name':'Hebrew','bmp':"\u0591-\u05C7\u05D0-\u05EA\u05EF-\u05F4\uFB1D-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFB4F"},{'name':'Hiragana','bmp':"\u3041-\u3096\u309D-\u309F",'astral':"\uD82C[\uDC01-\uDD1E\uDD50-\uDD52]|\uD83C\uDE00"},{'name':'Imperial_Aramaic','astral':"\uD802[\uDC40-\uDC55\uDC57-\uDC5F]"},{'name':'Inherited','bmp':"\u0300-\u036F\u0485\u0486\u064B-\u0655\u0670\u0951-\u0954\u1AB0-\u1AC0\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u200C\u200D\u20D0-\u20F0\u302A-\u302D\u3099\u309A\uFE00-\uFE0F\uFE20-\uFE2D",'astral':"\uD800[\uDDFD\uDEE0]|\uD804\uDF3B|\uD834[\uDD67-\uDD69\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD]|\uDB40[\uDD00-\uDDEF]"},{'name':'Inscriptional_Pahlavi','astral':"\uD802[\uDF60-\uDF72\uDF78-\uDF7F]"},{'name':'Inscriptional_Parthian','astral':"\uD802[\uDF40-\uDF55\uDF58-\uDF5F]"},{'name':'Javanese','bmp':"\uA980-\uA9CD\uA9D0-\uA9D9\uA9DE\uA9DF"},{'name':'Kaithi','astral':"\uD804[\uDC80-\uDCC1\uDCCD]"},{'name':'Kannada','bmp':"\u0C80-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2"},{'name':'Katakana','bmp':"\u30A1-\u30FA\u30FD-\u30FF\u31F0-\u31FF\u32D0-\u32FE\u3300-\u3357\uFF66-\uFF6F\uFF71-\uFF9D",'astral':"\uD82C[\uDC00\uDD64-\uDD67]"},{'name':'Kayah_Li','bmp':"\uA900-\uA92D\uA92F"},{'name':'Kharoshthi','astral':"\uD802[\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE38-\uDE3A\uDE3F-\uDE48\uDE50-\uDE58]"},{'name':'Khitan_Small_Script','astral':"\uD81B\uDFE4|\uD822[\uDF00-\uDFFF]|\uD823[\uDC00-\uDCD5]"},{'name':'Khmer','bmp':"\u1780-\u17DD\u17E0-\u17E9\u17F0-\u17F9\u19E0-\u19FF"},{'name':'Khojki','astral':"\uD804[\uDE00-\uDE11\uDE13-\uDE3E]"},{'name':'Khudawadi','astral':"\uD804[\uDEB0-\uDEEA\uDEF0-\uDEF9]"},{'name':'Lao','bmp':"\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF"},{'name':'Latin','bmp':"A-Za-z\xAA\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u02E0-\u02E4\u1D00-\u1D25\u1D2C-\u1D5C\u1D62-\u1D65\u1D6B-\u1D77\u1D79-\u1DBE\u1E00-\u1EFF\u2071\u207F\u2090-\u209C\u212A\u212B\u2132\u214E\u2160-\u2188\u2C60-\u2C7F\uA722-\uA787\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA7FF\uAB30-\uAB5A\uAB5C-\uAB64\uAB66-\uAB69\uFB00-\uFB06\uFF21-\uFF3A\uFF41-\uFF5A"},{'name':'Lepcha','bmp':"\u1C00-\u1C37\u1C3B-\u1C49\u1C4D-\u1C4F"},{'name':'Limbu','bmp':"\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1940\u1944-\u194F"},{'name':'Linear_A','astral':"\uD801[\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]"},{'name':'Linear_B','astral':"\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA]"},{'name':'Lisu','bmp':"\uA4D0-\uA4FF",'astral':"\uD807\uDFB0"},{'name':'Lycian','astral':"\uD800[\uDE80-\uDE9C]"},{'name':'Lydian','astral':"\uD802[\uDD20-\uDD39\uDD3F]"},{'name':'Mahajani','astral':"\uD804[\uDD50-\uDD76]"},{'name':'Makasar','astral':"\uD807[\uDEE0-\uDEF8]"},{'name':'Malayalam','bmp':"\u0D00-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4F\u0D54-\u0D63\u0D66-\u0D7F"},{'name':'Mandaic','bmp':"\u0840-\u085B\u085E"},{'name':'Manichaean','astral':"\uD802[\uDEC0-\uDEE6\uDEEB-\uDEF6]"},{'name':'Marchen','astral':"\uD807[\uDC70-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6]"},{'name':'Masaram_Gondi','astral':"\uD807[\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]"},{'name':'Medefaidrin','astral':"\uD81B[\uDE40-\uDE9A]"},{'name':'Meetei_Mayek','bmp':"\uAAE0-\uAAF6\uABC0-\uABED\uABF0-\uABF9"},{'name':'Mende_Kikakui','astral':"\uD83A[\uDC00-\uDCC4\uDCC7-\uDCD6]"},{'name':'Meroitic_Cursive','astral':"\uD802[\uDDA0-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDDFF]"},{'name':'Meroitic_Hieroglyphs','astral':"\uD802[\uDD80-\uDD9F]"},{'name':'Miao','astral':"\uD81B[\uDF00-\uDF4A\uDF4F-\uDF87\uDF8F-\uDF9F]"},{'name':'Modi','astral':"\uD805[\uDE00-\uDE44\uDE50-\uDE59]"},{'name':'Mongolian','bmp':"\u1800\u1801\u1804\u1806-\u180E\u1810-\u1819\u1820-\u1878\u1880-\u18AA",'astral':"\uD805[\uDE60-\uDE6C]"},{'name':'Mro','astral':"\uD81A[\uDE40-\uDE5E\uDE60-\uDE69\uDE6E\uDE6F]"},{'name':'Multani','astral':"\uD804[\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA9]"},{'name':'Myanmar','bmp':"\u1000-\u109F\uA9E0-\uA9FE\uAA60-\uAA7F"},{'name':'Nabataean','astral':"\uD802[\uDC80-\uDC9E\uDCA7-\uDCAF]"},{'name':'Nandinagari','astral':"\uD806[\uDDA0-\uDDA7\uDDAA-\uDDD7\uDDDA-\uDDE4]"},{'name':'New_Tai_Lue','bmp':"\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u19DE\u19DF"},{'name':'Newa','astral':"\uD805[\uDC00-\uDC5B\uDC5D-\uDC61]"},{'name':'Nko','bmp':"\u07C0-\u07FA\u07FD-\u07FF"},{'name':'Nushu','astral':"\uD81B\uDFE1|\uD82C[\uDD70-\uDEFB]"},{'name':'Nyiakeng_Puachue_Hmong','astral':"\uD838[\uDD00-\uDD2C\uDD30-\uDD3D\uDD40-\uDD49\uDD4E\uDD4F]"},{'name':'Ogham','bmp':"\u1680-\u169C"},{'name':'Ol_Chiki','bmp':"\u1C50-\u1C7F"},{'name':'Old_Hungarian','astral':"\uD803[\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDCFF]"},{'name':'Old_Italic','astral':"\uD800[\uDF00-\uDF23\uDF2D-\uDF2F]"},{'name':'Old_North_Arabian','astral':"\uD802[\uDE80-\uDE9F]"},{'name':'Old_Permic','astral':"\uD800[\uDF50-\uDF7A]"},{'name':'Old_Persian','astral':"\uD800[\uDFA0-\uDFC3\uDFC8-\uDFD5]"},{'name':'Old_Sogdian','astral':"\uD803[\uDF00-\uDF27]"},{'name':'Old_South_Arabian','astral':"\uD802[\uDE60-\uDE7F]"},{'name':'Old_Turkic','astral':"\uD803[\uDC00-\uDC48]"},{'name':'Oriya','bmp':"\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B77"},{'name':'Osage','astral':"\uD801[\uDCB0-\uDCD3\uDCD8-\uDCFB]"},{'name':'Osmanya','astral':"\uD801[\uDC80-\uDC9D\uDCA0-\uDCA9]"},{'name':'Pahawh_Hmong','astral':"\uD81A[\uDF00-\uDF45\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]"},{'name':'Palmyrene','astral':"\uD802[\uDC60-\uDC7F]"},{'name':'Pau_Cin_Hau','astral':"\uD806[\uDEC0-\uDEF8]"},{'name':'Phags_Pa','bmp':"\uA840-\uA877"},{'name':'Phoenician','astral':"\uD802[\uDD00-\uDD1B\uDD1F]"},{'name':'Psalter_Pahlavi','astral':"\uD802[\uDF80-\uDF91\uDF99-\uDF9C\uDFA9-\uDFAF]"},{'name':'Rejang','bmp':"\uA930-\uA953\uA95F"},{'name':'Runic','bmp':"\u16A0-\u16EA\u16EE-\u16F8"},{'name':'Samaritan','bmp':"\u0800-\u082D\u0830-\u083E"},{'name':'Saurashtra','bmp':"\uA880-\uA8C5\uA8CE-\uA8D9"},{'name':'Sharada','astral':"\uD804[\uDD80-\uDDDF]"},{'name':'Shavian','astral':"\uD801[\uDC50-\uDC7F]"},{'name':'Siddham','astral':"\uD805[\uDD80-\uDDB5\uDDB8-\uDDDD]"},{'name':'SignWriting','astral':"\uD836[\uDC00-\uDE8B\uDE9B-\uDE9F\uDEA1-\uDEAF]"},{'name':'Sinhala','bmp':"\u0D81-\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF4",'astral':"\uD804[\uDDE1-\uDDF4]"},{'name':'Sogdian','astral':"\uD803[\uDF30-\uDF59]"},{'name':'Sora_Sompeng','astral':"\uD804[\uDCD0-\uDCE8\uDCF0-\uDCF9]"},{'name':'Soyombo','astral':"\uD806[\uDE50-\uDEA2]"},{'name':'Sundanese','bmp':"\u1B80-\u1BBF\u1CC0-\u1CC7"},{'name':'Syloti_Nagri','bmp':"\uA800-\uA82C"},{'name':'Syriac','bmp':"\u0700-\u070D\u070F-\u074A\u074D-\u074F\u0860-\u086A"},{'name':'Tagalog','bmp':"\u1700-\u170C\u170E-\u1714"},{'name':'Tagbanwa','bmp':"\u1760-\u176C\u176E-\u1770\u1772\u1773"},{'name':'Tai_Le','bmp':"\u1950-\u196D\u1970-\u1974"},{'name':'Tai_Tham','bmp':"\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA0-\u1AAD"},{'name':'Tai_Viet','bmp':"\uAA80-\uAAC2\uAADB-\uAADF"},{'name':'Takri','astral':"\uD805[\uDE80-\uDEB8\uDEC0-\uDEC9]"},{'name':'Tamil','bmp':"\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BFA",'astral':"\uD807[\uDFC0-\uDFF1\uDFFF]"},{'name':'Tangut','astral':"\uD81B\uDFE0|[\uD81C-\uD820][\uDC00-\uDFFF]|\uD821[\uDC00-\uDFF7]|\uD822[\uDC00-\uDEFF]|\uD823[\uDD00-\uDD08]"},{'name':'Telugu','bmp':"\u0C00-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C77-\u0C7F"},{'name':'Thaana','bmp':"\u0780-\u07B1"},{'name':'Thai','bmp':"\u0E01-\u0E3A\u0E40-\u0E5B"},{'name':'Tibetan','bmp':"\u0F00-\u0F47\u0F49-\u0F6C\u0F71-\u0F97\u0F99-\u0FBC\u0FBE-\u0FCC\u0FCE-\u0FD4\u0FD9\u0FDA"},{'name':'Tifinagh','bmp':"\u2D30-\u2D67\u2D6F\u2D70\u2D7F"},{'name':'Tirhuta','astral':"\uD805[\uDC80-\uDCC7\uDCD0-\uDCD9]"},{'name':'Ugaritic','astral':"\uD800[\uDF80-\uDF9D\uDF9F]"},{'name':'Vai','bmp':"\uA500-\uA62B"},{'name':'Wancho','astral':"\uD838[\uDEC0-\uDEF9\uDEFF]"},{'name':'Warang_Citi','astral':"\uD806[\uDCA0-\uDCF2\uDCFF]"},{'name':'Yezidi','astral':"\uD803[\uDE80-\uDEA9\uDEAB-\uDEAD\uDEB0\uDEB1]"},{'name':'Yi','bmp':"\uA000-\uA48C\uA490-\uA4C6"},{'name':'Zanabazar_Square','astral':"\uD806[\uDE00-\uDE47]"}];},{}],271:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _load=_interopRequireDefault(require("./load"));/**
	 * Class for working with categories and features.
	 * Categories are groupings of terms.
	 * A term can be present in multiple categories. Category ranking is used to determine which feature value to prioritize.
	 * Features are arbitrary properties (font, color) that are associated with each category.
	 * @memberof Spyral
	 * @class
	 */var Categories=/*#__PURE__*/function(){/**
	   * Construct a new Categories class.
	   * @constructor
	   * @param {Object} config
	   * @param {Object} config.categories
	   * @param {Array} config.categoriesRanking
	   * @param {Object} config.features
	   * @param {Object} config.featureDefaults
	   * @returns {Spyral.Categories}
	   */function Categories(){var _ref=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{categories:{},categoriesRanking:[],features:{},featureDefaults:{}},categories=_ref.categories,categoriesRanking=_ref.categoriesRanking,features=_ref.features,featureDefaults=_ref.featureDefaults;(0, _classCallCheck2["default"])(this,Categories);this.categories=categories;this.categoriesRanking=categoriesRanking;this.features=features;this.featureDefaults=featureDefaults;}/**
	   * Get the categories.
	   * @returns {Object}
	   */(0, _createClass2["default"])(Categories,[{key:"getCategories",value:function getCategories(){return this.categories;}/**
	     * Get category names as an array.
	     * @returns {Array}
	     */},{key:"getCategoryNames",value:function getCategoryNames(){return Object.keys(this.getCategories());}/**
	     * Get the terms for a category.
	     * @param {string} name The category name
	     * @returns {Array}
	     */},{key:"getCategoryTerms",value:function getCategoryTerms(name){return this.categories[name];}/**
	     * Add a new category.
	     * @param {string} name The category name
	     */},{key:"addCategory",value:function addCategory(name){if(this.categories[name]===undefined){this.categories[name]=[];this.categoriesRanking.push(name);}}/**
	     * Rename a category.
	     * @param {string} oldName The old category name
	     * @param {string} newName The new category name
	     */},{key:"renameCategory",value:function renameCategory(oldName,newName){if(oldName!==newName){var terms=this.getCategoryTerms(oldName);var ranking=this.getCategoryRanking(oldName);this.addTerms(newName,terms);for(var feature in this.features){var value=this.features[feature][oldName];this.setCategoryFeature(newName,feature,value);}this.removeCategory(oldName);this.setCategoryRanking(newName,ranking);}}/**
	     * Remove a category.
	     * @param {string} name The category name
	     */},{key:"removeCategory",value:function removeCategory(name){delete this.categories[name];var index=this.categoriesRanking.indexOf(name);if(index!==-1){this.categoriesRanking.splice(index,1);}for(var feature in this.features){delete this.features[feature][name];}}/**
	     * Gets the ranking for a category.
	     * @param {string} name The category name
	     * @returns {number}
	     */},{key:"getCategoryRanking",value:function getCategoryRanking(name){var ranking=this.categoriesRanking.indexOf(name);if(ranking===-1){return undefined;}else {return ranking;}}/**
	     * Sets the ranking for a category.
	     * @param {string} name The category name
	     * @param {number} ranking The category ranking
	     */},{key:"setCategoryRanking",value:function setCategoryRanking(name,ranking){if(this.categories[name]!==undefined){ranking=Math.min(this.categoriesRanking.length-1,Math.max(0,ranking));var index=this.categoriesRanking.indexOf(name);if(index!==-1){this.categoriesRanking.splice(index,1);}this.categoriesRanking.splice(ranking,0,name);}}/**
	     * Add a term to a category.
	     * @param {string} category The category name
	     * @param {string} term The term
	     */},{key:"addTerm",value:function addTerm(category,term){this.addTerms(category,[term]);}/**
	     * Add multiple terms to a category.
	     * @param {string} category The category name
	     * @param {Array} terms An array of terms
	     */},{key:"addTerms",value:function addTerms(category,terms){if(!Array.isArray(terms)){terms=[terms];}if(this.categories[category]===undefined){this.addCategory(category);}for(var i=0;i<terms.length;i++){var term=terms[i];if(this.categories[category].indexOf(term)===-1){this.categories[category].push(term);}}}/**
	     * Remove a term from a category.
	     * @param {string} category The category name
	     * @param {string} term The term
	     */},{key:"removeTerm",value:function removeTerm(category,term){this.removeTerms(category,[term]);}/**
	     * Remove multiple terms from a category.
	     * @param {string} category The category name
	     * @param {Array} terms An array of terms
	     */},{key:"removeTerms",value:function removeTerms(category,terms){if(!Array.isArray(terms)){terms=[terms];}if(this.categories[category]!==undefined){for(var i=0;i<terms.length;i++){var term=terms[i];var index=this.categories[category].indexOf(term);if(index!==-1){this.categories[category].splice(index,1);}}}}/**
	     * Get the category that a term belongs to, taking ranking into account.
	     * @param {string} term The term
	     * @returns {string}
	     */},{key:"getCategoryForTerm",value:function getCategoryForTerm(term){var ranking=Number.MAX_VALUE;var cat=undefined;for(var category in this.categories){if(this.categories[category].indexOf(term)!==-1&&this.getCategoryRanking(category)<ranking){ranking=this.getCategoryRanking(category);cat=category;}}return cat;}/**
	     * Get all the categories a term belongs to.
	     * @param {string} term The term
	     * @returns {Array}
	     */},{key:"getCategoriesForTerm",value:function getCategoriesForTerm(term){var cats=[];for(var category in this.categories){if(this.categories[category].indexOf(term)!==-1){cats.push(category);}}return cats;}/**
	     * Get the feature for a term.
	     * @param {string} feature The feature
	     * @param {string} term The term
	     * @returns {*}
	     */},{key:"getFeatureForTerm",value:function getFeatureForTerm(feature,term){return this.getCategoryFeature(this.getCategoryForTerm(term),feature);}/**
	     * Get the features.
	     * @returns {Object}
	     */},{key:"getFeatures",value:function getFeatures(){return this.features;}/**
	     * Add a feature.
	     * @param {string} name The feature name
	     * @param {*} defaultValue The default value
	     */},{key:"addFeature",value:function addFeature(name,defaultValue){if(this.features[name]===undefined){this.features[name]={};}if(defaultValue!==undefined){this.featureDefaults[name]=defaultValue;}}/**
	     * Remove a feature.
	     * @param {string} name The feature name
	     */},{key:"removeFeature",value:function removeFeature(name){delete this.features[name];delete this.featureDefaults[name];}/**
	     * Set the feature for a category.
	     * @param {string} categoryName The category name
	     * @param {string} featureName The feature name
	     * @param {*} featureValue The feature value
	     */},{key:"setCategoryFeature",value:function setCategoryFeature(categoryName,featureName,featureValue){if(this.features[featureName]===undefined){this.addFeature(featureName);}this.features[featureName][categoryName]=featureValue;}/**
	     * Get the feature for a category.
	     * @param {string} categoryName The category name
	     * @param {string} featureName The feature name
	     * @returns {*}
	     */},{key:"getCategoryFeature",value:function getCategoryFeature(categoryName,featureName){var value=undefined;if(this.features[featureName]!==undefined){value=this.features[featureName][categoryName];if(value===undefined){value=this.featureDefaults[featureName];if(typeof value==='function'){value=value();}}}return value;}/**
	     * Get a copy of the category and feature data.
	     * @returns {Object}
	     */},{key:"getCategoryExportData",value:function getCategoryExportData(){return {categories:Object.assign({},this.categories),categoriesRanking:this.categoriesRanking.map(function(x){return x;}),features:Object.assign({},this.features)};}/**
	     * Save the categories (if we're in a recognized environment).
	     * @param {Object} config for the network call (specifying if needed the location of Trombone, etc., see {@link Spyral.Load#trombone}
	     * @returns {Promise<string>} this returns a promise which eventually resolves to a string that is the ID reference for the stored categories
	     */},{key:"save",value:function save(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var api=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};var categoriesData=JSON.stringify(this.getCategoryExportData());return _load["default"].trombone(api,Object.assign(config,{tool:'resource.StoredCategories',storeResource:categoriesData})).then(function(data){return data.storedCategories.id;});}/**
	     * Load the categories (if we're in a recognized environment).
	     * 
	     * In its simplest form this can be used with a single string ID to load:
	     * 	new Spyral.Categories().load("categories.en.txt")
	     * 
	     * Which is equivalent to:
	     * 	new Spyral.Categories().load({retrieveResourceId: "categories.en.txt"});
	     * 
	     * @param {(Object|String)} config an object specifying the parameters (see above)
	     * @param {Object} api an object specifying any parameters for the trombone call
	     * @returns {Promise<Object>} this first returns a promise and when the promise is resolved it returns this categories object (with the loaded data included)
	     */},{key:"load",value:function load(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var api=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};var me=this;if(typeof config==='string'){config={'retrieveResourceId':config};}if(!('retrieveResourceId'in config)){throw Error('You must provide a value for the retrieveResourceId parameter');}return _load["default"].trombone(api,Object.assign(config,{tool:'resource.StoredCategories'})).then(function(data){var cats=JSON.parse(data.storedCategories.resource);me.features=cats.features;me.categories=cats.categories;me.categoriesRanking=cats.categoriesRanking||[];if(me.categoriesRanking.length===0){for(var category in me.categories){me.categoriesRanking.push(category);}}return me;});}/**
	     * Load categories and return a promise that resolves to a new Spyral.Categories instance.
	     * 
	     * @param {(Object|String)} config an object specifying the parameters (see above)
	     * @param {Object} api an object specifying any parameters for the trombone call
	     * @returns {Promise<Object>} this first returns a promise and when the promise is resolved it returns this categories object (with the loaded data included)
	     */}],[{key:"load",value:function load(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var api=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};var categories=new Categories();return categories.load(config,api);}}]);return Categories;}();var _default=Categories;exports["default"]=_default;},{"./load":274,"@babel/runtime/helpers/classCallCheck":33,"@babel/runtime/helpers/createClass":35,"@babel/runtime/helpers/interopRequireDefault":37}],272:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));var _slicedToArray2=_interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _networkgraph=_interopRequireDefault(require("./networkgraph"));var _util=_interopRequireDefault(require("./util.js"));/* global Spyral, Highcharts */ /**
	 * The Chart class in Spyral.
	 * This class provides methods for creating a variety of charts.
	 * Charts are created using the [Highcharts Library](https://api.highcharts.com/highcharts/).
	 * Highcharts have many configuration options and Spyral.Chart helps to streamline the process.
	 * A simple example:
	 * 
	 * 	Spyral.Chart.line({ series: [{ data: [0,2,1,3] }] })
	 * 
	 * A more complex example:
	 * 
	 * 	Spyral.Chart.column({
	 * 		title: 'Wildflowers',
	 * 		series: [{
	 * 			name: 'Ontario',
	 * 			data: [13, 39, 139, 38]
	 * 		},{
	 * 			name: 'Quebec',
	 * 			data: [14, 33, 94, 30]
	 * 		}],
	 * 		xAxis: {
	 * 			title: 'Number of Petals',
	 * 			categories: [3, 4, 5, 6]
	 * 		}
	 * 	})
	 * 
	 * @memberof Spyral
	 * @class
	 */var Chart=/*#__PURE__*/function(){/**
	   * The Highcharts config object
	   * @typedef {Object} HighchartsConfig
	   * @property {(string|object)} title
	   * @property {(string|object)} subtitle
	   * @property {Object} credits
	   * @property {Object} xAxis
	   * @property {Object} yAxis
	   * @property {Object} chart
	   * @property {Array<HighchartsSeriesConfig>} series
	   * @property {Object} plotOptions
	   */ /**
	   * The series config object
	   * @typedef {Object} HighchartsSeriesConfig
	   * @property {Array} data
	   * @property {string} [name]
	   */ /**
	   * Construct a new Chart class
	   * @constructor
	   * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	   * @param {Array} data An array of data to visualize.
	   */function Chart(target,data){(0, _classCallCheck2["default"])(this,Chart);if(_util["default"].isNode(target)){if(target.isConnected===false){throw new Error('The target node does not exist within the document.');}}else if(_util["default"].isString(target)===false){data=target;target=undefined;}this.target=target;this.data=data;}/**
	   * Create a new chart.
	   * See [Highcharts API](https://api.highcharts.com/highcharts/) for full set of config options.
	   * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	   * @param {HighchartsConfig} config 
	   * @returns {Highcharts.Chart}
	   */(0, _createClass2["default"])(Chart,[{key:"create",value:function create(target,config){var _Chart$_handleTargetA=Chart._handleTargetAndConfig(target,config);var _Chart$_handleTargetA2=(0, _slicedToArray2["default"])(_Chart$_handleTargetA,2);target=_Chart$_handleTargetA2[0];config=_Chart$_handleTargetA2[1];return Highcharts.chart(target,config);}/**
	     * Create a new chart.
	     * See [Highcharts API](https://api.highcharts.com/highcharts/) for full set of config options.
	     * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	     * @param {HighchartsConfig} config 
	     * @returns {Highcharts.Chart}
	     */},{key:"bar",/**
	     * Create a bar chart
	     * @param {Object} [config]
	     * @returns {Highcharts.Chart}
	     */value:function bar(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};Chart.setSeriesData(config,this.data);return Chart.bar(this.target,config);}/**
	     * Create a bar chart
	     * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	     * @param {Object} config 
	     * @returns {Highcharts.Chart}
	     */},{key:"column",/**
	     * Create a column chart
	     * @param {Object} [config]
	     * @returns {Highcharts.Chart}
	     */value:function column(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};Chart.setSeriesData(config,this.data);return Chart.column(this.target,config);}/**
	     * Create a column chart
	     * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	     * @param {Object} config 
	     * @returns {Highcharts.Chart}
	     */},{key:"line",/**
	     * Create a line chart
	     * @param {Object} [config]
	     * @returns {Highcharts.Chart}
	     */value:function line(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};Chart.setSeriesData(config,this.data);return Chart.line(this.target,config);}/**
	     * Create a line chart
	     * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	     * @param {Object} config 
	     * @returns {Highcharts.Chart}
	     */},{key:"scatter",/**
	     * Create a scatter plot
	     * @param {Object} [config]
	     * @returns {Highcharts.Chart}
	     */value:function scatter(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};Chart.setSeriesData(config,this.data);return Chart.scatter(this.target,config);}/**
	     * Create a scatter plot
	     * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	     * @param {Object} config 
	     * @returns {Highcharts.Chart}
	     */},{key:"networkgraph",/**
	     * Create a network graph
	     * @param {Object} [config]
	     * @returns {Spyral.NetworkGraph}
	     */value:function networkgraph(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};return Chart.networkgraph(this.target,config);}/**
	     * Create a network graph
	     * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	     * @param {Object} config 
	     * @returns {Spyral.NetworkGraph}
	     */}],[{key:"create",value:function create(target,config){var _Chart$_handleTargetA3=Chart._handleTargetAndConfig(target,config);var _Chart$_handleTargetA4=(0, _slicedToArray2["default"])(_Chart$_handleTargetA3,2);target=_Chart$_handleTargetA4[0];config=_Chart$_handleTargetA4[1];return Highcharts.chart(target,config);}},{key:"_handleTargetAndConfig",value:function _handleTargetAndConfig(target,config){if(_util["default"].isNode(target)===false&&(0, _typeof2["default"])(target)==='object'){config=target;target=undefined;}if(target===undefined){if(typeof Spyral!=='undefined'&&Spyral.Notebook){target=Spyral.Notebook.getTarget();if(target.clientHeight<=40){target.style.height='400px';// 400 is the default Highcharts height
	}}else {target=document.createElement('div');document.body.appendChild(target);}}else {if(_util["default"].isNode(target)&&target.isConnected===false){throw new Error('The target node does not exist within the document.');}}// convert title and suppress if not provided
	if('title'in config){if(typeof config.title==='string'){config.title={text:config.title};}}else {config.title=false;}// convert subtitle and convert if not provided
	if('subtitle'in config){if(typeof config.subtitle==='string'){config.subtitle={text:config.subtitle};}}else {config.subtitle=false;}// convert credits
	if(!('credits'in config)){config.credits=false;}// suppress xAxis title unless provided
	if(!('xAxis'in config)){config.xAxis={};}if(!('title'in config.xAxis)){config.xAxis.title=false;}else if(typeof config.xAxis.title==='string'){config.xAxis.title={text:config.xAxis.title};}// suppress xAxis title unless provided
	if(!('yAxis'in config)){config.yAxis={};}if(!('title'in config.yAxis)){config.yAxis.title=false;}else if(typeof config.yAxis.title==='string'){config.yAxis.title={text:config.yAxis.title};}return [target,config];}},{key:"_setDefaultChartType",value:function _setDefaultChartType(config,type){if('type'in config){config.chart.type=config.type;delete config.type;return;}// TODO: check plot options and series?
	if('chart'in config){if('type'in config.chart){return;}// already set
	}else {config.chart={};}config.chart.type=type;return config;}/**
	     * Add the provided data to the config as a series
	     * @param {Object} config 
	     * @param {Array} data 
	     */},{key:"setSeriesData",value:function setSeriesData(config,data){if(Array.isArray(data)){if(Array.isArray(data[0])){config.series=data.map(function(subArray){return {data:subArray};});}else {config.series=[{data:data}];}}}},{key:"bar",value:function bar(target,config){var _Chart$_handleTargetA5=Chart._handleTargetAndConfig(target,config);var _Chart$_handleTargetA6=(0, _slicedToArray2["default"])(_Chart$_handleTargetA5,2);target=_Chart$_handleTargetA6[0];config=_Chart$_handleTargetA6[1];Chart._setDefaultChartType(config,'bar');return Highcharts.chart(target,config);}},{key:"column",value:function column(target,config){var _Chart$_handleTargetA7=Chart._handleTargetAndConfig(target,config);var _Chart$_handleTargetA8=(0, _slicedToArray2["default"])(_Chart$_handleTargetA7,2);target=_Chart$_handleTargetA8[0];config=_Chart$_handleTargetA8[1];Chart._setDefaultChartType(config,'column');return Highcharts.chart(target,config);}},{key:"line",value:function line(target,config){var _Chart$_handleTargetA9=Chart._handleTargetAndConfig(target,config);var _Chart$_handleTargetA10=(0, _slicedToArray2["default"])(_Chart$_handleTargetA9,2);target=_Chart$_handleTargetA10[0];config=_Chart$_handleTargetA10[1];Chart._setDefaultChartType(config,'line');return Highcharts.chart(target,config);}},{key:"scatter",value:function scatter(target,config){var _Chart$_handleTargetA11=Chart._handleTargetAndConfig(target,config);var _Chart$_handleTargetA12=(0, _slicedToArray2["default"])(_Chart$_handleTargetA11,2);target=_Chart$_handleTargetA12[0];config=_Chart$_handleTargetA12[1];Chart._setDefaultChartType(config,'scatter');return Highcharts.chart(target,config);}},{key:"networkgraph",value:function networkgraph(target,config){var _Chart$_handleTargetA13=Chart._handleTargetAndConfig(target,config);var _Chart$_handleTargetA14=(0, _slicedToArray2["default"])(_Chart$_handleTargetA13,2);target=_Chart$_handleTargetA14[0];config=_Chart$_handleTargetA14[1];return new _networkgraph["default"](target,config);}}]);return Chart;}();var _default=Chart;exports["default"]=_default;},{"./networkgraph":275,"./util.js":277,"@babel/runtime/helpers/classCallCheck":33,"@babel/runtime/helpers/createClass":35,"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/slicedToArray":42,"@babel/runtime/helpers/typeof":43}],273:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));var _regenerator=_interopRequireDefault(require("@babel/runtime/regenerator"));var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));var _load=_interopRequireDefault(require("./load"));var _util=_interopRequireDefault(require("./util.js"));var _ldaTopicModel=_interopRequireDefault(require("lda-topic-model"));function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);if(enumerableOnly)symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable;});keys.push.apply(keys,symbols);}return keys;}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?arguments[i]:{};if(i%2){ownKeys(Object(source),true).forEach(function(key){(0, _defineProperty2["default"])(target,key,source[key]);});}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(target,Object.getOwnPropertyDescriptors(source));}else {ownKeys(Object(source)).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key));});}}return target;}// this is essentially a private method to determine if we're in corpus or documents mode.
	// if docIndex or docId is defined, or if mode=="documents" then we're in documents mode
	function isDocumentsMode(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};return 'docIndex'in config||'docId'in config||'mode'in config&&config.mode==='documents';}/**
	 * The Corpus class in Spyral. Here's a simple example:
	 * 
	 * 	loadCorpus("Hello World!").summary();
	 * 
	 * This loads a corpus and returns an asynchronous `Promise`, but all of the methods
	 * of Corpus are appended to the Promise, so {@link #summary} will be called
	 * once the Corpus promise is fulfilled. It's equivalent to the following:
	 *
	 * 	loadCorpus("Hello World!").then(corpus -> corpus.summary());
	 *
	 * Have a look at the {@link #input} configuration for more examples.
	 * 
	 * There is a lot of flexibility in how corpora are created, here's a summary of the parameters:
	 * 
	 * - **sources**: {@link #corpus}, {@link #input}
	 * - **formats**:
	 * 	- **Text**: {@link #inputRemoveFrom}, {@link #inputRemoveFromAfter}, {@link #inputRemoveUntil}, {@link #inputRemoveUntilAfter}
	 * 	- **XML**: {@link #xmlAuthorXpath}, {@link #xmlCollectionXpath}, {@link #xmlContentXpath}, {@link #xmlExtraMetadataXpath}, {@link #xmlKeywordXpath}, {@link #xmlPubPlaceXpath}, {@link #xmlPublisherXpath}, {@link #xmlTitleXpath}
	 * 	- **Tables**: {@link #tableAuthor}, {@link #tableContent}, {@link #tableDocuments}, {@link #tableNoHeadersRow}, {@link #tableTitle}
	 * - **other**: {@link #inputFormat}, {@link #subTitle}, {@link #title}, {@link #tokenization}

	 * @memberof Spyral
	 * @class
	 */var Corpus=/*#__PURE__*/function(){/**
	   * @cfg {String} corpus The ID of a previously created corpus.
	   * 
	   * A corpus ID can be used to try to retrieve a corpus that has been previously created.
	   * Typically the corpus ID is used as a first string argument, with an optional second
	   * argument for other parameters (especially those to recreate the corpus if needed).
	   * 
	   * 	loadCorpus("goldbug");
	   *
	   * 	loadCorpus("goldbug", {
	   * 		// if corpus ID "goldbug" isn't found, use the input
	   * 		input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
	   * 		inputRemoveUntil: 'THE GOLD-BUG',
	   * 		inputRemoveFrom: 'FOUR BEASTS IN ONE'
	   * 	});
	   */ /**
	   * @cfg {(String|String[])} input Input sources for the corpus.
	   * 
	   * The input sources can be either normal text or URLs (starting with `http`).
	   * 
	   * Typically input sources are specified as a string or an array in the first argument, with an optional second argument for other parameters.
	   * 
	   * 		loadCorpus("Hello Voyant!"); // one document with this string
	   * 
	   * 		loadCorpus(["Hello Voyant!", "How are you?"]); // two documents with these strings
	   * 
	   * 		loadCorpus("http://hermeneuti.ca/"); // one document from URL
	   * 
	   * 		loadCorpus(["http://hermeneuti.ca/", "https://en.wikipedia.org/wiki/Voyant_Tools"]); // two documents from URLs
	   * 
	   * 		loadCorpus("Hello Voyant!", "http://hermeneuti.ca/"]); // two documents, one from string and one from URL
	   * 
	   * 		loadCorpus("https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt", {
	   * 			inputRemoveUntil: 'THE GOLD-BUG',
	   * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
	   * 		});
	   * 
	   * 		// use a corpus ID but also specify an input source if the corpus can't be found
	   * 		loadCorpus("goldbug", {
	   * 			input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
	   * 			inputRemoveUntil: 'THE GOLD-BUG',
	   * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
	   * 		});
	   */ /**
	   * @cfg {String} inputFormat The input format of the corpus (the default is to auto-detect).
	   * 
	   * The auto-detect format is usually reliable and inputFormat should only be used if the default
	   * behaviour isn't desired. Most of the relevant values are used for XML documents:
	   * 
	   * - **DTOC**: Dynamic Table of Contexts XML format
	   * - **HTML**: Hypertext Markup Language
	   * - **RSS**: Really Simple Syndication XML format
	   * - **TEI**: Text Encoding Initiative XML format
	   * - **TEICORPUS**: Text Encoding Initiative Corpus XML format
	   * - **TEXT**: plain text
	   * - **XML**: treat the document as XML (sometimes overridding auto-detect of XML vocabularies like RSS and TEI)
	   * 
	   * Other formats include **PDF**, **MSWORD**, **XLSX**, **RTF**, **ODT**, and **ZIP** (but again, these rarely need to be specified).
	   */ /**
	   * @cfg {String} tableDocuments Determine what is a document in a table (the entire table, by row, by column); only used for table-based documents.
	   * 
	   * Possible values are:
	   * 
	   * - **undefined or blank** (default): the entire table is one document
	   * - **rows**: each row of the table is a separate document
	   * - **columns**: each column of the table is a separate document
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */ /**
	   * @cfg {String} tableContent Determine how to extract body content from the table; only used for table-based documents.
	   * 
	   * Columns are referred to by numbers, the first is column 1 (not 0).
	   * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
	   * 
	   * Some examples:
	   * 
	   * - **1**: use column 1
	   * - **1,2**: use columns 1 and 2 separately
	   * - **1+2,3**: combine columns 1 and two and use column 3 separately
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */ /**
	   * @cfg {String} tableAuthor Determine how to extract the author from each document; only used for table-based documents.
	   * 
	   * Columns are referred to by numbers, the first is column 1 (not 0).
	   * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
	   * 
	   * Some examples:
	   * 
	   * - **1**: use column 1
	   * - **1,2**: use columns 1 and 2 separately
	   * - **1+2,3**: combine columns 1 and two and use column 3 separately
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */ /**
	   * @cfg {String} tableTitle Determine how to extract the title from each document; only used for table-based documents.
	   * 
	   * Columns are referred to by numbers, the first is column 1 (not 0).
	   * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
	   * 
	   * Some examples:
	   * 
	   * - **1**: use column 1
	   * - **1,2**: use columns 1 and 2 separately
	   * - **1+2,3**: combine columns 1 and two and use column 3 separately
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */ /**
	   * @cfg {String} tableNoHeadersRow Determine if the table has a first row of headers; only used for table-based documents.
	   * 
	   * Provide a value of "true" if there is no header row, otherwise leave it blank or undefined (default).
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */ /**
	   * @cfg {String} tokenization The tokenization strategy to use
	   * 
	   * This should usually be undefined, unless specific behaviour is required. These are the valid values:
	   * 
	   * - **undefined or blank**: use the default tokenization (which uses Unicode rules for word segmentation)
	   * - **wordBoundaries**: use any Unicode character word boundaries for tokenization
	   * - **whitespace**: tokenize by whitespace only (punctuation and other characters will be kept with words)
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tokenization).
	   */ /**
	   * @cfg {String} xmlContentXpath The XPath expression that defines the location of document content (the body); only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><head>Hello world!</head><body>This is Voyant!</body></doc>", {
	   * 			 xmlContentXpath: "//body"
	   * 		}); // document would be: "This is Voyant!"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */ /**
	   * @cfg {String} xmlTitleXpath The XPath expression that defines the location of each document's title; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><title>Hello world!</title><body>This is Voyant!</body></doc>", {
	   * 			 xmlTitleXpath: "//title"
	   * 		}); // title would be: "Hello world!"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */ /**
	   * @cfg {String} xmlAuthorXpath The XPath expression that defines the location of each document's author; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><author>Stéfan Sinclair</author><body>This is Voyant!</body></doc>", {
	   * 			 xmlAuthorXpath: "//author"
	   * 		}); // author would be: "Stéfan Sinclair"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */ /**
	   * @cfg {String} xmlPubPlaceXpath The XPath expression that defines the location of each document's publication place; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><pubPlace>Montreal</pubPlace><body>This is Voyant!</body></doc>", {
	   * 			 xmlPubPlaceXpath: "//pubPlace"
	   * 		}); // publication place would be: "Montreal"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */ /**
	   * @cfg {String} xmlPublisherXpath The XPath expression that defines the location of each document's publisher; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><publisher>The Owl</publisher><body>This is Voyant!</body></doc>", {
	   * 			 xmlPublisherXpath: "//publisher"
	   * 		}); // publisher would be: "The Owl"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */ /**
	   * @cfg {String} xmlKeywordXpath The XPath expression that defines the location of each document's keywords; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><keyword>text analysis</keyword><body>This is Voyant!</body></doc>", {
	   * 			 xmlKeywordXpath: "//keyword"
	   * 		}); // publisher would be: "text analysis"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */ /**
	   * @cfg {String} xmlCollectionXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><collection>documentation</collection><body>This is Voyant!</body></doc>", {
	   * 			 xmlCollectionXpath: "//collection"
	   * 		}); // publisher would be: "documentation"
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */ /**
	   * @cfg {String} xmlGroupByXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><sp s='Juliet'>Hello!</sp><sp s='Romeo'>Hi!</sp><sp s='Juliet'>Bye!</sp></doc>", {
	   * 			 xmlDocumentsXPath: '//sp',
	   *           xmlGroupByXpath: "//@s"
	   * 		}); // two docs: "Hello! Bye!" (Juliet) and "Hi!" (Romeo)
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */ /**
	   * @cfg {String} xmlExtraMetadataXpath A value that defines the location of other metadata; only used for XML-based documents.
	   * 
	   * 		loadCorpus("<doc><tool>Voyant</tool><phase>1</phase><body>This is Voyant!</body></doc>", {
	   * 			 xmlExtraMetadataXpath: "tool=//tool\nphase=//phase"
	   * 		}); // tool would be "Voyant" and phase would be "1"
	   * 
	   * Note that `xmlExtraMetadataXpath` is a bit different from the other XPath expressions in that it's
	   * possible to define multiple values (each on its own line) in the form of name=xpath.
	   * 
	   * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	   */ /**
	   * @cfg {String} xmlExtractorTemplate Pass the XML document through the XSL template located at the specified URL before extraction (this is ignored in XML-based documents).
	   * 
	   * This is an advanced parameter that allows you to define a URL of an XSL template that can
	   * be called *before* text extraction (in other words, the other XML-based parameters apply
	   * after this template has been processed).
	   */ /**
	   * @cfg {String} inputRemoveUntil Omit text up until the start of the matching regular expression (this is ignored in XML-based documents).
	   * 
	   * 		loadCorpus("Hello world! This is Voyant!", {
	   * 			 inputRemoveUntil: "This"
	   * 		}); // document would be: "This is Voyant!"
	   * 
	   * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	   */ /**
	   * @cfg {String} inputRemoveUntilAfter Omit text up until the end of the matching regular expression (this is ignored in XML-based documents).
	   * 
	   * 		loadCorpus("Hello world! This is Voyant!", {
	   * 			 inputRemoveUntilAfter: "world!"
	   * 		}); // document would be: "This is Voyant!"
	   * 
	   * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	   */ /**
	   * @cfg {String} inputRemoveFrom Omit text from the start of the matching regular expression (this is ignored in XML-based documents).
	   * 
	   * 		loadCorpus("Hello world! This is Voyant!", {
	   * 			 inputRemoveFrom: "This"
	   * 		}); // document would be: "Hello World!"
	   * 
	   * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	   */ /**
	   * @cfg {String} inputRemoveFromAfter Omit text from the end of the matching regular expression (this is ignored in XML-based documents).
	   * 
	   * 		loadCorpus("Hello world! This is Voyant!", {
	   * 			 inputRemoveFromAfter: "This"
	   * 		}); // document would be: "Hello World! This"
	   * 
	   * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	   */ /**
	   * @cfg {String} subTitle A sub-title for the corpus.
	   * 
	   * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a subtitle for later use.
	   */ /**
	   * @cfg {String} title A title for the corpus.
	   * 
	   * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a title for later use.
	   */ /**
	   * @cfg {String} curatorTsv a simple TSV of paths and labels for the DToC interface (this isn't typically used outside of the specialized DToC context).
	   *
	   * The DToC skin allows curation of XML tags and attributes in order to constrain the entries shown in the interface or to provide friendlier labels. This assumes plain text unicode input with one definition per line where the simple XPath expression is separated by a tab from a label.
	   *
	   *   	 p    	 paragraph
	   *   	 ref[@target*="religion"]    	 religion
	   *
	    * For more information see the DToC documentation on [Curating Tags](http://cwrc.ca/Documentation/public/index.html#DITA_Files-Various_Applications/DToC/CuratingTags.html)
	   */ /**
	   * Create a new Corpus using the specified Corpus ID
	   * @constructor
	   * @param {string} id The Corpus ID
	   */function Corpus(id){(0, _classCallCheck2["default"])(this,Corpus);this.corpusid=id;}(0, _createClass2["default"])(Corpus,[{key:"id",/**
	     * Returns the ID of the corpus.
	     * 
	     * @returns {Promise<string>} a Promise for the string ID of the corpus
	     */value:function id(){var me=this;return new Promise(function(resolve){return resolve(me.corpusid);});}/*
	     * Create a Corpus and return the ID
	     * @param {Object} config 
	     * @param {Object} api 
	     */ //	static id(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.id(api || config));
	//	}
	/**
	     * Returns the metadata object (of the corpus or document, depending on which mode is used).
	     * 
	     * The following is an example of the object return for the metadata of the Jane Austen corpus:
	     * 
	     * 	{
	     * 		"id": "b50407fd1cbbecec4315a8fc411bad3c",
	     * 		"alias": "austen",
	    	 * 		"title": "",
	     * 		"subTitle": "",
	     * 		"documentsCount": 8,
	     * 		"createdTime": 1582429585984,
	     * 		"createdDate": "2020-02-22T22:46:25.984-0500",
	     * 		"lexicalTokensCount": 781763,
	     * 		"lexicalTypesCount": 15368,
	     * 		"noPasswordAccess": "NORMAL",
	     * 		"languageCodes": [
	     * 			"en"
	     * 		]
	     * 	}
	     * 
	     * The following is an example of what is returned as metadata for the first document:
	     *
	     * 	[
	        * 		{
	        *   		"id": "ddac6b12c3f4261013c63d04e8d21b45",
	        *   		"extra.X-Parsed-By": "org.apache.tika.parser.DefaultParser",
	        *   		"tokensCount-lexical": "33559",
	        *   		"lastTokenStartOffset-lexical": "259750",
	        *   		"parent_modified": "1548457455000",
	        *   		"typesCount-lexical": "4235",
	        *   		"typesCountMean-lexical": "7.924203",
	        *   		"lastTokenPositionIndex-lexical": "33558",
	        *   		"index": "0",
	        *   		"language": "en",
	        *   		"sentencesCount": "1302",
	        *   		"source": "stream",
	        *   		"typesCountStdDev-lexical": "46.626404",
	        *   		"title": "1790 Love And Freindship",
	        *   		"parent_queryParameters": "VOYANT_BUILD=M16&textarea-1015-inputEl=Type+in+one+or+more+URLs+on+separate+lines+or+paste+in+a+full+text.&VOYANT_REMOTE_ID=199.229.249.196&accessIP=199.229.249.196&VOYANT_VERSION=2.4&palette=default&suppressTools=false",
	        *   		"extra.Content-Type": "text/plain; charset=windows-1252",
	        *   		"parentType": "expansion",
	        *   		"extra.Content-Encoding": "windows-1252",
	        *   		"parent_source": "file",
	        *   		"parent_id": "ae47e3a72cd3cad51e196e8a41e21aec",
	        *   		"modified": "1432861756000",
	        *   		"location": "1790 Love And Freindship.txt",
	        *   		"parent_title": "Austen",
	        *   		"parent_location": "Austen.zip"
	        * 		}
	        * 	]
	     * 
	     * In Corpus mode there's no reason to specify arguments. In documents mode you
	     * can request specific documents in the config object:
	     * 
	     *  * **start**: the zero-based start of the list
	     *  * **limit**: a limit to the number of items to return at a time
	     *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	     *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
	     *  * **query**: one or more term queries for the title, author or full-text
	     *  * **sort**: one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	     *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	     * 
	     *  An example:
	     *  
	     *  	// this would show the number 8 (the size of the corpus)
	     *  	loadCorpus("austen").metadata().then(metadata => metadata.documentsCount)
	     *  
	     * @param {Object} config an Object specifying parameters (see list above)
	     * @returns {Promise<object>} a Promise for an Object containing metadata
	     */},{key:"metadata",value:function metadata(config){return _load["default"].trombone(config,{tool:isDocumentsMode(config)?'corpus.DocumentsMetadata':'corpus.CorpusMetadata',corpus:this.corpusid}).then(function(data){return isDocumentsMode(config)?data.documentsMetadata.documents:data.corpus.metadata;});}/*
	     * Create a Corpus and return the metadata
	     * @param {*} config 
	     * @param {*} api 
	     */ //	static metadata(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.metadata(api || config));
	//	}
	/**
	     * Returns a brief summary of the corpus that includes essential metadata (documents count, terms count, etc.) 
	     * 
	     * An example:
	     * 
	     * 	loadCorpus("austen").summary();
	     * 
	     * @returns {Promise<string>} a Promise for a string containing a brief summary of the corpus metadata
	     */},{key:"summary",value:function summary(){return this.metadata().then(function(data){return "This corpus (".concat(data.alias?data.alias:data.id,") has ").concat(data.documentsCount.toLocaleString()," documents with ").concat(data.lexicalTokensCount.toLocaleString()," total words and ").concat(data.lexicalTypesCount.toLocaleString()," unique word forms.");});}/*
	     * Create a Corpus and return the summary
	     * @param {*} config 
	     * @param {*} api 
	     */ //	static summary(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.summary(api || config));
	//	}
	/**
	     * Returns an array of document titles for the corpus.
	     * 
	     * The following are valid in the config parameter:
	     * 
	     *  * **start**: the zero-based start of the list
	     *  * **limit**: a limit to the number of items to return at a time
	     *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	     *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
	     *  * **query**: one or more term queries for the title, author or full-text
	     *  * **sort**: one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	     *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	     * 
	     * An example:
	     *
	     * 	loadCorpus("austen").titles().then(titles => "The last work is: "+titles[titles.length-1])
	     *
	     * @param {Object} config an Object specifying parameters (see list above) 
	     * @param {number} config.start the zero-based start of the list
	     * @param {number} config.limit a limit to the number of items to return at a time
	     * @param {number} config.docIndex a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	     * @param {string} config.docId a set of document IDs; multiple documents can be separated by a comma
	     * @param {string} config.query one or more term queries for the title, author or full-text
	     * @param {string} config.sort one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	     * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	     * @returns {Promise<Array>} a Promise for an Array of document titles
	     */},{key:"titles",value:function titles(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};config.mode='documents';return this.metadata(config).then(function(data){return data.map(function(doc){return doc.title;});});}/**
	     * Returns an array of documents metadata for the corpus.
	     * 
	     * The following are valid in the config parameter:
	     * 
	     *  * **start**: the zero-based start of the list
	     *  * **limit**: a limit to the number of items to return at a time
	     *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	     *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
	     *  * **query**: one or more term queries for the title, author or full-text
	     *  * **sort**: one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	     *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	     * 
	     * @param {Object} config an Object specifying parameters (see list above) 
	     * @param {number} config.start the zero-based start of the list
	     * @param {number} config.limit a limit to the number of items to return at a time
	     * @param {number} config.docIndex a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	     * @param {string} config.docId a set of document IDs; multiple documents can be separated by a comma
	     * @param {string} config.query one or more term queries for the title, author or full-text
	     * @param {string} config.sort one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	     * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	     * @returns {Promise<Array>} a Promise for an Array of documents metadata
	     */},{key:"documents",value:function documents(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};config.mode='documents';return this.metadata(config);}/*
	     * Create a Corpus and return the titles
	     * @param {*} config 
	     * @param {*} api 
	     */ //	static titles(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.titles(api || config));
	//	}
	/**
	     * Returns the text of the entire corpus.
	     * 
	     * Texts are concatenated together with two new lines and three dashes (\\n\\n---\\n\\n)
	     * 
	     * The following are valid in the config parameter:
	     * 
	     * * **noMarkup**: strips away the markup
	     * * **compactSpace**: strips away superfluous spaces and multiple new lines
	     * * **limit**: a limit to the number of characters (per text)
	     * * **format**: `text` for plain text, any other value for the simplified Voyant markup
	     * 
	     * An example:
	     *
	     * 	// fetch 1000 characters from each text in the corpus into a single string
	     * 	loadCorpus("austen").text({limit:1000})
	     * 
	     * @param {Object} config an Object specifying parameters (see list above)
	     * @param {boolean} config.noMarkup strips away the markup
	     * @param {boolean} config.compactSpace strips away superfluous spaces and multiple new lines
	     * @param {number} config.limit a limit to the number of characters (per text)
	     * @param {string} config.format `text` for plain text, any other value for the simplified Voyant markup
	     * @returns {Promise<string>} a Promise for a string of the corpus
	     */},{key:"text",value:function text(config){return this.texts(config).then(function(data){return data.join('\n\n---\n\n');});}/*
	     * Create a Corpus and return the text
	     * @param {*} config 
	     * @param {*} api 
	     */ //	static text(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.text(api || config));	
	//	}
	/**
	     * Returns an array of texts from the entire corpus.
	     * 
	     * The following are valid in the config parameter:
	     * 
	     * * **noMarkup**: strips away the markup
	     * * **compactSpace**: strips away superfluous spaces and multiple new lines
	     * * **limit**: a limit to the number of characters (per text)
	     * * **format**: `text` for plain text, any other value for the simplified Voyant markup
	     * 
	     * An example:
	     *
	     * 	// fetch 1000 characters from each text in the corpus into an Array
	     * 	loadCorpus("austen").texts({limit:1000})
	     * 
	     * @param {Object} config an Object specifying parameters (see list above)
	     * @param {boolean} config.noMarkup strips away the markup
	     * @param {boolean} config.compactSpace strips away superfluous spaces and multiple new lines
	     * @param {number} config.limit a limit to the number of characters (per text)
	     * @param {string} config.format `text` for plain text, any other value for the simplified Voyant markup
	     * @returns {Promise<Array>} a Promise for an Array of texts from the corpus
	     */},{key:"texts",value:function texts(config){return _load["default"].trombone(config,{tool:'corpus.CorpusTexts',corpus:this.corpusid}).then(function(data){return data.texts.texts;});}/*
	     * Create a Corpus and return the texts
	     * @param {*} config 
	     * @param {*} api 
	     */ //	static texts(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.texts(api || config));	
	//	}
	/**
	     * Returns an array of terms (either CorpusTerms or DocumentTerms, depending on the specified mode).
	     * These terms are actually types, so information about each type is collected (as opposed to the {#link tokens}
	     * method which is for every occurrence in document order).
	     * 
	     * The mode is set to "documents" when any of the following is true
	     * 
	     * * the `mode` parameter is set to "documents"
	     * * a `docIndex` parameter being set
	     * * a `docId` parameter being set
	     * 
	     * The following is an example a Corpus Term (corpus mode):
	     * 
	     * 	{
	     * 		"term": "the",
	     * 		"inDocumentsCount": 8,
	     * 		"rawFreq": 28292,
	     * 		"relativeFreq": 0.036189996,
	     * 		"comparisonRelativeFreqDifference": 0
	     * 	}
	     * 
	     * The following is an example of Document Term (documents mode):
	     * 
	     * 	{
	     * 		"term": "the",
	     * 		"rawFreq": 1333,
	     * 		"relativeFreq": 39721.086,
	     * 		"zscore": 28.419,
	     * 		"zscoreRatio": -373.4891,
	     * 		"tfidf": 0.0,
	     * 		"totalTermsCount": 33559,
	    	 * 		"docIndex": 0,
	     * 		"docId": "8a61d5d851a69c03c6ba9cc446713574"
	     * 	}
	     * 
	     * The following config parameters are valid in both modes:
	     * 
	     *  * **start**: the zero-based start index of the list (for paging)
	     *  * **limit**: the maximum number of terms to provide per request
	     *  * **minRawFreq**: the minimum raw frequency of terms
	     *  * **query**: a term query (see https://voyant-tools.org/docs/#!/guide/search)
	     *  * **stopList**: a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	     *  * **withDistributions**: a true value shows distribution across the corpus (corpus mode) or across the document (documents mode)
	     *  * **whiteList**: a keyword list – terms will be limited to this list
	     *  * **tokenType**: the token type to use, by default `lexical` (other possible values might be `title` and `author`)
	     *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	     * 
	     * The following are specific to corpus mode:
	     * 
	     *  * **bins**: by default there are the same number of bins as there are documents (for distribution values), this can be modified
	     *  * **corpusComparison**: you can provide the ID of a corpus for comparison of frequency values
	     *  * **inDocumentsCountOnly**: if you don't need term frequencies but only frequency per document set this to true
	     *  * **sort**: the order of the terms, one of the following: `INDOCUMENTSCOUNT, RAWFREQ, TERM, RELATIVEPEAKEDNESS, RELATIVESKEWNESS, COMPARISONRELATIVEFREQDIFFERENCE`
	     *  
	     *  The following are specific to documents mode:
	     * 
	     *  * **bins**: by default the document is divided into 10 equal bins(for distribution values), this can be modified
	     *  * **sort**: the order of the terms, one of the following: `RAWFREQ, RELATIVEFREQ, TERM, TFIDF, ZSCORE`
	     *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	     *  * **docId**: the document IDs to include (use commas to separate multiple values)
	     *  
	     * An example:
	     * 
	     * 	// show top 5 terms
	      	 * 	loadCorpus("austen").terms({stopList: 'auto', limit: 5}).then(terms => terms.map(term => term.term))
	      	 *
	      	 * 	// show top term for each document
	      	 * 	loadCorpus("austen").terms({stopList: 'auto', perDocLimit: 1, mode: 'documents'}).then(terms => terms.map(term => term.term))
	      	 * 
	     * @param {Object} config an Object specifying parameters (see list above)
	     * @param {number} config.start the zero-based start index of the list (for paging)
	     * @param {number} config.limit the maximum number of terms to provide per request
	     * @param {number} config.minRawFreq the minimum raw frequency of terms
	     * @param {string} config.query a term query (see {@link https://voyant-tools.org/docs/#!/guide/search})
	     * @param {string} config.stopList a list of stopwords to include (see {@link https://voyant-tools.org/docs/#!/guide/stopwords})
	     * @param {boolean} config.withDistributions a true value shows distribution across the corpus (corpus mode) or across the document (documents mode)
	     * @param {string} config.whiteList a keyword list – terms will be limited to this list
	     * @param {string} config.tokenType the token type to use, by default `lexical` (other possible values might be `title` and `author`)
	     * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	     * @returns {Promise<Array>} a Promise for a Array of Terms
	     */},{key:"terms",value:function terms(config){return _load["default"].trombone(config,{tool:isDocumentsMode(config)?'corpus.DocumentTerms':'corpus.CorpusTerms',corpus:this.corpusid}).then(function(data){return isDocumentsMode(config)?data.documentTerms.terms:data.corpusTerms.terms;});}/*
	     * Create a Corpus and return the terms
	     * @param {*} config 
	     * @param {*} api 
	     */ //	static terms(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.terms(api || config));
	//	}
	/**
	     * Returns an array of document tokens.
	     * 
	     * The promise returns an array of document token objects. A document token object can look something like this:
	     * 
	     *		{
	     *			"docId": "8a61d5d851a69c03c6ba9cc446713574",
	     *			"docIndex": 0,
	     *			"term": "LOVE",
	     *			"tokenType": "lexical",
	     *			"rawFreq": 54,
	     *			"position": 0,
	     *			"startOffset": 3,
	     *			"endOffset": 7
	     *		}
	     *
	     * The following are valid in the config parameter:
	     * 
	     *  * **start**: the zero-based start index of the list (for paging)
	     *  * **limit**: the maximum number of terms to provide per request
	     *  * **stopList**: a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	     *  * **whiteList**: a keyword list – terms will be limited to this list
	     *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	     *  * **noOthers**: only include lexical forms, no other tokens
	     *  * **stripTags**: one of the following: `ALL`, `BLOCKSONLY`, `NONE` (`BLOCKSONLY` tries to maintain blocks for line formatting)
	     *  * **withPosLemmas**: include part-of-speech and lemma information when available (reliability of this may vary by instance)
	     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	     *  * **docId**: the document IDs to include (use commas to separate multiple values)
	     * 
	     * An example:
	     *
	     * 	// load the first 20 tokens (don't include tags, spaces, etc.)
	     * 	loadCorpus("austen").tokens({limit: 20, noOthers: true})
	     *
	     * @param {Object} config an Object specifying parameters (see above)
	     * @param {number} config.start the zero-based start index of the list (for paging)
	     * @param {number} config.limit the maximum number of terms to provide per request
	     * @param {string} config.stopList a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	     * @param {string} config.whiteList a keyword list – terms will be limited to this list
	     * @param {number} config.perDocLimit the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	     * @param {boolean} config.noOthers only include lexical forms, no other tokens
	     * @param {string} config.stripTags one of the following: `ALL`, `BLOCKSONLY`, `NONE` (`BLOCKSONLY` tries to maintain blocks for line formatting)
	     * @param {boolean} config.withPosLemmas include part-of-speech and lemma information when available (reliability of this may vary by instance)
	     * @param {number} config.docIndex the zero-based index of the documents to include (use commas to separate multiple values)
	     * @param {string} config.docId the document IDs to include (use commas to separate multiple values)
	     * @returns {Promise<Array>} a Promise for an Array of document tokens
	     */},{key:"tokens",value:function tokens(config){return _load["default"].trombone(config,{tool:'corpus.DocumentTokens',corpus:this.corpusid}).then(function(data){return data.documentTokens.tokens;});}/*
	     * Create a Corpus and return the tokens
	     * @param {*} config 
	     * @param {*} api 
	     */ //	static tokens(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.tokens(api || config));
	//	}
	/**
	     * Returns an array of words from the corpus.
	     * 
	     * The array of words are in document order, much like tokens.
	     * 
	     * The following are valid in the config parameter:
	     * 
	     *  * **start**: the zero-based start index of the list (for paging)
	     *  * **limit**: the maximum number of terms to provide per request
	     *  * **stopList**: a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	     *  * **whiteList**: a keyword list – terms will be limited to this list
	     *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	     *  * **docId**: the document IDs to include (use commas to separate multiple values)
	     * 
	     * An example:
	     *
	     * 	// load the first 20 words in the corpus
	     * 	loadCorpus("austen").tokens({limit: 20})
	     *
	     * @param {Object} config an Object specifying parameters (see above)
	     * @param {number} config.start the zero-based start index of the list (for paging)
	     * @param {number} config.limit the maximum number of terms to provide per request
	     * @param {string} config.stopList a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	     * @param {string} config.whiteList a keyword list – terms will be limited to this list
	     * @param {number} config.perDocLimit the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	     * @param {number} config.docIndex the zero-based index of the documents to include (use commas to separate multiple values)
	     * @param {string} config.docId the document IDs to include (use commas to separate multiple values)
	     * @returns {Promise<Array>} a Promise for an Array of words
	     */},{key:"words",value:function words(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};// by default DocumentTokens limits to 50 which probably isn't expected
	if(!('limit'in config)){config.limit=0;}return _load["default"].trombone(config,{tool:'corpus.DocumentTokens',noOthers:true,corpus:this.corpusid}).then(function(data){return data.documentTokens.tokens.map(function(t){return t.term;});});}/*
	     * Create a Corpus and return an array of lexical forms (words) in document order.
	     * @param {Object} config 
	     * @param {Object} api 
	     */ //	static words(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.words(api || config));
	//	}
	/**
	     * Returns an array of Objects that contain keywords in contexts (KWICs).
	     * 
	     * An individual KWIC Object looks something like this:
	     * 
	        * 	{
	        *			"docIndex": 0,
	        *			"query": "love",
	        *			"term": "love",
	        *			"position": 0,
	        *			"left": "FREINDSHIP AND OTHER EARLY WORKS",
	        *			"middle": "Love",
	        *			"right": " And Friendship And Other Early"
	        * 	}
	        *  
	        * The following are valid in the config parameter:
	        * 
	        *  * **start**: the zero-based start index of the list (for paging)
	        *  * **limit**: the maximum number of terms to provide per request
	        *  * **query**: a term query (see {@link https://voyant-tools.org/docs/#!/guide/search})
	        *  * **sort**: the order of the contexts: `TERM, DOCINDEX, POSITION, LEFT, RIGHT`
	     *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	        *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	        *  * **stripTags**: for the `left`, `middle` and `right` values, one of the following: `ALL`, `BLOCKSONLY` (tries to maintain blocks for line formatting), `NONE` (default)
	        *  * **context**: the size of the context (the number of words on each side of the keyword)
	        *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	        *  * **docId**: the document IDs to include (use commas to separate multiple values)
	        *  * **overlapStrategy**: determines how to handle cases where there's overlap between KWICs, such as "to be or not to be" when the keyword is "be"; here are the options:
	        *      * **none**: nevermind the overlap, keep all words
	        *      	* {left: "to", middle: "be", right: "or not to be"} 
	        *      	* {left: "to be or not to", middle: "be", right: ""} 
	        *      * **first**: priority goes to the first occurrence (some may be dropped)
	        *      	* {left: "to", middle: "be", right: "or not to be"} 
	        *      * **merge**: balance the words between overlapping occurrences
	        *      	* {left: "to", middle: "be", right: "or"} 
	        *      	* {left: "not to", middle: "be", right: ""} 
	        * 
	        * An example:
	        * 
	        * 	// load the first 20 words in the corpus
	        * 	loadCorpus("austen").contexts({query: "love", limit: 10})
	        * 
	        * @param {Object} config an Object specifying parameters (see above)
	        * @param {number} config.start the zero-based start index of the list (for paging)
	        * @param {number} config.limit the maximum number of terms to provide per request
	        * @param {string} config.query a term query (see {@link https://voyant-tools.org/docs/#!/guide/search})
	        * @param {string} config.sort the order of the contexts: `TERM, DOCINDEX, POSITION, LEFT, RIGHT`
	     * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	        * @param {number} config.perDocLimit the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	        * @param {string} config.stripTags for the `left`, `middle` and `right` values, one of the following: `ALL`, `BLOCKSONLY` (tries to maintain blocks for line formatting), `NONE` (default)
	        * @param {number} config.context the size of the context (the number of words on each side of the keyword)
	        * @param {number} config.docIndex the zero-based index of the documents to include (use commas to separate multiple values)
	        * @param {string} config.docId the document IDs to include (use commas to separate multiple values)
	        * @param {string} config.overlapStrategy determines how to handle cases where there's overlap between KWICs, such as "to be or not to be" when the keyword is "be"
	        * @returns {Promise<Array>} a Promise for an Array of KWIC Objects
	        */},{key:"contexts",value:function contexts(config){if((!config||!config.query)&&console){console.warn('No query provided for contexts request.');}return _load["default"].trombone(config,{tool:'corpus.DocumentContexts',corpus:this.corpusid}).then(function(data){return data.documentContexts.contexts;});}/*
	     * Create a Corpus and return the contexts
	     * @param {Object} config 
	     * @param {Object} api 
	     */ //	static contexts(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.contexts(api || config));
	//	}
	/**
	     * Returns an array of collocates (either document or corpus collocates, depending on the specified mode).
	     * 
	     * The mode is set to "documents" when any of the following is true
	     * 
	     * * the `mode` parameter is set to "documents"
	     * * a `docIndex` parameter being set
	     * * a `docId` parameter being set
	     * 
	     * The following is an example a Corpus Collocate (corpus mode):
	     * 
	     * 	{
	        *   		"term": "love",
	        *   		"rawFreq": 568,
	        *   		"contextTerm": "mr",
	        *   		"contextTermRawFreq": 24
	        * 	}
	     * 
	     * The following is an example of Document Collocate (documents mode):
	     * 
	     * 	{
	        * 			"docIndex": 4,
	        * 			"keyword": "love",
	        * 			"keywordContextRawFrequency": 124,
	        * 			"term": "fanny",
	        * 			"termContextRawFrequency": 8,
	        * 			"termContextRelativeFrequency": 0.021680217,
	        * 			"termDocumentRawFrequency": 816,
	        * 			"termDocumentRelativeFrequency": 0.0050853477,
	        * 			"termContextDocumentRelativeFrequencyDifference": 0.01659487
	        * 	}
	     * 
	     * The following config parameters are valid in both modes:
	     * 
	     *  * **start**: the zero-based start index of the list (for paging)
	     *  * **limit**: the maximum number of terms to provide per request
	     *  * **query**: a term query (see https://voyant-tools.org/docs/#!/guide/search)
	     *  * **stopList**: a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	     *  * **collocatesWhitelist**: collocates will be limited to this list
	     *  * **context**: the size of the context (the number of words on each side of the keyword)
	     *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	     * 
	     * The following are specific to corpus mode:
	     * 
	     *  * **sort**: the order of the terms, one of the following: `RAWFREQ, TERM, CONTEXTTERM, CONTEXTTERMRAWFREQ`
	     *  
	     *  The following are specific to documents mode:
	     * 
	     *  * **sort**: the order of the terms, one of the following: `TERM, REL, REL, RAW, DOCREL, DOCRAW, CONTEXTDOCRELDIFF`
	     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	     *  * **docId**: the document IDs to include (use commas to separate multiple values)
	     *  
	     * An example:
	     * 
	     * 	// show top 5 collocate terms
	      	 * 	loadCorpus("austen").collocates({stopList: 'auto', limit: 5}).then(terms => terms.map(term => term.term))
	      	 * 
	     * @param {Object} config an Object specifying parameters (see list above)
	     * @param {number} config.start the zero-based start index of the list (for paging)
	     * @param {number} config.limit the maximum number of terms to provide per request
	     * @param {string} config.query a term query (see https://voyant-tools.org/docs/#!/guide/search)
	     * @param {string} config.stopList a list of stopwords to include (see https://voyant-tools.org/docs/#!/guide/stopwords)
	     * @param {string} config.collocatesWhitelist collocates will be limited to this list
	     * @param {number} config.context the size of the context (the number of words on each side of the keyword)
	     * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	     * @returns {Promise<Array>} a Promise for a Array of Terms
	     */},{key:"collocates",value:function collocates(config){if((!config||!config.query)&&console){console.warn('No query provided for collocates request.');}return _load["default"].trombone(config,{tool:'corpus.CorpusCollocates',corpus:this.corpusid}).then(function(data){return data.corpusCollocates.collocates;});}/*
	     * Create a Corpus and return the collocates
	     * @param {Object} config 
	     * @param {Object} api 
	     */ //	static collocates(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.collocates(api || config));
	//	}
	/**
	     * Returns an array of phrases or n-grams (either document or corpus phrases, depending on the specified mode).
	     * 
	     * The mode is set to "documents" when any of the following is true
	     * 
	     * * the `mode` parameter is set to "documents"
	     * * a `docIndex` parameter being set
	     * * a `docId` parameter being set
	     * 
	     * The following is an example a Corpus phrase (corpus mode), without distributions requested:
	     * 
	     * 	{
	        *  		"term": "love with",
	        *  		"rawFreq": 103,
	        *  		"length": 2
	        * 	}
	     * 
	     * The following is an example of Document phrase (documents mode), without positions requested:
	     * 
	     * 	{
	        *   		"term": "love with",
	        *   		"rawFreq": 31,
	        *   		"length": 2,
	        *   		"docIndex": 5
	        * 	}
	     * 
	     * The following config parameters are valid in both modes:
	     * 
	     *  * **start**: the zero-based start index of the list (for paging)
	     *  * **limit**: the maximum number of terms to provide per request
	     *  * **minLength**: the minimum length of the phrase
	     *  * **maxLength**: the maximum length of the phrase
	     *  * **minRawFreq**: the minimum raw frequency of the phrase
	     * 	* **sort**: the order of the terms, one of the following: `RAWFREQ, TERM, LENGTH`
	     *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	     *  * **overlapFilter**: it happens that phrases contain other phrases and we need a strategy for handling overlap:
	        *      * **NONE**: nevermind the overlap, keep all phrases
	        *      * **LENGTHFIRST**: priority goes to the longest phrases
	        *      * **RAWFREQFIRST**: priority goes to the highest frequency phrases
	        *      * **POSITIONFIRST**: priority goes to the first phrases
	        * 
	        * The following are specific to documents mode:
	        * 
	     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	     *  * **docId**: the document IDs to include (use commas to separate multiple values)
	        *  
	        * An example:
	        * 
	        * 	// load the first 20 phrases in the corpus
	        * 	loadCorpus("austen").phrases({query: "love", limit: 10})
	        * 
	        * @param {Object} config an Object specifying parameters (see above)
	     * @param {number} config.start the zero-based start index of the list (for paging)
	     * @param {number} config.limit the maximum number of terms to provide per request
	     * @param {number} config.minLength the minimum length of the phrase
	     * @param {number} config.maxLength the maximum length of the phrase
	     * @param {number} config.minRawFreq the minimum raw frequency of the phrase
	     * @param {string} config.sort the order of the terms, one of the following: `RAWFREQ, TERM, LENGTH`
	     * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	     * @param {string} config.overlapFilter it happens that phrases contain other phrases and we need a strategy for handling overlap
	        * @returns {Promise<Array>} a Promise for an Array of phrase Objects
	        */},{key:"phrases",value:function phrases(config){return _load["default"].trombone(config,{tool:isDocumentsMode(config)?'corpus.DocumentNgrams':'corpus.CorpusNgrams',corpus:this.corpusid}).then(function(data){return isDocumentsMode(config)?data.documentNgrams.ngrams:data.corpusNgrams.ngrams;});}/*
	     * Create a Corpus and return the phrases
	     * @param {Object} config 
	     * @param {Object} api 
	     */ //	static phrases(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.phrases(api || config));
	//	}
	/**
	     * Returns an array of correlations (either document or corpus correlations, depending on the specified mode).
	     * 
	     * The mode is set to "documents" when any of the following is true
	     * 
	     * * the `mode` parameter is set to "documents"
	     * * a `docIndex` parameter being set
	     * * a `docId` parameter being set
	     * 
	     * The following is an example a Corpus correlation (corpus mode):
	     * 
	     * 	{
	        * 		"source": {
	        * 			"term": "mrs",
	        * 			"inDocumentsCount": 8,
	        * 			"rawFreq": 2531,
	        * 			"relativePeakedness": 0.46444246,
	        * 			"relativeSkewness": -0.44197384
	        * 		},
	        * 		"target": {
	        * 			"term": "love",
	        * 			"inDocumentsCount": 8,
	        * 			"rawFreq": 568,
	        * 			"relativePeakedness": 5.763066,
	        * 			"relativeSkewness": 2.2536576
	        * 		},
	        * 		"correlation": -0.44287738,
	        * 		"significance": 0.08580014
	        * 	}
	     * 
	     * The following is an example of Document correlation (documents mode), without positions requested:
	     * 
	     * 	{
	        * 		"source": {
	        * 			"term": "confide",
	        * 			"rawFreq": 3,
	        * 			"relativeFreq": 89.3948,
	        * 			"zscore": -0.10560975,
	        * 			"zscoreRatio": -0.7541012,
	        * 			"tfidf": 1.1168874E-5,
	        * 			"totalTermsCount": 33559,
	        * 			"docIndex": 0,
	        * 			"docId": "8a61d5d851a69c03c6ba9cc446713574"
	        * 		},
	        * 		"target": {
	        * 			"term": "love",
	        * 			"rawFreq": 54,
	        * 			"relativeFreq": 1609.1063,
	        * 			"zscore": 53.830048,
	        * 			"zscoreRatio": -707.44696,
	        * 			"tfidf": 0.0,
	        * 			"totalTermsCount": 33559,
	        * 			"docIndex": 0,
	        * 			"docId": "8a61d5d851a69c03c6ba9cc446713574"
	        * 		},
	        * 		"correlation": 0.93527687,
	        * 		"significance": 7.0970666E-5
	        * 	}
	     * 
	     * The following config parameters are valid in both modes:
	     * 
	     *  * **start**: the zero-based start index of the list (for paging)
	     *  * **limit**: the maximum number of terms to provide per request
	     *  * **minRawFreq**: the minimum raw frequency of the collocate terms
	     *  * **termsOnly**: a very compact data view of the correlations
	     *  * **sort**: the order of the terms, one of the following: `CORRELATION`, `CORRELATIONABS`
	     *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	        * 
	        * The following are specific to documents mode:
	        * 
	     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	     *  * **docId**: the document IDs to include (use commas to separate multiple values)
	        *  
	        * An example:
	        * 
	        * 	// load the first 10 phrases in the corpus
	        * 	loadCorpus("austen").correlations({query: "love", limit: 10})
	        * 
	        * @param {Object} config an Object specifying parameters (see above)
	     * @param {number} config.start the zero-based start index of the list (for paging)
	     * @param {number} config.limit the maximum number of terms to provide per request
	     * @param {number} config.minRawFreq the minimum raw frequency of the collocate terms
	     * @param {boolean} config.termsOnly a very compact data view of the correlations
	     * @param {string} config.sort the order of the terms, one of the following: `CORRELATION`, `CORRELATIONABS`
	     * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	        * @returns {Promise<Array>} a Promise for an Array of phrase Objects
	        */},{key:"correlations",value:function correlations(config){if((!config||!config.query)&&console){console.warn('No query provided for correlations request.');if(!isDocumentsMode(config)){throw new Error('Unable to run correlations for a corpus without a query.');}}return _load["default"].trombone(config,{tool:isDocumentsMode(config)?'corpus.DocumentTermCorrelations':'corpus.CorpusTermCorrelations',corpus:this.corpusid}).then(function(data){return data.termCorrelations.correlations;});}/*
	     * Create a Corpus and return the correlations
	     * @param {Object} config 
	     * @param {Object} api 
	     */ //	static correlations(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.correlations(api || config));
	//	}
	/**
	     * Get lemmas. This is the equivalent of calling: this.tokens({ withPosLemmas: true, noOthers: true })
	     * @param {Object} config an Object specifying parameters (see above)
	        * @returns {Promise<Array>} a Promise for an Array of lemma Objects
	     */},{key:"lemmas",value:function lemmas(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};config.withPosLemmas=true;config.noOthers=true;return this.tokens(config);}/**
	     * Performs topic modelling using the latent Dirichlet allocation. Returns an LDA object that has two primary methods of use:
	     * 
	     * * **getTopicWords**: return a list of topics (words organized into bunches of a specified size
	     * * **getDocuments**: return a list of documents and the signicant words
	     *
	     * The config object as parameter can contain the following:
	     * 
	     * * **numberTopics**: the number of topics to get (default is 10)
	     * * **sweeps**: the number of sweeps to do, more sweeps = more accurate (default is 100)
	     * * **language**: stopwords language to use, default is corpus language
	     * 
	     * @param {Object} config (see above)
	     * @param {number} config.numberTopics the number of topics to get (default is 10)
	     * @param {number} config.sweeps the number of sweeps to do, more sweeps = more accurate (default is 100)
	     * @param {string} config.language stopwords language to use, default is corpus language
	     * @returns {Promise<Object>} a promise for an LDA object
	     */},{key:"lda",value:function(){var _lda=(0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(){var config,options,data,stopwords,texts,words,wordsPerBin,ts,i,documents,_args=arguments;return _regenerator["default"].wrap(function _callee$(_context){while(1){switch(_context.prev=_context.next){case 0:config=_args.length>0&&_args[0]!==undefined?_args[0]:{numberTopics:10,sweeps:100};options={displayingStopwords:false,numberTopics:config.numberTopics||10,sweeps:config.sweeps||100,bins:parseInt(config.bins)||10};_context.next=4;return _load["default"].trombone({tool:'resource.KeywordsManager',stopList:config.language||'auto',corpus:this.corpusid});case 4:data=_context.sent;stopwords=data.keywords.keywords;_context.next=8;return this.texts({noMarkup:true,compactSpace:true,format:'text'});case 8:texts=_context.sent;// our corpus contains a single document, so split it into segments
	if(texts.length===1){words=texts[0].split(' ');wordsPerBin=Math.ceil(words.length/options.bins);ts=[];for(i=0;i<options.bins;i++){ts[i]=words.slice(i*wordsPerBin,i*wordsPerBin+wordsPerBin).join(' ');}texts=ts;}documents=[];texts.forEach(function(text,index){documents.push({id:index,text:text});});return _context.abrupt("return",new Promise(function(resolve,reject){var lda=new _ldaTopicModel["default"](options,documents,stopwords);resolve(lda);}));case 13:case"end":return _context.stop();}}},_callee,this);}));function lda(){return _lda.apply(this,arguments);}return lda;}()/**
	     * Performs topic modelling using the latent Dirichlet allocation. Returns an array of LDA topics from the corpus.
	     * 
	     * The config object as parameter can contain the following:
	     * 
	     *  * **numberTopics**: the number of topics to get (default is 10)
	     *  * **sweeps**: the number of sweeps to do, more sweeps = more accurate (default is 100)
	     *  * **language**: stopwords language to use, default is corpus language
	     * 
	     * @param {Object} config (see above)
	     * @param {number} config.numberTopics the number of topics to get (default is 10)
	     * @param {number} config.wordsPerTopic the number of words per topic (default is 10)
	     * @param {number} config.sweeps the number of sweeps to do, more sweeps = more accurate (default is 100)
	     * @param {string} config.language stopwords language to use, default is corpus language
	     * @returns {Promise<Array>} a promise for an array of topics
	     */},{key:"ldaTopics",value:function(){var _ldaTopics=(0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2(){var config,lda,_args2=arguments;return _regenerator["default"].wrap(function _callee2$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:config=_args2.length>0&&_args2[0]!==undefined?_args2[0]:{numberTopics:10,wordsPerTopic:10,sweeps:100};_context2.next=3;return this.lda(config);case 3:lda=_context2.sent;return _context2.abrupt("return",lda.getTopicWords(config.wordsPerTopic));case 5:case"end":return _context2.stop();}}},_callee2,this);}));function ldaTopics(){return _ldaTopics.apply(this,arguments);}return ldaTopics;}()/**
	     * Performs topic modelling using the latent Dirichlet allocation. Returns an array of documents and associated words
	     * 
	     * The config object as parameter can contain the following:
	     * 
	     *  * **numberTopics**: the number of topics to get (default is 10)
	     *  * **sweeps**: the number of sweeps to do, more sweeps = more accurate (default is 100)
	     *  * **language**: stopwords language to use, default is corpus language
	     * 
	     * @param {Object} config (see above)
	     * @param {number} config.numberTopics the number of topics to get (default is 10)
	     * @param {number} config.sweeps the number of sweeps to do, more sweeps = more accurate (default is 100)
	     * @param {string} config.language stopwords language to use, default is corpus language
	     * @returns {Promise<Array>} a promise for an array of documents
	     */},{key:"ldaDocuments",value:function(){var _ldaDocuments=(0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee3(){var config,lda,_args3=arguments;return _regenerator["default"].wrap(function _callee3$(_context3){while(1){switch(_context3.prev=_context3.next){case 0:config=_args3.length>0&&_args3[0]!==undefined?_args3[0]:{numberTopics:10,sweeps:100};_context3.next=3;return this.lda(config);case 3:lda=_context3.sent;return _context3.abrupt("return",lda.getDocuments());case 5:case"end":return _context3.stop();}}},_callee3,this);}));function ldaDocuments(){return _ldaDocuments.apply(this,arguments);}return ldaDocuments;}()/**
	     * Returns an array of entities.
	     * 
	     * The config object as parameter can contain the following:
	     * 
	     *  * **docIndex**: document index to restrict to (can be comma-separated list)
	     *  * **annotator**: the annotator to use: 'stanford' or 'nssi'
	     * 
	     * @param {Object} config
	     * @param {(number|string)} config.docIndex document index to restrict to (can be comma-separated list)
	     * @param {string} config.annotator the annotator to use: 'stanford' or 'nssi'
	     * @returns {Promise<Array>}
	     */},{key:"entities",value:function entities(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{annotator:'stanford'};var timeoutDelay=5000;var corpusId=this.corpusid;return new Promise(function(resolve,reject){function doLoad(config){var _this=this;_load["default"].trombone(config,{tool:'corpus.DocumentEntities',includeEntities:true,noCache:true,// never cache, we don't want stale entity status
	corpus:corpusId}).then(function(data){var total=data.documentEntities.status.length;var numDone=0;var hasFailures=false;data.documentEntities.status.forEach(function(item){if(item[1]==='done')numDone++;else if(item[1].indexOf('failed')===0){numDone++;hasFailures=true;}});var isDone=numDone===total;if(isDone){if(hasFailures&&numDone===1){reject('Failed to get entities');}else {resolve(data.documentEntities.entities);}}else {delete config.retryFailures;setTimeout(doLoad.bind(_this,config),timeoutDelay);}},function(error){return reject(error);});}doLoad(config);});}/**
	     * Returns an HTML snippet that will produce the specified Voyant tools to appear.
	     * 
	     * In its simplest form we can simply call the named tool:
	     * 
	     * 	loadCorpus("austen").tool("Cirrus");
	     * 
	     * Each tool supports some options (that are summarized below), and those can be specified as options:
	     * 
	     * 	loadCorpus("austen").tool("Trends", {query: "love"});
	     * 
	     * There are also parameters (width, height, style, float) that apply to the actual tool window:
	     * 
	     * 	loadCorpus("austen").tool("Trends", {query: "love", style: "width: 500px; height: 500px"});
	     * 
	     * It's also possible to have several tools appear at once, though they won't be connected by events (clicking in a window won't modify the other windows):
	     * 
	     * 	loadCorpus("austen").tool("Cirrus", "Trends");
	     * 
	     * One easy way to get connected tools is to use the `CustomSet` tool and experiment with the layout:
	     * 
	     * 	loadCorpus("austen").tool("CustomSet", {tableLayout: "Cirrus,Trends", style: "width:800px; height: 500px"});
	     * 
	     * Here's a partial list of the tools available as well as their significant parameters:
	     * 
	     *  * <a href="#!/guide/bubblelines">Bubblelines</a> visualizes the frequency and distribution of terms in a corpus.
	     *  	* **bins**: number of bins to separate a document into
	     *  	* **docIndex**: document index to restrict to (can be comma-separated list)
	     *  	* **maxDocs**: maximum number of documents to show
	     *  	* **query**: a query to search for in the corpus
	     *  	* **stopList**: a named stopword list or comma-separated list of words
	     *  * <a href="#!/guide/bubbles">Bubbles</a> is a playful visualization of term frequencies by document.
	     *  	* **audio**: whether or not to include audio
	     *  	* **docIndex**: document index to restrict to (can be comma-separated list)
	     *  	* **speed**: speed of the animation (0 to 60 lower is slower)
	     *  	* **stopList**: a named stopword list or comma-separated list of words
	     *  * <a href="#!/guide/cirrus">Cirrus</a> is a word cloud that visualizes the top frequency words of a corpus or document.
	     *  	* **background**: set the background colour of the word cloud
	     *  	* **categories**: set the categories for the word cloud (usually an ID of an existing categories definition)
	     *  	* **docIndex**: document index to restrict to (can be comma-separated list)
	     *  	* **fontFamily**: the default font to use for the words (default: "Palatino Linotype", "Book Antiqua", Palatino, serif),
	     *  	* **inlineData**: user-defined data, most easily expressed like this: love:20,like:15,dear:10
	     *  	* **limit**: the number of terms to load (that are available, see also `visible` which determines how many are displayed),
	     *  	* **stopList**: a named stopword list or comma-separated list of words
	     *  	* **visible**: the number of terms to display in the word cloud (default is 50)
	     *  	* **whiteList**: a keyword list – terms will be limited to this list
	     *  * <a href="#!/guide/collocatesgraph">CollocatesGraph</a> represents keywords and terms that occur in close proximity as a force directed network graph.
	     *  	* **centralize**: the term to use for centralize mode (where things are focused on a single word)
	        *  	* **context**: the size of the context (the number of words on each side of the keyword)
	     *  	* **limit**: the number of collocates to load for each keyword
	     *  	* **query**: a query for the keywords (can be comma-separated list)
	     *  	* **stopList**: a named stopword list or comma-separated list of words
	     *  * <a href="#!/guide/contexts">Contexts</a> (or Keywords in Context) tool shows each occurrence of a keyword with a bit of surrounding text (the context).
	        *  	* **context**: the size of the context (the number of words on each side of the keyword)
	     *  	* **expand**: the size of the extended context (when you expand a context occurrence), the number of words on each side of the keyword 
	     *  	* **query**: a query for the keywords (can be comma-separated list)
	     *  	* **stopList**: a named stopword list or comma-separated list of words
	     *  * <a href="#!/guide/corpuscollocates">CorpusCollocates</a> is a table view of which terms appear more frequently in proximity to keywords across the entire corpus.
	        *  	* **context**: the size of the context (the number of words on each side of the keyword)
	     *  	* **query**: a query for the keywords (can be comma-separated list)
	     *  	* **sort**: sort order of collocates, one of `contextTermRawFreq`, `contextTermRawFreq`, `rawFreq`, `term`
	     *  	* **stopList**: a named stopword list or comma-separated list of words
	     *  * <a href="#!/guide/corpusterms">CorpusTerms</a> is a table view of term frequencies in the entire corpus.
	        *  	* **bins**: for the purposes of analyzing distribution the documents are split into a specified number of segments or bins
	     *  	* **docIndex**: document index to restrict to (can be comma-separated list)
	     *  	* **expand**: the size of the extended context (when you expand a context occurrence), the number of words on each side of the keyword 
	     *  	* **query**: a query for the keywords (can be comma-separated list)
	     *  	* **stopList**: a named stopword list or comma-separated list of words
	     *  * <a href="#!/guide/correlations">Correlations</a> tool enables an exploration of the extent to which term frequencies vary in sync (terms whose frequencies rise and fall together or inversely).
	     *  	* **minInDocumentsCountRatio**: the minimum percentage of documents in which the correlation must appear
	     *  	* **query**: a query for the keywords (can be comma-separated list)
	     *  	* **stopList**: a named stopword list or comma-separated list of words
	     *  * <a href="#!/guide/documentterms">DocumentTerms</a> is a table view of document term frequencies.
	        *  	* **bins**: for the purposes of analyzing distribution the documents are split into a specified number of segments or bins
	     *  	* **docIndex**: document index to restrict to (can be comma-separated list)
	     *  	* **expand**: the size of the extended context (when you expand a context occurrence), the number of words on each side of the keyword 
	     *  	* **query**: a query for the keywords (can be comma-separated list)
	     *  	* **stopList**: a named stopword list or comma-separated list of words
	     *  * <a href="#!/guide/termsberry">TermsBerry</a> provides a way of exploring high frequency terms and their collocates.
	     *  	* **query**: a query for the keywords (can be comma-separated list)
	     *  	* **stopList**: a named stopword list or comma-separated list of words
	     *  	* **docIndex**: document index to restrict to (can be comma-separated list)
	     *  	* **context**: the size of the context (the number of words on each side of the keyword)
	     *  	* **numInitialTerms**: the initial number of terms to display
	     *  * <a href="#!/guide/trends">Trends</a> shows a line graph depicting the distribution of a word’s occurrence across a corpus or document.
	     *   	* **stopList**: a named stopword list or comma-separated list of words
	     *   	* **query**: a query for the keywords (can be comma-separated list)
	     *   	* **limit**: the number of terms to show
	     *   	* **withDistributions**: the type of distribution frequency to show ("raw" or "relative"), default is "relative"
	     *   	* **bins**: for the purposes of analyzing distribution the documents are split into a specified number of segments or bins
	     *   	* **docIndex**: document index to restrict to (can be comma-separated list)
	     *   	* **chartType**: the type of chart to show: "barline", "bar", "line", "area", "stacked"
	     *  * <a href="#!/guide/documents">Documents</a> is a tool that shows a table of the documents in the corpus and includes functionality for modifying the corpus.
	     *  * <a href="#!/guide/knots">Knots</a> is a creative visualization that represents terms in a single document as a series of twisted lines.
	     *  * <a href="#!/guide/mandala">Mandala</a> is a conceptual visualization that shows the relationships between terms and documents.
	     *  * <a href="#!/guide/microsearch">Microsearch</a> visualizes the frequency and distribution of terms in a corpus.
	     *  * <a href="#!/guide/phrases">Phrases</a> shows repeating sequences of words organized by frequency of repetition or number of words in each repeated phrase.
	     *  * <a href="#!/guide/reader">Reader</a> provides a way of reading documents in the corpus, text is fetched on-demand as needed.
	     *  * <a href="#!/guide/scatterplot">ScatterPlot</a> is a graph visualization of how words cluster in a corpus using document similarity, correspondence analysis or principal component analysis.
	     *  * <a href="#!/guide/streamgraph">StreamGraph</a> is a visualization that depicts the change of the frequency of words in a corpus (or within a single document).
	     *  * <a href="#!/guide/summary">Summary</a> provides a simple, textual overview of the current corpus, including including information about words and documents.
	     *  * <a href="#!/guide/termsradio">TermsRadio</a> is a visualization that depicts the change of the frequency of words in a corpus (or within a single document).
	     *  * <a href="#!/guide/textualarc">TextualArc</a> is a visualization of the terms in a document that includes a weighted centroid of terms and an arc that follows the terms in document order.
	     *  * <a href="#!/guide/topics">Topics</a> provides a rudimentary way of generating term clusters from a document or corpus and then seeing how each topic (term cluster) is distributed across the document or corpus.
	     *  * <a href="#!/guide/veliza">Veliza</a> is an experimental tool for having a (limited) natural language exchange (in English) based on your corpus.
	     *  * <a href="#!/guide/wordtree">WordTree</a> is a tool that allows you to explore how words are used in phrases.
	     * 
	     * @param {string} tool The tool to display
	     * @param {Object} config The config object for the tool
	     * @returns {Promise<string>}
	     */},{key:"tool",value:function tool(_tool){var _arguments=arguments;var config=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};var me=this;return new Promise(function(resolve,reject){var isTool=function isTool(obj){return obj&&typeof obj==='string'&&/\W/.test(obj)===false||(0, _typeof2["default"])(obj)==='object'&&'forTool'in obj;};var isConfig=function isConfig(obj){return obj&&(0, _typeof2["default"])(obj)==='object'&&!('forTool'in obj);};var lastArg=_arguments[_arguments.length-1];config=isConfig(lastArg)?lastArg:{};// we have all tools and we'll show them individually
	if(isTool(_tool)&&(isTool(lastArg)||isConfig(lastArg))){var width;var height;var val;var url;var _ret=function(){var defaultAttributes={style:''};var out='';for(var i=0;i<_arguments.length;i++){var t=_arguments[i];if(isTool(t)){(function(){if(typeof t==='string'){t={forTool:t};}// make sure we have object
	// process width and height info
	width=config['width']!==undefined?config['width']+'':'350';height=config['height']!==undefined?config['height']+'':'350';if(width.search(/^\d+$/)===0)width+='px';if(height.search(/^\d+$/)===0)height+='px';if(config['style']!==undefined){if(config['style'].indexOf('width')===-1){config['style']="width: ".concat(width,";")+config['style'];}if(config['style'].indexOf('height')===-1){config['style']="height: ".concat(height,";")+config['style'];}}else {config['style']="width: ".concat(width,"; height: ").concat(height,";");}// build iframe tag
	out+='<iframe ';for(var attr in defaultAttributes){val=(attr in t?t[attr]:undefined)||(attr in config?config[attr]:undefined)||(attr in defaultAttributes?defaultAttributes[attr]:undefined);if(val!==undefined){out+=' '+attr+'="'+val+'"';}}// build url
	url=new URL((config&&config.voyantUrl?config.voyantUrl:_load["default"].baseUrl)+'tool/'+t.forTool+'/');url.searchParams.append('corpus',me.corpusid);// add API values from config (some may be ignored)
	var all=Object.assign(t,config);Object.keys(all).forEach(function(key){if(key!=='input'&&!(key in defaultAttributes)){var value=all[key];// TODO need to sort this out, if key is "query" and value is an array then stringify will break the query format for voyant
	// if (typeof value !== 'string') {
	// 	value = JSON.stringify(value);
	// }
	url.searchParams.append(key,value);}});// finish tag
	out+=' src="'+url+'"></iframe>';})();}}return {v:resolve(out)};}();if((0, _typeof2["default"])(_ret)==="object")return _ret.v;}else {if(Array.isArray(_tool)){_tool=_tool.join(';');}var defaultAttributes={width:undefined,height:undefined,style:'width: 90%; height: '+350*(_tool?_tool:'').split(';').length+'px'};// build iframe tag
	var out='<iframe ';for(var attr in defaultAttributes){var val=(attr in config?config[attr]:undefined)||(attr in defaultAttributes?defaultAttributes[attr]:undefined);if(val!==undefined){out+=' '+attr+'="'+val+'"';}}// build url
	var url=new URL((config&&config.voyantUrl?config.voyantUrl:_load["default"].baseUrl)+(_tool?'?view=customset&tableLayout='+_tool:''));url.searchParams.append('corpus',me.corpusid);// add API values from config (some may be ignored)
	Object.keys(config).forEach(function(key){if(key!=='input'&&!(key in defaultAttributes)){var value=config[key];// if (typeof value !== 'string') {
	// 	value = JSON.stringify(value);
	// }
	url.searchParams.append(key,value);}});resolve(out+' src=\''+url+'\'></iframe>');}});}/*
	     * Create a Corpus and return the tool
	     * @param {*} tool 
	     * @param {*} config 
	     * @param {*} api 
	     */ //	static tool(tool, config, api) {
	//		return Corpus.load(config).then(corpus => corpus.tool(tool, config, api));
	//	}
	/**
	     * An alias for {@link #summary}.
	     */},{key:"toString",value:function toString(){return this.summary();}/*
	     * Create a new Corpus using the provided config
	     * @param {Object} config 
	     */ //	static create(config) {
	//		return Corpus.load(config);
	//	}
	/**
	     * Load a Corpus using the provided config and api
	     * @param {Object} config the Corpus config
	     * @param {Object} api any additional API values
	     * @returns {Promise<Corpus>}
	     */}],[{key:"setBaseUrl",value:function setBaseUrl(baseUrl){_load["default"].setBaseUrl(baseUrl);}},{key:"load",value:function load(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var api=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};var promise=new Promise(function(resolve,reject){if(config instanceof Corpus){resolve(config);}if(typeof config==='string'){if(config.length>0&&/\W/.test(config)===false){config={corpus:config};}else {config={input:config};}}else if(_util["default"].isArray(config)&&config.length>0&&typeof config[0]==='string'){config={input:config};}else if(config instanceof Blob||_util["default"].isNode(config)||_util["default"].isArray(config)&&(config[0]instanceof Blob||_util["default"].isNode(config[0]))){var formData=new FormData();if(_util["default"].isArray(config)){config.forEach(function(file){if(_util["default"].isNode(file)){var nodeString=new XMLSerializer().serializeToString(file);file=new Blob([nodeString],{type:'text/xml'});}formData.append('input',file);formData.append('inputFormat',_util["default"].getFileExtensionFromMimeType(file.type));});}else {if(_util["default"].isNode(config)){var nodeString=new XMLSerializer().serializeToString(config);config=new Blob([nodeString],{type:'text/xml'});}formData.append('input',config);formData.append('inputFormat',_util["default"].getFileExtensionFromMimeType(config.type));}// append any other form options that may have been included
	if(api&&(0, _typeof2["default"])(api)==='object'){for(var key in api){formData.append(key,api[key]);}}formData.append('tool','corpus.CorpusMetadata');config={body:formData,method:'POST'};}_load["default"].trombone(_objectSpread({},config,{},api),{tool:'corpus.CorpusMetadata'}).then(function(data){resolve(new Corpus(data.corpus.metadata.id));},function(err){reject(err);});});['collocates','contexts','correlations','documents','entities','id','lda','ldaDocuments','ldaTopics','lemmas','metadata','phrases','summary','terms','text','texts','titles','toString','tokens','tool','words'].forEach(function(name){promise[name]=function(){var args=arguments;return promise.then(function(corpus){return corpus[name].apply(corpus,args);});};});promise.assign=function(name){return this.then(function(corpus){window[name]=corpus;return corpus;});};return promise;}}]);return Corpus;}();(0, _defineProperty2["default"])(Corpus,"Load",_load["default"]);var _default=Corpus;exports["default"]=_default;},{"./load":274,"./util.js":277,"@babel/runtime/helpers/asyncToGenerator":32,"@babel/runtime/helpers/classCallCheck":33,"@babel/runtime/helpers/createClass":35,"@babel/runtime/helpers/defineProperty":36,"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/typeof":43,"@babel/runtime/regenerator":45,"lda-topic-model":255}],274:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);if(enumerableOnly)symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable;});keys.push.apply(keys,symbols);}return keys;}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?arguments[i]:{};if(i%2){ownKeys(Object(source),true).forEach(function(key){(0, _defineProperty2["default"])(target,key,source[key]);});}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(target,Object.getOwnPropertyDescriptors(source));}else {ownKeys(Object(source)).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key));});}}return target;}/**
	 * Class embodying Load functionality.
	 * @memberof Spyral
	 * @class
	 */var Load=/*#__PURE__*/function(){function Load(){(0, _classCallCheck2["default"])(this,Load);}(0, _createClass2["default"])(Load,null,[{key:"setBaseUrl",/**
	     * Set the base URL for use with the Load class
	     * @param {string} baseUrl 
	     */value:function setBaseUrl(baseUrl){this.baseUrl=baseUrl;}/**
	     * Make a call to trombone
	     * @param {Object} config 
	     * @param {Object} params
	     * @returns {JSON}
	     */},{key:"trombone",value:function trombone(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var params=arguments.length>1?arguments[1]:undefined;var url=new URL(config.trombone?config.trombone:this.baseUrl+'trombone',window.location.origin);delete config.trombone;var all=_objectSpread({},config,{},params);for(var key in all){if(all[key]===undefined){delete all[key];}}var method=all.method;if(method===undefined){method='GET';}else {delete all.method;}var opt={};if(method==='GET'||method==='POST'){if(method==='POST'||JSON.stringify(all).length>1000){opt={method:'POST'};if('body'in all){// opt.headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' };
	opt.body=all['body'];}else {(function(){// don't set header as it messes up boundaries, see: https://stackoverflow.com/q/39280438
	// opt.headers = { 'Content-Type': 'multipart/form-data' };
	var formData=new FormData();var _loop=function _loop(_key){if(all[_key]instanceof Array){all[_key].forEach(function(val){formData.append(_key,val);});}else {formData.set(_key,all[_key]);}};for(var _key in all){_loop(_key);}opt.body=formData;})();}}else {var _loop2=function _loop2(_key2){if(all[_key2]instanceof Array){all[_key2].forEach(function(val){url.searchParams.append(_key2,val);});}else {url.searchParams.set(_key2,all[_key2]);}};for(var _key2 in all){_loop2(_key2);}}}else {throw Error('Load.trombone: unsupported method:',method);}return fetch(url.toString(),opt).then(function(response){if(response.ok){return response.json();}else {return response.text().then(function(text){if(window.console){console.error(text);}throw Error(text);});}});}/**
	     * Fetch content from a URL, often resolving cross-domain data constraints
	     * @param {string} urlToFetch 
	     * @param {Object} config
	     * @returns {Response}
	     */},{key:"load",value:function load(urlToFetch,config){var url=new URL(config&&config.trombone?config.trombone:this.baseUrl+'trombone');url.searchParams.set('fetchData',urlToFetch);return fetch(url.toString()).then(function(response){if(response.ok){return response;}else {return response.text().then(function(text){if(window.console){console.error(text);}throw Error(text);});}})["catch"](function(err){throw err;});}/**
	     * Fetch HTML content from a URL
	     * @param {string} url 
	     * @returns {Document}
	     */},{key:"html",value:function html(url){return this.text(url).then(function(text){return new DOMParser().parseFromString(text,'text/html');});}/**
	     * Fetch XML content from a URL
	     * @param {string} url 
	     * @returns {XMLDocument}
	     */},{key:"xml",value:function xml(url){return this.text(url).then(function(text){return new DOMParser().parseFromString(text,'text/xml');});}/**
	     * Fetch JSON content from a URL
	     * @param {string} url 
	     * @returns {JSON}
	     */},{key:"json",value:function json(url){return this.load(url).then(function(response){return response.json();});}/**
	     * Fetch text content from a URL
	     * @param {string} url 
	     * @returns {string}
	     */},{key:"text",value:function text(url){return this.load(url).then(function(response){return response.text();});}}]);return Load;}();(0, _defineProperty2["default"])(Load,"baseUrl",void 0);var _default=Load;exports["default"]=_default;},{"@babel/runtime/helpers/classCallCheck":33,"@babel/runtime/helpers/createClass":35,"@babel/runtime/helpers/defineProperty":36,"@babel/runtime/helpers/interopRequireDefault":37}],275:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));/* global d3 */ /**
	 * A d3 force directed layout with labeled nodes
	 * @memberof Spyral
	 * @class
	 */var NetworkGraph=/*#__PURE__*/function(){/**
	   * Construct a new NetworkGraph class
	   * @constructor
	   * @param {HTMLElement} target 
	   * @param {Object} config 
	   * @param {Array} config.nodes An array of nodes
	   * @param {Array} config.links An array of links
	   * @param {String|Function} [config.nodeIdField]
	   * @param {String|Function} [config.nodeLabelField]
	   * @param {String|Function} [config.nodeValueField]
	   * @param {String|Function} [config.nodeCategoryField]
	   * @param {String|Function} [config.linkSourceField]
	   * @param {String|Function} [config.linkTargetField]
	   * @param {String|Function} [config.linkValueField]
	   * @return {NetworkGraph}
	   */function NetworkGraph(target,config){var _this=this;(0, _classCallCheck2["default"])(this,NetworkGraph);(0, _defineProperty2["default"])(this,"physics",{damping:0.4,// 0 = no damping, 1 = full damping
	centralGravity:0.1,// 0 = no grav, 1 = high grav
	nodeGravity:-50,// negative = repel, positive = attract
	springLength:100,springStrength:0.25,// 0 = not strong, >1 = probably too strong
	collisionScale:1.25// 1 = default, 0 = no collision 
	});this.target=target;if(config.nodes===undefined)throw new Error('Missing nodes!');if(config.links===undefined)throw new Error('Missing links!');var nodeIdField=config.nodeIdField===undefined?'id':config.nodeIdField;var nodeLabelField=config.nodeLabelField===undefined?'id':config.nodeLabelField;var nodeValueField=config.nodeValueField===undefined?'value':config.nodeValueField;var nodeCategoryField=config.nodeCategoryField===undefined?'category':config.nodeCategoryField;this.nodeData=config.nodes.map(function(node){return {id:_this._idGet(typeof nodeIdField==='string'?node[nodeIdField]:nodeIdField(node)),label:typeof nodeLabelField==='string'?node[nodeLabelField]:nodeLabelField(node),value:typeof nodeValueField==='string'?node[nodeValueField]:nodeValueField(node),category:typeof nodeCategoryField==='string'?node[nodeCategoryField]:nodeCategoryField(node)};});var linkSourceField=config.linkSourceField===undefined?'source':config.linkSourceField;var linkTargetField=config.linkTargetField===undefined?'target':config.linkTargetField;var linkValueField=config.linkValueField===undefined?'value':config.linkValueField;this.linkData=config.links.map(function(link){var sourceId=_this._idGet(typeof linkSourceField==='string'?link[linkSourceField]:linkSourceField(link));var targetId=_this._idGet(typeof linkTargetField==='string'?link[linkTargetField]:linkTargetField(link));var linkId=sourceId+'-'+targetId;return {id:linkId,source:sourceId,target:targetId,value:link[linkValueField]};});this.simulation;this.zoom;this.parentEl;this.links;this.nodes;this._insertStyles();this.initGraph();return this;}(0, _createClass2["default"])(NetworkGraph,[{key:"initGraph",value:function initGraph(){var _this2=this;var width=this.target.offsetWidth;var height=this.target.offsetHeight;var svg=d3.select(this.target).append('svg').attr('viewBox',[0,0,width,height]);this.parentEl=svg.append('g');this.links=this.parentEl.append('g').attr('class','spyral-ng-links').selectAll('.spyral-ng-link');this.nodes=this.parentEl.append('g').attr('class','spyral-ng-nodes').selectAll('.spyral-ng-node');this.simulation=d3.forceSimulation().force('center',d3.forceCenter(width*.5,height*.5)// .strength(this.physics.centralGravity)
	).force('link',d3.forceLink().id(function(d){return d.id;}).distance(this.physics.springLength).strength(this.physics.springStrength)).force('charge',d3.forceManyBody().strength(this.physics.nodeGravity)).force('collide',d3.forceCollide(function(d){return Math.sqrt(d.bbox.width*d.bbox.height)*_this2.physics.collisionScale;})).on('tick',this._ticked.bind(this))// TODO need to update sandbox cached output when simulation is done running
	.on('end',this._zoomToFit.bind(this));var link=this.links.data(this.linkData);link.exit().remove();var linkEnter=link.enter().append('line').attr('class','spyral-ng-link').attr('id',function(d){return d.id;}).on('mouseover',this._linkMouseOver.bind(this)).on('mouseout',this._linkMouseOut.bind(this));this.links=linkEnter.merge(link);var node=this.nodes.data(this.nodeData);node.exit().remove();var nodeEnter=node.enter().append('g').attr('class','spyral-ng-node').attr('id',function(d){return d.id;}).attr('category',function(d){return d.category;}).on('mouseover',this._nodeMouseOver.bind(this)).on('mouseout',this._nodeMouseOut.bind(this)).on('click',function(data){d3.event.stopImmediatePropagation();d3.event.preventDefault();this._nodeClick(data);}.bind(this)).on('contextmenu',function(d){d3.event.preventDefault();d.fixed=false;d.fx=null;d.fy=null;}).call(d3.drag().on('start',function(d){if(!d3.event.active)this.simulation.alpha(0.3).restart();d.fx=d.x;d.fy=d.y;d.fixed=true;}.bind(this)).on('drag',function(d){this.simulation.alpha(0.3);// don't let simulation end while the user is dragging
	d.fx=d3.event.x;d.fy=d3.event.y;}.bind(this)).on('end',function(d){//					if (!d3.event.active) me.getVisLayout().alpha(0);
	if(d.fixed!==true){d.fx=null;d.fy=null;}}));nodeEnter.append('rect');nodeEnter.append('text').text(function(d){return d.label;}).attr('font-size',function(d){return d.value?Math.max(10,Math.sqrt(d.value)*8):10;}).each(function(d){d.bbox=this.getBBox();})// set bounding box for later use
	.attr('dominant-baseline','central');this.nodes=nodeEnter.merge(node);this.parentEl.selectAll('rect').attr('width',function(d){return d.bbox.width+16;}).attr('height',function(d){return d.bbox.height+8;}).attr('rx',function(d){return Math.max(2,d.bbox.height*0.2);}).attr('ry',function(d){return Math.max(2,d.bbox.height*0.2);});this.parentEl.selectAll('text').attr('dx',8).attr('dy',function(d){return d.bbox.height*0.5+4;});this.zoom=d3.zoom().scaleExtent([1/4,4]).on('zoom',function(){this.parentEl.attr('transform',d3.event.transform);}.bind(this));svg.call(this.zoom);this.simulation.nodes(this.nodeData);this.simulation.force('link').links(this.linkData);}},{key:"_nodeMouseOver",value:function _nodeMouseOver(node){var _this3=this;this.parentEl.selectAll('.spyral-ng-node').each(function(d,i,nodes){return nodes[i].classList.remove('hover');});this.links.each(function(link){var id;if(link.source.id===node.id){id=link.target.id;}else if(link.target.id===node.id){id=link.source.id;}if(id){_this3.parentEl.select('#'+id).each(function(d,i,nodes){return nodes[i].classList.add('hover');});_this3.parentEl.select('#'+link.id).each(function(d,i,links){return links[i].classList.add('hover');});}});this.parentEl.select('#'+node.id).each(function(d,i,nodes){return nodes[i].classList.add('hover');});}},{key:"_nodeMouseOut",value:function _nodeMouseOut(){this.parentEl.selectAll('.spyral-ng-node, .spyral-ng-link').each(function(d,i,nodes){return nodes[i].classList.remove('hover');});}},{key:"_nodeClick",value:function _nodeClick(node){console.log('click',node);}},{key:"_linkMouseOver",value:function _linkMouseOver(link){this.parentEl.selectAll('.spyral-ng-link').each(function(d,i,links){return links[i].classList.remove('hover');});this.parentEl.select('#'+link.id).each(function(d,i,links){return links[i].classList.add('hover');});}},{key:"_linkMouseOut",value:function _linkMouseOut(){this.parentEl.selectAll('.spyral-ng-link').each(function(d,i,links){return links[i].classList.remove('hover');});}},{key:"_ticked",value:function _ticked(){this.links.attr('x1',function(d){return d.source.x;}).attr('y1',function(d){return d.source.y;}).attr('x2',function(d){return d.target.x;}).attr('y2',function(d){return d.target.y;});this.nodes.attr('transform',function(d){var x=d.x;var y=d.y;x-=d.bbox.width*.5;y-=d.bbox.height*.5;return 'translate('+x+','+y+')';});}},{key:"_idGet",value:function _idGet(term){if(term.search(/^\d+$/)===0){return 'spyral_'+term;}return term.replace(/\W/g,'_');}},{key:"_zoomToFit",value:function _zoomToFit(paddingPercent,transitionDuration){var bounds=this.parentEl.node().getBBox();var width=bounds.width;var height=bounds.height;var midX=bounds.x+width/2;var midY=bounds.y+height/2;var svg=this.parentEl.node().parentElement;var svgRect=svg.getBoundingClientRect();var fullWidth=svgRect.width;var fullHeight=svgRect.height;var scale=(paddingPercent||0.8)/Math.max(width/fullWidth,height/fullHeight);var translate=[fullWidth/2-scale*midX,fullHeight/2-scale*midY];if(width<1){return;}// FIXME: something strange with spyral
	d3.select(svg).transition().duration(transitionDuration||500).call(this.zoom.transform,d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));}},{key:"_resize",value:function _resize(){}},{key:"_insertStyles",value:function _insertStyles(){var styleElement=document.createElement('style');styleElement.append("\n.spyral-ng-nodes {\n}\n.spyral-ng-links {\n}\n\n.spyral-ng-node {\n\tcursor: pointer;\n}\n.spyral-ng-node rect {\n\tfill: hsl(200, 73%, 90%);\n\tstroke: #333;\n\tstroke-width: 1px;\n}\n.spyral-ng-node.hover rect {\n\tfill: hsl(354, 73%, 90%);\n}\n.spyral-ng-node text {\n\tuser-select: none;\n}\n\n.spyral-ng-link {\n\tstroke-width: 1px;\n\tstroke: #555;\n}\n.spyral-ng-link.hover {\n\tstroke-width: 2px;\n\tstroke: #333;\n}\n\t\t");this.target.parentElement.prepend(styleElement);}}]);return NetworkGraph;}();var _default=NetworkGraph;exports["default"]=_default;},{"@babel/runtime/helpers/classCallCheck":33,"@babel/runtime/helpers/createClass":35,"@babel/runtime/helpers/defineProperty":36,"@babel/runtime/helpers/interopRequireDefault":37}],276:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _construct2=_interopRequireDefault(require("@babel/runtime/helpers/construct"));var _slicedToArray2=_interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _chart=_interopRequireDefault(require("./chart.js"));var _util=_interopRequireDefault(require("./util.js"));/* global Spyral */ /**
	 * The Spyral.Table class in Spyral provides convenience functions for working with tabular
	 * data.
	 * 
	 * There are several ways of initializing a Table, here are some of them:
	 * 
	 * Provide an array of data with 3 rows:
	 * 
	 *  	let table = createTable([1,2,3]);
	 *
	 *
	 * Provide a nested array of data with multiple rows:
	 * 
	 *		let table = createTable([[1,2],[3,4]]);
	 * 
	 * Same nested array, but with a second argument specifying headers
	 * 
	 *		let table = createTable([[1,2],[3,4]], {headers: ["one","two"]});
	 * 
	 * Create table with comma-separated values:
	 * 
	 *  	let table = createTable("one,two\\n1,2\\n3,4");
	 * 
	 * Create table with tab-separated values
	 * 
	 *		let table = createTable("one\\ttwo\\n1\\t2\\n3\\t4");
	 * 
	 * Create table with array of objects
	 * 
	 *  	let table = createTable([{one:1,two:2},{one:3,two:4}]);
	 * 
	 * It's also possible simple to create a sorted frequency table from an array of values:
	 * 
	 *		let table = createTable(["one","two","one"], {count: "vertical", headers: ["Term","Count"]})
	 * 
	 * Working with a Corpus is easy. For instance, we can create a table from the top terms:
	 * 
	 *		loadCorpus("austen").terms({limit:500, stopList: 'auto'}).then(terms => {
	 *			return createTable(terms);
	 *		})
	 * 
	 * Similarly, we could create a frequency table from the first 1,000 words of the corpus:
	 * 
	 *		loadCorpus("austen").words({limit:1000, docIndex: 0, stopList: 'auto'}).then(words => {
	 *			return createTable(words, {count: "vertical"});
	 *		});
	 *
	 * Some of the configuration options are as follows:
	 * 
	 * * **format**: especially for forcing csv or tsv when the data is a string
	 * * **hasHeaders**: determines if data has a header row (usually determined automatically)
	 * * **headers**: a Array of Strings that serve as headers for the table
	 * * **count**: forces Spyral to create a sorted frequency table from an Array of data, this can be set to "vertical" if the counts are shown vertically or set to true if the counts are shown horizontally
	 * 
	 * Tables are convenient in Spyral because you can simply show them to preview a version in HTML.
	 * 
	 * @memberof Spyral
	 * @class
	 */var Table=/*#__PURE__*/function(){/**
	   * The Table config object
	   * @typedef {Object} TableConfig
	   * @property {string} format The format of the provided data, either "tsv" or "csv"
	   * @property {(Object|Array)} headers The table headers
	   * @property {boolean} hasHeaders True if the headers are the first item in the data
	   * @property {string} count Specify "vertical" or "horizontal" to create a table of unique item counts in the provided data
	   */ /**
	   * Create a new Table
	   * @constructor
	   * @param {(Object|Array|String|Number)} data An array of data or a string with CSV or TSV.
	   * @param {TableConfig} config an Object for configuring the table initialization
	   * @returns {Spyral.Table}
	   */function Table(data,config){var _this=this;for(var _len=arguments.length,other=new Array(_len>2?_len-2:0),_key=2;_key<_len;_key++){other[_key-2]=arguments[_key];}(0, _classCallCheck2["default"])(this,Table);this._rows=[];this._headers={};this._rowKeyColumnIndex=0;// we have a configuration object followed by values: create({headers: []}, 1,2,3) …
	if(data&&(0, _typeof2["default"])(data)==='object'&&(typeof config==='string'||typeof config==='number'||Array.isArray(config))){data.rows=[config].concat(other).filter(function(v){return v!==undefined;});config=undefined;}// we have a simple variable set of arguments: create(1,2,3) …
	if(arguments.length>0&&Array.from(arguments).every(function(a){return a!==undefined&&!Array.isArray(a)&&(0, _typeof2["default"])(a)!=='object';})){data=[data,config].concat(other).filter(function(v){return v!==undefined;});config=undefined;}// could be CSV or TSV
	if(Array.isArray(data)&&data.length===1&&typeof data[0]==='string'&&(data[0].indexOf(',')>-1||data[0].indexOf('\t')>-1)){data=data[0];}// first check if we have a string that might be delimited data
	if(data&&(typeof data==='string'||typeof data==='number')){if(typeof data==='number'){data=String(data);}// convert to string for split
	var rows=[];var format=config&&'format'in config?config.format:undefined;data.split(/(\r\n|[\n\v\f\r\x85\u2028\u2029])+/g).forEach(function(line,i){if(line.trim().length>0){var values;if(format&&format==='tsv'||line.indexOf('\t')>-1){values=line.split(/\t/);}else if(format&&format==='csv'||line.indexOf(',')>-1){values=parseCsvLine(line);}else {values=[line];}// if we can't find any config information for headers then we try to guess
	// if the first line doesn't have any numbers - this heuristic may be questionable
	if(i===0&&values.every(function(v){return isNaN(v);})&&((0, _typeof2["default"])(config)!=='object'||(0, _typeof2["default"])(config)==='object'&&!('hasHeaders'in config)&&!('headers'in config))){_this.setHeaders(values);}else {rows.push(values.map(function(v){return isNaN(v)?v:Number(v);}));}}});data=rows;}if(data&&Array.isArray(data)){if(config){if(Array.isArray(config)){this.setHeaders(config);}else if((0, _typeof2["default"])(config)==='object'){if('headers'in config){this.setHeaders(config.headers);}else if('hasHeaders'in config&&config.hasHeaders){this.setHeaders(data.shift());}}}if(config&&'count'in config&&config.count){var freqs=Table.counts(data);if(config.count==='vertical'){for(var item in freqs){this.addRow(item,freqs[item]);}this.rowSort(function(a,b){return Table.cmp(b[1],a[1]);});}else {this._headers=[];// reset and use the terms as headers
	this.addRow(freqs);this.columnSort(function(a,b){return Table.cmp(_this.cell(0,b),_this.cell(0,a));});}}else {this.addRows(data);}}else if(data&&(0, _typeof2["default"])(data)==='object'){if('headers'in data&&Array.isArray(data.headers)){this.setHeaders(data.headers);}else if('hasHeaders'in data&&'rows'in data){this.setHeaders(data.rows.shift());}if('rows'in data&&Array.isArray(data.rows)){this.addRows(data.rows);}if('rowKeyColumn'in data){if(typeof data.rowKeyColumn==='number'){if(data.rowKeyColumn<this.columns()){this._rowKeyColumnIndex=data.rowKeyColumn;}else {throw new Error('The rowKeyColumn value is higher than the number headers designated: '+data.rowKeyColum);}}else if(typeof data.rowKeyColumn==='string'){if(data.rowKeyColumn in this._headers){this._rowKeyColumnIndex=this._headers[data.rowKeyColumn];}else {throw new Error('Unable to find column designated by rowKeyColumn: '+data.rowKeyColumn);}}}}}/**
	   * Set the headers for the Table
	   * @param {(Object|Array)} data
	   * @returns {Spyral.Table}
	   */(0, _createClass2["default"])(Table,[{key:"setHeaders",value:function setHeaders(data){var _this2=this;if(data&&Array.isArray(data)){data.forEach(function(h){return _this2.addColumn(h);},this);}else if((0, _typeof2["default"])(data)==='object'){if(this.columns()===0||Object.keys(data).length===this.columns()){this._headers=data;}else {throw new Error('The number of columns don\'t match: ');}}else {throw new Error('Unrecognized argument for headers, it should be an array or an object.'+data);}return this;}/**
	     * Add rows to the Table
	     * @param {Array} data
	     * @returns {Spyral.Table}
	     */},{key:"addRows",value:function addRows(data){var _this3=this;data.forEach(function(row){return _this3.addRow(row);},this);return this;}/**
	     * Add a row to the Table
	     * @param {(Array|Object)} data
	     * @returns {Spyral.Table}
	     */},{key:"addRow",value:function addRow(data){for(var _len2=arguments.length,other=new Array(_len2>1?_len2-1:0),_key2=1;_key2<_len2;_key2++){other[_key2-1]=arguments[_key2];}// we have multiple arguments, so call again as an array
	if(other.length>0){return this.addRow([data].concat(other));}this.setRow(this.rows(),data,true);return this;}/**
	     * Set a row
	     * @param {(number|string)} ind The row index
	     * @param {(Object|Array)} data
	     * @param {boolean} create
	     * @returns {Spyral.Table}
	     */},{key:"setRow",value:function setRow(ind,data,create){var _this4=this;var rowIndex=this.getRowIndex(ind,create);if(rowIndex>=this.rows()&&!create){throw new Error('Attempt to set row values for a row that does note exist: '+ind+'. Maybe use addRow() instead?');}// we have a simple array, so we'll just push to the rows
	if(data&&Array.isArray(data)){if(data.length>this.columns()){if(create){for(var i=this.columns();i<data.length;i++){this.addColumn();}}else {throw new Error('The row that you\'ve created contains more columns than the current table. Maybe use addColunm() first?');}}data.forEach(function(d,i){return _this4.setCell(rowIndex,i,d);},this);}// we have an object so we'll use the headers
	else if((0, _typeof2["default"])(data)==='object'){for(var column in data){if(!this.hasColumn(column));this.setCell(rowIndex,column,data[column]);}}else if(this.columns()<2&&create){// hopefully some scalar value
	if(this.columns()===0){this.addColumn();// create first column if it doesn't exist
	}this.setCell(rowIndex,0,data);}else {throw new Error('setRow() expects an array or an object, maybe setCell()?');}return this;}/**
	     * Set a column
	     * @param {(number|string)} ind The column index
	     * @param {(Object|Array)} data
	     * @param {boolean} create
	     * @returns {Spyral.Table}
	     */},{key:"setColumn",value:function setColumn(ind,data,create){var _this5=this;var columnIndex=this.getColumnIndex(ind,create);if(columnIndex>=this.columns()&&!create){throw new Error('Attempt to set column values for a column that does note exist: '+ind+'. Maybe use addColumn() instead?');}// we have a simple array, so we'll just push to the rows
	if(data&&Array.isArray(data)){data.forEach(function(d,i){return _this5.setCell(i,columnIndex,d,create);},this);}// we have an object so we'll use the headers
	else if((0, _typeof2["default"])(data)==='object'){for(var row in data){this.setCell(row,columnIndex,data[row],create);}}// hope we have a scalar value to assign to the first row
	else {this.setCell(0,columnIndex,data,create);}return this;}/**
	     * Add to or set a cell value
	     * @param {(number|string)} row The row index
	     * @param {(number|string)} column The column index
	     * @param {number} value The value to set/add
	     * @param {boolean} overwrite True to set, false to add to current value
	     */},{key:"updateCell",value:function updateCell(row,column,value,overwrite){var rowIndex=this.getRowIndex(row,true);var columnIndex=this.getColumnIndex(column,true);var val=this.cell(rowIndex,columnIndex);this._rows[rowIndex][columnIndex]=val&&!overwrite?val+value:value;return this;}/**
	     * Get the value of a cell
	     * @param {(number|string)} rowInd The row index
	     * @param {(number|string)} colInd The column index
	     * @returns {number}
	     */},{key:"cell",value:function cell(rowInd,colInd){return this._rows[this.getRowIndex(rowInd)][this.getColumnIndex(colInd)];}/**
	     * Set the value of a cell
	     * @param {(number|string)} row The row index
	     * @param {(number|string)} column The column index
	     * @param {number} value The value to set
	     * @returns {Spyral.Table}
	     */},{key:"setCell",value:function setCell(row,column,value){this.updateCell(row,column,value,true);return this;}/**
	     * Get (and create) the row index
	     * @param {(number|string)} ind The index
	     * @param {boolean} create
	     * @returns {number}
	     */},{key:"getRowIndex",value:function getRowIndex(ind,create){var _this6=this;if(typeof ind==='number'){if(ind<this._rows.length){return ind;}else if(create){this._rows[ind]=Array(this.columns());return ind;}throw new Error('The requested row does not exist: '+ind);}else if(typeof ind==='string'){var row=this._rows.findIndex(function(r){return r[_this6._rowKeyColumnIndex]===ind;},this);if(row>-1){return row;}else if(create){var arr=Array(this.columns());arr[this._rowKeyColumnIndex]=ind;this.addRow(arr);return this.rows();}else {throw new Error('Unable to find the row named '+ind);}}throw new Error('Please provide a valid row (number or named row)');}/**
	     * Get (and create) the column index
	     * @param {(number|string)} ind The index
	     * @param {boolean} create
	     * @returns {number}
	     */},{key:"getColumnIndex",value:function getColumnIndex(ind,create){if(typeof ind==='number'){if(ind<this.columns()){return ind;}else if(create){this.addColumn(ind);return ind;}throw new Error('The requested column does not exist: '+ind);}else if(typeof ind==='string'){if(ind in this._headers){return this._headers[ind];}else if(create){this.addColumn({header:ind});return this._headers[ind];}throw new Error('Unable to find column named '+ind);}throw new Error('Please provide a valid column (number or named column)');}/**
	     * Add a column (at the specified index)
	     * @param {(Object|String)} config
	     * @param {(number|string)} ind
	     * @returns {Spyral.Table}
	     */},{key:"addColumn",value:function addColumn(config,ind){// determine col
	var col=this.columns();// default
	if(config&&typeof config==='string'){col=config;}else if(config&&(0, _typeof2["default"])(config)==='object'&&'header'in config){col=config.header;}else if(ind!==undefined){col=ind;}// check if it exists
	if(col in this._headers){throw new Error('This column exists already: '+config.header);}// add column
	var colIndex=this.columns();this._headers[col]=colIndex;// determine data
	var data=[];if(config&&(0, _typeof2["default"])(config)==='object'&&'rows'in config){data=config.rows;}else if(Array.isArray(config)){data=config;}// make sure we have enough rows for the new data
	var columns=this.columns();while(this._rows.length<data.length){this._rows[this._rows.length]=new Array(columns);}this._rows.forEach(function(r,i){return r[colIndex]=data[i];});return this;}/**
	     * This function returns different values depending on the arguments provided.
	     * When there are no arguments, it returns the number of rows in this table.
	     * When the first argument is the boolean value `true` all rows are returned.
	     * When the first argument is a an array then the rows corresponding to the row
	     * indices or names are returned. When all arguments except are numbers or strings
	     * then each of those is returned.
	     * @param {(Boolean|Array|Number|String)} [inds]
	     * @param {(Object|Number|String)} [config]
	     * @returns {(Number|Array)}
	     */},{key:"rows",value:function rows(inds,config){var _this7=this;// return length
	if(inds===undefined){return this._rows.length;}var rows=[];for(var _len3=arguments.length,other=new Array(_len3>2?_len3-2:0),_key3=2;_key3<_len3;_key3++){other[_key3-2]=arguments[_key3];}var asObj=config&&(0, _typeof2["default"])(config)==='object'&&config.asObj||other.length>0&&(0, _typeof2["default"])(other[other.length-1])==='object'&&other[other.length-1].asObj;// return all
	if(typeof inds==='boolean'&&inds){rows=this._rows.map(function(r,i){return _this7.row(i,asObj);});}// return specified rows
	else if(Array.isArray(inds)){rows=inds.map(function(ind){return _this7.row(ind);});}// return specified rows as varargs
	else if(typeof inds==='number'||typeof inds==='string'){[inds,config].concat(other).every(function(i){if(typeof i==='number'||typeof i==='string'){rows.push(_this7.row(i,asObj));return true;}else {return false;}});if(other.length>0){// when config is in last position
	if((0, _typeof2["default"])(other[other.length-1])==='object'){config=other[other.length-1];}}}// zip if requested
	if(config&&(0, _typeof2["default"])(config)==='object'&&'zip'in config&&config.zip){if(rows.length<2){throw new Error('Only one row available, can\'t zip');}return Table.zip(rows);}else {return rows;}}/**
	     * Get the specified row
	     * @param {(number|string)} ind
	     * @param {boolean} [asObj]
	     * @returns {(Object|Number|String)}
	     */},{key:"row",value:function row(ind,asObj){var row=this._rows[this.getRowIndex(ind)];if(asObj){var obj={};for(var key in this._headers){obj[key]=row[this._headers[key]];}return obj;}else {return row;}}/**
	     * This function returns different values depending on the arguments provided.
	     * When there are no arguments, it returns the number of columns in this table.
	     * When the first argument is the boolean value `true` all columns are returned.
	     * When the first argument is a number a slice of the columns is returned and if
	     * the second argument is a number it is treated as the length of the slice to
	     * return (note that it isn't the `end` index like with Array.slice()).
	     * @param {(Boolean|Array|Number|String)} [inds]
	     * @param {(Object|Number|String)} [config]
	     * @returns {(Number|Array)}
	     */},{key:"columns",value:function columns(inds,config){var _this8=this;// return length
	if(inds===undefined){return Object.keys(this._headers).length;}var columns=[];for(var _len4=arguments.length,other=new Array(_len4>2?_len4-2:0),_key4=2;_key4<_len4;_key4++){other[_key4-2]=arguments[_key4];}var asObj=config&&(0, _typeof2["default"])(config)==='object'&&config.asObj||other.length>0&&(0, _typeof2["default"])(other[other.length-1])==='object'&&other[other.length-1].asObj;// return all columns
	if(typeof inds==='boolean'&&inds){for(var i=0,len=this.columns();i<len;i++){columns.push(this.column(i,asObj));}}// return specified columns
	else if(Array.isArray(inds)){inds.forEach(function(i){return columns.push(_this8.column(i,asObj));},this);}else if(typeof inds==='number'||typeof inds==='string'){[inds,config].concat(other).every(function(i){if(typeof i==='number'||typeof i==='string'){columns.push(_this8.column(i,asObj));return true;}else {return false;}});if(other.length>0){// when config is in last position
	if((0, _typeof2["default"])(other[other.length-1])==='object'){config=other[other.length-1];}}}if(config&&(0, _typeof2["default"])(config)==='object'&&'zip'in config&&config.zip){if(columns.length<2){throw new Error('Only one column available, can\'t zip');}return Table.zip(columns);}else {return columns;}}/**
	     * Get the specified column
	     * @param {(number|string)} ind
	     * @param {boolean} [asObj]
	     * @returns {(Object|Number|String)}
	     */},{key:"column",value:function column(ind,asObj){var _this9=this;var column=this.getColumnIndex(ind);var data=this._rows.forEach(function(r){return r[column];});// TODO
	if(asObj){var obj={};this._rows.forEach(function(r){obj[r[_this9._rowKeyColumnIndex]]=r[column];});return obj;}else {return this._rows.map(function(r){return r[column];});}}/**
	     * Get the specified header
	     * @param {(number|string)} ind
	     * @returns {(number|string)}
	     */},{key:"header",value:function header(ind){var _this10=this;var keys=Object.keys(this._headers);var i=this.getColumnIndex(ind);return keys[keys.findIndex(function(k){return i===_this10._headers[k];})];}/**
	     * This function returns different values depending on the arguments provided.
	     * When there are no arguments, it returns the number of headers in this table.
	     * When the first argument is the boolean value `true` all headers are returned.
	     * When the first argument is a number a slice of the headers is returned.
	     * When the first argument is an array the slices specified in the array are returned.
	     * @param {(Boolean|Array|Number|String)} inds
	     * @returns {(Number|Array)}
	     */},{key:"headers",value:function headers(inds){var _this11=this;// return length
	if(inds===undefined){return Object.keys(this._headers).length;}// let headers = [];
	// return all
	if(typeof inds==='boolean'&&inds){inds=Array(Object.keys(this._headers).length).fill().map(function(_,i){return i;});}// return specified rows
	if(Array.isArray(inds)){return inds.map(function(i){return _this11.header(i);});}// return specified rows as varargs
	else if(typeof inds==='number'||typeof inds==='string'){for(var _len5=arguments.length,other=new Array(_len5>1?_len5-1:0),_key5=1;_key5<_len5;_key5++){other[_key5-1]=arguments[_key5];}return [inds].concat(other).map(function(i){return _this11.header(i);});}}/**
	     * Does the specified column exist
	     * @param {(number|string)} ind
	     * @returns {(number|string)}
	     */},{key:"hasColumn",value:function hasColumn(ind){return ind in this._headers;}/**
	     * Runs the specified function on each row.
	     * The function is passed the row and the row index.
	     * @param {Function} fn
	     */},{key:"forEach",value:function forEach(fn){this._rows.forEach(function(r,i){return fn(r,i);});}/**
	     * Get the minimum value in the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"rowMin",value:function rowMin(ind){return Math.min.apply(null,this.row(ind));}/**
	     * Get the maximum value in the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"rowMax",value:function rowMax(ind){return Math.max.apply(null,this.row(ind));}/**
	     * Get the minimum value in the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"columnMin",value:function columnMin(ind){return Math.min.apply(null,this.column(ind));}/**
	     * Get the maximum value in the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"columnMax",value:function columnMax(ind){return Math.max.apply(null,this.column(ind));}/**
	     * Get the sum of the values in the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"rowSum",value:function rowSum(ind){return Table.sum(this.row(ind));}/**
	     * Get the sum of the values in the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"columnSum",value:function columnSum(ind){return Table.sum(this.column(ind));}/**
	     * Get the mean of the values in the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"rowMean",value:function rowMean(ind){return Table.mean(this.row(ind));}/**
	     * Get the mean of the values in the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"columnMean",value:function columnMean(ind){return Table.mean(this.column(ind));}/**
	     * Get the count of each unique value in the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"rowCounts",value:function rowCounts(ind){return Table.counts(this.row(ind));}/**
	     * Get the count of each unique value in the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"columnCounts",value:function columnCounts(ind){return Table.counts(this.column(ind));}/**
	     * Get the rolling mean for the specified row
	     * @param {(number|string)} ind
	     * @param {number} neighbors
	     * @param {boolean} overwrite
	     * @returns {Array}
	     */},{key:"rowRollingMean",value:function rowRollingMean(ind,neighbors,overwrite){var means=Table.rollingMean(this.row(ind),neighbors);if(overwrite){this.setRow(ind,means);}return means;}/**
	     * Get the rolling mean for the specified column
	     * @param {(number|string)} ind
	     * @param {number} neighbors
	     * @param {boolean} overwrite
	     * @returns {Array}
	     */},{key:"columnRollingMean",value:function columnRollingMean(ind,neighbors,overwrite){var means=Table.rollingMean(this.column(ind),neighbors);if(overwrite){this.setColumn(ind,means);}return means;}/**
	     * Get the variance for the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"rowVariance",value:function rowVariance(ind){return Table.variance(this.row(ind));}/**
	     * Get the variance for the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"columnVariance",value:function columnVariance(ind){return Table.variance(this.column(ind));}/**
	     * Get the standard deviation for the specified row
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"rowStandardDeviation",value:function rowStandardDeviation(ind){return Table.standardDeviation(this.row(ind));}/**
	     * Get the standard deviation for the specified column
	     * @param {(number|string)} ind
	     * @returns {number}
	     */},{key:"columnStandardDeviation",value:function columnStandardDeviation(ind){return Table.standardDeviation(this.column(ind));}/**
	     * Get the z scores for the specified row
	     * @param {(number|string)} ind
	     * @returns {Array}
	     */},{key:"rowZScores",value:function rowZScores(ind){return Table.zScores(this.row(ind));}/**
	     * Get the z scores for the specified column
	     * @param {(number|string)} ind
	     * @returns {Array}
	     */},{key:"columnZScores",value:function columnZScores(ind){return Table.zScores(this.column(ind));}/**
	     * TODO
	     * Sort the specified rows
	     * @returns {Spyral.Table}
	     */},{key:"rowSort",value:function rowSort(inds,config){var _this12=this;// no inds, use all columns
	if(inds===undefined){inds=Array(this.columns()).fill().map(function(_,i){return i;});}// wrap a single index as array
	if(typeof inds==='string'||typeof inds==='number'){inds=[inds];}if(Array.isArray(inds)){return this.rowSort(function(a,b){var ind;for(var i=0,len=inds.length;i<len;i++){ind=_this12.getColumnIndex(inds[i]);if(a!==b){if(typeof a[ind]==='string'&&typeof b[ind]==='string'){return a[ind].localeCompare(b[ind]);}else {return a[ind]-b[ind];}}}return 0;},config);}if(typeof inds==='function'){this._rows.sort(function(a,b){if(config&&'asObject'in config&&config.asObject){var c={};for(var k in _this12._headers){c[k]=a[_this12._headers[k]];}var d={};for(var _k in _this12._headers){d[_k]=b[_this12._headers[_k]];}return inds.apply(_this12,[c,d]);}else {return inds.apply(_this12,[a,b]);}});if(config&&'reverse'in config&&config.reverse){this._rows.reverse();// in place
	}}return this;}/**
	     * TODO
	     * Sort the specified columns
	     * @returns {Spyral.Table}
	     */},{key:"columnSort",value:function columnSort(inds,config){var _this13=this;// no inds, use all columns
	if(inds===undefined){inds=Array(this.columns()).fill().map(function(_,i){return i;});}// wrap a single index as array
	if(typeof inds==='string'||typeof inds==='number'){inds=[inds];}if(Array.isArray(inds)){// convert to column names
	var headers=inds.map(function(ind){return _this13.header(ind);});// make sure we have all columns
	Object.keys(this._headers).forEach(function(h){if(!headers.includes(h)){headers.push(h);}});// sort names alphabetically
	headers.sort(function(a,b){return a.localeCompare(b);});// reorder by columns
	this._rows=this._rows.map(function(_,i){return headers.map(function(h){return _this13.cell(i,h);});});this._headers={};headers.forEach(function(h,i){return _this13._headers[h]=i;});}if(typeof inds==='function'){var _headers=Object.keys(this._headers);if(config&&'asObject'in _headers&&_headers.asObject){_headers=_headers.map(function(h,i){return {header:h,data:_this13._rows.map(function(r,j){return _this13.cell(i,j);})};});}_headers.sort(function(a,b){return inds.apply(_this13,[a,b]);});_headers=_headers.map(function(h){return (0, _typeof2["default"])(h)==='object'?h.header:h;});// convert back to string
	// make sure we have all keys
	Object.keys(this._headers).forEach(function(k){if(_headers.indexOf(k)===-1){_headers.push(k);}});this._rows=this._rows.map(function(_,i){return _headers.map(function(h){return _this13.cell(i,h);});});this._headers={};_headers.forEach(function(h,i){return _this13._headers[h]=i;});}}/**
	     * Get a CSV representation of the Table
	     * @param {Object} [config]
	     * @returns {string}
	     */},{key:"toCsv",value:function toCsv(config){var cell=function cell(c){var quote=/"/g;return typeof c==='string'&&(c.indexOf(',')>-1||c.indexOf('"')>-1)?'"'+c.replace(quote,'"')+'"':c;};return (config&&'noHeaders'in config&&config.noHeaders?'':this.headers(true).map(function(h){return cell(h);}).join(',')+'\n')+this._rows.map(function(row){return row.map(function(c){return cell(c);}).join(',');}).join('\n');}/**
	     * Get a TSV representation of the Table
	     * @param {Object} [config]
	     * @returns {string}
	     */},{key:"toTsv",value:function toTsv(config){return config&&'noHeaders'in config&&config.noHeaders?'':this.headers(true).join('\t')+'\n'+this._rows.map(function(row){return row.join('\t');}).join('\n');}/**
	     * Set the target's contents to an HTML representation of the Table
	     * @param {(Function|String|Object)} target
	     * @param {Object} [config]
	     * @returns {Spyral.Table}
	     */},{key:"html",value:function html(target,config){var html=this.toString(config);if(typeof target==='function'){target(html);}else {if(typeof target==='string'){target=document.querySelector(target);if(!target){throw 'Unable to find specified target: '+target;}}if((0, _typeof2["default"])(target)==='object'&&'innerHTML'in target){target.innerHTML=html;}}return this;}/**
	     * Same as {@link toString}.
	     */},{key:"toHtml",value:function toHtml(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};return this.toString(config);}/**
	     * Get an HTML representation of the Table
	     * @param {Object} [config]
	     * @returns {string}
	     */},{key:"toString",value:function toString(){var config=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};if(typeof config==='number'){config={limit:config};}if('top'in config&&!('limit'in config)){config.limit=config.top;}if('limit'in config&&!('bottom'in config)){config.bottom=0;}if('bottom'in config&&!('limit'in config)){config.limit=0;}return '<table'+('id'in config?' id="'+config.id+'" ':' ')+'class="voyantTable">'+(config&&'caption'in config&&typeof config.caption==='string'?'<caption>'+config.caption+'</caption>':'')+(config&&'noHeaders'in config&&config.noHeaders?'':'<thead><tr>'+this.headers(true).map(function(c){return '<th>'+c+'</th>';}).join('')+'</tr></thead>')+'<tbody>'+this._rows.filter(function(row,i,arr){return !('limit'in config)||i<config.limit||!('bottom'in config)||i>arr.length-1-config.bottom;}).map(function(row){return '<tr>'+row.map(function(c){return '<td>'+(typeof c==='number'?c.toLocaleString():c)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';}/**
	     * Show a chart representing the Table
	     * @param {(String|HTMLElement)} [target]
	     * @param {HighchartsConfig} [config]
	     * @returns {Highcharts.Chart}
	     */},{key:"chart",value:function chart(){var _this14=this;var target=arguments.length>0&&arguments[0]!==undefined?arguments[0]:undefined;var config=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};var _Chart$_handleTargetA=_chart["default"]._handleTargetAndConfig(target,config);var _Chart$_handleTargetA2=(0, _slicedToArray2["default"])(_Chart$_handleTargetA,2);target=_Chart$_handleTargetA2[0];config=_Chart$_handleTargetA2[1];config.chart=config.chart||{};var columnsCount=this.columns();var rowsCount=this.rows();var headers=this.headers(config.columns?config.columns:true);var isHeadersCategories=headers.every(function(h){return isNaN(h);});if(isHeadersCategories){_chart["default"]._setDefaultChartType(config,'column');}// set categories if not set
	config.xAxis=config.xAxis||{};config.xAxis.categories=config.xAxis.categories||headers;// start filling in series
	config.series=config.series||[];if(!('seriesFrom'in config)){// one row, so let's take series from rows
	if(rowsCount===1){config.dataFrom=config.dataFrom||'rows';}else if(columnsCount===1||!('dataFrom'in config)){config.dataFrom=config.dataFrom||'columns';}}if('dataFrom'in config){if(config.dataFrom==='rows'){config.data={rows:[]};config.data.rows.push(headers);config.data.rows=config.data.rows.concat(this.rows(true));}else if(config.dataFrom==='columns'){config.data={columns:[]};config.data.columns=config.data.columns.concat(this.columns(true));if(config.data.columns.length===headers.length){headers.forEach(function(h,i){config.data.columns[i].splice(0,0,h);});}}}else if('seriesFrom'in config){if(config.seriesFrom==='rows'){this.rows(config.rows?config.rows:true).forEach(function(row,i){config.series[i]=config.series[i]||{};config.series[i].data=headers.map(function(h){return _this14.cell(i,h);});});}else if(config.seriesFrom==='columns'){this.columns(config.columns?config.columns:true).forEach(function(col,i){config.series[i]=config.series[i]||{};config.series[i].data=[];for(var r=0;r<rowsCount;r++){config.series[i].data.push(_this14.cell(r,i));}});}}delete config.dataFrom;delete config.seriesFrom;return _chart["default"].create(target,config);}/**
	     * Create a new Table
	     * @param {(Object|Array|String|Number)} data
	     * @param {TableConfig} config
	     * @returns {Spyral.Table}
	     */}],[{key:"create",value:function create(data,config){for(var _len6=arguments.length,other=new Array(_len6>2?_len6-2:0),_key6=2;_key6<_len6;_key6++){other[_key6-2]=arguments[_key6];}return (0, _construct2["default"])(Table,[data,config].concat(other));}/**
	     * Fetch a Table from a source
	     * @param {(String|Request)} input
	     * @param {Object} api
	     * @param {Object} config
	     * @returns {Promise}
	     */},{key:"fetch",value:function fetch(input,api,config){return new Promise(function(resolve,reject){window.fetch(input,api).then(function(response){if(!response.ok){throw new Error(response.status+' '+response.statusText);}response.text().then(function(text){resolve(Table.create(text,config||api));});});});}/**
	     * Get the count of each unique value in the data
	     * @param {Array} data
	     * @returns {Object}
	     */},{key:"counts",value:function counts(data){var vals={};data.forEach(function(v){return v in vals?vals[v]++:vals[v]=1;});return vals;}/**
	     * Compare two values
	     * @param {(number|string)} a
	     * @param {(number|string)} b
	     * @returns {number}
	     */},{key:"cmp",value:function cmp(a,b){return typeof a==='string'&&typeof b==='string'?a.localeCompare(b):a-b;}/**
	     * Get the sum of the provided values
	     * @param {Array} data
	     * @returns {number}
	     */},{key:"sum",value:function sum(data){return data.reduce(function(a,b){return a+b;},0);}/**
	     * Get the mean of the provided values
	     * @param {Array} data
	     * @returns {number}
	     */},{key:"mean",value:function mean(data){return Table.sum(data)/data.length;}/**
	     * Get rolling mean for the provided values
	     * @param {Array} data
	     * @param {number} neighbors
	     * @returns {Array}
	     */},{key:"rollingMean",value:function rollingMean(data,neighbors){// https://stackoverflow.com/questions/41386083/plot-rolling-moving-average-in-d3-js-v4/41388581#41387286
	return data.map(function(val,idx,arr){var start=Math.max(0,idx-neighbors),end=idx+neighbors;var subset=arr.slice(start,end+1);var sum=subset.reduce(function(a,b){return a+b;});return sum/subset.length;});}/**
	     * Get the variance for the provided values
	     * @param {Array} data
	     * @returns {number}
	     */},{key:"variance",value:function variance(data){var m=Table.mean(data);return Table.mean(data.map(function(num){return Math.pow(num-m,2);}));}/**
	     * Get the standard deviation for the provided values
	     * @param {Array} data
	     * @returns {number}
	     */},{key:"standardDeviation",value:function standardDeviation(data){return Math.sqrt(Table.variance(data));}/**
	     * Get the z scores for the provided values
	     * @param {Array} data
	     * @returns {Array}
	     */},{key:"zScores",value:function zScores(data){var m=Table.mean(data);var s=Table.standardDeviation(data);return data.map(function(num){return (num-m)/s;});}/**
	     * Perform a zip operation of the provided arrays. Learn more about zip on [Wikipedia](https://en.wikipedia.org/wiki/Convolution_%28computer_science%29).
	     * @param {Array} data
	     * @returns {Array}
	     */},{key:"zip",value:function zip(){for(var _len7=arguments.length,data=new Array(_len7),_key7=0;_key7<_len7;_key7++){data[_key7]=arguments[_key7];}// we have a single nested array, so let's recall with flattened arguments
	if(data.length===1&&Array.isArray(data)&&data.every(function(d){return Array.isArray(d);})){var _Table$zip;return (_Table$zip=Table.zip).apply.apply(_Table$zip,[null].concat(data));}// allow arrays to be of different lengths
	var len=Math.max.apply(null,data.map(function(d){return d.length;}));return new Array(len).fill().map(function(_,i){return data.map(function(d){return d[i];});});}}]);return Table;}();// this seems like a good balance between a built-in flexible parser and a heavier external parser
	// https://lowrey.me/parsing-a-csv-file-in-es6-javascript/
	var regex=/(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;function parseCsvLine(line){var arr=[];line.replace(regex,function(m0,m1,m2,m3){if(m1!==undefined){arr.push(m1.replace(/\\'/g,'\''));}else if(m2!==undefined){arr.push(m2.replace(/\\"/g,'"'));}else if(m3!==undefined){arr.push(m3);}return '';});if(/,\s*$/.test(line)){arr.push('');}return arr;}var _default=Table;exports["default"]=_default;},{"./chart.js":272,"./util.js":277,"@babel/runtime/helpers/classCallCheck":33,"@babel/runtime/helpers/construct":34,"@babel/runtime/helpers/createClass":35,"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/slicedToArray":42,"@babel/runtime/helpers/typeof":43}],277:[function(require,module,exports){var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports["default"]=void 0;var _typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof"));var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));/**
	 * A helper for working with the Voyant Notebook app.
	 * @memberof Spyral
	 */var Util=/*#__PURE__*/function(){function Util(){(0, _classCallCheck2["default"])(this,Util);}(0, _createClass2["default"])(Util,null,[{key:"id",/**
	     * Generates a random ID of the specified length.
	     * @param {Number} len The length of the ID to generate?
	     * @returns {String}
	     */value:function id(){var len=arguments.length>0&&arguments[0]!==undefined?arguments[0]:8;// based on https://stackoverflow.com/a/13403498
	var times=Math.ceil(len/11);var id='';for(var i=0;i<times;i++){id+=Math.random().toString(36).substring(2);// the result of this is 11 characters long
	}var letters='abcdefghijklmnopqrstuvwxyz';id=letters[Math.floor(Math.random()*26)]+id;// ensure the id starts with a letter
	return id.substring(0,len);}/**
	     * 
	     * @param {Array|Object|String} contents 
	     * @returns {String}
	     */},{key:"toString",value:function toString(contents){if(contents.constructor===Array||contents.constructor===Object){contents=JSON.stringify(contents);if(contents.length>500){contents='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+contents.substring(0,500)+' <a href="">+</a><div style="display: none">'+contents.substring(501)+'</div>';}}return contents.toString();}/**
	     * 
	     * @param {String} before 
	     * @param {String} more 
	     * @param {String} after 
	     */},{key:"more",value:function more(before,_more,after){return before+'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+_more.substring(0,500)+' <a href="">+</a><div style="display: none">'+_more.substring(501)+'</div>'+after;}/**
	     * Take a data URL and convert it to a Blob.
	     * @param {String} dataUrl 
	     * @returns {Blob}
	     */},{key:"dataUrlToBlob",value:function dataUrlToBlob(dataUrl){var parts=dataUrl.split(',');var byteString=atob(parts[1]);var mimeString=parts[0].split(':')[1].split(';')[0];var ab=new ArrayBuffer(byteString.length);var ia=new Uint8Array(ab);for(var i=0;i<byteString.length;i++){ia[i]=byteString.charCodeAt(i);}return new Blob([ab],{type:mimeString});}/**
	     * Take a Blob and convert it to a data URL.
	     * @param {Blob} blob 
	     * @returns {String}
	     */},{key:"blobToDataUrl",value:function blobToDataUrl(blob){return new Promise(function(resolve,reject){var fr=new FileReader();fr.onload=function(e){resolve(e.target.result);};try{fr.readAsDataURL(blob);}catch(e){reject(e);}});}/**
	     * Takes an XML document and XSL stylesheet and returns the resulting transformation.
	     * @param {(Document|String)} xmlDoc The XML document to transform
	     * @param {(Document|String)} xslStylesheet The XSL to use for the transformation
	     * @param {Boolean} [returnDoc=false] True to return a Document, false to return a DocumentFragment
	     * @returns {Document}
	     */},{key:"transformXml",value:function transformXml(xmlDoc,xslStylesheet){var returnDoc=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;if(this.isString(xmlDoc)){var parser=new DOMParser();xmlDoc=parser.parseFromString(xmlDoc,'application/xml');var error=this._getParserError(xmlDoc);if(error){throw error;}}if(this.isString(xslStylesheet)){var _parser=new DOMParser();xslStylesheet=_parser.parseFromString(xslStylesheet,'application/xml');var _error=this._getParserError(xslStylesheet);if(_error){throw _error;}}var xslRoot=xslStylesheet.firstElementChild;if(xslRoot.hasAttribute('version')===false){// Transform fails in Firefox if version is missing, so return a more helpful error message instead of the default.
	throw new Error('XSL stylesheet is missing version attribute.');}var xsltProcessor=new XSLTProcessor();try{xsltProcessor.importStylesheet(xslStylesheet);}catch(e){console.warn(e);}var result;if(returnDoc){result=xsltProcessor.transformToDocument(xmlDoc);}else {result=xsltProcessor.transformToFragment(xmlDoc,document);}return result;}/**
	     * Checks the Document for a parser error and returns an Error if found, or null.
	     * @ignore
	     * @param {Document} doc 
	     * @param {Boolean} [includePosition=false] True to include the error position information
	     * @returns {Error|null}
	     */},{key:"_getParserError",value:function _getParserError(doc){var includePosition=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;// fairly naive check for parsererror, consider something like https://stackoverflow.com/a/55756548
	var parsererror=doc.querySelector('parsererror');if(parsererror!==null){var errorMsg=parsererror.textContent;var error=new Error(errorMsg);if(includePosition){var lineNumber=parseInt(errorMsg.match(/line[\s\w]+?(\d+)/i)[1]);var columnNumber=parseInt(errorMsg.match(/column[\s\w]+?(\d+)/i)[1]);error.lineNumber=lineNumber;error.columnNumber=columnNumber;}return error;}else {return null;}}/**
	     * Returns true if the value is a String.
	     * @param {*} val 
	     * @returns {Boolean} 
	     */},{key:"isString",value:function isString(val){return typeof val==='string';}/**
	     * Returns true if the value is a Number.
	     * @param {*} val 
	     * @returns {Boolean}
	     */},{key:"isNumber",value:function isNumber(val){return typeof val==='number';}/**
	     * Returns true if the value is a Boolean.
	     * @param {*} val 
	     * @returns {Boolean}
	     */},{key:"isBoolean",value:function isBoolean(val){return typeof val==='boolean';}/**
	     * Returns true if the value is Undefined.
	     * @param {*} val 
	     * @returns {Boolean}
	     */},{key:"isUndefined",value:function isUndefined(val){return typeof val==='undefined';}/**
	     * Returns true if the value is an Array.
	     * @param {*} val 
	     * @returns {Boolean}
	     */},{key:"isArray",value:function isArray(val){return Object.prototype.toString.call(val)==='[object Array]';}/**
	     * Returns true if the value is an Object.
	     * @param {*} val 
	     * @returns {Boolean}
	     */},{key:"isObject",value:function isObject(val){return Object.prototype.toString.call(val)==='[object Object]';}/**
	     * Returns true if the value is Null.
	     * @param {*} val 
	     * @returns {Boolean}
	     */},{key:"isNull",value:function isNull(val){return Object.prototype.toString.call(val)==='[object Null]';}/**
	     * Returns true if the value is a Node.
	     * @param {*} val 
	     * @returns {Boolean}
	     */},{key:"isNode",value:function isNode(val){return val instanceof Node;}/**
	     * Returns true if the value is a Function.
	     * @param {*} val 
	     * @returns {Boolean}
	     */},{key:"isFunction",value:function isFunction(val){return Object.prototype.toString.call(val)==='[object Function]';}/**
	     * Returns true if the value is a Promise.
	     * @param {*} val 
	     * @returns {Boolean}
	     */},{key:"isPromise",value:function isPromise(val){// ES6 promise detection
	// return Object.prototype.toString.call(val) === '[object Promise]';
	// general promise detection
	return !!val&&((0, _typeof2["default"])(val)==='object'||typeof val==='function')&&typeof val.then==='function';}/**
	     * Takes a MIME type and returns the related file extension.
	     * Only handles file types supported by Voyant.
	     * @param {String} mimeType 
	     * @returns {String}
	     */},{key:"getFileExtensionFromMimeType",value:function getFileExtensionFromMimeType(mimeType){mimeType=mimeType.trim().toLowerCase();switch(mimeType){case'application/atom+xml':return 'xml';case'application/rss+xml':return 'xml';case'application/xml':return 'xml';case'application/xhtml+xml':return 'xhtml';case'text/html':return 'html';case'application/pdf':return 'pdf';case'application/vnd.apple.pages':return 'pages';case'application/rtf':return 'rtf';case'application/vnd.oasis.opendocument.text':return 'odt';case'application/epub+zip':return 'epub';case'application/msword':return 'doc';case'application/vnd.openxmlformats-officedocument.wordprocessingml.document':return 'docx';case'application/vnd.ms-excel':return 'xls';case'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':return 'xlsx';default:return undefined;}}}]);return Util;}();var _default=Util;exports["default"]=_default;},{"@babel/runtime/helpers/classCallCheck":33,"@babel/runtime/helpers/createClass":35,"@babel/runtime/helpers/interopRequireDefault":37,"@babel/runtime/helpers/typeof":43}]},{},[1])(1);});});unwrapExports(voyantjs);var voyantjs_1=voyantjs.Corpus;var voyantjs_2=voyantjs.Table;var voyantjs_3=voyantjs.Load;var voyantjs_4=voyantjs.Util;var voyantjs_5=voyantjs.Chart;var voyantjs_6=voyantjs.Categories;

	/**
	 * A helper for working with the Voyant Notebook app.
	 * @memberof Spyral
	 */
	class Notebook {
		
		/**
		 * 
		 * @param {*} contents 
		 * @param {*} config 
		 */
		static show(contents, config) {
			var contents = Spyral.Util.toString(contents);
			if (contents instanceof Promise) {
				contents.then(c => Spyral.Util.show(c));
			} else {
				Spyral.Util.show(contents);
			}
		}
		/**
		 * Returns the target element
		 * @returns {element}
		 */
		static getTarget() {
			const target = document.createElement("div");
			document.body.appendChild(target);
			return target;
		}

		/**
		 * Returns a new promise
		 * @returns {Promise} A promise
		 */
		static getPromise() {
			return new Promise();
		}

		/**
		 * Fetch and return the content of a notebook or a particular cell in a notebook
		 * @param {string} url The URL of the notebook to import
		 * @param {number} [cellIndex] The index of the cell to import
		 */
		static async import(url, cellIndex=undefined) {
			const urlHasHash = url.indexOf('#') !== -1;
			const isAbsoluteUrl = url.indexOf('http') === 0;

			let notebookId = '';
			let cellId = undefined;
			if (isAbsoluteUrl) {
				const urlParts = url.match(/\/[\w-]+/g);
				if (urlParts !== null) {
					notebookId = urlParts[urlParts.length-1].replace('/', '');
				} else {
					return;
				}
				if (urlHasHash) {
					cellId = url.split('#')[1];
				}
			} else {
				if (urlHasHash) {
					[notebookId, cellId] = url.split('#');
				} else {
					notebookId = url;
				}
			}

			let json;
			try {
				json = await Spyral.Load.trombone({
					tool: 'notebook.GitNotebookManager',
					action: 'load',
					id: notebookId,
					noCache: 1
				});
			} catch (e) {
				throw new Error('There was an error importing the notebook. Please ensure the URL and ID are correct.');
			}

			const notebook = JSON.parse(json.notebook.data);

			function getCodeStringForDataCell(dataCellContent) {
				let code = '';
				switch(dataCellContent.mode) {
					case 'text':
						code = dataCellContent.dataName+'=`'+dataCellContent.input+'`';
						break;
					case 'json':
						code = dataCellContent.dataName+'= JSON.parse(`'+dataCellContent.input+'`)';
						break;
					case 'xml':
						code = dataCellContent.dataName+'= new DOMParser().parseFromString(`'+dataCellContent.input+'`, "application/xml")';
						break;
					case 'html':
						code = dataCellContent.dataName+'= new DOMParser().parseFromString(`'+dataCellContent.input+'`, "application/xml")';
						break;
				}
				return code;
			}
			
			const cells2import = notebook.cells.filter((cell, index) => {
				if (cell.type === 'code' || cell.type === 'data') {
					if (cellId === undefined && cellIndex === undefined) {
						return true;
					} else if (cell.cellId === cellId) {
						return true;
					} else if (cellIndex !== undefined && cellIndex === index+1) { // the index shown notebook counter is one-based
						return true;
					}
				}
			});

			const importedCode = cells2import.map((cell) => {
				if (cell.type === 'data') {
					return getCodeStringForDataCell(cell.content);
				} else {
					return cell.content.input;
				}
			});

			console.log('imported:', importedCode);

			async function __doRun(code) {
				// console.log('running:',code);
				try {
					const result = eval.call(window, code);
					const prResult = await Promise.resolve(result);
					if (importedCode.length > 0) {
						return __doRun(importedCode.shift());
					} else {
						return prResult;
					}
				} catch(e) {
					throw new Error('There was an error importing the notebook: '+e.message);
				}
			}

			if (importedCode.length > 0) {
				return __doRun(importedCode.shift());
			} else {
				throw new Error('There was an error importing the notebook. No code found for the specified '+ (cellId === undefined && cellIndex === undefined ? 'notebook' : 'cell')+'.');
			}
		}
	}

	/**
	 * A class for storing Notebook metadata
	 * @memberof Spyral
	 */
	class Metadata {
		
		/** 
		 * The metadata constructor.
		 * @constructor
		 * @param {Object} config The metadata config object
		 * @param {String} config.title The title of the Notebook
		 * @param {String} config.userId The user ID of the author of the Notebook
		 * @param {String} config.author The name of the author of the Notebook
		 * @param {Boolean} config.catalogue Whether to include the Notebook in the Catalogue
		 * @param {String} config.description The description of the Notebook
		 * @param {Array} config.keywords The keywords for the Notebook
		 * @param {String} config.created When the Notebook was created
		 * @param {String} config.language The language of the Notebook
		 * @param {String} config.license The license for the Notebook
		 * @returns {Spyral.Metadata}
		 */
		constructor(config) {
			['title', 'userId', 'author', 'description', 'catalogue', 'keywords', 'modified', 'created', 'language', 'license'].forEach(key => {
				if (key === 'keywords') {
					this[key] = [];
				} else if (key === 'catalogue') {
					this[key] = false;
				} else {
					this[key] = '';
				}
			});
			this.version = "0.1"; // may be changed by config
			if (config instanceof HTMLDocument) {
				config.querySelectorAll("meta").forEach(function(meta) {
					var name =  meta.getAttribute("name");
					if (name && this.hasOwnProperty(name)) {
						var content = meta.getAttribute("content");
						if (content) {
							if (name === 'keywords') {
								var spaces = content.match(/\s+/g);
								if (content.search(',') === -1 && spaces !== null && spaces.length > 1) {
									// backwards compatibility: if there are no commas but multiple spaces then assume space delimited keywords
									content = content.split(/\s+/);
								} else {
									content = content.split(',');
								}
							} else if (name === 'catalogue') {
								content = content.toLowerCase() === 'true';
							}
							this[name] = content;
						}
					}
				}, this);
			} else {
				this.set(config);
			}
			if (!this.created) {this.setDateNow("created");}
		}

		/**
		 * Set metadata properties.
		 * @param {Object} config A config object
		 */
		set(config) {
			for (var key in config) {
				if (this.hasOwnProperty(key)) {
					this[key] = config[key];
				}
			}
		}

		/**
		 * Sets the specified field to the current date and time.
		 * @param {String} field 
		 */
		setDateNow(field) {
			this[field] = new Date().toISOString();
		}

		/**
		 * Gets the specified field as a short date.
		 * @param {String} field
		 * @returns {(String|undefined)}
		 */
		shortDate(field) {
			return this[field] ? (new Date(Date.parse(this[field])).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) : undefined;
		}

		/**
		 * Gets the fields as a set of HTML meta tags.
		 * @returns {String}
		 */
		getHeaders() {
			var quotes = /"/g, newlines = /(\r\n|\r|\n)/g, tags = /<\/?\w+.*?>/g,
				headers = "<title>"+(this.title || "").replace(tags,"")+"</title>\n";
			for (var key in this) {
				if (this[key]) {
					if (Array.isArray(this[key])) {
						const array2string = this[key].join(',');
						headers+='<meta name="'+key+'" content="'+array2string.replace(quotes, "&quot;").replace(newlines, " ")+'">';
					} else if (typeof this[key] === 'boolean') {
						headers+='<meta name="'+key+'" content="'+this[key]+'">';
					} else {
						headers+='<meta name="'+key+'" content="'+this[key].replace(quotes, "&quot;").replace(newlines, " ")+'">';
					}
				}
			}
			return headers;
		}

		/**
		 * Returns a clone of this Metadata
		 * @returns {Spyral.Metadata}
		 */
		clone() {
			let config = {};
			Object.assign(config, this);
			return new Metadata(config);
		}


	}

	/**
	 * A class for simplying resource storage
	 * @class Storage
	 * @memberof Spyral.Util
	 */
	class Storage {

		constructor(config) {
			this.MAX_LENGTH = 950000; // keep it under 1 megabyte
		}
		
		/**
		 * Store a resource
		 * @name Spyral.Util.Storage.storeResource
		 * @function
		 * @param {String} id 
		 * @param {*} data 
		 * @returns {Promise}
		 */
		static storeResource(id, data) {
			var dataString = JSON.stringify(data);
			
			if (dataString.length > this.MAX_LENGTH) {
				// split into chunks
				var promise = new Promise(function(resolve, reject) {
					var numChunks = Math.ceil(dataString.length / this.MAX_LENGTH);
				
					var chunkIds = [];
					for (var i = 0; i < numChunks; i++) {
						chunkIds.push(id+'-chunk'+i);
					}
					this._doStore(id+'-hasChunks', JSON.stringify(chunkIds)).then(function() {
						var chunkCount = 0;
						var currIndex = 0;
						for (var i = 0; i < numChunks; i++) {
							var chunkString = dataString.substr(currIndex, this.MAX_LENGTH);
							
							this._doStore(chunkIds[i], chunkString).then(function() {
								chunkCount++;
								if (chunkCount == numChunks) {
									resolve();
								}
							}, function() {
								reject();
							});
							
							currIndex += this.MAX_LENGTH;
						}
					}.bind(this), function() {
						reject();
					});
				}.bind(this));
				
				return promise;
			} else {
				return this._doStore(id, dataString);
			}
		}

		/**
		 * Get the URL for trombone
		 * @name Spyral.Util.Storage.getTromboneUrl
		 * @function
		 * @returns {String}
		 */
		static getTromboneUrl() {
			return 'https://beta.voyant-tools.org/trombone'
			// return 'http://localhost:8080/voyant/trombone'
		}
		
		static _doStore(id, dataString) {
			return fetch(this.getTromboneUrl(), {
				method: 'GET',
				body: {
	                tool: 'resource.StoredResource',
	                resourceId: id,
	                storeResource: dataString
	            }
			});
		}
		
		/**
		 * Get a stored resource
		 * @name Spyral.Util.Storage.getStoredResource
		 * @function
		 * @param {String} id 
		 * @returns {Promise}
		 */
		static getStoredResource(id) {
			return fetch(this.getTromboneUrl(), {
				method: 'GET',
				body: {
	                tool: 'resource.StoredResource',
	                verifyResourceId: id+'-hasChunks'
	            }
			}).then(function(response) {
				if (response.ok) {
					response.json().then(json => {
						if (json && json.storedResource && json.storedResource.id && json.storedResource.id !== '') {
							// chunks
							this._doGetStored(json.storedResource.id, false).then(function(chunkIds) {
								var fullData = '';
								var dataChunks = {};
								for (var i = 0; i < chunkIds.length; i++) {
									this._doGetStored(chunkIds[i], true).then(function(response) {
										var chunkId = response[0];
										var value = response[1];
										dataChunks[chunkId] = value;
										
										var done = true;
										for (var j = chunkIds.length-1; j >= 0; j--) {
											if (dataChunks[chunkIds[j]] === undefined) {
												done = false;
												break;
											}
										}
										
										if (done) {
											for (var j = 0; j < chunkIds.length; j++) {
												fullData += dataChunks[chunkIds[j]];
											}
											return fullData;
										}
									}, function(err) {
										throw Error('Storage: '+err)
									});
								}
							}, function(err) {
								throw Error('Storage: '+err)
							});
						} else {
							// no chunks
							return this._doGetStored(id, false).then(function(value) {
								return value
							}, function(err) {
								throw Error('Storage: '+err)
							});
						}
					});
				}
			});
		}
		
		static _doGetStored(id, isChunk) {
			return fetch(this.getTromboneUrl(), {
				method: 'GET',
				body: {
	                tool: 'resource.StoredResource',
	                retrieveResourceId: id,
	                failQuietly: true
	            }
			}).then(function(response) {
				if (response.ok) {
					response.json().then(json => {
						var id = json.storedResource.id;
						var value = json.storedResource.resource;
						if (value.length == 0) {
							throw Error('Storage: stored file is empty')
						} else {
							if (isChunk !== true) {
								// value = JSON.parse(value);
								return value;
							} else {
								return [id, value];
							}
						}
					});
				}
			});
		}
	}

	/**
	 * Show contents in the results area.
	 * @memberof Spyral.Util
	 * @method show
	 * @static
	 * @param {*} contents 
	 * @param {*} len 
	 * @param {*} mode 
	 */
	function show(contents, len, mode='info') {
		if (this && this.then) {
			var arg = contents;
			this.then(function(val) {
				show.call(val, val, arg);
			});
		} else {
			if (contents === undefined) {
				return;
			}
			
			if (Array.isArray(contents)) {
				var allContents = "";
				contents.forEach(function(content) {
					allContents += content.getString ? content.getString() : content.toString();
				});
				contents = allContents;
			} else if (typeof this === 'string' || this instanceof String) {
				if (typeof contents === 'number' && isFinite(contents)) {
					len = contents;
				}
				contents = this;
			}
			if (contents.then) { // check if we currently have a promise
				return contents.then(function(text) {show(text, len);})
			}
			if (contents.toHtml) {contents=contents.toHtml();}
			else if (contents.getString) {contents=contents.getString();}
			else if (contents.toString) {contents=contents.toString();}

			if (contents.then) { // check again to see if we have a promise (like from toString())
				contents.then(function(text) {show(text, len);});
			} else {
				if (len && typeof len === 'number' && isFinite(len)) {
					contents = contents.substring(0,len);
				}
				contents="<div class='"+mode+"'>"+contents+"</div>";
				document.body.insertAdjacentHTML('beforeend', contents);
			}
		}
	}

	/**
	 * Show an error in the results area.
	 * @memberof Spyral.Util
	 * @method showError
	 * @static
	 * @param {*} error 
	 * @param {*} more 
	 */
	function showError(error, more) {
		if (error !== undefined && error instanceof Error) {
			if (error.stack && more === undefined) {
				more = error.stack;
			}
			// trim excess error stack (it's likely already in "more")
			error = error.toString().split(/(\r\n|\r|\n)/).shift();
		}

		if (more && typeof more !== 'string' && more instanceof String === false) {
			more = more.toString();
		}

		if (console) {console.error(error);}
		if (more) {
			var encodedMore = more.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&apos;');
			error='<strong>'+error.toString()+'</strong><pre><span style="cursor:pointer;text-decoration:underline;" onclick="this.nextElementSibling.style.display=\'block\';this.style.display=\'none\';">Details</span><span style="display:none;">'+encodedMore+'</span></pre>';
		}
		show(error, undefined, 'error');
	}

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	    _typeof = function (obj) {
	      return typeof obj;
	    };
	  } else {
	    _typeof = function (obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	    };
	  }

	  return _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	/**
	 * A helper for working with the Voyant Notebook app.
	 * @memberof Spyral
	 */
	var Util = /*#__PURE__*/function () {
	  function Util() {
	    _classCallCheck(this, Util);
	  }

	  _createClass(Util, null, [{
	    key: "id",

	    /**
	     * Generates a random ID of the specified length.
	     * @param {Number} len The length of the ID to generate?
	     * @returns {String}
	     */
	    value: function id() {
	      var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8;
	      // based on https://stackoverflow.com/a/13403498
	      var times = Math.ceil(len / 11);
	      var id = '';

	      for (var i = 0; i < times; i++) {
	        id += Math.random().toString(36).substring(2); // the result of this is 11 characters long
	      }

	      var letters = 'abcdefghijklmnopqrstuvwxyz';
	      id = letters[Math.floor(Math.random() * 26)] + id; // ensure the id starts with a letter

	      return id.substring(0, len);
	    }
	    /**
	     * 
	     * @param {Array|Object|String} contents 
	     * @returns {String}
	     */

	  }, {
	    key: "toString",
	    value: function toString(contents) {
	      if (contents.constructor === Array || contents.constructor === Object) {
	        contents = JSON.stringify(contents);

	        if (contents.length > 500) {
	          contents = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>' + contents.substring(0, 500) + ' <a href="">+</a><div style="display: none">' + contents.substring(501) + '</div>';
	        }
	      }

	      return contents.toString();
	    }
	    /**
	     * 
	     * @param {String} before 
	     * @param {String} more 
	     * @param {String} after 
	     */

	  }, {
	    key: "more",
	    value: function more(before, _more, after) {
	      return before + '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>' + _more.substring(0, 500) + ' <a href="">+</a><div style="display: none">' + _more.substring(501) + '</div>' + after;
	    }
	    /**
	     * Take a data URL and convert it to a Blob.
	     * @param {String} dataUrl 
	     * @returns {Blob}
	     */

	  }, {
	    key: "dataUrlToBlob",
	    value: function dataUrlToBlob(dataUrl) {
	      var parts = dataUrl.split(',');
	      var byteString = atob(parts[1]);
	      var mimeString = parts[0].split(':')[1].split(';')[0];
	      var ab = new ArrayBuffer(byteString.length);
	      var ia = new Uint8Array(ab);

	      for (var i = 0; i < byteString.length; i++) {
	        ia[i] = byteString.charCodeAt(i);
	      }

	      return new Blob([ab], {
	        type: mimeString
	      });
	    }
	    /**
	     * Take a Blob and convert it to a data URL.
	     * @param {Blob} blob 
	     * @returns {String}
	     */

	  }, {
	    key: "blobToDataUrl",
	    value: function blobToDataUrl(blob) {
	      return new Promise(function (resolve, reject) {
	        var fr = new FileReader();

	        fr.onload = function (e) {
	          resolve(e.target.result);
	        };

	        try {
	          fr.readAsDataURL(blob);
	        } catch (e) {
	          reject(e);
	        }
	      });
	    }
	    /**
	     * Takes an XML document and XSL stylesheet and returns the resulting transformation.
	     * @param {(Document|String)} xmlDoc The XML document to transform
	     * @param {(Document|String)} xslStylesheet The XSL to use for the transformation
	     * @param {Boolean} [returnDoc=false] True to return a Document, false to return a DocumentFragment
	     * @returns {Document}
	     */

	  }, {
	    key: "transformXml",
	    value: function transformXml(xmlDoc, xslStylesheet) {
	      var returnDoc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	      if (this.isString(xmlDoc)) {
	        var parser = new DOMParser();
	        xmlDoc = parser.parseFromString(xmlDoc, 'application/xml');

	        var error = this._getParserError(xmlDoc);

	        if (error) {
	          throw error;
	        }
	      }

	      if (this.isString(xslStylesheet)) {
	        var _parser = new DOMParser();

	        xslStylesheet = _parser.parseFromString(xslStylesheet, 'application/xml');

	        var _error = this._getParserError(xslStylesheet);

	        if (_error) {
	          throw _error;
	        }
	      }

	      var xslRoot = xslStylesheet.firstElementChild;

	      if (xslRoot.hasAttribute('version') === false) {
	        // Transform fails in Firefox if version is missing, so return a more helpful error message instead of the default.
	        throw new Error('XSL stylesheet is missing version attribute.');
	      }

	      var xsltProcessor = new XSLTProcessor();

	      try {
	        xsltProcessor.importStylesheet(xslStylesheet);
	      } catch (e) {
	        console.warn(e);
	      }

	      var result;

	      if (returnDoc) {
	        result = xsltProcessor.transformToDocument(xmlDoc);
	      } else {
	        result = xsltProcessor.transformToFragment(xmlDoc, document);
	      }

	      return result;
	    }
	    /**
	     * Checks the Document for a parser error and returns an Error if found, or null.
	     * @ignore
	     * @param {Document} doc 
	     * @param {Boolean} [includePosition=false] True to include the error position information
	     * @returns {Error|null}
	     */

	  }, {
	    key: "_getParserError",
	    value: function _getParserError(doc) {
	      var includePosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	      // fairly naive check for parsererror, consider something like https://stackoverflow.com/a/55756548
	      var parsererror = doc.querySelector('parsererror');

	      if (parsererror !== null) {
	        var errorMsg = parsererror.textContent;
	        var error = new Error(errorMsg);

	        if (includePosition) {
	          var lineNumber = parseInt(errorMsg.match(/line[\s\w]+?(\d+)/i)[1]);
	          var columnNumber = parseInt(errorMsg.match(/column[\s\w]+?(\d+)/i)[1]);
	          error.lineNumber = lineNumber;
	          error.columnNumber = columnNumber;
	        }

	        return error;
	      } else {
	        return null;
	      }
	    }
	    /**
	     * Returns true if the value is a String.
	     * @param {*} val 
	     * @returns {Boolean} 
	     */

	  }, {
	    key: "isString",
	    value: function isString(val) {
	      return typeof val === 'string';
	    }
	    /**
	     * Returns true if the value is a Number.
	     * @param {*} val 
	     * @returns {Boolean}
	     */

	  }, {
	    key: "isNumber",
	    value: function isNumber(val) {
	      return typeof val === 'number';
	    }
	    /**
	     * Returns true if the value is a Boolean.
	     * @param {*} val 
	     * @returns {Boolean}
	     */

	  }, {
	    key: "isBoolean",
	    value: function isBoolean(val) {
	      return typeof val === 'boolean';
	    }
	    /**
	     * Returns true if the value is Undefined.
	     * @param {*} val 
	     * @returns {Boolean}
	     */

	  }, {
	    key: "isUndefined",
	    value: function isUndefined(val) {
	      return typeof val === 'undefined';
	    }
	    /**
	     * Returns true if the value is an Array.
	     * @param {*} val 
	     * @returns {Boolean}
	     */

	  }, {
	    key: "isArray",
	    value: function isArray(val) {
	      return Object.prototype.toString.call(val) === '[object Array]';
	    }
	    /**
	     * Returns true if the value is an Object.
	     * @param {*} val 
	     * @returns {Boolean}
	     */

	  }, {
	    key: "isObject",
	    value: function isObject(val) {
	      return Object.prototype.toString.call(val) === '[object Object]';
	    }
	    /**
	     * Returns true if the value is Null.
	     * @param {*} val 
	     * @returns {Boolean}
	     */

	  }, {
	    key: "isNull",
	    value: function isNull(val) {
	      return Object.prototype.toString.call(val) === '[object Null]';
	    }
	    /**
	     * Returns true if the value is a Node.
	     * @param {*} val 
	     * @returns {Boolean}
	     */

	  }, {
	    key: "isNode",
	    value: function isNode(val) {
	      return val instanceof Node;
	    }
	    /**
	     * Returns true if the value is a Function.
	     * @param {*} val 
	     * @returns {Boolean}
	     */

	  }, {
	    key: "isFunction",
	    value: function isFunction(val) {
	      return Object.prototype.toString.call(val) === '[object Function]';
	    }
	    /**
	     * Returns true if the value is a Promise.
	     * @param {*} val 
	     * @returns {Boolean}
	     */

	  }, {
	    key: "isPromise",
	    value: function isPromise(val) {
	      // ES6 promise detection
	      // return Object.prototype.toString.call(val) === '[object Promise]';
	      // general promise detection
	      return !!val && (_typeof(val) === 'object' || typeof val === 'function') && typeof val.then === 'function';
	    }
	    /**
	     * Takes a MIME type and returns the related file extension.
	     * Only handles file types supported by Voyant.
	     * @param {String} mimeType 
	     * @returns {String}
	     */

	  }, {
	    key: "getFileExtensionFromMimeType",
	    value: function getFileExtensionFromMimeType(mimeType) {
	      mimeType = mimeType.trim().toLowerCase();

	      switch (mimeType) {
	        case 'application/atom+xml':
	          return 'xml';

	        case 'application/rss+xml':
	          return 'xml';

	        case 'application/xml':
	          return 'xml';

	        case 'application/xhtml+xml':
	          return 'xhtml';

	        case 'text/html':
	          return 'html';

	        case 'application/pdf':
	          return 'pdf';

	        case 'application/vnd.apple.pages':
	          return 'pages';

	        case 'application/rtf':
	          return 'rtf';

	        case 'application/vnd.oasis.opendocument.text':
	          return 'odt';

	        case 'application/epub+zip':
	          return 'epub';

	        case 'application/msword':
	          return 'doc';

	        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
	          return 'docx';

	        case 'application/vnd.ms-excel':
	          return 'xls';

	        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
	          return 'xlsx';

	        default:
	          return undefined;
	      }
	    }
	  }]);

	  return Util;
	}();

	// Based on code from https://github.com/renhongl/json-viewer-js

	/**
	 * @ignore
	 */
	class DataViewer {

		constructor(options) {
			this.cls = 'spyral-dv-';

			let defaults = {
				container: document.body,
				data: '{}',
				name: undefined,
				expand: false
			};
			this.options = Object.assign(defaults, options);

			this.options.container.setAttribute('class', `${this.cls}container`);

			this.exportData = {};
			this.exportDataContext = this.exportData;

			this.render(0, this.options.container, this.options.name, this.options.data);
		}

		render(indent, parent, key, data) {
			let {type, basicType} = getTypeData(data);

			this.exportDataContext[key] = {
				type: type,
				value: undefined
			};
			this.exportDataContext = this.exportDataContext[key];

			let createdItem = this.createItem(indent, parent, key, data);
			
			if (basicType) {
				createdItem.right.setAttribute('class', `${this.cls}${type} ${this.cls}right`);
				if (type === 'Null') data = 'null';
				else if (type === 'String') data = '"'+data+'"';
				createdItem.right.innerText = data;
				
				this.exportDataContext.value = data;
			} else {
				const exportDataParentContext = [];
				this.exportDataContext.value = exportDataParentContext;

				if (type === 'Node') {
					for (let n of data.childNodes) {
						let key = n.tagName || '#text';
						if (key === '#text') {
							n = n.textContent.trim();
							if (n.length === 0) continue;
						}

						exportDataParentContext.push({});
						this.exportDataContext = exportDataParentContext[exportDataParentContext.length-1];

						this.render(indent+0, createdItem.right, key, n);
					}
				} else if (type === 'Object') {
					for (let key in data) {
						if (data.hasOwnProperty(key)) {

							exportDataParentContext.push({});
							this.exportDataContext = exportDataParentContext[exportDataParentContext.length-1];

							this.render(indent+0, createdItem.right, key, data[key]);
						}
					}
				} else {
					for (let i = 0, l = data.length; i < l; i++) {
						
						exportDataParentContext.push({});
						this.exportDataContext = exportDataParentContext[exportDataParentContext.length-1];

						this.render(indent+0, createdItem.right, i, data[i]);
					}
				}
			}
		}
		 
		createItem(indent, parent, key, data) {
			let container = document.createElement('span');
			container.style.marginLeft = indent*2 + 'px';
			container.setAttribute('class', `${this.cls}content`);

			let left = document.createElement('span');
			let right = document.createElement('span');
			container.appendChild(left);
			container.appendChild(right);

			parent.appendChild(container);
			
			let {type, basicType} = getTypeData(data);

			if (basicType) {
				if (key !== undefined) left.innerHTML = key+':&nbsp;';
				left.setAttribute('class', `${this.cls}left`);
			} else {
				let numChildren;
				let bracketL;
				let bracketR;
				if (type === 'Node') {
					numChildren = data.childNodes.length;
					bracketL = '<';
					bracketR = '>';
				} else if (type === 'Object') {
					numChildren = Object.keys(data).length;
					bracketL = '{';
					bracketR = '}';
				} else {
					numChildren = data.length;
					bracketL = '[';
					bracketR = ']';
				}
				
				left.innerHTML = `${key}: <span class="${this.cls}type">${type}</span><span class="${this.cls}length">${bracketL}${numChildren}${bracketR}</span> `;

				if (numChildren > 0) {
					let expandCls = this.options.expand ? `${this.cls}expanded` : `${this.cls}collapsed`;

					let folderIcon = document.createElement('span');
					folderIcon.setAttribute('class', `${this.cls}folder-icon ${expandCls}`);
					folderIcon.innerHTML = '<svg width="8" height="8" class="open"><path d="M4 7L0 1h8z" fill="#000"></path></svg>'+'<svg width="8" height="8" class="closed"><path d="M7 4L1 8V0z" fill="#000"></path></svg>';
					left.append(folderIcon);
					
					left.setAttribute('class', `${this.cls}left ${this.cls}folder`);
					
					let self = this;
					left.onclick = function(e) {
						let target = e.currentTarget;
						let collapsedParent = e.currentTarget.closest(`.${self.cls}collapsed`);
						if (collapsedParent !== null) {
							target = collapsedParent.previousElementSibling;
						}
						self.toggleItem(target);
						self.options.container.dispatchEvent(new Event(`${self.cls}toggle`));
					};

					right.setAttribute('class', `${this.cls}${type} ${this.cls}right ${expandCls}`);
				}
			}
				
			return {
				left: left,
				right: right
			};
		}
		 
		toggleItem(folderEl) {
			let iconEl = folderEl.querySelector(`.${this.cls}folder-icon`);
			let contentsEl = folderEl.nextElementSibling;
			
			let doExpand = iconEl.classList.contains(`${this.cls}expanded`) === false;
		
			if (doExpand) {
				iconEl.classList.remove(`${this.cls}collapsed`);
				iconEl.classList.add(`${this.cls}expanded`);
				contentsEl.classList.remove(`${this.cls}collapsed`);
				contentsEl.classList.add(`${this.cls}expanded`);
			} else {
				iconEl.classList.remove(`${this.cls}expanded`);
				iconEl.classList.add(`${this.cls}collapsed`);
				contentsEl.classList.remove(`${this.cls}expanded`);
				contentsEl.classList.add(`${this.cls}collapsed`);
				contentsEl.querySelectorAll(`.${this.cls}expanded`).forEach(function(expandedChild) {
					expandedChild.classList.remove(`${this.cls}expanded`);
					expandedChild.classList.add(`${this.cls}collapsed`);
				}.bind(this));
			}
		}

		getExportData() {
			return this.exportData;
		}
	}

	function getTypeData(val) {
		let type = 'Undefined';
		if (Util.isNode(val)) type = 'Node';
		if (Util.isObject(val)) type = 'Object';
		if (Util.isArray(val)) type = 'Array';
		if (Util.isString(val)) type = 'String';
		if (Util.isNumber(val)) type = 'Number';
		if (Util.isBoolean(val)) type = 'Boolean';
		if (Util.isNull(val)) type = 'Null';

		const basicType = type !== 'Node' && type !== 'Object' && type !== 'Array';

		return {type, basicType};
	}

	voyantjs_4.Storage = Storage;
	voyantjs_4.show = show;
	voyantjs_4.showError = showError;
	voyantjs_4.DataViewer = DataViewer;

	/**
	 * @namespace Spyral
	 */
	const Spyral$1 = {
		Notebook,
		Util: voyantjs_4,
		Metadata,
		Corpus: voyantjs_1,
		Table: voyantjs_2,
		Load: voyantjs_3,
		Chart: voyantjs_5,
		Categories: voyantjs_6
	};

	/**
	 * @borrows Spyral.Corpus.load as loadCorpus
	 * @memberof window
	 * @method loadCorpus
	 * @static
	 */
	window.loadCorpus = Spyral$1.Corpus.load;
	/**
	 * @borrows Spyral.Table.create as createTable
	 * @memberof window
	 * @method createTable
	 * @static
	 */
	window.createTable = Spyral$1.Table.create;

	/**
	 * @borrows Spyral.Util.show as show
	 * @memberof window
	 * @method show
	 * @static
	 */
	window.show = Spyral$1.Util.show;
	/**
	 * @borrows Spyral.Util.showError as showError
	 * @memberof window
	 * @method showError
	 * @static
	 */
	window.showError = Spyral$1.Util.showError;

	return Spyral$1;

}());
