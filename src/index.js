import { toElement } from 'dom-elementals';
import matches from 'matches-selector';
import camelcase from 'camelcase';

class DOMTextAutocomplete {
    constructor(input, {
        parent = '<ol></ol>',
        classes = {},
        tabbing = null,
        dataKey = 'value',
        display = 'block',
        select = function(value){
            this.input.value = value;
            this.hide();
        },
        activate = function(){
            this.show();
        },
        children = []
    } = {}){
        const self = this;

        try{
            this.input = typeof input === 'string'
            ? document.querySelector(input)
            : input;
        }catch(e){
            throw e;
        }

        let {
            main = 'main-target',
            data = 'value-target',
            selected = 'auto-selected'
        } = (classes || {});

        classes = this.classes = {
            main, data, selected
        };

        Object.keys(classes).forEach(clas=>{
            try{
                document.querySelector('.'+clas);
            }catch(e){ throw e; }
        });

        this.display = display;
        this.dataKey = dataKey;

        const dataProp = this.dataProp = camelcase(dataKey);

        this.element = toElement(parent);
        this.element.style.opacity = 0;

        let tabCheck = tabbing, onTab;

        if(tabbing && tabbing !== 'function'){
            tabCheck = function(value, item){
                console.log(arguments)
                let words = value.split(tabbing);
                let list = item.split(tabbing);
                let i = 0;
                for(; i<words.length; i++){
                    if(words[i].indexOf(list[i]) !== 0){
                        break;
                    }
                }
                if(i === list.length){
                    return item;
                }
            };
        }

        if(tabCheck){
            onTab = function(event){
                let children = self.children;
                let value = input.value;
                for(let i=0; i<children.length; i++){
                    let current = getTarget(children[i], self.classes);
                    let result = tabCheck(value, current.dataset[dataProp]);
                    if(result){
                        input.value = result;
                        break;
                    }
                }
                event.preventDefault();
            };
        }

        function onArrow(event){
            if(self.visible){
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

        function onKeyup(event){
            activate.call(self, event);
            if(tabbing && event.keyCode === 9){
                onTab(event);
            }else
            if(self.visible){
                if(event.keyCode === 40){
                    self.choose(1);
                }else if(event.keyCode === 38){
                    self.choose(-1);
                }
            }
        }

        children.forEach(child=>this.push(child));

        let down = false;

        function onEnter(event){
            let key = event.keyCode || event.which;
            if(self.visible && key === 13){
                let el = self.element.querySelector('.'+selected);
                if(el){
                    select.call(self, el.dataset[dataKey], el);
                }
                event.preventDefault();
            }
        }

        function onDown(event){
            if(!down){
                down = true;
                let el = getTarget(event.target, targets);
                select.call(self, el.dataset[dataKey], el);
            }
        }

        function onUp(event){
            down = false;
        }

        document.addEventListener('keyup', onEnter);
        input.addEventListener('keyup', onKeyup, false);
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

        this.forEach(el=>{
            el = getTarget(el, this.classes);
            if(el.dataset[this.dataKey].indexOf(this.input.value) === 0){
                el.style.display = this.display;//'block';
            }else{
                el.style.display = 'none';
            }
        });

        this.element.style.opacity = 1;
    }
    forEach(callback){
        this.children.forEach(callback);
    }
    get children(){
        return Array.prototype.slice.call(this.element.children);
    }
    get visible(){
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
    push(value){
        this.element.appendChild(toElement(value));
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

function getTarget(target, targets){
    if(matches(target, '.'+targets.main)){
        return target;
    }

    if(target.children.length && !matches(target, '.'+targets.data)){
        return el.querySelector('.'+targets.data);
    }
    return target;
}

function makeSelection(children, className, start){
    for(let i=start; i<children.length; i++){
        if(children[i].style.display !== 'none'){
            children[i].classList.add(className);
        }
    }
}
