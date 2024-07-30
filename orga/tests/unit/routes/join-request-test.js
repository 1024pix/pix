import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | join-request', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:join-request');
    assert.ok(route);
  });
});
