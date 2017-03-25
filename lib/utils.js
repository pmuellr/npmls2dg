'use strict'

exports.projectPath = projectPath
exports.onlyCallOnce = onlyCallOnce
exports.countDownCall = countDownCall
exports.fileExists = fileExists
exports.directoryExists = directoryExists
exports.baseFileName = baseFileName

const fs = require('fs')
const path = require('path')

const ProjectPath = path.dirname(__dirname)

const Logger = require('./logger').getLogger(__filename)

// Return the path of a file relative to the project root if path provided.
// If path not provided, returns the project path itself.
function projectPath (aPath) {
  if (aPath == null) return ProjectPath

  return path.relative(ProjectPath, aPath)
}

// Return a version of a function which will only be called once
function onlyCallOnce (fn) {
  let called = false

  return function onlyCalledOnce () {
    if (called) return
    called = true

    return fn.apply(null, arguments)
  }
}

// Return a version of a function that's only called after `times` number of times
function countDownCall (times, fn) {
  if (times < 1) times = 1
  fn = onlyCallOnce(fn)

  return function countDownCalled () {
    if (times <= 0) return

    times--
    if (times !== 0) return

    return fn.apply(null, arguments)
  }
}

// Return boolean indicating if file exists
function fileExists (fileName) {
  const stats = pathExists(fileName)
  if (!stats) return false
  return stats.isFile()
}

// Return boolean indicating if directory exists
function directoryExists (dirName) {
  const stats = pathExists(dirName)
  if (!stats) return false
  return stats.isDirectory()
}

// Return false if path doesn't exist, otherwise it's stat object
function pathExists (pathName) {
  let stats
  try {
    stats = fs.statSync(pathName)
  } catch (err) {
    Logger.debug(`fs.statsSync(${pathName}) threw error`, err)
    return false
  }

  return stats
}

// returns the base name of a file, without the `.js` bit
function baseFileName (fileName) {
  return path.basename(__filename).replace(/\.js$/, '')
}
