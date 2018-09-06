import Service from '@ember/service';
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
    this.register('service:session', Service.extend({ isAuthenticated: true, invalidate: invalidateStub }));
    this.inject.service('session', { as: 'session' });

    const route = this.subject();
    route.transitionTo = function() {
    };

    // When
    route.beforeModel();

    // Then
    sinon.assert.calledOnce(invalidateStub);
  });
});
