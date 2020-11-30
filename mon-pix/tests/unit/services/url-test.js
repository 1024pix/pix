import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

import ENV from 'mon-pix/config/environment';

describe('Unit | Service | locale', function() {
  setupTest();

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

    [
      { environment: 'development', isRA: 'false' },
      { environment: 'production', isRA: 'true' },
    ].forEach((testCase) => {
      context(`when environnement=‘${testCase.environment}‘ and isRA=${testCase.isRA}`, function() {
        const defaultEnvironment = ENV.environment;
        const defaultIsReviewApp = ENV.APP.REVIEW_APP;

        beforeEach(function() {
          ENV.environment = testCase.environment;
          ENV.APP.REVIEW_APP = testCase.isRA;
        });

        afterEach(function() {
          ENV.environment = defaultEnvironment;
          ENV.APP.REVIEW_APP = defaultIsReviewApp;
        });

        it('should get default home url', function() {
          // given
          const service = this.owner.lookup('service:url');
          service.definedHomeUrl = 'pix.test.fr';

          // when
          const homeUrl = service.homeUrl;

          // then
          expect(homeUrl).to.equal(service.definedHomeUrl);
        });
      });
    });

    context('when it is not a Review App and environnement is ‘production‘', function() {

      const defaultEnvironment = ENV.environment;
      const defaultIsReviewApp = ENV.APP.REVIEW_APP;

      beforeEach(function() {
        ENV.environment = 'production';
        ENV.APP.REVIEW_APP = 'false';
      });

      afterEach(function() {
        ENV.environment = defaultEnvironment;
        ENV.APP.REVIEW_APP = defaultIsReviewApp;
      });

      it('should get "pix.fr" url when current domain contains pix.fr', function() {
        // given
        const service = this.owner.lookup('service:url');
        const expectedHomeUrl = 'https://pix.fr';
        service.definedHomeUrl = undefined;
        service.currentDomain = { getExtension: sinon.stub().returns('fr') };

        // when
        const homeUrl = service.homeUrl;

        // then
        expect(homeUrl).to.equal(expectedHomeUrl);
      });

      it('should get "pix.org" url when current domain contains pix.org', function() {
        // given
        const service = this.owner.lookup('service:url');
        const expectedHomeUrl = 'https://pix.org';
        service.definedHomeUrl = undefined;
        service.currentDomain = { getExtension: sinon.stub().returns('org') };

        // when
        const homeUrl = service.homeUrl;

        // then
        expect(homeUrl).to.equal(expectedHomeUrl);
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

  });

});
