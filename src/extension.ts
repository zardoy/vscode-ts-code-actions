import { CodeAction, CodeActionContext, CodeActionKind, commands, languages, Range, TextDocument, TextEdit, WorkspaceEdit } from 'vscode'
import { defaultJsSupersetLangsWithVue } from '@zardoy/vscode-utils/build/langs'
import { allCodeFixes } from './fixes'
import { getExtensionCommandId } from 'vscode-framework'
import { allCodeActions } from './codeActions'

const applyCodeAction = getExtensionCommandId('_runCodeAction' as never)
export const activate = () => {
    const applyPrefferableOnSave = true

    // todo svelte, custom
    const supportedLangs = defaultJsSupersetLangsWithVue
    languages.registerCodeActionsProvider(supportedLangs, {
        provideCodeActions(document, range, context, token) {
            return provideCodeActions(document, range, context)
        },
    })

    commands.registerCommand(applyCodeAction, async executeFn => {
        await executeFn()
    })
}

function provideCodeActions(document: TextDocument, range: Range | undefined, context: CodeActionContext) {
    let { diagnostics } = context

    const fixAllRequest = range && context.only?.contains(CodeActionKind.SourceFixAll)
    if (!fixAllRequest) diagnostics = diagnostics.filter(d => d.range.intersection(range!))

    const codeActions: CodeAction[] = []
    if (diagnostics.length) {
        const fixAllEdits: TextEdit[] = []
        for (let { codes, messageRegex, provide, ...defaults } of allCodeFixes) {
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
                    context: { ...context, range },
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
                    const { overrideTitle, textEdits } = providerResult
                    const fixAll = providerResult.fixAll ?? defaults.fixAll
                    edit.set(document.uri, textEdits)
                    codeFix = {
                        title: overrideTitle || defaults.title!,
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
    }

    // todo
    if (range) {
        const isInExactPos = range.start.isEqual(range.end)

        for (const refactor of allCodeActions) {
            if (refactor.exactPos && !isInExactPos) continue
            const prepareResult = refactor.provide({ document, range })
            if (!prepareResult) continue
            let data
            if (typeof prepareResult === 'object') data = prepareResult.data
            // todo non-undefined object assign
            const newCodeAction = new CodeAction(refactor.title!, CodeActionKind.Refactor)
            newCodeAction.command = {
                title: '',
                command: applyCodeAction,
                arguments: [
                    () => {
                        refactor.execute({ document, range, data })
                    },
                ],
            }
            codeActions.push(newCodeAction)
        }
    }

    return codeActions
}
