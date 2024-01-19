import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | Module | ElementAnswer', function (hooks) {
  setupTest(hooks);

  module('#urlForCreateRecord', function () {
    test('should build url for create record', function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:element-answer');
      const option = {
        adapterOptions: {
          passageId: '12',
        },
      };
      // when
      const url = adapter.urlForCreateRecord('element-answer', option);

      // then
      assert.true(url.endsWith(`api/passages/${option.adapterOptions.passageId}/answers`));
    });
  });

  module('#createRecord', function () {
    test('should build the right payload', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:element-answer');
      adapter.ajax = sinon.stub().resolves();

      const passageId = 12;
      const userResponse = [];
      const element = { id: 'element-id' };

      const expectedUrl = `http://localhost:3000/api/passages/12/answers`;
      const expectedMethod = 'POST';
      const expectedData = {
        data: {
          data: {
            attributes: {
              'element-id': element.id,
              'user-response': userResponse,
            },
          },
        },
      };
      const snapshot = {
        record: { element, userResponse },
        adapterOptions: {
          passageId,
        },
        serialize: function () {
          return {
            data: {
              attributes: {
                'user-response': userResponse,
              },
              relationships: {
                element: { data: element },
              },
            },
          };
        },
      };

      // when
      await adapter.createRecord(null, { modelName: 'passage' }, snapshot);

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
      assert.ok(true);
    });
  });
});
