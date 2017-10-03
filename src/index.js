import { toElement } from 'dom-elementals';
import matches from 'matches-selector';
import camelcase from 'camelcase';
import Searchable from './lib/searchable.js';
import getTarget from './lib/get_target.js';
import { noKeyDown } from './lib/data.js';


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
        }
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

        this.searchable = new Searchable({
            separator,
            dataKey,
            classes
        });

        Object.keys(classes).forEach(clas=>{
            try{
                document.querySelector('.'+clas);
            }catch(e){ throw e; }
        });

        this.display = display;
        this.dataKey = dataKey;
        this.visible = [];

        const dataProp = this.dataProp = camelcase(dataKey);

        this.element = toElement(parent);
        this.element.style.opacity = 0;

        function run(event){
            //Debounce the dropdown activation
            clearTimeout(keyTimer);
            keyTimer = setTimeout(()=>{
                activate.call(self, event);
            }, 100);
        }

        function onTab(event){
            let result = self.searchable.match(input.value);
            if(!result.notFound){
                input.value = result.value;
                run(event);
            }
        }

        function onArrow(event){
            if(self.showing){
                let selected = self.element.querySelector('.'+selected);
                let children = self.children;
                if(!selected){
                    this.choose(0);
                }else{
                    let index = children.indexOf(selected);
                    this.choose(index);
                }
            }
        }

        function onKeydown(event){
            if(event.keyCode === 9){
                event.preventDefault();
            }
        }

        function onKeyup(event){
            let keyCode = event.which || event.keyCode;
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
            }
        }

        let down = false;

        function onEnter(event){
            let key = event.which || event.keyCode;
            if(self.showing && key === 13){
                let el = self.element.querySelector('.'+selected);
                if(el){
                    el.classList.remove(selected);
                    select.call(self, el.dataset[dataKey], el);
                    event.preventDefault();
                }
            }
        }

        function onDown(event){
            if(!down){
                down = true;
                let el = getTarget(event.target, [classes.data]);
                select.call(self, el.dataset[dataKey], el);
            }
        }

        function onUp(event){
            down = false;
        }

        document.addEventListener('keyup', onEnter);
        input.addEventListener('keyup', onKeyup, false);
        input.addEventListener('keydown', onKeydown, false);
        this.element.addEventListener('mousedown', onDown, false);
        this.element.addEventListener('mouseup', onUp, false);

        this.destroy = function(){
            document.removeEventListener('keyup', onEnter);
            input.removeEventListener('keyup', onKeyup, false);
            this.element.removeEventListener('mousedown', onDown, false);
            this.element.removeEventListener('mouseup', onUp, false);
            this.remove();
        };
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
