import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | session-for-supervising', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:session-for-supervising');
    const ajaxStub = async () => {};
    adapter.ajax = ajaxStub;
  });

  module('#urlForQueryRecord', function () {
    // given
    test('should build url from sessionId', async function (assert) {
      // when
      const query = { sessionId: 1234 };
      const url = await adapter.urlForQueryRecord(query);

      // then
      assert.true(url.endsWith('/sessions/1234/supervising'));
    });
  });
});
