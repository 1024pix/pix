const { expect, airtableBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const Solution = require('../../../../lib/domain/models/Solution');
const solutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');

describe('Integration | Repository | solution-repository', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#getByChallengeId', () => {
    const challenge = {
      id: 'recChallenge1',
      t1Status: 'Désactivé',
      t2Status: 'PasDésactivé',
      t3Status: 'PasDésactivé',
      type: 'QROC',
      solution: 'laSuperSolution',
      scoring: '@colombe',
    };
    const expectedSolution = {
      id: challenge.id,
      isT1Enabled: false,
      isT2Enabled: true,
      isT3Enabled: true,
      type: challenge.type,
      value: challenge.solution,
      scoring: 'colombe',
    };

    beforeEach(() => {
      const airtableChallenge = airtableBuilder.factory.buildChallenge({
        id: challenge.id,
        typeDEpreuve: challenge.type,
        t1EspacesCasseAccents: challenge.t1Status,
        t2Ponctuation: challenge.t2Status,
        t3DistanceDEdition: challenge.t3Status,
        bonnesReponses: challenge.solution,
        scoring: challenge.scoring,
      });
      airtableBuilder.mockLists({ challenges: [airtableChallenge] });
    });

    it('should return the solution to the challenge', async () => {
      // when
      const solution = await solutionRepository.getByChallengeId(challenge.id);

      // then
      expect(solution).to.be.instanceOf(Solution);
      expect(solution).to.deep.equal(expectedSolution);
    });
  });

});
