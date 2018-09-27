module.exports = {
  'Test simple Pix' : function (browser) {
    browser
      .url('http://localhost:4200')
      .waitForElementVisible('.signin-form__panel', 1000)
      .assert.containsText('.signin-form__panel', 'Se connecter')
      .end();
  }
};
