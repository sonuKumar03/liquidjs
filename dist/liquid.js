(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Liquid = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var strftime = require("./src/util/strftime.js");
var _ = require("./src/util/underscore.js");
var isTruthy = require("./src/syntax.js").isTruthy;
var moment = require("moment");

var escapeMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&#34;",
  "'": "&#39;"
};

var unescapeMap = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&#34;": '"',
  "&#39;": "'"
};

var DURATION_TYPES = {
  DAYS: "DAYS",
  WEEKS: "WEEKS",
  MONTHS: "MONTHS",
  YEARS: "YEARS"
};

var filters = {
  abs: function abs(v) {
    return Math.abs(v);
  },
  append: function append(v, arg) {
    return v + arg;
  },
  capitalize: function capitalize(str) {
    return stringify(str).charAt(0).toUpperCase() + str.slice(1);
  },
  ceil: function ceil(v) {
    return Math.ceil(v);
  },
  concat: function concat(v, arg) {
    return Array.prototype.concat.call(v, arg);
  },
  date: function date(v, arg) {
    var date = v;
    if (v === "now") {
      date = new Date();
    } else if (_.isString(v)) {
      date = new Date(v);
    }
    return isValidDate(date) ? strftime(date, arg) : v;
  },
  default: function _default(v, arg) {
    return isTruthy(v) ? v : arg;
  },
  divided_by: function divided_by(v, arg) {
    return divide(v, arg);
  },
  downcase: function downcase(v) {
    return v.toLowerCase();
  },
  escape: escape,
  escape_once: function escape_once(str) {
    return escape(unescape(str));
  },
  first: function first(v) {
    return v[0];
  },
  floor: function floor(v) {
    return Math.floor(v);
  },
  join: function join(v, arg) {
    return v.join(arg);
  },
  last: function last(v) {
    return v[v.length - 1];
  },
  lstrip: function lstrip(v) {
    return stringify(v).replace(/^\s+/, "");
  },
  map: function map(arr, arg) {
    return arr.map(function (v) {
      return v[arg];
    });
  },
  sumArray: function sumArray(arr, key, defaultSum) {
    return _sumArray(arr, key, defaultSum);
  },
  minus: function minus(v, arg) {
    return subtract(v, arg);
  },
  modulo: bindFixed(function (v, arg) {
    return v % arg;
  }),
  newline_to_br: function newline_to_br(v) {
    return v.replace(/\n/g, "<br />");
  },
  plus: function plus(v, arg) {
    return add(v, arg);
  },
  prepend: function prepend(v, arg) {
    return arg + v;
  },
  remove: function remove(v, arg) {
    return v.split(arg).join("");
  },
  remove_first: function remove_first(v, l) {
    return v.replace(l, "");
  },
  replace: function replace(v, pattern, replacement) {
    return stringify(v).split(pattern).join(replacement);
  },
  replace_first: function replace_first(v, arg1, arg2) {
    return stringify(v).replace(arg1, arg2);
  },
  reverse: function reverse(v) {
    return v.reverse();
  },
  round: function round(v, arg) {
    var amp = Math.pow(10, arg || 0);
    return Math.round(v * amp, arg) / amp;
  },
  rstrip: function rstrip(str) {
    return stringify(str).replace(/\s+$/, "");
  },
  size: function size(v) {
    return v.length;
  },
  slice: function slice(v, begin, length) {
    return v.substr(begin, length === undefined ? 1 : length);
  },
  sort: function sort(v, arg) {
    return v.sort(arg);
  },
  split: function split(v, arg) {
    return stringify(v).split(arg);
  },
  strip: function strip(v) {
    return stringify(v).trim();
  },
  strip_html: function strip_html(v) {
    return stringify(v).replace(/<\/?\s*\w+\s*\/?>/g, "");
  },
  strip_newlines: function strip_newlines(v) {
    return stringify(v).replace(/\n/g, "");
  },
  times: function times(v, arg) {
    return multiply(v, arg);
  },
  toCurrency: function toCurrency(v, arg) {
    return _toCurrency(v, arg);
  },
  toDuration: function toDuration(v, arg) {
    return _toDuration(v, arg);
  },
  truncate: function truncate(v, l, o) {
    v = stringify(v);
    o = o === undefined ? "..." : o;
    l = l || 16;
    if (v.length <= l) return v;
    return v.substr(0, l - o.length) + o;
  },
  truncatewords: function truncatewords(v, l, o) {
    if (o === undefined) o = "...";
    var arr = v.split(" ");
    var ret = arr.slice(0, l).join(" ");
    if (arr.length > l) ret += o;
    return ret;
  },
  uniq: function uniq(arr) {
    var u = {};
    return (arr || []).filter(function (val) {
      if (u.hasOwnProperty(val)) {
        return false;
      }
      u[val] = true;
      return true;
    });
  },
  upcase: function upcase(str) {
    return stringify(str).toUpperCase();
  },
  updateAttribute: function updateAttribute(v, attr, arg) {
    return _updateAttribute(v, attr, arg);
  },
  updateTypeAttribute: function updateTypeAttribute(v, arg) {
    return _updateTypeAttribute(v, arg);
  },
  url_encode: encodeURIComponent
};

var CF_DATE_FORMAT = "YYYY-MM-DD";
/**
 * MAP for numeric key for a CF object
 * For ex: Cf currency object has "value" key which holds the numeric info
 */
var CF_OBJECT_NUMERIC_KEY_MAP = {
  CURRENCY: "value"
};

function escape(str) {
  return stringify(str).replace(/&|<|>|"|'/g, function (m) {
    return escapeMap[m];
  });
}

function unescape(str) {
  return stringify(str).replace(/&(amp|lt|gt|#34|#39);/g, function (m) {
    return unescapeMap[m];
  });
}

function getFixed(v) {
  var p = (v + "").split(".");
  return p.length > 1 ? p[1].length : 0;
}

function getMaxFixed(l, r) {
  return Math.max(getFixed(l), getFixed(r));
}

function stringify(obj) {
  return obj + "";
}

function bindFixed(cb) {
  return function (l, r) {
    var f = getMaxFixed(l, r);
    return cb(l, r).toFixed(f);
  };
}

function registerAll(liquid) {
  return _.forOwn(filters, function (func, name) {
    return liquid.registerFilter(name, func);
  });
}

function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

function multiply(v, arg) {
  return performOperations(v, arg, "MULTIPLY");
}

function filterNumericKeysFromObject(obj) {
  return Object.keys(obj).filter(function (key) {
    return !Number.isNaN(parseInt(obj[key]));
  });
}

/* Cloning function required to avoid memory leak when performning functions on objects */
function getObjectValues(obj) {
  var resultObj = {};
  var keys = Object.keys(obj);
  keys.forEach(function (key) {
    resultObj[key] = obj[key];
  });
  return resultObj;
}

function isObject(arg) {
  return (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === "object" && arg !== null;
}

function getNumericValueBasedOnCfType(cfType) {
  return CF_OBJECT_NUMERIC_KEY_MAP[cfType] ? CF_OBJECT_NUMERIC_KEY_MAP[cfType] : "value";
}

function calculateDurationInDays(toDate, fromDate) {
  /* Added moments to set time to start of Day (12 am) to avoid any discrepencies in calculation*/
  var acutaltoDateMoment = moment(toDate).startOf('date');
  var actualFromDateMoment = moment(fromDate).startOf('date');
  var durationInDays = moment(acutaltoDateMoment).diff(moment(actualFromDateMoment), "days");
  if (durationInDays < 0) {
    console.info("toDate should be greater than fromDate");
    return {
      type: "DAYS",
      value: 0,
      days: 0
    };
  }
  return {
    type: "DAYS",
    value: durationInDays,
    days: durationInDays
  };
}

/**
 * 
 * @param {number} durValue - should be a number, can be 0, negative number. 
 * @param {string} durType - should be a string and be either days, weeks, months or years. 
 * @returns A number which is a product of durValue and x, where x depends on 
 * durType (days, weeks, months or years). An error will be thrown if x is not
 * days, weeks, months or years.
 */
function calculateDaysFromDurValueAndType(durValue, durType) {
  switch (durType) {
    case DURATION_TYPES.DAYS:
      return durValue;
    case DURATION_TYPES.WEEKS:
      return durValue * 7;
    case DURATION_TYPES.MONTHS:
      return durValue * 30;
    case DURATION_TYPES.YEARS:
      return durValue * 365;
    default:
      throw new Error("duration type of " + durType + " found to be incorrect" + "while calculating days from durValue and durType");
  }
}

function checkIfDurationObjects(v, arg) {
  var units = ['DAYS', 'WEEKS', 'MONTHS', 'YEARS'];
  if (units.indexOf(v.type) != -1 && units.indexOf(arg.type) != -1) {
    return true;
  }
  return false;
}
function subtract(v, arg) {
  return performOperations(v, arg, "SUBTRACT");
}

function divide(v, arg) {
  return performOperations(v, arg, "DIVIDE");
}

function add(v, arg) {
  return performOperations(v, arg, "ADD");
}

function isValidDateString(dateString) {
  return typeof dateString === "string" && (moment(dateString, moment.ISO_8601, true).isValid() || moment(dateString, CF_DATE_FORMAT, true).isValid());
}

function isDefinedAndNotNullArg(argument) {
  return argument !== null && argument !== undefined;
}

function isValidNumber(argument) {
  return isDefinedAndNotNullArg(argument) && !isNaN(argument);
}

function _updateTypeAttribute(v, arg) {
  return _updateAttribute(v, "type", arg);
}

function _updateAttribute(v, attr, arg) {
  if (isDefinedAndNotNullArg(v)) {
    if (isObject(v)) {
      return Object.assign({}, v, _defineProperty({}, "" + attr, arg));
    }
    console.info("Not valid arguments for operation");
    return null;
  } else {
    return _defineProperty({}, "" + attr, arg);
  }
}

function isBothArgsValidDateOrDateString(v, arg) {
  return Object.prototype.toString.call(v) === '[object Date]' && Object.prototype.toString.call(arg) === '[object Date]' || Object.prototype.toString.call(v) === '[object Date]' && isValidDateString(arg) || isValidDateString(v) && Object.prototype.toString.call(arg) === '[object Date]' || isValidDateString(v) && isValidDateString(arg);
}

/**
 * Gets default value for Cf objects operations in case numeric keys absent
 * Currently only supports Cf currency objects
 * @param {*} result 
 * @param {*} v 
 * @param {*} arg 
 * @param {*} operation 
 * @returns 
 */
function getDefaultNumericResult(result, v, arg, operation) {
  console.info("The objects don't have any common numeric attributes");
  var numericKey = getNumericValueBasedOnCfType("CURRENCY");
  result[numericKey] = operationOnItem(v, arg, operation);
  return result;
}

function performOperations(v, arg, operation) {
  if (isBothArgsValidDateOrDateString(v, arg)) {
    return operationOnDates(v, arg, operation);
  } else if ((Object.prototype.toString.call(v) === '[object Date]' || isValidDateString(v)) && isObject(arg)) {
    var addType = ['DAYS', 'WEEKS', 'MONTHS', 'YEARS'];
    var value = arg.value,
        type = arg.type;

    if (value && addType.indexOf(type) != -1) {
      return operationOnDateDuration(v, arg, operation);
    } else {
      console.info("duration obj is incorrect");
      return v;
    }
  } else if (isObject(v) && isObject(arg)) {
    var isDurationObjects = checkIfDurationObjects(v, arg);
    if (isDurationObjects) {
      if (v.days != null && arg.days != null) {
        var total_days = operationOnItem(v.days, arg.days, operation);
        return {
          type: "DAYS",
          value: total_days,
          days: total_days
        };
      } else {
        return {
          type: "DAYS",
          value: 0,
          days: 0
        };
      }
    }
    var result = Object.assign(getObjectValues(arg), getObjectValues(v));
    var numberKeysOfArg = filterNumericKeysFromObject(arg);
    var numberKeysOfV = filterNumericKeysFromObject(v);
    var commonNumericKeys = numberKeysOfV.filter(function (elem) {
      return numberKeysOfArg.indexOf(elem) !== -1;
    });
    // If common numeric keys are present for objects, update all of them in result with op value 
    // otherwise get default result sending both value as 0

    if (commonNumericKeys.length > 0) {
      numberKeysOfArg.forEach(function (key) {
        result[key] = operationOnItem(v[key], arg[key], operation);
      });
    } else {
      // Assumes that only one numeric key to be used to calculate default value
      var defaulArg1Value = numberKeysOfV.length > 0 ? v["" + numberKeysOfV[0]] : 0;
      var defaulArg2Value = numberKeysOfArg.length > 0 ? arg["" + numberKeysOfArg[0]] : 0;
      result = getDefaultNumericResult(result, defaulArg1Value, defaulArg2Value, operation);
    }
    return result;
  } else if (typeof v === "number" && isObject(arg)) {
    var _result = getObjectValues(arg);
    var numberKeys = filterNumericKeysFromObject(arg);
    // If numeric keys are present for arg, update all of them in result with op value with number
    // otherwise get default result sending arg's value as 0
    if (numberKeys.length > 0) {
      numberKeys.forEach(function (key) {
        _result[key] = operationOnItem(v, arg[key], operation);
      });
    } else {
      _result = getDefaultNumericResult(_result, v, 0, operation);
    }
    return _result;
  } else if (isObject(v) && typeof arg === "number") {
    var _result2 = getObjectValues(v);
    var _numberKeys = filterNumericKeysFromObject(v);
    // If numeric keys are present for v, update all of them in result with op value with number
    // otherwise get default result sending v's value as 0
    if (_numberKeys.length > 0) {
      _numberKeys.forEach(function (key) {
        _result2[key] = operationOnItem(v[key], arg, operation);
      });
    } else {
      _result2 = getDefaultNumericResult(_result2, 0, arg, operation);
    }
    return _result2;
  } else if ((typeof v === "undefined" ? "undefined" : _typeof(v)) === "object" && !isDefinedAndNotNullArg(arg) || (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === "object" && !isDefinedAndNotNullArg(v)) {
    /*Added this for cases where one arg is undefined but another is object such as date empty and duration present */
    return null;
  } else {
    return operationOnItem(v, arg, operation);
  }
}

function addOrSubtractOperationOnItem(v, arg, operation, precision) {
  if (!isValidNumber(v) && !isValidNumber(arg)) {
    return 0;
  } else if (isValidNumber(v) && !isValidNumber(arg)) {
    return v;
  } else if (!isValidNumber(v) && isValidNumber(arg)) {
    switch (operation) {
      case "ADD":
        return arg;
      case "SUBTRACT":
        return -arg;
    }
  } else {
    switch (operation) {
      case "ADD":
        return Number((Number(v) + Number(arg)).toFixed(precision));
      case "SUBTRACT":
        return Number((Number(v) - Number(arg)).toFixed(precision));
    }
  }
}

function getDivideOperationOnItem(v, arg, precision) {
  if (arg === 0) {
    console.info("Denominator is zero in division");
    return null;
  }
  /* Special case for divide where precision cannot be based on input values */
  var dividePrecision = precision > 3 ? precision : 3;
  return Number((Number(v) / Number(arg)).toFixed(dividePrecision));
}

function divideOrMultiplyOperationOnItem(v, arg, operation, precision) {
  if (!isValidNumber(v) || !isValidNumber(arg)) {
    return 0;
  } else {
    switch (operation) {
      case "DIVIDE":
        return getDivideOperationOnItem(v, arg, precision);
      case "MULTIPLY":
        return Number((Number(v) * Number(arg)).toFixed(precision));
    }
  }
}

function getItemPrecision(arg) {
  if (isValidNumber(arg)) {
    var argArray = arg.toString().split("");
    var decimalIndex = argArray.findIndex(function (i) {
      return i === ".";
    });
    return decimalIndex === -1 ? 0 : argArray.length - (decimalIndex + 1);
  }
  return 0;
}

function getOperationPrecision(v, arg) {
  return Math.max(getItemPrecision(v), getItemPrecision(arg));
}

function operationOnItem(v, arg, operation) {
  var precision = getOperationPrecision(v, arg);
  switch (operation) {
    case "ADD":
    case "SUBTRACT":
      return addOrSubtractOperationOnItem(v, arg, operation, precision);
    case "DIVIDE":
    case "MULTIPLY":
      return divideOrMultiplyOperationOnItem(v, arg, operation, precision);
  }
}

function operationOnDateDuration(v, arg, operation) {
  switch (operation) {
    case "ADD":
      return new Date(moment(v).add(arg.value, arg.type));
    case "SUBTRACT":
      return new Date(moment(v).subtract(arg.value, arg.type));
    default:
      console.info(operation + ", not supported");
      return null;
  }
}

function operationOnDates(v, arg, operation) {
  switch (operation) {
    case "SUBTRACT":
      return calculateDurationInDays(v, arg);
    default:
      console.info(operation + ", not supported");
      return null;
  }
}

/**
 * 
 * @param {number} currValue - should be a number, can be 0, negative number. 
 * @param {string} currType - should be a string
 * @returns An object with properties value(of type number, value same as currValue) 
 * and type(of type string and value same as currType)
 */
function _toCurrency(currValue, currType) {
  if (isValidNumber(currValue) && _.isString(currType)) {
    return { value: currValue, type: currType };
  }
  throw new Error("invalid currency value or type");
}

/**
 * 
 * @param {number} durValue - should be a number, can be 0, negative number. 
 * @param {string} durType - should be a string and be either days, weeks, months or years.
 * @returns An object with properties value(of type number, value same as durValue), 
 * type(of type string, value same as durType), 
 * days(of type number, value calcuated from arguments durValue and durType)
 */
function _toDuration(durValue, durType) {
  if (isValidNumber(durValue) && _.isString(durType)) {
    var durationType = durType.toUpperCase();

    if (Object.values(DURATION_TYPES).includes(durationType)) {
      return {
        value: durValue,
        type: durationType,
        days: calculateDaysFromDurValueAndType(durValue, durationType)
      };
    }
  }
  throw new Error("invalid duration value or type");
}

/**
 * Sums the elements of an array, optionally summing the values of a specified key in each object.
 *
 * @param {Array} arr - The array to sum.
 * @param {string} [key] - The key whose values should be summed (optional).
 * @param {number} [defaultSum=0] - The default sum to return if the array is empty.
 * @returns {number|object} The sum of the array elements or the sum of the specified key's values.
 * @throws {Error} If the input is not an array or if the key is invalid.
 */
function _sumArray(arr, key) {
  var defaultSum = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (!Array.isArray(arr)) {
    // Check if input is an array
    throw new Error('Input is not an array');
  }

  if (arr.length === 0) {
    // Return the default sum if the array is empty
    return defaultSum;
  }

  if (key === undefined) {
    // If no key is provided, sum the elements directly
    return arr.reduce(function (acc, item) {
      return performOperations(acc, item, 'ADD');
    });
  }

  if (!_.isString(key)) {
    // Check if the key is a string
    throw new Error('Invalid key for sumArray filter');
  }

  // If a valid key is provided, sum the values of that key from the array objects
  var values = arr.map(function (item) {
    return item[key];
  });
  return values.reduce(function (acc, item) {
    return performOperations(acc, item, 'ADD');
  });
}

registerAll.filters = filters;
module.exports = registerAll;

},{"./src/syntax.js":67,"./src/util/strftime.js":74,"./src/util/underscore.js":75,"moment":44}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scope = require('./src/scope');
var _ = require('./src/util/underscore.js');
var assert = require('./src/util/assert.js');
var tokenizer = require('./src/tokenizer.js');
var statFileAsync = require('./src/util/fs.js').statFileAsync;
var readFileAsync = require('./src/util/fs.js').readFileAsync;
var path = require('path');
var url = require('./src/util/url.js');
var Render = require('./src/render.js');
var lexical = require('./src/lexical.js');
var Tag = require('./src/tag.js');
var Filter = require('./src/filter.js');
var Parser = require('./src/parser');
var Syntax = require('./src/syntax.js');
var tags = require('./tags');
var filters = require('./filters');
var Promise = require('any-promise');
var anySeries = require('./src/util/promise.js').anySeries;
var Errors = require('./src/util/error.js');

var _engine = {
  init: function init(tag, filter, options) {
    if (options.cache) {
      this.cache = {};
    }
    this.options = options;
    this.tag = tag;
    this.filter = filter;
    this.parser = Parser(tag, filter);
    this.renderer = Render();

    tags(this);
    filters(this);

    return this;
  },
  parse: function parse(html, filepath) {
    var tokens = tokenizer.parse(html, filepath, this.options);
    return this.parser.parse(tokens);
  },
  render: function render(tpl, ctx, opts) {
    opts = _.assign({}, this.options, opts);
    var scope = Scope.factory(ctx, opts);
    return this.renderer.renderTemplates(tpl, scope);
  },
  parseAndRender: function parseAndRender(html, ctx, opts) {
    var _this = this;

    return Promise.resolve().then(function () {
      return _this.parse(html);
    }).then(function (tpl) {
      return _this.render(tpl, ctx, opts);
    });
  },
  renderFile: function renderFile(filepath, ctx, opts) {
    var _this2 = this;

    opts = _.assign({}, opts);
    return this.getTemplate(filepath, opts.root).then(function (templates) {
      return _this2.render(templates, ctx, opts);
    });
  },
  evalValue: function evalValue(str, scope) {
    var tpl = this.parser.parseValue(str.trim());
    return this.renderer.evalValue(tpl, scope);
  },
  registerFilter: function registerFilter(name, filter) {
    return this.filter.register(name, filter);
  },
  registerTag: function registerTag(name, tag) {
    return this.tag.register(name, tag);
  },
  lookup: function lookup(filepath, root) {
    root = this.options.root.concat(root || []);
    root = _.uniq(root);
    var paths = root.map(function (root) {
      return path.resolve(root, filepath);
    });
    return anySeries(paths, function (path) {
      return statFileAsync(path).then(function () {
        return path;
      });
    }).catch(function (e) {
      e.message = e.code + ': Failed to lookup ' + filepath + ' in: ' + root;
      throw e;
    });
  },
  getTemplate: function getTemplate(filepath, root) {
    return typeof XMLHttpRequest === 'undefined' ? this.getTemplateFromFile(filepath, root) : this.getTemplateFromUrl(filepath, root);
  },
  getTemplateFromFile: function getTemplateFromFile(filepath, root) {
    var _this3 = this;

    if (!path.extname(filepath)) {
      filepath += this.options.extname;
    }
    return this.lookup(filepath, root).then(function (filepath) {
      if (_this3.options.cache) {
        var tpl = _this3.cache[filepath];
        if (tpl) {
          return Promise.resolve(tpl);
        }
        return readFileAsync(filepath).then(function (str) {
          return _this3.parse(str);
        }).then(function (tpl) {
          return _this3.cache[filepath] = tpl;
        });
      } else {
        return readFileAsync(filepath).then(function (str) {
          return _this3.parse(str, filepath);
        });
      }
    });
  },
  getTemplateFromUrl: function getTemplateFromUrl(filepath, root) {
    var _this4 = this;

    var fullUrl;
    if (url.valid(filepath)) {
      fullUrl = filepath;
    } else {
      if (!url.extname(filepath)) {
        filepath += this.options.extname;
      }
      fullUrl = url.resolve(root || this.options.root, filepath);
    }
    if (this.options.cache) {
      var tpl = this.cache[filepath];
      if (tpl) {
        return Promise.resolve(tpl);
      }
    }
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          var tpl = _this4.parse(xhr.responseText);
          if (_this4.options.cache) {
            _this4.cache[filepath] = tpl;
          }
          resolve(tpl);
        } else {
          reject(new Error(xhr.statusText));
        }
      };
      xhr.onerror = function () {
        reject(new Error('An error occurred whilst sending the response.'));
      };
      xhr.open('GET', fullUrl);
      xhr.send();
    });
  },
  express: function express(opts) {
    opts = opts || {};
    var self = this;
    return function (filePath, ctx, callback) {
      assert(Array.isArray(this.root) || _.isString(this.root), 'illegal views root, are you using express.js?');
      opts.root = this.root;
      self.renderFile(filePath, ctx, opts).then(function (html) {
        return callback(null, html);
      }).catch(function (e) {
        return callback(e);
      });
    };
  }
};

