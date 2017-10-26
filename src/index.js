import events from 'dom-eve';
import CharTree from './lib/char_tree.js';

class DOMTextAutocomplete {
    constructor(input, {
        read = null,
        allowEntry = null,
        entry = null,
        render = null
    }){
        this.input = input;
        this.searchable = new CharTree();
        this._render = render;

        const tracker = events.track();
        events(input, tracker)
        .on('keyup', event=>{
            let info = {};
            info.which = info.keyCode = event.which || event.keyCode;
            if(allowEntry){
                if(!allowEntry(info)){
                    return;
                }
            }
            if(read){
                Promise.resolve(read.call(this, event))
                .then(()=>{
                    entry.call(this, event);
                });
                return;
            }
            entry.call(this, event);
        });
    }
    fill(parent){
        let value = this.input.value;
        let found = this.searchable.findAll(value);
        parent.innerHTML = '';
        console.log(found)
        found.forEach(data=>{
            let html = this._render(data);
            parent.insertAdjacentHTML(
                'beforeend',
                html
            );
            parent.lastChild.dataset[this.dataKey] = data.value;
        });
        return !!found.length;
    }
    push(...values){
        values.forEach(value=>{
            this.searchable.push(value);
        });
        return this;
    }
    empty(){
        this.searchable.empty();
    }
}

export default function autoComplete(input, options){
    return new DOMTextAutocomplete(input, options);
}
