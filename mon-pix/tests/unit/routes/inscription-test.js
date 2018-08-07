import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | inscription', function() {
  setupTest('route:inscription', {
    needs: ['service:current-routed-modal', 'service:session']
  });

  it('exists', function() {
    const route = this.subject();
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

    const route = this.subject();
    route.set('session', sessionStub);
    route.set('store', storeStub);

    // When
    const promise = route.actions.authenticateUser.call(route, {
      email: expectedEmail,
      password: expectedPassword
    });

    return promise.then(() => {
      // Then
      sinon.assert.calledWith(authenticateStub, 'authenticator:simple', expectedEmail, expectedPassword);
      sinon.assert.calledWith(queryRecordStub, 'user', {});
    });
  });
});
