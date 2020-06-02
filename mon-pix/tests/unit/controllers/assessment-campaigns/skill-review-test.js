import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import  EmberObject  from '@ember/object';

describe('Unit | Controller | Assessment Campaigns | Skill Review', function() {

  setupTest();

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:assessment-campaigns/skill-review');

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

    it('should showCleaCompetences when campaignParticipationResult has partnerCompetenceResults', function() {
      // given
      const partnerCompetenceResult = { name : 'competence name' };
      controller.model.campaignParticipation.campaignParticipationResult.partnerCompetenceResults = [ partnerCompetenceResult ];

      // when
      const shouldShowCleaCompetences = controller.showCleaCompetences;

      // then
      expect(shouldShowCleaCompetences).to.equal(true);
    });

    it('should not show clea competence when there is no partnerCompetenceResults', function() {
      // given
      controller.model.campaignParticipation.campaignParticipationResult.partnerCompetenceResults = [];

      // when
      const shouldShowCleaCompetences = controller.showCleaCompetences;

      // then
      expect(shouldShowCleaCompetences).to.equal(false);
    });
  });

  describe('#showBadges', function() {

    it('should show badges', function() {
      // given
      const badges = [{ id : 33 }];
      controller.model.campaignParticipation.campaignParticipationResult.badges = badges ;

      // when
      const shouldShowBadges = controller.showBadges;

      // then
      expect(shouldShowBadges).to.equal(true);
    });

    it('should not show badges', function() {
      // given
      const badges = [];
      controller.model.campaignParticipation.campaignParticipationResult.badges = badges ;

      // when
      const shouldShowBadges = controller.showBadges;

      // then
      expect(shouldShowBadges).to.equal(false);
    });
  });
});
