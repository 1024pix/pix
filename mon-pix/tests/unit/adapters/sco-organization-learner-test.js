import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | sco-organization-learner', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:sco-organization-learner');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForCreateRecord', function () {
    module('when is for searchMatchingStudent', function () {
      test('should redirect to /sco-organization-learners/possibilities ', async function (assert) {
        // when
        const snapshot = { adapterOptions: { searchForMatchingStudent: true } };
        const url = await adapter.urlForCreateRecord('sco-organization-learner', snapshot);

        // then
        assert.true(url.endsWith('/sco-organization-learners/possibilities'));
      });
    });
    module('when is for tryReconciliation', function () {
      test('should redirect to /sco-organization-learners/association/auto', async function (assert) {
        // when
        const snapshot = { adapterOptions: { tryReconciliation: true } };
        const url = await adapter.urlForCreateRecord('sco-organization-learner', snapshot);

        // then
        assert.true(url.endsWith('/sco-organization-learners/association/auto'));
      });
    });

    test('should redirect to /sco-organization-learners/association', async function (assert) {
      // when
      const url = await adapter.urlForCreateRecord('sco-organization-learner', {});

      // then
      assert.true(url.endsWith('/sco-organization-learners/association'));
    });
  });

  module('#createRecord', function () {
    module('when is for searchMatchingStudent', function (hooks) {
      let expectedUrl, expectedMethod, expectedData, snapshot;

      hooks.beforeEach(function () {
        expectedUrl = 'http://localhost:3000/api/sco-organization-learners/possibilities';
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
        await adapter.createRecord(null, { modelName: 'sco-organization-learner' }, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
        assert.ok(true);
      });
    });

    module('when tryReconciliation is true', function (hooks) {
      let expectedUrl, expectedMethod, expectedData, snapshot;

      hooks.beforeEach(function () {
        expectedUrl = 'http://localhost:3000/api/sco-organization-learners/association/auto';
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
        await adapter.createRecord(null, { modelName: 'sco-organization-learner' }, snapshot);

        // then
        sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
        assert.ok(true);
      });
    });
  });
});
