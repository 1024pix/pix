import { module, test } from 'qunit';
import { click, fillIn } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { reject, resolve } from 'rsvp';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

import ENV from 'pix-certif/config/environment';
const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

module('Integration | Component | login-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  let sessionStub;
  class SessionStub extends Service {
    authenticate = sinon.stub();
  }

  hooks.beforeEach(function () {
    this.owner.register('service:session', SessionStub);
    sessionStub = this.owner.lookup('service:session');
  });

  test('it should display login form', async function (assert) {
    // when
    const screen = await renderScreen(hbs`{{login-form}}`);

    // then
    assert.dom(screen.getByRole('img', { name: 'Pix Certif' })).exists();
    assert.dom(screen.getByRole('heading', { name: 'Connectez-vous' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Je me connecte' })).exists();
    assert.dom(screen.getByLabelText('Mot de passe')).exists();
  });

  test('it should call authentication service with appropriate parameters', async function (assert) {
    // given
    sessionStub.authenticate.callsFake(function (authenticator, email, password, scope) {
      this.authenticator = authenticator;
      this.email = email;
      this.password = password;
      this.scope = scope;
      return resolve();
    });
    const sessionServiceObserver = this.owner.lookup('service:session');
    const screen = await renderScreen(hbs`{{login-form}}`);
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'pix@example.net');
    await fillIn(screen.getByLabelText('Mot de passe'), 'JeMeLoggue1024');

    //  when
    await click(screen.getByRole('button', { name: 'Je me connecte' }));

    // then
    assert.strictEqual(sessionServiceObserver.authenticator, 'authenticator:oauth2');
    assert.strictEqual(sessionServiceObserver.email, 'pix@example.net');
    assert.strictEqual(sessionServiceObserver.password, 'JeMeLoggue1024');
    assert.strictEqual(sessionServiceObserver.scope, 'pix-certif');
  });

  test('it should display an invalid credentials message if authentication failed', async function (assert) {
    // given
    const invalidCredentialsErrorMessage = {
      status: Number(ApiErrorMessages.LOGIN_UNAUTHORIZED.CODE),
      responseJSON: {
        errors: [
          {
            status: '401',
            title: 'Unauthorized',
            detail: ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY,
          },
        ],
      },
    };

    sessionStub.authenticate.callsFake(() => reject(invalidCredentialsErrorMessage));
    const screen = await renderScreen(hbs`{{login-form}}`);
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'pix@example.net');
    await fillIn(screen.getByLabelText('Mot de passe'), 'Mauvais mot de passe');

    //  when
    await click(screen.getByRole('button', { name: 'Je me connecte' }));

    // then
    assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY))).exists();
  });

  test('it displays a should change password message', async function (assert) {
    // given
    const errorResponse = {
      responseJSON: {
        errors: [{ status: '401', code: 'SHOULD_CHANGE_PASSWORD' }],
      },
    };

    sessionStub.authenticate.callsFake(() => reject(errorResponse));
    const screen = await renderScreen(hbs`{{login-form}}`);
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'pix@example.net');
    await fillIn(screen.getByLabelText('Mot de passe'), 'Mauvais mot de passe');

    //  when
    await click(screen.getByRole('button', { name: 'Je me connecte' }));

    // then
    const expectedErrorMessage = this.intl.t('pages.login.errors.should-change-password', {
      url: 'https://app.pix.localhost/mot-de-passe-oublie',
      htmlSafe: true,
    });

    assert
      .dom(
        screen.getByText((content, node) => {
          const hasText = (node) => node.innerHTML.trim() === `${expectedErrorMessage}`;
          const nodeHasText = hasText(node);
          const childrenDontHaveText = Array.from(node.children).every((child) => !hasText(child));
          return nodeHasText && childrenDontHaveText;
        })
      )
      .exists();
  });

  test('it should display a not linked certification message when authentication fails with Forbidden Access', async function (assert) {
    // given
    const notLinkedToOrganizationErrorMessage = {
      status: Number(ApiErrorMessages.NOT_LINKED_CERTIFICATION.CODE),
      responseJSON: {
        errors: [
          {
            status: '403',
            title: 'Unauthorized',
            detail: ApiErrorMessages.NOT_LINKED_CERTIFICATION.I18N_KEY,
          },
        ],
      },
    };

    sessionStub.authenticate.callsFake(() => reject(notLinkedToOrganizationErrorMessage));
    const screen = await renderScreen(hbs`{{login-form}}`);
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'pix@example.net');
    await fillIn(screen.getByLabelText('Mot de passe'), 'JeMeLoggue1024');

    //  when
    await click(screen.getByRole('button', { name: 'Je me connecte' }));

    // then
    assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.NOT_LINKED_CERTIFICATION.I18N_KEY))).exists();
  });

  test('it should display a 504 message when authentication fails with gateway Timeout', async function (assert) {
    // given
    const gatewayTimeoutErrorMessage = {
      status: Number(ApiErrorMessages.GATEWAY_TIMEOUT.CODE),
      responseJSON: {
        errors: [
          {
            status: ApiErrorMessages.GATEWAY_TIMEOUT.CODE,
            title: 'Gateway Timeout',
            detail: ApiErrorMessages.GATEWAY_TIMEOUT.I18N_KEY,
          },
        ],
      },
    };

    sessionStub.authenticate.callsFake(() => reject(gatewayTimeoutErrorMessage));
    const screen = await renderScreen(hbs`{{login-form}}`);
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'pix@example.net');
    await fillIn(screen.getByLabelText('Mot de passe'), 'JeMeLoggue1024');

    //  when
    await click(screen.getByRole('button', { name: 'Je me connecte' }));

    // then
    assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.GATEWAY_TIMEOUT.I18N_KEY))).exists();
  });

  test('it should display an internal server error message when unhandled error', async function (assert) {
    // given
    const msgErrorNotLinkedCertification = {
      status: Number(ApiErrorMessages.GATEWAY_TIMEOUT.CODE),
      errors: [{ status: '502', title: 'Bad Gateway', detail: 'Bad gateway occured' }],
    };

    sessionStub.authenticate.callsFake(() => reject(msgErrorNotLinkedCertification));
    const screen = await renderScreen(hbs`{{login-form}}`);
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'pix@example.net');
    await fillIn(screen.getByLabelText('Mot de passe'), 'JeMeLoggue1024');

    //  when
    await click(screen.getByRole('button', { name: 'Je me connecte' }));

    // then
    assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.GATEWAY_TIMEOUT.I18N_KEY))).exists();
  });

  module('when an invitation is cancelled', function () {
    test('it should display an error message', async function (assert) {
      // given & when
      const screen = await renderScreen(hbs`<LoginForm @isInvitationCancelled="true" />`);

      // then
      assert
        .dom(
          screen.getByText((content) => {
            return (
              content === 'Cette invitation n’est plus valide.Contactez l’administrateur de votre espace Pix Certif.'
            );
          })
        )
        .exists();
    });
  });

  module('when an invitation has already been accepted', function () {
    test('it should display an error message', async function (assert) {
      // given & when
      const screen = await renderScreen(hbs`<LoginForm @hasInvitationAlreadyBeenAccepted="true" />`);

      // then
      assert
        .dom(
          screen.getByText((content) => {
            return (
              content ===
              'Cette invitation a déjà été acceptée.Connectez-vous ou contactez l’administrateur de votre espace Pix Certif.'
            );
          })
        )
        .exists();
    });
  });
});
