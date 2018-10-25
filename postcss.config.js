const autoprefixer = require('autoprefixer')
const postcssImport = require('postcss-import')

module.exports = {
    plugins: [postcssImport(), autoprefixer({ browsers: ['last 3 versions', '> 1%'] })],
}
