import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | Tutorial', function (hooks) {
  setupTest(hooks);

  module('#urlForQuery', function (hooks) {
    let adapter;

    hooks.beforeEach(function () {
      adapter = this.owner.lookup('adapter:tutorial');
      adapter.ajax = sinon.stub().resolves();
    });

    test('should build the tutorial url if no type in query', async function (assert) {
      // when
      const query = {};
      const url = await adapter.urlForQuery(query, 'tutorial');

      // then
      assert.true(url.endsWith('/tutorials'));
    });

    test('should build the tutorial type url', async function (assert) {
      // when
      const query = { userId: '123' };
      const url = await adapter.urlForQuery(query, 'tutorial');

      // then
      assert.true(url.endsWith('users/123/tutorials'));
    });
  });
});
