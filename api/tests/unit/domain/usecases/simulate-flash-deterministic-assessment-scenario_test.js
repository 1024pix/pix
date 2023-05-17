import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { simulateFlashDeterministicAssessmentScenario } from '../../../../lib/domain/usecases/simulate-flash-deterministic-assessment-scenario.js';
import { AssessmentEndedError } from '../../../../lib/domain/errors.js';

const locale = 'fr-fr';

describe('Unit | UseCase | simulate-flash-deterministic-assessment-scenario', function () {
  context('when there are enough flash challenges left', function () {
    it('should return an array of estimated level, challenge, reward and error rate for each answer', async function () {
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
      const result = await simulateFlashDeterministicAssessmentScenario({
        challengeRepository,
        locale,
        simulationAnswers,
        pseudoRandom,
        assessmentId,
        pickChallengeService,
      });

      // then
      expect(result).to.have.lengthOf(3);
      result.forEach((answer) => {
        expect(answer.challenge).not.to.be.undefined;
        expect(answer.errorRate).not.to.be.undefined;
        expect(answer.estimatedLevel).not.to.be.undefined;
        expect(answer.reward).not.to.be.undefined;
        expect(answer.answer).not.to.be.undefined;
      });
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
