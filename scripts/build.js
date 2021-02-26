const path = require('path')
const chalk = require('chalk')
const hexoFs = require('hexo-fs')

function resolveRootPath(...args) {
  return path.resolve(__dirname, '../', ...args)
}

function build() {
  const thirdFiles = hexoFs.listDirSync(resolveRootPath('./third'))

  for (const file of thirdFiles) {
    hexoFs.copyFile(
      resolveRootPath(`./third/${file}`),
      resolveRootPath(`./public/${file}`),
    )
    console.log(
      chalk.green('COPY'),
      ' File:',
      chalk.magenta(`./third/${file}`),
      'to',
      chalk.magenta(`./public/${file}`),
    )
  }
}

const moduleList = [{ name: 'third', run: build }]

if (typeof hexo !== 'undefined' && hexo) {
  hexo.once('generateBefore', () => {
    for (const { name, run } of moduleList) {
      run()
    }
  })
}
