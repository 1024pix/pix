import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/organization-participants', function (hooks) {
  setupTest(hooks);

  module('#triggerFiltering', function () {
    module('when the filters contain the field fullName', function () {
      test('updates the fullName value', async function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/organization-participants/list');

        controller.fullName = 'old-value';

        // when
        controller.triggerFiltering('fullName', 'new-value');

        // then
        assert.strictEqual(controller.fullName, 'new-value');
      });
    });

    module('when the filters contain an empty for fullName', function () {
      test('clear the searched value', async function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/organization-participants/list');

        controller.fullName = 'old-value';

        // when
        controller.triggerFiltering('fullName', '');

        // then
        assert.strictEqual(controller.fullName, undefined);
      });
    });
  });

  module('#resetFilters', function () {
    test('it resets all filters', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/organization-participants/list');

      controller.fullName = 'value';
      controller.pageNumber = 2;

      // when
      controller.resetFilters();

      // then
      assert.strictEqual(controller.fullName, null);
      assert.strictEqual(controller.pageNumber, null);
    });
  });
});
