import { CodeAction, CodeActionKind, languages } from 'vscode'
import { defaultJsSupersetLangsWithVue } from '@zardoy/vscode-utils/build/langs'
import { allQuickFixes } from './fixes'

export const activate = () => {
    const applyPrefferableOnSave = true

    // todo svelte, custom
    const supportedLangs = defaultJsSupersetLangsWithVue
    languages.registerCodeActionsProvider(supportedLangs, {
        provideCodeActions(document, range, context, token) {
            const { diagnostics } = context
            if (!diagnostics.length) return

            const codeActions: CodeAction[] = []
            for (let { codes, messageRegex, provide } of allQuickFixes) {
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
                    const codeFix = provide({
                        context,
                        diagnostic,
                        diagnosticRange: diagnostic.range,
                        match: match!,
                        document,
                    })
                    if (codeFix) {
                        if (!codeFix.diagnostics) codeFix.diagnostics = [diagnostic]
                        if (!codeFix.kind) {
                            codeFix.kind = applyPrefferableOnSave && codeFix.isPreferred ? CodeActionKind.SourceFixAll : CodeActionKind.QuickFix
                        }
                        codeActions.push(codeFix)
                    }
                }
            }

            return codeActions
        },
    })
}
