import { QueryParam } from 'postman-collection';
import { StringUtils } from '../utils/StringUtils';

const utils = new StringUtils();

export class QueryParameterProperties {
    public key: string;
    public value: string;

    constructor(queryParam: QueryParam) {
        this.key = queryParam.key || '';

        // Genera un valor con variables si aplica (ej. convierte "<string>" a {{KEY}})
        const processedValue = utils.generateVariable(this.key, queryParam.value || '');

        // Aplica conversión final del valor (ej. snake_case, encoding, etc.)
        this.value = utils.convertValue(processedValue);
    }
}
