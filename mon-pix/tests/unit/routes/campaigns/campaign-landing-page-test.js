import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';
import { assert, expect } from 'chai';
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

    it('should create new campaign-participation for current user', function() {
      // given
      const route = this.subject();
      const params = {
        campaign_code: 'AQST765'
      };
      const currentUserId = 1435;
      const currentCampaign = EmberObject.create({ id: 1234 });
      const campaigns = A([currentCampaign]);
      const newCampaignParticipation = EmberObject.create({ });

      queryStub.resolves(campaigns);
      createRecordStub.returns(newCampaignParticipation);

      // when
      const promise = route.model(params);

      // then
      return promise.then((campaignParticipation) => {
        sinon.assert.calledWith(createRecordStub, 'campaign-participation', { userId: currentUserId, campaignId: currentCampaign.get('id') });
        expect(campaignParticipation).to.deep.equal(newCampaignParticipation);
      });
    });

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

    it('should not create campaign participation when no campaign found for the given code', function() {
      // given
      const route = this.subject();
      const params = {
        campaign_code: 'AQST765'
      };

      queryStub.resolves(A([]));

      // when
      const promise = route.model(params);

      // then
      return promise.catch(() => {
        sinon.assert.notCalled(createRecordStub);
      });
    });
  });

  describe('#startCampaignParticipation', function() {

    it('should save campaign participation', function() {
      // given
      const campaignParticipation = { save: sinon.stub() };
      campaignParticipation.save.resolves();
      const route = this.subject();

      // when
      route.send('startCampaignParticipation', campaignParticipation);

      // then
      sinon.assert.called(campaignParticipation.save);
    });

    it('should redirect to "fill in id pix" page after saving campaign participation', function() {
      // given
      const campaignParticipation = { save: sinon.stub() };
      campaignParticipation.save.resolves();
      const route = this.subject();
      route.transitionTo = sinon.stub();

      // when
      const promise = route.send('startCampaignParticipation', campaignParticipation);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'campaigns.campaign-landing-page.fill-in-id-pix');
      });
    });
  });
});
