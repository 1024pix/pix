import { expect } from 'chai';
import { describe, it } from 'mocha';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';
import EmberObject from '@ember/object';

describe('Unit | Component | authentication | login-or-register-oidc', function () {
  setupTest();

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

  describe('#shouldShowPoleEmploiAuthenticationMethod', function () {
    context('when pole emploi authentication method exist', function () {
      it('should display authentication method', function () {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'POLE_EMPLOI' })];

        // then
        expect(component.shouldShowPoleEmploiAuthenticationMethod).to.be.true;
      });
    });

    context('when pole emploi authentication method does not exist', function () {
      it('should not display authentication method', function () {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'OIDC' })];

        // then
        expect(component.shouldShowPoleEmploiAuthenticationMethod).to.be.false;
      });
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

  describe('#shouldShowCnavAuthenticationMethod', function () {
    context('when cnav authentication method exist', function () {
      it('should display authentication method', function () {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'CNAV' })];

        // then
        expect(component.shouldShowCnavAuthenticationMethod).to.be.true;
      });
    });

    context('when cnav authentication method does not exist', function () {
      it('should not display authentication method', function () {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'OIDC' })];

        // then
        expect(component.shouldShowCnavAuthenticationMethod).to.be.false;
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
});
