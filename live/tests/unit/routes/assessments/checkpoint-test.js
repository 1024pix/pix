import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import sinon from 'sinon';

describe('Unit | Route | assessments | Checkpoint', function() {
  setupTest('route:assessments.checkpoint', {
    needs: ['service:current-routed-modal', 'service:session']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  describe('#resumeAssessment', function() {

    let route;

    beforeEach(function() {
      route = this.subject();
      route.transitionTo = sinon.stub();
    });

    it('should not create a new answer', function() {
      // given
      const assessment = EmberObject.create({ id: 12, answers: [] });

      // when
      route.actions.resumeAssessment.call(route, assessment);

      // then
      sinon.assert.calledOnce(route.transitionTo);
      sinon.assert.calledWith(route.transitionTo, 'assessments.resume', 12);
    });
  });
});
