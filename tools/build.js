#!/usr/bin/env node

'use strict'

const yieldCallback = require('yield-callback')

const buildModules = require('./build-modules')

const logger = require('../lib/logger').getLogger(__filename)

// main function
const main = yieldCallback(mainGen)

function * mainGen (cb) {
  const timeStarted = Date.now()

  yield buildModules.main(cb)
  if (cb.err) return cb.err

  const timeElapsed = (Date.now() - timeStarted) / 1000
  logger.log(`successful build in ${timeElapsed.toLocaleString()} seconds`)
}

// done late since main is a variable
exports.main = (cb) => main(cb || function () {})

// invoke main if requested
if (require.main === module) {
  main((err) => {
    if (err) process.exit(1)
  })
}
