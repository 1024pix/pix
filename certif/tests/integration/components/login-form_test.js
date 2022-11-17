import { module, test } from 'qunit';
import { click, fillIn } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { reject, resolve } from 'rsvp';
import ENV from 'pix-certif/config/environment';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

const errorMessages = {
  NOT_LINKED_CERTIFICATION_MSG:
    "L'accès à Pix Certif est limité aux centres de certification Pix. Contactez le référent de votre centre de certification si vous pensez avoir besoin d'y accéder.",
};

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
      responseJSON: {
        errors: [
          {
            status: '401',
            title: 'Unauthorized',
            detail: ENV.APP.API_ERROR_MESSAGES.UNAUTHORIZED.MESSAGE,
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
    assert.dom(screen.getByText(ENV.APP.API_ERROR_MESSAGES.UNAUTHORIZED.MESSAGE)).exists();
  });

  test('it should display an not linked certification message when authentication fails with Forbidden Access', async function (assert) {
    // given
    const notLinkedToOrganizationErrorMessage = {
      responseJSON: {
        errors: [{ status: '403', title: 'Unauthorized', detail: errorMessages.NOT_LINKED_CERTIFICATION_MSG }],
      },
    };

    sessionStub.authenticate.callsFake(() => reject(notLinkedToOrganizationErrorMessage));
    const screen = await renderScreen(hbs`{{login-form}}`);
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'pix@example.net');
    await fillIn(screen.getByLabelText('Mot de passe'), 'JeMeLoggue1024');

    //  when
    await click(screen.getByRole('button', { name: 'Je me connecte' }));

    // then
    assert.dom(screen.getByText(errorMessages.NOT_LINKED_CERTIFICATION_MSG)).exists();
  });

  test('it should display a 504 message when authentication fails with gateway Timeout', async function (assert) {
    // given
    const gatewayTimeoutErrorMessage = {
      responseJSON: {
        errors: [
          {
            status: ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.CODE,
            title: 'Gateway Timeout',
            detail: ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.MESSAGE,
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
    assert.dom(screen.getByText(ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.MESSAGE)).exists();
  });

  test('it should display an internal server error message when unhandled error', async function (assert) {
    // given
    const msgErrorNotLinkedCertification = {
      errors: [{ status: '502', title: 'Bad Gateway', detail: 'Bad gateway occured' }],
    };

    sessionStub.authenticate.callsFake(() => reject(msgErrorNotLinkedCertification));
    const screen = await renderScreen(hbs`{{login-form}}`);
    await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail' }), 'pix@example.net');
    await fillIn(screen.getByLabelText('Mot de passe'), 'JeMeLoggue1024');

    //  when
    await click(screen.getByRole('button', { name: 'Je me connecte' }));

    // then
    assert.dom(screen.getByText(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE)).exists();
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
