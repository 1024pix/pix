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
        save: sinon.stub().resolves({})
      },
      assessment: {
        id: 'assessmentId',
        get: sinon.stub().withArgs('id').resolves('assessmentId'),
        state: 'completed',
        save: sinon.stub().resolves({})
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
      sinon.assert.calledWith(controller.get('model.campaignParticipation.set'), 'isShared', true);
    });
  });

  describe('#improvmentCampaignParticipationResult', function() {
    it('should save the assessment to start the improvment', async function() {
      // when
      await controller.actions.improvmentCampaignParticipationResult.call(controller);

      // then
      sinon.assert.calledWith(controller.get('model.assessment.save'), { adapterOptions: { improvmentCampaignParticipationResult: true } });
    });

    it('should redirect to assessments.resume', async function() {
      // when
      await controller.actions.improvmentCampaignParticipationResult.call(controller);

      // then
      sinon.assert.calledWith(controller.transitionToRoute, 'assessments.resume');
    });
  });
});
