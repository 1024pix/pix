/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import sinon from 'sinon';
import { module, test } from 'qunit';
import { fillIn, find, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import Service from '@ember/service';

import ENV from '../../../config/environment';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { contains } from '../../helpers/contains';
import { clickByLabel } from '../../helpers/click-by-label';

const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

module('Integration | Component | signin form', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Rendering', async function () {
    test('should display an input for identifiant field', async function (assert) {
      // when
      await render(hbs`<SigninForm />`);

      // then
      assert.dom(document.querySelector('input#login')).exists();
    });

    test('should display an input for password field', async function (assert) {
      // when
      await render(hbs`<SigninForm />`);

      // then
      assert.dom(document.querySelector('input#password')).exists();
    });

    test('should display a submit button to authenticate', async function (assert) {
      // when
      await render(hbs`<SigninForm />`);

      // then
      assert.dom(contains(this.intl.t('pages.sign-in.actions.submit'))).exists();
    });

    test('should display a link to password reset view', async function (assert) {
      // when
      await render(hbs`<SigninForm />`);

      // then
      assert.dom(document.querySelector('a.sign-form-body__forgotten-password-link')).exists();
    });

    test('should not display any error by default', async function (assert) {
      // when
      await render(hbs`<SigninForm />`);

      // then
      assert.dom(document.querySelector('div.sign-form__error-message')).doesNotExist();
    });

    module('When error api occurs', function () {
      test('should display related error message if unauthorized error', async function (assert) {
        // given
        const expectedErrorMessage = ApiErrorMessages.LOGIN_UNAUTHORIZED.MESSAGE;
        this.set('authenticateUser', sinon.stub().rejects({ status: 401 }));
        await render(hbs`<SigninForm @authenticateUser={{this.authenticateUser}} />`);

        // when
        await fillIn('input#login', 'usernotexist@example.net');
        await fillIn('input#password', 'password');
        await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

        // then
        assert.equal(find('div[id="sign-in-error-message"]').textContent.trim(), this.intl.t(expectedErrorMessage));
      });

      test('should display related error message if bad request error', async function (assert) {
        // given
        const expectedErrorMessage = ApiErrorMessages.BAD_REQUEST.MESSAGE;
        this.set('authenticateUser', sinon.stub().rejects({ status: 400 }));
        await render(hbs`<SigninForm @authenticateUser={{this.authenticateUser}} />`);

        // when
        await fillIn('input#login', 'usernotexist@example.net');
        await fillIn('input#password', 'password');
        await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

        // then
        assert.equal(find('div[id="sign-in-error-message"]').textContent.trim(), this.intl.t(expectedErrorMessage));
      });

      test('should display an error if api cannot be reached', async function (assert) {
        // given
        const stubCatchedApiErrorInternetDisconnected = undefined;
        this.set('authenticateUser', sinon.stub().rejects(stubCatchedApiErrorInternetDisconnected));
        await render(hbs`<SigninForm @authenticateUser={{this.authenticateUser}} />`);

        // when
        await fillIn('input#login', 'johnharry@example.net');
        await fillIn('input#password', 'password123');
        await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

        // then
        assert.dom(document.querySelector('div.sign-form__notification-message--error')).exists();
        assert.equal(
          find('div[id="sign-in-error-message"]').textContent.trim(),
          this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.MESSAGE)
        );
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
        assert.dom(contains(linkText)).doesNotExist();
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
        assert.dom(contains(linkText)).exists();
      });
    });
  });

  module('Behaviours', function () {
    test('should authenticate user when she submitted sign-in form', async function (assert) {
      let actualEmail;
      let actualPassword;

      // given
      const expectedEmail = 'email@example.fr';
      const expectedPassword = 'azerty';

      this.set('onSubmitAction', function (email, password) {
        // then
        actualEmail = email;
        actualPassword = password;
        return Promise.resolve();
      });

      await render(hbs`<SigninForm @authenticateUser={{this.onSubmitAction}} />`);

      await fillIn('input#login', expectedEmail);
      await triggerEvent('input#login', 'change');
      await fillIn('input#password', expectedPassword);
      await triggerEvent('input#password', 'change');

      // when
      await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

      // Then
      assert.equal(actualEmail, expectedEmail);
      assert.equal(actualPassword, expectedPassword);
    });
  });
});
