import Service from '@ember/service';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import ENV from 'mon-pix/config/environment';

const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

describe('Unit | Route | logout', () => {
  setupTest();

  let sessionStub;

  it('should disconnect the user', function() {
    // Given
    const invalidateStub = sinon.stub();
    sessionStub = Service.create({ isAuthenticated: true, invalidate: invalidateStub, data: {
      authenticated: {
        source: AUTHENTICATED_SOURCE_FROM_MEDIACENTRE,
      },
    },
    });

    const route = this.owner.lookup('route:logout');
    route.set('session', sessionStub);

    // When
    route.beforeModel();

    // Then
    sinon.assert.calledOnce(invalidateStub);
  });

  it('should redirect to home when source of connexion is pix', function() {
    // Given
    const invalidateStub = sinon.stub();

    sessionStub = Service.create({ isAuthenticated: true, invalidate: invalidateStub });

    const route = this.owner.lookup('route:logout');
    route.set('session', sessionStub);
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

    sessionStub = Service.create({ isAuthenticated: true, invalidate: invalidateStub });

    const route = this.owner.lookup('route:logout');
    route.set('session', sessionStub);
    route._redirectToDisconnectedPage = sinon.stub();
    route.source = AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

    // When
    route.afterModel();

    // Then
    sinon.assert.calledOnce(route._redirectToDisconnectedPage);
  });

});
