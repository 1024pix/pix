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

  describe('#beforeModel', function() {

    let transition;

    beforeEach(function() {
      transition = {
        params: {
          'campaigns.fill-in-id-pix': {
            campaign_code: campaignCode
          }
        }
      };
      route.transitionTo = sinon.stub();
    });

    it('should redirect to start-or-resume when there is already an assessement', function() {
      // given
      const assessments = A([savedAssessment]);
      queryStub.resolves(assessments);

      // when
      const promise = route.beforeModel(transition);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'campaigns.start-or-resume', campaignCode);
      });
    });

    it('should not redirect to start-or-resume when there is no assessement', function() {
      // given
      const assessments = A([]);
      queryStub.resolves(assessments);

      // when
      const promise = route.beforeModel(transition);

      // then
      return promise.then(() => {
        sinon.assert.notCalled(route.transitionTo);
      });
    });
  });

  describe('#model', function() {

    it('should retrieve campaign with given campaign code', function() {
      // given
      const params = {
        campaign_code: campaignCode
      };

      const campaigns = A([campaign]);
      queryStub.resolves(campaigns);
      route.start = sinon.stub();

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
      route.start = sinon.stub();

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.called(route.start);
      });
    });

    it('should not redirect to campaign when id pix is not required', function() {
      // given
      const params = {
        campaign_code: campaignCode
      };
      campaign.set('idPixLabel', 'email');
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
      route.set('campaignCode', 'AZERTY123');
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

    it('should redirect to start-or-resume page', function() {

      // when
      const promise = route.start(campaign, participantExternalId);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'campaigns.start-or-resume');
      });
    });
  });
});
