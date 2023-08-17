import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | Target-profile ', function (hooks) {
  setupTest(hooks);
  let adapter;
  const organizationToDetachId = 2;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:target-profile');
    sinon
      .stub(adapter, 'ajax')
      .resolves({ data: { attributes: { 'detached-organization-ids': [organizationToDetachId] } } });
  });

  module('#detachOrganizations', function () {
    test('should trigger an ajax call with the right url, method and payload', async function (assert) {
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
});
