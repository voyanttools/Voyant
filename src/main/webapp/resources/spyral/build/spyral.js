var Spyral = (function () {
	'use strict';

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var voyantjs = createCommonjsModule(function (module, exports) {
	(function(f){{module.exports=f();}})(function(){return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof commonjsRequire&&commonjsRequire;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t);}return n[i].exports}for(var u="function"==typeof commonjsRequire&&commonjsRequire,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

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

	},{"./src/categories":19,"./src/chart":20,"./src/corpus":21,"./src/load":22,"./src/table":24,"./src/util":25,"@babel/runtime/helpers/interopRequireDefault":9}],2:[function(require,module,exports){

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;
	  for (var i = 0, arr2 = new Array(len); i < len; i++) {
	    arr2[i] = arr[i];
	  }
	  return arr2;
	}
	module.exports = _arrayLikeToArray;

	},{}],3:[function(require,module,exports){

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}
	module.exports = _arrayWithHoles;

	},{}],4:[function(require,module,exports){

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

	},{}],5:[function(require,module,exports){

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}
	module.exports = _classCallCheck;

	},{}],6:[function(require,module,exports){

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

	},{"./isNativeReflectConstruct":10,"./setPrototypeOf":13}],7:[function(require,module,exports){

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

	},{}],8:[function(require,module,exports){

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

	},{}],9:[function(require,module,exports){

	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	}
	module.exports = _interopRequireDefault;

	},{}],10:[function(require,module,exports){

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

	},{}],11:[function(require,module,exports){

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

	},{}],12:[function(require,module,exports){

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	module.exports = _nonIterableRest;

	},{}],13:[function(require,module,exports){

	function _setPrototypeOf(o, p) {
	  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };
	  return _setPrototypeOf(o, p);
	}
	module.exports = _setPrototypeOf;

	},{}],14:[function(require,module,exports){

	var arrayWithHoles = require("./arrayWithHoles");
	var iterableToArrayLimit = require("./iterableToArrayLimit");
	var unsupportedIterableToArray = require("./unsupportedIterableToArray");
	var nonIterableRest = require("./nonIterableRest");
	function _slicedToArray(arr, i) {
	  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
	}
	module.exports = _slicedToArray;

	},{"./arrayWithHoles":3,"./iterableToArrayLimit":11,"./nonIterableRest":12,"./unsupportedIterableToArray":16}],15:[function(require,module,exports){

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

	},{}],16:[function(require,module,exports){

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

	},{"./arrayLikeToArray":2}],17:[function(require,module,exports){

	module.exports = require("regenerator-runtime");

	},{"regenerator-runtime":18}],18:[function(require,module,exports){

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

	},{"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/typeof":15}],19:[function(require,module,exports){

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

	},{"./load":22,"@babel/runtime/helpers/classCallCheck":5,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/interopRequireDefault":9}],20:[function(require,module,exports){

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

	},{"./networkgraph":23,"./util.js":25,"@babel/runtime/helpers/classCallCheck":5,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/slicedToArray":14,"@babel/runtime/helpers/typeof":15}],21:[function(require,module,exports){

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
	 * 	- **Tables**: {@link #tableAuthor}, {@link #tableContent}, {@link #tableDocuments}, {@link #tableNoHeadersRow}, {@link #tableTitle}
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
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
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
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
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
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
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
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
	   */

	  /**
	   * @cfg {String} tableNoHeadersRow Determine if the table has a first row of headers; only used for table-based documents.
	   * 
	   * Provide a value of "true" if there is no header row, otherwise leave it blank or undefined (default).
	   * 
	   * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
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
	   * @cfg {String} xmlGroupByXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
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
	        if (typeof config === 'string') {
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
	        } else if (config instanceof Blob || _util["default"].isNode(config) || _util["default"].isArray(config) && (config[0] instanceof Blob || _util["default"].isNode(config[0]))) {
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
	              formData.append('inputFormat', _util["default"].getFileExtensionFromMimeType(file.type));
	            });
	          } else {
	            if (_util["default"].isNode(config)) {
	              var nodeString = new XMLSerializer().serializeToString(config);
	              config = new Blob([nodeString], {
	                type: 'text/xml'
	              });
	            }
	            formData.set('input', config);
	            formData.set('inputFormat', _util["default"].getFileExtensionFromMimeType(config.type));
	          }

	          // append any other form options that may have been included
	          if (api && (0, _typeof2["default"])(api) === 'object') {
	            for (var key in api) {
	              formData.set(key, api[key]);
	            }
	          }
	          formData.set('tool', 'corpus.CorpusMetadata');
	          config = {
	            body: formData,
	            method: 'POST'
	          };
	        }
	        _load["default"].trombone(_objectSpread({}, config, {}, api), {
	          tool: 'corpus.CorpusMetadata'
	        }).then(function (data) {
	          resolve(new Corpus(data.corpus.metadata.id));
	        }, function (err) {
	          reject(err);
	        });
	      });
	      ['collocates', 'contexts', 'correlations', 'documents', 'entities', 'id', 'topics', 'lemmas', 'metadata', 'phrases', 'summary', 'terms', 'text', 'texts', 'titles', 'toString', 'tokens', 'tool', 'words'].forEach(function (name) {
	        promise[name] = function () {
	          var args = arguments;
	          return promise.then(function (corpus) {
	            return corpus[name].apply(corpus, args);
	          });
	        };
	      });
	      return promise;
	    }
	  }]);
	  return Corpus;
	}();
	(0, _defineProperty2["default"])(Corpus, "Load", _load["default"]);
	var _default = Corpus;
	exports["default"] = _default;

	},{"./load":22,"./util.js":25,"@babel/runtime/helpers/asyncToGenerator":4,"@babel/runtime/helpers/classCallCheck":5,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/defineProperty":8,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/typeof":15,"@babel/runtime/regenerator":17}],22:[function(require,module,exports){

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

	},{"@babel/runtime/helpers/classCallCheck":5,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/defineProperty":8,"@babel/runtime/helpers/interopRequireDefault":9}],23:[function(require,module,exports){

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

	},{"@babel/runtime/helpers/classCallCheck":5,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/defineProperty":8,"@babel/runtime/helpers/interopRequireDefault":9}],24:[function(require,module,exports){

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

	    // TODO throw error if data is Promise

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

	},{"./chart.js":20,"./util.js":25,"@babel/runtime/helpers/classCallCheck":5,"@babel/runtime/helpers/construct":6,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/slicedToArray":14,"@babel/runtime/helpers/typeof":15}],25:[function(require,module,exports){

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
	  }]);
	  return Util;
	}();
	var _default = Util;
	exports["default"] = _default;

	},{"@babel/runtime/helpers/classCallCheck":5,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/typeof":15}]},{},[1])(1)
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

	/**
	 * A helper for working with the Voyant Notebook app.
	 * @memberof Spyral
	 */
	class Util {

		/**
		 * Generates a random ID of the specified length.
		 * @param {Number} len The length of the ID to generate?
		 * @returns {String}
		 */
		static id(len = 8) {
			// based on https://stackoverflow.com/a/13403498
			const times = Math.ceil(len / 11);
			let id = '';
			for (let i = 0; i < times; i++) {
				id += Math.random().toString(36).substring(2); // the result of this is 11 characters long
			}
			const letters = 'abcdefghijklmnopqrstuvwxyz';
			id = letters[Math.floor(Math.random()*26)] + id; // ensure the id starts with a letter
			return id.substring(0, len);
		}

		/**
		 * 
		 * @param {Array|Object|String} contents 
		 * @returns {String}
		 */
		static toString(contents) {
			if (contents.constructor === Array || contents.constructor===Object) {
				contents = JSON.stringify(contents);
				if (contents.length>500) {
					contents = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+contents.substring(0,500)+' <a href="">+</a><div style="display: none">'+contents.substring(501)+'</div>';
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
		static more(before, more, after) {
			return before + '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+more.substring(0,500)+' <a href="">+</a><div style="display: none">'+more.substring(501)+'</div>' + after;
		}


		/**
		 * Take a data URL and convert it to a Blob.
		 * @param {String} dataUrl 
		 * @returns {Blob}
		 */
		static dataUrlToBlob(dataUrl) {
			const parts = dataUrl.split(',');
			const byteString = atob(parts[1]);
			const mimeString = parts[0].split(':')[1].split(';')[0];
			
			const ab = new ArrayBuffer(byteString.length);
			const ia = new Uint8Array(ab);
			for (let i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}
			
			return new Blob([ab], {type: mimeString});
		}

		/**
		 * Take a Blob and convert it to a data URL.
		 * @param {Blob} blob 
		 * @returns {Promise<String>} a Promise for a data URL
		 */
		static blobToDataUrl(blob) {
			return new Promise((resolve, reject) => {
				const fr = new FileReader();
				fr.onload = function(e) {
					resolve(e.target.result);
				};
		
				try {
					fr.readAsDataURL(blob);
				} catch(e) {
					reject(e);
				}
			});
		}

		/**
		 * Take a Blob and convert it to a String.
		 * @param {Blob} blob 
		 * @returns {Promise<String>} a Promise for a String
		 */
		static blobToString(blob) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.addEventListener('loadend', function(ev) {
					try {
						const td = new TextDecoder();
						const data = td.decode(ev.target.result);
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
		static transformXml(xmlDoc, xslStylesheet, returnDoc=false) {
			if (this.isString(xmlDoc)) {
				const parser = new DOMParser();
				xmlDoc = parser.parseFromString(xmlDoc, 'application/xml');
				const error = this._getParserError(xmlDoc);
				if (error) {
					throw error;
				}
			}
			if (this.isString(xslStylesheet)) {
				const parser = new DOMParser();
				xslStylesheet = parser.parseFromString(xslStylesheet, 'application/xml');
				const error = this._getParserError(xslStylesheet);
				if (error) {
					throw error;
				}
			}
			const xslRoot = xslStylesheet.firstElementChild;
			if (xslRoot.hasAttribute('version') === false) {
				// Transform fails in Firefox if version is missing, so return a more helpful error message instead of the default.
				throw new Error('XSL stylesheet is missing version attribute.');
			}

			const xsltProcessor = new XSLTProcessor();
			try {
				xsltProcessor.importStylesheet(xslStylesheet);
			} catch (e) {
				console.warn(e);
			}
			let result;
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
		static _getParserError(doc, includePosition=false) {
			// fairly naive check for parsererror, consider something like https://stackoverflow.com/a/55756548
			const parsererror = doc.querySelector('parsererror');
			if (parsererror !== null) {
				const errorMsg = parsererror.textContent;
				const error = new Error(errorMsg);
				if (includePosition) {
					const lineNumber = parseInt(errorMsg.match(/line[\s\w]+?(\d+)/i)[1]);
					const columnNumber = parseInt(errorMsg.match(/column[\s\w]+?(\d+)/i)[1]);
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
		static isString(val) {
			return typeof val === 'string';
		}

		/**
		 * Returns true if the value is a Number.
		 * @param {*} val 
		 * @returns {Boolean}
		 */
		static isNumber(val) {
			return typeof val === 'number';
		}

		/**
		 * Returns true if the value is a Boolean.
		 * @param {*} val 
		 * @returns {Boolean}
		 */
		static isBoolean(val) {
			return typeof val === 'boolean';
		}

		/**
		 * Returns true if the value is Undefined.
		 * @param {*} val 
		 * @returns {Boolean}
		 */
		static isUndefined(val) {
			return typeof val === 'undefined';
		}

		/**
		 * Returns true if the value is an Array.
		 * @param {*} val 
		 * @returns {Boolean}
		 */
		static isArray(val) {
			return Object.prototype.toString.call(val) === '[object Array]';
		}

		/**
		 * Returns true if the value is an Object.
		 * @param {*} val 
		 * @returns {Boolean}
		 */
		static isObject(val) {
			return Object.prototype.toString.call(val) === '[object Object]';
		}

		/**
		 * Returns true if the value is Null.
		 * @param {*} val 
		 * @returns {Boolean}
		 */
		static isNull(val) {
			return Object.prototype.toString.call(val) === '[object Null]';
		}

		/**
		 * Returns true if the value is a Node.
		 * @param {*} val 
		 * @returns {Boolean}
		 */
		static isNode(val) {
			return val instanceof Node;
		}

		/**
		 * Returns true if the value is a Function.
		 * @param {*} val 
		 * @returns {Boolean}
		 */
		static isFunction(val) {
			return Object.prototype.toString.call(val) === '[object Function]';
		}

		/**
		 * Returns true if the value is a Promise.
		 * @param {*} val 
		 * @returns {Boolean}
		 */
		static isPromise(val) {
			// ES6 promise detection
			// return Object.prototype.toString.call(val) === '[object Promise]';
			
			// general promise detection
			return !!val && (typeof val === 'object' || typeof val === 'function') && typeof val.then === 'function';
		}

		/**
		 * Returns true if the value is a Blob.
		 * @param {*} val 
		 * @returns {Boolean}
		 */
		static isBlob(val) {
			return val instanceof Blob;
		}

		/**
		 * Takes a MIME type and returns the related file extension.
		 * Only handles file types supported by Voyant.
		 * @param {String} mimeType 
		 * @returns {String}
		 */
		static getFileExtensionFromMimeType(mimeType) {
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
	}

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
