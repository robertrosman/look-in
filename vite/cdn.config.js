// vite.config.js
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, '../src/Look.default.ts'),
      name: 'Look',
      formats: ['umd'],
      fileName: (format) => `look-in.min.js`
    }
  }
})