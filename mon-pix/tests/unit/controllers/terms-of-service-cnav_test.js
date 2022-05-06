import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

describe('Unit | Controller | terms-of-service-cnav', function () {
  setupIntlRenderingTest();
  let controller;

  describe('#action submit', function () {
    beforeEach(function () {
      controller = this.owner.lookup('controller:terms-of-service-cnav');
      controller.session = {
        authenticate: sinon.stub(),
      };
    });

    it('should save the acceptance date of the last terms of service', async function () {
      // given
      controller.isTermsOfServiceValidated = true;
      controller.errorMessage = false;
      controller.authenticationKey = 'authenticationKey';

      // when
      await controller.send('submit');

      // then
      sinon.assert.calledWith(controller.session.authenticate, 'authenticator:cnav', {
        authenticationKey: 'authenticationKey',
      });
      expect(controller.errorMessage).to.be.false;
    });

    describe('when terms of service are not selected', function () {
      it('should display error', async function () {
        //given
        controller.isTermsOfServiceValidated = false;
        controller.errorMessage = false;

        // when
        await controller.send('submit');

        // then
        expect(controller.errorMessage).to.equal('Vous devez accepter les conditions d’utilisation de Pix.');
      });
    });

    it('it should display generic error', async function () {
      //given
      controller.isTermsOfServiceValidated = true;
      controller.errorMessage = false;
      controller.session.authenticate.rejects();

      // when
      await controller.send('submit');

      // then
      expect(controller.errorMessage).to.equal(
        'Une erreur est survenue. Veuillez recommencer ou contacter le support.'
      );
    });
  });
});
