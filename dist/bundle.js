'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var events = _interopDefault(require('dom-eve'));

var CharTree = function CharTree(){
    this.tree = {branches: {}, items: []};
};
CharTree.prototype.empty = function empty (){
    this.tree = {branches: {}, items: []};
};
CharTree.prototype.push = function push (){
        var this$1 = this;
        var datas = [], len = arguments.length;
        while ( len-- ) datas[ len ] = arguments[ len ];

    datas.forEach(function (data){

        var next = this$1.tree;
        var list = data.split('');

        list.forEach(function (ch){
            var key = ch.toLowerCase();
            next = (next.branches[key] = next.branches[key] || Object.create(null));
            next.branches = next.branches || Object.create(null);
            next.items = next.items || [];
            next.items.push(data);
            next.value = ch;
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
        var list = data.split('');

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

var DOMTextAutocomplete = function DOMTextAutocomplete(input, ref){
    var this$1 = this;
    var read = ref.read; if ( read === void 0 ) read = null;
    var allowEntry = ref.allowEntry; if ( allowEntry === void 0 ) allowEntry = function(event){
        var key = event.which || event.keyCode;
        console.log('key ', key);
        return (
              !(key >= 37 && key <= 40) && key !== 13
        );
    };
    var entry = ref.entry; if ( entry === void 0 ) entry = null;
    var render = ref.render; if ( render === void 0 ) render = null;

    this.input = input;
    this.searchable = new CharTree();
    this._render = render;

    var tracker = events.track();
    events(input, tracker)
    .on('keyup', function (event){
        console.log('allowEntry ',allowEntry.call(this$1, event));
        if(allowEntry){
            if(!allowEntry.call(this$1, event)){
                return;
            }
        }
        if(read){
            Promise.resolve(read.call(this$1, event))
            .then(function (){
                entry.call(this$1, event);
            });
            return;
        }
        entry.call(this$1, event);
    });
};
DOMTextAutocomplete.prototype.fill = function fill (parent){
        var this$1 = this;

    var value = this.input.value;
    var found = this.searchable.findAll(value);
    parent.innerHTML = '';
    found.forEach(function (data){
        var html = this$1._render(data);
        parent.insertAdjacentHTML(
            'beforeend',
            html
        );
    });
    return !!found.length;
};
DOMTextAutocomplete.prototype.query = function query (element, selector){
    /*let el = element.querySelector(selector);
    if(el){
        this.input.value = el.dataset[];
    }*/
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
DOMTextAutocomplete.prototype.empty = function empty (){
    this.searchable.empty();
    return this;
};

function autoComplete(input, options){
    return new DOMTextAutocomplete(input, options);
}

module.exports = autoComplete;
//# sourceMappingURL=bundle.js.map
