import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import UpdatePasswordForm from 'mon-pix/components/user-account/update-password-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | user-account | update-password-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  let updatePasswordService;

  hooks.beforeEach(function () {
    updatePasswordService = this.owner.lookup('service:update-password');
  });

  module('when the user opens the update password form', function () {
    test('displays title, password inputs, save and cancel buttons', async function (assert) {
      // when
      const screen = await render(<template><UpdatePasswordForm /></template>);

      // then
      assert.dom(screen.getByRole('heading', { name: t('pages.user-account.update-password.title') })).exists();
      assert.dom(screen.getByLabelText(t('pages.user-account.update-password.fields.current-password.label'))).exists();
      assert.dom(screen.getByLabelText(t('pages.user-account.update-password.fields.new-password.label'))).exists();
      assert.dom(screen.getByRole('button', { name: t('pages.user-account.update-password.save-button') })).exists();
      assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
    });

    module('when the user cancels edition', function () {
      test('calls disablePasswordEditionMode', async function (assert) {
        // given
        const disablePasswordEditionMode = sinon.stub();

        const screen = await render(
          <template><UpdatePasswordForm @disablePasswordEditionMode={{disablePasswordEditionMode}} /></template>,
        );

        // when
        await click(screen.getByRole('button', { name: t('common.actions.cancel') }));

        // then
        sinon.assert.calledOnce(disablePasswordEditionMode);
        assert.ok(true);
      });
    });

    module('when the user submits an empty current password', function () {
      test('displays an error message and does not call the API', async function (assert) {
        // given
        updatePasswordService.updatePassword = sinon.stub();

        const screen = await render(<template><UpdatePasswordForm /></template>);

        // when
        await fillIn(
          screen.getByLabelText(t('pages.user-account.update-password.fields.new-password.label')),
          'NewPassword456',
        );
        await click(screen.getByRole('button', { name: t('pages.user-account.update-password.save-button') }));

        // then
        assert
          .dom(screen.getByText(t('pages.user-account.update-password.fields.errors.empty-current-password')))
          .exists();
        sinon.assert.notCalled(updatePasswordService.updatePassword);
      });
    });
  });

  module('when the user submits valid passwords', function () {
    test('updates the password and displays the success message', async function (assert) {
      // given
      const currentPassword = 'Password123';
      const newPassword = 'NewPassword456';
      const displayPasswordUpdatedMessage = sinon.stub();
      const disablePasswordEditionMode = sinon.stub();
      updatePasswordService.updatePassword = sinon.stub();

      const screen = await render(
        <template>
          <UpdatePasswordForm
            @displayPasswordUpdatedMessage={{displayPasswordUpdatedMessage}}
            @disablePasswordEditionMode={{disablePasswordEditionMode}}
          />
        </template>,
      );

      // when
      await fillIn(
        screen.getByLabelText(t('pages.user-account.update-password.fields.current-password.label')),
        currentPassword,
      );
      await fillIn(
        screen.getByLabelText(t('pages.user-account.update-password.fields.new-password.label')),
        newPassword,
      );
      await click(screen.getByRole('button', { name: t('pages.user-account.update-password.save-button') }));

      // then
      sinon.assert.calledOnceWith(updatePasswordService.updatePassword, { currentPassword, newPassword });
      sinon.assert.calledOnce(displayPasswordUpdatedMessage);
      sinon.assert.calledOnce(disablePasswordEditionMode);
      assert.ok(true);
    });

    test('displays an error message when the current password is invalid', async function (assert) {
      // given
      updatePasswordService.updatePassword = sinon.stub().throws({ errors: [{ status: '400' }] });

      const screen = await render(<template><UpdatePasswordForm /></template>);

      // when
      await _fillValidFormAndSubmit({ screen, t });

      // then
      assert
        .dom(screen.getByText(t('pages.user-account.update-password.fields.errors.invalid-current-password')))
        .exists();
    });

    test('displays an error message when the new password does not match password policy', async function (assert) {
      // given
      updatePasswordService.updatePassword = sinon.stub().throws({ errors: [{ status: '422' }] });

      const screen = await render(<template><UpdatePasswordForm /></template>);

      // when
      await _fillValidFormAndSubmit({ screen, t });

      // then
      assert.dom(screen.getByText(t('common.validation.password.error'))).exists();
    });

    test('displays an unknown error message when an unexpected error occurs', async function (assert) {
      // given
      updatePasswordService.updatePassword = sinon.stub().throws({ errors: [{ status: '500' }] });

      const screen = await render(<template><UpdatePasswordForm /></template>);

      // when
      await _fillValidFormAndSubmit({ screen, t });

      // then
      assert.dom(screen.getByText(t('pages.user-account.update-password.fields.errors.unknown-error'))).exists();
    });
  });

  async function _fillValidFormAndSubmit({ screen, t }) {
    await fillIn(
      screen.getByLabelText(t('pages.user-account.update-password.fields.current-password.label')),
      'Password123',
    );
    await fillIn(
      screen.getByLabelText(t('pages.user-account.update-password.fields.new-password.label')),
      'NewPassword456',
    );
    await click(screen.getByRole('button', { name: t('pages.user-account.update-password.save-button') }));
  }
});
