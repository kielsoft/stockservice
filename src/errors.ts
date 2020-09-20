
const createError = (name: string, initData: {[key: string]: any} = {}) => {
    return (message: string, data: {[key: string]: any} = {}) => {
        let e = new Error(message);
        e.name = name;
        if(initData.code) (<any>e).code = initData.code;
        data = Object.assign(JSON.parse(JSON.stringify(initData)), JSON.parse(JSON.stringify(data)))
        if(Object.keys(data).length){
            if(typeof data.name !== 'undefined') delete data.name;
            if(typeof data.message !== 'undefined') delete data.message;
            if(typeof data.stack !== 'undefined') delete data.stack;

            if(Object.keys(data).length) e = Object.assign(e, data);
        }

        return e;
    }
}

export const InboundPutAwayError = createError('InboundPutAwayError', {code: 'INBOUND_PUTAWAY_ERROR'});
export const OutboundPickError = createError('OutboundPickError', {code: 'OUTBOUND_PICK_ERROR'});
export const PoDetailError = createError('PoDetailError', {code: 'PO_DETAIL_ERROR'});
// export const InvalidItemsCountError = createError('InvalidItemsCountError', {code: 'INVALID_ITEMS_COUNT_ERROR'});