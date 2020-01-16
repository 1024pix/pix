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

  it('should automatically authenticated user', async function() {
    // Given
    const expectedAuthenticator = 'authenticator:oauth2';
    const login = 'email@example.net';
    const password = 'Azertya1!';
    const scope = 'mon-pix';
    const authenticateStub = sinon.stub().resolves();
    const queryRecordStub = sinon.stub().resolves();
    const sessionStub = { authenticate: authenticateStub };
    const storeStub = { queryRecord: queryRecordStub };

    const route = this.owner.lookup('route:inscription');

    route.set('session', sessionStub);
    route.set('store', storeStub);

    // When
    await route.actions.authenticateUser.call(route, { login, password });

    // Then
    sinon.assert.calledWith(authenticateStub,
      expectedAuthenticator, { login, password, scope }
    );
  });
});
