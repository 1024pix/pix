import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | Campaigns | Skill Review', function() {

  setupTest();

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:campaigns/skill-review');

    const setStub = sinon.stub();

    controller.set('model', {
      campaignParticipation: {
        isShared: false,
        set: setStub,
        save: sinon.stub().resolves({}),
        campaignParticipationResult: {
          masteryPercentage: 50,
        },
        campaign: {
          targetProfile: {
            name: 'Cléa Numérique',
          }
        }
      },
      assessment: {
        id: 'assessmentId',
        get: sinon.stub().withArgs('id').resolves('assessmentId'),
        state: 'completed',
        save: sinon.stub().resolves({}),
        codeCampaign: 'codeCampaign'
      }
    });
    controller.set('showButtonToShareResult', true);
    controller.transitionToRoute = sinon.stub();
  });

  describe('#shouldShowPixEmploiBadge', () => {
    it('should return true when user masters more than 85 percent for pixEmploi profile ', function() {
      // when
      controller.set('model.campaignParticipation.campaign.targetProfile.name', 'Pix emploi - Parcours complet');
      controller.set('model.campaignParticipation.campaignParticipationResult.masteryPercentage', 85);

      // then
      expect(controller.shouldShowPixEmploiBadge).to.equal(true);
    });

    it('should return false when user masters less than 85 percent for pixEmploi profile ', function() {
      // when
      controller.set('model.campaignParticipation.campaign.targetProfile.name', 'Pix emploi - Parcours complet');
      controller.set('model.campaignParticipation.campaignParticipationResult.masteryPercentage', 83);

      // then
      expect(controller.shouldShowPixEmploiBadge).to.equal(false);
    });
    it('should return false when user masters more than 85 percent for other profile ', function() {
      // when
      controller.set('model.campaignParticipation.campaign.targetProfile.name', 'Pix Chomage');
      controller.set('model.campaignParticipation.campaignParticipationResult.masteryPercentage', 86);

      // then
      expect(controller.shouldShowPixEmploiBadge).to.equal(false);
    });

  });

  describe('#shouldShowCleaNumeriqueBadge', () => {
    it('should return true when user masters more than 85 percent for Clea Numerique profile ', function() {
      // when
      controller.set('model.campaignParticipation.campaign.targetProfile.name', 'Parcours Cléa numérique');
      controller.set('model.campaignParticipation.campaignParticipationResult.masteryPercentage', 85);

      // then
      expect(controller.shouldShowCleaNumeriqueBadge).to.equal(true);
    });

    it('should return false when user masters less than 85 percent for Clea Numerique profile ', function() {
      // when
      controller.set('model.campaignParticipation.campaign.targetProfile.name', 'Parcours Cléa numérique');
      controller.set('model.campaignParticipation.campaignParticipationResult.masteryPercentage', 83);

      // then
      expect(controller.shouldShowCleaNumeriqueBadge).to.equal(false);
    });
    it('should return false when user masters more than 85 percent for other profile ', function() {
      // when
      controller.set('model.campaignParticipation.campaign.targetProfile.name', 'Bidule Numérique');
      controller.set('model.campaignParticipation.campaignParticipationResult.masteryPercentage', 86);

      // then
      expect(controller.shouldShowCleaNumeriqueBadge).to.equal(false);
    });

  });

  describe('#shareCampaignParticipation', function() {
    it('should set isShared to true', function() {
      // when
      controller.actions.shareCampaignParticipation.call(controller);

      // then
      sinon.assert.calledWith(controller.get('model.campaignParticipation.set'), 'isShared', true);
    });
  });

  describe('#improvementCampaignParticipation', function() {
    it('should save the campaignParticipation to start the improvement', async function() {
      // when
      await controller.actions.improvementCampaignParticipation.call(controller);

      // then
      sinon.assert.calledWith(controller.get('model.campaignParticipation.save'), { adapterOptions: { beginImprovement: true } });
    });

    it('should redirect to campaigns.start-or-resume', async function() {
      // when
      await controller.actions.improvementCampaignParticipation.call(controller);

      // then
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume');
    });
  });
});
