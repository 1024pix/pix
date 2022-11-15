import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | account-recovery | update-sco-record-form', function (hooks) {
  setupTest(hooks);

  module('#isSubmitButtonEnabled', function () {
    test('should return false if password is not valid and cgu are not accepted', function (assert) {
      // given
      const component = createGlimmerComponent('component:account-recovery/update-sco-record-form');
      component.password = 'Pass';
      component.cguAndProtectionPoliciesAccepted = false;

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      assert.equal(result, false);
    });

    test('should return false if password is valid and cgu are not accepted', function (assert) {
      // given
      const component = createGlimmerComponent('component:account-recovery/update-sco-record-form');
      component.password = 'Password123';
      component.cguAndProtectionPoliciesAccepted = false;

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      assert.equal(result, false);
    });

    test('should return true if password is valid and cgu are accepted', function (assert) {
      // given
      const component = createGlimmerComponent('component:account-recovery/update-sco-record-form');
      component.password = 'Password123';
      component.cguAndProtectionPoliciesAccepted = true;

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      assert.equal(result, true);
    });
  });
});
