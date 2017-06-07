import {expect} from 'chai';
import {describe, it} from 'mocha';
import {setupTest} from 'ember-mocha';

class SessionStub {
  authenticate() {
    this.callArgs = Array.from(arguments);
    return Promise.resolve();
  }
}

describe('Unit | Route | connexion', function() {
  setupTest('route:connexion', {
    needs: [ 'service:current-routed-modal', 'service:session' ]
  });

  const expectedEmail = 'email@example.net';
  const expectedPassword = 'azerty';
  const sessionStub = new SessionStub();

  it('should authenticate the user', function() {
    // Given
    const route = this.subject();
    route.set('session', sessionStub);
    route.transitionTo = function() {
    };

    // When
    const promise = route.actions.signin.call(route, expectedEmail, expectedPassword);

    // Then
    return promise.then(() => {
      expect(sessionStub.callArgs).to.deep.equal([ 'authenticator:simple', expectedEmail, expectedPassword ]);
    });
  });
});
