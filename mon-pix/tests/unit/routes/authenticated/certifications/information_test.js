import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Certifications | Information', function (hooks) {
  setupTest(hooks);

  module('model', function () {
    test('should return certification candidate', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const certificationCandidate = store.createRecord('certification-candidate', {
        id: '1234',
      });
      const peekRecordStub = sinon.stub().resolves(certificationCandidate);
      const storeStub = Service.create({ peekRecord: peekRecordStub });
      const route = this.owner.lookup('route:authenticated/certifications.information');
      route.set('store', storeStub);

      // when
      const model = await route.model(1234);

      // then
      assert.deepEqual(model, certificationCandidate);
    });
  });
});
