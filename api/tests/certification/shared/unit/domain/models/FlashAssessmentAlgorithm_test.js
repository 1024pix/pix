import sinon from 'sinon';

import { FlashAssessmentAlgorithm } from '../../../../../../src/certification/evaluation/domain/models/FlashAssessmentAlgorithm.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../../../../src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { AssessmentLackOfChallengesError } from '../../../../../../src/shared/domain/errors.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

const baseFlashAssessmentAlgorithmConfig = {
  challengesBetweenSameCompetence: 2,
  limitToOneQuestionPerTube: false,
  enablePassageByAllCompetences: false,
  defaultCandidateCapacity: -3,
  defaultProbabilityToPickChallenge: 51,
  variationPercent: 0.5,
};

describe('Unit | Domain | Models | FlashAssessmentAlgorithm', function () {
  let flashAlgorithmImplementation;

  beforeEach(function () {
    flashAlgorithmImplementation = {
      getPossibleNextChallenges: sinon.stub(),
      getCapacityAndErrorRate: sinon.stub(),
    };
  });

  describe('#getPossibleNextChallenges', function () {
    context('when user has answered more questions than allowed', function () {
      it('should throw a RangeError', function () {
        // given
        const assessmentAnswers = [domainBuilder.buildAnswer({ id: 1 }), domainBuilder.buildAnswer({ id: 2 })];
        const skill1 = domainBuilder.buildSkill({ id: 1 });
        const skill2 = domainBuilder.buildSkill({ id: 2 });
        const challenges = [
          domainBuilder.buildChallenge({ id: assessmentAnswers[0].challengeId, skill: skill1 }),
          domainBuilder.buildChallenge({ competenceId: 'comp2', skill: skill2 }),
        ];
        const capacity = 0;
        const algorithm = new FlashAssessmentAlgorithm({
          flashAlgorithmImplementation,
          configuration: _getAlgorithmConfig({
            maximumAssessmentLength: 1,
          }),
        });

        // when
        const error = catchErrSync(({ assessmentAnswers, challenges, capacity }) =>
          algorithm.getPossibleNextChallenges({
            assessmentAnswers,
            challenges,
            capacity,
          }),
        )({
          assessmentAnswers,
          challenges,
          capacity,
        });

        // then
        expect(error).to.be.instanceOf(RangeError);
        expect(error.message).to.equal('User answered more questions than allowed');
      });
    });

    context('when user has answered to the maximun number of questions', function () {
      it('should throw an AssessmentEndedError', function () {
        // then
        const assessmentAnswers = [domainBuilder.buildAnswer({ id: 1 }), domainBuilder.buildAnswer({ id: 2 })];
        const skill1 = domainBuilder.buildSkill({ id: 1 });
        const skill2 = domainBuilder.buildSkill({ id: 2 });
        const challenges = [
          domainBuilder.buildChallenge({ id: assessmentAnswers[0].challengeId, skill: skill1 }),
          domainBuilder.buildChallenge({ competenceId: 'comp2', skill: skill2 }),
        ];
        const capacity = 0;
        const algorithm = new FlashAssessmentAlgorithm({
          flashAlgorithmImplementation,
          configuration: _getAlgorithmConfig({
            maximumAssessmentLength: 2,
          }),
        });

        // when
        const nextChallenges = algorithm.getPossibleNextChallenges({
          assessmentAnswers,
          challenges,
          capacity,
        });

        expect(nextChallenges).to.have.lengthOf(0);
      });
    });

    context('when there are challenges left to answer', function () {
      context('with limitToOneQuestionPerTube=true', function () {
        it('should limit to one challenge', function () {
          const alreadyAnsweredChallengesCount = 10;
          const remainingAnswersToGive = 1;
          const initialCapacity = baseFlashAssessmentAlgorithmConfig.defaultCandidateCapacity;
          const computedCapacity = 2;
          const algorithm = new FlashAssessmentAlgorithm({
            flashAlgorithmImplementation,
            configuration: _getAlgorithmConfig({
              maximumAssessmentLength: alreadyAnsweredChallengesCount + remainingAnswersToGive,
              limitToOneQuestionPerTube: true,
            }),
          });

          const skill1Tube1 = domainBuilder.buildSkill({
            tubeId: 'tube1',
          });
          const skill2Tube1 = domainBuilder.buildSkill({
            tubeId: 'tube1',
          });
          const skillTube2 = domainBuilder.buildSkill({
            tubeId: 'tube2',
          });

          const answeredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'answeredChallengeTube1',
            skill: skill1Tube1,
          });

          const unansweredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube1',
            skill: skill2Tube1,
          });

          const unansweredChallengeTube2 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube2',
            skill: skillTube2,
          });

          const assessmentAnswers = [
            domainBuilder.buildAnswer({
              challengeId: answeredChallengeTube1.id,
            }),
          ];

          const challenges = [answeredChallengeTube1, unansweredChallengeTube1, unansweredChallengeTube2];

          flashAlgorithmImplementation.getCapacityAndErrorRate
            .withArgs(
              _getCapacityAndErrorRateParams({
                allAnswers: assessmentAnswers,
                challenges,
                capacity: initialCapacity,
              }),
            )
            .returns({
              capacity: computedCapacity,
            });

          const expectedChallenges = [unansweredChallengeTube2];
          flashAlgorithmImplementation.getPossibleNextChallenges
            .withArgs({
              availableChallenges: expectedChallenges,
              capacity: computedCapacity,
            })
            .returns(expectedChallenges);

          expect(algorithm.getPossibleNextChallenges({ assessmentAnswers, challenges })).to.deep.equal(
            expectedChallenges,
          );
        });
      });

      context('with limitToOneQuestionPerTube=false', function () {
        it('should return challenges with non answered skills', function () {
          const alreadyAnsweredChallengesCount = 10;
          const remainingAnswersToGive = 1;
          const initialCapacity = baseFlashAssessmentAlgorithmConfig.defaultCandidateCapacity;
          const computedCapacity = 2;
          const algorithm = new FlashAssessmentAlgorithm({
            flashAlgorithmImplementation,
            configuration: _getAlgorithmConfig({
              maximumAssessmentLength: alreadyAnsweredChallengesCount + remainingAnswersToGive,
              limitToOneQuestionPerTube: false,
            }),
          });

          const skill1Tube1 = domainBuilder.buildSkill({
            id: 'skill1',
            tubeId: 'tube1',
          });
          const skill2Tube1 = domainBuilder.buildSkill({
            id: 'skill2',
            tubeId: 'tube1',
          });
          const skillTube2 = domainBuilder.buildSkill({
            id: 'skill3',
            tubeId: 'tube2',
          });

          const answeredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'answeredChallengeTube1',
            skill: skill1Tube1,
          });

          const unansweredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube1',
            skill: skill2Tube1,
          });

          const unansweredChallengeTube2 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube2',
            skill: skillTube2,
          });

          const assessmentAnswers = [
            domainBuilder.buildAnswer({
              challengeId: answeredChallengeTube1.id,
            }),
          ];

          const challenges = [answeredChallengeTube1, unansweredChallengeTube1, unansweredChallengeTube2];

          flashAlgorithmImplementation.getCapacityAndErrorRate
            .withArgs(
              _getCapacityAndErrorRateParams({
                allAnswers: assessmentAnswers,
                challenges,
                capacity: initialCapacity,
              }),
            )
            .returns({
              capacity: computedCapacity,
            });

          const expectedChallenges = [unansweredChallengeTube1, unansweredChallengeTube2];
          flashAlgorithmImplementation.getPossibleNextChallenges
            .withArgs({
              availableChallenges: expectedChallenges,
              capacity: computedCapacity,
            })
            .returns(expectedChallenges);

          expect(algorithm.getPossibleNextChallenges({ assessmentAnswers, challenges })).to.deep.equal(
            expectedChallenges,
          );
        });
      });
    });

    context('when all challenges are eliminated by rules', function () {
      it('should throw an AssessmentLackOfChallengesError', function () {
        // given
        const initialCapacity = baseFlashAssessmentAlgorithmConfig.defaultCandidateCapacity;
        const computedCapacity = 2;
        const algorithm = new FlashAssessmentAlgorithm({
          flashAlgorithmImplementation,
          configuration: _getAlgorithmConfig({
            maximumAssessmentLength: 32,
            limitToOneQuestionPerTube: true,
          }),
        });

        const skill1 = domainBuilder.buildSkill({ id: 'skill1', tubeId: 'tube1' });
        const skill2 = domainBuilder.buildSkill({ id: 'skill2', tubeId: 'tube1' });

        const answeredChallenge = domainBuilder.buildChallenge({
          id: 'answeredChallenge',
          skill: skill1,
        });
        const remainingChallenge = domainBuilder.buildChallenge({
          id: 'remainingChallenge',
          skill: skill2,
        });

        const assessmentAnswers = [domainBuilder.buildAnswer({ challengeId: answeredChallenge.id })];
        const challenges = [answeredChallenge, remainingChallenge];

        flashAlgorithmImplementation.getCapacityAndErrorRate
          .withArgs(
            _getCapacityAndErrorRateParams({
              allAnswers: assessmentAnswers,
              challenges,
              capacity: initialCapacity,
            }),
          )
          .returns({ capacity: computedCapacity });

        // when
        const error = catchErrSync(({ assessmentAnswers, challenges }) =>
          algorithm.getPossibleNextChallenges({ assessmentAnswers, challenges }),
        )({ assessmentAnswers, challenges });

        // then
        expect(error).to.be.instanceOf(AssessmentLackOfChallengesError);
        expect(error.numberOfAnswers).to.equal(1);
        expect(error.maximumAssessmentLength).to.equal(32);
      });
    });
  });
});

const _getAlgorithmConfig = (options) => {
  return new FlashAssessmentAlgorithmConfiguration({
    ...baseFlashAssessmentAlgorithmConfig,
    ...options,
  });
};

const _getCapacityAndErrorRateParams = (params) => ({
  variationPercent: baseFlashAssessmentAlgorithmConfig.variationPercent,
  ...params,
});
