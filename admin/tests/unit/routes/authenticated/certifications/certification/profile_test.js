import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Route | authenticated/certifications/certification/profile', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    test('it should return certified profile', async function (assert) {
      // given
      const findRecordStub = sinon.stub();
      const paramsForStub = sinon.stub();
      class StoreStub extends Service {
        findRecord = findRecordStub;
      }
      this.owner.register('service:store', StoreStub);
      const route = this.owner.lookup('route:authenticated/certifications/certification/profile');
      route.paramsFor = paramsForStub;
      const expectedModel = Symbol('model');
      paramsForStub.withArgs('authenticated.certifications.certification').returns({ certification_id: 123 });
      findRecordStub.withArgs('certified-profile', 123).resolves(expectedModel);

      // when
      const model = await route.model();

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(model, expectedModel);
    });
  });
});
