import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapters | external-user', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:external-user');
  });

  module('#urlForCreateRecord', function () {
    test('should redirect to /api/schooling-registration-dependent-users/external-user-token', async function (assert) {
      // when
      const url = await adapter.urlForCreateRecord();

      // then
      assert.true(url.endsWith('/schooling-registration-dependent-users/external-user-token'));
    });
  });
});
