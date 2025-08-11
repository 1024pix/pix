import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl, { setCurrentLocale } from '../../helpers/setup-intl';

module('Unit | Service | url', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  module('dataProtectionPolicyUrl', function () {
    test('returns the Pix website data protection policy URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const dataProtectionPolicyUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(dataProtectionPolicyUrl, 'https://pix.org/fr/politique-protection-donnees-personnelles-app');
    });

    test('returns the Pix website data protection policy URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const dataProtectionPolicyUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(dataProtectionPolicyUrl, 'https://pix.org/en/personal-data-protection-policy');
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
      assert.strictEqual(accessibilityUrl, 'https://pix.org/fr/accessibilite-pix-certif');
    });

    test('returns the Pix website accessibility URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const accessibilityUrl = service.accessibilityUrl;

      // then
      assert.strictEqual(accessibilityUrl, 'https://pix.org/en/accessibility-pix-certif');
    });
  });

  module('supportUrl', function () {
    test('returns the Pix website support URL', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const supportUrl = service.supportUrl;

      // then
      assert.strictEqual(supportUrl, 'https://pix.org/fr/support');
    });

    test('returns the Pix website support URL for a locale', async function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      await setCurrentLocale('en');

      // when
      const supportUrl = service.supportUrl;

      // then
      assert.strictEqual(supportUrl, 'https://pix.org/en/support');
    });
  });

  module('#invigilatorDocumentationUrl', function () {
    test('should return the invigilator documentation url', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const invigilatorDocumentationUrl = service.invigilatorDocumentationUrl;

      // then
      assert.strictEqual(invigilatorDocumentationUrl, 'https://cloud.pix.fr/s/s4H9x4PD4eKokqX');
    });
  });

  module('#fraudReportUrl', function () {
    test('should return the fraud report url', function (assert) {
      // given
      const service = this.owner.lookup('service:url');

      // when
      const fraudReportUrl = service.fraudReportUrl;

      // then
      assert.strictEqual(fraudReportUrl, 'https://cloud.pix.fr/s/LiXkoBq9GD5aLbN/download');
    });
  });
});
