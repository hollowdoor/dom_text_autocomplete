(function () {
'use strict';

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

var isArray_1 = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

var isWindow = function (obj) {

  if (obj == null) {
    return false;
  }

  var o = Object(obj);

  return o === o.window;
};

var isFunction_1 = isFunction;

var toString = Object.prototype.toString;

function isFunction (fn) {
  var string = toString.call(fn);
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
}

var isArrayLike = function (obj) {

  if (!obj) {
    return false;
  }

  if (isArray_1(obj)) {
    return true;
  }

  if (isFunction_1(obj) || isWindow(obj)) {
    return false;
  }

  obj = Object(obj);

  var length = 'length' in obj && obj.length;

  if (obj.nodeType === 1 && length) {
    return true;
  }

  return length === 0 ||
    typeof length === 'number' && length > 0 && ( length - 1 ) in obj;
};

// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: http://www.ecma-international.org/ecma-262/6.0/#sec-array.from
var polyfill = (function() {
  var isCallable = function(fn) {
    return typeof fn === 'function';
  };
  var toInteger = function (value) {
    var number = Number(value);
    if (isNaN(number)) { return 0; }
    if (number === 0 || !isFinite(number)) { return number; }
    return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
  };
  var maxSafeInteger = Math.pow(2, 53) - 1;
  var toLength = function (value) {
    var len = toInteger(value);
    return Math.min(Math.max(len, 0), maxSafeInteger);
  };
  var iteratorProp = function(value) {
    if(value != null) {
      if(['string','number','boolean','symbol'].indexOf(typeof value) > -1){
        return Symbol.iterator;
      } else if (
        (typeof Symbol !== 'undefined') &&
        ('iterator' in Symbol) &&
        (Symbol.iterator in value)
      ) {
        return Symbol.iterator;
      }
      // Support "@@iterator" placeholder, Gecko 27 to Gecko 35
      else if ('@@iterator' in value) {
        return '@@iterator';
      }
    }
  };
  var getMethod = function(O, P) {
    // Assert: IsPropertyKey(P) is true.
    if (O != null && P != null) {
      // Let func be GetV(O, P).
      var func = O[P];
      // ReturnIfAbrupt(func).
      // If func is either undefined or null, return undefined.
      if(func == null) {
        return void 0;
      }
      // If IsCallable(func) is false, throw a TypeError exception.
      if (!isCallable(func)) {
        throw new TypeError(func + ' is not a function');
      }
      return func;
    }
  };
  var iteratorStep = function(iterator) {
    // Let result be IteratorNext(iterator).
    // ReturnIfAbrupt(result).
    var result = iterator.next();
    // Let done be IteratorComplete(result).
    // ReturnIfAbrupt(done).
    var done = Boolean(result.done);
    // If done is true, return false.
    if(done) {
      return false;
    }
    // Return result.
    return result;
  };

  // The length property of the from method is 1.
  return function from(items /*, mapFn, thisArg */ ) {
    'use strict';

    // 1. Let C be the this value.
    var C = this;

    // 2. If mapfn is undefined, let mapping be false.
    var mapFn = arguments.length > 1 ? arguments[1] : void 0;

    var T;
    if (typeof mapFn !== 'undefined') {
      // 3. else
      //   a. If IsCallable(mapfn) is false, throw a TypeError exception.
      if (!isCallable(mapFn)) {
        throw new TypeError(
          'Array.from: when provided, the second argument must be a function'
        );
      }

      //   b. If thisArg was supplied, let T be thisArg; else let T
      //      be undefined.
      if (arguments.length > 2) {
        T = arguments[2];
      }
      //   c. Let mapping be true (implied by mapFn)
    }

    var A, k;

    // 4. Let usingIterator be GetMethod(items, @@iterator).
    // 5. ReturnIfAbrupt(usingIterator).
    var usingIterator = getMethod(items, iteratorProp(items));

    // 6. If usingIterator is not undefined, then
    if (usingIterator !== void 0) {
      // a. If IsConstructor(C) is true, then
      //   i. Let A be the result of calling the [[Construct]]
      //      internal method of C with an empty argument list.
      // b. Else,
      //   i. Let A be the result of the abstract operation ArrayCreate
      //      with argument 0.
      // c. ReturnIfAbrupt(A).
      A = isCallable(C) ? Object(new C()) : [];

      // d. Let iterator be GetIterator(items, usingIterator).
      var iterator = usingIterator.call(items);

      // e. ReturnIfAbrupt(iterator).
      if (iterator == null) {
        throw new TypeError(
          'Array.from requires an array-like or iterable object'
        );
      }

      // f. Let k be 0.
      k = 0;

      // g. Repeat
      var next, nextValue;
      while (true) {
        // i. Let Pk be ToString(k).
        // ii. Let next be IteratorStep(iterator).
        // iii. ReturnIfAbrupt(next).
        next = iteratorStep(iterator);

        // iv. If next is false, then
        if (!next) {

          // 1. Let setStatus be Set(A, "length", k, true).
          // 2. ReturnIfAbrupt(setStatus).
          A.length = k;

          // 3. Return A.
          return A;
        }
        // v. Let nextValue be IteratorValue(next).
        // vi. ReturnIfAbrupt(nextValue)
        nextValue = next.value;

        // vii. If mapping is true, then
        //   1. Let mappedValue be Call(mapfn, T, «nextValue, k»).
        //   2. If mappedValue is an abrupt completion, return
        //      IteratorClose(iterator, mappedValue).
        //   3. Let mappedValue be mappedValue.[[value]].
        // viii. Else, let mappedValue be nextValue.
        // ix.  Let defineStatus be the result of
        //      CreateDataPropertyOrThrow(A, Pk, mappedValue).
        // x. [TODO] If defineStatus is an abrupt completion, return
        //    IteratorClose(iterator, defineStatus).
        if (mapFn) {
          A[k] = mapFn.call(T, nextValue, k);
        }
        else {
          A[k] = nextValue;
        }
        // xi. Increase k by 1.
        k++;
      }
      // 7. Assert: items is not an Iterable so assume it is
      //    an array-like object.
    } else {

      // 8. Let arrayLike be ToObject(items).
      var arrayLike = Object(items);

      // 9. ReturnIfAbrupt(items).
      if (items == null) {
        throw new TypeError(
          'Array.from requires an array-like object - not null or undefined'
        );
      }

      // 10. Let len be ToLength(Get(arrayLike, "length")).
      // 11. ReturnIfAbrupt(len).
      var len = toLength(arrayLike.length);

      // 12. If IsConstructor(C) is true, then
      //     a. Let A be Construct(C, «len»).
      // 13. Else
      //     a. Let A be ArrayCreate(len).
      // 14. ReturnIfAbrupt(A).
      A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 15. Let k be 0.
      k = 0;
      // 16. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = arrayLike[k];
        if (mapFn) {
          A[k] = mapFn.call(T, kValue, k);
        }
        else {
          A[k] = kValue;
        }
        k++;
      }
      // 17. Let setStatus be Set(A, "length", len, true).
      // 18. ReturnIfAbrupt(setStatus).
      A.length = len;
      // 19. Return A.
    }
    return A;
  };
})();

var arrayFrom = (typeof Array.from === 'function' ?
  Array.from :
  polyfill
);

function preserveCamelCase(str) {
	var isLastCharLower = false;
	var isLastCharUpper = false;
	var isLastLastCharUpper = false;

	for (var i = 0; i < str.length; i++) {
		var c = str[i];

		if (isLastCharLower && /[a-zA-Z]/.test(c) && c.toUpperCase() === c) {
			str = str.substr(0, i) + '-' + str.substr(i);
			isLastCharLower = false;
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = true;
			i++;
		} else if (isLastCharUpper && isLastLastCharUpper && /[a-zA-Z]/.test(c) && c.toLowerCase() === c) {
			str = str.substr(0, i - 1) + '-' + str.substr(i - 1);
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = false;
			isLastCharLower = true;
		} else {
			isLastCharLower = c.toLowerCase() === c;
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = c.toUpperCase() === c;
		}
	}

	return str;
}

var camelcase = function (str) {
	if (arguments.length > 1) {
		str = Array.from(arguments)
			.map(function (x) { return x.trim(); })
			.filter(function (x) { return x.length; })
			.join('-');
	} else {
		str = str.trim();
	}

	if (str.length === 0) {
		return '';
	}

	if (str.length === 1) {
		return str.toLowerCase();
	}

	if (/^[a-z0-9]+$/.test(str)) {
		return str;
	}

	var hasUpperCase = str !== str.toLowerCase();

	if (hasUpperCase) {
		str = preserveCamelCase(str);
	}

	return str
		.replace(/^[_.\- ]+/, '')
		.toLowerCase()
		.replace(/[_.\- ]+(\w|$)/g, function (m, p1) { return p1.toUpperCase(); });
};

/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var isobject = function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

//No such module
function isDocumentFragment(v){
    return (v + '') === '[object DocumentFragment]';
}

function isElemental(v){
    return isDocumentFragment(v) || isElement(v);
}

//isElement exists as a module, but it's not viable
function isElement(input) {

  return (input != null)
    && (typeof input === 'object')
    && (input.nodeType === Node.ELEMENT_NODE)
    && (typeof input.style === 'object')
    && (typeof input.ownerDocument === 'object');
}

function isDate(v){
    return Object.prototype.toString.call(v) === '[object Date]';
}

function toHTML(){
    var arguments$1 = arguments;

    var values = [], len = arguments.length;
    while ( len-- ) { values[ len ] = arguments$1[ len ]; }


    return values.map(function (v){
        if(v === void 0) { return ''; }

        if(isobject(v) && v.hasOwnProperty('element')){
            v = v.element;
        }

        if(typeof v === 'string'){
            return v;
        }

        if(isElement(v)){
            return v.outerHTML;
        }else if(isDocumentFragment(v)){
            var d = document.createElement('div');
            d.appendChild(v.cloneNode(true));
            return d.innerHTML;
        }
    }).join('');
}

function stringToFragment(str){
    var d = document.createElement('div');
    //A fragment allows a single source of entry
    //to multiple children without a parent
    var frag = document.createDocumentFragment();
    //NOTE: Nested paragraph tags get screwed up in innerHTML.
    //This also happens with other certain mixes of tags.
    d.innerHTML = str;
    while(d.firstChild){
        frag.appendChild(d.firstChild);
    }
    return frag;
}

function stringToElement(str){
    var frag = stringToFragment(str);
    //Sometimes we can get away with a single child
    if(frag.children.length === 1){
        return frag.removeChild(frag.firstChild);
    }
    return frag;
}

var localeOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
};

