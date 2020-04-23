import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/organizations/list', function(hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated.organizations.list');
  });

  module('#triggerFiltering task', function() {

    module('updating name', function() {

      test('it should update controller name field', async function(assert) {
        // given
        controller.name = 'someName';
        const expectedValue = 'someOtherName';
        
        // when
        await controller.triggerFiltering.perform('name', { target: { value: expectedValue } });

        // then
        assert.equal(controller.name, expectedValue);
      });
    });

    module('updating type', function() {

      test('it should update controller type field', async function(assert) {
        // given
        controller.type = 'someType';
        const expectedValue = 'someOtherType';

        // when
        await controller.triggerFiltering.perform('type', { target: { value: expectedValue } });

        // then
        assert.equal(controller.type, expectedValue);
      });
    });

    module('updating externalId', function() {

      test('it should update controller externalId field', async function(assert) {
        // given
        controller.externalId = 'someExternalId';
        const expectedValue = 'someOtherExternalId';

        // when
        await controller.triggerFiltering.perform('externalId', { target: { value: expectedValue } });

        // then
        assert.equal(controller.externalId, expectedValue);
      });
    });
  });
});
