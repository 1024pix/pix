import { module, test } from 'qunit';
import { click, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { fillInByLabel } from '../../../helpers/fill-in-by-label';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | account-recovery | update-sco-record', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a reset password form', async function (assert) {
    // given
    const newEmail = 'philippe.example.net';
    const firstName = 'Philippe';
    this.set('firstName', firstName);
    this.set('email', newEmail);

    // when
    const screen = await render(
      hbs`<AccountRecovery::UpdateScoRecordForm @firstName={{this.firstName}} @email={{this.email}}/>`
    );

    // then
    assert.ok(
      screen.getByRole('heading', {
        name: this.intl.t('pages.account-recovery.update-sco-record.welcome-message', { firstName }),
      })
    );
    assert.ok(screen.getByText(this.intl.t('pages.account-recovery.update-sco-record.fill-password')));
    assert.ok(
      screen.getByRole('textbox', { name: this.intl.t('pages.account-recovery.update-sco-record.form.email-label') })
    );
    assert.ok(screen.getByLabelText(this.intl.t('pages.account-recovery.update-sco-record.form.password-label')));

    const submitButton = screen.getByRole('button', {
      name: this.intl.t('pages.account-recovery.update-sco-record.form.login-button'),
    });
    assert.ok(submitButton);
    assert.equal(submitButton.disabled, true);

    assert.dom('input[type="checkbox"]').exists();
    assert.ok(screen.getByRole('link', { name: this.intl.t('common.cgu.cgu') }));
    assert.ok(screen.getByRole('link', { name: this.intl.t('common.cgu.data-protection-policy') }));
  });

  module('Form submission', function () {
    test('should disable submission if password is not valid', async function (assert) {
      // given
      const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pass');

      // then
      const submitButton = screen.getByRole('button', {
        name: this.intl.t('pages.account-recovery.update-sco-record.form.login-button'),
      });
      assert.equal(submitButton.disabled, true);
    });

    test('should disable submission if password is valid and cgu and data protection policy are not accepted', async function (assert) {
      // given
      const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pix123A*');

      // then
      const submitButton = screen.getByRole('button', {
        name: this.intl.t('pages.account-recovery.update-sco-record.form.login-button'),
      });
      assert.equal(submitButton.disabled, true);
    });

    test('should disable submission on form when is loading', async function (assert) {
      // given
      const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm @isLoading={{true}} />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pix123A*');
      await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

      // then
      const submitButton = screen.getByRole('button', {
        name: this.intl.t('pages.account-recovery.update-sco-record.form.login-button'),
      });
      assert.equal(submitButton.disabled, true);
    });

    test('should enable submission if password is valid and cgu and data protection policy are accepted', async function (assert) {
      // given
      const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pix123A*');
      await click(screen.getByRole('checkbox', { name: this.intl.t('common.cgu.label') }));

      // then
      const submitButton = screen.getByRole('button', {
        name: this.intl.t('pages.account-recovery.update-sco-record.form.login-button'),
      });
      assert.equal(submitButton.disabled, false);
    });
  });

  module('Error messages', function () {
    module('when the user enters a valid password', function () {
      test('should not display an error message on focus-out', async function (assert) {
        // given
        const validPassword = 'pix123A*';
        await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

        // when
        await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), validPassword);
        await triggerEvent('#password', 'focusout');

        // then
        assert.notOk(contains(this.intl.t('pages.account-recovery.update-sco-record.form.errors.invalid-password')));
      });
    });

    module('when the user enters an invalid password', function () {
      test('should display an invalid format error message on focus-out', async function (assert) {
        // given
        const newEmail = 'philippe.example.net';
        const firstName = 'Philippe';
        this.set('firstName', firstName);
        this.set('email', newEmail);
        const invalidPassword = 'invalidpassword';

        const screen = await render(
          hbs`<AccountRecovery::UpdateScoRecordForm @firstName={{this.firstName}} @email={{this.email}}/>`
        );

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.update-sco-record.form.password-label'),
          invalidPassword
        );
        await triggerEvent('#password', 'focusout');

        // then
        assert.ok(
          screen.getByText(this.intl.t('pages.account-recovery.update-sco-record.form.errors.invalid-password'))
        );
      });

      test('should display a required field error message on focus-out if password field is empty', async function (assert) {
        // given
        const password = '';
        const screen = await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

        // when
        await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), password);
        await triggerEvent('#password', 'focusout');

        // then
        assert.ok(screen.getByText(this.intl.t('pages.account-recovery.update-sco-record.form.errors.empty-password')));
      });
    });
  });
});
