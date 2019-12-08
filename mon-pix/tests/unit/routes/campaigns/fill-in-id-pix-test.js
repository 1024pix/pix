import EmberObject from '@ember/object';
import Service from '@ember/service';
import { A } from '@ember/array';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/fill-in-id-pix', function() {

  setupTest();

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
    storeStub = Service.create({
      queryRecord: queryChallengeStub, query: queryStub, createRecord: createCampaignParticipationStub
    });
    savedAssessment = EmberObject.create({ id: 1234, codeCampaign: campaignCode, reload: sinon.stub() });
    createdCampaignParticipation = EmberObject.create({ id: 456, assessment: savedAssessment });
    campaign = EmberObject.create({ code: campaignCode });
    route = this.owner.lookup('route:campaigns/fill-in-id-pix');
    route.set('store', storeStub);
    this.owner.register('service:session', Service.extend({ invalidate: sinon.stub(), isAuthenticated: true }));
  });

  describe('#beforeModel', function() {

    let transition;

    beforeEach(function() {
      transition = {
        to: {
          params: {
            campaign_code: campaignCode
          }
        }
      };
      route.replaceWith = sinon.stub();
    });

    it('should redirect to start-or-resume when there is already an assessement', async function() {
      // given
      const assessments = A([savedAssessment]);
      queryStub.resolves(assessments);

      // when
      await route.beforeModel(transition);

      // then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.start-or-resume', campaignCode);
    });

    it('should not redirect to start-or-resume when there is no assessement', async function() {
      // given
      const assessments = A([]);
      queryStub.resolves(assessments);

      // when
      await route.beforeModel(transition);

      // then
      sinon.assert.notCalled(route.replaceWith);
    });

    context('When participant external id is set in the url', function() {

      it('should save participant external id as a property', async function() {
        // given
        const givenParticipantExternalId = 'a7Eat01r3';
        transition = {
          to: {
            params: {
              campaign_code: campaignCode,
            },
            queryParams: {
              givenParticipantExternalId,
            }
          }
        };
        const assessments = A([]);
        queryStub.resolves(assessments);

        // when
        await route.beforeModel(transition);

        // then
        expect(route.get('givenParticipantExternalId')).to.equal(givenParticipantExternalId);
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
  });

  describe('#afterModel', function() {

    it('should start the campaign when there is no idPixLabel', async function() {
      // given
      const campaignWithoutIdPixLabel = { idPixLabel: undefined };
      route.start = sinon.stub();

      // when
      await route.afterModel(campaignWithoutIdPixLabel);

      // then
      sinon.assert.calledWith(route.start, campaignWithoutIdPixLabel);
    });

    it('should start the campaign when participant external id is set in the url', async function() {
      // given
      const campaignWithIdPixLabel =  { idPixLabel: 'some label' };
      const participantExternalId = 'a73at01r3';
      route.start = sinon.stub();
      route.set('givenParticipantExternalId', participantExternalId);

      // when
      await route.afterModel(campaignWithIdPixLabel);

      // then
      sinon.assert.calledWith(route.start, campaignWithIdPixLabel, participantExternalId);
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
        sinon.assert.calledWith(createCampaignParticipationStub, 'campaign-participation', {
          campaign,
          participantExternalId
        });
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

    it('should invalidate session and relaunch page when user is no longer connected', function() {
      // given
      const error = { errors: [{ status: 403 }] };
      createCampaignParticipationStub.returns({
        save: () => Promise.reject(error)
      });

      // when
      const promise = route.start(campaign, participantExternalId);

      // then
      return promise.then(() => {
        sinon.assert.called(route.get('session').invalidate);
        sinon.assert.calledWith(route.transitionTo, 'campaigns.start-or-resume');
      });

    });
  });
});
