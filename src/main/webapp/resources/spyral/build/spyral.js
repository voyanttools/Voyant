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

	var FAILS_ON_PRIMITIVES$1 = fails(function () { objectGetPrototypeOf(1); });

	// `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$1, sham: !correctPrototypeGetter }, {
	  getPrototypeOf: function getPrototypeOf(it) {
	    return objectGetPrototypeOf(toObject(it));
	  }
	});

	var FAILS_ON_PRIMITIVES$2 = fails(function () { objectKeys(1); });

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$2 }, {
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

	var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET;

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;
	    var sticky = UNSUPPORTED_Y$1 && re.sticky;
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

	var TO_STRING$1 = 'toString';
	var RegExpPrototype = RegExp.prototype;
	var nativeToString = RegExpPrototype[TO_STRING$1];

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
	    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? regexpFlags.call(R) : rf);
	    return '/' + p + '/' + f;
	  }, { unsafe: true });
	}

	var MATCH = wellKnownSymbol('match');

	// `IsRegExp` abstract operation
	// https://tc39.github.io/ecma262/#sec-isregexp
	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
	};

	var notARegexp = function (it) {
	  if (isRegexp(it)) {
	    throw TypeError("The method doesn't accept regular expressions");
	  } return it;
	};

	var MATCH$1 = wellKnownSymbol('match');

	var correctIsRegexpLogic = function (METHOD_NAME) {
	  var regexp = /./;
	  try {
	    '/./'[METHOD_NAME](regexp);
	  } catch (e) {
	    try {
	      regexp[MATCH$1] = false;
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
	var createMethod$4 = function (CONVERT_TO_STRING) {
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
	  codeAt: createMethod$4(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$4(true)
	};

	var charAt = stringMultibyte.charAt;



	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$4 = internalState.set;
	var getInternalState$4 = internalState.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState$4(this, {
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

	var defineProperty$8 = objectDefineProperty.f;





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
	  defineProperty$8(TypedArrayPrototype, TO_STRING_TAG$3, { get: function () {
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
	var FORCED$6 = NEGATIVE_ZERO$1 || !STRICT_METHOD$6 || !USES_TO_LENGTH$a;

	// `Array.prototype.lastIndexOf` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof
	var arrayLastIndexOf = FORCED$6 ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
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

	var FORCED$7 = fails(function () {
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
	}, FORCED$7);

	var aTypedArray$i = arrayBufferViewCore.aTypedArray;
	var aTypedArrayConstructor$4 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayMethod$i = arrayBufferViewCore.exportTypedArrayMethod;
	var $slice = [].slice;

	var FORCED$8 = fails(function () {
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
	}, FORCED$8);

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

	var FORCED$9 = fails(function () {
	  return [1, 2].toLocaleString() != new Int8Array$3([1, 2]).toLocaleString();
	}) || !fails(function () {
	  Int8Array$3.prototype.toLocaleString.call([1, 2]);
	});

	// `%TypedArray%.prototype.toLocaleString` method
	// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.tolocalestring
	exportTypedArrayMethod$m('toLocaleString', function toLocaleString() {
	  return $toLocaleString.apply(TO_LOCALE_STRING_BUG ? $slice$1.call(aTypedArray$m(this)) : aTypedArray$m(this), arguments);
	}, FORCED$9);

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
	var setInternalState$5 = internalState.set;
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

	var find = /[!'()~]|%20/g;

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
	  return encodeURIComponent(it).replace(find, replacer);
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
	  setInternalState$5(this, {
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

	  setInternalState$5(that, {
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
	var setInternalState$6 = internalState.set;
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
	  var state = setInternalState$6(that, { type: 'URL' });
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

	var voyantjs = createCommonjsModule(function (module, exports) {
	  (function (f) {
	    {
	      module.exports = f();
	    }
	  })(function () {
	    return function () {
	      function r(e, n, t) {
	        function o(i, f) {
	          if (!n[i]) {
	            if (!e[i]) {
	              var c = "function" == typeof commonjsRequire && commonjsRequire;
	              if (!f && c) return c(i, !0);
	              if (u) return u(i, !0);
	              var a = new Error("Cannot find module '" + i + "'");
	              throw a.code = "MODULE_NOT_FOUND", a;
	            }
	            var p = n[i] = {
	              exports: {}
	            };
	            e[i][0].call(p.exports, function (r) {
	              var n = e[i][1][r];
	              return o(n || r);
	            }, p, p.exports, r, e, n, t);
	          }
	          return n[i].exports;
	        }
	        for (var u = "function" == typeof commonjsRequire && commonjsRequire, i = 0; i < t.length; i++) {
	          o(t[i]);
	        }
	        return o;
	      }
	      return r;
	    }()({
	      1: [function (require, module, exports) {

	        var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
	        Object.defineProperty(exports, "__esModule", {
	          value: true
	        });
	        Object.defineProperty(exports, "Categories", {
	          enumerable: true,
	          get: function get() {
	            return _categories["default"];
	          }
	        });
	        Object.defineProperty(exports, "Chart", {
	          enumerable: true,
	          get: function get() {
	            return _chart["default"];
	          }
	        });
	        Object.defineProperty(exports, "Corpus", {
	          enumerable: true,
	          get: function get() {
	            return _corpus["default"];
	          }
	        });
	        Object.defineProperty(exports, "Load", {
	          enumerable: true,
	          get: function get() {
	            return _load["default"];
	          }
	        });
	        Object.defineProperty(exports, "Table", {
	          enumerable: true,
	          get: function get() {
	            return _table["default"];
	          }
	        });
	        Object.defineProperty(exports, "Util", {
	          enumerable: true,
	          get: function get() {
	            return _util["default"];
	          }
	        });
	        var _corpus = _interopRequireDefault(require("./src/corpus"));
	        var _table = _interopRequireDefault(require("./src/table"));
	        var _load = _interopRequireDefault(require("./src/load"));
	        var _util = _interopRequireDefault(require("./src/util"));
	        var _chart = _interopRequireDefault(require("./src/chart"));
	        var _categories = _interopRequireDefault(require("./src/categories"));
	      }, {
	        "./src/categories": 19,
	        "./src/chart": 20,
	        "./src/corpus": 21,
	        "./src/load": 22,
	        "./src/table": 24,
	        "./src/util": 25,
	        "@babel/runtime/helpers/interopRequireDefault": 9
	      }],
	      2: [function (require, module, exports) {

	        function _arrayLikeToArray(arr, len) {
	          if (len == null || len > arr.length) len = arr.length;
	          for (var i = 0, arr2 = new Array(len); i < len; i++) {
	            arr2[i] = arr[i];
	          }
	          return arr2;
	        }
	        module.exports = _arrayLikeToArray;
	      }, {}],
	      3: [function (require, module, exports) {

	        function _arrayWithHoles(arr) {
	          if (Array.isArray(arr)) return arr;
	        }
	        module.exports = _arrayWithHoles;
	      }, {}],
	      4: [function (require, module, exports) {

	        function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	          try {
	            var info = gen[key](arg);
	            var value = info.value;
	          } catch (error) {
	            reject(error);
	            return;
	          }
	          if (info.done) {
	            resolve(value);
	          } else {
	            Promise.resolve(value).then(_next, _throw);
	          }
	        }
	        function _asyncToGenerator(fn) {
	          return function () {
	            var self = this,
	              args = arguments;
	            return new Promise(function (resolve, reject) {
	              var gen = fn.apply(self, args);
	              function _next(value) {
	                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
	              }
	              function _throw(err) {
	                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
	              }
	              _next(undefined);
	            });
	          };
	        }
	        module.exports = _asyncToGenerator;
	      }, {}],
	      5: [function (require, module, exports) {

	        function _classCallCheck(instance, Constructor) {
	          if (!(instance instanceof Constructor)) {
	            throw new TypeError("Cannot call a class as a function");
	          }
	        }
	        module.exports = _classCallCheck;
	      }, {}],
	      6: [function (require, module, exports) {

	        var setPrototypeOf = require("./setPrototypeOf");
	        var isNativeReflectConstruct = require("./isNativeReflectConstruct");
	        function _construct(Parent, args, Class) {
	          if (isNativeReflectConstruct()) {
	            module.exports = _construct = Reflect.construct;
	          } else {
	            module.exports = _construct = function _construct(Parent, args, Class) {
	              var a = [null];
	              a.push.apply(a, args);
	              var Constructor = Function.bind.apply(Parent, a);
	              var instance = new Constructor();
	              if (Class) setPrototypeOf(instance, Class.prototype);
	              return instance;
	            };
	          }
	          return _construct.apply(null, arguments);
	        }
	        module.exports = _construct;
	      }, {
	        "./isNativeReflectConstruct": 10,
	        "./setPrototypeOf": 13
	      }],
	      7: [function (require, module, exports) {

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
	        module.exports = _createClass;
	      }, {}],
	      8: [function (require, module, exports) {

	        function _defineProperty(obj, key, value) {
	          if (key in obj) {
	            Object.defineProperty(obj, key, {
	              value: value,
	              enumerable: true,
	              configurable: true,
	              writable: true
	            });
	          } else {
	            obj[key] = value;
	          }
	          return obj;
	        }
	        module.exports = _defineProperty;
	      }, {}],
	      9: [function (require, module, exports) {

	        function _interopRequireDefault(obj) {
	          return obj && obj.__esModule ? obj : {
	            "default": obj
	          };
	        }
	        module.exports = _interopRequireDefault;
	      }, {}],
	      10: [function (require, module, exports) {

	        function _isNativeReflectConstruct() {
	          if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	          if (Reflect.construct.sham) return false;
	          if (typeof Proxy === "function") return true;
	          try {
	            Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
	            return true;
	          } catch (e) {
	            return false;
	          }
	        }
	        module.exports = _isNativeReflectConstruct;
	      }, {}],
	      11: [function (require, module, exports) {

	        function _iterableToArrayLimit(arr, i) {
	          if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
	          var _arr = [];
	          var _n = true;
	          var _d = false;
	          var _e = undefined;
	          try {
	            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	              _arr.push(_s.value);
	              if (i && _arr.length === i) break;
	            }
	          } catch (err) {
	            _d = true;
	            _e = err;
	          } finally {
	            try {
	              if (!_n && _i["return"] != null) _i["return"]();
	            } finally {
	              if (_d) throw _e;
	            }
	          }
	          return _arr;
	        }
	        module.exports = _iterableToArrayLimit;
	      }, {}],
	      12: [function (require, module, exports) {

	        function _nonIterableRest() {
	          throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	        }
	        module.exports = _nonIterableRest;
	      }, {}],
	      13: [function (require, module, exports) {

	        function _setPrototypeOf(o, p) {
	          module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	            o.__proto__ = p;
	            return o;
	          };
	          return _setPrototypeOf(o, p);
	        }
	        module.exports = _setPrototypeOf;
	      }, {}],
	      14: [function (require, module, exports) {

	        var arrayWithHoles = require("./arrayWithHoles");
	        var iterableToArrayLimit = require("./iterableToArrayLimit");
	        var unsupportedIterableToArray = require("./unsupportedIterableToArray");
	        var nonIterableRest = require("./nonIterableRest");
	        function _slicedToArray(arr, i) {
	          return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
	        }
	        module.exports = _slicedToArray;
	      }, {
	        "./arrayWithHoles": 3,
	        "./iterableToArrayLimit": 11,
	        "./nonIterableRest": 12,
	        "./unsupportedIterableToArray": 16
	      }],
	      15: [function (require, module, exports) {

	        function _typeof(obj) {
	          "@babel/helpers - typeof";

	          if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	            module.exports = _typeof = function _typeof(obj) {
	              return typeof obj;
	            };
	          } else {
	            module.exports = _typeof = function _typeof(obj) {
	              return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	            };
	          }
	          return _typeof(obj);
	        }
	        module.exports = _typeof;
	      }, {}],
	      16: [function (require, module, exports) {

	        var arrayLikeToArray = require("./arrayLikeToArray");
	        function _unsupportedIterableToArray(o, minLen) {
	          if (!o) return;
	          if (typeof o === "string") return arrayLikeToArray(o, minLen);
	          var n = Object.prototype.toString.call(o).slice(8, -1);
	          if (n === "Object" && o.constructor) n = o.constructor.name;
	          if (n === "Map" || n === "Set") return Array.from(n);
	          if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
	        }
	        module.exports = _unsupportedIterableToArray;
	      }, {
	        "./arrayLikeToArray": 2
	      }],
	      17: [function (require, module, exports) {

	        module.exports = require("regenerator-runtime");
	      }, {
	        "regenerator-runtime": 18
	      }],
	      18: [function (require, module, exports) {

	        var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
	        var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
	        /**
	         * Copyright (c) 2014-present, Facebook, Inc.
	         *
	         * This source code is licensed under the MIT license found in the
	         * LICENSE file in the root directory of this source tree.
	         */

	        var runtime = function (exports) {

	          var Op = Object.prototype;
	          var hasOwn = Op.hasOwnProperty;
	          var undefined$1; // More compressible than void 0.
	          var $Symbol = typeof Symbol === "function" ? Symbol : {};
	          var iteratorSymbol = $Symbol.iterator || "@@iterator";
	          var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	          var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
	          function wrap(innerFn, outerFn, self, tryLocsList) {
	            // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	            var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	            var generator = Object.create(protoGenerator.prototype);
	            var context = new Context(tryLocsList || []);

	            // The ._invoke method unifies the implementations of the .next,
	            // .throw, and .return methods.
	            generator._invoke = makeInvokeMethod(innerFn, self, context);
	            return generator;
	          }
	          exports.wrap = wrap;

	          // Try/catch helper to minimize deoptimizations. Returns a completion
	          // record like context.tryEntries[i].completion. This interface could
	          // have been (and was previously) designed to take a closure to be
	          // invoked without arguments, but in all the cases we care about we
	          // already have an existing method we want to call, so there's no need
	          // to create a new function object. We can even get away with assuming
	          // the method takes exactly one argument, since that happens to be true
	          // in every case, so we don't have to touch the arguments object. The
	          // only additional allocation required is the completion record, which
	          // has a stable shape and so hopefully should be cheap to allocate.
	          function tryCatch(fn, obj, arg) {
	            try {
	              return {
	                type: "normal",
	                arg: fn.call(obj, arg)
	              };
	            } catch (err) {
	              return {
	                type: "throw",
	                arg: err
	              };
	            }
	          }
	          var GenStateSuspendedStart = "suspendedStart";
	          var GenStateSuspendedYield = "suspendedYield";
	          var GenStateExecuting = "executing";
	          var GenStateCompleted = "completed";

	          // Returning this object from the innerFn has the same effect as
	          // breaking out of the dispatch switch statement.
	          var ContinueSentinel = {};

	          // Dummy constructor functions that we use as the .constructor and
	          // .constructor.prototype properties for functions that return Generator
	          // objects. For full spec compliance, you may wish to configure your
	          // minifier not to mangle the names of these two functions.
	          function Generator() {}
	          function GeneratorFunction() {}
	          function GeneratorFunctionPrototype() {}

	          // This is a polyfill for %IteratorPrototype% for environments that
	          // don't natively support it.
	          var IteratorPrototype = {};
	          IteratorPrototype[iteratorSymbol] = function () {
	            return this;
	          };
	          var getProto = Object.getPrototypeOf;
	          var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
	          if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	            // This environment has a native %IteratorPrototype%; use it instead
	            // of the polyfill.
	            IteratorPrototype = NativeIteratorPrototype;
	          }
	          var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
	          GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	          GeneratorFunctionPrototype.constructor = GeneratorFunction;
	          GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

	          // Helper for defining the .next, .throw, and .return methods of the
	          // Iterator interface in terms of a single ._invoke method.
	          function defineIteratorMethods(prototype) {
	            ["next", "throw", "return"].forEach(function (method) {
	              prototype[method] = function (arg) {
	                return this._invoke(method, arg);
	              };
	            });
	          }
	          exports.isGeneratorFunction = function (genFun) {
	            var ctor = typeof genFun === "function" && genFun.constructor;
	            return ctor ? ctor === GeneratorFunction ||
	            // For the native GeneratorFunction constructor, the best we can
	            // do is to check its .name property.
	            (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
	          };
	          exports.mark = function (genFun) {
	            if (Object.setPrototypeOf) {
	              Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	            } else {
	              genFun.__proto__ = GeneratorFunctionPrototype;
	              if (!(toStringTagSymbol in genFun)) {
	                genFun[toStringTagSymbol] = "GeneratorFunction";
	              }
	            }
	            genFun.prototype = Object.create(Gp);
	            return genFun;
	          };

	          // Within the body of any async function, `await x` is transformed to
	          // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	          // `hasOwn.call(value, "__await")` to determine if the yielded value is
	          // meant to be awaited.
	          exports.awrap = function (arg) {
	            return {
	              __await: arg
	            };
	          };
	          function AsyncIterator(generator, PromiseImpl) {
	            function invoke(method, arg, resolve, reject) {
	              var record = tryCatch(generator[method], generator, arg);
	              if (record.type === "throw") {
	                reject(record.arg);
	              } else {
	                var result = record.arg;
	                var value = result.value;
	                if (value && (0, _typeof2["default"])(value) === "object" && hasOwn.call(value, "__await")) {
	                  return PromiseImpl.resolve(value.__await).then(function (value) {
	                    invoke("next", value, resolve, reject);
	                  }, function (err) {
	                    invoke("throw", err, resolve, reject);
	                  });
	                }
	                return PromiseImpl.resolve(value).then(function (unwrapped) {
	                  // When a yielded Promise is resolved, its final value becomes
	                  // the .value of the Promise<{value,done}> result for the
	                  // current iteration.
	                  result.value = unwrapped;
	                  resolve(result);
	                }, function (error) {
	                  // If a rejected Promise was yielded, throw the rejection back
	                  // into the async generator function so it can be handled there.
	                  return invoke("throw", error, resolve, reject);
	                });
	              }
	            }
	            var previousPromise;
	            function enqueue(method, arg) {
	              function callInvokeWithMethodAndArg() {
	                return new PromiseImpl(function (resolve, reject) {
	                  invoke(method, arg, resolve, reject);
	                });
	              }
	              return previousPromise =
	              // If enqueue has been called before, then we want to wait until
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
	              previousPromise ? previousPromise.then(callInvokeWithMethodAndArg,
	              // Avoid propagating failures to Promises returned by later
	              // invocations of the iterator.
	              callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
	            }

	            // Define the unified helper method that is used to implement .next,
	            // .throw, and .return (see defineIteratorMethods).
	            this._invoke = enqueue;
	          }
	          defineIteratorMethods(AsyncIterator.prototype);
	          AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	            return this;
	          };
	          exports.AsyncIterator = AsyncIterator;

	          // Note that simple async functions are implemented on top of
	          // AsyncIterator objects; they just return a Promise for the value of
	          // the final result produced by the iterator.
	          exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
	            if (PromiseImpl === void 0) PromiseImpl = Promise;
	            var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
	            return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
	            : iter.next().then(function (result) {
	              return result.done ? result.value : iter.next();
	            });
	          };
	          function makeInvokeMethod(innerFn, self, context) {
	            var state = GenStateSuspendedStart;
	            return function invoke(method, arg) {
	              if (state === GenStateExecuting) {
	                throw new Error("Generator is already running");
	              }
	              if (state === GenStateCompleted) {
	                if (method === "throw") {
	                  throw arg;
	                }

	                // Be forgiving, per 25.3.3.3.3 of the spec:
	                // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	                return doneResult();
	              }
	              context.method = method;
	              context.arg = arg;
	              while (true) {
	                var delegate = context.delegate;
	                if (delegate) {
	                  var delegateResult = maybeInvokeDelegate(delegate, context);
	                  if (delegateResult) {
	                    if (delegateResult === ContinueSentinel) continue;
	                    return delegateResult;
	                  }
	                }
	                if (context.method === "next") {
	                  // Setting context._sent for legacy support of Babel's
	                  // function.sent implementation.
	                  context.sent = context._sent = context.arg;
	                } else if (context.method === "throw") {
	                  if (state === GenStateSuspendedStart) {
	                    state = GenStateCompleted;
	                    throw context.arg;
	                  }
	                  context.dispatchException(context.arg);
	                } else if (context.method === "return") {
	                  context.abrupt("return", context.arg);
	                }
	                state = GenStateExecuting;
	                var record = tryCatch(innerFn, self, context);
	                if (record.type === "normal") {
	                  // If an exception is thrown from innerFn, we leave state ===
	                  // GenStateExecuting and loop back for another invocation.
	                  state = context.done ? GenStateCompleted : GenStateSuspendedYield;
	                  if (record.arg === ContinueSentinel) {
	                    continue;
	                  }
	                  return {
	                    value: record.arg,
	                    done: context.done
	                  };
	                } else if (record.type === "throw") {
	                  state = GenStateCompleted;
	                  // Dispatch the exception by looping back around to the
	                  // context.dispatchException(context.arg) call above.
	                  context.method = "throw";
	                  context.arg = record.arg;
	                }
	              }
	            };
	          }

	          // Call delegate.iterator[context.method](context.arg) and handle the
	          // result, either by returning a { value, done } result from the
	          // delegate iterator, or by modifying context.method and context.arg,
	          // setting context.delegate to null, and returning the ContinueSentinel.
	          function maybeInvokeDelegate(delegate, context) {
	            var method = delegate.iterator[context.method];
	            if (method === undefined$1) {
	              // A .throw or .return when the delegate iterator has no .throw
	              // method always terminates the yield* loop.
	              context.delegate = null;
	              if (context.method === "throw") {
	                // Note: ["return"] must be used for ES3 parsing compatibility.
	                if (delegate.iterator["return"]) {
	                  // If the delegate iterator has a return method, give it a
	                  // chance to clean up.
	                  context.method = "return";
	                  context.arg = undefined$1;
	                  maybeInvokeDelegate(delegate, context);
	                  if (context.method === "throw") {
	                    // If maybeInvokeDelegate(context) changed context.method from
	                    // "return" to "throw", let that override the TypeError below.
	                    return ContinueSentinel;
	                  }
	                }
	                context.method = "throw";
	                context.arg = new TypeError("The iterator does not provide a 'throw' method");
	              }
	              return ContinueSentinel;
	            }
	            var record = tryCatch(method, delegate.iterator, context.arg);
	            if (record.type === "throw") {
	              context.method = "throw";
	              context.arg = record.arg;
	              context.delegate = null;
	              return ContinueSentinel;
	            }
	            var info = record.arg;
	            if (!info) {
	              context.method = "throw";
	              context.arg = new TypeError("iterator result is not an object");
	              context.delegate = null;
	              return ContinueSentinel;
	            }
	            if (info.done) {
	              // Assign the result of the finished delegate to the temporary
	              // variable specified by delegate.resultName (see delegateYield).
	              context[delegate.resultName] = info.value;

	              // Resume execution at the desired location (see delegateYield).
	              context.next = delegate.nextLoc;

	              // If context.method was "throw" but the delegate handled the
	              // exception, let the outer generator proceed normally. If
	              // context.method was "next", forget context.arg since it has been
	              // "consumed" by the delegate iterator. If context.method was
	              // "return", allow the original .return call to continue in the
	              // outer generator.
	              if (context.method !== "return") {
	                context.method = "next";
	                context.arg = undefined$1;
	              }
	            } else {
	              // Re-yield the result returned by the delegate method.
	              return info;
	            }

	            // The delegate iterator is finished, so forget it and continue with
	            // the outer generator.
	            context.delegate = null;
	            return ContinueSentinel;
	          }

	          // Define Generator.prototype.{next,throw,return} in terms of the
	          // unified ._invoke helper method.
	          defineIteratorMethods(Gp);
	          Gp[toStringTagSymbol] = "Generator";

	          // A Generator should always return itself as the iterator object when the
	          // @@iterator function is called on it. Some browsers' implementations of the
	          // iterator prototype chain incorrectly implement this, causing the Generator
	          // object to not be returned from this call. This ensures that doesn't happen.
	          // See https://github.com/facebook/regenerator/issues/274 for more details.
	          Gp[iteratorSymbol] = function () {
	            return this;
	          };
	          Gp.toString = function () {
	            return "[object Generator]";
	          };
	          function pushTryEntry(locs) {
	            var entry = {
	              tryLoc: locs[0]
	            };
	            if (1 in locs) {
	              entry.catchLoc = locs[1];
	            }
	            if (2 in locs) {
	              entry.finallyLoc = locs[2];
	              entry.afterLoc = locs[3];
	            }
	            this.tryEntries.push(entry);
	          }
	          function resetTryEntry(entry) {
	            var record = entry.completion || {};
	            record.type = "normal";
	            delete record.arg;
	            entry.completion = record;
	          }
	          function Context(tryLocsList) {
	            // The root entry object (effectively a try statement without a catch
	            // or a finally block) gives us a place to store values thrown from
	            // locations where there is no enclosing try statement.
	            this.tryEntries = [{
	              tryLoc: "root"
	            }];
	            tryLocsList.forEach(pushTryEntry, this);
	            this.reset(true);
	          }
	          exports.keys = function (object) {
	            var keys = [];
	            for (var key in object) {
	              keys.push(key);
	            }
	            keys.reverse();

	            // Rather than returning an object with a next method, we keep
	            // things simple and return the next function itself.
	            return function next() {
	              while (keys.length) {
	                var key = keys.pop();
	                if (key in object) {
	                  next.value = key;
	                  next.done = false;
	                  return next;
	                }
	              }

	              // To avoid creating an additional object, we just hang the .value
	              // and .done properties off the next function object itself. This
	              // also ensures that the minifier will not anonymize the function.
	              next.done = true;
	              return next;
	            };
	          };
	          function values(iterable) {
	            if (iterable) {
	              var iteratorMethod = iterable[iteratorSymbol];
	              if (iteratorMethod) {
	                return iteratorMethod.call(iterable);
	              }
	              if (typeof iterable.next === "function") {
	                return iterable;
	              }
	              if (!isNaN(iterable.length)) {
	                var i = -1,
	                  next = function next() {
	                    while (++i < iterable.length) {
	                      if (hasOwn.call(iterable, i)) {
	                        next.value = iterable[i];
	                        next.done = false;
	                        return next;
	                      }
	                    }
	                    next.value = undefined$1;
	                    next.done = true;
	                    return next;
	                  };
	                return next.next = next;
	              }
	            }

	            // Return an iterator with no values.
	            return {
	              next: doneResult
	            };
	          }
	          exports.values = values;
	          function doneResult() {
	            return {
	              value: undefined$1,
	              done: true
	            };
	          }
	          Context.prototype = {
	            constructor: Context,
	            reset: function reset(skipTempReset) {
	              this.prev = 0;
	              this.next = 0;
	              // Resetting context._sent for legacy support of Babel's
	              // function.sent implementation.
	              this.sent = this._sent = undefined$1;
	              this.done = false;
	              this.delegate = null;
	              this.method = "next";
	              this.arg = undefined$1;
	              this.tryEntries.forEach(resetTryEntry);
	              if (!skipTempReset) {
	                for (var name in this) {
	                  // Not sure about the optimal order of these conditions:
	                  if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
	                    this[name] = undefined$1;
	                  }
	                }
	              }
	            },
	            stop: function stop() {
	              this.done = true;
	              var rootEntry = this.tryEntries[0];
	              var rootRecord = rootEntry.completion;
	              if (rootRecord.type === "throw") {
	                throw rootRecord.arg;
	              }
	              return this.rval;
	            },
	            dispatchException: function dispatchException(exception) {
	              if (this.done) {
	                throw exception;
	              }
	              var context = this;
	              function handle(loc, caught) {
	                record.type = "throw";
	                record.arg = exception;
	                context.next = loc;
	                if (caught) {
	                  // If the dispatched exception was caught by a catch block,
	                  // then let that catch block handle the exception normally.
	                  context.method = "next";
	                  context.arg = undefined$1;
	                }
	                return !!caught;
	              }
	              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	                var entry = this.tryEntries[i];
	                var record = entry.completion;
	                if (entry.tryLoc === "root") {
	                  // Exception thrown outside of any try block that could handle
	                  // it, so set the completion value of the entire function to
	                  // throw the exception.
	                  return handle("end");
	                }
	                if (entry.tryLoc <= this.prev) {
	                  var hasCatch = hasOwn.call(entry, "catchLoc");
	                  var hasFinally = hasOwn.call(entry, "finallyLoc");
	                  if (hasCatch && hasFinally) {
	                    if (this.prev < entry.catchLoc) {
	                      return handle(entry.catchLoc, true);
	                    } else if (this.prev < entry.finallyLoc) {
	                      return handle(entry.finallyLoc);
	                    }
	                  } else if (hasCatch) {
	                    if (this.prev < entry.catchLoc) {
	                      return handle(entry.catchLoc, true);
	                    }
	                  } else if (hasFinally) {
	                    if (this.prev < entry.finallyLoc) {
	                      return handle(entry.finallyLoc);
	                    }
	                  } else {
	                    throw new Error("try statement without catch or finally");
	                  }
	                }
	              }
	            },
	            abrupt: function abrupt(type, arg) {
	              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	                var entry = this.tryEntries[i];
	                if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
	                  var finallyEntry = entry;
	                  break;
	                }
	              }
	              if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
	                // Ignore the finally entry if control is not jumping to a
	                // location outside the try/catch block.
	                finallyEntry = null;
	              }
	              var record = finallyEntry ? finallyEntry.completion : {};
	              record.type = type;
	              record.arg = arg;
	              if (finallyEntry) {
	                this.method = "next";
	                this.next = finallyEntry.finallyLoc;
	                return ContinueSentinel;
	              }
	              return this.complete(record);
	            },
	            complete: function complete(record, afterLoc) {
	              if (record.type === "throw") {
	                throw record.arg;
	              }
	              if (record.type === "break" || record.type === "continue") {
	                this.next = record.arg;
	              } else if (record.type === "return") {
	                this.rval = this.arg = record.arg;
	                this.method = "return";
	                this.next = "end";
	              } else if (record.type === "normal" && afterLoc) {
	                this.next = afterLoc;
	              }
	              return ContinueSentinel;
	            },
	            finish: function finish(finallyLoc) {
	              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	                var entry = this.tryEntries[i];
	                if (entry.finallyLoc === finallyLoc) {
	                  this.complete(entry.completion, entry.afterLoc);
	                  resetTryEntry(entry);
	                  return ContinueSentinel;
	                }
	              }
	            },
	            "catch": function _catch(tryLoc) {
	              for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	                var entry = this.tryEntries[i];
	                if (entry.tryLoc === tryLoc) {
	                  var record = entry.completion;
	                  if (record.type === "throw") {
	                    var thrown = record.arg;
	                    resetTryEntry(entry);
	                  }
	                  return thrown;
	                }
	              }

	              // The context.catch method must only be called with a location
	              // argument that corresponds to a known catch block.
	              throw new Error("illegal catch attempt");
	            },
	            delegateYield: function delegateYield(iterable, resultName, nextLoc) {
	              this.delegate = {
	                iterator: values(iterable),
	                resultName: resultName,
	                nextLoc: nextLoc
	              };
	              if (this.method === "next") {
	                // Deliberately forget the last sent value so that we don't
	                // accidentally pass it on to the delegate.
	                this.arg = undefined$1;
	              }
	              return ContinueSentinel;
	            }
	          };

	          // Regardless of whether this script is executing as a CommonJS module
	          // or not, return the runtime object so that we can declare the variable
	          // regeneratorRuntime in the outer scope, which allows this module to be
	          // injected easily by `bin/regenerator --include-runtime script.js`.
	          return exports;
	        }(
	        // If this script is executing as a CommonJS module, use module.exports
	        // as the regeneratorRuntime namespace. Otherwise create a new empty
	        // object. Either way, the resulting object will be used to initialize
	        // the regeneratorRuntime variable at the top of this file.
	        (typeof module === "undefined" ? "undefined" : (0, _typeof2["default"])(module)) === "object" ? module.exports : {});
	        try {
	          regeneratorRuntime = runtime;
	        } catch (accidentalStrictMode) {
	          // This module should not be running in strict mode, so the above
	          // assignment should always work unless something is misconfigured. Just
	          // in case runtime.js accidentally runs in strict mode, we can escape
	          // strict mode using a global Function call. This could conceivably fail
	          // if a Content Security Policy forbids using Function, but in that case
	          // the proper solution is to fix the accidental strict mode problem. If
	          // you've misconfigured your bundler to force strict mode and applied a
	          // CSP to forbid Function, and you're not willing to fix either of those
	          // problems, please detail your unique predicament in a GitHub issue.
	          Function("r", "regeneratorRuntime = r")(runtime);
	        }
	      }, {
	        "@babel/runtime/helpers/interopRequireDefault": 9,
	        "@babel/runtime/helpers/typeof": 15
	      }],
	      19: [function (require, module, exports) {

	        var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
	        Object.defineProperty(exports, "__esModule", {
	          value: true
	        });
	        exports["default"] = void 0;
	        var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
	        var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
	        var _load = _interopRequireDefault(require("./load"));
	        /**
	         * Class for working with categories and features.
	         * Categories are groupings of terms.
	         * A term can be present in multiple categories. Category ranking is used to determine which feature value to prioritize.
	         * Features are arbitrary properties (font, color) that are associated with each category.
	         * @memberof Spyral
	         * @class
	         */
	        var Categories = /*#__PURE__*/function () {
	          /**
	           * Construct a new Categories class.
	           * 
	           * The following are valid in the config parameter:
	           * 
	           *  * **categories**: an object that maps arrays of terms to category names
	           *  * **categoriesRanking**: an array of category names that determines their ranking, from high to low
	           *  * **features**: an object that maps categories to feature names
	           *  * **featureDefaults**: an object that maps default feature value to feature names
	           * 
	           * An example:
	           * 
	           *  new Spyral.Categories({
	           *    categories: {
	           *      positive: ['good', 'happy'],
	           *      negative: ['bad', 'sad']
	           *    },
	           *    categoriesRanking: ['positive','negative'],
	           *    features: {color: {}},
	           *    featureDefaults: {color: '#333333'}
	           *  })
	           * @constructor
	           * @param {Object} config
	           * @param {Object} config.categories
	           * @param {Array} config.categoriesRanking
	           * @param {Object} config.features
	           * @param {Object} config.featureDefaults
	           * @returns {Spyral.Categories}
	           */
	          function Categories() {
	            var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
	                categories: {},
	                categoriesRanking: [],
	                features: {},
	                featureDefaults: {}
	              },
	              categories = _ref.categories,
	              categoriesRanking = _ref.categoriesRanking,
	              features = _ref.features,
	              featureDefaults = _ref.featureDefaults;
	            (0, _classCallCheck2["default"])(this, Categories);
	            this.categories = categories;
	            this.categoriesRanking = categoriesRanking;
	            this.features = features;
	            this.featureDefaults = featureDefaults;
	          }

	          /**
	           * Get the categories.
	           * @returns {Object}
	           */
	          (0, _createClass2["default"])(Categories, [{
	            key: "getCategories",
	            value: function getCategories() {
	              return this.categories;
	            }
	            /**
	             * Get category names as an array.
	             * @returns {Array}
	             */
	          }, {
	            key: "getCategoryNames",
	            value: function getCategoryNames() {
	              return Object.keys(this.getCategories());
	            }
	            /**
	             * Get the terms for a category.
	             * @param {string} name The category name
	             * @returns {Array}
	             */
	          }, {
	            key: "getCategoryTerms",
	            value: function getCategoryTerms(name) {
	              return this.categories[name];
	            }
	            /**
	             * Add a new category.
	             * @param {string} name The category name
	             */
	          }, {
	            key: "addCategory",
	            value: function addCategory(name) {
	              if (this.categories[name] === undefined) {
	                this.categories[name] = [];
	                this.categoriesRanking.push(name);
	              }
	            }
	            /**
	             * Rename a category.
	             * @param {string} oldName The old category name
	             * @param {string} newName The new category name
	             */
	          }, {
	            key: "renameCategory",
	            value: function renameCategory(oldName, newName) {
	              if (oldName !== newName) {
	                var terms = this.getCategoryTerms(oldName);
	                var ranking = this.getCategoryRanking(oldName);
	                this.addTerms(newName, terms);
	                for (var feature in this.features) {
	                  var value = this.features[feature][oldName];
	                  this.setCategoryFeature(newName, feature, value);
	                }
	                this.removeCategory(oldName);
	                this.setCategoryRanking(newName, ranking);
	              }
	            }
	            /**
	             * Remove a category.
	             * @param {string} name The category name
	             */
	          }, {
	            key: "removeCategory",
	            value: function removeCategory(name) {
	              delete this.categories[name];
	              var index = this.categoriesRanking.indexOf(name);
	              if (index !== -1) {
	                this.categoriesRanking.splice(index, 1);
	              }
	              for (var feature in this.features) {
	                delete this.features[feature][name];
	              }
	            }
	            /**
	             * Gets the ranking for a category.
	             * @param {string} name The category name
	             * @returns {number}
	             */
	          }, {
	            key: "getCategoryRanking",
	            value: function getCategoryRanking(name) {
	              var ranking = this.categoriesRanking.indexOf(name);
	              if (ranking === -1) {
	                return undefined;
	              } else {
	                return ranking;
	              }
	            }
	            /**
	             * Sets the ranking for a category.
	             * @param {string} name The category name
	             * @param {number} ranking The category ranking
	             */
	          }, {
	            key: "setCategoryRanking",
	            value: function setCategoryRanking(name, ranking) {
	              if (this.categories[name] !== undefined) {
	                ranking = Math.min(this.categoriesRanking.length - 1, Math.max(0, ranking));
	                var index = this.categoriesRanking.indexOf(name);
	                if (index !== -1) {
	                  this.categoriesRanking.splice(index, 1);
	                }
	                this.categoriesRanking.splice(ranking, 0, name);
	              }
	            }
	            /**
	             * Add a term to a category.
	             * @param {string} category The category name
	             * @param {string} term The term
	             */
	          }, {
	            key: "addTerm",
	            value: function addTerm(category, term) {
	              this.addTerms(category, [term]);
	            }
	            /**
	             * Add multiple terms to a category.
	             * @param {string} category The category name
	             * @param {Array} terms An array of terms
	             */
	          }, {
	            key: "addTerms",
	            value: function addTerms(category, terms) {
	              if (!Array.isArray(terms)) {
	                terms = [terms];
	              }
	              if (this.categories[category] === undefined) {
	                this.addCategory(category);
	              }
	              for (var i = 0; i < terms.length; i++) {
	                var term = terms[i];
	                if (this.categories[category].indexOf(term) === -1) {
	                  this.categories[category].push(term);
	                }
	              }
	            }
	            /**
	             * Remove a term from a category.
	             * @param {string} category The category name
	             * @param {string} term The term
	             */
	          }, {
	            key: "removeTerm",
	            value: function removeTerm(category, term) {
	              this.removeTerms(category, [term]);
	            }
	            /**
	             * Remove multiple terms from a category.
	             * @param {string} category The category name
	             * @param {Array} terms An array of terms
	             */
	          }, {
	            key: "removeTerms",
	            value: function removeTerms(category, terms) {
	              if (!Array.isArray(terms)) {
	                terms = [terms];
	              }
	              if (this.categories[category] !== undefined) {
	                for (var i = 0; i < terms.length; i++) {
	                  var term = terms[i];
	                  var index = this.categories[category].indexOf(term);
	                  if (index !== -1) {
	                    this.categories[category].splice(index, 1);
	                  }
	                }
	              }
	            }
	            /**
	             * Get the category that a term belongs to, taking ranking into account.
	             * @param {string} term The term
	             * @returns {string}
	             */
	          }, {
	            key: "getCategoryForTerm",
	            value: function getCategoryForTerm(term) {
	              var ranking = Number.MAX_VALUE;
	              var cat = undefined;
	              for (var category in this.categories) {
	                if (this.categories[category].indexOf(term) !== -1 && this.getCategoryRanking(category) < ranking) {
	                  ranking = this.getCategoryRanking(category);
	                  cat = category;
	                }
	              }
	              return cat;
	            }
	            /**
	             * Get all the categories a term belongs to.
	             * @param {string} term The term
	             * @returns {Array}
	             */
	          }, {
	            key: "getCategoriesForTerm",
	            value: function getCategoriesForTerm(term) {
	              var cats = [];
	              for (var category in this.categories) {
	                if (this.categories[category].indexOf(term) !== -1) {
	                  cats.push(category);
	                }
	              }
	              return cats;
	            }
	            /**
	             * Get the feature for a term.
	             * @param {string} feature The feature
	             * @param {string} term The term
	             * @returns {*}
	             */
	          }, {
	            key: "getFeatureForTerm",
	            value: function getFeatureForTerm(feature, term) {
	              return this.getCategoryFeature(this.getCategoryForTerm(term), feature);
	            }
	            /**
	             * Get the features.
	             * @returns {Object}
	             */
	          }, {
	            key: "getFeatures",
	            value: function getFeatures() {
	              return this.features;
	            }
	            /**
	             * Add a feature.
	             * @param {string} name The feature name
	             * @param {*} defaultValue The default value
	             */
	          }, {
	            key: "addFeature",
	            value: function addFeature(name, defaultValue) {
	              if (this.features[name] === undefined) {
	                this.features[name] = {};
	              }
	              if (defaultValue !== undefined) {
	                this.featureDefaults[name] = defaultValue;
	              }
	            }
	            /**
	             * Remove a feature.
	             * @param {string} name The feature name
	             */
	          }, {
	            key: "removeFeature",
	            value: function removeFeature(name) {
	              delete this.features[name];
	              delete this.featureDefaults[name];
	            }
	            /**
	             * Set the feature for a category.
	             * @param {string} categoryName The category name
	             * @param {string} featureName The feature name
	             * @param {*} featureValue The feature value
	             */
	          }, {
	            key: "setCategoryFeature",
	            value: function setCategoryFeature(categoryName, featureName, featureValue) {
	              if (this.features[featureName] === undefined) {
	                this.addFeature(featureName);
	              }
	              this.features[featureName][categoryName] = featureValue;
	            }
	            /**
	             * Get the feature for a category.
	             * @param {string} categoryName The category name
	             * @param {string} featureName The feature name
	             * @returns {*}
	             */
	          }, {
	            key: "getCategoryFeature",
	            value: function getCategoryFeature(categoryName, featureName) {
	              var value = undefined;
	              if (this.features[featureName] !== undefined) {
	                value = this.features[featureName][categoryName];
	                if (value === undefined) {
	                  value = this.featureDefaults[featureName];
	                  if (typeof value === 'function') {
	                    value = value();
	                  }
	                }
	              }
	              return value;
	            }
	            /**
	             * Get a copy of the category and feature data.
	             * @returns {Object}
	             */
	          }, {
	            key: "getCategoryExportData",
	            value: function getCategoryExportData() {
	              return {
	                categories: Object.assign({}, this.categories),
	                categoriesRanking: this.categoriesRanking.map(function (x) {
	                  return x;
	                }),
	                features: Object.assign({}, this.features)
	              };
	            }
	            /**
	             * Save the categories (if we're in a recognized environment).
	             * @param {Object} config for the network call (specifying if needed the location of Trombone, etc., see {@link Spyral.Load#trombone}
	             * @returns {Promise<string>} this returns a promise which eventually resolves to a string that is the ID reference for the stored categories
	             */
	          }, {
	            key: "save",
	            value: function save() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              var api = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	              var categoriesData = JSON.stringify(this.getCategoryExportData());
	              return _load["default"].trombone(api, Object.assign(config, {
	                tool: 'resource.StoredCategories',
	                storeResource: categoriesData
	              })).then(function (data) {
	                return data.storedCategories.id;
	              });
	              // TODO save id as property
	              // TODO somehow cache id so that it's not resaved everytime notebook is run
	            }
	            /**
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
	             */
	          }, {
	            key: "load",
	            value: function load() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              var api = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	              var me = this;
	              if (typeof config === 'string') {
	                config = {
	                  'retrieveResourceId': config
	                };
	              }
	              if (!('retrieveResourceId' in config)) {
	                throw Error('You must provide a value for the retrieveResourceId parameter');
	              }
	              return _load["default"].trombone(api, Object.assign(config, {
	                tool: 'resource.StoredCategories'
	              })).then(function (data) {
	                var cats = JSON.parse(data.storedCategories.resource);
	                me.features = cats.features;
	                me.categories = cats.categories;
	                me.categoriesRanking = cats.categoriesRanking || [];
	                if (me.categoriesRanking.length === 0) {
	                  for (var category in me.categories) {
	                    me.categoriesRanking.push(category);
	                  }
	                }
	                return me;
	              });
	            }
	            /**
	             * Load categories and return a promise that resolves to a new Spyral.Categories instance.
	             * 
	             * @param {(Object|String)} config an object specifying the parameters (see above)
	             * @param {Object} api an object specifying any parameters for the trombone call
	             * @returns {Promise<Object>} this first returns a promise and when the promise is resolved it returns this categories object (with the loaded data included)
	             */
	          }], [{
	            key: "load",
	            value: function load() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              var api = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	              var categories = new Categories();
	              return categories.load(config, api);
	            }
	          }]);
	          return Categories;
	        }();
	        var _default = Categories;
	        exports["default"] = _default;
	      }, {
	        "./load": 22,
	        "@babel/runtime/helpers/classCallCheck": 5,
	        "@babel/runtime/helpers/createClass": 7,
	        "@babel/runtime/helpers/interopRequireDefault": 9
	      }],
	      20: [function (require, module, exports) {

	        var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
	        Object.defineProperty(exports, "__esModule", {
	          value: true
	        });
	        exports["default"] = void 0;
	        var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
	        var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
	        var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
	        var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
	        var _networkgraph = _interopRequireDefault(require("./networkgraph"));
	        var _util = _interopRequireDefault(require("./util.js"));
	        /* global Spyral, Highcharts */
	        /**
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
	         */
	        var Chart = /*#__PURE__*/function () {
	          /**
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
	           */

	          /**
	           * The series config object
	           * @typedef {Object} HighchartsSeriesConfig
	           * @property {Array} data
	           * @property {string} [name]
	           */

	          /**
	           * Construct a new Chart class
	           * @constructor
	           * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	           * @param {Array} data An array of data to visualize.
	           */
	          function Chart(target, data) {
	            (0, _classCallCheck2["default"])(this, Chart);
	            if (_util["default"].isNode(target)) {
	              if (target.isConnected === false) {
	                throw new Error('The target node does not exist within the document.');
	              }
	            } else if (_util["default"].isString(target) === false) {
	              data = target;
	              target = undefined;
	            }
	            this.target = target;
	            this.data = data;
	          }

	          /**
	           * Create a new chart.
	           * See [Highcharts API](https://api.highcharts.com/highcharts/) for full set of config options.
	           * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	           * @param {HighchartsConfig} config 
	           * @returns {Highcharts.Chart}
	           */
	          (0, _createClass2["default"])(Chart, [{
	            key: "create",
	            value: function create(target, config) {
	              var _Chart$_handleTargetA = Chart._handleTargetAndConfig(target, config);
	              var _Chart$_handleTargetA2 = (0, _slicedToArray2["default"])(_Chart$_handleTargetA, 2);
	              target = _Chart$_handleTargetA2[0];
	              config = _Chart$_handleTargetA2[1];
	              return Highcharts.chart(target, config);
	            }
	            /**
	             * Create a new chart.
	             * See [Highcharts API](https://api.highcharts.com/highcharts/) for full set of config options.
	             * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	             * @param {HighchartsConfig} config 
	             * @returns {Highcharts.Chart}
	             */
	          }, {
	            key: "bar",
	            /**
	             * Create a bar chart
	             * @param {Object} [config]
	             * @returns {Highcharts.Chart}
	             */
	            value: function bar() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              Chart.setSeriesData(config, this.data);
	              return Chart.bar(this.target, config);
	            }
	            /**
	             * Create a bar chart
	             * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	             * @param {Object} config 
	             * @returns {Highcharts.Chart}
	             */
	          }, {
	            key: "column",
	            /**
	             * Create a column chart
	             * @param {Object} [config]
	             * @returns {Highcharts.Chart}
	             */
	            value: function column() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              Chart.setSeriesData(config, this.data);
	              return Chart.column(this.target, config);
	            }
	            /**
	             * Create a column chart
	             * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	             * @param {Object} config 
	             * @returns {Highcharts.Chart}
	             */
	          }, {
	            key: "line",
	            /**
	             * Create a line chart
	             * @param {Object} [config]
	             * @returns {Highcharts.Chart}
	             */
	            value: function line() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              Chart.setSeriesData(config, this.data);
	              return Chart.line(this.target, config);
	            }
	            /**
	             * Create a line chart
	             * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	             * @param {Object} config 
	             * @returns {Highcharts.Chart}
	             */
	          }, {
	            key: "scatter",
	            /**
	             * Create a scatter plot
	             * @param {Object} [config]
	             * @returns {Highcharts.Chart}
	             */
	            value: function scatter() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              Chart.setSeriesData(config, this.data);
	              return Chart.scatter(this.target, config);
	            }
	            /**
	             * Create a scatter plot
	             * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	             * @param {Object} config 
	             * @returns {Highcharts.Chart}
	             */
	          }, {
	            key: "networkgraph",
	            /**
	             * Create a network graph
	             * @param {Object} [config]
	             * @returns {Spyral.NetworkGraph}
	             */
	            value: function networkgraph() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              return Chart.networkgraph(this.target, config);
	            }
	            /**
	             * Create a network graph
	             * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	             * @param {Object} config 
	             * @returns {Spyral.NetworkGraph}
	             */
	          }], [{
	            key: "create",
	            value: function create(target, config) {
	              var _Chart$_handleTargetA3 = Chart._handleTargetAndConfig(target, config);
	              var _Chart$_handleTargetA4 = (0, _slicedToArray2["default"])(_Chart$_handleTargetA3, 2);
	              target = _Chart$_handleTargetA4[0];
	              config = _Chart$_handleTargetA4[1];
	              return Highcharts.chart(target, config);
	            }
	          }, {
	            key: "_handleTargetAndConfig",
	            value: function _handleTargetAndConfig(target, config) {
	              if (_util["default"].isNode(target) === false && (0, _typeof2["default"])(target) === 'object') {
	                config = target;
	                target = undefined;
	              }
	              if (target === undefined) {
	                if (typeof Spyral !== 'undefined' && Spyral.Notebook) {
	                  target = Spyral.Notebook.getTarget();
	                  if (target.clientHeight <= 40) {
	                    target.style.height = '400px'; // 400 is the default Highcharts height
	                  }
	                } else {
	                  target = document.createElement('div');
	                  document.body.appendChild(target);
	                }
	              } else {
	                if (_util["default"].isNode(target) && target.isConnected === false) {
	                  throw new Error('The target node does not exist within the document.');
	                }
	              }

	              // convert title and suppress if not provided
	              if ('title' in config) {
	                if (typeof config.title === 'string') {
	                  config.title = {
	                    text: config.title
	                  };
	                }
	              } else {
	                config.title = false;
	              }

	              // convert subtitle and convert if not provided
	              if ('subtitle' in config) {
	                if (typeof config.subtitle === 'string') {
	                  config.subtitle = {
	                    text: config.subtitle
	                  };
	                }
	              } else {
	                config.subtitle = false;
	              }

	              // convert credits
	              if (!('credits' in config)) {
	                config.credits = false;
	              }

	              // suppress xAxis title unless provided
	              if (!('xAxis' in config)) {
	                config.xAxis = {};
	              }
	              if (!('title' in config.xAxis)) {
	                config.xAxis.title = false;
	              } else if (typeof config.xAxis.title === 'string') {
	                config.xAxis.title = {
	                  text: config.xAxis.title
	                };
	              }

	              // suppress xAxis title unless provided
	              if (!('yAxis' in config)) {
	                config.yAxis = {};
	              }
	              if (!('title' in config.yAxis)) {
	                config.yAxis.title = false;
	              } else if (typeof config.yAxis.title === 'string') {
	                config.yAxis.title = {
	                  text: config.yAxis.title
	                };
	              }
	              return [target, config];
	            }
	          }, {
	            key: "_setDefaultChartType",
	            value: function _setDefaultChartType(config, type) {
	              if ('type' in config) {
	                config.chart.type = config.type;
	                delete config.type;
	                return;
	              }

	              // TODO: check plot options and series?

	              if ('chart' in config) {
	                if ('type' in config.chart) {
	                  return;
	                } // already set
	              } else {
	                config.chart = {};
	              }
	              config.chart.type = type;
	              return config;
	            }
	            /**
	             * Add the provided data to the config as a series
	             * @param {Object} config 
	             * @param {Array} data 
	             */
	          }, {
	            key: "setSeriesData",
	            value: function setSeriesData(config, data) {
	              if (Array.isArray(data)) {
	                if (Array.isArray(data[0])) {
	                  config.series = data.map(function (subArray) {
	                    return {
	                      data: subArray
	                    };
	                  });
	                } else {
	                  config.series = [{
	                    data: data
	                  }];
	                }
	              }
	            }
	          }, {
	            key: "bar",
	            value: function bar(target, config) {
	              var _Chart$_handleTargetA5 = Chart._handleTargetAndConfig(target, config);
	              var _Chart$_handleTargetA6 = (0, _slicedToArray2["default"])(_Chart$_handleTargetA5, 2);
	              target = _Chart$_handleTargetA6[0];
	              config = _Chart$_handleTargetA6[1];
	              Chart._setDefaultChartType(config, 'bar');
	              return Highcharts.chart(target, config);
	            }
	          }, {
	            key: "column",
	            value: function column(target, config) {
	              var _Chart$_handleTargetA7 = Chart._handleTargetAndConfig(target, config);
	              var _Chart$_handleTargetA8 = (0, _slicedToArray2["default"])(_Chart$_handleTargetA7, 2);
	              target = _Chart$_handleTargetA8[0];
	              config = _Chart$_handleTargetA8[1];
	              Chart._setDefaultChartType(config, 'column');
	              return Highcharts.chart(target, config);
	            }
	          }, {
	            key: "line",
	            value: function line(target, config) {
	              var _Chart$_handleTargetA9 = Chart._handleTargetAndConfig(target, config);
	              var _Chart$_handleTargetA10 = (0, _slicedToArray2["default"])(_Chart$_handleTargetA9, 2);
	              target = _Chart$_handleTargetA10[0];
	              config = _Chart$_handleTargetA10[1];
	              Chart._setDefaultChartType(config, 'line');
	              return Highcharts.chart(target, config);
	            }
	          }, {
	            key: "scatter",
	            value: function scatter(target, config) {
	              var _Chart$_handleTargetA11 = Chart._handleTargetAndConfig(target, config);
	              var _Chart$_handleTargetA12 = (0, _slicedToArray2["default"])(_Chart$_handleTargetA11, 2);
	              target = _Chart$_handleTargetA12[0];
	              config = _Chart$_handleTargetA12[1];
	              Chart._setDefaultChartType(config, 'scatter');
	              return Highcharts.chart(target, config);
	            }
	          }, {
	            key: "networkgraph",
	            value: function networkgraph(target, config) {
	              var _Chart$_handleTargetA13 = Chart._handleTargetAndConfig(target, config);
	              var _Chart$_handleTargetA14 = (0, _slicedToArray2["default"])(_Chart$_handleTargetA13, 2);
	              target = _Chart$_handleTargetA14[0];
	              config = _Chart$_handleTargetA14[1];
	              return new _networkgraph["default"](target, config);
	            }
	          }]);
	          return Chart;
	        }();
	        var _default = Chart;
	        exports["default"] = _default;
	      }, {
	        "./networkgraph": 23,
	        "./util.js": 25,
	        "@babel/runtime/helpers/classCallCheck": 5,
	        "@babel/runtime/helpers/createClass": 7,
	        "@babel/runtime/helpers/interopRequireDefault": 9,
	        "@babel/runtime/helpers/slicedToArray": 14,
	        "@babel/runtime/helpers/typeof": 15
	      }],
	      21: [function (require, module, exports) {

	        var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
	        Object.defineProperty(exports, "__esModule", {
	          value: true
	        });
	        exports["default"] = void 0;
	        var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
	        var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
	        var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
	        var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
	        var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
	        var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
	        var _load = _interopRequireDefault(require("./load"));
	        var _util = _interopRequireDefault(require("./util.js"));
	        function ownKeys(object, enumerableOnly) {
	          var keys = Object.keys(object);
	          if (Object.getOwnPropertySymbols) {
	            var symbols = Object.getOwnPropertySymbols(object);
	            enumerableOnly && (symbols = symbols.filter(function (sym) {
	              return Object.getOwnPropertyDescriptor(object, sym).enumerable;
	            })), keys.push.apply(keys, symbols);
	          }
	          return keys;
	        }
	        function _objectSpread(target) {
	          for (var i = 1; i < arguments.length; i++) {
	            var source = null != arguments[i] ? arguments[i] : {};
	            i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
	              (0, _defineProperty2["default"])(target, key, source[key]);
	            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
	              Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
	            });
	          }
	          return target;
	        }
	        // this is essentially a private method to determine if we're in corpus or documents mode.
	        // if docIndex or docId is defined, or if mode=="documents" then we're in documents mode
	        function isDocumentsMode() {
	          var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	          return 'docIndex' in config || 'docId' in config || 'mode' in config && config.mode === 'documents';
	        }

	        /**
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
	         * 	- **Tables**: {@link #tableAuthor}, {@link #tableContent}, {@link #tableDocuments}, {@link #tableNoHeadersRow}, {@link #tableTitle}, {@link #tableGroupBy}
	         * - **other**: {@link #inputFormat}, {@link #subTitle}, {@link #title}, {@link #tokenization}
	        
	         * @memberof Spyral
	         * @class
	         */
	        var Corpus = /*#__PURE__*/function () {
	          /**
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
	           */

	          /**
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
	           */

	          /**
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
	           */

	          /**
	           * @cfg {String} tableDocuments Determine what is a document in a table (the entire table, by row, by column); only used for table-based documents.
	           * 
	           * Possible values are:
	           * 
	           * - **undefined or blank** (default): the entire table is one document
	           * - **rows**: each row of the table is a separate document
	           * - **columns**: each column of the table is a separate document
	           * 
	           * See also [Creating a Corpus with Tables](#!/guide/corpuscreator-section-tables).
	           */

	          /**
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
	           * See also [Creating a Corpus with Tables](#!/guide/corpuscreator-section-tables).
	           */

	          /**
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
	           * See also [Creating a Corpus with Tables](#!/guide/corpuscreator-section-tables).
	           */

	          /**
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
	           * See also [Creating a Corpus with Tables](#!/guide/corpuscreator-section-tables).
	           */

	          /**
	           * @cfg {String} tableGroupBy Specify a column (or columns) by which to group documents; only used for table-based documents, in rows mode.
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
	           * See also [Creating a Corpus with Tables](#!/guide/corpuscreator-section-tables).
	           */

	          /**
	           * @cfg {String} tableNoHeadersRow Determine if the table has a first row of headers; only used for table-based documents.
	           * 
	           * Provide a value of "true" if there is no header row, otherwise leave it blank or undefined (default).
	           * 
	           * See also [Creating a Corpus with Tables](#!/guide/corpuscreator-section-tables).
	           */

	          /**
	           * @cfg {String} tokenization The tokenization strategy to use
	           * 
	           * This should usually be undefined, unless specific behaviour is required. These are the valid values:
	           * 
	           * - **undefined or blank**: use the default tokenization (which uses Unicode rules for word segmentation)
	           * - **wordBoundaries**: use any Unicode character word boundaries for tokenization
	           * - **whitespace**: tokenize by whitespace only (punctuation and other characters will be kept with words)
	           * 
	           * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tokenization).
	           */

	          /**
	           * @cfg {String} xmlContentXpath The XPath expression that defines the location of document content (the body); only used for XML-based documents.
	           * 
	           * 		loadCorpus("<doc><head>Hello world!</head><body>This is Voyant!</body></doc>", {
	           * 			 xmlContentXpath: "//body"
	           * 		}); // document would be: "This is Voyant!"
	           * 
	           * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	           */

	          /**
	           * @cfg {String} xmlTitleXpath The XPath expression that defines the location of each document's title; only used for XML-based documents.
	           * 
	           * 		loadCorpus("<doc><title>Hello world!</title><body>This is Voyant!</body></doc>", {
	           * 			 xmlTitleXpath: "//title"
	           * 		}); // title would be: "Hello world!"
	           * 
	           * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	           */

	          /**
	           * @cfg {String} xmlAuthorXpath The XPath expression that defines the location of each document's author; only used for XML-based documents.
	           * 
	           * 		loadCorpus("<doc><author>Stéfan Sinclair</author><body>This is Voyant!</body></doc>", {
	           * 			 xmlAuthorXpath: "//author"
	           * 		}); // author would be: "Stéfan Sinclair"
	           * 
	           * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	           */

	          /**
	           * @cfg {String} xmlPubPlaceXpath The XPath expression that defines the location of each document's publication place; only used for XML-based documents.
	           * 
	           * 		loadCorpus("<doc><pubPlace>Montreal</pubPlace><body>This is Voyant!</body></doc>", {
	           * 			 xmlPubPlaceXpath: "//pubPlace"
	           * 		}); // publication place would be: "Montreal"
	           * 
	           * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	           */

	          /**
	           * @cfg {String} xmlPublisherXpath The XPath expression that defines the location of each document's publisher; only used for XML-based documents.
	           * 
	           * 		loadCorpus("<doc><publisher>The Owl</publisher><body>This is Voyant!</body></doc>", {
	           * 			 xmlPublisherXpath: "//publisher"
	           * 		}); // publisher would be: "The Owl"
	           * 
	           * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	           */

	          /**
	           * @cfg {String} xmlKeywordXpath The XPath expression that defines the location of each document's keywords; only used for XML-based documents.
	           * 
	           * 		loadCorpus("<doc><keyword>text analysis</keyword><body>This is Voyant!</body></doc>", {
	           * 			 xmlKeywordXpath: "//keyword"
	           * 		}); // publisher would be: "text analysis"
	           * 
	           * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	           */

	          /**
	           * @cfg {String} xmlCollectionXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
	           * 
	           * 		loadCorpus("<doc><collection>documentation</collection><body>This is Voyant!</body></doc>", {
	           * 			 xmlCollectionXpath: "//collection"
	           * 		}); // publisher would be: "documentation"
	           * 
	           * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	           */

	          /**
	           * @cfg {String} xmlDocumentsXpath The XPath expression that defines the location of each document; only used for XML-based documents.
	           * 
	           * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	           */

	          /**
	           * @cfg {String} xmlGroupByXpath The XPath expression by which to group multiple documents; only used for XML-based documents.
	           * 
	           * 		loadCorpus("<doc><sp s='Juliet'>Hello!</sp><sp s='Romeo'>Hi!</sp><sp s='Juliet'>Bye!</sp></doc>", {
	           * 			 xmlDocumentsXpath: '//sp',
	           *           xmlGroupByXpath: "//@s"
	           * 		}); // two docs: "Hello! Bye!" (Juliet) and "Hi!" (Romeo)
	           * 
	           * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
	           */

	          /**
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
	           */

	          /**
	           * @cfg {String} xmlExtractorTemplate Pass the XML document through the XSL template located at the specified URL before extraction (this is ignored in XML-based documents).
	           * 
	           * This is an advanced parameter that allows you to define a URL of an XSL template that can
	           * be called *before* text extraction (in other words, the other XML-based parameters apply
	           * after this template has been processed).
	           */

	          /**
	           * @cfg {String} inputRemoveUntil Omit text up until the start of the matching regular expression (this is ignored in XML-based documents).
	           * 
	           * 		loadCorpus("Hello world! This is Voyant!", {
	           * 			 inputRemoveUntil: "This"
	           * 		}); // document would be: "This is Voyant!"
	           * 
	           * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	           */

	          /**
	           * @cfg {String} inputRemoveUntilAfter Omit text up until the end of the matching regular expression (this is ignored in XML-based documents).
	           * 
	           * 		loadCorpus("Hello world! This is Voyant!", {
	           * 			 inputRemoveUntilAfter: "world!"
	           * 		}); // document would be: "This is Voyant!"
	           * 
	           * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	           */

	          /**
	           * @cfg {String} inputRemoveFrom Omit text from the start of the matching regular expression (this is ignored in XML-based documents).
	           * 
	           * 		loadCorpus("Hello world! This is Voyant!", {
	           * 			 inputRemoveFrom: "This"
	           * 		}); // document would be: "Hello World!"
	           * 
	           * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	           */

	          /**
	           * @cfg {String} inputRemoveFromAfter Omit text from the end of the matching regular expression (this is ignored in XML-based documents).
	           * 
	           * 		loadCorpus("Hello world! This is Voyant!", {
	           * 			 inputRemoveFromAfter: "This"
	           * 		}); // document would be: "Hello World! This"
	           * 
	           * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
	           */

	          /**
	           * @cfg {String} subTitle A sub-title for the corpus.
	           * 
	           * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a subtitle for later use.
	           */

	          /**
	           * @cfg {String} title A title for the corpus.
	           * 
	           * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a title for later use.
	           */

	          /**
	           * @cfg {String} curatorTsv a simple TSV of paths and labels for the DToC interface (this isn't typically used outside of the specialized DToC context).
	           *
	           * The DToC skin allows curation of XML tags and attributes in order to constrain the entries shown in the interface or to provide friendlier labels. This assumes plain text unicode input with one definition per line where the simple XPath expression is separated by a tab from a label.
	           *
	           *   	 p    	 paragraph
	           *   	 ref[@target*="religion"]    	 religion
	           *
	            * For more information see the DToC documentation on [Curating Tags](http://cwrc.ca/Documentation/public/index.html#DITA_Files-Various_Applications/DToC/CuratingTags.html)
	           */

	          /**
	           * Create a new Corpus using the specified Corpus ID
	           * @constructor
	           * @param {string} id The Corpus ID
	           */
	          function Corpus(id) {
	            (0, _classCallCheck2["default"])(this, Corpus);
	            this.corpusid = id;
	          }
	          (0, _createClass2["default"])(Corpus, [{
	            key: "id",
	            /**
	             * Returns the ID of the corpus.
	             * 
	             * @returns {Promise<string>} a Promise for the string ID of the corpus
	             */
	            value: function id() {
	              var me = this;
	              return new Promise(function (resolve) {
	                return resolve(me.corpusid);
	              });
	            }
	            /*
	             * Create a Corpus and return the ID
	             * @param {Object} config 
	             * @param {Object} api 
	             */
	            //	static id(config, api) {
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
	             */
	          }, {
	            key: "metadata",
	            value: function metadata(config) {
	              return _load["default"].trombone(config, {
	                tool: isDocumentsMode(config) ? 'corpus.DocumentsMetadata' : 'corpus.CorpusMetadata',
	                corpus: this.corpusid
	              }).then(function (data) {
	                return isDocumentsMode(config) ? data.documentsMetadata.documents : data.corpus.metadata;
	              });
	            }
	            /*
	             * Create a Corpus and return the metadata
	             * @param {*} config 
	             * @param {*} api 
	             */
	            //	static metadata(config, api) {
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
	             */
	          }, {
	            key: "summary",
	            value: function summary() {
	              return this.metadata().then(function (data) {
	                return "This corpus (".concat(data.alias ? data.alias : data.id, ") has ").concat(data.documentsCount.toLocaleString(), " documents with ").concat(data.lexicalTokensCount.toLocaleString(), " total words and ").concat(data.lexicalTypesCount.toLocaleString(), " unique word forms.");
	              });
	            }
	            /*
	             * Create a Corpus and return the summary
	             * @param {*} config 
	             * @param {*} api 
	             */
	            //	static summary(config, api) {
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
	             */
	          }, {
	            key: "titles",
	            value: function titles() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              config.mode = 'documents';
	              return this.metadata(config).then(function (data) {
	                return data.map(function (doc) {
	                  return doc.title;
	                });
	              });
	            }
	            /**
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
	             */
	          }, {
	            key: "documents",
	            value: function documents() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              config.mode = 'documents';
	              return this.metadata(config);
	            }
	            /*
	             * Create a Corpus and return the titles
	             * @param {*} config 
	             * @param {*} api 
	             */
	            //	static titles(config, api) {
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
	             */
	          }, {
	            key: "text",
	            value: function text(config) {
	              return this.texts(config).then(function (data) {
	                return data.join('\n\n---\n\n');
	              });
	            }
	            /*
	             * Create a Corpus and return the text
	             * @param {*} config 
	             * @param {*} api 
	             */
	            //	static text(config, api) {
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
	             */
	          }, {
	            key: "texts",
	            value: function texts(config) {
	              return _load["default"].trombone(config, {
	                tool: 'corpus.CorpusTexts',
	                corpus: this.corpusid
	              }).then(function (data) {
	                return data.texts.texts;
	              });
	            }
	            /*
	             * Create a Corpus and return the texts
	             * @param {*} config 
	             * @param {*} api 
	             */
	            //	static texts(config, api) {
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
	             */
	          }, {
	            key: "terms",
	            value: function terms(config) {
	              return _load["default"].trombone(config, {
	                tool: isDocumentsMode(config) ? 'corpus.DocumentTerms' : 'corpus.CorpusTerms',
	                corpus: this.corpusid
	              }).then(function (data) {
	                return isDocumentsMode(config) ? data.documentTerms.terms : data.corpusTerms.terms;
	              });
	            }
	            /*
	             * Create a Corpus and return the terms
	             * @param {*} config 
	             * @param {*} api 
	             */
	            //	static terms(config, api) {
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
	             */
	          }, {
	            key: "tokens",
	            value: function tokens(config) {
	              return _load["default"].trombone(config, {
	                tool: 'corpus.DocumentTokens',
	                corpus: this.corpusid
	              }).then(function (data) {
	                return data.documentTokens.tokens;
	              });
	            }
	            /*
	             * Create a Corpus and return the tokens
	             * @param {*} config 
	             * @param {*} api 
	             */
	            //	static tokens(config, api) {
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
	             */
	          }, {
	            key: "words",
	            value: function words() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              // by default DocumentTokens limits to 50 which probably isn't expected
	              if (!('limit' in config)) {
	                config.limit = 0;
	              }
	              return _load["default"].trombone(config, {
	                tool: 'corpus.DocumentTokens',
	                noOthers: true,
	                corpus: this.corpusid
	              }).then(function (data) {
	                return data.documentTokens.tokens.map(function (t) {
	                  return t.term;
	                });
	              });
	            }
	            /*
	             * Create a Corpus and return an array of lexical forms (words) in document order.
	             * @param {Object} config 
	             * @param {Object} api 
	             */
	            //	static words(config, api) {
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
	                */
	          }, {
	            key: "contexts",
	            value: function contexts(config) {
	              if ((!config || !config.query) && console) {
	                console.warn('No query provided for contexts request.');
	              }
	              return _load["default"].trombone(config, {
	                tool: 'corpus.DocumentContexts',
	                corpus: this.corpusid
	              }).then(function (data) {
	                return data.documentContexts.contexts;
	              });
	            }
	            /*
	             * Create a Corpus and return the contexts
	             * @param {Object} config 
	             * @param {Object} api 
	             */
	            //	static contexts(config, api) {
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
	             */
	          }, {
	            key: "collocates",
	            value: function collocates(config) {
	              if ((!config || !config.query) && console) {
	                console.warn('No query provided for collocates request.');
	              }
	              return _load["default"].trombone(config, {
	                tool: 'corpus.CorpusCollocates',
	                corpus: this.corpusid
	              }).then(function (data) {
	                return data.corpusCollocates.collocates;
	              });
	            }
	            /*
	             * Create a Corpus and return the collocates
	             * @param {Object} config 
	             * @param {Object} api 
	             */
	            //	static collocates(config, api) {
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
	                */
	          }, {
	            key: "phrases",
	            value: function phrases(config) {
	              return _load["default"].trombone(config, {
	                tool: isDocumentsMode(config) ? 'corpus.DocumentNgrams' : 'corpus.CorpusNgrams',
	                corpus: this.corpusid
	              }).then(function (data) {
	                return isDocumentsMode(config) ? data.documentNgrams.ngrams : data.corpusNgrams.ngrams;
	              });
	            }
	            /*
	             * Create a Corpus and return the phrases
	             * @param {Object} config 
	             * @param {Object} api 
	             */
	            //	static phrases(config, api) {
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
	             *  * **termsOnly**: a very compact data view of the correlations
	             *  * **sort**: the order of the terms, one of the following: `CORRELATION`, `CORRELATIONABS`
	             *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	                * 
	             * The following is specific to corpus mode:
	             * 
	             *  * **minInDocumentsCountRatio**: the minimum coverage (as a percentage between 0 and 100) of the term, amongst all the documents
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
	             * @param {number} config.minInDocumentsCountRatio the minimum coverage (as a percentage between 0 and 100) of the term, amongst all the documents
	             * @param {boolean} config.termsOnly a very compact data view of the correlations
	             * @param {string} config.sort the order of the terms, one of the following: `CORRELATION`, `CORRELATIONABS`
	             * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	                * @returns {Promise<Array>} a Promise for an Array of phrase Objects
	                */
	          }, {
	            key: "correlations",
	            value: function correlations(config) {
	              if ((!config || !config.query) && console) {
	                console.warn('No query provided for correlations request.');
	                if (!isDocumentsMode(config)) {
	                  throw new Error('Unable to run correlations for a corpus without a query.');
	                }
	              }
	              return _load["default"].trombone(config, {
	                tool: isDocumentsMode(config) ? 'corpus.DocumentTermCorrelations' : 'corpus.CorpusTermCorrelations',
	                corpus: this.corpusid
	              }).then(function (data) {
	                return data.termCorrelations.correlations;
	              });
	            }
	            /*
	             * Create a Corpus and return the correlations
	             * @param {Object} config 
	             * @param {Object} api 
	             */
	            //	static correlations(config, api) {
	            //		return Corpus.load(config).then(corpus => corpus.correlations(api || config));
	            //	}
	            /**
	             * Get lemmas. This is the equivalent of calling: this.tokens({ withPosLemmas: true, noOthers: true })
	             * @param {Object} config an Object specifying parameters (see above)
	                * @returns {Promise<Array>} a Promise for an Array of lemma Objects
	             */
	          }, {
	            key: "lemmas",
	            value: function lemmas() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              config.withPosLemmas = true;
	              config.noOthers = true;
	              return this.tokens(config);
	            }
	            /**
	             * Performs topic modelling using the latent Dirichlet allocation. Returns an object that has two primary properties:
	             * 
	             * * **topics**: an array of topics (words organized into bunches of a specified size)
	             * * **topicDocuments**: an array of documents and their topic weights
	             *
	             * Each topic in the **topics** array is an object with the following properties:
	             * 
	             * * **words**: an array of the actual words that form the topic. Each word has the same properties as the topic, as well as a "word" property that contains the text content.
	             * * tokens
	             * * documentEntropy
	             * * wordLength
	             * * coherence
	             * * uniformDist
	             * * corpusDist
	             * * effNumWords
	             * * tokenDocDiff
	             * * rank1Docs
	             * * allocationRatio
	             * * allocationCount
	             * * exclusivity
	             * 
	             * Each document in the **topicDocuments** array is an object with the following properties:
	             * 
	             *  * docId: the document ID
	             *  * weights: an array of the numbers corresponding to the the weight of each topic in this document
	             * 
	             * The config object as parameter can contain the following:
	             * 
	             * * **topics**: the number of topics to get (default is 10)
	             * * **termsPerTopic**: the number of terms for each topic (default is 10)
	             * * **iterations**: the number of iterations to do, more iterations = more accurate (default is 100)
	             * * **perDocLimit**: the token limit per document, starting at the beginning of the document
	             * * **seed**: specify a particular seed to use for random number generation
	             * * **stopList**: a list of stopwords to include
	             * 
	             * @param {Object} config (see above)
	             * @param {number} config.topics the number of topics to get (default is 10)
	             * @param {number} config.termsPerTopic the number of terms for each topic (default is 10)
	             * @param {number} config.iterations the number of iterations to do, more iterations = more accurate (default is 100)
	             * @param {number} config.perDocLimit specify a token limit per document, starting at the beginning of the document
	             * @param {number} config.seed specify a particular seed to use for random number generation
	             * @param {string} config.stopList a list of stopwords to include (see {@link https://voyant-tools.org/docs/#!/guide/stopwords})
	             * @returns {Promise<Object>}
	             */
	          }, {
	            key: "topics",
	            value: function () {
	              var _topics = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
	                var config,
	                  _args = arguments;
	                return _regenerator["default"].wrap(function _callee$(_context) {
	                  while (1) {
	                    switch (_context.prev = _context.next) {
	                      case 0:
	                        config = _args.length > 0 && _args[0] !== undefined ? _args[0] : {
	                          topics: 10,
	                          termsPerTopic: 10,
	                          iterations: 100,
	                          seed: 0,
	                          stopList: 'auto'
	                        };
	                        return _context.abrupt("return", _load["default"].trombone(config, {
	                          tool: 'analysis.TopicModeling',
	                          corpus: this.corpusid
	                        }).then(function (data) {
	                          return data.topicModeling;
	                        }));
	                      case 2:
	                      case "end":
	                        return _context.stop();
	                    }
	                  }
	                }, _callee, this);
	              }));
	              function topics() {
	                return _topics.apply(this, arguments);
	              }
	              return topics;
	            }()
	            /**
	             * Returns an array of entities.
	             * 
	             * The config object as parameter can contain the following:
	             * 
	             *  * **docIndex**: document index to restrict to (can be comma-separated list)
	             *  * **annotator**: the annotator to use: 'stanford' or 'nssi' or 'spacy'
	             * 
	             * @param {Object} config
	             * @param {(number|string)} config.docIndex document index to restrict to (can be comma-separated list)
	             * @param {string} config.annotator the annotator to use: 'stanford' or 'nssi' or 'spacy'
	             * @returns {Promise<Array>}
	             */
	          }, {
	            key: "entities",
	            value: function entities() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
	                annotator: 'stanford'
	              };
	              var timeoutDelay = 5000;
	              var corpusId = this.corpusid;
	              return new Promise(function (resolve, reject) {
	                function doLoad(config) {
	                  var _this = this;
	                  _load["default"].trombone(config, {
	                    tool: 'corpus.DocumentEntities',
	                    includeEntities: true,
	                    noCache: true,
	                    // never cache, we don't want stale entity status
	                    corpus: corpusId
	                  }).then(function (data) {
	                    var total = data.documentEntities.status.length;
	                    var numDone = 0;
	                    var hasFailures = false;
	                    data.documentEntities.status.forEach(function (item) {
	                      if (item[1] === 'done') numDone++;else if (item[1].indexOf('failed') === 0) {
	                        numDone++;
	                        hasFailures = true;
	                      }
	                    });
	                    var isDone = numDone === total;
	                    if (isDone) {
	                      if (hasFailures && numDone === 1) {
	                        reject('Failed to get entities');
	                      } else {
	                        resolve(data.documentEntities.entities);
	                      }
	                    } else {
	                      delete config.retryFailures;
	                      setTimeout(doLoad.bind(_this, config), timeoutDelay);
	                    }
	                  }, function (error) {
	                    return reject(error);
	                  });
	                }
	                doLoad(config);
	              });
	            }
	            /**
	             * Performs one of several dimension reduction statistical analysis techniques.
	             * 
	             * For more details see {@link https://voyant-tools.org/docs/#!/guide/scatterplot}.
	             * 
	             * @param {Object} config 
	             * @param {string} config.type The type of analysis technique to use: 'ca', 'pca', 'tsne', 'docsim'
	             * @param {number} config.start The zero-based start of the list
	             * @param {number} config.limit A limit to the number of items to return at a time
	             * @param {number} config.dimensions The number of dimensions to render, either 2 or 3.
	             * @param {number} config.bins The number of bins to separate a document into.
	             * @param {number} config.clusters The number of clusters within which to group words.
	             * @param {number} config.perplexity The TSNE perplexity value.
	             * @param {number} config.iterations The TSNE iterations value.
	             * @param {string} config.comparisonType The value to use for comparing terms. Options are: 'raw', 'relative', and 'tfidf'.
	             * @param {string} config.target The term to set as the target. This will filter results to terms that are near the target.
	             * @param {string} config.term Used in combination with "target" as a white list of terms to keep.
	             * @param {string} config.query A term query (see {@link https://voyant-tools.org/docs/#!/guide/search})
	             * @param {string} config.stopList A list of stopwords to include (see {@link https://voyant-tools.org/docs/#!/guide/stopwords})
	             * @returns {Promise<Object>}
	             */
	          }, {
	            key: "analysis",
	            value: function analysis() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              config = Object.assign({
	                type: 'ca',
	                start: 0,
	                limit: 50,
	                dimensions: 3,
	                bins: 10,
	                clusters: 3,
	                perplexity: 15,
	                iterations: 1500,
	                comparisonType: 'relative',
	                target: undefined,
	                term: undefined,
	                query: undefined,
	                stopList: 'auto'
	              }, config);
	              var analysis = config.type.toLowerCase();
	              delete config.type;
	              var tool = '';
	              var root = '';
	              if (analysis === 'tsne') {
	                tool = 'corpus.TSNE';
	                root = 'tsneAnalysis';
	              } else if (analysis === 'pca') {
	                tool = 'corpus.PCA';
	                root = 'pcaAnalysis';
	              } else if (analysis === 'docsim') {
	                tool = 'corpus.DocumentSimilarity';
	                root = 'documentSimilarity';
	              } else {
	                tool = 'corpus.CA';
	                root = 'correspondenceAnalysis';
	              }
	              return _load["default"].trombone(config, {
	                tool: tool,
	                withDistributions: true,
	                corpus: this.corpusid
	              }).then(function (data) {
	                return data[root];
	              });
	            }
	            /**
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
	             */
	          }, {
	            key: "tool",
	            value: function tool(_tool) {
	              var _arguments = arguments;
	              var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	              var me = this;
	              return new Promise(function (resolve, reject) {
	                var isTool = function isTool(obj) {
	                  return obj && typeof obj === 'string' && /\W/.test(obj) === false || (0, _typeof2["default"])(obj) === 'object' && 'forTool' in obj;
	                };
	                var isConfig = function isConfig(obj) {
	                  return obj && (0, _typeof2["default"])(obj) === 'object' && !('forTool' in obj);
	                };
	                var lastArg = _arguments[_arguments.length - 1];
	                config = isConfig(lastArg) ? lastArg : {};

	                // we have all tools and we'll show them individually
	                if (isTool(_tool) && (isTool(lastArg) || isConfig(lastArg))) {
	                  var width;
	                  var height;
	                  var val;
	                  var url;
	                  var _ret = function () {
	                    var defaultAttributes = {
	                      style: ''
	                    };
	                    var out = '';
	                    for (var i = 0; i < _arguments.length; i++) {
	                      var t = _arguments[i];
	                      if (isTool(t)) {
	                        (function () {
	                          if (typeof t === 'string') {
	                            t = {
	                              forTool: t
	                            };
	                          } // make sure we have object

	                          // process width and height info
	                          width = config['width'] !== undefined ? config['width'] + '' : '350';
	                          height = config['height'] !== undefined ? config['height'] + '' : '350';
	                          if (width.search(/^\d+$/) === 0) width += 'px';
	                          if (height.search(/^\d+$/) === 0) height += 'px';
	                          if (config['style'] !== undefined) {
	                            if (config['style'].indexOf('width') === -1) {
	                              config['style'] = "width: ".concat(width, ";") + config['style'];
	                            }
	                            if (config['style'].indexOf('height') === -1) {
	                              config['style'] = "height: ".concat(height, ";") + config['style'];
	                            }
	                          } else {
	                            config['style'] = "width: ".concat(width, "; height: ").concat(height, ";");
	                          }

	                          // build iframe tag
	                          out += '<iframe ';
	                          for (var attr in defaultAttributes) {
	                            val = (attr in t ? t[attr] : undefined) || (attr in config ? config[attr] : undefined) || (attr in defaultAttributes ? defaultAttributes[attr] : undefined);
	                            if (val !== undefined) {
	                              out += ' ' + attr + '="' + val + '"';
	                            }
	                          }

	                          // build url
	                          url = new URL((config && config.voyantUrl ? config.voyantUrl : _load["default"].baseUrl) + 'tool/' + t.forTool + '/');
	                          url.searchParams.append('corpus', me.corpusid);
	                          // add API values from config (some may be ignored)
	                          var all = Object.assign(t, config);
	                          Object.keys(all).forEach(function (key) {
	                            if (key !== 'input' && !(key in defaultAttributes)) {
	                              var value = all[key];
	                              // TODO need to sort this out, if key is "query" and value is an array then stringify will break the query format for voyant
	                              // if (typeof value !== 'string') {
	                              // 	value = JSON.stringify(value);
	                              // }
	                              url.searchParams.append(key, value);
	                            }
	                          });

	                          // finish tag
	                          out += ' src="' + url + '"></iframe>';
	                        })();
	                      }
	                    }
	                    return {
	                      v: resolve(out)
	                    };
	                  }();
	                  if ((0, _typeof2["default"])(_ret) === "object") return _ret.v;
	                } else {
	                  if (Array.isArray(_tool)) {
	                    _tool = _tool.join(';');
	                  }
	                  var defaultAttributes = {
	                    width: undefined,
	                    height: undefined,
	                    style: 'width: 90%; height: ' + 350 * (_tool ? _tool : '').split(';').length + 'px'
	                  };

	                  // build iframe tag
	                  var out = '<iframe ';
	                  for (var attr in defaultAttributes) {
	                    var val = (attr in config ? config[attr] : undefined) || (attr in defaultAttributes ? defaultAttributes[attr] : undefined);
	                    if (val !== undefined) {
	                      out += ' ' + attr + '="' + val + '"';
	                    }
	                  }

	                  // build url
	                  var url = new URL((config && config.voyantUrl ? config.voyantUrl : _load["default"].baseUrl) + (_tool ? '?view=customset&tableLayout=' + _tool : ''));
	                  url.searchParams.append('corpus', me.corpusid);
	                  // add API values from config (some may be ignored)
	                  Object.keys(config).forEach(function (key) {
	                    if (key !== 'input' && !(key in defaultAttributes)) {
	                      var value = config[key];
	                      // if (typeof value !== 'string') {
	                      // 	value = JSON.stringify(value);
	                      // }
	                      url.searchParams.append(key, value);
	                    }
	                  });
	                  resolve(out + ' src=\'' + url + '\'></iframe>');
	                }
	              });
	            }
	            /*
	             * Create a Corpus and return the tool
	             * @param {*} tool 
	             * @param {*} config 
	             * @param {*} api 
	             */
	            //	static tool(tool, config, api) {
	            //		return Corpus.load(config).then(corpus => corpus.tool(tool, config, api));
	            //	}
	            /**
	             * An alias for {@link #summary}.
	             */
	          }, {
	            key: "toString",
	            value: function toString() {
	              return this.summary();
	            }
	            /*
	             * Create a new Corpus using the provided config
	             * @param {Object} config 
	             */
	            //	static create(config) {
	            //		return Corpus.load(config);
	            //	}
	            /**
	             * Load a Corpus using the provided config and api
	             * @param {Object} config the Corpus config
	             * @param {Object} api any additional API values
	             * @returns {Promise<Corpus>}
	             */
	          }], [{
	            key: "setBaseUrl",
	            value: function setBaseUrl(baseUrl) {
	              _load["default"].setBaseUrl(baseUrl);
	            }
	          }, {
	            key: "load",
	            value: function load() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              var api = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	              var promise = new Promise(function (resolve, reject) {
	                if (config instanceof Corpus) {
	                  resolve(config);
	                }
	                if (_util["default"].isString(config)) {
	                  if (config.length > 0 && /\W/.test(config) === false) {
	                    config = {
	                      corpus: config
	                    };
	                  } else {
	                    config = {
	                      input: config
	                    };
	                  }
	                } else if (_util["default"].isArray(config) && config.length > 0 && typeof config[0] === 'string') {
	                  config = {
	                    input: config
	                  };
	                } else if (_util["default"].isBlob(config) || _util["default"].isNode(config) || _util["default"].isArray(config) && (_util["default"].isBlob(config[0]) || _util["default"].isNode(config[0]))) {
	                  var formData = new FormData();
	                  if (_util["default"].isArray(config)) {
	                    config.forEach(function (file) {
	                      if (_util["default"].isNode(file)) {
	                        var nodeString = new XMLSerializer().serializeToString(file);
	                        file = new Blob([nodeString], {
	                          type: 'text/xml'
	                        });
	                      }
	                      formData.append('input', file);
	                      var fileExt = _util["default"].getFileExtensionFromMimeType(file.type);
	                      formData.append('inputFormat', _util["default"].getVoyantDocumentFormatFromFileExtension(fileExt));
	                    });
	                  } else {
	                    if (_util["default"].isNode(config)) {
	                      var nodeString = new XMLSerializer().serializeToString(config);
	                      config = new Blob([nodeString], {
	                        type: 'text/xml'
	                      });
	                    }
	                    formData.set('input', config);
	                    var fileExt = _util["default"].getFileExtensionFromMimeType(config.type);
	                    formData.set('inputFormat', _util["default"].getVoyantDocumentFormatFromFileExtension(fileExt));
	                  }

	                  // append any other form options that may have been included
	                  if (api && _util["default"].isObject(api)) {
	                    for (var key in api) {
	                      formData.set(key, api[key]);
	                    }
	                  }
	                  formData.set('tool', 'corpus.CorpusMetadata');
	                  config = {
	                    body: formData,
	                    method: 'POST'
	                  };
	                } else if (_util["default"].isObject(config)) {
	                  if (config.inputFormat === 'json' && _util["default"].isString(config.input) === false) {
	                    config.input = JSON.stringify(config.input);
	                  }
	                }
	                _load["default"].trombone(_objectSpread({}, config, {}, api), {
	                  tool: 'corpus.CorpusMetadata'
	                }).then(function (data) {
	                  resolve(new Corpus(data.corpus.metadata.id));
	                }, function (err) {
	                  reject(err);
	                });
	              });
	              ['analysis', 'collocates', 'contexts', 'correlations', 'documents', 'entities', 'id', 'topics', 'lemmas', 'metadata', 'phrases', 'summary', 'terms', 'text', 'texts', 'titles', 'toString', 'tokens', 'tool', 'words'].forEach(function (name) {
	                promise[name] = function () {
	                  var args = arguments;
	                  return promise.then(function (corpus) {
	                    return corpus[name].apply(corpus, args);
	                  });
	                };
	              });

	              // TODO document assign
	              promise.assign = function (name) {
	                return this.then(function (corpus) {
	                  window[name] = corpus;
	                  return corpus;
	                });
	              };
	              return promise;
	            }
	          }]);
	          return Corpus;
	        }();
	        (0, _defineProperty2["default"])(Corpus, "Load", _load["default"]);
	        var _default = Corpus;
	        exports["default"] = _default;
	      }, {
	        "./load": 22,
	        "./util.js": 25,
	        "@babel/runtime/helpers/asyncToGenerator": 4,
	        "@babel/runtime/helpers/classCallCheck": 5,
	        "@babel/runtime/helpers/createClass": 7,
	        "@babel/runtime/helpers/defineProperty": 8,
	        "@babel/runtime/helpers/interopRequireDefault": 9,
	        "@babel/runtime/helpers/typeof": 15,
	        "@babel/runtime/regenerator": 17
	      }],
	      22: [function (require, module, exports) {

	        var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
	        Object.defineProperty(exports, "__esModule", {
	          value: true
	        });
	        exports["default"] = void 0;
	        var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
	        var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
	        var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
	        function ownKeys(object, enumerableOnly) {
	          var keys = Object.keys(object);
	          if (Object.getOwnPropertySymbols) {
	            var symbols = Object.getOwnPropertySymbols(object);
	            enumerableOnly && (symbols = symbols.filter(function (sym) {
	              return Object.getOwnPropertyDescriptor(object, sym).enumerable;
	            })), keys.push.apply(keys, symbols);
	          }
	          return keys;
	        }
	        function _objectSpread(target) {
	          for (var i = 1; i < arguments.length; i++) {
	            var source = null != arguments[i] ? arguments[i] : {};
	            i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
	              (0, _defineProperty2["default"])(target, key, source[key]);
	            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
	              Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
	            });
	          }
	          return target;
	        }
	        /**
	         * Class embodying Load functionality.
	         * @memberof Spyral
	         * @class
	         */
	        var Load = /*#__PURE__*/function () {
	          function Load() {
	            (0, _classCallCheck2["default"])(this, Load);
	          }
	          (0, _createClass2["default"])(Load, null, [{
	            key: "setBaseUrl",
	            /**
	             * Set the base URL for use with the Load class
	             * @param {string} baseUrl 
	             */
	            value: function setBaseUrl(baseUrl) {
	              this.baseUrl = baseUrl;
	            }
	            /**
	             * Make a call to trombone
	             * @param {Object} config 
	             * @param {Object} params
	             * @returns {JSON}
	             */
	          }, {
	            key: "trombone",
	            value: function trombone() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              var params = arguments.length > 1 ? arguments[1] : undefined;
	              var url = new URL(config.trombone ? config.trombone : this.baseUrl + 'trombone', window.location.origin);
	              delete config.trombone;
	              var all = _objectSpread({}, config, {}, params);
	              for (var key in all) {
	                if (all[key] === undefined) {
	                  delete all[key];
	                }
	              }
	              var method = all.method;
	              if (method === undefined) {
	                method = 'GET';
	              } else {
	                delete all.method;
	              }
	              var opt = {};
	              if (method === 'GET' || method === 'POST') {
	                if (method === 'POST' || JSON.stringify(all).length > 1000) {
	                  opt = {
	                    method: 'POST'
	                  };
	                  if ('body' in all) {
	                    // TODO assume FormData or set this header to ensure UTF-8?
	                    // opt.headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' };
	                    opt.body = all['body'];
	                  } else {
	                    (function () {
	                      // don't set header as it messes up boundaries
	                      var formData = new FormData();
	                      var _loop = function _loop(_key) {
	                        if (all[_key] instanceof Array) {
	                          all[_key].forEach(function (val) {
	                            formData.append(_key, val);
	                          });
	                        } else {
	                          formData.set(_key, all[_key]);
	                        }
	                      };
	                      for (var _key in all) {
	                        _loop(_key);
	                      }
	                      opt.body = formData;
	                    })();
	                  }
	                } else {
	                  var _loop2 = function _loop2(_key2) {
	                    if (all[_key2] instanceof Array) {
	                      all[_key2].forEach(function (val) {
	                        url.searchParams.append(_key2, val);
	                      });
	                    } else {
	                      url.searchParams.set(_key2, all[_key2]);
	                    }
	                  };
	                  for (var _key2 in all) {
	                    _loop2(_key2);
	                  }
	                }
	              } else {
	                throw Error('Load.trombone: unsupported method:', method);
	              }
	              return fetch(url.toString(), opt).then(function (response) {
	                if (response.ok) {
	                  return response.json();
	                } else {
	                  return response.text().then(function (text) {
	                    if (window.console) {
	                      console.error(text);
	                    }
	                    throw Error(text);
	                  });
	                }
	              });
	            }
	            /**
	             * Fetch content from a URL, often resolving cross-domain data constraints
	             * @param {string} urlToFetch 
	             * @param {Object} config
	             * @returns {Response}
	             */
	          }, {
	            key: "load",
	            value: function load(urlToFetch, config) {
	              var url = new URL(config && config.trombone ? config.trombone : this.baseUrl + 'trombone');
	              url.searchParams.set('fetchData', urlToFetch);
	              return fetch(url.toString()).then(function (response) {
	                if (response.ok) {
	                  return response;
	                } else {
	                  return response.text().then(function (text) {
	                    if (window.console) {
	                      console.error(text);
	                    }
	                    throw Error(text);
	                  });
	                }
	              })["catch"](function (err) {
	                throw err;
	              });
	            }
	            /**
	             * Fetch HTML content from a URL
	             * @param {string} url 
	             * @returns {Document}
	             */
	          }, {
	            key: "html",
	            value: function html(url) {
	              return this.text(url).then(function (text) {
	                return new DOMParser().parseFromString(text, 'text/html');
	              });
	            }
	            /**
	             * Fetch XML content from a URL
	             * @param {string} url 
	             * @returns {XMLDocument}
	             */
	          }, {
	            key: "xml",
	            value: function xml(url) {
	              return this.text(url).then(function (text) {
	                return new DOMParser().parseFromString(text, 'text/xml');
	              });
	            }
	            /**
	             * Fetch JSON content from a URL
	             * @param {string} url 
	             * @returns {JSON}
	             */
	          }, {
	            key: "json",
	            value: function json(url) {
	              return this.load(url).then(function (response) {
	                return response.json();
	              });
	            }
	            /**
	             * Fetch text content from a URL
	             * @param {string} url 
	             * @returns {string}
	             */
	          }, {
	            key: "text",
	            value: function text(url) {
	              return this.load(url).then(function (response) {
	                return response.text();
	              });
	            }
	          }]);
	          return Load;
	        }();
	        (0, _defineProperty2["default"])(Load, "baseUrl", void 0);
	        var _default = Load;
	        exports["default"] = _default;
	      }, {
	        "@babel/runtime/helpers/classCallCheck": 5,
	        "@babel/runtime/helpers/createClass": 7,
	        "@babel/runtime/helpers/defineProperty": 8,
	        "@babel/runtime/helpers/interopRequireDefault": 9
	      }],
	      23: [function (require, module, exports) {

	        var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
	        Object.defineProperty(exports, "__esModule", {
	          value: true
	        });
	        exports["default"] = void 0;
	        var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
	        var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
	        var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
	        /* global d3 */
	        /**
	         * A d3 force directed layout with labeled nodes
	         * @memberof Spyral
	         * @class
	         */
	        var NetworkGraph = /*#__PURE__*/function () {
	          /**
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
	           */
	          function NetworkGraph(target, config) {
	            var _this = this;
	            (0, _classCallCheck2["default"])(this, NetworkGraph);
	            (0, _defineProperty2["default"])(this, "physics", {
	              damping: 0.4,
	              // 0 = no damping, 1 = full damping
	              centralGravity: 0.1,
	              // 0 = no grav, 1 = high grav
	              nodeGravity: -50,
	              // negative = repel, positive = attract
	              springLength: 100,
	              springStrength: 0.25,
	              // 0 = not strong, >1 = probably too strong
	              collisionScale: 1.25 // 1 = default, 0 = no collision 
	            });
	            this.target = target;
	            if (config.nodes === undefined) throw new Error('Missing nodes!');
	            if (config.links === undefined) throw new Error('Missing links!');
	            var nodeIdField = config.nodeIdField === undefined ? 'id' : config.nodeIdField;
	            var nodeLabelField = config.nodeLabelField === undefined ? 'id' : config.nodeLabelField;
	            var nodeValueField = config.nodeValueField === undefined ? 'value' : config.nodeValueField;
	            var nodeCategoryField = config.nodeCategoryField === undefined ? 'category' : config.nodeCategoryField;
	            this.nodeData = config.nodes.map(function (node) {
	              return {
	                id: _this._idGet(typeof nodeIdField === 'string' ? node[nodeIdField] : nodeIdField(node)),
	                label: typeof nodeLabelField === 'string' ? node[nodeLabelField] : nodeLabelField(node),
	                value: typeof nodeValueField === 'string' ? node[nodeValueField] : nodeValueField(node),
	                category: typeof nodeCategoryField === 'string' ? node[nodeCategoryField] : nodeCategoryField(node)
	              };
	            });
	            var linkSourceField = config.linkSourceField === undefined ? 'source' : config.linkSourceField;
	            var linkTargetField = config.linkTargetField === undefined ? 'target' : config.linkTargetField;
	            var linkValueField = config.linkValueField === undefined ? 'value' : config.linkValueField;
	            this.linkData = config.links.map(function (link) {
	              var sourceId = _this._idGet(typeof linkSourceField === 'string' ? link[linkSourceField] : linkSourceField(link));
	              var targetId = _this._idGet(typeof linkTargetField === 'string' ? link[linkTargetField] : linkTargetField(link));
	              var linkId = sourceId + '-' + targetId;
	              return {
	                id: linkId,
	                source: sourceId,
	                target: targetId,
	                value: link[linkValueField]
	              };
	            });
	            this.simulation;
	            this.zoom;
	            this.parentEl;
	            this.links;
	            this.nodes;
	            this._insertStyles();
	            this.initGraph();
	            return this;
	          }
	          (0, _createClass2["default"])(NetworkGraph, [{
	            key: "initGraph",
	            value: function initGraph() {
	              var _this2 = this;
	              var width = this.target.offsetWidth;
	              var height = this.target.offsetHeight;
	              var svg = d3.select(this.target).append('svg').attr('viewBox', [0, 0, width, height]);
	              this.parentEl = svg.append('g');
	              this.links = this.parentEl.append('g').attr('class', 'spyral-ng-links').selectAll('.spyral-ng-link');
	              this.nodes = this.parentEl.append('g').attr('class', 'spyral-ng-nodes').selectAll('.spyral-ng-node');
	              this.simulation = d3.forceSimulation().force('center', d3.forceCenter(width * .5, height * .5)
	              // .strength(this.physics.centralGravity)
	              ).force('link', d3.forceLink().id(function (d) {
	                return d.id;
	              }).distance(this.physics.springLength).strength(this.physics.springStrength)).force('charge', d3.forceManyBody().strength(this.physics.nodeGravity)).force('collide', d3.forceCollide(function (d) {
	                return Math.sqrt(d.bbox.width * d.bbox.height) * _this2.physics.collisionScale;
	              })).on('tick', this._ticked.bind(this))
	              // TODO need to update sandbox cached output when simulation is done running
	              .on('end', this._zoomToFit.bind(this));
	              var link = this.links.data(this.linkData);
	              link.exit().remove();
	              var linkEnter = link.enter().append('line').attr('class', 'spyral-ng-link').attr('id', function (d) {
	                return d.id;
	              }).on('mouseover', this._linkMouseOver.bind(this)).on('mouseout', this._linkMouseOut.bind(this));
	              this.links = linkEnter.merge(link);
	              var node = this.nodes.data(this.nodeData);
	              node.exit().remove();
	              var nodeEnter = node.enter().append('g').attr('class', 'spyral-ng-node').attr('id', function (d) {
	                return d.id;
	              }).attr('category', function (d) {
	                return d.category;
	              }).on('mouseover', this._nodeMouseOver.bind(this)).on('mouseout', this._nodeMouseOut.bind(this)).on('click', function (data) {
	                d3.event.stopImmediatePropagation();
	                d3.event.preventDefault();
	                this._nodeClick(data);
	              }.bind(this)).on('contextmenu', function (d) {
	                d3.event.preventDefault();
	                d.fixed = false;
	                d.fx = null;
	                d.fy = null;
	              }).call(d3.drag().on('start', function (d) {
	                if (!d3.event.active) this.simulation.alpha(0.3).restart();
	                d.fx = d.x;
	                d.fy = d.y;
	                d.fixed = true;
	              }.bind(this)).on('drag', function (d) {
	                this.simulation.alpha(0.3); // don't let simulation end while the user is dragging
	                d.fx = d3.event.x;
	                d.fy = d3.event.y;
	              }.bind(this)).on('end', function (d) {
	                //					if (!d3.event.active) me.getVisLayout().alpha(0);
	                if (d.fixed !== true) {
	                  d.fx = null;
	                  d.fy = null;
	                }
	              }));
	              nodeEnter.append('rect');
	              nodeEnter.append('text').text(function (d) {
	                return d.label;
	              }).attr('font-size', function (d) {
	                return d.value ? Math.max(10, Math.sqrt(d.value) * 8) : 10;
	              }).each(function (d) {
	                d.bbox = this.getBBox();
	              }) // set bounding box for later use
	              .attr('dominant-baseline', 'central');
	              this.nodes = nodeEnter.merge(node);
	              this.parentEl.selectAll('rect').attr('width', function (d) {
	                return d.bbox.width + 16;
	              }).attr('height', function (d) {
	                return d.bbox.height + 8;
	              }).attr('rx', function (d) {
	                return Math.max(2, d.bbox.height * 0.2);
	              }).attr('ry', function (d) {
	                return Math.max(2, d.bbox.height * 0.2);
	              });
	              this.parentEl.selectAll('text').attr('dx', 8).attr('dy', function (d) {
	                return d.bbox.height * 0.5 + 4;
	              });
	              this.zoom = d3.zoom().scaleExtent([1 / 4, 4]).on('zoom', function () {
	                this.parentEl.attr('transform', d3.event.transform);
	              }.bind(this));
	              svg.call(this.zoom);
	              this.simulation.nodes(this.nodeData);
	              this.simulation.force('link').links(this.linkData);
	            }
	          }, {
	            key: "_nodeMouseOver",
	            value: function _nodeMouseOver(node) {
	              var _this3 = this;
	              this.parentEl.selectAll('.spyral-ng-node').each(function (d, i, nodes) {
	                return nodes[i].classList.remove('hover');
	              });
	              this.links.each(function (link) {
	                var id;
	                if (link.source.id === node.id) {
	                  id = link.target.id;
	                } else if (link.target.id === node.id) {
	                  id = link.source.id;
	                }
	                if (id) {
	                  _this3.parentEl.select('#' + id).each(function (d, i, nodes) {
	                    return nodes[i].classList.add('hover');
	                  });
	                  _this3.parentEl.select('#' + link.id).each(function (d, i, links) {
	                    return links[i].classList.add('hover');
	                  });
	                }
	              });
	              this.parentEl.select('#' + node.id).each(function (d, i, nodes) {
	                return nodes[i].classList.add('hover');
	              });
	            }
	          }, {
	            key: "_nodeMouseOut",
	            value: function _nodeMouseOut() {
	              this.parentEl.selectAll('.spyral-ng-node, .spyral-ng-link').each(function (d, i, nodes) {
	                return nodes[i].classList.remove('hover');
	              });
	            }
	          }, {
	            key: "_nodeClick",
	            value: function _nodeClick(node) {
	              console.log('click', node);
	            }
	          }, {
	            key: "_linkMouseOver",
	            value: function _linkMouseOver(link) {
	              this.parentEl.selectAll('.spyral-ng-link').each(function (d, i, links) {
	                return links[i].classList.remove('hover');
	              });
	              this.parentEl.select('#' + link.id).each(function (d, i, links) {
	                return links[i].classList.add('hover');
	              });
	            }
	          }, {
	            key: "_linkMouseOut",
	            value: function _linkMouseOut() {
	              this.parentEl.selectAll('.spyral-ng-link').each(function (d, i, links) {
	                return links[i].classList.remove('hover');
	              });
	            }
	          }, {
	            key: "_ticked",
	            value: function _ticked() {
	              this.links.attr('x1', function (d) {
	                return d.source.x;
	              }).attr('y1', function (d) {
	                return d.source.y;
	              }).attr('x2', function (d) {
	                return d.target.x;
	              }).attr('y2', function (d) {
	                return d.target.y;
	              });
	              this.nodes.attr('transform', function (d) {
	                var x = d.x;
	                var y = d.y;
	                x -= d.bbox.width * .5;
	                y -= d.bbox.height * .5;
	                return 'translate(' + x + ',' + y + ')';
	              });
	            }
	          }, {
	            key: "_idGet",
	            value: function _idGet(term) {
	              if (term.search(/^\d+$/) === 0) {
	                return 'spyral_' + term;
	              }
	              return term.replace(/\W/g, '_');
	            }
	          }, {
	            key: "_zoomToFit",
	            value: function _zoomToFit(paddingPercent, transitionDuration) {
	              var bounds = this.parentEl.node().getBBox();
	              var width = bounds.width;
	              var height = bounds.height;
	              var midX = bounds.x + width / 2;
	              var midY = bounds.y + height / 2;
	              var svg = this.parentEl.node().parentElement;
	              var svgRect = svg.getBoundingClientRect();
	              var fullWidth = svgRect.width;
	              var fullHeight = svgRect.height;
	              var scale = (paddingPercent || 0.8) / Math.max(width / fullWidth, height / fullHeight);
	              var translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];
	              if (width < 1) {
	                return;
	              } // FIXME: something strange with spyral

	              d3.select(svg).transition().duration(transitionDuration || 500).call(this.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
	            }
	          }, {
	            key: "_resize",
	            value: function _resize() {}
	          }, {
	            key: "_insertStyles",
	            value: function _insertStyles() {
	              var styleElement = document.createElement('style');
	              styleElement.append("\n.spyral-ng-nodes {\n}\n.spyral-ng-links {\n}\n\n.spyral-ng-node {\n\tcursor: pointer;\n}\n.spyral-ng-node rect {\n\tfill: hsl(200, 73%, 90%);\n\tstroke: #333;\n\tstroke-width: 1px;\n}\n.spyral-ng-node.hover rect {\n\tfill: hsl(354, 73%, 90%);\n}\n.spyral-ng-node text {\n\tuser-select: none;\n}\n\n.spyral-ng-link {\n\tstroke-width: 1px;\n\tstroke: #555;\n}\n.spyral-ng-link.hover {\n\tstroke-width: 2px;\n\tstroke: #333;\n}\n\t\t");
	              this.target.parentElement.prepend(styleElement);
	            }
	          }]);
	          return NetworkGraph;
	        }();
	        var _default = NetworkGraph;
	        exports["default"] = _default;
	      }, {
	        "@babel/runtime/helpers/classCallCheck": 5,
	        "@babel/runtime/helpers/createClass": 7,
	        "@babel/runtime/helpers/defineProperty": 8,
	        "@babel/runtime/helpers/interopRequireDefault": 9
	      }],
	      24: [function (require, module, exports) {

	        var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
	        Object.defineProperty(exports, "__esModule", {
	          value: true
	        });
	        exports["default"] = void 0;
	        var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));
	        var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
	        var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
	        var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
	        var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
	        var _chart = _interopRequireDefault(require("./chart.js"));
	        var _util = _interopRequireDefault(require("./util.js"));
	        /* eslint-disable linebreak-style */
	        /* global Spyral */
	        /**
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
	         */
	        var Table = /*#__PURE__*/function () {
	          /**
	           * The Table config object
	           * @typedef {Object} TableConfig
	           * @property {string} format The format of the provided data, either "tsv" or "csv"
	           * @property {(Object|Array)} headers The table headers
	           * @property {boolean} hasHeaders True if the headers are the first item in the data
	           * @property {string} count Specify "vertical" or "horizontal" to create a table of unique item counts in the provided data
	           */

	          /**
	           * Create a new Table
	           * @constructor
	           * @param {(Object|Array|String|Number)} data An array of data or a string with CSV or TSV.
	           * @param {TableConfig} config an Object for configuring the table initialization
	           * @returns {Spyral.Table}
	           */
	          function Table(data, config) {
	            var _this = this;
	            for (var _len = arguments.length, other = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	              other[_key - 2] = arguments[_key];
	            }
	            (0, _classCallCheck2["default"])(this, Table);
	            this._rows = [];
	            this._headers = {};
	            this._rowKeyColumnIndex = 0;
	            if (_util["default"].isPromise(data)) {
	              throw new Error('Data cannot be a Promise');
	            }

	            // we have a configuration object followed by values: create({headers: []}, 1,2,3) …
	            if (data && (0, _typeof2["default"])(data) === 'object' && (typeof config === 'string' || typeof config === 'number' || Array.isArray(config))) {
	              data.rows = [config].concat(other).filter(function (v) {
	                return v !== undefined;
	              });
	              config = undefined;
	            }

	            // we have a simple variable set of arguments: create(1,2,3) …
	            if (arguments.length > 0 && Array.from(arguments).every(function (a) {
	              return a !== undefined && !Array.isArray(a) && (0, _typeof2["default"])(a) !== 'object';
	            })) {
	              data = [data, config].concat(other).filter(function (v) {
	                return v !== undefined;
	              });
	              config = undefined;
	            }

	            // could be CSV or TSV
	            if (Array.isArray(data) && data.length === 1 && typeof data[0] === 'string' && (data[0].indexOf(',') > -1 || data[0].indexOf('\t') > -1)) {
	              data = data[0];
	            }

	            // first check if we have a string that might be delimited data
	            if (data && (typeof data === 'string' || typeof data === 'number')) {
	              if (typeof data === 'number') {
	                data = String(data);
	              } // convert to string for split
	              var rows = [];
	              var format = config && 'format' in config ? config.format : undefined;
	              data.split(/(\r\n|[\n\v\f\r\x85\u2028\u2029])+/g).forEach(function (line, i) {
	                if (line.trim().length > 0) {
	                  var values;
	                  if (format && format === 'tsv' || line.indexOf('\t') > -1) {
	                    values = line.split(/\t/);
	                  } else if (format && format === 'csv' || line.indexOf(',') > -1) {
	                    values = parseCsvLine(line);
	                  } else {
	                    values = [line];
	                  }

	                  // if we can't find any config information for headers then we try to guess
	                  // if the first line doesn't have any numbers - this heuristic may be questionable
	                  if (i === 0 && values.every(function (v) {
	                    return isNaN(v);
	                  }) && ((0, _typeof2["default"])(config) !== 'object' || (0, _typeof2["default"])(config) === 'object' && !('hasHeaders' in config) && !('headers' in config))) {
	                    _this.setHeaders(values);
	                  } else {
	                    rows.push(values.map(function (v) {
	                      return isNaN(v) ? v : Number(v);
	                    }));
	                  }
	                }
	              });
	              data = rows;
	            }
	            if (data && Array.isArray(data)) {
	              if (config) {
	                if (Array.isArray(config)) {
	                  this.setHeaders(config);
	                } else if ((0, _typeof2["default"])(config) === 'object') {
	                  if ('headers' in config) {
	                    this.setHeaders(config.headers);
	                  } else if ('hasHeaders' in config && config.hasHeaders) {
	                    this.setHeaders(data.shift());
	                  }
	                }
	              }
	              if (config && 'count' in config && config.count) {
	                var freqs = Table.counts(data);
	                if (config.count === 'vertical') {
	                  for (var item in freqs) {
	                    this.addRow(item, freqs[item]);
	                  }
	                  this.rowSort(function (a, b) {
	                    return Table.cmp(b[1], a[1]);
	                  });
	                } else {
	                  this._headers = []; // reset and use the terms as headers
	                  this.addRow(freqs);
	                  this.columnSort(function (a, b) {
	                    return Table.cmp(_this.cell(0, b), _this.cell(0, a));
	                  });
	                }
	              } else {
	                this.addRows(data);
	              }
	            } else if (data && (0, _typeof2["default"])(data) === 'object') {
	              if ('headers' in data && Array.isArray(data.headers)) {
	                this.setHeaders(data.headers);
	              } else if ('hasHeaders' in data && 'rows' in data) {
	                this.setHeaders(data.rows.shift());
	              }
	              if ('rows' in data && Array.isArray(data.rows)) {
	                this.addRows(data.rows);
	              }
	              if ('rowKeyColumn' in data) {
	                if (typeof data.rowKeyColumn === 'number') {
	                  if (data.rowKeyColumn < this.columns()) {
	                    this._rowKeyColumnIndex = data.rowKeyColumn;
	                  } else {
	                    throw new Error('The rowKeyColumn value is higher than the number headers designated: ' + data.rowKeyColum);
	                  }
	                } else if (typeof data.rowKeyColumn === 'string') {
	                  if (data.rowKeyColumn in this._headers) {
	                    this._rowKeyColumnIndex = this._headers[data.rowKeyColumn];
	                  } else {
	                    throw new Error('Unable to find column designated by rowKeyColumn: ' + data.rowKeyColumn);
	                  }
	                }
	              }
	            }
	          }

	          /**
	           * Set the headers for the Table
	           * @param {(Object|Array)} data
	           * @returns {Spyral.Table}
	           */
	          (0, _createClass2["default"])(Table, [{
	            key: "setHeaders",
	            value: function setHeaders(data) {
	              var _this2 = this;
	              if (data && Array.isArray(data)) {
	                data.forEach(function (h) {
	                  return _this2.addColumn(h);
	                }, this);
	              } else if ((0, _typeof2["default"])(data) === 'object') {
	                if (this.columns() === 0 || Object.keys(data).length === this.columns()) {
	                  this._headers = data;
	                } else {
	                  throw new Error('The number of columns don\'t match: ');
	                }
	              } else {
	                throw new Error('Unrecognized argument for headers, it should be an array or an object.' + data);
	              }
	              return this;
	            }
	            /**
	             * Add rows to the Table
	             * @param {Array} data
	             * @returns {Spyral.Table}
	             */
	          }, {
	            key: "addRows",
	            value: function addRows(data) {
	              var _this3 = this;
	              data.forEach(function (row) {
	                return _this3.addRow(row);
	              }, this);
	              return this;
	            }
	            /**
	             * Add a row to the Table
	             * @param {(Array|Object)} data
	             * @returns {Spyral.Table}
	             */
	          }, {
	            key: "addRow",
	            value: function addRow(data) {
	              for (var _len2 = arguments.length, other = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	                other[_key2 - 1] = arguments[_key2];
	              }
	              // we have multiple arguments, so call again as an array
	              if (other.length > 0) {
	                return this.addRow([data].concat(other));
	              }
	              this.setRow(this.rows(), data, true);
	              return this;
	            }
	            /**
	             * Set a row
	             * @param {(number|string)} ind The row index
	             * @param {(Object|Array)} data
	             * @param {boolean} create
	             * @returns {Spyral.Table}
	             */
	          }, {
	            key: "setRow",
	            value: function setRow(ind, data, create) {
	              var _this4 = this;
	              var rowIndex = this.getRowIndex(ind, create);
	              if (rowIndex >= this.rows() && !create) {
	                throw new Error('Attempt to set row values for a row that does note exist: ' + ind + '. Maybe use addRow() instead?');
	              }

	              // we have a simple array, so we'll just push to the rows
	              if (data && Array.isArray(data)) {
	                if (data.length > this.columns()) {
	                  if (create) {
	                    for (var i = this.columns(); i < data.length; i++) {
	                      this.addColumn();
	                    }
	                  } else {
	                    throw new Error('The row that you\'ve created contains more columns than the current table. Maybe use addColunm() first?');
	                  }
	                }
	                data.forEach(function (d, i) {
	                  return _this4.setCell(rowIndex, i, d);
	                }, this);
	              }

	              // we have an object so we'll use the headers
	              else if ((0, _typeof2["default"])(data) === 'object') {
	                for (var column in data) {
	                  if (!this.hasColumn(column)) ;
	                  this.setCell(rowIndex, column, data[column]);
	                }
	              } else if (this.columns() < 2 && create) {
	                // hopefully some scalar value
	                if (this.columns() === 0) {
	                  this.addColumn(); // create first column if it doesn't exist
	                }
	                this.setCell(rowIndex, 0, data);
	              } else {
	                throw new Error('setRow() expects an array or an object, maybe setCell()?');
	              }
	              return this;
	            }
	            /**
	             * Set a column
	             * @param {(number|string)} ind The column index
	             * @param {(Object|Array)} data
	             * @param {boolean} create
	             * @returns {Spyral.Table}
	             */
	          }, {
	            key: "setColumn",
	            value: function setColumn(ind, data, create) {
	              var _this5 = this;
	              var columnIndex = this.getColumnIndex(ind, create);
	              if (columnIndex >= this.columns() && !create) {
	                throw new Error('Attempt to set column values for a column that does note exist: ' + ind + '. Maybe use addColumn() instead?');
	              }

	              // we have a simple array, so we'll just push to the rows
	              if (data && Array.isArray(data)) {
	                data.forEach(function (d, i) {
	                  return _this5.setCell(i, columnIndex, d, create);
	                }, this);
	              }

	              // we have an object so we'll use the headers
	              else if ((0, _typeof2["default"])(data) === 'object') {
	                for (var row in data) {
	                  this.setCell(row, columnIndex, data[row], create);
	                }
	              }

	              // hope we have a scalar value to assign to the first row
	              else {
	                this.setCell(0, columnIndex, data, create);
	              }
	              return this;
	            }
	            /**
	             * Add to or set a cell value
	             * @param {(number|string)} row The row index
	             * @param {(number|string)} column The column index
	             * @param {number} value The value to set/add
	             * @param {boolean} overwrite True to set, false to add to current value
	             */
	          }, {
	            key: "updateCell",
	            value: function updateCell(row, column, value, overwrite) {
	              var rowIndex = this.getRowIndex(row, true);
	              var columnIndex = this.getColumnIndex(column, true);
	              var val = this.cell(rowIndex, columnIndex);
	              this._rows[rowIndex][columnIndex] = val && !overwrite ? val + value : value;
	              return this;
	            }
	            /**
	             * Get the value of a cell
	             * @param {(number|string)} rowInd The row index
	             * @param {(number|string)} colInd The column index
	             * @returns {number}
	             */
	          }, {
	            key: "cell",
	            value: function cell(rowInd, colInd) {
	              return this._rows[this.getRowIndex(rowInd)][this.getColumnIndex(colInd)];
	            }
	            /**
	             * Set the value of a cell
	             * @param {(number|string)} row The row index
	             * @param {(number|string)} column The column index
	             * @param {number} value The value to set
	             * @returns {Spyral.Table}
	             */
	          }, {
	            key: "setCell",
	            value: function setCell(row, column, value) {
	              this.updateCell(row, column, value, true);
	              return this;
	            }
	            /**
	             * Get (and create) the row index
	             * @param {(number|string)} ind The index
	             * @param {boolean} create
	             * @returns {number}
	             */
	          }, {
	            key: "getRowIndex",
	            value: function getRowIndex(ind, create) {
	              var _this6 = this;
	              if (typeof ind === 'number') {
	                if (ind < this._rows.length) {
	                  return ind;
	                } else if (create) {
	                  this._rows[ind] = Array(this.columns());
	                  return ind;
	                }
	                throw new Error('The requested row does not exist: ' + ind);
	              } else if (typeof ind === 'string') {
	                var row = this._rows.findIndex(function (r) {
	                  return r[_this6._rowKeyColumnIndex] === ind;
	                }, this);
	                if (row > -1) {
	                  return row;
	                } else if (create) {
	                  var arr = Array(this.columns());
	                  arr[this._rowKeyColumnIndex] = ind;
	                  this.addRow(arr);
	                  return this.rows();
	                } else {
	                  throw new Error('Unable to find the row named ' + ind);
	                }
	              }
	              throw new Error('Please provide a valid row (number or named row)');
	            }
	            /**
	             * Get (and create) the column index
	             * @param {(number|string)} ind The index
	             * @param {boolean} create
	             * @returns {number}
	             */
	          }, {
	            key: "getColumnIndex",
	            value: function getColumnIndex(ind, create) {
	              if (typeof ind === 'number') {
	                if (ind < this.columns()) {
	                  return ind;
	                } else if (create) {
	                  this.addColumn(ind);
	                  return ind;
	                }
	                throw new Error('The requested column does not exist: ' + ind);
	              } else if (typeof ind === 'string') {
	                if (ind in this._headers) {
	                  return this._headers[ind];
	                } else if (create) {
	                  this.addColumn({
	                    header: ind
	                  });
	                  return this._headers[ind];
	                }
	                throw new Error('Unable to find column named ' + ind);
	              }
	              throw new Error('Please provide a valid column (number or named column)');
	            }
	            /**
	             * Add a column (at the specified index)
	             * @param {(Object|String)} config
	             * @param {(number|string)} ind
	             * @returns {Spyral.Table}
	             */
	          }, {
	            key: "addColumn",
	            value: function addColumn(config, ind) {
	              // determine col
	              var col = this.columns(); // default
	              if (config && typeof config === 'string') {
	                col = config;
	              } else if (config && (0, _typeof2["default"])(config) === 'object' && 'header' in config) {
	                col = config.header;
	              } else if (ind !== undefined) {
	                col = ind;
	              }

	              // check if it exists
	              if (col in this._headers) {
	                throw new Error('This column exists already: ' + config.header);
	              }

	              // add column
	              var colIndex = this.columns();
	              this._headers[col] = colIndex;

	              // determine data
	              var data = [];
	              if (config && (0, _typeof2["default"])(config) === 'object' && 'rows' in config) {
	                data = config.rows;
	              } else if (Array.isArray(config)) {
	                data = config;
	              }

	              // make sure we have enough rows for the new data
	              var columns = this.columns();
	              while (this._rows.length < data.length) {
	                this._rows[this._rows.length] = new Array(columns);
	              }
	              this._rows.forEach(function (r, i) {
	                return r[colIndex] = data[i];
	              });
	              return this;
	            }
	            /**
	             * This function returns different values depending on the arguments provided.
	             * When there are no arguments, it returns the number of rows in this table.
	             * When the first argument is the boolean value `true` all rows are returned.
	             * When the first argument is a an array then the rows corresponding to the row
	             * indices or names are returned. When all arguments except are numbers or strings
	             * then each of those is returned.
	             * @param {(Boolean|Array|Number|String)} [inds]
	             * @param {(Object|Number|String)} [config]
	             * @returns {(Number|Array)}
	             */
	          }, {
	            key: "rows",
	            value: function rows(inds, config) {
	              var _this7 = this;
	              // return length
	              if (inds === undefined) {
	                return this._rows.length;
	              }
	              var rows = [];
	              for (var _len3 = arguments.length, other = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
	                other[_key3 - 2] = arguments[_key3];
	              }
	              var asObj = config && (0, _typeof2["default"])(config) === 'object' && config.asObj || other.length > 0 && (0, _typeof2["default"])(other[other.length - 1]) === 'object' && other[other.length - 1].asObj;

	              // return all
	              if (typeof inds === 'boolean' && inds) {
	                rows = this._rows.map(function (r, i) {
	                  return _this7.row(i, asObj);
	                });
	              }

	              // return specified rows
	              else if (Array.isArray(inds)) {
	                rows = inds.map(function (ind) {
	                  return _this7.row(ind);
	                });
	              }

	              // return specified rows as varargs
	              else if (typeof inds === 'number' || typeof inds === 'string') {
	                [inds, config].concat(other).every(function (i) {
	                  if (typeof i === 'number' || typeof i === 'string') {
	                    rows.push(_this7.row(i, asObj));
	                    return true;
	                  } else {
	                    return false;
	                  }
	                });
	                if (other.length > 0) {
	                  // when config is in last position
	                  if ((0, _typeof2["default"])(other[other.length - 1]) === 'object') {
	                    config = other[other.length - 1];
	                  }
	                }
	              }

	              // zip if requested
	              if (config && (0, _typeof2["default"])(config) === 'object' && 'zip' in config && config.zip) {
	                if (rows.length < 2) {
	                  throw new Error('Only one row available, can\'t zip');
	                }
	                return Table.zip(rows);
	              } else {
	                return rows;
	              }
	            }
	            /**
	             * Get the specified row
	             * @param {(number|string)} ind
	             * @param {boolean} [asObj]
	             * @returns {(Object|Number|String)}
	             */
	          }, {
	            key: "row",
	            value: function row(ind, asObj) {
	              var row = this._rows[this.getRowIndex(ind)];
	              if (asObj) {
	                var obj = {};
	                for (var key in this._headers) {
	                  obj[key] = row[this._headers[key]];
	                }
	                return obj;
	              } else {
	                return row;
	              }
	            }
	            /**
	             * This function returns different values depending on the arguments provided.
	             * When there are no arguments, it returns the number of columns in this table.
	             * When the first argument is the boolean value `true` all columns are returned.
	             * When the first argument is a number a slice of the columns is returned and if
	             * the second argument is a number it is treated as the length of the slice to
	             * return (note that it isn't the `end` index like with Array.slice()).
	             * @param {(Boolean|Array|Number|String)} [inds]
	             * @param {(Object|Number|String)} [config]
	             * @returns {(Number|Array)}
	             */
	          }, {
	            key: "columns",
	            value: function columns(inds, config) {
	              var _this8 = this;
	              // return length
	              if (inds === undefined) {
	                return Object.keys(this._headers).length;
	              }
	              var columns = [];
	              for (var _len4 = arguments.length, other = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
	                other[_key4 - 2] = arguments[_key4];
	              }
	              var asObj = config && (0, _typeof2["default"])(config) === 'object' && config.asObj || other.length > 0 && (0, _typeof2["default"])(other[other.length - 1]) === 'object' && other[other.length - 1].asObj;

	              // return all columns
	              if (typeof inds === 'boolean' && inds) {
	                for (var i = 0, len = this.columns(); i < len; i++) {
	                  columns.push(this.column(i, asObj));
	                }
	              }

	              // return specified columns
	              else if (Array.isArray(inds)) {
	                inds.forEach(function (i) {
	                  return columns.push(_this8.column(i, asObj));
	                }, this);
	              } else if (typeof inds === 'number' || typeof inds === 'string') {
	                [inds, config].concat(other).every(function (i) {
	                  if (typeof i === 'number' || typeof i === 'string') {
	                    columns.push(_this8.column(i, asObj));
	                    return true;
	                  } else {
	                    return false;
	                  }
	                });
	                if (other.length > 0) {
	                  // when config is in last position
	                  if ((0, _typeof2["default"])(other[other.length - 1]) === 'object') {
	                    config = other[other.length - 1];
	                  }
	                }
	              }
	              if (config && (0, _typeof2["default"])(config) === 'object' && 'zip' in config && config.zip) {
	                if (columns.length < 2) {
	                  throw new Error('Only one column available, can\'t zip');
	                }
	                return Table.zip(columns);
	              } else {
	                return columns;
	              }
	            }
	            /**
	             * Get the specified column
	             * @param {(number|string)} ind
	             * @param {boolean} [asObj]
	             * @returns {(Object|Number|String)}
	             */
	          }, {
	            key: "column",
	            value: function column(ind, asObj) {
	              var _this9 = this;
	              var column = this.getColumnIndex(ind);
	              var data = this._rows.forEach(function (r) {
	                return r[column];
	              }); // TODO
	              if (asObj) {
	                var obj = {};
	                this._rows.forEach(function (r) {
	                  obj[r[_this9._rowKeyColumnIndex]] = r[column];
	                });
	                return obj;
	              } else {
	                return this._rows.map(function (r) {
	                  return r[column];
	                });
	              }
	            }
	            /**
	             * Get the specified header
	             * @param {(number|string)} ind
	             * @returns {(number|string)}
	             */
	          }, {
	            key: "header",
	            value: function header(ind) {
	              var _this10 = this;
	              var keys = Object.keys(this._headers);
	              var i = this.getColumnIndex(ind);
	              return keys[keys.findIndex(function (k) {
	                return i === _this10._headers[k];
	              })];
	            }
	            /**
	             * This function returns different values depending on the arguments provided.
	             * When there are no arguments, it returns the number of headers in this table.
	             * When the first argument is the boolean value `true` all headers are returned.
	             * When the first argument is a number a slice of the headers is returned.
	             * When the first argument is an array the slices specified in the array are returned.
	             * @param {(Boolean|Array|Number|String)} inds
	             * @returns {(Number|Array)}
	             */
	          }, {
	            key: "headers",
	            value: function headers(inds) {
	              var _this11 = this;
	              // return length
	              if (inds === undefined) {
	                return Object.keys(this._headers).length;
	              }

	              // let headers = [];

	              // return all
	              if (typeof inds === 'boolean' && inds) {
	                inds = Array(Object.keys(this._headers).length).fill().map(function (_, i) {
	                  return i;
	                });
	              }

	              // return specified rows
	              if (Array.isArray(inds)) {
	                return inds.map(function (i) {
	                  return _this11.header(i);
	                });
	              }

	              // return specified rows as varargs
	              else if (typeof inds === 'number' || typeof inds === 'string') {
	                for (var _len5 = arguments.length, other = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
	                  other[_key5 - 1] = arguments[_key5];
	                }
	                return [inds].concat(other).map(function (i) {
	                  return _this11.header(i);
	                });
	              }
	            }
	            /**
	             * Does the specified column exist
	             * @param {(number|string)} ind
	             * @returns {(number|string)}
	             */
	          }, {
	            key: "hasColumn",
	            value: function hasColumn(ind) {
	              return ind in this._headers;
	            }
	            /**
	             * Runs the specified function on each row.
	             * The function is passed the row and the row index.
	             * @param {Function} fn
	             */
	          }, {
	            key: "forEach",
	            value: function forEach(fn) {
	              this._rows.forEach(function (r, i) {
	                return fn(r, i);
	              });
	            }
	            /**
	             * Get the minimum value in the specified row
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "rowMin",
	            value: function rowMin(ind) {
	              return Math.min.apply(null, this.row(ind));
	            }
	            /**
	             * Get the maximum value in the specified row
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "rowMax",
	            value: function rowMax(ind) {
	              return Math.max.apply(null, this.row(ind));
	            }
	            /**
	             * Get the minimum value in the specified column
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "columnMin",
	            value: function columnMin(ind) {
	              return Math.min.apply(null, this.column(ind));
	            }
	            /**
	             * Get the maximum value in the specified column
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "columnMax",
	            value: function columnMax(ind) {
	              return Math.max.apply(null, this.column(ind));
	            }
	            /**
	             * Get the sum of the values in the specified row
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "rowSum",
	            value: function rowSum(ind) {
	              return Table.sum(this.row(ind));
	            }
	            /**
	             * Get the sum of the values in the specified column
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "columnSum",
	            value: function columnSum(ind) {
	              return Table.sum(this.column(ind));
	            }
	            /**
	             * Get the mean of the values in the specified row
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "rowMean",
	            value: function rowMean(ind) {
	              return Table.mean(this.row(ind));
	            }
	            /**
	             * Get the mean of the values in the specified column
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "columnMean",
	            value: function columnMean(ind) {
	              return Table.mean(this.column(ind));
	            }
	            /**
	             * Get the count of each unique value in the specified row
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "rowCounts",
	            value: function rowCounts(ind) {
	              return Table.counts(this.row(ind));
	            }
	            /**
	             * Get the count of each unique value in the specified column
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "columnCounts",
	            value: function columnCounts(ind) {
	              return Table.counts(this.column(ind));
	            }
	            /**
	             * Get the rolling mean for the specified row
	             * @param {(number|string)} ind
	             * @param {number} neighbors
	             * @param {boolean} overwrite
	             * @returns {Array}
	             */
	          }, {
	            key: "rowRollingMean",
	            value: function rowRollingMean(ind, neighbors, overwrite) {
	              var means = Table.rollingMean(this.row(ind), neighbors);
	              if (overwrite) {
	                this.setRow(ind, means);
	              }
	              return means;
	            }
	            /**
	             * Get the rolling mean for the specified column
	             * @param {(number|string)} ind
	             * @param {number} neighbors
	             * @param {boolean} overwrite
	             * @returns {Array}
	             */
	          }, {
	            key: "columnRollingMean",
	            value: function columnRollingMean(ind, neighbors, overwrite) {
	              var means = Table.rollingMean(this.column(ind), neighbors);
	              if (overwrite) {
	                this.setColumn(ind, means);
	              }
	              return means;
	            }
	            /**
	             * Get the variance for the specified row
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "rowVariance",
	            value: function rowVariance(ind) {
	              return Table.variance(this.row(ind));
	            }
	            /**
	             * Get the variance for the specified column
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "columnVariance",
	            value: function columnVariance(ind) {
	              return Table.variance(this.column(ind));
	            }
	            /**
	             * Get the standard deviation for the specified row
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "rowStandardDeviation",
	            value: function rowStandardDeviation(ind) {
	              return Table.standardDeviation(this.row(ind));
	            }
	            /**
	             * Get the standard deviation for the specified column
	             * @param {(number|string)} ind
	             * @returns {number}
	             */
	          }, {
	            key: "columnStandardDeviation",
	            value: function columnStandardDeviation(ind) {
	              return Table.standardDeviation(this.column(ind));
	            }
	            /**
	             * Get the z scores for the specified row
	             * @param {(number|string)} ind
	             * @returns {Array}
	             */
	          }, {
	            key: "rowZScores",
	            value: function rowZScores(ind) {
	              return Table.zScores(this.row(ind));
	            }
	            /**
	             * Get the z scores for the specified column
	             * @param {(number|string)} ind
	             * @returns {Array}
	             */
	          }, {
	            key: "columnZScores",
	            value: function columnZScores(ind) {
	              return Table.zScores(this.column(ind));
	            }
	            /**
	             * TODO
	             * Sort the specified rows
	             * @returns {Spyral.Table}
	             */
	          }, {
	            key: "rowSort",
	            value: function rowSort(inds, config) {
	              var _this12 = this;
	              // no inds, use all columns
	              if (inds === undefined) {
	                inds = Array(this.columns()).fill().map(function (_, i) {
	                  return i;
	                });
	              }

	              // wrap a single index as array
	              if (typeof inds === 'string' || typeof inds === 'number') {
	                inds = [inds];
	              }
	              if (Array.isArray(inds)) {
	                return this.rowSort(function (a, b) {
	                  var ind;
	                  for (var i = 0, len = inds.length; i < len; i++) {
	                    ind = _this12.getColumnIndex(inds[i]);
	                    if (a !== b) {
	                      if (typeof a[ind] === 'string' && typeof b[ind] === 'string') {
	                        return a[ind].localeCompare(b[ind]);
	                      } else {
	                        return a[ind] - b[ind];
	                      }
	                    }
	                  }
	                  return 0;
	                }, config);
	              }
	              if (typeof inds === 'function') {
	                this._rows.sort(function (a, b) {
	                  if (config && 'asObject' in config && config.asObject) {
	                    var c = {};
	                    for (var k in _this12._headers) {
	                      c[k] = a[_this12._headers[k]];
	                    }
	                    var d = {};
	                    for (var _k in _this12._headers) {
	                      d[_k] = b[_this12._headers[_k]];
	                    }
	                    return inds.apply(_this12, [c, d]);
	                  } else {
	                    return inds.apply(_this12, [a, b]);
	                  }
	                });
	                if (config && 'reverse' in config && config.reverse) {
	                  this._rows.reverse(); // in place
	                }
	              }
	              return this;
	            }
	            /**
	             * TODO
	             * Sort the specified columns
	             * @returns {Spyral.Table}
	             */
	          }, {
	            key: "columnSort",
	            value: function columnSort(inds, config) {
	              var _this13 = this;
	              // no inds, use all columns
	              if (inds === undefined) {
	                inds = Array(this.columns()).fill().map(function (_, i) {
	                  return i;
	                });
	              }

	              // wrap a single index as array
	              if (typeof inds === 'string' || typeof inds === 'number') {
	                inds = [inds];
	              }
	              if (Array.isArray(inds)) {
	                // convert to column names
	                var headers = inds.map(function (ind) {
	                  return _this13.header(ind);
	                });

	                // make sure we have all columns
	                Object.keys(this._headers).forEach(function (h) {
	                  if (!headers.includes(h)) {
	                    headers.push(h);
	                  }
	                });

	                // sort names alphabetically
	                headers.sort(function (a, b) {
	                  return a.localeCompare(b);
	                });

	                // reorder by columns
	                this._rows = this._rows.map(function (_, i) {
	                  return headers.map(function (h) {
	                    return _this13.cell(i, h);
	                  });
	                });
	                this._headers = {};
	                headers.forEach(function (h, i) {
	                  return _this13._headers[h] = i;
	                });
	              }
	              if (typeof inds === 'function') {
	                var _headers = Object.keys(this._headers);
	                if (config && 'asObject' in _headers && _headers.asObject) {
	                  _headers = _headers.map(function (h, i) {
	                    return {
	                      header: h,
	                      data: _this13._rows.map(function (r, j) {
	                        return _this13.cell(i, j);
	                      })
	                    };
	                  });
	                }
	                _headers.sort(function (a, b) {
	                  return inds.apply(_this13, [a, b]);
	                });
	                _headers = _headers.map(function (h) {
	                  return (0, _typeof2["default"])(h) === 'object' ? h.header : h;
	                }); // convert back to string

	                // make sure we have all keys
	                Object.keys(this._headers).forEach(function (k) {
	                  if (_headers.indexOf(k) === -1) {
	                    _headers.push(k);
	                  }
	                });
	                this._rows = this._rows.map(function (_, i) {
	                  return _headers.map(function (h) {
	                    return _this13.cell(i, h);
	                  });
	                });
	                this._headers = {};
	                _headers.forEach(function (h, i) {
	                  return _this13._headers[h] = i;
	                });
	              }
	            }
	            /**
	             * Get a CSV representation of the Table
	             * @param {Object} [config]
	             * @returns {string}
	             */
	          }, {
	            key: "toCsv",
	            value: function toCsv(config) {
	              var cell = function cell(c) {
	                var quote = /"/g;
	                return typeof c === 'string' && (c.indexOf(',') > -1 || c.indexOf('"') > -1) ? '"' + c.replace(quote, '"') + '"' : c;
	              };
	              return (config && 'noHeaders' in config && config.noHeaders ? '' : this.headers(true).map(function (h) {
	                return cell(h);
	              }).join(',') + '\n') + this._rows.map(function (row) {
	                return row.map(function (c) {
	                  return cell(c);
	                }).join(',');
	              }).join('\n');
	            }
	            /**
	             * Get a TSV representation of the Table
	             * @param {Object} [config]
	             * @returns {string}
	             */
	          }, {
	            key: "toTsv",
	            value: function toTsv(config) {
	              return config && 'noHeaders' in config && config.noHeaders ? '' : this.headers(true).join('\t') + '\n' + this._rows.map(function (row) {
	                return row.join('\t');
	              }).join('\n');
	            }
	            /**
	             * Set the target's contents to an HTML representation of the Table
	             * @param {(Function|String|Object)} target
	             * @param {Object} [config]
	             * @returns {Spyral.Table}
	             */
	          }, {
	            key: "html",
	            value: function html(target, config) {
	              var html = this.toString(config);
	              if (typeof target === 'function') {
	                target(html);
	              } else {
	                if (typeof target === 'string') {
	                  target = document.querySelector(target);
	                  if (!target) {
	                    throw 'Unable to find specified target: ' + target;
	                  }
	                }
	                if ((0, _typeof2["default"])(target) === 'object' && 'innerHTML' in target) {
	                  target.innerHTML = html;
	                }
	              }
	              return this;
	            }
	            /**
	             * Same as {@link toString}.
	             */
	          }, {
	            key: "toHtml",
	            value: function toHtml() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              return this.toString(config);
	            }
	            /**
	             * Get an HTML representation of the Table
	             * @param {Object} [config]
	             * @returns {string}
	             */
	          }, {
	            key: "toString",
	            value: function toString() {
	              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	              if (typeof config === 'number') {
	                config = {
	                  limit: config
	                };
	              }
	              if ('top' in config && !('limit' in config)) {
	                config.limit = config.top;
	              }
	              if ('limit' in config && !('bottom' in config)) {
	                config.bottom = 0;
	              }
	              if ('bottom' in config && !('limit' in config)) {
	                config.limit = 0;
	              }
	              return '<table' + ('id' in config ? ' id="' + config.id + '" ' : ' ') + 'class="voyantTable">' + (config && 'caption' in config && typeof config.caption === 'string' ? '<caption>' + config.caption + '</caption>' : '') + (config && 'noHeaders' in config && config.noHeaders ? '' : '<thead><tr>' + this.headers(true).map(function (c) {
	                return '<th>' + c + '</th>';
	              }).join('') + '</tr></thead>') + '<tbody>' + this._rows.filter(function (row, i, arr) {
	                return !('limit' in config) || i < config.limit || !('bottom' in config) || i > arr.length - 1 - config.bottom;
	              }).map(function (row) {
	                return '<tr>' + row.map(function (c) {
	                  return '<td>' + (typeof c === 'number' ? c.toLocaleString() : c) + '</td>';
	                }).join('') + '</tr>';
	              }).join('') + '</tbody></table>';
	            }
	            /**
	             * Show a chart representing the Table
	             * @param {(String|HTMLElement)} [target]
	             * @param {HighchartsConfig} [config]
	             * @returns {Highcharts.Chart}
	             */
	          }, {
	            key: "chart",
	            value: function chart() {
	              var _this14 = this;
	              var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
	              var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	              var _Chart$_handleTargetA = _chart["default"]._handleTargetAndConfig(target, config);
	              var _Chart$_handleTargetA2 = (0, _slicedToArray2["default"])(_Chart$_handleTargetA, 2);
	              target = _Chart$_handleTargetA2[0];
	              config = _Chart$_handleTargetA2[1];
	              config.chart = config.chart || {};
	              var columnsCount = this.columns();
	              var rowsCount = this.rows();
	              var headers = this.headers(config.columns ? config.columns : true);
	              var isHeadersCategories = headers.every(function (h) {
	                return isNaN(h);
	              });
	              if (isHeadersCategories) {
	                _chart["default"]._setDefaultChartType(config, 'column');
	              }

	              // set categories if not set
	              config.xAxis = config.xAxis || {};
	              config.xAxis.categories = config.xAxis.categories || headers;

	              // start filling in series
	              config.series = config.series || [];
	              if (!('seriesFrom' in config)) {
	                // one row, so let's take series from rows
	                if (rowsCount === 1) {
	                  config.dataFrom = config.dataFrom || 'rows';
	                } else if (columnsCount === 1 || !('dataFrom' in config)) {
	                  config.dataFrom = config.dataFrom || 'columns';
	                }
	              }
	              if ('dataFrom' in config) {
	                if (config.dataFrom === 'rows') {
	                  config.data = {
	                    rows: []
	                  };
	                  config.data.rows.push(headers);
	                  config.data.rows = config.data.rows.concat(this.rows(true));
	                } else if (config.dataFrom === 'columns') {
	                  config.data = {
	                    columns: []
	                  };
	                  config.data.columns = config.data.columns.concat(this.columns(true));
	                  if (config.data.columns.length === headers.length) {
	                    headers.forEach(function (h, i) {
	                      config.data.columns[i].splice(0, 0, h);
	                    });
	                  }
	                }
	              } else if ('seriesFrom' in config) {
	                if (config.seriesFrom === 'rows') {
	                  this.rows(config.rows ? config.rows : true).forEach(function (row, i) {
	                    config.series[i] = config.series[i] || {};
	                    config.series[i].data = headers.map(function (h) {
	                      return _this14.cell(i, h);
	                    });
	                  });
	                } else if (config.seriesFrom === 'columns') {
	                  this.columns(config.columns ? config.columns : true).forEach(function (col, i) {
	                    config.series[i] = config.series[i] || {};
	                    config.series[i].data = [];
	                    for (var r = 0; r < rowsCount; r++) {
	                      config.series[i].data.push(_this14.cell(r, i));
	                    }
	                  });
	                }
	              }
	              delete config.dataFrom;
	              delete config.seriesFrom;
	              return _chart["default"].create(target, config);
	            }
	            /**
	             * Create a new Table
	             * @param {(Object|Array|String|Number)} data
	             * @param {TableConfig} config
	             * @returns {Spyral.Table}
	             */
	          }], [{
	            key: "create",
	            value: function create(data, config) {
	              for (var _len6 = arguments.length, other = new Array(_len6 > 2 ? _len6 - 2 : 0), _key6 = 2; _key6 < _len6; _key6++) {
	                other[_key6 - 2] = arguments[_key6];
	              }
	              return (0, _construct2["default"])(Table, [data, config].concat(other));
	            }
	            /**
	             * Fetch a Table from a source
	             * @param {(String|Request)} input
	             * @param {Object} api
	             * @param {Object} config
	             * @returns {Promise}
	             */
	          }, {
	            key: "fetch",
	            value: function fetch(input, api, config) {
	              return new Promise(function (resolve, reject) {
	                window.fetch(input, api).then(function (response) {
	                  if (!response.ok) {
	                    throw new Error(response.status + ' ' + response.statusText);
	                  }
	                  response.text().then(function (text) {
	                    resolve(Table.create(text, config || api));
	                  });
	                });
	              });
	            }
	            /**
	             * Get the count of each unique value in the data
	             * @param {Array} data
	             * @returns {Object}
	             */
	          }, {
	            key: "counts",
	            value: function counts(data) {
	              var vals = {};
	              data.forEach(function (v) {
	                return v in vals ? vals[v]++ : vals[v] = 1;
	              });
	              return vals;
	            }
	            /**
	             * Compare two values
	             * @param {(number|string)} a
	             * @param {(number|string)} b
	             * @returns {number}
	             */
	          }, {
	            key: "cmp",
	            value: function cmp(a, b) {
	              return typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : a - b;
	            }
	            /**
	             * Get the sum of the provided values
	             * @param {Array} data
	             * @returns {number}
	             */
	          }, {
	            key: "sum",
	            value: function sum(data) {
	              return data.reduce(function (a, b) {
	                return a + b;
	              }, 0);
	            }
	            /**
	             * Get the mean of the provided values
	             * @param {Array} data
	             * @returns {number}
	             */
	          }, {
	            key: "mean",
	            value: function mean(data) {
	              return Table.sum(data) / data.length;
	            }
	            /**
	             * Get rolling mean for the provided values
	             * @param {Array} data
	             * @param {number} neighbors
	             * @returns {Array}
	             */
	          }, {
	            key: "rollingMean",
	            value: function rollingMean(data, neighbors) {
	              // https://stackoverflow.com/questions/41386083/plot-rolling-moving-average-in-d3-js-v4/41388581#41387286
	              return data.map(function (val, idx, arr) {
	                var start = Math.max(0, idx - neighbors),
	                  end = idx + neighbors;
	                var subset = arr.slice(start, end + 1);
	                var sum = subset.reduce(function (a, b) {
	                  return a + b;
	                });
	                return sum / subset.length;
	              });
	            }
	            /**
	             * Get the variance for the provided values
	             * @param {Array} data
	             * @returns {number}
	             */
	          }, {
	            key: "variance",
	            value: function variance(data) {
	              var m = Table.mean(data);
	              return Table.mean(data.map(function (num) {
	                return Math.pow(num - m, 2);
	              }));
	            }
	            /**
	             * Get the standard deviation for the provided values
	             * @param {Array} data
	             * @returns {number}
	             */
	          }, {
	            key: "standardDeviation",
	            value: function standardDeviation(data) {
	              return Math.sqrt(Table.variance(data));
	            }
	            /**
	             * Get the z scores for the provided values
	             * @param {Array} data
	             * @returns {Array}
	             */
	          }, {
	            key: "zScores",
	            value: function zScores(data) {
	              var m = Table.mean(data);
	              var s = Table.standardDeviation(data);
	              return data.map(function (num) {
	                return (num - m) / s;
	              });
	            }
	            /**
	             * Perform a zip operation of the provided arrays. Learn more about zip on [Wikipedia](https://en.wikipedia.org/wiki/Convolution_%28computer_science%29).
	             * @param {Array} data
	             * @returns {Array}
	             */
	          }, {
	            key: "zip",
	            value: function zip() {
	              for (var _len7 = arguments.length, data = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
	                data[_key7] = arguments[_key7];
	              }
	              // we have a single nested array, so let's recall with flattened arguments
	              if (data.length === 1 && Array.isArray(data) && data.every(function (d) {
	                return Array.isArray(d);
	              })) {
	                var _Table$zip;
	                return (_Table$zip = Table.zip).apply.apply(_Table$zip, [null].concat(data));
	              }

	              // allow arrays to be of different lengths
	              var len = Math.max.apply(null, data.map(function (d) {
	                return d.length;
	              }));
	              return new Array(len).fill().map(function (_, i) {
	                return data.map(function (d) {
	                  return d[i];
	                });
	              });
	            }
	          }]);
	          return Table;
	        }(); // this seems like a good balance between a built-in flexible parser and a heavier external parser
	        // https://lowrey.me/parsing-a-csv-file-in-es6-javascript/
	        var regex = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
	        function parseCsvLine(line) {
	          var arr = [];
	          line.replace(regex, function (m0, m1, m2, m3) {
	            if (m1 !== undefined) {
	              arr.push(m1.replace(/\\'/g, '\''));
	            } else if (m2 !== undefined) {
	              arr.push(m2.replace(/\\"/g, '"'));
	            } else if (m3 !== undefined) {
	              arr.push(m3);
	            }
	            return '';
	          });
	          if (/,\s*$/.test(line)) {
	            arr.push('');
	          }
	          return arr;
	        }
	        var _default = Table;
	        exports["default"] = _default;
	      }, {
	        "./chart.js": 20,
	        "./util.js": 25,
	        "@babel/runtime/helpers/classCallCheck": 5,
	        "@babel/runtime/helpers/construct": 6,
	        "@babel/runtime/helpers/createClass": 7,
	        "@babel/runtime/helpers/interopRequireDefault": 9,
	        "@babel/runtime/helpers/slicedToArray": 14,
	        "@babel/runtime/helpers/typeof": 15
	      }],
	      25: [function (require, module, exports) {

	        var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
	        Object.defineProperty(exports, "__esModule", {
	          value: true
	        });
	        exports["default"] = void 0;
	        var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
	        var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
	        var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
	        /**
	         * A helper for working with the Voyant Notebook app.
	         * @memberof Spyral
	         */
	        var Util = /*#__PURE__*/function () {
	          function Util() {
	            (0, _classCallCheck2["default"])(this, Util);
	          }
	          (0, _createClass2["default"])(Util, null, [{
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
	             * @returns {Promise<String>} a Promise for a data URL
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
	             * Take a Blob and convert it to a String.
	             * @param {Blob} blob 
	             * @returns {Promise<String>} a Promise for a String
	             */
	          }, {
	            key: "blobToString",
	            value: function blobToString(blob) {
	              return new Promise(function (resolve, reject) {
	                var reader = new FileReader();
	                reader.addEventListener('loadend', function (ev) {
	                  try {
	                    var td = new TextDecoder();
	                    var data = td.decode(ev.target.result);
	                    resolve(data);
	                  } catch (err) {
	                    reject(err);
	                  }
	                });
	                reader.readAsArrayBuffer(blob);
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
	              var typeString = Object.prototype.toString.call(val);
	              return typeString === '[object Function]' || typeString === '[object AsyncFunction]';
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
	              return !!val && ((0, _typeof2["default"])(val) === 'object' || typeof val === 'function') && typeof val.then === 'function';
	            }
	            /**
	             * Returns true if the value is a Blob.
	             * @param {*} val 
	             * @returns {Boolean}
	             */
	          }, {
	            key: "isBlob",
	            value: function isBlob(val) {
	              return val instanceof Blob;
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
	                case 'text/xml':
	                  return 'xml';
	                case 'application/xhtml+xml':
	                  return 'xhtml';
	                case 'text/html':
	                  return 'html';
	                case 'text/plain':
	                  return 'txt';
	                case 'application/pdf':
	                  return 'pdf';
	                case 'application/json':
	                  return 'json';
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
	                case 'application/zip':
	                  return 'zip';
	                case 'application/gzip':
	                  return 'gzip';
	                case 'application/x-bzip2':
	                  return 'bzip2';
	                default:
	                  if (mimeType.indexOf('text') === 0) {
	                    return 'txt'; // fallback
	                  } else {
	                    return undefined;
	                  }
	              }
	            }
	            /**
	             * Takes a file extension and returns the corresponding Voyant Document Format name.
	             * @param {String} fileExtension 
	             * @returns {String}
	             */
	          }, {
	            key: "getVoyantDocumentFormatFromFileExtension",
	            value: function getVoyantDocumentFormatFromFileExtension(fileExtension) {
	              fileExtension = fileExtension.trim().toLowerCase();
	              switch (fileExtension) {
	                case 'txt':
	                  return 'text';
	                case 'xhtml':
	                  return 'html';
	                case 'doc':
	                  return 'msword';
	                case 'docx':
	                  return 'mswordx';
	                case 'xls':
	                  return 'xlsx';
	                case 'zip':
	                  return 'archive';
	                case 'gzip':
	                case 'bzip2':
	                  return 'compressed';
	                default:
	                  return fileExtension;
	              }
	            }
	          }]);
	          return Util;
	        }();
	        var _default = Util;
	        exports["default"] = _default;
	      }, {
	        "@babel/runtime/helpers/classCallCheck": 5,
	        "@babel/runtime/helpers/createClass": 7,
	        "@babel/runtime/helpers/interopRequireDefault": 9,
	        "@babel/runtime/helpers/typeof": 15
	      }]
	    }, {}, [1])(1);
	  });
	});
	unwrapExports(voyantjs);
	var voyantjs_1 = voyantjs.Categories;
	var voyantjs_2 = voyantjs.Chart;
	var voyantjs_3 = voyantjs.Corpus;
	var voyantjs_4 = voyantjs.Load;
	var voyantjs_5 = voyantjs.Table;
	var voyantjs_6 = voyantjs.Util;

	/**
	 * A helper for working with the Voyant Notebook app.
	 * @memberof Spyral
	 */
	class Notebook {
		
		/**
		 * 
		 * @param {*} contents 
		 * @param {*} config
		 * @static 
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
		 * Returns the first DIV element that's a child of the document body. If none exists then one will be created.
		 * @returns {element}
		 * @static
		 */
		static getTarget() {
			if (document.body.firstElementChild !== null && document.body.firstElementChild.nodeName === 'DIV') {
				return document.body.firstElementChild
			}
			const target = document.createElement("div");
			document.body.appendChild(target);
			return target;
		}

		/**
		 * Returns a new promise
		 * @returns {Promise} A promise
		 * @static
		 */
		static getPromise() {
			return new Promise();
		}

		/**
		 * Fetch and return the content of a notebook or a particular cell in a notebook
		 * @param {string} url The URL of the notebook to import
		 * @param {number} [cellIndex] The index of the cell to import
		 * @static
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
		 * @static
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
		 * @static
		 * @returns {String}
		 */
		static getTromboneUrl() {
			return Voyant.application.getTromboneUrl();
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
		 * @static
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

			if (document.querySelector('.spyral-dv-container') !== null) {
				document.querySelector('.spyral-dv-container').remove(); // get rid of dataviewer if it exists
			}
			
			if (contents.constructor === Object || Array.isArray(contents)) {
				return contents; // it's JSON so use the dataviewer
			} else if (typeof this === 'string' || this instanceof String) {
				if (typeof contents === 'number' && isFinite(contents)) {
					len = contents;
				}
				contents = this;
			}
			if (contents instanceof Node) {
				if (contents instanceof Element) {
					contents = contents.outerHTML;
				} else if ((contents instanceof Document || contents instanceof DocumentFragment) && contents.firstElementChild !== null) {
					contents = contents.firstElementChild.outerHTML;
				}
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
	     * @returns {Promise<String>} a Promise for a data URL
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
	     * Take a Blob and convert it to a String.
	     * @param {Blob} blob 
	     * @returns {Promise<String>} a Promise for a String
	     */
	  }, {
	    key: "blobToString",
	    value: function blobToString(blob) {
	      return new Promise(function (resolve, reject) {
	        var reader = new FileReader();
	        reader.addEventListener('loadend', function (ev) {
	          try {
	            var td = new TextDecoder();
	            var data = td.decode(ev.target.result);
	            resolve(data);
	          } catch (err) {
	            reject(err);
	          }
	        });
	        reader.readAsArrayBuffer(blob);
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
	      var typeString = Object.prototype.toString.call(val);
	      return typeString === '[object Function]' || typeString === '[object AsyncFunction]';
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
	     * Returns true if the value is a Blob.
	     * @param {*} val 
	     * @returns {Boolean}
	     */
	  }, {
	    key: "isBlob",
	    value: function isBlob(val) {
	      return val instanceof Blob;
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
	        case 'text/xml':
	          return 'xml';
	        case 'application/xhtml+xml':
	          return 'xhtml';
	        case 'text/html':
	          return 'html';
	        case 'text/plain':
	          return 'txt';
	        case 'application/pdf':
	          return 'pdf';
	        case 'application/json':
	          return 'json';
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
	        case 'application/zip':
	          return 'zip';
	        case 'application/gzip':
	          return 'gzip';
	        case 'application/x-bzip2':
	          return 'bzip2';
	        default:
	          if (mimeType.indexOf('text') === 0) {
	            return 'txt'; // fallback
	          } else {
	            return undefined;
	          }
	      }
	    }
	    /**
	     * Takes a file extension and returns the corresponding Voyant Document Format name.
	     * @param {String} fileExtension 
	     * @returns {String}
	     */
	  }, {
	    key: "getVoyantDocumentFormatFromFileExtension",
	    value: function getVoyantDocumentFormatFromFileExtension(fileExtension) {
	      fileExtension = fileExtension.trim().toLowerCase();
	      switch (fileExtension) {
	        case 'txt':
	          return 'text';
	        case 'xhtml':
	          return 'html';
	        case 'doc':
	          return 'msword';
	        case 'docx':
	          return 'mswordx';
	        case 'xls':
	          return 'xlsx';
	        case 'zip':
	          return 'archive';
	        case 'gzip':
	        case 'bzip2':
	          return 'compressed';
	        default:
	          return fileExtension;
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

	voyantjs_6.Storage = Storage;
	voyantjs_6.show = show;
	voyantjs_6.showError = showError;
	voyantjs_6.DataViewer = DataViewer;

	/**
	 * @namespace Spyral
	 */
	const Spyral$1 = {
		Notebook,
		Util: voyantjs_6,
		Metadata,
		Corpus: voyantjs_3,
		Table: voyantjs_5,
		Load: voyantjs_4,
		Chart: voyantjs_2,
		Categories: voyantjs_1
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
