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
    var tabbing = ref.tabbing; if ( tabbing === void 0 ) tabbing = null;
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

    Object.keys(classes).forEach(function (clas){
        try{
            document.querySelector('.'+clas);
        }catch(e){ throw e; }
    });

    this.display = display;
    this.dataKey = dataKey;

    var dataProp = this.dataProp = camelcase(dataKey);

    this.element = domElementals.toElement(parent);
    this.element.style.opacity = 0;

    var tabCheck = tabbing, onTab;

    if(tabbing && tabbing !== 'function'){
        tabCheck = function(value, item){
            console.log(arguments);
            var words = value.split(tabbing);
            var list = item.split(tabbing);
            var i = 0;
            for(; i<words.length; i++){
                if(words[i].indexOf(list[i]) === 0){
                    break;
                }
            }
            if(i === list.length){
                return item;
            }
        };
    }

    if(tabCheck){
        onTab = function(event){
            var children = self.children;
            var value = input.value;
            for(var i=0; i<children.length; i++){
                var current = getTarget(children[i], self.classes);
                var result = tabCheck(value, current.dataset[dataProp]);
                if(result){
                    input.value = result;
                    break;
                }
            }
            event.preventDefault();
        };
    }

    function onKeyup(event){
        activate.call(self, event);
        if(tabbing && event.keyCode === 9){
            onTab(event);
        }else
        if(self.visible){
            if(event.keyCode === 40){
                self.choose(1);
            }else if(event.keyCode === 38){
                self.choose(-1);
            }
        }
    }

    children.forEach(function (child){ return this$1.push(child); });

    var down = false;

    function onEnter(event){
        var key = event.keyCode || event.which;
        if(self.visible && key === 13){
            var el = self.element.querySelector('.'+selected);
            if(el){
                select.call(self, el.dataset[dataKey], el);
            }
            event.preventDefault();
        }
    }

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

    document.addEventListener('keyup', onEnter);
    input.addEventListener('keyup', onKeyup, false);
    this.element.addEventListener('mousedown', onDown, false);
    this.element.addEventListener('mouseup', onUp, false);

    this.destroy = function(){
        document.removeEventListener('keyup', onEnter);
        input.removeEventListener('keyup', onKeyup, false);
        this.element.removeEventListener('mousedown', onDown, false);
        this.element.removeEventListener('mouseup', onUp, false);
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
