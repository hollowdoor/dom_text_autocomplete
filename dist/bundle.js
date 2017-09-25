'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var domElementals = require('dom-elementals');
var matches = _interopDefault(require('matches-selector'));
var camelcase = _interopDefault(require('camelcase'));

var DOMTextAutocomplete = function DOMTextAutocomplete(input, ref){
    var this$1 = this;
    if ( ref === void 0 ) ref = {};
    var parent = ref.parent; if ( parent === void 0 ) parent = '<ol></ol>';
    var classes = ref.classes; if ( classes === void 0 ) classes = {};
    var target = ref.target; if ( target === void 0 ) target = null;
    var dataKey = ref.dataKey; if ( dataKey === void 0 ) dataKey = 'value';
    var display = ref.display; if ( display === void 0 ) display = 'block';
    var select = ref.select; if ( select === void 0 ) select = function(value){
        this.input.value = value;
        this.hide();
    };
    var activate = ref.activate; if ( activate === void 0 ) activate = function(){
        this.show();
    };
    var children = ref.children; if ( children === void 0 ) children = [];

    var self = this;

    try{
        this.input = typeof input === 'string'
        ? document.querySelector(input)
        : input;
    }catch(e){
        throw e;
    }

    var ref$1 = (classes || {});
    var main = ref$1.main; if ( main === void 0 ) main = 'main-target';
    var data = ref$1.data; if ( data === void 0 ) data = 'value-target';
    var selected = ref$1.selected; if ( selected === void 0 ) selected = 'auto-selected';

    classes = this.classes = {
        main: main, data: data, selected: selected
    };

    this.display = display;
    this.dataKey = dataKey;

    var dataProp = this.dataProp = camelcase(dataKey);

    this.element = domElementals.toElement(parent);
    this.element.style.opacity = 0;

    function onKeyup(event){
        activate.call(self, event);
        if(self.visible){
            if(event.keyCode === 40){
                self.choose(1);
            }else if(event.keyCode === 38){
                self.choose(-1);
            }
        }
    }

    input.addEventListener('keyup', onKeyup, false);

    children.forEach(function (child){ return this$1.push(child); });

    var down = false, downListener;


    function onDown(event){
        if(!down){
            down = true;
            var el = getTarget(event.target, targets);
            select.call(self, el.dataset[dataKey], el);
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

var prototypeAccessors = { children: {},visible: {} };
DOMTextAutocomplete.prototype.show = function show (){
        var this$1 = this;


    this.forEach(function (el){
        el = getTarget(el, this$1.classes);
        if(el.dataset[this$1.dataKey].indexOf(this$1.input.value) === 0){
            el.style.display = this$1.display;//'block';
        }else{
            el.style.display = 'none';
        }
    });

    this.element.style.opacity = 1;
};
DOMTextAutocomplete.prototype.forEach = function forEach (callback){
    this.children.forEach(callback);
};
prototypeAccessors.children.get = function (){
    return Array.prototype.slice.call(this.element.children);
};
prototypeAccessors.visible.get = function (){
    return !!this.element.style.opacity;
};
DOMTextAutocomplete.prototype.choose = function choose (direction){
    console.log('direction ',direction);
    if([-1, 1].indexOf(direction) === -1){
        return;
    }

    var className = this.classes.selected;
    console.log(className);
    var selected = this.element.querySelector('.'+className);
    console.log('selected ',selected);
    var children = this.children;
    var index = selected
    ? children.indexOf(selected) + direction : 0;
    console.log('index ', index);
    if(direction === 1){
        for(var i=index; i<children.length; ++i){
            console.log('display ',children[i].style.display);
            if(children[i].style.display !== 'none'){
                children[i].classList.add(className);
                break;
            }
        }
    }else{
        for(var i$1=index; i$1>=0; --i$1){
            console.log('display ',children[i$1].style.display);
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

function getTarget(target, targets){
    if(matches(target, '.'+targets.main)){
        return target;
    }

    if(target.children.length && !matches(target, '.'+targets.data)){
        return el.querySelector('.'+targets.data);
    }
    return target;
}

module.exports = autoComplete;
//# sourceMappingURL=bundle.js.map
