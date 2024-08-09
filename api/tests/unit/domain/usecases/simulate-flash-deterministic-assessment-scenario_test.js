import _ from 'lodash';

import { simulateFlashDeterministicAssessmentScenario } from '../../../../src/certification/flash-certification/domain/usecases/simulate-flash-deterministic-assessment-scenario.js';
import { config } from '../../../../src/shared/config.js';
import { AnswerStatus } from '../../../../src/shared/domain/models/AnswerStatus.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

const locale = 'fr-fr';

const successAnswerMatcher = sinon.match({
  result: AnswerStatus.OK,
});

describe('Unit | UseCase | simulate-flash-deterministic-assessment-scenario', function () {
  context('when there are enough flash challenges left', function () {
    context('when no initial capacity is provided', function () {
      it('should return an array of capacity, challenge, reward and error rate for each answer', async function () {
        // given
        const { challengeRepository, pickChallenge, pickAnswerStatus, flashAlgorithmService } = prepareStubs();

        // when
        const result = await simulateFlashDeterministicAssessmentScenario({
          stopAtChallenge: 3,
          challengeRepository,
          locale,
          pickChallenge,
          pickAnswerStatus,
          flashAlgorithmService,
          enablePassageByAllCompetences: false,
        });

        // then
        expect(result).to.have.lengthOf(3);
        result.forEach((answer) => {
          expect(answer.challenge).not.to.be.undefined;
          expect(answer.errorRate).not.to.be.undefined;
          expect(answer.capacity).not.to.be.undefined;
          expect(answer.reward).not.to.be.undefined;
          expect(answer.answerStatus).not.to.be.undefined;
        });
      });
    });

    context('when the initial capacity is provided', function () {
      it('should return an array of estimated level, challenge, reward and error rate for each answer', async function () {
        // given
        const initialCapacity = 7;

        const { challengeRepository, firstChallenge, pickChallenge, pickAnswerStatus, flashAlgorithmService } =
          prepareStubs({
            initialCapacity,
          });

        flashAlgorithmService.getReward
          .withArgs({
            difficulty: firstChallenge.difficulty,
            discriminant: firstChallenge.discriminant,
            capacity: initialCapacity,
          })
          .returns(0.5);

        // when
        const result = await simulateFlashDeterministicAssessmentScenario({
          stopAtChallenge: 3,
          challengeRepository,
          locale,
          pickChallenge,
          pickAnswerStatus,
          initialCapacity,
          flashAlgorithmService,
          limitToOneQuestionPerTube: false,
          enablePassageByAllCompetences: false,
        });

        // then
        expect(result).to.have.lengthOf(3);
        result.forEach((answer) => {
          expect(answer.challenge).not.to.be.undefined;
          expect(answer.errorRate).not.to.be.undefined;
          expect(answer.capacity).not.to.be.undefined;
          expect(answer.reward).not.to.be.undefined;
          expect(answer.answerStatus).not.to.be.undefined;
        });
      });
    });

    context('when we don‘t limit the number of challenges per tube', function () {
      it('should return an array of estimated level, challenge, reward and error rate for each answer', async function () {
        // given
        const limitToOneQuestionPerTube = false;
        const enablePassageByAllCompetences = false;

        const {
          challengeRepository,
          pickChallenge,
          pickAnswerStatus,
          flashAlgorithmService: baseFlashAlgorithmService,
          getNextChallengesOptionsMatcher,
          allChallenges,
        } = prepareStubs({
          limitToOneQuestionPerTube,
        });

        const flashAlgorithmService = {
          ...baseFlashAlgorithmService,
          getPossibleNextChallenges: sinon.stub(),
        };
        const [firstChallenge, secondChallenge, thirdChallenge] = allChallenges;

        flashAlgorithmService.getPossibleNextChallenges
          .withArgs({
            availableChallenges: allChallenges,
            capacity: 0,
            options: getNextChallengesOptionsMatcher,
          })
          .returns([firstChallenge, thirdChallenge, secondChallenge])
          .withArgs({
            availableChallenges: [secondChallenge, thirdChallenge],
            capacity: 1,
            options: getNextChallengesOptionsMatcher,
          })
          .returns([thirdChallenge, secondChallenge])
          .withArgs({
            availableChallenges: [thirdChallenge],
            capacity: 2,
            options: getNextChallengesOptionsMatcher,
          })
          .returns([thirdChallenge]);

        // when
        const result = await simulateFlashDeterministicAssessmentScenario({
          stopAtChallenge: 3,
          challengeRepository,
          locale,
          pickChallenge,
          pickAnswerStatus,
          limitToOneQuestionPerTube,
          flashAlgorithmService,
          enablePassageByAllCompetences,
        });

        // then
        expect(result).to.have.lengthOf(3);
        result.forEach((answer) => {
          expect(answer.challenge).not.to.be.undefined;
          expect(answer.errorRate).not.to.be.undefined;
          expect(answer.capacity).not.to.be.undefined;
          expect(answer.reward).not.to.be.undefined;
          expect(answer.answerStatus).not.to.be.undefined;
        });
      });
    });

    context('when we set a minimum estimated success rate range', function () {
      it('should return an array of estimated level, challenge, reward and error rate for each answer', async function () {
        // given
        const limitToOneQuestionPerTube = false;
        const enablePassageByAllCompetences = false;
        const minimumEstimatedSuccessRateRanges = [
          domainBuilder.buildFlashAssessmentAlgorithmSuccessRateHandlerFixed({
            startingChallengeIndex: 0,
            endingChallengeIndex: 3,
            value: 0.8,
          }),
        ];

        const { challengeRepository, pickChallenge, pickAnswerStatus, flashAlgorithmService } = prepareStubs({
          minimalSuccessRate: 0.8,
        });

        // when
        const result = await simulateFlashDeterministicAssessmentScenario({
          stopAtChallenge: 3,
          challengeRepository,
          locale,
          pickChallenge,
          pickAnswerStatus,
          minimumEstimatedSuccessRateRanges,
          flashAlgorithmService,
          limitToOneQuestionPerTube,
          enablePassageByAllCompetences,
        });

        // then
        expect(result).to.have.lengthOf(3);
        result.forEach((answer) => {
          expect(answer.challenge).not.to.be.undefined;
          expect(answer.errorRate).not.to.be.undefined;
          expect(answer.capacity).not.to.be.undefined;
          expect(answer.reward).not.to.be.undefined;
          expect(answer.answerStatus).not.to.be.undefined;
        });
      });
    });

    context('when doing a double measure', function () {
      it('should return an array of estimated level, challenge, reward and error rate for each answer', async function () {
        // given
        const { challengeRepository, pickChallenge, pickAnswerStatus, flashAlgorithmService } = prepareStubs({
          doubleMeasuresUntil: 2,
        });

        // when
        const result = await simulateFlashDeterministicAssessmentScenario({
          stopAtChallenge: 3,
          challengeRepository,
          locale,
          pickChallenge,
          pickAnswerStatus,
          flashAlgorithmService,
          enablePassageByAllCompetences: false,
          doubleMeasuresUntil: 2,
        });

        // then
        expect(result).to.have.lengthOf(3);
        result.forEach((answer) => {
          expect(answer.challenge).not.to.be.undefined;
          expect(answer.capacity).not.to.be.undefined;
        });
      });
    });
  });

  context('when there are not enough flash challenges left', function () {
    it('should stop simulating', async function () {
      // given
      const limitToOneQuestionPerTube = false;
      const enablePassageByAllCompetences = false;
      const challenge = domainBuilder.buildChallenge({ id: 1 });
      const challengeRepository = {
        findFlashCompatible: sinon.stub(),
      };
      challengeRepository.findFlashCompatible.resolves([challenge]);

      const pickChallenge = sinon.stub();
      const pickAnswerStatus = sinon.stub();

      const flashAlgorithmService = {
        getPossibleNextChallenges: sinon.stub(),
        getCapacityAndErrorRate: sinon.stub(),
        getReward: sinon.stub(),
      };

      flashAlgorithmService.getPossibleNextChallenges
        .withArgs(
          sinon.match({
            availableChallenges: [challenge],
          }),
        )
        .returns([challenge])
        .withArgs(
          sinon.match({
            availableChallenges: [],
          }),
        )
        .returns([]);

      flashAlgorithmService.getCapacityAndErrorRate.returns({
        capacity: 0,
        errorRate: 1,
      });
      flashAlgorithmService.getReward.returns(1);

      pickChallenge
        .withArgs({
          possibleChallenges: [challenge],
        })
        .returns(challenge);

      pickAnswerStatus.withArgs(sinon.match({ nextChallenge: challenge })).returns(AnswerStatus.OK);

      // when
      const error = await catchErr(simulateFlashDeterministicAssessmentScenario)({
        challengeRepository,
        locale,
        pickChallenge,
        pickAnswerStatus,
        flashAlgorithmService,
        limitToOneQuestionPerTube,
        enablePassageByAllCompetences,
      });

      // then
      expect(error).to.be.instanceof(RangeError);
      expect(error.message).to.equal('No eligible challenges in referential');
    });
  });
});

