import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Auth::ToggableLoginForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  class SessionStub extends Service {}

  let emailInputLabel;
  let passwordInputLabel;
  let loginLabel;

  hooks.beforeEach(function () {
    this.owner.register('service:session', SessionStub);

    emailInputLabel = t('common.forms.login.email');
    passwordInputLabel = t('common.forms.login.password');
    loginLabel = t('pages.login-or-register.login-form.login');
  });

  module('Login Inputs', function () {
    test('it should display email and password inputs', async function (assert) {
      // when
      const screen = await render(hbs`<Auth::ToggableLoginForm />`);

      // then
      assert.dom(screen.getByRole('textbox', { name: emailInputLabel })).exists();
      assert.dom(screen.getByLabelText(passwordInputLabel)).exists();
      assert.dom(screen.getByText(loginLabel)).exists();
    });

    test('[a11y] it should display a message that all inputs are required', async function (assert) {
      // when
      const screen = await render(hbs`<Auth::ToggableLoginForm />`);

      // then
      assert.dom(screen.getByText('Tous les champs sont obligatoires.')).exists();
      assert.dom(screen.getByRole('textbox', { name: emailInputLabel })).hasAttribute('required');
      assert.dom(screen.getByLabelText(passwordInputLabel)).hasAttribute('required');
    });

    module('when the user fills inputs with errors', function () {
      test('should display an invalid email error message when focus-out', async function (assert) {
        //given
        const invalidEmail = 'invalidEmail';
        const screen = await render(hbs`<Auth::ToggableLoginForm />`);

        // when
        await fillByLabel(emailInputLabel, invalidEmail);
        const emailInput = screen.getByRole('textbox', { name: emailInputLabel });
        await triggerEvent(emailInput, 'focusout');

        // then
        assert.dom(screen.getByText(t('common.form-errors.email.format'))).exists();
      });

      test('should display an empty password error message when focus-out', async function (assert) {
        //given
        const screen = await render(hbs`<Auth::ToggableLoginForm />`);

        // when
        await fillByLabel(passwordInputLabel, '');
        const passwordInput = screen.getByLabelText(passwordInputLabel);
        await triggerEvent(passwordInput, 'focusout');

        // then
        assert.dom(screen.getByText(t('common.form-errors.password.mandatory'))).exists();
      });
    });
  });

  module('When there is a valid invitation and user is not member of certification center yet', function (hooks) {
    let adapter;
    hooks.beforeEach(function () {
      SessionStub.prototype.authenticate = function (authenticator, email, password) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        return resolve();
      };

      adapter = this.owner.lookup('adapter:certification-center-invitation');
      adapter.accept = sinon.stub();
      adapter.accept.resolves('response');
    });

    module('when user click on login button', function () {
      test('it should accept invitation with appropriate parameters', async function (assert) {
        // given
        await render(
          hbs`<Auth::ToggableLoginForm
  @isWithInvitation='true'
  @certificationCenterInvitationId='1'
  @certificationCenterInvitationCode='C0D3'
/>`,
        );

        // when
        await fillByLabel(emailInputLabel, 'email@example.net');
        await fillByLabel(passwordInputLabel, 'Pix12345!');
        await clickByName(loginLabel);

        // then
        assert.ok(
          adapter.accept.calledWith({
            id: '1',
            code: 'C0D3',
            email: 'email@example.net',
          }),
        );
      });

      module('When there is an error in accepting invitation', function () {
        test('it should display a message error', async function (assert) {
          // given
          const adapter = this.owner.lookup('adapter:certification-center-invitation');
          adapter.accept = sinon.stub();
          adapter.accept.rejects({ errors: [{ code: 403, status: '403' }] });

          const screen = await render(
            hbs`<Auth::ToggableLoginForm
  @isWithInvitation='true'
  @certificationCenterInvitationId='1'
  @certificationCenterInvitationCode='C0D3'
/>`,
          );

          await fillByLabel(emailInputLabel, 'pix@example.net');
          await fillByLabel(passwordInputLabel, 'JeMeLoggue1024');

          // when
          await clickByName(loginLabel);

          // then
          assert.dom(screen.getByText(t('pages.login-or-register.login-form.errors.status.403'))).exists();
        });
        module('When invitation has already been accepted by user', function () {
          test('it should call authentication service with appropriate parameters', async function (assert) {
            // given
            const adapter = this.owner.lookup('adapter:certification-center-invitation');
            adapter.accept = sinon.stub();
            adapter.accept.rejects({ errors: [{ code: 412, status: '412' }] });

            SessionStub.prototype.authenticate = function (authenticator, email, password) {
              this.authenticator = authenticator;
              this.email = email;
              this.password = password;
              return resolve();
            };

            const sessionServiceObserver = this.owner.lookup('service:session');

            await render(
              hbs`<Auth::ToggableLoginForm
  @isWithInvitation='true'
  @certificationCenterInvitationId='1'
  @certificationCenterInvitationCode='C0D3'
/>`,
            );

            await fillByLabel(emailInputLabel, 'pix@example.net');
            await fillByLabel(passwordInputLabel, 'JeMeLoggue1024');

            // when
            await clickByName(loginLabel);

            // then
            assert.strictEqual(sessionServiceObserver.authenticator, 'authenticator:oauth2');
            assert.strictEqual(sessionServiceObserver.email, 'pix@example.net');
            assert.strictEqual(sessionServiceObserver.password, 'JeMeLoggue1024');
          });

          test('it should display an error when authentication fails after 412', async function (assert) {
            // given
            const adapter = this.owner.lookup('adapter:certification-center-invitation');
            adapter.accept = sinon.stub();
            adapter.accept.rejects({ errors: [{ code: 412, status: '412' }] });

            SessionStub.prototype.authenticate = sinon.stub().rejects();

            const screen = await render(
              hbs`<Auth::ToggableLoginForm
  @isWithInvitation='true'
  @certificationCenterInvitationId='1'
  @certificationCenterInvitationCode='C0D3'
/>`,
            );

            await fillByLabel(emailInputLabel, 'pix@example.net');
            await fillByLabel(passwordInputLabel, 'JeMeLoggue1024');

            // when
            await clickByName(loginLabel);

            // then
            assert.dom(screen.getByText(t('common.api-error-messages.internal-server-error'))).exists();
          });
        });
      });
    });
  });

  module('When the form is invalid', function () {
    test('it should not accept invitation when email is empty', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:certification-center-invitation');
      adapter.accept = sinon.stub();

      await render(
        hbs`<Auth::ToggableLoginForm
  @isWithInvitation='true'
  @certificationCenterInvitationId='1'
  @certificationCenterInvitationCode='C0D3'
/>`,
      );

      // when
      await fillByLabel(passwordInputLabel, 'Pix12345!');
      await clickByName(loginLabel);

      // then
      sinon.assert.notCalled(adapter.accept);
      assert.ok(true);
    });
  });
});
