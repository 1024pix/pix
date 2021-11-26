import EmberObject from '@ember/object';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Entrance', function () {
  setupTest();

  let route, campaign;

  beforeEach(function () {
    route = this.owner.lookup('route:campaigns.entrance');
    route.campaignStorage = { get: sinon.stub(), set: sinon.stub() };
    route.modelFor = sinon.stub();
    route.replaceWith = sinon.stub();
  });

  describe('#beforeModel', function () {
    it('should redirect to entry point when /entree is directly set in the url', async function () {
      //when
      await route.beforeModel({ from: null });

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.entry-point');
    });

    it('should continue en entrance route when from is set', async function () {
      //when
      await route.beforeModel({ from: 'campaigns.entry-point' });

      //then
      sinon.assert.notCalled(route.replaceWith);
    });
  });

  describe('#model', function () {
    it('should load model', async function () {
      //when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
    });
  });

  describe('#afterModel', function () {
    let campaignParticipationStub;
    beforeEach(function () {
      campaignParticipationStub = { save: sinon.stub(), deleteRecord: sinon.stub() };
      route.store = { createRecord: sinon.stub().returns(campaignParticipationStub), queryRecord: sinon.stub() };
      route.currentUser = { user: {} };
    });

    it('should save new campaign participation', async function () {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
      });
      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(false);

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.called(campaignParticipationStub.save);
    });

    it('should save another campaign participation when retry is allowed', async function () {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
        multipleSendings: true,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(true);
      route.campaignStorage.get.withArgs(campaign.code, 'retry').returns(true);

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.called(campaignParticipationStub.save);
    });

    it('should resume and not create any new campaign participation when some is already existing', async function () {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
      });
      route.store.queryRecord.resolves({});

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.notCalled(route.store.createRecord);
    });

    it('should abort campaign participation creation when something went wrong', async function () {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
      });
      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(false);
      campaignParticipationStub.save.rejects();

      //when
      try {
        await route.afterModel(campaign);
      } catch (err) {
        // then
        sinon.assert.called(campaignParticipationStub.deleteRecord);
        return;
      }
      sinon.assert.fail('entrance afterModel route should have throw an error.');
    });

    it('should abort campaign participation creation and redirect to fill-in-participant-external-id when something went wrong with it', async function () {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
      });
      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(false);
      campaignParticipationStub.save.rejects({
        errors: [{ status: 400, detail: 'participant-external-id is too long' }],
      });

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.campaignStorage.set, campaign.code, 'participantExternalId', null);
      sinon.assert.calledWith(route.replaceWith, 'campaigns.invited.fill-in-participant-external-id', campaign.code);
    });

    it('should redirect to profiles-collection when campaign is of type PROFILES COLLECTION', async function () {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
        isProfilesCollection: true,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(true);

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.profiles-collection.start-or-resume');
    });

    it('should redirect to assessment when campaign is of type ASSESSMENT', async function () {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
        isProfilesCollection: false,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(true);

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.assessment.start-or-resume');
    });
  });
});
