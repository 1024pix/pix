import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | authenticated/organization-learners/index', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:authenticated/organization-learners/index');
    assert.ok(route);
  });
});
