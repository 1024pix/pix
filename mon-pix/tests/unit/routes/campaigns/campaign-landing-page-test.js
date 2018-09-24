import Service from '@ember/service';
import { assert } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/campaign-landing-page', function() {

  setupTest('route:campaigns/campaign-landing-page', {
    needs: ['service:current-routed-modal']
  });

  let storeStub;
  let createRecordStub;
  let queryRecordStub;
  let queryStub;

  beforeEach(function() {
    queryStub = sinon.stub();
    createRecordStub = sinon.stub();
    queryRecordStub = sinon.stub();
    storeStub = Service.extend({ queryRecord: queryRecordStub, query: queryStub, createRecord: createRecordStub });
    this.register('service:store', storeStub);
    this.inject.service('store', { as: 'store' });

    this.register('service:session', Service.extend({
      isAuthenticated: true,
      data: {
        authenticated: {
          userId: 1435
        }
      }
    }));
    this.inject.service('session', { as: 'session' });
  });

  describe('#model', function() {

    it('should reject when no campaign found for the given code', function() {
      // given
      const route = this.subject();
      const params = {
        campaign_code: 'AQST765'
      };
      const error = {
        errors: [{ code: 404, title: 'Not Found', detail: 'Not found campaign with code AZERTY123445' }]
      };

      queryStub.rejects(error);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        assert.ok(false, 'promise should be rejected.');
      }).catch(() => {
        assert.ok(true);
      });
    });

  });

  describe('#startCampaignParticipation', function() {

    it('should redirect to "fill in id pix" page', function() {
      // given
      const campaignParticipation = { save: sinon.stub() };
      campaignParticipation.save.resolves();
      const route = this.subject();
      route.transitionTo = sinon.stub();

      // when
      route.send('startCampaignParticipation', campaignParticipation);

      // then
      return sinon.assert.calledWith(route.transitionTo, 'campaigns.fill-in-id-pix');

    });
  });
});
