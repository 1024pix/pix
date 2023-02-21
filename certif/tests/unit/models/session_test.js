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

      this.owner.register('service:session', SessionStub);

      // when/then
      assert.strictEqual(
        model.urlToDownloadSupervisorKitPdf,
        `${config.APP.API_HOST}/api/sessions/1/supervisor-kit?accessToken=123`
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

      const model = store.createRecord('session', { id: 1 });
      this.owner.register('service:session', SessionStub);

      // when/then
      assert.strictEqual(
        model.urlToDownloadAttendanceSheet,
        `${config.APP.API_HOST}/api/sessions/1/attendance-sheet?accessToken=123`
      );
    });
  });

  module('#urlToDownloadSessionIssueReportSheet', function () {
    test('it should return the correct urlToDownloadSessionIssueReportSheet', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      class SessionStub extends Service {
        data = {
          authenticated: {
            access_token: '123',
          },
        };
      }

      const model = store.createRecord('session', { id: 1 });
      this.owner.register('service:session', SessionStub);

      // when/then
      assert.strictEqual(model.urlToDownloadSessionIssueReportSheet, config.urlToDownloadSessionIssueReportSheet);
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
    module('when FT_CLEA_RESULTS_RETRIEVAL_BY_HABILITATED_CERTIFICATION_CENTERS is enabled', function () {
      module('when session has any acquired Clea result', function () {
        test('it should return true', function (assert) {
          // given
          class FeatureTogglesStub extends Service {
            featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true };
          }
          this.owner.register('service:featureToggles', FeatureTogglesStub);
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
          class FeatureTogglesStub extends Service {
            featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true };
          }
          this.owner.register('service:featureToggles', FeatureTogglesStub);
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

    module('when FT_CLEA_RESULTS_RETRIEVAL_BY_HABILITATED_CERTIFICATION_CENTERS is not enabled', function () {
      test('it should return false', function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: false };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
        const store = this.owner.lookup('service:store');
        const model = store.createRecord('session', {
          id: 123,
          status: CREATED,
          publishedAt: '2022-01-01',
          hasSomeCleaAcquired: true,
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
