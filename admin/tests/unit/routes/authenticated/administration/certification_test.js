import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/administration/certification', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    test('it should return the correct model', async function (assert) {
      // given
      const queryRecordStub = sinon.stub();
      class StoreStub extends Service {
        queryRecord = queryRecordStub;
      }
      this.owner.register('service:store', StoreStub);
      const route = this.owner.lookup('route:authenticated/administration/certification');
      const expectedModel = Symbol('model');
      queryRecordStub.withArgs('flash-algorithm-configuration', { id: 0 }).resolves(expectedModel);

      // when
      const model = await route.model();

      // then
      assert.deepEqual(model, expectedModel);
    });
  });
});
