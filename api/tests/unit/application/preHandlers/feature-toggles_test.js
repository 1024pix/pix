const { expect, sinon, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/application/http-errors');
const featureTogglesPreHandler = require('../../../../lib/application/preHandlers/feature-toggles');
const { featureToggles } = require('../../../../lib/config');

describe('Unit | Pre-handler | Feature Toggles', () => {
  describe('#isCertifPrescriptionSCOEnabled', () => {
    beforeEach(() => {
      sinon.stub(featureToggles, 'certifPrescriptionSco');
    });
    it('returns true whenever the certif prescription SCO toggle is enabled', async () => {
      // given
      sinon.stub(featureToggles, 'certifPrescriptionSco').value(true);

      // when
      const isAccessGranted = await featureTogglesPreHandler.isCertifPrescriptionSCOEnabled();

      // then
      expect(isAccessGranted).to.be.true;
    });

    it('throws whenever the certif prescription SCO toggle is disabled', async () => {
      // given
      sinon.stub(featureToggles, 'certifPrescriptionSco').value(false);

      // when
      const error = await catchErr(featureTogglesPreHandler.isCertifPrescriptionSCOEnabled)();

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
