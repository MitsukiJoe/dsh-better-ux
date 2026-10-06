import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const slice = source.slice(source.indexOf('function isTwinId('), source.indexOf('function useModelPickerSettings('))
const nestGroups = new Function(`${slice}\nreturn nestGroups`)()
const group = (id) => ({ id, models: [{ id: 'm' }] })

test('account and official providers lead the picker; other groups keep catalog order', () => {
  const out = nestGroups(['vercel', 'openrouter', 'deepseek-vision', 'deepseek-official', 'google', 'deepseek-account'].map(group))
  assert.deepEqual(out.map((g) => g.id), ['deepseek-account', 'deepseek-official', 'vercel', 'openrouter', 'google'])
})
