import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | account-recovery | find-sco-record', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:account-recovery/find-sco-record');
    assert.ok(route);
  });
});
