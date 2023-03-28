import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/sessions/list/all', function (hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated.sessions.list.all');
  });

  module('#triggerFiltering task', function () {
    module('when fieldName is id', function () {
      test('it should update controller id field', async function (assert) {
        // given
        controller.id = 'someId';

        // when
        const expectedValue = 'someOtherId';
        await controller.triggerFiltering.perform('id', { target: { value: expectedValue } });

        // then
        assert.strictEqual(controller.id, expectedValue);
      });
    });

    module('when fieldName is certificationCenterName', function () {
      test('it should update controller certificationCenterName field', async function (assert) {
        // given
        controller.certificationCenterName = 'someName';

        // when
        const expectedValue = 'someOtherName';
        await controller.triggerFiltering.perform('certificationCenterName', { target: { value: expectedValue } });

        // then
        assert.strictEqual(controller.certificationCenterName, expectedValue);
      });
    });

    module('when fieldName is status', function () {
      test('it should update controller status field', async function (assert) {
        // given
        controller.status = 'someStatus';

        // when
        const expectedValue = 'someOtherStatus';
        await controller.triggerFiltering.perform('status', expectedValue);

        // then
        assert.strictEqual(controller.status, expectedValue);
      });
    });

    module('when fieldName is resultsSentToPrescriberAt', function () {
      test('it should update controller resultsSentToPrescriberAt field', async function (assert) {
        // given
        controller.resultsSentToPrescriberAt = 'someValue';

        // when
        const expectedValue = 'someOtherValue';
        await controller.triggerFiltering.perform('resultsSentToPrescriberAt', expectedValue);

        // then
        assert.strictEqual(controller.resultsSentToPrescriberAt, expectedValue);
      });
    });

    module('when fieldName is certificationCenterType', function () {
      test('should update controller certificationCenterType field', async function (assert) {
        // given
        controller.certificationCenterType = 'someType';

        // when
        const expectedValue = 'newType';
        await controller.triggerFiltering.perform('certificationCenterType', expectedValue);

        // then
        assert.strictEqual(controller.certificationCenterType, expectedValue);
      });
    });
  });
});
