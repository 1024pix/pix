import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import config from '../../../config/environment';
import { CREATED, FINALIZED } from 'pix-certif/models/session';

module('Unit | Model | session', function(hooks) {
  setupTest(hooks);

  module('#hasOneOrMoreCandidates', function() {

    test('it should return true if there is one or more candidate', function(assert) {
      const store = this.owner.lookup('service:store');
      const candidate = run(() => store.createRecord('certification-candidate', {
        firstName: 'Anne',
        lastName: 'So',
      }));
      const session = run(() => store.createRecord('session', {
        id: 123,
        certificationCandidates: [ candidate ],
      }));

      assert.equal(session.hasOneOrMoreCandidates, true);
    });

    test('it should return false if there is no candidate', function(assert) {
      const store = this.owner.lookup('service:store');
      const session = run(() => store.createRecord('session', { id: 123 }));

      assert.equal(session.hasOneOrMoreCandidates, false);
    });
  });

  module('#displayStatus', function() {

    test('it should return the correct displayName', function(assert) {
      const store = this.owner.lookup('service:store');
      const model1 = run(() => store.createRecord('session', {
        id: 123,
        status: CREATED,
      }));
      const model2 = run(() => store.createRecord('session', {
        id: 1234,
        status: FINALIZED,
      }));

      assert.equal(model1.displayStatus, 'Créée');
      assert.equal(model2.displayStatus, 'Finalisée');
    });
  });

  module('#urlToDownloadAttendanceSheet', function() {

    test('it should return the correct urlToUpload', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('session', { id: 1 }));

      assert.equal(model.urlToUpload, `${config.APP.API_HOST}/api/sessions/1/certification-candidates/import`);
    });

    test('it should return the correct urlToDownloadAttendanceSheet', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('session', { id: 1 }));
      model.session = { data: { authenticated: { access_token: '123' } } };

      assert.equal(model.urlToDownloadAttendanceSheet, `${config.APP.API_HOST}/api/sessions/1/attendance-sheet?accessToken=123`);
    });
  });
});
