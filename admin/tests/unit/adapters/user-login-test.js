import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | user-login', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:user-login');
    sinon.stub(adapter, 'ajax');
  });

  hooks.afterEach(function () {
    adapter.ajax.restore();
  });

  module('#urlForUpdateRecord', function () {
    test('should add /admin inside the default update record url', function (assert) {
      // when
      const url = adapter.urlForUpdateRecord(123);

      // then
      assert.ok(url.endsWith('/admin/users/123'));
    });
  });

  module('#updateRecord', function () {
    module('when unblockUserAccount adapterOptions is passed', function () {
      test('should send a PUT request to user unblock user account endpoint', async function (assert) {
        // given
        const adapterOptions = { unblockUserAccount: true, userId: 123 };

        // when
        await adapter.updateRecord(null, { modelName: 'user-login' }, { adapterOptions });

        // then
        sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/admin/users/123/unblock', 'PUT');
        assert.ok(adapter);
      });
    });
  });
});
