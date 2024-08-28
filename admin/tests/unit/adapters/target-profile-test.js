import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | Target-profile ', function (hooks) {
  setupTest(hooks);
  let adapter;
  const organizationToDetachId = 2;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:target-profile');
  });

  module('#detachOrganizations', function () {
    test('should trigger an ajax call with the right url, method and payload', async function (assert) {
      sinon
        .stub(adapter, 'ajax')
        .resolves({ data: { attributes: { 'detached-organization-ids': [organizationToDetachId] } } });
      // given
      const targetProfileId = 1;

      const expectedPayload = {
        data: { data: { attributes: { 'organization-ids': organizationToDetachId } } },
      };
      const expectedUrl = `http://localhost:3000/api/admin/target-profiles/${targetProfileId}/detach-organizations`;

      // when
      const result = await adapter.detachOrganizations(targetProfileId, organizationToDetachId);

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'DELETE', expectedPayload);
      assert.deepEqual(result, [organizationToDetachId]);
    });
  });

  module('#attachOrganizations', function () {
    test('should trigger an ajax call with the right url, method and payload', async function (assert) {
      // given
      const organizationIds = [1, 2];
      sinon.stub(adapter, 'ajax').resolves({ data: { 'organization-ids': organizationIds } });
      const targetProfileId = 1;

      const expectedPayload = {
        data: { 'organization-ids': organizationIds },
      };
      const expectedUrl = `http://localhost:3000/api/admin/target-profiles/${targetProfileId}/attach-organizations`;

      // when
      await adapter.attachOrganizations({ targetProfileId, organizationIds });

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST', expectedPayload);
      assert.ok(true);
    });
  });

  module('#attachOrganizationsFromExistingTargetProfile', function () {
    test('should trigger an ajax call with the right url, method and payload', async function (assert) {
      // given
      sinon.stub(adapter, 'ajax').resolves();
      const targetProfileId = 1;
      const targetProfileIdToCopy = 2;

      const expectedPayload = {
        data: { 'target-profile-id': targetProfileIdToCopy },
      };
      const expectedUrl = `http://localhost:3000/api/admin/target-profiles/${targetProfileId}/copy-organizations`;

      // when
      await adapter.attachOrganizationsFromExistingTargetProfile({ targetProfileId, targetProfileIdToCopy });

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST', expectedPayload);
      assert.ok(true);
    });
  });

  module('#outdate', function () {
    test('should trigger an ajax call with the right url and method', async function (assert) {
      // given
      const targetProfileId = 1;
      sinon.stub(adapter, 'ajax').resolves();
      const expectedUrl = `http://localhost:3000/api/admin/target-profiles/${targetProfileId}/outdate`;

      // when
      await adapter.outdate(targetProfileId);

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'PUT');
      assert.ok(true);
    });
  });

  module('#copy', function () {
    test('should trigger an ajax call with the right url and method', async function (assert) {
      // given
      const targetProfileId = 1;
      sinon.stub(adapter, 'ajax').resolves();
      const expectedUrl = `http://localhost:3000/api/admin/target-profiles/${targetProfileId}/copy`;

      // when
      await adapter.copy(targetProfileId);

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST');
      assert.ok(true);
    });
  });
});
