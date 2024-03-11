import { fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/login-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should ask for login and password', async function (assert) {
    // when
    const screen = await render(hbs`<Routes::LoginForm/>`);

    // then
    assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' })).exists();
    assert.dom(screen.getByLabelText('Mot de passe')).exists();
  });

  test('should display an error message when authentication fails', async function (assert) {
    // given
    const errorResponse = {
      status: 401,
      responseJSON: {
        errors: [{ status: '401' }],
      },
    };

    class SessionStub extends Service {
      authenticate = sinon.stub().rejects(errorResponse);
    }
    this.owner.register('service:session', SessionStub);

    const screen = await render(hbs`<Routes::LoginForm/>`);
    await fillByLabel('Adresse e-mail ou identifiant', 'pix@example.net');
    await fillByLabel('Mot de passe', 'Mauvais mot de passe');

    //  when
    await click(screen.getByRole('button', { name: this.intl.t('pages.login-or-register.login-form.button') }));

    // then
    assert.dom(screen.getByText(this.intl.t('pages.login-or-register.login-form.error'))).exists();
  });

  test('should display password when user click', async function (assert) {
    // given
    const screen = await render(hbs`<Routes::LoginForm/>`);
    const passwordInput = screen.getByLabelText('Mot de passe');
    await fillIn(passwordInput, 'pix123');

    // when
    await click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));

    // then
    assert.dom(passwordInput).hasAttribute('type', 'text');
  });

  module('when there is no invitation', function () {
    test('should call authentication service with appropriate parameters', async function (assert) {
      // given
      class SessionStub extends Service {
        authenticate = sinon.stub().resolves();
      }
      this.owner.register('service:session', SessionStub);
      const sessionServiceObserver = this.owner.lookup('service:session');

      // when
      const screen = await render(hbs`<Routes::LoginForm/>`);
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), 'pix@example.net');
      await fillIn(screen.getByLabelText('Mot de passe'), 'JeMeLoggue1024');
      await click(screen.getByRole('button', { name: this.intl.t('pages.login-or-register.login-form.button') }));

      // then
      sinon.assert.calledWith(sessionServiceObserver.authenticate, 'authenticator:oauth2', {
        login: 'pix@example.net',
        password: 'JeMeLoggue1024',
        scope: 'mon-pix',
      });
      assert.ok(true);
    });
  });

  module('when there is an invitation', function () {
    test('should be ok and call authentication service with appropriate parameters', async function (assert) {
      // given
      class SessionStub extends Service {
        authenticate = sinon.stub().resolves();
      }
      this.owner.register('service:session', SessionStub);

      const sessionServiceObserver = this.owner.lookup('service:session');

      //  when
      const screen = await render(hbs`<Routes::LoginForm/>`);
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), 'pix@example.net');
      await fillIn(screen.getByLabelText('Mot de passe'), 'JeMeLoggue1024');
      await click(screen.getByRole('button', { name: this.intl.t('pages.login-or-register.login-form.button') }));

      // then
      sinon.assert.calledWith(sessionServiceObserver.authenticate, 'authenticator:oauth2', {
        login: 'pix@example.net',
        password: 'JeMeLoggue1024',
        scope: 'mon-pix',
      });
      assert.ok(true);
    });
  });

  module('when password is a one time password', function () {
    test('should redirect to "update-expired-password" route', async function (assert) {
      // given
      class StoreStub extends Service {
        createRecord = sinon.stub().resolves();
      }
      this.owner.register('service:store', StoreStub);

      const response = {
        responseJSON: {
          errors: [
            {
              title: 'PasswordShouldChange',
              meta: 'PASSWORD_RESET_TOKEN',
            },
          ],
        },
      };

      class SessionStub extends Service {
        authenticate = sinon.stub().rejects(response);
      }
      this.owner.register('service:session', SessionStub);

      const routerObserver = this.owner.lookup('service:router');
      routerObserver.replaceWith = sinon.stub();

      // when
      const screen = await render(hbs`<Routes::LoginForm/>`);
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), 'pix@example.net');
      await fillIn(screen.getByLabelText('Mot de passe'), 'Mauvais mot de passe');
      await click(screen.getByRole('button', { name: this.intl.t('pages.login-or-register.login-form.button') }));

      // then
      sinon.assert.calledWith(routerObserver.replaceWith, 'update-expired-password');
      assert.ok(true);
    });
  });

  module('when external user IdToken exist', function (hooks) {
    const externalUserToken = 'ABCD';

    let addGarAuthenticationMethodToUserStub;

    hooks.beforeEach(function () {
      class StoreStub extends Service {
        createRecord = sinon.stub().resolves();
      }
      this.owner.register('service:store', StoreStub);

      class SessionStub extends Service {
        authenticate = sinon.stub().resolves();
        isAuthenticated = sinon.stub().returns(true);
        get = sinon.stub().returns(externalUserToken);
        invalidate = sinon.stub().resolves();
      }
      this.owner.register('service:session', SessionStub);

      addGarAuthenticationMethodToUserStub = sinon.stub();
    });

    test('should display the specific error message if update fails with http error 4xx', async function (assert) {
      // given
      const expectedErrorMessage = 'Les données que vous avez soumises ne sont pas au bon format.';
      const apiReturn = {
        errors: [
          {
            status: 400,
            detail: expectedErrorMessage,
          },
        ],
      };

      addGarAuthenticationMethodToUserStub.rejects(apiReturn);
      this.set('addGarAuthenticationMethodToUser', addGarAuthenticationMethodToUserStub);

      const screen = await render(
        hbs`<Routes::LoginForm @addGarAuthenticationMethodToUser={{this.addGarAuthenticationMethodToUser}} />`,
      );

      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), 'pix@example.net');
      await fillIn(screen.getByLabelText('Mot de passe'), 'JeMeLoggue1024');

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.login-or-register.login-form.button') }));

      // then
      assert.dom(screen.getByText(expectedErrorMessage)).exists();
    });

    test('should display the default error message if update fails with other http error', async function (assert) {
      // given
      const expectedErrorMessage =
        'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.';
      const apiReturn = {
        errors: [
          {
            status: 500,
            detail: expectedErrorMessage,
          },
        ],
      };
      addGarAuthenticationMethodToUserStub.rejects(apiReturn);

      this.set('addGarAuthenticationMethodToUser', addGarAuthenticationMethodToUserStub);

      const screen = await render(
        hbs`<Routes::LoginForm @addGarAuthenticationMethodToUser={{this.addGarAuthenticationMethodToUser}} />`,
      );

      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), 'pix@example.net');
      await fillIn(screen.getByLabelText('Mot de passe'), 'JeMeLoggue1024');

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.login-or-register.login-form.button') }));

      // then
      assert.dom(screen.getByText(expectedErrorMessage)).exists();
    });

    test('should display the specific error message if update fails with http error 409 and code UNEXPECTED_USER_ACCOUNT', async function (assert) {
      // given
      const expectedErrorMessage =
        "L'adresse e-mail ou l'identifiant est incorrect. Pour continuer, vous devez vous connecter à votre compte qui est sous la forme : t***@exmaple.net";
      const apiReturn = {
        errors: [
          {
            status: 409,
            detail: expectedErrorMessage,
            code: 'UNEXPECTED_USER_ACCOUNT',
            meta: {
              value: 't***@exmaple.net',
            },
          },
        ],
      };

      addGarAuthenticationMethodToUserStub.rejects(apiReturn);
      this.set('addGarAuthenticationMethodToUser', addGarAuthenticationMethodToUserStub);

      const screen = await render(
        hbs`<Routes::LoginForm @addGarAuthenticationMethodToUser={{this.addGarAuthenticationMethodToUser}} />`,
      );

      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), 'pix@example.net');
      await fillIn(screen.getByLabelText('Mot de passe'), 'JeMeLoggue1024');

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.login-or-register.login-form.button') }));

      // then
      assert.dom(screen.getByText(expectedErrorMessage)).exists();
    });
  });
});
