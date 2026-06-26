import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import UpdateExpiredPasswordForm from 'mon-pix/components/update-expired-password-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import ENV from '../../../config/environment';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

const PASSWORD_INPUT_LABEL = 'Mot de passe';

const NEW_VALID_PASSWORD = 'Pix12345!';
const NEW_INVALID_PASSWORD = 'pix123';

module('Integration | Component | update-expired-password-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders elements', async function (assert) {
    // given / when
    const screen = await render(<template><UpdateExpiredPasswordForm /></template>);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Réinitialiser le mot de passe' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Réinitialiser' })).exists();
    assert.dom(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false })).exists();
  });

  module('password validation', function () {
    test('displays a validation error, when password does not meet the rules', async function (assert) {
      // given
      const screen = await render(<template><UpdateExpiredPasswordForm /></template>);

      // when
      await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), NEW_INVALID_PASSWORD);
      await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'focusout');

      // then
      assert.dom(screen.getByText(t('pages.update-expired-password.fields.error'))).exists();
    });
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

      const screen = await render(
        <template><UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{resetExpiredPasswordDemand}} /></template>,
      );

      // when
      await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), NEW_VALID_PASSWORD);
      await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'change');

      await click(screen.getByRole('button', { name: 'Réinitialiser' }));

      // then
      assert.dom(screen.queryByLabelText(PASSWORD_INPUT_LABEL, { exact: false })).doesNotExist();
      assert.dom(screen.getByText('Votre mot de passe a été mis à jour.')).exists();
    });

    test('should authenticate the user with the returned login and the new password', async function (assert) {
      // given
      const login = 'beth.rave1203';
      class SessionStub extends Service {
        authenticateUser = sinon.stub().resolves();
      }
      this.owner.register('service:session', SessionStub);
      const session = this.owner.lookup('service:session');

      const resetExpiredPasswordDemand = EmberObject.create({
        updateExpiredPassword: sinon.stub().resolves(login),
        unloadRecord: sinon.stub(),
      });

      const screen = await render(
        <template><UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{resetExpiredPasswordDemand}} /></template>,
      );

      // when
      await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), NEW_VALID_PASSWORD);
      await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'change');
      await click(screen.getByRole('button', { name: 'Réinitialiser' }));

      // then
      sinon.assert.calledWith(session.authenticateUser, login, NEW_VALID_PASSWORD);
      sinon.assert.called(resetExpiredPasswordDemand.unloadRecord);
      assert.ok(true);
    });

    test('should display the login link, when authentication fails after password update', async function (assert) {
      // given
      class SessionStub extends Service {
        authenticateUser = sinon.stub().rejects();
      }
      this.owner.register('service:session', SessionStub);

      const resetExpiredPasswordDemand = EmberObject.create({
        updateExpiredPassword: sinon.stub().resolves('toto'),
        unloadRecord: sinon.stub(),
      });

      const screen = await render(
        <template><UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{resetExpiredPasswordDemand}} /></template>,
      );

      // when
      await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), NEW_VALID_PASSWORD);
      await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'change');
      await click(screen.getByRole('button', { name: 'Réinitialiser' }));

      // then
      assert.dom(screen.getByText(t('pages.update-expired-password.validation'))).exists();
      assert.dom(screen.getByRole('link', { name: t('pages.update-expired-password.go-to-login') })).exists();
    });
  });

  module('error cases', function () {
    module('when the api returns a 400 error', function () {
      test('displays the password validation error', async function (assert) {
        // given
        const resetExpiredPasswordDemand = EmberObject.create({
          updateExpiredPassword: sinon.stub().rejects({ errors: [{ status: '400' }] }),
          unloadRecord: sinon.stub(),
        });

        const screen = await render(
          <template><UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{resetExpiredPasswordDemand}} /></template>,
        );

        // when
        await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), NEW_VALID_PASSWORD);
        await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'change');
        await click(screen.getByRole('button', { name: 'Réinitialiser' }));

        // then
        assert.dom(screen.getByText(t('pages.update-expired-password.fields.error'))).exists();
      });
    });

    module('when the api returns a 401 error', function () {
      test('displays the unauthorized error message', async function (assert) {
        // given
        const resetExpiredPasswordDemand = EmberObject.create({
          updateExpiredPassword: sinon.stub().rejects({ errors: [{ status: '401' }] }),
          unloadRecord: sinon.stub(),
        });

        const screen = await render(
          <template><UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{resetExpiredPasswordDemand}} /></template>,
        );

        // when
        await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), NEW_VALID_PASSWORD);
        await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'change');
        await click(screen.getByRole('button', { name: 'Réinitialiser' }));

        // then
        assert.dom(screen.getByText(t(ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY))).exists();
      });
    });

    module('when error code is PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED', function () {
      test('displays that the password reset token has expired', async function (assert) {
        // given
        const response = {
          errors: [{ code: 'PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED' }],
        };

        const resetExpiredPasswordDemand = EmberObject.create({
          updateExpiredPassword: sinon.stub().rejects(response),
        });

        const screen = await render(
          <template><UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{resetExpiredPasswordDemand}} /></template>,
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

          const screen = await render(
            <template>
              <UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{resetExpiredPasswordDemand}} />
            </template>,
          );

          // when
          await fillIn(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), NEW_VALID_PASSWORD);
          await triggerEvent(screen.getByLabelText(PASSWORD_INPUT_LABEL, { exact: false }), 'change');

          await click(screen.getByRole('button', { name: 'Réinitialiser' }));

          // then
          assert.dom(screen.getByText(t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
        });
      });
    });
  });
});
