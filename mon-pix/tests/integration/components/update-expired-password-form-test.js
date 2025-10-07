import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import ENV from '../../../config/environment';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

const PASSWORD_INPUT_LABEL = 'Mot de passe';

const NEW_VALID_PASSWORD = 'Pix12345!';

module('Integration | Component | update-expired-password-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders elements', async function (assert) {
    // given / when
    const screen = await render(hbs`<UpdateExpiredPasswordForm />`);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Réinitialiser le mot de passe' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Réinitialiser' })).exists();
    assert.dom(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false })).exists();
  });

  module('successful cases', function () {
    test('should save the new password, when button is clicked', async function (assert) {
      // given
      const resetExpiredPasswordDemand = EmberObject.create({
        login: 'toto',
        password: 'Password123',
        updateExpiredPassword: sinon.stub(),
        unloadRecord: sinon.stub(),
      });
      this.set('resetExpiredPasswordDemand', resetExpiredPasswordDemand);

      const screen = await render(
        hbs`<UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{this.resetExpiredPasswordDemand}} />`,
      );

      // when
      await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), NEW_VALID_PASSWORD);
      await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'change');

      await click(screen.getByRole('button', { name: 'Réinitialiser' }));

      // then
      assert.dom(screen.queryByLabelText(PASSWORD_INPUT_LABEL, { exact: false })).doesNotExist();
      assert.dom(screen.getByText('Votre mot de passe a été mis à jour.')).exists();
    });
  });

  module('error cases', function () {
    module('when error code is PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED', function () {
      test('displays that the password reset token has expired', async function (assert) {
        // given
        const response = {
          errors: [{ code: 'PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED' }],
        };

        const resetExpiredPasswordDemand = EmberObject.create({
          updateExpiredPassword: sinon.stub().rejects(response),
        });
        this.set('resetExpiredPasswordDemand', resetExpiredPasswordDemand);

        const screen = await render(
          hbs`<UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{this.resetExpiredPasswordDemand}} />`,
        );

        // when
        await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), NEW_VALID_PASSWORD);
        await click(screen.getByRole('button', { name: 'Réinitialiser' }));

        // then
        assert
          .dom(screen.getByText(t('pages.oidc-signup-or-login.error.password-reset-token-invalid-or-expired')))
          .exists();
      });

      module('when an unknown error happens', function () {
        test('displays a generic error message', async function (assert) {
          // given
          const resetExpiredPasswordDemand = EmberObject.create({
            login: 'toto',
            password: 'Password123',
            updateExpiredPassword: sinon.stub().rejects(),
            unloadRecord: sinon.stub(),
          });
          this.set('resetExpiredPasswordDemand', resetExpiredPasswordDemand);

          const screen = await render(
            hbs`<UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{this.resetExpiredPasswordDemand}} />`,
          );

          // when
          await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), NEW_VALID_PASSWORD);
          await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'change');

          await click(screen.getByRole('button', { name: 'Réinitialiser' }));

          // then
          assert.ok(t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY));
        });
      });
    });
  });
});
