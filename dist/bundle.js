'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var domElementals = require('dom-elementals');
var matches = _interopDefault(require('matches-selector'));
var camelcase = _interopDefault(require('camelcase'));

var CharTree = function CharTree(){
    this.tree = {branches: {}, items: []};
};
CharTree.prototype.push = function push (){
        var this$1 = this;
        var datas = [], len = arguments.length;
        while ( len-- ) datas[ len ] = arguments[ len ];

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
        var this$1 = this;
        var datas = [], len = arguments.length;
        while ( len-- ) datas[ len ] = arguments[ len ];

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

    if(!list.length) { return null; }

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

var noKeyDown = [9, 13, 38, 40];

var eventsProto = Object.assign(Object.create(null), {
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
    if ( tracker === void 0 ) tracker = null;

    var eve = Object.create(eventsProto);
    eve.element = element;
    eve._records = Object.create(null);

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

var DOMTextAutocomplete = function DOMTextAutocomplete(input, ref){
    if ( ref === void 0 ) ref = {};
    var parent = ref.parent; if ( parent === void 0 ) parent = '<ol></ol>';
    var classes = ref.classes; if ( classes === void 0 ) classes = {};
    var render = ref.render; if ( render === void 0 ) render = null;
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
    var main = ref$1.main; if ( main === void 0 ) main = 'main-target';
    var data = ref$1.data; if ( data === void 0 ) data = 'value-target';
    var selected = ref$1.selected; if ( selected === void 0 ) selected = 'auto-selected';

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

    this.element = domElementals.toElement(parent);
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

    /*document.addEventListener('keyup', onEnter);
    input.addEventListener('keyup', onKeyup, false);
    input.addEventListener('keydown', onKeydown, false);
    this.element.addEventListener('mousedown', onDown, false);
    this.element.addEventListener('mouseup', onUp, false);*/

    this.destroy = function(){
        tracker.clear();
        /*document.removeEventListener('keyup', onEnter);
        input.removeEventListener('keyup', onKeyup, false);
        this.element.removeEventListener('mousedown', onDown, false);
        this.element.removeEventListener('mouseup', onUp, false);
        this.remove();*/
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
        var this$1 = this;
        var values = [], len = arguments.length;
        while ( len-- ) values[ len ] = arguments[ len ];

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

module.exports = autoComplete;
//# sourceMappingURL=bundle.js.map
