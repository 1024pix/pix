import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import config from '../../../config/environment';

module('Unit | Model | sessionEnrolment', function (hooks) {
  setupTest(hooks);

  module('#urlToUpload', function () {
    test('it should return the correct urlToUpload', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('session-enrolment', { id: 1 });

      // when/then
      assert.strictEqual(model.urlToUpload, `${config.APP.API_HOST}/api/sessions/1/certification-candidates/import`);
    });
  });

  module('#urlToDownloadAttendanceSheet', function () {
    test('it should return the correct urlToDownloadAttendanceSheet', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('session-enrolment', { id: 1 });

      // when/then
      assert.strictEqual(model.urlToDownloadAttendanceSheet, `${config.APP.API_HOST}/api/sessions/1/attendance-sheet`);
    });
  });

  module('#urlToDownloadCandidatesImportTemplate', function () {
    test('it should return the correct urlToDownloadCandidatesImportTemplate', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('session-enrolment', { id: 1 });

      // when/then
      assert.strictEqual(
        model.urlToDownloadCandidatesImportTemplate,
        `${config.APP.API_HOST}/api/sessions/1/candidates-import-sheet`,
      );
    });
  });
});
