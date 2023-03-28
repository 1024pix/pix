import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | user-account | email-verification-code', function (hooks) {
  setupTest(hooks);

  module('#onSubmitCode', function () {
    test('should send entered code for verification and redirect to account page with successful message', async function (assert) {
      // given
      const component = createGlimmerComponent('component:user-account/email-verification-code');
      const code = '918435';
      const verifyCode = sinon.stub();
      component.store = { createRecord: () => ({ verifyCode }) };
      component.args.disableEmailEditionMode = sinon.stub();
      component.args.displayEmailUpdateMessage = sinon.stub();
      sinon.spy(component.store, 'createRecord');

      // when
      await component.onSubmitCode(code);

      // then
      sinon.assert.calledWith(component.store.createRecord, 'email-verification-code', { code });
      sinon.assert.calledOnce(verifyCode);
      sinon.assert.calledOnce(component.args.disableEmailEditionMode);
      sinon.assert.calledOnce(component.args.displayEmailUpdateMessage);
      assert.ok(true);
    });

    test('should update the user email when code verification is successful', async function (assert) {
      // given
      const component = createGlimmerComponent('component:user-account/email-verification-code');
      const code = '918435';
      const newEmail = 'new-email@example.net';
      const verifyCode = sinon.stub().returns(newEmail);
      component.store = { createRecord: () => ({ verifyCode }) };
      component.currentUser = { user: { email: 'old-email@example.net' } };
      component.args.disableEmailEditionMode = sinon.stub();
      component.args.displayEmailUpdateMessage = sinon.stub();
      sinon.spy(component.store, 'createRecord');

      // when
      await component.onSubmitCode(code);

      // then
      assert.strictEqual(component.currentUser.user.email, newEmail);
    });
  });

  module('#resendVerificationCodeByEmail', function () {
    test('should be loading while resending email', function (assert) {
      // given
      const component = createGlimmerComponent('component:user-account/email-verification-code');
      const newEmail = 'toto@example.net';
      const password = 'pix123';
      component.isResending = false;
      component.args.email = newEmail;
      component.args.password = password;
      component.store = { createRecord: () => ({ sendNewEmail: () => new Promise(() => {}) }) };

      // when
      component.resendVerificationCodeByEmail();

      // then
      assert.true(component.isResending);
    });

    test('should show success message after resending', async function (assert) {
      // given
      const component = createGlimmerComponent('component:user-account/email-verification-code');
      const newEmail = 'toto@example.net';
      const password = 'pix123';
      component.isEmailSent = false;
      component.args.email = newEmail;
      component.args.password = password;
      component.store = { createRecord: () => ({ sendNewEmail: sinon.stub() }) };

      // when
      await component.resendVerificationCodeByEmail();

      // then
      assert.true(component.isEmailSent);
      assert.false(component.isResending);
    });
  });
});
