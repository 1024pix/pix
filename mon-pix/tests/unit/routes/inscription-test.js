import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | inscription', function() {
  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:inscription');
    expect(route).to.be.ok;
  });

  it('should automatically authenticated user', function() {
    // Given
    const expectedEmail = 'email@example.net';
    const expectedPassword = 'Azertya1!';
    const authenticateStub = sinon.stub().resolves();
    const queryRecordStub = sinon.stub().resolves();
    const sessionStub = { authenticate: authenticateStub };
    const storeStub = { queryRecord: queryRecordStub };

    const route = this.owner.lookup('route:inscription');

    route.set('session', sessionStub);
    route.set('store', storeStub);

    // When
    const promise = route.actions.authenticateUser.call(route, {
      email: expectedEmail,
      password: expectedPassword
    });

    return promise.then(() => {
      // Then
      sinon.assert.calledWith(authenticateStub, 'authenticator:simple', { email: expectedEmail, password: expectedPassword });
    });
  });
});
