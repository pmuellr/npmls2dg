#!/usr/bin/env node

'use strict'

const PORT = process.env.PORT || '3000'

const http = require('http')

const st = require('st')
const chalk = require('chalk')
const shelljs = require('shelljs')
const yieldCallback = require('yield-callback')

const utils = require('../lib/utils')
const build = require('./build')

const logger = require('../lib/logger').getLogger(__filename)

const exec = shelljs.exec
const projectPath = utils.projectPath

yieldCallback.run(mainGen, () => {})

function * mainGen (cb) {
  console.log('-----------------------------------------------------------------')
  logger.log('source changed; build / test / serve')

  // build
  yield build.main(cb)
  if (cb.err) {
    logger.log(`build error: ${cb.err}`)
    process.exit(1)
  }

  // launch server
  const mount = st({
    path: projectPath('docs'),
    index: 'index.html',
    cache: false
  })

  http.createServer(mount).listen(PORT, () => {
    logger.log(`server started on http://localhost:${PORT}`)
  })

  // launch tests
  exec('npm run test', {async: true, silent: true}, (code, stdout, stderr) => {
    if (code === 0) {
      return logger.log(colorPass('----- tests passed! -----'))
    }

    logger.log('tests failed:')
    logger.log(stdout)
    logger.log(stderr)
    logger.log(colorFail('----- tests failed! -----'))
  })
}

// color for pass message
function colorPass (string) {
  return chalk.black.bgGreen(string)
}
// color for failure message
function colorFail (string) {
  return chalk.white.bgRed.bold(string)
}
