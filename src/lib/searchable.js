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
        this.tree = {branches: {}};
        this.sep = new RegExp(separator);
    }
    push(element){
        let src = getTarget(element, [this.classes.data]);
        let value = src.dataset[this.dataProp];
        let list = value.split(this.sep);
        let current = this.tree;
        let next = current;
        list.forEach(item=>{
            let key = item.toLowerCase();
            next = (next.branches[key] = next.branches[key] || {});
            next.branches = next.branches || {};
            next.value = item;
        });

        next.elements = next.elements || [];
        next.leaf = true;
        next.value = value;
        next.elements.push(element);
    }
    match(value){
        let list = value.split(this.sep)
        .filter(v=>v.length)
        .map(v=>v.toLowerCase());

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
                            result = result.join(this.sep);
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
    findAll(value){

        let list = value.split(this.sep)
        .filter(v=>v.length)
        .map(v=>v.toLowerCase());

        let next = this.tree, last, results = [];

        if(!list.length){
            return [];
        }

        for(let i=0; i<list.length; ++i){

            if(next && next.branches){
                last = next;
                next = next.branches[list[i]] || false;
            }

            if(next && i + 1 === list.length){
                toLeaves(next, results);
            }else

            if(!next){
                let potential = list[i];
                let keys = Object.keys(last.branches);
                for(let j=0; j<keys.length; ++j){
                    let key = keys[j];
                    if(key === potential || key.indexOf(potential) === 0){
                        toLeaves(last.branches[keys[j]], results);
                    }
                }
            }
        }

        return results;
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

            if(current.leaf){
                results.push(current);
            }

            toLeaves(current, results, depthLimit);
        }

    }

    return results;
}
