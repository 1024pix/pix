import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | authenticated/campaigns/list/all-campaigns', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:authenticated/campaigns/list/all-campaigns');
    assert.ok(route);
  });
});
