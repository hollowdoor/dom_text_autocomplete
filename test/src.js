import autoComplete from '../';

try{
    const complete = autoComplete(document.querySelector('input'), {
        parent: '<ol></ol>',
        children: [
            '<li class="main-target" data-value="thing 1">Thing 1</li>',
            '<li class="main-target" data-value="thing 2">Thing 2</li>'
        ],
        activate(event){

                console.log(event.keyCode)
            this.show();
        },
        select(value, target){
            console.log('value ',value)
            this.input.value = value;
            this.hide();
        }
    });

    console.log(complete)

    complete.appendTo(document.body);

}catch(e){
    console.log(e);
}
