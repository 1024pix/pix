import { render } from '@1024pix/ember-testing-library';
import { click, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | user-account | email-verification-code', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('resend code message', function () {
    test('should not display resend code message at the beginning', async function (assert) {
      // given
      this.set('email', 'toto@example.net');

      // when
      const screen = await render(hbs`<UserAccount::EmailVerificationCode @email={{this.email}} />`);

      // then
      const resendCodeMessage = screen.getByText(this.intl.t('pages.user-account.email-verification.did-not-receive'));
      assert.dom(resendCodeMessage).doesNotHaveClass('visible');
    });

    test(`should display a resend code message after ${ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND} milliseconds`, async function (assert) {
      // given
      const email = 'toto@example.net';
      const password = 'pix123';
      this.set('email', email);
      this.set('password', password);

      // when
      const screen = await render(
        hbs`<UserAccount::EmailVerificationCode @email={{this.email}} @password={{this.password}} />`,
      );

      // then
      assert.ok(screen.getByText(this.intl.t('pages.user-account.email-verification.did-not-receive')));
      assert.ok(
        screen.getByRole('button', {
          name: this.intl.t('pages.user-account.email-verification.send-back-the-code'),
        }),
      );
    });

    test('should prevent multiple requests to resend verification code', async function (assert) {
      // given
      const email = 'toto@example.net';
      const password = 'pix123';
      this.set('email', email);
      this.set('password', password);

      const store = this.owner.lookup('service:store');
      store.createRecord = sinon.stub();
      store.createRecord.withArgs('email-verification-code', { password, newEmail: email }).returns({
        sendNewEmail: () => new Promise(() => {}),
      });

      // when
      const screen = await render(
        hbs`<UserAccount::EmailVerificationCode @email={{this.email}} @password={{this.password}} />`,
      );

      await click(
        screen.getByRole('button', {
          name: this.intl.t('pages.user-account.email-verification.send-back-the-code'),
        }),
      );

      // then
      assert.true(
        screen.getByRole('button', {
          name: this.intl.t('pages.user-account.email-verification.send-back-the-code'),
          hidden: true,
        }).disabled,
      );
    });

    test('should show confirmation message when resending code message', async function (assert) {
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

      // when
      const screen = await render(
        hbs`<UserAccount::EmailVerificationCode @email={{this.email}} @password={{this.password}} />`,
      );

      await click(
        screen.getByRole('button', {
          name: this.intl.t('pages.user-account.email-verification.send-back-the-code'),
        }),
      );

      // then
      assert.ok(screen.getByText(this.intl.t('pages.user-account.email-verification.confirmation-message')));
      assert.notOk(
        screen.queryByRole('button', {
          name: this.intl.t('pages.user-account.email-verification.send-back-the-code'),
        }),
      );
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

      const screen = await render(hbs`<UserAccount::EmailVerificationCode
  @email={{this.email}}
  @disableEmailEditionMode={{this.disableEmailEditionMode}}
  @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
/>`);

      // when
      await triggerEvent(screen.getByRole('spinbutton', { name: 'Champ 1' }), 'paste', {
        clipboardData: { getData: () => '123456' },
      });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      assert.ok(screen.getByText(this.intl.t('pages.user-account.email-verification.errors.incorrect-code')));
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

      const screen = await render(hbs`<UserAccount::EmailVerificationCode
  @email={{this.email}}
  @disableEmailEditionMode={{this.disableEmailEditionMode}}
  @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
/>`);

      // when
      await triggerEvent(screen.getByRole('spinbutton', { name: 'Champ 1' }), 'paste', {
        clipboardData: { getData: () => '123456' },
      });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      assert.ok(
        screen.getByText(this.intl.t('pages.user-account.email-verification.errors.email-modification-demand-expired')),
      );
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

      const screen = await render(hbs`<UserAccount::EmailVerificationCode
  @email={{this.email}}
  @disableEmailEditionMode={{this.disableEmailEditionMode}}
  @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
/>`);

      // when
      await triggerEvent(screen.getByRole('spinbutton', { name: 'Champ 1' }), 'paste', {
        clipboardData: { getData: () => '123456' },
      });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      assert.ok(screen.getByText(this.intl.t('pages.user-account.email-verification.errors.new-email-already-exist')));
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

      const screen = await render(hbs`<UserAccount::EmailVerificationCode
  @email={{this.email}}
  @disableEmailEditionMode={{this.disableEmailEditionMode}}
  @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
/>`);

      // when
      await triggerEvent(screen.getByRole('spinbutton', { name: 'Champ 1' }), 'paste', {
        clipboardData: { getData: () => '123456' },
      });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      assert.ok(screen.getByText(this.intl.t('pages.user-account.email-verification.errors.unknown-error')));
    });
  });
});
