import { expect } from 'chai';
import { describe, it } from 'mocha';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-mocha';
import setupIntl from '../../../helpers/setup-intl';
import sinon from 'sinon';
import Service from '@ember/service';
import EmberObject from '@ember/object';

describe('Unit | Component | authentication | oidc-reconciliation', function () {
  setupTest();
  setupIntl();

  describe('#backToLoginOrRegisterForm', function () {
    it('should redirect back to login or register page', function () {
      // given
      const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
      component.args.toggleOidcReconciliation = sinon.stub();

      // when
      component.backToLoginOrRegisterForm();

      // then
      sinon.assert.called(component.args.toggleOidcReconciliation);
    });
  });

  describe('#oidcAuthenticationMethodOrganizationNames', function () {
    it('should return method organization names', function () {
      // given & when
      class OidcIdentityProvidersStub extends Service {
        getIdentityProviderNamesByAuthenticationMethods() {
          return ['France Connect', 'Impots.gouv'];
        }
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
      component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'FRANCE_CONNECT' })];

      // then
      expect(component.oidcAuthenticationMethodOrganizationNames).to.be.an('array').that.includes('France Connect');
    });
  });

  describe('#shouldShowGarAuthenticationMethod', function () {
    context('when gar authentication method exist', function () {
      it('should display authentication method', function () {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'GAR' })];

        // then
        expect(component.shouldShowGarAuthenticationMethod).to.be.true;
      });
    });

    context('when gar authentication method does not exist', function () {
      it('should not display authentication method', function () {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'OIDC' })];

        // then
        expect(component.shouldShowGarAuthenticationMethod).to.be.false;
      });
    });
  });

  describe('#identityProviderOrganizationName', function () {
    it('should display identity provider organization name', function () {
      // given & when
      const oidcPartner = {
        id: 'oidc-partner',
        organizationName: 'Partenaire OIDC',
      };
      class OidcIdentityProvidersStub extends Service {
        'oidc-partner' = oidcPartner;
        list = [oidcPartner];
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
      component.args.identityProviderSlug = 'oidc-partner';

      // then
      expect(component.identityProviderOrganizationName).to.equal('Partenaire OIDC');
    });
  });

  describe('#shouldShowEmail', function () {
    context('when email exist', function () {
      it('should display email', function () {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.email = 'lloyd.ce@example.net';

        // then
        expect(component.shouldShowEmail).to.be.true;
      });
    });

    context('when email does not exist', function () {
      it('should not display email', function () {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.email = null;

        // then
        expect(component.shouldShowEmail).to.be.false;
      });
    });
  });

  describe('#shouldShowUsername', function () {
    context('when username exist', function () {
      it('should display username', function () {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.username = 'lloyd.ce1122';

        // then
        expect(component.shouldShowUsername).to.be.true;
      });
    });

    context('when username does not exist', function () {
      it('should not display username', function () {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.username = null;

        // then
        expect(component.shouldShowUsername).to.be.false;
      });
    });
  });

  context('when authentication key has expired', function () {
    it('should display error', async function () {
      // given
      const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
      const authenticateStub = sinon.stub().rejects({ errors: [{ status: '401' }] });
      class SessionStub extends Service {
        authenticate = authenticateStub;
      }
      this.owner.register('service:session', SessionStub);
      component.args.identityProviderSlug = 'super-idp';
      component.args.authenticationKey = 'super-key';
      component.isTermsOfServiceValidated = true;

      // when
      await component.reconcile();

      // then
      expect(component.reconcileErrorMessage).to.equal(
        this.intl.t('pages.login-or-register-oidc.error.expired-authentication-key')
      );
    });
  });

  context('when an error happens', function () {
    it('should display generic error message', async function () {
      // given
      const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
      const authenticateStub = sinon.stub().rejects({ errors: [{ status: '400' }] });
      class SessionStub extends Service {
        authenticate = authenticateStub;
      }
      this.owner.register('service:session', SessionStub);
      component.args.identityProviderSlug = 'super-idp';
      component.args.authenticationKey = 'super-key';
      component.isTermsOfServiceValidated = true;

      // when
      await component.reconcile();

      // then
      expect(component.reconcileErrorMessage).to.equal(this.intl.t('common.error'));
    });
  });
});
