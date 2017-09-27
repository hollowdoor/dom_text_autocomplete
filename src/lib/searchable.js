import camelcase from 'camelcase';
import getTarget from './get_target.js';

export default class Searchable {
    constructor({
        classes = {},
        dataKey = 'value',
        sep = ' '
    } = {}){

        let { main, data } = classes;

        this.classes = {main, data};
        this.dataProp = camelcase(dataKey);
        this.dataKey = dataKey;
        this.tree = {};
        this.sep = ' ';
    }
    push(element){
        let src = getTarget(element, [this.classes.data]);
        let value = src.dataset[this.dataProp];
        let list = value.split(this.sep);
        let next = this.tree;
        list.forEach(item=>{
            next[item] = next[item] || {};
            next = next[item];
        });

        next.elements = next.elements || [];
        next.leaf = true;
        next.value = value;
        next.elements.push(element);
    }
    find(value){
        let list = value.split(this.sep);
        let next = this.tree, last;
        let potential;

        let result = [];

        for(let i=0; i<list.length; i++){
            last = next;
            next = next[list[i]];
            if(next !== void 0){
                result.push(list[i]);
            }

            if(next === void 0 && last){
                potential = list[i].toLowerCase();
                let keys = Object.keys(last);
                for(let j=0; j<keys.length; j++){
                    let key = keys[j].toLowerCase();
                    if(key === potential || key.indexOf(potential) === 0){
                        result.push(keys[j]);

                        return {
                            value: result.join(this.sep),

                        };
                    }
                }
            }
        }

        if(next && next.end) return next;
        return {notFound: true};
    }
    findAll(value){
        let list = value.split(this.sep);
        let next = this.tree, last;
        let potential;

        let result = [], results = [];

        for(let i=0; i<list.length; i++){
            last = next;
            next = next[list[i]];
            if(next !== void 0){
                result.push(list[i]);
            }

            if(next === void 0 && last){
                potential = list[i].toLowerCase();
                let keys = Object.keys(last);
                let results = [];
                for(let j=0; j<keys.length; j++){
                    let key = keys[j].toLowerCase();
                    if(key === potential || key.indexOf(potential) === 0){
                        toLeaves(last[keys[j]], results);
                    }
                }
                return results;
            }
        }
    }
}

function toLeaves(tree, results = []){
    let keys = Object.keys(tree);
    for(let i=0; i<keys.length; i++){
        if(tree[keys[i]].leaf){
            results.push(tree[keys[i]]);
        }else{
            toLeaves(tree[keys[i]], results);
        }
    }

    return results;
}
