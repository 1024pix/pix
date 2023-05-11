const { domainBuilder, expect } = require('../../../test-helper');
const simulateFlashDeterministicAssessmentScenario = require('../../../../lib/domain/usecases/simulate-flash-deterministic-assessment-scenario');
const sinon = require('sinon');
const { AssessmentEndedError } = require('../../../../lib/domain/errors');

const locale = 'fr-fr';

describe('Unit | UseCase | simulate-flash-deterministic-assessment-scenario', function () {
  context('when there are enough flash challenges left', function () {
    it('should return an estimated level and challenges array', async function () {
      // given
      const simulationAnswers = ['ok', 'ko', 'aband'];
      const assessmentId = '123';

      const firstSkill = domainBuilder.buildSkill({ id: 'firstSkill' });
      const secondSkill = domainBuilder.buildSkill({ id: 'secondSkill' });
      const thirdSkill = domainBuilder.buildSkill({ id: 'thirdSkill' });
      const firstChallenge = domainBuilder.buildChallenge({
        id: 'one',
        skill: firstSkill,
        difficulty: -2,
        discriminant: 0.16,
      });
      const secondChallenge = domainBuilder.buildChallenge({
        id: 'two',
        skill: secondSkill,
        difficulty: 6,
        discriminant: 3,
      });
      const thirdChallenge = domainBuilder.buildChallenge({
        id: 'three',
        skill: thirdSkill,
        difficulty: 8.5,
        discriminant: 1.587,
      });

      const challengeRepository = {
        findOperativeFlashCompatible: sinon.stub(),
      };
      const pickChallengeService = { chooseNextChallenge: sinon.stub() };

      challengeRepository.findOperativeFlashCompatible.resolves([firstChallenge, secondChallenge, thirdChallenge]);

      pickChallengeService.chooseNextChallenge
        .withArgs({
          possibleChallenges: [firstChallenge, thirdChallenge, secondChallenge],
          assessmentId,
        })
        .returns(firstChallenge);

      pickChallengeService.chooseNextChallenge
        .withArgs({
          possibleChallenges: [thirdChallenge, secondChallenge],
          assessmentId,
        })
        .returns(secondChallenge);

      pickChallengeService.chooseNextChallenge
        .withArgs({
          possibleChallenges: [thirdChallenge],
          assessmentId,
        })
        .returns(thirdChallenge);

      const pseudoRandom = {
        create: () => ({
          binaryTreeRandom: () => 0,
        }),
      };

      // when
      const { estimatedLevel, challenges } = await simulateFlashDeterministicAssessmentScenario({
        challengeRepository,
        locale,
        simulationAnswers,
        pseudoRandom,
        assessmentId,
        pickChallengeService,
      });

      // then
      expect(estimatedLevel).to.equal(0.29766782658030516);
      expect(challenges).to.deep.equal([firstChallenge, secondChallenge, thirdChallenge]);
    });
  });

  context('when there are not enough flash challenges left', function () {
    it('should throw an error', async function () {
      // given
      const simulationAnswers = ['ok', 'ko', 'aband'];
      const assessmentId = '123';

      const challenge = domainBuilder.buildChallenge({ id: 1 });
      const challengeRepository = {
        findOperativeFlashCompatible: sinon.stub(),
      };
      challengeRepository.findOperativeFlashCompatible.resolves([challenge]);

      const pickChallengeService = { chooseNextChallenge: sinon.stub() };
      pickChallengeService.chooseNextChallenge
        .withArgs({
          possibleChallenges: [challenge],
          assessmentId,
        })
        .returns(challenge);

      const pseudoRandom = {
        create: () => ({
          binaryTreeRandom: () => 0,
        }),
      };

      // when
      const promise = simulateFlashDeterministicAssessmentScenario({
        challengeRepository,
        locale,
        simulationAnswers,
        pseudoRandom,
        assessmentId,
        pickChallengeService,
      });

      // then
      await expect(promise).to.be.rejectedWith(AssessmentEndedError);
    });
  });
});
