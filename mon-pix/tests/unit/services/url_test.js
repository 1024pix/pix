import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import setupIntl from 'mon-pix/tests/helpers/setup-intl';

module('Unit | Service | locale', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  test('should have a frenchDomainExtension when the current domain contains pix.fr', function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    const domainExtension = service.isFrenchDomainExtension;

    // then
    assert.true(domainExtension);
  });

  test('should not have frenchDomainExtension when the current domain contains pix.org', function (assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('org') };

    // when
    const domainExtension = service.isFrenchDomainExtension;

    // then
    assert.false(domainExtension);
  });

  module('#homeUrl', function () {
    test('should get home url', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      service.definedHomeUrl = 'pix.test.fr';

      // when
      const homeUrl = service.homeUrl;

      // then
      const expectedDefinedHomeUrl = `${service.definedHomeUrl}?lang=${this.intl.t('current-lang')}`;
      assert.strictEqual(homeUrl, expectedDefinedHomeUrl);
    });
  });

  module('#showcaseUrl', function (hooks) {
    let defaultLocale;

    hooks.beforeEach(function () {
      defaultLocale = this.intl.t('current-lang');
    });

    hooks.afterEach(function () {
      this.intl.setLocale(defaultLocale);
    });

    [
      {
        language: 'fr',
        currentDomainExtension: 'fr',
        expectedShowcaseUrl: 'https://pix.fr',
        expectedShowcaseLinkText: "Page d'accueil de Pix.fr",
      },
      {
        language: 'fr',
        currentDomainExtension: 'org',
        expectedShowcaseUrl: 'https://pix.org',
        expectedShowcaseLinkText: "Page d'accueil de Pix.org",
      },
      {
        language: 'en',
        currentDomainExtension: 'fr',
        expectedShowcaseUrl: 'https://pix.fr/en-gb',
        expectedShowcaseLinkText: "Pix.fr's Homepage",
      },
      {
        language: 'en',
        currentDomainExtension: 'org',
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
        const expectedCguUrl = 'https://pix.fr/conditions-generales-d-utilisation';
        service.currentDomain = { getExtension: sinon.stub().returns('fr') };

        // when
        const cguUrl = service.cguUrl;

        // then
        assert.strictEqual(cguUrl, expectedCguUrl);
      });

      module('when current language is "en"', function () {
        test('returns the French page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          const expectedCguUrl = 'https://pix.fr/conditions-generales-d-utilisation';
          service.currentDomain = { getExtension: sinon.stub().returns('fr') };
          service.intl = { t: sinon.stub().returns('en') };

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
          const expectedCguUrl = 'https://pix.org/fr/conditions-generales-d-utilisation';
          service.currentDomain = { getExtension: sinon.stub().returns('org') };
          service.intl = { t: sinon.stub().returns('fr') };

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
          const expectedCguUrl = 'https://pix.org/en-gb/terms-and-conditions';
          service.currentDomain = { getExtension: sinon.stub().returns('org') };
          service.intl = { t: sinon.stub().returns('en') };

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
        const expectedCguUrl = 'https://pix.fr/politique-protection-donnees-personnelles-app';
        service.currentDomain = { getExtension: sinon.stub().returns('fr') };

        // when
        const cguUrl = service.dataProtectionPolicyUrl;

        // then
        assert.strictEqual(cguUrl, expectedCguUrl);
      });

      module('when current language is "en"', function () {
        test('returns the French page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          const expectedCguUrl = 'https://pix.fr/politique-protection-donnees-personnelles-app';
          service.currentDomain = { getExtension: sinon.stub().returns('fr') };
          service.intl = { t: sinon.stub().returns('en') };

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
          const expectedCguUrl = 'https://pix.org/fr/politique-protection-donnees-personnelles-app';
          service.currentDomain = { getExtension: sinon.stub().returns('org') };
          service.intl = { t: sinon.stub().returns('fr') };

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
          const expectedCguUrl = 'https://pix.org/en-gb/personal-data-protection-policy';
          service.currentDomain = { getExtension: sinon.stub().returns('org') };
          service.intl = { t: sinon.stub().returns('en') };

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
        const expectedAccessibilityUrl = 'https://pix.fr/accessibilite';
        service.currentDomain = { getExtension: sinon.stub().returns('fr') };

        // when
        const accessibilityUrl = service.accessibilityUrl;

        // then
        assert.strictEqual(accessibilityUrl, expectedAccessibilityUrl);
      });

      module('when current language is "en"', function () {
        test('returns the French page URL', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          const expectedAccessibilityUrl = 'https://pix.fr/accessibilite';
          service.currentDomain = { getExtension: sinon.stub().returns('fr') };
          service.intl = { t: sinon.stub().returns('en') };

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
          const expectedAccessibilityUrl = 'https://pix.org/fr/accessibilite';
          service.currentDomain = { getExtension: sinon.stub().returns('org') };
          service.intl = { t: sinon.stub().returns('fr') };

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
          const expectedAccessibilityUrl = 'https://pix.org/en-gb/accessibility';
          service.currentDomain = { getExtension: sinon.stub().returns('org') };
          service.intl = { t: sinon.stub().returns('en') };

          // when
          const accessibilityUrl = service.accessibilityUrl;

          // then
          assert.strictEqual(accessibilityUrl, expectedAccessibilityUrl);
        });
      });
    });
  });
});
