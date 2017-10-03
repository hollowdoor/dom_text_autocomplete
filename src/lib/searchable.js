import camelcase from 'camelcase';
import getTarget from './get_target.js';

export default class Searchable {
    constructor({
        classes = {},
        dataKey = 'value',
        separator = '[ ]+'
    } = {}){

        let { main, data } = classes;

        this.classes = {main, data};
        this.dataProp = camelcase(dataKey);
        this.dataKey = dataKey;
        this.tree = {branches: {}, items: []};
        this.sep = new RegExp('('+separator+')');
    }
    push(...datas){
        datas.forEach(data=>{

            let next = this.tree;
            let list = data.value
            .split('');

            list.forEach(item=>{
                let key = item.toLowerCase();
                next = (next.branches[key] = next.branches[key] || {});
                next.branches = next.branches || {};
                next.items = next.items || [];
                next.items.push(data);
            });

            next.leaf = true;
        });
    }
    findAll(value){
        let list = value.split('')
        .filter(v=>v.length)
        .map(v=>v.toLowerCase());

        let next = this.tree,
            results = [],
            len = list.length + 1,
            stored = {},
            last;

        if(!list.length) return [];

        for(let i=0; i<len; i++){
            last = next;
            next = next.branches[list[i]];
            if(!next){
                if(list[i] !== void 0) last = null;
                break;
            };
        }

        if(!last) return [];
        return [].concat(last.items);
        for(let j=0; j<last.items.length; j++){
            if(!stored[last.items[j].value]){
                results.push(last.items[j]);
                stored[last.items[j].value] = 1;
            }
        }

        return results;
    }
    match(value){
        let list = value.split(this.sep)
        .filter(v=>v.length)
        .map(v=>v.toLowerCase());

        let sep = '';

        for(let i=0; i<list.length; i++){
            if(this.sep.test(list[i])){
                sep = list[i]; break;
            }
        }

        list = list.filter(v=>!this.sep.test(v));

        let next = this.tree, last;

        let result = [];

        for(let i=0; i<list.length; ++i){
            if(next){
                last = next;
                next = next.branches[list[i]] || false;

                if(next){
                    result.push(next.value);
                }
            }

            if(!next && last){
                let potential = list[i];
                let keys = Object.keys(last.branches);
                for(let j=0; j<keys.length; j++){

                    let key = keys[j];
                    if(key === potential || key.indexOf(potential) === 0){
                        if(last.branches[key].leaf){
                            result = last.branches[key].value;
                        }else{
                            result.push(last.branches[key].value);
                            result = result.join(sep);
                        }

                        return {
                            value: result

                        };
                    }
                }
            }
        }

        return {notFound: true};
    }
}

function toLeaves(tree, results = [], depthLimit = 400){

    if(tree !== void 0){

        if(tree.leaf){
            results.push(tree);
        }

        let keys = Object.keys(tree.branches);

        for(let i=0; i<keys.length; i++){
            let current = tree.branches[keys[i]];

            toLeaves(current, results, depthLimit);
        }

    }

    return results;
}
