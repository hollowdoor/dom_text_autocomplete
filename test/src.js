import autoComplete from '../';

try{
    const complete = autoComplete(document.querySelector('input'), {
        parent: '<ol></ol>',
        separator: '[ ]+',
        render(data){
            return `<li>${data.value}</li>`;
        },
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

    let data = [
        {value: 'The Thing'},
        {value: 'Super man'},
        {value: 'Legend of Sleepy Hollow'},
        {value: 'The Shining'},
        {value: 'Fifty Shades of Grey'}
    ];

    complete.push(...data);

    complete.input.focus();

    complete.appendTo(document.body);

}catch(e){
    console.log(e);
}
