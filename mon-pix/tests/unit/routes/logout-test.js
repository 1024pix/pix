import Service from '@ember/service';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | logout', () => {
  setupTest('route:logout', {
    needs: ['service:metrics']
  });

  it('should disconnect the user', function() {
    // Given
    const invalidateStub = sinon.stub();
    this.register('service:session', Service.extend({ isAuthenticated: true, invalidate: invalidateStub, data: {
      authenticated: {
        source: 'external'
      }
    }
    }));
    this.inject.service('session', { as: 'session' });

    const route = this.subject();

    // When
    route.beforeModel();

    // Then
    sinon.assert.calledOnce(invalidateStub);
  });

  it('should redirect to home when source of connexion is pix', function() {
    // Given
    const invalidateStub = sinon.stub();

    this.register('service:session', Service.extend({ isAuthenticated: true, invalidate: invalidateStub }));
    this.inject.service('session', { as: 'session' });

    const route = this.subject();
    route._redirectToHome = sinon.stub();
    route.source = 'pix';

    // When
    route.afterModel();

    // Then
    sinon.assert.calledOnce(route._redirectToHome);
  });

  it('should redirect to disconnected page when source of connexion is external', function() {
    // Given
    const invalidateStub = sinon.stub();

    this.register('service:session', Service.extend({ isAuthenticated: true, invalidate: invalidateStub }));
    this.inject.service('session', { as: 'session' });

    const route = this.subject();
    route._redirectToDisconnectedPage = sinon.stub();
    route.source = 'external';

    // When
    route.afterModel();

    // Then
    sinon.assert.calledOnce(route._redirectToDisconnectedPage);
  });

});
