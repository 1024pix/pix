import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | tutorial-evaluation', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:tutorial-evaluation');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForCreateRecord', function () {
    test('should redirect to /api/users/tutorials/${tutorialId}/evaluate', async function (assert) {
      // given
      const tutorialId = 'tutorialId';
      const snapshot = { adapterOptions: { tutorialId } };

      // when
      const url = await adapter.urlForCreateRecord('tutorial-evaluations', snapshot);

      // then
      assert.true(url.endsWith(`/users/tutorials/${tutorialId}/evaluate`));
    });
  });

  module('#urlForUpdateRecord', function () {
    test('should redirect to /api/users/tutorials/${tutorialId}/evaluate', async function (assert) {
      // given
      const tutorialId = 'tutorialId';
      const snapshot = { adapterOptions: { tutorialId } };

      // when
      const url = await adapter.urlForUpdateRecord('tutorial-evaluations', snapshot);

      // then
      assert.true(url.endsWith(`/users/tutorials/${tutorialId}/evaluate`));
    });
  });

  module('#createRecord', function () {
    test('should call API to create a tutorial-evaluation', async function (assert) {
      // given
      const tutorialId = 'tutorialId';
      const tutorial = { adapterOptions: { tutorialId, status: 'LIKED' } };

      // when
      await adapter.createRecord(null, { modelName: 'tutorial-evaluation' }, tutorial);

      // then
      sinon.assert.calledWith(adapter.ajax, `http://localhost:3000/api/users/tutorials/${tutorialId}/evaluate`, 'PUT', {
        data: {
          data: {
            attributes: {
              status: 'LIKED',
            },
          },
        },
      });
      assert.ok(true);
    });
  });

  module('#updateRecord', function () {
    test('should call API to create a tutorial-evaluation', async function (assert) {
      // given
      const tutorialId = 'tutorialId';
      const tutorial = {
        id: 12,
        adapterOptions: { tutorialId, status: 'LIKED' },
        serialize: function () {},
      };

      // when
      await adapter.updateRecord({}, { modelName: 'tutorial-evaluation' }, tutorial);

      // then
      sinon.assert.calledWith(adapter.ajax, `http://localhost:3000/api/users/tutorials/${tutorialId}/evaluate`, 'PUT', {
        data: {
          data: {
            attributes: {
              status: 'LIKED',
            },
          },
        },
      });
      assert.ok(true);
    });
  });
});
