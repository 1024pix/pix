import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

class SessionStub {
  constructor() {
    this.isInvalidateCalled = false;
  }

  invalidate() {
    this.isInvalidateCalled = true;
  }
}

describe('Unit | Route | logout', () => {
  setupTest('route:logout', {
    needs: ['service:current-routed-modal', 'service:session']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  it('should disconnect the user', function() {
    // Given
    const route = this.subject();
    const sessionStub = new SessionStub();
    route.set('session', sessionStub);
    route.transitionTo = function() {
    };

    // When
    route.beforeModel();

    // Then
    expect(sessionStub.isInvalidateCalled).to.be.true;
  });

  it('should redirect after disconnection', function() {
    // Given
    let isTransitionToCalled = false;
    let isTransitionToArgs = [];

    const sessionStub = new SessionStub();
    const route = this.subject();
    route.set('session', sessionStub);
    route.transitionTo = function() {
      isTransitionToCalled = true;
      isTransitionToArgs = Array.from(arguments);
    };

    // When
    route.beforeModel();

    // Then
    expect(isTransitionToCalled).to.be.true;
    expect(isTransitionToArgs).to.deep.equal(['/']);
  });

});
