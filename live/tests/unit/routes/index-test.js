import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | index', function() {

  setupTest('route:index', {
    needs: ['service:current-routed-modal', 'service:session']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  describe('when the user is not logged id', () => {

    it('should leave the user on the current location', function() {
      // Given
      this.register('service:session', Service.extend({ isAuthenticated: false }));
      this.inject.service('session', { as: 'session' });

      const route = this.subject();
      route.transitionTo = sinon.stub();

      // When
      route.beforeModel();

      // Then
      sinon.assert.notCalled(route.transitionTo);
    });
  });

  describe('when the user is authenticated', () => {

    let storeServiceStub;

    beforeEach(function() {

      storeServiceStub = {
        findRecord: sinon.stub().resolves(EmberObject.create({ organizations: [] }))
      };
      this.register('service:store', Service.extend(storeServiceStub));
      this.inject.service('store', { as: 'store' });

      this.register('service:session', Service.extend({
        isAuthenticated: true,
        data: {
          authenticated: {
            userId: 1435
          }
        }
      }));
      this.inject.service('session', { as: 'session' });
    });

    it('should redirect the user somewhere else', function() {
      // Given
      const route = this.subject();
      route.transitionTo = sinon.stub();

      // When
      const promise = route.beforeModel();

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(route.transitionTo);
      });
    });

    it('should redirect the user to /compte by default', function() {
      // Given
      const route = this.subject();
      route.transitionTo = sinon.stub();

      // When
      const promise = route.beforeModel();

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'compte');
      });
    });

    it('should load user details from the store', function() {
      const route = this.subject();
      route.transitionTo = sinon.stub();

      // When
      const promise = route.beforeModel();

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(storeServiceStub.findRecord);
        sinon.assert.calledWith(storeServiceStub.findRecord, 'user', 1435);
      });
    });

    it('should redirect to board when the user is linked to an organization', function() {
      // Given
      storeServiceStub.findRecord.resolves(EmberObject.create({
        organizations: [EmberObject.create()]
      }));

      const route = this.subject();
      route.transitionTo = sinon.stub();

      // When
      const promise = route.beforeModel();

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'board');
      });
    });

    it('should redirect to logout when we cannot retrieve user informations', function() {
      // Given
      storeServiceStub.findRecord.rejects();
      const route = this.subject();
      route.transitionTo = sinon.stub();

      // When
      const promise = route.beforeModel();

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(route.transitionTo);
        sinon.assert.calledWith(route.transitionTo, 'logout');
      });
    });
  });

});

