import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../helpers/setup-intl';
import sinon from 'sinon';

module('Unit | Service | url', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#dataProtectionPolicyUrl', function () {
    test('should get "pix.fr" url when current domain contains pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedDataProtectionPolicyUrl = 'https://pix.fr/politique-protection-donnees-personnelles-app';
      service.currentDomain = { getExtension: sinon.stub().returns('fr') };

      // when
      const dataProtectionPolicyUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(dataProtectionPolicyUrl, expectedDataProtectionPolicyUrl);
    });

    test('should get "pix.org" english url when current language is en', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedDataProtectionPolicyUrl = 'https://pix.org/en-gb/personal-data-protection-policy';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('en') };

      // when
      const dataProtectionPolicyUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(dataProtectionPolicyUrl, expectedDataProtectionPolicyUrl);
    });

    test('should get "pix.org" french url when current language is fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedDataProtectionPolicyUrl = 'https://pix.org/politique-protection-donnees-personnelles-app';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('fr') };

      // when
      const dataProtectionPolicyUrl = service.dataProtectionPolicyUrl;

      // then
      assert.strictEqual(dataProtectionPolicyUrl, expectedDataProtectionPolicyUrl);
    });
  });

  module('#cguUrl', function () {
    test('should get "pix.fr" url when current domain contains pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.fr/conditions-generales-d-utilisation';
      service.currentDomain = { getExtension: sinon.stub().returns('fr') };

      // when
      const cguUrl = service.cguUrl;

      // then
      assert.strictEqual(cguUrl, expectedCguUrl);
    });

    test('should get "pix.org" english url when current language is en', function (assert) {
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

    test('should get "pix.org" french url when current language is fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.org/conditions-generales-d-utilisation';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('fr') };

      // when
      const cguUrl = service.cguUrl;

      // then
      assert.strictEqual(cguUrl, expectedCguUrl);
    });
  });

  module('#forgottenPasswordUrl', function () {
    test('should get "pix.fr" url when current domain contains pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedForgottenPasswordUrl = 'https://app.pix.fr/mot-de-passe-oublie';
      service.currentDomain = { getExtension: sinon.stub().returns('fr') };

      // when
      const forgottenPasswordUrl = service.forgottenPasswordUrl;

      // then
      assert.strictEqual(forgottenPasswordUrl, expectedForgottenPasswordUrl);
    });

    test('should get "pix.org" english url when current language is en', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedForgottenPasswordUrl = 'https://app.pix.org/mot-de-passe-oublie?lang=en';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('en') };

      // when
      const forgottenPasswordUrl = service.forgottenPasswordUrl;

      // then
      assert.strictEqual(forgottenPasswordUrl, expectedForgottenPasswordUrl);
    });

    test('should get "pix.org" french url when current language is fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedForgottenPasswordUrl = 'https://app.pix.org/mot-de-passe-oublie';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('fr') };

      // when
      const forgottenPasswordUrl = service.forgottenPasswordUrl;

      // then
      assert.strictEqual(forgottenPasswordUrl, expectedForgottenPasswordUrl);
    });
  });

  module('#legalNoticeUrl', function () {
    module('when current domain is fr', function () {
      test('should return "pix.fr" url', function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        service.currentDomain = { getExtension: sinon.stub().returns('fr') };

        // when
        const legalNoticeUrl = service.legalNoticeUrl;

        // then
        assert.strictEqual(legalNoticeUrl, 'https://pix.fr/mentions-legales');
      });
    });

    module('when current domain is org', function () {
      module('when current language is en', function () {
        test('should return "pix.org/en-gb" url', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { getExtension: sinon.stub().returns('org') };
          service.intl = { t: sinon.stub().returns('en') };

          // when
          const legalNoticeUrl = service.legalNoticeUrl;

          // then
          assert.strictEqual(legalNoticeUrl, 'https://pix.org/en-gb/legal-notice');
        });
      });

      module('when current language is fr', function () {
        test('should return "pix.org/fr" url', function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.currentDomain = { getExtension: sinon.stub().returns('org') };
          service.intl = { t: sinon.stub().returns('fr') };

          // when
          const legalNoticeUrl = service.legalNoticeUrl;

          // then
          assert.strictEqual(legalNoticeUrl, 'https://pix.org/fr/mentions-legales');
        });
      });
    });
  });
});
