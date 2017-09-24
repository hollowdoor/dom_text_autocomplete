import { toElement } from 'dom-elementals';
import matches from 'matches-selector';
import camelcase from 'camelcase';

class DOMTextAutocomplete {
    constructor(input, {
        parent = '<ol></ol>',
        target = null,
        dataKey = 'value',
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
        this.input = typeof input === 'string'
        ? document.querySelector(input)
        : input;

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
                if(matches(event.target, target)){
                    let el = event.target;
                    console.log('key', dataKey)
                    console.log('data ',el.dataset[dataKey])
                    /*if(!el.dataset[dataProp]){
                        el = el.querySelector('*['+dataKey+']');
                    }*/

                    let value = el.dataset[dataKey];
                    select.call(self, value, el);
                }
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
        let value = this.input.value,
            dataProp = this.dataProp,
            dataKey = this.dataKey,
            list = Array.prototype.slice.call(
                this.element.children);
        console.log(list);
        list.forEach(el=>{
            console.log()
            if(el.dataset[dataKey].indexOf(value) === 0){
                el.style.display = 'block';
            }else{
                el.style.display = 'none';
            }
            /*try{
                let el = child.querySelector('*['+dataKey+']');

            }catch(e){
                throw e;
            }*/

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
