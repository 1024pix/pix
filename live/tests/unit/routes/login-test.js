import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Ember from 'ember';

describe('Unit | Route | login page', function() {
  setupTest('route:login', {
    needs: ['service:current-routed-modal', 'service:session']
  });

  const authenticatedStub = sinon.stub();
  const queryRecordStub = sinon.stub();
  const expectedEmail = 'email@example.net';
  const expectedPassword = 'azerty';

  beforeEach(function() {
    this.register('service:session', Ember.Service.extend({
      authenticate: authenticatedStub
    }));
    this.inject.service('session', { as: 'session' });

    this.register('service:store', Ember.Service.extend({
      queryRecord: queryRecordStub
    }));
    this.inject.service('store', { as: 'store' });
  });

  it('should authenticate the user', function() {
    // Given
    authenticatedStub.resolves();

    const foundUser = Ember.Object.create({ id: 12 });
    queryRecordStub.resolves(foundUser);
    const route = this.subject();
    route.transitionTo = () => {
    };

    // When
    const promise = route.actions.signin.call(route, expectedEmail, expectedPassword);

    // Then
    return promise.then(() => {
      sinon.assert.calledWith(authenticatedStub, 'authenticator:simple', expectedEmail, expectedPassword);
    });
  });

  describe('Route behavior according to organization belong status (authenticated user)', function() {

    it('should redirect to /compte, when user is not linked to an Organization', function() {
      //Given
      const route = this.subject();
      authenticatedStub.resolves();

      const foundUser = Ember.Object.create({ id: 12 });
      queryRecordStub.resolves(foundUser);

      route.transitionTo = sinon.stub();

      //When
      const promise = route.actions.signin.call(route, expectedEmail, expectedPassword);

      return promise.then(() => {
        //Then
        sinon.assert.calledWith(route.transitionTo, 'compte');
      });
    });

    it('should redirect to /board, when user is linked to an Organization', function() {
      //Given
      const route = this.subject();
      authenticatedStub.resolves();

      const linkedOrganization = Ember.Object.create({ id: 1 });
      const foundUser = Ember.Object.create({ organizations: [linkedOrganization] });
      queryRecordStub.resolves(foundUser);

      route.transitionTo = sinon.stub();

      //When
      const promise = route.actions.signin.call(route, expectedEmail, expectedPassword);

      return promise.then(() => {
        //Then
        sinon.assert.calledWith(route.transitionTo, 'board');
      });
    });

  });

});
