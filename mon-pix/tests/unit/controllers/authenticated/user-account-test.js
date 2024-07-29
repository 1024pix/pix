import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Controller | user-account', function (hooks) {
  setupTest(hooks);

  module('#isInternationalDomain', function () {
    test('should return false if domain is french', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account');
      controller.currentDomain = { isFranceDomain: true };

      // when / then
      assert.false(controller.isInternationalDomain);
    });

    test('should return true if domain is not french', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account');
      controller.currentDomain = { isFranceDomain: false };

      // when / then
      assert.true(controller.isInternationalDomain);
    });
  });
});
