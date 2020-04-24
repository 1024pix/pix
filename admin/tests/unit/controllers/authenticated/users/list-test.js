import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/users/list', function(hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated.users.list');
  });

  module('#triggerFiltering task', function() {

    module('updating firstName', function() {

      test('it should update controller firstName field', async function(assert) {
        // given
        controller.firstName = 'someFirstName';
        const expectedValue = 'someOtherFirstName';

        // when
        await controller.triggerFiltering.perform('firstName', { target: { value: expectedValue } });

        // then
        assert.equal(controller.firstName, expectedValue);
      });
    });

    module('updating lastName', function() {

      test('it should update controller lastName field', async function(assert) {
        // given
        controller.lastName = 'someLastName';
        const expectedValue = 'someOtherLastName';

        // when
        await controller.triggerFiltering.perform('lastName', { target: { value: expectedValue } });

        // then
        assert.equal(controller.lastName, expectedValue);
      });
    });

    module('updating email', function() {

      test('it should update controller email field', async function(assert) {
        // given
        controller.email = 'someEmail';
        const expectedValue = 'someOtherEmail';

        // when
        await controller.triggerFiltering.perform('email', { target: { value: expectedValue } });

        // then
        assert.equal(controller.email, expectedValue);
      });
    });
  });
});