var language = window.navigator.userLanguage
|| window.navigator.language;

function toLocaleString(v){
    try{
        return v.toLocaleString(
            language,
            localeOptions
        );
    }catch(e){
        return v + '';
    }
}

function objectToString(v){
    var str = '';
    if(isDate(v)){
        //Make it pretty when the date is a lone value
        return toLocaleString(v);
    }

    if(v.constructor === Object){
        //Let Date be the ISO standard for JSON objects
        try{
            return JSON.stringify(v, null, 2);
        }catch(e){}
    }
    //All other objects are toStringed
    //This way user space toString is considered
    return v + '';
}

function setData(el, data){
    if(!el.dataset) { return; }
    Object.keys(data).forEach(
        function (key){ return el.dataset[camelcase(key)] = data[key]; }
    );
    return el;
}

function setAttributes(el, attributes){
    if(!el.setAttribute) { return; }
    if([3, //text
        8, //comment
        2  //attribute
    ].indexOf(el.nodeType) !== -1) { return; }

    Object.keys(attributes).forEach(function (key){
        el.setAttribute(key, attributes[key] + '');
    });
    return el;
}

function setStyles(el, styles){
    var allstyles = window.getComputedStyle(el);
    if(!el.style) { return; }
    Object.keys(styles).forEach(function (key){
        if(allstyles[key] === void 0){
            el.style.setProperty(
                '--'+decamelize(key, '-'),
                styles[key] + ''
            );
            return;
        }
        el.style[camelcase(key)] = styles[key] + '';
    });
}

