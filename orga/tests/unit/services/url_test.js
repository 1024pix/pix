import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../helpers/setup-intl';
import sinon from 'sinon';

module('Unit | Service | url', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#campaignsRootUrl', function () {
    test('returns default campaigns root url when is defined', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      service.definedCampaignsRootUrl = 'pix.test.fr';

      // when
      const campaignsRootUrl = service.campaignsRootUrl;

      // then
      assert.strictEqual(campaignsRootUrl, service.definedCampaignsRootUrl);
    });

    test('returns "pix.test" url when current domain contains pix.test', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCampaignsRootUrl = 'https://app.pix.test/campagnes/';
      service.definedCampaignsRootUrl = undefined;
      service.currentDomain = { getExtension: sinon.stub().returns('test') };

      // when
      const campaignsRootUrl = service.campaignsRootUrl;

      // then
      assert.strictEqual(campaignsRootUrl, expectedCampaignsRootUrl);
    });
  });

  module('#homeUrl', function () {
    test('returns home url with current locale', function (assert) {
      // given
      const currentLocale = 'en';
      this.intl.setLocale([currentLocale, 'fr']);

      const service = this.owner.lookup('service:url');
      const expectedHomeUrl = `${service.definedHomeUrl}?lang=${currentLocale}`;

      // when
      const homeUrl = service.homeUrl;

      // then
      assert.strictEqual(homeUrl, expectedHomeUrl);
    });
  });

  module('#legalNoticeUrl', function () {
    test('returns "pix.fr" url when current domain contains pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.fr/mentions-legales';
      service.currentDomain = { isFranceDomain: true };
      service.intl = { primaryLocale: 'fr' };

      // when
      const url = service.legalNoticeUrl;

      // then
      assert.strictEqual(url, expectedUrl);
    });

    test('returns "pix.org" english url when current language is en', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.org/en-gb/legal-notice';
      service.currentDomain = { isFranceDomain: false };
      service.intl = { primaryLocale: 'en' };

      // when
      const url = service.legalNoticeUrl;

      // then
      assert.strictEqual(url, expectedUrl);
    });

    test('returns "pix.org" french url when current language is fr and domain extension is .org', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.org/fr/mentions-legales';
      service.currentDomain = { isFranceDomain: false };
      service.intl = { primaryLocale: 'fr' };

      // when
      const url = service.legalNoticeUrl;

      // then
      assert.strictEqual(url, expectedUrl);
    });
  });

  module('#dataProtectionPolicyUrl', function () {
    test('returns "pix.fr" url when current domain contains pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.fr/politique-protection-donnees-personnelles-app';
      service.currentDomain = { isFranceDomain: true };
      service.intl = { primaryLocale: 'fr' };

      // when
      const cguUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(cguUrl, expectedCguUrl);
    });

    test('returns "pix.org" english url when current language is en', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.org/en-gb/personal-data-protection-policy';
      service.currentDomain = { isFranceDomain: false };
      service.intl = { primaryLocale: 'en' };

      // when
      const cguUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(cguUrl, expectedCguUrl);
    });

    test('returns "pix.org" french url when current language is fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.org/fr/politique-protection-donnees-personnelles-app';
      service.currentDomain = { isFranceDomain: false };
      service.intl = { primaryLocale: 'fr' };

      // when
      const cguUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(cguUrl, expectedCguUrl);
    });
  });

  module('#cguUrl', function () {
    test('returns "pix.fr" url when current domain contains pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.fr/conditions-generales-d-utilisation';
      service.currentDomain = { isFranceDomain: true };
      service.intl = { primaryLocale: 'fr' };

      // when
      const cguUrl = service.cguUrl;

      // then
      assert.strictEqual(cguUrl, expectedCguUrl);
    });

    test('returns "pix.org" english url when current language is en', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.org/en-gb/terms-and-conditions';
      service.currentDomain = { isFranceDomain: false };
      service.intl = { primaryLocale: 'en' };

      // when
      const cguUrl = service.cguUrl;

      // then
      assert.strictEqual(cguUrl, expectedCguUrl);
    });

    test('returns "pix.org" french url when current language is fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.org/fr/conditions-generales-d-utilisation';
      service.currentDomain = { isFranceDomain: false };
      service.intl = { primaryLocale: 'fr' };

      // when
      const cguUrl = service.cguUrl;

      // then
      assert.strictEqual(cguUrl, expectedCguUrl);
    });
  });

  module('#accessibilityUrl', function () {
    test('returns "pix.fr" when current domain contains pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.fr/accessibilite-pix-orga';
      service.currentDomain = { isFranceDomain: true };
      service.intl = { primaryLocale: 'fr' };

      // when
      const url = service.accessibilityUrl;

      // then
      assert.strictEqual(url, expectedUrl);
    });

    test('returns "pix.org" in english when current language is en', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.org/en-gb/accessibility-pix-orga';
      service.currentDomain = { isFranceDomain: false };
      service.intl = { primaryLocale: 'en' };

      // when
      const url = service.accessibilityUrl;

      // then
      assert.strictEqual(url, expectedUrl);
    });

    test('returns "pix.org" in french when current language is fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedUrl = 'https://pix.org/fr/accessibilite-pix-orga';
      service.currentDomain = { isFranceDomain: false };
      service.intl = { primaryLocale: 'fr' };

      // when
      const url = service.accessibilityUrl;

      // then
      assert.strictEqual(url, expectedUrl);
    });
  });
});
