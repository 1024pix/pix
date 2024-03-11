import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | Students import', function (hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:students-import');
    adapter.ajax = sinon.stub();
  });

  module('#addStudentsCsv', function () {
    test('should build addStudentsCsv url from organizationId', async function (assert) {
      // when
      await adapter.addStudentsCsv(1, [Symbol()]);

      // then
      assert.ok(
        adapter.ajax.calledWith(
          'http://localhost:3000/api/organizations/1/sup-organization-learners/import-csv',
          'POST',
        ),
      );
    });
  });

  module('#replaceStudentsCsv', function () {
    test('should build replaceStudentsCsv url from organizationId', async function (assert) {
      // when
      await adapter.replaceStudentsCsv(1, [Symbol()]);

      // then
      assert.ok(
        adapter.ajax.calledWith(
          'http://localhost:3000/api/organizations/1/sup-organization-learners/replace-csv',
          'POST',
        ),
      );
    });
  });

  module('#importStudentsSiecle', function () {
    test('should build importStudentsSiecle url from organizationId and format', async function (assert) {
      // when
      await adapter.importStudentsSiecle(1, [Symbol()], 'csv');

      // then
      assert.ok(
        adapter.ajax.calledWith(
          'http://localhost:3000/api/organizations/1/sco-organization-learners/import-siecle?format=csv',
          'POST',
        ),
      );
    });
  });
});
