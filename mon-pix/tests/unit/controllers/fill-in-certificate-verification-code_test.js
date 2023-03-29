import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Unit | Controller | Fill in certificate verification Code', function (hooks) {
  setupIntlRenderingTest(hooks);

  let controller;
  let storeStub;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:fill-in-certificate-verification-code');
    storeStub = { queryRecord: sinon.stub() };
    controller.router.transitionTo = sinon.stub();
    controller.set('store', storeStub);
    controller.set('errorMessage', null);
    controller.set('certificateVerificationCode', null);
    controller.set('showNotFoundCertificationErrorMessage', false);
  });

  module('#checkCertificate', function () {
    test('should set error when certificateVerificationCode code is empty', async function (assert) {
      // given
      controller.set('certificateVerificationCode', '');
      const event = { preventDefault: sinon.stub() };

      // when
      await controller.actions.checkCertificate.call(controller, event);

      // then
      assert.strictEqual(controller.get('errorMessage'), 'Merci de renseigner le code de vérification.');
    });

    test('should set error when certificateVerificationCode code is not matching the right format', async function (assert) {
      // given
      controller.set('certificateVerificationCode', 'P-879888');
      const event = { preventDefault: sinon.stub() };

      // when
      await controller.actions.checkCertificate.call(controller, event);

      // then
      assert.strictEqual(controller.get('errorMessage'), 'Veuillez vérifier le format de votre code (P-XXXXXXXX).');
    });

    test('should set showNotFoundCertificationErrorMessage to true when no certificate is found', async function (assert) {
      // given
      controller.set('certificateVerificationCode', 'P-222BBB78');
      storeStub.queryRecord.rejects({ errors: [{ status: '404' }] });
      const event = { preventDefault: sinon.stub() };

      // when
      await controller.actions.checkCertificate.call(controller, event);

      // then
      assert.true(controller.get('showNotFoundCertificationErrorMessage'));
    });

    test('should NOT set showNotFoundCertificationErrorMessage to true when a certificate is found', async function (assert) {
      // given
      controller.set('certificateVerificationCode', 'P-222BBBDD');
      storeStub.queryRecord.resolves({ result: { status: '200' } });
      const event = { preventDefault: sinon.stub() };

      // when
      await controller.actions.checkCertificate.call(controller, event);

      // then
      assert.false(controller.get('showNotFoundCertificationErrorMessage'));
    });
  });
});
