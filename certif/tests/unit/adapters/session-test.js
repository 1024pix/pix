import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | session', (hooks) => {
  setupTest(hooks);

  let adapter;
  let store;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:session');
    store = this.owner.lookup('service:store');
  });

  module('#urlForUpdateRecord', () => {
    test('should build update url from session id', async function(assert) {
      // when
      const options = { adapterOptions: { } };
      const url = await adapter.urlForUpdateRecord(123, 'session', options);

      assert.ok(url.endsWith('/sessions/123'));
    });

    test('should build specific url to finalization', async function(assert) {
      // when
      const options = { adapterOptions: { finalization: true } };
      const url = await adapter.urlForUpdateRecord(123, 'session', options);

      // then
      assert.ok(url.endsWith('/sessions/123/finalization'));
    });
  });

  module('#updateRecord', () => {
    module('when studentListToAdd adapter option passed', () => {
      test('should trigger an ajax call with the url, data and method', async (assert) => {
        // given
        sinon.stub(adapter, 'ajax').resolves();
        const studentListToAdd = [
          { id: 1, firstName: 'Doe' },
          { id: 2, firstName: 'Dupont' },
        ];

        const expectedStudentIdList = [ 1, 2 ];
        const expectedUrl = 'http://localhost:3000/api/sessions/123/enroll-students-to-session';
        const expectedMethod = 'PUT';
        const expectedData = {
          data: {
            data: {
              attributes: {
                'student-ids': expectedStudentIdList,
              },
            },
          },
        };

        // when
        await adapter.updateRecord(store, { modelName: 'session' }, { id: 123, adapterOptions: { studentListToAdd } });

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
        assert.ok(adapter);
      });
    });

    module('when finalization adapter option passed', () => {

      test('should trigger an ajax call with the url, data without former examinerComment', async (assert) => {
        // given
        sinon.stub(adapter, 'ajax').resolves();
        const expectedMethod = 'PUT';
        const examinerGlobalComment = 'Une super session';
        const certifReportAttributes1 = {
          certificationCourseId: 1,
          firstName: 'Laura',
          LastName: 'Carray',
          hasSeenEndTestScreen: true,
        };
        const certificationReport1 = {
          get: sinon.stub().returns(1),
          toJSON: sinon.stub().returns(certifReportAttributes1),
        };
        const certifReportAttributes2 = {
          certificationCourseId: 2,
          firstName: 'Tom',
          LastName: 'Jedusor',
          hasSeenEndTestScreen: false,
        };
        const certificationReport2 = {
          firstIssueReportDescription: 'Il a eu un soucis',
          get: sinon.stub().returns(2),
          toJSON: sinon.stub().returns(certifReportAttributes2),
        };
        const session = {
          examinerGlobalComment,
          certificationReports: [ certificationReport1, certificationReport2 ],
        };
        const snapshot = {
          id: 123,
          adapterOptions: { finalization: true },
          record: session,
        };

        // when
        await adapter.updateRecord(store, { modelName: 'session' }, snapshot);

        // then
        const expectedUrl = 'http://localhost:3000/api/sessions/123/finalization';
        const expectedData = {
          data: {
            data: {
              attributes: {
                'examiner-global-comment': examinerGlobalComment,
              },
              included: [
                {
                  type: 'certification-reports',
                  id: 1,
                  attributes: {
                    ...certifReportAttributes1,
                  },
                },
                {
                  type: 'certification-reports',
                  id: 2,
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
});
