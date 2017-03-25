#!/usr/bin/env node

'use strict'

exports.run = run

const fs = require('fs')
const path = require('path')

const minimist = require('minimist')

const pkg = require('../package.json')
const npmls2dg = require('../npmls2dg')

const Logger = require('./logger').getLogger()

// run from the cli
function run () {
  const minimistOpts = {
    boolean: ['svg', 'dot', 'help', 'version'],
    alias: {
      s: 'svg',
      d: 'dot',
      h: 'help',
      v: 'version'
    }
  }

  const argv = minimist(process.argv.slice(2), minimistOpts)

  // check for help and version options
  if (argv.version) version()
  if (argv.help) help()

  // set up cmd, args, opts
  const iFileName = argv[0] || 0
  const oFileName = argv[1] || '-'

  let format = argv.dot ? 'dot' : 'svg'

  let input
  try {
    input = fs.readFileSync(iFileName, 'utf8')
  } catch (err) {
    const name = iFileName === 0 ? '<stdin>' : `file "${iFileName}"`
    Logger.log(`error reading ${name}: ${err}`)
    process.exit(1)
  }

  const opts = {
    format: format,
    messages: []
  }

  const output = npmls2dg.convert(input, opts)

  for (let message of opts.messages) Logger.log(message)

  if (output == null) process.exit(1)

  if (oFileName === '-') {
    console.log(output)
    process.exit(0)
  }

  try {
    fs.writeFileSync(oFileName, output)
  } catch (err) {
    Logger.log(`error writing ${oFileName}: ${err}`)
    process.exit(1)
  }
}

// print version and exit
function version () {
  console.log(pkg.version)
  process.exit(0)
}

// print help and exit
function help () {
  console.log(getHelp())
  process.exit(1)
}

// get help text
function getHelp () {
  const helpFile = path.join(__dirname, '..', 'HELP.md')
  let helpText = fs.readFileSync(helpFile, 'utf8')

  helpText = helpText.replace(/%%program%%/g, pkg.name)
  helpText = helpText.replace(/%%version%%/g, pkg.version)

  return helpText
}
