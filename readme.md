selenium-launcher [![Build Status](https://secure.travis-ci.org/daaku/nodejs-selenium-launcher.png)](http://travis-ci.org/daaku/nodejs-selenium-launcher)
=================

A library to download and launch the Selenium Server.

```javascript
require('selenium-launcher').launch(function(er, selenium) {
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
SELENIUM_VERSION=2.31.0:63ef65e773015783a7828be201cc54988019adce node app.js
```

You'll have to supply a valid sha for the version.

A list of selenium-server jar's and their sha can be found on https://code.google.com/p/selenium/downloads/list


Testing
---

```sh
npm test
```
