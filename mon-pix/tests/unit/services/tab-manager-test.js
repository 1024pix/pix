import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Services | TabManager', function (hooks) {
  setupTest(hooks);

  module('setActiveTab', function () {
    test('default tab', function (assert) {
      // given
      const tabManagerService = this.owner.lookup('service:tab-manager');

      // then
      assert.strictEqual(tabManagerService.activeTab, 0);
    });

    test('should set active tab to the given tab', function (assert) {
      // given
      const tabManagerService = this.owner.lookup('service:tab-manager');

      // when
      tabManagerService.setActiveTab(1);

      // then
      assert.strictEqual(tabManagerService.activeTab, 1);
    });
  });
});
