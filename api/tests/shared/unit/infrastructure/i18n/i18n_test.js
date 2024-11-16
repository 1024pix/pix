import { getI18n, options } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Shared | Infrastucture | i18n', function () {
  describe('default i18n options', function () {
    it('returns i18n options', function () {
      expect(options).to.have.property('locales').that.includes('en', 'fr', 'es', 'nl');
      expect(options).to.have.property('directory').that.is.a('string');
      expect(options).to.have.property('defaultLocale', 'fr');
      expect(options).to.have.property('queryParameter', 'lang');
      expect(options).to.have.property('languageHeaderField', 'Accept-Language');
      expect(options).to.have.property('objectNotation', true);
      expect(options).to.have.property('updateFiles', false);
      expect(options)
        .to.have.property('mustacheConfig')
        .to.deep.equal({
          tags: ['{', '}'],
          disable: false,
        });
    });
  });

  describe('getI18n', function () {
    it('returns an instance of i18n with default locale', function () {
      const i18n = getI18n();
      expect(i18n.getLocale()).to.equal('fr');
    });

    it('returns an instance of i18n with the specified locale', function () {
      const locale = 'es';
      const i18n = getI18n(locale);
      expect(i18n.getLocale()).to.equal(locale);
    });

    context('when the locale is BCP 47 format', function () {
      it('returns the correct locale instance of i18n', function () {
        const locale = 'nl-BE';
        const i18n = getI18n(locale);
        expect(i18n.getLocale()).to.equal('nl');
      });
    });

    context('when the locale is not supported', function () {
      it('returns the default locale instance of i18n', function () {
        const locale = 'foo';
        const i18n = getI18n(locale);
        expect(i18n.getLocale()).to.equal('fr');
      });
    });

    context('when the i18n setLocale is called on an i18n instance', function () {
      it('does not change the instance locale', function () {
        const i18n1 = getI18n('fr');
        i18n1.setLocale('en');
        expect(i18n1.getLocale()).to.equal('fr');
      });
    });
  });
});
