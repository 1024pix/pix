import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

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

    it('should get default home url when is defined', function() {
      // given
      const service = this.owner.lookup('service:url');
      service.definedHomeUrl = 'pix.test.fr';

      // when
      const homeUrl = service.homeUrl;

      // then
      expect(homeUrl).to.equal(service.definedHomeUrl);
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
