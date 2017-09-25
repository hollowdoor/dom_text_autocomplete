import { toElement } from 'dom-elementals';
import matches from 'matches-selector';
import camelcase from 'camelcase';

class DOMTextAutocomplete {
    constructor(input, {
        parent = '<ol></ol>',
        targets = {},
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
            main = '.main-target',
            data = '.value-target'
        } = (targets || {});

        targets = this.targets = {
            main, data
        };

        this.display = display;
        this.dataKey = dataKey;
        const dataProp = this.dataProp = camelcase(dataKey);

        this.element = toElement(parent);
        this.element.style.opacity = 0;

        function onKeyup(event){
            activate.call(self, event);
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

        Array.prototype.slice.call(
                this.element.children)
        .forEach(el=>{
            el = getTarget(el, this.targets);
            if(el.dataset[this.dataKey].indexOf(this.input.value) === 0){
                el.style.display = this.display;//'block';
            }else{
                el.style.display = 'none';
            }
        });

        this.element.style.opacity = 1;
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
        console.log('this.element ', this.element)
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
    if(matches(target, targets.main)){
        return target;
    }

    if(target.children.length && !matches(target, targets.data)){
        return el.querySelector(targets.data);
    }
    return target;
}
