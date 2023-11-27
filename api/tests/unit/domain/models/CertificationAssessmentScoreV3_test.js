import _ from 'lodash';

import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { AnswerStatus } from '../../../../lib/domain/models/index.js';
import { CertificationAssessmentScoreV3 } from '../../../../lib/domain/models/CertificationAssessmentScoreV3.js';
import { status } from '../../../../lib/domain/models/AssessmentResult.js';
import { config } from '../../../../src/shared/config.js';

describe('Unit | Domain | Models | CertificationAssessmentScoreV3 ', function () {
  const assessmentId = 1234;

  let answerRepository;
  let challengeRepository;
  let algorithm;

  let baseChallenges;
  let baseAnswers;
  let challenge4;

  beforeEach(function () {
    answerRepository = {
      findByAssessment: sinon.stub(),
    };
    challengeRepository = {
      findFlashCompatible: sinon.stub(),
    };
    algorithm = {
      getEstimatedLevelAndErrorRate: sinon.stub(),
    };

    const challenge1 = domainBuilder.buildChallenge({
      id: 'recCHAL1',
      discriminant: 1,
      difficulty: 0,
    });
    const challenge2 = domainBuilder.buildChallenge({
      id: 'recCHAL2',
      discriminant: 1,
      difficulty: 4,
    });
    const challenge3 = domainBuilder.buildChallenge({
      id: 'recCHAL3',
      discriminant: 1,
      difficulty: 2,
    });

    challenge4 = domainBuilder.buildChallenge({
      id: 'recCHAL4',
      discriminant: 1,
      difficulty: 2,
    });

    const answer1 = domainBuilder.buildAnswer({
      id: 'ans1',
      challengeId: challenge1.id,
    });

    const answer2 = domainBuilder.buildAnswer({
      id: 'ans2',
      challengeId: challenge2.id,
      result: AnswerStatus.KO,
    });

    const answer3 = domainBuilder.buildAnswer({
      id: 'ans3',
      challengeId: challenge3.id,
    });

    baseChallenges = [challenge1, challenge2, challenge3, challenge4];
    baseAnswers = [answer1, answer3, answer2];
  });

  it('should return the score', async function () {
    const expectedEstimatedLevel = 2;
    const expectedScoreForEstimatedLevel = 592;

    answerRepository.findByAssessment.withArgs(assessmentId).resolves(baseAnswers);
    challengeRepository.findFlashCompatible.withArgs().resolves(baseChallenges);
    algorithm.getEstimatedLevelAndErrorRate
      .withArgs({
        challenges: baseChallenges,
        allAnswers: baseAnswers,
      })
      .returns({
        estimatedLevel: expectedEstimatedLevel,
      });

    const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
      challenges: baseChallenges,
      allAnswers: baseAnswers,
      algorithm,
    });

    expect(score.nbPix).to.equal(expectedScoreForEstimatedLevel);
  });

  describe('when we reach an estimated level below the MINIMUM', function () {
    it('the score should be 0', function () {
      // given
      const veryLowEstimatedLevel = -9;
      const veryEasyDifficulty = -8;
      const numberOfChallenges = 32;
      const challenges = _buildChallenges(veryEasyDifficulty, numberOfChallenges);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.KO);

      algorithm.getEstimatedLevelAndErrorRate
        .withArgs({
          challenges,
          allAnswers,
        })
        .returns({
          estimatedLevel: veryLowEstimatedLevel,
        });

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
      });

      // then
      expect(score.nbPix).to.equal(0);
    });
  });

  describe('when we reach an estimated level above the MAXIMUM', function () {
    it('the score should be 1024', function () {
      // given
      const veryHighEstimatedLevel = 1200;
      const veryHardDifficulty = 8;
      const numberOfChallenges = 32;
      const challenges = _buildChallenges(veryHardDifficulty, numberOfChallenges);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

      algorithm.getEstimatedLevelAndErrorRate
        .withArgs({
          challenges,
          allAnswers,
        })
        .returns({
          estimatedLevel: veryHighEstimatedLevel,
        });

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
      });

      // then
      expect(score.nbPix).to.equal(1024);
    });
  });

  describe('status', function () {
    describe('when at least the minimum number of answers required by the config has been answered', function () {
      it('should be validated', function () {
        const difficulty = 0;
        const numberOfChallenges = config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
        const challenges = _buildChallenges(difficulty, numberOfChallenges);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            challenges,
            allAnswers,
          })
          .returns({
            estimatedLevel: 0,
          });

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          algorithm,
        });

        expect(score.status).to.equal(status.VALIDATED);
      });
    });

    describe('when less than the minimum number of answers required by the config has been answered', function () {
      it('should be rejected', function () {
        const difficulty = 0;
        const numberOfChallenges = config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification - 1;
        const challenges = _buildChallenges(difficulty, numberOfChallenges);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);
        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            challenges,
            allAnswers,
          })
          .returns({
            estimatedLevel: 0,
          });

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          algorithm,
          abortReason: 'candidate',
        });

        expect(score.status).to.equal(status.REJECTED);
      });
    });

    describe('when less than the minimum number of answers required by the config has been answered and the candidate didnt quit', function () {
      it('should be validated', function () {
        const difficulty = 0;
        const certificationCourseAbortReason = 'technical';
        const numberOfChallenges = config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification - 1;
        const challenges = _buildChallenges(difficulty, numberOfChallenges);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);
        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            challenges,
            allAnswers,
          })
          .returns({
            estimatedLevel: 0,
          });

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          algorithm,
          certificationCourseAbortReason,
        });

        expect(score.status).to.equal(status.VALIDATED);
      });
    });
  });
});

const _buildChallenges = (difficulty, numberOfChallenges) => {
  const discriminant = 1;

  return _.range(0, numberOfChallenges).map((index) =>
    domainBuilder.buildChallenge({
      id: `recCHALL${index}`,
      difficulty,
      discriminant,
    }),
  );
};

const _buildAnswersForChallenges = (challenges, answerResult) => {
  return challenges.map(({ id: challengeId }) =>
    domainBuilder.buildAnswer({
      result: answerResult,
      challengeId,
    }),
  );
};
