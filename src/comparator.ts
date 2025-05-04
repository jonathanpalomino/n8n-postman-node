import { N8NWorkflowBuilder } from "./builders/N8NWorkflowBuilder";
const fileExported = './CMN_API_TRON.json';
const fileGenerated = './fichero.json';

console.log('🚀 Iniciando la comparación de nodos HTTP...');

try {
    const builderExported = new N8NWorkflowBuilder(fileExported);
    const builderGenerated = new N8NWorkflowBuilder(fileGenerated);

    const exportedHttpNodes = builderExported.workflow.nodes.filter(
        node => node.type === 'n8n-nodes-base.httpRequest'
    );
    const generatedHttpNodes = builderGenerated.workflow.nodes.filter(
        node => node.type === 'n8n-nodes-base.httpRequest'
    );

    const exportedMap = new Map(exportedHttpNodes.map(node => [node.name, node]));
    const generatedMap = new Map(generatedHttpNodes.map(node => [node.name, node]));

    exportedMap.forEach((exportedNode, name) => {
        //const generatedNode = generatedMap.get(name);
        const generatedNode = identifica(generatedMap, name);

        if (!generatedNode) {
            console.warn(`⚠️ Nodo HTTP "${name}" no existe en el workflow generado.`);
            return;
        }

        const differences = compareNodes(exportedNode, generatedNode);
        if (differences.length > 0) {
            console.log(`❗ Diferencias en el nodo HTTP "${name}":`);
            differences.forEach(diff => console.log(diff));
        }
    });

    // Detectar nodos generados que no están en el exportado
    generatedMap.forEach((_, name) => {
        if (!exportedMap.has(name)) {
            console.warn(`⚠️ Nodo HTTP "${name}" existe en el generado pero no en el exportado.`);
        }
    });

} catch (error) {
    console.error('❌ Error al procesar los workflows:', error);
}

function identifica<T>(map: Map<string, T>, name: string): T | undefined {
    for (const [key, value] of map.entries()) {
        if (key.includes(name)) {
            return value;
        }
    }
    return undefined;
}


function compareDeep(exported: any, generated: any, path: string = ''): string[] {
    const diffs: string[] = [];

    // Ambos son objetos
    if (typeof exported === 'object' && typeof generated === 'object' && exported && generated) {
        const allKeys = new Set([...Object.keys(exported), ...Object.keys(generated)]);

        for (const key of allKeys) {
            const fullPath = path ? `${path}.${key}` : key;

            if (!(key in exported)) {
                diffs.push(`➕ ${fullPath} agregado en generado: ${JSON.stringify(generated[key])}`);
            } else if (!(key in generated)) {
                diffs.push(`➖ ${fullPath} eliminado en generado`);
            } else {
                diffs.push(...compareDeep(exported[key], generated[key], fullPath));
            }
        }

    // Arrays
    } else if (Array.isArray(exported) && Array.isArray(generated)) {
        const sortedExported = [...exported].map(normalize).sort();
        const sortedGenerated = [...generated].map(normalize).sort();

        if (JSON.stringify(sortedExported) !== JSON.stringify(sortedGenerated)) {
            diffs.push(`🔁 ${path}: arrays diferentes`);
        }

    // Valores primitivos
    } else if (exported !== generated) {
        diffs.push(`🔁 ${path}: exportado = ${JSON.stringify(exported)}, generado = ${JSON.stringify(generated)}`);
    }

    return diffs;
}
// Función recursiva que ordena claves y arrays para comparación robusta
function normalize(value: any): any {
    if (Array.isArray(value)) {
        return value.map(normalize).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    }
    if (value && typeof value === 'object') {
        return Object.keys(value)
            .sort()
            .reduce((acc, key) => {
                acc[key] = normalize(value[key]);
                return acc;
            }, {} as Record<string, any>);
    }
    return value;
}

function compareNodes(exportedNode: any, generatedNode: any): string[] {
    return compareDeep(exportedNode, generatedNode);
}

