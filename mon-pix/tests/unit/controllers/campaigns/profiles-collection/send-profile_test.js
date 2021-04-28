import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { expect } from 'chai';
import sinon from 'sinon';

describe('Unit | Controller | campaigns/profiles-collection/send-profile', function() {

  setupTest();

  const campaignParticipation = {
    id: 8654,
    isShared: false,
    save: sinon.stub(),
    set: sinon.stub().resolves(),
  };

  const campaignParticipationShared = { ...campaignParticipation, isShared: true };

  const model = {
    campaign: {
      id: 1243,
      code: 'CODECAMPAIGN',
    },
    campaignParticipation,
  };
  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:campaigns.profiles-collection.send-profile');
    controller.model = model;
    campaignParticipation.save.resolves(campaignParticipationShared);
  });

  describe('#sendProfile', function() {

    it('should set isShared to true', function() {
      // when
      controller.actions.sendProfile.call(controller);

      // then
      expect(controller.model.campaignParticipation.isShared).to.equal(true);
    });

    it('should not be loading nor in error', async function() {
      // when
      await controller.actions.sendProfile.call(controller);

      // then
      expect(controller.isLoading).to.equal(false);
      expect(controller.errorMessage).to.equal(null);
    });
  });
});
