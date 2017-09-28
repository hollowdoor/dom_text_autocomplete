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
    var separator = ref.separator; if ( separator === void 0 ) separator = '[ ]+';


    var main = classes.main;
    var data = classes.data;

    this.classes = {main: main, data: data};
    this.dataProp = camelcase(dataKey);
    this.dataKey = dataKey;
    this.tree = {branches: {}};
    this.sep = new RegExp(separator);
};
Searchable.prototype.push = function push (element){
    var src = getTarget(element, [this.classes.data]);
    var value = src.dataset[this.dataProp];
    var list = value.split(this.sep);
    var current = this.tree;
    var next = current;
    list.forEach(function (item){
        var key = item.toLowerCase();
        next = (next.branches[key] = next.branches[key] || {});
        next.branches = next.branches || {};
        next.value = item;
    });

    next.elements = next.elements || [];
    next.leaf = true;
    next.value = value;
    next.elements.push(element);
};
Searchable.prototype.match = function match (value){
        var this$1 = this;

    var list = value.split(this.sep)
    .filter(function (v){ return v.length; })
    .map(function (v){ return v.toLowerCase(); });

    var next = this.tree, last;

    var result = [];

    for(var i=0; i<list.length; ++i){
        if(next){
            last = next;
            next = next.branches[list[i]] || false;

            if(next){
                result.push(next.value);
            }
        }

        if(!next && last){
            var potential = list[i];
            var keys = Object.keys(last.branches);
            for(var j=0; j<keys.length; j++){

                var key = keys[j];
                if(key === potential || key.indexOf(potential) === 0){
                    if(last.branches[key].leaf){
                        result = last.branches[key].value;
                    }else{
                        result.push(last.branches[key].value);
                        result = result.join(this$1.sep);
                    }

                    return {
                        value: result

                    };
                }
            }
        }
    }

    return {notFound: true};
};
Searchable.prototype.findAll = function findAll (value){

    var list = value.split(this.sep)
    .filter(function (v){ return v.length; })
    .map(function (v){ return v.toLowerCase(); });

    var next = this.tree, last, results = [];

    if(!list.length){
        return [];
    }

    for(var i=0; i<list.length; ++i){

        if(next && next.branches){
            last = next;
            next = next.branches[list[i]] || false;
        }

        if(next && i + 1 === list.length){
            toLeaves(next, results);
        }else

        if(!next){
            var potential = list[i];
            var keys = Object.keys(last.branches);
            for(var j=0; j<keys.length; ++j){
                var key = keys[j];
                if(key === potential || key.indexOf(potential) === 0){
                    toLeaves(last.branches[keys[j]], results);
                }
            }
        }
    }

    return results;
};

function toLeaves(tree, results, depthLimit){
    if ( results === void 0 ) results = [];
    if ( depthLimit === void 0 ) depthLimit = 400;


    if(tree !== void 0){

        if(tree.leaf){
            results.push(tree);
        }

        var keys = Object.keys(tree.branches);

        for(var i=0; i<keys.length; i++){
            var current = tree.branches[keys[i]];

            if(current.leaf){
                results.push(current);
            }

            toLeaves(current, results, depthLimit);
        }

    }

    return results;
}

var noKeyDown = [9, 13, 38, 40];

var DOMTextAutocomplete = function DOMTextAutocomplete(input, ref){
    if ( ref === void 0 ) ref = {};
    var parent = ref.parent; if ( parent === void 0 ) parent = '<ol></ol>';
    var classes = ref.classes; if ( classes === void 0 ) classes = {};
    var separator = ref.separator; if ( separator === void 0 ) separator = '[ ]+';
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

    var keyTimer;

    classes = this.classes = {
        main: main, data: data, selected: selected
    };

    this.searchable = new Searchable({
        separator: separator,
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
        var result = self.searchable.match(input.value);
        if(!result.notFound){
            input.value = result.value;
            run(event);
        }
    }

    function onKeydown(event){
        if(event.keyCode === 9){
            event.preventDefault();
        }
    }

    function onKeyup(event){
        var keyCode = event.which || event.keyCode;
        /*if(keyCode !== 13){
            run(event);
        }*/
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

    (ref$2 = this).push.apply(ref$2, children);

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
    var ref$2;
};

var prototypeAccessors = { children: {},showing: {} };
DOMTextAutocomplete.prototype.show = function show (){
        var this$1 = this;


    var input = this.input.value.toLowerCase();
    try{
        var found = this.searchable.findAll(this.input.value);

        this.visible.forEach(function (el){
            el.style.display = 'none';
        });
        this.visible = [];
        found.forEach(function (item){
            item.elements.forEach(function (el){
                el.style.display = this$1.display;
                this$1.visible.push(el);
            });
        });

        if(this.visible.length){
            this.element.style.opacity = 1;
        }
    }catch(e){ console.error(e);}
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
        var this$1 = this;
        var values = [], len = arguments.length;
        while ( len-- ) values[ len ] = arguments[ len ];

    values.forEach(function (value){
        var el = toElement(value);
        this$1.element.appendChild(el);
        this$1.searchable.push(el);
        el.style.display = 'none';
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

export default autoComplete;
//# sourceMappingURL=bundle.es.js.map
