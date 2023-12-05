import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

const FRANCE_TLD = 'fr';
const INTERNATIONAL_TLD = 'org';

const ENGLISH_INTERNATIONAL_LOCALE = 'en';
const FRENCH_INTERNATIONAL_LOCALE = 'fr';

import setupIntl from 'mon-pix/tests/helpers/setup-intl';

module('Unit | Service | url', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#homeUrl', function () {
    test('should get home url', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      service.definedHomeUrl = 'pix.test.fr';

      // when
      const homeUrl = service.homeUrl;

      // then
      const expectedDefinedHomeUrl = `${service.definedHomeUrl}?lang=${this.intl.primaryLocale}`;
      assert.strictEqual(homeUrl, expectedDefinedHomeUrl);
    });
  });

  module('#showcaseUrl', function (hooks) {
    let defaultLocale;

    hooks.beforeEach(function () {
      defaultLocale = this.intl.primaryLocale;
    });

    hooks.afterEach(function () {
      this.intl.setLocale(defaultLocale);
    });

    [
      {
        language: FRENCH_INTERNATIONAL_LOCALE,
        currentDomainExtension: FRANCE_TLD,
        expectedShowcaseUrl: 'https://pix.fr',
        expectedShowcaseLinkText: "Page d'accueil de Pix.fr",
      },
      {
        language: FRENCH_INTERNATIONAL_LOCALE,
        currentDomainExtension: INTERNATIONAL_TLD,
        expectedShowcaseUrl: 'https://pix.org',
        expectedShowcaseLinkText: "Page d'accueil de Pix.org",
      },
      {
        language: ENGLISH_INTERNATIONAL_LOCALE,
        currentDomainExtension: FRANCE_TLD,
        expectedShowcaseUrl: 'https://pix.fr/en-gb',
        expectedShowcaseLinkText: "Pix.fr's Homepage",
      },
      {
        language: ENGLISH_INTERNATIONAL_LOCALE,
        currentDomainExtension: INTERNATIONAL_TLD,
        expectedShowcaseUrl: 'https://pix.org/en-gb',
        expectedShowcaseLinkText: "Pix.org's Homepage",
      },
    ].forEach(function (testCase) {
      test(`should get "${testCase.expectedShowcaseUrl}" when current domain="${testCase.currentDomainExtension}" and lang="${testCase.language}"`, function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        service.definedHomeUrl = '/';
        service.currentDomain = { getExtension: sinon.stub().returns(testCase.currentDomainExtension) };
        this.intl.setLocale([testCase.language]);

        // when
        const showcase = service.showcase;

        // then
        assert.strictEqual(showcase.url, testCase.expectedShowcaseUrl);
        assert.strictEqual(showcase.linkText, testCase.expectedShowcaseLinkText);
      });
    });
  });

  module('#cguUrl', function () {
    module('when website is pix.fr', function () {
      test('returns the French page URL', function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        service.currentDomain = { isFranceDomain: true };
        const expectedCguUrl = 'https://pix.fr/conditions-generales-d-utilisation';

        // when
        const cguUrl = service.cguUrl;

        // then
        assert.strictEqual(cguUrl, expectedCguUrl);
      });

      module('when current language is "en"', function () {
        test('returns the French page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: true };
          service.intl = { primaryLocale: ENGLISH_INTERNATIONAL_LOCALE };
          const expectedCguUrl = 'https://pix.fr/conditions-generales-d-utilisation';

          // when
          const cguUrl = service.cguUrl;

          // then
          assert.strictEqual(cguUrl, expectedCguUrl);
        });
      });
    });

    module('when website is pix.org', function () {
      module('when current language is "fr"', function () {
        test('returns the French page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: false };
          service.intl = { primaryLocale: FRENCH_INTERNATIONAL_LOCALE };
          const expectedCguUrl = 'https://pix.org/fr/conditions-generales-d-utilisation';

          // when
          const cguUrl = service.cguUrl;

          // then
          assert.strictEqual(cguUrl, expectedCguUrl);
        });
      });

      module('when current language is "en"', function () {
        test('returns the English page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: false };
          const expectedCguUrl = 'https://pix.org/en-gb/terms-and-conditions';
          service.currentDomain = { getExtension: sinon.stub().returns(INTERNATIONAL_TLD) };
          service.intl = { primaryLocale: ENGLISH_INTERNATIONAL_LOCALE };

          // when
          const cguUrl = service.cguUrl;

          // then
          assert.strictEqual(cguUrl, expectedCguUrl);
        });
      });
    });
  });

  module('#dataProtectionPolicyUrl', function () {
    module('when website is pix.fr', function () {
      test('returns the French page URL', function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        service.currentDomain = { isFranceDomain: true };
        const expectedCguUrl = 'https://pix.fr/politique-protection-donnees-personnelles-app';

        // when
        const cguUrl = service.dataProtectionPolicyUrl;

        // then
        assert.strictEqual(cguUrl, expectedCguUrl);
      });

      module('when current language is "en"', function () {
        test('returns the French page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: true };
          service.intl = { primaryLocale: ENGLISH_INTERNATIONAL_LOCALE };
          const expectedCguUrl = 'https://pix.fr/politique-protection-donnees-personnelles-app';

          // when
          const cguUrl = service.dataProtectionPolicyUrl;

          // then
          assert.strictEqual(cguUrl, expectedCguUrl);
        });
      });
    });

    module('when website is pix.org', function () {
      module('when current language is "fr"', function () {
        test('returns the French page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: false };
          service.intl = { primaryLocale: FRENCH_INTERNATIONAL_LOCALE };
          const expectedCguUrl = 'https://pix.org/fr/politique-protection-donnees-personnelles-app';

          // when
          const cguUrl = service.dataProtectionPolicyUrl;

          // then
          assert.strictEqual(cguUrl, expectedCguUrl);
        });
      });

      module('when current language is "en"', function () {
        test('returns the English page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: false };
          service.intl = { primaryLocale: ENGLISH_INTERNATIONAL_LOCALE };
          const expectedCguUrl = 'https://pix.org/en-gb/personal-data-protection-policy';

          // when
          const cguUrl = service.dataProtectionPolicyUrl;

          // then
          assert.strictEqual(cguUrl, expectedCguUrl);
        });
      });
    });
  });

  module('#accessibilityUrl', function () {
    module('when website is pix.fr', function () {
      test('returns the French page URL', function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        service.currentDomain = { isFranceDomain: true };
        service.intl = { primaryLocale: FRENCH_INTERNATIONAL_LOCALE };
        const expectedAccessibilityUrl = 'https://pix.fr/accessibilite';

        // when
        const accessibilityUrl = service.accessibilityUrl;

        // then
        assert.strictEqual(accessibilityUrl, expectedAccessibilityUrl);
      });

      module('when current language is "en"', function () {
        test('returns the French page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: true };
          service.intl = { primaryLocale: ENGLISH_INTERNATIONAL_LOCALE };
          const expectedAccessibilityUrl = 'https://pix.fr/accessibilite';

          // when
          const accessibilityUrl = service.accessibilityUrl;

          // then
          assert.strictEqual(accessibilityUrl, expectedAccessibilityUrl);
        });
      });
    });

    module('when website is pix.org', function () {
      module('when current language is "fr"', function () {
        test('returns the French page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: false };
          service.intl = { primaryLocale: FRENCH_INTERNATIONAL_LOCALE };
          const expectedAccessibilityUrl = 'https://pix.org/fr/accessibilite';

          // when
          const accessibilityUrl = service.accessibilityUrl;

          // then
          assert.strictEqual(accessibilityUrl, expectedAccessibilityUrl);
        });
      });

      module('when current language is "en"', function () {
        test('returns the English page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { isFranceDomain: false };
          service.intl = { primaryLocale: ENGLISH_INTERNATIONAL_LOCALE };
          const expectedAccessibilityUrl = 'https://pix.org/en-gb/accessibility';

          // when
          const accessibilityUrl = service.accessibilityUrl;

          // then
          assert.strictEqual(accessibilityUrl, expectedAccessibilityUrl);
        });
      });
    });
  });

  module('#levelSevenNewsUrl', function () {
    test('returns the French URL page', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      service.currentDomain = { isFranceDomain: true };
      service.intl = { primaryLocale: FRENCH_INTERNATIONAL_LOCALE };
      const expectedLevelSevenNewsUrl = 'https://pix.fr/actualites/decouvrez-le-niveau-7-des-maintenant-sur-pix';

      // when
      const levelSevenNewsUrl = service.levelSevenNewsUrl;

      // then
      assert.strictEqual(levelSevenNewsUrl, expectedLevelSevenNewsUrl);
    });

    module('when current language is "en"', function () {
      test('returns the English URL page', function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        service.currentDomain = { isFranceDomain: false };
        service.intl = { primaryLocale: ENGLISH_INTERNATIONAL_LOCALE };
        const expectedLevelSevenNewsUrl = 'https://pix.org/en/news/discover-level-7-on-pix';

        // when
        const levelSevenNewsUrl = service.levelSevenNewsUrl;

        // then
        assert.strictEqual(levelSevenNewsUrl, expectedLevelSevenNewsUrl);
      });
    });
  });
});
