import { RESTAdapter } from '@warp-drive/legacy/adapter/rest';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubSessionService } from '../../helpers/service-stubs.js';

module('Unit | Adapters | ApplicationAdapter', function (hooks) {
  setupTest(hooks);

  test('should specify /api as the root url', function (assert) {
    // Given
    const applicationAdapter = this.owner.lookup('adapter:application');

    // Then
    assert.strictEqual(applicationAdapter.namespace, 'api');
  });

  module('get headers()', function () {
    module('Authorization headers', function () {
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
      assert.ok(true);
    });
  });

  module('handleResponse()', function () {
    module('when an HTTP status code 401 is received', function () {
      test('should invalidate the current session', function (assert) {
        // given
        const applicationAdapter = this.owner.lookup('adapter:application');
        applicationAdapter.session = {
          invalidate: sinon.stub(),
          isAuthenticated: true,
        };
        const status = 401;
        const headers = {};
        const payload = {};
        const requestData = {};

        // when
        applicationAdapter.handleResponse(status, headers, payload, requestData);

        // then
        sinon.assert.calledOnce(applicationAdapter.session.invalidate);
        assert.ok(true);
      });
    });

    module('when the HTTP status code received is different from 401', function () {
      test('should not invalidate the current session', function (assert) {
        // given
        const sessionService = stubSessionService(this.owner, { isAuthenticated: true });
        const applicationAdapter = this.owner.lookup('adapter:application');
        sinon.stub(RESTAdapter.prototype, 'handleResponse');

        // when
        applicationAdapter.handleResponse(302);

        // then
        sinon.assert.notCalled(sessionService.invalidate);
        sinon.assert.calledOnce(RESTAdapter.prototype.handleResponse);
        sinon.restore();
        assert.ok(true);
      });
    });
  });
});
