import { commands, workspace, WorkspaceEdit } from 'vscode'
import { CustomCodeAction } from './codeFix'

export const allCodeActions: CustomCodeAction[] = [
    {
        title: 'Remove name override',
        exactPos: true,
        provide({ document, range: { start: pos } }) {
            const range = document.getWordRangeAtPosition(pos, /[\w\d]+: [\w\d]+/)
            if (!range) return
            return { data: range }
        },
        async execute({ document, data: range }) {
            const pos = range.end
            const firstIdentifier = document.getText(range).match(/([\w\d]+):/)![1]!
            const edit = await commands.executeCommand<WorkspaceEdit>('vscode.executeDocumentRenameProvider', document.uri, pos, firstIdentifier)
            const patchEdit = (edit as any)._edits.find(({ edit }) => edit.range.contains(pos)).edit
            patchEdit._newText = ''
            patchEdit._range._start._character -= 2
            await workspace.applyEdit(edit)
        },
    },
]
