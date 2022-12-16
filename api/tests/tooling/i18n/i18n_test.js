const { expect } = require('../../test-helper');
const { getI18n } = require('./i18n');

describe('Unit | Tooling | i18n', function () {
  it('should translate by default to fr', function () {
    const currentLang = getI18n().__('current-lang');
    expect(currentLang).to.equal('fr');
  });
});
