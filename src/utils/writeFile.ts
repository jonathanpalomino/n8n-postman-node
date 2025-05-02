import * as fs from 'fs';
import { RequestProperties } from '../models/RequestProperties';
import { IWorkflowBase } from 'n8n-workflow';

export class writeFile {
    logRequestDetails(request: RequestProperties) {
        console.log(`Request name: ${request.name}`);
        console.log(`Request method: ${request.method}`);
        console.log(`Request URL: ${request.url}`);
    
        if (request.pathParameters.length > 0) {
            console.log('PathParameters:');
            request.pathParameters.forEach(param => {
                console.log(`  ${param.key}: ${param.value}`);
            });
        }
    
        if (request.headers.length > 0) {
            console.log('Headers:');
            request.headers.forEach(header => {
                console.log(`  ${header.key}: ${header.value}`);
            });
        }
    
        if (request.queryParameters.length > 0) {
            console.log('QueryParameters:');
            request.queryParameters.forEach(query => {
                console.log(`  ${query.key}: ${query.value}`);
            });
        }
    }

    escribeFichero(coleccion: IWorkflowBase, filePathJson: string) {
        // Convertir el objeto a una cadena JSON
        const jsonString = JSON.stringify(coleccion, null, 2);

        // Escribir la cadena JSON en un fichero
        fs.writeFile(filePathJson, jsonString, (err) => {
            if (err) {
                console.error('Error al escribir el fichero:', err);
            } else {
                console.log('Fichero escrito correctamente.');
            }
        });
    }
    
}