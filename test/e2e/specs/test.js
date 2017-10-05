// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'default e2e tests': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL

    browser
      .url(devServer)
      .waitForElementVisible('#app', 5000)
      .assert.elementCount('img', 1)
      .assert.elementPresent('#gcim-logo')
      .assert.elementPresent('#gcim-error')
      .assert.elementPresent('#gcim-invalid-config')
      .assert.elementPresent('#gcim-loading')
      .assert.elementPresent('#gcim-builds')
      .end()
  }
}
