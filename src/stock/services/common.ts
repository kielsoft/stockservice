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
                if(data && Object.keys(data).length){
                    //data.jwt = data.jwt? 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjLWlwcm9jdXJlLmNvbSIsImF1ZCI6IlRIRV9BVURJRU5DRSIsImlhdCI6MTYwOTQyNzM5NiwibmJmIjoxNjA5NDI3NDA2LCJleHAiOjE2MDk0Mjc0NTYsImRhdGEiOnsidXNlcl9pZCI6IjEiLCJjb250YWN0X25hbWUiOiJTdXBlciBBZG1pbiIsImJyYW5jaF9pZCI6IjQiLCJlbWFpbCI6ImNpYWRtaW5AYy1pbGVhc2luZy5jb20ifX0.j7_xFzJwubROK9H0tzOyo3U7wcv0ruMcz9IvuwqWxeI' : data.jwt;
                    return this.camelCaseObjectMap(data)
                }
                throw Error("Invalid username and password");
            })
            .catch(error => {
                console.log("Error: ", error.message, input);
                throw Error("Invalid username and password");
                //if(error.response && error.response.data) return error.response.data;
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
