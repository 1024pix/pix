import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Component | account-recovery | backup-email-confirmation-form', function (hooks) {
  setupTest(hooks);

  module('#submitBackupEmailConfirmationForm', function () {
    test('should call sendEmail', function (assert) {
      // given
      const sendEmail = sinon.stub();
      const component = createGlimmerComponent('account-recovery/backup-email-confirmation-form', {
        sendEmail,
      });
      component.email = 'john.doe@example.net';
      component.args.sendEmail = sendEmail;
      const event = { preventDefault: sinon.stub() };

      // when
      component.submitBackupEmailConfirmationForm(event);

      // then
      sinon.assert.calledWith(sendEmail, 'john.doe@example.net');
      assert.ok(true);
    });
  });

  module('#isSubmitButtonEnabled', function () {
    test('should return false if email is empty', function (assert) {
      // given
      const component = createGlimmerComponent('account-recovery/backup-email-confirmation-form');
      component.email = '';

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      assert.false(result);
    });

    test('should return false if email is not valid', function (assert) {
      // given
      const component = createGlimmerComponent('account-recovery/backup-email-confirmation-form');
      component.email = 'wrongemail';

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      assert.false(result);
    });

    test('should return true if email is valid', function (assert) {
      // given
      const component = createGlimmerComponent('account-recovery/backup-email-confirmation-form');
      component.email = 'user@example.net';

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      assert.true(result);
    });
  });
});
