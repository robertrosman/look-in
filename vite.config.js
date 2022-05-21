// vite.config.js
const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/Look.ts'),
      name: 'Look',
      fileName: (format) => `look-in.${format}.js`
    }
  }
})