import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | url', function(hooks) {
  setupTest(hooks);

  test('should have a frenchDomainExtension when the current domain contains pix.fr', function(assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('fr') };

    // when
    const domainExtension = service.isFrenchDomainExtension;

    // then
    assert.equal(domainExtension, true);
  });

  test('should not have frenchDomainExtension when the current domain contains pix.org', function(assert) {
    // given
    const service = this.owner.lookup('service:url');
    service.currentDomain = { getExtension: sinon.stub().returns('org') };

    // when
    const domainExtension = service.isFrenchDomainExtension;

    // then
    assert.equal(domainExtension, false);
  });

  module('#campaignsRootUrl', function() {

    test('should get default campaigns root url when is defined', function(assert) {
      // given
      const service = this.owner.lookup('service:url');
      service.definedCampaignsRootUrl = 'pix.test.fr';

      // when
      const campaignsRootUrl = service.campaignsRootUrl;

      // then
      assert.equal(campaignsRootUrl, service.definedCampaignsRootUrl);
    });

    test('should get "pix.test" url when current domain contains pix.test', function(assert) {
      // given
      const service = this.owner.lookup('service:url');
      const expectedCampaignsRootUrl = 'https://app.pix.test/campagnes/';
      service.definedCampaignsRootUrl = undefined;
      service.currentDomain = { getExtension: sinon.stub().returns('test') };

      // when
      const campaignsRootUrl = service.campaignsRootUrl;

      // then
      assert.equal(campaignsRootUrl, expectedCampaignsRootUrl);
    });
  });
});
