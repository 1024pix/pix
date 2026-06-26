import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AddOrUpdateEmailWithValidation from 'mon-pix/components/user-account/add-or-update-email-with-validation';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | user-account | add-or-update-email-with-validation', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when canAddEmailConnectionMethod is true', function () {
    test('displays the add email form', async function (assert) {
      // when
      const screen = await render(
        <template><AddOrUpdateEmailWithValidation @canAddEmailConnectionMethod={{true}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('pages.user-account.account-add-or-update-email-with-validation.title.add-email'),
          }),
        )
        .exists();
    });
  });

  module('when canAddEmailConnectionMethod is false', function () {
    test('displays the update email form', async function (assert) {
      // when
      const screen = await render(
        <template><AddOrUpdateEmailWithValidation @canAddEmailConnectionMethod={{false}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('pages.user-account.account-add-or-update-email-with-validation.title.update-email'),
          }),
        )
        .exists();
    });
  });

  module('when a verification code is requested', function (hooks) {
    let store;

    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
      store.createRecord = () => ({ sendNewEmail: sinon.stub() });
    });

    test('shows the verification code page with the submitted email', async function (assert) {
      // given
      const screen = await render(
        <template><AddOrUpdateEmailWithValidation @canAddEmailConnectionMethod={{false}} /></template>,
      );

      // when
      await fillIn(
        screen.getByRole('textbox', {
          name: t('pages.user-account.account-add-or-update-email-with-validation.fields.email.update-email.label'),
        }),
        '   toto@example.net   ',
      );
      await fillIn(
        screen.getByLabelText(
          t('pages.user-account.account-add-or-update-email-with-validation.fields.password.label'),
        ),
        'pix123',
      );
      await click(
        screen.getByRole('button', {
          name: t('pages.user-account.account-add-or-update-email-with-validation.save-button'),
        }),
      );

      // then
      assert.dom(screen.getByRole('heading', { name: t('pages.user-account.email-verification.title') })).exists();
      assert.dom(screen.getByText('toto@example.net')).exists();
    });
  });
});
