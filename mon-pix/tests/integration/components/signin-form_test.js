/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import {
  click,
  fillIn,
  find,
  render,
  triggerEvent,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import Service from '@ember/service';

import ENV from '../../../config/environment';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { contains } from '../../helpers/contains';

const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

describe('Integration | Component | signin form', function() {

  setupIntlRenderingTest();

  beforeEach(function() {
    const featureTogglesStub = Service.extend({
      featureToggles: {
        isPoleEmploiEnabled: false,
      },
    });
    this.owner.register('service:featureToggles', featureTogglesStub);
  });

  describe('Rendering', async function() {

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
        this.set('authenticateUser', sinon.stub().rejects({ status: 401 }));
        await render(hbs`<SigninForm @authenticateUser={{this.authenticateUser}} />`);

        // when
        await fillIn('input#login', 'usernotexist@example.net');
        await fillIn('input#password', 'password');
        await click('button.button');

        // then
        expect(find('.sign-form__notification-message--error').textContent.trim()).to.equal(this.intl.t(expectedErrorMessage));
      });

      it('should display related error message if bad request error', async function() {
        // given
        const expectedErrorMessage = ApiErrorMessages.BAD_REQUEST.MESSAGE;
        this.set('authenticateUser', sinon.stub().rejects({ status: 400 }));
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
    });

    context('when domain is pix.org', function() {

      it('should not display Pole Emploi button', async function() {
        // given
        const linkText = this.intl.t('pages.sign-in.pole-emploi.title');

        class UrlServiceStub extends Service {
          get isFrenchDomainExtension() {
            return false;
          }
        }
        const featureTogglesStub = Service.extend({
          featureToggles: {
            isPoleEmploiEnabled: true,
          },
        });

        this.owner.register('service:featureToggles', featureTogglesStub);
        this.owner.register('service:url', UrlServiceStub);

        // when
        await render(hbs `<SigninForm />`);

        // then
        expect(contains(linkText)).not.exist;
      });
    });

    context('when domain is pix.fr', function() {

      let linkText ;

      beforeEach(function() {
        class UrlServiceStub extends Service {
          get isFrenchDomainExtension() {
            return true;
          }
        }
        this.owner.register('service:url', UrlServiceStub);

        linkText = this.intl.t('pages.sign-in.pole-emploi.title');
      });

      it('should not display a Pole emploi button when Pole emploi connection is disabled', async function() {
        // when
        await render(hbs `<SigninForm />`);

        // then
        expect(contains(linkText)).not.exist;
      });

      it('should display a Pole emploi button when Pole emploi connection is enabled', async function() {
        // given
        const featureTogglesStub = Service.extend({
          featureToggles: {
            isPoleEmploiEnabled: true,
          },
        });
        this.owner.register('service:featureToggles', featureTogglesStub);

        // when
        await render(hbs `<SigninForm />`);

        // then
        expect(contains(linkText)).to.exist;
      });
    });
  });

  describe('Behaviours', function() {

    it('should authenticate user when she submitted sign-in form', async function() {
      let actualEmail;
      let actualPassword;

      // given
      const expectedEmail = 'email@example.fr';
      const expectedPassword = 'azerty';

      this.set('onSubmitAction', function(email, password) {
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
      await click('button.button');

      // Then
      expect(actualEmail).to.equal(expectedEmail);
      expect(actualPassword).to.equal(expectedPassword);
    });
  });
});
