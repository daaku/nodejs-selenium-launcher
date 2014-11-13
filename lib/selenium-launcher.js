var fs = require('fs')
  , path = require('path')
  , request = require('request')
  , hashFile = require('hash_file')
  , spawn = require('child_process').spawn
  , freeport = require('freeport')
  , EventEmitter = require('events').EventEmitter
  , util = require('util')

var override = process.env.SELENIUM_VERSION ? process.env.SELENIUM_VERSION.split(':') : []
  , version = override[0] || '2.44.0'
  , expectedSha = override[1] || 'deb2a8d4f6b5da90fd38d1915459ced2e53eb201'
  , filename = 'selenium-server-standalone-' + version + '.jar'
  , url = 'http://selenium-release.storage.googleapis.com/'+version.replace(/.\d$/,'')+'/' + filename
  , outfile = path.join(path.dirname(__filename), filename)

function download(url, outfile, expectedSha, cb) {
  var real = function() {
    console.log('Downloading Selenium ' + version)
    console.log('From: ' + url)
    var i = 0
    var requestOptions = {url: url};
    if (process.env.http_proxy != null) {
      requestOptions.proxy = process.env.http_proxy;
    }
    request(requestOptions)
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
      if (actualSha != expectedSha) {
        console.log('Actual sha was: ' + actualSha + ', but expected: ' + expectedSha)
        return real();
      }
      cb()
    })
  })
}

function run(cb) {
  freeport(function(er, port) {
    if (er) throw er;
    console.log('Starting Selenium ' + version + ' on port ' + port);
    console.log('Filename: ' + outfile);
    var child = spawn('java', [
      '-jar', outfile,
      '-port', port,
    ])
    child.host = '127.0.0.1'
    child.port = port

    var badExit = function() { cb(new Error('Could not start Selenium.')) }
    child.stderr.on('data', function(data) {
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
  this.emit('exit');
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
