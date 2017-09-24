'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var domElementals = require('dom-elementals');
var matches = _interopDefault(require('matches-selector'));
var camelcase = _interopDefault(require('camelcase'));

var DOMTextAutocomplete = function DOMTextAutocomplete(input, ref){
    var this$1 = this;
    if ( ref === void 0 ) ref = {};
    var parent = ref.parent; if ( parent === void 0 ) parent = '<ol></ol>';
    var target = ref.target; if ( target === void 0 ) target = null;
    var dataKey = ref.dataKey; if ( dataKey === void 0 ) dataKey = 'value';
    var select = ref.select; if ( select === void 0 ) select = function(value){
        this.input.value = value;
        this.hide();
    };
    var activate = ref.activate; if ( activate === void 0 ) activate = function(){
        this.show();
    };
    var children = ref.children; if ( children === void 0 ) children = [];

    var self = this;
    this.input = typeof input === 'string'
    ? document.querySelector(input)
    : input;

    this.dataKey = dataKey;

    var dataProp = this.dataProp = camelcase(dataKey);

    this.element = domElementals.toElement(parent);
    this.element.style.opacity = 0;

    function onKeyup(event){
        activate.call(self, event);
    }

    input.addEventListener('keyup', onKeyup, false);

    children.forEach(function (child){ return this$1.push(child); });

    var down = false, downListener;


    function onDown(event){
        if(!down){
            down = true;
            if(matches(event.target, target)){
                var el = event.target;
                console.log('key', dataKey);
                console.log('data ',el.dataset[dataKey]);
                /*if(!el.dataset[dataProp]){
                    el = el.querySelector('*['+dataKey+']');
                }*/

                var value = el.dataset[dataKey];
                select.call(self, value, el);
            }
        }
    }

    function onUp(event){
        down = false;
    }

    downListener = onDown;

    this.element.addEventListener('mousedown', onDown, false);
    this.element.addEventListener('mouseup', onUp, false);


    this.destroy = function(){
        this.remove();
    };
};
DOMTextAutocomplete.prototype.show = function show (){
    var value = this.input.value,
        dataProp = this.dataProp,
        dataKey = this.dataKey,
        list = Array.prototype.slice.call(
            this.element.children);
    console.log(list);
    list.forEach(function (el){
        console.log();
        if(el.dataset[dataKey].indexOf(value) === 0){
            el.style.display = 'block';
        }else{
            el.style.display = 'none';
        }
        /*try{
            let el = child.querySelector('*['+dataKey+']');

        }catch(e){
            throw e;
        }*/

    });
    this.element.style.opacity = 1;
};
DOMTextAutocomplete.prototype.hide = function hide (){
    this.element.style.opacity = 0;
};
DOMTextAutocomplete.prototype.push = function push (value){
    this.element.appendChild(domElementals.toElement(value));
    return this;
};
DOMTextAutocomplete.prototype.replace = function replace (values){
        var this$1 = this;

    values.forEach(function (value){ return this$1.push(value); });
    return this;
};
DOMTextAutocomplete.prototype.appendTo = function appendTo (el){
    console.log('this.element ', this.element);
    el.appendChild(this.element);
    return this;
};
DOMTextAutocomplete.prototype.remove = function remove (){
    if(this.element.parentNode){
        return this.element.parentNode.removeChild(this.element);
    }
};

function autoComplete(input, options){
    return new DOMTextAutocomplete(input, options);
}

module.exports = autoComplete;
//# sourceMappingURL=bundle.js.map
