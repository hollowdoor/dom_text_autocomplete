import { toElement } from 'dom-elementals';
import matches from 'matches-selector';
import camelcase from 'camelcase';

class DOMTextAutocomplete {
    constructor(input, {
        parent = '<ol></ol>',
        classes = {},
        target = null,
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

        this.display = display;
        this.dataKey = dataKey;

        const dataProp = this.dataProp = camelcase(dataKey);

        this.element = toElement(parent);
        this.element.style.opacity = 0;

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
            if(self.visible){
                if(event.keyCode === 40){
                    self.choose(1);
                }else if(event.keyCode === 38){
                    self.choose(-1);
                }
            }
        }

        input.addEventListener('keyup', onKeyup, false);

        children.forEach(child=>this.push(child));

        let down = false, downListener;


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

        downListener = onDown;

        this.element.addEventListener('mousedown', onDown, false);
        this.element.addEventListener('mouseup', onUp, false);


        this.destroy = function(){
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
        console.log('direction ',direction)
        if([-1, 1].indexOf(direction) === -1){
            return;
        }

        let className = this.classes.selected;
        console.log(className)
        let selected = this.element.querySelector('.'+className);
        console.log('selected ',selected)
        let children = this.children;
        let index = selected
        ? children.indexOf(selected) + direction : 0;
        console.log('index ', index);
        if(direction === 1){
            for(let i=index; i<children.length; ++i){
                console.log('display ',children[i].style.display)
                if(children[i].style.display !== 'none'){
                    children[i].classList.add(className);
                    break;
                }
            }
        }else{
            for(let i=index; i>=0; --i){
                console.log('display ',children[i].style.display)
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
