import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | AdminMember', function (hooks) {
  setupTest(hooks);
  module('#urlForQueryRecord', function () {
    test('should return right url if the query url contains me', function (assert) {
      // when
      const query = { me: true };
      const adapter = this.owner.lookup('adapter:admin-member');
      const url = adapter.urlForQueryRecord(query);

      // then
      assert.ok(url.endsWith('/admin/admin-members/me'));
      assert.strictEqual(query.me, undefined);
    });
  });

  module('#urlForDeactivateMember', function () {
    test('should build url to deactivate admin member', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:admin-member');
      const url = adapter.urlForDeactivateMember(1001);

      // then
      assert.ok(url.endsWith('admin-members/1001/deactivate'));
    });
  });

  module('#urlForUpdateRole', function () {
    test('should build url to update role of admin member', function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:admin-member');
      const url = adapter.urlForUpdateRole(1001);

      // then
      assert.ok(url.endsWith('admin-members/1001'));
    });
  });

  module('#updateRecord', function () {
    test('it should trigger an ajax call to update the admin-member about to be deactivated', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:admin-member');
      sinon.stub(adapter, 'urlForDeactivateMember').returns('https://example.net/api/admin-members/123/deactivate');
      sinon.stub(adapter, 'ajax');
      const store = Symbol();

      // when
      await adapter.updateRecord(
        store,
        { modelName: 'admin-member' },
        {
          id: 123,
          adapterOptions: { method: 'deactivate' },
        },
      );

      // then
      assert.ok(adapter.ajax.calledWith('https://example.net/api/admin-members/123/deactivate', 'PUT'));
    });
    test('it should trigger an ajax call to update the role of the admin-member', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:admin-member');
      sinon.stub(adapter, 'urlForUpdateRole').returns('https://example.net/api/admin-members/123');
      sinon.stub(adapter, 'ajax');
      const store = Symbol();
      const snapshot = {
        id: 123,
        adapterOptions: { method: 'updateRole' },
        serialize: sinon.stub().returns({
          data: {
            attributes: {
              role: 'CERTIF',
            },
          },
        }),
      };

      // when
      await adapter.updateRecord(store, { modelName: 'admin-member' }, snapshot);

      // then
      assert.ok(adapter.ajax.calledWith('https://example.net/api/admin-members/123', 'PATCH'));
    });
  });
});
