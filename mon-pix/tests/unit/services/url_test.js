import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import setupIntl from 'mon-pix/tests/helpers/setup-intl';

module.only('Unit | Service | locale', function (hooks) {
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(homeUrl, expectedDefinedHomeUrl);
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
      { language: 'fr', currentDomainExtension: 'fr', expectedShowcaseUrl: 'https://pix.fr' },
      { language: 'fr', currentDomainExtension: 'org', expectedShowcaseUrl: 'https://pix.org' },
      { language: 'en', currentDomainExtension: 'fr', expectedShowcaseUrl: 'https://pix.fr/en-gb' },
      { language: 'en', currentDomainExtension: 'org', expectedShowcaseUrl: 'https://pix.org/en-gb' },
    ].forEach(function (testCase) {
      test(`should get "${testCase.expectedShowcaseUrl}" when current domain="${testCase.currentDomainExtension}" and lang="${testCase.language}"`, function (assert) {
        // given
        const service = this.owner.lookup('service:url');
        service.definedHomeUrl = '/';
        service.currentDomain = { getExtension: sinon.stub().returns(testCase.currentDomainExtension) };
        this.intl.setLocale([testCase.language]);

        // when
        const showcaseUrl = service.showcaseUrl;

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(showcaseUrl, testCase.expectedShowcaseUrl);
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(cguUrl, expectedCguUrl);
    });
  });

  module('#extensionUrl', function () {
    test('should get extension url', function (assert) {
      // given
      const expectedExtension = 'fr';
      const service = this.owner.lookup('service:url');
      service.currentDomain = { getExtension: sinon.stub().returns(expectedExtension) };

      // when
      const homeUrl = service.extensionUrl;

      // then
      assert.deepEqual(homeUrl, expectedExtension);
    });
  });
});
