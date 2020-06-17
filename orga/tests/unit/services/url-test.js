import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | url', function(hooks) {
  setupTest(hooks);

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
