import { Range, WorkspaceEdit } from 'vscode'
import { QuickFix } from './quickFix'

export const allQuickFixes: QuickFix[] = [
    {
        codes: [1015],
        provide({ document, diagnosticRange }) {
            const edit = new WorkspaceEdit()
            edit.delete(document.uri, new Range(diagnosticRange.end, diagnosticRange.end.translate(0, 1)))
            return {
                title: 'Remove question mark',
                edit,
                isPreferred: true,
            }
        },
    },
]
