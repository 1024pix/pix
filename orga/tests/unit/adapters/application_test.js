import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | ApplicationAdapter', function (hooks) {
  setupTest(hooks);

  test('should specify /api as the root url', function (assert) {
    // Given
    const applicationAdapter = this.owner.lookup('adapter:application');

    // Then
    assert.strictEqual(applicationAdapter.namespace, 'api');
  });

  module('get headers()', function () {
    test('should add header with authentication token when the session is authenticated', function (assert) {
      // Given
      const access_token = '23456789';
      const applicationAdapter = this.owner.lookup('adapter:application');

      // When
      applicationAdapter.set('session', { isAuthenticated: true, data: { authenticated: { access_token } } });

      // Then
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

    test('should add Accept-Language header set to fr-fr when the current domain contains pix.fr and locale is "fr"', function (assert) {
      // Given
      const applicationAdapter = this.owner.lookup('adapter:application');
      applicationAdapter.intl = { primaryLocale: 'fr' };

      // When
      applicationAdapter.set('currentDomain', {
        getExtension() {
          return 'fr';
        },
      });

      // Then
      assert.strictEqual(applicationAdapter.headers['Accept-Language'], 'fr-fr');
    });

    test('should add Accept-Language header set to fr when the current domain contains pix.org and locale is "fr"', function (assert) {
      // Given
      const applicationAdapter = this.owner.lookup('adapter:application');
      applicationAdapter.intl = { primaryLocale: 'fr' };

      // When
      applicationAdapter.set('currentDomain', {
        getExtension() {
          return 'org';
        },
      });

      // Then
      assert.strictEqual(applicationAdapter.headers['Accept-Language'], 'fr');
    });

    test('should add Accept-Language header set to en when locale is "en"', function (assert) {
      // Given
      const applicationAdapter = this.owner.lookup('adapter:application');

      // When
      applicationAdapter.intl = { primaryLocale: 'en' };

      // Then
      assert.strictEqual(applicationAdapter.headers['Accept-Language'], 'en');
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
