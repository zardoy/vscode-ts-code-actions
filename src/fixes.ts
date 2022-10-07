import { Range } from 'vscode'
import { CodeFix } from './codeFix'

export const allCodeFixes: CodeFix[] = [
    {
        codes: [1015],
        provide({ diagnosticRange }) {
            return {
                title: 'Remove question mark',
                textEdits: [{ range: new Range(diagnosticRange.end, diagnosticRange.end.translate(0, 1)), newText: '' }],
                fixAll: true,
            }
        },
        // 2709
    },
]
