var soda = require('soda')
  , seleniumLauncher = require('selenium-launcher')

exports['sanity'] = function(done) {
  var selenium = null
  seleniumLauncher(function(er, s) {
    if (er) return done(er)
    selenium = s
    selenium.on('exit', function() { done() })

    soda.createClient({
      url: 'http://www.facebook.com/',
      host: '127.0.0.1',
      port: 4444,
    })
    .chain
    .session()
    .setTimeout(5000)
    .open('/')
    .waitForPageToLoad(2000)
    .waitForTextPresent('Email')
    .assertTextPresent('Email')
    .testComplete()
    .end(function() {
      selenium.kill()
    })
  })
}
