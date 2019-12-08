import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | user certifications/get', function() {

  setupTest();

  let route;
  let storeStub;
  let findRecordStub;
  const certificationId = 'certification_id';

  beforeEach(function() {
    // define stubs
    findRecordStub = sinon.stub();
    storeStub = Service.create({
      findRecord: findRecordStub,
    });

    route = this.owner.lookup('route:user-certifications/get');
    route.set('store', storeStub);
    route.replaceWith = sinon.stub().resolves();
  });

  it('exists', function() {
    expect(route).to.be.ok;
  });

  describe('#model', function() {

    it('should get the certification', function() {
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
      });
    });

    it('should not return to /mes-certifications when the certification is published and validated', function() {
      // given
      const params = { id: certificationId };
      const retrievedCertification = EmberObject.create({
        id: 2,
        date: '2018-02-15T15:15:52.504Z',
        status: 'validated',
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 231
      });
      findRecordStub.resolves(retrievedCertification);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        expect(route.replaceWith.notCalled).to.be.true;
      });
    });

    it('should return to /mes-certifications when the certification is not published', function() {
      // given
      const params = { id: certificationId };
      const retreivedCertification = EmberObject.create({
        id: 2,
        date: '2018-02-15T15:15:52.504Z',
        status: 'validated',
        certificationCenter: 'Université de Lyon',
        isPublished: false,
        pixScore: 231
      });
      findRecordStub.resolves(retreivedCertification);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(route.replaceWith);
        sinon.assert.calledWith(route.replaceWith, '/mes-certifications');
      });
    });

    it('should return to /mes-certifications when the certification is not validated', function() {
      // given
      const params = { id: certificationId };
      const retreivedCertification = EmberObject.create({
        id: 3,
        date: '2018-02-15T15:15:52.504Z',
        status: 'rejected',
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 231
      });
      findRecordStub.resolves(retreivedCertification);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(route.replaceWith);
        sinon.assert.calledWith(route.replaceWith, '/mes-certifications');
      });
    });
  });
});
