import { expect } from 'chai';
import { describe, it } from 'mocha';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-mocha';
import setupIntl from '../../../helpers/setup-intl';
import sinon from 'sinon';
import Service from '@ember/service';

describe('Unit | Component | authentication::login-or-register-oidc', function () {
  setupTest();
  setupIntl();

  describe('when terms of service are not selected in register form', function () {
    it('should display error', function () {
      // given
      const component = createGlimmerComponent('component:authentication/login-or-register-oidc');
      component.isTermsOfServiceValidated = false;
      component.errorMessage = null;

      // when
      component.submit();

      // then
      expect(component.errorMessage).to.equal(this.intl.t('pages.login-or-register-oidc.error.error-message'));
    });
  });

  describe('#submit', function () {
    it('should create session', function () {
      // given
      const component = createGlimmerComponent('component:authentication/login-or-register-oidc');
      const authenticateStub = sinon.stub();
      class SessionStub extends Service {
        authenticate = authenticateStub;
      }
      this.owner.register('service:session', SessionStub);
      component.args.identityProviderSlug = 'super-idp';
      component.args.authenticationKey = 'super-key';
      component.isTermsOfServiceValidated = true;
      component.errorMessage = null;

      // when
      component.submit();

      // then
      sinon.assert.calledWith(authenticateStub, 'authenticator:oidc', {
        authenticationKey: 'super-key',
        identityProviderSlug: 'super-idp',
      });
    });

    describe('when authentication key has expired', function () {
      it('should display error', async function () {
        // given
        const component = createGlimmerComponent('component:authentication/login-or-register-oidc');
        const authenticateStub = sinon.stub().rejects({ errors: [{ status: '401' }] });
        class SessionStub extends Service {
          authenticate = authenticateStub;
        }
        this.owner.register('service:session', SessionStub);
        component.args.identityProviderSlug = 'super-idp';
        component.args.authenticationKey = 'super-key';
        component.isTermsOfServiceValidated = true;
        component.isAuthenticationKeyExpired = false;
        component.errorMessage = null;

        // when
        await component.submit();

        // then
        expect(component.errorMessage).to.equal(
          this.intl.t('pages.login-or-register-oidc.error.expired-authentication-key')
        );
        expect(component.isAuthenticationKeyExpired).to.be.true;
      });
    });

    it('it should display detailed error', async function () {
      // given
      const component = createGlimmerComponent('component:authentication/login-or-register-oidc');
      const authenticateStub = sinon.stub().rejects({ errors: [{ status: '500', detail: 'some detail' }] });
      class SessionStub extends Service {
        authenticate = authenticateStub;
      }
      this.owner.register('service:session', SessionStub);
      component.args.identityProviderSlug = 'super-idp';
      component.args.authenticationKey = 'super-key';
      component.isTermsOfServiceValidated = true;
      component.errorMessage = null;

      // when
      await component.submit();

      // then
      expect(component.errorMessage).to.equal(`${this.intl.t('common.error')} (some detail)`);
    });

    it('it should display generic error', async function () {
      // given
      const component = createGlimmerComponent('component:authentication/login-or-register-oidc');
      const authenticateStub = sinon.stub().rejects({ errors: [{ status: '500' }] });
      class SessionStub extends Service {
        authenticate = authenticateStub;
      }
      this.owner.register('service:session', SessionStub);
      component.args.identityProviderSlug = 'super-idp';
      component.args.authenticationKey = 'super-key';
      component.isTermsOfServiceValidated = true;
      component.errorMessage = null;

      // when
      await component.submit();

      // then
      expect(component.errorMessage).to.equal(this.intl.t('common.error'));
    });
  });

  context('#validateEmail', function () {
    it('should trim on email validation', function () {
      // given
      const emailWithSpaces = '   glace@aleau.net   ';
      const component = createGlimmerComponent('component:authentication/login-or-register-oidc');

      // when
      component.validateEmail({ target: { value: emailWithSpaces } });

      // then
      expect(component.email).to.equal(emailWithSpaces.trim());
    });

    context('when email is invalid', function () {
      it('should display error', function () {
        // given
        const invalidEmail = 'glace@aleau';
        const component = createGlimmerComponent('component:authentication/login-or-register-oidc');

        // when
        component.validateEmail({ target: { value: invalidEmail } });

        // then
        expect(component.emailValidationMessage).to.equal(
          this.intl.t('pages.login-or-register-oidc.error.invalid-email')
        );
      });
    });
  });
});
