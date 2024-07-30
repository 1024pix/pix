import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | organization', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization');
    sinon.stub(adapter, 'ajax').resolves();
  });

  hooks.afterEach(function () {
    adapter.ajax.restore();
  });

  module('#findHasMany', function () {
    test('should build url with query params when type is organization-membership', async function (assert) {
      // given
      const snapshot = { modelName: 'organization', id: '1', adapterOptions: { 'page[size]': 2 } };
      const relationship = { type: 'organization-membership' };
      const url = '/api/organizations/1/memberships';

      // when
      await adapter.findHasMany({}, snapshot, url, relationship);

      // then
      assert.ok(
        adapter.ajax.calledWith(`${ENV.APP.API_HOST}/api/admin/organizations/1/memberships?page%5Bsize%5D=2`, 'GET'),
      );
    });

    test('should build url without query params when type is not membership', async function (assert) {
      // given
      const snapshot = { modelName: 'organization', id: '1', adapterOptions: { 'page[size]': 2 } };
      const relationship = { type: 'target-profile' };
      const url = '/api/organizations/1/target-profiles';

      // when
      await adapter.findHasMany({}, snapshot, url, relationship);

      // then
      assert.ok(adapter.ajax.calledWith(`${ENV.APP.API_HOST}/api/organizations/1/target-profiles`, 'GET'));
    });
  });

  module('#attachChildOrganization', function () {
    test('sends an HTTP POST request', async function (assert) {
      // given
      const childOrganizationId = 123;
      const parentOrganizationId = 2;

      // when
      await adapter.attachChildOrganization({ childOrganizationId, parentOrganizationId });

      // then
      assert.true(
        adapter.ajax.calledOnceWithExactly(
          'http://localhost:3000/api/admin/organizations/2/attach-child-organization',
          'POST',
          { data: { childOrganizationId } },
        ),
      );
    });
  });
});
