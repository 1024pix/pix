import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/sessions/list', function(hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated.sessions.list');
  });

  module('#triggerFiltering task', function() {

    module('when fieldName is id', function() {

      test('it should update controller id field', async function(assert) {
        // given
        controller.id = 'someId';

        // when
        const expectedValue = 'someOtherId';
        await controller.triggerFiltering.perform('id', { target: { value: expectedValue } });

        // then
        assert.equal(controller.id, expectedValue);
      });
    });

    module('when fieldName is status', function() {

      test('it should update controller status field', async function(assert) {
        // given
        controller.status = 'someStatus';

        // when
        const expectedValue = 'someOtherStatus';
        await controller.triggerFiltering.perform('status', expectedValue);

        // then
        assert.equal(controller.status, expectedValue);
      });
    });

    module('when fieldName is resultsSentToPrescriberAt', function() {

      test('it should update controller resultsSentToPrescriberAt field', async function(assert) {
        // given
        controller.resultsSentToPrescriberAt = 'someValue';

        // when
        const expectedValue = 'someOtherValue';
        await controller.triggerFiltering.perform('resultsSentToPrescriberAt', expectedValue);

        // then
        assert.equal(controller.resultsSentToPrescriberAt, expectedValue);
      });
    });
  });
});
