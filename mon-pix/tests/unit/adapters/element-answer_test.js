import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | Module | ElementAnswer', function (hooks) {
  setupTest(hooks);

  module('#urlForCreateRecord', function () {
    test('should build url for create record', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const passage = store.createRecord('passage', { id: '123' });
      const adapter = this.owner.lookup('adapter:element-answer');
      const option = {
        modelName: 'element-answer',
        belongsTo: sinon.stub(),
      };
      option.belongsTo.withArgs('passage', { id: true }).returns(passage.id);
      // when

      const url = adapter.urlForCreateRecord('element-answer', option);

      // then
      assert.true(url.endsWith(`api/passages/${passage.id}/answers`));
    });
  });

  module('#createRecord', function () {
    test('should build the right payload', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const passageId = 12;
      const passage = store.createRecord('passage', { id: passageId });
      const adapter = this.owner.lookup('adapter:element-answer');
      adapter.ajax = sinon.stub().resolves();

      const userResponse = [];
      const element = { id: 'element-id' };

      const expectedUrl = `http://localhost:3000/api/passages/${passageId}/answers`;
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
        record: { element, userResponse, passage },
        belongsTo: sinon.stub(),
        serialize: function () {
          return {
            data: {
              attributes: {
                'user-response': userResponse,
                'element-id': element.id,
              },
              relationships: {
                passage: { data: passage },
              },
            },
          };
        },
      };
      snapshot.belongsTo.withArgs('passage', { id: true }).returns(passage.id);

      // when
      await adapter.createRecord(null, { modelName: 'passage' }, snapshot);

      // then
      sinon.assert.calledWith(adapter.ajax, expectedUrl, expectedMethod, expectedData);
      assert.ok(true);
    });
  });
});
