import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | recuperer-son-compte | reset password', function() {

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
      const route = this.owner.lookup('route:account-recovery/reset-password');
      route.set('store', storeStub);

      // then
      expect(route).to.be.ok;
    });

    it('should ask account recovery validity', function() {
      // given
      queryRecordStub.resolves();
      const route = this.owner.lookup('route:account-recovery/reset-password');
      route.set('store', storeStub);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(queryRecordStub);
        sinon.assert.calledWith(queryRecordStub, 'user', {
          accountRecoveryDemandTemporaryKey: params.temporary_key,
        });
      });
    });

    describe('when account recovery demand is valid', function() {

      it('should create a new ember user model with fetched data', function() {
        // given
        const fetchedOwnerDetails = {
          data: {
            id: 1234,
            attributes: {
              email: 'philipe@example.net',
            },
          },
        };
        const expectedUser = {
          data: {
            id: 1234,
            attributes: {
              email: 'philipe@example.net',
            },
          },
        };

        queryRecordStub.resolves(fetchedOwnerDetails);
        const route = this.owner.lookup('route:account-recovery/reset-password');
        route.set('store', storeStub);

        // when
        const promise = route.model(params);

        // then
        return promise.then(({ user, temporaryKey }) => {
          expect(user).to.eql(expectedUser);
          expect(temporaryKey).to.eql(params.temporary_key);
        });
      });
    });

  });
});
