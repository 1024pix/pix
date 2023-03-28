import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Service | current-user', function (hooks) {
  setupTest(hooks);

  let storeStub;
  let sessionStub;

  module('user is authenticated', function (hooks) {
    const user = { id: 1 };
    hooks.beforeEach(function () {
      sessionStub = Service.create({ isAuthenticated: true });
      storeStub = Service.create({
        queryRecord: sinon.stub().resolves(user),
      });
    });

    test('should load the current user', async function (assert) {
      // Given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);

      // When
      await currentUser.load();

      // Then
      assert.strictEqual(currentUser.user, user);
    });
  });

  module('user is not authenticated', function (hooks) {
    hooks.beforeEach(function () {
      sessionStub = Service.create({ isAuthenticated: false });
    });

    test('should do nothing', async function (assert) {
      // Given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);
      // When
      await currentUser.load();

      // Then
      assert.notOk(currentUser.user);
    });
  });

  module('user token is expired', function (hooks) {
    hooks.beforeEach(function () {
      sessionStub = Service.create({
        isAuthenticated: true,
        invalidate: sinon.stub().resolves('invalidate'),
      });
      storeStub = Service.create({
        queryRecord: sinon.stub().rejects({ errors: [{ code: 401 }] }),
      });
    });

    test('should redirect to login', async function (assert) {
      // Given
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.set('store', storeStub);
      currentUser.set('session', sessionStub);
      // When
      const result = await currentUser.load();

      // Then
      assert.strictEqual(result, 'invalidate');
    });
  });
});
