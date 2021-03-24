import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

import ENV from 'mon-pix/config/environment';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';

describe('Unit | Service | locale', function() {
  setupTest();
  setupIntl();

  it('should have a frenchDomainExtension when the current domain contains pix.fr', function() {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    const domainExtension = service.isFrenchDomainExtension;

    // then
    expect(domainExtension).to.equal(true);
  });

  it('should not have frenchDomainExtension when the current domain contains pix.org', function() {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('org') };

    // when
    const domainExtension = service.isFrenchDomainExtension;

    // then
    expect(domainExtension).to.equal(false);
  });

  describe('#homeUrl', function() {

    context('when environnement not prod', function() {
      const defaultIsProdEnv = ENV.APP.IS_PROD_ENVIRONMENT;

      beforeEach(function() {
        ENV.APP.IS_PROD_ENVIRONMENT = false;
      });

      afterEach(function() {
        ENV.APP.IS_PROD_ENVIRONMENT = defaultIsProdEnv;
      });

      it('should get default home url', function() {
        // given
        const service = this.owner.lookup('service:url');
        service.definedHomeUrl = 'pix.test.fr';

        // when
        const homeUrl = service.homeUrl;

        // then
        const expectedDefinedHomeUrl = `${service.definedHomeUrl}?lang=${this.intl.t('current-lang')}`;
        expect(homeUrl).to.equal(expectedDefinedHomeUrl);
      });
    });

    context('when it is not a Review App and environnement is ‘production‘', function() {

      const defaultIsProdEnv = ENV.APP.IS_PROD_ENVIRONMENT;
      let defaultLocale;

      beforeEach(function() {
        ENV.APP.IS_PROD_ENVIRONMENT = true;
        defaultLocale = this.intl.t('current-lang');
      });

      afterEach(function() {
        ENV.APP.IS_PROD_ENVIRONMENT = defaultIsProdEnv;
        this.intl.setLocale(defaultLocale);
      });

      [
        { language: 'fr', currentDomainExtension: 'fr', expectedHomeUrl: 'https://pix.fr' },
        { language: 'fr', currentDomainExtension: 'org', expectedHomeUrl: 'https://pix.org' },
        { language: 'en', currentDomainExtension: 'fr', expectedHomeUrl: 'https://pix.fr/en-gb' },
        { language: 'en', currentDomainExtension: 'org', expectedHomeUrl: 'https://pix.org/en-gb' },
      ].forEach((testCase) => {
        it(`should get "${testCase.expectedHomeUrl}" when current domain="${testCase.currentDomainExtension}" and lang="${testCase.language}"`, function() {
          // given
          const service = this.owner.lookup('service:url');
          service.definedHomeUrl = '/';
          service.currentDomain = { getExtension: sinon.stub().returns(testCase.currentDomainExtension) };
          this.intl.setLocale([testCase.language]);

          // when
          const homeUrl = service.homeUrl;

          // then
          expect(homeUrl).to.equal(testCase.expectedHomeUrl);
        });
      });

    });
  });

  describe('#cguUrl', function() {

    it('should get "pix.fr" url when current domain contains pix.fr', function() {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.fr/conditions-generales-d-utilisation';
      service.currentDomain = { getExtension: sinon.stub().returns('fr') };

      // when
      const cguUrl = service.cguUrl;

      // then
      expect(cguUrl).to.equal(expectedCguUrl);
    });

    it('should get "pix.org" english url when current language is en', function() {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.org/en-gb/terms-and-conditions';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('en') };

      // when
      const cguUrl = service.cguUrl;

      // then
      expect(cguUrl).to.equal(expectedCguUrl);
    });

    it('should get "pix.org" french url when current language is fr', function() {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.org/conditions-generales-d-utilisation';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('fr') };

      // when
      const cguUrl = service.cguUrl;

      // then
      expect(cguUrl).to.equal(expectedCguUrl);
    });

  });

  describe('#dataProtectionPolicyUrl', function() {

    it('should get "pix.fr" url when current domain contains pix.fr', function() {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.fr/politique-protection-donnees-personnelles-app';
      service.currentDomain = { getExtension: sinon.stub().returns('fr') };

      // when
      const cguUrl = service.dataProtectionPolicyUrl;

      // then
      expect(cguUrl).to.equal(expectedCguUrl);
    });

    it('should get "pix.org" english url when current language is en', function() {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.org/en-gb/personal-data-protection-policy';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('en') };

      // when
      const cguUrl = service.dataProtectionPolicyUrl;

      // then
      expect(cguUrl).to.equal(expectedCguUrl);
    });

    it('should get "pix.org" french url when current language is fr', function() {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCguUrl = 'https://pix.org/politique-protection-donnees-personnelles-app';
      service.currentDomain = { getExtension: sinon.stub().returns('org') };
      service.intl = { t: sinon.stub().returns('fr') };

      // when
      const cguUrl = service.dataProtectionPolicyUrl;

      // then
      expect(cguUrl).to.equal(expectedCguUrl);
    });

  });

});
