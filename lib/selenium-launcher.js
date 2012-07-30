var fs = require('fs')
  , path = require('path')
  , request = require('request')
  , hashFile = require('hash_file')
  , spawn = require('child_process').spawn
  , freeport = require('freeport')
  , EventEmitter = require('events').EventEmitter
  , util = require('util')

var version = '2.25.0'
  , filename = 'selenium-server-standalone-' + version + '.jar'
  , url = 'http://selenium.googlecode.com/files/' + filename
  , outfile = path.join(path.dirname(__filename), filename)
  , expectedSha = '8e2b23874a6d3316079cf606ce7f75d221305934'

function download(url, outfile, expectedSha, cb) {
  var real = function() {
    console.log('Downloading Selenium ' + version)
    var i = 0
    request({ url: url })
      .on('end', function() {
        process.stdout.write('\n')
        cb()
      })
      .on('data', function() {
        if (i == 8000) {
          process.stdout.write('\n')
          i = 0
        }
        if (i % 100 === 0) process.stdout.write('.')
        i++
      })
      .pipe(fs.createWriteStream(outfile))
  }

  fs.stat(outfile, function(er, stat) {
    if (er) return real()
    hashFile(outfile, 'sha1', function(er, actualSha) {
      if (er) return cb(er)
      if (actualSha != expectedSha) return real()
      cb()
    })
  })
}

function run(cb) {
  freeport(function(er, port) {
    if (er) throw er
    console.log('Starting Selenium ' + version + ' on port ' + port)
    var child = spawn('java', [
      '-jar', outfile,
      '-port', port,
    ])
    child.host = '127.0.0.1'
    child.port = port

    var badExit = function() { cb(new Error('Could not start Selenium.')) }
    child.stdout.on('data', function(data) {
      var sentinal = 'Started org.openqa.jetty.jetty.Server'
      if (data.toString().indexOf(sentinal) != -1) {
        child.removeListener('exit', badExit)
        cb(null, child)
      }
    })
    child.on('exit', badExit)
  })
}

function FakeProcess(port) {
  EventEmitter.call(this)
  this.host = '127.0.0.1'
  this.port = port
}
util.inherits(FakeProcess, EventEmitter)
FakeProcess.prototype.kill = function() {
  this.emit('exit')
}

module.exports = function(cb) {
  if (process.env.SELENIUM_LAUNCHER_PORT) {
    return process.nextTick(
      cb.bind(null, null, new FakeProcess(process.env.SELENIUM_LAUNCHER_PORT)))
  }

  download(url, outfile, expectedSha, function(er) {
    if (er) return cb(er)
    run(cb)
  })
}
