import Service from '@ember/service';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/campaign-landing-page', function() {

  setupTest();

  let storeStub;
  let createRecordStub;
  let queryRecordStub;
  let queryStub;

  beforeEach(function() {
    queryStub = sinon.stub();
    createRecordStub = sinon.stub();
    queryRecordStub = sinon.stub();
    storeStub = Service.create({ queryRecord: queryRecordStub, query: queryStub, createRecord: createRecordStub });
  });

  describe('#model', function() {

    it('should retrieve the campaign from its code', function() {
      // given
      const route = this.owner.lookup('route:campaigns/campaign-landing-page');
      route.set('store', storeStub);

      const params = {
        campaign_code: 'AQST765'
      };

      const currentCampaign = EmberObject.create({ id: 1234 });
      const campaigns = A([currentCampaign]);

      queryStub.resolves(campaigns);

      // when
      const promise = route.model(params);

      // then
      return promise.then((campaign) => {
        sinon.assert.calledWith(queryStub, 'campaign', { filter: { code: 'AQST765' } });
        expect(campaign).to.deep.equal(currentCampaign);
      });
    });
  });
});
