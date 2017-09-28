import autoComplete from '../';

try{
    const complete = autoComplete(document.querySelector('input'), {
        parent: '<ol></ol>',
        children: [
            '<li class="main-target value-target" data-value="The Thing">The Thing</li>',
            '<li class="main-target value-target" data-value="Super man">Super man</li>',
            '<li class="main-target value-target" data-value="Legend of Sleepy Hollow">Legend of Sleepy Hollow</li>',
            '<li class="main-target value-target" data-value="The Shining">The Shining</li>'
        ],
        separator: '[ ]+',
        activate(event){
            this.show();
        },
        keyup(event){
            this.show();
        },
        select(value, target){
            this.input.value = value;
            this.hide();
        }
    });

    complete.appendTo(document.body);

}catch(e){
    console.log(e);
}
