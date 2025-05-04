import { AssignmentCollectionValue, AssignmentValue } from "n8n-workflow";
import { v4 as uuidv4 } from 'uuid';

const assignments_local :AssignmentValue[] = [
    variable("COD_IDIOMA", "ES"),
    //Otras Variables
];

export class CollectionVariables {
    getAssignmentCollectionValue(): AssignmentCollectionValue {
        return {assignments: assignments_local};
    }
}

function variable(name: string, value: any) : AssignmentValue {
    let type;
    switch (typeof value) {
        case 'string':
            type = 'string';
            break;
        case 'number':
            type = 'number';
            break;
        case 'boolean':
            type = 'boolean';
            break;
        case 'object':
            if (Array.isArray(value)) {
                type = 'array';
            } else {
                type = 'object';
            }
            break;
        default:
            type = 'unknown';
    }
    return {
        id : uuidv4(),
        name : name,
        value : value,
        type: type
    };
}