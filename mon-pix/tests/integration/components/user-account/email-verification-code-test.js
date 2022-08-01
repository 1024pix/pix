import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import findByLabel from '../../../helpers/find-by-label';
import { contains } from '../../../helpers/contains';
import ENV from 'mon-pix/config/environment';
import sinon from 'sinon';
import { clickByLabel } from '../../../helpers/click-by-label';

module('Integration | Component | user-account | email-verification-code', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('resend code message', function () {
    test('should not display resend code message at the beginning', async function (assert) {
      // given
      this.set('email', 'toto@example.net');

      // when
      await render(hbs`<UserAccount::EmailVerificationCode @email={{this.email}} />`);

      // then
      assert
        .dom(findByLabel(this.intl.t('pages.user-account.email-verification.did-not-receive')))
        .doesNotHaveClass('visible');
    });

    test(`should display a resend code message after ${ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND} milliseconds`, function (assert) {
      // given
      const email = 'toto@example.net';
      const password = 'pix123';
      this.set('email', email);
      this.set('password', password);

      const clock = sinon.useFakeTimers();

      // when
      const promise = render(
        hbs`<UserAccount::EmailVerificationCode @email={{this.email}} @password={{this.password}} />`
      );
      clock.tick(ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);

      const result = promise.then(async () => {
        assert.dom(contains(this.intl.t('pages.user-account.email-verification.did-not-receive'))).exists();
        assert.dom(contains(this.intl.t('pages.user-account.email-verification.send-back-the-code'))).exists();
      });
      clock.restore();
      return result;
    });

    test('should prevent multiple requests to resend verification code', function (assert) {
      // given
      const email = 'toto@example.net';
      const password = 'pix123';
      this.set('email', email);
      this.set('password', password);

      const store = this.owner.lookup('service:store');
      store.createRecord = sinon.stub();
      store.createRecord
        .withArgs('email-verification-code', { password, newEmail: email })
        .returns({ sendNewEmail: () => new Promise(() => {}) });

      const clock = sinon.useFakeTimers();

      // when
      const promise = render(
        hbs`<UserAccount::EmailVerificationCode @email={{this.email}} @password={{this.password}} />`
      );
      clock.tick(ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);

      const result = promise.then(async () => {
        await clickByLabel(this.intl.t('pages.user-account.email-verification.send-back-the-code'));

        // then
        assert.dom(findByLabel(this.intl.t('pages.user-account.email-verification.send-back-the-code'))).isDisabled;
      });
      clock.restore();
      return result;
    });

    test('should show confirmation message when resending code message', function (assert) {
      // given
      const email = 'toto@example.net';
      const password = 'pix123';
      this.set('email', email);
      this.set('password', password);

      const store = this.owner.lookup('service:store');
      const sendNewEmailStub = sinon.stub();
      store.createRecord = sinon.stub();
      store.createRecord
        .withArgs('email-verification-code', { password, newEmail: email })
        .returns({ sendNewEmail: sendNewEmailStub });

      const clock = sinon.useFakeTimers();

      // when
      const promise = render(
        hbs`<UserAccount::EmailVerificationCode @email={{this.email}} @password={{this.password}} />`
      );
      clock.tick(ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);

      const result = promise.then(async () => {
        await clickByLabel(this.intl.t('pages.user-account.email-verification.send-back-the-code'));

        // then
        assert.dom(contains(this.intl.t('pages.user-account.email-verification.confirmation-message'))).exists();
        assert.dom(contains(this.intl.t('pages.user-account.email-verification.send-back-the-code'))).doesNotExist();
      });
      clock.restore();
      return result;
    });
  });

  module('after entering code', function () {
    test('should show invalid code message when receiving 403', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const disableEmailEditionMode = sinon.stub();
      const displayEmailUpdateMessage = sinon.stub();
      this.set('disableEmailEditionMode', disableEmailEditionMode);
      this.set('displayEmailUpdateMessage', displayEmailUpdateMessage);
      this.set('email', 'toto@example.net');
      const verifyCode = sinon.stub().throws({ errors: [{ status: '403', code: 'INVALID_VERIFICATION_CODE' }] });
      store.createRecord = () => ({ verifyCode });

      await render(hbs`<UserAccount::EmailVerificationCode
        @email={{this.email}}
        @disableEmailEditionMode={{this.disableEmailEditionMode}}
        @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
      />`);

      // when
      await triggerEvent('#code-input-1', 'paste', { clipboardData: { getData: () => '123456' } });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      assert.dom(contains(this.intl.t('pages.user-account.email-verification.errors.incorrect-code'))).exists();
    });

    test('should show demand expired message when receiving 403', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const disableEmailEditionMode = sinon.stub();
      const displayEmailUpdateMessage = sinon.stub();
      this.set('disableEmailEditionMode', disableEmailEditionMode);
      this.set('displayEmailUpdateMessage', displayEmailUpdateMessage);
      this.set('email', 'toto@example.net');
      const verifyCode = sinon.stub().throws({
        errors: [
          {
            status: '403',
            code: 'EXPIRED_OR_NULL_EMAIL_MODIFICATION_DEMAND',
          },
        ],
      });
      store.createRecord = () => ({ verifyCode });

      await render(hbs`<UserAccount::EmailVerificationCode
        @email={{this.email}}
        @disableEmailEditionMode={{this.disableEmailEditionMode}}
        @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
      />`);

      // when
      await triggerEvent('#code-input-1', 'paste', { clipboardData: { getData: () => '123456' } });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      assert
        .dom(contains(this.intl.t('pages.user-account.email-verification.errors.email-modification-demand-expired')))
        .exists();
    });

    test('should show email already exists message when receiving 400', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const disableEmailEditionMode = sinon.stub();
      const displayEmailUpdateMessage = sinon.stub();
      this.set('disableEmailEditionMode', disableEmailEditionMode);
      this.set('displayEmailUpdateMessage', displayEmailUpdateMessage);
      this.set('email', 'toto@example.net');
      const verifyCode = sinon.stub().throws({
        errors: [
          {
            status: '400',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS',
          },
        ],
      });
      store.createRecord = () => ({ verifyCode });

      await render(hbs`<UserAccount::EmailVerificationCode
        @email={{this.email}}
        @disableEmailEditionMode={{this.disableEmailEditionMode}}
        @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
      />`);

      // when
      await triggerEvent('#code-input-1', 'paste', { clipboardData: { getData: () => '123456' } });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      assert
        .dom(contains(this.intl.t('pages.user-account.email-verification.errors.new-email-already-exist')))
        .exists();
    });

    test('should show error message when receiving 500', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const disableEmailEditionMode = sinon.stub();
      const displayEmailUpdateMessage = sinon.stub();
      this.set('disableEmailEditionMode', disableEmailEditionMode);
      this.set('displayEmailUpdateMessage', displayEmailUpdateMessage);
      this.set('email', 'toto@example.net');
      const verifyCode = sinon.stub().throws({ errors: [{ status: '500' }] });
      store.createRecord = () => ({ verifyCode });

      await render(hbs`<UserAccount::EmailVerificationCode
        @email={{this.email}}
        @disableEmailEditionMode={{this.disableEmailEditionMode}}
        @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
      />`);

      // when
      await triggerEvent('#code-input-1', 'paste', { clipboardData: { getData: () => '123456' } });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      assert.dom(contains(this.intl.t('pages.user-account.email-verification.errors.unknown-error'))).exists();
    });
  });
});
