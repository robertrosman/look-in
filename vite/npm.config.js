// vite.config.js
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, '../src/index.ts'),
      name: 'Look',
      formats: ['umd', 'es'],
      fileName: (format) => `look-in.${format}.js`
    },
    emptyOutDir: false
  }
})