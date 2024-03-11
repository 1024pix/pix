import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | authenticated/team/new', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:authenticated/team/new');
    assert.ok(route);
  });
});
