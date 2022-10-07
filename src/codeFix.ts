import { CodeAction, CodeActionContext, Diagnostic, Range, TextDocument, TextEdit } from 'vscode'

type CustomReturnFormat =
    | {
          title: string
          textEdits: TextEdit[]
          fixAll?: boolean
      }
    | {
          codeAction: CodeAction
      }

export interface CodeFix {
    codes: (number | string)[]
    provide: (context: {
        diagnostic: Diagnostic
        diagnosticRange: Range
        context: CodeActionContext
        match: RegExpExecArray
        document: TextDocument
    }) => CustomReturnFormat | undefined
    messageRegex?: RegExp
}
