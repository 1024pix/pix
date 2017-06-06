import Ember from 'ember';
import { expect } from 'chai';
import { describe, it} from 'mocha';
import { setupTest } from 'ember-mocha';

const expectedToken = 'bH72bvnj4512)çè!2B$ùKJ2b!3,2ppyB';

class StoreStub {
  constructor() {
    this.calls = [];
  }

  createRecord() {
    this.createRecordIsCalled = true;
    this.calls.push(Array.from(arguments));
    return this;
  }

  save() {
    this.saveIsCalled = true;
    const loginWithToken = Ember.Object.extend({ token: expectedToken }).create();
    return Promise.resolve(loginWithToken);
  }
}

class SessionStub {
  authenticate() {
    this.callArgs = Array.from(arguments);
  }
}

describe('Unit | Route | connexion', function() {
  setupTest('route:connexion', {
    needs: ['service:current-routed-modal', 'service:authentication', 'service:session']
  });

  const expectedEmail = 'email@example.net';
  const expectedPassword = 'azerty';
  const storeStub = new StoreStub();
  const sessionStub = new SessionStub();

  it('should record the login', function() {
    // Given
    const route = this.subject();
    route.transitionTo = function() {};

    route.set('store', storeStub);
    route.set('session', sessionStub);

    // When
    const promise = route.actions.signin.call(route, expectedEmail, expectedPassword);

    // Then
    return promise.then(() => {
      expect(storeStub.createRecordIsCalled).to.be.true;
      expect(storeStub.calls[0]).to.deep.equal(['authentication', {email: expectedEmail, password: expectedPassword}]);
    });
  });

  it('should save the login', function() {
    // Given
    const route = this.subject();
    route.transitionTo = function() {};

    route.set('store', storeStub);
    route.set('session', sessionStub);

    // When
    const promise = route.actions.signin.call(route, expectedEmail, expectedPassword);

    // Then
    return promise.then(() => {
      expect(storeStub.saveIsCalled).to.be.true;
    });
  });

  it('should authenticate the user', function() {
    // Given
    const route = this.subject();
    route.transitionTo = function() {};

    route.set('store', storeStub);
    route.set('session', sessionStub);

    // When
    const promise = route.actions.signin.call(route, expectedEmail, expectedPassword);

    // Then
    return promise.then(() => {
      expect(sessionStub.callArgs).to.deep.equal(['authenticator:simple', expectedToken]);
    });
  });
});
