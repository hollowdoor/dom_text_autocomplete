const eventsProto = Object.assign(Object.create(null), {
    on(name, cb, options){
        this.element.addEventListener(name, cb, options);
        this._records[name] = this._records[name] || [];
        this._records[name].push([
            name, cb, options
        ]);
        return this;
    },
    off(name, cb, options){
        this.element.removeEventListener(name, cb, options);

        if(this._records[name] !== void 0){
            let records = this._records[name];

            for(let i=0; i<records.length; i++){
                if(records[i][1] === cb && records[i][2] === options){
                    records.splice(i, 1);
                    if(i + 1 !== records.length){
                        --i;
                    }
                }
            }
        }
        return this;
    },
    dispatch(event){
        this.element.dispatchEvent(event);
        return this;
    },
    clear(){
        for(let name in this._records){
            let records = this._records[name];
            records.forEach(record=>{
                this.off(...record);
            });
        }
        return this;
    }
});

export default function events(element, tracker = null){
    const eve = Object.create(eventsProto);
    eve.element = element;
    eve._records = Object.create(null);

    if(tracker){
        tracker.list.push(eve);
    }

    return eve;
}

events.track = function track(){
    return {
        list: [],
        clear(){
            this.list.forEach(item=>{
                item.clear();
            });
        }
    };
}
