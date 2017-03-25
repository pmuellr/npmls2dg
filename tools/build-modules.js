#!/usr/bin/env node

'use strict'

const fs = require('fs')

const shelljs = require('shelljs')
const browserify = require('browserify')
const catSourceMap = require('cat-source-map')
const yieldCallback = require('yield-callback')

const utils = require('../lib/utils')

const logger = require('../lib/logger').getLogger(__filename)

const mkdir = shelljs.mkdir
const projectPath = utils.projectPath

// main function
const main = yieldCallback(mainGen)
exports.main = main

const runBrowserify = yieldCallback(runBrowserifyGen)

function * mainGen (cb) {
  mkdir('-p', projectPath('tmp'))
  mkdir('-p', projectPath('web-resources'))

  yield runBrowserify(cb)
}

// run browserify
function * runBrowserifyGen (cb) {
  const tmpFile = projectPath('tmp/modules.js')
  const outFile = projectPath('docs/app.js')
  const entry = projectPath('lib/web/index.js')

  const browserifyOpts = {
    debug: true
  }

  const br = browserify(entry, browserifyOpts)
  const buf = yield br.bundle(cb)
  if (cb.err) {
    logger.log(`browserify error: ${cb.err}`)
    return cb.err
  }

  fs.writeFileSync(tmpFile, buf)

  const catSourceMapOpts = {
    fixFileNames: true
  }

  catSourceMap.processFiles(outFile, [tmpFile], catSourceMapOpts)

  logger.log('wrote: docs/app.js')
}

// run main if requested
if (require.main === module) {
  main((err) => {
    if (err) process.exit(1)
  })
}
