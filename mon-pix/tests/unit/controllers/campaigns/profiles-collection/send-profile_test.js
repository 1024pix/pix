import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | campaigns/profiles-collection/send-profile', function (hooks) {
  setupTest(hooks);

  const campaignParticipation = {
    id: 8654,
    isShared: false,
    save: sinon.stub(),
    set: sinon.stub().resolves(),
  };

  const campaignParticipationShared = { ...campaignParticipation, isShared: true, deletedAt: null };

  const model = {
    campaign: {
      id: 1243,
      code: 'CODECAMPAIGN',
      isArchived: false,
    },
    campaignParticipation,
  };
  let controller;
  let currentUserStub;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns.profiles-collection.send-profile');
    currentUserStub = { load: sinon.stub() };

    controller.model = model;
    controller.set('currentUser', currentUserStub);
    campaignParticipation.save.resolves(campaignParticipationShared);
    currentUserStub.load.resolves();
  });

  module('#isDisabled', function () {
    test('should return false if campaignParticipation is not deleted and campaign is not archived', function (assert) {
      // given
      controller.model.campaignParticipation.deletedAt = null;
      controller.model.campaign.isArchived = false;

      // then
      assert.false(controller.isDisabled);
    });
    test('should return true if campaignParticipation is deleted', function (assert) {
      // given
      controller.model.campaignParticipation.deletedAt = new Date();
      controller.model.campaign.isArchived = false;

      // then
      assert.true(controller.isDisabled);
    });
    test('should return true if campaign is archived', function (assert) {
      // given
      controller.model.campaign.isArchived = true;
      controller.model.campaignParticipation.deletedAt = null;

      // then
      assert.true(controller.isDisabled);
    });
  });

  module('#sendProfile', function () {
    test('should set isShared to true', async function (assert) {
      const event = {
        preventDefault: () => {},
      };

      // when
      await controller.actions.sendProfile.call(controller, event);

      // then
      assert.true(controller.model.campaignParticipation.isShared);
    });

    test('should call load from currentUser', async function (assert) {
      const event = {
        preventDefault: () => {},
      };

      // when
      await controller.actions.sendProfile.call(controller, event);

      // then
      sinon.assert.called(currentUserStub.load);
      assert.ok(true);
    });

    test('should not be loading nor in error', async function (assert) {
      const event = {
        preventDefault: () => {},
      };

      // when
      await controller.actions.sendProfile.call(controller, event);

      // then
      assert.strictEqual(controller.errorMessage, null);
    });
  });
});
