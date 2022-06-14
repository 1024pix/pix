import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { reject, resolve } from 'rsvp';
import ENV from 'pix-certif/config/environment';
import clickByLabel from '../../helpers/extended-ember-test-helpers/click-by-label';
import sinon from 'sinon';

const errorMessages = {
  NOT_LINKED_CERTIFICATION_MSG:
    "L'accès à Pix Certif est limité aux centres de certification Pix. Contactez le référent de votre centre de certification si vous pensez avoir besoin d'y accéder.",
};

module('Integration | Component | login-form', function (hooks) {
  setupRenderingTest(hooks);

  let sessionStub;
  class SessionStub extends Service {
    authenticate = sinon.stub();
  }

  hooks.beforeEach(function () {
    this.owner.register('service:session', SessionStub);
    sessionStub = this.owner.lookup('service:session');
  });

  test('it should ask for email and password', async function (assert) {
    // when
    await render(hbs`{{login-form}}`);

    // then
    assert.dom('#login-email').exists();
    assert.dom('#login-password').exists();
  });

  test('it should not display error message', async function (assert) {
    // when
    await render(hbs`{{login-form}}`);

    // then
    assert.dom('#login-form-error-message').doesNotExist();
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
    await render(hbs`{{login-form}}`);
    await fillIn('#login-email', 'pix@example.net');
    await fillIn('#login-password', 'JeMeLoggue1024');

    //  when
    await clickByLabel('Je me connecte');

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
    await render(hbs`{{login-form}}`);
    await fillIn('#login-email', 'pix@example.net');
    await fillIn('#login-password', 'Mauvais mot de passe');

    //  when
    await clickByLabel('Je me connecte');

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message').hasText(ENV.APP.API_ERROR_MESSAGES.UNAUTHORIZED.MESSAGE);
  });

  test('it should display an not linked certification message when authentication fails with Forbidden Access', async function (assert) {
    // given
    const notLinkedToOrganizationErrorMessage = {
      responseJSON: {
        errors: [{ status: '403', title: 'Unauthorized', detail: errorMessages.NOT_LINKED_CERTIFICATION_MSG }],
      },
    };

    sessionStub.authenticate.callsFake(() => reject(notLinkedToOrganizationErrorMessage));
    await render(hbs`{{login-form}}`);
    await fillIn('#login-email', 'pix@example.net');
    await fillIn('#login-password', 'JeMeLoggue1024');

    //  when
    await clickByLabel('Je me connecte');

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message').hasText(errorMessages.NOT_LINKED_CERTIFICATION_MSG);
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
    await render(hbs`{{login-form}}`);
    await fillIn('#login-email', 'pix@example.net');
    await fillIn('#login-password', 'JeMeLoggue1024');

    //  when
    await clickByLabel('Je me connecte');

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message').hasText(ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.MESSAGE);
  });

  test('it should display an internal server error message when unhandled error', async function (assert) {
    // given
    const msgErrorNotLinkedCertification = {
      errors: [{ status: '502', title: 'Bad Gateway', detail: 'Bad gateway occured' }],
    };

    sessionStub.authenticate.callsFake(() => reject(msgErrorNotLinkedCertification));
    await render(hbs`{{login-form}}`);
    await fillIn('#login-email', 'pix@example.net');
    await fillIn('#login-password', 'JeMeLoggue1024');

    //  when
    await clickByLabel('Je me connecte');

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message').hasText(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE);
  });
});
