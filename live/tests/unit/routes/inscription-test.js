import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

class SessionStub {
  authenticate() {
    this.callArgs = Array.from(arguments);
    return Promise.resolve();
  }
}

describe('Unit | Route | inscription', function() {
  setupTest('route:inscription', {
    needs: ['service:current-routed-modal', 'service:session']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  it('should automatically redirect authenticated user to compte page', function() {
    // Given
    const expectedEmail = 'email@example.net';
    const expectedPassword = 'Azertya1!';
    const sessionStub = new SessionStub();

    const route = this.subject();
    route.set('session', sessionStub);
    let transitionToArg;
    route.transitionTo = function() {
      transitionToArg = Array.from(arguments);
    };

    // When
    const promise = route.actions.redirectToProfileRoute.call(route, {
      email: expectedEmail,
      password: expectedPassword
    });

    return promise.then(() => {
      // Then
      expect(sessionStub.callArgs).to.deep.equal(['authenticator:simple', expectedEmail, expectedPassword]);
      expect(transitionToArg).to.deep.equal(['compte']);
    });
  });
});
