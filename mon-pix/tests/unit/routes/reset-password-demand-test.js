import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | changer mot de passe', function() {

  setupTest();

  describe('Route behavior', function() {

    let storeStub;
    let queryRecordStub;
    const params = {
      temporary_key: 'pwd-reset-demand-token'
    };

    beforeEach(function() {
      queryRecordStub = sinon.stub();
      storeStub = Service.create({
        queryRecord: queryRecordStub
      });
    });

    it('should exists', function() {
      // when
      const route = this.owner.lookup('route:reset-password');
      route.set('store', storeStub);

      // then
      expect(route).to.be.ok;
    });

    it('should ask password reset demand validity', function() {
      // given
      queryRecordStub.resolves();
      const route = this.owner.lookup('route:reset-password');
      route.set('store', storeStub);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(queryRecordStub);
        sinon.assert.calledWith(queryRecordStub, 'user', {
          passwordResetTemporaryKey: params.temporary_key
        });
      });
    });

    describe('when password reset demand is valid', function() {

      it('should create a new ember user model with fetched data', function() {
        // given
        const fetchedOwnerDetails = {
          data: {
            id: 7,
            attributes: {
              email: 'pix@qmail.fr'
            }
          }
        };
        const expectedUser = {
          data: {
            id: 7,
            attributes: {
              email: 'pix@qmail.fr'
            }
          }
        };

        queryRecordStub.resolves(fetchedOwnerDetails);
        const route = this.owner.lookup('route:reset-password');
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
