import events from 'dom-eve';
import CharTree from './lib/char_tree.js';

class DOMTextAutocomplete {
    constructor(input, {
        read = null,
        allowEntry = function(event){
            let key = event.which || event.keyCode;
            console.log('key ', key)
            return (
                  !(key >= 37 && key <= 40) && key !== 13
            );
        },
        entry = null,
        render = null
    }){
        this.input = input;
        this.searchable = new CharTree();
        this._render = render;

        const tracker = events.track();
        events(input, tracker)
        .on('keyup', event=>{
            console.log('allowEntry ',allowEntry.call(this, event))
            if(allowEntry){
                if(!allowEntry.call(this, event)){
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
        found.forEach(data=>{
            let html = this._render(data);
            parent.insertAdjacentHTML(
                'beforeend',
                html
            );
        });
        return !!found.length;
    }
    query(element, selector){
        /*let el = element.querySelector(selector);
        if(el){
            this.input.value = el.dataset[];
        }*/
    }
    push(...values){
        values.forEach(value=>{
            this.searchable.push(value);
        });
        return this;
    }
    empty(){
        this.searchable.empty();
        return this;
    }
}

export default function autoComplete(input, options){
    return new DOMTextAutocomplete(input, options);
}
