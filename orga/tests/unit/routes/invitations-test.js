import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | invitations', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:invitations');
    assert.ok(route);
  });
});
