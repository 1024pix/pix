import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import ENV from 'mon-pix/config/environment';
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
    module('when environnement not prod', function (hooks) {
      const defaultIsProdEnv = ENV.APP.IS_PROD_ENVIRONMENT;

      hooks.beforeEach(function () {
        ENV.APP.IS_PROD_ENVIRONMENT = false;
      });

      hooks.afterEach(function () {
        ENV.APP.IS_PROD_ENVIRONMENT = defaultIsProdEnv;
      });

      test('should get default home url', function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        service.definedHomeUrl = 'pix.test.fr';

        // when
        const homeUrl = service.homeUrl;

        // then
        const expectedDefinedHomeUrl = `${service.definedHomeUrl}?lang=${this.intl.t('current-lang')}`;
        assert.equal(homeUrl, expectedDefinedHomeUrl);
      });
    });

    module('when it is not a Review App and environnement is ‘production‘', function (hooks) {
      const defaultIsProdEnv = ENV.APP.IS_PROD_ENVIRONMENT;
      let defaultLocale;

      hooks.beforeEach(function () {
        ENV.APP.IS_PROD_ENVIRONMENT = true;
        defaultLocale = this.intl.t('current-lang');
      });

      hooks.afterEach(function () {
        ENV.APP.IS_PROD_ENVIRONMENT = defaultIsProdEnv;
        this.intl.setLocale(defaultLocale);
      });

      [
        { language: 'fr', currentDomainExtension: 'fr', expectedHomeUrl: 'https://pix.fr' },
        { language: 'fr', currentDomainExtension: 'org', expectedHomeUrl: 'https://pix.org' },
        { language: 'en', currentDomainExtension: 'fr', expectedHomeUrl: 'https://pix.fr/en-gb' },
        { language: 'en', currentDomainExtension: 'org', expectedHomeUrl: 'https://pix.org/en-gb' },
      ].forEach(function (testCase) {
        test(`should get "${testCase.expectedHomeUrl}" when current domain="${testCase.currentDomainExtension}" and lang="${testCase.language}"`, function (assert) {
          // given
          const service = this.owner.lookup('service:url');
          service.definedHomeUrl = '/';
          service.currentDomain = { getExtension: sinon.stub().returns(testCase.currentDomainExtension) };
          this.intl.setLocale([testCase.language]);

          // when
          const homeUrl = service.homeUrl;

          // then
          assert.equal(homeUrl, testCase.expectedHomeUrl);
        });
      });
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
      assert.equal(cguUrl, expectedCguUrl);
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
      assert.equal(cguUrl, expectedCguUrl);
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
      assert.equal(cguUrl, expectedCguUrl);
    });
  });

  module('#dataProtectionPolicyUrl', function () {
    test('should get "pix.fr" url when current domain contains pix.fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.fr/politique-protection-donnees-personnelles-app';
      service.currentDomain = { getExtension: sinon.stub().returns('fr') };

      // when
      const cguUrl = service.dataProtectionPolicyUrl;

      // then
      assert.equal(cguUrl, expectedCguUrl);
    });

    test('should get "pix.org" english url when current language is en', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.org/en-gb/personal-data-protection-policy';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('en') };

      // when
      const cguUrl = service.dataProtectionPolicyUrl;

      // then
      assert.equal(cguUrl, expectedCguUrl);
    });

    test('should get "pix.org" french url when current language is fr', function (assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.org/politique-protection-donnees-personnelles-app';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('fr') };

      // when
      const cguUrl = service.dataProtectionPolicyUrl;

      // then
      assert.equal(cguUrl, expectedCguUrl);
    });
  });
});
