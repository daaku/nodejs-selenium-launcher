var assert = require('assert')
  , soda = require('soda')
  , seleniumLauncher = require('selenium-launcher')

exports['sanity'] = function(done) {
  seleniumLauncher(function(er, selenium) {
    if (er) return done(er)
    selenium.on('exit', function() { done() })

    soda.createClient({
      url: 'http://www.facebook.com/',
      host: selenium.host,
      port: selenium.port,
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

exports['server from environment'] = function(done) {
  process.env.SELENIUM_LAUNCHER_PORT = '4444'
  seleniumLauncher(function(er, selenium) {
    delete process.env.SELENIUM_LAUNCHER_PORT
    if (er) return done(er)
    assert.equal(selenium.port, 4444)
    selenium.on('exit', function() { done() })
    selenium.kill()
  })
}
