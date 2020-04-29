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
  let queryRecordStub;
  let queryStub;
  let createdCampaignParticipation;
  let campaign;
  const campaignCode = 'CODECAMPAIGN';

  beforeEach(function() {
    createCampaignParticipationStub = sinon.stub().returns({
      save: sinon.stub().resolves(),
    });
    queryRecordStub = sinon.stub();
    queryStub = sinon.stub();
    storeStub = Service.create({
      queryRecord: queryRecordStub, query: queryStub, createRecord: createCampaignParticipationStub
    });
    createdCampaignParticipation = EmberObject.create({ id: 456 });
    campaign = EmberObject.create({ id: 987, code: campaignCode });
    route = this.owner.lookup('route:campaigns/fill-in-id-pix');
    route.set('store', storeStub);
    route.set('currentUser', { user: { id: 'userId' } });
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
        const campaigns = A([campaign]);
        queryStub.resolves(campaigns);
        queryRecordStub.resolves(null);

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
      route.paramsFor = sinon.stub().returns(params);

      const campaigns = A([campaign]);
      queryStub.resolves(campaigns);
      route.start = sinon.stub();

      // when
      const promise = route.model();

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryStub, 'campaign', { filter: { code: campaignCode } });
      });
    });
  });

  describe('#afterModel', function() {

    it('should redirect to start-or-resume when there is already a campaign participation', async function() {
      // given
      queryRecordStub.resolves(createdCampaignParticipation);
      route.replaceWith = sinon.stub();

      // when
      await route.afterModel(campaign);

      // then
      sinon.assert.calledWithExactly(route.replaceWith, 'campaigns.start-or-resume', campaignCode, { queryParams: { campaignParticipationIsStarted: true } });
    });

    it('should start the campaign when there is no idPixLabel', async function() {
      // given
      const campaignWithoutIdPixLabel = { idPixLabel: undefined };
      queryRecordStub.resolves(null);
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
      queryRecordStub.resolves(null);
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
      route.transitionTo = sinon.stub();
      route.set('campaignCode', 'AZERTY123');
      createCampaignParticipationStub.returns({
        save: () => Promise.resolve(createdCampaignParticipation)
      });
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
