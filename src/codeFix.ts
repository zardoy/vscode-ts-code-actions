import { CodeAction, CodeActionContext, Diagnostic, Position, Range, TextDocument, TextEdit } from 'vscode'

type MaybePromise<T> = T | Promise<T>

type CustomReturnFormat =
    | {
          textEdits: TextEdit[]
          overrideTitle?: string
          fixAll?: boolean
      }
    | {
          codeAction: CodeAction
      }

interface CustomCodeActionProvide<P extends boolean = false> {
    exactPos: boolean
    provide(context: { document: TextDocument; range: Range }): undefined | boolean | { data? }
    execute(
        context: { document: TextDocument; data?: any } & (P extends true ? { pos: Position } : { range: Range }),
    ): MaybePromise<void /* { textEdits: TextEdit[] } | { codeAction: CodeAction } */>
}

export type CustomCodeAction = {
    title: string | undefined
    /** undefined - doesn't care, otherwise filter */
} & CustomCodeActionProvide

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
