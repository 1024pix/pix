import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapters | ApplicationAdapter', function (hooks) {
  setupTest(hooks);

  test('should specify /api as the root url', function (assert) {
    // given
    const applicationAdapter = this.owner.lookup('adapter:application');

    // then
    assert.strictEqual(applicationAdapter.namespace, 'api');
  });

  module('get headers()', function () {
    test('should add header with authentication token when the session is authenticated', function (assert) {
      // given
      const access_token = '23456789';
      const applicationAdapter = this.owner.lookup('adapter:application');

      // when
      applicationAdapter.set('session', { isAuthenticated: true, data: { authenticated: { access_token } } });

      // then
      assert.strictEqual(applicationAdapter.headers['Authorization'], `Bearer ${access_token}`);
    });

    test('should not add header authentication token when the session is not authenticated', function (assert) {
      // Given
      const applicationAdapter = this.owner.lookup('adapter:application');

      // When
      applicationAdapter.set('session', {});

      // Then
      assert.notOk(applicationAdapter.headers['Authorization']);
    });
  });

  module('ajax()', function () {
    test('should queue ajax calls', function (assert) {
      // Given
      const applicationAdapter = this.owner.lookup('adapter:application');
      applicationAdapter.ajaxQueue = { add: sinon.stub().resolves() };

      // When
      applicationAdapter.findRecord(null, { modelName: 'user' }, 1);

      // Then
      sinon.assert.calledOnce(applicationAdapter.ajaxQueue.add);
      assert.ok(applicationAdapter);
    });
  });
});
