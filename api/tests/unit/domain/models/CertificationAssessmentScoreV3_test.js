import _ from 'lodash';

import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { AnswerStatus } from '../../../../lib/domain/models/index.js';
import { CertificationAssessmentScoreV3 } from '../../../../lib/domain/models/CertificationAssessmentScoreV3.js';
import { status } from '../../../../src/shared/domain/models/AssessmentResult.js';
import { config } from '../../../../src/shared/config.js';
import { ABORT_REASONS } from '../../../../lib/domain/models/CertificationCourse.js';

describe('Unit | Domain | Models | CertificationAssessmentScoreV3 ', function () {
  const assessmentId = 1234;
  const maxReachableLevelOnCertificationDate = 7;

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
      getConfiguration: sinon.stub(),
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

  describe('when the candidate finished the test', function () {
    it('should return the full score', async function () {
      const expectedEstimatedLevel = 2;
      const expectedScoreForEstimatedLevel = 592;

      const numberOfQuestions = 32;

      const challenges = _buildChallenges(0, numberOfQuestions);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

      answerRepository.findByAssessment.withArgs(assessmentId).resolves(baseAnswers);
      challengeRepository.findFlashCompatible.withArgs().resolves(baseChallenges);
      algorithm.getEstimatedLevelAndErrorRate
        .withArgs({
          challenges,
          allAnswers,
        })
        .returns({
          estimatedLevel: expectedEstimatedLevel,
        });

      algorithm.getConfiguration.returns(
        domainBuilder.buildFlashAlgorithmConfiguration({
          maximumAssessmentLength: numberOfQuestions,
        }),
      );

      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
      });

      expect(score.nbPix).to.equal(expectedScoreForEstimatedLevel);
    });

    it('should return a level for all competences', function () {
      const expectedEstimatedLevel = 2;
      const numberOfQuestions = 32;

      const challenges = _buildChallenges(0, numberOfQuestions);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

      answerRepository.findByAssessment.withArgs(assessmentId).resolves(baseAnswers);
      challengeRepository.findFlashCompatible.withArgs().resolves(baseChallenges);
      algorithm.getEstimatedLevelAndErrorRate
        .withArgs({
          challenges,
          allAnswers,
        })
        .returns({
          estimatedLevel: expectedEstimatedLevel,
        });

      algorithm.getConfiguration.returns(
        domainBuilder.buildFlashAlgorithmConfiguration({
          maximumAssessmentLength: numberOfQuestions,
        }),
      );

      const expectedCompetenceLevels = {
        1.1: 4,
        1.2: 3,
        1.3: 4,
        2.1: 4,
        2.2: 5,
        2.3: 3,
        2.4: 4,
        3.1: 4,
        3.2: 4,
        3.3: 3,
        3.4: 0,
        4.1: 3,
        4.2: 3,
        4.3: 3,
        5.1: 4,
        5.2: 4,
      };

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
      });

      // then
      expect(score.competenceLevels).to.deep.equal(expectedCompetenceLevels);
    });
  });

  describe('when the candidate did not finish the test', function () {
    describe('when the abort reason is technical difficulties', function () {
      it('should return the raw score', async function () {
        const expectedEstimatedLevel = 2;
        const expectedScoreForEstimatedLevel = 592;

        const numberOfAnsweredQuestions = 20;
        const numberCertificationQuestions = 32;

        const challenges = _buildChallenges(0, numberOfAnsweredQuestions);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);
        const abortReason = ABORT_REASONS.TECHNICAL;

        answerRepository.findByAssessment.withArgs(assessmentId).resolves(baseAnswers);
        challengeRepository.findFlashCompatible.withArgs().resolves(baseChallenges);
        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            challenges,
            allAnswers,
          })
          .returns({
            estimatedLevel: expectedEstimatedLevel,
          });

        algorithm.getConfiguration.returns(
          domainBuilder.buildFlashAlgorithmConfiguration({
            maximumAssessmentLength: numberCertificationQuestions,
          }),
        );

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          algorithm,
          abortReason,
          maxReachableLevelOnCertificationDate,
        });

        expect(score.nbPix).to.equal(expectedScoreForEstimatedLevel);
      });
    });

    describe('when the abort reason is that the candidate did not finish', function () {
      it('should return the downgraded score', async function () {
        const expectedEstimatedLevel = 2;
        const expectedScoreForEstimatedLevel = 474;

        const numberOfAnsweredQuestions = 20;
        const numberCertificationQuestions = 32;

        const challenges = _buildChallenges(0, numberOfAnsweredQuestions);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);
        const abortReason = ABORT_REASONS.CANDIDATE;

        answerRepository.findByAssessment.withArgs(assessmentId).resolves(baseAnswers);
        challengeRepository.findFlashCompatible.withArgs().resolves(baseChallenges);
        algorithm.getEstimatedLevelAndErrorRate
          .withArgs({
            challenges,
            allAnswers,
          })
          .returns({
            estimatedLevel: expectedEstimatedLevel,
          });

        algorithm.getConfiguration.returns(
          domainBuilder.buildFlashAlgorithmConfiguration({
            maximumAssessmentLength: numberCertificationQuestions,
          }),
        );

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          algorithm,
          abortReason,
          maxReachableLevelOnCertificationDate,
        });

        expect(score.nbPix).to.equal(expectedScoreForEstimatedLevel);
      });
    });
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
      algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
      });

      // then
      expect(score.nbPix).to.equal(0);
    });

    it('should return the minimum level for all competences', function () {
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
      algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

      const expectedCompetenceLevels = {
        1.1: 0,
        1.2: 0,
        1.3: 0,
        2.1: 0,
        2.2: 0,
        2.3: 0,
        2.4: 0,
        3.1: 0,
        3.2: 0,
        3.3: 0,
        3.4: 0,
        4.1: 0,
        4.2: 0,
        4.3: 0,
        5.1: 0,
        5.2: 0,
      };

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
      });

      // then
      expect(score.competenceLevels).to.deep.equal(expectedCompetenceLevels);
    });
  });

  describe('when we reach an estimated level above the MAXIMUM', function () {
    it('the score should be 896', function () {
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
      algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
      });

      // then
      expect(score.nbPix).to.equal(896);
    });

    it('return the maximum level for all competences', function () {
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
      algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

      const expectedCompetenceLevels = {
        1.1: 7,
        1.2: 7,
        1.3: 7,
        2.1: 7,
        2.2: 6,
        2.3: 6,
        2.4: 6,
        3.1: 6,
        3.2: 6,
        3.3: 6,
        3.4: 7,
        4.1: 6,
        4.2: 7,
        4.3: 6,
        5.1: 7,
        5.2: 7,
      };

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
      });

      // then
      expect(score.competenceLevels).to.deep.equal(expectedCompetenceLevels);
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

        algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          algorithm,
          maxReachableLevelOnCertificationDate,
        });

        expect(score.status).to.equal(status.VALIDATED);
      });
    });

    describe('when less than the minimum number of answers required by the config has been answered', function () {
      describe('when the candidate did not finish the test due to technical issues', function () {
        it('should be cancelled', function () {
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

          algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

          const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
            challenges,
            allAnswers,
            algorithm,
            abortReason: 'candidate',
            maxReachableLevelOnCertificationDate,
          });

          expect(score.status).to.equal(status.REJECTED);
        });
      });

      describe('when the candidate did not finish the test due to time issues', function () {
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

          algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

          const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
            challenges,
            allAnswers,
            algorithm,
            abortReason: 'candidate',
            maxReachableLevelOnCertificationDate,
          });

          expect(score.status).to.equal(status.REJECTED);
        });
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

        algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          algorithm,
          certificationCourseAbortReason,
          maxReachableLevelOnCertificationDate,
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
