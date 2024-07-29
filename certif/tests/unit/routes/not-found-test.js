import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | not-found', function (hooks) {
  setupTest(hooks);

  test('should redirect to application route', function (assert) {
    assert.expect(1);
    const route = this.owner.lookup('route:not-found');
    const expectedRedirection = 'application';

    sinon.stub(route.router, 'transitionTo');
    route.router.transitionTo.resolves();

    route.afterModel();

    assert.ok(route.router.transitionTo.calledWith(expectedRedirection));
  });
});
