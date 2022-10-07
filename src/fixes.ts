import { Position, Range } from 'vscode'
import { CodeFix } from './codeFix'

export const allCodeFixes: CodeFix[] = [
    // https://github.com/Microsoft/TypeScript/blob/v4.5.5/src/compiler/diagnosticMessages.json#L458
    {
        // Parameter cannot have question mark and initializer.
        codes: [1015],
        title: 'Remove question mark',
        fixAll: true,
        provide({ diagnosticRange }) {
            return {
                textEdits: [{ range: new Range(diagnosticRange.end, diagnosticRange.end.translate(0, 1)), newText: '' }],
            }
        },
    },
    {
        // Cannot use namespace '{0}' as a type.
        codes: [2709],
        title: 'Add typeof',
        provide({ diagnosticRange }) {
            return {
                textEdits: [{ range: diagnosticRange.with({ end: diagnosticRange.start }), newText: 'typeof ' }],
            }
        },
    },
]

// type annotations in js
const removeTypeAnnotationsFixes: CodeFix[] = [
    {
        codes: [8010, 8011],
        title: 'Remove type annotation',
        provide({ document, diagnosticRange }) {
            const textBefore = document.getText(new Range(new Position(0, 0), diagnosticRange.start))
            const removeLength = textBefore.match(/\s*:\s*$/)?.[0]?.length
            if (removeLength === undefined) return
            return {
                textEdits: [{ range: new Range(diagnosticRange.start.translate(0, -removeLength), diagnosticRange.end), newText: '' }],
            }
        },
    },
]

allCodeFixes.push(...removeTypeAnnotationsFixes)
