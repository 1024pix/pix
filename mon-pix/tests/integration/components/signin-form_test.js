import sinon from 'sinon';
import { module, test } from 'qunit';
import { fillIn, find, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import Service from '@ember/service';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { contains } from '../../helpers/contains';
import { clickByLabel } from '../../helpers/click-by-label';

import ENV from '../../../config/environment';
const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

module('Integration | Component | signin form', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Rendering', function () {
    test('should display an input for identifiant field', async function (assert) {
      // when
      await render(hbs`<SigninForm />`);

      // then
      assert.ok(document.querySelector('input#login'));
    });

    test('should display an input for password field', async function (assert) {
      // when
      await render(hbs`<SigninForm />`);

      // then
      assert.ok(document.querySelector('input#password'));
    });

    test('should display a submit button to authenticate', async function (assert) {
      // when
      await render(hbs`<SigninForm />`);

      // then
      assert.ok(contains(this.intl.t('pages.sign-in.actions.submit')));
    });

    test('should display a link to password reset view', async function (assert) {
      // when
      await render(hbs`<SigninForm />`);

      // then
      assert.ok(document.querySelector('a.sign-form-body__forgotten-password-link'));
    });

    test('should not display any error by default', async function (assert) {
      // when
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
        await render(hbs`<SigninForm />`);

        // when
        await fillIn('input#login', 'usernotexist@example.net');
        await fillIn('input#password', 'password');
        await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

        // then
        const expectedErrorMessage = this.intl.t(ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY);
        assert.strictEqual(find('div[id="sign-in-error-message"]').textContent.trim(), expectedErrorMessage);
      });

      test('should display related error message if bad request error', async function (assert) {
        // given
        class sessionService extends Service {
          authenticateUser = sinon.stub().rejects({ status: 400 });
        }
        this.owner.register('service:session', sessionService);
        await render(hbs`<SigninForm />`);

        // when
        await fillIn('input#login', 'usernotexist@example.net');
        await fillIn('input#password', 'password');
        await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

        // then
        const expectedErrorMessage = this.intl.t(ApiErrorMessages.BAD_REQUEST.I18N_KEY);
        assert.strictEqual(find('div[id="sign-in-error-message"]').textContent.trim(), expectedErrorMessage);
      });

      test('should display an error if api cannot be reached', async function (assert) {
        // given
        const stubCatchedApiErrorInternetDisconnected = undefined;
        class sessionService extends Service {
          authenticateUser = sinon.stub().rejects({ status: stubCatchedApiErrorInternetDisconnected });
        }
        this.owner.register('service:session', sessionService);
        await render(hbs`<SigninForm />`);

        // when
        await fillIn('input#login', 'johnharry@example.net');
        await fillIn('input#password', 'password123');
        await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

        // then
        assert.ok(document.querySelector('div.sign-form__notification-message--error'));
        assert.strictEqual(
          find('div[id="sign-in-error-message"]').textContent.trim(),
          this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY)
        );
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
            await render(hbs`<SigninForm />`);

            // when
            await fillIn('input#login', 'user.temporary-blocked@example.net');
            await fillIn('input#password', 'password');
            await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

            // then
            const expectedErrorMessage = this.intl.t(ApiErrorMessages.USER_IS_TEMPORARY_BLOCKED.I18N_KEY, {
              url: '/mot-de-passe-oublie',
              htmlSafe: true,
            });
            assert.deepEqual(find('div[id="sign-in-error-message"]').innerHTML.trim(), expectedErrorMessage.string);
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
            await render(hbs`<SigninForm />`);

            // when
            await fillIn('input#login', 'user.blocked@example.net');
            await fillIn('input#password', 'password');
            await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

            // then
            const expectedErrorMessage = this.intl.t(ApiErrorMessages.USER_IS_BLOCKED.I18N_KEY, {
              url: 'https://support.pix.org/support/tickets/new',
              htmlSafe: true,
            });
            assert.deepEqual(find('div[id="sign-in-error-message"]').innerHTML.trim(), expectedErrorMessage.string);
          });
        });
      });
    });

    module('when domain is pix.org', function () {
      test('should not display Pole Emploi button', async function (assert) {
        // given
        const linkText = this.intl.t('pages.sign-in.pole-emploi.title');

        class UrlServiceStub extends Service {
          get isFrenchDomainExtension() {
            return false;
          }
        }

        this.owner.register('service:url', UrlServiceStub);

        // when
        await render(hbs`<SigninForm />`);

        // then
        assert.notOk(contains(linkText));
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

        const linkText = this.intl.t('pages.sign-in.pole-emploi.title');

        // when
        await render(hbs`<SigninForm />`);

        // then
        assert.ok(contains(linkText));
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

      await render(hbs`<SigninForm />`);

      await fillIn('input#login', 'email@example.fr');
      await triggerEvent('input#login', 'change');
      await fillIn('input#password', 'azerty');
      await triggerEvent('input#password', 'change');

      // when
      await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

      // Then
      sinon.assert.calledOnce(session.authenticateUser);
      assert.ok(true);
    });
  });
});
