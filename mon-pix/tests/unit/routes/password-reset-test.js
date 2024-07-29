import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | password reset', function (hooks) {
  setupTest(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:password-reset-demand');
  });

  test('exists', function (assert) {
    assert.ok(route);
  });
});
