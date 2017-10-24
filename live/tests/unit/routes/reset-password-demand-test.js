import Ember from 'ember';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | changer mot de passe', function() {

  setupTest('route:reset-password', {
    needs: ['service:session', 'service:current-routed-modal']
  });

  describe('Route behavior', function() {

    let storeStub;
    let findRecordStub;
    const params = {
      temporaryKey: 'pwd-reset-demand-token'
    };
    const transitionToStub = sinon.stub();

    beforeEach(function() {
      findRecordStub = sinon.stub();
      storeStub = Ember.Service.extend({
        findRecord: findRecordStub
      });

      this.register('service:store', storeStub);
      this.inject.service('store', { as: 'store' });
    });

    it('should exists', function() {
      // when
      const route = this.subject();

      // then
      expect(route).to.be.ok;
    });

    it('should ask password reset demand validity', function() {
      // given
      findRecordStub.resolves();
      const route = this.subject();

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(findRecordStub);
        sinon.assert.calledWith(findRecordStub, 'password-reset-demand', params.temporaryKey);
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

        findRecordStub.resolves(fetchedOwnerDetails);
        const route = this.subject();

        // when
        const promise = route.model(params);

        // then
        return promise.then((user) => {
          expect(user).to.eql(expectedUser);
        });
      });
    });

    describe('When password reset demand is not valid', function() {

      it('should redirect to home', function() {
        // given
        findRecordStub.rejects();
        const route = this.subject();
        route.set('transitionTo', transitionToStub);

        // when
        const promise = route.model(params);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(transitionToStub);
          sinon.assert.calledWith(transitionToStub, 'index');
        });
      });
    });
  });
});
