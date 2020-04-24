import { expect } from 'chai';
import sinon from 'sinon';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { A } from '@ember/array';

describe('Unit | Route | campaigns/send-profile', function() {
  setupTest();

  describe('#model', function() {

    let storeStub;
    let queryRecordStub;
    let queryStub;
    const campaignCode = 'GTFUHBD23';
    const campaignId = 1234;
    const userId = 9876;

    beforeEach(function() {
      queryStub = sinon.stub();
      queryRecordStub = sinon.stub();
      storeStub = Service.create({ queryRecord: queryRecordStub, query: queryStub });
    });

    it('should return campaign and campaign participation', async function() {
      // given
      const  user = Service.create({ id: userId });
      const route = this.owner.lookup('route:campaigns/send-profile');
      route.set('store', storeStub);
      route.set('currentUser', { user: user });

      const params = {
        campaign_code: campaignCode
      };
      const campaign = EmberObject.create({ id: campaignId, code: campaignCode });
      const campaigns = A([campaign]);
      queryStub.withArgs('campaign', { filter: { code: campaignCode } }).resolves(campaigns);

      const campaignParticipation = EmberObject.create({ id: 5678, campaignId, userId });
      queryRecordStub.withArgs('campaignParticipation', { campaignId, userId }).resolves(campaignParticipation);

      // when
      const model = await route.model(params);

      // then
      expect(model).to.deep.equal({ campaign, campaignParticipation, user });
    });
  });
});
