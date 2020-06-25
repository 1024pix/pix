import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  click,
  fillIn,
  find,
  render,
  triggerEvent,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import setupIntl from '../../helpers/setup-intl';
import ENV from '../../../config/environment';

const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

describe('Integration | Component | signin form', function() {

  setupRenderingTest();
  setupIntl();

  describe('Rendering', async function() {

    beforeEach(function() {
      this.intl.setLocale('fr-fr');
    });

    it('should display an input for identifiant field', async function() {
      // when
      await render(hbs`<SigninForm />`);

      // then
      expect(document.querySelector('input#login')).to.exist;
    });

    it('should display an input for password field', async function() {
      // when
      await render(hbs`<SigninForm />`);

      // then
      expect(document.querySelector('input#password')).to.exist;
    });

    it('should display a submit button to authenticate', async function() {
      // when
      await render(hbs`<SigninForm />`);

      // then
      expect(document.querySelector('button.button')).to.exist;
    });

    it('should display a link to password reset view', async function() {
      // when
      await render(hbs`<SigninForm />`);

      // then
      expect(document.querySelector('a.sign-form-body__forgotten-password-link')).to.exist;
    });

    it('should not display any error by default', async function() {
      // when
      await render(hbs`<SigninForm />`);

      // then
      expect(document.querySelector('div.sign-form__error-message')).to.not.exist;
    });

    context('When error api occurs', function() {

      it('should display related error message if unauthorized error', async function() {
        // given
        const expectedErrorMessage = ApiErrorMessages.LOGIN_UNAUTHORIZED.MESSAGE;
        const apiReturn = {
          errors: [{
            status: 401,
            detail: expectedErrorMessage,
            title: 'Unauthorized error'
          }]
        };
        this.set('authenticateUser', sinon.stub().rejects(apiReturn));
        await render(hbs`<SigninForm @authenticateUser={{this.authenticateUser}} />`);

        // when
        await fillIn('input#login', 'usernotexist@example.net');
        await fillIn('input#password', 'password');
        await click('button.button');

        // then
        expect(find('.sign-form__notification-message--error').textContent.trim()).to.equal(this.intl.t(expectedErrorMessage));
      });

      it('should display an error if api cannot be reached', async function() {
        // given
        const stubCatchedApiErrorInternetDisconnected = undefined;
        this.set('authenticateUser', sinon.stub().rejects(stubCatchedApiErrorInternetDisconnected));
        await render(hbs`<SigninForm @authenticateUser={{this.authenticateUser}} />`);

        // when
        await fillIn('input#login', 'johnharry@example.net');
        await fillIn('input#password', 'password123');
        await click('button.button');

        // then
        expect(document.querySelector('div.sign-form__notification-message--error')).to.exist;
        expect(find('.sign-form__notification-message--error').textContent.trim()).to.equal(this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.MESSAGE));

      });

      it('should display related error message if internal server error', async function() {
        // given
        const expectedErrorMessage = ApiErrorMessages.INTERNAL_SERVER_ERROR.MESSAGE;
        const apiReturn = {
          errors: [{
            status: 500,
            detail: expectedErrorMessage,
            title: 'Internal server error'
          }]
        };
        this.set('authenticateUser', sinon.stub().rejects(apiReturn));
        await render(hbs`<SigninForm @authenticateUser={{this.authenticateUser}} />`);

        // when
        await fillIn('input#login', 'johnharry@example.net');
        await fillIn('input#password', 'password123');
        await click('button.button');

        // then
        expect(find('.sign-form__notification-message--error').textContent.trim()).to.equal(this.intl.t(expectedErrorMessage));
      });

      it('should display related error message if bad gateway error', async function() {
        // given
        const expectedErrorMessage = ApiErrorMessages.BAD_GATEWAY.MESSAGE;
        const apiReturn = {
          errors: [{
            status: 502,
            detail: expectedErrorMessage,
            title: 'Bad gateway error'
          }]
        };
        this.set('authenticateUser', sinon.stub().rejects(apiReturn));
        await render(hbs`<SigninForm @authenticateUser={{this.authenticateUser}} />`);

        // when
        await fillIn('input#login', 'johnharry@example.net');
        await fillIn('input#password', 'password123');
        await click('button.button');

        // then
        expect(find('.sign-form__notification-message--error').textContent.trim()).to.equal(this.intl.t(expectedErrorMessage));
      });

      it('should display related error message if gateway timeout error', async function() {
        // given
        const expectedErrorMessage = ApiErrorMessages.GATEWAY_TIMEOUT.MESSAGE;
        const apiReturn = {
          errors: [{
            status: 504,
            detail: expectedErrorMessage,
            title: 'Gateway timeout error'
          }]
        };
        this.set('authenticateUser', sinon.stub().rejects(apiReturn));
        await render(hbs`<SigninForm @authenticateUser={{this.authenticateUser}} />`);

        // when
        await fillIn('input#login', 'johnharry@example.net');
        await fillIn('input#password', 'password123');
        await click('button.button');

        // then
        expect(find('.sign-form__notification-message--error').textContent.trim()).to.equal(this.intl.t(expectedErrorMessage));
      });

      it('should display related error message if not implemented error', async function() {
        // given
        const apiReturn = {
          errors: [{
            status: 501,
            detail: 'Not implemented Error',
            title: 'Not implemented error'
          }]
        };
        this.set('authenticateUser', sinon.stub().rejects(apiReturn));
        await render(hbs`<SigninForm @authenticateUser={{this.authenticateUser}} />`);

        // when
        await fillIn('input#login', 'johnharry@example.net');
        await fillIn('input#password', 'password123');
        await click('button.button');

        // then
        expect(find('.sign-form__notification-message--error').textContent.trim()).to.equal(this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.MESSAGE));
      });

    });

  });

  describe('Behaviours', function() {

    it('should authenticate user when she submitted sign-in form', async function() {
      // given
      const expectedEmail = 'email@example.fr';
      const expectedPassword = 'azerty';

      this.set('onSubmitAction', function(email, password) {
        // then
        expect(email).to.equal(expectedEmail);
        expect(password).to.equal(expectedPassword);
        return Promise.resolve();
      });

      await render(hbs`<SigninForm @authenticateUser={{this.onSubmitAction}} />`);

      await fillIn('input#login', expectedEmail);
      await triggerEvent('input#login', 'change');
      await fillIn('input#password', expectedPassword);
      await triggerEvent('input#password', 'change');

      // when
      await click('button.button');
    });

  });
});
