import { CodeAction, CodeActionKind, languages, TextEdit, WorkspaceEdit } from 'vscode'
import { defaultJsSupersetLangsWithVue } from '@zardoy/vscode-utils/build/langs'
import { allCodeFixes } from './fixes'

export const activate = () => {
    const applyPrefferableOnSave = true

    // todo svelte, custom
    const supportedLangs = defaultJsSupersetLangsWithVue
    languages.registerCodeActionsProvider(supportedLangs, {
        provideCodeActions(document, range, context, token) {
            let { diagnostics } = context

            const fixAllRequest = context.only?.contains(CodeActionKind.SourceFixAll)
            if (!fixAllRequest) diagnostics = diagnostics.filter(d => d.range.intersection(range))
            if (!diagnostics.length) return

            const codeActions: CodeAction[] = []
            const fixAllEdits: TextEdit[] = []
            for (let { codes, messageRegex, provide } of allCodeFixes) {
                const diagnosticsToApply = diagnostics
                    .map(diagnostic => {
                        const { code, message } = diagnostic
                        if (!code || !codes.includes(typeof code === 'object' ? code.value : code)) return undefined!
                        if (messageRegex) {
                            if (!message) return undefined!
                            const match = messageRegex.exec(message)
                            messageRegex.lastIndex = 0
                            if (!match) return undefined!
                            return {
                                diagnostic,
                                match,
                            }
                        } else {
                            return {
                                diagnostic,
                            }
                        }
                    })
                    .filter(Boolean)

                for (let { diagnostic, match } of diagnosticsToApply) {
                    const providerResult = provide({
                        context,
                        diagnostic,
                        diagnosticRange: diagnostic.range,
                        match: match!,
                        document,
                    })
                    if (!providerResult) continue
                    let codeFix: CodeAction
                    if ('codeAction' in providerResult) {
                        codeFix = providerResult.codeAction
                    } else {
                        const edit = new WorkspaceEdit()
                        const { title, textEdits, fixAll } = providerResult
                        edit.set(document.uri, textEdits)
                        codeFix = {
                            title,
                            edit,
                            isPreferred: fixAll,
                        }
                        // todo
                        if (fixAll) fixAllEdits.push(...textEdits)
                    }
                    if (!codeFix.diagnostics) codeFix.diagnostics = [diagnostic]
                    if (!codeFix.kind) {
                        codeFix.kind = CodeActionKind.QuickFix
                    }
                    codeActions.push(codeFix)
                }
            }

            if (fixAllRequest && fixAllEdits.length) {
                const edit = new WorkspaceEdit()
                edit.set(document.uri, fixAllEdits)
                codeActions.push({
                    title: 'Apply all TS Quick Fixes fixes',
                    edit,
                    kind: CodeActionKind.SourceFixAll,
                })
            }

            return codeActions
        },
    })
}
