import sinon from 'sinon';
import { resolve } from 'rsvp';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { triggerEvent } from '@ember/test-helpers';
import Service from '@ember/service';
import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Auth::ToggableLoginForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  class SessionStub extends Service {}

  let emailInputLabel;
  let passwordInputLabel;
  let loginLabel;

  hooks.beforeEach(function () {
    this.owner.register('service:session', SessionStub);

    emailInputLabel = this.intl.t('common.forms.login-labels.email.label');
    passwordInputLabel = this.intl.t('common.forms.login-labels.password.label');
    loginLabel = this.intl.t('pages.login-or-register.login-form.login');
  });

  module('Login Inputs', function () {
    test('it should display email and password inputs', async function (assert) {
      // when
      const screen = await render(hbs`<Auth::ToggableLoginForm/>`);

      // then
      assert.dom(screen.getByRole('textbox', { name: emailInputLabel })).exists();
      assert.dom(screen.getByLabelText(passwordInputLabel)).exists();
    });

    test('[a11y] it should display a message that all inputs are required', async function (assert) {
      // when
      const screen = await render(hbs`<Auth::ToggableLoginForm/>`);

      // then
      assert.dom(screen.getByText('Tous les champs sont obligatoires.')).exists();
      assert.dom(screen.getByRole('textbox', { name: emailInputLabel })).hasAttribute('required');
      assert.dom(screen.getByLabelText(passwordInputLabel)).hasAttribute('required');
    });

    module('when the user fills inputs with errors', function () {
      test('should display an invalid email error message when focus-out', async function (assert) {
        //given
        const invalidEmail = 'invalidEmail';
        const screen = await render(hbs`<Auth::ToggableLoginForm/>`);

        // when
        await fillByLabel(emailInputLabel, invalidEmail);
        const emailInput = screen.getByRole('textbox', { name: emailInputLabel });
        await triggerEvent(emailInput, 'focusout');

        // then
        assert.dom(screen.getByText(this.intl.t('common.forms.login-labels.email.error-format'))).exists();
      });

      test('should display an empty password error message when focus-out', async function (assert) {
        //given
        const screen = await render(hbs`<Auth::ToggableLoginForm/>`);

        // when
        await fillByLabel(passwordInputLabel, '');
        const passwordInput = screen.getByLabelText(passwordInputLabel);
        await triggerEvent(passwordInput, 'focusout');

        // then
        assert.dom(screen.getByText(this.intl.t('common.forms.login-labels.password.error-mandatory'))).exists();
      });
    });
  });

  module('When there is a valid invitation and user is not member of certification center yet', function (hooks) {
    const acceptCertificationCenterInvitationStub = sinon.stub();
    hooks.beforeEach(function () {
      SessionStub.prototype.authenticate = function (authenticator, email, password, scope) {
        this.authenticator = authenticator;
        this.email = email;
        this.password = password;
        this.scope = scope;
        return resolve();
      };

      acceptCertificationCenterInvitationStub.resolves('response');
      this.set('certificationCenterInvitation', {
        id: '56',
        status: 'PENDING',
        certificationCenterName: 'Some Center',
        email: 'marie.tim@example.net',
        accept: acceptCertificationCenterInvitationStub,
      });
    });

    module('when user click on login button', function () {
      test('it should accept invitation with appropriate parameters', async function (assert) {
        // given
        await render(
          hbs`<Auth::ToggableLoginForm @isWithInvitation=true @certificationCenterInvitationId='1' @certificationCenterInvitationCode='C0D3' @certificationCenterInvitation={{this.certificationCenterInvitation}}/>`
        );

        // when
        await fillByLabel(emailInputLabel, 'email@example.net');
        await fillByLabel(passwordInputLabel, 'Pix12345!');
        await clickByName(loginLabel);

        // then
        assert.ok(
          acceptCertificationCenterInvitationStub.calledWith({
            id: '1',
            code: 'C0D3',
            email: 'email@example.net',
          })
        );
      });

      module('When there is an error in accepting invitation', function () {
        test('it should display a message error', async function (assert) {
          // given
          const acceptCertificationCenterInvitationStub = sinon.stub();
          acceptCertificationCenterInvitationStub.rejects({ errors: [{ code: 403, status: '403' }] });

          this.set('certificationCenterInvitation', {
            id: '56',
            status: 'PENDING',
            certificationCenterName: 'Some Center',
            email: 'marie.tim@example.net',
            accept: acceptCertificationCenterInvitationStub,
          });

          const screen = await render(
            hbs`<Auth::ToggableLoginForm @isWithInvitation=true @certificationCenterInvitationId='1' @certificationCenterInvitationCode='C0D3' @certificationCenterInvitation={{this.certificationCenterInvitation}}/>`
          );

          await fillByLabel(emailInputLabel, 'pix@example.net');
          await fillByLabel(passwordInputLabel, 'JeMeLoggue1024');

          // when
          await clickByName(loginLabel);

          // then
          assert.dom(screen.getByText(this.intl.t('pages.login-or-register.login-form.errors.status.403'))).exists();
        });
        module('When invitation has already been accepted by user', function () {
          test('it should call authentication service with appropriate parameters', async function (assert) {
            // given
            const acceptCertificationCenterInvitationStub = sinon.stub();
            acceptCertificationCenterInvitationStub.rejects({ errors: [{ code: 412, status: '412' }] });
            this.set('certificationCenterInvitation', {
              id: '56',
              status: 'PENDING',
              certificationCenterName: 'Some Center',
              email: 'marie.tim@example.net',
              accept: acceptCertificationCenterInvitationStub,
            });

            SessionStub.prototype.authenticate = function (authenticator, email, password, scope) {
              this.authenticator = authenticator;
              this.email = email;
              this.password = password;
              this.scope = scope;
              return resolve();
            };

            const sessionServiceObserver = this.owner.lookup('service:session');

            await render(
              hbs`<Auth::ToggableLoginForm @isWithInvitation=true @certificationCenterInvitationId='1' @certificationCenterInvitationCode='C0D3' @certificationCenterInvitation={{this.certificationCenterInvitation}}/>`
            );

            await fillByLabel(emailInputLabel, 'pix@example.net');
            await fillByLabel(passwordInputLabel, 'JeMeLoggue1024');

            // when
            await clickByName(loginLabel);

            // then
            assert.strictEqual(sessionServiceObserver.authenticator, 'authenticator:oauth2');
            assert.strictEqual(sessionServiceObserver.email, 'pix@example.net');
            assert.strictEqual(sessionServiceObserver.password, 'JeMeLoggue1024');
            assert.strictEqual(sessionServiceObserver.scope, 'pix-certif');
          });
        });
      });
    });
  });
});
