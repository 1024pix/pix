import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | Training', function (hooks) {
  setupTest(hooks);

  module('#urlForQuery', function (hooks) {
    let adapter;

    hooks.beforeEach(function () {
      adapter = this.owner.lookup('adapter:training');
      adapter.ajax = sinon.stub().resolves();
    });

    test('should build the training url if userId is passed in query', async function (assert) {
      // given
      const query = {
        userId: 1,
      };

      // when
      const url = await adapter.urlForQuery(query, 'training');

      // then
      assert.true(url.endsWith('/api/users/1/trainings'));
    });

    test('should build the training url if userId is not in the query', async function (assert) {
      // given
      const query = {};

      // when
      const url = await adapter.urlForQuery(query, 'training');

      // then
      assert.true(url.endsWith('/api/trainings'));
    });
  });
});
