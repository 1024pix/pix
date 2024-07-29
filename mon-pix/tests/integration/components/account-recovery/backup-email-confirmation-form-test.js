import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | account-recovery::backup-email-confirmation-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  const firstName = 'Philippe';
  const existingEmail = 'philippe@example.net';

  module('when the user already has an email associated with his account', function () {
    test('should render recover account backup email confirmation form with the existing email', async function (assert) {
      // given
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);
      this.set('firstName', firstName);
      this.set('existingEmail', existingEmail);

      // when
      const screen = await render(
        hbs`<AccountRecovery::BackupEmailConfirmationForm @firstName={{this.firstName}} @existingEmail={{this.existingEmail}} @resetErrors={{this.resetErrors}}/>`,
      );

      // then
      assert.ok(
        screen.getByText(
          this.intl.t(
            'pages.account-recovery.find-sco-record.backup-email-confirmation.email-already-exist-for-account-message',
          ),
        ),
      );
      assert.ok(
        screen.getByText(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-valid-message'),
          { exact: false },
        ),
      );
      assert.ok(
        screen.getByText(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.ask-for-new-email-message'),
          { exact: false },
        ),
      );
      assert.ok(
        screen.getByRole('link', {
          name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-reset-message'),
        }),
      );
      assert.ok(
        screen.getByRole('textbox', {
          name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email'),
        }),
      );

      const submitButton = screen.getByRole('button', {
        name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit'),
      });

      assert.ok(submitButton);
      assert.true(submitButton.disabled);
    });
  });

  module('when the user does not have an email associated with his account', function () {
    test('should render recover account backup email confirmation form', async function (assert) {
      // given
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);
      this.set('firstName', firstName);

      // when
      const screen = await render(
        hbs`<AccountRecovery::BackupEmailConfirmationForm @firstName={{this.firstName}} @resetErrors={{this.resetErrors}} />`,
      );

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: this.intl.t(
            'pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message',
            {
              firstName,
            },
          ),
        }),
      );
      assert.ok(
        screen.getByText(
          this.intl.t(
            'pages.account-recovery.find-sco-record.backup-email-confirmation.email-sent-to-choose-password-message',
          ),
        ),
      );
      assert.ok(
        screen.getByRole('textbox', {
          name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email'),
        }),
      );
      assert.notOk(
        screen.queryByText(
          this.intl.t(
            'pages.account-recovery.find-sco-record.backup-email-confirmation.email-already-exist-for-account-message',
          ),
        ),
      );
    });

    test('should enable submission on backup email confirmation form', async function (assert) {
      // given
      const email = 'Philipe@example.net';
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);

      const createRecordStub = sinon.stub();

      class StoreStubService extends Service {
        createRecord = createRecordStub;
      }

      this.owner.register('service:store', StoreStubService);
      const sendEmail = sinon.stub();
      sendEmail.resolves();
      this.set('sendEmail', sendEmail);

      const screen = await render(
        hbs`<AccountRecovery::BackupEmailConfirmationForm @sendEmail={{this.sendEmail}} @resetErrors={{this.resetErrors}} />`,
      );

      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email'),
        }),
        email,
      );
      await click(
        screen.getByRole('button', {
          name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit'),
        }),
      );

      // then
      sinon.assert.calledWithExactly(sendEmail, email);
      assert.ok(true);
    });

    test('should disable submission on backup email confirmation form when is loading', async function (assert) {
      // given
      const email = 'Philipe@example.net';

      const screen = await render(hbs`<AccountRecovery::BackupEmailConfirmationForm @isLoading={{true}} />`);

      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email'),
        }),
        email,
      );

      // then
      const submitButton = screen.getByRole('button', {
        name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit'),
        hidden: true,
      });
      assert.true(submitButton.disabled);
    });
  });

  module('form validation', function () {
    test('should show an error when email is empty', async function (assert) {
      // given
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);
      const email = '';

      const screen = await render(
        hbs`<AccountRecovery::BackupEmailConfirmationForm @firstName={{this.firstName}} @resetErrors={{this.resetErrors}}/>`,
      );
      const emailInput = screen.getByRole('textbox', {
        name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email'),
      });

      // when
      await fillIn(emailInput, email);
      await triggerEvent(emailInput, 'focusout');

      // then
      assert.ok(
        screen.getByText(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.empty-email'),
        ),
      );
    });

    test('should show an error when email is not valid', async function (assert) {
      // given
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);
      const email = 'Philipe@';

      const screen = await render(
        hbs`<AccountRecovery::BackupEmailConfirmationForm @firstName={{this.firstName}} @resetErrors={{this.resetErrors}} />`,
      );

      const emailInput = screen.getByRole('textbox', {
        name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email'),
      });

      // when
      await fillIn(emailInput, email);
      await triggerEvent(emailInput, 'focusout');

      // then
      assert.ok(
        screen.getByText(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.wrong-email-format'),
        ),
      );
    });

    test('should valid form when email is valid', async function (assert) {
      // given
      const resetErrors = sinon.stub();
      this.set('resetErrors', resetErrors);
      this.set('sendEmail', () => {});
      const email = 'Philipe@example.net';
      const screen = await render(
        hbs`<AccountRecovery::BackupEmailConfirmationForm @firstName={{this.firstName}} @resetErrors={{this.resetErrors}} @sendEmail={{this.sendEmail}}/>`,
      );

      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email'),
        }),
        email,
      );
      await click(
        screen.getByRole('button', {
          name: this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit'),
        }),
      );

      // then
      assert.notOk(
        screen.queryByText(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.wrong-email-format'),
        ),
      );
      assert.notOk(
        screen.queryByText(
          this.intl.t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.empty-email'),
        ),
      );
    });
  });
});
