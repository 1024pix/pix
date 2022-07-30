import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | Entrance', function (hooks) {
  setupTest(hooks);

  let route, campaign;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:campaigns.entrance');
    route.campaignStorage = { get: sinon.stub(), set: sinon.stub() };
    route.modelFor = sinon.stub();
    route.router = { replaceWith: sinon.stub(), transitionTo: sinon.stub() };
  });

  module('#beforeModel', function () {
    test('should redirect to entry point when /entree is directly set in the url', async function (assert) {
      //when
      await route.beforeModel({ from: null });

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entry-point');
    });

    test('should continue en entrance route when from is set', async function (assert) {
      //when
      await route.beforeModel({ from: 'campaigns.entry-point' });

      //then
      assert.expect(0);
      sinon.assert.notCalled(route.router.replaceWith);
    });
  });

  module('#model', function () {
    test('should load model', async function (assert) {
      //when
      await route.model();

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.modelFor, 'campaigns');
    });
  });

  module('#afterModel', function () {
    let campaignParticipationStub;
    hooks.beforeEach(function () {
      campaignParticipationStub = { save: sinon.stub(), deleteRecord: sinon.stub() };
      route.store = { createRecord: sinon.stub().returns(campaignParticipationStub), queryRecord: sinon.stub() };
      route.currentUser = { user: {} };
    });

    test('should save new campaign participation', async function (assert) {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
      });
      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(false);

      //when
      await route.afterModel(campaign);

      //then
      assert.expect(0);
      sinon.assert.called(campaignParticipationStub.save);
    });

    test('should save another campaign participation when retry is allowed', async function (assert) {
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
      assert.expect(0);
      sinon.assert.called(campaignParticipationStub.save);
    });

    test('should resume and not create any new campaign participation when some is already existing', async function (assert) {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
      });
      route.store.queryRecord.resolves({});

      //when
      await route.afterModel(campaign);

      //then
      assert.expect(0);
      sinon.assert.notCalled(route.store.createRecord);
    });

    test('should abort campaign participation creation when something went wrong', async function (assert) {
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
        assert.expect(0);
        sinon.assert.called(campaignParticipationStub.deleteRecord);
        return;
      }
      assert.expect(0);
      sinon.assert.fail('entrance afterModel route should have throw an error.');
    });

    test('should abort campaign participation creation and redirect to fill-in-participant-external-id when something went wrong with it', async function (assert) {
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
      assert.expect(0);
      sinon.assert.calledWith(route.campaignStorage.set, campaign.code, 'participantExternalId', null);
      sinon.assert.calledWith(
        route.router.replaceWith,
        'campaigns.invited.fill-in-participant-external-id',
        campaign.code
      );
    });

    test('should abort campaign participation and redirect to already participated', async function (assert) {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
      });
      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(false);
      campaignParticipationStub.save.rejects({
        errors: [{ status: 412, detail: 'ORGANIZATION_LEARNER_HAS_ALREADY_PARTICIPATED' }],
      });

      //when
      await route.afterModel(campaign);

      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.existing-participation', campaign.code);
    });

    test('should redirect to profiles-collection when campaign is of type PROFILES COLLECTION', async function (assert) {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
        isProfilesCollection: true,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(true);

      //when
      await route.afterModel(campaign);

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.profiles-collection.start-or-resume');
    });

    test('should redirect to assessment when campaign is of type ASSESSMENT', async function (assert) {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
        isProfilesCollection: false,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(true);

      //when
      await route.afterModel(campaign);

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.assessment.start-or-resume');
    });
  });
});
