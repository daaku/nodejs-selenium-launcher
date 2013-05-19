selenium-launcher [![Build Status](https://secure.travis-ci.org/daaku/nodejs-selenium-launcher.png)](http://travis-ci.org/daaku/nodejs-selenium-launcher)
=================

A library to download and launch the Selenium Server.

```javascript
var seleniumLauncher = require('selenium-launcher')
seleniumLauncher(function(er, selenium) {
  // selenium is running
  // selenium.host / selenium.port are available
  // selenium is a child process, so you can do selenium.kill()
})
```

Forcing selenium server version
---

You can override the selenium server version used by the launcer
 via the environment variable

```bash
SELENIUM_VERSION=2.32.0:c94e6d5392b687d3a141a35f5a489f50f01bef6a node app.js
```

You'll have to supply a valid sha for the version.

A list of selenium-server jar's and their sha can be found on
https://code.google.com/p/selenium/downloads/list


Testing
---

```sh
npm test
```
