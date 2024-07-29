import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | dependent-user', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:dependent-user');
  });

  module('#urlForCreateRecord', function () {
    test('should redirect to /api/sco-organization-learners/dependent', async function (assert) {
      // when
      const url = await adapter.urlForCreateRecord();

      // then
      assert.true(url.endsWith('/sco-organization-learners/dependent'));
    });
  });
});
