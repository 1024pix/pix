import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import setupIntl from '../../../helpers/setup-intl';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Component | authentication::terms-of-service-oidc', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('when terms of service are not selected', function () {
    test('should display error', function (assert) {
      // given
      const component = createGlimmerComponent('component:authentication/terms-of-service-oidc');
      component.isTermsOfServiceValidated = false;
      component.errorMessage = null;

      // when
      component.submit();

      // then
      assert.equal(component.errorMessage, 'Vous devez accepter les conditions d’utilisation de Pix.');
    });
  });

  module('#submit', function () {
    test('should create session', function (assert) {
      // given
      const component = createGlimmerComponent('component:authentication/terms-of-service-oidc');
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
      assert.expect(0);
      sinon.assert.calledWith(authenticateStub, 'authenticator:oidc', {
        authenticationKey: 'super-key',
        identityProviderSlug: 'super-idp',
      });
    });

    module('when authentication key has expired', function () {
      test('should display error', async function (assert) {
        // given
        const component = createGlimmerComponent('component:authentication/terms-of-service-oidc');
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
        assert.equal(
          component.errorMessage,
          "Votre demande d'authentification a expiré, merci de renouveler votre connexion en cliquant sur le bouton retour."
        );
        assert.true(component.isAuthenticationKeyExpired);
      });
    });

    test('it should display detailed error', async function (assert) {
      // given
      const component = createGlimmerComponent('component:authentication/terms-of-service-oidc');
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
      assert.equal(
        component.errorMessage,
        'Une erreur est survenue. Veuillez recommencer ou contacter le support. (some detail)'
      );
    });

    test('it should display generic error', async function (assert) {
      // given
      const component = createGlimmerComponent('component:authentication/terms-of-service-oidc');
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
      assert.equal(component.errorMessage, 'Une erreur est survenue. Veuillez recommencer ou contacter le support.');
    });
  });
});
