import { render } from '@1024pix/ember-testing-library';
import { click, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import EmailVerificationCode from 'mon-pix/components/user-account/email-verification-code';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | user-account | email-verification-code', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('resend code message', function () {
    test('does not display resend code message at the beginning', async function (assert) {
      // given
      const email = 'toto@example.net';
      const actionType = 'update-email';

      // when
      const screen = await render(
        <template><EmailVerificationCode @email={{email}} @action={{actionType}} /></template>,
      );

      // then
      const resendCodeMessage = screen.getByText(t('pages.user-account.email-verification.did-not-receive'));
      assert.dom(resendCodeMessage).doesNotHaveClass('visible');
    });

    test(`displays a resend code message after ${ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND} milliseconds`, async function (assert) {
      // given
      const email = 'toto@example.net';
      const password = 'pix123';
      const actionType = 'update-email';

      // when
      const screen = await render(
        <template><EmailVerificationCode @email={{email}} @password={{password}} @action={{actionType}} /></template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.user-account.email-verification.did-not-receive')));
      assert.ok(
        screen.getByRole('button', {
          name: t('pages.user-account.email-verification.send-back-the-code'),
        }),
      );
    });

    test('prevents multiple requests to resend verification code', async function (assert) {
      // given
      const email = 'toto@example.net';
      const password = 'pix123';
      const actionType = 'update-email';

      const store = this.owner.lookup('service:store');
      store.createRecord = sinon.stub();
      store.createRecord
        .withArgs('email-verification-code', { password, newEmail: email, action: actionType })
        .returns({
          sendNewEmail: () => new Promise(() => {}),
        });

      // when
      const screen = await render(
        <template><EmailVerificationCode @email={{email}} @password={{password}} @action={{actionType}} /></template>,
      );

      await click(
        screen.getByRole('button', {
          name: t('pages.user-account.email-verification.send-back-the-code'),
        }),
      );

      // then
      assert.true(
        screen.getByRole('button', {
          name: t('pages.user-account.email-verification.send-back-the-code'),
          hidden: true,
        }).disabled,
      );
    });

    test('shows confirmation message when resending code message', async function (assert) {
      // given
      const email = 'toto@example.net';
      const password = 'pix123';
      const actionType = 'update-email';

      const store = this.owner.lookup('service:store');
      const sendNewEmailStub = sinon.stub();
      store.createRecord = sinon.stub();
      store.createRecord
        .withArgs('email-verification-code', { password, newEmail: email, action: actionType })
        .returns({ sendNewEmail: sendNewEmailStub });

      // when
      const screen = await render(
        <template><EmailVerificationCode @email={{email}} @password={{password}} @action={{actionType}} /></template>,
      );

      await click(
        screen.getByRole('button', {
          name: t('pages.user-account.email-verification.send-back-the-code'),
        }),
      );

      // then
      assert.ok(screen.getByText(t('pages.user-account.email-verification.confirmation-message')));
      assert.notOk(
        screen.queryByRole('button', {
          name: t('pages.user-account.email-verification.send-back-the-code'),
        }),
      );
    });
  });

  module('on validate button click', function () {
    test('when no code has been entered', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      store.createRecord = sinon.stub();
      const email = 'toto@example.net';
      const screen = await render(<template><EmailVerificationCode @email={{email}} /></template>);

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.user-account.email-verification.validate-new-email'),
        }),
      );

      // then
      assert.ok(screen.getByText(t('pages.user-account.email-verification.errors.no-code', { numInputs: 6 })));
      sinon.assert.notCalled(store.createRecord);
    });

    module('after entering code', function () {
      test('shows invalid code message when receiving INVALID_VERIFICATION_CODE error code', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const disableEmailEditionMode = sinon.stub();
        const displayEmailUpdateMessage = sinon.stub();
        const email = 'toto@example.net';
        const verifyCode = sinon.stub().throws({ errors: [{ code: 'INVALID_VERIFICATION_CODE' }] });
        store.createRecord = () => ({ verifyCode });

        const screen = await render(
          <template>
            <EmailVerificationCode
              @email={{email}}
              @disableEmailEditionMode={{disableEmailEditionMode}}
              @displayEmailUpdateMessage={{displayEmailUpdateMessage}}
            />
          </template>,
        );

        // when
        await triggerEvent(screen.getByRole('spinbutton', { name: 'Champ 1' }), 'paste', {
          clipboardData: { getData: () => '123456' },
        });
        await click(
          screen.getByRole('button', {
            name: t('pages.user-account.email-verification.validate-new-email'),
          }),
        );

        // then
        sinon.assert.notCalled(disableEmailEditionMode);
        sinon.assert.notCalled(displayEmailUpdateMessage);
        assert.ok(screen.getByText(t('pages.user-account.email-verification.errors.incorrect-code')));
      });

      test('shows demand expired message when receiving EXPIRED_OR_NULL_EMAIL_MODIFICATION_DEMAND error code', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const disableEmailEditionMode = sinon.stub();
        const displayEmailUpdateMessage = sinon.stub();
        const email = 'toto@example.net';
        const verifyCode = sinon.stub().throws({
          errors: [
            {
              code: 'EXPIRED_OR_NULL_EMAIL_MODIFICATION_DEMAND',
            },
          ],
        });
        store.createRecord = () => ({ verifyCode });

        const screen = await render(
          <template>
            <EmailVerificationCode
              @email={{email}}
              @disableEmailEditionMode={{disableEmailEditionMode}}
              @displayEmailUpdateMessage={{displayEmailUpdateMessage}}
            />
          </template>,
        );

        // when
        await triggerEvent(screen.getByRole('spinbutton', { name: 'Champ 1' }), 'paste', {
          clipboardData: { getData: () => '123456' },
        });
        await click(
          screen.getByRole('button', {
            name: t('pages.user-account.email-verification.validate-new-email'),
          }),
        );

        // then
        sinon.assert.notCalled(disableEmailEditionMode);
        sinon.assert.notCalled(displayEmailUpdateMessage);
        assert.ok(
          screen.getByText(t('pages.user-account.email-verification.errors.email-modification-demand-expired')),
        );
      });

      test('shows email already exists message when receiving INVALID_OR_ALREADY_USED_EMAIL error code', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const disableEmailEditionMode = sinon.stub();
        const displayEmailUpdateMessage = sinon.stub();
        const email = 'toto@example.net';
        const verifyCode = sinon.stub().throws({
          errors: [
            {
              code: 'INVALID_OR_ALREADY_USED_EMAIL',
            },
          ],
        });
        store.createRecord = () => ({ verifyCode });

        const screen = await render(
          <template>
            <EmailVerificationCode
              @email={{email}}
              @disableEmailEditionMode={{disableEmailEditionMode}}
              @displayEmailUpdateMessage={{displayEmailUpdateMessage}}
            />
          </template>,
        );

        // when
        await triggerEvent(screen.getByRole('spinbutton', { name: 'Champ 1' }), 'paste', {
          clipboardData: { getData: () => '123456' },
        });
        await click(
          screen.getByRole('button', {
            name: t('pages.user-account.email-verification.validate-new-email'),
          }),
        );

        // then
        sinon.assert.notCalled(disableEmailEditionMode);
        sinon.assert.notCalled(displayEmailUpdateMessage);
        assert.ok(screen.getByText(t('pages.user-account.email-verification.errors.new-email-already-exist')));
      });

      test('shows error message when receiving 500', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const disableEmailEditionMode = sinon.stub();
        const displayEmailUpdateMessage = sinon.stub();
        const email = 'toto@example.net';
        const verifyCode = sinon.stub().throws({ errors: [{ status: '500' }] });
        store.createRecord = () => ({ verifyCode });

        const screen = await render(
          <template>
            <EmailVerificationCode
              @email={{email}}
              @disableEmailEditionMode={{disableEmailEditionMode}}
              @displayEmailUpdateMessage={{displayEmailUpdateMessage}}
            />
          </template>,
        );

        // when
        await triggerEvent(screen.getByRole('spinbutton', { name: 'Champ 1' }), 'paste', {
          clipboardData: { getData: () => '123456' },
        });
        await click(
          screen.getByRole('button', {
            name: t('pages.user-account.email-verification.validate-new-email'),
          }),
        );

        // then
        sinon.assert.notCalled(disableEmailEditionMode);
        sinon.assert.notCalled(displayEmailUpdateMessage);
        assert.ok(screen.getByText(t('pages.user-account.email-verification.errors.unknown-error')));
      });
    });
  });
});
