import { HeaderDefinition } from 'postman-collection';
import { StringUtils } from '../utils/StringUtils';

const utils = new StringUtils();

export class HeaderProperties {
    public key: string;
    public value: string;

    constructor(header: HeaderDefinition) {
        this.key = header.key || '';

        // Genera un valor con variables si aplica (ej. convierte "<string>" a {{KEY}})
        const processedValue = utils.generateVariable(this.key, header.value || '');

        // Aplica conversión final del valor (ej. snake_case, encoding, etc.)
        this.value = utils.convertValue(processedValue);
    }
}

