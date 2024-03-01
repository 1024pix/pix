import { competenceForScoringConfigurationController } from '../../../../../src/certification/scoring/application/competence-for-scoring-configuration-controller.js';
import { sinon, expect, hFake } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/certification/scoring/domain/usecases/index.js';

describe('Integration | Application | CompetenceForScoringConfigurationController', function () {
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

      const response = await competenceForScoringConfigurationController.saveCompetenceForScoringConfiguration(
        request,
        hFake,
      );

      expect(response.statusCode).to.equal(201);
      expect(usecases.saveCompetenceForScoringConfiguration).to.have.been.calledWith({
        data: request.payload,
      });
    });
  });
});
