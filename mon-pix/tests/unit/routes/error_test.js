import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import JSONApiError from 'mon-pix/errors/json-api-error';
import { ApplicationError } from 'mon-pix/errors/application-error';

module('Unit | Route | error', function (hooks) {
  setupTest(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:error');
  });

  test('exists', function (assert) {
    assert.ok(route);
  });

  module('#setupController', function () {
    test('handles api errors', function (assert) {
      // Given
      const controller = {};
      const error = { errors: [{ status: '503', title: 'Service Unavailable', detail: 'The service is unavailable' }] };

      // When
      route.setupController(controller, error);

      // Then
      assert.strictEqual(controller.errorMessage, error);
      assert.strictEqual(controller.errorDetail, error.errors[0].detail);
      assert.strictEqual(controller.errorStatus, error.errors[0].status);
      assert.strictEqual(controller.errorTitle, error.errors[0].title);
    });

    test('handles json api errors', function (assert) {
      // Given
      const controller = {};
      const error = new JSONApiError('This is an error message', {
        status: '503',
        title: 'Service Unavailable',
        detail: 'The service is unavailable',
      });

      // When
      route.setupController(controller, error);

      // Then
      assert.strictEqual(controller.errorMessage, error.message);
      assert.strictEqual(controller.errorDetail, null);
      assert.strictEqual(controller.errorStatus, error.status);
      assert.strictEqual(controller.errorTitle, error.title);
    });

    test('handles application errors', function (assert) {
      // Given
      const controller = {};
      const error = new ApplicationError({ message: 'This is an error message' });

      // When
      route.setupController(controller, error);

      // Then
      assert.strictEqual(controller.errorMessage, error.message);
      assert.strictEqual(controller.errorDetail, null);
      assert.strictEqual(controller.errorStatus, null);
      assert.strictEqual(controller.errorTitle, null);
    });

    test('handles unhandled errors', function (assert) {
      // Given
      const controller = {};
      const error = 'This is an error message';

      // When
      route.setupController(controller, error);

      // Then
      assert.strictEqual(controller.errorMessage, error);
      assert.strictEqual(controller.errorDetail, null);
      assert.strictEqual(controller.errorStatus, null);
      assert.strictEqual(controller.errorTitle, null);
    });
  });

  module('#hasUnauthorizedError', function () {
    test('finds an unauthorized code in the first error object', function (assert) {
      // Given
      const errorEvent = { errors: [{ status: '401' }] };

      // When
      const result = route.hasUnauthorizedError(errorEvent);

      // Then
      assert.true(result);
    });

    test('returns false if there is no "errors" key', function (assert) {
      // Given
      const errorEvent = {};

      // When
      const result = route.hasUnauthorizedError(errorEvent);

      // Then
      assert.false(result);
    });

    test('returns false if the "errors" key points to an empty array', function (assert) {
      // Given
      const errorEvent = { errors: [] };

      // When
      const result = route.hasUnauthorizedError(errorEvent);

      // Then
      assert.false(result);
    });
  });
});
