export default class CharTree {
    constructor(){
        this.tree = {branches: {}, items: []};
    }
    empty(){
        this.tree = {branches: {}, items: []};
    }
    push(...datas){
        datas.forEach(data=>{

            let next = this.tree;
            let list = data.split('');

            list.forEach(ch=>{
                let key = ch.toLowerCase();
                next = (next.branches[key] = next.branches[key] || Object.create(null));
                next.branches = next.branches || Object.create(null);
                next.items = next.items || [];
                next.items.push(data);
                next.value = ch;
            });

            next.leaf = true;
        });
    }
    remove(...datas){
        datas.forEach(data=>{
            let next = this.tree, last;
            let list = data.split('');

            for(let i=0; i<list.length; i++){
                let char = list[i];
                let key = char.toLowerCase();
                let index;

                last = next;
                next = next.branches[key];

                if(next === void 0) break;

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
    }
    match(value){
        let list = value.split('').map(v=>v.toLowerCase());

        let next = this.tree,
            len = list.length + 1,
            last,
            string = '';

        if(!list.length) return {tree: null, string, value};

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
