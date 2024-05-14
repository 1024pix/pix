import { setupTest } from 'ember-qunit';
import ENV from 'pix-certif/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | session', function (hooks) {
  setupTest(hooks);

  let adapter;
  let store;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:session-management');
    store = this.owner.lookup('service:store');
  });

  module('#urlForFindRecord', () => {
    test('should build find url from session id', async function (assert) {
      // when
      const url = await adapter.urlForFindRecord(123, 'session-management');

      assert.ok(url.endsWith('/sessions/123/management'));
    });

    test('should build specific url to finalization', async function (assert) {
      // when
      const options = { adapterOptions: { finalization: true } };
      const url = await adapter.urlForUpdateRecord(123, 'session-management', options);

      // then
      assert.ok(url.endsWith('/sessions/123/finalization'));
    });
  });
  module('#urlForUpdateRecord', () => {
    test('should build update url from session id', async function (assert) {
      // when
      const options = { adapterOptions: {} };
      const url = await adapter.urlForUpdateRecord(123, 'session', options);

      assert.ok(url.endsWith('/sessions/123'));
    });

    test('should build specific url to finalization', async function (assert) {
      // when
      const options = { adapterOptions: { finalization: true } };
      const url = await adapter.urlForUpdateRecord(123, 'session', options);

      // then
      assert.ok(url.endsWith('/sessions/123/finalization'));
    });
  });

  module('#updateRecord', () => {
    module('when finalization adapter option passed', () => {
      test('should trigger an ajax call with the url, data without former examinerComment', async function (assert) {
        // given
        sinon.stub(adapter, 'ajax').resolves();
        const expectedMethod = 'PUT';
        const examinerGlobalComment = 'Une super session';
        const hasIncident = true;
        const hasJoiningIssue = true;
        const certifReportAttributes1 = {
          certificationCourseId: 1,
          firstName: 'Laura',
          lastName: 'Carray',
          hasSeenEndTestScreen: true,
          id: '1',
          isCompleted: true,
          abortReason: null,
        };

        const certifReportAttributes2 = {
          certificationCourseId: 2,
          firstName: 'Tom',
          lastName: 'Jedusor',
          hasSeenEndTestScreen: false,
          id: '2',
          isCompleted: true,
          abortReason: null,
        };

        const session = await _createSessionWithCertificationReports({
          store,
          sessionData: { examinerGlobalComment, hasIncident, hasJoiningIssue },
          certificationReportsData: [certifReportAttributes1, certifReportAttributes2],
        });
        const snapshot = {
          id: 123,
          adapterOptions: { finalization: true },
          record: session,
        };

        // when
        await adapter.updateRecord(store, { modelName: 'session-management' }, snapshot);

        // then
        const expectedUrl = `${ENV.APP.API_HOST}/api/sessions/123/finalization`;
        const expectedData = {
          data: {
            data: {
              attributes: {
                'examiner-global-comment': examinerGlobalComment,
                'has-incident': hasIncident,
                'has-joining-issue': hasJoiningIssue,
              },
              included: [
                {
                  type: 'certification-reports',
                  id: '1',
                  attributes: {
                    ...certifReportAttributes1,
                  },
                },
                {
                  type: 'certification-reports',
                  id: '2',
                  attributes: {
                    ...certifReportAttributes2,
                  },
                },
              ],
            },
          },
        };
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
        assert.ok(true);
      });
    });
  });

  module('#dismissLiveAlert', () => {
    test('should build dismiss live alert url from session id and candidate id', async function (assert) {
      // given
      adapter.ajax = sinon.stub();
      const sessionId = 123;
      const candidateId = 456;

      // when
      await adapter.dismissLiveAlert(sessionId, candidateId);

      // then
      assert.ok(
        adapter.ajax.calledWith(
          `${ENV.APP.API_HOST}/api/sessions/${sessionId}/candidates/${candidateId}/dismiss-live-alert`,
          'PATCH',
        ),
      );
    });
  });

  module('#validateLiveAlert', () => {
    test('should build validate live alert url from session id and candidate id', async function (assert) {
      // given
      adapter.ajax = sinon.stub();
      const sessionId = 123;
      const candidateId = 456;
      const subcategory = 'SOME_ISSUE';

      // when
      await adapter.validateLiveAlert({ sessionId, candidateId, subcategory });

      // then
      assert.ok(
        adapter.ajax.calledWith(
          `${ENV.APP.API_HOST}/api/sessions/${sessionId}/candidates/${candidateId}/validate-live-alert`,
          'PATCH',
          {
            data: {
              subcategory,
            },
          },
        ),
      );
    });
  });
});

async function _createSessionWithCertificationReports({ store, sessionData = {}, certificationReportsData = [] }) {
  const session = store.createRecord('session-management', sessionData);

  if (certificationReportsData.length) {
    const certificationReports = await session.get('certificationReports');
    certificationReportsData.forEach(certificationReports.createRecord);
  }

  return session;
}