function factory(options) {
  options = _.assign({
    root: ['.'],
    cache: false,
    extname: '',
    dynamicPartials: true,
    trim_tag_right: false,
    trim_tag_left: false,
    trim_value_right: false,
    trim_value_left: false,
    greedy: true,
    strict_filters: false,
    strict_variables: false
  }, options);
  options.root = normalizeStringArray(options.root);

  var engine = Object.create(_engine);
  engine.checkValidJSON = function (expression) {
    return checkValidJSON(this, expression);
  };
  engine.init(Tag(), Filter(options), options);
  return engine;
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value;
  if (_.isString(value)) return [value];
  return [];
}

factory.lexical = lexical;
factory.isTruthy = Syntax.isTruthy;
factory.isFalsy = Syntax.isFalsy;
factory.evalExp = Syntax.evalExp;
factory.evalValue = Syntax.evalValue;
factory.Types = {
  ParseError: Errors.ParseError,
  TokenizationEroor: Errors.TokenizationError,
  RenderBreakError: Errors.RenderBreakError,
  AssertionError: Errors.AssertionError
};

factory.Liquid = factory;
factory.Token = tokenizer.Token;
factory.TagToken = tokenizer.TagToken;
factory.TokenKind = {
  HTML: 16,
  Output: 8,
  Tag: 4
};
factory.Tokenizer = function () {
  function Tokenizer(text, options) {
    _classCallCheck(this, Tokenizer);

    this.text = text;
    this.options = options;
  }

  _createClass(Tokenizer, [{
    key: 'readTopLevelTokens',
    value: function readTopLevelTokens() {
      return tokenizer.parse(this.text, '', this.options);
    }
  }]);

  return Tokenizer;
}();

module.exports = factory;

},{"./filters":1,"./src/filter.js":61,"./src/lexical.js":62,"./src/parser":64,"./src/render.js":65,"./src/scope":66,"./src/syntax.js":67,"./src/tag.js":68,"./src/tokenizer.js":69,"./src/util/assert.js":70,"./src/util/error.js":71,"./src/util/fs.js":72,"./src/util/promise.js":73,"./src/util/underscore.js":75,"./src/util/url.js":76,"./tags":90,"any-promise":3,"path":8}],3:[function(require,module,exports){
'use strict';

module.exports = require('./register')().Promise;

},{"./register":5}],4:[function(require,module,exports){
"use strict";
// global key for user preferred registration

var REGISTRATION_KEY = '@@any-promise/REGISTRATION',

// Prior registration (preferred or detected)
registered = null;

/**
 * Registers the given implementation.  An implementation must
 * be registered prior to any call to `require("any-promise")`,
 * typically on application load.
 *
 * If called with no arguments, will return registration in
 * following priority:
 *
 * For Node.js:
 *
 * 1. Previous registration
 * 2. global.Promise if node.js version >= 0.12
 * 3. Auto detected promise based on first sucessful require of
 *    known promise libraries. Note this is a last resort, as the
 *    loaded library is non-deterministic. node.js >= 0.12 will
 *    always use global.Promise over this priority list.
 * 4. Throws error.
 *
 * For Browser:
 *
 * 1. Previous registration
 * 2. window.Promise
 * 3. Throws error.
 *
 * Options:
 *
 * Promise: Desired Promise constructor
 * global: Boolean - Should the registration be cached in a global variable to
 * allow cross dependency/bundle registration?  (default true)
 */
module.exports = function (root, loadImplementation) {
  return function register(implementation, opts) {
    implementation = implementation || null;
    opts = opts || {};
    // global registration unless explicitly  {global: false} in options (default true)
    var registerGlobal = opts.global !== false;

    // load any previous global registration
    if (registered === null && registerGlobal) {
      registered = root[REGISTRATION_KEY] || null;
    }

    if (registered !== null && implementation !== null && registered.implementation !== implementation) {
      // Throw error if attempting to redefine implementation
      throw new Error('any-promise already defined as "' + registered.implementation + '".  You can only register an implementation before the first ' + ' call to require("any-promise") and an implementation cannot be changed');
    }

    if (registered === null) {
      // use provided implementation
      if (implementation !== null && typeof opts.Promise !== 'undefined') {
        registered = {
          Promise: opts.Promise,
          implementation: implementation
        };
      } else {
        // require implementation if implementation is specified but not provided
        registered = loadImplementation(implementation);
      }

      if (registerGlobal) {
        // register preference globally in case multiple installations
        root[REGISTRATION_KEY] = registered;
      }
    }

    return registered;
  };
};

},{}],5:[function(require,module,exports){
"use strict";

module.exports = require('./loader')(window, loadImplementation);

/**
 * Browser specific loadImplementation.  Always uses `window.Promise`
 *
 * To register a custom implementation, must register with `Promise` option.
 */
function loadImplementation() {
  if (typeof window.Promise === 'undefined') {
    throw new Error("any-promise browser requires a polyfill or explicit registration" + " e.g: require('any-promise/register/bluebird')");
  }
  return {
    Promise: window.Promise,
    implementation: 'window.Promise'
  };
}

},{"./loader":4}],6:[function(require,module,exports){
(function (global){(function (){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var objectAssign = require('object.assign/polyfill')();

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = function () {
  return function foo() {}.name === 'foo';
}();
function pToString(obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' + name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' + self.operator + ' ' + truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

    // 7.2. If the expected value is a Date object, the actual value is
    // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

    // 7.3 If the expected value is a RegExp object, the actual value is
    // equivalent if it is also a RegExp object with the same source and
    // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source && actual.global === expected.global && actual.multiline === expected.multiline && actual.lastIndex === expected.lastIndex && actual.ignoreCase === expected.ignoreCase;

    // 7.4. Other pairs that do not both pass typeof value == 'object',
    // equivalence is determined by ==.
  } else if ((actual === null || (typeof actual === 'undefined' ? 'undefined' : _typeof(actual)) !== 'object') && (expected === null || (typeof expected === 'undefined' ? 'undefined' : _typeof(expected)) !== 'object')) {
    return strict ? actual === expected : actual == expected;

    // If both values are instances of typed arrays, wrap their underlying
    // ArrayBuffers in a Buffer each to increase performance
    // This optimization requires the arrays to have the same type as checked by
    // Object.prototype.toString (aka pToString). Never perform binary
    // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
    // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) && pToString(actual) === pToString(expected) && !(actual instanceof Float32Array || actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer), new Uint8Array(expected.buffer)) === 0;

    // 7.5 For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical 'prototype' property. Note: this
    // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || { actual: [], expected: [] };

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined) return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if (aIsArgs && !bIsArgs || !aIsArgs && bIsArgs) return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length) return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i]) return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects)) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') + (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if (isUnwantedException && userProvidedMessage && expectedException(actual, expected) || isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if (shouldThrow && actual && expected && !expectedException(actual, expected) || !shouldThrow && actual) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function (block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function (block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function (err) {
  if (err) throw err;
};

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"object.assign/polyfill":49,"util/":54}],7:[function(require,module,exports){
"use strict";

},{}],8:[function(require,module,exports){
"use strict";

},{}],9:[function(require,module,exports){
'use strict';

var bind = require('function-bind');

var $apply = require('./functionApply');
var $call = require('./functionCall');
var $reflectApply = require('./reflectApply');

/** @type {import('./actualApply')} */
module.exports = $reflectApply || bind.call($call, $apply);

},{"./functionApply":10,"./functionCall":11,"./reflectApply":13,"function-bind":26}],10:[function(require,module,exports){
'use strict';

/** @type {import('./functionApply')} */

module.exports = Function.prototype.apply;

},{}],11:[function(require,module,exports){
'use strict';

/** @type {import('./functionCall')} */

module.exports = Function.prototype.call;

},{}],12:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var $TypeError = require('es-errors/type');

var $call = require('./functionCall');
var $actualApply = require('./actualApply');

/** @type {(args: [Function, thisArg?: unknown, ...args: unknown[]]) => Function} TODO FIXME, find a way to use import('.') */
module.exports = function callBindBasic(args) {
	if (args.length < 1 || typeof args[0] !== 'function') {
		throw new $TypeError('a function is required');
	}
	return $actualApply(bind, $call, args);
};

},{"./actualApply":9,"./functionCall":11,"es-errors/type":22,"function-bind":26}],13:[function(require,module,exports){
'use strict';

/** @type {import('./reflectApply')} */

module.exports = typeof Reflect !== 'undefined' && Reflect && Reflect.apply;

},{}],14:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var callBindBasic = require('call-bind-apply-helpers');

/** @type {(thisArg: string, searchString: string, position?: number) => number} */
var $indexOf = callBindBasic([GetIntrinsic('%String.prototype.indexOf%')]);

/** @type {import('.')} */
module.exports = function callBoundIntrinsic(name, allowMissing) {
	/* eslint no-extra-parens: 0 */

	var intrinsic = /** @type {(this: unknown, ...args: unknown[]) => unknown} */GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBindBasic( /** @type {const} */[intrinsic]);
	}
	return intrinsic;
};

},{"call-bind-apply-helpers":12,"get-intrinsic":27}],15:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var callBind = require('call-bind-apply-helpers');
var gOPD = require('gopd');

var hasProtoAccessor;
try {
	// eslint-disable-next-line no-extra-parens, no-proto
	hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */[].__proto__ === Array.prototype;
} catch (e) {
	if (!e || (typeof e === 'undefined' ? 'undefined' : _typeof(e)) !== 'object' || !('code' in e) || e.code !== 'ERR_PROTO_ACCESS') {
		throw e;
	}
}

// eslint-disable-next-line no-extra-parens
var desc = !!hasProtoAccessor && gOPD && gOPD(Object.prototype, /** @type {keyof typeof Object.prototype} */'__proto__');

var $Object = Object;
var $getPrototypeOf = $Object.getPrototypeOf;

/** @type {import('./get')} */
module.exports = desc && typeof desc.get === 'function' ? callBind([desc.get]) : typeof $getPrototypeOf === 'function' ? /** @type {import('./get')} */function getDunder(value) {
	// eslint-disable-next-line eqeqeq
	return $getPrototypeOf(value == null ? value : $Object(value));
} : false;

},{"call-bind-apply-helpers":12,"gopd":32}],16:[function(require,module,exports){
'use strict';

/** @type {import('.')} */

var $defineProperty = Object.defineProperty || false;
if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = false;
	}
}

module.exports = $defineProperty;

},{}],17:[function(require,module,exports){
'use strict';

/** @type {import('./eval')} */

module.exports = EvalError;

},{}],18:[function(require,module,exports){
'use strict';

/** @type {import('.')} */

module.exports = Error;

},{}],19:[function(require,module,exports){
'use strict';

/** @type {import('./range')} */

module.exports = RangeError;

},{}],20:[function(require,module,exports){
'use strict';

/** @type {import('./ref')} */

module.exports = ReferenceError;

},{}],21:[function(require,module,exports){
'use strict';

/** @type {import('./syntax')} */

module.exports = SyntaxError;

},{}],22:[function(require,module,exports){
'use strict';

/** @type {import('./type')} */

module.exports = TypeError;

},{}],23:[function(require,module,exports){
'use strict';

/** @type {import('./uri')} */

module.exports = URIError;

},{}],24:[function(require,module,exports){
'use strict';

/** @type {import('.')} */

module.exports = Object;

},{}],25:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var toStr = Object.prototype.toString;
var max = Math.max;
var funcType = '[object Function]';

var concatty = function concatty(a, b) {
    var arr = [];

    for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
    }
    for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
    }

    return arr;
};

var slicy = function slicy(arrLike, offset) {
    var arr = [];
    for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
    }
    return arr;
};

var joiny = function joiny(arr, joiner) {
    var str = '';
    for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
            str += joiner;
        }
    }
    return str;
};

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);

    var bound;
    var binder = function binder() {
        if (this instanceof bound) {
            var result = target.apply(this, concatty(args, arguments));
            if (Object(result) === result) {
                return result;
            }
            return this;
        }
        return target.apply(that, concatty(args, arguments));
    };

    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = '$' + i;
    }

    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],26:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":25}],27:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var undefined;

var $Object = require('es-object-atoms');

var $Error = require('es-errors');
var $EvalError = require('es-errors/eval');
var $RangeError = require('es-errors/range');
var $ReferenceError = require('es-errors/ref');
var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $URIError = require('es-errors/uri');

var abs = require('math-intrinsics/abs');
var floor = require('math-intrinsics/floor');
var max = require('math-intrinsics/max');
var min = require('math-intrinsics/min');
var pow = require('math-intrinsics/pow');
var round = require('math-intrinsics/round');
var sign = require('math-intrinsics/sign');

var $Function = Function;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function getEvalledConstructor(expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = require('gopd');
var $defineProperty = require('es-define-property');

var throwTypeError = function throwTypeError() {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD ? function () {
	try {
		// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
		arguments.callee; // IE 8 does not throw here
		return throwTypeError;
	} catch (calleeThrows) {
		try {
			// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
			return $gOPD(arguments, 'callee').get;
		} catch (gOPDthrows) {
			return throwTypeError;
		}
	}
}() : throwTypeError;

var hasSymbols = require('has-symbols')();

var getProto = require('get-proto');
var $ObjectGPO = require('get-proto/Object.getPrototypeOf');
var $ReflectGPO = require('get-proto/Reflect.getPrototypeOf');

var $apply = require('call-bind-apply-helpers/functionApply');
var $call = require('call-bind-apply-helpers/functionCall');

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	__proto__: null,
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
	'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': $Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': $EvalError,
	'%Float16Array%': typeof Float16Array === 'undefined' ? undefined : Float16Array,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': (typeof JSON === 'undefined' ? 'undefined' : _typeof(JSON)) === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': $Object,
	'%Object.getOwnPropertyDescriptor%': $gOPD,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': $RangeError,
	'%ReferenceError%': $ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': $URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet,

	'%Function.prototype.call%': $call,
	'%Function.prototype.apply%': $apply,
	'%Object.defineProperty%': $defineProperty,
	'%Object.getPrototypeOf%': $ObjectGPO,
	'%Math.abs%': abs,
	'%Math.floor%': floor,
	'%Math.max%': max,
	'%Math.min%': min,
	'%Math.pow%': pow,
	'%Math.round%': round,
	'%Math.sign%': sign,
	'%Reflect.getPrototypeOf%': $ReflectGPO
};

if (getProto) {
	try {
		null.error; // eslint-disable-line no-unused-expressions
	} catch (e) {
		// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
		var errorProto = getProto(getProto(e));
		INTRINSICS['%Error.prototype%'] = errorProto;
	}
}

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen && getProto) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	__proto__: null,
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = require('function-bind');
var hasOwn = require('hasown');
var $concat = bind.call($call, Array.prototype.concat);
var $spliceApply = bind.call($apply, Array.prototype.splice);
var $replace = bind.call($call, String.prototype.replace);
var $strSlice = bind.call($call, String.prototype.slice);
var $exec = bind.call($call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if ((first === '"' || first === "'" || first === '`' || last === '"' || last === "'" || last === '`') && first !== last) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && i + 1 >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

},{"call-bind-apply-helpers/functionApply":10,"call-bind-apply-helpers/functionCall":11,"es-define-property":16,"es-errors":18,"es-errors/eval":17,"es-errors/range":19,"es-errors/ref":20,"es-errors/syntax":21,"es-errors/type":22,"es-errors/uri":23,"es-object-atoms":24,"function-bind":26,"get-proto":30,"get-proto/Object.getPrototypeOf":28,"get-proto/Reflect.getPrototypeOf":29,"gopd":32,"has-symbols":33,"hasown":35,"math-intrinsics/abs":36,"math-intrinsics/floor":37,"math-intrinsics/max":39,"math-intrinsics/min":40,"math-intrinsics/pow":41,"math-intrinsics/round":42,"math-intrinsics/sign":43}],28:[function(require,module,exports){
'use strict';

var $Object = require('es-object-atoms');

/** @type {import('./Object.getPrototypeOf')} */
module.exports = $Object.getPrototypeOf || null;

},{"es-object-atoms":24}],29:[function(require,module,exports){
'use strict';

/** @type {import('./Reflect.getPrototypeOf')} */

module.exports = typeof Reflect !== 'undefined' && Reflect.getPrototypeOf || null;

},{}],30:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var reflectGetProto = require('./Reflect.getPrototypeOf');
var originalGetProto = require('./Object.getPrototypeOf');

var getDunderProto = require('dunder-proto/get');

/** @type {import('.')} */
module.exports = reflectGetProto ? function getProto(O) {
	// @ts-expect-error TS can't narrow inside a closure, for some reason
	return reflectGetProto(O);
} : originalGetProto ? function getProto(O) {
	if (!O || (typeof O === 'undefined' ? 'undefined' : _typeof(O)) !== 'object' && typeof O !== 'function') {
		throw new TypeError('getProto: not an object');
	}
	// @ts-expect-error TS can't narrow inside a closure, for some reason
	return originalGetProto(O);
} : getDunderProto ? function getProto(O) {
	// @ts-expect-error TS can't narrow inside a closure, for some reason
	return getDunderProto(O);
} : null;

},{"./Object.getPrototypeOf":28,"./Reflect.getPrototypeOf":29,"dunder-proto/get":15}],31:[function(require,module,exports){
'use strict';

/** @type {import('./gOPD')} */

module.exports = Object.getOwnPropertyDescriptor;

},{}],32:[function(require,module,exports){
'use strict';

/** @type {import('.')} */

var $gOPD = require('./gOPD');

if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

module.exports = $gOPD;

},{"./gOPD":31}],33:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = require('./shams');

