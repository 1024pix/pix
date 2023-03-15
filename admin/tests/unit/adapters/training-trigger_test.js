import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | TrainingTrigger', function (hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:training-trigger');
    adapter.ajax = sinon.stub();
  });

  module('#urlForCreateRecord', function () {
    test('should build create url from targetProfileId', async function (assert) {
      // when
      const options = { adapterOptions: { trainingId: 788 } };
      const url = await adapter.urlForCreateRecord('training-trigger', options);

      // then
      assert.true(url.endsWith('/api/admin/trainings/788/triggers'));
    });
  });

  module('#createRecord', function (createRecordHooks) {
    let trainingId;
    let tubes;
    createRecordHooks.beforeEach(function () {
      trainingId = 1;
      tubes = [
        { id: 1, level: 2 },
        { id: 2, level: 4 },
      ];
    });

    test('should trigger PUT request with correct payload', async function (assert) {
      // given
      sinon.stub(adapter, 'urlForCreateRecord').returns('https://example.net');
      const attributesWithoutTubes = { type: 'prerequisite', threshold: 10, trainingId };
      const expectedPayload = {
        data: {
          data: {
            attributes: {
              ...attributesWithoutTubes,
              tubes: [
                { tubeId: 1, level: 2 },
                { tubeId: 2, level: 4 },
              ],
            },
          },
        },
      };

      // when
      await adapter.createRecord(Symbol(), Symbol(), {
        adapterOptions: { tubes, trainingId },
        serialize: sinon.stub().returns({ data: { attributes: attributesWithoutTubes } }),
      });

      console.log(adapter.ajax.calledWith(`https://example.net`, 'PUT', expectedPayload));

      // then
      assert.ok(adapter.ajax.calledWith(`https://example.net`, 'PUT', expectedPayload));
    });
  });
});
