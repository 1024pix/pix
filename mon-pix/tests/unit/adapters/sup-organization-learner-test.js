import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | sup-organization-learner', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:sup-organization-learner');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForCreateRecord', function () {
    test('should redirect to /sup-organization-learners/association', async function (assert) {
      // when
      const url = await adapter.urlForCreateRecord('sup-organization-learner');

      // then
      assert.true(url.endsWith('/sup-organization-learners/association'));
    });
  });

  module('#createRecord', function (hooks) {
    let expectedUrl, expectedMethod, expectedData, snapshot;

    hooks.beforeEach(function () {
      expectedUrl = 'http://localhost:3000/api/sup-organization-learners/association';
      expectedMethod = 'POST';
      expectedData = {
        data: {
          data: {
            attributes: {
              'campaign-code': 'AZERTY123',
              id: 'AZERTY123_last',
              'student-number': '123456789',
              'first-name': 'first',
              'last-name': 'last',
              birthdate: '10-10-2010',
            },
          },
        },
      };
      snapshot = {
        serialize: function () {
          return {
            data: {
              attributes: {
                'campaign-code': 'AZERTY123',
                id: 'AZERTY123_last',
                'student-number': '123456789',
                'first-name': 'first',
                'last-name': 'last',
                birthdate: '10-10-2010',
              },
            },
          };
        },
      };
    });

    test('should serialize data', async function (assert) {
      // when
      await adapter.createRecord(null, { modelName: 'sup-organization-learner' }, snapshot);

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
      assert.ok(true);
    });
  });
});
