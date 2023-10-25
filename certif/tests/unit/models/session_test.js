import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from '../../../config/environment';
import Service from '@ember/service';
import { CREATED } from 'pix-certif/models/session';

module('Unit | Model | session', function (hooks) {
  setupTest(hooks);

  module('#urlToDownloadSupervisorKitPdf', function () {
    test('it should return the correct urlToDownloadSupervisorKitPdf', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('session', { id: 1 });
      class SessionStub extends Service {
        data = {
          authenticated: {
            access_token: '123',
          },
        };
      }

      class IntlStub extends Service {
        locale = ['dk'];
      }

      this.owner.register('service:session', SessionStub);
      this.owner.register('service:intl', IntlStub);

      // when/then
      assert.strictEqual(
        model.urlToDownloadSupervisorKitPdf,
        `${config.APP.API_HOST}/api/sessions/1/supervisor-kit?accessToken=123&lang=dk`,
      );
    });
  });

  module('#urlToUpload', function () {
    test('it should return the correct urlToUpload', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('session', { id: 1 });

      // when/then
      assert.strictEqual(model.urlToUpload, `${config.APP.API_HOST}/api/sessions/1/certification-candidates/import`);
    });
  });

  module('#urlToDownloadAttendanceSheet', function () {
    test('it should return the correct urlToDownloadAttendanceSheet', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      class SessionStub extends Service {
        data = {
          authenticated: {
            access_token: '123',
          },
        };
      }
      class IntlStub extends Service {
        locale = ['pt'];
      }

      const model = store.createRecord('session', { id: 1 });
      this.owner.register('service:session', SessionStub);
      this.owner.register('service:intl', IntlStub);

      // when/then
      assert.strictEqual(
        model.urlToDownloadAttendanceSheet,
        `${config.APP.API_HOST}/api/sessions/1/attendance-sheet?accessToken=123&lang=pt`,
      );
    });
  });

  module('#urlToDownloadCandidatesImportTemplate', function () {
    test('it should return the correct urlToDownloadCandidatesImportTemplate', function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      class SessionStub extends Service {
        data = {
          authenticated: {
            access_token: '123',
          },
        };
      }
      class IntlStub extends Service {
        locale = ['dk'];
      }

      const model = store.createRecord('session', { id: 1 });
      this.owner.register('service:session', SessionStub);
      this.owner.register('service:intl', IntlStub);

      // when/then
      assert.strictEqual(
        model.urlToDownloadCandidatesImportTemplate,
        `${config.APP.API_HOST}/api/sessions/1/candidates-import-sheet?accessToken=123&lang=dk`,
      );
    });
  });

  module('#uncompletedCertificationReports', function () {
    test('it should return the uncomplete certification reports', function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const model = _createTwoCompleteAndOneUncompleteCertificationReports(store);

      // when/then
      assert.strictEqual(model.uncompletedCertificationReports.length, 1);
      assert.notPropEqual(model.uncompletedCertificationReports[0].id, 1);
    });
  });

  module('#completedCertificationReports', function () {
    test('it should return the complete certification reports', function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const model = _createTwoCompleteAndOneUncompleteCertificationReports(store);

      // when/then
      assert.strictEqual(model.completedCertificationReports.length, 2);
      assert.notPropEqual(model.completedCertificationReports[0].id, 2);
      assert.notPropEqual(model.completedCertificationReports[1].id, 3);
    });
  });

  module('#shouldDisplayCleaResultDownloadSection', function () {
    module('when session has any acquired Clea result', function () {
      test('it should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('session', {
          id: 123,
          status: CREATED,
          publishedAt: '2022-01-01',
          hasSomeCleaAcquired: true,
        });

        // when/then
        assert.true(model.shouldDisplayCleaResultDownloadSection);
      });
    });

    module('when session has no acquired Clea result', function () {
      test('it should return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('session', {
          id: 123,
          status: CREATED,
          publishedAt: '2022-01-01',
          hasSomeCleaAcquired: false,
        });

        // when/then
        assert.false(model.shouldDisplayCleaResultDownloadSection);
      });
    });
  });
});

function _createTwoCompleteAndOneUncompleteCertificationReports(store) {
  return store.createRecord('session', {
    id: 1,
    certificationReports: [
      store.createRecord('certification-report', { id: 1, isCompleted: false }),
      store.createRecord('certification-report', { id: 2, isCompleted: true }),
      store.createRecord('certification-report', { id: 3, isCompleted: true }),
    ],
  });
}
