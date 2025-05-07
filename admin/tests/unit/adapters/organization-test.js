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

  module('#attachTargetProfile', function () {
    test('should trigger an ajax call with the right url, method and payload', async function (assert) {
      // given
      const organizationId = 1;
      const expectedPayload = {
        data: { 'target-profile-ids': ['123', '456'] },
      };
      const expectedUrl = `http://localhost:3000/api/admin/organizations/${organizationId}/attach-target-profiles`;

      // when
      await adapter.attachTargetProfile({ organizationId, targetProfileIds: ['123', '456'] });

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST', expectedPayload);
      assert.ok(true);
    });
  });

  module('#attachChildOrganization', function () {
    test('sends an HTTP POST request', async function (assert) {
      // given
      const childOrganizationIds = '123,456';
      const parentOrganizationId = 2;

      // when
      await adapter.attachChildOrganization({ childOrganizationIds, parentOrganizationId });

      // then
      assert.true(
        adapter.ajax.calledOnceWithExactly(
          'http://localhost:3000/api/admin/organizations/2/attach-child-organization',
          'POST',
          { data: { childOrganizationIds } },
        ),
      );
    });
  });

  module('#archiveOrganizations', function () {
    test('should not call ajax if files is empty', async function (assert) {
      // given
      const files = [];

      // when
      await adapter.archiveOrganizations(files);

      // then
      assert.notOk(adapter.ajax.called);
    });

    test('should call ajax with the correct URL and method', async function (assert) {
      // given
      const files = ['file1', 'file2'];
      const expectedUrl = `${ENV.APP.API_HOST}/api/admin/organizations/batch-archive`;

      // when
      await adapter.archiveOrganizations(files);

      // then
      assert.ok(adapter.ajax.calledWith(expectedUrl, 'POST'));
    });
  });
});
