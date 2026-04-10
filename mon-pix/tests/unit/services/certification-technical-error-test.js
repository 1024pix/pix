import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | certification-technical-error', function (hooks) {
  setupTest(hooks);

  let service;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:certification-technical-error');
  });

  module('#setError', function () {
    test('sets hasError to true', function (assert) {
      // when
      service.setError({ isToBeCancelled: false });

      // then
      assert.true(service.hasError);
    });

    test('sets isToBeCancelled from the argument', function (assert) {
      // when
      service.setError({ isToBeCancelled: true });

      // then
      assert.true(service.isToBeCancelled);
    });
  });

  module('#reset', function () {
    test('resets hasError and isToBeCancelled to false', function (assert) {
      // given
      service.setError({ isToBeCancelled: true });

      // when
      service.reset();

      // then
      assert.false(service.hasError);
      assert.false(service.isToBeCancelled);
    });
  });
});