//import isObject from 'isobject';
function toElement(v){
    var arguments$1 = arguments;

    var values = [], len = arguments.length - 1;
    while ( len-- > 0 ) { values[ len ] = arguments$1[ len + 1 ]; }


    if(typeof v !== 'string' && isArrayLike(v)){

        v = arrayFrom(v);

        if(values.length){
            var html = v.reduce(function (html, str, i){
                return html + str + toHTML(values[i]);
            }, '');
            return convert(html);
        }

        return v.reduce(function (frag, value){
            frag.appendChild(convert(value));
            return frag;
        }, document.createDocumentFragment());

    }

    return convert(v);
}

function convert(v){

    if(isobject(v)){
        if(v.hasOwnProperty('element')) { v = v.element; }

        if(isobject(v)){
            if(isElemental(v) || v === document){
                return v;
            }

            if(v.hasOwnProperty('tag')){
                return objectToDOM(v);
            }

            v = objectToString(v);
        }
    }

    try{
        var el = document.querySelector(v);
        if(el) { return el; }
    }catch(e){}

    return stringToElement(v);
}


function objectToDOM(obj){

    var el, parentNode = null, keys = Object.keys(obj), index;

    var hadKey = function (key){
        if((index = keys.indexOf(key + '')) !== -1){
            keys.splice(index, 1);
            return true;
        }
        return false;
    };

    if(hadKey('tag')){
        el = document.createElement(obj.tag.toLowerCase());
    }else{
        throw new Error('obj must have a "tag" property with a DOM tag name');
    }

    if(hadKey('attributes') && isobject(obj.attributes)){
        setAttributes(el, obj.attributes);
    }

    if(hadKey('data') && isobject(obj.data)){
        setData(el, obj.data);
    }

    if(hadKey('innerHTML')){
        el.innerHTML = toHTML(obj.innerHTML);
    }

    if(hadKey('head')){
        el.appendChild(toElement(obj.head));
    }

    if(hadKey('children') && isArrayLike(obj.children)){
        appendChildren(el, obj.children);
    }

    if(hadKey('foot')){
        el.appendChild(toElement(obj.foot));
    }

    if(hadKey('style') && isobject(obj.style)){
        setStyles(el, obj.style);
    }

    if(hadKey('parent')){
        parentNode = toElement(obj.parent);
    }

    keys.forEach(function (key){
        if(obj[key] !== 'function' && !isobject(obj[key])){
            el[key] = obj[key];
        }
    });

    if(parentNode){
        parentNode.appendChild(el);
    }

    return el;
}



