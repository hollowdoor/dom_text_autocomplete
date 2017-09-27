import { toElement } from 'dom-elementals';
import matches from 'matches-selector';
import camelcase from 'camelcase';

function getTarget(target, targets){
    if ( targets === void 0 ) targets = [];


    for(var i=0; i<targets.length; i++){
        if(matches(target, '.'+targets[i])){
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

var Searchable = function Searchable(ref){
    if ( ref === void 0 ) ref = {};
    var classes = ref.classes; if ( classes === void 0 ) classes = {};
    var dataKey = ref.dataKey; if ( dataKey === void 0 ) dataKey = 'value';
    var sep = ref.sep; if ( sep === void 0 ) sep = ' ';


    var main = classes.main;
    var data = classes.data;

    this.classes = {main: main, data: data};
    this.dataProp = camelcase(dataKey);
    this.dataKey = dataKey;
    this.tree = {};
    this.sep = ' ';
};
Searchable.prototype.push = function push (element){
    var src = getTarget(element, [this.classes.data]);
    var value = src.dataset[this.dataProp];
    var list = value.split(this.sep);
    var next = this.tree;
    list.forEach(function (item){
        next[item] = next[item] || {};
        next = next[item];
    });

    next.elements = next.elements || [];
    next.leaf = true;
    next.value = value;
    next.elements.push(element);
};
Searchable.prototype.find = function find (value){
        var this$1 = this;

    var list = value.split(this.sep);
    var next = this.tree, last;
    var potential;

    var result = [];

    for(var i=0; i<list.length; i++){
        last = next;
        next = next[list[i]];
        if(next !== void 0){
            result.push(list[i]);
        }

        if(next === void 0 && last){
            potential = list[i].toLowerCase();
            var keys = Object.keys(last);
            for(var j=0; j<keys.length; j++){
                var key = keys[j].toLowerCase();
                if(key === potential || key.indexOf(potential) === 0){
                    result.push(keys[j]);

                    return {
                        value: result.join(this$1.sep),

                    };
                }
            }
        }
    }

    if(next && next.end) { return next; }
    return {notFound: true};
};
Searchable.prototype.findAll = function findAll (value){
    var list = value.split(this.sep);
    var next = this.tree, last;
    var potential;

    var result = [], results = [];

    for(var i=0; i<list.length; i++){
        last = next;
        next = next[list[i]];
        if(next !== void 0){
            result.push(list[i]);
        }

        if(next === void 0 && last){
            potential = list[i].toLowerCase();
            var keys = Object.keys(last);
            var results$1 = [];
            for(var j=0; j<keys.length; j++){
                var key = keys[j].toLowerCase();
                if(key === potential || key.indexOf(potential) === 0){
                    toLeaves(last[keys[j]], results$1);
                }
            }
            return results$1;
        }
    }
};

function toLeaves(tree, results){
    if ( results === void 0 ) results = [];

    var keys = Object.keys(tree);
    for(var i=0; i<keys.length; i++){
        if(tree[keys[i]].leaf){
            results.push(tree[keys[i]]);
        }else{
            toLeaves(tree[keys[i]], results);
        }        

    }

    return results;
}

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

    this.input.setAttribute('tabindex', '-1');

    var ref$1 = (classes || {});
    var main = ref$1.main; if ( main === void 0 ) main = 'main-target';
    var data = ref$1.data; if ( data === void 0 ) data = 'value-target';
    var selected = ref$1.selected; if ( selected === void 0 ) selected = 'auto-selected';



    classes = this.classes = {
        main: main, data: data, selected: selected
    };

    this.searchable = new Searchable({
        sep: tabbing,
        dataKey: dataKey,
        classes: classes
    });

    Object.keys(classes).forEach(function (clas){
        try{
            document.querySelector('.'+clas);
        }catch(e){ throw e; }
    });

    this.display = display;
    this.dataKey = dataKey;

    var dataProp = this.dataProp = camelcase(dataKey);

    this.element = toElement(parent);
    this.element.style.opacity = 0;

    function onTab(event){
        var result = self.searchable.find(input.value);
        if(!result.notFound){
            input.value = result.value;
        }
    }

    function onKeydown(event){
        if(event.keyCode === 9){
            event.preventDefault();
        }
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
            var el = getTarget(event.target, [classes.data]);
            select.call(self, el.dataset[dataKey], el);
        }
    }

    function onUp(event){
        down = false;
    }

    document.addEventListener('keyup', onEnter);
    input.addEventListener('keyup', onKeyup, false);
    input.addEventListener('keydown', onKeydown, false);
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


    var input = this.input.value.toLowerCase();
    try{
        console.log(this.searchable.findAll(this.input.value));
    }catch(e){ console.error(e);}

    var visible = 0;
    this.forEach(function (el){
        el = getTarget(el, [this$1.classes.data]);
        var potential = el.dataset[this$1.dataKey].toLowerCase();
        if(potential.indexOf(input) === 0){
            ++visible;
            el.style.display = this$1.display;//'block';
        }else{
            el.style.display = 'none';
        }
    });

    if(visible){
        this.element.style.opacity = 1;
    }
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
                //let target = getTarget(children[i], th)
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
    var el = toElement(value);
    console.log('el ', el);
    this.element.appendChild(el);
    this.searchable.push(el);
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

export default autoComplete;
//# sourceMappingURL=bundle.es.js.map
