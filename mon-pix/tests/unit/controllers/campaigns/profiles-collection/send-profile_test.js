import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { expect } from 'chai';
import sinon from 'sinon';

describe('Unit | Controller | campaigns/profiles-collection/send-profile', function () {
  setupTest();

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

  beforeEach(function () {
    controller = this.owner.lookup('controller:campaigns.profiles-collection.send-profile');
    controller.model = model;
    campaignParticipation.save.resolves(campaignParticipationShared);
  });

  describe('#isDisabled', function () {
    it('should return false if campaignParticipation is not deleted and campaign is not archived', function () {
      // then
      expect(controller.isDisabled).to.equal(false);
    });
    it('should return true if campaignParticipation is deleted', function () {
      // given
      controller.model.campaignParticipation.deletedAt = new Date();

      // then
      expect(controller.isDisabled).to.equal(true);
    });
    it('should return true if campaign is archived', function () {
      // given
      controller.model.campaign.isArchived = true;

      // then
      expect(controller.isDisabled).to.equal(true);
    });
  });

  describe('#sendProfile', function () {
    it('should set isShared to true', function () {
      // when
      controller.actions.sendProfile.call(controller);

      // then
      expect(controller.model.campaignParticipation.isShared).to.equal(true);
    });

    it('should not be loading nor in error', async function () {
      // when
      await controller.actions.sendProfile.call(controller);

      // then
      expect(controller.errorMessage).to.equal(null);
    });
  });
});
