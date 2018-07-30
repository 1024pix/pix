import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Certifications | Results', function() {

  setupTest('route:certifications.results', {
    needs: ['service:current-routed-modal', 'service:session']
  });
  const params = {
    certification_number: 'certification_number',
  };

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  describe('model', function() {

    let route;
    let storeStub;
    let findRecordStub;

    beforeEach(function() {
      findRecordStub = sinon.stub();
      storeStub = Service.extend({
        findRecord: findRecordStub
      });
      this.register('service:store', storeStub);
      this.inject.service('store', { as: 'store' });
    });

    context('When user is logged', function() {

      beforeEach(function() {
        this.register('service:session', Service.extend({
          isAuthenticated: true,
          data: {
            authenticated: {
              userId: 1435
            }
          }
        }));
        this.inject.service('session', { as: 'session' });

        route = this.subject();
        route.transitionTo = sinon.stub();
      });

      it('should find logged user details', function() {
        // Given
        const expectedUser = {};
        findRecordStub.resolves(expectedUser);

        // When
        const promise = route.model(params);

        // Then
        return promise.then(function(model) {
          sinon.assert.calledWith(findRecordStub, 'user', 1435, { reload: true });
          expect(model.user).to.equal(expectedUser);
        });
      });
    });

  });
});
