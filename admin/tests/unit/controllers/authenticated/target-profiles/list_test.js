import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/target-profiles/list', function (hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated.target-profiles.list');
  });

  module('#triggerFiltering task', function () {
    module('updating name', function () {
      test('it should update controller name field', async function (assert) {
        // given
        controller.name = 'someName';
        const expectedValue = 'someOtherName';

        // when
        await controller.triggerFiltering.perform('name', { target: { value: expectedValue } });

        // then
        assert.strictEqual(controller.name, expectedValue);
      });
    });

    module('updating id', function () {
      test('it should update controller id field', async function (assert) {
        // given
        controller.id = 'someId';
        const expectedValue = 'someOtherId';

        // when
        await controller.triggerFiltering.perform('id', { target: { value: expectedValue } });

        // then
        assert.strictEqual(controller.id, expectedValue);
      });
    });
  });
});
