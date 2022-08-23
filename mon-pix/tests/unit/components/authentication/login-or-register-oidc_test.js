import { expect } from 'chai';
import { describe, it } from 'mocha';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-mocha';
import setupIntl from '../../../helpers/setup-intl';
import sinon from 'sinon';
import Service from '@ember/service';

describe('Unit | Component | authentication | login-or-register-oidc', function () {
  setupTest();
  setupIntl();

  describe('#register', function () {
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

      // when
      component.register();

      // then
      sinon.assert.calledWith(authenticateStub, 'authenticator:oidc', {
        authenticationKey: 'super-key',
        identityProviderSlug: 'super-idp',
      });
    });

    context('when authentication key has expired', function () {
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

        // when
        await component.register();

        // then
        expect(component.registerErrorMessage).to.equal(
          this.intl.t('pages.login-or-register-oidc.error.expired-authentication-key')
        );
      });
    });

    context('when terms of service are not selected', function () {
      it('should display error', function () {
        // given
        const component = createGlimmerComponent('component:authentication/login-or-register-oidc');
        component.isTermsOfServiceValidated = false;

        // when
        component.register();

        // then
        expect(component.registerErrorMessage).to.equal(
          this.intl.t('pages.login-or-register-oidc.error.error-message')
        );
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

      // when
      await component.register();

      // then
      expect(component.registerErrorMessage).to.equal(`${this.intl.t('common.error')} (some detail)`);
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

      // when
      await component.register();

      // then
      expect(component.registerErrorMessage).to.equal(this.intl.t('common.error'));
    });
  });

  describe('#validateEmail', function () {
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

  describe('#login', function () {
    beforeEach(function () {
      const oidcPartner = {
        id: 'oidc-partner',
        code: 'OIDC_PARTNER',
        organizationName: 'Partenaire OIDC',
        hasLogoutUrl: false,
        source: 'oidc-externe',
      };
      class OidcIdentityProvidersStub extends Service {
        'oidc-partner' = oidcPartner;
        list = [oidcPartner];
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
    });

    it('should request api for login', async function () {
      // given
      const email = 'glace.alo@example.net';
      const password = 'pix123';
      const component = createGlimmerComponent('component:authentication/login-or-register-oidc');
      component.email = email;
      component.password = password;
      component.args.onLogin = sinon.stub();
      const eventStub = { preventDefault: sinon.stub() };

      // when
      await component.login(eventStub);

      // then
      sinon.assert.calledWith(component.args.onLogin, {
        enteredPassword: password,
        enteredEmail: email,
      });
    });

    context('when form is invalid', function () {
      it('should not request api for reconciliation', async function () {
        // given
        const component = createGlimmerComponent('component:authentication/login-or-register-oidc');
        component.email = '';
        const eventStub = { preventDefault: sinon.stub() };
        component.args.onLogin = sinon.stub();

        // when
        await component.login(eventStub);

        // then
        sinon.assert.notCalled(component.args.onLogin);
      });
    });

    context('when authentication key has expired', function () {
      it('should display error', async function () {
        // given
        const component = createGlimmerComponent('component:authentication/login-or-register-oidc');
        component.args.onLogin = sinon.stub().rejects({ errors: [{ status: '401' }] });
        component.email = 'glace.alo@example.net';
        component.password = 'pix123';
        const eventStub = { preventDefault: sinon.stub() };

        // when
        await component.login(eventStub);

        // then
        expect(component.loginErrorMessage).to.equal(
          this.intl.t('pages.login-or-register-oidc.error.expired-authentication-key')
        );
      });
    });

    context('when user is not found', function () {
      it('should display error', async function () {
        // given
        const component = createGlimmerComponent('component:authentication/login-or-register-oidc');
        component.args.onLogin = sinon.stub().rejects({ errors: [{ status: '404' }] });
        component.email = 'glace.alo@example.net';
        component.password = 'pix123';
        const eventStub = { preventDefault: sinon.stub() };

        // when
        await component.login(eventStub);

        // then
        expect(component.loginErrorMessage).to.equal(
          this.intl.t('pages.login-or-register-oidc.error.login-unauthorized-error')
        );
      });
    });

    it('it should display generic error', async function () {
      // given
      const component = createGlimmerComponent('component:authentication/login-or-register-oidc');
      component.args.onLogin = sinon.stub().rejects({ errors: [{ status: '500' }] });
      component.email = 'glace.alo@example.net';
      component.password = 'pix123';
      const eventStub = { preventDefault: sinon.stub() };

      // when
      await component.login(eventStub);

      // then
      expect(component.loginErrorMessage).to.equal(this.intl.t('common.error'));
    });
  });
});
