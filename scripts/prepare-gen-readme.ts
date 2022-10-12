import { writeFileSync, readFileSync } from 'node:fs'

writeFileSync('./src/fixes.ts', readFileSync('./src/fixes.ts', 'utf8').replace(/import .+ from 'vscode'/, 'const vscode = {}'), 'utf8')
