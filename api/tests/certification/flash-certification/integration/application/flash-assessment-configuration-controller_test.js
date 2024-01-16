import { flashAssessmentConfigurationController } from '../../../../../src/certification/flash-certification/application/flash-assessment-configuration-controller.js';
import { domainBuilder, sinon, expect, hFake } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';

describe('Integration | Application | FlashAssessmentConfigurationController', function () {
  describe('#getActiveFlashAssessmentConfiguration', function () {
    it('should return the active flash assessment configuration', async function () {
      sinon.stub(usecases, 'getActiveFlashAssessmentConfiguration');

      const expectedConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
        warmUpLength: 12,
      });

      usecases.getActiveFlashAssessmentConfiguration.resolves(expectedConfiguration);

      const response = await flashAssessmentConfigurationController.getActiveFlashAssessmentConfiguration({}, hFake);

      expect(response.statusCode).to.equal(200);
      expect(response.source).to.deep.equal(expectedConfiguration);
    });
  });
});
