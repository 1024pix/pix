import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | reset password', function() {

  setupTest();

  describe('Route behavior', function() {

    let storeStub;
    let createRecordStub;
    const params = {
      temporary_key: 'temporary_key',
    };

    beforeEach(function() {
      createRecordStub = sinon.stub();
      storeStub = Service.extend({
        createRecord: createRecordStub
      });

      this.owner.register('service:store', storeStub);
    });

    it('should exists', function() {
      // when
      const route = this.owner.lookup('route:reset-password');

      // then
      expect(route).to.be.ok;
    });

    it('should create a passwordReset', async function() {
      // given
      createRecordStub.resolves();
      const route = this.owner.lookup('route:reset-password');

      // when
      await route.model(params);

      // then
      sinon.assert.calledOnce(createRecordStub);
      sinon.assert.calledWith(createRecordStub, 'password-reset', params.temporary_key);
    });
  });
});
