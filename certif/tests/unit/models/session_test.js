import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import config from '../../../config/environment';
import { CREATED, FINALIZED } from 'pix-certif/models/session';

module('Unit | Model | session', function(hooks) {
  setupTest(hooks);

  module('#displayStatus', function() {

    test('it should return the correct displayName', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model1 = run(() => store.createRecord('session', {
        id: 123,
        status: CREATED,
      }));
      const model2 = run(() => store.createRecord('session', {
        id: 1234,
        status: FINALIZED,
      }));

      // when/then
      assert.equal(model1.displayStatus, 'Créée');
      assert.equal(model2.displayStatus, 'Finalisée');
    });
  });

  module('#urlToUpload', function() {
    test('it should return the correct urlToUpload', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('session', { id: 1 }));

      // when/then
      assert.equal(model.urlToUpload, `${config.APP.API_HOST}/api/sessions/1/certification-candidates/import`);
    });
  });

  module('#urlToDownloadAttendanceSheet', function() {
    test('it should return the correct urlToDownloadAttendanceSheet', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('session', { id: 1 }));
      model.session = { data: { authenticated: { access_token: '123' } } };

      // when/then
      assert.equal(model.urlToDownloadAttendanceSheet, `${config.APP.API_HOST}/api/sessions/1/attendance-sheet?accessToken=123`);
    });
  });

  module('#urlToDownloadSessionIssueReportSheet', function() {
    test('it should return the correct urlToDownloadSessionIssueReportSheet', function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('session', { id: 1 }));
      model.session = { data: { authenticated: { access_token: '123' } } };

      // when/then
      assert.equal(model.urlToDownloadSessionIssueReportSheet, config.urlToDownloadSessionIssueReportSheet);
    });
  });
});
