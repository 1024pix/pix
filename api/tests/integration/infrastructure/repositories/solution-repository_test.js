const { expect, mockLearningContent } = require('../../../test-helper');
const Solution = require('../../../../lib/domain/models/Solution');
const solutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');

describe('Integration | Repository | solution-repository', () => {

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
      const learningContent = {
        challenges: [challenge],
      };
      mockLearningContent(learningContent);
    });

    it('should return the solution to the challenge', async () => {
      // when
      const solution = await solutionRepository.getByChallengeId('recChallenge1');

      // then
      expect(solution).to.be.instanceOf(Solution);
      expect(solution).to.deep.equal(expectedSolution);
    });
  });

});
