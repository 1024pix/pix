import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | ImportFiles', function (hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:import-files');
    adapter.ajax = sinon.stub();
  });

  module('#importCampaignsToArchive', function () {
    test('should build importCampaignsToArchive url', async function (assert) {
      // when
      await adapter.importCampaignsToArchive([Symbol()]);

      // then
      assert.ok(adapter.ajax.calledWith('http://localhost:3000/api/admin/campaigns/archive-campaigns', 'POST'));
    });
  });

  module('#updateOrganizationImportFormat', function () {
    test('should build updateOrganizationImportFormat url', async function (assert) {
      // when
      await adapter.updateOrganizationImportFormat([Symbol()]);

      // then
      assert.ok(adapter.ajax.calledWith('http://localhost:3000/api/admin/import-organization-learners-format', 'POST'));
    });
  });

  module('#addCampaignsCsv', function () {
    test('should build addCampaignsCsv url', async function (assert) {
      // when
      await adapter.addCampaignsCsv([Symbol()]);

      // then
      assert.ok(adapter.ajax.calledWith('http://localhost:3000/api/admin/campaigns', 'POST'));
    });
  });
});
