import * as fs from 'fs';
import { Collection, Item } from 'postman-collection';
import { RequestProperties } from '../models/RequestProperties';
import { AuthProperties } from '../models/AuthProperties';
import { v4 as uuidv4 } from 'uuid';
import { N8NConfigNode } from '../config/N8NConfigNode';
import { IConnection, IConnections, INode, INodeCredentialsDetails, INodeParameters, IWorkflowBase, NodeConnectionType } from 'n8n-workflow';
import { INodeExt } from '../models/INodeExt';

export class N8NPropertiesBuilder {
    private collection: Collection;
    public globalAuth: AuthProperties | null;

    constructor(filePath: string) {
        const collectionJson = fs.readFileSync(filePath, 'utf-8');
        const collectionData = JSON.parse(collectionJson);
        this.collection = new Collection(collectionData);
        this.globalAuth = collectionData.auth ? new AuthProperties(collectionData.auth) : null;
    }

    getAutentification(httpCredential: INodeCredentialsDetails): AuthProperties | null {
        if (this.globalAuth) {
            this.globalAuth.authN8n = {
                id: httpCredential.id,
                name: httpCredential.name
            };
        }
        return this.globalAuth;
    }

    public getRequests(): RequestProperties[] {
        const requests: RequestProperties[] = [];
        this.collection.forEachItem((item: Item) => {
            requests.push(new RequestProperties(item));
        });
        return requests;
    }

    createHttpNodeFromRequest(request: RequestProperties, config?: N8NConfigNode): INode {
        config = config ?? new N8NConfigNode(); // Si config es null o undefined, se instancia
        const httpNode = this.createEmptyHttpNode();
        const { parameters } = httpNode;

        httpNode.type = 'n8n-nodes-base.httpRequest';
        httpNode.typeVersion = 4.2;
        httpNode.name = this.generateName(request, config.positionsPath);
        httpNode.id = uuidv4();
        httpNode.position = [0, 0];
        httpNode.notes = request.description;


        parameters.url = request.url;
        parameters.method = request.method;

        this.handlePostMethod(request, parameters);
        this.handleHeaders(request, parameters);
        this.handleQueryParameters(request, parameters);
        this.handleAuth(config.globalAuth, httpNode);
        this.handleOptions(config.defaultTypeResponse, parameters);

        return httpNode;
    }

    handleOptions(config: string, parameters: INodeParameters) {
        if (config && config.trim()) {  // Verifica si config no es null, vacío o solo espacios en blanco
            parameters.options = {
                response: {
                    response: {
                        responseFormat: config // Formato JSON para la respuesta
                    }
                }
            };
        }
    }


    private handlePostMethod(request: RequestProperties, parameters: INodeParameters) {
        if (request.method === 'POST') {
            if (request.body.raw) {
                parameters.sendBody = true;
                parameters.jsonBody = request.body.raw;
            }

            if (request.body.mode === 'raw') {
                parameters.specifyBody = 'json';
            }
        }
    }

    private handleHeaders(request: RequestProperties, parameters: INodeParameters) {
        if (request.headers.length > 0) {
            parameters.sendHeaders = true;
            parameters.headerParameters = {
                parameters: request.headers.map(({ key, value }) => ({ name: key, value }))
            };
        }
    }

    private handleQueryParameters(request: RequestProperties, parameters: INodeParameters) {
        if (request.queryParameters.length > 0) {
            parameters.sendQuery = true;
            parameters.queryParameters = {
                parameters: request.queryParameters.map(({ key, value }) => ({ name: key, value }))
            };
        }
    }

    private handleAuth(globalAuth: AuthProperties | null, nodo: INode) {
        if (globalAuth?.authN8n) {
            nodo.credentials = {
                httpBasicAuth: {
                    id: globalAuth.authN8n.id,
                    name: globalAuth.authN8n.name
                }
            };

            if (globalAuth.type === 'basic') {
                nodo.parameters.authentication = 'genericCredentialType';
                nodo.parameters.genericAuthType = 'httpBasicAuth';
            }
        }
    }

    generateName(param: RequestProperties, posiciones: number[]): string {
        let finalName = param.name;
        const paramVariables = param.pathParameters;
        let prefixName = '';

        if (posiciones.length == 0) {
            const long = paramVariables.length;
            posiciones = [long - 1];
        }

        posiciones.forEach(element => {
            const variable = paramVariables[element];
            if (variable?.key) {
                prefixName += `${variable.key}-`;
            }
        });

        if (prefixName.length > 0) {
            finalName = `${finalName} [${prefixName.slice(0, -1)}]`;
        }

        return finalName;
    }

    createEmptyHttpNode(): INode {
        return {
            parameters: {
                url: '',
                method: ''
            },
            type: '',
            typeVersion: 0,
            position: [0, 0],
            id: '',
            name: ''
        };
    }

    createEmptyNode(): INode {
        return {
            parameters: {},
            type: '',
            typeVersion: 0,
            position: [0, 0],
            id: uuidv4(),
            name: ''
        };
    }

    createEmptyCollection(id: string, name: string): IWorkflowBase {
        return {
            id: id,
            name: name,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            nodes: [],
            connections: {}
        }
    }

    estableceConexion(...nodes: INodeExt[]): IConnections {
        const connections: IConnections = {};

        for (let i = 0; i < nodes.length; i++) {
            const currentNode = nodes[i];
            const nextNode = nodes[i + 1];

            let mainConnections: IConnection[] = [];
            if(nextNode !==undefined){
                mainConnections = [
                    {
                        node: nextNode.name,
                        type: 'main' as NodeConnectionType,
                        index: i,
                    },
                ];
            }

            // Si el nodo tiene hijos, agregarlos al mismo nivel
            if (currentNode.hijos?.length) {
                const hijosConnections = currentNode.hijos.map(hijo => ({
                    node: hijo.name,
                    type: 'main' as NodeConnectionType,
                    index: 0,
                }));

                mainConnections.push(...hijosConnections);
            }

            connections[currentNode.name] = {
                main: [mainConnections],
            };
        }

        return connections;
    }
}
