import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | join-when-authenticated', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:join-when-authenticated');
    assert.ok(route);
  });
});
