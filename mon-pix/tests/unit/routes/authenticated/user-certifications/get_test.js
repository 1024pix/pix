import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | user certifications/get', function (hooks) {
  setupTest(hooks);

  let route;
  let storeStub;
  let findRecordStub;
  const certificationId = 'certification_id';

  hooks.beforeEach(function () {
    // define stubs
    findRecordStub = sinon.stub();
    storeStub = Service.create({
      findRecord: findRecordStub,
    });

    route = this.owner.lookup('route:authenticated/user-certifications/get');
    route.set('store', storeStub);
    route.router.replaceWith = sinon.stub().resolves();
  });

  test('exists', function (assert) {
    assert.ok(route);
  });

  module('#model', function () {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/require-expect
    test('should get the certification', function (assert) {
      // given
      const params = { id: certificationId };
      const retreivedCertification = [EmberObject.create({ id: certificationId })];
      findRecordStub.resolves(retreivedCertification);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(findRecordStub);
        sinon.assert.calledWith(findRecordStub, 'certification', certificationId);
        assert.ok(true);
      });
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/require-expect
    test('should not return to /mes-certifications when the certification is published and validated', function (assert) {
      // given
      const params = { id: certificationId };
      const retrievedCertification = EmberObject.create({
        id: 2,
        date: '2018-02-15T15:15:52.504Z',
        status: 'validated',
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 231,
      });
      findRecordStub.resolves(retrievedCertification);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        assert.true(route.router.replaceWith.notCalled);
      });
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/require-expect
    test('should return to /mes-certifications when the certification is not published', function (assert) {
      // given
      const params = { id: certificationId };
      const retreivedCertification = EmberObject.create({
        id: 2,
        date: '2018-02-15T15:15:52.504Z',
        status: 'validated',
        certificationCenter: 'Université de Lyon',
        isPublished: false,
        pixScore: 231,
      });
      findRecordStub.resolves(retreivedCertification);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(route.router.replaceWith);
        sinon.assert.calledWith(route.router.replaceWith, '/mes-certifications');
        assert.ok(true);
      });
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/require-expect
    test('should return to /mes-certifications when the certification is not validated', function (assert) {
      // given
      const params = { id: certificationId };
      const retreivedCertification = EmberObject.create({
        id: 3,
        date: '2018-02-15T15:15:52.504Z',
        status: 'rejected',
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 231,
      });
      findRecordStub.resolves(retreivedCertification);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(route.router.replaceWith);
        sinon.assert.calledWith(route.router.replaceWith, '/mes-certifications');
        assert.ok(true);
      });
    });
  });
});
