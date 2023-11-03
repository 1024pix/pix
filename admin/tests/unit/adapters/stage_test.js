import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | stage', function (hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:stage');
  });

  module('#updateRecord', function () {
    test('should trigger an ajax call with the right method and payload', function (assert) {
      // given
      const updatedStageData = {
        message: 'message',
        prescriberDescription: 'description',
        prescriberTitle: 'prescriber title',
        title: 'title',
        level: 3,
        threshold: undefined,
      };

      const targetProfileId = 20;

      const expectedPayload = {
        data: {
          data: {
            attributes: { ...updatedStageData, targetProfileId },
          },
        },
      };

      const snapshot = {
        id: 123,
        adapterOptions: {
          stage: { ...updatedStageData, id: 123 },
          targetProfileId,
        },
        serialize: sinon.stub().returns({
          data: {
            attributes: {},
          },
        }),
      };

      adapter.ajax = sinon.stub();

      // when
      adapter.updateRecord(null, { modelName: 'stage' }, snapshot);

      // then
      sinon.assert.calledWithExactly(
        adapter.ajax,
        'http://localhost:3000/api/admin/stages/123',
        'PATCH',
        expectedPayload,
      );
      assert.ok(adapter);
    });
  });
});
