import camelcase from 'camelcase';

export default class Searchable {
    constructor({
        classes = {},
        dataKey = 'data-value',
        sep = /[ ]+/
    }){
        const {
            main,
            data
        } = classes;

        this.classes = {main, data};
        this.dataProp = camelcase(dataValue);
        this.dataKey = dataKey;
        this.tree = {};
    },
    push(element){
        let src = element;
        if(!src.dataset[this.dataProp]){
            src = src.querySelector(this.classes.data);
        }
        let value = src.dataset[this.dataProp];
        let list = value.split(this.sep);
        let next = this.tree;
        list.forEach(item=>{
            next[item] = next[item] || {};
            next = next[item];
        });

        next.members = next.members || [];
        next.leaf = true;
        next.value = value;
        next.elements.push(element);
    }
    find(value){
        let list = value.split(this.sep);
        let next = this.tree, last;
        let potential;

        for(let i=0; i<list.length; i++){
            last = next;
            next = next[list[i]];
            if(!next && last){
                potential = list[i - 1];
                let keys = Object.keys(last);
                for(let i=0; i<keys.length; i++){
                    if(keys[i] === potential || keys[i].indexOf(potential) === 0){
                        return last[keys[i]];
                    }
                }
            }
        }

        if(next && next.end) return next;
        return {notFound: true};
    }
}
