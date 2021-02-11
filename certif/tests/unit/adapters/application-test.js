import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Adapters | ApplicationAdapter', function(hooks) {
  setupTest(hooks);

  class SessionStub extends Service {
    isAuthenticated = true;
    data = {
      authenticated: { access_token: 'someAccessToken' },
    };
  }

  class AjaxQueueStub extends Service {
    add = null;
  }

  hooks.beforeEach(async function() {
    this.owner.register('service:session', SessionStub);
    this.owner.register('service:ajaxQueue', AjaxQueueStub);
  });

  test('should specify /api as the root url', function(assert) {
    // Given
    const applicationAdapter = this.owner.lookup('adapter:application');

    // Then
    assert.equal(applicationAdapter.namespace, 'api');
  });

  module('get headers()', function() {

    test('should add header with authentication token when the session is authenticated', function(assert) {
      // Given
      const access_token = '23456789';
      const applicationAdapter = this.owner.lookup('adapter:application');

      // When
      this.owner.lookup('service:session').set('isAuthenticated', true);
      this.owner.lookup('service:session').set('data', { authenticated: { access_token } });

      // Then
      assert.equal(applicationAdapter.headers['Authorization'], `Bearer ${access_token}`);
    });

    test('should not add header authentication token when the session is not authenticated', function(assert) {
      // Given
      const applicationAdapter = this.owner.lookup('adapter:application');

      // When
      this.owner.lookup('service:session').set('isAuthenticated', false);

      // Then
      assert.notOk(applicationAdapter.headers['Authorization']);
    });
  });

  module('ajax()', function() {
    test('should queue ajax calls', function(assert) {
      // Given
      const applicationAdapter = this.owner.lookup('adapter:application');
      const addStub = sinon.stub().resolves();
      this.owner.lookup('service:ajaxQueue').set('add', addStub);

      // When
      applicationAdapter.findRecord(null, { modelName: 'user' }, 1);

      // Then
      sinon.assert.calledOnce(addStub);
      assert.ok(applicationAdapter);
    });
  });
});
