const fs = require('fs')

const index = fs.readFileSync('./dist/index.html').toString()
fs.writeFileSync(
  './dist/f1.html',
  index.replace('/cover_1.png', '/cover_2.png')
)
