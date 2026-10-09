import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | certifications/certificate-details', function (hooks) {
  setupTest(hooks);

  let route;
  let findRecordStub;
  let findAllStub;
  const certificationId = 'certification_id';

  hooks.beforeEach(function () {
    findRecordStub = sinon.stub();
    findAllStub = sinon.stub();

    const storeStub = Service.create({
      findRecord: findRecordStub,
      findAll: findAllStub,
    });

    route = this.owner.lookup('route:authenticated/certifications/certificate-details');
    route.set('store', storeStub);
    route.router.transitionTo = sinon.stub().resolves();
  });

  module('#model', function () {
    test('should get the certification', async function (assert) {
      // given
      const params = { id: certificationId };
      findRecordStub.resolves({});

      // when
      await route.model(params);

      // then
      sinon.assert.calledOnce(findRecordStub);
      sinon.assert.calledWith(findRecordStub, 'certification', certificationId);
      assert.ok(true);
    });
  });

  module('#beforeModel', function () {
    test('should not redirect when the certificate summary is validated', async function (assert) {
      // given
      findAllStub.withArgs('certificate-summary').resolves([{ id: '2', isValidated: true }]);
      const transition = { to: { params: { id: '2' } }, abort: sinon.stub() };

      // when
      await route.beforeModel(transition);

      // then
      assert.true(transition.abort.notCalled);
      assert.true(route.router.transitionTo.notCalled);
    });

    test('should return to /mes-certifications when the certification is not published', async function (assert) {
      // given
      findAllStub.withArgs('certificate-summary').resolves([{ id: '2', isValidated: false }]);
      const transition = { to: { params: { id: '2' } }, abort: sinon.stub() };

      // when
      await route.beforeModel(transition);

      // then
      sinon.assert.calledOnce(transition.abort);
      sinon.assert.calledOnce(route.router.transitionTo);
      sinon.assert.calledWith(route.router.transitionTo, 'authenticated.certifications');
      assert.ok(true);
    });

    test('should return to /mes-certifications when the certification is not validated', async function (assert) {
      // given
      findAllStub.withArgs('certificate-summary').resolves([{ id: '3', isValidated: false }]);
      const transition = { to: { params: { id: '3' } }, abort: sinon.stub() };

      // when
      await route.beforeModel(transition);

      // then
      sinon.assert.calledOnce(transition.abort);
      sinon.assert.calledOnce(route.router.transitionTo);
      sinon.assert.calledWith(route.router.transitionTo, 'authenticated.certifications');
      assert.ok(true);
    });

    test('should return to /mes-certifications when the certificate summary is not found', async function (assert) {
      // given
      findAllStub.withArgs('certificate-summary').resolves([{ id: '2', isValidated: true }]);
      const transition = { to: { params: { id: '999' } }, abort: sinon.stub() };

      // when
      await route.beforeModel(transition);

      // then
      sinon.assert.calledOnce(transition.abort);
      sinon.assert.calledOnce(route.router.transitionTo);
      sinon.assert.calledWith(route.router.transitionTo, 'authenticated.certifications');
      assert.ok(true);
    });
  });
});
