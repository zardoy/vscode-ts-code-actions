import { CodeAction, CodeActionContext, Diagnostic, Range, TextDocument } from 'vscode'

export interface CodeFix {
    codes: (number | string)[]
    provide: (context: {
        diagnostic: Diagnostic
        diagnosticRange: Range
        context: CodeActionContext
        match: RegExpExecArray
        document: TextDocument
    }) => CodeAction | undefined
    messageRegex?: RegExp
}
