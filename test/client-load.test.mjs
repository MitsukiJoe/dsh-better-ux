import assert from 'node:assert/strict'
import test from 'node:test'

test('loads the client bundle through the official module loader', async () => {
  let plugin
  const React = { createElement: () => null }
  const icons = new Proxy({}, { get: () => () => null })
  globalThis.window = {
    __ModuleLoader__: {
      load(definition) {
        plugin = definition.factory((id) => {
          if (id === 'react') return React
          if (id === 'react-dom') return { createPortal: () => null }
          if (id === '@deepseek-ai/dsh-client-ui-primitives') return icons
          throw new Error('unexpected module: ' + id)
        })
      },
    },
  }
  await import('../lib/client.js?client-load-test')
  assert.equal(typeof plugin.apply, 'function')
  assert.deepEqual(plugin.inject, ['slots', 'sessions', 'workspaces', 'modelDirectories', 'locale'])
  delete globalThis.window
})
