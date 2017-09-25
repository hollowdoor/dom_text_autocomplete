import { toElement } from 'dom-elementals';
import matches from 'matches-selector';
import camelcase from 'camelcase';

var DOMTextAutocomplete = function DOMTextAutocomplete(input, ref){
    var this$1 = this;
    if ( ref === void 0 ) ref = {};
    var parent = ref.parent; if ( parent === void 0 ) parent = '<ol></ol>';
    var targets = ref.targets; if ( targets === void 0 ) targets = {};
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

    var ref$1 = (targets || {});
    var main = ref$1.main; if ( main === void 0 ) main = '.main-target';
    var data = ref$1.data; if ( data === void 0 ) data = '.value-target';

    targets = this.targets = {
        main: main, data: data
    };

    this.display = display;
    this.dataKey = dataKey;
    var dataProp = this.dataProp = camelcase(dataKey);

    this.element = toElement(parent);
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
DOMTextAutocomplete.prototype.show = function show (){
        var this$1 = this;


    Array.prototype.slice.call(
            this.element.children)
    .forEach(function (el){
        el = getTarget(el, this$1.targets);
        if(el.dataset[this$1.dataKey].indexOf(this$1.input.value) === 0){
            el.style.display = this$1.display;//'block';
        }else{
            el.style.display = 'none';
        }
    });

    this.element.style.opacity = 1;
};
DOMTextAutocomplete.prototype.hide = function hide (){
    this.element.style.opacity = 0;
};
DOMTextAutocomplete.prototype.push = function push (value){
    this.element.appendChild(toElement(value));
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

function getTarget(target, targets){
    if(matches(target, targets.main)){
        return target;
    }

    if(target.children.length && !matches(target, targets.data)){
        return el.querySelector(targets.data);
    }
    return target;
}

export default autoComplete;
//# sourceMappingURL=bundle.es.js.map
