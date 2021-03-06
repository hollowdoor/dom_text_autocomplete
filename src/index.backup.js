import { toElement } from 'dom-elementals';
import matches from 'matches-selector';
import camelcase from 'camelcase';
import CharTree from './lib/char_tree.js';
//import getTarget from './lib/get_target.js';
import nearestTarget from 'dom-nearest-target';
import { noKeyDown } from './lib/data.js';
import events from 'dom-eve';
//import _arrowSelect from 'dom-arrow-select';


class DOMTextAutocomplete {
    constructor(input, {
        parent = '<ol></ol>',
        classes = {},
        render = null,
        separator = '[ ]+',
        dataKey = 'value',
        display = 'block',
        select = function(value){
            this.input.value = value;
            this.hide();
        },
        activate = function(){
            this.show();
        },
        arrowSelect = null,
        entry = null
    } = {}){
        const self = this;

        try{
            this.input = typeof input === 'string'
            ? document.querySelector(input)
            : input;
        }catch(e){
            throw e;
        }

        this._render = render;


        this.input.setAttribute('tabindex', '-1');

        let {
            main = 'main-target',
            data = 'value-target',
            selected = 'auto-selected'
        } = (classes || {});

        let keyTimer;

        classes = this.classes = {
            main, data, selected
        };

        /*this.arrowSelect = !!arrowSelect
        ? arrowSelect
        : _arrowSelect({
            selectID: selected
        });*/

        this.searchable = new CharTree();

        Object.keys(classes).forEach(clas=>{
            try{
                document.querySelector('.'+clas);
            }catch(e){ throw e; }
        });

        this.display = display;
        this.dataKey = dataKey;
        this.visible = [];

        const dataProp = this.dataProp = camelcase(dataKey);

        //this.element = toElement(parent);
        //this.element.style.opacity = 0;
        //this.arrowSelect.focus(this.element);

        function run(event){
            //Debounce the dropdown activation
            clearTimeout(keyTimer);
            keyTimer = setTimeout(()=>{
                activate.call(self, event);
            }, 100);
        }

        function onTab(event){
            /*let result = self.searchable.match(input.value);
            if(!result.notFound){
                input.value = result.value;
                run(event);
            }*/
            let result = self.searchable
            .nextPhrase(input.value, ' ');
            console.log("result ",result);
            input.value = result;
        }

        function onArrow(event){
            /*if(self.showing){
                let selected = self.element.querySelector('.'+selected);
                let children = self.children;
                if(!selected){
                    this.choose(0);
                }else{
                    let index = children.indexOf(selected);
                    this.choose(index);
                }
            }*/
        }

        let down = false;

        const tracker = events.track();

        events(document, tracker)
        .on('keyup', event=>{
            /*let key = event.which || event.keyCode;
            if(self.showing && key === 13){
                let el = self.element.querySelector('.'+selected);
                if(el){
                    el.classList.remove(selected);
                    select.call(self, el.dataset[dataKey], el);
                    event.preventDefault();
                }
            }*/
        });

        events(input, tracker)
        .on('keypress', event=>{
            
            entry.call(this);
            /*let keyCode = event.which || event.keyCode;
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
            }*/
        }, false)
        .on('keydown', event=>{
            if(event.keyCode === 9){
                event.preventDefault();
            }
        }, false);

        /*events(this.element, tracker)
        .on('mousedown', event=>{
            if(!down){
                down = true;
                let el = nearestTarget(event.target, [
                    classes.data].map(c=>'.'+c));
                select.call(self, el.dataset[dataKey], el);
            }
        }, false)
        .on('mouseup', event=>{
            down = false;
        }, false);*/

        this.destroy = function(){
            tracker.clear();
        };
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
    show(){
        let value = this.input.value;
        let found = this.searchable.findAll(value);

        this.element.innerHTML = '';
        found.forEach(data=>{
            let html = this._render(data);
            this.element.insertAdjacentHTML(
                'beforeend',
                html
            );

            this.element.lastChild.dataset[this.dataKey] = data.value;
        });
        if(found.length){
            this.element.style.opacity = 1;
        }
    }
    forEach(callback){
        this.children.forEach(callback);
    }
    get children(){
        return Array.prototype.slice.call(this.element.children);
    }
    get showing(){
        return !!this.element.style.opacity;
    }
    choose(direction){

        if([-1, 1].indexOf(direction) === -1){
            return;
        }

        let className = this.classes.selected;
        let selected = this.element.querySelector('.'+className);
        let children = this.children;
        let index = selected
        ? children.indexOf(selected) + direction : 0;

        if(index === children.length){
            index = 0;
        }else if(index === -1){
            index = children.length - 1;
        }

        if(direction === 1){
            for(let i=index; i<children.length; ++i){
                if(children[i].style.display !== 'none'){
                    children[i].classList.add(className);
                    break;
                }
            }
        }else{
            for(let i=index; i>=0; --i){
                if(children[i].style.display !== 'none'){
                    children[i].classList.add(className);
                    break;
                }
            }
        }

        if(selected){
            selected.classList.remove(className);
        }
    }
    hide(){
        this.element.style.opacity = 0;
    }
    push(...values){
        values.forEach(value=>{
            this.searchable.push(value);
        });
        return this;
    }
    replace(values){
        values.forEach(value=>this.push(value));
        return this;
    }
    appendTo(el){
        el.appendChild(this.element);
        return this;
    }
    remove(){
        if(this.element.parentNode){
            return this.element.parentNode.removeChild(this.element);
        }
    }
}

export default function autoComplete(input, options){
    return new DOMTextAutocomplete(input, options);
}



function makeSelection(children, className, start){
    for(let i=start; i<children.length; i++){
        if(children[i].style.display !== 'none'){
            children[i].classList.add(className);
        }
    }
}
