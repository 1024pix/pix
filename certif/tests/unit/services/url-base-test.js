// This file is a COPY of an original file from mon-pix.
// If you need a change, modify the original file and
// propagate the changes in the copies in all the fronts.

import { setupTest } from 'ember-qunit';
import ENV from 'pix-certif/config/environment';
import { PIX_WEBSITE_PATHS, PIX_WEBSITE_ROOT_URLS } from 'pix-certif/services/url-base';
import setupIntl from 'pix-certif/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setCurrentLocale } from '../../helpers/setup-intl.js';

const { SUPPORTED_LOCALES } = ENV.APP;

module('Unit | Service | url-base', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('homeUrl', function () {
    test('returns the application home url', function (assert) {
      // given
      const service = this.owner.lookup('service:url-base');

      // when
      const homeUrl = service.homeUrl;

      // then
      assert.strictEqual(homeUrl, '/?lang=fr');
    });
  });

  module('serverStatusUrl', function () {
    test('returns the Pix server status url', function (assert) {
      // given
      const service = this.owner.lookup('service:url-base');

      // when
      const homeUrl = service.serverStatusUrl;

      // then
      assert.strictEqual(homeUrl, 'https://status.pix.org/?locale=fr');
    });
  });

  module('pixAppUrl', function () {
    test('returns the Pix app url for tld org', function (assert) {
      // given
      const service = this.owner.lookup('service:url-base');
      sinon.stub(ENV, 'APP').value({ PIX_APP_URL_WITHOUT_EXTENSION: 'https://app.pix.' });

      const domainService = this.owner.lookup('service:current-domain');
      sinon.stub(domainService, 'getExtension').returns('org');

      // when
      const homeUrl = service.pixAppUrl;

      // then
      assert.strictEqual(homeUrl, 'https://app.pix.org');
    });

    test('returns the Pix app url for tld fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url-base');
      sinon.stub(ENV, 'APP').value({ PIX_APP_URL_WITHOUT_EXTENSION: 'https://app.pix.' });

      const domainService = this.owner.lookup('service:current-domain');
      sinon.stub(domainService, 'getExtension').returns('fr');

      // when
      const homeUrl = service.pixAppUrl;

      // then
      assert.strictEqual(homeUrl, 'https://app.pix.fr');
    });
  });

  module('pixAppForgottenPasswordUrl', function () {
    test('returns the Pix app forgotten password url', function (assert) {
      // given
      const service = this.owner.lookup('service:url-base');
      sinon.stub(ENV, 'APP').value({ PIX_APP_URL_WITHOUT_EXTENSION: 'https://app.pix.' });

      const domainService = this.owner.lookup('service:current-domain');
      sinon.stub(domainService, 'getExtension').returns('fr');

      // when
      const homeUrl = service.pixAppForgottenPasswordUrl;

      // then
      assert.strictEqual(homeUrl, 'https://app.pix.fr/mot-de-passe-oublie');
    });

    test('returns the Pix app forgotten password url for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url-base');
      sinon.stub(ENV, 'APP').value({ PIX_APP_URL_WITHOUT_EXTENSION: 'https://app.pix.' });

      const domainService = this.owner.lookup('service:current-domain');
      sinon.stub(domainService, 'getExtension').returns('fr');

      await setCurrentLocale('en');

      // when
      const homeUrl = service.pixAppForgottenPasswordUrl;

      // then
      assert.strictEqual(homeUrl, 'https://app.pix.fr/mot-de-passe-oublie?lang=en');
    });
  });

  module('getPixWebsiteUrl', function () {
    test('returns the Pix website url for the current locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url-base');
      await setCurrentLocale('en');

      // when
      const homeUrl = service.getPixWebsiteUrl();

      // then
      assert.strictEqual(homeUrl, 'https://pix.org/en');
    });

    test('returns the Pix website url and path for the current locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url-base');
      await setCurrentLocale('en');

      // when
      const homeUrl = service.getPixWebsiteUrl('this-is-my-document');

      // then
      assert.strictEqual(homeUrl, 'https://pix.org/en/this-is-my-document');
    });
  });

  module('getPixWebsiteUrlFor', function () {
    test('returns the Pix website url and path for the current locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url-base');
      await setCurrentLocale('en');

      // when
      const homeUrl = service.getPixWebsiteUrlFor('CGU');

      // then
      assert.strictEqual(homeUrl, 'https://pix.org/en/terms-and-conditions');
    });

    module('when the tld is fr', function () {
      test('returns the Pix website url for the tld fr', async function (assert) {
        // given
        const service = this.owner.lookup('service:url-base');
        const domainService = this.owner.lookup('service:current-domain');
        sinon.stub(domainService, 'getExtension').returns('fr');
        await setCurrentLocale('en');

        // when
        const homeUrl = service.getPixWebsiteUrlFor();

        // then
        assert.strictEqual(homeUrl, 'https://pix.fr');
      });

      test('returns the Pix website url and path for the tld fr', async function (assert) {
        // given
        const service = this.owner.lookup('service:url-base');
        const domainService = this.owner.lookup('service:current-domain');
        sinon.stub(domainService, 'getExtension').returns('fr');
        await setCurrentLocale('en');

        // when
        const homeUrl = service.getPixWebsiteUrlFor('CGU');

        // then
        assert.strictEqual(homeUrl, 'https://pix.fr/conditions-generales-d-utilisation');
      });
    });

    module('when locale is unknown', function () {
      test('returns the Pix website url with the default locale', function (assert) {
        // given
        const service = this.owner.lookup('service:url-base');
        const localeService = this.owner.lookup('service:locale');
        sinon.stub(localeService, 'currentLocale').value('xxx');

        // when
        const homeUrl = service.getPixWebsiteUrlFor();

        // then
        assert.strictEqual(homeUrl, 'https://pix.org/fr');
      });

      test('returns the Pix website url and path with the default locale', function (assert) {
        // given
        const service = this.owner.lookup('service:url-base');
        const localeService = this.owner.lookup('service:locale');
        sinon.stub(localeService, 'currentLocale').value('xxx');

        // when
        const homeUrl = service.getPixWebsiteUrlFor('CGU');

        // then
        assert.strictEqual(homeUrl, 'https://pix.org/fr/conditions-generales-d-utilisation');
      });
    });
  });

  module('Checks Pix website URLs and Paths', function () {
    SUPPORTED_LOCALES.forEach(function (locale) {
      test(`checks PIX_WEBSITE_ROOT_URLS manage all supported locales for ${locale}`, function (assert) {
        // given / when
        const url = PIX_WEBSITE_ROOT_URLS[locale];

        // then
        assert.ok(url);
      });
    });

    Object.keys(PIX_WEBSITE_PATHS).forEach(function (pathKey) {
      SUPPORTED_LOCALES.forEach(function (locale) {
        test(`checks PIX_WEBSITE_PATHS.${pathKey} manage all supported locales for ${locale}`, function (assert) {
          // given / when
          const path = PIX_WEBSITE_PATHS[pathKey][locale];

          // then
          assert.ok(path);
        });
      });
    });
  });
});
