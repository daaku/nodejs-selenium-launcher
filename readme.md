selenium-launcher [![Build Status](https://secure.travis-ci.org/nshah/nodejs-selenium-launcher.png)](http://travis-ci.org/nshah/nodejs-selenium-launcher)
=================

A library to download and launch the Selenium Server.

```javascript
require('selenium-launcher').launch(function(er, selenium) {
  // selenium is running
  // selenium.host / selenium.port are available
  // selenium is a child process, so you can do selenium.kill()
})
```

Testing
---

    node_modules/.bin/mocha -t 20000