import { INode } from 'n8n-workflow';
import { N8NPropertiesBuilder } from './builders/N8NPropertiesBuilder';
import { CollectionVariables } from './CollectionVariables';
import { N8NConfigNode } from './config/N8NConfigNode';
import { writeFile } from './utils/writeFile';
import { INodeExt } from './models/INodeExt';

console.log('Iniciando el proceso...'); // Nuevo log para depuración

const filePath = './collections/CMN.postman_collection.json'; //Ruta donde debe estar la coleccion
const filePathJson = './fichero.json';
const builder = new N8NPropertiesBuilder(filePath);
const file = new writeFile();
const variables = new CollectionVariables();
let hijos : INode[] =[];

console.log('Colección cargada...'); // Nuevo log para depuración

const requests = builder.getRequests();

console.log('Requests obtenidos...'); // Nuevo log para depuración

const coleccion = builder.createEmptyCollection("5RHv0VGPO6NpFgfD", "NOMBRE_COLECCION");

const config = new N8NConfigNode();
//config.positionsPath = [3,4];
config.globalAuth = builder.getAutentification({
    id: '3P6xM4IV32UC2X5t',
    name: 'API_BASIC'
});
config.defaultTypeResponse = 'json';

let nodoInicial = builder.createEmptyNode() as INodeExt;
nodoInicial.type = "n8n-nodes-base.manualTrigger";
nodoInicial.typeVersion = 1;
nodoInicial.position = [6780, 7780];
nodoInicial.name = "Inicia PROD";
coleccion.nodes.push(nodoInicial);

let nodoVariables = builder.createEmptyNode() as INodeExt;
nodoVariables.type = "n8n-nodes-base.set";
nodoVariables.typeVersion = 3.4;
nodoVariables.position = [7000, 7780];
nodoVariables.name = "Variables Generales";
nodoVariables.notesInFlow = false;
nodoVariables.parameters = {
    assignments: variables.getAssignmentCollectionValue()
};
coleccion.nodes.push(nodoVariables);

let nodoMerge = builder.createEmptyNode() as INodeExt;
nodoMerge.type = "n8n-nodes-base.merge";
nodoMerge.typeVersion = 3.1;
nodoMerge.position = [7220, 7780];
nodoMerge.name = "ProcesoMerge";
coleccion.nodes.push(nodoMerge);

console.log(JSON.stringify(coleccion));

requests.forEach((request) => {
    const elemento = builder.createHttpNodeFromRequest(request, config);
    //file.logRequestDetails(request);

    if (elemento.parameters?.url &&
        typeof elemento.parameters.url === 'string' &&
        elemento.parameters.url.indexOf('api/common') > 0) {

        coleccion.nodes.push(elemento);
        hijos.push(elemento);
    }
});
nodoMerge.hijos = hijos;

coleccion.connections = builder.estableceConexion(nodoInicial,nodoVariables,nodoMerge); //Conecta nodos en vinculo

file.escribeFichero(coleccion, filePathJson);
console.log('Proceso completado.'); // Nuevo log para depuración