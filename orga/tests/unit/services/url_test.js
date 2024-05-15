import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../helpers/setup-intl';

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

  module('#serverStatusUrl', function () {
    test('returns "status.pix.org" in english when current language is en', function (assert) {
      // given
      const expectedUrl = 'https://status.pix.org?locale=en';
      const service = this.owner.lookup('service:url');
      service.intl = { primaryLocale: 'en' };

      // when
      const serverStatusUrl = service.serverStatusUrl;

      // then
      assert.strictEqual(serverStatusUrl, expectedUrl);
    });

    test('returns "status.pix.org" in french when current language is en', function (assert) {
      // given
      const expectedUrl = 'https://status.pix.org?locale=fr';
      const service = this.owner.lookup('service:url');
      service.intl = { primaryLocale: 'fr' };

      // when
      const serverStatusUrl = service.serverStatusUrl;

      // then
      assert.strictEqual(serverStatusUrl, expectedUrl);
    });
  });
  module('#pixJuniorSchoolUrl', function () {
    test('returns pix junior url for current organization', function (assert) {
      const service = this.owner.lookup('service:url');
      service.pixJuniorUrl = 'https://junior.pix.fr';
      service.currentUser = { organization: { schoolCode: 'MINIPIXOU' } };
      service.currentDomain = { getJuniorBaseUrl: () => 'https://junior.pix.fr' };

      const pixJuniorSchoolUrl = service.pixJuniorSchoolUrl;

      assert.strictEqual(pixJuniorSchoolUrl, 'https://junior.pix.fr/schools/MINIPIXOU');
    });
    test('returns empty string if the current organization has not any school code', function (assert) {
      const service = this.owner.lookup('service:url');
      service.pixJuniorUrl = 'https://junior.pix.fr';
      service.currentUser = { organization: {} };

      const pixJuniorSchoolUrl = service.pixJuniorSchoolUrl;

      assert.strictEqual(pixJuniorSchoolUrl, '');
    });
  });
});
