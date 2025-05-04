import { DescriptionDefinition, HeaderList, Item, RequestBody, Url } from 'postman-collection';
import { HeaderProperties } from './HeaderProperties';
import { PathParameterProperties } from './PathParameterProperties';
import { QueryParameterProperties } from './QueryParameterProperties';
import { AuthProperties } from './AuthProperties';
import { BodyParameter } from './BodyParameter';
import { StringUtils } from '../utils/StringUtils';

const utils = new StringUtils();
export class RequestProperties {
    public name: string;
    public method: string;
    public url: string;
    public headers: HeaderProperties[];
    public pathParameters: PathParameterProperties[];
    public queryParameters: QueryParameterProperties[];
    public auth: AuthProperties | null;
    public description: string = '';
    public body: BodyParameter;
    public createVariables: boolean;

    constructor(item: Item) {
        this.createVariables = true;
        this.name = item.name;
        this.method = item.request.method;
        this.headers = this.extractHeadersParameters(item.request.headers)
        this.pathParameters = this.extractPathParameters(item.request.url);
        this.queryParameters = this.extractQueryParameters(item.request.url);
        this.auth = item.request.auth ? new AuthProperties(item.request.auth) : null;
        this.description = this.extractDescription(item.request.description);
        
        if (typeof item.request.description === 'string') {
            this.description = item.request.description;
        } else if (item.request.description) {
            this.description = item.request.description.content;
        }
        this.body = this.extractBody(item.request.body);

        this.url = this.constructUrl(item.request.url);
        this.url = this.constructUrlWithParameters(this.url, this.pathParameters);
    }

    
    private extractDescription(description: string | DescriptionDefinition | undefined): string {
        if (typeof description === 'string') {
            return description;
        } else if (description && 'content' in description) {
            return description.content;
        }
        return '';
    }

    constructUrlWithParameters(url: string, pathParameters: PathParameterProperties[]): string {
        this.pathParameters.forEach(param => {
            if (param.isPath) {
                const placeholder = `${param.key}`;
                this.url = this.url.replace(placeholder, param.value);
            }
        });
        return this.url;
    }

    extractBody(body: RequestBody | undefined): BodyParameter {
        const retorno: BodyParameter = {
            mode: body?.mode || '',
            raw: body?.raw || ''
        }
        return retorno;
    }

    private constructUrl(url: Url): string {
        const baseUrl = utils.convertValue(url.getHost());
        const path = url.path ? url.path.join('/') : '';
        const query = url.query 
            ? url.query
                .map(queryParam => {
                    const param = new QueryParameterProperties(queryParam);
                    return `${param.key}${param.value.startsWith('=') ? '' : '='}${param.value}`;

                })
                .join('&')
            : '';
        return `${baseUrl}/${path}${query ? '?' + query : ''}`;
    }

    extractHeadersParameters(headers: HeaderList): HeaderProperties[] {
        const headersParams: HeaderProperties[] = [];
        if(headers){
            headers.each(param=>{
                headersParams.push(new HeaderProperties(param));
            });
        }
        return headersParams;
    }

    private extractPathParameters(url: Url): PathParameterProperties[] {
        const pathParams: PathParameterProperties[] = [];
        if (url.path) {
            url.path.forEach(param => {
                // Detectamos si el segmento parece un path param (ej: ":id" o "{id}")
                const key = param.replace(/^[:{]/, '').replace(/}$/, '');
                // Buscamos en las variables del URL
                const variable = url.variables.one(key);

                let value = variable ? variable.value : '';

                pathParams.push(new PathParameterProperties(param, value));
            });
        }
        return pathParams;
    }

    private extractQueryParameters(url: Url): QueryParameterProperties[] {
        const queryParams: QueryParameterProperties[] = [];
        if (url.query) {
            url.query.each(queryParam => {
                queryParams.push(new QueryParameterProperties(queryParam));
            });
        }
        return queryParams;
    }
}
