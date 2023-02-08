import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapters | Sessions Import', function (hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:sessions-import');
    adapter.ajax = sinon.stub();
  });

  module('#importSessions', function () {
    test('should build addStudentsCsv url from organizationId', async function (assert) {
      // when
      await adapter.importSessions(Symbol(), 1);

      // then
      assert.ok(adapter.ajax.calledWith('http://localhost:3000/api/certification-centers/1/sessions/import', 'POST'));
    });
  });
});
