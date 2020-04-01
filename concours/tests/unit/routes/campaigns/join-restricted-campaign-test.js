import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | campaigns/join-restricted-campaign', function() {
  setupTest();

  describe('#model', function() {

    const campaignCode = 'GTFUHBD23';

    it('should return campaign code', async function() {
      // given
      const route = this.owner.lookup('route:campaigns/join-restricted-campaign');
      const params = {
        campaign_code: campaignCode
      };

      // when
      const model = route.model(params);

      // then
      expect(model).to.equal(campaignCode);
    });
  });
});
