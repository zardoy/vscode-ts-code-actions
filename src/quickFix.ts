import { CodeAction, CodeActionContext, Diagnostic, Range, TextDocument } from 'vscode'

export interface QuickFix {
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
