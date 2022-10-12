// used on CI, before publish to marketplace
import { createWriteStream, existsSync, readFileSync, writeFileSync } from 'node:fs'
import stream from 'node:stream'
import got from 'got'
import util from 'util'

const diagnosticMessagesFile = './scripts/diagnosticMessages.json'
if (!existsSync(diagnosticMessagesFile)) {
    const pipeline = util.promisify(stream.pipeline)
    await pipeline(
        got.stream('https://raw.githubusercontent.com/microsoft/TypeScript/main/src/compiler/diagnosticMessages.json'),
        createWriteStream(diagnosticMessagesFile),
    )
}

const fileName = 'README.MD'
const markdown = readFileSync(fileName, 'utf8')

const parsedDiagnosticMessages: Record<string, { code }> = JSON.parse(readFileSync(diagnosticMessagesFile, 'utf8'))
const findDiagnosticByCode = (code: number) => Object.entries(parsedDiagnosticMessages).find(([, d]) => d.code === code)?.[0]

const insertIndex = markdown.indexOf('<!-- QUICK FIXES -->')

let headers = ['meta', 'Error names', 'Code action']
let insertLines = ''
insertLines += `\n|${headers.join('|')}|`
insertLines += `\n|${headers.map(() => '---').join('|')}|`

for (const codeFix of (await import('../src/fixes')).allCodeFixes) {
    let icons = ''
    if (codeFix.fixAll) icons += '🔧'
    const data = [icons, codeFix.codes.map(code => findDiagnosticByCode(code as number) ?? code).join(', '), codeFix.title]
    insertLines += `\n|${data.join('|')}|`
}

writeFileSync(fileName, markdown.slice(0, insertIndex) + insertLines + markdown.slice(insertIndex), 'utf8')
