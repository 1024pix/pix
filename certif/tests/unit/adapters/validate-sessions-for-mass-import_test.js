import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapters | Validate Sessions For Mass Import', function (hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:validate-sessions-for-mass-import');
    adapter.ajax = sinon.stub();
  });

  module('#validateSessionsForMassImport', function () {
    test('should validate the sessions data for mass import', async function (assert) {
      // when
      await adapter.validateSessionsForMassImport(Symbol(), 1);

      // then
      assert.ok(
        adapter.ajax.calledWith(
          'http://localhost:3000/api/certification-centers/1/sessions/validate-for-mass-import',
          'POST'
        )
      );
    });
  });
});
