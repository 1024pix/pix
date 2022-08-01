import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

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
