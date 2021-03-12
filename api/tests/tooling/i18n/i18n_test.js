const { expect } = require('../../test-helper');
const { getI18n } = require('./i18n');

describe('Unit | Tooling | i18n', () => {
  it('should translate by default to fr', () => {
    const i18n = getI18n();
    expect(i18n.__('current-lang'), 'fr');
  });
});
