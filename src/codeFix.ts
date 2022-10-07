import { CodeAction, CodeActionContext, Diagnostic, Range, TextDocument, TextEdit } from 'vscode'

type CustomReturnFormat =
    | {
          textEdits: TextEdit[]
          overrideTitle?: string
          fixAll?: boolean
      }
    | {
          codeAction: CodeAction
      }

export interface CustomCodeAction {
    title: string | undefined
    /** undefined - doesn't care, otherwise filter */
    exactPos?: boolean
    provide(context: { document: TextDocument; range: Range }): { textEdits: TextEdit[] } | { codeAction: CodeAction }
}

export interface CodeFixBase {
    codes: (number | string)[]
    fixAll?: boolean
    title: string | undefined
    provide: (context: {
        diagnostic: Diagnostic
        diagnosticRange: Range
        context: CodeActionContext & { /* Request range, should be ignored when undefined */ range?: Range }
        match: RegExpExecArray
        document: TextDocument
    }) => CustomReturnFormat | undefined
    messageRegex?: RegExp
}

export type CodeFix = CodeFixBase /*  | { group: { name: string; codeFixes: CodeFixBase[] } } */
