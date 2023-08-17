import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Controller | authenticated/sup-organization-participants/list', function (hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/sup-organization-participants/list');
  });

  module('#triggerFiltering', function () {
    module('when the filters contain a valued field', function () {
      test('updates the value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', 'new-value');

        // then
        assert.strictEqual(controller.someField, 'new-value');
      });
    });

    module('when the filters contain an empty string', function () {
      test('clear the searched value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', '');

        // then
        assert.strictEqual(controller.someField, undefined);
      });
    });
  });

  module('#onResetFilter', function () {
    test('resets every filters', async function (assert) {
      // given
      controller.search = 'th';
      controller.groups = ['ing'];
      controller.studentNumber = 'co';
      controller.certificability = ['ool'];
      controller.pageNumber = 1;
      controller.pageSize = 10;

      // when
      controller.onResetFilter();

      // then
      assert.strictEqual(controller.search, null);
      assert.deepEqual(controller.groups, []);
      assert.strictEqual(controller.studentNumber, null);
      assert.deepEqual(controller.certificability, []);
      assert.strictEqual(controller.pageNumber, null);
      assert.strictEqual(controller.pageSize, 10);
    });
  });
});
