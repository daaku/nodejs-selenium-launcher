var fs = require('fs')
  , path = require('path')
  , request = require('request')
  , hashFile = require('hash_file')
  , spawn = require('child_process').spawn

var version = '2.19.0'
  , filename = 'selenium-server-standalone-' + version + '.jar'
  , url = 'http://selenium.googlecode.com/files/' + filename
  , outfile = path.join(path.dirname(__filename), filename)
  , expectedSha = 'e0714452754887614de6af2823fb2eed7842b6c1'

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
  console.log('Starting Selenium ' + version)
  var child = spawn('java', ['-jar', outfile])
    , prematureExit = function() {
        cb(new Error('Could not start Selenium.'))
      }
  child.stdout.on('data', function(data) {
    if (data.toString().indexOf('Started org.openqa.jetty.jetty.Server') != -1) {
      child.removeListener('exit', prematureExit)
      cb(null, child)
    }
  })
  child.on('exit', prematureExit)
}

module.exports = function(cb) {
  download(url, outfile, expectedSha, function(er) {
    if (er) return cb(er)
    run(cb)
  })
}
