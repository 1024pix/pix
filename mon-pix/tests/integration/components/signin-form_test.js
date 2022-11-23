import sinon from 'sinon';
import { module, test } from 'qunit';
import { fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { render, clickByName } from '@1024pix/ember-testing-library';

import Service from '@ember/service';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

import ENV from '../../../config/environment';
const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

module('Integration | Component | signin form', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Rendering', function () {
    test('should display an input for identifiant field', async function (assert) {
      // given & when
      const screen = await render(hbs`<SigninForm />`);

      // then
      assert.dom(screen.getByRole('textbox', { name: this.intl.t('pages.sign-in.fields.login.label') })).exists();
    });

    test('should display an input for password field', async function (assert) {
      // given & when
      const screen = await render(hbs`<SigninForm />`);

      // then
      assert.dom(screen.getByLabelText(this.intl.t('pages.sign-in.fields.password.label'))).exists();
    });

    test('should display a submit button to authenticate', async function (assert) {
      // given & when
      const screen = await render(hbs`<SigninForm />`);

      // then
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.sign-in.actions.submit') })).exists();
    });

    test('should display a link to password reset view', async function (assert) {
      // given & when
      const screen = await render(hbs`<SigninForm />`);

      // then
      assert.dom(screen.getByRole('link', { name: this.intl.t('pages.sign-in.forgotten-password') })).exists();
    });

    test('should not display any error by default', async function (assert) {
      // given & when
      await render(hbs`<SigninForm />`);

      // then
      assert.notOk(document.querySelector('div.sign-form__error-message'));
    });

    module('When error api occurs', function () {
      test('should display related error message if unauthorized error', async function (assert) {
        // given
        class sessionService extends Service {
          authenticateUser = sinon.stub().rejects({ status: 401 });
        }
        this.owner.register('service:session', sessionService);
        const screen = await render(hbs`<SigninForm />`);

        // when
        await fillIn(
          screen.getByRole('textbox', { name: this.intl.t('pages.sign-in.fields.login.label') }),
          'usernotexist@example.net'
        );
        await fillIn(screen.getByLabelText(this.intl.t('pages.sign-in.fields.password.label')), 'password');
        await clickByName(this.intl.t('pages.sign-in.actions.submit'));

        // then
        assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY))).exists();
      });

      test('should display related error message if bad request error', async function (assert) {
        // given
        class sessionService extends Service {
          authenticateUser = sinon.stub().rejects({ status: 400 });
        }
        this.owner.register('service:session', sessionService);
        const screen = await render(hbs`<SigninForm />`);

        // when
        await fillIn(
          screen.getByRole('textbox', { name: this.intl.t('pages.sign-in.fields.login.label') }),
          'usernotexist@example.net'
        );
        await fillIn(screen.getByLabelText(this.intl.t('pages.sign-in.fields.password.label')), 'password');
        await clickByName(this.intl.t('pages.sign-in.actions.submit'));

        // then
        assert.ok(screen.getByText(this.intl.t(ApiErrorMessages.BAD_REQUEST.I18N_KEY)));
      });

      test('should display an error if api cannot be reached', async function (assert) {
        // given
        const stubCatchedApiErrorInternetDisconnected = undefined;
        class sessionService extends Service {
          authenticateUser = sinon.stub().rejects({ status: stubCatchedApiErrorInternetDisconnected });
        }
        this.owner.register('service:session', sessionService);
        const screen = await render(hbs`<SigninForm />`);

        // when
        await fillIn(
          screen.getByRole('textbox', { name: this.intl.t('pages.sign-in.fields.login.label') }),
          'johnharry@example.net'
        );
        await fillIn(screen.getByLabelText(this.intl.t('pages.sign-in.fields.password.label')), 'password123');
        await clickByName(this.intl.t('pages.sign-in.actions.submit'));

        // then
        assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
      });

      module('blocking', function () {
        module('when is user is temporary blocked', function () {
          test('displays a specific error', async function (assert) {
            // given
            class sessionService extends Service {
              authenticateUser = sinon
                .stub()
                .rejects({ status: 403, responseJSON: { errors: [{ code: 'USER_IS_TEMPORARY_BLOCKED' }] } });
            }
            this.owner.register('service:session', sessionService);
            const screen = await render(hbs`<SigninForm />`);

            // when
            await fillIn(
              screen.getByRole('textbox', { name: this.intl.t('pages.sign-in.fields.login.label') }),
              'user.temporary-blocked@example.net'
            );
            await fillIn(screen.getByLabelText(this.intl.t('pages.sign-in.fields.password.label')), 'password123');
            await clickByName(this.intl.t('pages.sign-in.actions.submit'));

            // then
            const errorMessage = screen.getByText(
              (content) =>
                content.startsWith(
                  'Vous avez effectué trop de tentatives de connexion. Réessayez plus tard ou cliquez sur'
                ) && content.endsWith('pour le réinitialiser.')
            );
            const errorMessageLink = screen.getByRole('link', { name: 'mot de passe oublié' });

            assert.dom(errorMessage).exists();
            assert.dom(errorMessageLink).hasAttribute('href', '/mot-de-passe-oublie');
          });
        });
        module('when is user blocked', function () {
          test('displays a specific error', async function (assert) {
            // given
            class sessionService extends Service {
              authenticateUser = sinon
                .stub()
                .rejects({ status: 403, responseJSON: { errors: [{ code: 'USER_IS_BLOCKED' }] } });
            }
            this.owner.register('service:session', sessionService);
            const screen = await render(hbs`<SigninForm />`);

            // when
            await fillIn(
              screen.getByRole('textbox', { name: this.intl.t('pages.sign-in.fields.login.label') }),
              'user.blocked@example.net'
            );
            await fillIn(screen.getByLabelText(this.intl.t('pages.sign-in.fields.password.label')), 'password123');
            await clickByName(this.intl.t('pages.sign-in.actions.submit'));

            // then
            const errorMessage = screen.getByText((content) =>
              content.startsWith(
                'Votre compte est bloqué car vous avez effectué trop de tentatives de connexion. Pour le débloquer,'
              )
            );
            const errorMessageLink = screen.getByRole('link', { name: 'contactez-nous' });

            assert.dom(errorMessage).exists();
            assert.dom(errorMessageLink).hasAttribute('href', 'https://support.pix.org/support/tickets/new');
          });
        });
      });
    });

    module('when domain is pix.org', function () {
      test('should not display Pole Emploi button', async function (assert) {
        // given
        class UrlServiceStub extends Service {
          get isFrenchDomainExtension() {
            return false;
          }
        }

        this.owner.register('service:url', UrlServiceStub);

        // when
        const screen = await render(hbs`<SigninForm />`);

        // then
        assert
          .dom(
            screen.queryByRole('link', {
              name: `${this.intl.t('pages.sign-in.pole-emploi.link.img')} ${this.intl.t(
                'pages.sign-in.pole-emploi.title'
              )}`,
            })
          )
          .doesNotExist();
      });
    });

    module('when domain is pix.fr', function () {
      test('should display a Pole emploi button', async function (assert) {
        // given
        class UrlServiceStub extends Service {
          get isFrenchDomainExtension() {
            return true;
          }
        }
        this.owner.register('service:url', UrlServiceStub);

        // when
        const screen = await render(hbs`<SigninForm />`);

        // then
        assert
          .dom(
            screen.getByRole('link', {
              name: `${this.intl.t('pages.sign-in.pole-emploi.link.img')} ${this.intl.t(
                'pages.sign-in.pole-emploi.title'
              )}`,
            })
          )
          .exists();
      });
    });
  });

  module('Behaviours', function () {
    test('should authenticate user when she submitted sign-in form', async function (assert) {
      // given
      class sessionService extends Service {
        authenticateUser = sinon.stub().resolves();
      }
      this.owner.register('service:session', sessionService);
      const session = this.owner.lookup('service:session', sessionService);

      const screen = await render(hbs`<SigninForm />`);

      await fillIn(
        screen.getByRole('textbox', { name: this.intl.t('pages.sign-in.fields.login.label') }),
        'johnharry@example.net'
      );
      await fillIn(screen.getByLabelText(this.intl.t('pages.sign-in.fields.password.label')), 'password123');

      // when
      await clickByName(this.intl.t('pages.sign-in.actions.submit'));

      // Then
      sinon.assert.calledOnce(session.authenticateUser);
      assert.ok(true);
    });
  });
});
