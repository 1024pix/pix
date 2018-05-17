import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | user certifications/get', function() {
  setupTest('route:user-certifications/get', {
    needs: ['service:session', 'service:current-routed-modal']
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
    route.transitionTo = sinon.stub();
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
  });
});
