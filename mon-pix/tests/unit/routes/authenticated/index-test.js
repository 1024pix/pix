import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/index', function (hooks) {
  setupTest(hooks);

  test('should redirect to user-dashboard', function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/index');
    const router = this.owner.lookup('service:router');
    router.replaceWith = sinon.stub();

    // when
    route.redirect();

    // then
    sinon.assert.calledWith(router.replaceWith, 'authenticated.user-dashboard');
    assert.ok(true);
  });
});
