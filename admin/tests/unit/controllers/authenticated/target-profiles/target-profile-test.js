import { module, test, only } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/target-profiles/target-profile', function(hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated.target-profiles.target-profile');
    console.log(controller);
  });

  only('#updateProfileName', function() {
    test('it should update controller name field', async function(assert) {
      // given
      controller.name = 'someName';
      const expectedValue = 'someOtherName';

      // when
      await controller.updateProfileName({ name: expectedValue });

      // then
      assert.equal(controller.name, expectedValue);
    });

  });

});