/** @type {import('.')} */
module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') {
		return false;
	}
	if (typeof Symbol !== 'function') {
		return false;
	}
	if (_typeof(origSymbol('foo')) !== 'symbol') {
		return false;
	}
	if (_typeof(Symbol('bar')) !== 'symbol') {
		return false;
	}

	return hasSymbolSham();
};

},{"./shams":34}],34:[function(require,module,exports){
'use strict';

/** @type {import('./shams')} */
/* eslint complexity: [2, 18], max-statements: [2, 33] */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') {
		return false;
	}
	if (_typeof(Symbol.iterator) === 'symbol') {
		return true;
	}

	/** @type {{ [k in symbol]?: unknown }} */
	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') {
		return false;
	}

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') {
		return false;
	}
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') {
		return false;
	}

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (var _ in obj) {
		return false;
	} // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) {
		return false;
	}

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) {
		return false;
	}

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) {
		return false;
	}

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
		return false;
	}

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		// eslint-disable-next-line no-extra-parens
		var descriptor = /** @type {PropertyDescriptor} */Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) {
			return false;
		}
	}

	return true;
};

},{}],35:[function(require,module,exports){
'use strict';

var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind = require('function-bind');

/** @type {import('.')} */
module.exports = bind.call(call, $hasOwn);

},{"function-bind":26}],36:[function(require,module,exports){
'use strict';

/** @type {import('./abs')} */

module.exports = Math.abs;

},{}],37:[function(require,module,exports){
'use strict';

/** @type {import('./floor')} */

module.exports = Math.floor;

},{}],38:[function(require,module,exports){
'use strict';

/** @type {import('./isNaN')} */

module.exports = Number.isNaN || function isNaN(a) {
	return a !== a;
};

},{}],39:[function(require,module,exports){
'use strict';

/** @type {import('./max')} */

module.exports = Math.max;

},{}],40:[function(require,module,exports){
'use strict';

/** @type {import('./min')} */

module.exports = Math.min;

},{}],41:[function(require,module,exports){
'use strict';

/** @type {import('./pow')} */

module.exports = Math.pow;

},{}],42:[function(require,module,exports){
'use strict';

/** @type {import('./round')} */

module.exports = Math.round;

},{}],43:[function(require,module,exports){
'use strict';

var $isNaN = require('./isNaN');

/** @type {import('./sign')} */
module.exports = function sign(number) {
	if ($isNaN(number) || number === 0) {
		return number;
	}
	return number < 0 ? -1 : +1;
};

},{"./isNaN":38}],44:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//! moment.js
//! version : 2.30.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.moment = factory();
})(undefined, function () {
    'use strict';

    var hookCallback;

    function hooks() {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback(callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return Object.getOwnPropertyNames(obj).length === 0;
        } else {
            var k;
            for (k in obj) {
                if (hasOwnProp(obj, k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [],
            i,
            arrLen = arr.length;
        for (i = 0; i < arrLen; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidEra: null,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false,
            parsedDateParts: [],
            era: null,
            meridiem: null,
            rfc2822: false,
            weekdayMismatch: false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function some(fun) {
            var t = Object(this),
                len = t.length >>> 0,
                i;

            for (i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        var flags = null,
            parsedParts = false,
            isNowValid = m._d && !isNaN(m._d.getTime());
        if (isNowValid) {
            flags = getParsingFlags(m);
            parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            isNowValid = flags.overflow < 0 && !flags.empty && !flags.invalidEra && !flags.invalidMonth && !flags.invalidWeekday && !flags.weekdayMismatch && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated && (!flags.meridiem || flags.meridiem && parsedParts);
            if (m._strict) {
                isNowValid = isNowValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === undefined;
            }
        }
        if (Object.isFrozen == null || !Object.isFrozen(m)) {
            m._isValid = isNowValid;
        } else {
            return isNowValid;
        }
        return m._isValid;
    }

    function createInvalid(flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        } else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = hooks.momentProperties = [],
        updateInProgress = false;

    function copyConfig(to, from) {
        var i,
            prop,
            val,
            momentPropertiesLen = momentProperties.length;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentPropertiesLen > 0) {
            for (i = 0; i < momentPropertiesLen; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment(obj) {
        return obj instanceof Moment || obj != null && obj._isAMomentObject != null;
    }

    function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [],
                    arg,
                    i,
                    key,
                    argLen = arguments.length;
                for (i = 0; i < argLen; i++) {
                    arg = '';
                    if (_typeof(arguments[i]) === 'object') {
                        arg += '\n[' + i + '] ';
                        for (key in arguments[0]) {
                            if (hasOwnProp(arguments[0], key)) {
                                arg += key + ': ' + arguments[0][key] + ', ';
                            }
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + new Error().stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return typeof Function !== 'undefined' && input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set(config) {
        var prop, i;
        for (i in config) {
            if (hasOwnProp(config, i)) {
                prop = config[i];
                if (isFunction(prop)) {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + '|' + /\d{1,2}/.source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig),
            prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) && !hasOwnProp(childConfig, prop) && isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function keys(obj) {
            var i,
                res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay: '[Today at] LT',
        nextDay: '[Tomorrow at] LT',
        nextWeek: 'dddd [at] LT',
        lastDay: '[Yesterday at] LT',
        lastWeek: '[Last] dddd [at] LT',
        sameElse: 'L'
    };

    function calendar(key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? forceSign ? '+' : '' : '-') + Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
        formatFunctions = {},
        formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken(token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function func() {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens),
            i,
            length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '',
                i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var defaultLongDateFormat = {
        LTS: 'h:mm:ss A',
        LT: 'h:mm A',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D, YYYY',
        LLL: 'MMMM D, YYYY h:mm A',
        LLLL: 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat(key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.match(formattingTokens).map(function (tok) {
            if (tok === 'MMMM' || tok === 'MM' || tok === 'DD' || tok === 'dddd') {
                return tok.slice(1);
            }
            return tok;
        }).join('');

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate() {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d',
        defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal(number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        ss: '%d seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        w: 'a week',
        ww: '%d weeks',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
    };

    function relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return isFunction(output) ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    }

    function pastFuture(diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {
        D: 'date',
        dates: 'date',
        date: 'date',
        d: 'day',
        days: 'day',
        day: 'day',
        e: 'weekday',
        weekdays: 'weekday',
        weekday: 'weekday',
        E: 'isoWeekday',
        isoweekdays: 'isoWeekday',
        isoweekday: 'isoWeekday',
        DDD: 'dayOfYear',
        dayofyears: 'dayOfYear',
        dayofyear: 'dayOfYear',
        h: 'hour',
        hours: 'hour',
        hour: 'hour',
        ms: 'millisecond',
        milliseconds: 'millisecond',
        millisecond: 'millisecond',
        m: 'minute',
        minutes: 'minute',
        minute: 'minute',
        M: 'month',
        months: 'month',
        month: 'month',
        Q: 'quarter',
        quarters: 'quarter',
        quarter: 'quarter',
        s: 'second',
        seconds: 'second',
        second: 'second',
        gg: 'weekYear',
        weekyears: 'weekYear',
        weekyear: 'weekYear',
        GG: 'isoWeekYear',
        isoweekyears: 'isoWeekYear',
        isoweekyear: 'isoWeekYear',
        w: 'week',
        weeks: 'week',
        week: 'week',
        W: 'isoWeek',
        isoweeks: 'isoWeek',
        isoweek: 'isoWeek',
        y: 'year',
        years: 'year',
        year: 'year'
    };

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {
        date: 9,
        day: 11,
        weekday: 11,
        isoWeekday: 11,
        dayOfYear: 4,
        hour: 13,
        millisecond: 16,
        minute: 14,
        month: 8,
        quarter: 7,
        second: 15,
        weekYear: 1,
        isoWeekYear: 1,
        week: 5,
        isoWeek: 5,
        year: 1
    };

    function getPrioritizedUnits(unitsObj) {
        var units = [],
            u;
        for (u in unitsObj) {
            if (hasOwnProp(unitsObj, u)) {
                units.push({ unit: u, priority: priorities[u] });
            }
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    var match1 = /\d/,
        //       0 - 9
    match2 = /\d\d/,
        //      00 - 99
    match3 = /\d{3}/,
        //     000 - 999
    match4 = /\d{4}/,
        //    0000 - 9999
    match6 = /[+-]?\d{6}/,
        // -999999 - 999999
    match1to2 = /\d\d?/,
        //       0 - 99
    match3to4 = /\d\d\d\d?/,
        //     999 - 9999
    match5to6 = /\d\d\d\d\d\d?/,
        //   99999 - 999999
    match1to3 = /\d{1,3}/,
        //       0 - 999
    match1to4 = /\d{1,4}/,
        //       0 - 9999
    match1to6 = /[+-]?\d{1,6}/,
        // -999999 - 999999
    matchUnsigned = /\d+/,
        //       0 - inf
    matchSigned = /[+-]?\d+/,
        //    -inf - inf
    matchOffset = /Z|[+-]\d\d:?\d\d/gi,
        // +00:00 -00:00 +0000 -0000 or Z
    matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi,
        // +00 -00 +00:00 -00:00 +0000 -0000 or Z
    matchTimestamp = /[+-]?\d+(\.\d{1,3})?/,
        // 123456789 123456789.123
    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
        match1to2NoLeadingZero = /^[1-9]\d?/,
        //         1-99
    match1to2HasZero = /^([1-9]\d|\d)/,
        //           0-99
    regexes;

    regexes = {};

    function addRegexToken(token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return isStrict && strictRegex ? strictRegex : regex;
        };
    }

    function getParseRegexForToken(token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    function absFloor(number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    var tokens = {};

    function addParseToken(token, callback) {
        var i,
            func = callback,
            tokenLen;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function func(input, array) {
                array[callback] = toInt(input);
            };
        }
        tokenLen = token.length;
        for (i = 0; i < tokenLen; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken(token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    function isLeapYear(year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    }

    var YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,
        WEEK = 7,
        WEEKDAY = 8;

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? zeroFill(y, 4) : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY', 4], 0, 'year');
    addFormatToken(0, ['YYYYY', 5], 0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // PARSING

    addRegexToken('Y', matchSigned);
    addRegexToken('YY', match1to2, match2);
    addRegexToken('YYYY', match1to4, match4);
    addRegexToken('YYYYY', match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear() {
        return isLeapYear(this.year());
    }

    function makeGetSet(unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get(mom, unit) {
        if (!mom.isValid()) {
            return NaN;
        }

        var d = mom._d,
            isUTC = mom._isUTC;

        switch (unit) {
            case 'Milliseconds':
                return isUTC ? d.getUTCMilliseconds() : d.getMilliseconds();
            case 'Seconds':
                return isUTC ? d.getUTCSeconds() : d.getSeconds();
            case 'Minutes':
                return isUTC ? d.getUTCMinutes() : d.getMinutes();
            case 'Hours':
                return isUTC ? d.getUTCHours() : d.getHours();
            case 'Date':
                return isUTC ? d.getUTCDate() : d.getDate();
            case 'Day':
                return isUTC ? d.getUTCDay() : d.getDay();
            case 'Month':
                return isUTC ? d.getUTCMonth() : d.getMonth();
            case 'FullYear':
                return isUTC ? d.getUTCFullYear() : d.getFullYear();
            default:
                return NaN; // Just in case
        }
    }

    function set$1(mom, unit, value) {
        var d, isUTC, year, month, date;

        if (!mom.isValid() || isNaN(value)) {
            return;
        }

        d = mom._d;
        isUTC = mom._isUTC;

        switch (unit) {
            case 'Milliseconds':
                return void (isUTC ? d.setUTCMilliseconds(value) : d.setMilliseconds(value));
            case 'Seconds':
                return void (isUTC ? d.setUTCSeconds(value) : d.setSeconds(value));
            case 'Minutes':
                return void (isUTC ? d.setUTCMinutes(value) : d.setMinutes(value));
            case 'Hours':
                return void (isUTC ? d.setUTCHours(value) : d.setHours(value));
            case 'Date':
                return void (isUTC ? d.setUTCDate(value) : d.setDate(value));
            // case 'Day': // Not real
            //    return void (isUTC ? d.setUTCDay(value) : d.setDay(value));
            // case 'Month': // Not used because we need to pass two variables
            //     return void (isUTC ? d.setUTCMonth(value) : d.setMonth(value));
            case 'FullYear':
                break; // See below ...
            default:
                return; // Just in case
        }

        year = value;
        month = mom.month();
        date = mom.date();
        date = date === 29 && month === 1 && !isLeapYear(year) ? 28 : date;
        void (isUTC ? d.setUTCFullYear(year, month, date) : d.setFullYear(year, month, date));
    }

    // MOMENTS

    function stringGet(units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }

    function stringSet(units, value) {
        if ((typeof units === 'undefined' ? 'undefined' : _typeof(units)) === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units),
                i,
                prioritizedLen = prioritized.length;
            for (i = 0; i < prioritizedLen; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function mod(n, x) {
        return (n % x + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function indexOf(o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1 ? isLeapYear(year) ? 29 : 28 : 31 - modMonth % 7 % 2;
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // PARSING

    addRegexToken('M', match1to2, match1to2NoLeadingZero);
    addRegexToken('MM', match1to2, match2);
    addRegexToken('MMM', function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
        defaultMonthsShortRegex = matchWord,
        defaultMonthsRegex = matchWord;

    function localeMonths(m, format) {
        if (!m) {
            return isArray(this._months) ? this._months : this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] : this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    function localeMonthsShort(m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort : this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] : this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i,
            ii,
            mom,
            llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse(monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth(mom, value) {
        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        var month = value,
            date = mom.date();

        date = date < 29 ? date : Math.min(date, daysInMonth(mom.year(), month));
        void (mom._isUTC ? mom._d.setUTCMonth(month, date) : mom._d.setMonth(month, date));
        return mom;
    }

    function getSetMonth(value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
    }

    function monthsShortRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    function monthsRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ? this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i,
            mom,
            shortP,
            longP;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortP = regexEscape(this.monthsShort(mom, ''));
            longP = regexEscape(this.months(mom, ''));
            shortPieces.push(shortP);
            longPieces.push(longP);
            mixedPieces.push(longP);
            mixedPieces.push(shortP);
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    function createDate(y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date;
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            date = new Date(y + 400, m, d, h, M, s, ms);
            if (isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
        } else {
            date = new Date(y, m, d, h, M, s, ms);
        }

        return date;
    }

    function createUTCDate(y) {
        var date, args;
        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            args = Array.prototype.slice.call(arguments);
            // preserve leap years using a full 400 year cycle, then reset
            args[0] = y + 400;
            date = new Date(Date.UTC.apply(null, args));
            if (isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
        } else {
            date = new Date(Date.UTC.apply(null, arguments));
        }

        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
        fwd = 7 + dow - doy,

        // first-week day local weekday -- which local weekday is fwd
        fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear,
            resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek,
            resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // PARSING

    addRegexToken('w', match1to2, match1to2NoLeadingZero);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W', match1to2, match1to2NoLeadingZero);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow: 0, // Sunday is the first day of the week.
        doy: 6 // The week that contains Jan 6th is the first week of the year.
    };

    function localeFirstDayOfWeek() {
        return this._week.dow;
    }

    function localeFirstDayOfYear() {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek(input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // PARSING

    addRegexToken('d', match1to2);
    addRegexToken('e', match1to2);
    addRegexToken('E', match1to2);
    addRegexToken('dd', function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd', function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd', function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES
    function shiftWeekdays(ws, n) {
        return ws.slice(n, 7).concat(ws.slice(0, n));
    }

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        defaultWeekdaysRegex = matchWord,
        defaultWeekdaysShortRegex = matchWord,
        defaultWeekdaysMinRegex = matchWord;

    function localeWeekdays(m, format) {
        var weekdays = isArray(this._weekdays) ? this._weekdays : this._weekdays[m && m !== true && this._weekdays.isFormat.test(format) ? 'format' : 'standalone'];
        return m === true ? shiftWeekdays(weekdays, this._week.dow) : m ? weekdays[m.day()] : weekdays;
    }

    function localeWeekdaysShort(m) {
        return m === true ? shiftWeekdays(this._weekdaysShort, this._week.dow) : m ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    function localeWeekdaysMin(m) {
        return m === true ? shiftWeekdays(this._weekdaysMin, this._week.dow) : m ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i,
            ii,
            mom,
            llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse(weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        var day = get(this, 'Day');
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    function weekdaysRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ? this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    function weekdaysShortRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    function weekdaysMinRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }

    function computeWeekdaysParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [],
            shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i,
            mom,
            minp,
            shortp,
            longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = regexEscape(this.weekdaysMin(mom, ''));
            shortp = regexEscape(this.weekdaysShort(mom, ''));
            longp = regexEscape(this.weekdays(mom, ''));
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
    });

    function meridiem(token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // PARSING

    function matchMeridiem(isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a', matchMeridiem);
    addRegexToken('A', matchMeridiem);
    addRegexToken('H', match1to2, match1to2HasZero);
    addRegexToken('h', match1to2, match1to2NoLeadingZero);
    addRegexToken('k', match1to2, match1to2NoLeadingZero);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4,
            pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4,
            pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM(input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return (input + '').toLowerCase().charAt(0) === 'p';
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i,

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour they want. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    getSetHour = makeGetSet('Hours', true);

    function localeMeridiem(hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {},
        localeFamilies = {},
        globalLocale;

    function commonPrefix(arr1, arr2) {
        var i,
            minl = Math.min(arr1.length, arr2.length);
        for (i = 0; i < minl; i += 1) {
            if (arr1[i] !== arr2[i]) {
                return i;
            }
        }
        return minl;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0,
            j,
            next,
            locale,
            split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && commonPrefix(split, next) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function isLocaleNameSane(name) {
        // Prevent names that look like filesystem paths, i.e contain '/' or '\'
        // Ensure name is available and function returns boolean
        return !!(name && name.match('^[^/\\\\]*$'));
    }

    function loadLocale(name) {
        var oldLocale = null,
            aliasedRequire;
        // TODO: Find a better way to register and load all the locales in Node
        if (locales[name] === undefined && typeof module !== 'undefined' && module && module.exports && isLocaleNameSane(name)) {
            try {
                oldLocale = globalLocale._abbr;
                aliasedRequire = require;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {
                // mark as not found to avoid repeating expensive file require call causing high CPU
                // when trying to find en-US, en_US, en-us for every format call
                locales[name] = null; // null means not found
            }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale(key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            } else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            } else {
                if (typeof console !== 'undefined' && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn('Locale ' + key + ' not found. Did you forget to load it?');
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale(name, config) {
        if (config !== null) {
            var locale,
                parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride', 'use moment.updateLocale(localeName, config) to change ' + 'an existing locale. moment.defineLocale(localeName, ' + 'config) should only be used for creating a new locale ' + 'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale,
                tmpLocale,
                parentConfig = baseConfig;

            if (locales[name] != null && locales[name].parentLocale != null) {
                // Update existing child locale in-place to avoid memory-leaks
                locales[name].set(mergeConfigs(locales[name]._config, config));
            } else {
                // MERGE
                tmpLocale = loadLocale(name);
                if (tmpLocale != null) {
                    parentConfig = tmpLocale._config;
                }
                config = mergeConfigs(parentConfig, config);
                if (tmpLocale == null) {
                    // updateLocale is called for creating a new locale
                    // Set abbr so it will have a name (getters return
                    // undefined otherwise).
                    config.abbr = name;
                }
                locale = new Locale(config);
                locale.parentLocale = locales[name];
                locales[name] = locale;
            }

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                    if (name === getSetGlobalLocale()) {
                        getSetGlobalLocale(name);
                    }
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale(key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow(m) {
        var overflow,
            a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow = a[MONTH] < 0 || a[MONTH] > 11 ? MONTH : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE : a[HOUR] < 0 || a[HOUR] > 24 || a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0) ? HOUR : a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE : a[SECOND] < 0 || a[SECOND] > 59 ? SECOND : a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND : -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        tzRegex = /Z|[+-]\d\d(?::?\d\d)?/,
        isoDates = [['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/], ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/], ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/], ['GGGG-[W]WW', /\d{4}-W\d\d/, false], ['YYYY-DDD', /\d{4}-\d{3}/], ['YYYY-MM', /\d{4}-\d\d/, false], ['YYYYYYMMDD', /[+-]\d{10}/], ['YYYYMMDD', /\d{8}/], ['GGGG[W]WWE', /\d{4}W\d{3}/], ['GGGG[W]WW', /\d{4}W\d{2}/, false], ['YYYYDDD', /\d{7}/], ['YYYYMM', /\d{6}/, false], ['YYYY', /\d{4}/, false]],

    // iso time formats and regexes
    isoTimes = [['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/], ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/], ['HH:mm:ss', /\d\d:\d\d:\d\d/], ['HH:mm', /\d\d:\d\d/], ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/], ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/], ['HHmmss', /\d\d\d\d\d\d/], ['HHmm', /\d\d\d\d/], ['HH', /\d\d/]],
        aspNetJsonRegex = /^\/?Date\((-?\d+)/i,

    // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
    rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
        obsOffsets = {
        UT: 0,
        GMT: 0,
        EDT: -4 * 60,
        EST: -5 * 60,
        CDT: -5 * 60,
        CST: -6 * 60,
        MDT: -6 * 60,
        MST: -7 * 60,
        PDT: -7 * 60,
        PST: -8 * 60
    };

    // date from iso format
    function configFromISO(config) {
        var i,
            l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime,
            dateFormat,
            timeFormat,
            tzFormat,
            isoDatesLen = isoDates.length,
            isoTimesLen = isoTimes.length;

        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDatesLen; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimesLen; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
        var result = [untruncateYear(yearStr), defaultLocaleMonthsShort.indexOf(monthStr), parseInt(dayStr, 10), parseInt(hourStr, 10), parseInt(minuteStr, 10)];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s.replace(/\([^()]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an independent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10),
                m = hm % 100,
                h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i)),
            parsedArray;
        if (match) {
            parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from 1) ASP.NET, 2) ISO, 3) RFC 2822 formats, or 4) optional fallback if parsing isn't strict
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);
        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        if (config._strict) {
            config._isValid = false;
        } else {
            // Final attempt, use Input Fallback
            hooks.createFromInputFallback(config);
        }
    }

    hooks.createFromInputFallback = deprecate('value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' + 'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' + 'discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.', function (config) {
        config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
    });

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray(config) {
        var i,
            date,
            input = [],
            currentDate,
            expectedWeekday,
            yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from beginning of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to beginning of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i,
            parsedInput,
            tokens,
            token,
            skipped,
            stringLength = string.length,
            totalParsedInputLength = 0,
            era,
            tokenLen;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
        tokenLen = tokens.length;
        for (i = 0; i < tokenLen; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                } else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            } else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 && getParsingFlags(config).bigHour === true && config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        // handle era
        era = getParsingFlags(config).era;
        if (era !== null) {
            config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
        }

        configFromArray(config);
        checkOverflow(config);
    }

    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,
            scoreToBeat,
            i,
            currentScore,
            validFormatFound,
            bestFormatIsValid = false,
            configfLen = config._f.length;

        if (configfLen === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < configfLen; i++) {
            currentScore = 0;
            validFormatFound = false;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (isValid(tempConfig)) {
                validFormatFound = true;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (!bestFormatIsValid) {
                if (scoreToBeat == null || currentScore < scoreToBeat || validFormatFound) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                    if (validFormatFound) {
                        bestFormatIsValid = true;
                    }
                }
            } else {
                if (currentScore < scoreToBeat) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                }
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i),
            dayOrDate = i.day === undefined ? i.date : i.day;
        config._a = map([i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig(config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || format === undefined && input === '') {
            return createInvalid({ nullInput: true });
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};

        if (format === true || format === false) {
            strict = format;
            format = undefined;
        }

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if (isObject(input) && isObjectEmpty(input) || isArray(input) && input.length === 0) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate('moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/', function () {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other < this ? this : other;
        } else {
            return createInvalid();
        }
    }),
        prototypeMax = deprecate('moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/', function () {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other > this ? this : other;
        } else {
            return createInvalid();
        }
    });

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function now() {
        return Date.now ? Date.now() : +new Date();
    };

    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

    function isDurationValid(m) {
        var key,
            unitHasDecimal = false,
            i,
            orderLen = ordering.length;
        for (key in m) {
            if (hasOwnProp(m, key) && !(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                return false;
            }
        }

        for (i = 0; i < orderLen; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds = +milliseconds + seconds * 1e3 + // 1000
        minutes * 6e4 + // 1000 * 60
        hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days + weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months + quarters * 3 + years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration(obj) {
        return obj instanceof Duration;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    // FORMATTING

    function offset(token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset(),
                sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~offset % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z', matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher),
            chunk,
            parts,
            minutes;

        if (matches === null) {
            return null;
        }

        chunk = matches[matches.length - 1] || [];
        parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset(m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset());
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset(input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone(input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset() {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            } else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset(input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime() {
        return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
    }

    function isDaylightSavingTimeShifted() {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {},
            other;

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() && compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal() {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset() {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc() {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration(input, key) {
        var duration = input,

        // matching against regexp is expensive, do it on demand
        match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (isNumber(input) || !isNaN(+input)) {
            duration = {};
            if (key) {
                duration[key] = +input;
            } else {
                duration.milliseconds = +input;
            }
        } else if (match = aspNetRegex.exec(input)) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (match = isoRegex.exec(input)) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: parseIso(match[2], sign),
                M: parseIso(match[3], sign),
                w: parseIso(match[4], sign),
                d: parseIso(match[5], sign),
                h: parseIso(match[6], sign),
                m: parseIso(match[7], sign),
                s: parseIso(match[8], sign)
            };
        } else if (duration == null) {
            // checks for null or undefined
            duration = {};
        } else if ((typeof duration === 'undefined' ? 'undefined' : _typeof(duration)) === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        if (isDuration(input) && hasOwnProp(input, '_isValid')) {
            ret._isValid = input._isValid;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso(inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {};

        res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +base.clone().add(res.months, 'M');

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return { milliseconds: 0, months: 0 };
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' + 'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val;
                val = period;
                period = tmp;
            }

            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add = createAdder(1, 'add'),
        subtract = createAdder(-1, 'subtract');

    function isString(input) {
        return typeof input === 'string' || input instanceof String;
    }

    // type MomentInput = Moment | Date | string | number | (number | string)[] | MomentInputObject | void; // null | undefined
    function isMomentInput(input) {
        return isMoment(input) || isDate(input) || isString(input) || isNumber(input) || isNumberOrStringArray(input) || isMomentInputObject(input) || input === null || input === undefined;
    }

    function isMomentInputObject(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input),
            propertyTest = false,
            properties = ['years', 'year', 'y', 'months', 'month', 'M', 'days', 'day', 'd', 'dates', 'date', 'D', 'hours', 'hour', 'h', 'minutes', 'minute', 'm', 'seconds', 'second', 's', 'milliseconds', 'millisecond', 'ms'],
            i,
            property,
            propertyLen = properties.length;

        for (i = 0; i < propertyLen; i += 1) {
            property = properties[i];
            propertyTest = propertyTest || hasOwnProp(input, property);
        }

        return objectTest && propertyTest;
    }

    function isNumberOrStringArray(input) {
        var arrayTest = isArray(input),
            dataTypeTest = false;
        if (arrayTest) {
            dataTypeTest = input.filter(function (item) {
                return !isNumber(item) && isString(input);
            }).length === 0;
        }
        return arrayTest && dataTypeTest;
    }

    function isCalendarSpec(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input),
            propertyTest = false,
            properties = ['sameDay', 'nextDay', 'lastDay', 'nextWeek', 'lastWeek', 'sameElse'],
            i,
            property;

        for (i = 0; i < properties.length; i += 1) {
            property = properties[i];
            propertyTest = propertyTest || hasOwnProp(input, property);
        }

        return objectTest && propertyTest;
    }

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function calendar$1(time, formats) {
        // Support for single parameter, formats only overload to the calendar function
        if (arguments.length === 1) {
            if (!arguments[0]) {
                time = undefined;
                formats = undefined;
            } else if (isMomentInput(arguments[0])) {
                time = arguments[0];
                formats = undefined;
            } else if (isCalendarSpec(arguments[0])) {
                formats = arguments[0];
                time = undefined;
            }
        }
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse',
            output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    function clone() {
        return new Moment(this);
    }

    function isAfter(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween(from, to, units, inclusivity) {
        var localFrom = isMoment(from) ? from : createLocal(from),
            localTo = isMoment(to) ? to : createLocal(to);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
            return false;
        }
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(localFrom, units) : !this.isBefore(localFrom, units)) && (inclusivity[1] === ')' ? this.isBefore(localTo, units) : !this.isAfter(localTo, units));
    }

    function isSame(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter(input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore(input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff(input, units, asFloat) {
        var that, zoneDelta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year':
                output = monthDiff(this, that) / 12;
                break;
            case 'month':
                output = monthDiff(this, that);
                break;
            case 'quarter':
                output = monthDiff(this, that) / 3;
                break;
            case 'second':
                output = (this - that) / 1e3;
                break; // 1000
            case 'minute':
                output = (this - that) / 6e4;
                break; // 1000 * 60
            case 'hour':
                output = (this - that) / 36e5;
                break; // 1000 * 60 * 60
            case 'day':
                output = (this - that - zoneDelta) / 864e5;
                break; // 1000 * 60 * 60 * 24, negate dst
            case 'week':
                output = (this - that - zoneDelta) / 6048e5;
                break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default:
                output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff(a, b) {
        if (a.date() < b.date()) {
            // end-of-month calculations work correct when the start month has more
            // days than the end month.
            return -monthDiff(b, a);
        }
        // difference in months
        var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),

        // b is in (anchor - 1 month, anchor + 1 month)
        anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2,
            adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString() {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true,
            m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect() {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment',
            zone = '',
            prefix,
            year,
            datetime,
            suffix;
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        prefix = '[' + func + '("]';
        year = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY';
        datetime = '-MM-DD[T]HH:mm:ss.SSS';
        suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format(inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from(time, withoutSuffix) {
        if (this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid())) {
            return createDuration({ to: this, from: time }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow(withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to(time, withoutSuffix) {
        if (this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid())) {
            return createDuration({ from: this, to: time }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow(withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale(key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate('moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.', function (key) {
        if (key === undefined) {
            return this.localeData();
        } else {
            return this.locale(key);
        }
    });

    function localeData() {
        return this._locale;
    }

    var MS_PER_SECOND = 1000,
        MS_PER_MINUTE = 60 * MS_PER_SECOND,
        MS_PER_HOUR = 60 * MS_PER_MINUTE,
        MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

    // actual modulo - handles negative numbers (for dates before 1970):
    function mod$1(dividend, divisor) {
        return (dividend % divisor + divisor) % divisor;
    }

    function localStartOfDate(y, m, d) {
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return new Date(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return new Date(y, m, d).valueOf();
        }
    }

    function utcStartOfDate(y, m, d) {
        // Date.UTC remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return Date.UTC(y, m, d);
        }
    }

    function startOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year(), 0, 1);
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3, 1);
                break;
            case 'month':
                time = startOfDate(this.year(), this.month(), 1);
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday());
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date());
                break;
            case 'hour':
                time = this._d.valueOf();
                time -= mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR);
                break;
            case 'minute':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_MINUTE);
                break;
            case 'second':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_SECOND);
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function endOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year() + 1, 0, 1) - 1;
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
                break;
            case 'month':
                time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                break;
            case 'hour':
                time = this._d.valueOf();
                time += MS_PER_HOUR - mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR) - 1;
                break;
            case 'minute':
                time = this._d.valueOf();
                time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                break;
            case 'second':
                time = this._d.valueOf();
                time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function valueOf() {
        return this._d.valueOf() - (this._offset || 0) * 60000;
    }

    function unix() {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate() {
        return new Date(this.valueOf());
    }

    function toArray() {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject() {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON() {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2() {
        return isValid(this);
    }

    function parsingFlags() {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt() {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    addFormatToken('N', 0, 0, 'eraAbbr');
    addFormatToken('NN', 0, 0, 'eraAbbr');
    addFormatToken('NNN', 0, 0, 'eraAbbr');
    addFormatToken('NNNN', 0, 0, 'eraName');
    addFormatToken('NNNNN', 0, 0, 'eraNarrow');

    addFormatToken('y', ['y', 1], 'yo', 'eraYear');
    addFormatToken('y', ['yy', 2], 0, 'eraYear');
    addFormatToken('y', ['yyy', 3], 0, 'eraYear');
    addFormatToken('y', ['yyyy', 4], 0, 'eraYear');

    addRegexToken('N', matchEraAbbr);
    addRegexToken('NN', matchEraAbbr);
    addRegexToken('NNN', matchEraAbbr);
    addRegexToken('NNNN', matchEraName);
    addRegexToken('NNNNN', matchEraNarrow);

    addParseToken(['N', 'NN', 'NNN', 'NNNN', 'NNNNN'], function (input, array, config, token) {
        var era = config._locale.erasParse(input, token, config._strict);
        if (era) {
            getParsingFlags(config).era = era;
        } else {
            getParsingFlags(config).invalidEra = input;
        }
    });

    addRegexToken('y', matchUnsigned);
    addRegexToken('yy', matchUnsigned);
    addRegexToken('yyy', matchUnsigned);
    addRegexToken('yyyy', matchUnsigned);
    addRegexToken('yo', matchEraYearOrdinal);

    addParseToken(['y', 'yy', 'yyy', 'yyyy'], YEAR);
    addParseToken(['yo'], function (input, array, config, token) {
        var match;
        if (config._locale._eraYearOrdinalRegex) {
            match = input.match(config._locale._eraYearOrdinalRegex);
        }

        if (config._locale.eraYearOrdinalParse) {
            array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
        } else {
            array[YEAR] = parseInt(input, 10);
        }
    });

    function localeEras(m, format) {
        var i,
            l,
            date,
            eras = this._eras || getLocale('en')._eras;
        for (i = 0, l = eras.length; i < l; ++i) {
            switch (_typeof(eras[i].since)) {
                case 'string':
                    // truncate time
                    date = hooks(eras[i].since).startOf('day');
                    eras[i].since = date.valueOf();
                    break;
            }

            switch (_typeof(eras[i].until)) {
                case 'undefined':
                    eras[i].until = +Infinity;
                    break;
                case 'string':
                    // truncate time
                    date = hooks(eras[i].until).startOf('day').valueOf();
                    eras[i].until = date.valueOf();
                    break;
            }
        }
        return eras;
    }

    function localeErasParse(eraName, format, strict) {
        var i,
            l,
            eras = this.eras(),
            name,
            abbr,
            narrow;
        eraName = eraName.toUpperCase();

        for (i = 0, l = eras.length; i < l; ++i) {
            name = eras[i].name.toUpperCase();
            abbr = eras[i].abbr.toUpperCase();
            narrow = eras[i].narrow.toUpperCase();

            if (strict) {
                switch (format) {
                    case 'N':
                    case 'NN':
                    case 'NNN':
                        if (abbr === eraName) {
                            return eras[i];
                        }
                        break;

                    case 'NNNN':
                        if (name === eraName) {
                            return eras[i];
                        }
                        break;

                    case 'NNNNN':
                        if (narrow === eraName) {
                            return eras[i];
                        }
                        break;
                }
            } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
                return eras[i];
            }
        }
    }

    function localeErasConvertYear(era, year) {
        var dir = era.since <= era.until ? +1 : -1;
        if (year === undefined) {
            return hooks(era.since).year();
        } else {
            return hooks(era.since).year() + (year - era.offset) * dir;
        }
    }

    function getEraName() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].name;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].name;
            }
        }

        return '';
    }

    function getEraNarrow() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].narrow;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].narrow;
            }
        }

        return '';
    }

    function getEraAbbr() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].abbr;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].abbr;
            }
        }

        return '';
    }

    function getEraYear() {
        var i,
            l,
            dir,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            dir = eras[i].since <= eras[i].until ? +1 : -1;

            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until || eras[i].until <= val && val <= eras[i].since) {
                return (this.year() - hooks(eras[i].since).year()) * dir + eras[i].offset;
            }
        }

        return this.year();
    }

    function erasNameRegex(isStrict) {
        if (!hasOwnProp(this, '_erasNameRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasNameRegex : this._erasRegex;
    }

    function erasAbbrRegex(isStrict) {
        if (!hasOwnProp(this, '_erasAbbrRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasAbbrRegex : this._erasRegex;
    }

    function erasNarrowRegex(isStrict) {
        if (!hasOwnProp(this, '_erasNarrowRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasNarrowRegex : this._erasRegex;
    }

    function matchEraAbbr(isStrict, locale) {
        return locale.erasAbbrRegex(isStrict);
    }

    function matchEraName(isStrict, locale) {
        return locale.erasNameRegex(isStrict);
    }

    function matchEraNarrow(isStrict, locale) {
        return locale.erasNarrowRegex(isStrict);
    }

    function matchEraYearOrdinal(isStrict, locale) {
        return locale._eraYearOrdinalRegex || matchUnsigned;
    }

    function computeErasParse() {
        var abbrPieces = [],
            namePieces = [],
            narrowPieces = [],
            mixedPieces = [],
            i,
            l,
            erasName,
            erasAbbr,
            erasNarrow,
            eras = this.eras();

        for (i = 0, l = eras.length; i < l; ++i) {
            erasName = regexEscape(eras[i].name);
            erasAbbr = regexEscape(eras[i].abbr);
            erasNarrow = regexEscape(eras[i].narrow);

            namePieces.push(erasName);
            abbrPieces.push(erasAbbr);
            narrowPieces.push(erasNarrow);
            mixedPieces.push(erasName);
            mixedPieces.push(erasAbbr);
            mixedPieces.push(erasNarrow);
        }

        this._erasRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._erasNameRegex = new RegExp('^(' + namePieces.join('|') + ')', 'i');
        this._erasAbbrRegex = new RegExp('^(' + abbrPieces.join('|') + ')', 'i');
        this._erasNarrowRegex = new RegExp('^(' + narrowPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken(token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg', 'weekYear');
    addWeekYearFormatToken('ggggg', 'weekYear');
    addWeekYearFormatToken('GGGG', 'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    // PARSING

    addRegexToken('G', matchSigned);
    addRegexToken('g', matchSigned);
    addRegexToken('GG', match1to2, match2);
    addRegexToken('gg', match1to2, match2);
    addRegexToken('GGGG', match1to4, match4);
    addRegexToken('gggg', match1to4, match4);
    addRegexToken('GGGGG', match1to6, match6);
    addRegexToken('ggggg', match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear(input) {
        return getSetWeekYearHelper.call(this, input, this.week(), this.weekday() + this.localeData()._week.dow, this.localeData()._week.dow, this.localeData()._week.doy);
    }

    function getSetISOWeekYear(input) {
        return getSetWeekYearHelper.call(this, input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
    }

    function getISOWeeksInISOWeekYear() {
        return weeksInYear(this.isoWeekYear(), 1, 4);
    }

    function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getWeeksInWeekYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter(input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // PARSING

    addRegexToken('D', match1to2, match1to2NoLeadingZero);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict ? locale._dayOfMonthOrdinalParse || locale._ordinalParse : locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // PARSING

    addRegexToken('DDD', match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear(input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // PARSING

    addRegexToken('m', match1to2, match1to2HasZero);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // PARSING

    addRegexToken('s', match1to2, match1to2HasZero);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });

    // PARSING

    addRegexToken('S', match1to3, match1);
    addRegexToken('SS', match1to3, match2);
    addRegexToken('SSS', match1to3, match3);

    var token, getSetMillisecond;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }

    getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z', 0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr() {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName() {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add = add;
    proto.calendar = calendar$1;
    proto.clone = clone;
    proto.diff = diff;
    proto.endOf = endOf;
    proto.format = format;
    proto.from = from;
    proto.fromNow = fromNow;
    proto.to = to;
    proto.toNow = toNow;
    proto.get = stringGet;
    proto.invalidAt = invalidAt;
    proto.isAfter = isAfter;
    proto.isBefore = isBefore;
    proto.isBetween = isBetween;
    proto.isSame = isSame;
    proto.isSameOrAfter = isSameOrAfter;
    proto.isSameOrBefore = isSameOrBefore;
    proto.isValid = isValid$2;
    proto.lang = lang;
    proto.locale = locale;
    proto.localeData = localeData;
    proto.max = prototypeMax;
    proto.min = prototypeMin;
    proto.parsingFlags = parsingFlags;
    proto.set = stringSet;
    proto.startOf = startOf;
    proto.subtract = subtract;
    proto.toArray = toArray;
    proto.toObject = toObject;
    proto.toDate = toDate;
    proto.toISOString = toISOString;
    proto.inspect = inspect;
    if (typeof Symbol !== 'undefined' && Symbol.for != null) {
        proto[Symbol.for('nodejs.util.inspect.custom')] = function () {
            return 'Moment<' + this.format() + '>';
        };
    }
    proto.toJSON = toJSON;
    proto.toString = toString;
    proto.unix = unix;
    proto.valueOf = valueOf;
    proto.creationData = creationData;
    proto.eraName = getEraName;
    proto.eraNarrow = getEraNarrow;
    proto.eraAbbr = getEraAbbr;
    proto.eraYear = getEraYear;
    proto.year = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week = proto.weeks = getSetWeek;
    proto.isoWeek = proto.isoWeeks = getSetISOWeek;
    proto.weeksInYear = getWeeksInYear;
    proto.weeksInWeekYear = getWeeksInWeekYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
    proto.date = getSetDayOfMonth;
    proto.day = proto.days = getSetDayOfWeek;
    proto.weekday = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset = getSetOffset;
    proto.utc = setOffsetToUTC;
    proto.local = setOffsetToLocal;
    proto.parseZone = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST = isDaylightSavingTime;
    proto.isLocal = isLocal;
    proto.isUtcOffset = isUtcOffset;
    proto.isUtc = isUtc;
    proto.isUTC = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    function createUnix(input) {
        return createLocal(input * 1000);
    }

    function createInZone() {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat(string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar = calendar;
    proto$1.longDateFormat = longDateFormat;
    proto$1.invalidDate = invalidDate;
    proto$1.ordinal = ordinal;
    proto$1.preparse = preParsePostFormat;
    proto$1.postformat = preParsePostFormat;
    proto$1.relativeTime = relativeTime;
    proto$1.pastFuture = pastFuture;
    proto$1.set = set;
    proto$1.eras = localeEras;
    proto$1.erasParse = localeErasParse;
    proto$1.erasConvertYear = localeErasConvertYear;
    proto$1.erasAbbrRegex = erasAbbrRegex;
    proto$1.erasNameRegex = erasNameRegex;
    proto$1.erasNarrowRegex = erasNarrowRegex;

    proto$1.months = localeMonths;
    proto$1.monthsShort = localeMonthsShort;
    proto$1.monthsParse = localeMonthsParse;
    proto$1.monthsRegex = monthsRegex;
    proto$1.monthsShortRegex = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays = localeWeekdays;
    proto$1.weekdaysMin = localeWeekdaysMin;
    proto$1.weekdaysShort = localeWeekdaysShort;
    proto$1.weekdaysParse = localeWeekdaysParse;

    proto$1.weekdaysRegex = weekdaysRegex;
    proto$1.weekdaysShortRegex = weekdaysShortRegex;
    proto$1.weekdaysMinRegex = weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1(format, index, field, setter) {
        var locale = getLocale(),
            utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl(format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i,
            out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl(localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0,
            i,
            out = [];

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths(format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort(format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        eras: [{
            since: '0001-01-01',
            until: +Infinity,
            offset: 1,
            name: 'Anno Domini',
            narrow: 'AD',
            abbr: 'AD'
        }, {
            since: '0000-12-31',
            until: -Infinity,
            offset: 1,
            name: 'Before Christ',
            narrow: 'BC',
            abbr: 'BC'
        }],
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function ordinal(number) {
            var b = number % 10,
                output = toInt(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports

    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

    var mathAbs = Math.abs;

    function abs() {
        var data = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);

        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);

        return this;
    }

    function addSubtract$1(duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1(input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1(input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil(number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble() {
        var milliseconds = this._milliseconds,
            days = this._days,
            months = this._months,
            data = this._data,
            seconds,
            minutes,
            hours,
            years,
            monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!(milliseconds >= 0 && days >= 0 && months >= 0 || milliseconds <= 0 && days <= 0 && months <= 0)) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds = absFloor(milliseconds / 1000);
        data.seconds = seconds % 60;

        minutes = absFloor(seconds / 60);
        data.minutes = minutes % 60;

        hours = absFloor(minutes / 60);
        data.hours = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days = days;
        data.months = months;
        data.years = years;

        return this;
    }

    function daysToMonths(days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays(months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as(units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days,
            months,
            milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'quarter' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            switch (units) {
                case 'month':
                    return months;
                case 'quarter':
                    return months / 3;
                case 'year':
                    return months / 12;
            }
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week':
                    return days / 7 + milliseconds / 6048e5;
                case 'day':
                    return days + milliseconds / 864e5;
                case 'hour':
                    return days * 24 + milliseconds / 36e5;
                case 'minute':
                    return days * 1440 + milliseconds / 6e4;
                case 'second':
                    return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond':
                    return Math.floor(days * 864e5) + milliseconds;
                default:
                    throw new Error('Unknown unit ' + units);
            }
        }
    }

    function makeAs(alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms'),
        asSeconds = makeAs('s'),
        asMinutes = makeAs('m'),
        asHours = makeAs('h'),
        asDays = makeAs('d'),
        asWeeks = makeAs('w'),
        asMonths = makeAs('M'),
        asQuarters = makeAs('Q'),
        asYears = makeAs('y'),
        valueOf$1 = asMilliseconds;

    function clone$1() {
        return createDuration(this);
    }

    function get$2(units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds'),
        seconds = makeGetter('seconds'),
        minutes = makeGetter('minutes'),
        hours = makeGetter('hours'),
        days = makeGetter('days'),
        months = makeGetter('months'),
        years = makeGetter('years');

    function weeks() {
        return absFloor(this.days() / 7);
    }

    var round = Math.round,
        thresholds = {
        ss: 44, // a few seconds to seconds
        s: 45, // seconds to minute
        m: 45, // minutes to hour
        h: 22, // hours to day
        d: 26, // days to month/week
        w: null, // weeks to month
        M: 11 // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1(posNegDuration, withoutSuffix, thresholds, locale) {
        var duration = createDuration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            weeks = round(duration.as('w')),
            years = round(duration.as('y')),
            a = seconds <= thresholds.ss && ['s', seconds] || seconds < thresholds.s && ['ss', seconds] || minutes <= 1 && ['m'] || minutes < thresholds.m && ['mm', minutes] || hours <= 1 && ['h'] || hours < thresholds.h && ['hh', hours] || days <= 1 && ['d'] || days < thresholds.d && ['dd', days];

        if (thresholds.w != null) {
            a = a || weeks <= 1 && ['w'] || weeks < thresholds.w && ['ww', weeks];
        }
        a = a || months <= 1 && ['M'] || months < thresholds.M && ['MM', months] || years <= 1 && ['y'] || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding(roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof roundingFunction === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold(threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize(argWithSuffix, argThresholds) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var withSuffix = false,
            th = thresholds,
            locale,
            output;

        if ((typeof argWithSuffix === 'undefined' ? 'undefined' : _typeof(argWithSuffix)) === 'object') {
            argThresholds = argWithSuffix;
            argWithSuffix = false;
        }
        if (typeof argWithSuffix === 'boolean') {
            withSuffix = argWithSuffix;
        }
        if ((typeof argThresholds === 'undefined' ? 'undefined' : _typeof(argThresholds)) === 'object') {
            th = Object.assign({}, thresholds, argThresholds);
            if (argThresholds.s != null && argThresholds.ss == null) {
                th.ss = argThresholds.s - 1;
            }
        }

        locale = this.localeData();
        output = relativeTime$1(this, !withSuffix, th, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return (x > 0) - (x < 0) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000,
            days = abs$1(this._days),
            months = abs$1(this._months),
            minutes,
            hours,
            years,
            s,
            total = this.asSeconds(),
            totalSign,
            ymSign,
            daysSign,
            hmsSign;

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes = absFloor(seconds / 60);
        hours = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';

        totalSign = total < 0 ? '-' : '';
        ymSign = sign(this._months) !== sign(total) ? '-' : '';
        daysSign = sign(this._days) !== sign(total) ? '-' : '';
        hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return totalSign + 'P' + (years ? ymSign + years + 'Y' : '') + (months ? ymSign + months + 'M' : '') + (days ? daysSign + days + 'D' : '') + (hours || minutes || seconds ? 'T' : '') + (hours ? hmsSign + hours + 'H' : '') + (minutes ? hmsSign + minutes + 'M' : '') + (seconds ? hmsSign + s + 'S' : '');
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid = isValid$1;
    proto$2.abs = abs;
    proto$2.add = add$1;
    proto$2.subtract = subtract$1;
    proto$2.as = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds = asSeconds;
    proto$2.asMinutes = asMinutes;
    proto$2.asHours = asHours;
    proto$2.asDays = asDays;
    proto$2.asWeeks = asWeeks;
    proto$2.asMonths = asMonths;
    proto$2.asQuarters = asQuarters;
    proto$2.asYears = asYears;
    proto$2.valueOf = valueOf$1;
    proto$2._bubble = bubble;
    proto$2.clone = clone$1;
    proto$2.get = get$2;
    proto$2.milliseconds = milliseconds;
    proto$2.seconds = seconds;
    proto$2.minutes = minutes;
    proto$2.hours = hours;
    proto$2.days = days;
    proto$2.weeks = weeks;
    proto$2.months = months;
    proto$2.years = years;
    proto$2.humanize = humanize;
    proto$2.toISOString = toISOString$1;
    proto$2.toString = toISOString$1;
    proto$2.toJSON = toISOString$1;
    proto$2.locale = locale;
    proto$2.localeData = localeData;

    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    //! moment.js

    hooks.version = '2.30.1';

    setHookCallback(createLocal);

    hooks.fn = proto;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.parseZone = createInZone;
    hooks.localeData = getLocale;
    hooks.isDuration = isDuration;
    hooks.monthsShort = listMonthsShort;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.defineLocale = defineLocale;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat = getCalendarFormat;
    hooks.prototype = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm', // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss', // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS', // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD', // <input type="date" />
        TIME: 'HH:mm', // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss', // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS', // <input type="time" step="0.001" />
        WEEK: 'GGGG-[W]WW', // <input type="week" />
        MONTH: 'YYYY-MM' // <input type="month" />
    };

    return hooks;
});

},{}],45:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var keysShim;
if (!Object.keys) {
	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var isArgs = require('./isArguments'); // eslint-disable-line global-require
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
	var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];
	var equalsConstructorPrototype = function equalsConstructorPrototype(o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys = {
		$applicationCache: true,
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$onmozfullscreenchange: true,
		$onmozfullscreenerror: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug = function () {
		/* global window */
		if (typeof window === 'undefined') {
			return false;
		}
		for (var k in window) {
			try {
				if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && _typeof(window[k]) === 'object') {
					try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}();
	var equalsConstructorPrototypeIfNotBuggy = function equalsConstructorPrototypeIfNotBuggy(o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
			return equalsConstructorPrototype(o);
		}
		try {
			return equalsConstructorPrototype(o);
		} catch (e) {
			return false;
		}
	};

	keysShim = function keys(object) {
		var isObject = object !== null && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object';
		var isFunction = toStr.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};
}
module.exports = keysShim;

},{"./isArguments":47}],46:[function(require,module,exports){
'use strict';

var slice = Array.prototype.slice;
var isArgs = require('./isArguments');

var origKeys = Object.keys;
var keysShim = origKeys ? function keys(o) {
	return origKeys(o);
} : require('./implementation');

var originalKeys = Object.keys;

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = function () {
			// Safari 5.0 bug
			var args = Object.keys(arguments);
			return args && args.length === arguments.length;
		}(1, 2);
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) {
				// eslint-disable-line func-name-matching
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				}
				return originalKeys(object);
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./implementation":45,"./isArguments":47}],47:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' && value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && typeof value.length === 'number' && value.length >= 0 && toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],48:[function(require,module,exports){
'use strict';

// modified from https://github.com/es-shims/es6-shim

var objectKeys = require('object-keys');
var hasSymbols = require('has-symbols/shams')();
var callBound = require('call-bound');
var $Object = require('es-object-atoms');
var $push = callBound('Array.prototype.push');
var $propIsEnumerable = callBound('Object.prototype.propertyIsEnumerable');
var originalGetSymbols = hasSymbols ? $Object.getOwnPropertySymbols : null;

// eslint-disable-next-line no-unused-vars
module.exports = function assign(target, source1) {
	if (target == null) {
		throw new TypeError('target must be an object');
	}
	var to = $Object(target); // step 1
	if (arguments.length === 1) {
		return to; // step 2
	}
	for (var s = 1; s < arguments.length; ++s) {
		var from = $Object(arguments[s]); // step 3.a.i

		// step 3.a.ii:
		var keys = objectKeys(from);
		var getSymbols = hasSymbols && ($Object.getOwnPropertySymbols || originalGetSymbols);
		if (getSymbols) {
			var syms = getSymbols(from);
			for (var j = 0; j < syms.length; ++j) {
				var key = syms[j];
				if ($propIsEnumerable(from, key)) {
					$push(keys, key);
				}
			}
		}

		// step 3.a.iii:
		for (var i = 0; i < keys.length; ++i) {
			var nextKey = keys[i];
			if ($propIsEnumerable(from, nextKey)) {
				// step 3.a.iii.2
				var propValue = from[nextKey]; // step 3.a.iii.2.a
				to[nextKey] = propValue; // step 3.a.iii.2.b
			}
		}
	}

	return to; // step 4
};

},{"call-bound":14,"es-object-atoms":24,"has-symbols/shams":34,"object-keys":46}],49:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

var lacksProperEnumerationOrder = function lacksProperEnumerationOrder() {
	if (!Object.assign) {
		return false;
	}
	/*
  * v8, specifically in node 4.x, has a bug with incorrect property enumeration order
  * note: this does not detect the bug unless there's 20 characters
  */
	var str = 'abcdefghijklmnopqrst';
	var letters = str.split('');
	var map = {};
	for (var i = 0; i < letters.length; ++i) {
		map[letters[i]] = letters[i];
	}
	var obj = Object.assign({}, map);
	var actual = '';
	for (var k in obj) {
		actual += k;
	}
	return str !== actual;
};

var assignHasPendingExceptions = function assignHasPendingExceptions() {
	if (!Object.assign || !Object.preventExtensions) {
		return false;
	}
	/*
  * Firefox 37 still has "pending exception" logic in its Object.assign implementation,
  * which is 72% slower than our shim, and Firefox 40's native implementation.
  */
	var thrower = Object.preventExtensions({ 1: 2 });
	try {
		Object.assign(thrower, 'xy');
	} catch (e) {
		return thrower[1] === 'y';
	}
	return false;
};

module.exports = function getPolyfill() {
	if (!Object.assign) {
		return implementation;
	}
	if (lacksProperEnumerationOrder()) {
		return implementation;
	}
	if (assignHasPendingExceptions()) {
		return implementation;
	}
	return Object.assign;
};

},{"./implementation":48}],50:[function(require,module,exports){
'use strict';

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout() {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
})();
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }
}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
    return [];
};

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () {
    return '/';
};
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function () {
    return 0;
};

},{}],51:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory);
  } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object") {
    module.exports = factory();
  } else {
    root.resolveUrl = factory();
  }
}(undefined, function () {

  function resolveUrl() /* ...urls */{
    var numUrls = arguments.length;

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.");
    }

    var base = document.createElement("base");
    base.href = arguments[0];

    if (numUrls === 1) {
      return base.href;
    }

    var head = document.getElementsByTagName("head")[0];
    head.insertBefore(base, head.firstChild);

    var a = document.createElement("a");
    var resolved;

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index];
      resolved = a.href;
      base.href = resolved;
    }

    head.removeChild(base);

    return resolved;
  }

  return resolveUrl;
});

},{}],52:[function(require,module,exports){
'use strict';

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function TempCtor() {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}

},{}],53:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function isBuffer(arg) {
  return arg && (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && typeof arg.copy === 'function' && typeof arg.fill === 'function' && typeof arg.readUInt8 === 'function';
};

},{}],54:[function(require,module,exports){
(function (process,global){(function (){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function (f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function (x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function (fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function () {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};

var debugs = {};
var debugEnviron;
exports.debuglog = function (set) {
  if (isUndefined(debugEnviron)) debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function () {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function () {};
    }
  }
  return debugs[set];
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold': [1, 22],
  'italic': [3, 23],
  'underline': [4, 24],
  'inverse': [7, 27],
  'white': [37, 39],
  'grey': [90, 39],
  'black': [30, 39],
  'blue': [34, 39],
  'cyan': [36, 39],
  'green': [32, 39],
  'magenta': [35, 39],
  'red': [31, 39],
  'yellow': [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};

function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\x1B[' + inspect.colors[style][0] + 'm' + str + '\x1B[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}

function stylizeNoColor(str, styleType) {
  return str;
}

function arrayToHash(array) {
  var hash = {};

  array.forEach(function (val, idx) {
    hash[val] = true;
  });

  return hash;
}

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect && value && isFunction(value.inspect) &&
  // Filter out the util module, it's inspect function is special
  value.inspect !== exports.inspect &&
  // Also filter out any prototype objects using the circular check.
  !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '',
      array = false,
      braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function (key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}

function formatPrimitive(ctx, value) {
  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value)) return ctx.stylize('' + value, 'number');
  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value)) return ctx.stylize('null', 'null');
}

function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function (key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function (line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function (line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}

function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function (prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'symbol' || // ES6 symbol
  typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function () {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function (origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":53,"_process":50,"inherits":52}],55:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var moment = require("moment");

var _require = require("../type-assert"),
    getType = _require.getType,
    SD_CUSTOM_TYPES = _require.SD_CUSTOM_TYPES;

function dateEquals(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.date) {
    return false;
  }

  return moment.utc(l).isSame(moment.utc(r));
}

function durationEquals(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.duration) {
    return false;
  }

  return l.days === r.days;
}

function currencyEquals(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.currency) {
    return false;
  }

  return l.value === r.value && l.type === r.type;
}

function phoneNumberEquals(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.phoneNumber) {
    return false;
  }

  return l.number === r.number && l.code === r.code;
}

/**
 * Sorts the array using default JS sorting method.
 * Loops through the sorted arrays and checks whether they have same items at same index.
 * Empty array is considered equal to another empty array
 */
function arrayEquals(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.array) {
    return false;
  }

  if (l.length !== r.length) {
    return false;
  }

  // Empty array should be equal to another empty array
  if (l.length === 0) {
    return true;
  }

  var sortedL = [].concat(_toConsumableArray(l)).sort();
  var sortedR = [].concat(_toConsumableArray(r)).sort();

  return sortedL.every(function (val, idx) {
    return val === sortedR[idx];
  });
}

function defaultHandler(l, r) {
  return l === r;
}

function equals(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return defaultHandler(l, r);
  }

  switch (lType) {
    case SD_CUSTOM_TYPES.array:
      return arrayEquals(l, r);
    case SD_CUSTOM_TYPES.duration:
      return durationEquals(l, r);
    case SD_CUSTOM_TYPES.date:
      return dateEquals(l, r);
    case SD_CUSTOM_TYPES.currency:
      return currencyEquals(l, r);
    case SD_CUSTOM_TYPES.phoneNumber:
      return phoneNumberEquals(l, r);
    default:
      return defaultHandler(l, r);
  }
}

module.exports = equals;

},{"../type-assert":60,"moment":44}],56:[function(require,module,exports){
"use strict";

var moment = require("moment");

var _require = require("../type-assert"),
    getType = _require.getType,
    SD_CUSTOM_TYPES = _require.SD_CUSTOM_TYPES;

function dateGreaterThanOrEqual(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.date) {
    return false;
  }
  return moment.utc(l).isSameOrAfter(moment.utc(r));
}

function durationGreaterThanOrEqual(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.duration) {
    return false;
  }

  return l.days >= r.days;
}

function currencyGreaterThanOrEqual(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.currency) {
    return false;
  }

  return l.value >= r.value && l.type === r.type;
}

function defaultHandler(l, r) {
  return l >= r;
}

function greaterThanOrEqual(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return defaultHandler(l, r);
  }

  switch (lType) {
    case SD_CUSTOM_TYPES.duration:
      return durationGreaterThanOrEqual(l, r);
    case SD_CUSTOM_TYPES.currency:
      return currencyGreaterThanOrEqual(l, r);
    case SD_CUSTOM_TYPES.date:
      return dateGreaterThanOrEqual(l, r);
    default:
      return defaultHandler(l, r);
  }
}

module.exports = greaterThanOrEqual;

},{"../type-assert":60,"moment":44}],57:[function(require,module,exports){
"use strict";

var moment = require("moment");

var _require = require("../type-assert"),
    getType = _require.getType,
    SD_CUSTOM_TYPES = _require.SD_CUSTOM_TYPES;

function dateGreaterThan(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.date) {
    return false;
  }
  return moment.utc(l).isAfter(moment.utc(r));
}

function durationGreaterThan(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.duration) {
    return false;
  }

  return l.days > r.days;
}

function currencyGreaterThan(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.currency) {
    return false;
  }

  return l.value > r.value && l.type === r.type;
}

function defaultHandler(l, r) {
  return l > r;
}

function greaterThan(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return defaultHandler(l, r);
  }

  switch (lType) {
    case SD_CUSTOM_TYPES.duration:
      return durationGreaterThan(l, r);
    case SD_CUSTOM_TYPES.currency:
      return currencyGreaterThan(l, r);
    case SD_CUSTOM_TYPES.date:
      return dateGreaterThan(l, r);
    default:
      return defaultHandler(l, r);
  }
}

module.exports = greaterThan;

},{"../type-assert":60,"moment":44}],58:[function(require,module,exports){
"use strict";

var moment = require("moment");

var _require = require("../type-assert"),
    getType = _require.getType,
    SD_CUSTOM_TYPES = _require.SD_CUSTOM_TYPES;

function dateSmallerThanOrEqual(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.date) {
    return false;
  }
  return moment.utc(l).isSameOrBefore(moment.utc(r));
}

function durationSmallerThanOrEqual(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.duration) {
    return false;
  }

  return l.days <= r.days;
}

function currencySmallerThanOrEqual(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.currency) {
    return false;
  }

  return l.value <= r.value && l.type === r.type;
}

function defaultHandler(l, r) {
  return l <= r;
}

function smallerThanOrEqual(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return defaultHandler(l, r);
  }

  switch (lType) {
    case SD_CUSTOM_TYPES.duration:
      return durationSmallerThanOrEqual(l, r);
    case SD_CUSTOM_TYPES.currency:
      return currencySmallerThanOrEqual(l, r);
    case SD_CUSTOM_TYPES.date:
      return dateSmallerThanOrEqual(l, r);
    default:
      return defaultHandler(l, r);
  }
}

module.exports = smallerThanOrEqual;

},{"../type-assert":60,"moment":44}],59:[function(require,module,exports){
"use strict";

var moment = require("moment");

var _require = require("../type-assert"),
    getType = _require.getType,
    SD_CUSTOM_TYPES = _require.SD_CUSTOM_TYPES;

function dateSmaller(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.date) {
    return false;
  }
  return moment.utc(l).isBefore(moment.utc(r));
}

function durationSmaller(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.duration) {
    return false;
  }

  return l.days < r.days;
}

function currencySmaller(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return false;
  }

  if (lType !== SD_CUSTOM_TYPES.currency) {
    return false;
  }

  return l.value < r.value && l.type === r.type;
}

function defaultHandler(l, r) {
  return l < r;
}

function smaller(l, r) {
  var lType = getType(l);
  var rType = getType(r);

  if (lType !== rType) {
    return defaultHandler(l, r);
  }

  switch (lType) {
    case SD_CUSTOM_TYPES.duration:
      return durationSmaller(l, r);
    case SD_CUSTOM_TYPES.currency:
      return currencySmaller(l, r);
    case SD_CUSTOM_TYPES.date:
      return dateSmaller(l, r);
    default:
      return defaultHandler(l, r);
  }
}

module.exports = smaller;

},{"../type-assert":60,"moment":44}],60:[function(require,module,exports){
"use strict";

var moment = require("moment");

var CF_DATE_FORMAT = "YYYY-MM-DD";

var SD_CUSTOM_TYPES = {
  date: "date",
  string: "string",
  number: "number",
  boolean: "boolean",
  array: "array",
  duration: "duration",
  currency: "currency",
  phoneNumber: "phone-number"
};

function isValidDateString(dateString) {
  return typeof dateString === "string" && (moment(dateString, moment.ISO_8601, true).isValid() || moment(dateString, CF_DATE_FORMAT, true).isValid());
}

function isDurationObject(durationObj) {
  if (!durationObj || !durationObj.hasOwnProperty) {
    return false;
  }

  var durationProps = ["value", "type", "days"];
  if (durationProps.some(function (prop) {
    return !durationObj.hasOwnProperty(prop);
  })) {
    return false;
  }

  var units = ["DAYS", "WEEKS", "MONTHS", "YEARS"];
  if (units.indexOf(durationObj.type) != -1) {
    return true;
  }

  return false;
}

function isCurrencyObject(currencyObj) {
  if (!currencyObj || !currencyObj.hasOwnProperty) {
    return false;
  }

  var durationProps = ["value", "type"];
  if (durationProps.some(function (prop) {
    return !currencyObj.hasOwnProperty(prop);
  })) {
    return false;
  }

  return true;
}

function isValidPhoneNumber(phoneNumberObj) {
  if (!phoneNumberObj || !phoneNumberObj.hasOwnProperty) {
    return false;
  }

  var phoneNumberProps = ["number", "code"];
  if (phoneNumberProps.some(function (prop) {
    return !phoneNumberObj.hasOwnProperty(prop);
  })) {
    return false;
  }

  return true;
}

function getType(v) {
  // This check should be before string check as date strings are also valid strings
  if (isValidDateString(v)) {
    return SD_CUSTOM_TYPES.date;
  }

  if (typeof v === "string") {
    return SD_CUSTOM_TYPES.string;
  }

  if (typeof v === "number" && !Number.isNaN(v)) {
    return SD_CUSTOM_TYPES.number;
  }

  if (typeof v === "boolean") {
    return SD_CUSTOM_TYPES.boolean;
  }

  if (Array.isArray(v)) {
    return SD_CUSTOM_TYPES.array;
  }

  // It is important to have Duration check before currency check because properties of Duration
  // are a superset of Currency. So a duration object will match currency check.
  if (isDurationObject(v)) {
    return SD_CUSTOM_TYPES.duration;
  }

  if (isCurrencyObject(v)) {
    return SD_CUSTOM_TYPES.currency;
  }

  if (isValidPhoneNumber(v)) {
    return SD_CUSTOM_TYPES.phoneNumber;
  }
}

module.exports = { getType: getType, SD_CUSTOM_TYPES: SD_CUSTOM_TYPES };

},{"moment":44}],61:[function(require,module,exports){
'use strict';

var lexical = require('./lexical.js');
var Syntax = require('./syntax.js');
var assert = require('./util/assert.js');
var _ = require('./util/underscore.js');

var valueRE = new RegExp('' + lexical.value.source, 'g');

module.exports = function (options) {
  options = _.assign({}, options);
  var filters = {};

  var _filterInstance = {
    render: function render(output, scope) {
      var args = this.args.map(function (arg) {
        return Syntax.evalValue(arg, scope);
      });
      args.unshift(output);
      return this.filter.apply(null, args);
    },
    parse: function parse(str) {
      var match = lexical.filterLine.exec(str);
      assert(match, 'illegal filter: ' + str);

      var name = match[1];
      var argList = match[2] || '';
      var filter = filters[name];
      if (typeof filter !== 'function') {
        if (options.strict_filters) {
          throw new TypeError('undefined filter: ' + name);
        }
        this.name = name;
        this.filter = function (x) {
          return x;
        };
        this.args = [];
        return this;
      }

      var args = [];
      while (match = valueRE.exec(argList.trim())) {
        var v = match[0];
        var re = new RegExp(v + '\\s*:', 'g');
        re.test(match.input) ? args.push('\'' + v + '\'') : args.push(v);
      }

      this.name = name;
      this.filter = filter;
      this.args = args;

      return this;
    }
  };

  function construct(str) {
    var instance = Object.create(_filterInstance);
    return instance.parse(str);
  }

  function register(name, filter) {
    filters[name] = filter;
  }

  function clear() {
    filters = {};
  }

  return {
    construct: construct, register: register, clear: clear
  };
};

},{"./lexical.js":62,"./syntax.js":67,"./util/assert.js":70,"./util/underscore.js":75}],62:[function(require,module,exports){
'use strict';

// quote related
var singleQuoted = /'[^']*'/;
var doubleQuoted = /"[^"]*"/;
var quoted = new RegExp(singleQuoted.source + '|' + doubleQuoted.source);
var quoteBalanced = new RegExp('(?:' + quoted.source + '|[^\'"])*');

// basic types
var integer = /-?\d+/;
var number = /-?\d+\.?\d*|\.?\d+/;
var bool = /true|false/;

// peoperty access
var identifier = /[_\$\w-]+/;
var subscript = new RegExp('\\[(?:' + quoted.source + '|[\\w-\\.]+)\\]');
var literal = new RegExp('(?:' + quoted.source + '|' + bool.source + '|' + number.source + ')');
var variable = new RegExp(identifier.source + '(?:\\.' + identifier.source + '|' + subscript.source + ')*');

// range related
var rangeLimit = new RegExp('(?:' + variable.source + '|' + number.source + ')');
var range = new RegExp('\\(' + rangeLimit.source + '\\.\\.' + rangeLimit.source + '\\)');
var rangeCapture = new RegExp('\\((' + rangeLimit.source + ')\\.\\.(' + rangeLimit.source + ')\\)');

var value = new RegExp('(?:' + variable.source + '|' + literal.source + '|' + range.source + ')');

// hash related
var hash = new RegExp('(?:' + identifier.source + ')\\s*:\\s*(?:' + value.source + ')');
var hashCapture = new RegExp('(' + identifier.source + ')\\s*:\\s*(' + value.source + ')', 'g');

// full match
var tagLine = new RegExp('^\\s*(' + identifier.source + ')\\s*([\\s\\S]*)\\s*$');
var literalLine = new RegExp('^' + literal.source + '$', 'i');
var variableLine = new RegExp('^' + variable.source + '$');
var numberLine = new RegExp('^' + number.source + '$');
var boolLine = new RegExp('^' + bool.source + '$', 'i');
var quotedLine = new RegExp('^' + quoted.source + '$');
var rangeLine = new RegExp('^' + rangeCapture.source + '$');
var integerLine = new RegExp('^' + integer.source + '$');

// filter related
var valueDeclaration = new RegExp('(?:' + identifier.source + '\\s*:\\s*)?' + value.source);
var valueList = new RegExp(valueDeclaration.source + '(\\s*,\\s*' + valueDeclaration.source + ')*');
var filter = new RegExp(identifier.source + '(?:\\s*:\\s*' + valueList.source + ')?', 'g');
var filterCapture = new RegExp('(' + identifier.source + ')(?:\\s*:\\s*(' + valueList.source + '))?');
var filterLine = new RegExp('^' + filterCapture.source + '$');

var operators = [/\s+or\s+/, /\s+and\s+/, /==|!=|<=|>=|<|>|\s+contains\s+/];

function isInteger(str) {
  return integerLine.test(str);
}

function isLiteral(str) {
  return literalLine.test(str);
}

function isRange(str) {
  return rangeLine.test(str);
}

function isVariable(str) {
  return variableLine.test(str);
}

function matchValue(str) {
  return value.exec(str);
}

function parseLiteral(str) {
  var res = str.match(numberLine);
  if (res) {
    return Number(str);
  }
  res = str.match(boolLine);
  if (res) {
    return str.toLowerCase() === 'true';
  }
  res = str.match(quotedLine);
  if (res) {
    return str.slice(1, -1);
  }
  throw new TypeError('cannot parse \'' + str + '\' as literal');
}

module.exports = {
  quoted: quoted,
  number: number,
  bool: bool,
  literal: literal,
  filter: filter,
  integer: integer,
  hash: hash,
  hashCapture: hashCapture,
  range: range,
  rangeCapture: rangeCapture,
  identifier: identifier,
  value: value,
  quoteBalanced: quoteBalanced,
  operators: operators,
  quotedLine: quotedLine,
  numberLine: numberLine,
  boolLine: boolLine,
  rangeLine: rangeLine,
  literalLine: literalLine,
  filterLine: filterLine,
  tagLine: tagLine,
  isLiteral: isLiteral,
  isVariable: isVariable,
  parseLiteral: parseLiteral,
  isRange: isRange,
  matchValue: matchValue,
  isInteger: isInteger
};

},{}],63:[function(require,module,exports){
"use strict";

var equals = require("../sd-custom/custom-operator/equals");
var greaterThan = require("../sd-custom/custom-operator/greater");
var smallerThan = require("../sd-custom/custom-operator/smaller");
var greaterThanOrEquals = require("../sd-custom/custom-operator/greater-or-equal");
var smallerThanOrEquals = require("../sd-custom/custom-operator/smaller-or-equal");

module.exports = function (isTruthy) {
  return {
    "==": function _(l, r) {
      return equals(l, r);
    },
    "!=": function _(l, r) {
      return !equals(l, r);
    },
    ">": function _(l, r) {
      return l !== null && r !== null && greaterThan(l, r);
    },
    "<": function _(l, r) {
      return l !== null && r !== null && smallerThan(l, r);
    },
    ">=": function _(l, r) {
      return l !== null && r !== null && greaterThanOrEquals(l, r);
    },
    "<=": function _(l, r) {
      return l !== null && r !== null && smallerThanOrEquals(l, r);
    },
    contains: function contains(l, r) {
      if (!l) return false;
      if (typeof l.indexOf !== "function") return false;
      return l.indexOf(r) > -1;
    },
    and: function and(l, r) {
      return isTruthy(l) && isTruthy(r);
    },
    or: function or(l, r) {
      return isTruthy(l) || isTruthy(r);
    }
  };
};

},{"../sd-custom/custom-operator/equals":55,"../sd-custom/custom-operator/greater":57,"../sd-custom/custom-operator/greater-or-equal":56,"../sd-custom/custom-operator/smaller":59,"../sd-custom/custom-operator/smaller-or-equal":58}],64:[function(require,module,exports){
'use strict';

var lexical = require('./lexical.js');
var ParseError = require('./util/error.js').ParseError;
var assert = require('./util/assert.js');

module.exports = function (Tag, Filter) {
  var stream = {
    init: function init(tokens) {
      this.tokens = tokens;
      this.handlers = {};
      return this;
    },
    on: function on(name, cb) {
      this.handlers[name] = cb;
      return this;
    },
    trigger: function trigger(event, arg) {
      var h = this.handlers[event];
      if (typeof h === 'function') {
        h(arg);
        return true;
      }
    },
    start: function start() {
      this.trigger('start');
      var token;
      while (!this.stopRequested && (token = this.tokens.shift())) {
        if (this.trigger('token', token)) continue;
        if (token.type === 'tag' && this.trigger('tag:' + token.name, token)) {
          continue;
        }
        var template = parseToken(token, this.tokens);
        this.trigger('template', template);
      }
      if (!this.stopRequested) this.trigger('end');
      return this;
    },
    stop: function stop() {
      this.stopRequested = true;
      return this;
    }
  };

  function parse(tokens) {
    var token;
    var templates = [];
    while (token = tokens.shift()) {
      templates.push(parseToken(token, tokens));
    }
    return templates;
  }

  function parseToken(token, tokens) {
    try {
      var tpl = null;
      if (token.type === 'tag') {
        tpl = parseTag(token, tokens);
      } else if (token.type === 'value') {
        tpl = parseValue(token.value);
      } else {
        // token.type === 'html'
        tpl = token;
      }
      tpl.token = token;
      return tpl;
    } catch (e) {
      throw new ParseError(e, token);
    }
  }

  function parseTag(token, tokens) {
    if (token.name === 'continue' || token.name === 'break') return token;
    return Tag.construct(token, tokens);
  }

  function parseValue(str) {
    var match = lexical.matchValue(str);
    assert(match, 'illegal value string: ' + str);

    var initial = match[0];
    str = str.substr(match.index + match[0].length);

    var filters = [];
    while (match = lexical.filter.exec(str)) {
      filters.push([match[0].trim()]);
    }

    return {
      type: 'value',
      initial: initial,
      filters: filters.map(function (str) {
        return Filter.construct(str);
      })
    };
  }

  function parseStream(tokens) {
    var s = Object.create(stream);
    return s.init(tokens);
  }

  return {
    parse: parse,
    parseTag: parseTag,
    parseToken: parseToken,
    parseStream: parseStream,
    parseValue: parseValue
  };
};

},{"./lexical.js":62,"./util/assert.js":70,"./util/error.js":71}],65:[function(require,module,exports){
'use strict';

var Syntax = require('./syntax.js');
var Promise = require('any-promise');
var mapSeries = require('./util/promise.js').mapSeries;
var RenderBreakError = require('./util/error.js').RenderBreakError;
var RenderError = require('./util/error.js').RenderError;
var assert = require('./util/assert.js');

var render = {

  renderTemplates: function renderTemplates(templates, scope) {
    var _this = this;

    assert(scope, 'unable to evalTemplates: scope undefined');

    var html = '';
    return mapSeries(templates, function (tpl) {
      return renderTemplate.call(_this, tpl).then(function (partial) {
        return html += partial;
      }).catch(function (e) {
        if (e instanceof RenderBreakError) {
          e.resolvedHTML = html;
          throw e;
        }
        throw new RenderError(e, tpl);
      });
    }).then(function () {
      return html;
    });

    function renderTemplate(template) {
      var _this2 = this;

      if (template.type === 'tag') {
        return this.renderTag(template, scope).then(function (partial) {
          return partial === undefined ? '' : partial;
        });
      } else if (template.type === 'value') {
        return Promise.resolve().then(function () {
          return _this2.evalValue(template, scope);
        }).then(function (partial) {
          return partial === undefined ? '' : stringify(partial);
        });
      } else {
        // template.type === 'html'
        return Promise.resolve(template.value);
      }
    }
  },

  renderTag: function renderTag(template, scope) {
    if (template.name === 'continue') {
      return Promise.reject(new RenderBreakError('continue'));
    }
    if (template.name === 'break') {
      return Promise.reject(new RenderBreakError('break'));
    }
    return template.render(scope);
  },

  evalValue: function evalValue(template, scope) {
    assert(scope, 'unable to evalValue: scope undefined');
    return template.filters.reduce(function (prev, filter) {
      return filter.render(prev, scope);
    }, Syntax.evalExp(template.initial, scope));
  }
};

function factory() {
  var instance = Object.create(render);
  return instance;
}

function stringify(val) {
  if (typeof val === 'string') return val;
  return JSON.stringify(val);
}

module.exports = factory;

},{"./syntax.js":67,"./util/assert.js":70,"./util/error.js":71,"./util/promise.js":73,"any-promise":3}],66:[function(require,module,exports){
'use strict';

var _ = require('./util/underscore.js');
var lexical = require('./lexical.js');
var assert = require('./util/assert.js');

var Scope = {
  getAll: function getAll() {
    var ctx = {};
    for (var i = this.scopes.length - 1; i >= 0; i--) {
      _.assign(ctx, this.scopes[i]);
    }
    return ctx;
  },
  get: function get(str) {
    try {
      return this.getPropertyByPath(this.scopes, str);
    } catch (e) {
      if (!/undefined variable/.test(e.message) || this.opts.strict_variables) {
        throw e;
      }
    }
  },
  set: function set(k, v) {
    var scope = this.findScopeFor(k);
    setPropertyByPath(scope, k, v);
    return this;
  },
  push: function push(ctx) {
    assert(ctx, 'trying to push ' + ctx + ' into scopes');
    return this.scopes.push(ctx);
  },
  pop: function pop() {
    return this.scopes.pop();
  },
  findScopeFor: function findScopeFor(key) {
    var i = this.scopes.length - 1;
    while (i >= 0 && !(key in this.scopes[i])) {
      i--;
    }
    if (i < 0) {
      i = this.scopes.length - 1;
    }
    return this.scopes[i];
  },
  unshift: function unshift(ctx) {
    assert(ctx, 'trying to push ' + ctx + ' into scopes');
    return this.scopes.unshift(ctx);
  },
  shift: function shift() {
    return this.scopes.shift();
  },

  getPropertyByPath: function getPropertyByPath(scopes, path) {
    var paths = this.propertyAccessSeq(path + '');
    if (!paths.length) {
      throw new TypeError('undefined variable: ' + path);
    }
    var key = paths.shift();
    var value = getValueFromScopes(key, scopes);
    return paths.reduce(function (value, key) {
      if (_.isNil(value)) {
        throw new TypeError('undefined variable: ' + key);
      }
      return getValueFromParent(key, value);
    }, value);
  },

  /*
   * Parse property access sequence from access string
   * @example
   * accessSeq("foo.bar")            // ['foo', 'bar']
   * accessSeq("foo['bar']")      // ['foo', 'bar']
   * accessSeq("foo['b]r']")      // ['foo', 'b]r']
   * accessSeq("foo[bar.coo]")    // ['foo', 'bar'], for bar.coo == 'bar'
   */
  propertyAccessSeq: function propertyAccessSeq(str) {
    var seq = [];
    var name = '';
    var j;
    var i = 0;
    while (i < str.length) {
      switch (str[i]) {
        case '[':
          push();

          var delemiter = str[i + 1];
          if (/['"]/.test(delemiter)) {
            // foo["bar"]
            j = str.indexOf(delemiter, i + 2);
            assert(j !== -1, 'unbalanced ' + delemiter + ': ' + str);
            name = str.slice(i + 2, j);
            push();
            i = j + 2;
          } else {
            // foo[bar.coo]
            j = matchRightBracket(str, i + 1);
            assert(j !== -1, 'unbalanced []: ' + str);
            name = str.slice(i + 1, j);
            if (!lexical.isInteger(name)) {
              // foo[bar] vs. foo[1]
              name = this.get(name);
            }
            push();
            i = j + 1;
          }
          break;
        case '.':
          // foo.bar, foo[0].bar
          push();
          i++;
          break;
        default:
          // foo.bar
          name += str[i];
          i++;
      }
    }
    push();
    return seq;

    function push() {
      if (name.length) seq.push(name);
      name = '';
    }
  }
};

function setPropertyByPath(obj, path, val) {
  var paths = (path + '').replace(/\[/g, '.').replace(/\]/g, '').split('.');
  for (var i = 0; i < paths.length; i++) {
    var key = paths[i];
    if (!_.isObject(obj)) {
      // cannot set property of non-object
      return;
    }
    // for end point
    if (i === paths.length - 1) {
      return obj[key] = val;
    }
    // if path not exist
    if (undefined === obj[key]) {
      obj[key] = {};
    }
    obj = obj[key];
  }
}

function getValueFromParent(key, value) {
  return key === 'size' && (_.isArray(value) || _.isString(value)) ? value.length : value[key];
}

function getValueFromScopes(key, scopes) {
  for (var i = scopes.length - 1; i > -1; i--) {
    var scope = scopes[i];
    if (scope.hasOwnProperty(key)) {
      return scope[key];
    }
  }
  throw new TypeError('undefined variable: ' + key);
}

function matchRightBracket(str, begin) {
  var stack = 1; // count of '[' - count of ']'
  for (var i = begin; i < str.length; i++) {
    if (str[i] === '[') {
      stack++;
    }
    if (str[i] === ']') {
      stack--;
      if (stack === 0) {
        return i;
      }
    }
  }
  return -1;
}

exports.factory = function (ctx, opts) {
  var defaultOptions = {
    dynamicPartials: true,
    strict_variables: false,
    strict_filters: false,
    blocks: {},
    root: []
  };
  var scope = Object.create(Scope);
  scope.opts = _.assign(defaultOptions, opts);
  scope.scopes = [ctx || {}];
  return scope;
};

},{"./lexical.js":62,"./util/assert.js":70,"./util/underscore.js":75}],67:[function(require,module,exports){
'use strict';

var operators = require('./operators.js')(isTruthy);
var lexical = require('./lexical.js');
var assert = require('../src/util/assert.js');

function evalExp(exp, scope) {
  assert(scope, 'unable to evalExp: scope undefined');
  var operatorREs = lexical.operators;
  var match;
  for (var i = 0; i < operatorREs.length; i++) {
    var operatorRE = operatorREs[i];
    var expRE = new RegExp('^(' + lexical.quoteBalanced.source + ')(' + operatorRE.source + ')(' + lexical.quoteBalanced.source + ')$');
    if (match = exp.match(expRE)) {
      var l = evalExp(match[1], scope);
      var op = operators[match[2].trim()];
      var r = evalExp(match[3], scope);
      return op(l, r);
    }
  }

  if (match = exp.match(lexical.rangeLine)) {
    var low = evalValue(match[1], scope);
    var high = evalValue(match[2], scope);
    var range = [];
    for (var j = low; j <= high; j++) {
      range.push(j);
    }
    return range;
  }

  return evalValue(exp, scope);
}

function evalValue(str, scope) {
  str = str && str.trim();
  if (!str) return undefined;

  if (lexical.isLiteral(str)) {
    return lexical.parseLiteral(str);
  }
  if (lexical.isVariable(str)) {
    return scope.get(str);
  }
  throw new TypeError('cannot eval \'' + str + '\' as value');
}

function isTruthy(val) {
  return !isFalsy(val);
}

function isFalsy(val) {
  return val === false || undefined === val || val === null;
}

function validateExpression(exp, scope) {
  var errors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  assert(scope, 'unable to evalExp: scope undefined');
  var operatorREs = lexical.operators;
  var match;
  for (var i = 0; i < operatorREs.length; i++) {
    var operatorRE = operatorREs[i];
    var expRE = new RegExp('^(' + lexical.quoteBalanced.source + ')(' + operatorRE.source + ')(' + lexical.quoteBalanced.source + ')$');
    if (match = exp.match(expRE)) {
      errors.concat(validateExpression(match[1], scope, errors), validateExpression(match[3], scope, errors));
      return errors;
    }
  }
  if (error = validateValue(exp, scope)) {
    errors.push(error);
  }
  return errors;
}

function validateValue(str, scope) {
  str = str && str.trim();
  if (!str) return 'Invalid Operator Usage';

  if (lexical.isLiteral(str)) {
    return;
  }
  if (lexical.isVariable(str)) {
    if (scope.get(str) !== undefined && scope.get(str) !== null) {
      return;
    } else {
      return str + ' variable not present';
    }
  }
  return 'cannot eval \'' + str + '\' as value';
}

module.exports = {
  evalExp: evalExp, evalValue: evalValue, isTruthy: isTruthy, isFalsy: isFalsy, validateExpression: validateExpression, validateValue: validateValue
};

},{"../src/util/assert.js":70,"./lexical.js":62,"./operators.js":63}],68:[function(require,module,exports){
'use strict';

var lexical = require('./lexical.js');
var Promise = require('any-promise');
var Syntax = require('./syntax.js');
var assert = require('./util/assert.js');

function hash(markup, scope) {
  var obj = {};
  var match;
  lexical.hashCapture.lastIndex = 0;
  while (match = lexical.hashCapture.exec(markup)) {
    var k = match[1];
    var v = match[2];
    obj[k] = Syntax.evalValue(v, scope);
  }
  return obj;
}

module.exports = function () {
  var tagImpls = {};

  var _tagInstance = {
    render: function render(scope) {
      var obj = hash(this.token.args, scope);
      var impl = this.tagImpl;
      if (typeof impl.render !== 'function') {
        return Promise.resolve('');
      }
      return Promise.resolve().then(function () {
        return impl.render(scope, obj);
      });
    },
    parse: function parse(token, tokens) {
      this.type = 'tag';
      this.token = token;
      this.name = token.name;

      var tagImpl = tagImpls[this.name];
      assert(tagImpl, 'tag ' + this.name + ' not found');
      this.tagImpl = Object.create(tagImpl);
      if (this.tagImpl.parse) {
        this.tagImpl.parse(token, tokens);
      }
    }
  };

  function register(name, tag) {
    tagImpls[name] = tag;
  }

  function construct(token, tokens) {
    var instance = Object.create(_tagInstance);
    instance.parse(token, tokens);
    return instance;
  }

  function clear() {
    tagImpls = {};
  }

  return {
    construct: construct,
    register: register,
    clear: clear
  };
};

},{"./lexical.js":62,"./syntax.js":67,"./util/assert.js":70,"any-promise":3}],69:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var lexical = require('./lexical.js');
var TokenizationError = require('./util/error.js').TokenizationError;
var _ = require('./util/underscore.js');
var whiteSpaceCtrl = require('./whitespace-ctrl.js');
var assert = require('./util/assert.js');

var Token = function () {
  function Token(type, raw, value, line, begin, end) {
    _classCallCheck(this, Token);

    this.type = type;
    this.kind = type === 'tag' ? 4 : type === 'value' ? 8 : 16; // 4 = Tag, 8 = Output, 16 = HTML
    this.raw = raw;
    this.value = value;
    this.line = line;
    this.begin = begin;
    this.end = end;
  }

  _createClass(Token, [{
    key: 'getText',
    value: function getText() {
      return this.raw;
    }
  }]);

  return Token;
}();

var TagToken = function (_Token) {
  _inherits(TagToken, _Token);

  function TagToken(raw, value, line, begin, end, name, args, indent, trim_left, trim_right, input, file) {
    _classCallCheck(this, TagToken);

    var _this = _possibleConstructorReturn(this, (TagToken.__proto__ || Object.getPrototypeOf(TagToken)).call(this, 'tag', raw, value, line, begin, end));

    _this.name = name;
    _this.args = args;
    _this.indent = indent;
    _this.trim_left = trim_left;
    _this.trim_right = trim_right;
    _this.input = input;
    _this.file = file;
    return _this;
  }

  return TagToken;
}(Token);

function parse(input, file, options) {
  assert(_.isString(input), 'illegal input');

  var rLiquid = /({%-?([\s\S]*?)-?%})|({{-?([\s\S]*?)-?}})/g;
  var currIndent = 0;
  var lineNumber = LineNumber(input);
  var lastMatchEnd = 0;
  var tokens = [];

  for (var match; match = rLiquid.exec(input); lastMatchEnd = rLiquid.lastIndex) {
    if (match.index > lastMatchEnd) {
      tokens.push(parseHTMLToken(lastMatchEnd, match.index));
    }
    tokens.push(match[1] ? parseTagToken(match[1], match[2].trim(), match.index) : parseValueToken(match[3], match[4].trim(), match.index));
  }
  if (input.length > lastMatchEnd) {
    tokens.push(parseHTMLToken(lastMatchEnd, input.length));
  }
  whiteSpaceCtrl(tokens, options);
  return tokens;

  function parseTagToken(raw, value, pos) {
    var match = value.match(lexical.tagLine);
    if (!match) {
      var errToken = new Token('tag', raw, value, lineNumber.get(pos), pos, pos + raw.length);
      errToken.input = input;
      errToken.file = file;
      throw new TokenizationError('illegal tag syntax', errToken);
    }
    var name = match[1];
    var args = match[2];
    return new TagToken(raw, value, lineNumber.get(pos), pos, pos + raw.length, name, args, currIndent, raw.slice(0, 3) === '{%-', raw.slice(-3) === '-%}', input, file);
  }

  function parseValueToken(raw, value, pos) {
    var token = new Token('value', raw, value, lineNumber.get(pos), pos, pos + raw.length);
    token.trim_left = raw.slice(0, 3) === '{{-';
    token.trim_right = raw.slice(-3) === '-}}';
    token.input = input;
    token.file = file;
    return token;
  }

  function parseHTMLToken(begin, end) {
    var htmlFragment = input.slice(begin, end);
    currIndent = _.last(htmlFragment.split('\n')).length;

    var token = new Token('html', htmlFragment, htmlFragment, lineNumber.get(begin), begin, end);
    token.input = input;
    token.file = file;
    return token;
  }
}

function LineNumber(html) {
  return {
    get: function get(pos) {
      return html.slice(0, pos).split('\n').length;
    }
  };
}

exports.parse = parse;
exports.whiteSpaceCtrl = whiteSpaceCtrl;
exports.Token = Token;
exports.TagToken = TagToken;

},{"./lexical.js":62,"./util/assert.js":70,"./util/error.js":71,"./util/underscore.js":75,"./whitespace-ctrl.js":77}],70:[function(require,module,exports){
'use strict';

var AssertionError = require('./error.js').AssertionError;

function assert(predicate, message) {
  if (!predicate) {
    message = message || 'expect ' + predicate + ' to be true';
    throw new AssertionError(message);
  }
}

module.exports = assert;

},{"./error.js":71}],71:[function(require,module,exports){
'use strict';

var _ = require('./underscore.js');

function initError() {
  this.name = this.constructor.name;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
}

function initLiquidError(err, token) {
  initError.call(this);

  this.input = token.input;
  this.line = token.line;
  this.file = token.file;

  var context = mkContext(token.input, token.line);
  this.message = mkMessage(err.message, token);
  this.stack = context + '\n' + (this.stack || this.message) + (err.stack ? '\nFrom ' + err.stack : '');
}

function TokenizationError(message, token) {
  initLiquidError.call(this, { message: message }, token);
}
TokenizationError.prototype = Object.create(Error.prototype);
TokenizationError.prototype.constructor = TokenizationError;

function ParseError(e, token) {
  _.assign(this, e);
  this.originalError = e;

  initLiquidError.call(this, e, token);
}
ParseError.prototype = Object.create(Error.prototype);
ParseError.prototype.constructor = ParseError;

function RenderError(e, tpl) {
  // return the original render error
  if (e instanceof RenderError) {
    return e;
  }
  _.assign(this, e);
  this.originalError = e;

  initLiquidError.call(this, e, tpl.token);
}
RenderError.prototype = Object.create(Error.prototype);
RenderError.prototype.constructor = RenderError;

function RenderBreakError(message) {
  initError.call(this);
  this.message = message + '';
}
RenderBreakError.prototype = Object.create(Error.prototype);
RenderBreakError.prototype.constructor = RenderBreakError;

function AssertionError(message) {
  initError.call(this);
  this.message = message + '';
}
AssertionError.prototype = Object.create(Error.prototype);
AssertionError.prototype.constructor = AssertionError;

function mkContext(input, line) {
  var lines = input.split('\n');
  var begin = Math.max(line - 2, 1);
  var end = Math.min(line + 3, lines.length);

  var context = _.range(begin, end + 1).map(function (l) {
    return [l === line ? '>> ' : '   ', align(l, end), '| ', lines[l - 1]].join('');
  }).join('\n');

  return context;
}

function align(n, max) {
  var length = (max + '').length;
  var str = n + '';
  var blank = Array(length - str.length).join(' ');
  return blank + str;
}

function mkMessage(msg, token) {
  msg = msg || '';
  if (token.file) {
    msg += ', file:' + token.file;
  }
  if (token.line) {
    msg += ', line:' + token.line;
  }
  return msg;
}

module.exports = {
  TokenizationError: TokenizationError,
  ParseError: ParseError,
  RenderBreakError: RenderBreakError,
  AssertionError: AssertionError,
  RenderError: RenderError
};

},{"./underscore.js":75}],72:[function(require,module,exports){
'use strict';

var fs = require('fs');

function readFileAsync(filepath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filepath, 'utf8', function (err, content) {
      err ? reject(err) : resolve(content);
    });
  });
};

function statFileAsync(path) {
  return new Promise(function (resolve, reject) {
    fs.stat(path, function (err, stat) {
      return err ? reject(err) : resolve(stat);
    });
  });
};

module.exports = {
  readFileAsync: readFileAsync,
  statFileAsync: statFileAsync
};

},{"fs":7}],73:[function(require,module,exports){
'use strict';

var Promise = require('any-promise');

/*
 * Call functions in serial until someone resolved.
 * @param {Array} iterable the array to iterate with.
 * @param {Array} iteratee returns a new promise.
 * The iteratee is invoked with three arguments: (value, index, iterable).
 */
function anySeries(iterable, iteratee) {
  var ret = Promise.reject(new Error('init'));
  iterable.forEach(function (item, idx) {
    ret = ret.catch(function (e) {
      return iteratee(item, idx, iterable);
    });
  });
  return ret;
}

/*
 * Call functions in serial until someone rejected.
 * @param {Array} iterable the array to iterate with.
 * @param {Array} iteratee returns a new promise.
 * The iteratee is invoked with three arguments: (value, index, iterable).
 */
function mapSeries(iterable, iteratee) {
  var ret = Promise.resolve('init');
  var result = [];
  iterable.forEach(function (item, idx) {
    ret = ret.then(function () {
      return iteratee(item, idx, iterable);
    }).then(function (x) {
      return result.push(x);
    });
  });
  return ret.then(function () {
    return result;
  });
}

exports.anySeries = anySeries;
exports.mapSeries = mapSeries;

},{"any-promise":3}],74:[function(require,module,exports){
'use strict';

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var suffixes = {
  1: 'st',
  2: 'nd',
  3: 'rd',
  'default': 'th'

  // prototype extensions
};var _date = {
  daysInMonth: function daysInMonth(d) {
    var feb = _date.isLeapYear(d) ? 29 : 28;
    return [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  },

  getDayOfYear: function getDayOfYear(d) {
    var num = 0;
    for (var i = 0; i < d.getMonth(); ++i) {
      num += _date.daysInMonth(d)[i];
    }
    return num + d.getDate();
  },

  // Startday is an integer of which day to start the week measuring from
  // TODO: that comment was retarted. fix it.
  getWeekOfYear: function getWeekOfYear(d, startDay) {
    // Skip to startDay of this week
    var now = this.getDayOfYear(d) + (startDay - d.getDay());
    // Find the first startDay of the year
    var jan1 = new Date(d.getFullYear(), 0, 1);
    var then = 7 - jan1.getDay() + startDay;
    return _number.pad(Math.floor((now - then) / 7) + 1, 2);
  },

  isLeapYear: function isLeapYear(d) {
    var year = d.getFullYear();
    return !!((year & 3) === 0 && (year % 100 || year % 400 === 0 && year));
  },

  getSuffix: function getSuffix(d) {
    var str = d.getDate().toString();
    var index = parseInt(str.slice(-1));
    return suffixes[index] || suffixes['default'];
  },

  century: function century(d) {
    return parseInt(d.getFullYear().toString().substring(0, 2), 10);
  }
};

var _number = {
  pad: function pad(value, size, ch) {
    if (!ch) ch = '0';
    var result = value.toString();
    var pad = size - result.length;

    while (pad-- > 0) {
      result = ch + result;
    }

    return result;
  }
};

var formatCodes = {
  a: function a(d) {
    return dayNamesShort[d.getDay()];
  },
  A: function A(d) {
    return dayNames[d.getDay()];
  },
  b: function b(d) {
    return monthNamesShort[d.getMonth()];
  },
  B: function B(d) {
    return monthNames[d.getMonth()];
  },
  c: function c(d) {
    return d.toLocaleString();
  },
  C: function C(d) {
    return _date.century(d);
  },
  d: function d(_d) {
    return _number.pad(_d.getDate(), 2);
  },
  e: function e(d) {
    return _number.pad(d.getDate(), 2, ' ');
  },
  H: function H(d) {
    return _number.pad(d.getHours(), 2);
  },
  I: function I(d) {
    return _number.pad(d.getHours() % 12 || 12, 2);
  },
  j: function j(d) {
    return _number.pad(_date.getDayOfYear(d), 3);
  },
  k: function k(d) {
    return _number.pad(d.getHours(), 2, ' ');
  },
  l: function l(d) {
    return _number.pad(d.getHours() % 12 || 12, 2, ' ');
  },
  L: function L(d) {
    return _number.pad(d.getMilliseconds(), 3);
  },
  m: function m(d) {
    return _number.pad(d.getMonth() + 1, 2);
  },
  M: function M(d) {
    return _number.pad(d.getMinutes(), 2);
  },
  p: function p(d) {
    return d.getHours() < 12 ? 'AM' : 'PM';
  },
  P: function P(d) {
    return d.getHours() < 12 ? 'am' : 'pm';
  },
  q: function q(d) {
    return _date.getSuffix(d);
  },
  s: function s(d) {
    return Math.round(d.valueOf() / 1000);
  },
  S: function S(d) {
    return _number.pad(d.getSeconds(), 2);
  },
  u: function u(d) {
    return d.getDay() || 7;
  },
  U: function U(d) {
    return _date.getWeekOfYear(d, 0);
  },
  w: function w(d) {
    return d.getDay();
  },
  W: function W(d) {
    return _date.getWeekOfYear(d, 1);
  },
  x: function x(d) {
    return d.toLocaleDateString();
  },
  X: function X(d) {
    return d.toLocaleTimeString();
  },
  y: function y(d) {
    return d.getFullYear().toString().substring(2, 4);
  },
  Y: function Y(d) {
    return d.getFullYear();
  },
  z: function z(d) {
    var tz = d.getTimezoneOffset() / 60 * 100;
    return (tz > 0 ? '-' : '+') + _number.pad(Math.abs(tz), 4);
  },
  '%': function _() {
    return '%';
  }
};
formatCodes.h = formatCodes.b;
formatCodes.N = formatCodes.L;

var strftime = function strftime(d, format) {
  var output = '';
  var remaining = format;

  while (true) {
    var r = /%./g;
    var results = r.exec(remaining);

    // No more format codes. Add the remaining text and return
    if (!results) {
      return output + remaining;
    }

    // Add the preceding text
    output += remaining.slice(0, r.lastIndex - 2);
    remaining = remaining.slice(r.lastIndex);

    // Add the format code
    var ch = results[0].charAt(1);
    var func = formatCodes[ch];
    output += func ? func.call(this, d) : '%' + ch;
  }
};

module.exports = strftime;

},{}],75:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var toStr = Object.prototype.toString;

/*
 * Checks if value is classified as a String primitive or object.
 * @param {any} value The value to check.
 * @return {Boolean} Returns true if value is a string, else false.
 */
function isString(value) {
  return value instanceof String || typeof value === 'string';
}

function isNil(value) {
  return value === null || value === undefined;
}

function isArray(value) {
  // be compatible with IE 8
  return toStr.call(value) === '[object Array]';
}

function isError(value) {
  var signature = Object.prototype.toString.call(value);
  // [object XXXError]
  return signature.substr(-6, 5) === 'Error' || typeof value.message === 'string' && typeof value.name === 'string';
}

/*
 * Iterates over own enumerable string keyed properties of an object and invokes iteratee for each property.
 * The iteratee is invoked with three arguments: (value, key, object).
 * Iteratee functions may exit iteration early by explicitly returning false.
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @return {Object} Returns object.
 */
function forOwn(object, iteratee) {
  object = object || {};
  for (var k in object) {
    if (object.hasOwnProperty(k)) {
      if (iteratee(object[k], k, object) === false) break;
    }
  }
  return object;
}

/*
 * Assigns own enumerable string keyed properties of source objects to the destination object.
 * Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * Note: This method mutates object and is loosely based on Object.assign.
 *
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @return {Object} Returns object.
 */
function assign(object) {
  object = isObject(object) ? object : {};
  var srcs = Array.prototype.slice.call(arguments, 1);
  srcs.forEach(function (src) {
    _assignBinary(object, src);
  });
  return object;
}

function _assignBinary(dst, src) {
  forOwn(src, function (v, k) {
    dst[k] = v;
  });
  return dst;
}

function last(arr) {
  return arr[arr.length - 1];
}

function uniq(arr) {
  var u = {};
  var a = [];
  for (var i = 0, l = arr.length; i < l; ++i) {
    if (u.hasOwnProperty(arr[i])) {
      continue;
    }
    a.push(arr[i]);
    u[arr[i]] = 1;
  }
  return a;
}

/*
 * Checks if value is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, new Number(0), and new String(''))
 * @param {any} value The value to check.
 * @return {Boolean} Returns true if value is an object, else false.
 */
function isObject(value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return value != null && (type === 'object' || type === 'function');
}

/*
 * A function to create flexibly-numbered lists of integers,
 * handy for each and map loops. start, if omitted, defaults to 0; step defaults to 1.
 * Returns a list of integers from start (inclusive) to stop (exclusive),
 * incremented (or decremented) by step, exclusive.
 * Note that ranges that stop before they start are considered to be zero-length instead of
 * negative — if you'd like a negative range, use a negative step.
 */
function range(start, stop, step) {
  if (arguments.length === 1) {
    stop = start;
    start = 0;
  }
  step = step || 1;

  var arr = [];
  for (var i = start; i < stop; i += step) {
    arr.push(i);
  }
  return arr;
}

// lang
exports.isString = isString;
exports.isObject = isObject;
exports.isArray = isArray;
exports.isNil = isNil;
exports.isError = isError;

// array
exports.range = range;
exports.last = last;

// object
exports.forOwn = forOwn;
exports.assign = assign;
exports.uniq = uniq;

},{}],76:[function(require,module,exports){
'use strict';

var resolve = require('resolve-url');
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^/]+?|)(\.[^./]*|))(?:[/]*)$/;
var urlRe = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/;

// https://github.com/jinder/path/blob/master/path.js#L567
exports.extname = function (path) {
  return splitPathRe.exec(path).slice(1)[3];
};

// https://www.npmjs.com/package/is-url
exports.valid = function (path) {
  return urlRe.test(path);
};

exports.resolve = function (root, path) {
  if (Object.prototype.toString.call(root) === '[object Array]') {
    root = root[0];
  }
  if (root && root.charAt(root.length - 1) !== '/') {
    root += '/';
  }
  return resolve(root, path);
};

},{"resolve-url":51}],77:[function(require,module,exports){
'use strict';

var _ = require('./util/underscore.js');

function whiteSpaceCtrl(tokens, options) {
  options = _.assign({ greedy: true }, options);
  var inRaw = false;

  tokens.forEach(function (token, i) {
    if (shouldTrimLeft(token, inRaw, options)) {
      trimLeft(tokens[i - 1], options.greedy);
    }

    if (token.type === 'tag' && token.name === 'raw') inRaw = true;
    if (token.type === 'tag' && token.name === 'endraw') inRaw = false;

    if (shouldTrimRight(token, inRaw, options)) {
      trimRight(tokens[i + 1], options.greedy);
    }
  });
}

function shouldTrimLeft(token, inRaw, options) {
  if (inRaw) return false;
  if (token.type === 'tag') return token.trim_left || options.trim_tag_left;
  if (token.type === 'value') return token.trim_left || options.trim_value_left;
}

function shouldTrimRight(token, inRaw, options) {
  if (inRaw) return false;
  if (token.type === 'tag') return token.trim_right || options.trim_tag_right;
  if (token.type === 'value') return token.trim_right || options.trim_value_right;
}

function trimLeft(token, greedy) {
  if (!token || token.type !== 'html') return;

  var rLeft = greedy ? /\s+$/g : /[\t\r ]*$/g;
  token.value = token.value.replace(rLeft, '');
}

function trimRight(token, greedy) {
  if (!token || token.type !== 'html') return;

  var rRight = greedy ? /^\s+/g : /^[\t\r ]*\n?/g;
  token.value = token.value.replace(rRight, '');
}

module.exports = whiteSpaceCtrl;

},{"./util/underscore.js":75}],78:[function(require,module,exports){
'use strict';

var Liquid = require('..');
var lexical = Liquid.lexical;
var Promise = require('any-promise');
var re = new RegExp('(' + lexical.identifier.source + ')\\s*=(.*)');
var assert = require('../src/util/assert.js');

module.exports = function (liquid) {
  liquid.registerTag('assign', {
    parse: function parse(token) {
      var match = token.args.match(re);
      assert(match, 'illegal token ' + token.raw);
      this.key = match[1];
      this.value = match[2];
    },
    render: function render(scope) {
      scope.set(this.key, liquid.evalValue(this.value, scope));
      return Promise.resolve('');
    }
  });
};

},{"..":2,"../src/util/assert.js":70,"any-promise":3}],79:[function(require,module,exports){
'use strict';

var Liquid = require('..');
var lexical = Liquid.lexical;
var Promise = require('any-promise');
var re = new RegExp('(' + lexical.identifier.source + ')\\s*=(.*)');
var assert = require('../src/util/assert.js');

module.exports = function (liquid) {
  liquid.registerTag('assignVar', {
    parse: function parse(token) {
      var match = token.args.match(re);
      assert(match, 'illegal token ' + token.raw);
      this.key = match[1];
      this.value = match[2];
    },
    render: function render(scope) {
      var value = liquid.evalValue(this.value, scope);
      var actualValue = scope.get(value);
      scope.set(this.key, actualValue);
      return Promise.resolve('');
    }
  });
};

},{"..":2,"../src/util/assert.js":70,"any-promise":3}],80:[function(require,module,exports){
'use strict';

var Liquid = require('..');
var lexical = Liquid.lexical;
var re = new RegExp('(' + lexical.identifier.source + ')');
var assert = require('../src/util/assert.js');

module.exports = function (liquid) {
  liquid.registerTag('capture', {
    parse: function parse(tagToken, remainTokens) {
      var _this = this;

      var match = tagToken.args.match(re);
      assert(match, tagToken.args + ' not valid identifier');

      this.variable = match[1];
      this.templates = [];

      var stream = liquid.parser.parseStream(remainTokens);
      stream.on('tag:endcapture', function (token) {
        return stream.stop();
      }).on('template', function (tpl) {
        return _this.templates.push(tpl);
      }).on('end', function (x) {
        throw new Error('tag ' + tagToken.raw + ' not closed');
      });
      stream.start();
    },
    render: function render(scope, hash) {
      var _this2 = this;

      return liquid.renderer.renderTemplates(this.templates, scope).then(function (html) {
        scope.set(_this2.variable, html);
      });
    }
  });
};

},{"..":2,"../src/util/assert.js":70}],81:[function(require,module,exports){
'use strict';

var Liquid = require('..');

module.exports = function (liquid) {
  liquid.registerTag('case', {

    parse: function parse(tagToken, remainTokens) {
      var _this = this;

      this.cond = tagToken.args;
      this.cases = [];
      this.elseTemplates = [];

      var p = [];
      var stream = liquid.parser.parseStream(remainTokens).on('tag:when', function (token) {
        _this.cases.push({
          val: token.args,
          templates: p = []
        });
      }).on('tag:else', function () {
        return p = _this.elseTemplates;
      }).on('tag:endcase', function (token) {
        return stream.stop();
      }).on('template', function (tpl) {
        return p.push(tpl);
      }).on('end', function (x) {
        throw new Error('tag ' + tagToken.raw + ' not closed');
      });

      stream.start();
    },

    render: function render(scope, hash) {
      for (var i = 0; i < this.cases.length; i++) {
        var branch = this.cases[i];
        var val = Liquid.evalExp(branch.val, scope);
        var cond = Liquid.evalExp(this.cond, scope);
        if (val === cond) {
          return liquid.renderer.renderTemplates(branch.templates, scope);
        }
      }
      return liquid.renderer.renderTemplates(this.elseTemplates, scope);
    }
  });
};

},{"..":2}],82:[function(require,module,exports){
'use strict';

module.exports = function (liquid) {
  liquid.registerTag('comment', {
    parse: function parse(tagToken, remainTokens) {
      var stream = liquid.parser.parseStream(remainTokens);
      stream.on('token', function (token) {
        if (token.name === 'endcomment') stream.stop();
      }).on('end', function (x) {
        throw new Error('tag ' + tagToken.raw + ' not closed');
      });
      stream.start();
    }
  });
};

},{}],83:[function(require,module,exports){
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var assert = require("assert");
module.exports = function (liquid) {
  liquid.registerTag("computeColumn", {
    parse: function parse(tagToken, remainTokens) {
      var _this = this;

      var args = tagToken.args.split(" ");
      assert(args.length === 2, "Syntax Error in 'computeColumn' - Valid syntax: computeColumn [table_name] [column_name]");
      this.tableName = args[0];
      this.columnName = args[1];
      this.templates = [];
      var stream = liquid.parser.parseStream(remainTokens);
      stream.on("tag:endcomputeColumn", function () {
        return stream.stop();
      }).on("template", function (tpl) {
        return _this.templates.push(tpl);
      }).on("end", function () {
        throw new Error("tag " + tagToken.raw + " not closed");
      });
      stream.start();
    },
    render: async function render(context) {
      var _this2 = this;

      var table = context.get(this.tableName);
      assert(Array.isArray(table), this.tableName + " is not an array");

      // storing originalContext to revert the variables changed other than table variable in the end
      var originalContext = context.getAll();

      for (var i = 0; i < table.length; i++) {
        var row = table[i];
        // creating a local temporary scope in context for row, so self keyword can refer to row
        context.push({ self: row, $$answer: undefined });
        try {
          await liquid.renderer.renderTemplates(this.templates, context);
          var finalResult = context.get("$$answer");
          table[i] = Object.assign({}, row, _defineProperty({}, this.columnName, finalResult));
        } catch (err) {
          throw err;
        } finally {
          context.pop();

          // Reset context to original state after each iteration for all variables other than table variable
          Object.keys(originalContext).forEach(function (key) {
            if (key !== _this2.tableName) {
              context.set(key, originalContext[key]);
            }
          });
        }
      }

      context.set(this.tableName, table);
      return "";
    }
  });
};

},{"assert":6}],84:[function(require,module,exports){
'use strict';

var Liquid = require('..');
var Promise = require('any-promise');
var lexical = Liquid.lexical;
var groupRE = new RegExp('^(?:(' + lexical.value.source + ')\\s*:\\s*)?(.*)$');
var candidatesRE = new RegExp(lexical.value.source, 'g');
var assert = require('../src/util/assert.js');

module.exports = function (liquid) {
  liquid.registerTag('cycle', {

    parse: function parse(tagToken, remainTokens) {
      var match = groupRE.exec(tagToken.args);
      assert(match, 'illegal tag: ' + tagToken.raw);

      this.group = match[1] || '';
      var candidates = match[2];

      this.candidates = [];

      while (match = candidatesRE.exec(candidates)) {
        this.candidates.push(match[0]);
      }
      assert(this.candidates.length, 'empty candidates: ' + tagToken.raw);
    },

    render: function render(scope, hash) {
      var group = Liquid.evalValue(this.group, scope);
      var fingerprint = 'cycle:' + group + ':' + this.candidates.join(',');

      var groups = scope.opts.groups = scope.opts.groups || {};
      var idx = groups[fingerprint];

      if (idx === undefined) {
        idx = groups[fingerprint] = 0;
      }

      var candidate = this.candidates[idx];
      idx = (idx + 1) % this.candidates.length;
      groups[fingerprint] = idx;

      return Promise.resolve(Liquid.evalValue(candidate, scope));
    }
  });
};

},{"..":2,"../src/util/assert.js":70,"any-promise":3}],85:[function(require,module,exports){
'use strict';

var Liquid = require('..');
var lexical = Liquid.lexical;
var assert = require('../src/util/assert.js');

module.exports = function (liquid) {
  liquid.registerTag('decrement', {
    parse: function parse(token) {
      var match = token.args.match(lexical.identifier);
      assert(match, 'illegal identifier ' + token.args);
      this.variable = match[0];
    },
    render: function render(scope, hash) {
      var v = scope.get(this.variable);
      if (typeof v !== 'number') v = 0;
      scope.set(this.variable, v - 1);
    }
  });
};

},{"..":2,"../src/util/assert.js":70}],86:[function(require,module,exports){
'use strict';

var Liquid = require('..');
var lexical = Liquid.lexical;
var mapSeries = require('../src/util/promise.js').mapSeries;
var _ = require('../src/util/underscore.js');
var RenderBreakError = Liquid.Types.RenderBreakError;
var assert = require('../src/util/assert.js');
var re = new RegExp('^(' + lexical.identifier.source + ')\\s+in\\s+' + ('(' + lexical.value.source + ')') + ('(?:\\s+' + lexical.hash.source + ')*') + '(?:\\s+(reversed))?' + ('(?:\\s+' + lexical.hash.source + ')*$'));

module.exports = function (liquid) {
  liquid.registerTag('for', {

    parse: function parse(tagToken, remainTokens) {
      var _this = this;

      var match = re.exec(tagToken.args);
      assert(match, 'illegal tag: ' + tagToken.raw);
      this.variable = match[1];
      this.collection = match[2];
      this.reversed = !!match[3];

      this.templates = [];
      this.elseTemplates = [];

      var p;
      var stream = liquid.parser.parseStream(remainTokens).on('start', function () {
        return p = _this.templates;
      }).on('tag:else', function () {
        return p = _this.elseTemplates;
      }).on('tag:endfor', function () {
        return stream.stop();
      }).on('template', function (tpl) {
        return p.push(tpl);
      }).on('end', function () {
        throw new Error('tag ' + tagToken.raw + ' not closed');
      });

      stream.start();
    },

    render: function render(scope, hash) {
      var _this2 = this;

      var collection = Liquid.evalExp(this.collection, scope);

      if (!Array.isArray(collection)) {
        if (_.isString(collection) && collection.length > 0) {
          collection = [collection];
        } else if (_.isObject(collection)) {
          collection = Object.keys(collection).map(function (key) {
            return [key, collection[key]];
          });
        }
      }
      if (!Array.isArray(collection) || !collection.length) {
        return liquid.renderer.renderTemplates(this.elseTemplates, scope);
      }

      var length = collection.length;
      var offset = hash.offset || 0;
      var limit = hash.limit === undefined ? collection.length : hash.limit;

      collection = collection.slice(offset, offset + limit);
      if (this.reversed) collection.reverse();

      var contexts = collection.map(function (item, i) {
        var ctx = {};
        ctx[_this2.variable] = item;
        ctx.forloop = {
          first: i === 0,
          index: i + 1,
          index0: i,
          last: i === length - 1,
          length: length,
          rindex: length - i,
          rindex0: length - i - 1
        };
        return ctx;
      });

      var html = '';
      return mapSeries(contexts, function (context) {
        return Promise.resolve().then(function () {
          return scope.push(context);
        }).then(function () {
          return liquid.renderer.renderTemplates(_this2.templates, scope);
        }).then(function (partial) {
          return html += partial;
        }).catch(function (e) {
          if (e instanceof RenderBreakError) {
            html += e.resolvedHTML;
            if (e.message === 'continue') return;
          }
          throw e;
        }).then(function () {
          return scope.pop();
        });
      }).catch(function (e) {
        if (e instanceof RenderBreakError && e.message === 'break') {
          return;
        }
        throw e;
      }).then(function () {
        return html;
      });
    }
  });
};

},{"..":2,"../src/util/assert.js":70,"../src/util/promise.js":73,"../src/util/underscore.js":75}],87:[function(require,module,exports){
'use strict';

var Liquid = require('..');

module.exports = function (liquid) {
  liquid.registerTag('if', {

    parse: function parse(tagToken, remainTokens) {
      var _this = this;

      this.branches = [];
      this.elseTemplates = [];

      var p;
      var stream = liquid.parser.parseStream(remainTokens).on('start', function () {
        return _this.branches.push({
          cond: tagToken.args,
          templates: p = []
        });
      }).on('tag:elsif', function (token) {
        _this.branches.push({
          cond: token.args,
          templates: p = []
        });
      }).on('tag:else', function () {
        return p = _this.elseTemplates;
      }).on('tag:endif', function (token) {
        return stream.stop();
      }).on('template', function (tpl) {
        return p.push(tpl);
      }).on('end', function (x) {
        throw new Error('tag ' + tagToken.raw + ' not closed');
      });

      stream.start();
    },

    render: function render(scope, hash) {
      for (var i = 0; i < this.branches.length; i++) {
        var branch = this.branches[i];
        var cond = Liquid.evalExp(branch.cond, scope);
        if (Liquid.isTruthy(cond)) {
          return liquid.renderer.renderTemplates(branch.templates, scope);
        }
      }
      return liquid.renderer.renderTemplates(this.elseTemplates, scope);
    }
  });
};

},{"..":2}],88:[function(require,module,exports){
'use strict';

var Liquid = require('..');
var lexical = Liquid.lexical;
var withRE = new RegExp('with\\s+(' + lexical.value.source + ')');
var assert = require('../src/util/assert.js');

module.exports = function (liquid) {
  liquid.registerTag('include', {
    parse: function parse(token) {
      var match = lexical.value.exec(token.args);
      assert(match, 'illegal token ' + token.raw);
      this.value = match[0];

      match = withRE.exec(token.args);
      if (match) {
        this.with = match[1];
      }
    },
    render: function render(scope, hash) {
      var filepath = this.value;
      if (scope.opts.dynamicPartials) {
        filepath = Liquid.evalValue(this.value, scope);
      }

      var originBlocks = scope.opts.blocks;
      var originBlockMode = scope.opts.blockMode;
      scope.opts.blocks = {};
      scope.opts.blockMode = 'output';

      if (this.with) {
        hash[filepath] = Liquid.evalValue(this.with, scope);
      }
      return liquid.getTemplate(filepath, scope.opts.root).then(function (templates) {
        scope.push(hash);
        return liquid.renderer.renderTemplates(templates, scope);
      }).then(function (html) {
        scope.pop();
        scope.opts.blocks = originBlocks;
        scope.opts.blockMode = originBlockMode;
        return html;
      });
    }
  });
};

},{"..":2,"../src/util/assert.js":70}],89:[function(require,module,exports){
'use strict';

var Liquid = require('..');
var assert = require('../src/util/assert.js');
var lexical = Liquid.lexical;

module.exports = function (liquid) {
  liquid.registerTag('increment', {
    parse: function parse(token) {
      var match = token.args.match(lexical.identifier);
      assert(match, 'illegal identifier ' + token.args);
      this.variable = match[0];
    },
    render: function render(scope, hash) {
      var v = scope.get(this.variable);
      if (typeof v !== 'number') v = 0;
      scope.set(this.variable, v + 1);
    }
  });
};

},{"..":2,"../src/util/assert.js":70}],90:[function(require,module,exports){
"use strict";

module.exports = function (engine) {
  require("./assign.js")(engine);
  require("./assignVar.js")(engine);
  require("./capture.js")(engine);
  require("./case.js")(engine);
  require("./comment.js")(engine);
  require("./cycle.js")(engine);
  require("./decrement.js")(engine);
  require("./for.js")(engine);
  require("./if.js")(engine);
  require("./include.js")(engine);
  require("./increment.js")(engine);
  require("./layout.js")(engine);
  require("./raw.js")(engine);
  require("./tablerow.js")(engine);
  require("./unless.js")(engine);
  require("./parseAssign.js")(engine);
  require("./computeColumn.js")(engine);
};

},{"./assign.js":78,"./assignVar.js":79,"./capture.js":80,"./case.js":81,"./comment.js":82,"./computeColumn.js":83,"./cycle.js":84,"./decrement.js":85,"./for.js":86,"./if.js":87,"./include.js":88,"./increment.js":89,"./layout.js":91,"./parseAssign.js":92,"./raw.js":93,"./tablerow.js":94,"./unless.js":95}],91:[function(require,module,exports){
'use strict';

var Liquid = require('..');
var Promise = require('any-promise');
var lexical = Liquid.lexical;
var assert = require('../src/util/assert.js');

/*
 * blockMode:
 * * "store": store rendered html into blocks
 * * "output": output rendered html
 */

module.exports = function (liquid) {
  liquid.registerTag('layout', {
    parse: function parse(token, remainTokens) {
      var match = lexical.value.exec(token.args);
      assert(match, 'illegal token ' + token.raw);

      this.layout = match[0];
      this.tpls = liquid.parser.parse(remainTokens);
    },
    render: function render(scope, hash) {
      var layout = scope.opts.dynamicPartials ? Liquid.evalValue(this.layout, scope) : this.layout;

      // render the remaining tokens immediately
      scope.opts.blockMode = 'store';
      return liquid.renderer.renderTemplates(this.tpls, scope).then(function (html) {
        if (scope.opts.blocks[''] === undefined) {
          scope.opts.blocks[''] = html;
        }
        return liquid.getTemplate(layout, scope.opts.root);
      }).then(function (templates) {
        // push the hash
        scope.push(hash);
        scope.opts.blockMode = 'output';
        return liquid.renderer.renderTemplates(templates, scope);
      })
      // pop the hash
      .then(function (partial) {
        scope.pop();
        return partial;
      });
    }
  });

  liquid.registerTag('block', {
    parse: function parse(token, remainTokens) {
      var _this = this;

      var match = /\w+/.exec(token.args);
      this.block = match ? match[0] : '';

      this.tpls = [];
      var stream = liquid.parser.parseStream(remainTokens).on('tag:endblock', function () {
        return stream.stop();
      }).on('template', function (tpl) {
        return _this.tpls.push(tpl);
      }).on('end', function () {
        throw new Error('tag ' + token.raw + ' not closed');
      });
      stream.start();
    },
    render: function render(scope) {
      var _this2 = this;

      return Promise.resolve(scope.opts.blocks[this.block]).then(function (html) {
        return html === undefined
        // render default block
        ? liquid.renderer.renderTemplates(_this2.tpls, scope)
        // use child-defined block
        : html;
      }).then(function (html) {
        if (scope.opts.blockMode === 'store') {
          scope.opts.blocks[_this2.block] = html;
          return '';
        }
        return html;
      });
    }
  });
};

},{"..":2,"../src/util/assert.js":70,"any-promise":3}],92:[function(require,module,exports){
"use strict";

var Liquid = require("..");
var lexical = Liquid.lexical;
var Promise = require("any-promise");
var re = new RegExp("(" + lexical.identifier.source + ")\\s*=(.*)");
var assert = require("../src/util/assert.js");

function parseFromString(objStr) {
  var jsonStr = "{\"val\": " + objStr + "}";
  return JSON.parse(jsonStr).val;
}

/**
 * This tag can be used to assign object and arrays to variables directly
 * in liquid code. This modifies the scope to add the parsed object or array
 * against the provided key.
 *
 * Usage:
 * {% parseAssign arr = "[1,2,3]" %}
 * {% parseAssign obj = '{"prop1": prop1Val, "prop2": prop2Val}' %}
 *
 * Result:
 * Scope now has
 * {
 *  ...,
 *  arr: [1,2,3],
 *  obj: {
 *    prop1: prop1Val,
 *    prop2: prop2Val
 *  }
 * }
 *
 * Note: The value being assigned should be valid JSON.
 * Invalid JSON will results in exception being thrown.
 */
module.exports = function (liquid) {
  liquid.registerTag("parseAssign", {
    parse: function parse(token) {
      var match = token.args.match(re);
      assert(match, "illegal token " + token.raw);
      this.key = match[1];
      this.value = match[2];
    },
    render: function render(scope) {
      var value = liquid.evalValue(this.value, scope);
      var actualValue = parseFromString(value);
      scope.set(this.key, actualValue);
      return Promise.resolve("");
    }
  });
};

},{"..":2,"../src/util/assert.js":70,"any-promise":3}],93:[function(require,module,exports){
'use strict';

var Promise = require('any-promise');

module.exports = function (liquid) {
  liquid.registerTag('raw', {
    parse: function parse(tagToken, remainTokens) {
      var _this = this;

      this.tokens = [];

      var stream = liquid.parser.parseStream(remainTokens);
      stream.on('token', function (token) {
        if (token.name === 'endraw') stream.stop();else _this.tokens.push(token);
      }).on('end', function (x) {
        throw new Error('tag ' + tagToken.raw + ' not closed');
      });
      stream.start();
    },
    render: function render(scope, hash) {
      var tokens = this.tokens.map(function (token) {
        return token.raw;
      }).join('');
      return Promise.resolve(tokens);
    }
  });
};

},{"any-promise":3}],94:[function(require,module,exports){
'use strict';

var Liquid = require('..');
var mapSeries = require('../src/util/promise.js').mapSeries;
var lexical = Liquid.lexical;
var assert = require('../src/util/assert.js');
var re = new RegExp('^(' + lexical.identifier.source + ')\\s+in\\s+' + ('(' + lexical.value.source + ')') + ('(?:\\s+' + lexical.hash.source + ')*$'));

module.exports = function (liquid) {
  liquid.registerTag('tablerow', {

    parse: function parse(tagToken, remainTokens) {
      var _this = this;

      var match = re.exec(tagToken.args);
      assert(match, 'illegal tag: ' + tagToken.raw);

      this.variable = match[1];
      this.collection = match[2];
      this.templates = [];

      var p;
      var stream = liquid.parser.parseStream(remainTokens).on('start', function () {
        return p = _this.templates;
      }).on('tag:endtablerow', function (token) {
        return stream.stop();
      }).on('template', function (tpl) {
        return p.push(tpl);
      }).on('end', function () {
        throw new Error('tag ' + tagToken.raw + ' not closed');
      });

      stream.start();
    },

    render: function render(scope, hash) {
      var _this2 = this;

      var collection = Liquid.evalExp(this.collection, scope) || [];

      var html = '<table>';
      var offset = hash.offset || 0;
      var limit = hash.limit === undefined ? collection.length : hash.limit;

      var cols = hash.cols;
      var row;
      var col;
      if (!cols) throw new Error('illegal cols: ' + cols);

      // build array of arguments to pass to sequential promises...
      collection = collection.slice(offset, offset + limit);
      var contexts = [];
      collection.some(function (item, i) {
        var ctx = {};
        ctx[_this2.variable] = item;
        contexts.push(ctx);
      });

      return mapSeries(contexts, function (context, idx) {
        row = Math.floor(idx / cols) + 1;
        col = idx % cols + 1;
        if (col === 1) {
          if (row !== 1) {
            html += '</tr>';
          }
          html += '<tr class="row' + row + '">';
        }

        html += '<td class="col' + col + '">';
        scope.push(context);
        return liquid.renderer.renderTemplates(_this2.templates, scope).then(function (partial) {
          scope.pop(context);
          html += partial;
          html += '</td>';
          return html;
        });
      }).then(function () {
        if (row > 0) {
          html += '</tr>';
        }
        html += '</table>';
        return html;
      });
    }
  });
};

},{"..":2,"../src/util/assert.js":70,"../src/util/promise.js":73}],95:[function(require,module,exports){
'use strict';

var Liquid = require('..');

module.exports = function (liquid) {
  liquid.registerTag('unless', {
    parse: function parse(tagToken, remainTokens) {
      var _this = this;

      this.templates = [];
      this.elseTemplates = [];
      var p;
      var stream = liquid.parser.parseStream(remainTokens).on('start', function (x) {
        p = _this.templates;
        _this.cond = tagToken.args;
      }).on('tag:else', function () {
        return p = _this.elseTemplates;
      }).on('tag:endunless', function (token) {
        return stream.stop();
      }).on('template', function (tpl) {
        return p.push(tpl);
      }).on('end', function (x) {
        throw new Error('tag ' + tagToken.raw + ' not closed');
      });

      stream.start();
    },

    render: function render(scope, hash) {
      var cond = Liquid.evalExp(this.cond, scope);
      return Liquid.isFalsy(cond) ? liquid.renderer.renderTemplates(this.templates, scope) : liquid.renderer.renderTemplates(this.elseTemplates, scope);
    }
  });
};

},{"..":2}]},{},[2])(2)
});
