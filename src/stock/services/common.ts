import { camelCase } from 'lodash';
import { HttpService, Injectable } from '@nestjs/common';
import { AuthenticationData, LoginInput, PoItemData, PoItemsFetchInput } from '../dtos';
import { PoDetailError } from '../../errors';


@Injectable()
export class CommonService {

    constructor(
        private httpService: HttpService,
    ) { }

    login(input: LoginInput): Promise<AuthenticationData> {
        return this.httpService.post<AuthenticationData>('https://c-iprocure.com/scp/api/login.php', input, {
            responseType: 'json',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        }).toPromise()
            .then(response => {
                let data = response.data;
                if(typeof data == 'string'){
                    if(String(data).indexOf('c-iprocure.com') == 0){
                        data = String(data).substr("c-iprocure.com".length) as any;
                    }
                    data = JSON.parse(data as any);
                }
                if(data && Object.keys(data).length){
                    return this.camelCaseObjectMap(data)
                }
                return {
                    message: "Invalid username and password",
                }
            })
            .catch(error => {
                if(error.response && error.response.data) return error.response.data;
                return {
                    message: error.message,
                }
            })
    }

    getPoDetail(input: PoItemsFetchInput): Promise<PoItemData[]> {
        return this.httpService.get<PoItemData[]>(`https://c-iprocure.com/scp/api/quote/po_all.php?id=${input.poNo}`).toPromise()
            .then(response => {
                let data: PoItemData[] = response.data && (<any>response.data).records || [];
                if(Array.isArray(data) && data.length){
                    data = data.map((e: any) => {
                        if(e.status === "5"){
                            return e;
                        }
                    })
                    .filter(each => !!each)
                    data = this.camelCaseObjectMap(data)
                    
                    data.forEach((e: any) => {
                        e.statusCode = "approved";
                        e.name = String(e.productName).trim();
                        e.poNo = String(e.poNumber).trim();
                        e.qty = Number(e.quantity);
                        e.price = Number(e.unitAmount);
                        e.price = Number(e.unitAmount);
                        e.total = Number(e.total);
                    })

                    return data;
                }
                throw new Error("No approved item found or invalid PO");
            })
            .catch(error => {
                throw PoDetailError("No approved item found or invalid PO");
            })
    }

    camelCaseObjectMap = (modelObject: any) => {
        const isArray = Array.isArray(modelObject);
        const object = Object.assign({}, modelObject);
        const finalResult = Object.keys(object).reduce((result: any, key: any) => {
            let value = object[key];

            if (value && Array.isArray(value) && value.length) {
                value = value.map((eachValue: any) => {
                    return this.camelCaseObjectMap(eachValue);
                });
            }
            else if (value && typeof value == 'object' && Object.keys(value).length) {
                value = this.camelCaseObjectMap(value);
            }
            result[camelCase(key)] = value;

            return result;
        }, {});

        return (isArray) ? Object.values(finalResult) : finalResult;
    };
}
