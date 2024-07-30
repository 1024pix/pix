import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Assessments | Results', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:assessments.results');
    assert.ok(route);
  });

  module('#afterModel', function () {
    test('should redirect to homepage if assessment is a certification', function (assert) {
      // given
      const route = this.owner.lookup('route:assessments.results');
      route.router = { transitionTo: sinon.spy() };

      const assessment = EmberObject.create({ id: 123, isCertification: true });

      // when
      route.afterModel(assessment);

      // then
      sinon.assert.calledWith(route.router.transitionTo, 'authenticated');
      assert.ok(true);
    });

    test('should not redirect to homepage if assessment is not a certification', function (assert) {
      // given
      const route = this.owner.lookup('route:assessments.results');
      route.router = { transitionTo: sinon.spy() };

      const assessment = EmberObject.create({ id: 123, isCertification: false, answers: [] });

      // when
      route.afterModel(assessment);

      // then
      sinon.assert.notCalled(route.router.transitionTo);
      assert.ok(true);
    });
  });
});
