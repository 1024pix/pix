import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import EmberObject from '@ember/object';

describe('Unit | Route | Assessments | Results', function() {

  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:assessments.results');
    expect(route).to.be.ok;
  });

  describe('#afterModel', function() {

    it('should redirect to homepage if assessment is a certification', function() {
      // given
      const route = this.owner.lookup('route:assessments.results');
      route.transitionTo = sinon.spy();

      const assessment = EmberObject.create({ id: 123, isCertification: true });

      // when
      route.afterModel(assessment);

      // then
      sinon.assert.calledWith(route.transitionTo, 'index');
    });

    it('should not redirect to homepage if assessment is not a certification', function() {
      // given
      const route = this.owner.lookup('route:assessments.results');
      route.transitionTo = sinon.spy();

      const assessment = EmberObject.create({ id: 123, isCertification: false, answers: [] });

      // when
      route.afterModel(assessment);

      // then
      sinon.assert.notCalled(route.transitionTo);
    });

  });

});
