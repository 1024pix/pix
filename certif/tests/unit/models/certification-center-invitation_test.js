import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Models | certification-center-invitation', function (hooks) {
  setupTest(hooks);

  let store;
  let certificationCenterInvitation;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    certificationCenterInvitation = store.createRecord('certification-center-invitation');
  });

  test('returns the default value of "isResendingInvitation" attribute', function (assert) {
    // given
    // when
    // then
    assert.false(certificationCenterInvitation.isResendingInvitation);
  });

  module('when updating the value of "isResendingInvitation" attribute', function () {
    test('returns the updated value', function (assert) {
      // given
      // when
      certificationCenterInvitation.isResendingInvitation = true;

      // then
      assert.true(certificationCenterInvitation.isResendingInvitation);
    });
  });
});
