import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | account-recovery | update sco record', function() {

  setupTest();

  describe('Route behavior', function() {

    let storeStub;
    let queryRecordStub;
    const params = {
      temporary_key: 'temporary key',
    };

    beforeEach(function() {
      queryRecordStub = sinon.stub();
      storeStub = Service.create({
        queryRecord: queryRecordStub,
      });
    });

    it('should exist', function() {
      // when
      const route = this.owner.lookup('route:account-recovery/update-sco-record');
      route.set('store', storeStub);

      // then
      expect(route).to.be.ok;
    });

    it('should ask account recovery validity', function() {
      // given
      queryRecordStub.resolves({});
      const route = this.owner.lookup('route:account-recovery/update-sco-record');
      route.set('store', storeStub);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(queryRecordStub);
        sinon.assert.calledWith(queryRecordStub, 'account-recovery-demand', {
          temporaryKey: params.temporary_key,
        });
      });
    });

    describe('when account recovery demand is valid', function() {

      it('should create account recovery demand with fetched data', function() {
        // given
        const stubbedAccountRecoveryDetails = {
          email: 'philipe@example.net',
          firstName: 'philippe',
        };
        const expectedAccountRecoveryDetails = {
          email: 'philipe@example.net',
          firstName: 'philippe',
        };

        queryRecordStub.resolves(stubbedAccountRecoveryDetails);
        const route = this.owner.lookup('route:account-recovery/update-sco-record');
        route.set('store', storeStub);

        // when
        const promise = route.model(params);

        // then
        return promise.then(({ temporaryKey, ...accountRecoveryDetails }) => {
          expect(accountRecoveryDetails).to.eql(expectedAccountRecoveryDetails);
          expect(temporaryKey).to.eql(params.temporary_key);
        });
      });
    });

  });
});
