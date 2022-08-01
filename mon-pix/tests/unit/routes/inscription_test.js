import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | inscription', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:inscription');
    assert.ok(route);
  });

  test('should automatically authenticated user', async function (assert) {
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
    assert.expect(0);
    sinon.assert.calledWith(authenticateStub, expectedAuthenticator, { login, password, scope });
  });
});
