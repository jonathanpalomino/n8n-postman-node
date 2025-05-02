export class StringUtils {
    generateVariable(key: string, value: string): any {
        let rawValue = value || '';
        if (rawValue === '<integer>' || rawValue === '<string>') {
            rawValue = this.toSnakeUpperCase('{{'+key+'}}') || '';
        }
        return rawValue;
    }
    convertValue(value: string | null, symbol: boolean = true): string {
        if (!value) {
            return '';
        }
        const replacement = symbol ? '={{$json.$1}}' : '{{$json.$1}}';
        return value.replace(/{{(.*?)}}/g, replacement);
    }
    
    toSnakeUpperCase(text: string | null) {
        if (!text) {
            return '';
        }
        return text.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '');
    }
}

