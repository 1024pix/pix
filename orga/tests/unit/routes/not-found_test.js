import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | not-found', function (hooks) {
  setupTest(hooks);

  test('should redirect to application route', function (assert) {
    // given
    const expectedRedirection = 'application';
    const route = this.owner.lookup('route:not-found');

    sinon.stub(route.router, 'transitionTo');
    route.router.transitionTo.resolves();

    // when
    route.afterModel();

    // then
    assert.ok(route.router.transitionTo.calledWith(expectedRedirection));
  });
});
