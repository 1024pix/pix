import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | challenges-preview', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:challenge-preview');
    assert.ok(route);
  });
});
