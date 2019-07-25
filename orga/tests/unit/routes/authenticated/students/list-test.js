import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | authenticated/students/list', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:authenticated/students/list');
    assert.ok(route);
  });
});
