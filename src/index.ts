import { N8NPropertiesBuilder } from './builders/N8NPropertiesBuilder';
import { N8NConfigNode } from './config/N8NConfigNode';
import { writeFile } from './utils/writeFile';

console.log('Iniciando el proceso...'); // Nuevo log para depuración

const filePath = './collections/NWT_CMN.postman_collection.json';
const filePathJson = './fichero.json';
const builder = new N8NPropertiesBuilder(filePath);
const file = new writeFile();

console.log('Colección cargada...'); // Nuevo log para depuración

const requests = builder.getRequests();

console.log('Requests obtenidos...'); // Nuevo log para depuración

const coleccion = builder.createEmptyCollection("5RHv0VGPO6NpFgfD", "API_TRON");

//const vinculos = builder.createEmptyNodeMerge();

const config = new N8NConfigNode();
//config.positionsPath = [3,4];
config.globalAuth = builder.getAutentification({
    id: '3P6xM4IV32UC2X5t',
    name: 'API_TRON'
});
config.defaultTypeResponse = 'json';


requests.forEach((request) => {
    const elemento = builder.createHttpNodeFromRequest(request, config);
    file.logRequestDetails(request);

    if (elemento.parameters?.url &&
        typeof elemento.parameters.url === 'string' &&
        elemento.parameters.url.indexOf('api/common') > 0) {

        coleccion.nodes.push(elemento);

        /*const elem = builder.createVinculation({
            node: elemento.name,
            type: "main",
            index: 0
        });*/

        //vinculos.push(elem);
    }
});
//builder.instanciaConexiones(coleccion,vinculos,'ProcesoMerge');
file.escribeFichero(coleccion, filePathJson);
console.log('Proceso completado.'); // Nuevo log para depuración