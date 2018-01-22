import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import EmberObject from '@ember/object';

describe('Unit | Route | Assessments.ResultsRoute', function() {

  setupTest('route:assessments.results', {
    needs: ['service:current-routed-modal']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  describe('#afterModel', function() {

    it('should redirect to homepage if assessment is a certification', function() {
      // given
      const route = this.subject();
      route.transitionTo = sinon.spy();

      const certification = EmberObject.create({ id: 123, isCertification: true });

      // when
      route.afterModel(certification);

      // then
      sinon.assert.calledWith(route.transitionTo, 'index');
    });

    it('should not redirect to homepage if assessment is not a certification', function() {
      // given
      const route = this.subject();
      route.transitionTo = sinon.spy();

      const certification = EmberObject.create({ id: 123, isCertification: false });

      // when
      route.afterModel(certification);

      // then
      sinon.assert.notCalled(route.transitionTo);
    });

  });

});
