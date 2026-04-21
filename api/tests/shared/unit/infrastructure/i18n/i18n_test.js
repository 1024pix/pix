import { defaultSettings, getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';

describe('Unit | Shared | Infrastucture | i18n', function () {
  describe('getI18n', function () {
    it('returns an instance of i18n with default locale', function () {
      const i18n = getI18n();
      expect(i18n.getLocale()).to.equal('fr');
    });

    context('when the locale is supported and is a base locale', function () {
      it('returns an instance of i18n with the specified locale', function () {
        const locale = 'es';
        const i18n = getI18n(locale);
        expect(i18n.getLocale()).to.equal('es');
      });
    });

    context('when the locale is supported and is a BCP 47 format locale, not a base locale', function () {
      it('returns an instance of i18n with the specified locale', function () {
        // staticCatalog option is used to test the es-419 locale without having a .json file
        const settings = {
          ...defaultSettings,
          staticCatalog: {
            en: {},
            fr: {},
            es: {},
            'es-419': {},
            nl: {},
          },
        };
        const locale = 'es-419';
        const i18n = getI18n(locale, settings);
        expect(i18n.getLocale()).to.equal('es-419');
      });
    });

    context('when the locale is supported but has no translation file', function () {
      it('returns the corresponding fallback locale', function () {
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

    describe('getI18n().__', function () {
      it('interpolates parameters with single mustache', async function () {
        // when
        const result = getI18n().__('Hello {name}', { name: 'Bob' });

        // then
        expect(result).to.equal('Hello Bob');
      });

      it('interpolates parameter with single mustach when first argument is an object with explicit locale', async function () {
        // when
        const result = getI18n().__({ phrase: 'Hello {name}', locale: 'fr' }, { name: 'Bob' });

        // then
        expect(result).to.equal('Hello Bob');
      });
    });
  });
});
