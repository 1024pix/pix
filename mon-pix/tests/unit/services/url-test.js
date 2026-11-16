import { setupTest } from 'ember-qunit';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setCurrentLocale } from '../../helpers/setup-intl.js';

module('Unit | Service | url', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('showcase', function () {
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
        expectedShowcaseUrl: 'https://pix.org/fr',
        expectedShowcaseLinkText: "Page d'accueil de Pix.org",
      },
      {
        language: 'en',
        currentDomainExtension: 'org',
        expectedShowcaseUrl: 'https://pix.org/en',
        expectedShowcaseLinkText: "Pix.org's Homepage",
      },
    ].forEach(function (testCase) {
      test(`gets "${testCase.expectedShowcaseUrl}" when current domain="${testCase.currentDomainExtension}" and lang="${testCase.language}"`, async function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        service.definedHomeUrl = '/';
        sinon.stub(service.currentDomain, 'getExtension').returns(testCase.currentDomainExtension);
        await setCurrentLocale(testCase.language);

        // when
        const showcase = service.showcase;

        // then
        assert.strictEqual(showcase.url, testCase.expectedShowcaseUrl);
        assert.strictEqual(showcase.linkText, testCase.expectedShowcaseLinkText);
      });
    });
  });

  module('cguUrl', function () {
    test('returns the Pix website CGU URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const cguUrl = service.cguUrl;

      // then
      assert.strictEqual(cguUrl, 'https://pix.org/fr/conditions-generales-d-utilisation');
    });

    test('returns the Pix website CGU URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const cguUrl = service.cguUrl;

      // then
      assert.strictEqual(cguUrl, 'https://pix.org/en/terms-and-conditions');
    });
  });

  module('dataProtectionPolicyUrl', function () {
    test('returns the Pix website data protection policy URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const dataProtectionPolicyUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(dataProtectionPolicyUrl, 'https://pix.org/fr/pix-app-privacy-policy');
    });

    test('returns the Pix website data protection policy URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const dataProtectionPolicyUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(dataProtectionPolicyUrl, 'https://pix.org/en/pix-app-privacy-policy');
    });
  });

  module('legalNoticeUrl', function () {
    test('returns the Pix website legal notice URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const legalNoticeUrl = service.legalNoticeUrl;

      // then
      assert.strictEqual(legalNoticeUrl, 'https://pix.org/fr/mentions-legales');
    });

    test('returns the Pix website legal notice URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const legalNoticeUrl = service.legalNoticeUrl;

      // then
      assert.strictEqual(legalNoticeUrl, 'https://pix.org/en/legal-notice');
    });
  });

  module('accessibilityUrl', function () {
    test('returns the Pix website accessibility URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const accessibilityUrl = service.accessibilityUrl;

      // then
      assert.strictEqual(accessibilityUrl, 'https://pix.org/fr/accessibilite');
    });

    test('returns the Pix website accessibility URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const accessibilityUrl = service.accessibilityUrl;

      // then
      assert.strictEqual(accessibilityUrl, 'https://pix.org/en/accessibility');
    });
  });

  module('supportHomeUrl', function () {
    test('returns the Pix website support URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const supportHomeUrl = service.supportHomeUrl;

      // then
      assert.strictEqual(supportHomeUrl, 'https://pix.org/fr/support');
    });

    test('returns the Pix website support URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const supportHomeUrl = service.supportHomeUrl;

      // then
      assert.strictEqual(supportHomeUrl, 'https://pix.org/en/support');
    });
  });

  module('certificationResultsExplanationUrl', function () {
    test('returns the Pix website certification results explanation URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const certificationResultsExplanationUrl = service.certificationResultsExplanationUrl;

      // then
      assert.strictEqual(
        certificationResultsExplanationUrl,
        'https://pix.org/fr/certification-comprendre-score-niveau',
      );
    });

    test('returns the Pix website certification results explanation URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const certificationResultsExplanationUrl = service.certificationResultsExplanationUrl;

      // then
      assert.strictEqual(certificationResultsExplanationUrl, 'https://pix.org/en/understand-certification-results');
    });
  });
});
