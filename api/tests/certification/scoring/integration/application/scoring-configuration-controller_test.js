import { scoringConfigurationController } from '../../../../../src/certification/scoring/application/scoring-configuration-controller.js';
import { usecases } from '../../../../../src/certification/scoring/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Integration | Application | ScoringConfigurationController', function () {
  describe('#saveCompetenceForScoringConfiguration', function () {
    it('should save the competence for scoring configuration', async function () {
      sinon.stub(usecases, 'saveCompetenceForScoringConfiguration');

      const request = {
        payload: {
          data: {
            warmUpLength: 12,
          },
        },
      };

      const response = await scoringConfigurationController.saveCompetenceForScoringConfiguration(request, hFake);

      expect(response.statusCode).to.equal(201);
      expect(usecases.saveCompetenceForScoringConfiguration).to.have.been.calledWith({
        data: request.payload,
      });
    });
  });

  describe('#saveCertificationScoringConfiguration', function () {
    it('should save the certification scoring configuration', async function () {
      const userId = 123;
      sinon.stub(usecases, 'saveCertificationScoringConfiguration');

      const request = {
        auth: {
          credentials: {
            userId,
          },
        },
        payload: {
          data: {
            someData: 10,
          },
        },
      };

      const response = await scoringConfigurationController.saveCertificationScoringConfiguration(request, hFake);

      expect(response.statusCode).to.equal(201);
      expect(usecases.saveCertificationScoringConfiguration).to.have.been.calledWith({
        data: request.payload,
        userId,
      });
    });
  });
});
