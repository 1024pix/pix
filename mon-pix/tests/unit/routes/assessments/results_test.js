import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import EmberObject from '@ember/object';

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
      assert.expect(0);
      sinon.assert.calledWith(route.router.transitionTo, 'index');
    });

    test('should not redirect to homepage if assessment is not a certification', function (assert) {
      // given
      const route = this.owner.lookup('route:assessments.results');
      route.router = { transitionTo: sinon.spy() };

      const assessment = EmberObject.create({ id: 123, isCertification: false, answers: [] });

      // when
      route.afterModel(assessment);

      // then
      assert.expect(0);
      sinon.assert.notCalled(route.router.transitionTo);
    });
  });
});
