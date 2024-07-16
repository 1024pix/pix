import { setLocale } from 'ember-intl/test-support';
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
      setLocale([currentLocale, 'fr']);

      const service = this.owner.lookup('service:url');
      const expectedHomeUrl = `${service.definedHomeUrl}?lang=${currentLocale}`;

      // when
      const homeUrl = service.homeUrl;

      // then
      assert.strictEqual(homeUrl, expectedHomeUrl);
    });
  });

  module('#legalNoticeUrl', function () {
    module('when domain is pix.fr', function () {
      test('returns "pix.fr" url', function (assert) {
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
    });

    module('when domain is pix.org', function () {
      [
        {
          primaryLocale: 'en',
          expectedUrl: 'https://pix.org/en/legal-notice',
        },
        {
          primaryLocale: 'fr',
          expectedUrl: 'https://pix.org/fr/mentions-legales',
        },
        {
          primaryLocale: 'nl',
          expectedUrl: 'https://pix.org/nl-be/wettelijke-vermeldingen',
        },
      ].forEach(({ primaryLocale, expectedUrl }) => {
        test(`returns "pix.org" ${primaryLocale} url when locale is ${primaryLocale}`, function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: false };
          service.intl = { primaryLocale };

          // when
          const url = service.legalNoticeUrl;

          // then
          assert.strictEqual(url, expectedUrl);
        });
      });
    });
  });

  module('#dataProtectionPolicyUrl', function () {
    module('when domain is pix.fr', function () {
      test('returns "pix.fr" url', function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        const expectedUrl = 'https://pix.fr/politique-protection-donnees-personnelles-app';
        service.currentDomain = { isFranceDomain: true };
        service.intl = { primaryLocale: 'fr' };

        // when
        const cguUrl = service.dataProtectionPolicyUrl;

        // then
        assert.strictEqual(cguUrl, expectedUrl);
      });
    });

    module('when domain is pix.org', function () {
      [
        {
          primaryLocale: 'en',
          expectedUrl: 'https://pix.org/en/personal-data-protection-policy',
        },
        {
          primaryLocale: 'fr',
          expectedUrl: 'https://pix.org/fr/politique-protection-donnees-personnelles-app',
        },
        {
          primaryLocale: 'nl',
          expectedUrl: 'https://pix.org/nl-be/beleid-inzake-de-bescherming-van-persoonsgegevens',
        },
      ].forEach(({ primaryLocale, expectedUrl }) => {
        test(`returns "pix.org" ${primaryLocale} url when locale is ${primaryLocale}`, function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: false };
          service.intl = { primaryLocale };

          // when
          const url = service.dataProtectionPolicyUrl;

          // then
          assert.strictEqual(url, expectedUrl);
        });
      });
    });
  });

  module('#cguUrl', function () {
    module('when domain is pix.fr', function () {
      test('returns "pix.fr" url', function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        const expectedUrl = 'https://pix.fr/conditions-generales-d-utilisation';
        service.currentDomain = { isFranceDomain: true };
        service.intl = { primaryLocale: 'fr' };

        // when
        const url = service.cguUrl;

        // then
        assert.strictEqual(url, expectedUrl);
      });
    });

    module('when domain is pix.org', function () {
      [
        {
          primaryLocale: 'en',
          expectedUrl: 'https://pix.org/en/terms-and-conditions',
        },
        {
          primaryLocale: 'fr',
          expectedUrl: 'https://pix.org/fr/conditions-generales-d-utilisation',
        },
        {
          primaryLocale: 'nl',
          expectedUrl: 'https://pix.org/en/terms-and-conditions',
        },
      ].forEach(({ primaryLocale, expectedUrl }) => {
        test(`returns "pix.org" ${primaryLocale} url when locale is ${primaryLocale}`, function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: false };
          service.intl = { primaryLocale };

          // when
          const url = service.cguUrl;

          // then
          assert.strictEqual(url, expectedUrl);
        });
      });
    });
  });

  module('#accessibilityUrl', function () {
    module('when domain is pix.fr', function () {
      test('returns "pix.fr"', function (assert) {
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
    });

    module('when domain is pix.org', function () {
      [
        {
          primaryLocale: 'en',
          expectedUrl: 'https://pix.org/en/accessibility-pix-orga',
        },
        {
          primaryLocale: 'fr',
          expectedUrl: 'https://pix.org/fr/accessibilite-pix-orga',
        },
        {
          primaryLocale: 'nl',
          expectedUrl: 'https://pix.org/nl-be/toegankelijkheid-pix-orga',
        },
      ].forEach(({ primaryLocale, expectedUrl }) => {
        test(`returns "pix.org" ${primaryLocale} url when locale is ${primaryLocale}`, function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: false };
          service.intl = { primaryLocale };

          // when
          const url = service.accessibilityUrl;

          // then
          assert.strictEqual(url, expectedUrl);
        });
      });
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

    test('returns "status.pix.org" in french when current language is fr', function (assert) {
      // given
      const expectedUrl = 'https://status.pix.org?locale=fr';
      const service = this.owner.lookup('service:url');
      service.intl = { primaryLocale: 'fr' };

      // when
      const serverStatusUrl = service.serverStatusUrl;

      // then
      assert.strictEqual(serverStatusUrl, expectedUrl);
    });

    test('returns "status.pix.org" in french when current language is nl', function (assert) {
      // given
      const expectedUrl = 'https://status.pix.org?locale=nl';
      const service = this.owner.lookup('service:url');
      service.intl = { primaryLocale: 'nl' };

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
