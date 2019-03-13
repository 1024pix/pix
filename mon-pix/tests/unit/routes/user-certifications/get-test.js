import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe ('Unit | Route | user certifications/get', function() {

  setupTest('route:user-certifications/get', {
    needs: ['service:session', 'service:metrics']
  });

  let route;
  let StoreStub;
  let findRecordStub;
  const certificationId = 'certification_id';

  beforeEach(function() {
    // define stubs
    findRecordStub = sinon.stub();
    StoreStub = Service.extend({
      findRecord: findRecordStub,
    });

    // manage dependency injection context
    this.register('service:store', StoreStub);
    this.inject.service('store', { as: 'store' });

    // instance route object
    route = this.subject();
    route.replaceWith = sinon.stub().resolves();
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  describe('#model', function() {

    it('should get the certification', function() {
      // given
      const params = { id: certificationId };
      const retreivedCertification = [EmberObject.create({ id: certificationId })];
      route.get('store').findRecord.resolves(retreivedCertification);

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
      const retreivedCertification = EmberObject.create({
        id: 2,
        date: '2018-02-15T15:15:52.504Z',
        status: 'validated',
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 231
      });
      route.get('store').findRecord.resolves(retreivedCertification);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        expect(route.replaceWith).to.not.have.been.called;
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
      route.get('store').findRecord.resolves(retreivedCertification);

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
      route.get('store').findRecord.resolves(retreivedCertification);

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
