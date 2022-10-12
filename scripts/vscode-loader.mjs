import { URL } from 'node:url'

export function resolve(specifier, context, nextResolve) {
    if (specifier.includes('vscode')) {
        return {
            shortCircuit: true,
            format: 'module',
            url: new URL('./vscode.mjs', import.meta.url),
        }
    }

    // Let Node.js handle all other specifiers.
    return nextResolve(specifier)
}

export function load(url, context, nextLoad) {
    return nextLoad(url)
}
