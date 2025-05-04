import * as fs from 'fs';
import { IWorkflowBase } from 'n8n-workflow';
export class N8NWorkflowBuilder {
    public workflow: IWorkflowBase;
    constructor(filePath: string) {
        const collectionJson = fs.readFileSync(filePath, 'utf-8');
        const collectionData = JSON.parse(collectionJson);

        this.workflow = collectionData;
    }
}