import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import BackupEmailConfirmationForm from 'mon-pix/components/account-recovery/backup-email-confirmation-form';
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

      // when
      const screen = await render(
        <template>
          <BackupEmailConfirmationForm
            @firstName={{firstName}}
            @existingEmail={{existingEmail}}
            @resetErrors={{resetErrors}}
          />
        </template>,
      );

      // then
      assert.ok(
        screen.getByText(
          t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-already-exist-for-account-message'),
        ),
      );
      assert.ok(
        screen.getByText(t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-valid-message'), {
          exact: false,
        }),
      );
      assert.ok(
        screen.getByText(
          t('pages.account-recovery.find-sco-record.backup-email-confirmation.ask-for-new-email-message'),
          { exact: false },
        ),
      );
      assert.ok(
        screen.getByRole('link', {
          name: t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-reset-message'),
        }),
      );
      assert.ok(
        screen.getByRole('textbox', {
          name: new RegExp(t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email')),
        }),
      );

      const submitButton = screen.getByRole('button', {
        name: t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit'),
      });

      assert.ok(submitButton);
      assert.dom(submitButton).hasAttribute('aria-disabled');
    });
  });

  module('when the user does not have an email associated with his account', function () {
    test('should render recover account backup email confirmation form', async function (assert) {
      // given
      const resetErrors = sinon.stub();

      // when
      const screen = await render(
        <template><BackupEmailConfirmationForm @firstName={{firstName}} @resetErrors={{resetErrors}} /></template>,
      );

      // then
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message', {
            firstName,
          }),
        }),
      );
      assert.ok(
        screen.getByText(
          t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-sent-to-choose-password-message'),
        ),
      );
      assert.ok(
        screen.getByRole('textbox', {
          name: new RegExp(t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email')),
        }),
      );
      assert.notOk(
        screen.queryByText(
          t('pages.account-recovery.find-sco-record.backup-email-confirmation.email-already-exist-for-account-message'),
        ),
      );
    });

    test('should enable submission on backup email confirmation form', async function (assert) {
      // given
      const email = 'Philipe@example.net';
      const resetErrors = sinon.stub();

      const createRecordStub = sinon.stub();

      class StoreStubService extends Service {
        createRecord = createRecordStub;
      }

      this.owner.register('service:store', StoreStubService);
      const sendEmail = sinon.stub();
      sendEmail.resolves();

      const screen = await render(
        <template><BackupEmailConfirmationForm @sendEmail={{sendEmail}} @resetErrors={{resetErrors}} /></template>,
      );

      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: new RegExp(t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email')),
        }),
        email,
      );
      await click(
        screen.getByRole('button', {
          name: t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit'),
        }),
      );

      // then
      sinon.assert.calledWithExactly(sendEmail, email);
      assert.ok(true);
    });

    test('should disable submission on backup email confirmation form when is loading', async function (assert) {
      // given
      const email = 'Philipe@example.net';

      const screen = await render(<template><BackupEmailConfirmationForm @isLoading={{true}} /></template>);

      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: new RegExp(t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email')),
        }),
        email,
      );

      // then
      const submitButton = screen.getByRole('button', {
        name: t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit'),
        hidden: true,
      });
      assert.dom(submitButton).hasAttribute('aria-disabled');
    });
  });

  module('form validation', function () {
    test('should show an error when email is empty', async function (assert) {
      // given
      const resetErrors = sinon.stub();
      const email = '';

      const screen = await render(
        <template><BackupEmailConfirmationForm @firstName={{firstName}} @resetErrors={{resetErrors}} /></template>,
      );
      const emailInput = screen.getByRole('textbox', {
        name: new RegExp(t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email')),
      });

      // when
      await fillIn(emailInput, email);
      await triggerEvent(emailInput, 'focusout');

      // then
      assert.ok(
        screen.getByText(t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.empty-email')),
      );
    });

    test('should show an error when email is not valid', async function (assert) {
      // given
      const resetErrors = sinon.stub();
      const email = 'Philipe@';

      const screen = await render(
        <template><BackupEmailConfirmationForm @firstName={{firstName}} @resetErrors={{resetErrors}} /></template>,
      );

      const emailInput = screen.getByRole('textbox', {
        name: new RegExp(t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email')),
      });

      // when
      await fillIn(emailInput, email);
      await triggerEvent(emailInput, 'focusout');

      // then
      assert.ok(
        screen.getByText(
          t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.wrong-email-format'),
        ),
      );
    });

    test('should valid form when email is valid', async function (assert) {
      // given
      const resetErrors = sinon.stub();
      const sendEmail = () => {};
      const email = 'Philipe@example.net';
      const screen = await render(
        <template>
          <BackupEmailConfirmationForm @firstName={{firstName}} @resetErrors={{resetErrors}} @sendEmail={{sendEmail}} />
        </template>,
      );

      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: new RegExp(t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email')),
        }),
        email,
      );
      await click(
        screen.getByRole('button', {
          name: t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit'),
        }),
      );

      // then
      assert.notOk(
        screen.queryByText(
          t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.wrong-email-format'),
        ),
      );
      assert.notOk(
        screen.queryByText(
          t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.empty-email'),
        ),
      );
    });
  });

  module('submit button state', function () {
    test('should disable the submit button when email is empty', async function (assert) {
      // given & when
      const screen = await render(<template><BackupEmailConfirmationForm @firstName={{firstName}} /></template>);

      // then
      const submitButton = screen.getByRole('button', {
        name: t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit'),
        hidden: true,
      });
      assert.dom(submitButton).hasAttribute('aria-disabled');
    });

    test('should disable the submit button when email is not valid', async function (assert) {
      // given
      const screen = await render(<template><BackupEmailConfirmationForm @firstName={{firstName}} /></template>);

      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: new RegExp(t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email')),
        }),
        'wrongemail',
      );

      // then
      const submitButton = screen.getByRole('button', {
        name: t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit'),
        hidden: true,
      });
      assert.dom(submitButton).hasAttribute('aria-disabled');
    });

    test('should enable the submit button when email is valid', async function (assert) {
      // given
      const screen = await render(<template><BackupEmailConfirmationForm @firstName={{firstName}} /></template>);

      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: new RegExp(t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.email')),
        }),
        'user@example.net',
      );

      // then
      const submitButton = screen.getByRole('button', {
        name: t('pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit'),
      });
      assert.dom(submitButton).doesNotHaveAttribute('aria-disabled');
    });
  });
});
