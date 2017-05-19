#!/usr/bin/env node

'use strict'

exports.cli = cli
exports.convert = convert

const Graphviz = require('viz.js')

const Logger = require('./lib/logger').getLogger()

// run as cli
function cli () {
  require('./lib/cli').run()
}

// convert npm ls --json output to a Graphviz graph
function convert (input, opts) {
  let ls

  opts = opts || {}
  opts.format = opts.format || 'svg'
  opts.messages = opts.messages || []

  try {
    ls = JSON.parse(input)
  } catch (err) {
    opts.messages.push(`error parsing JSON input: ${err}`)
    return null
  }

  ls.name = ls.name || '[anonymous]'
  ls.from = '.'

  const pkgs = {}
  flattenLs(ls, ls.name, opts, pkgs)
  Logger.debug(`flattened pkgs: ${JSON.stringify(pkgs, null, 4)}`)

  const dot = generateGraphviz(pkgs, opts)
  if (opts.format === 'dot') return dot

  const gvOpts = {
    totalMemory: 65536 * 256 * 2 // 33,554,432
  }

  const svg = Graphviz(dot, gvOpts)
  return svg
}

// flatten the npm ls output to object with properties of:
// key: name@version
// value: {
//   id: string,
//   name: string,
//   version: string
//   from: string[] (removing prefix)
//   resolved: string
//   dependencies: key[]
// }
function flattenLs (ls, name, opts, pkgs) {
  const version = ls.version || 'unknown'
  const from = ls.from == null ? '???' : ls.from.replace(/.*?@/, '')
  const key = `${name}@${version}`
  let val = pkgs[key]

  // if already in pkgs output, add from, then return
  if (val != null) {
    if (val.from.indexOf(from) === -1) {
      val.from.push(from)
    }
    return val
  }

  // otherwise create new output value
  val = {
    id: `${name}@${version}`,
    name: name,
    version: version,
    from: [from],
    resolved: ls.resolved,
    dependencies: []
  }

  // flatten deps
  if (ls.dependencies) {
    for (let pkgName in ls.dependencies) {
      const dep = flattenLs(ls.dependencies[pkgName], pkgName, opts, pkgs)
      val.dependencies.push(dep.id)
    }
  }

  pkgs[key] = val

  return val
}

// generate the graphviz output
// key: name@version
// value: {
//   id: string,
//   name: string,
//   version: string
//   from: string[] (removing prefix)
//   resolved: string
//   dependencies: key[]
// }
function generateGraphviz (pkgs, opts) {
  const out = []

  out.push('digraph g {')
  out.push('    graph [')
  out.push('        rankdir = "LR"')
  out.push('    ];')

  for (let pkgKey in pkgs) {
    const pkg = pkgs[pkgKey]

    Logger.debug(`processing pkg: ${JSON.stringify(pkg, null, 4)}`)

    out.push(`    "${pkg.id}" [`)
    out.push('        shape = "none"')

    const href = `href="https://npmjs.org/package/${pkg.name}"`
    const tip = `title="resolved: ${pkg.resolved}"`
    const attrs = `align="left" border="1" ${href} ${tip}`
    const thAttrs = `${attrs} bgcolor="cyan"`
    const tdAttrs = `${attrs} bgcolor="green"`

    const label = []
    label.push('<table border="0" cellspacing="0" cellpadding="5">')
    label.push(`<tr><td ${thAttrs}><font point-size="24">${pkg.name}</font></td></tr>`)
    label.push(`<tr><td ${tdAttrs}>${pkg.version}</td></tr>`)

    for (let versionRange of pkg.from) {
      versionRange = versionRange
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      label.push(`<tr><td ${tdAttrs}>${versionRange}</td></tr>`)
    }
    label.push('</table>')

    out.push(`        label = <${label.join('\n')}>`)
    out.push('    ];')
  }

  for (let pkgKey in pkgs) {
    const pkg = pkgs[pkgKey]

    for (let dependency of pkg.dependencies) {
      const edge = `"${pkg.id}" -> "${dependency}";`
      out.push(`    ${edge}`)
    }
  }

  out.push('}')

  return out.join('\n')
}

// run cli if invoked as main module
if (require.main === module) cli()
