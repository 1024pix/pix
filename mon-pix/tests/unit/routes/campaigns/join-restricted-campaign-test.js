import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

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
      route.paramsFor = sinon.stub().returns(params);

      // when
      const model = route.model();

      // then
      expect(model).to.equal(campaignCode);
    });
  });
});
