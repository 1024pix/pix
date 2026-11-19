import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

// FileList has no public constructor; DataTransfer exposes a real one through its `files` property.
const createFileList = (...files) => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  return dataTransfer.files;
};

module('Unit | Adapters | organization learners import', function (hooks) {
  setupTest(hooks);

  let adapter;
  const organizationId = 1;
  const file = new File(['firstName;lastName'], 'learners.csv', { type: 'text/csv' });

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-learners-import');
    adapter.ajax = sinon.stub();
  });

  module('#addStudentsCsv', function () {
    test('should POST the first file to the sup import-csv endpoint', async function (assert) {
      // when
      await adapter.addStudentsCsv(organizationId, createFileList(file));

      // then
      assert.ok(
        adapter.ajax.calledWithExactly(
          'http://localhost:3000/api/organizations/1/sup-organization-learners/import-csv',
          'POST',
          { data: file },
        ),
      );
    });
  });

  module('#replaceStudentsCsv', function () {
    test('should POST the first file to the sup replace-csv endpoint', async function (assert) {
      // when
      await adapter.replaceStudentsCsv(organizationId, createFileList(file));

      // then
      assert.ok(
        adapter.ajax.calledWithExactly(
          'http://localhost:3000/api/organizations/1/sup-organization-learners/replace-csv',
          'POST',
          { data: file },
        ),
      );
    });
  });

  module('#importStudentsSiecle', function () {
    test('should POST the first file to the sco import-siecle endpoint with the format', async function (assert) {
      // when
      await adapter.importStudentsSiecle(organizationId, createFileList(file), 'csv');

      // then
      assert.ok(
        adapter.ajax.calledWithExactly(
          'http://localhost:3000/api/organizations/1/sco-organization-learners/import-siecle?format=csv',
          'POST',
          { data: file },
        ),
      );
    });
  });

  module('#importOrganizationLearners', function () {
    test('should not call the api when the file list is empty', async function (assert) {
      // when
      await adapter.importOrganizationLearners(organizationId, createFileList());

      // then
      assert.ok(adapter.ajax.notCalled);
    });

    test('should POST the first file to the generic import endpoint', async function (assert) {
      // when
      await adapter.importOrganizationLearners(organizationId, createFileList(file));

      // then
      assert.ok(
        adapter.ajax.calledWithExactly(
          'http://localhost:3000/api/organizations/1/import-organization-learners',
          'POST',
          { data: file },
        ),
      );
    });
  });
});
