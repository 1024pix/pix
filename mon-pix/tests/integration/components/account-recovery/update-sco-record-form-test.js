import { module, test } from 'qunit';
import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { fillInByLabel } from '../../../helpers/fill-in-by-label';
import { clickByLabel } from '../../../helpers/click-by-label';
import findByLabel from '../../../helpers/find-by-label';

module('Integration | Component | account-recovery | update-sco-record', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a reset password form', async function (assert) {
    // given
    const newEmail = 'philippe.example.net';
    const firstName = 'Philippe';
    this.set('firstName', firstName);
    this.set('email', newEmail);

    // when
    await render(hbs`<AccountRecovery::UpdateScoRecordForm @firstName={{this.firstName}} @email={{this.email}}/>`);

    // then
    assert
      .dom(contains(this.intl.t('pages.account-recovery.update-sco-record.welcome-message', { firstName })))
      .exists();
    assert.dom(contains(this.intl.t('pages.account-recovery.update-sco-record.fill-password'))).exists();
    assert.dom(contains(this.intl.t('pages.account-recovery.update-sco-record.form.email-label'))).exists();
    assert.dom(contains(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'))).exists();
    const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
    assert.dom(submitButton).exists();
    assert.true(submitButton.disabled);
    assert.dom(contains('philippe.example.net'));

    assert.dom(find('input[type="checkbox"]')).exists();
    assert.dom(contains(this.intl.t('pages.sign-up.fields.cgu.accept'))).exists();
    assert.dom(contains(this.intl.t('pages.sign-up.fields.cgu.cgu'))).exists();
    assert.dom(contains(this.intl.t('pages.sign-up.fields.cgu.and'))).exists();
    assert.dom(contains(this.intl.t('pages.sign-up.fields.cgu.data-protection-policy'))).exists();
  });

  module('Form submission', function () {
    test('should disable submission if password is not valid', async function (assert) {
      // given
      await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pass');

      // then
      const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
      assert.true(submitButton.disabled);
    });

    test('should disable submission if password is valid and cgu and data protection policy are not accepted', async function (assert) {
      // given
      await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pix123A*');

      // then
      const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
      assert.true(submitButton.disabled);
    });

    test('should disable submission on form when is loading', async function (assert) {
      // given
      await render(hbs`<AccountRecovery::UpdateScoRecordForm @isLoading={{true}} />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pix123A*');
      await clickByLabel(this.intl.t('pages.sign-up.fields.cgu.accept'));

      // then
      const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
      assert.true(submitButton.disabled);
    });

    test('should enable submission if password is valid and cgu and data protection policy are accepted', async function (assert) {
      // given
      await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

      // when
      await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), 'pix123A*');
      await clickByLabel(this.intl.t('pages.sign-up.fields.cgu.accept'));

      // then
      const submitButton = findByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.login-button'));
      assert.false(submitButton.disabled);
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
        assert
          .dom(contains(this.intl.t('pages.account-recovery.update-sco-record.form.errors.invalid-password')))
          .doesNotExist();
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

        await render(hbs`<AccountRecovery::UpdateScoRecordForm @firstName={{this.firstName}} @email={{this.email}}/>`);

        // when
        await fillInByLabel(
          this.intl.t('pages.account-recovery.update-sco-record.form.password-label'),
          invalidPassword
        );
        await triggerEvent('#password', 'focusout');

        // then
        assert
          .dom(contains(this.intl.t('pages.account-recovery.update-sco-record.form.errors.invalid-password')))
          .exists();
      });

      test('should display a required field error message on focus-out if password field is empty', async function (assert) {
        // given
        const password = '';
        await render(hbs`<AccountRecovery::UpdateScoRecordForm />`);

        // when
        await fillInByLabel(this.intl.t('pages.account-recovery.update-sco-record.form.password-label'), password);
        await triggerEvent('#password', 'focusout');

        // then
        assert
          .dom(contains(this.intl.t('pages.account-recovery.update-sco-record.form.errors.empty-password')))
          .exists();
      });
    });
  });
});
