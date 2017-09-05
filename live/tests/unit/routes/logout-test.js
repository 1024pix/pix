import Ember from 'ember';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | logout', () => {
  setupTest('route:logout', {
    needs: ['service:current-routed-modal']
  });

  it('should disconnect the user', function() {
    // Given
    const invalidateStub = sinon.stub();
    this.register('service:session', Ember.Service.extend({ isAuthenticated: true, invalidate: invalidateStub }));
    this.inject.service('session', { as: 'session' });

    const route = this.subject();
    route.transitionTo = function() {
    };

    // When
    route.beforeModel();

    // Then
    sinon.assert.calledOnce(invalidateStub);
  });

  it('should redirect after disconnection', function() {
    // Given
    const invalidateStub = sinon.stub();
    this.register('service:session', Ember.Service.extend({ isAuthenticated: true, invalidate: invalidateStub }));
    this.inject.service('session', { as: 'session' });

    const route = this.subject();
    route.transitionTo = sinon.stub();

    // When
    route.beforeModel();

    // Then
    sinon.assert.calledOnce(route.transitionTo);
    sinon.assert.calledWith(route.transitionTo, '/');
  });

  it('should redirect even if user was not authenticated', function() {
    // Given
    const invalidateStub = sinon.stub();
    this.register('service:session', Ember.Service.extend({ isAuthenticated: false, invalidate: invalidateStub }));
    this.inject.service('session', { as: 'session' });

    const route = this.subject();
    route.transitionTo = sinon.stub();

    // When
    route.beforeModel();

    // Then
    sinon.assert.calledOnce(route.transitionTo);
    sinon.assert.calledWith(route.transitionTo, '/');
  });
});
