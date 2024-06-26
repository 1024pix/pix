import { flashAssessmentConfigurationController } from '../../../../../src/certification/flash-certification/application/flash-assessment-configuration-controller.js';
import { usecases } from '../../../../../src/certification/flash-certification/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

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

  describe('#createFlashAssessmentConfiguration', function () {
    it('should create an active flash assessment configuration', async function () {
      sinon.stub(usecases, 'createFlashAssessmentConfiguration');

      const payload = {
        warmUpLength: 12,
      };

      const response = await flashAssessmentConfigurationController.createFlashAssessmentConfiguration(
        { payload },
        hFake,
      );

      expect(response.statusCode).to.equal(204);
      expect(usecases.createFlashAssessmentConfiguration).to.have.been.calledWith({
        configuration: payload,
      });
    });
  });
});
