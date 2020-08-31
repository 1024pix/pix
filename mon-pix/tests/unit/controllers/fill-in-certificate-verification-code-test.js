import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

describe('Unit | Controller | Fill in certificate verification Code', function() {

  setupIntlRenderingTest();

  let controller;
  let storeStub;

  beforeEach(function() {
    controller = this.owner.lookup('controller:fill-in-certificate-verification-code');
    storeStub = { queryRecord: sinon.stub() };
    controller.transitionToRoute = sinon.stub();
    controller.set('store', storeStub);
    controller.set('errorMessage', null);
    controller.set('certificateVerificationCode', null);
    controller.set('showNotFoundCertificationErrorMessage', false);
  });

  describe('#checkCertificate', () => {

    it('should set error when certificateVerificationCode code is empty', async () => {
      // given
      controller.set('certificateVerificationCode', '');

      // when
      await controller.actions.checkCertificate.call(controller);

      // then
      expect(controller.get('errorMessage')).to.equal('Merci de renseigner le code de vérification.');
    });

    it('should set error when certificateVerificationCode code is not matching the right format', async () => {
      // given
      controller.set('certificateVerificationCode', 'P-879888');

      // when
      await controller.actions.checkCertificate.call(controller);

      // then
      expect(controller.get('errorMessage')).to.equal('Veuillez vérifier le format de votre code (P-XXXXXXX).');
    });

    it('should set showNotFoundCertificationErrorMessage to true when no certificate is found', async () => {
      // given
      controller.set('certificateVerificationCode', 'P-222BBB78');
      storeStub.queryRecord.rejects({ errors: [{ status: '404' }] });

      // when
      await controller.actions.checkCertificate.call(controller);

      // then
      expect(controller.get('showNotFoundCertificationErrorMessage')).to.equal(true);
    });

    it('should NOT set showNotFoundCertificationErrorMessage to true when a certificate is found', async () => {
      // given
      controller.set('certificateVerificationCode', 'P-222BBBDD');
      storeStub.queryRecord.resolves({ result: { status: '200' } });

      // when
      await controller.actions.checkCertificate.call(controller);

      // then
      expect(controller.get('showNotFoundCertificationErrorMessage')).to.equal(false);
    });
  });
});
