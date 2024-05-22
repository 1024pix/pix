import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import ENV from 'pix-certif/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | sessionEnrolment', function (hooks) {
  setupTest(hooks);

  let adapter;
  let store;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:session-enrolment');
    store = this.owner.lookup('service:store');
  });

  module('#urlForCreateRecord', () => {
    test('should build save url from certification center id', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: 123,
      });
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const adapter = this.owner.lookup('adapter:session-enrolment');

      // when
      const url = await adapter.urlForCreateRecord();

      // then
      assert.ok(url.endsWith('/certification-centers/123/session'));
    });
  });

  module('#updateRecord', () => {
    module('when studentListToAdd adapter option passed', () => {
      test('should trigger an ajax call with the url, data and method', async function (assert) {
        // given
        sinon.stub(adapter, 'ajax').resolves();
        const studentListToAdd = [
          { id: 1, firstName: 'Doe' },
          { id: 2, firstName: 'Dupont' },
        ];

        const expectedStudentIdList = [1, 2];
        const expectedUrl = `${ENV.APP.API_HOST}/api/sessions/123/enrol-students-to-session`;
        const expectedMethod = 'PUT';
        const expectedData = {
          data: {
            data: {
              attributes: {
                'organization-learner-ids': expectedStudentIdList,
              },
            },
          },
        };

        // when
        await adapter.updateRecord(
          store,
          { modelName: 'session-enrolment' },
          { id: 123, adapterOptions: { studentListToAdd } },
        );

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
        assert.ok(adapter);
      });
    });
  });
});
