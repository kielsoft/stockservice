export const buildPaginationWithData = <T extends any>(data: any[], total, pagination: {limit: number, page: number}): T => {
    return {
        data, 
        count: data.length,
        limit: pagination.limit,
        page: pagination.page,
        pages: Number((total/pagination.limit).toFixed()) || (total && 1) || 0
    } as T;
}

export const itemArrayToObject = <T extends any>(items: {sku: string}[]): {[key: string]: T} => {
    let itemsObject: {[key: string]: T} = {}
    items.forEach(item => itemsObject[item.sku] = item as T);
    return itemsObject;
}

export const cloneData = <T>(data: T): T => {
    return JSON.parse(JSON.stringify(data));
}