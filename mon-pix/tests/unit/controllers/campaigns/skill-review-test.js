import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import  EmberObject  from '@ember/object';

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

  describe('#shouldShowBadge', () => {
    context('when at least one badge is available', function() {
      beforeEach(function() {
        // given
        const badgePixEmploi = EmberObject.create({
          content : {
            altMessage: 'Vous avez validé le badge Pix Emploi.',
            message: 'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. ' +
            'Pour valoriser vos compétences, renseignez-vous auprès de votre conseiller.',
            imageUrl: '/images/badges/Pix-emploi.svg',
          }
        });
        controller.set('model.campaignParticipation.campaignParticipationResult.badge', badgePixEmploi);
      });

      it('should return true when user validated the criteria of a badge', function() {
        // when
        controller.set('model.campaignParticipation.campaignParticipationResult.areBadgeCriteriaValidated', true);

        // then
        expect(controller.shouldShowBadge).to.equal(true);
      });

      it('should return false when user did not validated the criteria of a badge', function() {
        // when
        controller.set('model.campaignParticipation.campaignParticipationResult.areBadgeCriteriaValidated', false);

        // then
        expect(controller.shouldShowBadge).to.equal(false);
      });
    });

    context('when no badge is available', function() {
      beforeEach(function() {
        // given
        const emptyBadge = EmberObject.create({
          content: null
        });
        controller.set('model.campaignParticipation.campaignParticipationResult.badge', emptyBadge);
      });

      it('should return false when user validated the criteria of a badge', function() {
        // when
        controller.set('model.campaignParticipation.campaignParticipationResult.areBadgeCriteriaValidated', false);

        // then
        expect(controller.shouldShowBadge).to.equal(false);
      });

      it('should return false when user did not validated the criteria of a badge', function() {
        // when
        controller.set('model.campaignParticipation.campaignParticipationResult.areBadgeCriteriaValidated', false);

        // then
        expect(controller.shouldShowBadge).to.equal(false);
      });
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