function prepareStubs({
  initialCapacity = config.v3Certification.defaultCandidateCapacity,
  minimalSuccessRate,
  doubleMeasuresUntil = 0,
} = {}) {
  const firstSkill = domainBuilder.buildSkill({ id: 'firstSkill', tubeId: '1' });
  const secondSkill = domainBuilder.buildSkill({ id: 'secondSkill', tubeId: '2' });
  const thirdSkill = domainBuilder.buildSkill({ id: 'thirdSkill', tubeId: '3' });
  const firstChallenge = domainBuilder.buildChallenge({
    id: 'one',
    skill: firstSkill,
    difficulty: -2,
    discriminant: 0.16,
    competenceId: 'rec1',
  });
  const secondChallenge = domainBuilder.buildChallenge({
    id: 'two',
    skill: secondSkill,
    difficulty: 6,
    discriminant: 3,
    competenceId: 'rec2',
  });
  const thirdChallenge = domainBuilder.buildChallenge({
    id: 'three',
    skill: thirdSkill,
    difficulty: 7.5,
    discriminant: 1.587,
    competenceId: 'rec3',
  });

  const allChallenges = [firstChallenge, secondChallenge, thirdChallenge];

  const challengeRepository = {
    findFlashCompatible: sinon.stub(),
  };
  const pickChallenge = sinon.stub();
  const pickAnswerStatus = sinon.stub();
  const flashAlgorithmService = {
    getPossibleNextChallenges: sinon.stub(),
    getCapacityAndErrorRate: sinon.stub(),
    getReward: sinon.stub(),
  };

  const getNextChallengesOptionsMatcher = sinon.match(
    _.omitBy(
      {
        minimalSuccessRate,
      },
      _.isUndefined,
    ),
  );

  flashAlgorithmService.getCapacityAndErrorRate
    .withArgs({
      allAnswers: [],
      challenges: sinon.match.any,
      capacity: initialCapacity,
      variationPercent: undefined,
      variationPercentUntil: undefined,
      doubleMeasuresUntil,
    })
    .returns({ capacity: 0, errorRate: 0.1 })
    .withArgs({
      allAnswers: [successAnswerMatcher],
      challenges: [firstChallenge, secondChallenge, thirdChallenge],
      capacity: initialCapacity,
      variationPercent: undefined,
      variationPercentUntil: undefined,
      doubleMeasuresUntil,
    })
    .returns({ capacity: 1, errorRate: 1.1 })
    .withArgs({
      allAnswers: [successAnswerMatcher, successAnswerMatcher],
      challenges: [firstChallenge, secondChallenge, thirdChallenge],
      capacity: initialCapacity,
      variationPercent: undefined,
      variationPercentUntil: undefined,
      doubleMeasuresUntil,
    })
    .returns({ capacity: 2, errorRate: 2.1 })
    .withArgs({
      allAnswers: [successAnswerMatcher, successAnswerMatcher, successAnswerMatcher],
      challenges: [firstChallenge, secondChallenge, thirdChallenge],
      capacity: initialCapacity,
      variationPercent: undefined,
      variationPercentUntil: undefined,
      doubleMeasuresUntil,
    })
    .returns({ capacity: 3, errorRate: 3.1 });

  flashAlgorithmService.getReward
    .withArgs({
      difficulty: firstChallenge.difficulty,
      discriminant: firstChallenge.discriminant,
      capacity: 0,
    })
    .returns(0.5)
    .withArgs({
      difficulty: secondChallenge.difficulty,
      discriminant: secondChallenge.discriminant,
      capacity: 1,
    })
    .returns(1.5)
    .withArgs({
      difficulty: thirdChallenge.difficulty,
      discriminant: thirdChallenge.discriminant,
      capacity: 2,
    })
    .returns(2.5);

  flashAlgorithmService.getPossibleNextChallenges
    .withArgs({
      availableChallenges: allChallenges,
      capacity: 0,
      options: getNextChallengesOptionsMatcher,
    })
    .returns([firstChallenge, thirdChallenge, secondChallenge])
    .withArgs({
      availableChallenges: [thirdChallenge],
      capacity: 2,
      options: getNextChallengesOptionsMatcher,
    })
    .returns([thirdChallenge]);

  if (doubleMeasuresUntil) {
    flashAlgorithmService.getPossibleNextChallenges
      .withArgs({
        availableChallenges: [secondChallenge, thirdChallenge],
        capacity: 0,
        options: getNextChallengesOptionsMatcher,
      })
      .returns([thirdChallenge, secondChallenge]);
  } else {
    flashAlgorithmService.getPossibleNextChallenges
      .withArgs({
        availableChallenges: [secondChallenge, thirdChallenge],
        capacity: 1,
        options: getNextChallengesOptionsMatcher,
      })
      .returns([thirdChallenge, secondChallenge]);
  }

  challengeRepository.findFlashCompatible.resolves([firstChallenge, secondChallenge, thirdChallenge]);

  pickChallenge
    .withArgs({
      possibleChallenges: [firstChallenge, thirdChallenge, secondChallenge],
    })
    .returns(firstChallenge)
    .withArgs({
      possibleChallenges: [thirdChallenge, secondChallenge],
    })
    .returns(secondChallenge)
    .withArgs({
      possibleChallenges: [thirdChallenge],
    })
    .returns(thirdChallenge);

  pickAnswerStatus.withArgs(sinon.match({ nextChallenge: firstChallenge })).returns(AnswerStatus.OK);
  pickAnswerStatus.withArgs(sinon.match({ nextChallenge: secondChallenge })).returns(AnswerStatus.OK);
  pickAnswerStatus.withArgs(sinon.match({ nextChallenge: thirdChallenge })).returns(AnswerStatus.OK);

  return {
    pickChallenge,
    pickAnswerStatus,
    challengeRepository,
    flashAlgorithmService,
    firstChallenge,
    allChallenges,
    getNextChallengesOptionsMatcher,
  };
}
