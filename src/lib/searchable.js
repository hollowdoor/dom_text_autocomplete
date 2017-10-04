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
        //this.sep = new RegExp('('+separator+')');
        this.sep = ' ';
    }
    push(...datas){
        datas.forEach(data=>{

            let next = this.tree;
            let list = data.value
            .split('');

            list.forEach(char=>{
                let key = char.toLowerCase();
                next = (next.branches[key] = next.branches[key] || Object.create(null));
                next.branches = next.branches || Object.create(null);
                next.items = next.items || [];
                next.items.push(data);
                next.value = char;
            });

            next.leaf = true;
        });
    }
    match(value){
        let list = value.split('')
        .filter(v=>v.length)
        .map(v=>v.toLowerCase());

        let next = this.tree,
            results = [],
            len = list.length + 1,
            stored = {},
            last,
            string = '';

        if(!list.length) return null;

        for(let i=0; i<len; i++){
            last = next;
            next = next.branches[list[i]];
            if(!next){
                if(list[i] !== void 0) last = null;
                break;
            }else{
                string += next.value;
            }
        }

        return {tree: last, string, value};
    }
    findAll(value){
        let {tree} = this.match(value);
        if(!tree) return [];
        return [].concat(tree.items);
    }
    nextPhrase(value, sep){

        let {tree, string} = this.match(value),
            result = string;

        sep = /[ ]+/;

        const iter = (next)=>{

            if(next.leaf){
                return result;
            }

            let keys = Object.keys(next.branches);
            for(let key in next.branches){
                if(sep.test(key)){
                    return result;
                }
                result += next.branches[key].value;
                return iter(next.branches[key])

            }
        };

        return iter(tree);
    }
}

function lower(item){
    return item.toLowerCase();
}
