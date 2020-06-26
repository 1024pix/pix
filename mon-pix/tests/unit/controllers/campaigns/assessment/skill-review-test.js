import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import EmberObject from '@ember/object';

describe('Unit | Controller | Campaigns | Evaluation | Skill Review', function() {

  setupTest();

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:campaigns.assessment.skill-review');

    const setStub = sinon.stub();

    controller.set('model', {
      campaignParticipation: EmberObject.create({
        isShared: false,
        set: setStub,
        save: sinon.stub().resolves({}),
        campaignParticipationResult: EmberObject.create({
          masteryPercentage: 50,
        }),
        campaign: EmberObject.create({
          targetProfile: {
            name: 'Cléa Numérique',
          }
        })
      }),
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

  describe('#shareCampaignParticipation', function() {
    it('should set isShared to true', function() {
      // when
      controller.actions.shareCampaignParticipation.call(controller);

      // then
      expect(controller.model.campaignParticipation.isShared).to.equal(true);
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

  describe('#showCleaCompetences', function() {

    it('should showCleaCompetences when campaignParticipationResult has a clea badge', function() {
      // given
      const cleaBadge = { id: 111 };
      controller.model.campaignParticipation.campaignParticipationResult.cleaBadge = cleaBadge;

      // when
      const shouldShowCleaCompetences = controller.showCleaCompetences;

      // then
      expect(shouldShowCleaCompetences).to.equal(true);
    });

    it('should not show clea competence when there is no cleaBadge', function() {
      // given
      controller.model.campaignParticipation.campaignParticipationResult.cleaBadge = undefined;

      // when
      const shouldShowCleaCompetences = controller.showCleaCompetences;

      // then
      expect(shouldShowCleaCompetences).to.equal(false);
    });
  });

  describe('#showBadges', function() {

    it('should show badges when acquired', function() {
      // given
      const badges = [{ id: 33, isAcquired: true }];
      controller.model.campaignParticipation.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = controller.showBadges;

      // then
      expect(shouldShowBadges).to.equal(true);
    });

    it('should not show badges when not acquired', function() {
      // given
      const badges = [{ id: 33, isAcquired: false }];
      controller.model.campaignParticipation.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = controller.showBadges;

      // then
      expect(shouldShowBadges).to.equal(false);
    });

    it('should not show badges when none', function() {
      // given
      const badges = [];
      controller.model.campaignParticipation.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const shouldShowBadges = controller.showBadges;

      // then
      expect(shouldShowBadges).to.equal(false);
    });
  });

  describe('#acquiredBadges', function() {

    it('should only display acquired badges', function() {
      // given
      const badges = [{ id: 33, isAcquired: true }, { id: 34, isAcquired: false }];
      controller.model.campaignParticipation.campaignParticipationResult.campaignParticipationBadges = badges;

      // when
      const acquiredBadges = controller.acquiredBadges;

      // then
      expect(acquiredBadges).to.deep.equal([{ id: 33, isAcquired: true }]);
    });

  });

});
