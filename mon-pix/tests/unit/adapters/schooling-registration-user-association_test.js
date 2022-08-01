import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapters | schooling-registration-user-association', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:schooling-registration-user-association');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForCreateRecord', function () {
    module('when is for searchMatchingStudent', function () {
      test('should redirect to /schooling-registrations-user-associations/possibilities ', async function (assert) {
        // when
        const snapshot = { adapterOptions: { searchForMatchingStudent: true } };
        const url = await adapter.urlForCreateRecord('schooling-registration-user-association', snapshot);

        // then
        assert.true(url.endsWith('/schooling-registration-user-associations/possibilities'));
      });
    });
    module('when is for tryReconciliation', function () {
      test('should redirect to /schooling-registrations-user-associations/auto ', async function (assert) {
        // when
        const snapshot = { adapterOptions: { tryReconciliation: true } };
        const url = await adapter.urlForCreateRecord('schooling-registration-user-association', snapshot);

        // then
        assert.true(url.endsWith('/schooling-registration-user-associations/auto'));
      });
    });
    module('when is for reconcileSup', function () {
      test('should redirect to /schooling-registrations-user-associations/student ', async function (assert) {
        // when
        const snapshot = { adapterOptions: { reconcileSup: true } };
        const url = await adapter.urlForCreateRecord('schooling-registration-user-association', snapshot);

        // then
        assert.true(url.endsWith('/schooling-registration-user-associations/student'));
      });
    });
  });

  module('#createRecord', function () {
    module('when is for searchMatchingStudent', function (hooks) {
      let expectedUrl, expectedMethod, expectedData, snapshot;

      hooks.beforeEach(() => {
        expectedUrl = 'http://localhost:3000/api/schooling-registration-user-associations/possibilities';
        expectedMethod = 'PUT';
        expectedData = {
          data: {
            data: {
              attributes: {
                'campaign-code': 'AZERTY123',
              },
            },
          },
        };
        snapshot = {
          record: {},
          adapterOptions: {
            searchForMatchingStudent: true,
            campaignCode: 'AZERTY123',
            birthdate: '2020-06-15',
            firstName: 'James',
            lastName: 'Bond',
          },
          serialize: function () {
            return {
              data: {
                attributes: {
                  'campaign-code': 'AZERTY123',
                },
              },
            };
          },
        };
      });

      test('should change method to PUT', async function (assert) {
        // when
        await adapter.createRecord(null, { modelName: 'schooling-registration-user-association' }, snapshot);

        // then
        assert.expect(0);
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
      });
    });

    module('when tryReconciliation is true', function (hooks) {
      let expectedUrl, expectedMethod, expectedData, snapshot;

      hooks.beforeEach(() => {
        expectedUrl = 'http://localhost:3000/api/schooling-registration-user-associations/auto';
        expectedMethod = 'POST';
        expectedData = {
          data: {
            data: {
              attributes: {
                'campaign-code': 'AZERTY123',
              },
            },
          },
        };
        snapshot = {
          record: {},
          adapterOptions: {
            tryReconciliation: true,
            campaignCode: 'AZERTY123',
            firstName: 'James',
            lastName: 'Bond',
          },
          serialize: function () {
            return {
              data: {
                attributes: {
                  'campaign-code': 'AZERTY123',
                  'first-name': 'James',
                  'last-name': 'Bond',
                },
              },
            };
          },
        };
      });

      test('should remove user details', async function (assert) {
        // when
        await adapter.createRecord(null, { modelName: 'schooling-registration-user-association' }, snapshot);

        // then
        assert.expect(0);
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
      });
    });
  });
});
