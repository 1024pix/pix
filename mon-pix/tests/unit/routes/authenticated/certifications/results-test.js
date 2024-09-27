import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Certifications | Results', function (hooks) {
  setupTest(hooks);

  module('model', function () {
    test('should retrieve certification course', async function (assert) {
      // given
      const reloadStub = sinon.stub().resolves();
      const assessment = EmberObject.create({ reload: reloadStub });
      const certificationCourse = EmberObject.create({
        id: 1,
        assessment,
      });
      const findRecordStub = sinon.stub().resolves(certificationCourse);
      const storeStub = Service.create({ findRecord: findRecordStub });
      const route = this.owner.lookup('route:authenticated/certifications.results');
      route.set('store', storeStub);

      // when
      const model = await route.model({ certification_id: 1 });

      // then
      assert.deepEqual(model, certificationCourse);
    });
  });

  module('afterModel', function () {
    test('should send a notify Pix Companion', async function (assert) {
      // given
      const stopCertificationStub = sinon.stub();
      class PixCompanionServiceStub extends Service {
        stopCertification = stopCertificationStub;
      }
      this.owner.register('service:pix-companion', PixCompanionServiceStub);

      const route = this.owner.lookup('route:authenticated/certifications.results');

      // when
      route.afterModel();

      // then
      sinon.assert.calledOnce(stopCertificationStub);
      assert.ok(true);
    });
  });
});
