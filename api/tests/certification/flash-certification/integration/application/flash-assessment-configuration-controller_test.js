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

  describe('#updateActiveFlashAssessmentConfiguration', function () {
    it('should update the active flash assessment configuration', async function () {
      sinon.stub(usecases, 'updateActiveFlashAssessmentConfiguration');

      const payload = {
        warmUpLength: 12,
      };

      const response = await flashAssessmentConfigurationController.updateActiveFlashAssessmentConfiguration(
        { payload },
        hFake,
      );

      expect(response.statusCode).to.equal(204);
      expect(usecases.updateActiveFlashAssessmentConfiguration).to.have.been.calledWith({
        configuration: payload,
      });
    });
  });
});
