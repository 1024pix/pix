import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | user-account', function (hooks) {
  setupTest(hooks);

  module('#displayLanguageSwitch', function () {
    test('should return false if domain is french', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account');
      controller.url = { isFrenchDomainExtension: true };

      // when / then
      assert.false(controller.displayLanguageSwitch);
    });

    test('should return true if domain is not french', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/user-account');
      controller.url = { isFrenchDomainExtension: false };

      // when / then
      assert.true(controller.displayLanguageSwitch);
    });
  });
});
