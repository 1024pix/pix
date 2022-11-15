import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | error', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:error');
    assert.ok(route);
  });

  module('#hasUnauthorizedError', function (hooks) {
    let route;

    hooks.beforeEach(function () {
      route = this.owner.lookup('route:error');
    });

    test('finds an unauthorized code in the first error object', function (assert) {
      // Given
      const errorEvent = { errors: [{ status: '401' }] };

      // When
      const result = route.hasUnauthorizedError(errorEvent);

      // Then
      assert.equal(result, true);
    });

    test('returns false if there is no "errors" key', function (assert) {
      // Given
      const errorEvent = {};

      // When
      const result = route.hasUnauthorizedError(errorEvent);

      // Then
      assert.equal(result, false);
    });

    test('returns false if the "errors" key points to an empty array', function (assert) {
      // Given
      const errorEvent = { errors: [] };

      // When
      const result = route.hasUnauthorizedError(errorEvent);

      // Then
      assert.equal(result, false);
    });
  });
});
