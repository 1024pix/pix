import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import catchErr from '../../helpers/catch-err';
import ENV from 'pix-orga/config/environment';

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
        adapter.ajax.calledWith('http://localhost:3000/api/organizations/1/schooling-registrations/import-csv', 'POST')
      );
    });
  });

  module('#replaceStudentsCsv', function () {
    test('should build replaceStudentsCsv url from organizationId', async function (assert) {
      // when
      await adapter.replaceStudentsCsv(1, [Symbol()]);

      // then
      assert.ok(
        adapter.ajax.calledWith('http://localhost:3000/api/organizations/1/schooling-registrations/replace-csv', 'POST')
      );
    });
  });

  module('#importStudentsSiecle', function () {
    const zipFile = new File([''], 'archive.zip', { type: 'application/zip' });
    const csvFile = new File([''], 'file.csv', { type: 'text/csv' });
    const csvTextFile = new File([''], 'file.csv', { type: 'text/plain' });
    const acceptedFormatName = 'csv';
    const acceptedFormatMimeTypes = ['text/plain', 'csv'];

    test('should throw an error if format is not handled', async function (assert) {
      const error = await catchErr(adapter.importStudentsSiecle)(
        1,
        [zipFile],
        acceptedFormatName,
        acceptedFormatMimeTypes
      );
      sinon.assert.notCalled(adapter.ajax);
      assert.equal(error.message, ENV.APP.ERRORS.FILE_UPLOAD.FORMAT_NOT_SUPPORTED_ERROR);
    });

    test('should build importStudentsSiecle url from organizationId and mime type containing "csv"', async function (assert) {
      // when
      await adapter.importStudentsSiecle(1, [csvFile], acceptedFormatName, acceptedFormatMimeTypes);

      // then
      assert.ok(
        adapter.ajax.calledWith(
          'http://localhost:3000/api/organizations/1/schooling-registrations/import-siecle?format=csv',
          'POST'
        )
      );
    });

    test('should build importStudentsSiecle url from organizationId and "text/plain" mime type', async function (assert) {
      // when
      await adapter.importStudentsSiecle(1, [csvTextFile], acceptedFormatName, acceptedFormatMimeTypes);

      // then
      assert.ok(
        adapter.ajax.calledWith(
          'http://localhost:3000/api/organizations/1/schooling-registrations/import-siecle?format=csv',
          'POST'
        )
      );
    });
  });
});
