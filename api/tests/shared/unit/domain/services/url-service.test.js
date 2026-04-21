import { getSupportedLocales } from '../../../../../src/shared/domain/services/locale-service.js';
import {
  getEmailValidationUrl,
  getPixAppConnexionUrl,
  getPixAppUrl,
  getPixCertifUrl,
  getPixOrgaUrl,
  getPixWebsiteDomain,
  getPixWebsiteUrl,
  getSupportUrl,
  PIX_WEBSITE_PATHS,
  PIX_WEBSITE_ROOT_URLS,
} from '../../../../../src/shared/domain/services/url-service.js';

describe('Unit | Shared | Domain | Services | url-service', function () {
  describe('getPixWebsiteUrl', function () {
    context('all supported locales must have a Pix Website localized URL', function () {
      getSupportedLocales().forEach((locale) => {
        it(`returns the Pix Website localized URL for locale "${locale}"`, function () {
          // given / when
          const url = getPixWebsiteUrl(locale);

          // then
          expect(url).to.equal(PIX_WEBSITE_ROOT_URLS[locale]);
        });
      });
    });

    context('when locale is not supported or not canonical', function () {
      [
        { locale: 'fr-fr', expected: 'https://pix.fr' },
        { locale: 'nl-NL', expected: 'https://pix.org/nl-be' },
        { locale: 'tlh', expected: 'https://pix.org/fr' },
      ].forEach(({ locale, expected }) => {
        it(`returns the best Pix Website localized URL for locale "${locale}"`, function () {
          // given / when
          const url = getPixWebsiteUrl(locale);

          // then
          expect(url).to.equal(expected);
        });
      });
    });
  });

  describe('getPixWebsiteDomain', function () {
    it('returns the Pix Website domain according to the locale', function () {
      // given
      const locale = 'fr-FR';

      // when
      const domain = getPixWebsiteDomain(locale);

      // then
      expect(domain).to.equal('pix.fr');
    });
  });

  describe('getPixAppUrl', function () {
    context('when locale is fr-FR or fr-fr', function () {
      ['fr-fr', 'fr-FR'].forEach((locale) => {
        it(`returns the Pix App URL with France domain for locale "${locale}"`, function () {
          // given / when
          const url = getPixAppUrl(locale);

          // then
          expect(url).to.equal('https://test.app.pix.fr/');
        });
      });
    });

    context('when locale is not fr-FR and supported or not', function () {
      [
        { locale: 'fr', expected: 'https://test.app.pix.org/?locale=fr' },
        { locale: 'en', expected: 'https://test.app.pix.org/?locale=en' },
        { locale: 'fr-BE', expected: 'https://test.app.pix.org/?locale=fr-BE' },
        { locale: 'tlh', expected: 'https://test.app.pix.org/?locale=fr' },
        { locale: 'fr-CA', expected: 'https://test.app.pix.org/?locale=fr' },
        { locale: 'fr_CA', expected: 'https://test.app.pix.org/?locale=fr' },
        { locale: null, expected: 'https://test.app.pix.org/?locale=fr' },
      ].forEach(({ locale, expected }) => {
        it(`returns the Pix App URL with Org domain for locale "${locale}"`, function () {
          // given / when
          const url = getPixAppUrl(locale);

          // then
          expect(url).to.equal(expected);
        });
      });
    });

    context('when pathname is provided', function () {
      it('appends the pathname to the Pix App URL', function () {
        // given
        const locale = 'en';
        const pathname = '/connexion';

        // when
        const url = getPixAppUrl(locale, { pathname });

        // then
        expect(url).to.equal('https://test.app.pix.org/connexion?locale=en');
      });
    });

    context('when queryParams are provided', function () {
      it('appends the queryParams to the Pix App URL', function () {
        // given
        const locale = 'en';
        const queryParams = { code: '123+' };

        // when
        const url = getPixAppUrl(locale, { queryParams });

        // then
        expect(url).to.equal('https://test.app.pix.org/?code=123%2B&locale=en');
      });

      context('when locale is provided in the queryParams', function () {
        it('overrides the locale parameter', function () {
          // given
          const locale = 'fr';
          const queryParams = { locale: 'en' };

          // when
          const url = getPixAppUrl(locale, { queryParams });

          // then
          expect(url).to.equal('https://test.app.pix.org/?locale=en');
        });
      });

      context('when lang is provided in the queryParams', function () {
        it('overrides the locale parameter', function () {
          // given
          const locale = 'fr';
          const queryParams = { lang: 'en' };

          // when
          const url = getPixAppUrl(locale, { queryParams });

          // then
          expect(url).to.equal('https://test.app.pix.org/?lang=en');
        });
      });
    });

    context('when hash is provided', function () {
      it('appends the hash to the Pix App URL', function () {
        // given
        const locale = 'en';
        const hash = '#section';

        // when
        const url = getPixAppUrl(locale, { hash });

        // then
        expect(url).to.equal('https://test.app.pix.org/?locale=en#section');
      });
    });

    context('when skipLocaleParam is true', function () {
      it('does not add the locale queryParam', function () {
        // given
        const locale = 'en';
        const pathname = '/api/hello';

        // when
        const url = getPixAppUrl(locale, { pathname, skipLocaleParam: true });

        // then
        expect(url).to.equal('https://test.app.pix.org/api/hello');
      });
    });
  });

  describe('getPixOrgaUrl', function () {
    context('when locale is fr-FR or fr-fr', function () {
      ['fr-fr', 'fr-FR'].forEach((locale) => {
        it(`returns the Pix Orga URL with France domain for locale "${locale}"`, function () {
          // given / when
          const url = getPixOrgaUrl(locale);

          // then
          expect(url).to.equal('https://orga.pix.fr/');
        });
      });
    });

    context('when locale is not fr-FR and supported or not', function () {
      [
        { locale: 'fr', expected: 'https://orga.pix.org/?locale=fr' },
        { locale: 'en', expected: 'https://orga.pix.org/?locale=en' },
        { locale: 'fr-BE', expected: 'https://orga.pix.org/?locale=fr-BE' },
        { locale: 'tlh', expected: 'https://orga.pix.org/?locale=fr' },
        { locale: 'fr-CA', expected: 'https://orga.pix.org/?locale=fr' },
        { locale: 'fr_CA', expected: 'https://orga.pix.org/?locale=fr' },
        { locale: null, expected: 'https://orga.pix.org/?locale=fr' },
      ].forEach(({ locale, expected }) => {
        it(`returns the Pix Orga URL with Org domain for locale "${locale}"`, function () {
          // given / when
          const url = getPixOrgaUrl(locale);

          // then
          expect(url).to.equal(expected);
        });
      });
    });

    context('when pathname is provided', function () {
      it('appends the pathname to the Pix Orga URL', function () {
        // given
        const locale = 'en';
        const pathname = '/connexion';

        // when
        const url = getPixOrgaUrl(locale, { pathname });

        // then
        expect(url).to.equal('https://orga.pix.org/connexion?locale=en');
      });
    });

    context('when queryParams are provided', function () {
      it('appends the queryParams to the Pix Orga URL', function () {
        // given
        const locale = 'en';
        const queryParams = { code: '123+' };

        // when
        const url = getPixOrgaUrl(locale, { queryParams });

        // then
        expect(url).to.equal('https://orga.pix.org/?code=123%2B&locale=en');
      });

      context('when locale is provided in the queryParams', function () {
        it('overrides the locale parameter', function () {
          // given
          const locale = 'fr';
          const queryParams = { locale: 'en' };

          // when
          const url = getPixOrgaUrl(locale, { queryParams });

          // then
          expect(url).to.equal('https://orga.pix.org/?locale=en');
        });
      });

      context('when lang is provided in the queryParams', function () {
        it('overrides the locale parameter', function () {
          // given
          const locale = 'fr';
          const queryParams = { lang: 'en' };

          // when
          const url = getPixOrgaUrl(locale, { queryParams });

          // then
          expect(url).to.equal('https://orga.pix.org/?lang=en');
        });
      });
    });

    context('when hash is provided', function () {
      it('appends the hash to the Pix Orga URL', function () {
        // given
        const locale = 'en';
        const hash = '#section';

        // when
        const url = getPixOrgaUrl(locale, { hash });

        // then
        expect(url).to.equal('https://orga.pix.org/?locale=en#section');
      });
    });
  });

  describe('getPixCertifUrl', function () {
    context('when locale is fr-FR or fr-fr', function () {
      ['fr-fr', 'fr-FR'].forEach((locale) => {
        it(`returns the Pix Certif URL with France domain for locale "${locale}"`, function () {
          // given / when
          const url = getPixCertifUrl(locale);

          // then
          expect(url).to.equal('https://certif.pix.fr/');
        });
      });
    });

    context('when locale is not fr-FR and supported or not', function () {
      [
        { locale: 'fr', expected: 'https://certif.pix.org/?locale=fr' },
        { locale: 'en', expected: 'https://certif.pix.org/?locale=en' },
        { locale: 'fr-BE', expected: 'https://certif.pix.org/?locale=fr-BE' },
        { locale: 'tlh', expected: 'https://certif.pix.org/?locale=fr' },
        { locale: 'fr-CA', expected: 'https://certif.pix.org/?locale=fr' },
        { locale: 'fr_CA', expected: 'https://certif.pix.org/?locale=fr' },
        { locale: null, expected: 'https://certif.pix.org/?locale=fr' },
      ].forEach(({ locale, expected }) => {
        it(`returns the Pix Certif URL with Org domain for locale "${locale}"`, function () {
          // given / when
          const url = getPixCertifUrl(locale);

          // then
          expect(url).to.equal(expected);
        });
      });
    });

    context('when pathname is provided', function () {
      it('appends the pathname to the Pix Certif URL', function () {
        // given
        const locale = 'en';
        const pathname = '/connexion';

        // when
        const url = getPixCertifUrl(locale, { pathname });

        // then
        expect(url).to.equal('https://certif.pix.org/connexion?locale=en');
      });
    });

    context('when queryParams are provided', function () {
      it('appends the queryParams to the Pix Certif URL', function () {
        // given
        const locale = 'en';
        const queryParams = { code: '123+' };

        // when
        const url = getPixCertifUrl(locale, { queryParams });

        // then
        expect(url).to.equal('https://certif.pix.org/?code=123%2B&locale=en');
      });

      context('when locale is provided in the queryParams', function () {
        it('overrides the locale parameter', function () {
          // given
          const locale = 'fr';
          const queryParams = { locale: 'en' };

          // when
          const url = getPixCertifUrl(locale, { queryParams });

          // then
          expect(url).to.equal('https://certif.pix.org/?locale=en');
        });
      });

      context('when lang is provided in the queryParams', function () {
        it('overrides the locale parameter', function () {
          // given
          const locale = 'fr';
          const queryParams = { lang: 'en' };

          // when
          const url = getPixCertifUrl(locale, { queryParams });

          // then
          expect(url).to.equal('https://certif.pix.org/?lang=en');
        });
      });
    });

    context('when hash is provided', function () {
      it('appends the hash to the Pix Certif URL', function () {
        // given
        const locale = 'en';
        const hash = '#section';

        // when
        const url = getPixCertifUrl(locale, { hash });

        // then
        expect(url).to.equal('https://certif.pix.org/?locale=en#section');
      });
    });
  });

  describe('getEmailValidationUrl', function () {
    context('when locale is fr-FR', function () {
      it('returns the email validation URL on France domain with redirect url', function () {
        // given
        const locale = 'fr-FR';
        const redirectUrl = 'https://test.app.pix.fr/redirect-here';

        // when
        const url = getEmailValidationUrl({ locale, token: 'ABC', redirectUrl });

        // then
        expect(url).to.equal(
          `https://test.app.pix.fr/api/users/validate-email?token=ABC&redirect_url=${encodeURIComponent(redirectUrl)}`,
        );
      });
    });

    context('when locale is not fr-FR', function () {
      it('returns the email validation URL on Org domain with redirect url', function () {
        // given
        const locale = 'en';
        const redirectUrl = 'https://test.app.pix.fr/redirect-here';

        // when
        const url = getEmailValidationUrl({ locale, token: 'ABC', redirectUrl });

        // then
        expect(url).to.equal(
          `https://test.app.pix.org/api/users/validate-email?token=ABC&redirect_url=${encodeURIComponent(redirectUrl)}`,
        );
      });
    });

    context('when no validation token', function () {
      it('returns the redirect URL', function () {
        // given
        const redirectUrl = 'https://test.app.pix.fr/redirect-here';

        // given / when
        const url = getEmailValidationUrl({ locale: 'fr', redirectUrl });

        // then
        expect(url).to.equal(redirectUrl);
      });
    });

    context('when no redirect uri', function () {
      it('returns the email validation URL without redirect', function () {
        // given / when
        const url = getEmailValidationUrl({ locale: 'fr', token: 'ABC' });

        // then
        expect(url).to.equal('https://test.app.pix.org/api/users/validate-email?token=ABC');
      });
    });
  });

  describe('getPixAppConnexionUrl', function () {
    context('when locale is fr-FR or fr-fr', function () {
      ['fr-fr', 'fr-FR'].forEach((locale) => {
        it(`returns the Pix App connexion URL for locale "${locale}" without locale parameter`, function () {
          // given / when
          const url = getPixAppConnexionUrl(locale);

          // then
          expect(url).to.equal('https://test.app.pix.fr/connexion');
        });
      });

      context('when locale is not fr-FR and supported or not', function () {
        [
          { locale: 'fr', nearestBaseLocale: 'fr' },
          { locale: 'en', nearestBaseLocale: 'en' },
          { locale: 'nl-BE', nearestBaseLocale: 'nl-BE' },
          { locale: 'fr-BE', nearestBaseLocale: 'fr-BE' },
          { locale: 'tlh', nearestBaseLocale: 'fr' },
          { locale: 'fr-CA', nearestBaseLocale: 'fr' },
          { locale: 'fr_CA', nearestBaseLocale: 'fr' },
          { locale: null, nearestBaseLocale: 'fr' },
        ].forEach(({ locale, nearestBaseLocale }) => {
          it(`returns the Pix App connexion URL for locale "${locale}" with nearest base locale in locale parameter`, function () {
            // given / when
            const url = getPixAppConnexionUrl(locale);

            // then
            expect(url).to.equal(`https://test.app.pix.org/connexion?locale=${nearestBaseLocale}`);
          });
        });
      });
    });
  });

  describe('getSupportUrl', function () {
    context('all supported locales must have a Pix Support localized URL', function () {
      getSupportedLocales().forEach((locale) => {
        it(`returns the Pix Support localized URL for locale "${locale}"`, function () {
          // given / when
          const url = getSupportUrl(locale);

          // then
          expect(url).to.equal(`${PIX_WEBSITE_ROOT_URLS[locale]}/${PIX_WEBSITE_PATHS.SUPPORT[locale]}`);
        });
      });
    });

    context('when locale is not supported or not canonical', function () {
      [
        { locale: 'fr-fr', expected: 'https://pix.fr/support' },
        { locale: 'nl-NL', expected: 'https://pix.org/nl-be/support' },
        { locale: 'tlh', expected: 'https://pix.org/fr/support' },
      ].forEach(({ locale, expected }) => {
        it(`returns the best Pix Support localized URL for locale "${locale}"`, function () {
          // given / when
          const url = getSupportUrl(locale);

          // then
          expect(url).to.equal(expected);
        });
      });
    });
  });
});
