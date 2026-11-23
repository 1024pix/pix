import { t } from 'mon-pix/tests/helpers/setup-intl';
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
    controller.set('apiErrorMessage', null);
  });

  module('#checkCertificate', function () {
    module('when no certificate is found', function () {
      test('should set apiErrorMessage with specific message', async function (assert) {
        // given
        storeStub.queryRecord.rejects({ errors: [{ status: '404' }] });

        // when
        await controller.actions.checkCertificate.call(controller, 'P-222BBB78');

        // then
        assert.strictEqual(
          controller.get('apiErrorMessage'),
          t('pages.fill-in-certificate-verification-code.errors.not-found'),
        );
      });
    });

    module('when certificate is found', function () {
      test('should not set apiErrorMessage', async function (assert) {
        // given
        storeStub.queryRecord.resolves({ result: { status: '200' } });

        // when
        await controller.actions.checkCertificate.call(controller, 'P-222BBB78');

        // then
        assert.strictEqual(controller.apiErrorMessage, null);
      });
    });
  });
});
