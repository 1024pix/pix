import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | ImportFiles', function (hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:import-files');
    adapter.ajax = sinon.stub();
  });

  module('#importCampaignsToArchive', function () {
    test('should build importCampaignsToArchive url from organizationId', async function (assert) {
      // when
      await adapter.importCampaignsToArchive([Symbol()]);

      // then
      assert.ok(adapter.ajax.calledWith('http://localhost:3000/api/admin/campaigns/archive-campaigns', 'POST'));
    });
  });
});
