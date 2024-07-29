import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Entrance', function (hooks) {
  setupTest(hooks);

  let route, campaign;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:campaigns.entrance');
    route.campaignStorage = { get: sinon.stub(), set: sinon.stub() };
    route.modelFor = sinon.stub();
    route.router = { replaceWith: sinon.stub(), transitionTo: sinon.stub() };
    route.session.requireAuthenticationAndApprovedTermsOfService = sinon.stub();
  });

  module('#beforeModel', function () {
    test('should redirect to entry point when /entree is directly set in the url', async function (assert) {
      //when
      await route.beforeModel({ from: null });

      //then
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entry-point');
      assert.ok(true);
    });

    test('should continue en entrance route when from is set', async function (assert) {
      //when
      await route.beforeModel({ from: 'campaigns.entry-point' });

      //then
      sinon.assert.notCalled(route.router.replaceWith);
      assert.ok(true);
    });
  });

  module('#model', function () {
    test('should load model', async function (assert) {
      //when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
      assert.ok(true);
    });
  });

  module('#afterModel', function (hooks) {
    let campaignParticipationStub;
    hooks.beforeEach(function () {
      campaignParticipationStub = { save: sinon.stub(), deleteRecord: sinon.stub() };
      route.store = { createRecord: sinon.stub().returns(campaignParticipationStub), queryRecord: sinon.stub() };
      route.currentUser = { user: {}, load: sinon.stub() };
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
      sinon.assert.called(campaignParticipationStub.save);
      sinon.assert.called(route.currentUser.load);
      assert.ok(true);
    });

    test('should save another campaign participation when retry is allowed', async function (assert) {
      //given
      campaign = EmberObject.create({
        code: 'SOMECODE',
        multipleSendings: true,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(true);
      route.campaignStorage.get.withArgs(campaign.code, 'retry').returns(true);
      route.currentUser.user.hasAssessmentParticipations = true;

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.called(campaignParticipationStub.save);
      sinon.assert.notCalled(route.currentUser.load);
      assert.ok(true);
    });

    test('should save another campaign participation when reset is allowed', async function (assert) {
      // given
      campaign = {
        code: 'SOMECODE',
        multipleSendings: true,
      };

      route.campaignStorage.get.withArgs(campaign.code, 'hasParticipated').returns(true);
      route.campaignStorage.get.withArgs(campaign.code, 'reset').returns(true);
      route.currentUser.user.hasAssessmentParticipations = true;

      // when
      await route.afterModel(campaign);

      // then
      sinon.assert.calledWith(route.store.createRecord, 'campaign-participation', {
        campaign,
        isReset: true,
        participantExternalId: undefined,
      });
      sinon.assert.called(campaignParticipationStub.save);
      sinon.assert.notCalled(route.currentUser.load);
      assert.ok(true);
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
      sinon.assert.notCalled(route.store.createRecord);
      sinon.assert.notCalled(route.currentUser.load);
      assert.ok(true);
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
        // eslint-disable-next-line no-empty
      } catch (err) {}
      sinon.assert.called(campaignParticipationStub.deleteRecord);
      sinon.assert.notCalled(route.currentUser.load);
      assert.ok(true);
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
      sinon.assert.notCalled(route.currentUser.load);
      sinon.assert.calledWith(route.campaignStorage.set, campaign.code, 'participantExternalId', null);
      sinon.assert.calledWith(
        route.router.replaceWith,
        'campaigns.invited.fill-in-participant-external-id',
        campaign.code,
      );
      assert.ok(true);
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

      sinon.assert.notCalled(route.currentUser.load);
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.existing-participation', campaign.code);
      assert.ok(true);
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
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.profiles-collection.start-or-resume');
      assert.ok(true);
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
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.assessment.start-or-resume');
      assert.ok(true);
    });
  });
});
