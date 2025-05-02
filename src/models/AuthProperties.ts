import { INodeCredentialsDetails } from 'n8n-workflow';
import { RequestAuth } from 'postman-collection';

export class AuthProperties {
    public type?: string;
    public credentials?: { [key: string]: string };
    public authN8n ?: INodeCredentialsDetails ;

    constructor(auth: RequestAuth) {
        this.type = auth.type;
        this.credentials = {};
        const authParams = auth[this.type as keyof RequestAuth];
        if (Array.isArray(authParams)) {
            authParams.forEach(param => {
                if (param.key !== undefined && param.value !== undefined) {
                    this.credentials![param.key] = param.value;
                }
            });
        }
    }
}
