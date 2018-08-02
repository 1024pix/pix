import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import sinon from 'sinon';

describe('Unit | Controller | Assessments | Checkpoint', function() {
  setupTest('controller:assessments/checkpoint', {
    needs: ['service:current-routed-modal']
  });

  describe('#finalCheckpoint', () => {
    it('should equal false by default', function() {
      // when
      const controller = this.subject();

      // then
      expect(controller.get('finalCheckpoint')).to.be.false;
    });
  });

  describe('#resumeAssessment', function() {
    let controller;

    beforeEach(function() {
      controller = this.subject();
      controller.transitionToRoute = sinon.stub();
    });

    context('when there a more challenge', () => {
      it('should redirect to next challenge', function() {
        // given
        const assessment = EmberObject.create({ id: 12, answers: [] });
        controller.set('finalCheckpoint', false);

        // when
        controller.actions.resumeAssessment.call(controller, assessment);

        // then
        sinon.assert.calledOnce(controller.transitionToRoute);
        sinon.assert.calledWith(controller.transitionToRoute, 'assessments.resume', assessment.get('id'));
      });
    });

    context('when it is the final checkpoint', () => {
      it('should redirect to the campaign last screen with the skill review', function() {
        // given
        const assessment = EmberObject.create({ id: 12, answers: [] });
        controller.set('finalCheckpoint', true);

        // when
        controller.actions.resumeAssessment.call(controller, assessment);

        // then
        sinon.assert.calledOnce(controller.transitionToRoute);
        sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.skill-review', assessment.get('id'));
      });
    });
  });
});
