import { expect } from 'chai';
import { describe, it } from 'mocha';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-mocha';
import setupIntl from '../../../helpers/setup-intl';
import sinon from 'sinon';

describe('Unit | Component | authentication::terms-of-service-pole-emploi', function () {
  setupTest();
  setupIntl();

  describe('when terms of service are not selected', function () {
    it('should display error', function () {
      // given
      const component = createGlimmerComponent('component:authentication/terms-of-service-pole-emploi');
      component.isTermsOfServiceValidated = false;
      component.errorMessage = null;

      // when
      component.submit();

      // then
      expect(component.errorMessage).to.equal('Vous devez accepter les conditions d’utilisation de Pix.');
    });
  });

  describe('#submit', function () {
    it('should call createSession', function () {
      // given
      const component = createGlimmerComponent('component:authentication/terms-of-service-pole-emploi');
      const createSession = sinon.stub();
      component.args.createSession = createSession;
      component.isTermsOfServiceValidated = true;
      component.errorMessage = null;

      // when
      component.submit();

      // then
      sinon.assert.calledWith(createSession);
    });

    describe('when authentication key has expired', function () {
      it('should display error', async function () {
        // given
        const component = createGlimmerComponent('component:authentication/terms-of-service-pole-emploi');
        const createSession = sinon.stub().rejects({ errors: [{ status: '401' }] });
        component.args.createSession = createSession;
        component.isTermsOfServiceValidated = true;
        component.isAuthenticationKeyExpired = false;
        component.errorMessage = null;

        // when
        await component.submit();

        // then
        expect(component.errorMessage).to.equal(
          "Votre demande d'authentification a expiré, merci de renouveler votre connexion en cliquant sur le bouton retour."
        );
        expect(component.isAuthenticationKeyExpired).to.be.true;
      });
    });

    it('it should display generic error', async function () {
      // given
      const component = createGlimmerComponent('component:authentication/terms-of-service-pole-emploi');
      const createSession = sinon.stub().rejects({ errors: [{ status: '500' }] });
      component.args.createSession = createSession;
      component.isTermsOfServiceValidated = true;
      component.errorMessage = null;

      // when
      await component.submit();

      // then
      expect(component.errorMessage).to.equal('Une erreur est survenue. Veuillez recommencer ou contacter le support.');
    });
  });
});
