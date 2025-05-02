import { StringUtils } from "../utils/StringUtils";

const utils = new StringUtils();
export class PathParameterProperties {
    public key: string;
    public value: string;
    public isPath: boolean;

    constructor(param: string, valor: string) {
        this.key = param || '';
        this.isPath = param.startsWith(':') || param.startsWith('{{');
        // Genera un valor con variables si aplica (ej. convierte "<string>" a {{KEY}})
        const processedValue = utils.generateVariable(param, valor || '');

        // Aplica conversión final del valor (ej. snake_case, encoding, etc.)
        this.value = utils.convertValue(processedValue,false);
    }
}