function appendChildren(el, children){
    arrayFrom(children).forEach(function (child){
        el.appendChild(toElement(child));
    });
    return el;
}

var proto = typeof Element !== 'undefined' ? Element.prototype : {};
var vendor = proto.matches
  || proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

var matchesSelector = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) { return false; }
  if (vendor) { return vendor.call(el, selector); }
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] == el) { return true; }
  }
  return false;
}

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var arguments$1 = arguments;

	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments$1[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

var eventsProto = objectAssign(Object.create(null), {
    on: function on(name, cb, options){
        this.element.addEventListener(name, cb, options);
        this._records[name] = this._records[name] || [];
        this._records[name].push([
            name, cb, options
        ]);
        return this;
    },
    off: function off(name, cb, options){
        this.element.removeEventListener(name, cb, options);

        if(this._records[name] !== void 0){
            var records = this._records[name];

            for(var i=0; i<records.length; i++){
                if(records[i][1] === cb && records[i][2] === options){
                    records.splice(i, 1);
                    if(i + 1 !== records.length){
                        --i;
                    }
                }
            }
        }
        return this;
    },
    dispatch: function dispatch(event){
        this.element.dispatchEvent(event);
        return this;
    },
    clear: function clear(){
        var this$1 = this;

        for(var name in this$1._records){
            var records = this$1._records[name];
            records.forEach(function (record){
                (ref = this$1).off.apply(ref, record);
                var ref;
            });
        }
        return this;
    }
});

function events(element, tracker){
    if ( tracker === void 0 ) { tracker = null; }

    var eve = Object.create(eventsProto);
    eve._records = Object.create(null);
    if(typeof element === 'string'){
        eve.element = document.querySelector(element);
    }else{
        eve.element = element;
    }    

    if(tracker){
        tracker.list.push(eve);
    }

    return eve;
}

events.track = function track(){
    return {
        list: [],
        clear: function clear(){
            this.list.forEach(function (item){
                item.clear();
            });
        }
    };
};

var CharTree = function CharTree(){
    this.tree = {branches: {}, items: []};
};
CharTree.prototype.push = function push (){
        var arguments$1 = arguments;

        var this$1 = this;
        var datas = [], len = arguments.length;
        while ( len-- ) { datas[ len ] = arguments$1[ len ]; }

    datas.forEach(function (data){

        var next = this$1.tree;
        var list = data.value.split('');

        list.forEach(function (char){
            var key = char.toLowerCase();
            next = (next.branches[key] = next.branches[key] || Object.create(null));
            next.branches = next.branches || Object.create(null);
            next.items = next.items || [];
            next.items.push(data);
            next.value = char;
        });

        next.leaf = true;
    });
};
CharTree.prototype.remove = function remove (){
        var arguments$1 = arguments;

        var this$1 = this;
        var datas = [], len = arguments.length;
        while ( len-- ) { datas[ len ] = arguments$1[ len ]; }

    datas.forEach(function (data){
        var next = this$1.tree, last;
        var list = data.value.split('');

        for(var i=0; i<list.length; i++){
            var char = list[i];
            var key = char.toLowerCase();
            var index = (void 0);

            last = next;
            next = next.branches[key];

            if(next === void 0) { break; }

            if((index = next.items.indexOf(data.value)) !== -1){
                next.items.splice(index, 1);
                if(!next.items.length){
                    delete last.branches[key];
                }else{
                    next = next.branches[key];
                }
            }

        }
    });
};
CharTree.prototype.match = function match (value){
    var list = value.split('').map(function (v){ return v.toLowerCase(); });

    var next = this.tree,
        len = list.length + 1,
        last,
        string = '';

    if(!list.length) { return {tree: null, string: string, value: value}; }

    for(var i=0; i<len; i++){
        last = next;
        next = next.branches[list[i]];
        if(!next){
            if(list[i] !== void 0) { last = null; }
            break;
        }else{
            string += next.value;
        }
    }

    return {tree: last, string: string, value: value};
};
CharTree.prototype.findAll = function findAll (value){
    var ref = this.match(value);
        var tree = ref.tree;
    if(!tree) { return []; }
    return [].concat(tree.items);
};
CharTree.prototype.nextPhrase = function nextPhrase (value, sep){

    var ref = this.match(value);
        var tree = ref.tree;
        var string = ref.string;
        var result = string;

    sep = /[ ]+/;

    var iter = function (next){

        if(next.leaf){
            return result;
        }

        var keys = Object.keys(next.branches);
        for(var key in next.branches){
            if(sep.test(key)){
                return result;
            }
            result += next.branches[key].value;
            return iter(next.branches[key])

        }
    };

    return iter(tree);
};

function getTarget(target, targets){
    if ( targets === void 0 ) { targets = []; }


    for(var i=0; i<targets.length; i++){
        if(matchesSelector(target, '.'+targets[i])){
            return target;
        }

        if(target.children.length){
            var el = target.querySelector('.'+targets[i]);
            if(el) { return el; }
        }
    }

    return null;
}

/*export default function getTarget(target, targets){
    if(matches(target, '.'+targets.main)){
        return target;
    }

    if(target.children.length && !matches(target, '.'+targets.data)){
        return target.querySelector('.'+targets.data);
    }
    return target;
}*/

var noKeyDown = [9, 13, 38, 40];

var DOMTextAutocomplete = function DOMTextAutocomplete(input, ref){
    if ( ref === void 0 ) { ref = {}; }
    var parent = ref.parent; if ( parent === void 0 ) { parent = '<ol></ol>'; }
    var classes = ref.classes; if ( classes === void 0 ) { classes = {}; }
    var render = ref.render; if ( render === void 0 ) { render = null; }
    var separator = ref.separator; if ( separator === void 0 ) { separator = '[ ]+'; }
    var dataKey = ref.dataKey; if ( dataKey === void 0 ) { dataKey = 'value'; }
    var display = ref.display; if ( display === void 0 ) { display = 'block'; }
    var select = ref.select; if ( select === void 0 ) { select = function(value){
        this.input.value = value;
        this.hide();
    }; }
    var activate = ref.activate; if ( activate === void 0 ) { activate = function(){
        this.show();
    }; }

    var self = this;

    try{
        this.input = typeof input === 'string'
        ? document.querySelector(input)
        : input;
    }catch(e){
        throw e;
    }

    this._render = render;

    this.input.setAttribute('tabindex', '-1');

    var ref$1 = (classes || {});
    var main = ref$1.main; if ( main === void 0 ) { main = 'main-target'; }
    var data = ref$1.data; if ( data === void 0 ) { data = 'value-target'; }
    var selected = ref$1.selected; if ( selected === void 0 ) { selected = 'auto-selected'; }

    var keyTimer;

    classes = this.classes = {
        main: main, data: data, selected: selected
    };

    this.searchable = new CharTree();

    Object.keys(classes).forEach(function (clas){
        try{
            document.querySelector('.'+clas);
        }catch(e){ throw e; }
    });

    this.display = display;
    this.dataKey = dataKey;
    this.visible = [];

    var dataProp = this.dataProp = camelcase(dataKey);

    this.element = toElement(parent);
    this.element.style.opacity = 0;

    function run(event){
        //Debounce the dropdown activation
        clearTimeout(keyTimer);
        keyTimer = setTimeout(function (){
            activate.call(self, event);
        }, 100);
    }

    function onTab(event){
        /*let result = self.searchable.match(input.value);
        if(!result.notFound){
            input.value = result.value;
            run(event);
        }*/
        var result = self.searchable
        .nextPhrase(input.value, ' ');
        console.log("result ",result);
        input.value = result;
    }

    function onKeydown(event){
        if(event.keyCode === 9){
            event.preventDefault();
        }
    }

    function onKeyup(event){
        var keyCode = event.which || event.keyCode;
        if(noKeyDown.indexOf(keyCode) === -1){
            run(event);
        }
        if(keyCode === 9){
            onTab(event);
        }else

        if(self.showing){
            if(keyCode === 40){
                self.choose(1);
            }else if(keyCode === 38){
                self.choose(-1);
            }
        }
    }

    var down = false;

    function onEnter(event){
        var key = event.which || event.keyCode;
        if(self.showing && key === 13){
            var el = self.element.querySelector('.'+selected);
            if(el){
                el.classList.remove(selected);
                select.call(self, el.dataset[dataKey], el);
                event.preventDefault();
            }
        }
    }

    function onDown(event){
        if(!down){
            down = true;
            var el = getTarget(event.target, [classes.data]);
            select.call(self, el.dataset[dataKey], el);
        }
    }

    function onUp(event){
        down = false;
    }

    var tracker = events.track();

    events(document, tracker)
    .on('keyup', onEnter);
    events(input, tracker)
    .on('keyup', onKeyup, false)
    .on('keydown', onKeydown, false);
    events(this.element, tracker)
    .on('mousedown', onDown, false)
    .on('mouseup', onUp, false);

    this.destroy = function(){
        tracker.clear();
    };
};

var prototypeAccessors = { children: {},showing: {} };
DOMTextAutocomplete.prototype.show = function show (){
        var this$1 = this;

    var value = this.input.value;
    var found = this.searchable.findAll(value);

    this.element.innerHTML = '';
    found.forEach(function (data){
        var html = this$1._render(data);
        this$1.element.insertAdjacentHTML(
            'beforeend',
            html
        );

        this$1.element.lastChild.dataset[this$1.dataKey] = data.value;
    });
    if(found.length){
        this.element.style.opacity = 1;
    }
};
DOMTextAutocomplete.prototype.forEach = function forEach (callback){
    this.children.forEach(callback);
};
prototypeAccessors.children.get = function (){
    return Array.prototype.slice.call(this.element.children);
};
prototypeAccessors.showing.get = function (){
    return !!this.element.style.opacity;
};
DOMTextAutocomplete.prototype.choose = function choose (direction){

    if([-1, 1].indexOf(direction) === -1){
        return;
    }

    var className = this.classes.selected;
    var selected = this.element.querySelector('.'+className);
    var children = this.children;
    var index = selected
    ? children.indexOf(selected) + direction : 0;

    if(index === children.length){
        index = 0;
    }else if(index === -1){
        index = children.length - 1;
    }

    if(direction === 1){
        for(var i=index; i<children.length; ++i){
            if(children[i].style.display !== 'none'){
                children[i].classList.add(className);
                break;
            }
        }
    }else{
        for(var i$1=index; i$1>=0; --i$1){
            if(children[i$1].style.display !== 'none'){
                children[i$1].classList.add(className);
                break;
            }
        }
    }

    if(selected){
        selected.classList.remove(className);
    }
};
DOMTextAutocomplete.prototype.hide = function hide (){
    this.element.style.opacity = 0;
};
DOMTextAutocomplete.prototype.push = function push (){
        var arguments$1 = arguments;

        var this$1 = this;
        var values = [], len = arguments.length;
        while ( len-- ) { values[ len ] = arguments$1[ len ]; }

    values.forEach(function (value){
        this$1.searchable.push(value);
    });
    return this;
};
DOMTextAutocomplete.prototype.replace = function replace (values){
        var this$1 = this;

    values.forEach(function (value){ return this$1.push(value); });
    return this;
};
DOMTextAutocomplete.prototype.appendTo = function appendTo (el){
    el.appendChild(this.element);
    return this;
};
DOMTextAutocomplete.prototype.remove = function remove (){
    if(this.element.parentNode){
        return this.element.parentNode.removeChild(this.element);
    }
};

Object.defineProperties( DOMTextAutocomplete.prototype, prototypeAccessors );

function autoComplete(input, options){
    return new DOMTextAutocomplete(input, options);
}

try{
    var complete = autoComplete(document.querySelector('input'), {
        parent: '<ol></ol>',
        separator: '[ ]+',
        render: function render(data){
            return ("<li>" + (data.value) + "</li>");
        },
        activate: function activate(event){
            this.show();
        },
        keyup: function keyup(event){
            this.show();
        },
        select: function select(value, target){
            this.input.value = value;
            this.hide();
        }
    });

    var data = [
        {value: 'The Thing'},
        {value: 'Super man'},
        {value: 'Legend of Sleepy Hollow'},
        {value: 'The Shining'},
        {value: 'Fifty Shades of Grey'}
    ];

    complete.push.apply(complete, data);

    complete.input.focus();

    complete.appendTo(document.body);

}catch(e){
    console.log(e);
}

}());
//# sourceMappingURL=code.js.map
