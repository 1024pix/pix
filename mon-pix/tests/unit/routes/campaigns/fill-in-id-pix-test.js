import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/fill-in-id-pix', function() {

  setupTest('route:campaigns/fill-in-id-pix', {
    needs: ['service:session', 'service:current-routed-modal']
  });

  let route;
  let storeStub;
  let createCampaignParticipationStub;
  let queryChallengeStub;
  let queryStub;
  let savedAssessment;
  let createdCampaignParticipation;
  let campaign;
  const campaignCode = 'CODECAMPAIGN';

  beforeEach(function() {
    createCampaignParticipationStub = sinon.stub().returns({
      save: sinon.stub().resolves(),
    });
    queryChallengeStub = sinon.stub();
    queryStub = sinon.stub();
    storeStub = Service.extend({
      queryRecord: queryChallengeStub, query: queryStub, createRecord: createCampaignParticipationStub });
    this.register('service:store', storeStub);
    this.inject.service('store', { as: 'store' });
    savedAssessment = EmberObject.create({ id: 1234, codeCampaign: campaignCode, reload: sinon.stub() });
    createdCampaignParticipation = EmberObject.create({ id: 456, assessment: savedAssessment });
    campaign = EmberObject.create({ code: campaignCode });
    route = this.subject();
  });

  describe('#model', function() {

    beforeEach(function() {
    });

    it('should retrieve campaign with given campaign code', function() {
      // given
      const params = {
        campaign_code: campaignCode
      };

      const campaigns = A([campaign]);
      queryStub.resolves(campaigns);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryStub, 'campaign', { filter: { code: campaignCode } });
      });
    });

    it('should redirect to campaign when id pix is not required', function() {
      // given
      const params = {
        campaign_code: campaignCode
      };
      const campaigns = A([campaign]);
      queryStub.resolves(campaigns);
      route.transitionTo = sinon.stub();

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'assessments.challenge');
      });
    });

    it('should not redirect to campaign when id pix is not required', function() {
      // given
      const params = {
        campaign_code: campaignCode
      };
      campaign.idPixLabel = 'email';
      const campaigns = A([campaign]);
      queryStub.resolves(campaigns);
      route.transitionTo = sinon.stub();

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.notCalled(route.transitionTo);
      });
    });
  });

  describe('#start', function() {

    const participantExternalId = 'Identifiant professionnel';

    beforeEach(function() {
      savedAssessment.reload.resolves();
      route.transitionTo = sinon.stub();
      createCampaignParticipationStub.returns({
        save: () => Promise.resolve(createdCampaignParticipation)
      });
      queryChallengeStub.resolves();
    });

    it('should create new campaignParticipation', function() {
      // when
      const promise = route.start(campaign, participantExternalId);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(createCampaignParticipationStub, 'campaign-participation', { campaign, participantExternalId });
      });
    });

    it('should retrieve challenge with given assessment id', function() {
      // when
      const promise = route.start(campaign, participantExternalId);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryChallengeStub, 'challenge', { assessmentId: savedAssessment.get('id') });
      });
    });

    it('should redirect to next challenge if one was found', function() {
      // given
      queryChallengeStub.resolves({ id: 23 });

      // when
      const promise = route.start(campaign, participantExternalId);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'assessments.challenge');
      });
    });

    it('should redirect to start campaign if there is no challenge', function() {
      // given
      queryChallengeStub.resolves(null);

      // when
      const promise = route.start(campaign, participantExternalId);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'campaigns.start-or-resume');
      });
    });
  });
});
