import autoComplete from '../';
import arrowSelect from 'dom-arrow-select';
import { toElement } from 'dom-elementals';

let data = [
    'The Thing',
    'The Terminator',
    'Super man',
    'Legend of Sleepy Hollow',
    'The Shining',
    'Fifty Shades of Grey'
];

try{
    const list = toElement('<ol></ol>');
    const input = document.querySelector('input');
    document.body.appendChild(list);
    const as = arrowSelect({
        selectID: 'auto-selected',
        selected(next, prev){
            this.unSelect(prev);
            this.select(next);
        }
    });

    as.focus(list);
    as.on('focusenter', elements=>{
        input.value = elements[0].dataset.value;
    });
    as.on('pointerdown', elements=>{
        input.value = elements[0].dataset.value;
    });
    /*as.on('replaced', ()=>{
        as.current = null;
    });*/

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        console.log(mutation.type);
        as.current = null;
      });
    });
    observer.observe(list, {childList: true});


    const complete = autoComplete(input, {
        parent: '<ol></ol>',
        separator: '[ ]+',
        /*allowEntry(event){
            return [37, 38, 39, 40, 13]
            .indexOf(event.which || event.keyCode) === -1;
        },*/
        read(){
            //return fs.readDir(name)
            //.then(files=>this.push(files));
            this.empty().push(...data);
        },
        entry(){
            let filled = this.fill(list);
            as.emit('replaced');
            if(filled){
                list.style.display = 'block';
            }else{
                list.style.display = 'none';
            }
        },/*
        edit(){

            this.query('.auto-selected', list, 'value');
            if(list.offsetParent){
                this.value(list.querySelector('.auto-selected').dataset.value);
            }
        },*/
        render(data){
            return `<li class="value-target" data-value="${data}">${data}</li>`;
        }/*,
        activate(event){
            this.show();
        },
        keyup(event){
            this.show();
        },
        select(value, target){
            this.input.value = value;
            this.hide();
        }*/
    });

    //complete.push(...data);

    complete.input.focus();

    //complete.appendTo(document.body);

}catch(e){
    console.log(e);
}
